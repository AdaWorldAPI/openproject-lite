import { useEffect, useState } from 'react';
import { Spinner } from '../components/ui/Spinner';
import { ProjectList } from '../components/features/projects/ProjectList';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TextField } from '../components/ui/TextField';
import { listProjects, createProject, type ProjectWithRole } from '../api/projects';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function fetchProjects() {
    try {
      const data = await listProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await createProject({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <Button onClick={() => setShowCreate(true)}>+ Project</Button>
      </div>

      <ProjectList projects={projects} />

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className={styles.form}>
          <TextField
            label="Name"
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className={styles.textareaField}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Optional description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
