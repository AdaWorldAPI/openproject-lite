// RUST: Version Repository — data access for versions
// RUST: impl VersionRepository for DrizzleVersionRepository

import { db } from "../db";
import { versions } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import type {
  VersionDTO,
  CreateVersionDTO,
  UpdateVersionDTO,
  VersionStatus,
  VersionSharing,
} from "../dto/version.dto";

// RUST: pub trait VersionRepository: Send + Sync
export interface VersionRepository {
  list(): Promise<VersionDTO[]>;
  listByProject(projectId: string): Promise<VersionDTO[]>;
  findById(id: string): Promise<VersionDTO | null>;
  create(input: CreateVersionDTO): Promise<VersionDTO>;
  update(id: string, input: UpdateVersionDTO): Promise<VersionDTO | null>;
  delete(id: string): Promise<boolean>;
}

type VersionRow = typeof versions.$inferSelect;

// RUST: fn version_to_dto(row: &VersionRow) -> VersionDTO
function versionToDTO(row: VersionRow): VersionDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    effectiveDate: row.effectiveDate,
    status: row.status as VersionStatus,
    sharing: row.sharing as VersionSharing,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// RUST: pub fn create_version_repository() -> impl VersionRepository
export function createVersionRepository(): VersionRepository {
  return {
    async list(): Promise<VersionDTO[]> {
      const rows = await db
        .select()
        .from(versions)
        .orderBy(asc(versions.name));
      return rows.map(versionToDTO);
    },

    async listByProject(projectId: string): Promise<VersionDTO[]> {
      const rows = await db
        .select()
        .from(versions)
        .where(eq(versions.projectId, projectId))
        .orderBy(asc(versions.effectiveDate), asc(versions.name));
      return rows.map(versionToDTO);
    },

    async findById(id: string): Promise<VersionDTO | null> {
      const rows = await db
        .select()
        .from(versions)
        .where(eq(versions.id, id))
        .limit(1);
      return rows[0] ? versionToDTO(rows[0]) : null;
    },

    async create(input: CreateVersionDTO): Promise<VersionDTO> {
      const startDate =
        input.startDate instanceof Date
          ? input.startDate
          : input.startDate
            ? new Date(input.startDate)
            : null;
      const effectiveDate =
        input.effectiveDate instanceof Date
          ? input.effectiveDate
          : input.effectiveDate
            ? new Date(input.effectiveDate)
            : null;

      const [row] = await db
        .insert(versions)
        .values({
          projectId: input.projectId,
          name: input.name,
          description: input.description ?? null,
          startDate,
          effectiveDate,
          status: input.status ?? "open",
          sharing: input.sharing ?? "none",
        })
        .returning();
      return versionToDTO(row);
    },

    async update(id: string, input: UpdateVersionDTO): Promise<VersionDTO | null> {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.sharing !== undefined) updateData.sharing = input.sharing;

      if (input.startDate !== undefined) {
        updateData.startDate =
          input.startDate === null
            ? null
            : input.startDate instanceof Date
              ? input.startDate
              : new Date(input.startDate);
      }
      if (input.effectiveDate !== undefined) {
        updateData.effectiveDate =
          input.effectiveDate === null
            ? null
            : input.effectiveDate instanceof Date
              ? input.effectiveDate
              : new Date(input.effectiveDate);
      }

      const [row] = await db
        .update(versions)
        .set(updateData)
        .where(eq(versions.id, id))
        .returning();
      return row ? versionToDTO(row) : null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await db
        .delete(versions)
        .where(eq(versions.id, id))
        .returning({ id: versions.id });
      return result.length > 0;
    },
  };
}
