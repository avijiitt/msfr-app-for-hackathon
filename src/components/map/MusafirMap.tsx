import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus, LocateFixed, Plus, Minus,
  Clock, WifiOff, Layers, X, Navigation
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';
import { getHumanReadableLocationName } from '../../data/cities/bhubaneswar';

// Fix leaflet default marker paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Neon Bus Icon
const createVehicleIcon = (vehicle: Vehicle) => {
  const isDelayed = vehicle.delaySeconds > 60;
  const isPink = vehicle.routeId === 'PINK-EV';
  const isMetro = vehicle.mode === 'metro';
  const isTrain = vehicle.mode === 'train';
  const emoji = isPink ? '🌸' : isMetro ? '🚇' : isTrain ? '🚆' : '🚍';
  const ringColor = isDelayed ? '#ef4444' : isPink ? '#ec4899' : isMetro ? '#f59e0b' : '#3b82f6';

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 34px; 
          height: 34px; 
          border-radius: 50%; 
          background: #0f172a; 
          border: 2px solid ${ringColor}; 
          box-shadow: 0 0 12px ${ringColor}80;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 16px;
        ">
          ${emoji}
        </div>
        <div style="
          position: absolute; 
          bottom: -14px; 
          background: rgba(15, 23, 42, 0.95); 
          color: #f8fafc; 
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px; 
          font-weight: 800; 
          padding: 1px 5px; 
          border-radius: 4px; 
          border: 1px solid rgba(59, 130, 246, 0.4); 
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        ">
          ${vehicle.speedKmH} km/h ${isDelayed ? '<span style="color:#f87171">+' + Math.round(vehicle.delaySeconds/60) + 'm</span>' : ''}
        </div>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 22],
  });
};

