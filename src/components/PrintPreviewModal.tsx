import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import type { ReceiptData, ReceiptWidth } from '../types/pos';
import { ReceiptPreview } from './ReceiptPreview';
import { useTranslation } from '../hooks/useTranslation';

interface PrintPreviewModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
  onPrint: (receipt: ReceiptData) => Promise<void>;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  receipt,
  onClose,
  onPrint,
}) => {
  const { t } = useTranslation();
  const [previewWidth, setPreviewWidth] = useState<ReceiptWidth>(
    receipt?.settings.receiptWidth ?? '80mm'
  );
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!receipt) return null;

  const activeReceipt: ReceiptData = {
    ...receipt,
    settings: {
      ...receipt.settings,
      receiptWidth: previewWidth,
    },
  };

  const handlePrint = async () => {
    setPrinting(true);
    setError(null);
    try {
      await onPrint(activeReceipt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to print receipt.');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 id="print-preview-title" className="text-base font-semibold text-slate-900">
              {t.settings.previewModalTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums font-mono">
              #{receipt.receiptNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper width selector */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-medium text-slate-600">{t.settings.paperWidthLabel}</span>
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg" dir="ltr">
            {(['58mm', '80mm'] as ReceiptWidth[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setPreviewWidth(w)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  previewWidth === w
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Preview canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center items-start">
          <ReceiptPreview receipt={activeReceipt} widthOverride={previewWidth} />
        </div>

        {error && (
          <div className="px-5 py-2.5 bg-red-50 border-t border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {t.common.close}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printing}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            {printing ? t.settings.preparingPrint : t.settings.printReceiptBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
