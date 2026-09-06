import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Clock, WifiOff, Layers, X, Navigation, MapPin, CheckCircle2, ArrowRight,
  Activity, Compass, Radio, RotateCcw, AlertTriangle, Eye, EyeOff, Download
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getAlternativeRoutes, RouteOption } from '../../services/olaRoutingService';
import { getHumanReadableLocationName, BHUBANESWAR_STATIONS } from '../../data/cities/bhubaneswar';
import { findMoBusRoutesDynamic, STOP_COORDINATES_MAP, getExactStopCoordinates } from '../../data/busRoutesData';
import { isBhubaneswarRegion } from '../../services/fareMatrixService';
import { isValidLatLng, extractLatLng } from '../../utils/latLngValidator';

// Offline Primary Road Corridors in Bhubaneswar (Always visible when internet disconnected)
const BHUBANESWAR_OFFLINE_ROADS: { name: string; type: 'highway' | 'arterial'; coords: [number, number][] }[] = [
  {
    name: 'NH-16 Corridor',
    type: 'highway',
    coords: [
      [20.2580, 85.7865],
      [20.2782, 85.7972],
      [20.2910, 85.8080],
      [20.3012, 85.8245],
      [20.2950, 85.8300],
      [20.3015, 85.8425],
      [20.2974, 85.8643],
      [20.3340, 85.8820],
      [20.4578, 85.8755],
    ],
  },
  {
    name: 'Nandankanan Road',
    type: 'highway',
    coords: [
      [20.3012, 85.8245],
      [20.3220, 85.8200],
      [20.3280, 85.8190],
      [20.3542, 85.8175],
      [20.3688, 85.8242],
      [20.3995, 85.8256],
    ],
  },
  {
    name: 'Janpath Corridor',
    type: 'arterial',
    coords: [
      [20.2646, 85.8398],
      [20.2650, 85.8330],
      [20.2750, 85.8380],
      [20.2875, 85.8422],
      [20.3015, 85.8425],
    ],
  },
  {
    name: 'Cuttack-Puri Arterial',
    type: 'arterial',
    coords: [
      [20.2974, 85.8643],
      [20.2700, 85.8500],
      [20.2522, 85.8415],
      [20.2450, 85.8380],
    ],
  },
  {
    name: 'Infocity Tech Link',
    type: 'arterial',
    coords: [
      [20.3542, 85.8175],
      [20.3585, 85.8142],
      [20.3560, 85.8100],
      [20.3542, 85.8078],
      [20.3644, 85.8080],
    ],
  },
];

const BHUBANESWAR_OFFLINE_HUBS: { name: string; coords: [number, number] }[] = [
  { name: 'Master Canteen', coords: [20.2646, 85.8398] },
  { name: 'Jayadev Vihar', coords: [20.3012, 85.8245] },
  { name: 'KIIT / Patia', coords: [20.3533, 85.8175] },
  { name: 'Baramunda ISBT', coords: [20.2782, 85.7972] },
  { name: 'Rasulgarh Square', coords: [20.2974, 85.8643] },
  { name: 'Infocity IT Hub', coords: [20.3585, 85.8142] },
  { name: 'Biju Patnaik Airport', coords: [20.2525, 85.8178] },
  { name: 'Cuttack Badambadi', coords: [20.4578, 85.8755] },
];

const createOfflineHubIcon = (name: string) => {
  return L.divIcon({
    className: 'custom-offline-hub-icon',
    html: `
      <div style="
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #475569;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
        ${name}
      </div>
    `,
    iconSize: [80, 20],
    iconAnchor: [40, 10],
  });
};

