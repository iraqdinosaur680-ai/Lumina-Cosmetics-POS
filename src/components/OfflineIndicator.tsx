import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTranslation } from '../hooks/useTranslation';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 start-4 z-40 flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-slate-700"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>{t.nav.offlineIndicator}</span>
    </div>
  );
};
