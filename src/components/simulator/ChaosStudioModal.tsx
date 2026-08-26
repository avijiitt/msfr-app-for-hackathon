import React, { useState } from 'react';
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, CloudRain, Shield, Activity, Code, Check } from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { transitSimulator } from '../../services/transitSimulator';
import { audioService } from '../../services/audioService';

interface ChaosStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  simTime: string;
}

export const ChaosStudioModal: React.FC<ChaosStudioModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  simTime,
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState(transitSimulator.getSpeed());
  const [activeTab, setActiveTab] = useState<'chaos' | 'gtfs'>('chaos');
  const [injectedNotice, setInjectedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSetSpeed = (spd: number) => {
    setSelectedSpeed(spd);
    transitSimulator.setSpeed(spd);
  };

  const handleInjectDelay = (vehicleId: string, minutes: number) => {
    transitSimulator.injectDelay(vehicleId, minutes);
    audioService.playAlertWarning();
    setInjectedNotice(`⚠️ Injected +${minutes} min delay to ${vehicleId}! Real-time transfer buffer recalculating.`);
    setTimeout(() => setInjectedNotice(null), 3000);
  };

  const handleReset = () => {
    transitSimulator.resetSchedule();
    audioService.playSuccessChime();
    setInjectedNotice(`✅ Schedule reset to 100% on-time.`);
    setTimeout(() => setInjectedNotice(null), 2500);
  };

  // Generate simulated GTFS-RT JSON feed for judges
  const gtfsRtFeed = {
    header: {
      gtfsRealtimeVersion: '2.0',
      incrementality: 'FULL_DATASET',
      timestamp: Math.floor(Date.now() / 1000),
      agency: 'Capital Region Urban Transport (CRUT) / SIH26198 SyncFeed',
    },
    entity: vehicles.map((v) => ({
      id: `VEHICLE-POS-${v.id}`,
      vehicle: {
        trip: {
          tripId: `TRIP-${v.routeId}-101`,
          routeId: v.routeId,
          scheduleRelationship: v.delaySeconds > 0 ? 'DELAYED' : 'SCHEDULED',
        },
        position: {
          latitude: Number(v.lat.toFixed(6)),
          longitude: Number(v.lng.toFixed(6)),
          bearing: v.heading,
          speed: (v.speedKmH * 1000) / 3600,
        },
        currentStatus: 'IN_TRANSIT_TO',
        stopId: v.nextStopId,
        occupancyStatus: v.occupancy.toUpperCase(),
        congestionLevel: v.delaySeconds > 120 ? 'SEVERE_CONGESTION' : 'RUNNING_SMOOTHLY',
      },
    })),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Transit & Chaos Simulator Studio
              </h2>
              <p className="text-xs text-slate-400">
                SIH26198 Real-Time Physics Ticker & GTFS-RT Injector
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

        {/* Notice Banner */}
        {injectedNotice && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-300 font-bold animate-in zoom-in-95">
            {injectedNotice}
          </div>
        )}

        {/* Speed & Sim Controls */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Simulation Multiplier Speed:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">Current Sim Time: {simTime}</span>
          </div>

          <div className="flex items-center gap-2">
            {[0.5, 1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSetSpeed(spd)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                  selectedSpeed === spd
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1 transition"
              title="Reset to 100% on-time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Chaos Injector vs GTFS-RT Live Feed */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('chaos')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'chaos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Delay & Incident Injector
          </button>
          <button
            onClick={() => setActiveTab('gtfs')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'gtfs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5 inline mr-1" /> GTFS-RT Real-Time JSON Stream
          </button>
        </div>

        {/* Tab 1: Chaos Injector */}
        {activeTab === 'chaos' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Select Fleet Vehicle to Inject Traffic Delay:
            </span>

            {vehicles.map((v) => (
              <div key={v.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {v.speedKmH} km/h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Next: {v.nextStopName} {v.delaySeconds > 0 ? `(+${Math.round(v.delaySeconds / 60)}m delay)` : '(On-time)'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleInjectDelay(v.id, 3)}
                    className="py-1 px-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 font-mono font-bold"
                  >
                    +3m
                  </button>
                  <button
                    onClick={() => handleInjectDelay(v.id, 7)}
                    className="py-1 px-2.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-mono font-bold"
                  >
                    +7m
                  </button>
                  <button
                    onClick={() => handleInjectDelay(v.id, 12)}
                    className="py-1 px-2.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-300 font-mono font-bold"
                  >
                    +12m
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Live GTFS-RT Feed */}
        {activeTab === 'gtfs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Simulated GTFS-RT Protocol Buffer / JSON Feed:</span>
              <span className="text-emerald-400 font-mono">● 1000ms Ticker</span>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-2xl border border-white/10 font-mono text-[11px] text-cyan-300 h-64 overflow-y-auto overflow-x-auto selection:bg-cyan-900">
              {JSON.stringify(gtfsRtFeed, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close Chaos Studio
        </button>
      </div>
    </div>
  );
};
