import { useEffect, useState, useCallback } from 'react';
import { Spinner } from '../components/ui/Spinner';
import { NotificationList } from '../components/features/notifications/NotificationList';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '../api/notifications';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await listNotifications();
      setNotifications(data.notifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <NotificationList
      notifications={notifications}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
