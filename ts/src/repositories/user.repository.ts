// RUST: pub trait UserRepository {
// RUST:     fn create(&self, email: &str, password_hash: &str, name: &str) -> Result<UserDTO, AppError>;
// RUST:     fn find_by_email(&self, email: &str) -> Result<Option<UserDTO>, AppError>;
// RUST:     fn find_by_id(&self, id: Uuid) -> Result<Option<UserDTO>, AppError>;
// RUST:     fn find_by_id_with_hash(&self, id: Uuid) -> Result<Option<UserWithHashDTO>, AppError>;
// RUST: }

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { UserDTO, SessionUserDTO } from "../dto";

// Internal type - never leaves the repository
interface UserWithHash {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly isActive: boolean;
}

// RUST: pub struct UserRepositoryImpl { db: Arc<Pool> }
export interface UserRepository {
  create(email: string, passwordHash: string, name: string): Promise<UserDTO>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findById(id: string): Promise<UserDTO | null>;
  findByEmailWithHash(email: string): Promise<UserWithHash | null>;
  findByIdSummary(id: string): Promise<SessionUserDTO | null>;
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
      };
    },

    async findByIdSummary(id) {
      const row = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: { id: true, email: true, name: true, isActive: true },
      });
      if (!row || !row.isActive) return null;
      return { id: row.id, email: row.email, name: row.name };
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
