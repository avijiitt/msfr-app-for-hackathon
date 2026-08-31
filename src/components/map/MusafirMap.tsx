/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
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

// Fallback public demo key if none configured
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
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#132826' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6ee7b7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#243044' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a2333' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#60a5fa' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091528' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

// Helper to create SVG data URL markers
const createSvgMarkerIcon = (
  bgColor: string,
  badgeText: string,
  emoji: string = '🚍'
): google.maps.Icon => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="52" viewBox="0 0 46 52">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <circle cx="23" cy="20" r="18" fill="${bgColor}" stroke="#ffffff" stroke-width="2.5" filter="url(#shadow)" />
      <text x="23" y="25" font-size="16" text-anchor="middle" dominant-baseline="central">${emoji}</text>
      <rect x="3" y="38" width="40" height="13" rx="4" fill="#0f172a" stroke="${bgColor}" stroke-width="1.2" />
      <text x="23" y="47" font-size="8.5" font-weight="900" font-family="sans-serif" fill="#ffffff" text-anchor="middle">${badgeText}</text>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(46, 52),
    anchor: new google.maps.Point(23, 20),
  };
};

const createPinIcon = (
  pinColor: string,
  symbol: string,
  label: string
): google.maps.Icon => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${pinColor}" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 28 20 28s20-14 20-28C40 8.954 31.046 0 20 0z" fill="${pinColor}" stroke="#ffffff" stroke-width="2" filter="url(#glow)"/>
      <circle cx="20" cy="18" r="12" fill="#ffffff" />
      <text x="20" y="22" font-size="13" text-anchor="middle">${symbol}</text>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40, 48),
    anchor: new google.maps.Point(20, 48),
  };
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const vehicleMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const userGpsMarkerRef = useRef<google.maps.Marker | null>(null);
  const userGpsCircleRef = useRef<google.maps.Circle | null>(null);
  const clickedPinMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isLiveTrafficActive, setIsLiveTrafficActive] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const [clickedPin, setClickedPin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: number;
    durationMins: number;
    routeType: string;
    pointsCount: number;
  } | null>(null);

  // 1. Initialize Google Maps JavaScript API via importLibrary
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

    Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('routes'),
    ])
      .then(([mapsLib]) => {
        if (!isMounted || !mapContainerRef.current) return;

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
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          rotateControl: true,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          styles: themeMode === 'dark' ? GOOGLE_MAP_DARK_STYLES : [],
        };

        const map = new mapsLib.Map(mapContainerRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Initialize Native Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        trafficLayerRef.current = trafficLayer;

        // Initialize Shared InfoWindow
        infoWindowRef.current = new google.maps.InfoWindow();

        // Handle Map Click to Pin
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const readable = getHumanReadableLocationName(lat, lng);
          const cleanName = readable.replace('Pinned Location ', '');

          setClickedPin({ lat, lng, name: cleanName });

          if (clickedPinMarkerRef.current) {
            clickedPinMarkerRef.current.setPosition(e.latLng);
            clickedPinMarkerRef.current.setVisible(true);
          } else {
            clickedPinMarkerRef.current = new google.maps.Marker({
              position: e.latLng,
              map,
              icon: createPinIcon('#e11d48', '📍', cleanName),
              animation: google.maps.Animation.DROP,
              title: cleanName,
            });
          }
        });

        setIsMapLoaded(true);
      })
      .catch((err: any) => {
        console.error('Google Maps importLibrary error:', err);
        if (isMounted) {
          setMapLoadError('Google Maps API encountered an initialization issue. Retrying with direct vector rendering.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle Theme Change on Google Maps
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || typeof google === 'undefined') return;
    mapInstanceRef.current.setOptions({
      styles: themeMode === 'dark' ? GOOGLE_MAP_DARK_STYLES : [],
    });
  }, [themeMode, isMapLoaded]);

  // 3. Handle Map Type Change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || typeof google === 'undefined') return;
    const typeId =
      mapType === 'satellite'
        ? google.maps.MapTypeId.HYBRID
        : mapType === 'terrain'
        ? google.maps.MapTypeId.TERRAIN
        : google.maps.MapTypeId.ROADMAP;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType, isMapLoaded]);

  // 4. Handle Live Traffic Layer Toggle
  useEffect(() => {
    if (!trafficLayerRef.current || !mapInstanceRef.current || !isMapLoaded) return;
    trafficLayerRef.current.setMap(isLiveTrafficActive ? mapInstanceRef.current : null);
  }, [isLiveTrafficActive, isMapLoaded]);

  // 5. Update Origin & Destination Markers and Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || typeof google === 'undefined') return;
    const map = mapInstanceRef.current;

    // Origin Marker
    if (originCoords) {
      const originLatLng = { lat: originCoords[0], lng: originCoords[1] };
      if (!originMarkerRef.current) {
        originMarkerRef.current = new google.maps.Marker({
          position: originLatLng,
          map,
          icon: createPinIcon('#2563eb', '🛫', originName || 'Origin'),
          title: originName || 'Origin Point',
          zIndex: 100,
        });
      } else {
        originMarkerRef.current.setPosition(originLatLng);
        originMarkerRef.current.setTitle(originName || 'Origin Point');
        originMarkerRef.current.setVisible(true);
      }
    } else if (originMarkerRef.current) {
      originMarkerRef.current.setVisible(false);
    }

    // Destination Marker
    if (destCoords) {
      const destLatLng = { lat: destCoords[0], lng: destCoords[1] };
      if (!destMarkerRef.current) {
        destMarkerRef.current = new google.maps.Marker({
          position: destLatLng,
          map,
          icon: createPinIcon('#e11d48', '🏁', destinationName || 'Destination'),
          title: destinationName || 'Destination Point',
          zIndex: 100,
        });
      } else {
        destMarkerRef.current.setPosition(destLatLng);
        destMarkerRef.current.setTitle(destinationName || 'Destination Point');
        destMarkerRef.current.setVisible(true);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.setVisible(false);
    }

    // Fetch and Draw Route Polyline
    if (originCoords && destCoords) {
      getRouteDirections(originCoords, destCoords).then((res) => {
        if (!mapInstanceRef.current || typeof google === 'undefined') return;

        const path = res.coordinates.map(([lat, lng]) => ({ lat, lng }));
        setRouteSummary({
          distanceKm: res.distanceKm,
          durationMins: res.durationMinutes,
          routeType: (res as any).routeType || 'google-maps',
          pointsCount: path.length,
        });

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
            map: mapInstanceRef.current,
            zIndex: 50,
          });
        }

        // Fit Bounds smoothly
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: originCoords[0], lng: originCoords[1] });
        bounds.extend({ lat: destCoords[0], lng: destCoords[1] });
        map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });
      });
    } else {
      if (routePolylineRef.current) {
        routePolylineRef.current.setVisible(false);
      }
      setRouteSummary(null);

      // Single point centering
      if (originCoords) {
        map.panTo({ lat: originCoords[0], lng: originCoords[1] });
        map.setZoom(14);
      } else if (destCoords) {
        map.panTo({ lat: destCoords[0], lng: destCoords[1] });
        map.setZoom(14);
      }
    }
  }, [originCoords, destCoords, originName, destinationName, isMapLoaded]);

  // 6. Real-Time User Live GPS Location Pin & Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || typeof google === 'undefined') return;
    const map = mapInstanceRef.current;

    if (isGpsActive && userLocation && userLocation.lat && userLocation.lng) {
      const userLatLng = { lat: userLocation.lat, lng: userLocation.lng };

      if (!userGpsMarkerRef.current) {
        userGpsMarkerRef.current = new google.maps.Marker({
          position: userLatLng,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          title: 'Your Real-Time Location (India)',
          zIndex: 200,
        });
      } else {
        userGpsMarkerRef.current.setPosition(userLatLng);
        userGpsMarkerRef.current.setVisible(true);
      }

      if (!userGpsCircleRef.current) {
        userGpsCircleRef.current = new google.maps.Circle({
          map,
          center: userLatLng,
          radius: Math.max(30, userLocation.accuracy || 30),
          fillColor: '#3B82F6',
          fillOpacity: 0.18,
          strokeColor: '#2563EB',
          strokeOpacity: 0.7,
          strokeWeight: 1.5,
        });
      } else {
        userGpsCircleRef.current.setCenter(userLatLng);
        userGpsCircleRef.current.setRadius(Math.max(30, userLocation.accuracy || 30));
        userGpsCircleRef.current.setVisible(true);
      }
    } else {
      if (userGpsMarkerRef.current) userGpsMarkerRef.current.setVisible(false);
      if (userGpsCircleRef.current) userGpsCircleRef.current.setVisible(false);
    }
  }, [isGpsActive, userLocation, isMapLoaded]);

  // 7. Render & Sync Live Transit Vehicles
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || typeof google === 'undefined') return;
    const map = mapInstanceRef.current;
    const currentMarkers = vehicleMarkersRef.current;
    const activeIds = new Set<string>();

    vehicles.forEach((vehicle) => {
      activeIds.add(vehicle.id);
      const pos = { lat: vehicle.lat, lng: vehicle.lng };
      const isDelayed = vehicle.delaySeconds > 60;
      const isPink = vehicle.routeId === 'PINK-EV';
      const isMetro = vehicle.mode === 'metro';
      const emoji = isPink ? '⚡' : isMetro ? '🚇' : '🚍';
      const color = isDelayed ? '#ef4444' : isPink ? '#ec4899' : isMetro ? '#f59e0b' : '#2563eb';
      const routeBadge = vehicle.routeId.replace('MB-', '');

      let marker = currentMarkers.get(vehicle.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: pos,
          map,
          icon: createSvgMarkerIcon(color, `R-${routeBadge}`, emoji),
          title: `Mo Bus Route ${vehicle.routeId}`,
          zIndex: 70,
        });

        marker.addListener('click', () => {
          if (!infoWindowRef.current) return;
          const content = `
            <div style="font-family: sans-serif; padding: 6px; min-width: 180px; color: #0f172a;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <strong style="font-size: 13px; color: ${color};">🚍 Mo Bus Route ${vehicle.routeId}</strong>
                <span style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                  ${vehicle.speedKmH || 35} km/h
                </span>
              </div>
              <p style="font-size: 11px; margin: 2px 0; color: #475569;">
                <strong>Next Stop:</strong> ${vehicle.nextStopName || 'Approaching Bay'}
              </p>
              <p style="font-size: 11px; margin: 2px 0; color: #475569;">
                <strong>Occupancy:</strong> <span style="text-transform: capitalize; font-weight: bold;">${vehicle.occupancy || 'moderate'}</span>
              </p>
              <p style="font-size: 10px; margin-top: 4px; color: ${isDelayed ? '#dc2626' : '#16a34a'}; font-weight: bold;">
                ${isDelayed ? `⚠️ Delayed by ${Math.round(vehicle.delaySeconds / 60)} mins` : '✓ On Time (Live GPS)'}
              </p>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);
        });

        currentMarkers.set(vehicle.id, marker);
      } else {
        marker.setPosition(pos);
      }
    });

    // Remove obsolete vehicles
    currentMarkers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    });
  }, [vehicles, isMapLoaded]);

  // Recenter GPS Handler
  const handleRecenterGps = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation && userLocation.lat && userLocation.lng) {
      mapInstanceRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      mapInstanceRef.current.setZoom(15);
    } else if (originCoords) {
      mapInstanceRef.current.panTo({ lat: originCoords[0], lng: originCoords[1] });
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current.panTo({ lat: 20.2961, lng: 85.8245 });
      mapInstanceRef.current.setZoom(14);
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all">
      {/* ─── Google Maps Canvas Container ─── */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* ─── Loading / Error Fallback Overlay ─── */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center z-50">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-spin mb-3 shadow-lg shadow-blue-600/50">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-black text-base tracking-tight">Initializing Google Maps Platform...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Loading Google Maps Vector Engine, Live Traffic Layer & Geocoding SDK.
          </p>
        </div>
      )}

      {/* ─── Top-Left Live Status & Traffic Header Overlay ─── */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Live Traffic Badge */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLiveTrafficActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-[11px] font-black text-white">
            {isLiveTrafficActive ? '🚦 Google Live Traffic: Active' : 'Traffic Overlay: Muted'}
          </span>
          <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-md">
            Google Maps API
          </span>
        </div>

        {/* Route Info Badge (When O-D is active) */}
        {routeSummary && (
          <div className="pointer-events-auto bg-blue-600/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in">
            <div>
              <div className="text-[10px] font-bold uppercase opacity-80">Google Route Corridor</div>
              <div className="text-xs font-black">
                {routeSummary.distanceKm} km • ~{routeSummary.durationMins} mins
              </div>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="text-[10px] font-bold">
              {routeSummary.routeType === 'google-maps' ? '⚡ Google Directions' : 'Corridor Sync'}
            </div>
          </div>
        )}
      </div>

      {/* ─── Top-Right Map Type & Layer Controls ─── */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapType === 'roadmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Roadmap View"
        >
          Map
        </button>

        <button
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapType === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Satellite / Hybrid Imagery"
        >
          Satellite
        </button>

        <button
          onClick={() => setMapType('terrain')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition ${
            mapType === 'terrain'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Google Terrain Elevation View"
        >
          Terrain
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        {/* Live Traffic Toggle Button */}
        <button
          onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition ${
            isLiveTrafficActive
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Google Live Traffic Layer"
        >
          <span>🚦 Traffic</span>
        </button>
      </div>

      {/* ─── Bottom-Right Quick Recenter Action ─── */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenterGps}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition active:scale-90"
          title="Recenter Map on Current Position"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Interactive Clicked Pin Action Banner ─── */}
      {clickedPin && (
        <div className="absolute bottom-4 left-4 right-16 sm:right-auto sm:max-w-md z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border-2 border-blue-500 shadow-2xl animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <strong className="text-xs font-black text-slate-900 dark:text-white truncate">
                {clickedPin.name}
              </strong>
            </div>
            <button
              onClick={() => {
                setClickedPin(null);
                if (clickedPinMarkerRef.current) clickedPinMarkerRef.current.setVisible(false);
              }}
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
                if (clickedPinMarkerRef.current) clickedPinMarkerRef.current.setVisible(false);
              }}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shadow-sm transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span>🛫 Set as From</span>
            </button>

            <button
              onClick={() => {
                onSelectLocationOnMap(clickedPin.lat, clickedPin.lng, clickedPin.name, 'dest');
                setClickedPin(null);
                if (clickedPinMarkerRef.current) clickedPinMarkerRef.current.setVisible(false);
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
