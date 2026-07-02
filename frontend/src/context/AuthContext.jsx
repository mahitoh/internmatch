import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { setPersist, setToken, getToken, clearTokens } from '../lib/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch (err) {
      // Only wipe the session on a genuine auth failure (401 after refresh also
      // failed). Network errors, 429s, and 5xx should not log the user out.
      if (err?.response?.status === 401) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // `remember` (default true) picks where tokens live: localStorage when the user
  // wants to stay signed in across browser restarts, sessionStorage otherwise.
  const login = async (email, password, remember = true) => {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken, role } = res.data;
    setPersist(remember);
    setToken('accessToken', accessToken);
    setToken('refreshToken', refreshToken);
    const meRes = await authApi.me();
    setUser(meRes.data.data);
    return role;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
