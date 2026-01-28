import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  index,
  jsonb,
  integer,
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
// REFERENCE DATA (Types, Statuses, Priorities)
// ============================================

export const types = pgTable("op_lite_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").default("#1A67A3"),
  position: integer("position").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  isMilestone: boolean("is_milestone").notNull().default(false),
  isInRoadmap: boolean("is_in_roadmap").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const statuses = pgTable("op_lite_statuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").default("#DEE2E6"),
  position: integer("position").notNull().default(0),
  isClosed: boolean("is_closed").notNull().default(false),
  isDefault: boolean("is_default").notNull().default(false),
  isReadonly: boolean("is_readonly").notNull().default(false),
  defaultDoneRatio: integer("default_done_ratio"),
  excludedFromTotals: boolean("excluded_from_totals").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priorities = pgTable("op_lite_priorities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color"),
  position: integer("position").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roles = pgTable("op_lite_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  assignable: boolean("assignable").notNull().default(true),
  builtin: integer("builtin").notNull().default(0), // 0=normal, 1=non_member, 2=anonymous
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workflows = pgTable(
  "op_lite_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    typeId: uuid("type_id")
      .notNull()
      .references(() => types.id, { onDelete: "cascade" }),
    oldStatusId: uuid("old_status_id")
      .notNull()
      .references(() => statuses.id, { onDelete: "cascade" }),
    newStatusId: uuid("new_status_id")
      .notNull()
      .references(() => statuses.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    author: boolean("author").notNull().default(false),
    assignee: boolean("assignee").notNull().default(false),
  },
  (table) => ({
    uniqueTransition: index("op_lite_workflows_unique_idx").on(
      table.typeId,
      table.oldStatusId,
      table.newStatusId,
      table.roleId
    ),
  })
);

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
  (table) => ({
    projectIdx: index("op_lite_project_members_project_idx").on(table.projectId),
    userIdx: index("op_lite_project_members_user_idx").on(table.userId),
  })
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
    // Parent for hierarchy (self-reference, FK managed at DB level)
    parentId: uuid("parent_id"),
    title: text("title").notNull(),
    description: text("description"),
    // Legacy enum status (kept for backward compatibility)
    status: taskStatusEnum("status").notNull().default("backlog"),
    // New reference-based fields (OpenProject parity)
    typeId: uuid("type_id").references(() => types.id, { onDelete: "set null" }),
    statusId: uuid("status_id").references(() => statuses.id, { onDelete: "set null" }),
    priorityId: uuid("priority_id").references(() => priorities.id, { onDelete: "set null" }),
    // Legacy text priority (kept for backward compatibility)
    priority: text("priority").notNull().default("medium"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id),
    // Dates
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    // Progress
    percentComplete: integer("percent_complete").notNull().default(0),
    estimatedHours: text("estimated_hours"), // Stored as text, parsed as decimal
    // Ordering and versioning
    position: integer("position").notNull().default(0),
    lockVersion: integer("lock_version").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("op_lite_tasks_project_idx").on(table.projectId),
    assigneeIdx: index("op_lite_tasks_assignee_idx").on(table.assigneeId),
    statusIdx: index("op_lite_tasks_status_idx").on(table.status),
    parentIdx: index("op_lite_tasks_parent_idx").on(table.parentId),
    typeIdx: index("op_lite_tasks_type_idx").on(table.typeId),
  })
);

// ============================================
// WORK PACKAGE RELATIONS
// ============================================

export const workPackageRelationTypeEnum = pgEnum("op_lite_wp_relation_type", [
  "follows",     // finish-to-start (predecessor)
  "precedes",    // inverse of follows
  "blocks",      // blocking dependency
  "blocked",     // is blocked by
  "relates",     // general relation
  "duplicates",  // duplicate of
  "duplicated",  // is duplicated by
  "includes",    // parent-child (not hierarchy)
  "partof",      // part of
  "requires",    // requires
  "required",    // is required by
]);

