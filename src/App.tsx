import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, ensureDefaultSettings } from './database/db';
import { PosProvider, usePos } from './context/PosContext';
import { PosLayout } from './layouts/PosLayout';
import { CashierPage } from './pages/CashierPage';
import { ProductsPage } from './pages/ProductsPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ReceiptPreview } from './components/ReceiptPreview';
import { StaffLoginScreen } from './components/StaffLoginScreen';

function getOrCreatePrintRoot(): HTMLElement {
  let el = document.getElementById('receipt-print-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'receipt-print-root';
    document.body.appendChild(el);
  }
  return el;
}

function AppRoutesAndPrintPortal() {
  const { activeStaff, printReceipt } = usePos();
  const [printRoot, setPrintRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintRoot(getOrCreatePrintRoot());
  }, []);

  if (!activeStaff) {
    return <StaffLoginScreen />;
  }

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<PosLayout />}>
            <Route index element={<CashierPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="history" element={<SalesHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>

      {printRoot &&
        printReceipt &&
        createPortal(<ReceiptPreview receipt={printReceipt} />, printRoot)}
    </>
  );
}

export default function App() {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;

  useEffect(() => {
    void ensureDefaultSettings();
  }, []);

  useEffect(() => {
    const lang = settings.appLanguage === 'ar' ? 'ar' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [settings.appLanguage]);

  return (
    <PosProvider>
      <AppRoutesAndPrintPortal />
    </PosProvider>
  );
}
