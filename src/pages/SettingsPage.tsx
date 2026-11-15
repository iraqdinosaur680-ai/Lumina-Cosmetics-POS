import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Database, Download, Save, Upload } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { backupRepo, settingsRepo } from '../database/repositories';
import { useTranslation } from '../hooks/useTranslation';
import type {
  AppLanguage,
  DatabaseBackup,
  ReceiptData,
  ReceiptLanguage,
  ReceiptWidth,
  StaffProfile,
} from '../types/pos';
import { ReceiptPreview } from '../components/ReceiptPreview';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const currentSettings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const productCount = useLiveQuery(() => db.products.count(), []) ?? 0;
  const salesCount = useLiveQuery(() => db.sales.count(), []) ?? 0;
  const { t } = useTranslation();

  const [shopName, setShopName] = useState(currentSettings.shopName);
  const [currency, setCurrency] = useState(currentSettings.currency);
  const [receiptWidth, setReceiptWidth] = useState<ReceiptWidth>(currentSettings.receiptWidth);
  const [receiptLanguage, setReceiptLanguage] = useState<ReceiptLanguage>(
    currentSettings.receiptLanguage ?? 'bilingual'
  );
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(
    currentSettings.appLanguage ?? 'en'
  );
  const [receiptFooter, setReceiptFooter] = useState(currentSettings.receiptFooter);
  const [autoPrint, setAutoPrint] = useState(currentSettings.autoPrint);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(
    currentSettings.staffProfiles ?? DEFAULT_SETTINGS.staffProfiles
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<DatabaseBackup | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  useEffect(() => {
    setShopName(currentSettings.shopName);
    setCurrency(currentSettings.currency);
    setReceiptWidth(currentSettings.receiptWidth);
    setReceiptLanguage(currentSettings.receiptLanguage ?? 'bilingual');
    setAppLanguage(currentSettings.appLanguage ?? 'en');
    setReceiptFooter(currentSettings.receiptFooter);
    setAutoPrint(currentSettings.autoPrint);
    setStaffProfiles(currentSettings.staffProfiles ?? DEFAULT_SETTINGS.staffProfiles);
  }, [currentSettings]);

  const handleStaffNameChange = (id: '1' | '2' | '3', nextName: string) => {
    setStaffProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: nextName } : p))
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const normalizedProfiles = staffProfiles.map((p) => ({
        ...p,
        name: p.name.trim() || `Cashier ${p.id}`,
      }));
      await settingsRepo.updateSettings({
        shopName,
        currency,
        receiptWidth,
        receiptLanguage,
        appLanguage,
        receiptFooter,
        autoPrint,
        staffProfiles: normalizedProfiles,
      });
      setFeedback({ type: 'success', text: t.settings.savedToast });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await backupRepo.exportAllData();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `cosmetics-pos-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback({
        type: 'success',
        text: `Exported ${backup.data.products.length} products and ${backup.data.sales.length} sales.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to export database backup.',
      });
    }
  };

  const handleBackupFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as DatabaseBackup;
      if (!parsed?.data || !Array.isArray(parsed.data.products) || !Array.isArray(parsed.data.sales)) {
        throw new Error('This file is not a valid Cosmetics POS backup.');
      }
      setPendingBackup(parsed);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to parse backup JSON file.',
      });
    }
  };

  const confirmImportBackup = async () => {
    if (!pendingBackup) return;
    try {
      const result = await backupRepo.importBackupData(pendingBackup, importMode);
      setFeedback({
        type: 'success',
        text: `Restore complete (${importMode}). Database now contains ${result.productsCount} products and ${result.salesCount} sales.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Restore failed.',
      });
    } finally {
      setPendingBackup(null);
    }
  };

  const livePreviewData: ReceiptData = {
    receiptNumber: '000001',
    saleDate: new Date().toISOString(),
    totalAmount: 25000,
    items: [
      {
        productName: 'Velvet Matte Lipstick',
        barcode: '6281001100014',
        unitPrice: 10000,
        quantity: 2,
        subtotal: 20000,
      },
      {
        productName: 'سيروم فيتامين سي',
        barcode: '6281001100083',
        unitPrice: 5000,
        quantity: 1,
        subtotal: 5000,
      },
    ],
    settings: {
      id: 1,
      shopName: shopName || 'Lumina Cosmetics',
      currency: currency || 'IQD',
      receiptWidth,
      receiptLanguage,
      appLanguage,
      receiptFooter,
      autoPrint,
      staffProfiles,
    },
  };

  return (
    <div className="max-w-[1360px] mx-auto space-y-6">
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left: Shop, Receipt & Backup Forms */}
        <div className="col-span-7 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-base font-semibold text-slate-900">
                {t.settings.storeSectionTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.settings.storeSectionSubtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="shop-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.settings.shopNameLabel}
                </label>
                <input
                  id="shop-name"
                  dir="auto"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="shop-currency" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.settings.currencyLabel}
                </label>
                <input
                  id="shop-currency"
                  dir="ltr"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.settings.appLanguageLabel}
                </span>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAppLanguage('en')}
                    className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                      appLanguage === 'en'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppLanguage('ar')}
                    className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                      appLanguage === 'ar'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.settings.receiptWidthLabel}
                </span>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg" dir="ltr">
                  {(['58mm', '80mm'] as ReceiptWidth[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setReceiptWidth(w)}
                      className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                        receiptWidth === w
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="receipt-lang" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.settings.receiptLangLabel}
                </label>
                <select
                  id="receipt-lang"
                  value={receiptLanguage}
                  onChange={(e) => setReceiptLanguage(e.target.value as ReceiptLanguage)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
                >
                  <option value="bilingual">{t.settings.langBilingual}</option>
                  <option value="en">{t.settings.langEnglish}</option>
                  <option value="ar">{t.settings.langArabic}</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="receipt-footer" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.settings.footerLabel}
              </label>
              <textarea
                id="receipt-footer"
                dir="auto"
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                placeholder="THANK YOU!"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
              />
            </div>

            {/* 3-Choice Cashier Profiles */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.settings.staffSectionTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.settings.staffSectionSubtitle}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {staffProfiles.map((profile) => (
                  <div key={profile.id}>
                    <label
                      htmlFor={`settings-staff-${profile.id}`}
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      {t.settings.staffChoiceLabel} #{profile.id}
                    </label>
                    <input
                      id={`settings-staff-${profile.id}`}
                      dir="auto"
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleStaffNameChange(profile.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-4 h-4 accent-[#9D174D] rounded"
                />
                <span className="text-sm text-slate-700">{t.settings.autoPrintLabel}</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                <Save className="w-4 h-4" />
                {saving ? t.common.saving : t.settings.saveSettingsBtn}
              </button>
            </div>
          </form>

          {/* Local Database Backup & Restore */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-700" />
                  {t.settings.backupTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{t.settings.backupSubtitle}</p>
              </div>
              <div className="text-end font-mono tabular-nums text-xs text-slate-600">
                <div>
                  {productCount} {t.settings.productsCountLabel}
                </div>
                <div>
                  {salesCount} {t.settings.salesCountLabel}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {t.settings.exportBtn}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileSelected}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                {t.settings.importBtn}
              </button>

              <div className="flex items-center gap-2 ms-auto text-xs">
                <span className="text-slate-500">{t.settings.importModeLabel}</span>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 font-medium"
                >
                  <option value="merge">{t.settings.modeMerge}</option>
                  <option value="replace">{t.settings.modeReplace}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Receipt Preview */}
        <div className="col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t.settings.livePreviewTitle}</h3>
            <span dir="ltr" className="text-xs font-mono text-slate-500">
              {receiptWidth}
            </span>
          </div>
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 flex justify-center overflow-x-auto">
            <ReceiptPreview receipt={livePreviewData} />
          </div>
        </div>
      </div>

      {/* Confirm Restore Dialog */}
      <ConfirmDialog
        isOpen={!!pendingBackup}
        title={importMode === 'replace' ? t.settings.replaceTitle : t.settings.mergeTitle}
        message={
          pendingBackup
            ? `Backup exported on ${pendingBackup.exportedAt.slice(0, 10)} contains ${
                pendingBackup.data.products.length
              } products and ${pendingBackup.data.sales.length} sales.`
            : ''
        }
        confirmLabel={
          importMode === 'replace' ? t.settings.replaceConfirmBtn : t.settings.mergeConfirmBtn
        }
        destructive={importMode === 'replace'}
        onConfirm={confirmImportBackup}
        onCancel={() => setPendingBackup(null)}
      />
    </div>
  );
};
