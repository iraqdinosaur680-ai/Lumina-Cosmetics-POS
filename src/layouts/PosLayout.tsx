import React, { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  History,
  Languages,
  LogOut,
  Package,
  ScanBarcode,
  Settings as SettingsIcon,
  ShoppingBag,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { isProductBelowReorderPoint } from '../database/repositories';
import { usePos } from '../context/PosContext';
import { useClock } from '../hooks/useClock';
import { useTranslation } from '../hooks/useTranslation';
import { interpolate } from '../i18n/translations';
import { formatReceiptDate, formatTimeWithSeconds } from '../utils/formatters';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { OfflineIndicator } from '../components/OfflineIndicator';

export const PosLayout: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const products = useLiveQuery(() => db.products.toArray(), []) ?? [];
  const { activeStaff, logoutStaff, processScannedBarcode, totalItems } = usePos();
  const { language, t, toggleLanguage } = useTranslation();
  const now = useClock();
  const navigate = useNavigate();
  const location = useLocation();

  const lowStockProducts = products.filter(isProductBelowReorderPoint);
  const hasOutOfStock = lowStockProducts.some((p) => (p.stock ?? 0) === 0);

  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  const navItems = [
    { to: '/', label: t.nav.cashier, icon: ScanBarcode, shortcut: 'Alt+1' },
    { to: '/products', label: t.nav.products, icon: Package, shortcut: 'Alt+2' },
    { to: '/history', label: t.nav.history, icon: History, shortcut: 'Alt+3' },
    { to: '/settings', label: t.nav.settings, icon: SettingsIcon, shortcut: 'Alt+4' },
    { to: '/statistics', label: t.nav.statistics, icon: BarChart3, shortcut: 'Alt+5' },
  ];

  // Global HID barcode listener across the entire app:
  // Scans anywhere immediately process the product & navigate to Cashier (/),
  // EXCEPT when a dialog/modal is open (e.g. editing/adding a product)
  // or when any input/textarea/select is focused (e.g. searching for a product or editing settings).
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 1. Skip when any modal/dialog is open (Add/Edit Product, Print Preview, Sale Details, Confirm)
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) {
        scanBufferRef.current = '';
        return;
      }

      // 2. Skip when user is typing in ANY input, textarea, select, or editable field
      // (Covers searching in Products, Cashier quick search, Sales History search, Settings, etc.)
      // Note: Cashier's own #pos-barcode-scanner-input handles its own Enter key directly.
      const active = document.activeElement as HTMLElement | null;
      const isEditingField =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable);

      if (isEditingField) {
        scanBufferRef.current = '';
        return;
      }

      const keyTime = performance.now();
      const timeDiff = keyTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = keyTime;

      if (e.key === 'Enter') {
        const buffered = scanBufferRef.current;
        scanBufferRef.current = '';
        if (buffered.length >= 3 && timeDiff < 150) {
          e.preventDefault();
          e.stopPropagation();
          void processScannedBarcode(buffered);
          if (location.pathname !== '/') {
            navigate('/');
          }
          requestAnimationFrame(() => {
            document.getElementById('pos-barcode-scanner-input')?.focus();
          });
        }
        return;
      }

      if (e.key.length === 1) {
        if (timeDiff > 120) {
          scanBufferRef.current = e.key;
        } else {
          scanBufferRef.current += e.key;
        }
      }
    };

    // Capture phase ensures rapid HID Enter isn't eaten by a focused nav link or button
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [location.pathname, navigate, processScannedBarcode]);

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === '1') {
        e.preventDefault();
        navigate('/');
      } else if (e.key === '2') {
        e.preventDefault();
        navigate('/products');
      } else if (e.key === '3') {
        e.preventDefault();
        navigate('/history');
      } else if (e.key === '4') {
        e.preventDefault();
        navigate('/settings');
      } else if (e.key === '5') {
        e.preventDefault();
        navigate('/statistics');
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  const currentNav = navItems.find((item) => item.to === location.pathname) ?? navItems[0];

  return (
    <div className="min-h-screen h-screen flex bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-[232px] shrink-0 bg-white border-e border-slate-200 flex flex-col justify-between select-none">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div
                dir="auto"
                className="text-sm font-bold tracking-tight text-slate-900 truncate"
                title={settings.shopName}
              >
                {settings.shopName}
              </div>
              <div className="text-[11px] text-slate-500">{t.nav.pointOfSale}</div>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="p-3 space-y-1" aria-label="Primary POS Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#9D174D] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.to === '/' && totalItems > 0 && (
                          <span
                            dir="ltr"
                            className={`text-xs font-mono tabular-nums ${
                              isActive ? 'text-white/85' : 'text-[#9D174D] font-semibold'
                            }`}
                          >
                            · {totalItems}
                          </span>
                        )}
                      </span>
                      <span
                        dir="ltr"
                        className={`text-[11px] font-mono ${
                          isActive ? 'text-white/75' : 'text-slate-400'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {activeStaff && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500">{t.login.activeCashierLabel}</div>
                <div dir="auto" className="text-xs font-semibold text-slate-900 truncate">
                  <span className="font-mono text-[#9D174D] me-1">#{activeStaff.id}</span>
                  {activeStaff.name}
                </div>
              </div>
              <button
                type="button"
                onClick={logoutStaff}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors shrink-0"
                title={t.login.switchCashier}
                aria-label={t.login.switchCashier}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <PWAInstallButton />
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>{t.nav.currencyLabel}</span>
              <span className="font-mono font-medium text-slate-700">{settings.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.nav.receiptLabel}</span>
              <span dir="ltr" className="font-mono font-medium text-slate-700">
                {settings.receiptWidth}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 whitespace-nowrap shrink-0">
              {currentNav.label}
            </h1>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span dir="auto" className="text-sm text-slate-500 truncate">
              {settings.shopName}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `whitespace-nowrap shrink-0 transition-colors ${
                      isActive ? 'text-[#9D174D] font-semibold' : 'hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {location.pathname === '/' && lowStockProducts.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/products?filter=low-stock')}
                title={`${t.cashier.lowStockHeaderTitle}: ${lowStockProducts
                  .slice(0, 4)
                  .map((p) => p.name)
                  .join(', ')}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  hasOutOfStock
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="tabular-nums">
                  {interpolate(t.cashier.lowStockHeaderBadge, { count: lowStockProducts.length })}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void toggleLanguage()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-[#9D174D]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <div
              dir="ltr"
              className="text-end font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap shrink-0"
            >
              <span className="font-medium text-slate-900">
                {formatReceiptDate(now.toISOString())}
              </span>
              <span className="mx-2 text-slate-300" aria-hidden="true">
                ·
              </span>
              <span>{formatTimeWithSeconds(now)}</span>
            </div>
          </div>
        </header>

        {/* Active Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <OfflineIndicator />
    </div>
  );
};
