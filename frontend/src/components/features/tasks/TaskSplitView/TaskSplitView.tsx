import { useState, useCallback } from 'react';

import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';
import { Select, type SelectOption } from '../../../ui/Select';
import type { TaskDetail, TaskStatus, TaskPriority } from '../../../../api/tasks';
import { updateTask, addComment } from '../../../../api/tasks';
import styles from './TaskSplitView.module.css';

interface TaskSplitViewProps {
  task: TaskDetail;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions: SelectOption[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TaskSplitView({ task, onClose, onUpdate }: TaskSplitViewProps) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateTask(task.id, { status: e.target.value as TaskStatus });
    onUpdate();
  }, [task.id, onUpdate]);

  const handlePriorityChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateTask(task.id, { priority: e.target.value as TaskPriority });
    onUpdate();
  }, [task.id, onUpdate]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(task.id, commentText.trim());
      setCommentText('');
      onUpdate();
    } finally {
      setSubmitting(false);
    }
  }, [task.id, commentText, submitting, onUpdate]);

  return (
    <aside className={styles.panel} aria-label="Task detail">
      <header className={styles.header}>
        <h2 className={styles.title}>{task.title}</h2>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className={styles.body}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Status</label>
            <Select options={statusOptions} value={task.status} onChange={handleStatusChange} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Priority</label>
            <Select options={priorityOptions} value={task.priority} onChange={handlePriorityChange} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Assignee</label>
            <div className={styles.fieldValue}>
              {task.assigneeName ? (
                <span className={styles.assignee}>
                  <Avatar name={task.assigneeName} size="sm" />
                  {task.assigneeName}
                </span>
              ) : (
                <span className={styles.muted}>Unassigned</span>
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Created by</label>
            <div className={styles.fieldValue}>
              <span className={styles.assignee}>
                <Avatar name={task.creatorName} size="sm" />
                {task.creatorName}
              </span>
            </div>
          </div>
          {task.dueDate && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Due date</label>
              <div className={styles.fieldValue}>{new Date(task.dueDate).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {task.description && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{task.description}</p>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Activity</h3>
          <div className={styles.comments}>
            {task.comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <Avatar name={comment.authorName} size="sm" />
                <div className={styles.commentContent}>
                  <div className={styles.commentMeta}>
                    <strong>{comment.authorName}</strong>
                    <time className={styles.muted}>{new Date(comment.createdAt).toLocaleString()}</time>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
            {task.comments.length === 0 && (
              <p className={styles.muted}>No activity yet.</p>
            )}
          </div>

          <form className={styles.commentForm} onSubmit={handleAddComment}>
            <textarea
              className={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <Button type="submit" size="sm" loading={submitting} disabled={!commentText.trim()}>
              Comment
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
