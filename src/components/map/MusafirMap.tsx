import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus, Train, LocateFixed, Plus, Minus,
  AlertTriangle, Clock, Eye, WifiOff, Zap, Navigation, ShieldCheck, Layers, RotateCw, Check, X, MapPin
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
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.length >= 2) {
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
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[400] flex flex-col gap-2 shadow-lg">
      <button
        onClick={onLocate}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-sm"
        title="Locate My GPS Position"
      >
        <LocateFixed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </button>
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-sm"
        title="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-sm"
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

  // Temporary Clicked Location for Confirmation (prevents accidental clicks from changing route)
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number; name: string } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    const name = getHumanReadableLocationName(lat, lng);
    setPendingPin({ lat, lng, name });
  };

  // Multi-Modal Polyline Segments: Dotted Gray Walk -> Solid Bus Transit -> Dotted Gray Walk
  const routeSegments = React.useMemo(() => {
    if (!routeInfo || routeInfo.coordinates.length < 2) return null;
    const coords = routeInfo.coordinates;
    const len = coords.length;

    if (len < 5) {
      return {
        walkStart: coords.slice(0, 2),
        transit: coords,
        walkEnd: coords.slice(-2),
      };
    }

    const startIdx = Math.max(1, Math.floor(len * 0.12));
    const endIdx = Math.min(len - 1, Math.ceil(len * 0.88));

    return {
      walkStart: coords.slice(0, startIdx + 1),
      transit: coords.slice(startIdx, endIdx + 1),
      walkEnd: coords.slice(endIdx),
    };
  }, [routeInfo]);

  // Determine initial center and zoom
  let mapCenter: [number, number] = [20.2961, 85.8245]; // Bhubaneswar Master Canteen / Central Area
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
  } else if (userLocation && userLocation.lat !== 20.3039) {
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
            isOffline ? 'top-10' : 'top-3'
          } left-3 sm:left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-3 transition-all`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <strong className="text-slate-900 dark:text-white font-black text-xs sm:text-sm">
                Connected Transit Route
              </strong>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                Live Road Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} min travel time
            </p>
          </div>
        </div>
      )}

      {/* Top Right: Layer Visibility Floating Card */}
      {!isAnyModalOpen && (
        <div
          className={`absolute ${
            isOffline ? 'top-10' : 'top-3'
          } right-3 sm:right-4 z-[400] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs transition-all`}
        >
          {isOptionsOpen ? (
            <div className="space-y-2 min-w-[150px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                  Transit Layers
                </span>
                <button
                  onClick={() => setIsOptionsOpen(false)}
                  className="text-[10px] text-slate-400 hover:text-blue-600 font-bold"
                >
                  Hide ▲
                </button>
              </div>
              {[
                { state: showBuses, setter: setShowBuses, icon: <Bus className="w-3.5 h-3.5 text-emerald-500" />, label: 'Mo Bus Fleet' },
                { state: showAutos, setter: setShowAutos, icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, label: 'Mo E-Ride & Autos' },
                { state: showTraffic, setter: setShowTraffic, icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />, label: 'Traffic & Alerts' },
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
                  <span className="font-semibold text-[11px]">{label}</span>
                </label>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setIsOptionsOpen(true)}
              className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-xs hover:text-blue-600"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Layers</span>
            </button>
          )}
        </div>
      )}

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={`w-full h-full ${themeMode === 'dark' ? 'dark-tiles' : ''}`}
        zoomControl={false}
        minZoom={10}
        maxZoom={18}
      >
        <MapViewController
          center={mapCenter}
          zoom={mapZoom}
          bounds={activeBounds}
        />

        {!isAnyModalOpen && (
          <ZoomControls
            onLocate={() => {
              onSelectLocationOnMap(userLocation.lat, userLocation.lng, 'Current Location (GPS)', 'origin');
            }}
          />
        )}

        <MapClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Temporary Clicked Pin with Interactive Confirmation */}
        {pendingPin && (
          <Marker
            position={[pendingPin.lat, pendingPin.lng]}
            icon={createPinIcon('#8B5CF6', '📍', pendingPin.name, 'Tap to Confirm')}
          >
            <Popup autoPan={false}>
              <div className="p-2 text-xs space-y-2 min-w-[200px]">
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">{pendingPin.name}</strong>
                  <span className="text-[10px] text-slate-500">Choose action for selected pin:</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLocationOnMap(pendingPin.lat, pendingPin.lng, pendingPin.name, 'dest');
                      setPendingPin(null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>📍 Destination</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLocationOnMap(pendingPin.lat, pendingPin.lng, pendingPin.name, 'origin');
                      setPendingPin(null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>🟢 Departure</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingPin(null)}
                    className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

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

        {/* ── Multi-Modal Route Geometry (Split Colors) ────────────────────────── */}
        {routeSegments && (
          <>
            {/* 1. Walk leg to Transit Stop: Dotted Gray Line */}
            {routeSegments.walkStart.length > 1 && (
              <Polyline
                positions={routeSegments.walkStart}
                pathOptions={{
                  color: '#64748b',
                  weight: 4.5,
                  dashArray: '6, 8',
                  lineCap: 'round',
                }}
              />
            )}

            {/* 2. Main Bus / Transit Leg: Thick Solid Blue / Emerald Glow Line */}
            {routeSegments.transit.length > 1 && (
              <>
                <Polyline
                  positions={routeSegments.transit}
                  pathOptions={{
                    color: '#3B82F6',
                    weight: 8,
                    opacity: 0.35,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
                <Polyline
                  positions={routeSegments.transit}
                  pathOptions={{
                    color: '#2563EB',
                    weight: 5.5,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </>
            )}

            {/* 3. Walk leg from Transit Stop to Destination: Dotted Gray Line */}
            {routeSegments.walkEnd.length > 1 && (
              <Polyline
                positions={routeSegments.walkEnd}
                pathOptions={{
                  color: '#64748b',
                  weight: 4.5,
                  dashArray: '6, 8',
                  lineCap: 'round',
                }}
              />
            )}
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
