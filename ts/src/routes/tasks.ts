import { Hono } from "hono";
import {
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
} from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { halError, halValidationError } from "../lib/hal";
import { taskService } from "../container";
import { requireAuth } from "../middleware/auth";
import {
  representTaskCollection,
  representTask,
  representTaskDetail,
  representComment,
} from "../hal";

const tasksRouter = new Hono();

tasksRouter.use("*", requireAuth);

// GET /tasks?projectId=xxx - List tasks in project
// RUST: fn list(project_id: Uuid, actor: &SessionUserDTO) -> Result<HalCollection, HalError>
tasksRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.query("projectId");

  if (!projectId) {
    return c.json(halValidationError("projectId is required"), 400);
  }

  const result = await taskService.list(projectId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(
    representTaskCollection(
      result.data,
      `/api/v3/projects/${projectId}/work_packages`,
    ),
  );
});

// POST /tasks - Create task
// RUST: fn create(input: CreateTaskDTO, actor: &SessionUserDTO) -> Result<HalResource, HalError>
tasksRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await taskService.create(parsed.data, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(representTask(result.data), 201);
});

// GET /tasks/:id - Get task details
// RUST: fn get_by_id(id: Uuid, actor: &SessionUserDTO) -> Result<HalResource, HalError>
tasksRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await taskService.getById(taskId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(representTaskDetail(result.data));
});

// PATCH /tasks/:id - Update task
// RUST: fn update(id: Uuid, input: UpdateTaskDTO, actor: &SessionUserDTO) -> Result<HalResource, HalError>
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await taskService.update(taskId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(representTask(result.data));
});

// DELETE /tasks/:id - Delete task
// RUST: fn delete(id: Uuid, actor: &SessionUserDTO) -> Result<(), HalError>
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");

  const result = await taskService.delete(taskId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.body(null, 204);
});

// POST /tasks/:id/comments - Add comment
// RUST: fn add_comment(task_id: Uuid, input: CreateCommentDTO, actor: &SessionUserDTO) -> Result<HalResource, HalError>
tasksRouter.post("/:id/comments", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");
  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await taskService.addComment(taskId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(representComment(result.data), 201);
});

export default tasksRouter;
