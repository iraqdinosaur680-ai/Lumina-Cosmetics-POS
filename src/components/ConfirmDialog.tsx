import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              destructive ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {cancelLabel ?? t.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#9D174D] hover:bg-[#831843]'
            }`}
          >
            {confirmLabel ?? t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
