import React, { useState, useRef, useCallback } from 'react';
import { findMatchingMoBusRoutes, getNearbyLocationsAlongCorridor, getHumanReadableLocationName } from '../../data/cities/bhubaneswar';
import { indiaGeocodingService, geocodeAddressIndia, IndiaLocationResult, POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';

interface MobileTripPlannerProps {
  originQuery: string;
  destQuery: string;
  onOriginChange: (val: string) => void;
  onDestChange: (val: string) => void;
  onSearch: (origin: string, dest: string) => void;
  onSelectDestination: (dest: string) => void;
  onOpenFareCalc: () => void;
  onTrackTrip: (routeData: any) => void;
  onOriginSelected?: (result: IndiaLocationResult) => void;
  onDestSelected?: (result: IndiaLocationResult) => void;
  onOpenBusRoutes?: () => void;
  onOpenAlerts?: () => void;
  onUseLiveGps?: () => void;
  isGpsActive?: boolean;
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
  onOriginSelected,
  onDestSelected,
  onOpenBusRoutes,
  onOpenAlerts,
  onUseLiveGps,
  isGpsActive = false,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<'fastest' | 'cheapest' | 'eco'>('fastest');
  
  const [originSuggestions, setOriginSuggestions] = useState<IndiaLocationResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<IndiaLocationResult[]>([]);
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  const originDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchOrigin = useCallback((val: string) => {
    onOriginChange(val);
    const localResults = indiaGeocodingService.searchLocations(val);
    setOriginSuggestions(localResults.length > 0 ? localResults : POPULAR_INDIAN_LOCATIONS.slice(0, 6));

    if (originDebounce.current) clearTimeout(originDebounce.current);
    if (!val || val.length < 2) return;

    setIsOriginLoading(true);
    originDebounce.current = setTimeout(async () => {
      const apiResults = await geocodeAddressIndia(val);
      if (apiResults.length > 0) {
        const merged = [...apiResults, ...localResults].filter(
          (item, idx, arr) => arr.findIndex(x => Math.abs(x.lat - item.lat) < 0.001 && Math.abs(x.lng - item.lng) < 0.001) === idx
        ).slice(0, 8);
        setOriginSuggestions(merged);
      }
      setIsOriginLoading(false);
    }, 400);
  }, [onOriginChange]);

  const searchDest = useCallback((val: string) => {
    onDestChange(val);
    const localResults = indiaGeocodingService.searchLocations(val);
    setDestSuggestions(localResults.length > 0 ? localResults : POPULAR_INDIAN_LOCATIONS.slice(0, 6));

    if (destDebounce.current) clearTimeout(destDebounce.current);
    if (!val || val.length < 2) return;

    setIsDestLoading(true);
    destDebounce.current = setTimeout(async () => {
      const apiResults = await geocodeAddressIndia(val);
      if (apiResults.length > 0) {
        const merged = [...apiResults, ...localResults].filter(
          (item, idx, arr) => arr.findIndex(x => Math.abs(x.lat - item.lat) < 0.001 && Math.abs(x.lng - item.lng) < 0.001) === idx
        ).slice(0, 8);
        setDestSuggestions(merged);
      }
      setIsDestLoading(false);
    }, 400);
  }, [onDestChange]);

  const handleSelectOrigin = (item: IndiaLocationResult) => {
    onOriginChange(item.name);
    setIsOriginFocused(false);
    onOriginSelected?.(item);
    onSearch(item.name, destQuery);
  };

  const handleSelectDest = (item: IndiaLocationResult) => {
    onDestChange(item.name);
    setIsDestFocused(false);
    onDestSelected?.(item);
    onSearch(originQuery, item.name);
  };

  const handleSwap = () => {
    const temp = originQuery;
    onOriginChange(destQuery);
    onDestChange(temp);
    onSearch(destQuery, temp);
  };

  const handleRequestLiveGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('❌ Geolocation is not supported on this device');
      setTimeout(() => setGpsStatusMessage(null), 3500);
      return;
    }

    setIsLocatingGps(true);
    setGpsStatusMessage('🛰️ Requesting device GPS permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);
        const readable = getHumanReadableLocationName(lat, lng);
        const cleanName = `Current Location (${readable.replace('Pinned Location ', '')})`;
        
        onOriginChange(cleanName);
        setIsOriginFocused(false);

        const customLoc: IndiaLocationResult = {
          id: `gps-${Date.now()}`,
          name: cleanName,
          city: 'Bhubaneswar',
          state: 'Odisha',
          lat,
          lng,
          type: 'custom',
          formattedAddress: `Live GPS Position: ${readable} (Accuracy: ±${accuracy}m)`,
        };

        onOriginSelected?.(customLoc);
        onSearch(cleanName, destQuery || 'KIIT Square');
        onUseLiveGps?.();

        setGpsStatusMessage(`✅ GPS Locked: ${readable} (±${accuracy}m)`);
        setIsLocatingGps(false);
        setTimeout(() => setGpsStatusMessage(null), 4000);
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === 1) {
          setGpsStatusMessage('⚠️ Location permission denied. Please allow GPS access in browser settings.');
        } else {
          setGpsStatusMessage('⚠️ Could not acquire GPS signal. Using fallback city location.');
        }
        setTimeout(() => setGpsStatusMessage(null), 4500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const matchedBus = findMatchingMoBusRoutes(originQuery, destQuery);
  const primaryRoute = matchedBus.primarySuggestion?.route || '09';
  const altRoute = matchedBus.directRoutes[1]?.route || matchedBus.connectedRoutes[0]?.route || '10';

  const cleanFrom = originQuery ? originQuery.split(',')[0].trim() : 'Jayadev Vihar';
  const cleanTo = destQuery ? destQuery.split(',')[0].trim() : 'Near Niladri Vihar';

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'university': return 'school';
      case 'station': return 'directions_transit';
      case 'hospital': return 'local_hospital';
      case 'airport': return 'flight';
      case 'metro': return 'subway';
      default: return 'location_on';
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-28 px-3.5 pt-3">
      <div className="relative z-30">
        <div className="neumorphic-inset rounded-2xl p-3.5 flex flex-col gap-2.5 relative border border-slate-200/60 dark:border-slate-800/80 bg-[#f7f9fb] dark:bg-slate-900/90 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]" data-icon="my_location">
              my_location
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400 block leading-none">
                ORIGIN (FROM)
              </span>
              <input
                type="text"
                value={originQuery}
                onFocus={() => {
                  setIsOriginFocused(true);
                  setIsDestFocused(false);
                  if (originSuggestions.length === 0) {
                    setOriginSuggestions(POPULAR_INDIAN_LOCATIONS.slice(0, 6));
                  }
                }}
                onChange={(e) => searchOrigin(e.target.value)}
                placeholder="Search departure stop, college, station..."
                className="bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 w-full placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={handleRequestLiveGPS}
              disabled={isLocatingGps}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 shadow-2xs ${
                isGpsActive || isLocatingGps
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              }`}
              title="Use Live GPS Location"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isLocatingGps ? 'sync' : 'near_me'}
              </span>
              <span>{isLocatingGps ? 'GPS...' : 'GPS'}</span>
            </button>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 ml-7"></div>

          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-500 text-[20px]" data-icon="location_on">
              location_on
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-rose-600 dark:text-rose-400 block leading-none">
                DESTINATION (TO)
              </span>
              <input
                type="text"
                value={destQuery}
                onFocus={() => {
                  setIsDestFocused(true);
                  setIsOriginFocused(false);
                  if (destSuggestions.length === 0) {
                    setDestSuggestions(POPULAR_INDIAN_LOCATIONS.slice(0, 6));
                  }
                }}
                onChange={(e) => searchDest(e.target.value)}
                placeholder="Search destination stop, landmark, college..."
                className="bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md active:scale-90 transition-transform bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            title="Swap locations"
          >
            <span className="material-symbols-outlined text-[20px]">swap_vert</span>
          </button>
        </div>

        {gpsStatusMessage && (
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{gpsStatusMessage}</span>
          </div>
        )}

        {isOriginFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Origin Suggestions</span>
              {isOriginLoading && <span className="text-blue-600 animate-spin">⟳</span>}
              <button 
                onClick={() => setIsOriginFocused(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <button
              onClick={handleRequestLiveGPS}
              className="w-full text-left px-3 py-2 rounded-xl mb-1 flex items-center gap-2.5 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs transition active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
                📍
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold flex items-center gap-1">
                  <span>Use Live GPS Location</span>
                  <span className="text-[10px] bg-blue-200 dark:bg-blue-800 px-1.5 py-0.2 rounded-full">Fast</span>
                </div>
                <div className="text-[11px] text-blue-600/80 dark:text-blue-400 truncate">
                  Auto-detect exact GPS coordinates & nearest Mo Bus bay
                </div>
              </div>
            </button>

            {originSuggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectOrigin(item)}
                className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    {getTypeIcon(item.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.formattedAddress || `${item.city}, ${item.state}`}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[16px]">
                  north_west
                </span>
              </button>
            ))}
          </div>
        )}

        {isDestFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Destination Suggestions</span>
              {isDestLoading && <span className="text-blue-600 animate-spin">⟳</span>}
              <button 
                onClick={() => setIsDestFocused(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            {destSuggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectDest(item)}
                className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    {getTypeIcon(item.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.formattedAddress || `${item.city}, ${item.state}`}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[16px]">
                  north_west
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-3.5 rounded-2xl border border-blue-200/70 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-blue-950/40 dark:via-slate-900/80 dark:to-indigo-950/30 shadow-sm space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-extrabold shadow-sm shadow-blue-600/30">
              🚍
            </div>
            <div>
              <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Mo Bus Network & CRUT Hub</span>
                <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                  60+ Routes
                </span>
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                All lines (09–94) • AC & Non-AC • Feeder EV
              </span>
            </div>
          </div>

          {onOpenBusRoutes && (
            <button
              onClick={onOpenBusRoutes}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1"
            >
              <span>Explore</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={onOpenBusRoutes}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-left hover:border-blue-500 transition active:scale-95 shadow-2xs"
          >
            <span className="material-symbols-outlined text-blue-600 text-[18px] block mb-0.5">
              route
            </span>
            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              All 60+ Routes
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">
              Routes 09–94
            </div>
          </button>

          <button
            onClick={onOpenFareCalc}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-left hover:border-blue-500 transition active:scale-95 shadow-2xs"
          >
            <span className="material-symbols-outlined text-emerald-600 text-[18px] block mb-0.5">
              calculate
            </span>
            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Fare Calculator
            </div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
              ₹5 Pass / Stages
            </div>
          </button>

          <button
            onClick={handleRequestLiveGPS}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-left hover:border-blue-500 transition active:scale-95 shadow-2xs"
          >
            <span className="material-symbols-outlined text-indigo-600 text-[18px] block mb-0.5">
              gps_fixed
            </span>
            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Live GPS Pin
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">
              Accurate Bay Lock
            </div>
          </button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-3.5">
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
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Direct Ride</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[14px]">directions_bus</span>
              <span>Every 8 mins</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Arrive by 03:07 pm</span>
            <span className="flex items-center gap-1 font-medium">🛡️ 98% Safe</span>
          </div>
        </div>

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
              <span className="material-symbols-outlined text-[14px]">savings</span>
              <span>Cheapest Route</span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              Mo Bus {altRoute}: Non-AC Ordinary
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Mo Bus Regular (Route {altRoute})
            </p>
          </div>

          <div className="flex justify-between items-end mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">18</span>
              <span className="text-xs font-bold text-slate-500">min</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹10</span>
              <span className="text-[10px] text-slate-500 font-semibold">₹5 with Student Pass</span>
            </div>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-0.5"></div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Direct Route</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Every 12 mins</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Arrive by 03:13 pm</span>
            <span className="flex items-center gap-1 font-medium">🛡️ 99% Safe</span>
          </div>
        </div>
      </div>

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
