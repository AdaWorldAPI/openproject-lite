import { Badge } from '../../../ui/Badge';
import { Avatar } from '../../../ui/Avatar';
import type { TaskListItem } from '../../../../api/tasks';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: TaskListItem;
  onClick: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'primary'> = {
  backlog: 'default',
  todo: 'primary',
  in_progress: 'warning',
  review: 'primary',
  done: 'success',
  cancelled: 'danger',
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  urgent: 'danger',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <article className={styles.card} onClick={onClick} tabIndex={0} role="button">
      <div className={styles.top}>
        <Badge variant={STATUS_VARIANTS[task.status]}>
          {STATUS_LABELS[task.status] ?? task.status}
        </Badge>
        {(task.priority === 'high' || task.priority === 'urgent') && (
          <Badge variant={PRIORITY_VARIANTS[task.priority]}>
            {task.priority === 'urgent' ? '!!' : '!'}
          </Badge>
        )}
      </div>
      <h3 className={styles.title}>{task.title}</h3>
      <div className={styles.bottom}>
        {task.assigneeName ? (
          <div className={styles.assignee}>
            <Avatar name={task.assigneeName} size="sm" />
            <span className={styles.assigneeName}>{task.assigneeName}</span>
          </div>
        ) : (
          <span />
        )}
        {task.dueDate && (
          <time className={styles.date}>{new Date(task.dueDate).toLocaleDateString()}</time>
        )}
      </div>
    </article>
  );
}
