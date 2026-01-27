// RUST: pub trait NotificationService { ... }

import { ok, type Result } from "../lib/result";
import type { AppError } from "../lib/errors";
import type { NotificationListDTO, SessionUserDTO } from "../dto";
import type { NotificationRepository } from "../repositories/notification.repository";

export interface NotificationService {
  list(actor: SessionUserDTO, unreadOnly: boolean): Promise<Result<NotificationListDTO, AppError>>;
  markAsRead(id: string, actor: SessionUserDTO): Promise<Result<void, AppError>>;
  markAllAsRead(actor: SessionUserDTO): Promise<Result<void, AppError>>;
}

// RUST: pub struct NotificationServiceImpl { repo: Arc<dyn NotificationRepository> }
export function createNotificationService(
  repo: NotificationRepository
): NotificationService {
  return {
    // RUST: fn list(&self, actor: &SessionUserDTO, unread_only: bool) -> Result<NotificationListDTO, AppError>
    async list(actor, unreadOnly) {
      const [notifications, unreadCount] = await Promise.all([
        repo.listByUserId(actor.id, unreadOnly),
        repo.countUnread(actor.id),
      ]);
      return ok({ notifications, unreadCount });
    },

    // RUST: fn mark_as_read(&self, id: Uuid, actor: &SessionUserDTO) -> Result<(), AppError>
    async markAsRead(id, actor) {
      await repo.markAsRead(id, actor.id);
      return ok(undefined);
    },

    // RUST: fn mark_all_as_read(&self, actor: &SessionUserDTO) -> Result<(), AppError>
    async markAllAsRead(actor) {
      await repo.markAllAsRead(actor.id);
      return ok(undefined);
    },
  };
}
