// RUST: Group Repository — data access for groups
// RUST: impl GroupRepository for DrizzleGroupRepository

import { db } from "../db";
import { groups, groupUsers, users } from "../db/schema";
import { eq, asc, and } from "drizzle-orm";
import type {
  GroupDTO,
  GroupMemberDTO,
  CreateGroupDTO,
  UpdateGroupDTO,
} from "../dto/group.dto";

// RUST: pub trait GroupRepository: Send + Sync
export interface GroupRepository {
  list(): Promise<GroupDTO[]>;
  findById(id: string): Promise<GroupDTO | null>;
  findByIdWithMembers(id: string): Promise<GroupDTO | null>;
  findByName(name: string): Promise<GroupDTO | null>;
  create(input: CreateGroupDTO): Promise<GroupDTO>;
  update(id: string, input: UpdateGroupDTO): Promise<GroupDTO | null>;
  delete(id: string): Promise<boolean>;
  getMembers(groupId: string): Promise<GroupMemberDTO[]>;
  addMember(groupId: string, userId: string): Promise<boolean>;
  removeMember(groupId: string, userId: string): Promise<boolean>;
  isMember(groupId: string, userId: string): Promise<boolean>;
}

type GroupRow = typeof groups.$inferSelect;
type UserRow = typeof users.$inferSelect;

// RUST: fn group_to_dto(row: &GroupRow) -> GroupDTO
function groupToDTO(row: GroupRow, members?: GroupMemberDTO[]): GroupDTO {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    members,
  };
}

// RUST: fn user_to_member_dto(row: &UserRow) -> GroupMemberDTO
function userToMemberDTO(row: UserRow): GroupMemberDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
  };
}

// RUST: pub fn create_group_repository() -> impl GroupRepository
export function createGroupRepository(): GroupRepository {
  return {
    async list(): Promise<GroupDTO[]> {
      const rows = await db.select().from(groups).orderBy(asc(groups.name));
      return rows.map((row) => groupToDTO(row));
    },

    async findById(id: string): Promise<GroupDTO | null> {
      const rows = await db
        .select()
        .from(groups)
        .where(eq(groups.id, id))
        .limit(1);
      return rows[0] ? groupToDTO(rows[0]) : null;
    },

    async findByIdWithMembers(id: string): Promise<GroupDTO | null> {
      const groupRows = await db
        .select()
        .from(groups)
        .where(eq(groups.id, id))
        .limit(1);

      if (!groupRows[0]) return null;

      // Get members
      const memberRows = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(groupUsers)
        .innerJoin(users, eq(groupUsers.userId, users.id))
        .where(eq(groupUsers.groupId, id))
        .orderBy(asc(users.name));

      const members = memberRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));

      return groupToDTO(groupRows[0], members);
    },

    async findByName(name: string): Promise<GroupDTO | null> {
      const rows = await db
        .select()
        .from(groups)
        .where(eq(groups.name, name))
        .limit(1);
      return rows[0] ? groupToDTO(rows[0]) : null;
    },

    async create(input: CreateGroupDTO): Promise<GroupDTO> {
      const [row] = await db
        .insert(groups)
        .values({
          name: input.name,
        })
        .returning();
      return groupToDTO(row);
    },

    async update(id: string, input: UpdateGroupDTO): Promise<GroupDTO | null> {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (input.name !== undefined) updateData.name = input.name;

      const [row] = await db
        .update(groups)
        .set(updateData)
        .where(eq(groups.id, id))
        .returning();
      return row ? groupToDTO(row) : null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await db
        .delete(groups)
        .where(eq(groups.id, id))
        .returning({ id: groups.id });
      return result.length > 0;
    },

    async getMembers(groupId: string): Promise<GroupMemberDTO[]> {
      const rows = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(groupUsers)
        .innerJoin(users, eq(groupUsers.userId, users.id))
        .where(eq(groupUsers.groupId, groupId))
        .orderBy(asc(users.name));

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));
    },

    async addMember(groupId: string, userId: string): Promise<boolean> {
      try {
        await db.insert(groupUsers).values({
          groupId,
          userId,
        });
        return true;
      } catch {
        // Likely duplicate constraint violation
        return false;
      }
    },

    async removeMember(groupId: string, userId: string): Promise<boolean> {
      const deleted = await db
        .delete(groupUsers)
        .where(
          and(
            eq(groupUsers.groupId, groupId),
            eq(groupUsers.userId, userId)
          )
        )
        .returning();
      return deleted.length > 0;
    },

    async isMember(groupId: string, userId: string): Promise<boolean> {
      const rows = await db
        .select()
        .from(groupUsers)
        .where(
          and(
            eq(groupUsers.groupId, groupId),
            eq(groupUsers.userId, userId)
          )
        )
        .limit(1);
      return rows.length > 0;
    },
  };
}
