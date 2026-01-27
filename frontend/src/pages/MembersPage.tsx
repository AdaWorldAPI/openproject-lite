import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { TextField } from '../components/ui/TextField';
import { Select, type SelectOption } from '../components/ui/Select';
import {
  getProject,
  addMember,
  removeMember,
  type ProjectDetail,
} from '../api/projects';
import styles from './MembersPage.module.css';

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_VARIANT: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  owner: 'primary',
  admin: 'primary',
  member: 'default',
  viewer: 'default',
};

export function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<(ProjectDetail & { role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await getProject(projectId);
      setProject(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !projectId) return;

    setAdding(true);
    setError('');
    try {
      await addMember(projectId, { email: addEmail.trim(), role: addRole });
      setAddEmail('');
      setAddRole('member');
      setShowAdd(false);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    setRemovingId(userId);
    try {
      await removeMember(projectId, userId);
      fetchProject();
    } catch (err) {
      // Ignore — member may have already been removed
    } finally {
      setRemovingId(null);
    }
  };

  const isAdmin = project?.role === 'owner' || project?.role === 'admin';

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
        <h1 className={styles.title}>Members</h1>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)}>+ Add member</Button>
        )}
      </div>

      <div className={styles.memberTable}>
        <div className={styles.tableHeader}>
          <span className={styles.colUser}>User</span>
          <span className={styles.colRole}>Role</span>
          <span className={styles.colJoined}>Joined</span>
          {isAdmin && <span className={styles.colActions}>Actions</span>}
        </div>
        {project.members.map((member) => (
          <div key={member.userId} className={styles.tableRow}>
            <div className={styles.colUser}>
              <Avatar name={member.userName} size="md" />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{member.userName}</span>
                <span className={styles.userEmail}>{member.userEmail}</span>
              </div>
            </div>
            <div className={styles.colRole}>
              <Badge variant={ROLE_VARIANT[member.role] ?? 'default'}>
                {member.role}
              </Badge>
            </div>
            <div className={styles.colJoined}>
              <span className={styles.dateText}>
                {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
              </span>
            </div>
            {isAdmin && (
              <div className={styles.colActions}>
                {member.role !== 'owner' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveMember(member.userId)}
                    loading={removingId === member.userId}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        {project.members.length === 0 && (
          <div className={styles.empty}>No members in this project yet.</div>
        )}
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAddMember} loading={adding}>Add</Button>
          </>
        }
      >
        <form onSubmit={handleAddMember} className={styles.form}>
          <TextField
            label="Email address"
            placeholder="member@example.com"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            autoFocus
          />
          <Select
            label="Role"
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
