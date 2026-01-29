// RUST: Groups API routes — /api/v3/groups
// RUST: See lib/api/v3/groups/groups_api.rb

import { Hono } from "hono";
import { groupRepository, userRepository } from "../container";
import {
  representGroup,
  representGroupCollection,
  representGroupMembersCollection,
} from "../hal";
import { halError } from "../lib/hal";
import {
  createGroupSchema,
  updateGroupSchema,
  addGroupMemberSchema,
} from "../dto/group.dto";

export const groupsRouter = new Hono();

// GET /api/v3/groups — List all groups
// RUST: fn list_groups() -> Result<HalCollection, AppError>
groupsRouter.get("/", async (c) => {
  const groups = await groupRepository.list();
  return c.json(representGroupCollection(groups));
});

// GET /api/v3/groups/:id — Get group by ID (with members)
// RUST: fn get_group(id: Uuid) -> Result<HalResource, AppError>
groupsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const group = await groupRepository.findByIdWithMembers(id);

  if (!group) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${id} not found` }),
      404
    );
  }

  return c.json(representGroup(group));
});

// POST /api/v3/groups — Create group (admin only)
// RUST: fn create_group(input: CreateGroupInput) -> Result<HalResource, AppError>
groupsRouter.post("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  // Check if user is admin
  if (!currentUser.isAdmin) {
    return c.json(
      halError({
        code: "FORBIDDEN",
        message: "Only administrators can create groups",
      }),
      403
    );
  }

  const body = await c.req.json();
  const result = createGroupSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  // Check if group name already exists
  const existing = await groupRepository.findByName(result.data.name);
  if (existing) {
    return c.json(
      halError({
        code: "CONFLICT",
        message: `Group with name "${result.data.name}" already exists`,
      }),
      409
    );
  }

  const group = await groupRepository.create(result.data);
  return c.json(representGroup(group), 201);
});

// PATCH /api/v3/groups/:id — Update group (admin only)
// RUST: fn update_group(id: Uuid, input: UpdateGroupInput) -> Result<HalResource, AppError>
groupsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  if (!currentUser.isAdmin) {
    return c.json(
      halError({
        code: "FORBIDDEN",
        message: "Only administrators can update groups",
      }),
      403
    );
  }

  const existingGroup = await groupRepository.findById(id);
  if (!existingGroup) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${id} not found` }),
      404
    );
  }

  const body = await c.req.json();
  const result = updateGroupSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  // Check if new name conflicts
  if (result.data.name && result.data.name !== existingGroup.name) {
    const nameConflict = await groupRepository.findByName(result.data.name);
    if (nameConflict) {
      return c.json(
        halError({
          code: "CONFLICT",
          message: `Group with name "${result.data.name}" already exists`,
        }),
        409
      );
    }
  }

  const updatedGroup = await groupRepository.update(id, result.data);
  if (!updatedGroup) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${id} not found` }),
      404
    );
  }

  return c.json(representGroup(updatedGroup));
});

// DELETE /api/v3/groups/:id — Delete group (admin only)
// RUST: fn delete_group(id: Uuid) -> Result<(), AppError>
groupsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  if (!currentUser.isAdmin) {
    return c.json(
      halError({
        code: "FORBIDDEN",
        message: "Only administrators can delete groups",
      }),
      403
    );
  }

  const deleted = await groupRepository.delete(id);
  if (!deleted) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${id} not found` }),
      404
    );
  }

  return c.body(null, 204);
});

// GET /api/v3/groups/:id/members — List group members
// RUST: fn get_group_members(id: Uuid) -> Result<HalCollection, AppError>
groupsRouter.get("/:id/members", async (c) => {
  const id = c.req.param("id");

  const group = await groupRepository.findById(id);
  if (!group) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${id} not found` }),
      404
    );
  }

  const members = await groupRepository.getMembers(id);
  return c.json(representGroupMembersCollection(members, id));
});

// POST /api/v3/groups/:id/members — Add member to group (admin only)
// RUST: fn add_group_member(id: Uuid, user_id: Uuid) -> Result<(), AppError>
groupsRouter.post("/:id/members", async (c) => {
  const groupId = c.req.param("id");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  if (!currentUser.isAdmin) {
    return c.json(
      halError({
        code: "FORBIDDEN",
        message: "Only administrators can manage group members",
      }),
      403
    );
  }

  const group = await groupRepository.findById(groupId);
  if (!group) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${groupId} not found` }),
      404
    );
  }

  const body = await c.req.json();
  const result = addGroupMemberSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: `Invalid input: ${result.error.message}`,
      }),
      422
    );
  }

  // Extract user ID from _links.user.href
  const hrefMatch = result.data._links.user.href.match(
    /\/api\/v3\/users\/([a-f0-9-]+)/
  );
  if (!hrefMatch) {
    return c.json(
      halError({
        code: "VALIDATION",
        message: "Invalid user href format",
      }),
      422
    );
  }
  const userId = hrefMatch[1];

  // Check if user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `User ${userId} not found` }),
      404
    );
  }

  // Check if already a member
  const isMember = await groupRepository.isMember(groupId, userId);
  if (isMember) {
    return c.json(
      halError({
        code: "CONFLICT",
        message: `User ${userId} is already a member of this group`,
      }),
      409
    );
  }

  await groupRepository.addMember(groupId, userId);

  // Return the updated group
  const updatedGroup = await groupRepository.findByIdWithMembers(groupId);
  return c.json(representGroup(updatedGroup!), 201);
});

// DELETE /api/v3/groups/:id/members/:userId — Remove member from group (admin only)
// RUST: fn remove_group_member(id: Uuid, user_id: Uuid) -> Result<(), AppError>
groupsRouter.delete("/:id/members/:userId", async (c) => {
  const groupId = c.req.param("id");
  const userId = c.req.param("userId");
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json(
      halError({ code: "UNAUTHORIZED", message: "Not authenticated" }),
      401
    );
  }

  if (!currentUser.isAdmin) {
    return c.json(
      halError({
        code: "FORBIDDEN",
        message: "Only administrators can manage group members",
      }),
      403
    );
  }

  const group = await groupRepository.findById(groupId);
  if (!group) {
    return c.json(
      halError({ code: "NOT_FOUND", message: `Group ${groupId} not found` }),
      404
    );
  }

  const removed = await groupRepository.removeMember(groupId, userId);
  if (!removed) {
    return c.json(
      halError({
        code: "NOT_FOUND",
        message: `User ${userId} is not a member of this group`,
      }),
      404
    );
  }

  return c.body(null, 204);
});
