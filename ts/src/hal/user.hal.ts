// RUST: User HAL representer — maps UserDTO/UserSummaryDTO to OpenProject HAL format

import type { HalResource } from "../lib/hal";
import { halResource } from "../lib/hal";
import type { UserDTO, UserSummaryDTO, SessionUserDTO } from "../dto";

const API_V3 = "/api/v3";

// RUST: fn represent_user(user: &UserDTO) -> HalResource
export function representUser(user: UserDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${user.id}`,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl ?? "",
      status: user.isActive ? "active" : "locked",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    {
      lock: { href: `${API_V3}/users/${user.id}/lock`, method: "POST" },
      updateImmediately: { href: `${API_V3}/users/${user.id}`, method: "PATCH" },
      delete: { href: `${API_V3}/users/${user.id}`, method: "DELETE" },
    },
  );
}

// RUST: fn represent_user_summary(user: &UserSummaryDTO) -> HalResource
export function representUserSummary(user: UserSummaryDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${user.id}`,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl ?? "",
    },
  );
}

// RUST: fn represent_session_user(user: &SessionUserDTO) -> HalResource
export function representSessionUser(user: SessionUserDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${user.id}`,
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  );
}
