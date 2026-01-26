import { Hono } from "hono";
import { z } from "zod";
import { db, projects, projectMembers, type Project } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { nanoid } from "nanoid";

const projectsRouter = new Hono();

// All routes require auth
projectsRouter.use("*", requireAuth);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  isArchived: z.boolean().optional(),
});

// ============================================
// HELPERS
// ============================================

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base}-${nanoid(6)}`;
}

async function getUserProjectRole(projectId: string, userId: string) {
  const membership = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });
  return membership?.role ?? null;
}

// ============================================
// ROUTES
// ============================================

// GET /projects - List user's projects
projectsRouter.get("/", async (c) => {
  const user = c.get("user")!;

  const memberships = await db.query.projectMembers.findMany({
    where: eq(projectMembers.userId, user.id),
    with: {
      project: true,
    },
    orderBy: desc(projectMembers.joinedAt),
  });

  const result = memberships.map((m) => ({
    ...m.project,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return c.json({ projects: result });
});

// POST /projects - Create project
projectsRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const slug = generateSlug(parsed.data.name);

  // Create project and add creator as owner in a transaction
  const [project] = await db.transaction(async (tx) => {
    const [newProject] = await tx
      .insert(projects)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        slug,
      })
      .returning();

    await tx.insert(projectMembers).values({
      projectId: newProject.id,
      userId: user.id,
      role: "owner",
    });

    return [newProject];
  });

  return c.json({ project, role: "owner" }, 201);
});

// GET /projects/:id - Get project details
projectsRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const role = await getUserProjectRole(projectId, user.id);
  if (!role) {
    return c.json({ error: "Project not found" }, 404);
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      members: {
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json({ project, role });
});

// PATCH /projects/:id - Update project
projectsRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const role = await getUserProjectRole(projectId, user.id);
  if (!role || !["owner", "admin"].includes(role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const [updated] = await db
    .update(projects)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return c.json({ project: updated });
});

// DELETE /projects/:id - Delete project (owner only)
projectsRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const role = await getUserProjectRole(projectId, user.id);
  if (role !== "owner") {
    return c.json({ error: "Forbidden - only owner can delete" }, 403);
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  return c.json({ message: "Project deleted" });
});

// ============================================
// MEMBERS
// ============================================

// POST /projects/:id/members - Add member
projectsRouter.post("/:id/members", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const role = await getUserProjectRole(projectId, user.id);
  if (!role || !["owner", "admin"].includes(role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json();
  const { userId, role: memberRole = "member" } = body;

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  // Check if already a member
  const existing = await getUserProjectRole(projectId, userId);
  if (existing) {
    return c.json({ error: "User is already a member" }, 409);
  }

  await db.insert(projectMembers).values({
    projectId,
    userId,
    role: memberRole,
  });

  return c.json({ message: "Member added" }, 201);
});

// DELETE /projects/:id/members/:userId - Remove member
projectsRouter.delete("/:id/members/:userId", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const targetUserId = c.req.param("userId");

  const role = await getUserProjectRole(projectId, user.id);

  // Can remove self, or admin/owner can remove others
  if (user.id !== targetUserId && !["owner", "admin"].includes(role ?? "")) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Can't remove the owner
  const targetRole = await getUserProjectRole(projectId, targetUserId);
  if (targetRole === "owner") {
    return c.json({ error: "Cannot remove project owner" }, 400);
  }

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, targetUserId)
      )
    );

  return c.json({ message: "Member removed" });
});

export default projectsRouter;