export const workPackageRelations = pgTable(
  "op_lite_work_package_relations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromId: uuid("from_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    toId: uuid("to_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    relationType: workPackageRelationTypeEnum("relation_type").notNull(),
    lag: integer("lag").notNull().default(0), // Days for predecessor/successor
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    fromIdx: index("op_lite_wp_relations_from_idx").on(table.fromId),
    toIdx: index("op_lite_wp_relations_to_idx").on(table.toId),
    uniqueRelation: index("op_lite_wp_relations_unique_idx").on(
      table.fromId,
      table.toId,
      table.relationType
    ),
  })
);

// ============================================
// WATCHERS
// ============================================

export const watchers = pgTable(
  "op_lite_watchers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    watchableType: text("watchable_type").notNull(), // WorkPackage, Project, etc.
    watchableId: uuid("watchable_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    watchableIdx: index("op_lite_watchers_watchable_idx").on(
      table.watchableType,
      table.watchableId
    ),
    userIdx: index("op_lite_watchers_user_idx").on(table.userId),
    uniqueWatcher: index("op_lite_watchers_unique_idx").on(
      table.watchableType,
      table.watchableId,
      table.userId
    ),
  })
);

// ============================================
// JOURNALS (Activity/Audit Log)
// ============================================

export const journals = pgTable(
  "op_lite_journals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    journableType: text("journable_type").notNull(), // WorkPackage, Project, etc.
    journableId: uuid("journable_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    notes: text("notes"), // Comment text
    version: integer("version").notNull().default(1),
    causeType: text("cause_type"), // system, user
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    journableIdx: index("op_lite_journals_journable_idx").on(
      table.journableType,
      table.journableId
    ),
    userIdx: index("op_lite_journals_user_idx").on(table.userId),
  })
);

export const journalChanges = pgTable(
  "op_lite_journal_changes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    journalId: uuid("journal_id")
      .notNull()
      .references(() => journals.id, { onDelete: "cascade" }),
    property: text("property").notNull(), // Field name
    propertyKey: text("property_key"), // For custom fields: customField123
    oldValue: text("old_value"),
    newValue: text("new_value"),
  },
  (table) => ({
    journalIdx: index("op_lite_journal_changes_journal_idx").on(table.journalId),
  })
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
  (table) => ({
    taskIdx: index("op_lite_comments_task_idx").on(table.taskId),
  })
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
  (table) => ({
    userIdx: index("op_lite_notifications_user_idx").on(table.userId),
    unreadIdx: index("op_lite_notifications_unread_idx").on(table.userId, table.isRead),
  })
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
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: "parentChild",
  }),
  children: many(tasks, { relationName: "parentChild" }),
  type: one(types, {
    fields: [tasks.typeId],
    references: [types.id],
  }),
  statusRef: one(statuses, {
    fields: [tasks.statusId],
    references: [statuses.id],
  }),
  priorityRef: one(priorities, {
    fields: [tasks.priorityId],
    references: [priorities.id],
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
  relationsFrom: many(workPackageRelations, { relationName: "relationsFrom" }),
  relationsTo: many(workPackageRelations, { relationName: "relationsTo" }),
}));

export const workPackageRelationsRelations = relations(workPackageRelations, ({ one }) => ({
  from: one(tasks, {
    fields: [workPackageRelations.fromId],
    references: [tasks.id],
    relationName: "relationsFrom",
  }),
  to: one(tasks, {
    fields: [workPackageRelations.toId],
    references: [tasks.id],
    relationName: "relationsTo",
  }),
}));

export const watchersRelations = relations(watchers, ({ one }) => ({
  user: one(users, {
    fields: [watchers.userId],
    references: [users.id],
  }),
}));

export const journalsRelations = relations(journals, ({ one, many }) => ({
  user: one(users, {
    fields: [journals.userId],
    references: [users.id],
  }),
  changes: many(journalChanges),
}));

export const journalChangesRelations = relations(journalChanges, ({ one }) => ({
  journal: one(journals, {
    fields: [journalChanges.journalId],
    references: [journals.id],
  }),
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
