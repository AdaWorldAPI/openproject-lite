// RUST: Roles API routes — /api/v3/roles
// RUST: See lib/api/v3/roles/roles_api.rb

import { Hono } from "hono";
import { roleRepository } from "../container";
import { representRole, representRoleWithPermissions, representRoleCollection } from "../hal";
import { halError } from "../lib/hal";

export const rolesRouter = new Hono();

// GET /api/v3/roles — List all roles
// RUST: fn list_roles() -> Result<HalCollection, AppError>
rolesRouter.get("/", async (c) => {
  const roles = await roleRepository.list();
  return c.json(representRoleCollection(roles));
});

// GET /api/v3/roles/:id — Get role by ID
// RUST: fn get_role(id: Uuid) -> Result<HalResource, AppError>
rolesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const role = await roleRepository.findById(id);

  if (!role) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Role ${id} not found` }),
      404
    );
  }

  // Return full role with permissions
  return c.json(representRoleWithPermissions(role));
});
