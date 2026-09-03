import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Clock, WifiOff, Layers, X, Navigation, MapPin, CheckCircle2, ArrowRight,
  Activity, Compass, Radio, RotateCcw, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';
import { GOOGLE_MAPS_API_KEY } from '../../services/googleMapsService';
import { getHumanReadableLocationName, getNearbyLocationsAlongCorridor } from '../../data/cities/bhubaneswar';
import { findMoBusRoutesDynamic, getStopCoordinates } from '../../data/busRoutesData';
import { isBhubaneswarRegion } from '../../services/fareMatrixService';

// Fix leaflet default marker paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MusafirMapProps {
  vehicles: Vehicle[];
  userLocation: LiveLocationData | null;
  onSelectLocationOnMap: (lat: number, lng: number, name?: string, type?: 'origin' | 'dest') => void;
  themeMode: string;
  isOffline?: boolean;
  destinationName?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  originName?: string;
  isAnyModalOpen?: boolean;
  isGpsActive?: boolean;
}

const createLeafletPinIcon = (pinColor: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: ${pinColor};
        transform: rotate(-45deg);
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${symbol}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const createBusStopIcon = (stopName: string, index: number) => {
  const shortName = stopName.length > 22 ? stopName.substring(0, 20) + '…' : stopName;
  return L.divIcon({
    className: 'custom-bus-stop-icon',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; transform: translate(-50%, -100%);">
        <div style="
          background: rgba(15, 23, 42, 0.95);
          color: #38bdf8;
          font-size: 10px;
          font-weight: 800;
          padding: 2.5px 8px;
          border-radius: 9999px;
          border: 1.5px solid rgba(56, 189, 248, 0.6);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          white-space: nowrap;
          margin-bottom: 3px;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="color: #38bdf8; font-size: 11px;">🚏</span>
          <span>${shortName}</span>
        </div>
        <div style="
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #0284c7;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Internal Map Controller (handles bounds & camera movement)
const MapController: React.FC<{
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
}> = ({ originCoords, destCoords, onMapClick }) => {
  const map = useMap();
  const prevBoundsRef = useRef<string>('');

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (originCoords && destCoords) {
      const bounds = L.latLngBounds([originCoords, destCoords]);
      const key = `od-${originCoords.join(',')}-${destCoords.join(',')}`;
      if (prevBoundsRef.current !== key) {
        prevBoundsRef.current = key;
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      }
    } else if (originCoords) {
      const key = `orig-${originCoords.join(',')}`;
      if (prevBoundsRef.current !== key) {
        prevBoundsRef.current = key;
        map.flyTo(originCoords, 15, { animate: true, duration: 1.2 });
      }
    } else if (destCoords) {
      const key = `dest-${destCoords.join(',')}`;
      if (prevBoundsRef.current !== key) {
        prevBoundsRef.current = key;
        map.flyTo(destCoords, 15, { animate: true, duration: 1.2 });
      }
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
  originCoords,
  destCoords,
  originName,
  destinationName,
  isAnyModalOpen = false,
  isGpsActive = false,
}) => {
  // Google Map Tile Layer Types
  const [mapLayerStyle, setMapLayerStyle] = useState<'google-traffic' | 'google-roadmap' | 'google-hybrid' | 'google-terrain' | 'osm'>('google-traffic');
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: number;
    durationMins: number;
    pointsCount: number;
  } | null>(null);

  const [clickedPin, setClickedPin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [showStops, setShowStops] = useState(true);
  const [routeStops, setRouteStops] = useState<{ name: string; coords: [number, number]; idx: number }[]>([]);

  // Fetch Route Corridor Polylines
  useEffect(() => {
    if (originCoords && destCoords) {
      getRouteDirections(originCoords, destCoords).then((res) => {
        setRouteCoordinates(res.coordinates);
        setRouteSummary({
          distanceKm: res.distanceKm,
          durationMins: res.durationMinutes,
          pointsCount: res.coordinates.length,
        });
      });
    } else {
      setRouteCoordinates([]);
      setRouteSummary(null);
    }
  }, [originCoords, destCoords]);

  // Calculate intermediate Ama Bus stops with coordinates along the corridor
  useEffect(() => {
    if (!originName && !destinationName) {
      setRouteStops([]);
      return;
    }

    const isBbsr = isBhubaneswarRegion(originName, destinationName, originCoords, destCoords);
    if (!isBbsr) {
      setRouteStops([]);
      return;
    }

    const match = findMoBusRoutesDynamic(originName || 'Jayadev Vihar', destinationName || 'KIIT Square');
    const primary = match.matchedRoutes[0];
    if (primary && primary.subStops && primary.subStops.length > 0) {
      const stopsWithCoords: { name: string; coords: [number, number]; idx: number }[] = [];
      primary.subStops.forEach((stopName, idx) => {
        const coords = getStopCoordinates(stopName);
        if (coords && coords[0] && coords[1]) {
          // Check if not identical to originCoords or destCoords (within ~150m)
          const isAtOrigin = originCoords && Math.hypot(coords[0] - originCoords[0], coords[1] - originCoords[1]) < 0.002;
          const isAtDest = destCoords && Math.hypot(coords[0] - destCoords[0], coords[1] - destCoords[1]) < 0.002;
          if (!isAtOrigin && !isAtDest) {
            stopsWithCoords.push({ name: stopName, coords, idx: idx + 1 });
          }
        }
      });
      setRouteStops(stopsWithCoords);
    } else {
      const corridor = getNearbyLocationsAlongCorridor(originName || '', destinationName || '');
      const stopsWithCoords = corridor.slice(0, 8).map((loc, idx) => ({
        name: loc.name,
        coords: [loc.lat, loc.lng] as [number, number],
        idx: idx + 1,
      }));
      setRouteStops(stopsWithCoords);
    }
  }, [originName, destinationName, originCoords, destCoords]);

  const handleMapClick = (lat: number, lng: number) => {
    const readable = getHumanReadableLocationName(lat, lng);
    const cleanName = readable.replace('Pinned Location ', '');
    setClickedPin({ lat, lng, name: cleanName });
  };

  const mapCenter: [number, number] = originCoords
    ? originCoords
    : (userLocation && userLocation.lat ? [userLocation.lat, userLocation.lng] : [20.2961, 85.8245]);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all bg-slate-900 z-0 isolate">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController
          originCoords={originCoords || null}
          destCoords={destCoords || null}
          onMapClick={handleMapClick}
        />

        {/* ─── Google Maps Tile Layer Engines ─── */}
        {!isOffline && mapLayerStyle === 'google-traffic' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Live Traffic</a>'
            url="https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {!isOffline && mapLayerStyle === 'google-roadmap' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {!isOffline && mapLayerStyle === 'google-hybrid' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Satellite</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {!isOffline && mapLayerStyle === 'google-terrain' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Terrain</a>'
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {!isOffline && mapLayerStyle === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className={themeMode === 'dark' ? 'dark-tiles' : ''}
          />
        )}

        {/* ─── Route Polyline ─── */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9 }}
          />
        )}

        {/* ─── Origin Pin ─── */}
        {originCoords && (
          <Marker position={originCoords} icon={createLeafletPinIcon('#2563eb', '🛫')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                <span className="text-blue-600 font-extrabold block">Origin Departure</span>
                <span>{originName || 'Journey Start'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ─── Destination Pin ─── */}
        {destCoords && (
          <Marker position={destCoords} icon={createLeafletPinIcon('#e11d48', '🏁')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                <span className="text-rose-600 font-extrabold block">Destination</span>
                <span>{destinationName || 'Journey Destination'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ─── Intermediate Ama Bus Stops along Route Corridor ─── */}
        {showStops && routeStops.map((stop, i) => (
          <Marker
            key={`stop-${stop.name}-${i}`}
            position={stop.coords}
            icon={createBusStopIcon(stop.name, stop.idx)}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1 min-w-[160px]">
                <div className="flex items-center gap-1 text-sky-600 font-extrabold uppercase text-[10px] mb-0.5">
                  <span>🚏 Ama Bus Stoppage #{stop.idx}</span>
                </div>
                <div className="text-xs font-black text-slate-900">{stop.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Scheduled Stop on Route</div>
                <div className="flex gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => onSelectLocationOnMap(stop.coords[0], stop.coords[1], stop.name, 'origin')}
                    className="flex-1 px-2 py-1 rounded-md bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition"
                  >
                    Start Here
                  </button>
                  <button
                    onClick={() => onSelectLocationOnMap(stop.coords[0], stop.coords[1], stop.name, 'dest')}
                    className="flex-1 px-2 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition"
                  >
                    Drop Here
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ─── Clicked Temporary Pin ─── */}
        {clickedPin && (
          <Marker position={[clickedPin.lat, clickedPin.lng]} icon={createLeafletPinIcon('#e11d48', '📍')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                <span className="text-rose-600 font-extrabold block">{clickedPin.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {clickedPin.lat.toFixed(4)}, {clickedPin.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ─── User Real-Time GPS Pin ─── */}
        {isGpsActive && userLocation && userLocation.lat && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createLeafletPinIcon('#3b82f6', '📍')}>
              <Popup>
                <div className="text-xs font-bold text-slate-900 p-1">
                  <strong className="text-blue-600 block">Your Current GPS Location</strong>
                  <span className="text-[10px] text-slate-500">Accuracy: ±{Math.round(userLocation.accuracy || 10)}m</span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={Math.max(30, userLocation.accuracy || 30)}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }}
            />
          </>
        )}
      </MapContainer>

      {/* ─── Top 3D Floating Control Bar (Hidden when modals are open) ─── */}
      {!isAnyModalOpen && (
        <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-slate-700/70 shadow-2xl flex items-center gap-2 text-white">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-[11px] font-black tracking-tight">
              {mapLayerStyle === 'google-traffic' ? '🚦 Live Traffic' : '🗺️ Google Map'}
            </span>
            {routeSummary && (
              <>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-[11px] font-bold text-sky-400">
                  {routeSummary.distanceKm} km (~{routeSummary.durationMins}m)
                </span>
              </>
            )}
            {routeStops.length > 0 && (
              <>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {routeStops.length} Ama Bus Stops
                </span>
              </>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-700/70 shadow-2xl">
            {routeStops.length > 0 && (
              <button
                onClick={() => setShowStops(!showStops)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
                  showStops
                    ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Toggle Stoppage Names on Route"
              >
                <span>🚏 Stops {showStops ? 'ON' : 'OFF'}</span>
              </button>
            )}

            <button
              onClick={() => setMapLayerStyle('google-traffic')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
                mapLayerStyle === 'google-traffic'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Google Live Traffic Flow"
            >
              <span>🚦 Traffic</span>
            </button>

            <button
              onClick={() => setMapLayerStyle('google-roadmap')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                mapLayerStyle === 'google-roadmap'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Google Roadmap"
            >
              Road
            </button>

            <button
              onClick={() => setMapLayerStyle('google-hybrid')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                mapLayerStyle === 'google-hybrid'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Google Satellite / Hybrid"
            >
              Satellite
            </button>

            <button
              onClick={() => setMapLayerStyle('google-terrain')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                mapLayerStyle === 'google-terrain'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Google Terrain"
            >
              Terrain
            </button>
          </div>
        </div>
      )}

      {/* ─── Interactive Clicked Pin Action Banner ─── */}
      {!isAnyModalOpen && clickedPin && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border-2 border-blue-500 shadow-2xl animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <strong className="text-xs font-black text-slate-900 dark:text-white truncate">
                {clickedPin.name}
              </strong>
            </div>
            <button
              onClick={() => setClickedPin(null)}
              className="text-slate-400 hover:text-slate-600 text-xs p-0.5"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectLocationOnMap(clickedPin.lat, clickedPin.lng, clickedPin.name, 'origin');
                setClickedPin(null);
              }}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shadow-sm transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span>🛫 Set as From</span>
            </button>

            <button
              onClick={() => {
                onSelectLocationOnMap(clickedPin.lat, clickedPin.lng, clickedPin.name, 'dest');
                setClickedPin(null);
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shadow-sm transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span>🏁 Set as To</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
