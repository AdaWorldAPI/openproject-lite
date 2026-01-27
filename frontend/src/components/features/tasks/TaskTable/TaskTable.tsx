import { Badge } from '../../../ui/Badge';
import { Avatar } from '../../../ui/Avatar';
import { Checkbox } from '../../../ui/Checkbox';
import type { TaskListItem } from '../../../../api/tasks';
import styles from './TaskTable.module.css';

interface TaskTableProps {
  tasks: readonly TaskListItem[];
  selectedIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onRowClick: (task: TaskListItem) => void;
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

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'primary'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  urgent: 'danger',
};

export function TaskTable({ tasks, selectedIds, onSelect, onSelectAll, onRowClick }: TaskTableProps) {
  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < tasks.length;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onSelectAll}
                aria-label="Select all tasks"
              />
            </th>
            <th className={styles.idCol}>#</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr
              key={task.id}
              className={[styles.row, selectedIds.has(task.id) ? styles.selected : ''].join(' ')}
              onClick={() => onRowClick(task)}
            >
              <td className={styles.checkCol} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(task.id)}
                  onChange={() => onSelect(task.id)}
                  aria-label={`Select ${task.title}`}
                />
              </td>
              <td className={styles.idCol}>{index + 1}</td>
              <td className={styles.titleCol}>
                <span className={styles.title}>{task.title}</span>
              </td>
              <td>
                <Badge variant={STATUS_VARIANTS[task.status]}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </Badge>
              </td>
              <td>
                <Badge variant={PRIORITY_VARIANTS[task.priority]}>
                  {PRIORITY_LABELS[task.priority] ?? task.priority}
                </Badge>
              </td>
              <td>
                {task.assigneeName ? (
                  <div className={styles.assignee}>
                    <Avatar name={task.assigneeName} size="sm" />
                    <span>{task.assigneeName}</span>
                  </div>
                ) : (
                  <span className={styles.unassigned}>-</span>
                )}
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.empty}>
                No work packages found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
