import React, { useState, useEffect } from 'react';
import { JourneyOption, Vehicle } from '../../types/transit';
import { ShieldCheck, AlertTriangle, RefreshCw, X, ArrowRight, CheckCircle2, Navigation, Volume2 } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { TranslationDictionary } from '../../types/i18n';

interface ActiveTripHUDProps {
  journey: JourneyOption | null;
  vehicles: Vehicle[];
  onEndTrip: () => void;
  onApplyReroute: (newRouteTitle: string) => void;
  t: TranslationDictionary;
}

export const ActiveTripHUD: React.FC<ActiveTripHUDProps> = ({
  journey,
  vehicles,
  onEndTrip,
  onApplyReroute,
  t,
}) => {
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [transferBufferMins, setTransferBufferMins] = useState(7);
  const [hasTriggeredAlert, setHasTriggeredAlert] = useState(false);

  if (!journey) return null;

  const currentLeg = journey.legs[currentLegIndex] || journey.legs[0];
  const nextLeg = journey.legs[currentLegIndex + 1];

  // Calculate live transfer risk based on vehicle delay
  const matchedVehicle = vehicles.find(v => v.routeId === currentLeg.lineCode || v.mode === currentLeg.mode);
  const delaySecs = matchedVehicle?.delaySeconds || 0;
  const computedBuffer = Math.max(0, 7 - Math.floor(delaySecs / 60));

  useEffect(() => {
    setTransferBufferMins(computedBuffer);
    if (computedBuffer <= 2 && !hasTriggeredAlert) {
      audioService.playAlertWarning();
      setHasTriggeredAlert(true);
    }
  }, [computedBuffer, hasTriggeredAlert]);

  const isSafe = transferBufferMins >= 5;
  const isTight = transferBufferMins >= 3 && transferBufferMins < 5;
  const isCritical = transferBufferMins < 3;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl animate-in slide-in-from-top duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
        isCritical
          ? 'glass-panel-danger border-rose-500/50 shadow-rose-900/40'
          : isTight
          ? 'glass-panel border-amber-500/40 shadow-amber-900/30'
          : 'glass-panel-glow border-blue-500/40 shadow-blue-900/30'
      }`}>
        {/* Top Status Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              Live Commute Sync Active
            </span>
          </div>

          <button
            onClick={onEndTrip}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-medium transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>End Trip</span>
          </button>
        </div>

        {/* Current Leg Info */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">
              Current Leg (Leg {currentLegIndex + 1} of {journey.legs.length}):
            </div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentLeg.color }}
              />
              <span>{currentLeg.lineName}</span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Approaching: <strong className="text-cyan-300">{currentLeg.toStation}</strong>
            </div>
          </div>

          {/* Transfer Health Status Badge */}
          {nextLeg && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold">Transfer Buffer:</div>
              <div className={`font-black font-mono text-sm px-2 py-0.5 rounded-lg border inline-block ${
                isSafe
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : isTight
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
              }`}>
                {transferBufferMins} min {isSafe ? '(Safe)' : isTight ? '(Tight)' : '(Miss Risk!)'}
              </div>
            </div>
          )}
        </div>

        {/* Transfer Window Progress Bar */}
        {nextLeg && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Next Connection: {nextLeg.lineName}</span>
              <span>Walking Buffer: {transferBufferMins}m remaining</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  isSafe ? 'bg-emerald-500' : isTight ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (transferBufferMins / 8) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Smart Sync Rescue Reroute Recommendation if Transfer is in Danger */}
        {isCritical && nextLeg && (
          <div className="mt-3 bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 space-y-2 animate-in zoom-in-95">
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Delay Warning: High risk of missing {nextLeg.lineName}!</span>
            </div>
            <p className="text-[11px] text-rose-100">
              ⚡ <strong>TransitSync Rescue Recommendation:</strong> Switch to <em>Mo Bus 11 (Non-AC Express)</em> arriving at Platform 2 in 4 mins to reach on time.
            </p>
            <button
              onClick={() => onApplyReroute('Mo Bus 11 Express Rescue Reroute')}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Accept 1-Tap Sync Rescue Reroute</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
