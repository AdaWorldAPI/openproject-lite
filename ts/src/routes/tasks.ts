import { Hono } from "hono";
import { z } from "zod";
import {
  db,
  tasks,
  comments,
  projectMembers,
  notifications,
  users,
  type TaskStatus,
} from "../db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sendTaskAssignedEmail, isMailConfigured } from "../services/mail";

const tasksRouter = new Hono();

tasksRouter.use("*", requireAuth);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const taskStatusValues = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
] as const;

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ============================================
// HELPERS
// ============================================

async function checkProjectAccess(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });
  return !!membership;
}

async function checkTaskAccess(
  taskId: string,
  userId: string
): Promise<{ task: typeof tasks.$inferSelect; hasAccess: boolean } | null> {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) return null;

  const hasAccess = await checkProjectAccess(task.projectId, userId);
  return { task, hasAccess };
}

// ============================================
// TASK ROUTES
// ============================================

// GET /tasks?projectId=xxx - List tasks in project
tasksRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.query("projectId");

  if (!projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  const hasAccess = await checkProjectAccess(projectId, user.id);
  if (!hasAccess) {
    return c.json({ error: "Project not found" }, 404);
  }

  const projectTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    with: {
      assignee: {
        columns: { id: true, name: true, email: true, avatarUrl: true },
      },
      creator: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: desc(tasks.createdAt),
  });

  return c.json({ tasks: projectTasks });
});

// POST /tasks - Create task
tasksRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const hasAccess = await checkProjectAccess(parsed.data.projectId, user.id);
  if (!hasAccess) {
    return c.json({ error: "Project not found" }, 404);
  }

  const [task] = await db
    .insert(tasks)
    .values({
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      creatorId: user.id,
    })
    .returning();

  // Notify assignee if assigned
  if (task.assigneeId && task.assigneeId !== user.id) {
    const assignee = await db.query.users.findFirst({
      where: eq(users.id, task.assigneeId),
    });

    if (assignee) {
      // Create in-app notification
      await db.insert(notifications).values({
        userId: assignee.id,
        type: "task_assigned",
        title: `You were assigned to "${task.title}"`,
        body: `${user.name} assigned you a task`,
        linkUrl: `/tasks/${task.id}`,
        metadata: { taskId: task.id, assignerId: user.id },
      });

      // Send email if configured
      if (isMailConfigured()) {
        try {
          const project = await db.query.projects.findFirst({
            where: eq(projectMembers.projectId, task.projectId),
          });
          await sendTaskAssignedEmail(
            assignee.email,
            task.title,
            project?.name ?? "Unknown Project",
            user.name,
            `${process.env.APP_URL ?? ""}/tasks/${task.id}`
          );
        } catch (e) {
          console.error("Failed to send assignment email:", e);
        }
      }
    }
  }

  return c.json({ task }, 201);
});

// GET /tasks/:id - Get task details
tasksRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await checkTaskAccess(taskId, user.id);
  if (!result || !result.hasAccess) {
    return c.json({ error: "Task not found" }, 404);
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      assignee: {
        columns: { id: true, name: true, email: true, avatarUrl: true },
      },
      creator: {
        columns: { id: true, name: true, email: true },
      },
      project: {
        columns: { id: true, name: true, slug: true },
      },
      comments: {
        with: {
          author: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: desc(comments.createdAt),
      },
    },
  });

  return c.json({ task });
});

// PATCH /tasks/:id - Update task
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await checkTaskAccess(taskId, user.id);
  if (!result || !result.hasAccess) {
    return c.json({ error: "Task not found" }, 404);
  }

  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const oldTask = result.task;
  const updateData: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };

  // Handle dueDate conversion
  if (parsed.data.dueDate !== undefined) {
    updateData.dueDate = parsed.data.dueDate
      ? new Date(parsed.data.dueDate)
      : null;
  }

  // Set completedAt when marking done
  if (parsed.data.status === "done" && oldTask.status !== "done") {
    updateData.completedAt = new Date();
  } else if (parsed.data.status && parsed.data.status !== "done") {
    updateData.completedAt = null;
  }

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning();

  // Notify new assignee
  if (
    parsed.data.assigneeId &&
    parsed.data.assigneeId !== oldTask.assigneeId &&
    parsed.data.assigneeId !== user.id
  ) {
    await db.insert(notifications).values({
      userId: parsed.data.assigneeId,
      type: "task_assigned",
      title: `You were assigned to "${updated.title}"`,
      body: `${user.name} assigned you a task`,
      linkUrl: `/tasks/${updated.id}`,
    });
  }

  return c.json({ task: updated });
});

// DELETE /tasks/:id - Delete task
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await checkTaskAccess(taskId, user.id);
  if (!result || !result.hasAccess) {
    return c.json({ error: "Task not found" }, 404);
  }

  await db.delete(tasks).where(eq(tasks.id, taskId));

  return c.json({ message: "Task deleted" });
});

// ============================================
// COMMENT ROUTES
// ============================================

// POST /tasks/:id/comments - Add comment
tasksRouter.post("/:id/comments", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await checkTaskAccess(taskId, user.id);
  if (!result || !result.hasAccess) {
    return c.json({ error: "Task not found" }, 404);
  }

  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const [comment] = await db
    .insert(comments)
    .values({
      taskId,
      authorId: user.id,
      content: parsed.data.content,
    })
    .returning();

  // Notify task creator and assignee (if not the commenter)
  const task = result.task;
  const notifyUserIds = new Set<string>();

  if (task.creatorId !== user.id) notifyUserIds.add(task.creatorId);
  if (task.assigneeId && task.assigneeId !== user.id)
    notifyUserIds.add(task.assigneeId);

  for (const userId of notifyUserIds) {
    await db.insert(notifications).values({
      userId,
      type: "comment_added",
      title: `New comment on "${task.title}"`,
      body: `${user.name}: ${parsed.data.content.slice(0, 100)}...`,
      linkUrl: `/tasks/${task.id}`,
    });
  }

  return c.json({ comment }, 201);
});

export default tasksRouter;
