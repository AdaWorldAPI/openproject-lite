import { api } from './client';
import { halElements, halUnreadCount } from './hal';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  notifications: Notification[];
  unreadCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNotification(hal: any): Notification {
  return {
    id: hal.id,
    // HAL uses "reason" (OpenProject convention), fallback to "type"
    type: hal.reason ?? hal.type ?? '',
    // HAL uses "subject", fallback to "title"
    title: hal.subject ?? hal.title ?? '',
    body: hal.body ?? null,
    linkUrl: hal.linkUrl ?? null,
    // HAL uses "readIAN", fallback to "isRead"
    isRead: hal.readIAN ?? hal.isRead ?? false,
    createdAt: hal.createdAt,
  };
}

export async function listNotifications(unreadOnly = false): Promise<NotificationList> {
  const query = unreadOnly ? '?unread=true' : '';
  const res = await api.get(`/notifications${query}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const data = await res.json();

  // HAL Collection format
  if (data._type === 'Collection') {
    return {
      notifications: halElements<any>(data).map(parseNotification),
      unreadCount: halUnreadCount(data),
    };
  }
  // Legacy format fallback
  return {
    notifications: (data.notifications ?? []).map(parseNotification),
    unreadCount: data.unreadCount ?? 0,
  };
}

export async function markAsRead(id: string): Promise<void> {
  const res = await api.patch(`/notifications/${id}/read`, {});
  if (!res.ok) throw new Error('Failed to mark notification as read');
}

export async function markAllAsRead(): Promise<void> {
  const res = await api.post('/notifications/read-all', {});
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}
