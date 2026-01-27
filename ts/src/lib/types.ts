// RUST: Shared type aliases used across all layers

// RUST: pub type Uuid = uuid::Uuid;
export type Uuid = string;

// RUST: pub type Timestamp = chrono::NaiveDateTime;
export type Timestamp = Date;

// RUST: pub struct PaginatedList<T> { pub items: Vec<T>, pub total: usize }
export interface PaginatedList<T> {
  readonly items: ReadonlyArray<T>;
  readonly total: number;
}

// RUST: pub enum TaskStatus { Backlog, Todo, InProgress, Review, Done, Cancelled }
export const TASK_STATUS_VALUES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

// RUST: pub enum TaskPriority { Low, Medium, High, Urgent }
export const TASK_PRIORITY_VALUES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];

// RUST: pub enum ProjectRole { Owner, Admin, Member, Viewer }
export const PROJECT_ROLE_VALUES = [
  "owner",
  "admin",
  "member",
  "viewer",
] as const;
export type ProjectRole = (typeof PROJECT_ROLE_VALUES)[number];

// RUST: pub enum NotificationType { ... }
export const NOTIFICATION_TYPE_VALUES = [
  "task_assigned",
  "task_updated",
  "comment_added",
  "mentioned",
  "project_invite",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];
