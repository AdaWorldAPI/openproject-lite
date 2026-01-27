import { Hono } from "hono";
import { createUserSchema, loginSchema } from "../dto";
import { errorToStatusCode } from "../lib/errors";
import { halError, halValidationError } from "../lib/hal";
import { authService } from "../container";
import {
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "../middleware/auth";
import { representSessionUser } from "../hal";

const auth = new Hono();

// POST /auth/register
// RUST: fn register(input: CreateUserDTO) -> Result<HalResource, HalError>
auth.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await authService.register(
    parsed.data.email,
    parsed.data.password,
    parsed.data.name,
  );

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 409,
    );
  }

  setSessionCookie(c, result.data.sessionId);
  return c.json({
    ...representSessionUser(result.data.user),
    _meta: { message: "Registration successful" },
  });
});

// POST /auth/login
// RUST: fn login(email: &str, password: &str) -> Result<HalResource, HalError>
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(halValidationError("Invalid input"), 400);
  }

  const result = await authService.login(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 401,
    );
  }

  setSessionCookie(c, result.data.sessionId);
  return c.json({
    ...representSessionUser(result.data.user),
    _meta: { message: "Login successful" },
  });
});

// POST /auth/logout
// RUST: fn logout(session_id: &str) -> Result<(), HalError>
auth.post("/logout", requireAuth, async (c) => {
  const sessionId = c.get("sessionId");

  if (sessionId) {
    await authService.logout(sessionId);
  }

  clearSessionCookie(c);
  return c.body(null, 204);
});

// GET /auth/me
// RUST: fn me() -> Option<HalResource>
auth.get("/me", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ _type: "Anonymous", _links: { self: { href: "/api/v3/users/me" } } });
  }

  return c.json(representSessionUser(user));
});

export default auth;
