import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for modals — traps Tab/Shift+Tab inside the modal
 * @param {boolean} isOpen - whether the modal is visible
 * @returns {React.RefObject} ref to attach to the modal container
 */
export default function useFocusTrap(isOpen) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus first element
    if (first) first.focus();

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        // Dispatch custom event — modal components should handle this
        el.dispatchEvent(new CustomEvent('modal-escape', { bubbles: true }));
      }
    };

    el.addEventListener('keydown', handler);
    el.addEventListener('keydown', escHandler);
    return () => {
      el.removeEventListener('keydown', handler);
      el.removeEventListener('keydown', escHandler);
    };
  }, [isOpen]);

  return ref;
}
