import { Hono } from "hono";
import { createUserSchema, loginSchema } from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { authService } from "../container";
import {
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "../middleware/auth";

const auth = new Hono();

// POST /auth/register
auth.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await authService.register(
    parsed.data.email,
    parsed.data.password,
    parsed.data.name
  );

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 409
    );
  }

  setSessionCookie(c, result.data.sessionId);
  return c.json({
    user: result.data.user,
    message: "Registration successful",
  });
});

// POST /auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const result = await authService.login(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 401
    );
  }

  setSessionCookie(c, result.data.sessionId);
  return c.json({
    user: result.data.user,
    message: "Login successful",
  });
});

// POST /auth/logout
auth.post("/logout", requireAuth, async (c) => {
  const sessionId = c.get("sessionId");

  if (sessionId) {
    await authService.logout(sessionId);
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
