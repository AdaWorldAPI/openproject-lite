// RUST: impl AuthService for AuthServiceImpl
// RUST: pub trait AuthService {
// RUST:     fn login(&self, email: &str, password: &str) -> Result<AuthResultDTO, AppError>;
// RUST:     fn register(&self, email: &str, password: &str, name: &str) -> Result<AuthResultDTO, AppError>;
// RUST:     fn logout(&self, session_id: &str) -> Result<(), AppError>;
// RUST:     fn validate_session(&self, session_id: &str) -> Result<Option<SessionUserDTO>, AppError>;
// RUST: }

import { nanoid } from "nanoid";
import * as argon2 from "argon2";
import { ok, err, type Result } from "../lib/result";
import type { AppError } from "../lib/errors";
import { conflictError, unauthorizedError } from "../lib/errors";
import type { AuthResultDTO, SessionUserDTO } from "../dto";
import type { UserRepository } from "../repositories/user.repository";
import type { SessionRepository } from "../repositories/session.repository";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthService {
  login(email: string, password: string): Promise<Result<AuthResultDTO, AppError>>;
  register(email: string, password: string, name: string): Promise<Result<AuthResultDTO, AppError>>;
  logout(sessionId: string): Promise<void>;
  validateSession(sessionId: string): Promise<SessionUserDTO | null>;
}

// RUST: pub struct AuthServiceImpl { user_repo: Arc<dyn UserRepository>, session_repo: Arc<dyn SessionRepository> }
export function createAuthService(
  userRepo: UserRepository,
  sessionRepo: SessionRepository
): AuthService {
  // RUST: fn hash_password(password: &str) -> Result<String, AppError>
  async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  // RUST: fn verify_password(hash: &str, password: &str) -> Result<bool, AppError>
  async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  // RUST: fn create_session(user_id: Uuid) -> Result<String, AppError>
  async function createSession(userId: string): Promise<string> {
    const sessionId = nanoid(32);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await sessionRepo.create(sessionId, userId, expiresAt);
    return sessionId;
  }

  return {
    // RUST: fn login(&self, email: &str, password: &str) -> Result<AuthResultDTO, AppError>
    async login(email, password) {
      const userWithHash = await userRepo.findByEmailWithHash(email);
      if (!userWithHash || !userWithHash.isActive) {
        return err(unauthorizedError("Invalid email or password"));
      }

      const validPassword = await verifyPassword(userWithHash.passwordHash, password);
      if (!validPassword) {
        return err(unauthorizedError("Invalid email or password"));
      }

      const sessionId = await createSession(userWithHash.id);

      return ok({
        user: {
          id: userWithHash.id,
          email: userWithHash.email,
          name: userWithHash.name,
          isAdmin: userWithHash.isAdmin,
        },
        sessionId,
      });
    },

    // RUST: fn register(&self, email: &str, password: &str, name: &str) -> Result<AuthResultDTO, AppError>
    async register(email, password, name) {
      const existing = await userRepo.findByEmail(email);
      if (existing) {
        return err(conflictError("Email already registered"));
      }

      const passwordHash = await hashPassword(password);
      const user = await userRepo.create(email, passwordHash, name);
      const sessionId = await createSession(user.id);

      return ok({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: false, // New users are not admins by default
        },
        sessionId,
      });
    },

    // RUST: fn logout(&self, session_id: &str) -> Result<(), AppError>
    async logout(sessionId) {
      await sessionRepo.delete(sessionId);
    },

    // RUST: fn validate_session(&self, session_id: &str) -> Result<Option<SessionUserDTO>, AppError>
    async validateSession(sessionId) {
      const session = await sessionRepo.findById(sessionId);
      if (!session) return null;

      if (new Date() > session.expiresAt) {
        await sessionRepo.delete(sessionId);
        return null;
      }

      return userRepo.findByIdSummary(session.userId);
    },
  };
}
