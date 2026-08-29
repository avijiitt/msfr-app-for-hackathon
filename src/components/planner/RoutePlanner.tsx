import React, { useState, useMemo } from 'react';
import { Station, RouteMode, JourneyOption } from '../../types/transit';
import { calculateJourneyOptions } from '../../services/routeOptimizer';
import { TranslationDictionary } from '../../types/i18n';
import { 
  Zap, 
  Coins, 
  Accessibility, 
  Moon, 
  Leaf, 
  CloudRain, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Calendar,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  LocateFixed
} from 'lucide-react';

interface RoutePlannerProps {
  availableStations: Station[];
  originStation: Station;
  setOriginStation: (st: Station) => void;
  destinationStation: Station;
  setDestinationStation: (st: Station) => void;
  onUseLiveLocationForOrigin: () => void;
  t: TranslationDictionary;
  onBookTicket: (journey: JourneyOption) => void;
  onStartTripSync: (journey: JourneyOption) => void;
  onScheduleTrip: (journey: JourneyOption) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  availableStations,
  originStation,
  setOriginStation,
  destinationStation,
  setDestinationStation,
  onUseLiveLocationForOrigin,
  t,
  onBookTicket,
  onStartTripSync,
  onScheduleTrip,
}) => {
  const [selectedMode, setSelectedMode] = useState<RouteMode>('fastest');
  const [viaStations, setViaStations] = useState<Station[]>([]);

  const journeyOptions = useMemo(() => {
    return calculateJourneyOptions(originStation, destinationStation, viaStations);
  }, [originStation, destinationStation, viaStations]);

  const activeJourney = journeyOptions.find(j => j.modeType === selectedMode) || journeyOptions[0];

  const handleSwapStations = () => {
    const temp = originStation;
    setOriginStation(destinationStation);
    setDestinationStation(temp);
  };

  const handleAddViaStop = () => {
    const available = availableStations.find(
      s => s.id !== originStation.id && s.id !== destinationStation.id && !viaStations.some(v => v.id === s.id)
    );
    if (available) {
      setViaStations([...viaStations, available]);
    }
  };

  const handleRemoveViaStop = (index: number) => {
    const updated = [...viaStations];
    updated.splice(index, 1);
    setViaStations(updated);
  };

  const filterTabs = [
    { id: 'fastest' as RouteMode, label: t.filterFastest, icon: Zap, color: 'text-primary' },
    { id: 'cheapest' as RouteMode, label: t.filterCheapest, icon: Coins, color: 'text-tertiary' },
    { id: 'senior' as RouteMode, label: t.filterSenior, icon: Accessibility, color: 'text-secondary' },
    { id: 'night' as RouteMode, label: t.filterNightSafe, icon: Moon, color: 'text-primary' },
    { id: 'eco' as RouteMode, label: t.filterEco, icon: Leaf, color: 'text-tertiary-fixed' },
    { id: 'weather' as RouteMode, label: t.filterWeatherAware, icon: CloudRain, color: 'text-surface-tint' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-primary/15 pb-3">
        <div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Multi-Modal Route Optimizer
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1">
            Plan your journey with multi-modal options, real-time GPS tracking, and live Mo Bus CRUT sync.
          </p>
        </div>
        <span className="text-xs text-tertiary flex items-center gap-1 font-label-caps">
          <CheckCircle2 className="w-3.5 h-3.5" /> PAN-INDIA SYNC ACTIVE
        </span>
      </div>

      {/* Origin, Destination & Multi-Stop Card */}
      <div className="glass-panel rounded-2xl p-5 border border-primary/20 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex items-start gap-4">
          {/* Route timeline indicator */}
          <div className="flex flex-col items-center mt-3 gap-1">
            <div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_#85f6e5]"></div>
            <div className="w-0.5 h-12 border-l-2 border-dashed border-on-surface-variant/30"></div>
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-transparent shadow-[0_0_8px_#fabd00]"></div>
          </div>

          {/* Select dropdowns */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider block">
                  {t.origin}
                </label>
                <button
                  type="button"
                  onClick={onUseLiveLocationForOrigin}
                  className="text-[11px] text-tertiary hover:underline flex items-center gap-1 font-label-caps"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Use My Live Location (GPS)</span>
                </button>
              </div>
              <div className="bg-surface-container border border-primary/20 rounded-xl p-2.5 flex items-center">
                <MapPin className="w-4 h-4 text-tertiary mr-2 flex-shrink-0" />
                <select
                  value={originStation.id}
                  onChange={(e) => {
                    const st = availableStations.find(s => s.id === e.target.value);
                    if (st) setOriginStation(st);
                  }}
                  className="w-full bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
                >
                  {availableStations.map((st) => (
                    <option key={st.id} value={st.id} className="bg-surface-container-high text-on-surface">
                      {st.name} ({st.mode.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider block mb-1">
                {t.destination}
              </label>
              <div className="bg-surface-container border border-primary/20 rounded-xl p-2.5 flex items-center">
                <MapPin className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <select
                  value={destinationStation.id}
                  onChange={(e) => {
                    const st = availableStations.find(s => s.id === e.target.value);
                    if (st) setDestinationStation(st);
                  }}
                  className="w-full bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
                >
                  {availableStations.map((st) => (
                    <option key={st.id} value={st.id} className="bg-surface-container-high text-on-surface">
                      {st.name} ({st.mode.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSwapStations}
            className="mt-6 p-2.5 rounded-full bg-surface-container hover:bg-surface-bright text-primary border border-primary/20 transition self-center"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {viaStations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-primary/10">
            <span className="text-xs font-semibold text-on-surface-variant">Intermediate Stops:</span>
            {viaStations.map((via, idx) => (
              <div key={via.id} className="flex items-center justify-between bg-surface-container border border-primary/10 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-on-surface">Via Stop {idx + 1}: <strong className="text-primary">{via.name}</strong></span>
                <button
                  onClick={() => handleRemoveViaStop(idx)}
                  className="text-secondary hover:text-secondary-fixed p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleAddViaStop}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-bold font-label-caps"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addStop}</span>
          </button>
          <span className="text-[11px] text-tertiary font-mono">
            ⚡ {availableStations.length} Multi-Modal Stops Available
          </span>
        </div>
      </div>

      {/* 6 Optimization Modes */}
      <div className="space-y-2">
        <h3 className="font-headline-md text-sm text-on-surface font-bold">Optimization Modes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedMode(tab.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold neon-border shadow-lg shadow-primary/20'
                    : 'glass-panel text-on-surface-variant border-primary/10 hover:bg-surface-bright/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-on-primary' : tab.color}`} />
                <span className="text-[11px] font-bold font-label-caps uppercase tracking-wider line-clamp-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Route Card (Primary View) */}
      {activeJourney && (
        <div className="glass-panel neon-border rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-on-primary px-3.5 py-1 rounded-bl-xl text-xs font-bold font-label-caps flex items-center gap-1 shadow">
            <Zap className="w-3.5 h-3.5 fill-current" /> {activeJourney.modeType.toUpperCase()}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-4 items-center">
              <div className="text-3xl font-display-lg text-primary font-black font-mono">
                {activeJourney.totalDurationMins}<span className="text-lg font-normal text-on-surface-variant">min</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs">Direct Express Commute</span>
                <span className="text-tertiary font-bold text-base font-mono">₹{activeJourney.totalFare}.00</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-surface-container border border-tertiary/30 text-tertiary px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 font-mono">
                🌿 {activeJourney.co2SavingsGrams}g CO₂ Saved
              </span>
              <span className="bg-surface-container border border-secondary/30 text-secondary px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 font-mono">
                🦽 {activeJourney.accessibilityScore}% Access
              </span>
            </div>
          </div>

          {activeJourney.warningMessage && (
            <div className="bg-amber-500/10 border border-primary/30 rounded-xl p-3 text-xs text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{activeJourney.warningMessage}</span>
            </div>
          )}

          {/* Route Visualizer Timeline */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant">
              Multi-Modal Journey Itinerary
            </h4>
            <div className="space-y-3">
              {activeJourney.legs.map((leg) => (
                <div key={leg.id} className="relative pl-6 pb-2 border-l-2 border-dashed border-primary/30">
                  <div
                    className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] shadow-[0_0_8px_#fabd00]"
                    style={{ backgroundColor: leg.color }}
                  />

                  <div className="bg-surface-container border border-primary/10 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-on-primary bg-primary font-label-caps"
                        >
                          {leg.mode.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm text-on-surface">{leg.lineName}</span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-primary">
                        {leg.durationMins} mins • ₹{leg.fare}
                      </div>
                    </div>

                    <div className="text-xs text-on-surface-variant">
                      From: <strong className="text-on-surface">{leg.fromStation}</strong> ({leg.departureTime}) ➔ To: <strong className="text-on-surface">{leg.toStation}</strong> ({leg.arrivalTime})
                    </div>

                    <ul className="text-[11px] text-on-surface-variant/80 space-y-1 list-disc list-inside pt-1">
                      {leg.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-primary/10">
            <button
              onClick={() => onBookTicket(activeJourney)}
              className="py-3 px-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs shadow-lg shadow-primary/20 transition flex items-center justify-center gap-1.5 font-label-caps"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.bookTicket} (₹{activeJourney.totalFare})</span>
            </button>

            <button
              onClick={() => onStartTripSync(activeJourney)}
              className="py-3 px-3 rounded-xl bg-surface-bright hover:bg-surface-variant text-tertiary border border-tertiary/30 font-bold text-xs shadow transition flex items-center justify-center gap-1.5 font-label-caps"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.startTripSync}</span>
            </button>

            <button
              onClick={() => onScheduleTrip(activeJourney)}
              className="py-3 px-3 rounded-xl bg-surface-container hover:bg-surface-bright text-primary border border-primary/30 font-bold text-xs shadow transition flex items-center justify-center gap-1.5 font-label-caps"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.scheduleTrip}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
