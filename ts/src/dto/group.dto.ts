// RUST: Group DTO — pure data shapes for Groups API
// RUST: See lib/api/v3/groups/group_representer.rb

import { z } from "zod";

// RUST: struct GroupDTO
export interface GroupDTO {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly members?: readonly GroupMemberDTO[];
}

// RUST: struct GroupMemberDTO
export interface GroupMemberDTO {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

// RUST: struct CreateGroupDTO
export interface CreateGroupDTO {
  readonly name: string;
}

// RUST: struct UpdateGroupDTO
export interface UpdateGroupDTO {
  readonly name?: string;
}

// RUST: struct AddGroupMemberDTO
export interface AddGroupMemberDTO {
  readonly userId: string;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const addGroupMemberSchema = z.object({
  _links: z.object({
    user: z.object({
      href: z.string(),
    }),
  }),
});
