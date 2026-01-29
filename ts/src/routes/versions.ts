// RUST: Versions API routes — /api/v3/versions
// RUST: See lib/api/v3/versions/versions_api.rb

import { Hono } from "hono";
import { versionRepository } from "../container";
import {
  representVersion,
  representVersionCollection,
  representProjectVersions,
} from "../hal";
import { halError } from "../lib/hal";
import { createVersionSchema, updateVersionSchema } from "../dto/version.dto";

export const versionsRouter = new Hono();

// GET /api/v3/versions — List all versions
// RUST: fn list_versions() -> Result<HalCollection, AppError>
versionsRouter.get("/", async (c) => {
  const versions = await versionRepository.list();
  return c.json(representVersionCollection(versions));
});

// GET /api/v3/versions/:id — Get version by ID
// RUST: fn get_version(id: Uuid) -> Result<HalResource, AppError>
versionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const version = await versionRepository.findById(id);

  if (!version) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Version ${id} not found` }),
      404
    );
  }

  return c.json(representVersion(version));
});

// POST /api/v3/versions — Create version
// RUST: fn create_version(input: CreateVersionInput) -> Result<HalResource, AppError>
versionsRouter.post("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  const body = await c.req.json();
  const result = createVersionSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  // Extract project ID from _links if provided
  let projectId: string | undefined;
  if (result.data._links?.definingProject?.href) {
    const hrefMatch = result.data._links.definingProject.href.match(
      /\/api\/v3\/projects\/([a-f0-9-]+)/
    );
    if (hrefMatch) {
      projectId = hrefMatch[1];
    }
  }

  if (!projectId) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: "Missing definingProject link",
      }),
      422
    );
  }

  const version = await versionRepository.create({
    projectId,
    name: result.data.name,
    description: result.data.description,
    startDate: result.data.startDate,
    effectiveDate: result.data.effectiveDate,
    status: result.data.status,
    sharing: result.data.sharing,
  });

  return c.json(representVersion(version), 201);
});

// PATCH /api/v3/versions/:id — Update version
// RUST: fn update_version(id: Uuid, input: UpdateVersionInput) -> Result<HalResource, AppError>
versionsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  const existingVersion = await versionRepository.findById(id);
  if (!existingVersion) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Version ${id} not found` }),
      404
    );
  }

  const body = await c.req.json();
  const result = updateVersionSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  const updatedVersion = await versionRepository.update(id, result.data);
  if (!updatedVersion) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Version ${id} not found` }),
      404
    );
  }

  return c.json(representVersion(updatedVersion));
});

// DELETE /api/v3/versions/:id — Delete version
// RUST: fn delete_version(id: Uuid) -> Result<(), AppError>
versionsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  const deleted = await versionRepository.delete(id);
  if (!deleted) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Version ${id} not found` }),
      404
    );
  }

  return c.body(null, 204);
});

// GET /api/v3/projects/:projectId/versions — List versions for project
// This is mounted on the projects router, but we define the handler here
export async function getProjectVersions(projectId: string) {
  const versions = await versionRepository.listByProject(projectId);
  return representProjectVersions(versions, projectId);
}
