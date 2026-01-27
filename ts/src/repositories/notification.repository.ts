// RUST: pub trait NotificationRepository { ... }

import { db } from "../db";
import { notifications } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { NotificationDTO, CreateNotificationDTO } from "../dto";

export interface NotificationRepository {
  create(data: CreateNotificationDTO): Promise<NotificationDTO>;
  listByUserId(userId: string, unreadOnly: boolean): Promise<ReadonlyArray<NotificationDTO>>;
  countUnread(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

// RUST: impl NotificationRepository for NotificationRepositoryImpl
export function createNotificationRepository(): NotificationRepository {
  return {
    async create(data) {
      const [row] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          linkUrl: data.linkUrl,
          metadata: data.metadata,
        })
        .returning();
      return toNotificationDTO(row);
    },

    async listByUserId(userId, unreadOnly) {
      const where = unreadOnly
        ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        : eq(notifications.userId, userId);

      const rows = await db.query.notifications.findMany({
        where,
        orderBy: desc(notifications.createdAt),
        limit: 50,
      });
      return rows.map(toNotificationDTO);
    },

    async countUnread(userId) {
      const rows = await db.query.notifications.findMany({
        where: and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ),
        columns: { id: true },
      });
      return rows.length;
    },

    async markAsRead(id, userId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(eq(notifications.id, id), eq(notifications.userId, userId))
        );
    },

    async markAllAsRead(userId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );
    },
  };
}

function toNotificationDTO(
  row: typeof notifications.$inferSelect
): NotificationDTO {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    linkUrl: row.linkUrl,
    isRead: row.isRead,
    emailSent: row.emailSent,
    metadata: row.metadata,
    createdAt: row.createdAt,
  };
}
