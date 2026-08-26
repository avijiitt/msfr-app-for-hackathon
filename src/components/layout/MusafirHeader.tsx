import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, ArrowLeftRight, Search, Sun, Moon, Bell, LocateFixed, Wifi, WifiOff, Wallet, Navigation2, Loader2, Menu } from 'lucide-react';
import { indiaGeocodingService, geocodeAddressIndia, IndiaLocationResult, POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { ThemeMode } from '../../types/transit';

interface MusafirHeaderProps {
  originQuery: string;
  setOriginQuery: (q: string) => void;
  destQuery: string;
  setDestQuery: (q: string) => void;
  onSearch: (from: string, to: string) => void;
  onUseLiveGps: () => void;
  isGpsActive: boolean;
  isOffline: boolean;
  onToggleOffline: () => void;
  walletBalance: number;
  onOpenWallet: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenProfile: () => void;
  // NEW: emit real lat/lng when a location is selected
  onOriginSelected?: (result: IndiaLocationResult) => void;
  onDestSelected?: (result: IndiaLocationResult) => void;
  onOpenMobileMenu?: () => void;
}

export const MusafirHeader: React.FC<MusafirHeaderProps> = ({
  originQuery,
  setOriginQuery,
  destQuery,
  setDestQuery,
  onSearch,
  onUseLiveGps,
  isGpsActive,
  isOffline,
  onToggleOffline,
  walletBalance,
  onOpenWallet,
  themeMode,
  onToggleTheme,
  unreadAlertsCount,
  onOpenAlerts,
  onOpenProfile,
  onOriginSelected,
  onDestSelected,
  onOpenMobileMenu,
}) => {
  const [originSuggestions, setOriginSuggestions] = useState<IndiaLocationResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<IndiaLocationResult[]>([]);
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);

  const originDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search: first show local instant results, then fire Nominatim API
  const searchOrigin = useCallback((val: string) => {
    setOriginQuery(val);
    const localResults = indiaGeocodingService.searchLocations(val);
    setOriginSuggestions(localResults.length > 0 ? localResults : POPULAR_INDIAN_LOCATIONS.slice(0, 6));

    if (originDebounce.current) clearTimeout(originDebounce.current);
    if (!val || val.length < 3) return;

    setIsOriginLoading(true);
    originDebounce.current = setTimeout(async () => {
      const apiResults = await geocodeAddressIndia(val);
      if (apiResults.length > 0) {
        // Merge: API results first, then local matches
        const merged = [...apiResults, ...localResults].filter(
          (item, idx, arr) => arr.findIndex(x => Math.abs(x.lat - item.lat) < 0.001 && Math.abs(x.lng - item.lng) < 0.001) === idx
        ).slice(0, 8);
        setOriginSuggestions(merged);
      }
      setIsOriginLoading(false);
    }, 500);
  }, [setOriginQuery]);

  const searchDest = useCallback((val: string) => {
    setDestQuery(val);
    const localResults = indiaGeocodingService.searchLocations(val);
    setDestSuggestions(localResults.length > 0 ? localResults : POPULAR_INDIAN_LOCATIONS.slice(0, 6));

    if (destDebounce.current) clearTimeout(destDebounce.current);
    if (!val || val.length < 3) return;

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
    }, 500);
  }, [setDestQuery]);

  const handleSwap = () => {
    const temp = originQuery;
    setOriginQuery(destQuery);
    setDestQuery(temp);
    onSearch(destQuery, temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOriginFocused(false);
    setIsDestFocused(false);

    // If user typed something not yet selected, geocode both origin and destination
    const localOrig = indiaGeocodingService.searchLocations(originQuery)[0];
    if (localOrig) {
      onOriginSelected?.(localOrig);
    } else if (originQuery.length > 2 && !originQuery.includes('Current Location')) {
      geocodeAddressIndia(originQuery).then(results => {
        if (results[0]) onOriginSelected?.(results[0]);
      });
    }

    const localDest = indiaGeocodingService.searchLocations(destQuery)[0];
    if (localDest) {
      onDestSelected?.(localDest);
    } else if (destQuery.length > 2) {
      setIsDestLoading(true);
      const results = await geocodeAddressIndia(destQuery);
      setIsDestLoading(false);
      if (results[0]) onDestSelected?.(results[0]);
    }

    onSearch(originQuery, destQuery);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setIsOriginFocused(false);
      setIsDestFocused(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-6">

        {/* Brand Name + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
            onClick={() => onSearch('Current Location', 'KIIT Square, Bhubaneswar')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Navigation2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
              musafir
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 max-w-2xl bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-1.5 flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm relative"
        >
          {/* From Input */}
          <div className="relative flex-1 flex items-center min-w-0">
            <button
              type="button"
              onClick={onUseLiveGps}
              title="Use Device Live GPS"
              className={`p-1.5 rounded-lg mr-1 flex-shrink-0 transition ${
                isGpsActive
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40'
                  : 'text-slate-400 hover:text-blue-600'
              }`}
            >
              <LocateFixed className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">From</span>
              <input
                type="text"
                placeholder="Any city, address, landmark in India..."
                value={originQuery}
                onFocus={(e) => {
                  e.stopPropagation();
                  setIsOriginFocused(true);
                  setOriginSuggestions(
                    originQuery.length > 0
                      ? indiaGeocodingService.searchLocations(originQuery)
                      : POPULAR_INDIAN_LOCATIONS.slice(0, 6)
                  );
                }}
                onChange={(e) => searchOrigin(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none truncate"
                autoComplete="off"
              />
            </div>

            {/* Origin Dropdown */}
            {isOriginFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 max-h-64 overflow-y-auto space-y-0.5">
                <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    🇮🇳 Select Departure (All India)
                  </span>
                  {isOriginLoading && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                </div>
                {originSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOriginQuery(item.name);
                      setIsOriginFocused(false);
                      onOriginSelected?.(item);
                      onSearch(item.name, destQuery);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700/60 flex items-start gap-2.5 text-xs transition group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <strong className="text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">{item.name}</strong>
                      <span className="text-[10px] text-slate-400 truncate block">{item.city}, {item.state}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition flex-shrink-0"
            title="Swap Origin and Destination"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* To Input */}
          <div className="relative flex-1 flex items-center min-w-0">
            <MapPin className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">To</span>
              <input
                type="text"
                placeholder="Destination anywhere in India..."
                value={destQuery}
                onFocus={(e) => {
                  e.stopPropagation();
                  setIsDestFocused(true);
                  setDestSuggestions(
                    destQuery.length > 0
                      ? indiaGeocodingService.searchLocations(destQuery)
                      : POPULAR_INDIAN_LOCATIONS.slice(0, 6)
                  );
                }}
                onChange={(e) => searchDest(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none truncate"
                autoComplete="off"
              />
            </div>

            {/* Destination Dropdown */}
            {isDestFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 max-h-64 overflow-y-auto space-y-0.5">
                <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    🇮🇳 Select Destination (All India)
                  </span>
                  {isDestLoading && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                </div>
                {destSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDestQuery(item.name);
                      setIsDestFocused(false);
                      onDestSelected?.(item);
                      onSearch(originQuery, item.name);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-red-50 dark:hover:bg-slate-700/60 flex items-start gap-2.5 text-xs transition group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <strong className="text-slate-800 dark:text-slate-200 block truncate group-hover:text-red-600">{item.name}</strong>
                      <span className="text-[10px] text-slate-400 truncate block">{item.city}, {item.state}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            {isDestLoading || isOriginLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Offline Mode Active' : 'Online Sync Active'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="hidden md:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          <button
            onClick={onOpenWallet}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition"
            title="Open Wallet"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>₹{walletBalance.toFixed(0)}</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
            title="Toggle Dark/Light Mode"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenAlerts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition relative"
            title="Real-Time Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <div
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center cursor-pointer shadow-sm shadow-blue-500/20 hover:ring-2 hover:ring-blue-500 transition text-sm"
            title="User Profile"
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
};
