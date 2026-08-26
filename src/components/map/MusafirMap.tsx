import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Train, LocateFixed, Plus, Minus, Footprints, AlertTriangle, Clock, Eye, WifiOff } from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createVehicleIcon = (vehicle: Vehicle) => {
  const isMetro = vehicle.mode === 'metro';
  const isRed = vehicle.id.includes('18');
  const bg = isMetro ? '#2563EB' : isRed ? '#EF4444' : '#10B981';
  const label = isMetro ? '🚇' : '🚍';
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${bg};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:15px;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createPinIcon = (color: string, emoji: string, label?: string) =>
  L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:30px;height:30px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">${emoji}</div>
        ${label ? `<div style="background:#fff;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#1e293b;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);border:1px solid #e2e8f0;margin-top:2px;max-width:140px;overflow:hidden;text-overflow:ellipsis;">${label}</div>` : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

// This component pans/zooms the map whenever center/zoom changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.locate({ setView: true, maxZoom: 15 })}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-sm transition"
        title="Locate Me"
      >
        <LocateFixed className="w-5 h-5 text-blue-600" />
      </button>
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-sm transition"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-sm transition"
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
  // Real coordinates for origin & destination (from geocoding)
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
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
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showMetro, setShowMetro] = useState(true);
  const [showTrains, setShowTrains] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showWalking, setShowWalking] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine map center and zoom dynamically
  // If we have both coords, center the map between them
  // If only dest, pan to dest. Otherwise show all-India view (center of India)
  let mapCenter: [number, number];
  let mapZoom: number;

  if (originCoords && destCoords) {
    // Center between origin and destination
    mapCenter = [
      (originCoords[0] + destCoords[0]) / 2,
      (originCoords[1] + destCoords[1]) / 2,
    ];
    // Calculate approx zoom based on distance
    const latDiff = Math.abs(originCoords[0] - destCoords[0]);
    const lngDiff = Math.abs(originCoords[1] - destCoords[1]);
    const maxDiff = Math.max(latDiff, lngDiff);
    if (maxDiff > 10) mapZoom = 5;
    else if (maxDiff > 5) mapZoom = 6;
    else if (maxDiff > 2) mapZoom = 8;
    else if (maxDiff > 0.5) mapZoom = 11;
    else if (maxDiff > 0.1) mapZoom = 13;
    else mapZoom = 14;
  } else if (destCoords) {
    mapCenter = destCoords;
    mapZoom = 13;
  } else if (originCoords) {
    mapCenter = originCoords;
    mapZoom = 13;
  } else {
    // Default: India overview center (user GPS or India center)
    mapCenter = [userLocation.lat !== 20.3039 ? userLocation.lat : 20.5937, userLocation.lng !== 85.8188 ? userLocation.lng : 78.9629];
    mapZoom = originCoords || destCoords ? 13 : 5;
  }

  // Route line between origin and dest (straight great-circle approximation — like Uber shows before routing)
  const routeLine: [number, number][] | null =
    originCoords && destCoords ? [originCoords, destCoords] : null;

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900">
      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-amber-500/90 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiOff className="w-4 h-4" />
          <span>Offline Map Mode — Cached network active. Limited to pre-downloaded area.</span>
        </div>
      )}

      {/* Live Clock HUD */}
      <div className={`absolute ${isOffline ? 'top-10' : 'top-4'} right-16 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700`}>
        <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="font-mono">{currentTimeStr}</span>
      </div>

      {/* Floating Map Options (Collapsible) */}
      <div className={`absolute ${isOffline ? 'top-10' : 'top-4'} left-4 z-[1000] transition-all`}>
        {isOptionsOpen ? (
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5 w-44 text-xs font-semibold shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">Map Layers</span>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="text-[10px] text-slate-400 hover:text-blue-600 font-bold"
              >
                Hide ▲
              </button>
            </div>
            {[
              { state: showBuses, setter: setShowBuses, icon: <Bus className="w-3.5 h-3.5 text-emerald-500" />, label: 'Show Buses' },
              { state: showMetro, setter: setShowMetro, icon: <Train className="w-3.5 h-3.5 text-blue-600" />, label: 'Show Metro' },
              { state: showTrains, setter: setShowTrains, icon: <Train className="w-3.5 h-3.5 text-purple-500" />, label: 'Show Trains' },
              { state: showTraffic, setter: setShowTraffic, icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, label: 'Traffic' },
              { state: showWalking, setter: setShowWalking, icon: <Footprints className="w-3.5 h-3.5 text-slate-400" />, label: 'Walking' },
            ].map(({ state, setter, icon, label }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600">
                <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer" />
                {icon}
                <span>{label}</span>
              </label>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsOptionsOpen(true)}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-md flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Layers</span>
          </button>
        )}
      </div>

      {/* Main Leaflet Map — Full India OpenStreetMap tiles */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={`w-full h-full ${themeMode === 'dark' ? 'dark-tiles' : ''}`}
        zoomControl={false}
        minZoom={4}
        maxZoom={18}
      >
        {/* Dynamic pan/zoom controller — reacts to coord changes */}
        <MapViewController center={mapCenter} zoom={mapZoom} />
        <ZoomControls />
        <MapClickHandler onMapClick={onSelectLocationOnMap} />

        {/* High-quality OpenStreetMap tiles for all India (same base as Google Maps, Uber) */}
        {!isOffline ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url={
              themeMode === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            }
          />
        ) : (
          // Offline: Use OpenStreetMap standard tiles (cached by browser)
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* User GPS Location */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createPinIcon('#2563EB', '📍', 'You')}>
          <Popup>
            <div className="p-1 text-xs font-bold">📍 Your Location</div>
          </Popup>
        </Marker>

        {/* Origin Pin */}
        {originCoords && (
          <Marker position={originCoords} icon={createPinIcon('#10B981', '🟢', 'From')}>
            <Popup>
              <div className="p-1 text-xs font-bold text-emerald-700">🟢 Departure</div>
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destCoords && (
          <Marker position={destCoords} icon={createPinIcon('#EF4444', '📍', destinationName.substring(0, 24))}>
            <Popup>
              <div className="p-1 text-xs font-bold text-red-700">📍 {destinationName}</div>
            </Popup>
          </Marker>
        )}

        {/* Route line between origin and destination */}
        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.85, dashArray: '10, 6' }}
          />
        )}

        {/* Moving Vehicles (only in online mode and when we have a local route context) */}
        {!isOffline && showBuses && vehicles.filter(v => v.mode === 'bus').map(v => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={createVehicleIcon(v)}>
            <Popup>
              <div className="text-xs font-bold">
                🚍 {v.lineName}<br />
                Next: {v.nextStopName} in ~{Math.round(v.etaSeconds / 60)}min
              </div>
            </Popup>
          </Marker>
        ))}
        {!isOffline && showMetro && vehicles.filter(v => v.mode === 'metro').map(v => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={createVehicleIcon(v)}>
            <Popup>
              <div className="text-xs font-bold">
                🚇 {v.lineName}<br />
                Next: {v.nextStopName} in ~{Math.round(v.etaSeconds / 60)}min
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
