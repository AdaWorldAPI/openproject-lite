import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import {
  listTasks,
  updateTask,
  type TaskListItem,
  type TaskStatus,
} from '../api/tasks';
import styles from './KanbanPage.module.css';

const COLUMNS: { status: TaskStatus; label: string; variant: 'default' | 'primary' | 'warning' | 'success' | 'danger' }[] = [
  { status: 'backlog', label: 'Backlog', variant: 'default' },
  { status: 'todo', label: 'To do', variant: 'primary' },
  { status: 'in_progress', label: 'In progress', variant: 'warning' },
  { status: 'review', label: 'Review', variant: 'primary' },
  { status: 'done', label: 'Done', variant: 'success' },
];

const PRIORITY_VARIANT: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'default',
};

export function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await listTasks(projectId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    // Add a small delay to show ghost correctly
    const target = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => target.classList.add(styles.dragging));
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    (e.currentTarget as HTMLElement).classList.remove(styles.dragging);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)),
    );

    try {
      await updateTask(taskId, { status: targetStatus });
    } catch {
      // Revert on error
      fetchTasks();
    }
  }, [tasks, fetchTasks]);

  const tasksByStatus = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.status),
  }));

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Board</h1>
      <div className={styles.board}>
        {tasksByStatus.map((column) => (
          <div
            key={column.status}
            className={[
              styles.column,
              dragOverColumn === column.status ? styles.columnDragOver : '',
            ].join(' ')}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className={styles.columnHeader}>
              <Badge variant={column.variant}>{column.label}</Badge>
              <span className={styles.columnCount}>{column.tasks.length}</span>
            </div>
            <div className={styles.columnBody}>
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={[
                    styles.card,
                    draggedTaskId === task.id ? styles.dragging : '',
                  ].join(' ')}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.cardTitle}>{task.title}</div>
                  <div className={styles.cardMeta}>
                    {task.priority && task.priority !== 'medium' && (
                      <Badge variant={PRIORITY_VARIANT[task.priority]}>
                        {task.priority}
                      </Badge>
                    )}
                    {task.dueDate && (
                      <span className={styles.dueDate}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  {task.assigneeName && (
                    <div className={styles.cardAssignee}>
                      <Avatar name={task.assigneeName} size="sm" />
                      <span className={styles.assigneeName}>{task.assigneeName}</span>
                    </div>
                  )}
                </div>
              ))}
              {column.tasks.length === 0 && (
                <div className={styles.emptyColumn}>
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
