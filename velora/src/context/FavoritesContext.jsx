import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const { push } = useToast();
  const [ids, setIds] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    api
      .get('/favorites')
      .then((data) => setIds(data.ids || []))
      .catch(() => setIds([]));
  }, [user]);

  const toggle = useCallback(
    async (propertyId) => {
      if (!user) {
        push('Sign in to keep a private wishlist of residences.', 'info');
        return false;
      }
      if (busy) return false;
      setBusy(true);
      try {
        if (ids.includes(propertyId)) {
          const data = await api.del(`/favorites/${propertyId}`);
          setIds(data.ids || []);
          push('Removed from your saved residences.', 'info');
        } else {
          const data = await api.post('/favorites', { propertyId });
          setIds(data.ids || []);
          push('Saved to your private collection.', 'success');
        }
        return true;
      } catch (err) {
        push(err.message, 'error');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [user, ids, busy, push],
  );

  const value = useMemo(
    () => ({ ids, isSaved: (id) => ids.includes(id), toggle, count: ids.length }),
    [ids, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
};
