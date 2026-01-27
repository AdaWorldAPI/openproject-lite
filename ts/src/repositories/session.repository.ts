// RUST: pub trait SessionRepository {
// RUST:     fn create(&self, id: &str, user_id: Uuid, expires_at: NaiveDateTime) -> Result<(), AppError>;
// RUST:     fn find_by_id(&self, id: &str) -> Result<Option<SessionRow>, AppError>;
// RUST:     fn delete(&self, id: &str) -> Result<(), AppError>;
// RUST:     fn delete_all_for_user(&self, user_id: Uuid) -> Result<(), AppError>;
// RUST: }

import { db } from "../db";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export interface SessionRow {
  readonly id: string;
  readonly userId: string;
  readonly expiresAt: Date;
}

export interface SessionRepository {
  create(id: string, userId: string, expiresAt: Date): Promise<void>;
  findById(id: string): Promise<SessionRow | null>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}

// RUST: impl SessionRepository for SessionRepositoryImpl
export function createSessionRepository(): SessionRepository {
  return {
    async create(id, userId, expiresAt) {
      await db.insert(sessions).values({ id, userId, expiresAt });
    },

    async findById(id) {
      const row = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
      });
      return row ?? null;
    },

    async delete(id) {
      await db.delete(sessions).where(eq(sessions.id, id));
    },

    async deleteAllForUser(userId) {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    },
  };
}
