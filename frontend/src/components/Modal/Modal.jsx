import { useEffect } from 'react';
import s from './Modal.module.css';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`${s.overlay} ${isOpen ? s.active : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.modal}>
        <button className={s.closeBtn} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
