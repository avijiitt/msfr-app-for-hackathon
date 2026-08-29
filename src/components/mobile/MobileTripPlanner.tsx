import React, { useState } from 'react';
import { findMatchingMoBusRoutes, getNearbyLocationsAlongCorridor } from '../../data/cities/bhubaneswar';

interface MobileTripPlannerProps {
  originQuery: string;
  destQuery: string;
  onOriginChange: (val: string) => void;
  onDestChange: (val: string) => void;
  onSearch: (origin: string, dest: string) => void;
  onSelectDestination: (dest: string) => void;
  onOpenFareCalc: () => void;
  onTrackTrip: (routeData: any) => void;
}

export const MobileTripPlanner: React.FC<MobileTripPlannerProps> = ({
  originQuery,
  destQuery,
  onOriginChange,
  onDestChange,
  onSearch,
  onSelectDestination,
  onOpenFareCalc,
  onTrackTrip,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<'fastest' | 'cheapest' | 'eco'>('fastest');

  const handleSwap = () => {
    const temp = originQuery;
    onOriginChange(destQuery);
    onDestChange(temp);
    onSearch(destQuery, temp);
  };

  const matchedBus = findMatchingMoBusRoutes(originQuery, destQuery);
  const primaryRoute = matchedBus.primarySuggestion?.route || '09';
  const altRoute = matchedBus.directRoutes[1]?.route || matchedBus.connectedRoutes[0]?.route || '10';

  const cleanFrom = originQuery ? originQuery.split(',')[0].trim() : 'Jayadev Vihar';
  const cleanTo = destQuery ? destQuery.split(',')[0].trim() : 'Near Niladri Vihar';

  return (
    <div className="flex flex-col gap-4 pb-28 px-3.5 pt-3">
      {/* 1. Neumorphic Mobile Search Bar */}
      <div className="neumorphic-inset rounded-2xl p-3.5 flex flex-col gap-2.5 relative border border-slate-200/50 dark:border-slate-800/80 bg-[#f7f9fb] dark:bg-slate-900/90 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-slate-400 text-[20px]" data-icon="my_location">
            my_location
          </span>
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">FROM</span>
            <input
              type="text"
              value={originQuery}
              onChange={(e) => onOriginChange(e.target.value)}
              placeholder="Departure Station / Area"
              className="bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 ml-7"></div>

        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-rose-500 text-[20px]" data-icon="location_on">
            location_on
          </span>
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">TO</span>
            <input
              type="text"
              value={destQuery}
              onChange={(e) => onDestChange(e.target.value)}
              placeholder="Destination Station / Landmark"
              className="bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Floating Swap Button */}
        <button
          onClick={handleSwap}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md active:scale-90 transition-transform bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          title="Swap locations"
        >
          <span className="material-symbols-outlined text-[20px]">swap_vert</span>
        </button>
      </div>

      {/* 2. Header Title with Corridor Indicator */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Best Routes (3 Options)
          </h1>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            Live CRUT Sync
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="font-bold text-slate-800 dark:text-slate-200">{cleanFrom}</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{cleanTo}</span>
          <span className="opacity-75">(3.5 km)</span>
        </p>
      </div>

      {/* 3. Nearby Locations Horizontal Chips */}
      <div className="glass-panel p-2.5 rounded-2xl flex items-center gap-2 overflow-x-auto hide-scrollbar shadow-xs">
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold whitespace-nowrap pl-1">
          <span className="material-symbols-outlined text-[16px]">route</span>
          <span>Nearby:</span>
        </div>
        {getNearbyLocationsAlongCorridor(originQuery, destQuery).slice(0, 6).map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelectDestination(loc.name)}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 whitespace-nowrap active:scale-95 shadow-2xs transition"
          >
            {loc.name.split('/')[0].trim()}
          </button>
        ))}
      </div>

      {/* 4. Exactly 3 High-Fidelity Route Cards Matching Design System */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Card 1: Fastest Mo Bus */}
        <div
          onClick={() => setSelectedCardId('fastest')}
          className={`glass-panel rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all cursor-pointer ${
            selectedCardId === 'fastest'
              ? 'border-2 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20'
              : 'border border-slate-200 dark:border-slate-800 opacity-90'
          }`}
        >
          {selectedCardId === 'fastest' && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
              Selected
            </div>
          )}

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Fastest Mo Bus</span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              Mo Bus {primaryRoute}: {cleanFrom} – {cleanTo}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
              Mo Bus AC Electric (Route {primaryRoute})
            </p>
          </div>

          <div className="flex justify-between items-end mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">12</span>
              <span className="text-xs font-bold text-slate-500">min</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹15</span>
              <span className="text-[10px] text-slate-500 font-semibold">AC Stage Fare</span>
            </div>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-0.5"></div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Direct Ride</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
              <span>193g CO₂ saved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Arrive by 03:07 pm</span>
            <span className="flex items-center gap-1 font-medium">🛡️ 98% Safe</span>
          </div>
        </div>

        {/* Card 2: Lowest Fare */}
        <div
          onClick={() => setSelectedCardId('cheapest')}
          className={`glass-panel rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all cursor-pointer ${
            selectedCardId === 'cheapest'
              ? 'border-2 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20'
              : 'border border-slate-200 dark:border-slate-800 opacity-90'
          }`}
        >
          {selectedCardId === 'cheapest' && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
              Selected
            </div>
          )}

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              <span>Lowest Fare</span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              Mo Bus {altRoute}: Airport – MANU University
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Mo Bus Ordinary Non-AC (Route {altRoute})
            </p>
          </div>

          <div className="flex justify-between items-end mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">18</span>
              <span className="text-xs font-bold text-slate-500">min</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹10</span>
              <span className="text-[10px] text-slate-500 font-semibold">Ordinary Fare</span>
            </div>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-0.5"></div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Direct Ride</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
              <span>147g CO₂ saved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Arrive by 03:13 pm</span>
            <span className="flex items-center gap-1 font-medium">🛡️ 90% Safe</span>
          </div>
        </div>

        {/* Card 3: 100% Eco Feeder */}
        <div
          onClick={() => setSelectedCardId('eco')}
          className={`glass-panel rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all cursor-pointer ${
            selectedCardId === 'eco'
              ? 'border-2 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20'
              : 'border border-slate-200 dark:border-slate-800 opacity-90'
          }`}
        >
          {selectedCardId === 'eco' && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
              Selected
            </div>
          )}

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
              <span className="material-symbols-outlined text-[14px]">compost</span>
              <span>100% Eco Feeder</span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              Mo E-Ride Auto + Mo Bus 11
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Mo E-Ride EV Feeder + Mo Bus 11
            </p>
          </div>

          <div className="flex justify-between items-end mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">14</span>
              <span className="text-xs font-bold text-slate-500">min</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹25</span>
              <span className="text-[10px] text-slate-500 font-semibold">Shared EV & Bus</span>
            </div>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-0.5"></div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-slate-400">transfer_within_a_station</span>
              <span>1 Quick Transfer</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
              <span>273g CO₂ saved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Arrive by 03:09 pm</span>
            <span className="flex items-center gap-1 font-medium">🛡️ 99% Safe</span>
          </div>
        </div>
      </div>

      {/* 5. Mini Fare Comparison Matrix with Open Button */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">bar_chart</span>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
              Fare Comparison Matrix (3.5 km)
            </h4>
          </div>
          <button
            onClick={onOpenFareCalc}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Fare Calc</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900">
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">Mo Bus AC Electric (10/24)</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹15 – ₹30 • AC Trunk</div>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">Mo Bus Non-AC Ordinary</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹10 – ₹15 • ₹5 Pass</div>
          </div>
          <div className="bg-rose-50/70 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900">
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">Mo E-Ride / Pink Shuttle</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹25 – ₹40 • Zero Emission</div>
          </div>
        </div>
      </div>

      {/* 6. Mobile Action Bar CTA */}
      <div className="pt-2">
        <button
          onClick={() => onTrackTrip({ selectedCardId, primaryRoute, cleanFrom, cleanTo })}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">near_me</span>
          <span>Track & Sync Trip</span>
        </button>
      </div>
    </div>
  );
};
