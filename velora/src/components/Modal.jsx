import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, children, wide = false, panelClass = '', labelledBy }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`modal__panel${wide ? ' modal__panel--wide' : ''}${panelClass ? ` ${panelClass}` : ''}`}>
        <button className="modal__close" onClick={onClose} aria-label="بستن">
          <X size={17} />
        </button>
        {children}
      </div>
    </div>
  );
}
