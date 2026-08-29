import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, Station, TransitRoute } from '../../types/transit';
import { LiveLocationData } from '../../services/geolocationService';
import { MOCK_AMENITIES } from '../../data/amenities';
import { TranslationDictionary } from '../../types/i18n';
import { Shield, CloudRain, WifiOff, MapPin, Store, LocateFixed, Plus, Navigation } from 'lucide-react';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Neon Bus Icon
const createVehicleIcon = (vehicle: Vehicle) => {
  const isDelayed = vehicle.delaySeconds > 60;
  const isPink = vehicle.routeId === 'PINK-EV';
  const isMetro = vehicle.mode === 'metro';
  const isTrain = vehicle.mode === 'train';
  const emoji = isPink ? '🌸' : isMetro ? '🚇' : isTrain ? '🚆' : '🚍';
  const ringColor = isDelayed ? '#ffb4ab' : isPink ? '#ffb2be' : isMetro ? '#ffc107' : '#fabd00';

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 34px; 
          height: 34px; 
          border-radius: 50%; 
          background: #10141a; 
          border: 2px solid ${ringColor}; 
          box-shadow: 0 0 14px ${ringColor}99;
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
          background: rgba(16, 20, 26, 0.95); 
          color: #ffe4af; 
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; 
          font-weight: 700; 
          padding: 1px 5px; 
          border-radius: 4px; 
          border: 1px solid rgba(250, 189, 0, 0.4); 
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        ">
          ${vehicle.speedKmH} km/h ${isDelayed ? '<span style="color:#ffb4ab">+' + Math.round(vehicle.delaySeconds/60) + 'm</span>' : ''}
        </div>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 22],
  });
};

