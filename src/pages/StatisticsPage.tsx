import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import {
  expenseRepo,
  getEffectiveReorderPoint,
  isProductBelowReorderPoint,
} from '../database/repositories';
import { usePos } from '../context/PosContext';
import { useTranslation } from '../hooks/useTranslation';
import { interpolate } from '../i18n/translations';
import type { DateFilterPreset, Expense } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { IqdPriceInput } from '../components/IqdPriceInput';
import { ConfirmDialog } from '../components/ConfirmDialog';

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Delivery',
  'Packaging',
  'Salaries',
  'Supplies',
  'Damaged Goods',
  'Other',
];

export const StatisticsPage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const products = useLiveQuery(() => db.products.toArray(), []) ?? [];
  const sales = useLiveQuery(() => db.sales.orderBy('saleDate').reverse().toArray(), []) ?? [];
  const saleItems = useLiveQuery(() => db.saleItems.toArray(), []) ?? [];
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), []) ?? [];

  const { activeStaff } = usePos();
  const { t } = useTranslation();

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('month');
  const [customDate, setCustomDate] = useState(() => getLocalDateKey(new Date()));

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | null>(null);
  const [expenseCategory, setExpenseCategory] = useState('Other');
  const [expenseDate, setExpenseDate] = useState(() => getLocalDateKey(new Date()));
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseToast, setExpenseToast] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const todayKey = getLocalDateKey(new Date());
  const yesterdayKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateKey(d);
  }, []);

  const matchesPeriod = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return (isoDate: string): boolean => {
      const d = new Date(isoDate);
      if (Number.isNaN(d.getTime())) return false;
      const key = getLocalDateKey(d);
      if (datePreset === 'today') return key === todayKey;
      if (datePreset === 'yesterday') return key === yesterdayKey;
      if (datePreset === 'week') return now - d.getTime() <= sevenDaysMs;
      if (datePreset === 'month') return now - d.getTime() <= thirtyDaysMs;
      if (datePreset === 'custom') return !customDate || key === customDate;
      return true;
    };
  }, [datePreset, customDate, todayKey, yesterdayKey]);

  const filteredSales = useMemo(
    () => sales.filter((s) => matchesPeriod(s.saleDate)),
    [sales, matchesPeriod]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => matchesPeriod(e.date)),
    [expenses, matchesPeriod]
  );

  const itemsBySaleId = useMemo(() => {
    const map = new Map<number, typeof saleItems>();
    for (const item of saleItems) {
      const list = map.get(item.saleId) ?? [];
      list.push(item);
      map.set(item.saleId, list);
    }
    return map;
  }, [saleItems]);

  const filteredSaleIds = useMemo(
    () => new Set(filteredSales.map((s) => s.id).filter((id): id is number => id !== undefined)),
    [filteredSales]
  );

  const filteredSaleItems = useMemo(
    () => saleItems.filter((item) => filteredSaleIds.has(item.saleId)),
    [saleItems, filteredSaleIds]
  );

  // Financial KPIs
  const financials = useMemo(() => {
    let grossSales = 0;
    let totalCostOfGoods = 0;
    let totalDiscounts = 0;

    for (const s of filteredSales) {
      grossSales += s.totalAmount;
      totalDiscounts += s.discountAmount ?? 0;
      if (s.totalCost !== undefined) {
        totalCostOfGoods += s.totalCost;
      } else if (s.id !== undefined) {
        const items = itemsBySaleId.get(s.id) ?? [];
        totalCostOfGoods += items.reduce(
          (sum, it) => sum + (it.buyingPriceSnapshot ?? 0) * it.quantity,
          0
        );
      }
    }

    const expensesTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMoneyOut = totalCostOfGoods + expensesTotal;
    const finalNetMoney = grossSales - totalMoneyOut;

    return {
      grossSales,
      totalCostOfGoods,
      totalDiscounts,
      expensesTotal,
      totalMoneyOut,
      finalNetMoney,
      receiptsCount: filteredSales.length,
    };
  }, [filteredSales, filteredExpenses, itemsBySaleId]);

  // Inventory Valuation & Stock Watchlist
  const inventoryStats = useMemo(() => {
    let costValue = 0;
    let retailValue = 0;
    const lowStock = products
      .filter(isProductBelowReorderPoint)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

    for (const p of products) {
      if (p.stock !== undefined && p.stock > 0) {
        retailValue += p.price * p.stock;
        costValue += (p.buyingPrice ?? 0) * p.stock;
      }
    }

    return { costValue, retailValue, lowStock };
  }, [products]);

  // Product Sales Performance (Most & Least Selling)
  const productPerformance = useMemo(() => {
    const productByBarcode = new Map(products.map((p) => [p.barcode, p]));
    const productById = new Map(
      products.filter((p) => p.id !== undefined).map((p) => [p.id!, p])
    );

    interface ProductStatRow {
      key: string;
      name: string;
      barcode: string;
      category: string;
      stock?: number;
      soldQty: number;
      revenue: number;
      profit: number;
    }

    const map = new Map<string, ProductStatRow>();

    // Seed with entire product catalog so 0-sale products appear in Least Selling
    for (const p of products) {
      map.set(p.barcode, {
        key: p.barcode,
        name: p.name,
        barcode: p.barcode,
        category: p.category,
        stock: p.stock,
        soldQty: 0,
        revenue: 0,
        profit: 0,
      });
    }

    for (const item of filteredSaleItems) {
      const catalogMatch =
        (item.productId !== undefined ? productById.get(item.productId) : undefined) ??
        productByBarcode.get(item.barcodeSnapshot);
      const key = catalogMatch?.barcode ?? item.barcodeSnapshot;

      const existing = map.get(key) ?? {
        key,
        name: catalogMatch?.name ?? item.productNameSnapshot,
        barcode: item.barcodeSnapshot,
        category: catalogMatch?.category ?? 'Other',
        stock: catalogMatch?.stock,
        soldQty: 0,
        revenue: 0,
        profit: 0,
      };

      const itemCost = (item.buyingPriceSnapshot ?? catalogMatch?.buyingPrice ?? 0) * item.quantity;
      existing.soldQty += item.quantity;
      existing.revenue += item.subtotal;
      existing.profit += item.subtotal - itemCost;
      map.set(key, existing);
    }

    const allRows = Array.from(map.values());
    const mostSelling = [...allRows]
      .filter((r) => r.soldQty > 0)
      .sort((a, b) => b.soldQty - a.soldQty || b.revenue - a.revenue)
      .slice(0, 8);

    const leastSelling = [...allRows]
      .sort((a, b) => a.soldQty - b.soldQty || a.revenue - b.revenue)
      .slice(0, 8);

    return { mostSelling, leastSelling };
  }, [products, filteredSaleItems]);

  // Sales by Cashier (1 / 2 / 3)
  const staffPerformance = useMemo(() => {
    const profiles = settings.staffProfiles ?? DEFAULT_SETTINGS.staffProfiles;
    const rowsMap = new Map<
      string,
      { id: string; name: string; receipts: number; units: number; revenue: number; profit: number }
    >();

    for (const p of profiles) {
      rowsMap.set(p.id, {
        id: p.id,
        name: p.name,
        receipts: 0,
        units: 0,
        revenue: 0,
        profit: 0,
      });
    }

    for (const sale of filteredSales) {
      const staffKey = sale.staffId ?? 'other';
      const existing = rowsMap.get(staffKey) ?? {
        id: staffKey === 'other' ? '—' : staffKey,
        name: sale.staffNameSnapshot ?? 'Unassigned',
        receipts: 0,
        units: 0,
        revenue: 0,
        profit: 0,
      };

      const items = sale.id !== undefined ? itemsBySaleId.get(sale.id) ?? [] : [];
      const units = items.reduce((sum, i) => sum + i.quantity, 0);
      const cost =
        sale.totalCost ??
        items.reduce((sum, i) => sum + (i.buyingPriceSnapshot ?? 0) * i.quantity, 0);

      existing.receipts += 1;
      existing.units += units;
      existing.revenue += sale.totalAmount;
      existing.profit += sale.totalAmount - cost;
      rowsMap.set(staffKey, existing);
    }

    return Array.from(rowsMap.values());
  }, [settings.staffProfiles, filteredSales, itemsBySaleId]);

  // Sales by Category
  const categoryPerformance = useMemo(() => {
    const productByBarcode = new Map(products.map((p) => [p.barcode, p]));
    const productById = new Map(
      products.filter((p) => p.id !== undefined).map((p) => [p.id!, p])
    );

    const map = new Map<string, { category: string; units: number; revenue: number }>();

    for (const item of filteredSaleItems) {
      const prod =
        (item.productId !== undefined ? productById.get(item.productId) : undefined) ??
        productByBarcode.get(item.barcodeSnapshot);
      const category = prod?.category ?? 'Other';
      const row = map.get(category) ?? { category, units: 0, revenue: 0 };
      row.units += item.quantity;
      row.revenue += item.subtotal;
      map.set(category, row);
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [products, filteredSaleItems]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount === null || expenseAmount <= 0 || expenseSubmitting) {
      return;
    }
    setExpenseSubmitting(true);
    try {
      const isoDate = expenseDate
        ? new Date(`${expenseDate}T12:00:00`).toISOString()
        : new Date().toISOString();
      const created = await expenseRepo.create({
        title: expenseTitle,
        amount: expenseAmount,
        category: expenseCategory,
        note: expenseNote,
        date: isoDate,
        staffId: activeStaff?.id,
        staffNameSnapshot: activeStaff?.name,
      });
      setExpenseToast(interpolate(t.stats.expenseAddedToast, { title: created.title }));
      setExpenseTitle('');
      setExpenseAmount(null);
      setExpenseNote('');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleConfirmDeleteExpense = async () => {
    if (!deletingExpense?.id) return;
    await expenseRepo.remove(deletingExpense.id);
    setDeletingExpense(null);
    setExpenseToast(t.stats.expenseDeletedToast);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Period Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'today', label: t.stats.presetToday },
                { id: 'yesterday', label: t.stats.presetYesterday },
                { id: 'week', label: t.stats.presetWeek },
                { id: 'month', label: t.stats.presetMonth },
                { id: 'all', label: t.stats.presetAll },
                { id: 'custom', label: t.stats.presetCustom },
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

        <div className="flex items-center gap-5 text-xs text-slate-600 tabular-nums">
          <div>
            <span>{t.stats.costOfGoodsLabel}: </span>
            <span dir="ltr" className="font-mono font-semibold text-slate-900">
              {formatCurrency(financials.totalCostOfGoods, settings.currency)}
            </span>
          </div>
          <div>
            <span>{t.stats.expensesTotalLabel}: </span>
            <span dir="ltr" className="font-mono font-semibold text-slate-900">
              {formatCurrency(financials.expensesTotal, settings.currency)}
            </span>
          </div>
          {financials.totalDiscounts > 0 && (
            <div>
              <span>{t.stats.discountsGivenLabel}: </span>
              <span dir="ltr" className="font-mono font-semibold text-amber-700">
                {formatCurrency(financials.totalDiscounts, settings.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Money Coming In */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.stats.moneyInLabel}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            dir="ltr"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700 text-start"
          >
            {formatCurrency(financials.grossSales, settings.currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {interpolate(t.stats.moneyInSub, { count: financials.receiptsCount })}
          </div>
        </div>

        {/* Money Out (Buying Cost + Expenses) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.stats.moneyOutLabel}</span>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </div>
          <div
            dir="ltr"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-600 text-start"
          >
            {formatCurrency(financials.totalMoneyOut, settings.currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500">{t.stats.moneyOutSub}</div>
        </div>

        {/* Final Net Money */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">{t.stats.finalNetLabel}</span>
            <Wallet className="w-4 h-4 text-amber-300" />
          </div>
          <div
            dir="ltr"
            className={`mt-2 text-2xl font-bold font-mono tabular-nums text-start ${
              financials.finalNetMoney >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(financials.finalNetMoney, settings.currency)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{t.stats.finalNetSub}</div>
        </div>

        {/* Inventory Stock Valuation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.stats.inventoryRetailValue}</span>
            <span className="text-xs font-mono tabular-nums text-amber-600 font-semibold">
              {inventoryStats.lowStock.length} {t.stats.lowStockCount}
            </span>
          </div>
          <div
            dir="ltr"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 text-start"
          >
            {formatCurrency(inventoryStats.retailValue, settings.currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 tabular-nums">
            <span>{t.stats.inventoryCostValue}:</span>
            <span dir="ltr" className="font-mono font-medium text-slate-700">
              {formatCurrency(inventoryStats.costValue, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytics + Expenses Split */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Add Expense + Recorded Expenses */}
        <div className="col-span-5 space-y-6">
          <form
            onSubmit={handleAddExpense}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
          >
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">{t.stats.addExpenseTitle}</h2>
            </div>

            {expenseToast && (
              <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{expenseToast}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setExpenseToast(null)}
                  className="font-medium hover:underline"
                >
                  {t.common.dismiss}
                </button>
              </div>
            )}

            <div>
              <label htmlFor="expense-title" className="block text-xs font-medium text-slate-700 mb-1">
                {t.stats.expenseTitleLabel} *
              </label>
              <input
                id="expense-title"
                dir="auto"
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder={t.stats.expenseTitlePlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
              />
            </div>

            <div>
              <label htmlFor="expense-amount" className="block text-xs font-medium text-slate-700 mb-1">
                {t.stats.expenseAmountLabel} *
              </label>
              <IqdPriceInput
                id="expense-amount"
                value={expenseAmount}
                onChange={setExpenseAmount}
                placeholder="25,000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="expense-category"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  {t.stats.expenseCategoryLabel}
                </label>
                <select
                  id="expense-category"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#9D174D]"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-date" className="block text-xs font-medium text-slate-700 mb-1">
                  {t.stats.expenseDateLabel}
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#9D174D]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expense-note" className="block text-xs font-medium text-slate-700 mb-1">
                {t.stats.expenseNoteLabel}
              </label>
              <input
                id="expense-note"
                dir="auto"
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#9D174D]"
              />
            </div>

            <button
              type="submit"
              disabled={expenseSubmitting || !expenseTitle.trim() || !expenseAmount || expenseAmount <= 0}
              className="w-full py-2.5 px-4 rounded-lg bg-[#9D174D] hover:bg-[#831843] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.stats.expenseAddBtn}</span>
            </button>
          </form>

          {/* Recorded Expenses List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{t.stats.expensesListTitle}</h3>
              <span dir="ltr" className="text-xs font-mono font-semibold text-red-600 tabular-nums">
                {formatCurrency(financials.expensesTotal, settings.currency)}
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">{t.stats.noExpenses}</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div dir="auto" className="text-sm font-medium text-slate-900 truncate">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span>{exp.category}</span>
                        <span aria-hidden="true">·</span>
                        <span dir="ltr" className="font-mono tabular-nums">
                          {getLocalDateKey(new Date(exp.date))}
                        </span>
                        {exp.staffNameSnapshot && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span dir="auto">{exp.staffNameSnapshot}</span>
                          </>
                        )}
                      </div>
                      {exp.note && (
                        <div dir="auto" className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {exp.note}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        dir="ltr"
                        className="text-sm font-mono font-semibold text-red-600 tabular-nums"
                      >
                        -{formatCurrency(exp.amount, settings.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeletingExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`${t.common.delete} ${exp.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Most/Least Selling Products, Cashier Performance, Categories, Stock */}
        <div className="col-span-7 space-y-6">
          {/* Sales by Cashier (1 / 2 / 3) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9D174D]" />
              <h3 className="text-sm font-semibold text-slate-900">
                {t.stats.staffPerformanceTitle}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-5 text-start">{t.stats.colCashier}</th>
                    <th className="py-2.5 px-3 text-center">{t.stats.colReceipts}</th>
                    <th className="py-2.5 px-3 text-center">{t.stats.colSoldQty}</th>
                    <th className="py-2.5 px-3 text-end">{t.stats.colRevenue}</th>
                    <th className="py-2.5 px-5 text-end">{t.stats.colProfit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffPerformance.map((row) => (
                    <tr key={`${row.id}-${row.name}`} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-900">
                        <span className="font-mono text-xs text-slate-500 me-2">#{row.id}</span>
                        <span dir="auto">{row.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {row.receipts}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {row.units}
                      </td>
                      <td
                        dir="ltr"
                        className="py-2.5 px-3 text-end font-mono font-semibold tabular-nums text-slate-900"
                      >
                        {formatCurrency(row.revenue, settings.currency)}
                      </td>
                      <td
                        dir="ltr"
                        className={`py-2.5 px-5 text-end font-mono font-semibold tabular-nums ${
                          row.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(row.profit, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Selling & Least Selling Products */}
          <div className="grid grid-cols-2 gap-4">
            {/* Most Selling */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">{t.stats.mostSellingTitle}</h3>
              </div>
              {productPerformance.mostSelling.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">{t.stats.noSalesData}</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {productPerformance.mostSelling.map((row, idx) => (
                    <div
                      key={row.key}
                      className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div dir="auto" className="font-medium text-slate-900 truncate">
                          <span className="font-mono text-slate-400 me-1.5">{idx + 1}.</span>
                          {row.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {row.soldQty} {t.history.unitPlural}
                        </div>
                      </div>
                      <div dir="ltr" className="text-end font-mono tabular-nums shrink-0">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(row.revenue, settings.currency)}
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          +{formatCurrency(row.profit, settings.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Least Selling */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">{t.stats.leastSellingTitle}</h3>
              </div>
              {productPerformance.leastSelling.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">{t.stats.noSalesData}</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {productPerformance.leastSelling.map((row, idx) => (
                    <div
                      key={row.key}
                      className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div dir="auto" className="font-medium text-slate-900 truncate">
                          <span className="font-mono text-slate-400 me-1.5">{idx + 1}.</span>
                          {row.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{row.category}</div>
                      </div>
                      <div className="text-end font-mono tabular-nums shrink-0">
                        <div
                          className={`font-semibold ${
                            row.soldQty === 0 ? 'text-red-600' : 'text-slate-800'
                          }`}
                        >
                          {row.soldQty} {row.soldQty === 1 ? t.history.unitSingular : t.history.unitPlural}
                        </div>
                        <div dir="ltr" className="text-[11px] text-slate-500">
                          {formatCurrency(row.revenue, settings.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Performance + Low Stock Watchlist */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sales by Category */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.stats.categoryPerformanceTitle}
                </h3>
              </div>
              {categoryPerformance.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">{t.stats.noSalesData}</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {categoryPerformance.map((cat) => (
                    <div
                      key={cat.category}
                      className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div dir="auto" className="font-medium text-slate-900 truncate">
                          {cat.category}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {cat.units} {t.history.unitPlural}
                        </div>
                      </div>
                      <span
                        dir="ltr"
                        className="font-mono font-semibold text-slate-900 tabular-nums shrink-0"
                      >
                        {formatCurrency(cat.revenue, settings.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Watchlist */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.stats.lowStockWatchlistTitle}
                </h3>
              </div>
              {inventoryStats.lowStock.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">{t.stats.noLowStock}</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {inventoryStats.lowStock.map((p) => (
                    <div
                      key={p.id ?? p.barcode}
                      className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div dir="auto" className="font-medium text-slate-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{p.category}</div>
                      </div>
                      <span
                        className={`font-mono font-bold tabular-nums shrink-0 ${
                          (p.stock ?? 0) === 0 ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {(p.stock ?? 0) === 0
                          ? t.products.outOfStockBadge
                          : `${p.stock} / ${getEffectiveReorderPoint(p)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Expense Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingExpense}
        title={t.stats.deleteExpenseTitle}
        message={interpolate(t.stats.deleteExpenseMsg, {
          title: deletingExpense?.title ?? '',
        })}
        confirmLabel={t.common.delete}
        destructive
        onConfirm={handleConfirmDeleteExpense}
        onCancel={() => setDeletingExpense(null)}
      />
    </div>
  );
};
