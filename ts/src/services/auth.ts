import { db, users, sessions, type User } from "../db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as argon2 from "argon2";

// ============================================
// TYPES
// ============================================

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  user: SessionUser;
  sessionId: string;
}

// ============================================
// PASSWORD HASHING
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
    })
    .returning();

  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
  return user ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return user ?? null;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function validateSession(
  sessionId: string
): Promise<SessionUser | null> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      // This requires the relation to be set up
    },
  });

  if (!session) return null;
  if (new Date() > session.expiresAt) {
    await deleteSession(sessionId);
    return null;
  }

  const user = await findUserById(session.userId);
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ============================================
// AUTH FLOWS
// ============================================

export async function login(
  email: string,
  password: string
): Promise<AuthResult | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.isActive) return null;

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) return null;

  const sessionId = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    sessionId,
  };
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const user = await createUser(email, password, name);
  const sessionId = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    sessionId,
  };
}

export async function logout(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}
