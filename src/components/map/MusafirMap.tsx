/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
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

// Fallback key if none configured in env
const EFFECTIVE_GOOGLE_KEY = GOOGLE_MAPS_API_KEY || 'AIzaSyBxK55bcOFGfpkIX_0Hi6AyWzwjCSGPFQM';

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

// Custom Sleek Dark Map Styles for Google Maps
const GOOGLE_MAP_DARK_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#181e29' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#181e29' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#132826' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6ee7b7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#243044' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2333' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#60a5fa' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#091528' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
];

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
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: #0f172a; 
          border: 2px solid ${ringColor}; 
          box-shadow: 0 0 10px ${ringColor}80;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 15px;
        ">
          ${emoji}
        </div>
        <div style="
          position: absolute; 
          bottom: -13px; 
          background: rgba(15, 23, 42, 0.95); 
          color: #f8fafc; 
          font-size: 8.5px; 
          font-weight: 800; 
          padding: 1px 4px; 
          border-radius: 3px; 
          border: 1px solid rgba(59, 130, 246, 0.4); 
          white-space: nowrap;
        ">
          R-${routeBadge}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createLeafletPinIcon = (pinColor: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${pinColor};
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Internal Leaflet Map Controller
const LeafletMapController: React.FC<{
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
}> = ({ originCoords, destCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (originCoords && destCoords) {
      const bounds = L.latLngBounds([originCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else if (originCoords) {
      map.flyTo(originCoords, 15, { animate: true });
    } else if (destCoords) {
      map.flyTo(destCoords, 15, { animate: true });
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
  const googleMapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const vehicleMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const userGpsMarkerRef = useRef<google.maps.Marker | null>(null);
  const userGpsCircleRef = useRef<google.maps.Circle | null>(null);
  const clickedPinMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [isLiveTrafficActive, setIsLiveTrafficActive] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

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

  // 1. Initialize Google Maps Engine with Fallback
  useEffect(() => {
    let isMounted = true;

    try {
      setOptions({
        key: EFFECTIVE_GOOGLE_KEY,
        v: 'weekly',
        region: 'IN',
        language: 'en',
      });
    } catch {}

    const initTimeout = setTimeout(() => {
      // If Google Maps takes > 3.5s to load (e.g. offline or strict network), fallback gracefully to Leaflet
      if (isMounted && !isGoogleMapsReady) {
        setMapEngine('leaflet');
      }
    }, 3500);

    Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('routes'),
    ])
      .then(([mapsLib]) => {
        if (!isMounted || !googleMapContainerRef.current) return;
        clearTimeout(initTimeout);

        const defaultCenter = {
          lat: originCoords ? originCoords[0] : (userLocation?.lat || 20.2961),
          lng: originCoords ? originCoords[1] : (userLocation?.lng || 85.8245),
        };

        const mapOptions: google.maps.MapOptions = {
          center: defaultCenter,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          styles: themeMode === 'dark' ? GOOGLE_MAP_DARK_STYLES : [],
        };

        const map = new mapsLib.Map(googleMapContainerRef.current, mapOptions);
        googleMapInstanceRef.current = map;

        // Live Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        trafficLayerRef.current = trafficLayer;

        infoWindowRef.current = new google.maps.InfoWindow();

        // Click to Pin
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const readable = getHumanReadableLocationName(lat, lng);
          const cleanName = readable.replace('Pinned Location ', '');

          setClickedPin({ lat, lng, name: cleanName });
        });

        setIsGoogleMapsReady(true);
        setMapEngine('google');
      })
      .catch((err) => {
        console.warn('Google Maps load deferred, using high-res vector OpenStreetMap engine:', err);
        if (isMounted) {
          setMapEngine('leaflet');
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
    };
  }, []);

  // 2. Fetch Directions Polyline
  useEffect(() => {
    if (originCoords && destCoords) {
      getRouteDirections(originCoords, destCoords).then((res) => {
        setRouteCoordinates(res.coordinates);
        setRouteSummary({
          distanceKm: res.distanceKm,
          durationMins: res.durationMinutes,
          pointsCount: res.coordinates.length,
        });

        if (googleMapInstanceRef.current && isGoogleMapsReady && typeof google !== 'undefined') {
          const path = res.coordinates.map(([lat, lng]) => ({ lat, lng }));
          if (routePolylineRef.current) {
            routePolylineRef.current.setPath(path);
            routePolylineRef.current.setVisible(true);
          } else {
            routePolylineRef.current = new google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: '#2563EB',
              strokeOpacity: 0.9,
              strokeWeight: 6,
              map: googleMapInstanceRef.current,
            });
          }

          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: originCoords[0], lng: originCoords[1] });
          bounds.extend({ lat: destCoords[0], lng: destCoords[1] });
          googleMapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        }
      });
    } else {
      setRouteCoordinates([]);
      setRouteSummary(null);
      if (routePolylineRef.current) {
        routePolylineRef.current.setVisible(false);
      }
    }
  }, [originCoords, destCoords, isGoogleMapsReady]);

  // 3. Sync Live Traffic Layer
  useEffect(() => {
    if (!trafficLayerRef.current || !googleMapInstanceRef.current || !isGoogleMapsReady) return;
    trafficLayerRef.current.setMap(isLiveTrafficActive ? googleMapInstanceRef.current : null);
  }, [isLiveTrafficActive, isGoogleMapsReady]);

  // 4. Center Coordinates Fallback
  const mapCenter: [number, number] = originCoords
    ? originCoords
    : (userLocation && userLocation.lat ? [userLocation.lat, userLocation.lng] : [20.2961, 85.8245]);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all bg-slate-900">
      {/* ─── 1. Google Maps Engine ─── */}
      <div
        ref={googleMapContainerRef}
        className={`w-full h-full ${mapEngine === 'google' && isGoogleMapsReady ? 'block' : 'hidden'}`}
      />

      {/* ─── 2. Leaflet Resilient Engine (Rendered when selected or during Google fallback) ─── */}
      {mapEngine === 'leaflet' && (
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
        >
          <LeafletMapController originCoords={originCoords || null} destCoords={destCoords || null} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className={themeMode === 'dark' ? 'dark-tiles' : ''}
          />

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }}
            />
          )}

          {/* Origin Marker */}
          {originCoords && (
            <Marker position={originCoords} icon={createLeafletPinIcon('#2563eb', '🛫')}>
              <Popup>
                <div className="text-xs font-bold text-slate-900">{originName || 'Journey Origin'}</div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {destCoords && (
            <Marker position={destCoords} icon={createLeafletPinIcon('#e11d48', '🏁')}>
              <Popup>
                <div className="text-xs font-bold text-slate-900">{destinationName || 'Destination'}</div>
              </Popup>
            </Marker>
          )}

          {/* User GPS Pin */}
          {isGpsActive && userLocation && userLocation.lat && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={createLeafletPinIcon('#3b82f6', '📍')} />
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={Math.max(30, userLocation.accuracy || 30)}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }}
              />
            </>
          )}

          {/* Live Fleet Vehicles */}
          {vehicles.map((v) => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={createLeafletVehicleIcon(v)}>
              <Popup>
                <div className="text-xs font-sans p-1 text-slate-900">
                  <div className="font-extrabold text-blue-600">Mo Bus Route {v.routeId}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Speed: {v.speedKmH || 35} km/h</div>
                  <div className="text-[11px] text-slate-600">Next: {v.nextStopName || 'Approaching Stop'}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* ─── Top-Left Live Status Overlay ─── */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLiveTrafficActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-[11px] font-black text-white">
            {mapEngine === 'google' ? '🚦 Google Live Traffic: Active' : '🗺️ Live Fleet Sync Active'}
          </span>
          <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-md">
            {mapEngine === 'google' ? 'Google Maps API' : 'High-Res Map'}
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

      {/* ─── Top-Right Engine & Traffic Controls ─── */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setMapEngine(mapEngine === 'google' ? 'leaflet' : 'google')}
          className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-blue-600 text-white shadow-sm transition active:scale-95 flex items-center gap-1"
          title="Toggle Map Engine"
        >
          <span>{mapEngine === 'google' ? 'Google Maps' : 'OSM Map'}</span>
        </button>

        <button
          onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            isLiveTrafficActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Traffic Layer"
        >
          <span>🚦 Traffic</span>
        </button>
      </div>

      {/* ─── Bottom-Right Recenter GPS Action ─── */}
      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={() => {
            if (userLocation && userLocation.lat) {
              if (googleMapInstanceRef.current) {
                googleMapInstanceRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
              }
            }
          }}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition active:scale-90"
          title="Recenter GPS Position"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
