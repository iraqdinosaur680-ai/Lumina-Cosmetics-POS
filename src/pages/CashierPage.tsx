import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  Minus,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  ScanBarcode,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { usePos } from '../context/PosContext';
import { useTranslation } from '../hooks/useTranslation';
import { interpolate } from '../i18n/translations';
import { normalizeBarcodeInput } from '../services/barcodeService';
import type { CartItem, ReceiptData } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { ProductFormModal } from '../components/ProductFormModal';
import { PrintPreviewModal } from '../components/PrintPreviewModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IqdPriceInput } from '../components/IqdPriceInput';

export const CashierPage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const allProducts = useLiveQuery(() => db.products.orderBy('name').toArray(), []) ?? [];
  const { t } = useTranslation();

  const {
    cart,
    totalItems,
    subtotal,
    finalAmount,
    feedback,
    setFeedback,
    lastCompletedSale,
    printFailureState,
    isCheckingOut,
    registerModalOpen,
    registerBarcode,
    openRegisterModal,
    closeRegisterModal,
    addProductToCart,
    updateQuantity,
    updateItemPrice,
    removeCartItem,
    clearCart,
    clearPrintFailureOnly,
    processScannedBarcode,
    buildReceiptFromSale,
    buildDraftReceipt,
    executePrint,
    handleCheckout,
    handleSaveNewProductFromUnknown,
  } = usePos();

  const [scannerValue, setScannerValue] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [editingPriceBarcode, setEditingPriceBarcode] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptData | null>(null);
  const [clearCartConfirmOpen, setClearCartConfirmOpen] = useState(false);

  const scannerInputRef = useRef<HTMLInputElement>(null);
  const quickSearchInputRef = useRef<HTMLInputElement>(null);

  const existingCategories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.category))).sort(),
    [allProducts]
  );

  const isAnyModalOpen =
    registerModalOpen || !!previewReceipt || clearCartConfirmOpen || editingPriceBarcode !== null;

  const focusScanner = useCallback(() => {
    if (isAnyModalOpen) return;
    requestAnimationFrame(() => {
      scannerInputRef.current?.focus();
    });
  }, [isAnyModalOpen]);

  // Auto-focus scanner input when landing on CashierPage and no modal is open
  useEffect(() => {
    if (!isAnyModalOpen) {
      focusScanner();
    }
  }, [isAnyModalOpen, focusScanner]);

  // F2 focuses scanner input anytime on CashierPage
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' && !isAnyModalOpen) {
        e.preventDefault();
        focusScanner();
      } else if (e.key === 'F9' && cart.length > 0 && !isAnyModalOpen) {
        e.preventDefault();
        void handleCheckout(settings.autoPrint);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cart.length, focusScanner, handleCheckout, isAnyModalOpen, settings.autoPrint]);

  const submitScannerInput = (raw: string) => {
    const cleaned = normalizeBarcodeInput(raw);
    if (!cleaned) return;
    setScannerValue('');
    void processScannedBarcode(cleaned);
  };

  const quickResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [allProducts, quickSearch]);

  const startPriceEdit = (item: CartItem) => {
    setEditingPriceBarcode(item.barcode);
    setEditingPriceValue(item.unitPrice);
  };

  const commitPriceEdit = (barcode: string) => {
    if (editingPriceValue !== null && Number.isFinite(editingPriceValue) && editingPriceValue >= 0) {
      updateItemPrice(barcode, editingPriceValue);
    }
    setEditingPriceBarcode(null);
    setEditingPriceValue(null);
    focusScanner();
  };

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Print Failure Recovery Banner (Cart preserved) */}
      {printFailureState && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">
                {interpolate(t.cashier.printFailedTitle, {
                  receiptNumber: printFailureState.saleWithItems.sale.receiptNumber,
                })}
              </p>
              <p className="text-red-700 text-xs mt-0.5">
                {t.cashier.printFailedSubtitle} {printFailureState.errorMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleCheckout(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.cashier.retryPrintBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                clearPrintFailureOnly();
                focusScanner();
              }}
              className="px-3.5 py-2 text-xs font-medium text-red-800 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              {t.cashier.clearCartOnlyBtn}
            </button>
          </div>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left/Center Column: Barcode Scanner + Quick Search + Cart Table */}
        <div className="col-span-8 flex flex-col gap-4 min-h-0">
          {/* Barcode Scanner Input Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-2.5">
              <label
                htmlFor="pos-barcode-scanner-input"
                className="text-xs font-semibold text-slate-700 flex items-center gap-2"
              >
                <ScanBarcode className="w-4 h-4 text-[#9D174D]" />
                {t.cashier.scannerTitle}
              </label>
              <span className="text-xs text-slate-500">{t.cashier.scannerHint}</span>
            </div>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <ScanBarcode className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={scannerInputRef}
                  id="pos-barcode-scanner-input"
                  type="text"
                  dir="ltr"
                  value={scannerValue}
                  onChange={(e) => setScannerValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      submitScannerInput(scannerValue);
                    } else if (e.key === 'Escape') {
                      setScannerValue('');
                    }
                  }}
                  placeholder={t.cashier.scannerPlaceholder}
                  autoComplete="off"
                  className="w-full ps-11 pe-4 py-3 text-base font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9D174D]/25 focus:border-[#9D174D] transition-colors text-start"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  submitScannerInput(scannerValue);
                  focusScanner();
                }}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                {t.cashier.addBarcodeBtn}
              </button>
            </div>

            {/* Scan Feedback Banner */}
            {feedback && (
              <div
                className={`mt-3 px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : feedback.type === 'unknown'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle
                      className={`w-4 h-4 shrink-0 ${
                        feedback.type === 'unknown' ? 'text-amber-600' : 'text-red-600'
                      }`}
                    />
                  )}
                  <span className="truncate font-medium">{feedback.message}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {feedback.type === 'unknown' && feedback.unknownBarcode && (
                    <button
                      type="button"
                      onClick={() => openRegisterModal(feedback.unknownBarcode ?? '')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#9D174D] rounded-md hover:bg-[#831843] transition-colors whitespace-nowrap"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      {t.cashier.registerProductBtn}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      focusScanner();
                    }}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded"
                    aria-label={t.common.dismiss}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Name Search */}
            <div className="mt-3 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={quickSearchInputRef}
                  type="text"
                  dir="auto"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setQuickSearch('');
                      focusScanner();
                    } else if (e.key === 'Enter' && quickResults.length > 0) {
                      e.preventDefault();
                      addProductToCart(quickResults[0]);
                      setQuickSearch('');
                      focusScanner();
                    }
                  }}
                  placeholder={t.cashier.quickSearchPlaceholder}
                  className="w-full ps-9 pe-8 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
                {quickSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSearch('');
                      focusScanner();
                    }}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={t.common.close}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {quickResults.length > 0 && (
                <div className="absolute start-0 end-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {quickResults.map((p) => (
                    <button
                      key={p.id ?? p.barcode}
                      type="button"
                      onClick={() => {
                        addProductToCart(p);
                        setQuickSearch('');
                        setFeedback({
                          type: 'success',
                          message: interpolate(t.cashier.addedMsg, {
                            name: p.name,
                            price: formatCurrency(p.price, settings.currency),
                          }),
                        });
                        focusScanner();
                      }}
                      className="w-full px-3.5 py-2.5 text-start hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="min-w-0">
                        <div dir="auto" className="text-sm font-medium text-slate-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          {p.barcode} · {p.category}
                        </div>
                      </div>
                      <span
                        dir="ltr"
                        className="text-sm font-semibold text-slate-900 font-mono tabular-nums whitespace-nowrap shrink-0"
                      >
                        {formatCurrency(p.price, settings.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shopping Cart Table */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-semibold text-slate-900">{t.cashier.activeCartTitle}</h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  · {cart.length}{' '}
                  {cart.length === 1 ? t.cashier.itemSingular : t.cashier.itemPlural}
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setClearCartConfirmOpen(true)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline whitespace-nowrap shrink-0"
                >
                  {t.cashier.clearCart}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <ScanBarcode className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-900">{t.cashier.readyTitle}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">{t.cashier.readySubtitle}</p>

                {lastCompletedSale && (
                  <div className="mt-5 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <div className="text-start text-xs">
                      <div className="font-semibold text-slate-900">
                        {t.cashier.lastSalePrefix} #{lastCompletedSale.sale.receiptNumber}
                      </div>
                      <div dir="ltr" className="text-slate-500 font-mono tabular-nums">
                        {formatCurrency(lastCompletedSale.sale.totalAmount, settings.currency)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewReceipt(buildReceiptFromSale(lastCompletedSale))}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {t.cashier.reprintReceipt}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-start border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 z-10">
                    <tr>
                      <th className="py-2.5 px-4 text-start">{t.cashier.colProduct}</th>
                      <th className="py-2.5 px-3 text-end">{t.cashier.colUnitPrice}</th>
                      <th className="py-2.5 px-3 text-center">{t.cashier.colQty}</th>
                      <th className="py-2.5 px-3 text-end">{t.cashier.colSubtotal}</th>
                      <th className="py-2.5 px-3 text-end w-12">
                        <span className="sr-only">{t.common.delete}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {cart.map((item) => {
                      const isEditingPrice = editingPriceBarcode === item.barcode;
                      return (
                        <tr
                          key={item.barcode}
                          className="hover:bg-slate-50/70 transition-colors align-top"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-md object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold shrink-0">
                                  {item.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div
                                  dir="auto"
                                  className="font-medium text-slate-900 truncate max-w-[240px]"
                                  title={item.name}
                                >
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono tabular-nums">
                                  {item.barcode}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Editable Unit Price */}
                          <td className="py-3 px-3 text-end font-mono tabular-nums">
                            {isEditingPrice ? (
                              <div className="inline-flex flex-col items-end gap-1">
                                <div className="flex items-start gap-1">
                                  <IqdPriceInput
                                    compact
                                    autoFocus
                                    selectAllOnFocus
                                    value={editingPriceValue}
                                    onChange={setEditingPriceValue}
                                    onEnter={() => commitPriceEdit(item.barcode)}
                                    onEscape={() => {
                                      setEditingPriceBarcode(null);
                                      setEditingPriceValue(null);
                                      focusScanner();
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => commitPriceEdit(item.barcode)}
                                    className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                                    aria-label={t.common.save}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startPriceEdit(item)}
                                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#9D174D] group"
                                title={t.cashier.editPriceTitle}
                              >
                                <span dir="ltr">
                                  {formatCurrency(item.unitPrice, settings.currency)}
                                </span>
                                <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </td>

                          {/* Quantity Stepper */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1" dir="ltr">
                              <button
                                type="button"
                                onClick={() => {
                                  updateQuantity(item.barcode, item.quantity - 1);
                                  if (item.quantity <= 1) focusScanner();
                                }}
                                className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!Number.isNaN(val) && val >= 1) {
                                    updateQuantity(item.barcode, val);
                                  }
                                }}
                                className="w-12 h-7 text-center text-xs font-mono font-semibold tabular-nums border border-slate-200 rounded-md focus:outline-none focus:border-[#9D174D]"
                                aria-label={`Quantity for ${item.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.barcode, item.quantity + 1)}
                                className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Line Subtotal */}
                          <td
                            dir="ltr"
                            className="py-3 px-3 text-end font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap"
                          >
                            {formatCurrency(item.subtotal, settings.currency)}
                          </td>

                          {/* Remove */}
                          <td className="py-3 px-3 text-end">
                            <button
                              type="button"
                              onClick={() => {
                                removeCartItem(item.barcode);
                                focusScanner();
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              aria-label={`${t.common.delete} ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Totals & Checkout */}
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-5">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.cashier.checkoutSummary}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.cashier.thermalFormat}: <span dir="ltr">{settings.receiptWidth}</span> ·{' '}
                  {settings.currency}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-sm tabular-nums">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t.cashier.totalUnits}</span>
                  <span className="font-mono font-semibold text-slate-900">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t.cashier.distinctProducts}</span>
                  <span className="font-mono font-semibold text-slate-900">{cart.length}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t.cashier.subtotal}</span>
                  <span dir="ltr" className="font-mono font-semibold text-slate-900">
                    {formatCurrency(subtotal, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Prominent Final Total */}
              <div className="p-5 rounded-xl bg-slate-900 text-white">
                <div className="text-xs font-medium text-slate-300">{t.cashier.finalTotal}</div>
                <div
                  dir="ltr"
                  className="mt-1.5 text-3xl font-bold font-mono tabular-nums tracking-tight text-start"
                >
                  {formatCurrency(finalAmount, settings.currency)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                disabled={cart.length === 0 || isCheckingOut}
                onClick={() => void handleCheckout(true)}
                className="w-full py-4 px-5 rounded-xl bg-[#9D174D] hover:bg-[#831843] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" />
                <span>
                  {isCheckingOut ? t.cashier.processingSale : t.cashier.checkoutAndPrintBtn}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={cart.length === 0 || isCheckingOut}
                  onClick={() => void handleCheckout(false)}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap"
                >
                  {t.cashier.saveWithoutPrint}
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setPreviewReceipt(buildDraftReceipt())}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {t.cashier.previewReceipt}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">{t.cashier.shortcutHint}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Register Unknown Product Modal */}
      <ProductFormModal
        isOpen={registerModalOpen}
        initialBarcode={registerBarcode}
        existingCategories={existingCategories}
        onClose={() => {
          closeRegisterModal();
          focusScanner();
        }}
        onSave={handleSaveNewProductFromUnknown}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        receipt={previewReceipt}
        onClose={() => {
          setPreviewReceipt(null);
          focusScanner();
        }}
        onPrint={executePrint}
      />

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        isOpen={clearCartConfirmOpen}
        title={t.cashier.clearCartModalTitle}
        message={t.cashier.clearCartModalMsg}
        confirmLabel={t.cashier.clearCart}
        destructive
        onConfirm={() => {
          clearCart();
          setClearCartConfirmOpen(false);
          focusScanner();
        }}
        onCancel={() => {
          setClearCartConfirmOpen(false);
          focusScanner();
        }}
      />
    </div>
  );
};
