import { useEffect, useRef } from 'react';

/** 12px champagne dot that expands into a labelled disc over media. */
export default function CursorDot() {
  const dot = useRef(null);

  useEffect(() => {
    const node = dot.current;
    if (!node) return undefined;
    let frame = 0;
    let target = { x: 0, y: 0 };

    const paint = () => {
      frame = 0;
      node.style.transform = `translate(${target.x}px, ${target.y}px) translate(-50%, -50%)`;
    };

    const onMove = (event) => {
      target = { x: event.clientX, y: event.clientY };
      node.classList.add('is-active');
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onOver = (event) => {
      const host = event.target.closest?.('[data-cursor]');
      const label = node.querySelector('.cursor-dot__label');
      if (host) {
        node.classList.add('is-expanded');
        if (label) label.textContent = host.getAttribute('data-cursor') || 'View';
      } else {
        node.classList.remove('is-expanded');
      }
    };

    const onLeave = () => node.classList.remove('is-active');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="cursor-dot" ref={dot} aria-hidden="true">
      <span className="cursor-dot__label" />
    </div>
  );
}
