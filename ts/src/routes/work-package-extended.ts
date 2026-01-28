// RUST: Work Package Extended Routes — Activities, Watchers, Relations
// RUST: See lib/api/v3/work_packages/*_api.rb

import { Hono } from "hono";
import { workPackageExtendedRepository } from "../container";
import {
  representActivityCollection,
  representActivity,
  representWatcherCollection,
  representWatcher,
  representRelationCollection,
  representRelation,
} from "../hal";
import { halError } from "../lib/hal";
import { createRelationSchema, addWatcherSchema, addCommentSchema } from "../dto";

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITIES ROUTER
// Mounted at /api/v3/work_packages/:workPackageId/activities
// ═══════════════════════════════════════════════════════════════════════════

export const activitiesRouter = new Hono<{
  Variables: { workPackageId: string };
}>();

// Extract workPackageId from parent router
activitiesRouter.use("*", async (c, next) => {
  const workPackageId = c.req.param("workPackageId");
  if (!workPackageId) {
    return c.json(
      halError({ code: "VALIDATION", message: "Missing work package ID" }),
      400
    );
  }
  c.set("workPackageId", workPackageId);
  await next();
});

// GET /api/v3/work_packages/:workPackageId/activities
// RUST: fn list_activities(work_package_id: Uuid) -> Result<HalCollection, AppError>
activitiesRouter.get("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const activities = await workPackageExtendedRepository.listActivitiesForWorkPackage(
    workPackageId
  );
  return c.json(representActivityCollection(activities, workPackageId));
});

