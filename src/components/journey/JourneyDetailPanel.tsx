import React, { useState } from 'react';
import { Share2, Bus, Train, Footprints, Clock, Navigation, CheckCircle, ShieldCheck, Ticket, Plus, Trash2, Calendar, Calculator } from 'lucide-react';

interface JourneyDetailPanelProps {
  onStartNavigation: () => void;
  onShareTrip: () => void;
  onBookPass: () => void;
  onOpenTripAssurance: () => void;
  onOpenScheduleRide: () => void;
  onOpenFareDetails: () => void;
}

export const JourneyDetailPanel: React.FC<JourneyDetailPanelProps> = ({
  onStartNavigation,
  onShareTrip,
  onBookPass,
  onOpenTripAssurance,
  onOpenScheduleRide,
  onOpenFareDetails,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [viaStops, setViaStops] = useState<string[]>([]);
  const [newStopInput, setNewStopInput] = useState('');
  const [showAddStop, setShowAddStop] = useState(false);

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopInput.trim()) return;
    setViaStops([...viaStops, newStopInput.trim()]);
    setNewStopInput('');
    setShowAddStop(false);
  };

  const handleRemoveStop = (index: number) => {
    const updated = [...viaStops];
    updated.splice(index, 1);
    setViaStops(updated);
  };

  const handleNavClick = () => {
    setIsNavigating(true);
    onStartNavigation();
  };

  return (
    <div className="w-full lg:w-96 flex-shrink-0 dashboard-card rounded-3xl p-5 flex flex-col justify-between gap-5">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Your Journey
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenScheduleRide}
              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
              title="Schedule Ride for later"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={onShareTrip}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Pill */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> 42 min
          </span>
          <span>⇄ 2 Transfers</span>
          <span className="font-bold text-slate-900 dark:text-white">₹35</span>
          <span className="text-emerald-600 dark:text-emerald-400">Less walking</span>
        </div>

        {/* Multiple Intermediate Stops Section (Via Stops) */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Route Stops ({2 + viaStops.length})
            </span>
            <button
              onClick={() => setShowAddStop(!showAddStop)}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          {showAddStop && (
            <form onSubmit={handleAddStop} className="flex gap-1.5 mt-2">
              <input
                type="text"
                placeholder="Enter intermediate stop..."
                value={newStopInput}
                onChange={(e) => setNewStopInput(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none border border-slate-200 dark:border-slate-700"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Add
              </button>
            </form>
          )}

          {viaStops.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {viaStops.map((stop, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 text-xs border border-blue-100 dark:border-blue-800"
                >
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Via Stop {i + 1}: <strong>{stop}</strong>
                  </span>
                  <button
                    onClick={() => handleRemoveStop(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step-by-Step Interactive Timeline */}
        <div className="py-3 space-y-4">
          {/* Step 1: Your Location */}
          <div className="flex items-start gap-3 relative">
            <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-900 mt-1 flex-shrink-0 z-10"></div>
            <div className="flex-1 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Your Location</span>
              <span className="text-slate-400 font-mono">10:03 AM</span>
            </div>
          </div>

          {/* Walk Segment 1 */}
          <div className="pl-1.5 ml-1 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
            <div className="pl-4 flex items-center gap-2 text-[11px] text-slate-400">
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk 4 min (300 m)</span>
            </div>
          </div>

          {/* Step 2: Take Bus 24A (Green) */}
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Take Bus 24A</span>
                <span className="text-slate-400 font-mono">10:07 AM</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Jayadev Vihar ➔ Master Canteen
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>8 min • 5 stops</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  Live: On Time
                </span>
              </div>
            </div>
          </div>

          {/* Walk Segment 2 */}
          <div className="pl-1.5 ml-2.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
            <div className="pl-4 flex items-center gap-2 text-[11px] text-slate-400">
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk 3 min (200 m)</span>
              <span className="text-slate-400 font-mono ml-auto">10:15 AM</span>
            </div>
          </div>

          {/* Step 3: Take Metro Blue Line */}
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
              <Train className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Take Metro (Blue Line)</span>
                <span className="text-slate-400 font-mono">10:18 AM</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Master Canteen ➔ Bhubaneswar Railway Station
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>15 min • 7 stops</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  Live: On Time
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Time */}
          <div className="pl-1.5 ml-2.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
            <div className="pl-4 flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Transfer Time: 5 min</span>
              <span className="text-slate-400 font-mono ml-auto">10:33 AM</span>
            </div>
          </div>

          {/* Step 4: Take Bus 18 (Red) */}
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Take Bus 18</span>
                <span className="text-slate-400 font-mono">10:38 AM</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Railway Station ➔ KIIT Square
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>7 min • 4 stops</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  Live: On Time
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: Arrival at Destination */}
          <div className="flex items-start gap-3 relative pt-1">
            <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 z-10 text-[9px] shadow-sm">
              📍
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>KIIT Square</span>
                <span className="text-slate-400 font-mono font-normal">10:45 AM</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                You have arrived!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Fare Breakdown, Trip Assurance & Start Navigation */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFareDetails}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Fare Breakdown</span>
          </button>

          <button
            onClick={onOpenTripAssurance}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Assurance</span>
          </button>
        </div>

        <button
          onClick={handleNavClick}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>{isNavigating ? 'Navigating in Real-Time...' : 'Start Navigation'}</span>
        </button>

        <button
          onClick={onBookPass}
          className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
        >
          <Ticket className="w-3.5 h-3.5 text-blue-600" />
          <span>Book Multi-Modal QR Pass (₹35)</span>
        </button>
      </div>
    </div>
  );
};
