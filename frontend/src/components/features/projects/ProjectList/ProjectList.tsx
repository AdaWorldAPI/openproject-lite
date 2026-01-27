import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import type { ProjectWithRole } from '../../../../api/projects';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  projects: readonly ProjectWithRole[];
}

const ROLE_VARIANTS: Record<string, 'primary' | 'default'> = {
  owner: 'primary',
  admin: 'primary',
  member: 'default',
  viewer: 'default',
};

export function ProjectList({ projects }: ProjectListProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <article
          key={project.id}
          className={styles.card}
          onClick={() => navigate(`/projects/${project.id}`)}
          tabIndex={0}
          role="button"
        >
          <div className={styles.top}>
            <h3 className={styles.name}>{project.name}</h3>
            <Badge variant={ROLE_VARIANTS[project.role] ?? 'default'}>{project.role}</Badge>
          </div>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
          <div className={styles.meta}>
            <time className={styles.date}>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </time>
          </div>
        </article>
      ))}
      {projects.length === 0 && (
        <p className={styles.empty}>No projects yet. Create one to get started.</p>
      )}
    </div>
  );
}
