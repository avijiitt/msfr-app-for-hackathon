import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus, Train, LocateFixed, Plus, Minus, Footprints,
  AlertTriangle, Clock, Eye, WifiOff, Zap, Navigation, ShieldCheck
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';

// Fix default Leaflet icon assets
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom DivIcons for Active Rides
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
        transition: transform 0.2s ease;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 1px solid #e2e8f0;
          margin-top: 3px;
          max-width: 160px;
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

// Map View Controller that handles smooth pan, zoom, and bounds fitting
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
  const prevCenterRef = useRef<string>('');

  useEffect(() => {
    // Invalidate size once mounted to ensure container fills correctly
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      // Fit both origin and destination with comfortable padding
      try {
        const leafletBounds = L.latLngBounds(bounds.map(([lat, lng]) => [lat, lng]));
        map.fitBounds(leafletBounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 1.2,
        });
      } catch {}
    } else {
      const centerKey = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;
      if (prevCenterRef.current !== centerKey) {
        prevCenterRef.current = centerKey;
        map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
      }
    }
  }, [center, zoom, bounds, map]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ZoomControls({ onLocate }: { onLocate: () => void }) {
  const map = useMap();
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2 shadow-lg">
      <button
        onClick={onLocate}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition active:scale-95"
        title="Locate My GPS Position"
      >
        <LocateFixed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </button>
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
        title="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
        title="Zoom Out"
      >
        <Minus className="w-5 h-5" />
      </button>
    </div>
  );
}

interface MusafirMapProps {
  vehicles: Vehicle[];
  userLocation: LiveLocationData;
  onSelectLocationOnMap: (lat: number, lng: number) => void;
  themeMode: string;
  isOffline?: boolean;
  destinationName?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  originName?: string;
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
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showMetro, setShowMetro] = useState(true);
  const [showAutos, setShowAutos] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Routing State
  const [routeInfo, setRouteInfo] = useState<RouteDirectionsResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

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

  // Fetch real road route whenever origin or dest coords change
  useEffect(() => {
    let isCancelled = false;

    if (originCoords && destCoords) {
      setIsLoadingRoute(true);
      getRouteDirections(originCoords, destCoords)
        .then((result) => {
          if (!isCancelled) {
            setRouteInfo(result);
            setIsLoadingRoute(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setIsLoadingRoute(false);
          }
        });
    } else {
      setRouteInfo(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [originCoords, destCoords]);

  // Determine initial center and zoom
  let mapCenter: [number, number] = [20.5937, 78.9629]; // India Center
  let mapZoom = 5;
  let activeBounds: [number, number][] | null = null;

  if (originCoords && destCoords) {
    mapCenter = [
      (originCoords[0] + destCoords[0]) / 2,
      (originCoords[1] + destCoords[1]) / 2,
    ];
    activeBounds = [originCoords, destCoords];
  } else if (destCoords) {
    mapCenter = destCoords;
    mapZoom = 13;
  } else if (originCoords) {
    mapCenter = originCoords;
    mapZoom = 13;
  } else if (userLocation && userLocation.lat !== 20.3039) {
    mapCenter = [userLocation.lat, userLocation.lng];
    mapZoom = 13;
  }

  // Filter vehicles based on active layers
  const visibleVehicles = vehicles.filter((v) => {
    if (v.mode === 'bus' && !showBuses) return false;
    if (v.mode === 'metro' && !showMetro) return false;
    if (v.mode === 'auto' && !showAutos) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900 transition-all">
      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-amber-500 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>Offline Navigation Mode — Preloaded India Transit Corridor Active</span>
        </div>
      )}

      {/* Top Left: Route Summary Badge (When Origin & Destination are Set) */}
      {originCoords && destCoords && (
        <div
          className={`absolute ${
            isOffline ? 'top-10' : 'top-3'
          } left-3 sm:left-4 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition animate-in fade-in`}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-white">
              <span>{isLoadingRoute ? 'Calculating Road Route...' : routeInfo ? `${routeInfo.distanceKm} km • ~${routeInfo.durationMinutes} mins` : 'Live Corridor'}</span>
              {routeInfo?.source === 'ola_maps' && (
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                  OLA Route
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
              {originName.split(',')[0]} → {destinationName.split(',')[0]}
            </p>
          </div>
        </div>
      )}

      {/* Top Right: Live Clock HUD */}
      <div
        className={`absolute ${
          isOffline ? 'top-10' : 'top-3'
        } right-3 sm:right-4 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700`}
      >
        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
        <span className="font-mono text-[11px] sm:text-xs">{currentTimeStr}</span>
      </div>

      {/* Floating Map Layers (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[1000] transition-all">
        {isOptionsOpen ? (
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-2 w-48 text-xs font-semibold shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Active Rides
              </span>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="text-[10px] text-slate-400 hover:text-blue-600 font-bold"
              >
                Hide ▲
              </button>
            </div>
            {[
              { state: showBuses, setter: setShowBuses, icon: <Bus className="w-3.5 h-3.5 text-emerald-500" />, label: 'City Buses' },
              { state: showMetro, setter: setShowMetro, icon: <Train className="w-3.5 h-3.5 text-blue-600" />, label: 'Metro Lines' },
              { state: showAutos, setter: setShowAutos, icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, label: 'EV Autos & Cabs' },
              { state: showTraffic, setter: setShowTraffic, icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />, label: 'Traffic Alerts' },
            ].map(({ state, setter, icon, label }) => (
              <label
                key={label}
                className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600 transition select-none"
              >
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                {icon}
                <span className="text-[11px]">{label}</span>
              </label>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsOptionsOpen(true)}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-md flex items-center gap-1.5 transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Map Layers</span>
          </button>
        )}
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={`w-full h-full ${themeMode === 'dark' ? 'dark-tiles' : ''}`}
        zoomControl={false}
        minZoom={4}
        maxZoom={18}
      >
        {/* Dynamic Pan / Zoom / Bounds Controller */}
        <MapViewController
          center={mapCenter}
          zoom={mapZoom}
          bounds={activeBounds}
        />

        <ZoomControls
          onLocate={() => {
            onSelectLocationOnMap(userLocation.lat, userLocation.lng);
          }}
        />

        <MapClickHandler onMapClick={onSelectLocationOnMap} />

        {/* Stable Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={
            themeMode === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
          maxZoom={19}
        />

        {/* User Current GPS Position */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createPinIcon('#2563EB', '📍', 'You', 'Live GPS')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-extrabold text-blue-600 block">📍 Current Location</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Origin Pin */}
        {originCoords && (
          <Marker
            position={originCoords}
            icon={createPinIcon('#10B981', '🟢', originName.split(',')[0], 'Departure')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-extrabold text-emerald-600 block">🟢 Departure Point</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">{originName}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destCoords && (
          <Marker
            position={destCoords}
            icon={createPinIcon('#EF4444', '📍', destinationName.split(',')[0], 'Destination')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-extrabold text-rose-600 block">📍 Destination Stop</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">{destinationName}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real OLA Road Route Polyline (Glow + Solid Path) */}
        {routeInfo && routeInfo.coordinates.length > 1 && (
          <>
            {/* Outer Glow */}
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: '#3B82F6',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core Solid Navigation Line */}
            <Polyline
              positions={routeInfo.coordinates}
              pathOptions={{
                color: '#2563EB',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Fallback Straight Line if Route is loading or single leg */}
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

        {/* Active Rides Across All India Routes */}
        {!isOffline &&
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
