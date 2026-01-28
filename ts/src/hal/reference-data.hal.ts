// RUST: Reference data HAL representers — Types, Statuses, Priorities
// RUST: See lib/api/v3/types/type_representer.rb, statuses/status_representer.rb, priorities/priority_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { TypeDTO, StatusDTO, PriorityDTO } from "../dto";

const API_V3 = "/api/v3";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn represent_type(t: &TypeDTO) -> HalResource
export function representType(t: TypeDTO): HalResource {
  return halResource(
    "Type",
    `${API_V3}/types/${t.id}`,
    {
      id: t.id,
      name: t.name,
      color: t.color,
      position: t.position,
      isDefault: t.isDefault,
      isMilestone: t.isMilestone,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    },
    // Self link includes title (resource name)
    {
      self: { href: `${API_V3}/types/${t.id}`, title: t.name },
    },
  );
}

// RUST: fn represent_type_collection(types: &[TypeDTO]) -> HalCollection
export function representTypeCollection(types: readonly TypeDTO[]): HalCollection {
  const elements = types.map(representType);
  // OpenProject uses UnpaginatedCollection — defaults: pageSize=total, offset=1
  return halCollection(`${API_V3}/types`, elements, types.length);
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUSES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn represent_status(s: &StatusDTO) -> HalResource
export function representStatus(s: StatusDTO): HalResource {
  return halResource(
    "Status",
    `${API_V3}/statuses/${s.id}`,
    {
      id: s.id,
      name: s.name,
      color: s.color,
      position: s.position,
      isClosed: s.isClosed,
      isDefault: s.isDefault,
      isReadonly: s.isReadonly,
      defaultDoneRatio: s.defaultDoneRatio,
      excludedFromTotals: s.excludedFromTotals,
    },
    // Self link includes title (resource name)
    {
      self: { href: `${API_V3}/statuses/${s.id}`, title: s.name },
    },
  );
}

// RUST: fn represent_status_collection(statuses: &[StatusDTO]) -> HalCollection
export function representStatusCollection(statuses: readonly StatusDTO[]): HalCollection {
  const elements = statuses.map(representStatus);
  return halCollection(`${API_V3}/statuses`, elements, statuses.length);
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITIES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn represent_priority(p: &PriorityDTO) -> HalResource
export function representPriority(p: PriorityDTO): HalResource {
  return halResource(
    "Priority",
    `${API_V3}/priorities/${p.id}`,
    {
      id: p.id,
      name: p.name,
      color: p.color,
      position: p.position,
      isDefault: p.isDefault,
      isActive: p.isActive,
    },
    // Self link includes title (resource name)
    {
      self: { href: `${API_V3}/priorities/${p.id}`, title: p.name },
    },
  );
}

// RUST: fn represent_priority_collection(priorities: &[PriorityDTO]) -> HalCollection
export function representPriorityCollection(priorities: readonly PriorityDTO[]): HalCollection {
  const elements = priorities.map(representPriority);
  return halCollection(`${API_V3}/priorities`, elements, priorities.length);
}
