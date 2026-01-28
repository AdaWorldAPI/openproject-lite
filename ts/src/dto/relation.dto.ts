// RUST: Work Package Relation DTO
// RUST: See lib/api/v3/relations/relation_representer.rb

import { z } from "zod";

// Relation types matching OpenProject
export const RELATION_TYPES = [
  "follows",
  "precedes",
  "blocks",
  "blocked",
  "relates",
  "duplicates",
  "duplicated",
  "includes",
  "partof",
  "requires",
  "required",
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

// RUST: pub struct RelationDTO
export interface RelationDTO {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly relationType: RelationType;
  readonly lag: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateRelationDTO
export interface CreateRelationDTO {
  readonly fromId: string;
  readonly toId: string;
  readonly relationType: RelationType;
  readonly lag?: number;
  readonly description?: string;
}

// RUST: pub struct UpdateRelationDTO
export interface UpdateRelationDTO {
  readonly relationType?: RelationType;
  readonly lag?: number;
  readonly description?: string;
}

// Zod schemas for validation
export const createRelationSchema = z.object({
  fromId: z.string().uuid(),
  toId: z.string().uuid(),
  relationType: z.enum(RELATION_TYPES),
  lag: z.number().int().default(0),
  description: z.string().optional(),
});

export const updateRelationSchema = z.object({
  relationType: z.enum(RELATION_TYPES).optional(),
  lag: z.number().int().optional(),
  description: z.string().optional(),
});
