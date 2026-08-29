import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus, LocateFixed, Plus, Minus,
  Clock, WifiOff, Layers, X, MapPin, Zap
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';
import { getHumanReadableLocationName } from '../../data/cities/bhubaneswar';

// Fix default Leaflet icon assets
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom DivIcons for Active Fleet
const createVehicleIcon = (vehicle: Vehicle) => {
  const isMetro = vehicle.mode === 'metro';
  const isAuto = vehicle.mode === 'auto';
  const isCab = vehicle.name.toLowerCase().includes('cab');

  let bg = '#10B981'; // Green for Bus
  let label = '🚍';

  if (isMetro) {
    bg = '#2563EB'; // Blue for Metro
    label = '🚇';
  } else if (isCab) {
    bg = '#F59E0B'; // Amber for Cab
    label = '🚕';
  } else if (isAuto) {
    bg = '#0D9488'; // Teal for EV Auto
    label = '🛺';
  }

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${bg};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const createPinIcon = (color: string, emoji: string, title: string, subtitle?: string) =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        ">
          ${emoji}
        </div>
        <div style="
          background: #ffffff;
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 1px solid #e2e8f0;
          margin-top: 3px;
          max-width: 170px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${title}
          ${subtitle ? `<span style="font-weight:500; color:#64748b; font-size:10px; display:block;">${subtitle}</span>` : ''}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

// Map View Controller that handles smooth pan, zoom, and bounds fitting without resetting user manual zoom
function MapViewController({
  center,
  zoom,
  bounds,
}: {
  center: [number, number];
  zoom: number;
  bounds: [number, number][] | null;
}) {
  const map = useMap();
  const prevBoundsKeyRef = useRef<string>('');
  const prevCenterKeyRef = useRef<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.length >= 2 && bounds[0] && bounds[1]) {
      const boundsKey = `${bounds[0][0].toFixed(3)},${bounds[0][1].toFixed(3)}-${bounds[1][0].toFixed(3)},${bounds[1][1].toFixed(3)}`;
      if (prevBoundsKeyRef.current !== boundsKey) {
        prevBoundsKeyRef.current = boundsKey;
        try {
          const leafletBounds = L.latLngBounds(bounds.map(([lat, lng]) => [lat, lng]));
          map.fitBounds(leafletBounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
            duration: 0.8,
          });
        } catch {}
      }
    } else if (center) {
      const centerKey = `${center[0].toFixed(3)},${center[1].toFixed(3)}`;
      if (prevCenterKeyRef.current !== centerKey) {
        prevCenterKeyRef.current = centerKey;
        try {
          map.flyTo(center, zoom, { duration: 0.8 });
        } catch {}
      }
    }
  }, [map, center, zoom, bounds]);

  return null;
}

// Click listener to pick places on map
function MapClickHandler({
  onSelectLocation,
  originCoords,
}: {
  onSelectLocation: (lat: number, lng: number, name?: string, type?: 'origin' | 'dest') => void;
  originCoords: [number, number] | null;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const locationName = getHumanReadableLocationName(lat, lng);
      onSelectLocation(lat, lng, locationName, originCoords ? 'dest' : 'origin');
    },
  });
  return null;
}

