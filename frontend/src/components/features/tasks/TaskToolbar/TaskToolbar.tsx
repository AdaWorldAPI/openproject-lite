import { Button } from '../../../ui/Button';
import { Select, type SelectOption } from '../../../ui/Select';
import type { TaskStatus, TaskPriority } from '../../../../api/tasks';
import styles from './TaskToolbar.module.css';

interface TaskToolbarProps {
  onCreateTask: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: SelectOption[] = [
  { value: '', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskToolbar({
  onCreateTask,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: TaskToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by status"
        />
        <Select
          options={priorityOptions}
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          aria-label="Filter by priority"
        />
      </div>
      <Button onClick={onCreateTask}>
        + Create
      </Button>
    </div>
  );
}
