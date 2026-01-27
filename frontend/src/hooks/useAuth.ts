import { useState, useCallback, useEffect } from 'react';
import { api, parseError } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseUser(data: any): AuthUser | null {
  // HAL format: { _type: "User", id, name, email, _links: {...} }
  if (data._type === 'User') {
    return { id: data.id, email: data.email, name: data.name };
  }
  // HAL anonymous: { _type: "Anonymous" }
  if (data._type === 'Anonymous') {
    return null;
  }
  // Legacy format: { user: { id, email, name } }
  if (data.user) {
    return data.user;
  }
  // Direct user object
  if (data.id && data.email) {
    return { id: data.id, email: data.email, name: data.name };
  }
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(parseUser(data));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (!res.ok) {
      throw new Error(await parseError(res, 'Login failed'));
    }
    const data = await res.json();
    const parsed = parseUser(data);
    setUser(parsed);
    return parsed;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name });
    if (!res.ok) {
      throw new Error(await parseError(res, 'Registration failed'));
    }
    const data = await res.json();
    const parsed = parseUser(data);
    setUser(parsed);
    return parsed;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {});
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, refetch: fetchUser };
}