// POST /api/v3/work_packages/:workPackageId/activities (add comment)
// RUST: fn create_activity(work_package_id: Uuid, input: CreateActivityInput) -> Result<HalResource, AppError>
activitiesRouter.post("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const body = await c.req.json();

  // Validate input
  const result = addCommentSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid comment format: ${result.error.message}`,
      }),
      422
    );
  }

  // Get user from context (requires auth middleware)
  const user = c.get("user");
  if (!user) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Authentication required" }),
      401
    );
  }

  const activity = await workPackageExtendedRepository.createActivity({
    journableType: "WorkPackage",
    journableId: workPackageId,
    userId: user.id,
    notes: result.data.comment.raw,
    causeType: "user",
  });

  return c.json(representActivity(activity), 201);
});

// ═══════════════════════════════════════════════════════════════════════════
// WATCHERS ROUTER
// Mounted at /api/v3/work_packages/:workPackageId/watchers
// ═══════════════════════════════════════════════════════════════════════════

export const watchersRouter = new Hono<{
  Variables: { workPackageId: string };
}>();

// Extract workPackageId from parent router
watchersRouter.use("*", async (c, next) => {
  const workPackageId = c.req.param("workPackageId");
  if (!workPackageId) {
    return c.json(
      halError({ code: "VALIDATION", message: "Missing work package ID" }),
      400
    );
  }
  c.set("workPackageId", workPackageId);
  await next();
});

// GET /api/v3/work_packages/:workPackageId/watchers
// RUST: fn list_watchers(work_package_id: Uuid) -> Result<HalResource, AppError>
watchersRouter.get("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const watchers = await workPackageExtendedRepository.listWatchersForResource(
    "WorkPackage",
    workPackageId
  );
  return c.json(representWatcherCollection(watchers, "WorkPackage", workPackageId));
});

// POST /api/v3/work_packages/:workPackageId/watchers
// RUST: fn add_watcher(work_package_id: Uuid, input: AddWatcherInput) -> Result<HalResource, AppError>
watchersRouter.post("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const body = await c.req.json();

  // Validate input
  const result = addWatcherSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: "Invalid watcher format. Expected { user: { href: '/api/v3/users/:id' } }",
      }),
      422
    );
  }

  // Extract user ID from href (/api/v3/users/:id)
  const hrefMatch = result.data.user.href.match(/\/api\/v3\/users\/([a-f0-9-]+)/);
  if (!hrefMatch) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: "Invalid user href format. Expected /api/v3/users/:id",
      }),
      422
    );
  }
  const userId = hrefMatch[1];

  // Check if already watching
  const isWatching = await workPackageExtendedRepository.isWatching(
    "WorkPackage",
    workPackageId,
    userId
  );
  if (isWatching) {
    return c.json(
      halError({
        code: "CONFLICT",
        message: "User is already watching this work package",
      }),
      409
    );
  }

  const watcher = await workPackageExtendedRepository.addWatcher({
    watchableType: "WorkPackage",
    watchableId: workPackageId,
    userId,
  });

  return c.json(representWatcher(watcher), 201);
});

// DELETE /api/v3/work_packages/:workPackageId/watchers/:userId
// RUST: fn remove_watcher(work_package_id: Uuid, user_id: Uuid) -> Result<(), AppError>
watchersRouter.delete("/:userId", async (c) => {
  const workPackageId = c.get("workPackageId");
  const userId = c.req.param("userId");

  const removed = await workPackageExtendedRepository.removeWatcher(
    "WorkPackage",
    workPackageId,
    userId
  );

  if (!removed) {
    return c.json(
      halError({
        code: "NOT_FOUND",
        message: "Watcher not found",
      }),
      404
    );
  }

  return c.body(null, 204);
});

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS ROUTER
// Mounted at /api/v3/work_packages/:workPackageId/relations
// ═══════════════════════════════════════════════════════════════════════════

export const relationsRouter = new Hono<{
  Variables: { workPackageId: string };
}>();

// Extract workPackageId from parent router
relationsRouter.use("*", async (c, next) => {
  const workPackageId = c.req.param("workPackageId");
  if (!workPackageId) {
    return c.json(
      halError({ code: "VALIDATION", message: "Missing work package ID" }),
      400
    );
  }
  c.set("workPackageId", workPackageId);
  await next();
});

// GET /api/v3/work_packages/:workPackageId/relations
// RUST: fn list_relations(work_package_id: Uuid) -> Result<HalCollection, AppError>
relationsRouter.get("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const relations = await workPackageExtendedRepository.listRelationsForWorkPackage(
    workPackageId
  );
  return c.json(representRelationCollection(relations, workPackageId));
});

// POST /api/v3/work_packages/:workPackageId/relations
// RUST: fn create_relation(work_package_id: Uuid, input: CreateRelationInput) -> Result<HalResource, AppError>
relationsRouter.post("/", async (c) => {
  const workPackageId = c.get("workPackageId");
  const body = await c.req.json();

  // OpenProject format: { _links: { to: { href: '/api/v3/work_packages/:id' } }, type: 'follows' }
  let toId: string | undefined;
  let relationType: string | undefined;
  let lag: number | undefined;
  let description: string | undefined;

  if (body._links?.to?.href) {
    const hrefMatch = body._links.to.href.match(/\/api\/v3\/work_packages\/([a-f0-9-]+)/);
    if (hrefMatch) {
      toId = hrefMatch[1];
    }
  }
  if (body.type) {
    relationType = body.type;
  }
  if (body.lag !== undefined) {
    lag = body.lag;
  }
  if (body.description !== undefined) {
    description = body.description;
  }

  // Validate
  const validationResult = createRelationSchema.safeParse({
    fromId: workPackageId,
    toId,
    relationType,
    lag: lag ?? 0,
    description,
  });

  if (!validationResult.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid relation format: ${validationResult.error.message}`,
      }),
      422
    );
  }

  // Don't allow self-relations
  if (workPackageId === toId) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: "Cannot create relation to self",
      }),
      422
    );
  }

  const relation = await workPackageExtendedRepository.createRelation(
    validationResult.data
  );

  return c.json(representRelation(relation), 201);
});

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE RELATIONS ROUTER
// Mounted at /api/v3/relations
// ═══════════════════════════════════════════════════════════════════════════

export const standaloneRelationsRouter = new Hono();

// GET /api/v3/relations/:id
standaloneRelationsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const relation = await workPackageExtendedRepository.getRelationById(id);

  if (!relation) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Relation ${id} not found` }),
      404
    );
  }

  return c.json(representRelation(relation));
});

// DELETE /api/v3/relations/:id
standaloneRelationsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = await workPackageExtendedRepository.deleteRelation(id);

  if (!deleted) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Relation ${id} not found` }),
      404
    );
  }

  return c.body(null, 204);
});

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE ACTIVITIES ROUTER
// Mounted at /api/v3/activities
// ═══════════════════════════════════════════════════════════════════════════

export const standaloneActivitiesRouter = new Hono();

// GET /api/v3/activities/:id
standaloneActivitiesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const activity = await workPackageExtendedRepository.getActivityById(id);

  if (!activity) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Activity ${id} not found` }),
      404
    );
  }

  return c.json(representActivity(activity));
});
