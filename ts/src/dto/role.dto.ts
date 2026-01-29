// RUST: Role DTOs for OpenProject API v3 parity
// RUST: See lib/api/v3/roles/role_representer.rb

import { z } from "zod";

// OpenProject permission strings
export const PERMISSIONS = [
  // Work packages
  "view_work_packages",
  "add_work_packages",
  "edit_work_packages",
  "edit_own_work_packages",
  "delete_work_packages",
  "move_work_packages",
  "copy_work_packages",
  "manage_work_package_relations",
  "add_work_package_notes",
  "edit_work_package_notes",
  "edit_own_work_package_notes",
  "view_work_package_watchers",
  "add_work_package_watchers",
  "delete_work_package_watchers",
  // Members
  "view_members",
  "manage_members",
  // Projects
  "edit_project",
  "select_project_modules",
  "manage_versions",
  "manage_categories",
  "manage_project_custom_values",
  // Wiki
  "view_wiki_pages",
  "edit_wiki_pages",
  "delete_wiki_pages",
  // Time tracking
  "view_time_entries",
  "log_time",
  "edit_time_entries",
  "edit_own_time_entries",
  // Admin (global)
  "add_project",
  "manage_user",
  "manage_roles",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Role builtin types (matching OpenProject)
export const ROLE_BUILTIN = {
  NORMAL: 0,
  NON_MEMBER: 1,
  ANONYMOUS: 2,
} as const;

// RUST: pub struct RoleDTO
export interface RoleDTO {
  readonly id: string;
  readonly name: string;
  readonly position: number;
  readonly permissions: readonly string[];
  readonly assignable: boolean;
  readonly builtin: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateRoleDTO
export interface CreateRoleDTO {
  readonly name: string;
  readonly permissions?: string[];
  readonly assignable?: boolean;
}

// RUST: pub struct UpdateRoleDTO
export interface UpdateRoleDTO {
  readonly name?: string;
  readonly permissions?: string[];
  readonly assignable?: boolean;
  readonly position?: number;
}

// Zod schemas for validation
export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional().default([]),
  assignable: z.boolean().optional().default(true),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).optional(),
  assignable: z.boolean().optional(),
  position: z.number().int().positive().optional(),
});
