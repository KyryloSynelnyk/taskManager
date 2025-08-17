import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  zIndex?: number;
}

export function Modal({ open, onClose, title, children, zIndex = 50 }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      aria-modal
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={clsx('relative z-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl')}>
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
