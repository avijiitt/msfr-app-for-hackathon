import React, { useState } from 'react';
import { Bus, Train, ChevronRight, RotateCw, RefreshCw, Shield, Bell, Zap, Wallet, Star, Leaf, Accessibility, Moon, CloudRain, Coins } from 'lucide-react';
import { RouteMode } from '../../types/transit';

export interface RouteCardOption {
  id: string;
  badge: string;
  badgeColor: string;
  isStar?: boolean;
  modeType: RouteMode;
  serviceType: string;
  routeNumber: string;
  lineTitle: string;
  durationMins: number;
  transfersCount: number;
  fareInr: number;
  fareNote: string;
  arrivalTime: string;
  co2SavedGrams: number;
  safetyScore: number;
}

interface BestRoutesCarouselProps {
  originName?: string;
  destinationName?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  onSelectRoute: (routeId: string) => void;
  selectedRouteId: string;
  activeFilterMode: RouteMode;
  onFilterModeChange: (mode: RouteMode) => void;
  onOpenLiveUpdates?: () => void;
  onOpenSmartAlerts?: () => void;
  onOpenSafeJourney?: () => void;
  onOpenSaveMore?: () => void;
}

export const BestRoutesCarousel: React.FC<BestRoutesCarouselProps> = ({
  originName = 'Jayadev Vihar',
  destinationName = 'KIIT Square, Patia',
  originCoords,
  destCoords,
  onSelectRoute,
  selectedRouteId,
  activeFilterMode,
  onFilterModeChange,
  onOpenLiveUpdates,
  onOpenSmartAlerts,
  onOpenSafeJourney,
  onOpenSaveMore,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic road/transit distance estimation
  const distanceKm = React.useMemo(() => {
    if (originCoords && destCoords) {
      const latDiff = originCoords[0] - destCoords[0];
      const lngDiff = (originCoords[1] - destCoords[1]) * Math.cos((originCoords[0] * Math.PI) / 180);
      const d = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32;
      return Math.max(1.5, Math.round(d * 10) / 10);
    }
    return 8.5;
  }, [originCoords, destCoords]);

  // Clean names
  const cleanFrom = originName.split(',')[0] || 'Origin';
  const cleanTo = destinationName.split(',')[0] || 'Destination';

  // Format dynamic arrival times
  const getArrivalTime = (durationMins: number) => {
    const d = new Date(Date.now() + durationMins * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Exactly 3 Optimized Route Options for Bhubaneswar & Indian Transit Corridors
  const routeCards: RouteCardOption[] = [
    {
      id: 'route-rec',
      badge: '⚡ Fastest AC Mo Bus',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      isStar: true,
      modeType: 'fastest',
      serviceType: 'Mo Bus AC Electric (CRUT)',
      routeNumber: 'Route 10 / 24 Express',
      lineTitle: `Mo Bus 10 / 24 AC Electric Trunk`,
      durationMins: Math.max(12, Math.round(distanceKm * 2.4)),
      transfersCount: 0,
      fareInr: Math.max(15, Math.min(35, Math.round(10 + distanceKm * 1.5))),
      fareNote: 'AC Stage Fare (₹15–₹35)',
      arrivalTime: getArrivalTime(Math.max(12, Math.round(distanceKm * 2.4))),
      co2SavedGrams: Math.round(distanceKm * 55),
      safetyScore: 98,
    },
    {
      id: 'route-cheap',
      badge: '💰 Cheapest Non-AC',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      modeType: 'cheapest',
      serviceType: 'Mo Bus Ordinary Non-AC (CRUT)',
      routeNumber: 'Route 11 / 20 / 33',
      lineTitle: `Mo Bus 11 / 20 Ordinary Green Line`,
      durationMins: Math.max(18, Math.round(distanceKm * 3.2)),
      transfersCount: 0,
      fareInr: Math.max(10, Math.min(20, Math.round(5 + distanceKm * 1.0))),
      fareNote: 'Ordinary Fare (₹5 with Student Pass)',
      arrivalTime: getArrivalTime(Math.max(18, Math.round(distanceKm * 3.2))),
      co2SavedGrams: Math.round(distanceKm * 42),
      safetyScore: 90,
    },
    {
      id: 'route-eco',
      badge: '🌿 Eco Mo E-Ride / Pink',
      badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
      modeType: 'eco',
      serviceType: 'Mo E-Ride EV Feeder + Pink Bus',
      routeNumber: 'Mo E-Ride + Pink 1',
      lineTitle: `Mo E-Ride Electric Auto + Pink Shuttle`,
      durationMins: Math.max(14, Math.round(distanceKm * 2.1)),
      transfersCount: 1,
      fareInr: Math.max(25, Math.min(45, Math.round(15 + distanceKm * 2.0))),
      fareNote: 'Shared EV Auto & Pink Safe Feeder',
      arrivalTime: getArrivalTime(Math.max(14, Math.round(distanceKm * 2.1))),
      co2SavedGrams: Math.round(distanceKm * 78),
      safetyScore: 99,
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Route Corridor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>Best Routes (3 Options)</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
              {cleanFrom} ➔ {cleanTo} ({distanceKm} km)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare live CRUT Mo Bus fares and transit times to your destination
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 font-semibold transition bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <span>Mo Bus Fleet Sync</span>
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Exactly 3 Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {routeCards.map((card) => {
          const isSelected = selectedRouteId === card.id || activeFilterMode === card.modeType;
          return (
            <div
              key={card.id}
              onClick={() => {
                onSelectRoute(card.id);
                onFilterModeChange(card.modeType);
              }}
              className={`dashboard-card rounded-2xl p-4 cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? 'ring-2 ring-blue-600 dark:ring-blue-500 bg-blue-50/20 dark:bg-slate-800/95 shadow-lg scale-[1.01]'
                  : 'hover:border-slate-300 dark:hover:border-slate-700 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Badge & Selection Status */}
              <div className="flex items-center justify-between mb-2.5">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
                {isSelected && (
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Selected Route
                  </span>
                )}
              </div>

              {/* Service Line Title */}
              <div className="mb-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  {card.lineTitle}
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {card.serviceType}
                </span>
              </div>

              {/* Duration & Calculated Fare */}
              <div className="flex items-baseline justify-between mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {card.durationMins}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-1">min</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    ₹{card.fareInr}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {card.fareNote}
                  </div>
                </div>
              </div>

              {/* Transfer & Eco Badges */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {card.transfersCount === 0 ? '🟢 Direct Ride' : '⇄ 1 Quick Transfer'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  🌿 {card.co2SavedGrams}g CO₂
                </span>
              </div>

              {/* Arrival time pill */}
              <div className="pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Arrive by {card.arrivalTime}</span>
                <span className="text-[10px] text-slate-400 font-normal">🛡️ {card.safetyScore}% Safe</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mo Bus Official Fare Comparison Matrix */}
      <div className="dashboard-card rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center justify-between mb-2 font-bold text-slate-800 dark:text-slate-200">
          <span>📊 Bhubaneswar Mo Bus Fare Comparison Matrix ({distanceKm} km transit):</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            CRUT Tariff Active
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <span className="font-bold text-blue-700 dark:text-blue-300 block">Mo Bus AC Electric (Route 10 / 24)</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">₹15 – ₹30 • AC Trunk Corridor</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 block">Mo Bus Non-AC Ordinary (Route 11 / 20)</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">₹10 – ₹15 • ₹5 for Student Pass</span>
          </div>
          <div className="p-2.5 rounded-xl bg-pink-50/60 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800">
            <span className="font-bold text-pink-700 dark:text-pink-300 block">Mo E-Ride / Pink Shuttle</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">₹25 – ₹40 • Zero-Emission Feeder</span>
          </div>
        </div>
      </div>

      {/* 4 Bottom Highlight Cards matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <div
          onClick={onOpenLiveUpdates}
          className="dashboard-card p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Updates</h4>
            <p className="text-[11px] text-slate-400 leading-tight">Real-time vehicle locations and delays</p>
          </div>
        </div>

        <div
          onClick={onOpenSmartAlerts}
          className="dashboard-card p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart Alerts</h4>
            <p className="text-[11px] text-slate-400 leading-tight">Get notified about delays & route changes</p>
          </div>
        </div>

        <div
          onClick={onOpenSafeJourney}
          className="dashboard-card p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Safe Journey</h4>
            <p className="text-[11px] text-slate-400 leading-tight">Share your trip and stay safe</p>
          </div>
        </div>

        <div
          onClick={onOpenSaveMore}
          className="dashboard-card p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Save More</h4>
            <p className="text-[11px] text-slate-400 leading-tight">Compare routes and save on travel</p>
          </div>
        </div>
      </div>
    </div>
  );
};
