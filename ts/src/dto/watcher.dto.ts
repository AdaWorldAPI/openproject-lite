// RUST: Watcher DTO
// RUST: See lib/api/v3/watchers/watcher_representer.rb

import { z } from "zod";
import type { UserDTO } from "./user.dto";

// Watchable types matching OpenProject
export const WATCHABLE_TYPES = ["WorkPackage", "Project", "Wiki"] as const;
export type WatchableType = (typeof WATCHABLE_TYPES)[number];

// RUST: pub struct WatcherDTO
export interface WatcherDTO {
  readonly id: string;
  readonly watchableType: WatchableType;
  readonly watchableId: string;
  readonly userId: string;
  readonly user?: UserDTO;
  readonly createdAt: Date;
}

// RUST: pub struct CreateWatcherDTO
export interface CreateWatcherDTO {
  readonly watchableType: WatchableType;
  readonly watchableId: string;
  readonly userId: string;
}

// Zod schemas for validation
export const createWatcherSchema = z.object({
  watchableType: z.enum(WATCHABLE_TYPES),
  watchableId: z.string().uuid(),
  userId: z.string().uuid(),
});

// API request schema (just user ID, watchable is from URL)
export const addWatcherSchema = z.object({
  user: z.object({
    href: z.string(), // /api/v3/users/:id format
  }),
});
