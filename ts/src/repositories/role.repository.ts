// RUST: Role Repository — data access for roles
// RUST: impl RoleRepository for DrizzleRoleRepository

import { db } from "../db";
import { roles } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import type { RoleDTO, CreateRoleDTO, UpdateRoleDTO } from "../dto/role.dto";

// RUST: pub trait RoleRepository: Send + Sync
export interface RoleRepository {
  list(): Promise<RoleDTO[]>;
  findById(id: string): Promise<RoleDTO | null>;
  findByName(name: string): Promise<RoleDTO | null>;
  create(input: CreateRoleDTO): Promise<RoleDTO>;
  update(id: string, input: UpdateRoleDTO): Promise<RoleDTO | null>;
  delete(id: string): Promise<boolean>;
}

type RoleRow = typeof roles.$inferSelect;

// RUST: fn role_to_dto(row: &RoleRow) -> RoleDTO
function roleToDTO(row: RoleRow): RoleDTO {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    permissions: row.permissions || [],
    assignable: row.assignable,
    builtin: row.builtin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// RUST: pub fn create_role_repository() -> impl RoleRepository
export function createRoleRepository(): RoleRepository {
  return {
    async list(): Promise<RoleDTO[]> {
      const rows = await db.select().from(roles).orderBy(asc(roles.position));
      return rows.map(roleToDTO);
    },

    async findById(id: string): Promise<RoleDTO | null> {
      const rows = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1);
      return rows[0] ? roleToDTO(rows[0]) : null;
    },

    async findByName(name: string): Promise<RoleDTO | null> {
      const rows = await db
        .select()
        .from(roles)
        .where(eq(roles.name, name))
        .limit(1);
      return rows[0] ? roleToDTO(rows[0]) : null;
    },

    async create(input: CreateRoleDTO): Promise<RoleDTO> {
      // Get next position
      const existing = await db.select().from(roles);
      const nextPosition = existing.length + 1;

      const [row] = await db
        .insert(roles)
        .values({
          name: input.name,
          permissions: input.permissions || [],
          assignable: input.assignable ?? true,
          position: nextPosition,
          builtin: 0, // Normal role
        })
        .returning();
      return roleToDTO(row);
    },

    async update(id: string, input: UpdateRoleDTO): Promise<RoleDTO | null> {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (input.name !== undefined) updateData.name = input.name;
      if (input.permissions !== undefined)
        updateData.permissions = input.permissions;
      if (input.assignable !== undefined) updateData.assignable = input.assignable;
      if (input.position !== undefined) updateData.position = input.position;

      const [row] = await db
        .update(roles)
        .set(updateData)
        .where(eq(roles.id, id))
        .returning();
      return row ? roleToDTO(row) : null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await db
        .delete(roles)
        .where(eq(roles.id, id))
        .returning({ id: roles.id });
      return result.length > 0;
    },
  };
}
