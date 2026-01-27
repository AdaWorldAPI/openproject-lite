import { z } from "zod";
import type { ProjectRole } from "../lib/types";
import type { UserSummaryDTO } from "./user.dto";

// RUST: pub struct ProjectDTO { ... }
export interface ProjectDTO {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly slug: string;
  readonly isArchived: boolean;
  readonly settings: { defaultTaskStatus?: string; allowPublicAccess?: boolean } | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct ProjectWithRoleDTO { ... }
export interface ProjectWithRoleDTO extends ProjectDTO {
  readonly role: ProjectRole;
  readonly joinedAt: Date;
}

// RUST: pub struct ProjectDetailDTO { ... }
export interface ProjectDetailDTO extends ProjectDTO {
  readonly members: ReadonlyArray<ProjectMemberDTO>;
}

// RUST: pub struct ProjectMemberDTO { ... }
export interface ProjectMemberDTO {
  readonly id: string;
  readonly role: ProjectRole;
  readonly joinedAt: Date;
  readonly user: UserSummaryDTO;
}

// RUST: pub struct CreateProjectDTO { pub name: String, pub description: Option<String> }
export interface CreateProjectDTO {
  readonly name: string;
  readonly description?: string;
}

// RUST: pub struct UpdateProjectDTO { pub name: Option<String>, pub description: Option<String>, pub is_archived: Option<bool> }
export interface UpdateProjectDTO {
  readonly name?: string;
  readonly description?: string;
  readonly isArchived?: boolean;
}

// RUST: pub struct AddMemberDTO { pub user_id: Uuid, pub role: ProjectRole }
export interface AddMemberDTO {
  readonly userId: string;
  readonly role?: ProjectRole;
}

// Zod schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  isArchived: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
});
