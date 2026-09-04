import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Clock, WifiOff, Layers, X, Navigation, MapPin, CheckCircle2, ArrowRight,
  Activity, Compass, Radio, RotateCcw, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getAlternativeRoutes, RouteOption } from '../../services/olaRoutingService';
import { GOOGLE_MAPS_API_KEY } from '../../services/googleMapsService';
import { getHumanReadableLocationName, BHUBANESWAR_STATIONS } from '../../data/cities/bhubaneswar';
import { findMoBusRoutesDynamic, STOP_COORDINATES_MAP, getExactStopCoordinates } from '../../data/busRoutesData';
import { isBhubaneswarRegion } from '../../services/fareMatrixService';
import { DeliveryWaypoint } from '../../services/logisticsOptimizerService';

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
  logisticsWaypoints?: DeliveryWaypoint[];
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

// Calculate real surface distance in meters between two coordinates
const getDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = (lat2 - lat1) * 111320;
  const dLng = (lng2 - lng1) * 111320 * Math.cos(((lat1 + lat2) / 2 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

// Calculate perpendicular/minimum distance from a point to a polyline in meters
const minDistanceToPolylineMeters = (point: [number, number], polyline: [number, number][]): number => {
  if (!polyline || polyline.length === 0) return Infinity;
  if (polyline.length === 1) return getDistanceInMeters(point[0], point[1], polyline[0][0], polyline[0][1]);

  let minD = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];
    const l2 = (p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2;
    if (l2 === 0) {
      const d = getDistanceInMeters(point[0], point[1], p1[0], p1[1]);
      if (d < minD) minD = d;
      continue;
    }
    let t = ((point[0] - p1[0]) * (p2[0] - p1[0]) + (point[1] - p1[1]) * (p2[1] - p1[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    const projLat = p1[0] + t * (p2[0] - p1[0]);
    const projLng = p1[1] + t * (p2[1] - p1[1]);
    const d = getDistanceInMeters(point[0], point[1], projLat, projLng);
    if (d < minD) minD = d;
    if (minD < 8) return minD; // Stop is virtually on the road segment
  }
  return minD;
};

// Route Label Floating Bubble Icon (Apple / Google Maps style)
const routeLabelIcon = (route: RouteOption, isSelected: boolean) => {
  const width = 88;
  const height = 40;
  return L.divIcon({
    className: 'route-label-bubble',
    html: `
      <div style="
        width: ${width}px;
        height: ${height}px;
        box-sizing: border-box;
        background: ${isSelected ? '#1d4ed8' : '#0f172a'};
        color: #ffffff;
        padding: 4px 6px;
        border-radius: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        border: 2px solid ${isSelected ? '#93c5fd' : 'rgba(255,255,255,0.25)'};
        cursor: pointer;
        pointer-events: auto;
        user-select: none;
      ">
        <div style="font-weight: 800; font-size: 13px; line-height: 1.1; color: #ffffff; white-space: nowrap;">${route.durationMinutes} min</div>
        ${route.label ? `<div style="font-size: 9.5px; font-weight: 700; color: ${isSelected ? '#dbeafe' : '#93c5fd'}; line-height: 1.1; white-space: nowrap;">${route.label}</div>` : ''}
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
};

const getRouteBubblePosition = (route: RouteOption, idx: number): [number, number] => {
  if (!route.coordinates || route.coordinates.length === 0) return [20.2961, 85.8245];
  // Slightly stagger along length so multiple route bubbles don't stack directly over each other
  const fractions = [0.5, 0.38, 0.62, 0.45];
  const fraction = fractions[idx % fractions.length];
  const targetIdx = Math.floor(route.coordinates.length * fraction);
  return route.coordinates[targetIdx] || route.coordinates[0];
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
  logisticsWaypoints,
}) => {
  // Google Map Tile Layer Types
  const [mapLayerStyle, setMapLayerStyle] = useState<'google-traffic' | 'google-roadmap' | 'google-hybrid' | 'google-terrain' | 'osm'>('google-traffic');
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [clickedPin, setClickedPin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [showStops, setShowStops] = useState(true);
  const [routeStops, setRouteStops] = useState<{ name: string; coords: [number, number]; idx: number }[]>([]);

  // Fetch Route Corridor Polylines (with all alternatives from Google Maps / OSRM)
  useEffect(() => {
    if (originCoords && destCoords) {
      getAlternativeRoutes(originCoords, destCoords).then((routes) => {
        setRouteOptions(routes);
        setSelectedRouteId(routes[0]?.id ?? null);
      });
    } else {
      setRouteOptions([]);
      setSelectedRouteId(null);
    }
  }, [originCoords, destCoords]);

  const selectedRoute = routeOptions.find((r) => r.id === selectedRouteId) || routeOptions[0];
  const routeCoordinates = selectedRoute ? selectedRoute.coordinates : [];

  // Calculate intermediate Ama Bus stops with coordinates strictly along the route corridor (< 100 meters)
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

    // Determine the route polyline to measure distances from
    const polyline: [number, number][] =
      routeCoordinates.length > 1
        ? routeCoordinates
        : originCoords && destCoords
        ? [originCoords, destCoords]
        : [];

    if (polyline.length === 0) {
      setRouteStops([]);
      return;
    }

    // Gather all candidate Ama Bus stops
    const rawCandidates: { name: string; coords: [number, number] }[] = [];

    // 1. From STOP_COORDINATES_MAP (comprehensive 200+ bus stop network)
    for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
      if (coords && coords[0] && coords[1]) {
        const formatted = key
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        rawCandidates.push({ name: formatted, coords });
      }
    }

    // 2. From BHUBANESWAR_STATIONS
    BHUBANESWAR_STATIONS.forEach((station) => {
      if (station.lat && station.lng) {
        rawCandidates.push({ name: station.name, coords: [station.lat, station.lng] });
      }
    });

    // 3. From dynamic Mo Bus route substops (ONLY if exact coordinates exist, NEVER centroid fallback)
    const match = findMoBusRoutesDynamic(originName || '', destinationName || '');
    if (match.matchedRoutes && match.matchedRoutes.length > 0) {
      match.matchedRoutes.forEach((route) => {
        if (route.subStops) {
          route.subStops.forEach((sName) => {
            const exact = getExactStopCoordinates(sName);
            if (exact) {
              rawCandidates.push({ name: sName, coords: exact });
            }
          });
        }
      });
    }

    // Filter strictly within 100 meters of the active road corridor
    const MAX_CORRIDOR_METERS = 100;
    const acceptedStops: { name: string; coords: [number, number]; distFromOrigin: number }[] = [];

    for (const candidate of rawCandidates) {
      const [cLat, cLng] = candidate.coords;

      // Ensure distance from polyline is <= 100m
      const distToLine = minDistanceToPolylineMeters(candidate.coords, polyline);
      if (distToLine > MAX_CORRIDOR_METERS) {
        continue;
      }

      // Check distance from origin and destination (exclude if within 70m of endpoints)
      if (originCoords) {
        const dOrigin = getDistanceInMeters(cLat, cLng, originCoords[0], originCoords[1]);
        if (dOrigin < 70) continue;
      }
      if (destCoords) {
        const dDest = getDistanceInMeters(cLat, cLng, destCoords[0], destCoords[1]);
        if (dDest < 70) continue;
      }

      // Deduplicate if already within 65m of an already accepted stop
      const isDuplicate = acceptedStops.some(
        (acc) => getDistanceInMeters(cLat, cLng, acc.coords[0], acc.coords[1]) < 65
      );
      if (isDuplicate) continue;

      // Distance from origin along progress
      const distFromStart = originCoords
        ? getDistanceInMeters(cLat, cLng, originCoords[0], originCoords[1])
        : acceptedStops.length;

      acceptedStops.push({
        name: candidate.name,
        coords: candidate.coords,
        distFromOrigin: distFromStart,
      });
    }

    // Sort sequentially from start of route to end
    acceptedStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    const indexedStops = acceptedStops.map((item, idx) => ({
      name: item.name,
      coords: item.coords,
      idx: idx + 1,
    }));

    setRouteStops(indexedStops);
  }, [originName, destinationName, originCoords, destCoords, routeCoordinates]);

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

        {/* ─── Non-selected alternate routes (drawn first, dim + clickable) ─── */}
        {routeOptions
          .filter((r) => r.id !== selectedRouteId)
          .map((route, idx) => (
            <React.Fragment key={route.id}>
              <Polyline
                positions={route.coordinates}
                pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.65 }}
                eventHandlers={{ click: () => setSelectedRouteId(route.id) }}
              />
              <Marker
                position={getRouteBubblePosition(route, idx + 1)}
                icon={routeLabelIcon(route, false)}
                eventHandlers={{ click: () => setSelectedRouteId(route.id) }}
              />
            </React.Fragment>
          ))}

        {/* ─── Selected route on top, bold blue ─── */}
        {selectedRoute && (
          <React.Fragment key={selectedRoute.id}>
            <Polyline
              positions={selectedRoute.coordinates}
              pathOptions={{ color: '#2563eb', weight: 7, opacity: 0.95 }}
            />
            <Marker
              position={getRouteBubblePosition(selectedRoute, 0)}
              icon={routeLabelIcon(selectedRoute, true)}
            />
          </React.Fragment>
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

        {/* ─── Intermediate Ama Bus Stops along Route Corridor (Clean Minimal Points within 100m) ─── */}
        {showStops && routeStops.map((stop, i) => (
          <CircleMarker
            key={`stop-${stop.name}-${i}`}
            center={stop.coords}
            radius={5.5}
            pathOptions={{
              color: '#0284c7', // Sky-600 outer border
              fillColor: '#ffffff', // Clean white inner point
              fillOpacity: 1,
              weight: 2.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                <span>🚏</span>
                <span>{stop.name}</span>
              </div>
            </Tooltip>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1 min-w-[170px]">
                <div className="flex items-center gap-1 text-sky-600 font-extrabold uppercase text-[10px] mb-0.5">
                  <span>🚏 Ama Bus Stoppage #{stop.idx}</span>
                </div>
                <div className="text-xs font-black text-slate-900">{stop.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Route Corridor Stoppage (&lt;100m)</div>
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
          </CircleMarker>
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

        {/* ─── Real-Time Logistics Multi-Stop Delivery Corridor (when active) ─── */}
        {logisticsWaypoints && logisticsWaypoints.length > 0 && (
          <>
            <Polyline
              positions={[
                [20.2818, 85.7938],
                ...logisticsWaypoints.map((w) => [w.lat, w.lng] as [number, number]),
              ]}
              pathOptions={{ color: '#10b981', weight: 5, opacity: 0.85, dashArray: '6, 8' }}
            />

            <Marker position={[20.2818, 85.7938]} icon={createLeafletPinIcon('#2563eb', '🏭')}>
              <Popup>
                <div className="text-xs font-bold text-slate-900 p-1">
                  <span className="text-blue-600 font-extrabold block">🏭 Baramunda Central Logistics Hub</span>
                  <span className="text-[10px] text-slate-500 font-mono">20.2818, 85.7938</span>
                </div>
              </Popup>
            </Marker>

            {logisticsWaypoints.map((wp, idx) => (
              <Marker
                key={wp.id}
                position={[wp.lat, wp.lng]}
                icon={createLeafletPinIcon(idx === logisticsWaypoints.length - 1 ? '#e11d48' : '#10b981', `${idx + 1}`)}
              >
                <Popup>
                  <div className="text-xs font-bold text-slate-900 p-1 min-w-[190px]">
                    <span className="text-emerald-600 font-extrabold block">Stop #{idx + 1}: {wp.recipientName}</span>
                    <span className="text-[11px] text-slate-700 block mt-0.5">{wp.address}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      GPS: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1.5 text-[10px] text-blue-600 underline font-bold"
                    >
                      📍 Open on Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
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
            {selectedRoute && (
              <>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-[11px] font-bold text-sky-400">
                  {selectedRoute.distanceKm} km (~{selectedRoute.durationMinutes}m)
                </span>
                {selectedRoute.label && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-blue-600/80 text-white rounded-md tracking-tight">
                    {selectedRoute.label}
                  </span>
                )}
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
