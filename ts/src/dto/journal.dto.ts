// RUST: Journal DTO (Activity/Audit Log)
// RUST: See lib/api/v3/activities/activity_representer.rb

import { z } from "zod";
import type { UserDTO } from "./user.dto";

// Journable types matching OpenProject
export const JOURNABLE_TYPES = ["WorkPackage", "Project", "Meeting", "News"] as const;
export type JournableType = (typeof JOURNABLE_TYPES)[number];

// RUST: pub struct JournalChangeDTO
export interface JournalChangeDTO {
  readonly id: string;
  readonly journalId: string;
  readonly property: string;
  readonly propertyKey: string | null;
  readonly oldValue: string | null;
  readonly newValue: string | null;
}

// RUST: pub struct JournalDTO
export interface JournalDTO {
  readonly id: string;
  readonly journableType: JournableType;
  readonly journableId: string;
  readonly userId: string;
  readonly user?: UserDTO;
  readonly notes: string | null;
  readonly version: number;
  readonly causeType: string | null;
  readonly changes: JournalChangeDTO[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateJournalDTO
export interface CreateJournalDTO {
  readonly journableType: JournableType;
  readonly journableId: string;
  readonly userId: string;
  readonly notes?: string;
  readonly causeType?: string;
  readonly changes?: Array<{
    property: string;
    propertyKey?: string;
    oldValue?: string;
    newValue?: string;
  }>;
}

// Zod schemas for validation
export const createJournalSchema = z.object({
  journableType: z.enum(JOURNABLE_TYPES),
  journableId: z.string().uuid(),
  userId: z.string().uuid(),
  notes: z.string().optional(),
  causeType: z.string().optional(),
  changes: z
    .array(
      z.object({
        property: z.string(),
        propertyKey: z.string().optional(),
        oldValue: z.string().optional(),
        newValue: z.string().optional(),
      })
    )
    .optional(),
});

// For adding a comment (notes) via the API
export const addCommentSchema = z.object({
  comment: z.object({
    raw: z.string(),
  }),
});
