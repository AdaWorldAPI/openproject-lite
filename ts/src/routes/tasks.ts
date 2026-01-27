import { Hono } from "hono";
import {
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
} from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { taskService } from "../container";
import { requireAuth } from "../middleware/auth";

const tasksRouter = new Hono();

tasksRouter.use("*", requireAuth);

// GET /tasks?projectId=xxx - List tasks in project
tasksRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.query("projectId");

  if (!projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  const result = await taskService.list(projectId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ tasks: result.data });
});

// POST /tasks - Create task
tasksRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await taskService.create(parsed.data, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ task: result.data }, 201);
});

// GET /tasks/:id - Get task details
tasksRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await taskService.getById(taskId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ task: result.data });
});

// PATCH /tasks/:id - Update task
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await taskService.update(taskId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ task: result.data });
});

// DELETE /tasks/:id - Delete task
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await taskService.delete(taskId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ message: "Task deleted" });
});

// POST /tasks/:id/comments - Add comment
tasksRouter.post("/:id/comments", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");
  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await taskService.addComment(taskId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ comment: result.data }, 201);
});

export default tasksRouter;
