import { Hono } from "hono";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { halError, halValidationError } from "../lib/hal";
import { projectService } from "../container";
import { requireAuth } from "../middleware/auth";
import {
  representProjectCollection,
  representProjectDetail,
  representProject,
} from "../hal";

const projectsRouter = new Hono();

// All routes require auth
projectsRouter.use("*", requireAuth);

// GET /projects - List user's projects
// RUST: fn list(actor: &SessionUserDTO) -> Result<HalCollection, HalError>
projectsRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const result = await projectService.list(user);

  if (!result.ok) {
    return c.json(halError(result.error), errorToStatusCode(result.error) as 500);
  }

  return c.json(representProjectCollection(result.data, "/api/v3/projects"));
});

// POST /projects - Create project
// RUST: fn create(input: CreateProjectDTO, actor: &SessionUserDTO) -> Result<HalResource, HalError>
projectsRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await projectService.create(parsed.data, user);

  if (!result.ok) {
    return c.json(halError(result.error), errorToStatusCode(result.error) as 500);
  }

  const { project, role } = result.data;
  const hal = representProject(project);
  return c.json({ ...hal, _meta: { role } }, 201);
});

// GET /projects/:id - Get project details
// RUST: fn get_by_id(id: Uuid, actor: &SessionUserDTO) -> Result<HalResource, HalError>
projectsRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const result = await projectService.getById(projectId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 404,
    );
  }

  return c.json(representProjectDetail(result.data.project, result.data.role));
});

// PATCH /projects/:id - Update project
// RUST: fn update(id: Uuid, input: UpdateProjectDTO, actor: &SessionUserDTO) -> Result<HalResource, HalError>
projectsRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await projectService.update(projectId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 403,
    );
  }

  return c.json(representProject(result.data));
});

// DELETE /projects/:id - Delete project (owner only)
// RUST: fn delete(id: Uuid, actor: &SessionUserDTO) -> Result<(), HalError>
projectsRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const result = await projectService.delete(projectId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 403,
    );
  }

  return c.body(null, 204);
});

// POST /projects/:id/members - Add member
// RUST: fn add_member(project_id: Uuid, user_id: Uuid, role: &str, actor: &SessionUserDTO) -> Result<(), HalError>
projectsRouter.post("/:id/members", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const parsed = addMemberSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await projectService.addMember(
    projectId,
    parsed.data.userId,
    parsed.data.role ?? "member",
    user,
  );

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 403,
    );
  }

  return c.body(null, 201);
});

// DELETE /projects/:id/members/:userId - Remove member
// RUST: fn remove_member(project_id: Uuid, user_id: Uuid, actor: &SessionUserDTO) -> Result<(), HalError>
projectsRouter.delete("/:id/members/:userId", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const targetUserId = c.req.param("userId");

  const result = await projectService.removeMember(projectId, targetUserId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 403,
    );
  }

  return c.body(null, 204);
});

export default projectsRouter;
