import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

export default function Lightbox({ images = [], index = 0, onClose }) {
  const [current, setCurrent] = useState(index);

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + images.length) % images.length), [images.length]);

  useEffect(() => setCurrent(index), [index]);

  useEffect(() => {
    document.body.classList.add('is-locked');
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [onClose, next, prev]);

  if (!images.length) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image gallery">
      <div className="lightbox__bar">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Expand size={13} /> {current + 1} / {images.length}
        </span>
        <button onClick={onClose} aria-label="Close gallery">
          <X size={18} />
        </button>
      </div>

      <div className="lightbox__stage">
        <button className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous image">
          <ChevronLeft size={20} />
        </button>
        <img key={images[current]} src={images[current]} alt={`Gallery image ${current + 1}`} />
        <button className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next image">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="lightbox__thumbs">
        {images.map((src, position) => (
          <button
            key={src + position}
            className={position === current ? 'is-active' : ''}
            onClick={() => setCurrent(position)}
            aria-label={`Show image ${position + 1}`}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