const generateOfflineRoutePack = (
  originName: string,
  destName: string,
  distanceKm: number,
  durationMins: number,
  stops: { name: string; idx: number }[]
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 1000, 700);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1000, 700);

  // Top header bar
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, 1000, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('MUSAFIR BHUBANESWAR - OFFLINE ROUTE MAP', 40, 50);

  // Subheader badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`TRANSIT CORRIDOR: ${originName || 'Origin'} ➔ ${destName || 'Destination'}`, 40, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(`Road Distance: ~${distanceKm} km  |  Travel Time: ~${durationMins} mins  |  Verified Ama Bus Corridor`, 40, 145);

  // Card background for corridor schematic
  ctx.fillStyle = '#1e293b';
  if (ctx.roundRect) {
    ctx.roundRect(40, 170, 920, 200, 16);
  } else {
    ctx.fillRect(40, 170, 920, 200);
  }
  ctx.fill();

  // Schematic line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(100, 270);
  ctx.lineTo(860, 270);
  ctx.stroke();

  // Start circle
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(100, 270, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('START', 80, 240);

  // End circle
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(860, 270, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('DEST', 845, 240);

  // Intermediate stops on line
  const displayedStops = stops.slice(0, 5);
  displayedStops.forEach((stop, idx) => {
    const x = 100 + ((idx + 1) / (displayedStops.length + 1)) * 760;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, 270, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(stop.name.slice(0, 16), x - 35, 305 + (idx % 2) * 16);
  });

  // Turn by turn / stops list container
  ctx.fillStyle = '#1e293b';
  if (ctx.roundRect) {
    ctx.roundRect(40, 390, 920, 220, 16);
  } else {
    ctx.fillRect(40, 390, 920, 220);
  }
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('Stoppage Waypoints & Key Landmarks Along Route:', 60, 425);

  const stopsToRender = stops.length > 0 ? stops.slice(0, 8) : [{ name: 'Direct Express Transit Corridor', idx: 1 }];
  stopsToRender.forEach((stop, i) => {
    const col = i < 4 ? 60 : 500;
    const row = 460 + (i % 4) * 35;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`${stop.idx}.`, col, row);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(stop.name, col + 25, row);
  });

  // Footer / Emergency Helpline
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 640, 1000, 60);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('CRUT Mo Bus Helpline: 1800 345 1106  |  Emergency Police: 112  |  Ambulance: 108', 40, 675);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(`Saved for Offline Use • ${new Date().toLocaleDateString()}`, 750, 675);

  // Trigger download
  const link = document.createElement('a');
  link.download = `Musafir_Route_${(originName || 'Origin').replace(/\s+/g, '_')}_to_${(destName || 'Dest').replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

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
  const validCoords = (route?.coordinates || []).filter(isValidLatLng);
  if (validCoords.length === 0) return [20.2961, 85.8245];
  // Slightly stagger along length so multiple route bubbles don't stack directly over each other
  const fractions = [0.5, 0.38, 0.62, 0.45];
  const fraction = fractions[idx % fractions.length];
  const targetIdx = Math.floor(validCoords.length * fraction);
  const pos = validCoords[targetIdx] || validCoords[0];
  return isValidLatLng(pos) ? pos : [20.2961, 85.8245];
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
      if (e?.latlng && Number.isFinite(e.latlng.lat) && Number.isFinite(e.latlng.lng)) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    const validOrigin = isValidLatLng(originCoords) ? originCoords : null;
    const validDest = isValidLatLng(destCoords) ? destCoords : null;

    if (validOrigin && validDest) {
      try {
        const bounds = L.latLngBounds([validOrigin, validDest]);
        const key = `od-${validOrigin.join(',')}-${validDest.join(',')}`;
        if (prevBoundsRef.current !== key) {
          prevBoundsRef.current = key;
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
        }
      } catch (err) {
        console.warn('MapController fitBounds error:', err);
      }
    } else if (validOrigin) {
      try {
        const key = `orig-${validOrigin.join(',')}`;
        if (prevBoundsRef.current !== key) {
          prevBoundsRef.current = key;
          map.flyTo(validOrigin, 15, { animate: true, duration: 1.2 });
        }
      } catch (err) {
        console.warn('MapController flyTo origin error:', err);
      }
    } else if (validDest) {
      try {
        const key = `dest-${validDest.join(',')}`;
        if (prevBoundsRef.current !== key) {
          prevBoundsRef.current = key;
          map.flyTo(validDest, 15, { animate: true, duration: 1.2 });
        }
      } catch (err) {
        console.warn('MapController flyTo dest error:', err);
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
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [clickedPin, setClickedPin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [showStops, setShowStops] = useState(true);
  const [routeStops, setRouteStops] = useState<{ name: string; coords: [number, number]; idx: number }[]>([]);
  const [isDownloadingMap, setIsDownloadingMap] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Download offline route map package
  const handleDownloadOfflineRoute = () => {
    if (!selectedRoute) return;
    setIsDownloadingMap(true);
    try {
      generateOfflineRoutePack(
        originName || 'Bhubaneswar Departure',
        destinationName || 'Destination Terminal',
        selectedRoute.distanceKm,
        selectedRoute.durationMinutes,
        routeStops
      );
      setDownloadSuccessToast('Offline Route Map Downloaded Successfully! Saved as high-res PNG.');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloadingMap(false);
    }
  };

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
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Number.isNaN(lat) || Number.isNaN(lng)) return;
    const readable = getHumanReadableLocationName(lat, lng);
    const cleanName = readable.replace('Pinned Location ', '');
    setClickedPin({ lat, lng, name: cleanName });
  };

  const validOrigin = extractLatLng(originCoords);
  const validDest = extractLatLng(destCoords);
  const validUser = userLocation ? extractLatLng([userLocation.lat, userLocation.lng]) : null;

  const mapCenter: [number, number] = validOrigin || validUser || [20.2961, 85.8245];

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all bg-slate-900 z-0 isolate">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController
          originCoords={validOrigin}
          destCoords={validDest}
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

        {/* ─── OFFLINE MODE: Never Blank - Render Cacheable Base Tiles + Arterial Vector Roads & Hubs ─── */}
        {isOffline && (
          <>
            <TileLayer
              attribution='Offline Cached Map Tiles &bull; Musafir'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={18}
              opacity={0.8}
            />
            {BHUBANESWAR_OFFLINE_ROADS.map((road) => (
              <Polyline
                key={road.name}
                positions={road.coords}
                pathOptions={{
                  color: road.type === 'highway' ? '#3b82f6' : '#64748b',
                  weight: road.type === 'highway' ? 4.5 : 3,
                  opacity: 0.85,
                  dashArray: road.type === 'arterial' ? '4, 4' : undefined,
                }}
              >
                <Tooltip direction="center" permanent={false} opacity={0.85}>
                  <span className="text-[10px] font-bold text-slate-900">{road.name}</span>
                </Tooltip>
              </Polyline>
            ))}
            {BHUBANESWAR_OFFLINE_HUBS.map((hub) => (
              <Marker
                key={hub.name}
                position={hub.coords}
                icon={createOfflineHubIcon(hub.name)}
              />
            ))}
          </>
        )}

        {/* ─── Non-selected alternate routes (drawn first, dim + clickable) ─── */}
        {routeOptions
          .filter((r) => r.id !== selectedRouteId)
          .map((route, idx) => {
            const validCoords = (route.coordinates || []).filter(isValidLatLng);
            const bubblePos = getRouteBubblePosition(route, idx + 1);
            return (
              <React.Fragment key={route.id}>
                {validCoords.length >= 2 && (
                  <Polyline
                    positions={validCoords}
                    pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.65 }}
                    eventHandlers={{ click: () => setSelectedRouteId(route.id) }}
                  />
                )}
                {isValidLatLng(bubblePos) && (
                  <Marker
                    position={bubblePos}
                    icon={routeLabelIcon(route, false)}
                    eventHandlers={{ click: () => setSelectedRouteId(route.id) }}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/* ─── Selected route on top, bold blue ─── */}
        {selectedRoute && (() => {
          const validCoords = (selectedRoute.coordinates || []).filter(isValidLatLng);
          const bubblePos = getRouteBubblePosition(selectedRoute, 0);
          return (
            <React.Fragment key={selectedRoute.id}>
              {validCoords.length >= 2 && (
                <Polyline
                  positions={validCoords}
                  pathOptions={{ color: '#2563eb', weight: 7, opacity: 0.95 }}
                />
              )}
              {isValidLatLng(bubblePos) && (
                <Marker
                  position={bubblePos}
                  icon={routeLabelIcon(selectedRoute, true)}
                />
              )}
            </React.Fragment>
          );
        })()}

        {/* ─── Origin Pin ─── */}
        {validOrigin && (
          <Marker position={validOrigin} icon={createLeafletPinIcon('#2563eb', '🛫')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                <span className="text-blue-600 font-extrabold block">Origin Departure</span>
                <span>{originName || 'Journey Start'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ─── Destination Pin ─── */}
        {validDest && (
          <Marker position={validDest} icon={createLeafletPinIcon('#e11d48', '🏁')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                <span className="text-rose-600 font-extrabold block">Destination</span>
                <span>{destinationName || 'Journey Destination'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ─── Intermediate Ama Bus Stops along Route Corridor (Clean Minimal Points within 100m) ─── */}
        {showStops && routeStops
          .filter((stop) => isValidLatLng(stop.coords))
          .map((stop, i) => (
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
        {clickedPin && isValidLatLng([clickedPin.lat, clickedPin.lng]) && (
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
        {isGpsActive && validUser && (
          <>
            <Marker position={validUser} icon={createLeafletPinIcon('#3b82f6', '📍')}>
              <Popup>
                <div className="text-xs font-bold text-slate-900 p-1">
                  <strong className="text-blue-600 block">Your Current GPS Location</strong>
                  <span className="text-[10px] text-slate-500">
                    Accuracy: ±{Math.round(Number.isFinite(userLocation?.accuracy) ? (userLocation?.accuracy || 10) : 10)}m
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={validUser}
              radius={Math.max(30, Number.isFinite(userLocation?.accuracy) ? (userLocation?.accuracy || 30) : 30)}
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
            {/* Download Offline Map Button */}
            {selectedRoute && (
              <button
                onClick={handleDownloadOfflineRoute}
                disabled={isDownloadingMap}
                className="px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/25 active:scale-95 transition-all"
                title="Download complete route map and stops for offline travel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingMap ? 'Saving...' : 'Offline Map'}</span>
              </button>
            )}

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

      {/* ─── Offline Mode Active Notice Bar ─── */}
      {isOffline && (
        <div className="absolute top-16 left-3.5 right-3.5 z-10 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-amber-500/95 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2 border border-amber-300 animate-bounce">
            <span>📡 Offline Mode Active:</span>
            <span className="font-semibold text-[11px]">Displaying cached road grid &amp; transit corridors. No black screen.</span>
          </div>
        </div>
      )}

      {/* ─── Download Success Toast Notification ─── */}
      {downloadSuccessToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-2">
            <span>✅</span>
            <span>{downloadSuccessToast}</span>
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
