import React, { useState, useEffect } from 'react';
import { Bell, Clock, X, RefreshCw, ExternalLink, ShieldAlert, Radio } from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';
import { fetchLiveBbsrNewsAlerts, LiveTransitNewsItem } from '../../services/liveNewsAlertsService';

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
  const [newsAlerts, setNewsAlerts] = useState<LiveTransitNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const items = await fetchLiveBbsrNewsAlerts();
      setNewsAlerts(items);
    } catch (err) {
      console.warn('Failed to load news alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Bhubaneswar Live Transit Alerts
                </h2>
                <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  Google News
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live Traffic, Ama Bus, Metro & BMC Commuter News Feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95 disabled:opacity-50"
              title="Refresh Live News"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Announcements & News Feed */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {newsAlerts.map((item) => {
            const isWarning = item.severity === 'warning';
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border space-y-2 transition-all ${
                  isWarning
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-white'
                    : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono ${
                        isWarning
                          ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                      }`}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                      {item.source}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500 font-semibold">Corridors:</span>
                    {item.affectedRoutes?.map((r, i) => (
                      <span
                        key={i}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 active:scale-98 transition"
        >
          Dismiss & Return to Map
        </button>
      </div>
    </div>
  );
};

