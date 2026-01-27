import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS (prefixed to avoid conflicts)
// ============================================

export const taskStatusEnum = pgEnum("op_lite_task_status", [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
]);

export const projectRoleEnum = pgEnum("op_lite_project_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const notificationTypeEnum = pgEnum("op_lite_notification_type", [
  "task_assigned",
  "task_updated",
  "comment_added",
  "mentioned",
  "project_invite",
]);

// ============================================
// USERS
// ============================================

export const users = pgTable("op_lite_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("op_lite_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

// ============================================
// PROJECTS
// ============================================

export const projects = pgTable("op_lite_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  isArchived: boolean("is_archived").notNull().default(false),
  settings: jsonb("settings").$type<{
    defaultTaskStatus?: string;
    allowPublicAccess?: boolean;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectMembers = pgTable(
  "op_lite_project_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: projectRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => [
    index("op_lite_project_members_project_idx").on(table.projectId),
    index("op_lite_project_members_user_idx").on(table.userId),
  ]
);

// ============================================
// TASKS (Work Packages)
// ============================================

export const tasks = pgTable(
  "op_lite_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("backlog"),
    priority: text("priority").notNull().default("medium"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("op_lite_tasks_project_idx").on(table.projectId),
    index("op_lite_tasks_assignee_idx").on(table.assigneeId),
    index("op_lite_tasks_status_idx").on(table.status),
  ]
);

// ============================================
// COMMENTS
// ============================================

export const comments = pgTable(
  "op_lite_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("op_lite_comments_task_idx").on(table.taskId)]
);

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = pgTable(
  "op_lite_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    linkUrl: text("link_url"),
    isRead: boolean("is_read").notNull().default(false),
    emailSent: boolean("email_sent").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("op_lite_notifications_user_idx").on(table.userId),
    index("op_lite_notifications_unread_idx").on(table.userId, table.isRead),
  ]
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  projectMemberships: many(projectMembers),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
  comments: many(comments),
  notifications: many(notifications),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(projectMembers),
  tasks: many(tasks),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
