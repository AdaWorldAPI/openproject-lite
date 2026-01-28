// RUST: Reference data repository — read-only access to types, statuses, priorities
// RUST: impl ReferenceDataRepository for PgReferenceDataRepository

import { db } from "../db";
import { types, statuses, priorities } from "../db/schema";
import { asc, eq } from "drizzle-orm";
import type { TypeDTO, StatusDTO, PriorityDTO } from "../dto";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn list_types(&self) -> Vec<TypeDTO>
async function listTypes(): Promise<TypeDTO[]> {
  const rows = await db
    .select()
    .from(types)
    .orderBy(asc(types.position));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isDefault: row.isDefault,
    isMilestone: row.isMilestone,
    isInRoadmap: row.isInRoadmap,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

// RUST: fn get_type_by_id(&self, id: Uuid) -> Option<TypeDTO>
async function getTypeById(id: string): Promise<TypeDTO | null> {
  const [row] = await db
    .select()
    .from(types)
    .where(eq(types.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isDefault: row.isDefault,
    isMilestone: row.isMilestone,
    isInRoadmap: row.isInRoadmap,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUSES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn list_statuses(&self) -> Vec<StatusDTO>
async function listStatuses(): Promise<StatusDTO[]> {
  const rows = await db
    .select()
    .from(statuses)
    .orderBy(asc(statuses.position));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isClosed: row.isClosed,
    isDefault: row.isDefault,
    isReadonly: row.isReadonly,
    defaultDoneRatio: row.defaultDoneRatio,
    excludedFromTotals: row.excludedFromTotals,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

// RUST: fn get_status_by_id(&self, id: Uuid) -> Option<StatusDTO>
async function getStatusById(id: string): Promise<StatusDTO | null> {
  const [row] = await db
    .select()
    .from(statuses)
    .where(eq(statuses.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isClosed: row.isClosed,
    isDefault: row.isDefault,
    isReadonly: row.isReadonly,
    defaultDoneRatio: row.defaultDoneRatio,
    excludedFromTotals: row.excludedFromTotals,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITIES
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn list_priorities(&self) -> Vec<PriorityDTO>
async function listPriorities(): Promise<PriorityDTO[]> {
  const rows = await db
    .select()
    .from(priorities)
    .orderBy(asc(priorities.position));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isDefault: row.isDefault,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

// RUST: fn get_priority_by_id(&self, id: Uuid) -> Option<PriorityDTO>
async function getPriorityById(id: string): Promise<PriorityDTO | null> {
  const [row] = await db
    .select()
    .from(priorities)
    .where(eq(priorities.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    isDefault: row.isDefault,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export interface ReferenceDataRepository {
  listTypes(): Promise<TypeDTO[]>;
  getTypeById(id: string): Promise<TypeDTO | null>;
  listStatuses(): Promise<StatusDTO[]>;
  getStatusById(id: string): Promise<StatusDTO | null>;
  listPriorities(): Promise<PriorityDTO[]>;
  getPriorityById(id: string): Promise<PriorityDTO | null>;
}

// RUST: pub fn create_reference_data_repository() -> impl ReferenceDataRepository
export function createReferenceDataRepository(): ReferenceDataRepository {
  return {
    listTypes,
    getTypeById,
    listStatuses,
    getStatusById,
    listPriorities,
    getPriorityById,
  };
}
