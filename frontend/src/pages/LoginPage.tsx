import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TextField } from '../components/ui/TextField';
import { Button } from '../components/ui/Button';
import styles from './AuthPage.module.css';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, onLogin]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="var(--color-primary)" />
            <text x="8" y="28" fill="white" fontSize="22" fontWeight="bold">OP</text>
          </svg>
          <h1 className={styles.title}>OpenProject</h1>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}
