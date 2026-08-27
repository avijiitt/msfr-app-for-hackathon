import React, { useState } from 'react';
import { Bus, Train, ChevronRight, RotateCw, RefreshCw, Shield, Bell, Zap, Wallet, Star, Leaf, Accessibility, Moon, CloudRain, Coins } from 'lucide-react';
import { RouteMode } from '../../types/transit';

export interface RouteCardOption {
  id: string;
  badge: 'Recommended' | 'Cheapest' | 'Least Transfers' | 'Fastest' | 'Senior Friendly' | 'Night Safe' | 'Eco Friendly' | 'Weather Safe';
  badgeColor: string;
  isStar?: boolean;
  modeType: RouteMode;
  lineTitle: string;
  icons: { mode: 'bus' | 'metro'; color: string }[];
  durationMins: number;
  transfersCount: number;
  fareInr: number;
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

  // Format dynamic arrival times (e.g. + duration from now)
  const getArrivalTime = (durationMins: number) => {
    const d = new Date(Date.now() + durationMins * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filterTabs: { id: RouteMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'fastest', label: 'Best / Fastest', icon: Zap },
    { id: 'cheapest', label: 'Affordable / Cheapest', icon: Coins },
    { id: 'eco', label: 'Eco-Friendly', icon: Leaf },
    { id: 'senior', label: 'Senior Citizen', icon: Accessibility },
    { id: 'night', label: 'Night Safety', icon: Moon },
    { id: 'weather', label: 'Weather-Aware', icon: CloudRain },
  ];

  const allRouteCards: RouteCardOption[] = [
    {
      id: 'route-rec',
      badge: 'Recommended',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      isStar: true,
      modeType: 'fastest',
      lineTitle: `Mo Bus 10 (AC Electric Trunk) • Direct Corridor`,
      icons: distanceKm > 10 ? [
        { mode: 'bus', color: 'text-emerald-500' },
        { mode: 'metro', color: 'text-blue-600' },
      ] : [
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: Math.max(12, Math.round(distanceKm * 2.5)),
      transfersCount: distanceKm > 10 ? 1 : 0,
      fareInr: Math.max(15, Math.min(45, Math.round(10 + distanceKm * 1.8))),
      arrivalTime: getArrivalTime(Math.max(12, Math.round(distanceKm * 2.5))),
      co2SavedGrams: Math.round(distanceKm * 48),
      safetyScore: 96,
    },
    {
      id: 'route-cheap',
      badge: 'Cheapest',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      modeType: 'cheapest',
      lineTitle: `Mo Bus 11 (Non-AC Ordinary) • ₹10 Base Fare`,
      icons: [
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: Math.max(18, Math.round(distanceKm * 3.3)),
      transfersCount: 0,
      fareInr: Math.max(10, Math.min(25, Math.round(5 + distanceKm * 1.1))),
      arrivalTime: getArrivalTime(Math.max(18, Math.round(distanceKm * 3.3))),
      co2SavedGrams: Math.round(distanceKm * 38),
      safetyScore: 89,
    },
    {
      id: 'route-eco',
      badge: 'Eco Friendly',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      modeType: 'eco',
      lineTitle: `Metro Electric Corridor + Mo Bus EV Pink Shuttle`,
      icons: [
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: Math.max(15, Math.round(distanceKm * 2.7)),
      transfersCount: 1,
      fareInr: Math.max(20, Math.min(40, Math.round(15 + distanceKm * 1.6))),
      arrivalTime: getArrivalTime(Math.max(15, Math.round(distanceKm * 2.7))),
      co2SavedGrams: Math.round(distanceKm * 65),
      safetyScore: 94,
    },
    {
      id: 'route-senior',
      badge: 'Senior Friendly',
      badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      modeType: 'senior',
      lineTitle: `Low-Floor Kneeling Mo Bus 20 • Direct Level Boarding`,
      icons: [
        { mode: 'bus', color: 'text-purple-500' },
      ],
      durationMins: Math.max(16, Math.round(distanceKm * 2.8)),
      transfersCount: 0,
      fareInr: 0, // Free with Senior Transit Pass or ₹15
      arrivalTime: getArrivalTime(Math.max(16, Math.round(distanceKm * 2.8))),
      co2SavedGrams: Math.round(distanceKm * 42),
      safetyScore: 99,
    },
    {
      id: 'route-night',
      badge: 'Night Safe',
      badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      modeType: 'night',
      lineTitle: `Night Owl Express 24x7 • Well-Lit CCTV Corridor`,
      icons: [
        { mode: 'bus', color: 'text-indigo-500' },
      ],
      durationMins: Math.max(14, Math.round(distanceKm * 2.4)),
      transfersCount: 0,
      fareInr: Math.max(25, Math.min(50, Math.round(15 + distanceKm * 2.0))),
      arrivalTime: getArrivalTime(Math.max(14, Math.round(distanceKm * 2.4))),
      co2SavedGrams: Math.round(distanceKm * 40),
      safetyScore: 98,
    },
    {
      id: 'route-weather',
      badge: 'Weather Safe',
      badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      modeType: 'weather',
      lineTitle: `Flood-Resilient Skywalk & Underground Metro`,
      icons: [
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'bus', color: 'text-cyan-500' },
      ],
      durationMins: Math.max(17, Math.round(distanceKm * 2.9)),
      transfersCount: 1,
      fareInr: Math.max(20, Math.min(40, Math.round(12 + distanceKm * 1.7))),
      arrivalTime: getArrivalTime(Math.max(17, Math.round(distanceKm * 2.9))),
      co2SavedGrams: Math.round(distanceKm * 52),
      safetyScore: 95,
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-4">
      {/* Optimization Mode Filter Tabs (6 Smart Modes) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeFilterMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterModeChange(tab.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'dashboard-card text-slate-600 dark:text-slate-300 hover:border-blue-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>Best Routes for You</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
              {cleanFrom} ➔ {cleanTo} ({distanceKm} km)
            </span>
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1.5 font-medium transition"
        >
          <span>Live Fleet Sync</span>
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Horizontal Cards Grid matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {allRouteCards.slice(0, 4).map((card) => {
          const isSelected = selectedRouteId === card.id || activeFilterMode === card.modeType;
          return (
            <div
              key={card.id}
              onClick={() => {
                onSelectRoute(card.id);
                onFilterModeChange(card.modeType);
              }}
              className={`dashboard-card rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-card-hover relative ${
                isSelected
                  ? 'ring-2 ring-blue-600 dark:ring-blue-500 bg-white dark:bg-slate-800/90 shadow-md'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
                {card.isStar && (
                  <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                )}
              </div>

              {/* Connected Line Title */}
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1 mb-2.5">
                {card.lineTitle}
              </p>

              {/* Icons flow */}
              <div className="flex items-center gap-2 mb-3">
                {card.icons.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {item.mode === 'bus' ? (
                      <Bus className={`w-5 h-5 ${item.color}`} />
                    ) : (
                      <Train className={`w-5 h-5 ${item.color}`} />
                    )}
                    {idx < card.icons.length - 1 && (
                      <span className="text-xs text-slate-400 font-bold">›</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Duration & Transfers */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.durationMins} <span className="text-xs font-semibold text-slate-400">min</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  ₹{card.fareInr}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-3">
                <span>{card.transfersCount} {card.transfersCount === 1 ? 'Transfer' : 'Transfers'}</span>
                <span className="text-[10px] text-emerald-600 font-bold">🌿 {card.co2SavedGrams}g CO₂</span>
              </div>

              {/* Arrival time pill */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Arrive by {card.arrivalTime}</span>
                <span className="text-[10px] text-slate-400 font-normal">🛡️ {card.safetyScore}% Safe</span>
              </div>
            </div>
          );
        })}
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
