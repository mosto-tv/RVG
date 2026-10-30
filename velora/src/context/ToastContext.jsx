import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), type === 'error' ? 6500 : 4800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast__icon">
              {toast.type === 'success' ? (
                <CheckCircle2 size={17} />
              ) : toast.type === 'error' ? (
                <AlertTriangle size={17} />
              ) : (
                <Info size={17} />
              )}
            </span>
            <span>{toast.message}</span>
            <button className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
