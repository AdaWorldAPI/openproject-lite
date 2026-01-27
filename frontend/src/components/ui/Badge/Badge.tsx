import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], className ?? ''].join(' ')}>
      {children}
    </span>
  );
}
