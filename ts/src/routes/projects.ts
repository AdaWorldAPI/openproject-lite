import { Hono } from "hono";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { projectService } from "../container";
import { requireAuth } from "../middleware/auth";

const projectsRouter = new Hono();

// All routes require auth
projectsRouter.use("*", requireAuth);

// GET /projects - List user's projects
projectsRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const result = await projectService.list(user);

  if (!result.ok) {
    return c.json({ error: result.error.message }, errorToStatusCode(result.error) as 500);
  }

  return c.json({ projects: result.data });
});

// POST /projects - Create project
projectsRouter.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await projectService.create(parsed.data, user);

  if (!result.ok) {
    return c.json({ error: result.error.message }, errorToStatusCode(result.error) as 500);
  }

  return c.json({ project: result.data.project, role: result.data.role }, 201);
});

// GET /projects/:id - Get project details
projectsRouter.get("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const result = await projectService.getById(projectId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 404
    );
  }

  return c.json({ project: result.data.project, role: result.data.role });
});

// PATCH /projects/:id - Update project
projectsRouter.patch("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await projectService.update(projectId, parsed.data, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 403
    );
  }

  return c.json({ project: result.data });
});

// DELETE /projects/:id - Delete project (owner only)
projectsRouter.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");

  const result = await projectService.delete(projectId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 403
    );
  }

  return c.json({ message: "Project deleted" });
});

// POST /projects/:id/members - Add member
projectsRouter.post("/:id/members", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const parsed = addMemberSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await projectService.addMember(
    projectId,
    parsed.data.userId,
    parsed.data.role ?? "member",
    user
  );

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 403
    );
  }

  return c.json({ message: "Member added" }, 201);
});

// DELETE /projects/:id/members/:userId - Remove member
projectsRouter.delete("/:id/members/:userId", async (c) => {
  const user = c.get("user")!;
  const projectId = c.req.param("id");
  const targetUserId = c.req.param("userId");

  const result = await projectService.removeMember(projectId, targetUserId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 403
    );
  }

  return c.json({ message: "Member removed" });
});

export default projectsRouter;
