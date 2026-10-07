import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoCloseMs?: number;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  title = 'Data Berhasil Disimpan',
  message,
  autoCloseMs = 2800,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, autoCloseMs]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-sm w-full text-center border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title required: "Data Berhasil Disimpan" */}
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          {title}
        </h3>

        {/* Message / Description */}
        {message && (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
            {message}
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all active:scale-98"
          >
            OK / Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
