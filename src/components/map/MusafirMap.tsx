import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Clock, WifiOff, Layers, X, Navigation, MapPin, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';
import { getHumanReadableLocationName, getNearbyLocationsAlongCorridor } from '../../data/cities/bhubaneswar';
import { findMoBusRoutesDynamic, getStopCoordinates } from '../../data/busRoutesData';

// Fix leaflet default marker paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Clean Vehicle Icon (No cherry blossom)
const createVehicleIcon = (vehicle: Vehicle) => {
  const isDelayed = vehicle.delaySeconds > 60;
  const isPink = vehicle.routeId === 'PINK-EV';
  const isMetro = vehicle.mode === 'metro';
  const isTrain = vehicle.mode === 'train';
  const emoji = isPink ? '⚡' : isMetro ? '🚇' : isTrain ? '🚆' : '🚍';
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

// Custom Black Dot Icon for Intermediate Stoppages
const createStopDotIcon = () => {
  return L.divIcon({
    className: 'custom-stop-dot',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: 9px; 
          height: 9px; 
          border-radius: 50%; 
          background: #000000; 
          border: 2px solid #ffffff; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.6);
        "></div>
      </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
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

// Internal Map Controller Component (handles bounds, animation & clicks)
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

  // Re-invalidate map container layout on mount and window resize
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (originCoords && destCoords) {
      const boundsKey = `${originCoords[0]},${originCoords[1]}-${destCoords[0]},${destCoords[1]}`;
      if (prevBoundsRef.current !== boundsKey) {
        prevBoundsRef.current = boundsKey;
        const bounds = L.latLngBounds(
          [originCoords[0], originCoords[1]],
          [destCoords[0], destCoords[1]]
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
    } else if (originCoords) {
      prevBoundsRef.current = `origin-${originCoords[0]},${originCoords[1]}`;
      map.flyTo([originCoords[0], originCoords[1]], 14, { animate: true });
    } else if (destCoords) {
      prevBoundsRef.current = `dest-${destCoords[0]},${destCoords[1]}`;
      map.flyTo([destCoords[0], destCoords[1]], 14, { animate: true });
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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showBuses, setShowBuses] = useState(true);
  const [showAutos, setShowAutos] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteDirectionsResult | null>(null);

  // Pin Choice Confirmation State
  const [pendingPinChoice, setPendingPinChoice] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

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

  // Dynamic intermediate stops for active route
  const [activeStops, setActiveStops] = useState<
    Array<{ name: string; lat: number; lng: number; index: number }>
  >([]);

  // Fetch real road route directions & calculate intermediate stoppages
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

      // Dynamically locate matching Mo Bus line and its sequence of stops
      const dynamicMatch = findMoBusRoutesDynamic(originName, destinationName);
      if (dynamicMatch.matchedRoutes.length > 0) {
        const topMatch = dynamicMatch.matchedRoutes[0];
        const sub = topMatch.subStops;
        const total = sub.length;
        const resolvedStops = sub.map((stopName, sIdx) => {
          const [sLat, sLng] = getStopCoordinates(
            stopName,
            originCoords,
            destCoords,
            sIdx,
            total
          );
          return {
            name: stopName,
            lat: sLat,
            lng: sLng,
            index: sIdx + 1,
          };
        });
        setActiveStops(resolvedStops);
      } else {
        // Fallback: corridor localities along the line
        const corridor = getNearbyLocationsAlongCorridor(
          originName,
          destinationName,
          { lat: originCoords[0], lng: originCoords[1] },
          { lat: destCoords[0], lng: destCoords[1] }
        );
        const resolved = corridor.map((loc, sIdx) => ({
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          index: sIdx + 1,
        }));
        setActiveStops(resolved);
      }
    } else {
      setRouteInfo(null);
      setActiveStops([]);
    }
    return () => {
      isCancelled = true;
    };
  }, [originCoords, destCoords, originName, destinationName]);


  const defaultCenter: [number, number] = originCoords || [20.2961, 85.8245];

  // User clicked on map -> ask whether to set as Origin or Destination
  const handleMapClick = (lat: number, lng: number) => {
    const locationName = getHumanReadableLocationName(lat, lng);
    setPendingPinChoice({ lat, lng, name: locationName });
  };

  const handleConfirmPin = (type: 'origin' | 'dest') => {
    if (!pendingPinChoice) return;
    onSelectLocationOnMap(pendingPinChoice.lat, pendingPinChoice.lng, pendingPinChoice.name, type);
    setPendingPinChoice(null);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (isOffline) return false;
    if (v.mode === 'bus' && !showBuses) return false;
    if (v.mode === 'auto' && !showAutos) return false;
    return true;
  });

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[480px] lg:min-h-[520px] rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
      {/* 1. Offline Mode Notice Banner (Shows ONLY downloaded route) */}
      {isOffline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/95 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl flex items-center gap-2 backdrop-blur-md border border-amber-400/60 animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>📥 Offline Mode: Downloaded Local Route Cache</span>
        </div>
      )}

      {/* 2. Route Distance Pill (Placed cleanly below mobile search bar at top-15, centered on desktop at sm:top-3) */}
      {!isAnyModalOpen && routeInfo && !isOffline && (
        <div className="absolute top-15 sm:top-3 left-3 sm:left-1/2 sm:-translate-x-1/2 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 transition-all max-w-[190px] sm:max-w-none">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
          </div>
          <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">
            {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins
          </div>
        </div>
      )}

      {/* 3. Live Clock & Layers (Placed at top-15 on mobile, sm:top-3 on desktop) */}
      {!isAnyModalOpen && !isOffline && (
        <div className="absolute top-15 sm:top-3 right-3 z-[400] flex flex-col items-end gap-1.5">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 animate-pulse" />
            <span className="hidden xs:inline">{currentTimeStr || 'Live Sync'}</span>
            <span className="xs:hidden">{currentTimeStr ? currentTimeStr.split(',')[1]?.trim() || currentTimeStr : 'Live'}</span>
          </div>

          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 active:scale-95 transition shadow-xs"
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

      {/* 4. Interactive Map Pin Confirmation Dialog Modal */}
      {pendingPinChoice && (
        <div className="absolute inset-0 z-[500] bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                MAP LOCATION CLICKED
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                {pendingPinChoice.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                What would you like to set this location as?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleConfirmPin('origin')}
                className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>Set as Origin</span>
              </button>

              <button
                onClick={() => handleConfirmPin('dest')}
                className="py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>Set as Dest</span>
              </button>
            </div>

            <button
              onClick={() => setPendingPinChoice(null)}
              className="w-full py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 5. Leaflet Map Container */}
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

        {/* Tile Layer (Clean OpenStreetMap with dark-tiles CSS filter for zero-key dark mode) */}
        {!isOffline && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className={themeMode === 'dark' ? 'dark-tiles' : ''}
          />
        )}

        {/* Offline Vector Grid Background */}
        {isOffline && (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center pointer-events-none">
            <div className="text-center p-6 text-slate-400 space-y-2">
              <WifiOff className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <div className="text-sm font-bold text-white">Local Offline Cache Active</div>
              <div className="text-xs">Showing saved transit route corridor & stops</div>
            </div>
          </div>
        )}

        {/* User GPS Location Marker */}
        {!isOffline && userLocation && userLocation.lat && userLocation.lng && (
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

        {/* Route Polyline (Road Route or Connected Stoppages) */}
        {routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0 ? (
          <>
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: isOffline ? '#10b981' : '#2563eb',
                weight: 6,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: isOffline ? '#6ee7b7' : '#60a5fa',
                weight: 2,
                opacity: 0.9,
                dashArray: '8, 8',
              }}
            />
          </>
        ) : (
          activeStops.length > 1 && (
            <Polyline
              positions={activeStops.map((s) => [s.lat, s.lng] as [number, number])}
              pathOptions={{
                color: isOffline ? '#10b981' : '#2563eb',
                weight: 5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )
        )}

        {/* Intermediate Bus Stoppages (Marked as Black Dots with Connected Route Line) */}
        {activeStops.map((stop) => (
          <Marker
            key={`stop-dot-${stop.index}-${stop.name}`}
            position={[stop.lat, stop.lng]}
            icon={createStopDotIcon()}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide block">
                  Mo Bus Stoppage #{stop.index}
                </span>
                <strong className="text-slate-900 dark:text-white font-bold block mt-0.5">
                  {stop.name}
                </strong>
              </div>
            </Popup>
          </Marker>
        ))}


        {/* Live Moving Transit Vehicles (Online only) */}
        {!isOffline && filteredVehicles.map((v) => (
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
