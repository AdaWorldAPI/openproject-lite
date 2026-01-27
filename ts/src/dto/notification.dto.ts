import type { NotificationType } from "../lib/types";

// RUST: pub struct NotificationDTO { ... }
export interface NotificationDTO {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string | null;
  readonly linkUrl: string | null;
  readonly isRead: boolean;
  readonly emailSent: boolean;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;
}

// RUST: pub struct NotificationListDTO { ... }
export interface NotificationListDTO {
  readonly notifications: ReadonlyArray<NotificationDTO>;
  readonly unreadCount: number;
}

// RUST: pub struct CreateNotificationDTO { ... }
export interface CreateNotificationDTO {
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body?: string;
  readonly linkUrl?: string;
  readonly metadata?: Record<string, unknown>;
}
