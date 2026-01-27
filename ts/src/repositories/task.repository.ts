// RUST: pub trait TaskRepository { ... }

import { db } from "../db";
import { tasks, comments, projectMembers } from "../db/schema";
import type { TaskStatus, NewTask } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  TaskDTO,
  TaskListItemDTO,
  TaskDetailDTO,
  CommentWithAuthorDTO,
} from "../dto";

export interface TaskRepository {
  create(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: "low" | "medium" | "high" | "urgent";
    assigneeId?: string;
    dueDate?: Date;
    creatorId: string;
  }): Promise<TaskDTO>;
  findById(id: string): Promise<TaskDTO | null>;
  findByIdWithRelations(id: string): Promise<TaskDetailDTO | null>;
  listByProjectId(projectId: string): Promise<ReadonlyArray<TaskListItemDTO>>;
  update(id: string, data: Record<string, unknown>): Promise<TaskDTO | null>;
  delete(id: string): Promise<void>;
  checkProjectAccess(projectId: string, userId: string): Promise<boolean>;
  addComment(taskId: string, authorId: string, content: string): Promise<CommentWithAuthorDTO>;
}

// RUST: impl TaskRepository for TaskRepositoryImpl
export function createTaskRepository(): TaskRepository {
  return {
    async create(data) {
      const [row] = await db
        .insert(tasks)
        .values(data)
        .returning();
      return toTaskDTO(row);
    },

    async findById(id) {
      const row = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      });
      return row ? toTaskDTO(row) : null;
    },

    async findByIdWithRelations(id) {
      const row = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
        with: {
          assignee: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
          creator: {
            columns: { id: true, name: true, email: true },
          },
          project: {
            columns: { id: true, name: true, slug: true },
          },
          comments: {
            with: {
              author: {
                columns: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
            orderBy: desc(comments.createdAt),
          },
        },
      });
      if (!row) return null;

      return {
        ...toTaskDTO(row),
        assignee: row.assignee
          ? { id: row.assignee.id, name: row.assignee.name, email: row.assignee.email, avatarUrl: row.assignee.avatarUrl }
          : null,
        creator: { id: row.creator.id, name: row.creator.name, email: row.creator.email },
        project: { id: row.project.id, name: row.project.name, slug: row.project.slug },
        comments: row.comments.map(
          (c): CommentWithAuthorDTO => ({
            id: c.id,
            taskId: c.taskId,
            content: c.content,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            author: { id: c.author.id, name: c.author.name, email: c.author.email, avatarUrl: c.author.avatarUrl },
          })
        ),
      };
    },

    async listByProjectId(projectId) {
      const rows = await db.query.tasks.findMany({
        where: eq(tasks.projectId, projectId),
        with: {
          assignee: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
          creator: {
            columns: { id: true, name: true, email: true },
          },
        },
        orderBy: desc(tasks.createdAt),
      });
      return rows.map(
        (row): TaskListItemDTO => ({
          ...toTaskDTO(row),
          assignee: row.assignee
            ? { id: row.assignee.id, name: row.assignee.name, email: row.assignee.email, avatarUrl: row.assignee.avatarUrl }
            : null,
          creator: { id: row.creator.id, name: row.creator.name, email: row.creator.email },
        })
      );
    },

    async update(id, data) {
      const [row] = await db
        .update(tasks)
        .set(data)
        .where(eq(tasks.id, id))
        .returning();
      return row ? toTaskDTO(row) : null;
    },

    async delete(id) {
      await db.delete(tasks).where(eq(tasks.id, id));
    },

    async checkProjectAccess(projectId, userId) {
      const membership = await db.query.projectMembers.findFirst({
        where: and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        ),
      });
      return !!membership;
    },

    async addComment(taskId, authorId, content) {
      const [row] = await db
        .insert(comments)
        .values({ taskId, authorId, content })
        .returning();

      // Fetch the comment with author for the DTO
      const comment = await db.query.comments.findFirst({
        where: eq(comments.id, row.id),
        with: {
          author: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      return {
        id: comment!.id,
        taskId: comment!.taskId,
        content: comment!.content,
        createdAt: comment!.createdAt,
        updatedAt: comment!.updatedAt,
        author: {
          id: comment!.author.id,
          name: comment!.author.name,
          email: comment!.author.email,
          avatarUrl: comment!.author.avatarUrl,
        },
      };
    },
  };
}

function toTaskDTO(row: typeof tasks.$inferSelect): TaskDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    creatorId: row.creatorId,
    dueDate: row.dueDate,
    completedAt: row.completedAt,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
