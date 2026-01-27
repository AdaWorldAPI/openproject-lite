import { Button } from '../../../ui/Button';
import type { Notification as NotificationType } from '../../../../api/notifications';
import styles from './NotificationList.module.css';

interface NotificationListProps {
  notifications: readonly NotificationType[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  task_assigned: 'Assigned',
  task_updated: 'Updated',
  comment_added: 'Comment',
  mentioned: 'Mention',
  project_invite: 'Invite',
};

export function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div className={styles.list}>
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={[styles.item, notification.isRead ? styles.read : styles.unread].join(' ')}
          >
            <div className={styles.content}>
              <div className={styles.meta}>
                <span className={styles.type}>{TYPE_ICONS[notification.type] ?? notification.type}</span>
                <time className={styles.time}>
                  {new Date(notification.createdAt).toLocaleString()}
                </time>
              </div>
              <h3 className={styles.notifTitle}>{notification.title}</h3>
              {notification.body && <p className={styles.body}>{notification.body}</p>}
            </div>
            {!notification.isRead && (
              <button
                type="button"
                className={styles.readBtn}
                onClick={() => onMarkRead(notification.id)}
                aria-label="Mark as read"
              >
                <span className={styles.dot} />
              </button>
            )}
          </article>
        ))}
        {notifications.length === 0 && (
          <p className={styles.empty}>No notifications</p>
        )}
      </div>
    </div>
  );
}
