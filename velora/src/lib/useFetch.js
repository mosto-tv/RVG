import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/** Small data hook with loading/error state and a manual refetch. */
export const useFetch = (path, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const pathRef = useRef(path);
  pathRef.current = path;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.get(pathRef.current);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err });
    }
  }, []);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api
      .get(pathRef.current)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err) => active && setState({ data: null, loading: false, error: err }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: load };
};
