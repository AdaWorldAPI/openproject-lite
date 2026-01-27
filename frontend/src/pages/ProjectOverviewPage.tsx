import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { getProject, type ProjectDetail } from '../api/projects';
import { listTasks, type TaskListItem } from '../api/tasks';
import styles from './ProjectOverviewPage.module.css';

interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  unassigned: number;
}

function computeStats(tasks: TaskListItem[]): TaskStats {
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let overdue = 0;
  let unassigned = 0;
  const now = new Date();

  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    if (t.priority) {
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }
    if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'cancelled') {
      overdue++;
    }
    if (!t.assigneeId) {
      unassigned++;
    }
  }

  return { total: tasks.length, byStatus, byPriority, overdue, unassigned };
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled'];

const STATUS_VARIANT: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  backlog: 'default',
  todo: 'primary',
  in_progress: 'warning',
  review: 'primary',
  done: 'success',
  cancelled: 'danger',
};

export function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<(ProjectDetail & { role?: string }) | null>(null);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      try {
        const [proj, taskList] = await Promise.all([
          getProject(projectId!),
          listTasks(projectId!),
        ]);
        if (!cancelled) {
          setProject(proj);
          setTasks(taskList);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projectId]);

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return <div className={styles.center}>Project not found</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
        </div>
        {project.role && <Badge variant="primary">{project.role}</Badge>}
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total work packages</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.byStatus['in_progress'] ?? 0}</span>
          <span className={styles.statLabel}>In progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.overdue}</span>
          <span className={styles.statLabel}>Overdue</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.unassigned}</span>
          <span className={styles.statLabel}>Unassigned</span>
        </div>
      </div>

      <div className={styles.columns}>
        {/* Status breakdown */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Work packages by status</h2>
            <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/tasks`)}>
              View all
            </Button>
          </div>
          <div className={styles.statusList}>
            {STATUS_ORDER.map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={status} className={styles.statusRow}>
                  <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
                  <div className={styles.statusBar}>
                    <div
                      className={styles.statusFill}
                      style={{ width: `${pct}%` }}
                      data-variant={STATUS_VARIANT[status]}
                    />
                  </div>
                  <span className={styles.statusCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Members preview */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Members</h2>
            <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/members`)}>
              View all
            </Button>
          </div>
          <div className={styles.memberList}>
            {project.members.slice(0, 8).map((member) => (
              <div key={member.userId} className={styles.memberRow}>
                <Avatar name={member.userName} size="sm" />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{member.userName}</span>
                  <span className={styles.memberEmail}>{member.userEmail}</span>
                </div>
                <Badge variant={member.role === 'owner' || member.role === 'admin' ? 'primary' : 'default'}>
                  {member.role}
                </Badge>
              </div>
            ))}
            {project.members.length === 0 && (
              <p className={styles.empty}>No members yet</p>
            )}
            {project.members.length > 8 && (
              <p className={styles.moreMembers}>
                +{project.members.length - 8} more members
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