// Custom Origin / Destination Pin Icons
const createLocationPinIcon = (type: 'origin' | 'dest', label: string) => {
  const isOrigin = type === 'origin';
  const color = isOrigin ? '#2563eb' : '#e11d48';
  return L.divIcon({
    className: 'custom-route-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          padding: 3px 8px; 
          background: #ffffff; 
          color: #0f172a; 
          font-weight: 800; 
          font-size: 10px; 
          border-radius: 6px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 1.5px solid ${color};
          white-space: nowrap;
          margin-bottom: 2px;
        ">
          ${label}
        </div>
        <div style="
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          background: ${color}; 
          border: 3px solid #ffffff; 
          box-shadow: 0 0 10px ${color}80;
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: #ffffff;
          font-size: 12px;
          font-weight: 900;
        ">
          ${isOrigin ? 'A' : 'B'}
        </div>
      </div>
    `,
    iconSize: [80, 50],
    iconAnchor: [40, 48],
  });
};

// Custom User GPS Location Pin
const createUserPinIcon = (isRealGps: boolean) => {
  const color = isRealGps ? '#06b6d4' : '#3b82f6';
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 0 12px ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MusafirMapProps {
  vehicles: Vehicle[];
  userLocation: LiveLocationData;
  onSelectLocationOnMap: (lat: number, lng: number, name?: string, type?: 'origin' | 'dest') => void;
  themeMode: string;
  isOffline?: boolean;
  destinationName?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  originName?: string;
  isAnyModalOpen?: boolean;
}

// Internal Map Controller Component (handles bounds, clicks & controls)
const MapController: React.FC<{
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  userLocation: LiveLocationData;
  onMapClick: (lat: number, lng: number) => void;
}> = ({ originCoords, destCoords, userLocation, onMapClick }) => {
  const map = useMap();
  const prevBoundsRef = useRef<string>('');

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (originCoords && destCoords) {
      const boundsKey = `${originCoords[0]},${originCoords[1]}-${destCoords[0]},${destCoords[1]}`;
      if (prevBoundsRef.current !== boundsKey) {
        prevBoundsRef.current = boundsKey;
        const bounds = L.latLngBounds(
          [originCoords[0], originCoords[1]],
          [destCoords[0], destCoords[1]]
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else if (originCoords) {
      map.flyTo([originCoords[0], originCoords[1]], 14);
    }
  }, [originCoords, destCoords, map]);

  return null;
};

export const MusafirMap: React.FC<MusafirMapProps> = ({
  vehicles,
  userLocation,
  onSelectLocationOnMap,
  themeMode,
  isOffline = false,
  destinationName = 'Destination',
  originCoords = null,
  destCoords = null,
  originName = 'Departure',
  isAnyModalOpen = false,
}) => {
  const [isLiveFleetEnabled, setIsLiveFleetEnabled] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showBuses, setShowBuses] = useState(true);
  const [showAutos, setShowAutos] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteDirectionsResult | null>(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real road route directions
  useEffect(() => {
    let isCancelled = false;
    if (originCoords && destCoords) {
      getRouteDirections(originCoords, destCoords)
        .then((result) => {
          if (!isCancelled) {
            setRouteInfo(result);
          }
        })
        .catch(() => {});
    } else {
      setRouteInfo(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [originCoords, destCoords]);

  const defaultCenter: [number, number] = originCoords || [20.2961, 85.8245];

  const handleMapClick = (lat: number, lng: number) => {
    const locationName = getHumanReadableLocationName(lat, lng);
    onSelectLocationOnMap(lat, lng, locationName, originCoords ? 'dest' : 'origin');
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!isLiveFleetEnabled) return false;
    if (v.mode === 'bus' && !showBuses) return false;
    if (v.mode === 'auto' && !showAutos) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
      {/* Offline Mode HUD Indicator */}
      {isOffline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-amber-500/95 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>OFFLINE LOCAL TRANSIT CACHE</span>
        </div>
      )}

      {/* Top Left: Live Fleet HUD Toggle Switch */}
      {!isAnyModalOpen && (
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-[400] flex items-center gap-2">
          <button
            onClick={() => setIsLiveFleetEnabled(!isLiveFleetEnabled)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all active:scale-95 border ${
              isLiveFleetEnabled
                ? 'bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-600/30'
                : 'bg-slate-800/90 text-slate-300 border-slate-700'
            }`}
            title="Toggle Live Radar Fleet Tracking"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveFleetEnabled ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
            <span>{isLiveFleetEnabled ? 'Live Fleet: ON' : 'Live Fleet: OFF'}</span>
          </button>
        </div>
      )}

      {/* Top Center: Route Information Pill */}
      {!isAnyModalOpen && routeInfo && (
        <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-[400] max-w-[90%] sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-800 flex items-center gap-2.5 transition-all">
          <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white truncate text-[11px] sm:text-xs">
                {routeInfo.summary || 'Smart Corridor Route'}
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                Leaflet Live
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins via Smart Transit
            </div>
          </div>
        </div>
      )}

      {/* Top Right: Live Clock & Layers Options */}
      {!isAnyModalOpen && (
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-[400] flex flex-col items-end gap-1.5">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 animate-pulse" />
            <span>{currentTimeStr || 'Live Sync'}</span>
          </div>

          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 active:scale-95 transition"
            title="Map Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {isOptionsOpen && (
            <div className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center font-extrabold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
                <span>Fleet Layers</span>
                <button onClick={() => setIsOptionsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Mo Bus Fleet</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAutos}
                  onChange={(e) => setShowAutos(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Mo E-Ride / Feeder</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Leaflet MapContainer */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
      >
        <MapController
          originCoords={originCoords}
          destCoords={destCoords}
          userLocation={userLocation}
          onMapClick={handleMapClick}
        />

        {/* Tile Layer (Clean OpenStreetMap / Carto Positron & Dark Matter) */}
        {themeMode === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* User GPS Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserPinIcon(true)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-blue-600 font-bold block">Your Current Location</strong>
                <span className="text-slate-500 text-[10px]">Accuracy: ±{Math.round(userLocation.accuracy || 10)}m</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Origin Location Pin */}
        {originCoords && (
          <Marker
            position={[originCoords[0], originCoords[1]]}
            icon={createLocationPinIcon('origin', originName.split(',')[0])}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-blue-600 font-bold block">Origin Departure</strong>
                <span>{originName}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Location Pin */}
        {destCoords && (
          <Marker
            position={[destCoords[0], destCoords[1]]}
            icon={createLocationPinIcon('dest', destinationName.split(',')[0])}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-rose-600 font-bold block">Destination Arrival</strong>
                <span>{destinationName}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real Road Route Polyline */}
        {routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0 && (
          <>
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: '#2563eb',
                weight: 6,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: '#60a5fa',
                weight: 2,
                opacity: 0.9,
                dashArray: '8, 8',
              }}
            />
          </>
        )}

        {/* Live Moving Transit Vehicles */}
        {filteredVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={createVehicleIcon(v)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-blue-600 font-extrabold block text-sm">
                  {v.routeId} • {v.mode === 'bus' ? 'Mo Bus AC' : 'Mo E-Ride'}
                </strong>
                <div className="text-slate-600 dark:text-slate-300 mt-1">
                  Speed: <strong>{v.speedKmH} km/h</strong> • Occupancy: <strong className="capitalize">{v.occupancy}</strong>
                </div>
                {v.delaySeconds > 60 && (
                  <div className="text-rose-600 font-bold mt-0.5">
                    Delayed by ~{Math.round(v.delaySeconds / 60)} min
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
