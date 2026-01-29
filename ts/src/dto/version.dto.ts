// RUST: Version DTOs for OpenProject API v3 parity
// RUST: See lib/api/v3/versions/version_representer.rb

import { z } from "zod";

// Version status values
export const VERSION_STATUSES = ["open", "locked", "closed"] as const;
export type VersionStatus = (typeof VERSION_STATUSES)[number];

// Version sharing values
export const VERSION_SHARING = [
  "none",
  "descendants",
  "hierarchy",
  "tree",
  "system",
] as const;
export type VersionSharing = (typeof VERSION_SHARING)[number];

// RUST: pub struct VersionDTO
export interface VersionDTO {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly description: string | null;
  readonly startDate: Date | null;
  readonly effectiveDate: Date | null; // Target date
  readonly status: VersionStatus;
  readonly sharing: VersionSharing;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateVersionDTO
export interface CreateVersionDTO {
  readonly projectId: string;
  readonly name: string;
  readonly description?: string;
  readonly startDate?: Date | string;
  readonly effectiveDate?: Date | string;
  readonly status?: VersionStatus;
  readonly sharing?: VersionSharing;
}

// RUST: pub struct UpdateVersionDTO
export interface UpdateVersionDTO {
  readonly name?: string;
  readonly description?: string | null;
  readonly startDate?: Date | string | null;
  readonly effectiveDate?: Date | string | null;
  readonly status?: VersionStatus;
  readonly sharing?: VersionSharing;
}

// Zod schemas for validation
export const createVersionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.date().optional()),
  effectiveDate: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(VERSION_STATUSES).optional().default("open"),
  sharing: z.enum(VERSION_SHARING).optional().default("none"),
  _links: z
    .object({
      definingProject: z.object({
        href: z.string(),
      }),
    })
    .optional(),
});

export const updateVersionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
  effectiveDate: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
  status: z.enum(VERSION_STATUSES).optional(),
  sharing: z.enum(VERSION_SHARING).optional(),
});
