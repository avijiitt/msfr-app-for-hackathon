import React from 'react';
import { Shield, Sparkles, PhoneCall, CheckCircle, Navigation, MapPin, X } from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';

interface WomenSafetyHubProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPinkPass: () => void;
  onPlanNightSafe: () => void;
  t: TranslationDictionary;
}

export const WomenSafetyHub: React.FC<WomenSafetyHubProps> = ({
  isOpen,
  onClose,
  onOpenPinkPass,
  onPlanNightSafe,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl">
              🌸
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.womenBooking || 'Women Safety & Pink Transit Hub'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe Multi-Modal Commute & Women Reserved Transit
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

        {/* Feature 1: Dedicated Women Coaches & Pink Buses */}
        <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/50 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-pink-900 dark:text-pink-200 flex items-center gap-1.5">
              🌸 Dedicated Women Pink Transit Coaches
            </span>
            <span className="text-[10px] bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-300 px-2 py-0.5 rounded-full font-mono font-bold">
              ● Active Fleet
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Staffed with trained women security marshals, active GPS dashcams, and automated SOS panic buttons at every window seat.
          </p>
          <button
            onClick={onOpenPinkPass}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Get Free Women Pink Pass (Digital)
          </button>
        </div>

        {/* Feature 2: Night-Safe Well-Lit Routing */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              🌙 Night Safe Mode Routing (CCTV + LED Lit Roads)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Auto-diverts journey through 100% street-lit corridors with active police kiosks and CCTV monitoring stations.
          </p>
          <button
            onClick={onPlanNightSafe}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            Apply Night-Safe Routing Corridor
          </button>
        </div>

        {/* Direct Women Safety Helpline */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs text-slate-900 dark:text-white block">National Women Helpline</strong>
              <span className="text-[11px] text-slate-500 font-mono">Dial 1091 (Toll-Free 24x7)</span>
            </div>
          </div>
          <a
            href="tel:1091"
            className="py-1.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
          >
            Call 1091
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close Hub
        </button>
      </div>
    </div>
  );
};
