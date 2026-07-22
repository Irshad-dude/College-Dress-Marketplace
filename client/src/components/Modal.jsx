import { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';

export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };
  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="
        w-full max-w-lg rounded-2xl shadow-xl p-0 border-0
        backdrop:bg-black/50
        open:animate-[fadeIn_0.15s_ease-out]
        m-auto
      "
      style={{ maxHeight: '90vh', overflow: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <MdClose className="text-xl" />
        </button>
      </div>
      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
