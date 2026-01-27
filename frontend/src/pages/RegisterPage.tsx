import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TextField } from '../components/ui/TextField';
import { Button } from '../components/ui/Button';
import styles from './AuthPage.module.css';

interface RegisterPageProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRegister(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [name, email, password, onRegister]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="var(--color-primary)" />
            <text x="8" y="28" fill="white" fontSize="22" fontWeight="bold">OP</text>
          </svg>
          <h1 className={styles.title}>Create account</h1>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint="At least 8 characters"
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={loading}>
            Create account
          </Button>
        </form>
        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
