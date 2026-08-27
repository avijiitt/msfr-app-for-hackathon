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

  const filterTabs: { id: RouteMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'fastest', label: '⚡ Fastest AC', icon: Zap },
    { id: 'cheapest', label: '💰 Lowest Fare', icon: Coins },
    { id: 'eco', label: '🌿 Eco E-Ride', icon: Leaf },
    { id: 'senior', label: '🧓 Senior Friendly', icon: Accessibility },
    { id: 'weather', label: '🌧️ Weather-Aware', icon: CloudRain },
    { id: 'night', label: '🌙 Night Travel', icon: Moon },
  ];

  // Dynamic Route Generation for All Modes (3 Optimized Options per Mode)
  const getRoutesForMode = (): RouteCardOption[] => {
    if (activeFilterMode === 'senior') {
      return [
        {
          id: 'route-senior-1',
          badge: '🧓 Top Senior Pick',
          badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
          isStar: true,
          modeType: 'senior',
          serviceType: 'Low-Floor Kneeling Mo Bus 20 (CRUT)',
          routeNumber: 'Route 20 Low-Floor',
          lineTitle: 'Low-Floor Kneeling Mo Bus 20 • Level Boarding',
          durationMins: Math.max(14, Math.round(distanceKm * 2.6)),
          transfersCount: 0,
          fareInr: 0,
          fareNote: 'Free with Senior Citizen Pass (or ₹15)',
          arrivalTime: getArrivalTime(Math.max(14, Math.round(distanceKm * 2.6))),
          co2SavedGrams: Math.round(distanceKm * 50),
          safetyScore: 99,
        },
        {
          id: 'route-senior-2',
          badge: '💺 Priority Seating',
          badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          modeType: 'senior',
          serviceType: 'Mo Bus AC Electric Express 10',
          routeNumber: 'Route 10 AC',
          lineTitle: 'Mo Bus 10 AC • Step-Free Direct Entry',
          durationMins: Math.max(12, Math.round(distanceKm * 2.4)),
          transfersCount: 0,
          fareInr: Math.max(10, Math.min(20, Math.round(5 + distanceKm * 1.0))),
          fareNote: '50% Concession with Senior ID',
          arrivalTime: getArrivalTime(Math.max(12, Math.round(distanceKm * 2.4))),
          co2SavedGrams: Math.round(distanceKm * 55),
          safetyScore: 97,
        },
        {
          id: 'route-senior-3',
          badge: '🚪 Doorstep E-Ride',
          badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          modeType: 'senior',
          serviceType: 'Mo E-Ride Assisted Auto Feeder',
          routeNumber: 'Mo E-Ride Assisted',
          lineTitle: 'Mo E-Ride Assisted Electric Auto',
          durationMins: Math.max(13, Math.round(distanceKm * 2.2)),
          transfersCount: 0,
          fareInr: Math.max(20, Math.min(35, Math.round(15 + distanceKm * 1.5))),
          fareNote: 'Direct Pickup & Drop',
          arrivalTime: getArrivalTime(Math.max(13, Math.round(distanceKm * 2.2))),
          co2SavedGrams: Math.round(distanceKm * 60),
          safetyScore: 98,
        },
      ];
    }

    if (activeFilterMode === 'weather') {
      return [
        {
          id: 'route-weather-1',
          badge: '🌧️ Monsoon Shield',
          badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
          isStar: true,
          modeType: 'weather',
          serviceType: 'Monsoon Resilient Mo Bus 10 AC',
          routeNumber: 'Route 10 Rain Shield',
          lineTitle: 'Mo Bus 10 AC • Elevated Drainage Corridor',
          durationMins: Math.max(13, Math.round(distanceKm * 2.5)),
          transfersCount: 0,
          fareInr: Math.max(15, Math.min(35, Math.round(10 + distanceKm * 1.5))),
          fareNote: '100% Covered Walkways & Stops',
          arrivalTime: getArrivalTime(Math.max(13, Math.round(distanceKm * 2.5))),
          co2SavedGrams: Math.round(distanceKm * 52),
          safetyScore: 98,
        },
        {
          id: 'route-weather-2',
          badge: '🛡️ Flood Safe Trunk',
          badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          modeType: 'weather',
          serviceType: 'All-Weather Mo Bus 24 Express',
          routeNumber: 'Route 24 Weather Trunk',
          lineTitle: 'Mo Bus 24 • High-Clearance Fleet',
          durationMins: Math.max(15, Math.round(distanceKm * 2.7)),
          transfersCount: 0,
          fareInr: Math.max(15, Math.min(30, Math.round(10 + distanceKm * 1.3))),
          fareNote: 'Bypasses Waterlogged Areas',
          arrivalTime: getArrivalTime(Math.max(15, Math.round(distanceKm * 2.7))),
          co2SavedGrams: Math.round(distanceKm * 48),
          safetyScore: 96,
        },
        {
          id: 'route-weather-3',
          badge: '☂️ Covered Feeder',
          badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          modeType: 'weather',
          serviceType: 'Weather-Protected Mo E-Ride Feeder',
          routeNumber: 'Mo E-Ride Raincover',
          lineTitle: 'Mo E-Ride Auto with Rain Shield Canopy',
          durationMins: Math.max(16, Math.round(distanceKm * 2.3)),
          transfersCount: 1,
          fareInr: Math.max(25, Math.min(40, Math.round(15 + distanceKm * 1.8))),
          fareNote: 'Full Rain Shield Protection',
          arrivalTime: getArrivalTime(Math.max(16, Math.round(distanceKm * 2.3))),
          co2SavedGrams: Math.round(distanceKm * 65),
          safetyScore: 95,
        },
      ];
    }

    if (activeFilterMode === 'night') {
      return [
        {
          id: 'route-night-1',
          badge: '🌙 24x7 Night Owl',
          badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
          isStar: true,
          modeType: 'night',
          serviceType: 'Night Owl Mo Bus Express (CRUT)',
          routeNumber: 'Route 10N / 24N Owl',
          lineTitle: 'Night Owl Mo Bus • Well-Lit CCTV Corridor',
          durationMins: Math.max(12, Math.round(distanceKm * 2.3)),
          transfersCount: 0,
          fareInr: Math.max(20, Math.min(40, Math.round(15 + distanceKm * 1.8))),
          fareNote: '24x7 GPS Tracked & Police Linked',
          arrivalTime: getArrivalTime(Math.max(12, Math.round(distanceKm * 2.3))),
          co2SavedGrams: Math.round(distanceKm * 50),
          safetyScore: 99,
        },
        {
          id: 'route-night-2',
          badge: '🌸 Pink Safe Night',
          badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
          modeType: 'night',
          serviceType: 'Women Pink Mo Bus Night Shuttle',
          routeNumber: 'Pink Safe Night',
          lineTitle: 'Pink Mo Bus • On-Board Safety Marshal',
          durationMins: Math.max(14, Math.round(distanceKm * 2.5)),
          transfersCount: 0,
          fareInr: Math.max(15, Math.min(30, Math.round(10 + distanceKm * 1.4))),
          fareNote: 'Dedicated Female Safety Marshals',
          arrivalTime: getArrivalTime(Math.max(14, Math.round(distanceKm * 2.5))),
          co2SavedGrams: Math.round(distanceKm * 60),
          safetyScore: 100,
        },
        {
          id: 'route-night-3',
          badge: '🚨 SOS-Linked Auto',
          badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          modeType: 'night',
          serviceType: 'Night Mo E-Ride Shared Feeder',
          routeNumber: 'Mo E-Ride Night',
          lineTitle: 'Night Mo E-Ride • Live Telemetry Active',
          durationMins: Math.max(13, Math.round(distanceKm * 2.0)),
          transfersCount: 0,
          fareInr: Math.max(25, Math.min(45, Math.round(15 + distanceKm * 2.0))),
          fareNote: '1-Tap SOS Helpline 112 Linked',
          arrivalTime: getArrivalTime(Math.max(13, Math.round(distanceKm * 2.0))),
          co2SavedGrams: Math.round(distanceKm * 70),
          safetyScore: 98,
        },
      ];
    }

    // Default / Fastest / Cheapest / Eco
    return [
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
  };

  const routeCards = getRoutesForMode();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4">
      {/* 6 Smart Mode Optimization Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeFilterMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onFilterModeChange(tab.id);
                const firstCard = getRoutesForMode()[0];
                if (firstCard) onSelectRoute(firstCard.id);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 border shadow-sm ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

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
