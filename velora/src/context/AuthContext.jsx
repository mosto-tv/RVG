import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (payload) => {
    const data = await api.post('/auth/signin', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (payload) => {
    const data = await api.post('/auth/signup', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    await api.post('/auth/signout');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await api.patch('/auth/me', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, updateProfile, refresh }),
    [user, loading, signIn, signUp, signOut, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
