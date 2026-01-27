import { api } from './client';

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

export async function listNotifications(unreadOnly = false): Promise<NotificationList> {
  const query = unreadOnly ? '?unread=true' : '';
  const res = await api.get(`/notifications${query}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markAsRead(id: string): Promise<void> {
  const res = await api.patch(`/notifications/${id}/read`, {});
  if (!res.ok) throw new Error('Failed to mark notification as read');
}

export async function markAllAsRead(): Promise<void> {
  const res = await api.post('/notifications/read-all', {});
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}
