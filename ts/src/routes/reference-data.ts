// RUST: Reference data routes — types, statuses, priorities (read-only endpoints)
// RUST: See lib/api/v3/types/types_api.rb, statuses/statuses_api.rb, priorities/priorities_api.rb

import { Hono } from "hono";
import { halError } from "../lib/hal";
import { referenceDataRepository } from "../container";
import {
  representType,
  representTypeCollection,
  representStatus,
  representStatusCollection,
  representPriority,
  representPriorityCollection,
} from "../hal";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const typesRouter = new Hono();

// GET /types - List all types
// RUST: fn list() -> Result<HalCollection, HalError>
typesRouter.get("/", async (c) => {
  const types = await referenceDataRepository.listTypes();
  return c.json(representTypeCollection(types));
});

// GET /types/:id - Get type by ID
// RUST: fn get_by_id(id: Uuid) -> Result<HalResource, HalError>
typesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const type = await referenceDataRepository.getTypeById(id);

  if (!type) {
    return c.json(
      halError({
        code: "NOT_FOUND",
        message: `Type with ID ${id} not found`,
      }),
      404,
    );
  }

  return c.json(representType(type));
});

// ═══════════════════════════════════════════════════════════════════════════
// STATUSES ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const statusesRouter = new Hono();

// GET /statuses - List all statuses
// RUST: fn list() -> Result<HalCollection, HalError>
statusesRouter.get("/", async (c) => {
  const statuses = await referenceDataRepository.listStatuses();
  return c.json(representStatusCollection(statuses));
});

// GET /statuses/:id - Get status by ID
// RUST: fn get_by_id(id: Uuid) -> Result<HalResource, HalError>
statusesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const status = await referenceDataRepository.getStatusById(id);

  if (!status) {
    return c.json(
      halError({
        code: "NOT_FOUND",
        message: `Status with ID ${id} not found`,
      }),
      404,
    );
  }

  return c.json(representStatus(status));
});

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITIES ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const prioritiesRouter = new Hono();

// GET /priorities - List all priorities
// RUST: fn list() -> Result<HalCollection, HalError>
prioritiesRouter.get("/", async (c) => {
  const priorities = await referenceDataRepository.listPriorities();
  return c.json(representPriorityCollection(priorities));
});

// GET /priorities/:id - Get priority by ID
// RUST: fn get_by_id(id: Uuid) -> Result<HalResource, HalError>
prioritiesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const priority = await referenceDataRepository.getPriorityById(id);

  if (!priority) {
    return c.json(
      halError({
        code: "NOT_FOUND",
        message: `Priority with ID ${id} not found`,
      }),
      404,
    );
  }

  return c.json(representPriority(priority));
});
