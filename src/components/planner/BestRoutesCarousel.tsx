import React, { useState } from 'react';
import { Bus, Train, ChevronRight, RotateCw, RefreshCw, Shield, Bell, Zap, Wallet, Star, Leaf, Accessibility, Moon, CloudRain, Coins } from 'lucide-react';
import { RouteMode } from '../../types/transit';

export interface RouteCardOption {
  id: string;
  badge: 'Recommended' | 'Cheapest' | 'Least Transfers' | 'Fastest' | 'Senior Friendly' | 'Night Safe' | 'Eco Friendly' | 'Weather Safe';
  badgeColor: string;
  isStar?: boolean;
  modeType: RouteMode;
  icons: { mode: 'bus' | 'metro'; color: string }[];
  durationMins: number;
  transfersCount: number;
  fareInr: number;
  arrivalTime: string;
  co2SavedGrams: number;
  safetyScore: number;
}

interface BestRoutesCarouselProps {
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
      icons: [
        { mode: 'bus', color: 'text-emerald-500' },
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'bus', color: 'text-red-500' },
      ],
      durationMins: 42,
      transfersCount: 2,
      fareInr: 35,
      arrivalTime: '10:45 AM',
      co2SavedGrams: 420,
      safetyScore: 95,
    },
    {
      id: 'route-cheap',
      badge: 'Cheapest',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      modeType: 'cheapest',
      icons: [
        { mode: 'bus', color: 'text-emerald-500' },
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: 55,
      transfersCount: 1,
      fareInr: 20,
      arrivalTime: '10:58 AM',
      co2SavedGrams: 310,
      safetyScore: 88,
    },
    {
      id: 'route-eco',
      badge: 'Eco Friendly',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      modeType: 'eco',
      icons: [
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: 46,
      transfersCount: 1,
      fareInr: 30,
      arrivalTime: '10:49 AM',
      co2SavedGrams: 580,
      safetyScore: 92,
    },
    {
      id: 'route-senior',
      badge: 'Senior Friendly',
      badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      modeType: 'senior',
      icons: [
        { mode: 'bus', color: 'text-emerald-500' },
        { mode: 'bus', color: 'text-emerald-500' },
      ],
      durationMins: 48,
      transfersCount: 1,
      fareInr: 25,
      arrivalTime: '10:51 AM',
      co2SavedGrams: 350,
      safetyScore: 98,
    },
    {
      id: 'route-night',
      badge: 'Night Safe',
      badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      modeType: 'night',
      icons: [
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'bus', color: 'text-red-500' },
      ],
      durationMins: 40,
      transfersCount: 1,
      fareInr: 38,
      arrivalTime: '10:43 AM',
      co2SavedGrams: 410,
      safetyScore: 99,
    },
    {
      id: 'route-weather',
      badge: 'Weather Safe',
      badgeColor: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      modeType: 'weather',
      icons: [
        { mode: 'metro', color: 'text-blue-600' },
        { mode: 'metro', color: 'text-blue-600' },
      ],
      durationMins: 38,
      transfersCount: 1,
      fareInr: 40,
      arrivalTime: '10:41 AM',
      co2SavedGrams: 460,
      safetyScore: 96,
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
          Best Routes for You
        </h2>
        <button
          onClick={handleRefresh}
          className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1.5 font-medium transition"
        >
          <span>Updated just now</span>
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
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
                {card.isStar && (
                  <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                )}
              </div>

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
