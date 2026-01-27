import { z } from "zod";
import { TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } from "../lib/types";
import type { TaskStatus, TaskPriority } from "../lib/types";
import type { UserSummaryDTO } from "./user.dto";

// RUST: pub struct TaskDTO { ... }
export interface TaskDTO {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority | null;
  readonly assigneeId: string | null;
  readonly creatorId: string;
  readonly dueDate: Date | null;
  readonly completedAt: Date | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct TaskWithRelationsDTO { ... }
export interface TaskListItemDTO extends TaskDTO {
  readonly assignee: UserSummaryDTO | null;
  readonly creator: UserSummaryDTO;
}

// RUST: pub struct TaskDetailDTO { ... }
export interface TaskDetailDTO extends TaskDTO {
  readonly assignee: UserSummaryDTO | null;
  readonly creator: UserSummaryDTO;
  readonly project: { readonly id: string; readonly name: string; readonly slug: string };
  readonly comments: ReadonlyArray<CommentWithAuthorDTO>;
}

// RUST: pub struct CommentWithAuthorDTO { ... }
export interface CommentWithAuthorDTO {
  readonly id: string;
  readonly taskId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly author: UserSummaryDTO;
}

// RUST: pub struct CreateTaskDTO { ... }
export interface CreateTaskDTO {
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly assigneeId?: string;
  readonly dueDate?: string; // ISO datetime string from input
}

// RUST: pub struct UpdateTaskDTO { ... }
export interface UpdateTaskDTO {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority | null;
  readonly assigneeId?: string | null;
  readonly dueDate?: string | null;
}

// RUST: pub struct CreateCommentDTO { pub content: String }
export interface CreateCommentDTO {
  readonly content: string;
}

// Zod schemas
export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(TASK_PRIORITY_VALUES).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(TASK_PRIORITY_VALUES).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});
