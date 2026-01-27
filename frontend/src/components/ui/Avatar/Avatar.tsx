import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 50%, 45%)`;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={[styles.avatar, styles[size], className ?? ''].join(' ')}
      title={name}
      aria-label={name}
      style={src ? undefined : { backgroundColor: hashColor(name) }}
    >
      {src ? (
        <img src={src} alt={name} className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </span>
  );
}
