import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, styles[size], className ?? ''].join(' ')}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M12 2a10 10 0 019.8 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
