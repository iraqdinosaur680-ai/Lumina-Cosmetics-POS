import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { settingsRepo } from '../database/repositories';
import { TRANSLATIONS } from '../i18n/translations';
import type { AppLanguage } from '../types/pos';

export function useTranslation() {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const language: AppLanguage = settings.appLanguage === 'ar' ? 'ar' : 'en';
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const setLanguage = useCallback(async (nextLang: AppLanguage) => {
    await settingsRepo.updateSettings({ appLanguage: nextLang });
  }, []);

  const toggleLanguage = useCallback(async () => {
    const next: AppLanguage = language === 'en' ? 'ar' : 'en';
    await settingsRepo.updateSettings({ appLanguage: next });
  }, [language]);

  return {
    language,
    isRtl,
    t,
    setLanguage,
    toggleLanguage,
  };
}
