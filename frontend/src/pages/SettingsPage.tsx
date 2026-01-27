import { Switch } from '../components/ui/Switch';
import styles from './SettingsPage.module.css';

interface SettingsPageProps {
  themeName: string;
  onToggleTheme: () => void;
}

export function SettingsPage({ themeName, onToggleTheme }: SettingsPageProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <div className={styles.option}>
          <Switch
            label="Dark mode"
            checked={themeName === 'dark'}
            onChange={onToggleTheme}
          />
        </div>
      </section>
    </div>
  );
}
