// RUST: pub trait UserRepository {
// RUST:     fn create(&self, email: &str, password_hash: &str, name: &str) -> Result<UserDTO, AppError>;
// RUST:     fn find_by_email(&self, email: &str) -> Result<Option<UserDTO>, AppError>;
// RUST:     fn find_by_id(&self, id: Uuid) -> Result<Option<UserDTO>, AppError>;
// RUST:     fn find_by_id_with_hash(&self, id: Uuid) -> Result<Option<UserWithHashDTO>, AppError>;
// RUST:     fn list(&self, offset: i32, limit: i32) -> Result<Vec<UserDTO>, AppError>;
// RUST:     fn count(&self) -> Result<i64, AppError>;
// RUST:     fn update(&self, id: Uuid, input: UpdateUserDTO) -> Result<UserDTO, AppError>;
// RUST:     fn lock(&self, id: Uuid) -> Result<UserDTO, AppError>;
// RUST:     fn unlock(&self, id: Uuid) -> Result<UserDTO, AppError>;
// RUST: }

import { db } from "../db";
import { users } from "../db/schema";
import { eq, sql, asc, desc, ilike, or } from "drizzle-orm";
import type { UserDTO, SessionUserDTO } from "../dto";

// Internal type - never leaves the repository
interface UserWithHash {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly isActive: boolean;
  readonly isAdmin: boolean;
}

// Update input DTO
export interface UpdateUserInput {
  readonly name?: string;
  readonly email?: string;
  readonly avatarUrl?: string | null;
  readonly isAdmin?: boolean;
}

// List options
export interface ListUsersOptions {
  readonly offset?: number;
  readonly limit?: number;
  readonly sortBy?: "name" | "email" | "createdAt";
  readonly sortOrder?: "asc" | "desc";
  readonly search?: string; // Search in name or email
  readonly status?: "active" | "locked" | "all";
}

// RUST: pub struct UserRepositoryImpl { db: Arc<Pool> }
export interface UserRepository {
  create(email: string, passwordHash: string, name: string): Promise<UserDTO>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findById(id: string): Promise<UserDTO | null>;
  findByEmailWithHash(email: string): Promise<UserWithHash | null>;
  findByIdSummary(id: string): Promise<SessionUserDTO | null>;
  // New methods for API v3
  list(options?: ListUsersOptions): Promise<UserDTO[]>;
  count(options?: ListUsersOptions): Promise<number>;
  update(id: string, input: UpdateUserInput): Promise<UserDTO | null>;
  lock(id: string): Promise<UserDTO | null>;
  unlock(id: string): Promise<UserDTO | null>;
}

// RUST: impl UserRepository for UserRepositoryImpl
export function createUserRepository(): UserRepository {
  return {
    async create(email, passwordHash, name) {
      const [row] = await db
        .insert(users)
        .values({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          passwordHash,
        })
        .returning();
      return toUserDTO(row);
    },

    async findByEmail(email) {
      const row = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase().trim()),
      });
      return row ? toUserDTO(row) : null;
    },

    async findById(id) {
      const row = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return row ? toUserDTO(row) : null;
    },

    async findByEmailWithHash(email) {
      const row = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase().trim()),
      });
      if (!row) return null;
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash,
        isActive: row.isActive,
        isAdmin: row.isAdmin,
      };
    },

    async findByIdSummary(id) {
      const row = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: { id: true, email: true, name: true, isActive: true, isAdmin: true },
      });
      if (!row || !row.isActive) return null;
      return { id: row.id, email: row.email, name: row.name, isAdmin: row.isAdmin };
    },

    async list(options = {}) {
      const {
        offset = 0,
        limit = 20,
        sortBy = "name",
        sortOrder = "asc",
        search,
        status = "all",
      } = options;

      // Build query
      let query = db.select().from(users);

      // Filter by status
      const conditions = [];
      if (status === "active") {
        conditions.push(eq(users.isActive, true));
      } else if (status === "locked") {
        conditions.push(eq(users.isActive, false));
      }

      // Search filter
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          or(ilike(users.name, searchTerm), ilike(users.email, searchTerm))
        );
      }

      // Apply conditions
      if (conditions.length > 0) {
        for (const condition of conditions) {
          if (condition) {
            query = query.where(condition) as typeof query;
          }
        }
      }

      // Sorting
      const sortColumn = {
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      }[sortBy];
      const orderFn = sortOrder === "desc" ? desc : asc;
      query = query.orderBy(orderFn(sortColumn)) as typeof query;

      // Pagination
      query = query.limit(limit).offset(offset) as typeof query;

      const rows = await query;
      return rows.map(toUserDTO);
    },

    async count(options = {}) {
      const { search, status = "all" } = options;

      let query = db.select({ count: sql<number>`count(*)` }).from(users);

      // Filter by status
      if (status === "active") {
        query = query.where(eq(users.isActive, true)) as typeof query;
      } else if (status === "locked") {
        query = query.where(eq(users.isActive, false)) as typeof query;
      }

      // Search filter
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.where(
          or(ilike(users.name, searchTerm), ilike(users.email, searchTerm))
        ) as typeof query;
      }

      const [result] = await query;
      return Number(result?.count ?? 0);
    },

    async update(id, input) {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.email !== undefined)
        updateData.email = input.email.toLowerCase().trim();
      if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
      if (input.isAdmin !== undefined) updateData.isAdmin = input.isAdmin;

      const [row] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      return row ? toUserDTO(row) : null;
    },

    async lock(id) {
      const [row] = await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return row ? toUserDTO(row) : null;
    },

    async unlock(id) {
      const [row] = await db
        .update(users)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return row ? toUserDTO(row) : null;
    },
  };
}

// RUST: fn to_user_dto(row: &UserRow) -> UserDTO
function toUserDTO(row: typeof users.$inferSelect): UserDTO {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
