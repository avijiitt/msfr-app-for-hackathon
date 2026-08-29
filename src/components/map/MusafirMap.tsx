import React, { useState, useEffect, useRef } from 'react';
import {
  Bus, LocateFixed, Plus, Minus,
  Clock, WifiOff, Layers, X, RefreshCw
} from 'lucide-react';
import { Vehicle } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { getRouteDirections, RouteDirectionsResult } from '../../services/olaRoutingService';
import { getHumanReadableLocationName } from '../../data/cities/bhubaneswar';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const destMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicleMarkersMapRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);

  const [isMapplsLoaded, setIsMapplsLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showBuses, setShowBuses] = useState(true);
  const [showAutos, setShowAutos] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [isLiveFleetEnabled, setIsLiveFleetEnabled] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteDirectionsResult | null>(null);

  const prevBoundsKeyRef = useRef<string>('');

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

  // Wait for window.mappls to become ready
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 60;
    const interval = setInterval(() => {
      checkCount++;
      if (typeof window !== 'undefined' && window.mappls && typeof window.mappls.Map === 'function') {
        setIsMapplsLoaded(true);
        clearInterval(interval);
      } else if (checkCount >= maxChecks) {
        clearInterval(interval);
        if (!window.mappls) {
          setMapInitError('Mappls SDK loading timeout');
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Mappls Map
  useEffect(() => {
    if (!isMapplsLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const defaultCenter = originCoords || [20.2961, 85.8245];
      
      const map = new window.mappls!.Map(mapContainerRef.current, {
        center: [defaultCenter[0], defaultCenter[1]],
        zoom: 13,
        zoomControl: false,
        hybrid: false,
        traffic: showTraffic,
        layer: 'vector',
      });

      mapInstanceRef.current = map;

      // Handle map click for picking locations
      map.addListener('click', (e: any) => {
        const lat = e.lngLat?.lat ?? e.latLng?.lat;
        const lng = e.lngLat?.lng ?? e.latLng?.lng;
        if (lat && lng) {
          const locationName = getHumanReadableLocationName(lat, lng);
          onSelectLocationOnMap(lat, lng, locationName, originCoords ? 'dest' : 'origin');
        }
      });
    } catch (err: any) {
      console.warn('Mappls Map Init Error:', err);
      setMapInitError(err?.message || 'Failed to initialize Mappls Map');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [isMapplsLoaded]);

  // Handle Traffic Layer Toggle
  useEffect(() => {
    if (mapInstanceRef.current && typeof mapInstanceRef.current.setTraffic === 'function') {
      try {
        mapInstanceRef.current.setTraffic(showTraffic);
      } catch {}
    }
  }, [showTraffic]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.mappls) return;

    if (polylineRef.current) {
      try {
        polylineRef.current.remove();
      } catch {}
      polylineRef.current = null;
    }

    const points: Array<{ lat: number; lng: number }> = [];

    if (routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0) {
      routeInfo.coordinates.forEach(([lat, lng]) => {
        points.push({ lat, lng });
      });
    } else if (originCoords && destCoords) {
      points.push({ lat: originCoords[0], lng: originCoords[1] });
      points.push({ lat: destCoords[0], lng: destCoords[1] });
    }

    if (points.length >= 2) {
      try {
        polylineRef.current = new window.mappls.Polyline({
          map: map,
          paths: points,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.85,
          strokeWeight: 6,
        });
      } catch (err) {
        console.warn('Error rendering polyline:', err);
      }
    }
  }, [routeInfo, originCoords, destCoords, isMapplsLoaded]);

  // Update Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (originCoords && destCoords) {
      const boundsKey = `${originCoords[0].toFixed(3)},${originCoords[1].toFixed(3)}-${destCoords[0].toFixed(3)},${destCoords[1].toFixed(3)}`;
      if (prevBoundsKeyRef.current !== boundsKey) {
        prevBoundsKeyRef.current = boundsKey;
        try {
          const minLat = Math.min(originCoords[0], destCoords[0]);
          const maxLat = Math.max(originCoords[0], destCoords[0]);
          const minLng = Math.min(originCoords[1], destCoords[1]);
          const maxLng = Math.max(originCoords[1], destCoords[1]);

          if (typeof map.fitBounds === 'function') {
            map.fitBounds([[minLat, minLng], [maxLat, maxLng]], {
              padding: 60,
              maxZoom: 15,
            });
          }
        } catch {}
      }
    } else if (originCoords) {
      const centerKey = `${originCoords[0].toFixed(3)},${originCoords[1].toFixed(3)}`;
      if (prevBoundsKeyRef.current !== centerKey) {
        prevBoundsKeyRef.current = centerKey;
        try {
          if (typeof map.setCenter === 'function') {
            map.setCenter({ lat: originCoords[0], lng: originCoords[1] });
            map.setZoom(14);
          }
        } catch {}
      }
    }
  }, [originCoords, destCoords, isMapplsLoaded]);

  // Update Origin Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.mappls) return;

    if (originMarkerRef.current) {
      try {
        originMarkerRef.current.remove();
      } catch {}
      originMarkerRef.current = null;
    }

    if (originCoords) {
      try {
        const originHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer; transform:translate(-50%, -100%);">
            <div style="width:34px; height:34px; border-radius:50%; background:#10B981; border:3px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:16px;">
              🟢
            </div>
            <div style="background:#ffffff; padding:3px 8px; border-radius:8px; font-size:11px; font-weight:800; color:#0f172a; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.25); border:1px solid #e2e8f0; margin-top:3px; max-width:160px; overflow:hidden; text-overflow:ellipsis;">
              ${originName || 'Departure'}
            </div>
          </div>
        `;

        originMarkerRef.current = new window.mappls.Marker({
          map: map,
          position: { lat: originCoords[0], lng: originCoords[1] },
          html: originHtml,
          title: originName || 'Origin',
        });
      } catch (err) {
        console.warn('Error creating origin marker:', err);
      }
    }
  }, [originCoords, originName, isMapplsLoaded]);

  // Update Destination Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.mappls) return;

    if (destMarkerRef.current) {
      try {
        destMarkerRef.current.remove();
      } catch {}
      destMarkerRef.current = null;
    }

    if (destCoords) {
      try {
        const destHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer; transform:translate(-50%, -100%);">
            <div style="width:34px; height:34px; border-radius:50%; background:#EF4444; border:3px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:16px;">
              📍
            </div>
            <div style="background:#ffffff; padding:3px 8px; border-radius:8px; font-size:11px; font-weight:800; color:#0f172a; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.25); border:1px solid #e2e8f0; margin-top:3px; max-width:160px; overflow:hidden; text-overflow:ellipsis;">
              ${destinationName || 'Destination'}
            </div>
          </div>
        `;

        destMarkerRef.current = new window.mappls.Marker({
          map: map,
          position: { lat: destCoords[0], lng: destCoords[1] },
          html: destHtml,
          title: destinationName || 'Destination',
        });
      } catch (err) {
        console.warn('Error creating dest marker:', err);
      }
    }
  }, [destCoords, destinationName, isMapplsLoaded]);

  // Update User Location Beacon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.mappls || !userLocation) return;

    if (userMarkerRef.current) {
      try {
        userMarkerRef.current.remove();
      } catch {}
      userMarkerRef.current = null;
    }

    if (userLocation.lat && userLocation.lng) {
      try {
        const beaconHtml = `
          <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center; transform:translate(-50%, -50%);">
            <div style="position:absolute; width:22px; height:22px; border-radius:50%; background:#3B82F6; opacity:0.4; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:14px; height:14px; border-radius:50%; background:#2563EB; border:2.5px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `;

        userMarkerRef.current = new window.mappls.Marker({
          map: map,
          position: { lat: userLocation.lat, lng: userLocation.lng },
          html: beaconHtml,
          title: 'You are here (GPS)',
        });
      } catch (err) {
        console.warn('Error creating user location marker:', err);
      }
    }
  }, [userLocation, isMapplsLoaded]);

  // Filter vehicles based on active layers
  const visibleVehicles = vehicles.filter((v) => {
    if (v.mode === 'bus' && !showBuses) return false;
    if (v.mode === 'auto' && !showAutos) return false;
    return true;
  });

  // Update Live Vehicles on Mappls Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.mappls) return;

    const markersMap = vehicleMarkersMapRef.current;

    if (!isLiveFleetEnabled || isOffline) {
      markersMap.forEach((marker) => {
        try {
          marker.remove();
        } catch {}
      });
      markersMap.clear();
      return;
    }

    const currentVehicleIds = new Set(visibleVehicles.map((v) => v.id));

    markersMap.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        try {
          marker.remove();
        } catch {}
        markersMap.delete(id);
      }
    });

    visibleVehicles.forEach((v) => {
      const isMetro = v.mode === 'metro';
      const isAuto = v.mode === 'auto';
      const isCab = v.name.toLowerCase().includes('cab');

      let bg = '#10B981';
      let label = '🚍';

      if (isMetro) {
        bg = '#2563EB';
        label = '🚇';
      } else if (isCab) {
        bg = '#F59E0B';
        label = '🚕';
      } else if (isAuto) {
        bg = '#0D9488';
        label = '🛺';
      }

      const vehicleHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${bg};
          border: 2px solid #ffffff;
          box-shadow: 0 3px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          ${label}
        </div>
      `;

      const popupHtml = `
        <div style="padding: 8px; font-family: sans-serif; font-size: 12px; min-width: 170px; color: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 13px;">${label} ${v.lineName}</strong>
            <span style="background: #dcfce7; color: #15803d; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
              ${v.speedKmH} km/h
            </span>
          </div>
          <div style="margin-bottom: 3px;"><strong>Next Stop:</strong> ${v.nextStopName}</div>
          <div style="margin-bottom: 3px;"><strong>ETA:</strong> ~${Math.max(1, Math.round(v.etaSeconds / 60))} mins</div>
          <div style="color: #2563eb; font-weight: 600; text-transform: capitalize;">
            ${v.occupancy} Occupancy ${v.isAc ? '• AC' : ''}
          </div>
        </div>
      `;

      const existingMarker = markersMap.get(v.id);
      if (existingMarker) {
        try {
          if (typeof existingMarker.setPosition === 'function') {
            existingMarker.setPosition({ lat: v.lat, lng: v.lng });
          }
        } catch {}
      } else {
        try {
          const marker = new window.mappls!.Marker({
            map: map,
            position: { lat: v.lat, lng: v.lng },
            html: vehicleHtml,
            popupHtml: popupHtml,
            title: `${v.lineName} (${v.speedKmH} km/h)`,
          });
          markersMap.set(v.id, marker);
        } catch (err) {
          console.warn('Error rendering vehicle marker:', err);
        }
      }
    });
  }, [visibleVehicles, isLiveFleetEnabled, isOffline, isMapplsLoaded]);

  // Zoom In / Zoom Out / Center Map controls
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map && typeof map.getZoom === 'function' && typeof map.setZoom === 'function') {
      try {
        map.setZoom(map.getZoom() + 1);
      } catch {}
    }
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map && typeof map.getZoom === 'function' && typeof map.setZoom === 'function') {
      try {
        map.setZoom(map.getZoom() - 1);
      } catch {}
    }
  };

  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (map && userLocation && userLocation.lat) {
      try {
        if (typeof map.setCenter === 'function') {
          map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
          map.setZoom(15);
        }
        onSelectLocationOnMap(userLocation.lat, userLocation.lng, 'Current Location (GPS)', 'origin');
      } catch {}
    }
  };

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
                Mappls Route
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins via Smart Transit
            </div>
          </div>
        </div>
      )}

      {/* Top Right: Live Clock & Mappls Powered Badge */}
      {!isAnyModalOpen && (
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-4 z-[400] flex flex-col items-end gap-1.5">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 animate-pulse" />
            <span className="font-mono tracking-tight">{currentTimeStr || 'Live Transit'}</span>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <span>⚡ Mappls Vector Maps</span>
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

      {/* Floating Zoom & GPS Locate Controls (Bottom Right) */}
      {!isAnyModalOpen && (
        <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-md"
            title="Locate Me (GPS)"
          >
            <LocateFixed className="w-5 h-5" />
          </button>

          <div className="flex flex-col rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-10 h-10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition active:scale-95"
              title="Zoom In"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-10 h-10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay if Mappls SDK is initializing */}
      {!isMapplsLoaded && !mapInitError && (
        <div className="absolute inset-0 z-[500] bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Loading Mappls Vector Maps...</p>
            <p className="text-xs text-slate-400">Initializing real-time transit & fleet vector engine</p>
          </div>
        </div>
      )}

      {/* Main DOM Container for Mappls Map */}
      <div
        id="mappls-transit-map"
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
};
