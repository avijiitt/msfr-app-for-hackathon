import React from 'react';
import { Bell, Clock, X } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '../../data/announcements';
import { TranslationDictionary } from '../../types/i18n';

interface AnnouncementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const AnnouncementsDrawer: React.FC<AnnouncementsDrawerProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.liveAnnouncements || 'Transport Announcements & Disruption Alerts'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Transit Authority Advisories & Strike Alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Announcements Feed */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {MOCK_ANNOUNCEMENTS.map((ann) => {
            const isStrike = ann.type === 'strike';
            const isFlood = ann.type === 'weather_flood';
            const isSpecial = ann.type === 'festival_special';

            return (
              <div
                key={ann.id}
                className={`rounded-2xl p-4 border space-y-2 transition-colors ${
                  isStrike
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/50 text-slate-900 dark:text-white'
                    : isFlood
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/50 text-slate-900 dark:text-white'
                    : isSpecial
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-700/50 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isStrike
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        : isFlood
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                    }`}
                  >
                    {ann.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ann.timestamp}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {ann.description}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Affected Corridors:</span>
                  <div className="flex gap-1 flex-wrap">
                    {ann.affectedLines.map((line, idx) => (
                      <span
                        key={idx}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-blue-600 dark:text-cyan-300 text-[10px]"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
        >
          Close Advisories
        </button>
      </div>
    </div>
  );
};
