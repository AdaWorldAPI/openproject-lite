import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';
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
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // ignore - user might not have notifications yet
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
        <Sidebar collapsed={sidebarCollapsed} />
        <MainContent>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<DashboardPage />} />
            <Route path="/projects/:projectId" element={<DashboardPage />} />
            <Route path="/projects/:projectId/tasks" element={<TaskListPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage themeName={themeName} onToggleTheme={toggleTheme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </div>
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
