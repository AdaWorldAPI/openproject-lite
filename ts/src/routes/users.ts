// RUST: Users API routes — /api/v3/users
// RUST: See lib/api/v3/users/users_api.rb

import { Hono } from "hono";
import { userRepository } from "../container";
import { representUser, representUserCollection } from "../hal";
import { halError } from "../lib/hal";
import { z } from "zod";

export const usersRouter = new Hono();

// Update user schema
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  admin: z.boolean().optional(),
});

// GET /api/v3/users — List users
// RUST: fn list_users(offset: i32, limit: i32, filters: &[Filter]) -> Result<HalCollection, AppError>
usersRouter.get("/", async (c) => {
  // Parse query params
  const offset = parseInt(c.req.query("offset") || "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") || "20", 10);
  const sortBy = (c.req.query("sortBy") || "name") as "name" | "email" | "createdAt";
  const sortOrder = (c.req.query("sortOrder") || "asc") as "asc" | "desc";
  const search = c.req.query("search");
  const status = (c.req.query("status") || "all") as "active" | "locked" | "all";

  // OpenProject uses offset starting at 1, we use 0-based internally
  const internalOffset = Math.max(0, offset - 1);

  const [users, total] = await Promise.all([
    userRepository.list({
      offset: internalOffset,
      limit: pageSize,
      sortBy,
      sortOrder,
      search: search || undefined,
      status,
    }),
    userRepository.count({ search: search || undefined, status }),
  ]);

  return c.json(representUserCollection(users, total, pageSize, offset));
});

// GET /api/v3/users/me — Current user
// RUST: fn get_current_user(user_id: Uuid) -> Result<HalResource, AppError>
usersRouter.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  const fullUser = await userRepository.findById(user.id);
  if (!fullUser) {
    return c.json(
      halError({ code: "NOT_FOUND", message: "User not found" }),
      404
    );
  }

  return c.json(representUser(fullUser));
});

// GET /api/v3/users/:id — Get user by ID
// RUST: fn get_user(id: Uuid) -> Result<HalResource, AppError>
usersRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  // Handle "me" alias
  if (id === "me") {
    const user = c.get("user");
    if (!user) {
      return c.json(
        halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
        401
      );
    }
    const fullUser = await userRepository.findById(user.id);
    if (!fullUser) {
      return c.json(
        halError({ code: "NOT_FOUND", message: "User not found" }),
        404
      );
    }
    return c.json(representUser(fullUser));
  }

  const user = await userRepository.findById(id);
  if (!user) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${id} not found` }),
      404
    );
  }

  return c.json(representUser(user));
});

// PATCH /api/v3/users/:id — Update user
// RUST: fn update_user(id: Uuid, input: UpdateUserInput) -> Result<HalResource, AppError>
usersRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  // Must be authenticated
  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  // Check if user exists
  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${id} not found` }),
      404
    );
  }

  // TODO: Add proper permission check (admin or self)

  const body = await c.req.json();
  const result = updateUserSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  const updatedUser = await userRepository.update(id, {
    name: result.data.name,
    email: result.data.email,
    isAdmin: result.data.admin,
  });

  if (!updatedUser) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${id} not found` }),
      404
    );
  }

  return c.json(representUser(updatedUser));
});

// POST /api/v3/users/:id/lock — Lock user
// RUST: fn lock_user(id: Uuid) -> Result<HalResource, AppError>
usersRouter.post("/:id/lock", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  // TODO: Add admin permission check

  const user = await userRepository.lock(id);
  if (!user) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${id} not found` }),
      404
    );
  }

  return c.json(representUser(user));
});

// DELETE /api/v3/users/:id/lock — Unlock user
// RUST: fn unlock_user(id: Uuid) -> Result<HalResource, AppError>
usersRouter.delete("/:id/lock", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  // TODO: Add admin permission check

  const user = await userRepository.unlock(id);
  if (!user) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${id} not found` }),
      404
    );
  }

  return c.json(representUser(user));
});
