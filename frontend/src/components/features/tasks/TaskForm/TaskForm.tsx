import { useState, useCallback } from 'react';
import { Button } from '../../../ui/Button';
import { TextField } from '../../../ui/TextField';
import { Select, type SelectOption } from '../../../ui/Select';
import { Modal } from '../../../ui/Modal';
import { createTask, type TaskStatus, type TaskPriority } from '../../../../api/tasks';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onCreated: () => void;
}

const statusOptions: SelectOption[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TaskForm({ open, onClose, projectId, onCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createTask({
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      });
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  }, [title, description, status, priority, projectId, onCreated, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New work package"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={submitting}>Create</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          label="Subject"
          placeholder="Enter subject..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error && !title.trim() ? error : undefined}
          autoFocus
        />
        <div className={styles.row}>
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>
        <div className={styles.textareaField}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        {error && title.trim() && <p className={styles.error}>{error}</p>}
      </form>
    </Modal>
  );
}
