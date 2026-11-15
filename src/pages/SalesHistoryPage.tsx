import React, { useMemo, useState } from 'react';
import { Calendar, Eye, Printer, Receipt, Search, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { usePos } from '../context/PosContext';
import { useTranslation } from '../hooks/useTranslation';
import { printService } from '../services/printService';
import type { DateFilterPreset, ReceiptData, SaleWithItems } from '../types/pos';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { PrintPreviewModal } from '../components/PrintPreviewModal';

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const SalesHistoryPage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const { setPrintReceipt } = usePos();
  const { t } = useTranslation();

  const salesWithItems = useLiveQuery(async (): Promise<SaleWithItems[]> => {
    const [sales, allItems] = await Promise.all([
      db.sales.orderBy('saleDate').reverse().toArray(),
      db.saleItems.toArray(),
    ]);
    const map = new Map<number, typeof allItems>();
    for (const item of allItems) {
      const list = map.get(item.saleId) ?? [];
      list.push(item);
      map.set(item.saleId, list);
    }
    return sales.map((sale) => ({
      sale,
      items: sale.id !== undefined ? map.get(sale.id) ?? [] : [],
    }));
  }, []) ?? [];

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('today');
  const [customDate, setCustomDate] = useState(() => getLocalDateKey(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptData | null>(null);

  const todayKey = getLocalDateKey(new Date());
  const yesterdayKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateKey(d);
  })();

  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return salesWithItems.filter(({ sale, items }) => {
      const saleDateObj = new Date(sale.saleDate);
      const saleKey = getLocalDateKey(saleDateObj);

      if (datePreset === 'today' && saleKey !== todayKey) return false;
      if (datePreset === 'yesterday' && saleKey !== yesterdayKey) return false;
      if (datePreset === 'week' && now - saleDateObj.getTime() > sevenDaysMs) return false;
      if (datePreset === 'month' && now - saleDateObj.getTime() > thirtyDaysMs) return false;
      if (datePreset === 'custom' && customDate && saleKey !== customDate) return false;

      if (!q) return true;
      const matchesReceipt = sale.receiptNumber.toLowerCase().includes(q);
      const matchesStaff = (sale.staffNameSnapshot ?? '').toLowerCase().includes(q);
      const matchesItems = items.some(
        (item) =>
          item.productNameSnapshot.toLowerCase().includes(q) ||
          item.barcodeSnapshot.toLowerCase().includes(q)
      );
      return matchesReceipt || matchesStaff || matchesItems;
    });
  }, [salesWithItems, datePreset, customDate, searchQuery, todayKey, yesterdayKey]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, entry) => sum + entry.sale.totalAmount, 0);
    const transactionCount = filteredSales.length;
    const totalUnits = filteredSales.reduce(
      (sum, entry) => sum + entry.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
    const todayRevenue = salesWithItems
      .filter((entry) => getLocalDateKey(new Date(entry.sale.saleDate)) === todayKey)
      .reduce((sum, entry) => sum + entry.sale.totalAmount, 0);

    return {
      totalRevenue,
      transactionCount,
      totalUnits,
      averageSale: transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0,
      todayRevenue,
    };
  }, [filteredSales, salesWithItems, todayKey]);

  const toReceiptData = (entry: SaleWithItems): ReceiptData => ({
    receiptNumber: entry.sale.receiptNumber,
    saleDate: entry.sale.saleDate,
    subtotalAmount: entry.sale.subtotalAmount,
    discountAmount: entry.sale.discountAmount,
    totalAmount: entry.sale.totalAmount,
    items: entry.items.map((item) => ({
      productName: item.productNameSnapshot,
      barcode: item.barcodeSnapshot,
      unitPrice: item.unitPriceSnapshot,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    settings,
  });

  const handlePrint = async (receipt: ReceiptData) => {
    setPrintReceipt(receipt);
    await printService.print(receipt);
  };

  return (
    <div className="space-y-5 max-w-[1360px] mx-auto">
      {/* Daily Sales Summary Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{t.history.filteredTotal}</div>
          <div
            dir="ltr"
            className="mt-1.5 text-xl font-bold font-mono tabular-nums text-slate-900 text-start"
          >
            {formatCurrency(metrics.totalRevenue, settings.currency)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{t.history.todayTotal}</div>
          <div
            dir="ltr"
            className="mt-1.5 text-xl font-bold font-mono tabular-nums text-[#9D174D] text-start"
          >
            {formatCurrency(metrics.todayRevenue, settings.currency)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{t.history.receiptsIssued}</div>
          <div className="mt-1.5 text-xl font-bold font-mono tabular-nums text-slate-900">
            {metrics.transactionCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{t.history.averageBasket}</div>
          <div
            dir="ltr"
            className="mt-1.5 text-xl font-bold font-mono tabular-nums text-slate-900 text-start"
          >
            {formatCurrency(metrics.averageSale, settings.currency)}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'today', label: t.history.presetToday },
                { id: 'yesterday', label: t.history.presetYesterday },
                { id: 'week', label: t.history.presetWeek },
                { id: 'month', label: t.stats.presetMonth },
                { id: 'all', label: t.history.presetAll },
                { id: 'custom', label: t.history.presetCustom },
              ] as Array<{ id: DateFilterPreset; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDatePreset(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  datePreset === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute start-3 pointer-events-none" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="ps-8 pe-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#9D174D]"
              />
            </div>
          )}
        </div>

        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            dir="auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full ps-10 pe-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{t.history.emptyTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.history.emptySubtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-5 text-start">{t.history.colReceiptNo}</th>
                  <th className="py-3 px-4 text-start">{t.history.colDateTime}</th>
                  <th className="py-3 px-4 text-start">{t.history.colSoldBy}</th>
                  <th className="py-3 px-4 text-start">{t.history.colItems}</th>
                  <th className="py-3 px-4 text-end">{t.history.colTotal}</th>
                  <th className="py-3 px-5 text-end">{t.history.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.map((entry) => {
                  const unitsCount = entry.items.reduce((sum, i) => sum + i.quantity, 0);
                  const previewNames = entry.items
                    .slice(0, 2)
                    .map((i) => `${i.productNameSnapshot} ×${i.quantity}`)
                    .join(', ');
                  const extraCount = entry.items.length - 2;

                  return (
                    <tr key={entry.sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5 font-mono font-semibold text-slate-900 tabular-nums">
                        #{entry.sale.receiptNumber}
                      </td>
                      <td
                        dir="ltr"
                        className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap text-start"
                      >
                        {formatDateTime(entry.sale.saleDate)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">
                        {entry.sale.staffNameSnapshot ? (
                          <span dir="auto" className="font-medium text-slate-800">
                            {entry.sale.staffId ? `#${entry.sale.staffId} · ` : ''}
                            {entry.sale.staffNameSnapshot}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-medium text-slate-800 shrink-0 tabular-nums">
                            {unitsCount}{' '}
                            {unitsCount === 1 ? t.history.unitSingular : t.history.unitPlural}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span dir="auto" className="text-xs text-slate-500 truncate max-w-md">
                            {previewNames}
                            {extraCount > 0 ? ` (+${extraCount} ${t.history.moreSuffix})` : ''}
                          </span>
                        </div>
                      </td>
                      <td
                        dir="ltr"
                        className="py-3 px-4 text-end font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap"
                      >
                        {formatCurrency(entry.sale.totalAmount, settings.currency)}
                      </td>
                      <td className="py-3 px-5 text-end">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSale(entry)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t.history.detailsBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewReceipt(toReceiptData(entry))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#9D174D] bg-[#9D174D]/5 border border-[#9D174D]/20 rounded-lg hover:bg-[#9D174D]/10 transition-colors whitespace-nowrap"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {t.history.reprintBtn}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sale-detail-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 id="sale-detail-title" className="text-base font-semibold text-slate-900 font-mono">
                  {t.history.receiptTitlePrefix} #{selectedSale.sale.receiptNumber}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span dir="ltr" className="font-mono tabular-nums">
                    {formatDateTime(selectedSale.sale.saleDate)}
                  </span>
                  {selectedSale.sale.staffNameSnapshot && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span dir="auto" className="font-medium text-slate-700">
                        {t.history.colSoldBy}:{' '}
                        {selectedSale.sale.staffId ? `#${selectedSale.sale.staffId} ` : ''}
                        {selectedSale.sale.staffNameSnapshot}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-start border-collapse text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-2 pe-4 text-start">{t.history.colProductSnapshot}</th>
                    <th className="py-2 px-3 text-end">{t.history.colUnitPrice}</th>
                    <th className="py-2 px-3 text-center">{t.history.colQty}</th>
                    <th className="py-2 ps-3 text-end">{t.history.colSubtotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pe-4">
                        <div dir="auto" className="font-medium text-slate-900">
                          {item.productNameSnapshot}
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          {item.barcodeSnapshot}
                        </div>
                      </td>
                      <td dir="ltr" className="py-3 px-3 text-end font-mono tabular-nums text-slate-700">
                        {formatCurrency(item.unitPriceSnapshot, settings.currency)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {item.quantity}
                      </td>
                      <td
                        dir="ltr"
                        className="py-3 ps-3 text-end font-mono font-semibold tabular-nums text-slate-900"
                      >
                        {formatCurrency(item.subtotal, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-slate-500">{t.history.totalAmount}</span>
                  <div dir="ltr" className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(selectedSale.sale.totalAmount, settings.currency)}
                  </div>
                </div>
                {(selectedSale.sale.discountAmount ?? 0) > 0 && (
                  <div>
                    <span className="text-xs text-emerald-700">{t.history.discountApplied}</span>
                    <div dir="ltr" className="text-sm font-semibold font-mono tabular-nums text-emerald-700">
                      -{formatCurrency(selectedSale.sale.discountAmount ?? 0, settings.currency)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {t.common.close}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const data = toReceiptData(selectedSale);
                    setSelectedSale(null);
                    setPreviewReceipt(data);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843]"
                >
                  <Printer className="w-4 h-4" />
                  {t.cashier.reprintReceipt}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reprint Preview Modal */}
      <PrintPreviewModal
        receipt={previewReceipt}
        onClose={() => setPreviewReceipt(null)}
        onPrint={handlePrint}
      />
    </div>
  );
};
