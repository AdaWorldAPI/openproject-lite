import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../ui/Avatar';
import { Tooltip } from '../../ui/Tooltip';
import type { AuthUser } from '../../../hooks/useAuth';
import styles from './Header.module.css';

interface HeaderProps {
  user: AuthUser | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  themeName: string;
  unreadCount: number;
}

export function Header({ user, onToggleSidebar, onLogout, onToggleTheme, themeName, unreadCount }: HeaderProps) {
  const handleLogout = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onLogout();
    },
    [onLogout]
  );

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Link to="/" className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="var(--color-primary)" />
            <text x="5" y="17" fill="white" fontSize="14" fontWeight="bold">O</text>
          </svg>
          <span className={styles.logoText}>OpenProject</span>
        </Link>
      </div>

      <div className={styles.right}>
        <Tooltip content={`Switch to ${themeName === 'light' ? 'dark' : 'light'} mode`}>
          <button type="button" className={styles.iconBtn} onClick={onToggleTheme} aria-label="Toggle theme">
            {themeName === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Notifications">
          <Link to="/notifications" className={styles.iconBtn} aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>
        </Tooltip>

        {user && (
          <div className={styles.userMenu}>
            <Tooltip content={user.name}>
              <button type="button" className={styles.avatarBtn}>
                <Avatar name={user.name} size="sm" />
              </button>
            </Tooltip>
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <strong>{user.name}</strong>
                <span className={styles.email}>{user.email}</span>
              </div>
              <hr className={styles.divider} />
              <Link to="/settings" className={styles.dropdownItem}>Settings</Link>
              <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