const createStationIcon = (station: Station, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${isSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #fabd00; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
        <div style="
          width: ${isSelected ? '22px' : '16px'}; 
          height: ${isSelected ? '22px' : '16px'}; 
          border-radius: 50%; 
          background: ${isSelected ? '#fabd00' : '#1c2026'}; 
          border: 2px solid #ffe4af; 
          box-shadow: 0 0 10px rgba(250,189,0,0.6);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createUserPinIcon = (isRealGps: boolean) => {
  const color = isRealGps ? '#85f6e5' : '#fabd00';
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 0 14px ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createCustomPinnedIcon = () => {
  return L.divIcon({
    className: 'custom-pinned-location-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 26px; height: 26px; border-radius: 50%; background: #ffb2be; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px #d70357;">
          📍
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const createAmenityIcon = (category: string) => {
  const iconMap: Record<string, { bg: string; text: string }> = {
    supermarket: { bg: '#ffc107', text: '🛒' },
    store: { bg: '#ffc107', text: '🏪' },
    pharmacy: { bg: '#67d9c9', text: '💊' },
    hospital: { bg: '#ffb4ab', text: '🏥' },
    cafe: { bg: '#ebb2ff', text: '☕' },
    hotel: { bg: '#85f6e5', text: '🏨' },
    police: { bg: '#fabd00', text: '👮' },
    restroom: { bg: '#85f6e5', text: '🚻' },
    ev_charging: { bg: '#89fae9', text: '⚡' },
  };
  const iconInfo = iconMap[category] || { bg: '#64748B', text: '📍' };

  return L.divIcon({
    className: 'custom-amenity-icon',
    html: `
      <div style="
        width: 28px; 
        height: 28px; 
        border-radius: 8px; 
        background: ${iconInfo.bg}; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.6);
        font-size: 14px;
        border: 1.5px solid #ffffff;
      ">
        ${iconInfo.text}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapCenterController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Map Click Handler for Custom Location Pinning
function MapLocationPicker({ onLocationPicked }: { onLocationPicked: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationPicked(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface TransitMapProps {
  vehicles: Vehicle[];
  simTime: string;
  isOffline: boolean;
  cityCenter: [number, number];
  cityZoom: number;
  stations: Station[];
  routes: TransitRoute[];
  userLocation: LiveLocationData;
  isGpsTracking: boolean;
  onSetLocationAsOrigin: (lat: number, lng: number, name: string) => void;
  t: TranslationDictionary;
  onSelectStationForOrigin?: (station: Station) => void;
  onSelectStationForDest?: (station: Station) => void;
  onOpenChaosStudio?: () => void;
  onOpenStores?: () => void;
}

export const TransitMap: React.FC<TransitMapProps> = ({
  vehicles,
  simTime,
  isOffline,
  cityCenter,
  cityZoom,
  stations,
  routes,
  userLocation,
  isGpsTracking,
  onSetLocationAsOrigin,
  t,
  onSelectStationForOrigin,
  onSelectStationForDest,
  onOpenChaosStudio,
  onOpenStores,
}) => {
  const [showVehicles, setShowVehicles] = useState(true);
  const [showSafetyCorridor, setShowSafetyCorridor] = useState(true);
  const [showWeatherZone, setShowWeatherZone] = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [customPinnedLocation, setCustomPinnedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  const nightSafeCorridorCoords: [number, number][] = [
    [20.2668, 85.8436],
    [20.2850, 85.8410],
    [20.3015, 85.8365],
    [20.3039, 85.8188],
    [20.3541, 85.8175],
  ];

  const floodZoneCoords: [number, number][] = [
    [20.3025, 85.8170],
    [20.3055, 85.8170],
    [20.3060, 85.8210],
    [20.3020, 85.8205],
  ];

  const handleMapClick = (lat: number, lng: number) => {
    const locName = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setCustomPinnedLocation({ lat, lng, name: locName });
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-surface-container-lowest circuit-bg">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-secondary-container/90 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg backdrop-blur-md font-label-caps">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode Active: Showing cached road grid & emergency cards. Live vehicle tracking is paused.</span>
        </div>
      )}

      {/* Map Control HUD Top Overlay */}
      <div className={`absolute ${isOffline ? 'top-10' : 'top-3'} left-3 z-[1000] flex flex-wrap items-center gap-2 transition-all`}>
        {/* Real-Time GPS HUD Pill */}
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-primary/20">
          <div className={`w-2.5 h-2.5 rounded-full ${isGpsTracking ? 'bg-tertiary-fixed animate-ping' : 'bg-primary'}`} />
          <span className="text-xs font-label-caps font-bold text-on-surface">
            {isGpsTracking ? 'GPS LIVE (INDIA)' : 'PAN-INDIA MAP'}
          </span>
          {onOpenChaosStudio && (
            <button
              onClick={onOpenChaosStudio}
              className="ml-1 text-[10px] bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-2 py-0.5 rounded-lg transition font-bold font-label-caps"
            >
              <span>⚡ Simulator</span>
            </button>
          )}
        </div>

        {/* 1-Tap Quick Action: Use My Live GPS */}
        <button
          onClick={() => onSetLocationAsOrigin(userLocation.lat, userLocation.lng, 'My Live GPS Location (India)')}
          className="px-2.5 py-1.5 rounded-xl bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container transition font-bold font-label-caps text-xs flex items-center gap-1.5 shadow-md"
          title="Set current GPS coordinates as trip origin"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>Use My Live Location</span>
        </button>

        {/* Layer Filters */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-lg text-xs border border-primary/20">
          {!isOffline && (
            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`px-2.5 py-1 rounded-lg transition font-bold font-label-caps flex items-center gap-1 ${
                showVehicles ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Fleet ({vehicles.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowSafetyCorridor(!showSafetyCorridor)}
            className={`px-2.5 py-1 rounded-lg transition font-bold font-label-caps flex items-center gap-1 ${
              showSafetyCorridor ? 'bg-tertiary-container text-on-tertiary-container shadow-sm' : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Night-Safe</span>
          </button>

          {!isOffline && (
            <button
              onClick={() => setShowWeatherZone(!showWeatherZone)}
              className={`px-2.5 py-1 rounded-lg transition font-bold font-label-caps flex items-center gap-1 ${
                showWeatherZone ? 'bg-amber-500/30 text-primary border border-primary/40' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flood Alert</span>
            </button>
          )}

          <button
            onClick={onOpenStores || (() => setShowAmenities(!showAmenities))}
            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright text-tertiary-fixed border border-tertiary-fixed/30 transition font-bold font-label-caps flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Nearby POIs</span>
          </button>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={cityCenter}
        zoom={cityZoom}
        className="w-full h-full dark-tiles"
        zoomControl={false}
        attributionControl={false}
      >
        <MapCenterController center={cityCenter} zoom={cityZoom} />
        <MapLocationPicker onLocationPicked={handleMapClick} />

        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Real-Time User GPS Live Pin & Accuracy Circle */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserPinIcon(isGpsTracking)}>
          <Popup>
            <div className="p-1 min-w-[190px] text-slate-900">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                <span>📍 Your Real-Time Location (India)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-mono">
                Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                Accuracy: ±{userLocation.accuracy} meters • {isGpsTracking ? 'Live GPS Active' : 'Cached Position'}
              </p>
              <button
                onClick={() => onSetLocationAsOrigin(userLocation.lat, userLocation.lng, 'My Live Location')}
                className="mt-2 w-full py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
              >
                Set as Journey Origin
              </button>
            </div>
          </Popup>
        </Marker>

        {isGpsTracking && userLocation.accuracy && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={Math.max(50, userLocation.accuracy)}
            pathOptions={{
              color: '#85f6e5',
              fillColor: '#85f6e5',
              fillOpacity: 0.15,
              weight: 1,
            }}
          />
        )}

        {/* Custom Pinned Location (If user clicked on map) */}
        {customPinnedLocation && (
          <Marker position={[customPinnedLocation.lat, customPinnedLocation.lng]} icon={createCustomPinnedIcon()}>
            <Popup>
              <div className="p-1 min-w-[180px] text-slate-900">
                <div className="font-bold text-xs text-slate-900">📍 Custom Selected Stop (India)</div>
                <p className="text-[10px] text-slate-600 font-mono mt-1">
                  {customPinnedLocation.lat.toFixed(5)}, {customPinnedLocation.lng.toFixed(5)}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => {
                      onSetLocationAsOrigin(customPinnedLocation.lat, customPinnedLocation.lng, customPinnedLocation.name);
                      setCustomPinnedLocation(null);
                    }}
                    className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px]"
                  >
                    Set Origin
                  </button>
                  <button
                    onClick={() => setCustomPinnedLocation(null)}
                    className="py-1 px-2 rounded bg-slate-200 text-slate-700 text-[10px]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Weather Flood Zone */}
        {!isOffline && showWeatherZone && (
          <Polygon
            positions={floodZoneCoords}
            pathOptions={{
              color: '#fabd00',
              fillColor: '#fabd00',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '5, 5',
            }}
          >
            <Popup>
              <div className="p-1 text-xs text-slate-900">
                <div className="font-bold text-amber-700 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5" /> Monsoon Waterlog Warning
                </div>
                <p className="mt-1">Underpass moderate flooding. Multi-modal routes diverted over elevated flyovers.</p>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Night-Safe Protected Corridor */}
        {showSafetyCorridor && (
          <Polyline
            positions={nightSafeCorridorCoords}
            pathOptions={{
              color: '#85f6e5',
              weight: 8,
              opacity: 0.35,
              lineCap: 'round',
            }}
          />
        )}

        {/* Transit Routes */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{
              color: route.color === '#06B6D4' ? '#fabd00' : route.color,
              weight: 4,
              opacity: isOffline ? 0.35 : 0.85,
            }}
          />
        ))}

        {/* Station Markers */}
        {stations.map((st) => (
          <Marker
            key={st.id}
            position={[st.lat, st.lng]}
            icon={createStationIcon(st, selectedStation?.id === st.id)}
            eventHandlers={{
              click: () => setSelectedStation(st),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[220px] text-slate-900">
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>{st.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold uppercase">
                    {st.mode}
                  </span>
                </div>
                {st.localNames && Object.values(st.localNames)[0] && (
                  <p className="text-xs text-slate-600 font-semibold">{Object.values(st.localNames)[0]}</p>
                )}

                <div className="flex flex-wrap gap-1 mt-1.5 text-[10px]">
                  {st.isElevatorAccessible && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      🦽 Accessible
                    </span>
                  )}
                  {st.hasCCTV && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">
                      🛡️ CCTV 24x7
                    </span>
                  )}
                </div>

                {!isOffline && (
                  <div className="mt-2.5 border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Live Multi-Modal Departures</span>
                      <span className="text-[10px] text-emerald-600 font-mono">● Real-Time</span>
                    </div>
                    <div className="space-y-1">
                      {st.departures.map((dep, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-1 rounded">
                          <div>
                            <span className="font-semibold text-slate-800">{dep.lineName}</span>
                            <div className="text-[10px] text-slate-500">{dep.destination} ({dep.platform})</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-amber-700 font-mono">{dep.etaMinutes}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-200">
                  {onSelectStationForOrigin && (
                    <button
                      onClick={() => onSelectStationForOrigin(st)}
                      className="flex-1 py-1 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] text-center"
                    >
                      Set Origin
                    </button>
                  )}
                  {onSelectStationForDest && (
                    <button
                      onClick={() => onSelectStationForDest(st)}
                      className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] text-center"
                    >
                      Set Dest
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Moving Fleet Vehicles */}
        {!isOffline &&
          showVehicles &&
          vehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v)}
            >
              <Popup>
                <div className="p-1 min-w-[190px] text-slate-900">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                    <span>{v.name}</span>
                    <span className="text-[10px] px-1 rounded bg-amber-100 text-amber-900 font-mono">
                      {v.speedKmH} km/h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">{v.lineName}</div>

                  <div className="mt-2 bg-slate-100 p-1.5 rounded text-xs">
                    <div className="text-[10px] text-slate-500">Approaching:</div>
                    <div className="font-semibold text-slate-800">{v.nextStopName}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-slate-600">ETA: <strong>{Math.round(v.etaSeconds / 60)} mins</strong></span>
                      <span className="text-slate-600">Crowd: <strong>{v.occupancy}</strong></span>
                    </div>
                  </div>

                  {v.delaySeconds > 0 && (
                    <div className="mt-1.5 text-[10px] bg-rose-50 text-rose-700 p-1 rounded font-medium">
                      ⚠️ Delayed by {Math.round(v.delaySeconds / 60)} mins
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Google Maps POIs */}
        {showAmenities &&
          MOCK_AMENITIES.map((am) => (
            <Marker
              key={am.id}
              position={[am.lat, am.lng]}
              icon={createAmenityIcon(am.category)}
            >
              <Popup>
                <div className="p-1 min-w-[190px] text-slate-900">
                  <div className="font-bold text-xs text-slate-900">{am.name}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{am.address}</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-semibold">
                    <span className="text-emerald-700">{am.isOpenNow ? '● Open Now' : 'Closed'}</span>
                    <span className="text-amber-800 font-mono">📍 {am.distanceMeters}m away</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Floating Selected Station HUD */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300 border border-primary/40 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-xl text-primary font-bold">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-on-surface">{selectedStation.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-label-caps uppercase">
                  {selectedStation.mode} Hub
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {selectedStation.lines.join(' | ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onSelectStationForOrigin && (
              <button
                onClick={() => {
                  onSelectStationForOrigin(selectedStation);
                  setSelectedStation(null);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-bold font-label-caps shadow transition"
              >
                Set Origin
              </button>
            )}
            {onSelectStationForDest && (
              <button
                onClick={() => {
                  onSelectStationForDest(selectedStation);
                  setSelectedStation(null);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-surface-bright hover:bg-surface-variant text-tertiary border border-tertiary/30 text-xs font-bold font-label-caps shadow transition"
              >
                Set Dest
              </button>
            )}
            <button
              onClick={() => setSelectedStation(null)}
              className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
