import React, { useState } from 'react';
import './BusRoutes.css';
import { STANDARD_MO_BUS_ROUTES, SPECIAL_MO_BUS_ROUTES, MoBusRouteInfo } from '../../data/cities/bhubaneswar';
import { Bus, Search, Sparkles, Navigation, X } from 'lucide-react';

interface BusRoutesProps {
  onSelectRoute?: (route: MoBusRouteInfo) => void;
  onClose?: () => void;
}

export const BusRoutes: React.FC<BusRoutesProps> = ({ onSelectRoute, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const allRoutes = STANDARD_MO_BUS_ROUTES;
  const specialRoutes = SPECIAL_MO_BUS_ROUTES;

  // Filter routes by query
  const q = searchQuery.toLowerCase().trim();

  const filteredStandard = allRoutes.filter(
    (r) => r.route.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
  );

  const filteredSpecial = specialRoutes.filter(
    (r) => r.route.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
  );

  return (
    <div className="bus-routes-container">
      <div className="bus-routes-header-section flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>All City Bus Routes & Locations (CRUT Mo Bus)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official 82+ Mo Bus Lines connecting Bhubaneswar, Cuttack, Puri, Khordha, Jatani & Konark
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route no. or place (e.g. 10, Airport, Puri, AIIMS)..."
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

      {/* Special/Alphanumeric Routes */}
      {filteredSpecial.length > 0 && (
        <div className="route-group">
          <h3>
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Special & Heritage Routes ({filteredSpecial.length})</span>
          </h3>
          <div className="route-grid">
            {filteredSpecial.map((item, index) => (
              <div className="route-card" key={`spc-${index}`}>
                <div className="route-card-top">
                  <div className="route-badge special-badge">Route {item.route}</div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                    Heritage Express
                  </span>
                </div>
                <div className="route-path">{item.path}</div>
                {onSelectRoute && (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(item)}
                    className="route-action-btn"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Plan Route With Bus {item.route}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Routes */}
      {filteredStandard.length > 0 && (
        <div className="route-group">
          <h3>
            <Bus className="w-4 h-4 text-blue-600" />
            <span>Standard City Transit Routes ({filteredStandard.length})</span>
          </h3>
          <div className="route-grid">
            {filteredStandard.map((item, index) => (
              <div className="route-card" key={`std-${index}`}>
                <div className="route-card-top">
                  <div className="route-badge">Route {item.route}</div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                    Daily Service
                  </span>
                </div>
                <div className="route-path">{item.path}</div>
                {onSelectRoute && (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(item)}
                    className="route-action-btn"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Plan Route With Bus {item.route}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredStandard.length === 0 && filteredSpecial.length === 0 && (
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
