// RUST: Principals API routes — /api/v3/principals
// RUST: See lib/api/v3/principals/principals_api.rb
//
// Principals is a unified endpoint that returns both Users and Groups
// In OpenProject, this uses STI (Single Table Inheritance)
// In our implementation, we query both tables and merge the results

import { Hono } from "hono";
import { userRepository, groupRepository } from "../container";
import { representPrincipalCollection, representPrincipal } from "../hal";
import { halError } from "../lib/hal";
import type { PrincipalDTO, UserPrincipalDTO, GroupPrincipalDTO } from "../dto";

export const principalsRouter = new Hono();

// GET /api/v3/principals — List all principals (users and groups)
// RUST: fn list_principals(options: ListPrincipalsOptions) -> Result<HalCollection, AppError>
principalsRouter.get("/", async (c) => {
  // Parse query parameters
  const offset = parseInt(c.req.query("offset") ?? "0", 10);
  const limit = parseInt(c.req.query("pageSize") ?? "20", 10);
  const typeFilter = c.req.query("type"); // User, Group, or empty for all
  const search = c.req.query("search") ?? c.req.query("name");

  const principals: PrincipalDTO[] = [];

  // Fetch users if type filter allows
  if (!typeFilter || typeFilter === "User" || typeFilter === "all") {
    const users = await userRepository.list({
      search,
      status: "active", // Only active users in principals
      limit: limit,
      offset: 0, // We'll handle pagination after merging
    });

    for (const user of users) {
      const userPrincipal: UserPrincipalDTO = {
        _type: "User",
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      principals.push(userPrincipal);
    }
  }

  // Fetch groups if type filter allows
  if (!typeFilter || typeFilter === "Group" || typeFilter === "all") {
    const groups = await groupRepository.list();

    // Filter groups by search if provided
    let filteredGroups = groups;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(searchLower)
      );
    }

    for (const group of filteredGroups) {
      const groupPrincipal: GroupPrincipalDTO = {
        _type: "Group",
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
      principals.push(groupPrincipal);
    }
  }

  // Sort by name
  principals.sort((a, b) => a.name.localeCompare(b.name));

  // Apply pagination
  const total = principals.length;
  const paginatedPrincipals = principals.slice(offset, offset + limit);

  return c.json(representPrincipalCollection(paginatedPrincipals, total));
});

// GET /api/v3/principals/:id — Get principal by ID
// RUST: fn get_principal(id: Uuid) -> Result<HalResource, AppError>
principalsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  // Try to find as user first
  const user = await userRepository.findById(id);
  if (user) {
    const userPrincipal: UserPrincipalDTO = {
      _type: "User",
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return c.json(representPrincipal(userPrincipal));
  }

  // Try to find as group
  const group = await groupRepository.findById(id);
  if (group) {
    const groupPrincipal: GroupPrincipalDTO = {
      _type: "Group",
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
    return c.json(representPrincipal(groupPrincipal));
  }

  return c.json(
    halError({ code: "NOT_FOUND", message: `Principal ${id} not found` }),
    404
  );
});
