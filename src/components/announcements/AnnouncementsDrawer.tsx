import React from 'react';
import { Bell, AlertTriangle, CloudRain, ShieldAlert, Sparkles, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-amber-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.liveAnnouncements}
              </h2>
              <p className="text-xs text-slate-400">
                Official Transit Authority Advisories & Strike Alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
          >
            ✕
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
                className={`rounded-2xl p-4 border space-y-2 ${
                  isStrike
                    ? 'bg-rose-950/40 border-rose-500/40'
                    : isFlood
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : isSpecial
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-slate-900/90 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isStrike
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isFlood
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {ann.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ann.timestamp}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ann.description}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span>Affected Corridors:</span>
                  <div className="flex gap-1">
                    {ann.affectedLines.map((line, idx) => (
                      <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-300">
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
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close Advisories
        </button>
      </div>
    </div>
  );
};
