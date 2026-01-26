import { Hono } from "hono";
import { z } from "zod";
import { login, register, logout } from "../services/auth";
import {
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "../middleware/auth";

const auth = new Hono();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ============================================
// ROUTES
// ============================================

// POST /auth/register
auth.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await register(parsed.data.email, parsed.data.password, parsed.data.name);
    setSessionCookie(c, result.sessionId);

    return c.json({
      user: result.user,
      message: "Registration successful",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Email already registered") {
      return c.json({ error: "Email already registered" }, 409);
    }
    throw error;
  }
});

// POST /auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await login(parsed.data.email, parsed.data.password);

  if (!result) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  setSessionCookie(c, result.sessionId);

  return c.json({
    user: result.user,
    message: "Login successful",
  });
});

// POST /auth/logout
auth.post("/logout", requireAuth, async (c) => {
  const sessionId = c.get("sessionId");

  if (sessionId) {
    await logout(sessionId);
  }

  clearSessionCookie(c);

  return c.json({ message: "Logged out" });
});

// GET /auth/me
auth.get("/me", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ user: null });
  }

  return c.json({ user });
});

export default auth;
