import React, { useState } from 'react';
import './BusRoutes.css';
import { MO_BUS_DETAILED_ROUTES, MoBusDetailRoute } from '../../data/busRoutesData';
import { Bus, Search, Navigation, X, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface BusRoutesProps {
  onSelectRoute?: (route: MoBusDetailRoute) => void;
  onClose?: () => void;
}

export const BusRoutes: React.FC<BusRoutesProps> = ({ onSelectRoute, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const allRoutes = MO_BUS_DETAILED_ROUTES;

  // Filter routes by query (matches route number, start, destination, or ANY intermediate stop name)
  const q = searchQuery.toLowerCase().trim();

  const filteredRoutes = allRoutes.filter((r) => {
    if (!q) return true;
    return (
      r.route.toLowerCase().includes(q) ||
      r.start.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.stops.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (routeNo: string) => {
    setExpandedRoute(expandedRoute === routeNo ? null : routeNo);
  };

  return (
    <div className="bus-routes-container">
      <div className="bus-routes-header-section flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>CRUT Ama Bus Routes & Stoppages Network</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive routes connecting Bhubaneswar, Cuttack, Puri, Khordha, Jatani & Konark
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route no. or stop (e.g. 10, Patia, AIIMS, KIIT, Damana)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length > 0 ? (
        <div className="route-group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="m-0">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>Available Routes ({filteredRoutes.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Showing {filteredRoutes.length} of {allRoutes.length} total lines
            </span>
          </div>

          <div className="route-grid">
            {filteredRoutes.map((item) => {
              const isExpanded = expandedRoute === item.route;
              const stopsArray = item.stopsList || item.stops.split(',').map((s) => s.trim()).filter(Boolean);

              return (
                <div className="route-card" key={`route-${item.route}`}>
                  <div className="route-card-top">
                    <div className="route-badge">Route {item.route}</div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                      {stopsArray.length} Stops
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-blue-600 font-black">●</span>
                      <span className="truncate">{item.start}</span>
                    </div>
                    <div className="h-2.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-1 my-0.5"></div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-rose-600 font-black">●</span>
                      <span className="truncate">{item.destination}</span>
                    </div>
                  </div>

                  {/* Via Path Summary */}
                  <div className="route-path text-[11px] line-clamp-2 text-slate-600 dark:text-slate-400 mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Via: </span>
                    {stopsArray.slice(1, 6).join(' ➔ ')}
                    {stopsArray.length > 6 ? ' ...' : ''}
                  </div>

                  {/* Expand/Collapse All Stops */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.route)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline py-1 text-left"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{isExpanded ? 'Hide All Stops' : `View All ${stopsArray.length} Stoppages`}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                  </button>

                  {/* Expanded Stoppages List */}
                  {isExpanded && (
                    <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Stop-by-Stop Route Sequence:
                      </div>
                      {stopsArray.map((stop, sIdx) => (
                        <div key={sIdx} className="text-[11px] flex items-center gap-2 text-slate-700 dark:text-slate-300 py-0.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-bold flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                            {sIdx + 1}
                          </span>
                          <span className={sIdx === 0 ? 'font-bold text-blue-600' : sIdx === stopsArray.length - 1 ? 'font-bold text-rose-600' : ''}>
                            {stop}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plan Route Action */}
                  {onSelectRoute && (
                    <button
                      type="button"
                      onClick={() => onSelectRoute(item)}
                      className="route-action-btn mt-2"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Plan & View On Map (Bus {item.route})</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            No bus routes found matching "{searchQuery}"
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try searching by key stops like Master Canteen, Patia, AIIMS, Cuttack, Baramunda, or Puri.
          </p>
        </div>
      )}
    </div>
  );
};

export default BusRoutes;