// Floating Zoom & GPS controls
function ZoomControls({ onLocate }: { onLocate: () => void }) {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-2">
      <button
        onClick={onLocate}
        className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-md"
        title="Locate Me (GPS)"
      >
        <LocateFixed className="w-5 h-5" />
      </button>

      <div className="flex flex-col rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

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
  const [showTraffic, setShowTraffic] = useState(true);
  const [isLiveFleetEnabled, setIsLiveFleetEnabled] = useState(true);
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

  // Determine initial center and zoom
  let mapCenter: [number, number] = [20.2961, 85.8245];
  let mapZoom = 13;
  let activeBounds: [number, number][] | null = null;

  if (originCoords && destCoords) {
    mapCenter = [
      (originCoords[0] + destCoords[0]) / 2,
      (originCoords[1] + destCoords[1]) / 2,
    ];
    activeBounds = [originCoords, destCoords];
  } else if (destCoords) {
    mapCenter = destCoords;
    mapZoom = 14;
  } else if (originCoords) {
    mapCenter = originCoords;
    mapZoom = 14;
  } else if (userLocation && userLocation.lat && userLocation.lat !== 20.3039) {
    mapCenter = [userLocation.lat, userLocation.lng];
    mapZoom = 14;
  }

  // Filter vehicles based on active layers
  const visibleVehicles = vehicles.filter((v) => {
    if (v.mode === 'bus' && !showBuses) return false;
    if (v.mode === 'auto' && !showAutos) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 transition-all bg-slate-100 dark:bg-slate-900">
      {/* Offline Banner */}
      {isOffline && !isAnyModalOpen && (
        <div className="absolute top-0 left-0 right-0 z-[400] bg-amber-500 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>Offline Navigation Mode — Preloaded Bhubaneswar Mo Bus Corridor Active</span>
        </div>
      )}

      {/* Top Left: Route Mode Badge */}
      {!isAnyModalOpen && routeInfo && (
        <div
          className={`absolute ${
            isOffline ? 'top-10' : 'top-2.5 sm:top-3'
          } left-2.5 sm:left-4 z-[400] max-w-[calc(100%-85px)] sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-xs flex items-center gap-2 sm:gap-2.5 transition-all`}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex-shrink-0 flex items-center justify-center shadow-sm">
            <Bus className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white truncate text-[11px] sm:text-xs">
                {routeInfo.summary || 'Smart Corridor Route'}
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                Verified Route
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins via Smart Transit
            </div>
          </div>
        </div>
      )}

      {/* Top Right: Live Clock & Live Transit Badge (Neutral, NO third-party branding) */}
      {!isAnyModalOpen && (
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-4 z-[400] flex flex-col items-end gap-1.5">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 animate-pulse" />
            <span className="font-mono tracking-tight">{currentTimeStr || 'Live Transit'}</span>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <span>⚡ Live Transit Radar</span>
          </div>
        </div>
      )}

      {/* Floating Layer Controls (Top Left below route badge) */}
      {!isAnyModalOpen && (
        <div className="absolute top-16 left-2.5 sm:left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-xs">
          {isOptionsOpen ? (
            <div className="space-y-1.5 min-w-[140px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Map Layers</span>
                </span>
                <button
                  onClick={() => setIsOptionsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-3.5 h-3.5"
                />
                <span>Mo Bus Fleet</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showAutos}
                  onChange={(e) => setShowAutos(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-3.5 h-3.5"
                />
                <span>Mo E-Ride / Autos</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showTraffic}
                  onChange={(e) => setShowTraffic(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-3.5 h-3.5"
                />
                <span>Live Traffic Flow</span>
              </label>
            </div>
          ) : (
            <button
              onClick={() => setIsOptionsOpen(true)}
              className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 text-[11px] hover:text-blue-600 px-1 py-0.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="hidden xs:inline">Layers</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Left: Live GPS Fleet Radar HUD with Interactive ON/OFF Switch */}
      {!isAnyModalOpen && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 text-xs flex items-center gap-2.5 transition-all">
          <button
            type="button"
            onClick={() => setIsLiveFleetEnabled(!isLiveFleetEnabled)}
            className="flex items-center gap-2 cursor-pointer group"
            title={isLiveFleetEnabled ? 'Click to Turn Off Live Fleet GPS' : 'Click to Turn On Live Fleet GPS'}
          >
            {isLiveFleetEnabled ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
            )}
            <div className="text-left">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                {isLiveFleetEnabled
                  ? `Live Fleet: ON (${visibleVehicles.length} Moving)`
                  : 'Live Fleet: OFF (Paused)'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsLiveFleetEnabled(!isLiveFleetEnabled)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              isLiveFleetEnabled
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {isLiveFleetEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Main High-Performance Interactive Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={`w-full h-full ${themeMode === 'dark' ? 'dark-tiles' : ''}`}
        zoomControl={false}
      >
        <MapViewController
          center={mapCenter}
          zoom={mapZoom}
          bounds={activeBounds}
        />

        <MapClickHandler
          onSelectLocation={onSelectLocationOnMap}
          originCoords={originCoords}
        />

        {!isAnyModalOpen && (
          <ZoomControls
            onLocate={() => {
              if (userLocation && userLocation.lat) {
                onSelectLocationOnMap(userLocation.lat, userLocation.lng, 'Current Location (GPS)', 'origin');
              }
            }}
          />
        )}

        {/* High-Definition Vector / Raster Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url={
            themeMode === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
          maxZoom={19}
        />

        {/* User GPS Location Marker */}
        {userLocation && userLocation.lat && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
                  <div style="position:absolute; width:22px; height:22px; border-radius:50%; background:#3B82F6; opacity:0.4; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                  <div style="width:14px; height:14px; border-radius:50%; background:#2563EB; border:2.5px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })}
          >
            <Popup>
              <div className="p-1 text-xs font-sans">
                <strong className="text-blue-600 block">Your Current Location</strong>
                <span className="text-[11px] text-slate-500">Live GPS Signal Active</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Origin Pin */}
        {originCoords && (
          <Marker
            position={originCoords}
            icon={createPinIcon('#10B981', '🟢', originName || 'Departure', 'Trip Origin')}
          >
            <Popup>
              <div className="p-1 text-xs font-sans">
                <strong className="text-emerald-600 block">🟢 {originName || 'Departure'}</strong>
                <span className="text-[11px] text-slate-500">Origin / Boarding Station</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destCoords && (
          <Marker
            position={destCoords}
            icon={createPinIcon('#EF4444', '📍', destinationName || 'Destination', 'Trip Destination')}
          >
            <Popup>
              <div className="p-1 text-xs font-sans">
                <strong className="text-rose-600 block">📍 {destinationName || 'Destination'}</strong>
                <span className="text-[11px] text-slate-500">Final Destination</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Road Route Polyline */}
        {routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0 && (
          <Polyline
            positions={routeInfo.coordinates}
            pathOptions={{
              color: '#2563EB',
              weight: 5,
              opacity: 0.85,
              lineJoin: 'round',
            }}
          />
        )}

        {/* Direct route polyline fallback */}
        {!routeInfo && originCoords && destCoords && (
          <Polyline
            positions={[originCoords, destCoords]}
            pathOptions={{
              color: '#3B82F6',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.8,
            }}
          />
        )}

        {/* Active Moving Fleet on Map */}
        {!isOffline &&
          isLiveFleetEnabled &&
          visibleVehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v)}
            >
              <Popup>
                <div className="p-1.5 text-xs font-sans space-y-1 min-w-[160px]">
                  <div className="flex items-center justify-between border-b pb-1 gap-2">
                    <span className="font-extrabold text-slate-800 text-xs">
                      {v.mode === 'metro' ? '🚇' : v.mode === 'auto' ? '🛺' : '🚍'} {v.lineName}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {v.speedKmH} km/h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>
                      <strong>Next Stop:</strong> {v.nextStopName}
                    </p>
                    <p>
                      <strong>ETA:</strong> ~{Math.max(1, Math.round(v.etaSeconds / 60))} mins
                    </p>
                    <p className="flex items-center gap-1">
                      <strong>Status:</strong>
                      <span className="capitalize font-semibold text-blue-600">
                        {v.occupancy} Occupancy {v.isAc ? '• AC' : ''}
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
