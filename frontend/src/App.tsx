import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { Spinner } from './components/ui/Spinner';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { listNotifications } from './api/notifications';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TaskListPage } from './pages/TaskListPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles/global.css';

function AppShell() {
  const { user, loading, login, register, logout } = useAuth();
  const { themeName, setThemeName } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleTheme = useCallback(() => {
    setThemeName(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName, setThemeName]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function fetchUnread() {
      try {
        const data = await listNotifications(true);
        if (!cancelled) setUnreadCount(data.unreadCount);
      } catch {
        // ignore
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterPage onRegister={register} />} />
        <Route path="*" element={<LoginPage onLogin={login} />} />
      </Routes>
    );
  }

  return (
    <>
      <Header
        user={user}
        onToggleSidebar={toggleSidebar}
        onLogout={logout}
        onToggleTheme={toggleTheme}
        themeName={themeName}
        unreadCount={unreadCount}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/projects/:projectId/*" element={<ProjectLayout collapsed={sidebarCollapsed} />} />
          <Route path="*" element={<GlobalLayout collapsed={sidebarCollapsed} />} />
        </Routes>
      </div>
    </>
  );
}

function GlobalLayout({ collapsed }: { collapsed: boolean }) {
  const { themeName, setThemeName } = useTheme();
  const toggleTheme = useCallback(() => {
    setThemeName(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName, setThemeName]);

  return (
    <>
      <Sidebar collapsed={collapsed} />
      <MainContent>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage themeName={themeName} onToggleTheme={toggleTheme} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainContent>
    </>
  );
}

function ProjectLayout({ collapsed }: { collapsed: boolean }) {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <>
      <Sidebar collapsed={collapsed} projectId={projectId} />
      <MainContent>
        <Routes>
          <Route path="/" element={<div>Project overview (coming soon)</div>} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/members" element={<div>Members (coming soon)</div>} />
          <Route path="/settings" element={<div>Project settings (coming soon)</div>} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </MainContent>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
