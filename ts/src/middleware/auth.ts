import { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { SessionUserDTO } from "../dto";
import { authService } from "../container";

// ============================================
// TYPES
// ============================================

declare module "hono" {
  interface ContextVariableMap {
    user: SessionUserDTO | null;
    sessionId: string | null;
  }
}

// ============================================
// CONSTANTS
// ============================================

const SESSION_COOKIE = "session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: "/",
};

// ============================================
// MIDDLEWARE
// ============================================

export async function sessionMiddleware(c: Context, next: Next) {
  const sessionId = getCookie(c, SESSION_COOKIE);

  if (sessionId) {
    const user = await authService.validateSession(sessionId);
    c.set("user", user);
    c.set("sessionId", sessionId);
  } else {
    c.set("user", null);
    c.set("sessionId", null);
  }

  await next();
}

export async function requireAuth(c: Context, next: Next) {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}

// ============================================
// COOKIE HELPERS
// ============================================

export function setSessionCookie(c: Context, sessionId: string) {
  setCookie(c, SESSION_COOKIE, sessionId, COOKIE_OPTIONS);
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
