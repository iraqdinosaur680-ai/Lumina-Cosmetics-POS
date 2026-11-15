import React, { useState } from 'react';
import { Check, Languages, Pencil, ShoppingBag, UserCheck, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { settingsRepo } from '../database/repositories';
import { usePos } from '../context/PosContext';
import { useTranslation } from '../hooks/useTranslation';
import type { StaffProfile } from '../types/pos';

export const StaffLoginScreen: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const { loginAsStaff } = usePos();
  const { language, t, toggleLanguage } = useTranslation();

  const [editingId, setEditingId] = useState<'1' | '2' | '3' | null>(null);
  const [editingName, setEditingName] = useState('');

  const profiles: StaffProfile[] =
    Array.isArray(settings.staffProfiles) && settings.staffProfiles.length === 3
      ? settings.staffProfiles
      : DEFAULT_SETTINGS.staffProfiles;

  const startEdit = (e: React.MouseEvent, profile: StaffProfile) => {
    e.stopPropagation();
    setEditingId(profile.id);
    setEditingName(profile.name);
  };

  const commitEdit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!editingId) return;
    await settingsRepo.updateStaffName(editingId, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-8">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#18181B] text-white flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div dir="auto" className="text-base font-bold text-slate-900">
              {settings.shopName}
            </div>
            <div className="text-xs text-slate-500">{t.nav.pointOfSale}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void toggleLanguage()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
        >
          <Languages className="w-3.5 h-3.5 text-[#9D174D]" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* 3-Choice Login Panel */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.login.title}</h1>
          <p className="text-sm text-slate-500 mt-1.5">{t.login.subtitle}</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const isEditing = editingId === profile.id;
            return (
              <div
                key={profile.id}
                className="relative bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#9D174D] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between min-h-[240px]"
              >
                {/* Top Edit Button (isolated) */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={(e) => startEdit(e, profile)}
                    className="absolute top-3.5 end-3.5 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={t.login.editName}
                  >
                    <Pencil className="w-3 h-3" />
                    <span>{t.login.editName}</span>
                  </button>
                )}

                {isEditing ? (
                  <form
                    onSubmit={commitEdit}
                    className="p-6 flex flex-col justify-between h-full gap-4"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-mono text-xl font-bold flex items-center justify-center mb-4">
                        {profile.id}
                      </div>
                      <label
                        htmlFor={`staff-edit-${profile.id}`}
                        className="block text-xs font-medium text-slate-500 mb-1.5"
                      >
                        {t.login.choiceBadge} #{profile.id}
                      </label>
                      <input
                        id={`staff-edit-${profile.id}`}
                        dir="auto"
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-[#9D174D] rounded-lg focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t.login.saveName}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                        aria-label={t.common.cancel}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => loginAsStaff(profile.id)}
                    className="w-full h-full p-6 flex flex-col justify-between text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D174D]"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-mono text-2xl font-bold flex items-center justify-center mb-5">
                        {profile.id}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {t.login.choiceBadge} {profile.id}
                      </div>
                      <div
                        dir="auto"
                        className="text-lg font-bold text-slate-900 mt-1 break-words"
                      >
                        {profile.name}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#9D174D]">
                      <span>{t.login.selectToStart}</span>
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400">
        {settings.shopName} · {t.nav.offlineIndicator}
      </div>
    </div>
  );
};
