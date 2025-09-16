import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Lightweight global tooltip renderer for any element with data-tooltip or title
// - If an element has a title attribute, we temporarily move it to data-tooltip to avoid native browser tooltip
// - Position follows mouse with viewport clamping

const GlobalTooltipLayer: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const restoreTitle = useRef<{ el: HTMLElement | null; title: string | null }>({ el: null, title: null });

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = (t.closest('[data-tooltip], [title]') as HTMLElement) || null;
      if (!el) return;

      let tip = el.getAttribute('data-tooltip');
      if (!tip) {
        const title = el.getAttribute('title');
        if (title) {
          tip = title;
          // Temporarily remove title to disable native tooltip; restore on out
          restoreTitle.current = { el, title };
          el.setAttribute('data-tooltip', title);
          el.removeAttribute('title');
        }
      }
      if (!tip) return;

      setText(tip);
      setVisible(true);
      setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    };

    const onMove = (e: MouseEvent) => {
      if (!visible) return;
      setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    };

    const onOut = (e: MouseEvent) => {
      // Restore title if we removed it
      if (restoreTitle.current.el) {
        const { el, title } = restoreTitle.current;
        if (el && title !== null) {
          el.setAttribute('title', title);
          el.removeAttribute('data-tooltip');
        }
        restoreTitle.current = { el: null, title: null };
      }
      setVisible(false);
      setText('');
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onOut);
    };
  }, [visible]);

  if (!visible || !text) return null;

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(window.innerWidth - 240, Math.max(8, pos.x)),
    top: Math.min(window.innerHeight - 48, Math.max(8, pos.y)),
    zIndex: 60_000,
  };

  const node = (
    <div style={style} className="pointer-events-none select-none">
      <div className="px-2.5 py-1.5 rounded bg-slate-800 text-white text-xs shadow-lg border border-slate-700">
        {text}
      </div>
    </div>
  );

  const portalRoot = document.body;
  return createPortal(node, portalRoot);
};

export default GlobalTooltipLayer;

