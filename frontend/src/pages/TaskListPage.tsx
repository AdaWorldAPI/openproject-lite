import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { TaskTable } from '../components/features/tasks/TaskTable';
import { TaskToolbar } from '../components/features/tasks/TaskToolbar';
import { TaskSplitView } from '../components/features/tasks/TaskSplitView';
import { TaskForm } from '../components/features/tasks/TaskForm';
import { listTasks, getTask, type TaskListItem, type TaskDetail } from '../api/tasks';
import styles from './TaskListPage.module.css';

export function TaskListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailTask, setDetailTask] = useState<TaskDetail | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

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

  const handleRowClick = useCallback(async (task: TaskListItem) => {
    const detail = await getTask(task.id);
    setDetailTask(detail);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === tasks.length ? new Set() : new Set(tasks.map((t) => t.id))
    );
  }, [tasks]);

  const handleDetailUpdate = useCallback(async () => {
    if (detailTask) {
      const updated = await getTask(detailTask.id);
      setDetailTask(updated);
    }
    fetchTasks();
  }, [detailTask, fetchTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Work packages</h1>
        <TaskToolbar
          onCreateTask={() => setShowCreate(true)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />
        <TaskTable
          tasks={filteredTasks}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onRowClick={handleRowClick}
        />
      </div>

      {detailTask && (
        <TaskSplitView
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onUpdate={handleDetailUpdate}
        />
      )}

      {projectId && (
        <TaskForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          projectId={projectId}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}
