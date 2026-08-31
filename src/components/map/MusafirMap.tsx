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

// Leaflet Vehicle Pin Icon
const createLeafletVehicleIcon = (vehicle: Vehicle) => {
  const isDelayed = vehicle.delaySeconds > 60;
  const isPink = vehicle.routeId === 'PINK-EV';
  const isMetro = vehicle.mode === 'metro';
  const emoji = isPink ? '⚡' : isMetro ? '🚇' : '🚍';
  const ringColor = isDelayed ? '#ef4444' : isPink ? '#ec4899' : isMetro ? '#f59e0b' : '#3b82f6';
  const routeBadge = vehicle.routeId.replace('MB-', '');

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
          font-size: 9px; 
          font-weight: 800; 
          padding: 1px 5px; 
          border-radius: 4px; 
          border: 1px solid rgba(59, 130, 246, 0.4); 
          white-space: nowrap;
        ">
          R-${routeBadge}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

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

  const handleMapClick = (lat: number, lng: number) => {
    const readable = getHumanReadableLocationName(lat, lng);
    const cleanName = readable.replace('Pinned Location ', '');
    setClickedPin({ lat, lng, name: cleanName });
  };

  const mapCenter: [number, number] = originCoords
    ? originCoords
    : (userLocation && userLocation.lat ? [userLocation.lat, userLocation.lng] : [20.2961, 85.8245]);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all bg-slate-900">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController
          originCoords={originCoords || null}
          destCoords={destCoords || null}
          onMapClick={handleMapClick}
        />

        {/* ─── Google Maps Tile Layer Engines ─── */}
        {/* 1. Google Maps Live Traffic (Default) */}
        {!isOffline && mapLayerStyle === 'google-traffic' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Live Traffic</a>'
            url="https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {/* 2. Google Maps Standard Roadmap */}
        {!isOffline && mapLayerStyle === 'google-roadmap' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {/* 3. Google Maps Satellite / Hybrid */}
        {!isOffline && mapLayerStyle === 'google-hybrid' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Satellite</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {/* 4. Google Maps Terrain */}
        {!isOffline && mapLayerStyle === 'google-terrain' && (
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps Terrain</a>'
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {/* 5. Fallback OpenStreetMap */}
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

        {/* ─── Live Transit Fleet Vehicles ─── */}
        {vehicles.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={createLeafletVehicleIcon(v)}>
            <Popup>
              <div className="text-xs font-sans p-1 text-slate-900 min-w-[170px]">
                <div className="flex items-center justify-between">
                  <strong className="font-extrabold text-blue-600">Mo Bus Route {v.routeId}</strong>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                    {v.speedKmH || 35} km/h
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  <strong>Next:</strong> {v.nextStopName || 'Approaching Bay'}
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Occupancy:</strong> <span className="capitalize font-bold">{v.occupancy || 'moderate'}</span>
                </div>
                <div className={`text-[10px] mt-1 font-bold ${v.delaySeconds > 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {v.delaySeconds > 60 ? `⚠️ Delay: ~${Math.round(v.delaySeconds / 60)}m` : '✓ On Time (Live GPS)'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ─── Top-Left Live Status Overlay ─── */}
      <div className="absolute top-3.5 left-3.5 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-white">
            {mapLayerStyle === 'google-traffic' ? '🚦 Google Live Traffic: Active' : '🗺️ Google Maps: Active'}
          </span>
          <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-md">
            Live Stream
          </span>
        </div>

        {routeSummary && (
          <div className="pointer-events-auto bg-blue-600/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in">
            <div>
              <div className="text-[10px] font-bold uppercase opacity-80">Route Corridor</div>
              <div className="text-xs font-black">
                {routeSummary.distanceKm} km • ~{routeSummary.durationMins} mins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Top-Right Layer Switcher Controls ─── */}
      <div className="absolute top-3.5 right-3.5 z-[1000] flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setMapLayerStyle('google-traffic')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition ${
            mapLayerStyle === 'google-traffic'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Live Traffic Flow"
        >
          <span>🚦 Traffic</span>
        </button>

        <button
          onClick={() => setMapLayerStyle('google-roadmap')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapLayerStyle === 'google-roadmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Roadmap"
        >
          Road
        </button>

        <button
          onClick={() => setMapLayerStyle('google-hybrid')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapLayerStyle === 'google-hybrid'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Satellite / Hybrid"
        >
          Satellite
        </button>

        <button
          onClick={() => setMapLayerStyle('google-terrain')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapLayerStyle === 'google-terrain'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Terrain"
        >
          Terrain
        </button>
      </div>

      {/* ─── Interactive Clicked Pin Action Banner ─── */}
      {clickedPin && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border-2 border-blue-500 shadow-2xl animate-in slide-in-from-bottom-2">
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
