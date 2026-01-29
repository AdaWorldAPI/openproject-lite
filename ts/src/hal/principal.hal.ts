// RUST: Principal HAL representer — maps PrincipalDTO to OpenProject HAL format
// RUST: See lib/api/v3/principals/principal_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { PrincipalDTO, UserPrincipalDTO, GroupPrincipalDTO } from "../dto/principal.dto";

const API_V3 = "/api/v3";

// RUST: fn represent_user_principal(user: &UserPrincipalDTO) -> HalResource
function representUserPrincipal(user: UserPrincipalDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${user.id}`,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/users/${user.id}`, title: user.name },
    }
  );
}

// RUST: fn represent_group_principal(group: &GroupPrincipalDTO) -> HalResource
function representGroupPrincipal(group: GroupPrincipalDTO): HalResource {
  return halResource(
    "Group",
    `${API_V3}/groups/${group.id}`,
    {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/groups/${group.id}`, title: group.name },
      members: { href: `${API_V3}/groups/${group.id}/members` },
    }
  );
}

// RUST: fn represent_principal(principal: &PrincipalDTO) -> HalResource
export function representPrincipal(principal: PrincipalDTO): HalResource {
  if (principal._type === "User") {
    return representUserPrincipal(principal);
  } else {
    return representGroupPrincipal(principal);
  }
}

// RUST: fn represent_principal_collection(principals: &[PrincipalDTO], total: i32) -> HalCollection
export function representPrincipalCollection(
  principals: readonly PrincipalDTO[],
  total?: number
): HalCollection {
  const elements = principals.map(representPrincipal);
  return halCollection(`${API_V3}/principals`, elements, total ?? principals.length);
}
