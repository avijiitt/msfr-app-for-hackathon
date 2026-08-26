import React from 'react';
import { Shield, Sparkles, PhoneCall, CheckCircle, Navigation, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-pink-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              🌸
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.womenBooking}
              </h2>
              <p className="text-xs text-pink-300">
                Safe Multi-Modal Commute & Women Reserved Transit
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

        {/* Feature 1: Pink Mo Bus & Reserved Coach */}
        <div className="bg-pink-950/40 border border-pink-500/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-pink-200 flex items-center gap-2">
              <span>🌸 Dedicated Women Pink Mo Buses</span>
            </span>
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-mono">
              ● Active Live Fleet
            </span>
          </div>
          <p className="text-xs text-pink-100/90 leading-relaxed">
            Staffed with trained women security marshals, active GPS dashcams, and automated SOS panic buttons at every window.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenPinkPass();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition text-center"
            >
              Get Free Women Pink Pass
            </button>
          </div>
        </div>

        {/* Feature 2: High-Lux Night Safe CCTV Corridors */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
          <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Streetlit & CCTV Patrolled Routes</span>
          </span>
          <p className="text-xs text-slate-400">
            Route optimizer highlights well-lit routes with active police help desks and verified safe bus shelters.
          </p>
          <button
            onClick={() => {
              onClose();
              onPlanNightSafe();
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Switch to Night-Safe Route Optimizer</span>
          </button>
        </div>

        {/* Feature 3: Helplines */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:1091"
            className="bg-slate-900/80 border border-pink-500/30 p-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition"
          >
            <PhoneCall className="w-4 h-4 text-pink-400" />
            <div>
              <div className="font-bold text-pink-300">Women Helpline</div>
              <div className="text-[10px] text-slate-400">Dial 1091 (Toll-Free)</div>
            </div>
          </a>

          <a
            href="tel:112"
            className="bg-slate-900/80 border border-blue-500/30 p-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition"
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <div>
              <div className="font-bold text-blue-300">Police Emergency</div>
              <div className="text-[10px] text-slate-400">Dial 112 Direct</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
