import React from 'react';
import type { ReceiptData, ReceiptLanguage, ReceiptWidth } from '../types/pos';
import {
  containsArabic,
  formatCurrency,
  formatNumber,
  formatReceiptDate,
} from '../utils/formatters';

interface ReceiptPreviewProps {
  receipt: ReceiptData;
  widthOverride?: ReceiptWidth;
  languageOverride?: ReceiptLanguage;
}

const LABELS: Record<
  ReceiptLanguage,
  {
    date: string;
    receiptNo: string;
    product: string;
    qty: string;
    price: string;
    subtotal: string;
    discount: string;
    total: string;
    itemsCount: string;
  }
> = {
  en: {
    date: 'Date:',
    receiptNo: 'Receipt No:',
    product: 'Product',
    qty: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal:',
    discount: 'Discount:',
    total: 'TOTAL:',
    itemsCount: 'Items:',
  },
  ar: {
    date: 'التاريخ:',
    receiptNo: 'رقم الوصل:',
    product: 'المنتج',
    qty: 'الكمية',
    price: 'السعر',
    subtotal: 'المجموع الفرعي:',
    discount: 'الخصم:',
    total: 'المجموع:',
    itemsCount: 'القطع:',
  },
  bilingual: {
    date: 'Date / التاريخ:',
    receiptNo: 'Receipt No / رقم الوصل:',
    product: 'Product / المنتج',
    qty: 'Qty',
    price: 'Price / السعر',
    subtotal: 'Subtotal / الفرعي:',
    discount: 'Discount / الخصم:',
    total: 'TOTAL / المجموع:',
    itemsCount: 'Items / القطع:',
  },
};

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  receipt,
  widthOverride,
  languageOverride,
}) => {
  const width = widthOverride ?? receipt.settings.receiptWidth;
  const language = languageOverride ?? receipt.settings.receiptLanguage ?? 'bilingual';
  const labels = LABELS[language];
  const isRtl = language === 'ar';
  const isNarrow = width === '58mm';

  const totalUnits = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasDiscount = (receipt.discountAmount ?? 0) > 0;
  const formattedTime = (() => {
    const d = new Date(receipt.saleDate);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        width: isNarrow ? '58mm' : '80mm',
        maxWidth: '100%',
      }}
      className={`receipt-paper mx-auto bg-white text-black border border-slate-200 shadow-sm font-mono ${
        isNarrow ? 'p-3 text-[11px] leading-snug' : 'p-4 text-[12px] leading-normal'
      }`}
    >
      {/* Shop Header */}
      <div className="text-center pb-2.5 border-b border-dashed border-black/50">
        <div
          dir="auto"
          className={`font-bold tracking-wide uppercase break-words ${
            isNarrow ? 'text-[14px]' : 'text-[16px]'
          }`}
        >
          {receipt.settings.shopName}
        </div>
      </div>

      {/* Receipt Metadata */}
      <div className="py-2 space-y-1 border-b border-dashed border-black/50 tabular-nums">
        <div className="flex items-center justify-between gap-2">
          <span>{labels.date}</span>
          <span className="font-medium">
            {formatReceiptDate(receipt.saleDate)} {formattedTime}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>{labels.receiptNo}</span>
          <span className="font-bold">#{receipt.receiptNumber}</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-1 py-1.5 border-b border-dashed border-black/50 font-bold">
        <div className="col-span-6 text-start">{labels.product}</div>
        <div className="col-span-2 text-center">{labels.qty}</div>
        <div className="col-span-4 text-end">{labels.price}</div>
      </div>

      {/* Line Items */}
      <div className="py-1.5 space-y-2 border-b border-dashed border-black/50">
        {receipt.items.map((item, idx) => {
          const itemRtl = containsArabic(item.productName);
          return (
            <div key={`${item.barcode}-${idx}`} className="space-y-0.5">
              <div className="grid grid-cols-12 gap-1 items-start">
                <div
                  dir={itemRtl ? 'rtl' : 'ltr'}
                  className="col-span-6 break-words font-medium text-start"
                >
                  {item.productName}
                </div>
                <div className="col-span-2 text-center tabular-nums">{item.quantity}</div>
                <div className="col-span-4 text-end tabular-nums font-medium">
                  {formatNumber(item.subtotal)}
                </div>
              </div>
              {item.quantity > 1 && (
                <div className="text-[10px] text-black/70 tabular-nums">
                  @ {formatNumber(item.unitPrice)} {receipt.settings.currency}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals (Never includes buying cost or internal profit) */}
      <div className="py-2.5 space-y-1 border-b border-dashed border-black/50 tabular-nums">
        <div className="flex items-center justify-between text-[11px]">
          <span>{labels.itemsCount}</span>
          <span>{totalUnits}</span>
        </div>
        {hasDiscount && receipt.subtotalAmount !== undefined && (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <span>{labels.subtotal}</span>
              <span>{formatCurrency(receipt.subtotalAmount, receipt.settings.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>{labels.discount}</span>
              <span>-{formatCurrency(receipt.discountAmount ?? 0, receipt.settings.currency)}</span>
            </div>
          </>
        )}
        <div
          className={`flex items-center justify-between font-bold pt-1 ${
            isNarrow ? 'text-[14px]' : 'text-[16px]'
          }`}
        >
          <span>{labels.total}</span>
          <span>{formatCurrency(receipt.totalAmount, receipt.settings.currency)}</span>
        </div>
      </div>

      {/* Footer */}
      {receipt.settings.receiptFooter.trim() && (
        <div
          dir="auto"
          className="pt-3 pb-1 text-center font-medium tracking-wide break-words whitespace-pre-line"
        >
          {receipt.settings.receiptFooter}
        </div>
      )}
    </div>
  );
};
