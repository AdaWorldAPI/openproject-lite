// RUST: Role HAL representer — maps RoleDTO to OpenProject HAL format
// RUST: See lib/api/v3/roles/role_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { RoleDTO } from "../dto/role.dto";

const API_V3 = "/api/v3";

// RUST: fn represent_role(role: &RoleDTO) -> HalResource
export function representRole(role: RoleDTO): HalResource {
  return halResource(
    "Role",
    `${API_V3}/roles/${role.id}`,
    {
      id: role.id,
      name: role.name,
      position: role.position,
      assignable: role.assignable,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/roles/${role.id}`, title: role.name },
    }
  );
}

// RUST: fn represent_role_with_permissions(role: &RoleDTO) -> HalResource
export function representRoleWithPermissions(role: RoleDTO): HalResource {
  // Build permissions as array of strings (matches OpenProject format)
  return halResource(
    "Role",
    `${API_V3}/roles/${role.id}`,
    {
      id: role.id,
      name: role.name,
      position: role.position,
      assignable: role.assignable,
      permissions: role.permissions,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/roles/${role.id}`, title: role.name },
    }
  );
}

// RUST: fn represent_role_collection(roles: &[RoleDTO], total: i32, offset: i32, page_size: i32) -> HalCollection
export function representRoleCollection(
  roles: readonly RoleDTO[],
  total?: number
): HalCollection {
  const elements = roles.map(representRole);
  return halCollection(`${API_V3}/roles`, elements, total ?? roles.length);
}
