import React, { useState } from 'react';
import { MusafirMap } from '../map/MusafirMap';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { DeliveryWaypoint } from '../../services/logisticsOptimizerService';

interface MobileLiveMapProps {
  vehicles: Vehicle[];
  userLocation: LiveLocationData | null;
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  originQuery: string;
  destQuery: string;
  themeMode: 'light' | 'dark';
  onSelectLocationOnMap: (lat: number, lng: number, name?: string, type?: 'origin' | 'dest') => void;
  onBackToPlanner?: () => void;
  onOpenRideDetails?: () => void;
  isAnyModalOpen?: boolean;
  logisticsWaypoints?: DeliveryWaypoint[];
}

export const MobileLiveMap: React.FC<MobileLiveMapProps> = ({
  vehicles,
  userLocation,
  originCoords,
  destCoords,
  originQuery,
  destQuery,
  themeMode,
  onSelectLocationOnMap,
  onBackToPlanner,
  onOpenRideDetails,
  isAnyModalOpen = false,
  logisticsWaypoints,
}) => {
  const nearbyStops = [
    { id: '1', name: 'Jayadev Vihar Square', walkMins: 2, distanceM: 150, routes: ['Route 10', 'Route 11'] },
    { id: '2', name: 'Kalinga Hospital Square', walkMins: 5, distanceM: 400, routes: ['Route 09', 'Route 24'] },
    { id: '3', name: 'Damana Chhak / CSPUR', walkMins: 8, distanceM: 550, routes: ['Route 10', 'Route 12'] },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-130px)] overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* 1. Top Search Header Overlay on Map */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-2">
        {onBackToPlanner && (
          <button
            onClick={onBackToPlanner}
            className="p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-glass text-slate-700 dark:text-slate-200 shadow-md active:scale-95 transition border border-white/40 dark:border-slate-700"
            title="Back to Route Planner"
          >
            <span className="material-symbols-outlined text-[20px] block">arrow_back</span>
          </button>
        )}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            readOnly
            value={`${originQuery || 'Jayadev Vihar'} ➔ ${destQuery || 'Near Niladri Vihar'}`}
            className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-glass rounded-full py-2 pl-9 pr-3 text-xs font-extrabold text-slate-800 dark:text-slate-100 shadow-md border border-white/50 dark:border-slate-700 truncate outline-none cursor-pointer"
            onClick={onBackToPlanner}
          />
        </div>
      </div>

      {/* 2. Full-screen Interactive Leaflet Map */}
      <div className="flex-1 w-full h-full relative">
        <MusafirMap
          vehicles={vehicles}
          userLocation={userLocation}
          onSelectLocationOnMap={onSelectLocationOnMap}
          themeMode={themeMode}
          originCoords={originCoords}
          destCoords={destCoords}
          originName={originQuery}
          destinationName={destQuery}
          isAnyModalOpen={isAnyModalOpen}
          logisticsWaypoints={logisticsWaypoints}
        />
      </div>

      {/* 3. Glassmorphic Bottom Sheet (Nearby Stops within 500m) */}
      <div className="absolute bottom-2 left-2 right-2 z-30">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-glass rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border border-white/60 dark:border-slate-800 p-4 transition-all">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3"></div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Nearby Stops & Transit Bays</span>
            </h2>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              3 within 500m
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {nearbyStops.map((stop) => (
              <div
                key={stop.id}
                onClick={onOpenRideDetails}
                className="flex-shrink-0 w-56 bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-blue-500 transition active:scale-95"
              >
                <div className="flex items-start gap-2.5">
                  <div className="bg-blue-50 dark:bg-blue-950/60 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      directions_bus
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {stop.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                      <span>{stop.walkMins} mins ({stop.distanceM}m)</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {stop.routes.map((r) => (
                    <span
                      key={r}
                      className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
