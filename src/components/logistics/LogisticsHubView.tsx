import React, { useState, useMemo } from 'react';
import {
  Package,
  Truck,
  Zap,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Sparkles,
  Layers,
  Send,
  AlertTriangle,
  Camera,
  Coffee,
  Bed,
  Check,
  X,
  PhoneCall,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Coins,
  Leaf,
  Sliders,
  Compass,
  Anchor,
  Activity,
  ArrowLeft,
  MoreVertical,
  Info,
  Maximize2,
  Minimize2,
  Search,
  Bell,
  RotateCcw,
  Scale,
  Boxes,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  SAMPLE_DELIVERY_STOPS,
  RESTRICTED_NO_FLY_ZONES,
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute,
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';
import { PaymentVerificationResult } from '../../services/paymentService';
import { isValidLatLng, sanitizeLatLng, filterValidLatLngs } from '../../utils/latLngValidator';

// Verified Driver Rest & Stay Hubs near Delivery Corridors
const DRIVER_STAY_HUBS = [
  {
    id: 'stay-1',
    name: 'CRUT Baramunda Driver Dormitory & Rest Lounge',
    distance: '0.4 km from Baramunda Hub',
    amenities: ['🛏️ Resting Beds', '🚿 Clean Showers', '☕ ₹30 Thali', '⚡ 60kW EV Fast Charger', '🅿️ Night Parking'],
    safetyRating: '4.9 ★',
    phone: '+91 674 235 4890',
  },
  {
    id: 'stay-2',
    name: 'Patia Logistics Rest Pods & Highway Dhaba',
    distance: '1.2 km from Patia / Infocity',
    amenities: ['🛏️ AC Sleep Pods', '☕ 24/7 Hot Chai & Food', '🚿 Sanitized Washroom', '⚡ Battery Swap Station'],
    safetyRating: '4.8 ★',
    phone: '+91 94370 88219',
  },
  {
    id: 'stay-3',
    name: 'Vani Vihar Transit Shelter & Refreshment Center',
    distance: '0.8 km from Janpath',
    amenities: ['🚿 Clean Restrooms', '🚰 RO Water Refill', '☕ Beverages & Snacks', '📶 Free Wi-Fi'],
    safetyRating: '4.7 ★',
    phone: '+91 674 254 1120',
  },
];

// Live Corridor Traffic Flow
const LIVE_CORRIDOR_TRAFFIC = [
  {
    corridor: 'Janpath Arterial (Master Canteen ➔ Vani Vihar)',
    status: '🟢 Smooth Flow',
    speed: '28 km/h',
    delay: '0 mins delay',
    color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
  },
  {
    corridor: 'Nandankanan Rd (Jayadev Vihar ➔ Patia KIIT)',
    status: '🟡 Moderate Flow',
    speed: '19 km/h',
    delay: '+6 mins (Damana Square signal)',
    color: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
  },
  {
    corridor: 'Rasulgarh Flyover / NH-16 Junction',
    status: '🔴 Heavy Congestion',
    speed: '8 km/h',
    delay: '+14 mins (Take service road bypass)',
    color: 'border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400',
  },
  {
    corridor: 'Cuttack-Puri Bypass Expressway',
    status: '🟢 Fast Flow',
    speed: '44 km/h',
    delay: '0 mins delay',
    color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
  },
];

const STOP_PIN_COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#EAB308'];

const createNumberedPinIcon = (num: number, label?: string, color?: string) => {
  const pinColor = color || STOP_PIN_COLORS[(num - 1) % STOP_PIN_COLORS.length];
  return L.divIcon({
    className: 'logistics-numbered-pin',
    html: `
      <div style="display: flex; align-items: center; gap: 6px; transform: translate(-14px, -14px);">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${pinColor};
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          flex-shrink: 0;
        ">
          ${num}
        </div>
        ${
          label
            ? `
          <div style="
            background: rgba(12, 20, 37, 0.92);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.25);
            backdrop-filter: blur(4px);
            font-weight: 700;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 8px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          ">
            ${label}
          </div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createLogisticsWarehouseIcon = () => {
  return L.divIcon({
    className: 'logistics-hub-pin',
    html: `
      <div style="display: flex; align-items: center; gap: 6px; transform: translate(-17px, -17px);">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #F59E0B;
          color: #000000;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.7);
          flex-shrink: 0;
        ">
          🏠
        </div>
        <div style="
          background: rgba(12, 20, 37, 0.92);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.5);
          font-weight: 800;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        ">
          Warehouse
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const MapBoundsUpdater: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  React.useEffect(() => {
    const validCoords = (coords || []).filter(isValidLatLng);
    if (validCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14, animate: true });
      } catch (err) {
        console.warn('MapBoundsUpdater fitBounds error:', err);
      }
    }
  }, [coords, map]);
  return null;
};

export function resolveLogisticsCoordinates(inputAddress: string): { lat: number; lng: number; formatted: string } {
  const clean = (inputAddress || '').toLowerCase().trim();

  // 1. Trident Academy of Technology
  if (clean.includes('trident') || clean.includes('tat')) {
    return {
      lat: 20.3542,
      lng: 85.8078,
      formatted: 'Trident Academy of Technology, Chandaka Industrial Estate, Patia, Bhubaneswar',
    };
  }

  // 2. Exact match for Mani Tribhuban / Mani Tribhuvan
  const normalized = clean.replace(/[\s\-_]+/g, '');
  if (
    clean.includes('mani') ||
    clean.includes('tribhuban') ||
    clean.includes('tribhuvan') ||
    clean.includes('trubhuban') ||
    clean.includes('manitri') ||
    normalized.includes('manitribhuban') ||
    normalized.includes('manitribhuvan') ||
    normalized.includes('manitrubhuban')
  ) {
    return {
      lat: 20.3688,
      lng: 85.8242,
      formatted: 'Mani Tribhuban, Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (751024)',
    };
  }

  // 3. Search POPULAR_INDIAN_LOCATIONS
  const popMatch = POPULAR_INDIAN_LOCATIONS.find(
    (loc) =>
      clean.includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(clean) ||
      loc.formattedAddress.toLowerCase().includes(clean)
  );
  if (popMatch && popMatch.lat && popMatch.lng) {
    return { lat: popMatch.lat, lng: popMatch.lng, formatted: popMatch.formattedAddress || popMatch.name };
  }

  // 4. Search BHUBANESWAR_LOCALITIES
  const locMatch = BHUBANESWAR_LOCALITIES.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean)
  );
  if (locMatch) {
    return { lat: locMatch.lat, lng: locMatch.lng, formatted: `${locMatch.name}, Bhubaneswar` };
  }

  // 5. Search STOP_COORDINATES_MAP
  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: coords[0], lng: coords[1], formatted: `${key.toUpperCase()}, Bhubaneswar` };
    }
  }

  // 6. Common Bhubaneswar Landmark matches
  if (clean.includes('kiit')) return { lat: 20.3541, lng: 85.8175, formatted: 'KIIT Square, Patia, Bhubaneswar' };
  if (clean.includes('unit 2') || clean.includes('unit-2')) return { lat: 20.2721, lng: 85.8341, formatted: 'Unit 2, Market Building, Bhubaneswar' };
  if (clean.includes('lingaraj')) return { lat: 20.2382, lng: 85.8338, formatted: 'Lingaraj Temple, Old Town, Bhubaneswar' };
  if (clean.includes('vani vihar')) return { lat: 20.3015, lng: 85.8458, formatted: 'Vani Vihar Square, Bhubaneswar' };
  if (clean.includes('rasulgarh')) return { lat: 20.2974, lng: 85.8647, formatted: 'Rasulgarh Square, NH-16, Bhubaneswar' };
  if (clean.includes('master canteen')) return { lat: 20.2667, lng: 85.8436, formatted: 'Master Canteen Square, Railway Station' };
  if (clean.includes('baramunda')) return { lat: 20.2818, lng: 85.7938, formatted: 'Baramunda ISBT Hub, Bhubaneswar' };

  // 7. Default fallback with deterministic offset
  const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) / 100 - 0.5) * 0.05;
  const lngOffset = (((hash >> 2) % 100) / 100 - 0.5) * 0.05;
  return { lat: 20.315 + latOffset, lng: 85.82 + lngOffset, formatted: inputAddress };
}

interface LogisticsHubProps {
  onNavigateToMap?: () => void;
  waypoints?: DeliveryWaypoint[];
  onWaypointsChange?: (waypoints: DeliveryWaypoint[]) => void;
}

export const LogisticsHubView: React.FC<LogisticsHubProps> = ({
  onNavigateToMap,
  waypoints: externalWaypoints,
  onWaypointsChange,
}) => {
  const originHub = { name: 'Warehouse', lat: 20.2818, lng: 85.7938 };

  // Initialize with empty delivery queue; stops are populated on user input
  const [internalWaypoints, setInternalWaypoints] = useState<DeliveryWaypoint[]>([]);

  const waypoints = externalWaypoints ?? internalWaypoints;
  const setWaypoints = (newWps: DeliveryWaypoint[] | ((prev: DeliveryWaypoint[]) => DeliveryWaypoint[])) => {
    const updated = typeof newWps === 'function' ? newWps(waypoints) : newWps;
    setInternalWaypoints(updated);
    onWaypointsChange?.(updated);
  };

  // Planner Tab: 'New Plan' | 'Live Tracking' | 'History'
  const [plannerTab, setPlannerTab] = useState<'new_plan' | 'live_tracking' | 'history'>('new_plan');

  // Form & Search Inputs
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Custom parcel type specification
  const [parcelType, setParcelType] = useState<'Documents' | 'Electronics' | 'Clothing' | 'Food' | 'Other'>('Documents');
  const [customParcelType, setCustomParcelType] = useState('');
  const [parcelWeight, setParcelWeight] = useState('4.5');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Map Overlay Pill: 'optimized' | 'all'
  const [activeMapPill, setActiveMapPill] = useState<'optimized' | 'all'>('optimized');

  // Payment & Modal States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeDriverTab, setActiveDriverTab] = useState<'traffic' | 'stay'>('traffic');

  // Compute Anti-Gravity / Multi-Objective Route Plan
  const plan: AntiGravityRoutePlan = useMemo(() => {
    return computeAntiGravityRoute(originHub, waypoints, 45, 'anti_gravity_evtol');
  }, [waypoints]);

  // Derived Totals
  const totalParcelsCount = waypoints.length > 0 ? waypoints.reduce((acc, w) => acc + Math.round(w.packageWeightKg || 3), 0) : 0;
  const totalWeightKg = waypoints.length > 0 ? waypoints.reduce((acc, w) => acc + (w.packageWeightKg || 5), 0) : 0;
  const totalVolumeM3 = (totalWeightKg * 0.0051).toFixed(1);

  // Split waypoints among 3 Vans
  const van1Stops = waypoints.slice(0, Math.ceil(waypoints.length / 3));
  const van2Stops = waypoints.slice(Math.ceil(waypoints.length / 3), Math.ceil((waypoints.length * 2) / 3));
  const van3Stops = waypoints.slice(Math.ceil((waypoints.length * 2) / 3));

  const van1Parcels = van1Stops.reduce((sum, s) => sum + Math.round(s.packageWeightKg || 3), 0) || (waypoints.length > 0 ? 8 : 0);
  const van2Parcels = van2Stops.reduce((sum, s) => sum + Math.round(s.packageWeightKg || 3), 0) || (waypoints.length > 0 ? 6 : 0);
  const van3Parcels = van3Stops.reduce((sum, s) => sum + Math.round(s.packageWeightKg || 3), 0) || (waypoints.length > 0 ? 4 : 0);

  // Handle Add Stop from input
  const handleAddStop = (addressToAdd?: string) => {
    const rawAddress = addressToAdd || searchAddress;
    if (!rawAddress.trim()) return;

    const resolved = resolveLogisticsCoordinates(rawAddress);
    const effectiveType = parcelType === 'Other' && customParcelType.trim() ? customParcelType.trim() : parcelType;

    const newStop: DeliveryWaypoint = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientName: rawAddress.split(',')[0].trim(),
      phone: '+91 94370 00000',
      address: resolved.formatted,
      lat: resolved.lat,
      lng: resolved.lng,
      altitudeMeters: 45,
      packageWeightKg: parseFloat(parcelWeight) || 3.5,
      parcelType: effectiveType as any,
      priority: 'Standard',
      status: 'pending',
      ecoPackaging: true,
      dockingStatus: 'ALIGNED_LOCKED',
      dockingToleranceCm: 7.5,
    };

    setWaypoints([...waypoints, newStop]);
    setSearchAddress('');
    setIsSearchFocused(false);
    setToastMessage(`✅ Stop "${newStop.recipientName}" added! Route optimized.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  const handleLoadSampleStops = () => {
    setWaypoints(SAMPLE_DELIVERY_STOPS);
    setToastMessage('✅ Loaded sample Bhubaneswar delivery routes!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearAllStops = () => {
    setWaypoints([]);
    setToastMessage('🗑️ Cleared all delivery stops.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOptimizeRoutes = () => {
    if (waypoints.length === 0) {
      setToastMessage('ℹ️ Add at least 1 delivery stop to calculate optimal routes.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setToastMessage('✨ Routes re-optimized across 3 delivery vans with zero carbon waste!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Autocomplete Suggestions
  const SUGGESTIONS = [
    { name: 'Trident Academy of Technology', address: 'Chandaka Industrial Estate, Patia, Bhubaneswar' },
    { name: 'KIIT Square', address: 'KIIT Road, Patia, Bhubaneswar' },
    { name: 'Unit 2', address: 'Market Building, Ashok Nagar, Bhubaneswar' },
    { name: 'Lingaraj Temple', address: 'Old Town, Bhubaneswar' },
    { name: 'Vani Vihar', address: 'Utkal University, Janpath, Bhubaneswar' },
    { name: 'Rasulgarh', address: 'NH-16 Junction, Bhubaneswar' },
    { name: 'Mani Tribhuban', address: 'Nandankanan Road, Patia, Bhubaneswar' },
    { name: 'Master Canteen', address: 'Railway Station Square, Bhubaneswar' },
  ];

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) => !searchAddress.trim() || s.name.toLowerCase().includes(searchAddress.toLowerCase()) || s.address.toLowerCase().includes(searchAddress.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B14] text-slate-100 overflow-y-auto pb-20 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[99999] p-3.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 fill-slate-950" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-amber-600 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Status Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 sm:px-6 py-3.5 bg-[#090E1B] shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-wider text-white">MUSAFIR</span>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 sm:mx-2 hidden sm:block" />

          <div>
            <h1 className="text-xs sm:text-sm font-black text-white leading-none">Smart Logistics Optimizer</h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Smarter routes. Greener cities. Happier deliveries.</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          <div className="flex items-center gap-2 bg-[#10182E] border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:border-slate-700">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">Logistics Partner</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* =========================================================================
              COLUMN 1: LOGISTICS PLANNER (col-span-12 lg:col-span-3)
             ========================================================================= */}
          <div className="lg:col-span-3 bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Planner Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Logistics Planner</h2>
                <p className="text-[11px] text-slate-400">Plan, optimize and track your deliveries</p>
              </div>
            </div>

            {/* Sub-Tabs: New Plan | Live Tracking | History */}
            <div className="flex bg-[#070D1A] p-1 rounded-xl border border-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPlannerTab('new_plan')}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  plannerTab === 'new_plan'
                    ? 'bg-[#EAB308] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New Plan
              </button>
              <button
                type="button"
                onClick={() => setPlannerTab('live_tracking')}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  plannerTab === 'live_tracking'
                    ? 'bg-[#EAB308] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Tracking
              </button>
              <button
                type="button"
                onClick={() => setPlannerTab('history')}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  plannerTab === 'history'
                    ? 'bg-[#EAB308] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                History
              </button>
            </div>

            {/* Delivery Details 3-Metric Boxes */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Delivery Details</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Total Parcels */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Package className="w-3 h-3 text-amber-400" />
                    <span>Total Parcels</span>
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    {totalParcelsCount > 0 ? totalParcelsCount : '0'}
                  </div>
                </div>

                {/* Total Weight */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Scale className="w-3 h-3 text-blue-400" />
                    <span>Total Weight</span>
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    {totalWeightKg > 0 ? `${totalWeightKg.toFixed(0)} kg` : '0 kg'}
                  </div>
                </div>

                {/* Total Volume */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Boxes className="w-3 h-3 text-emerald-400" />
                    <span>Total Volume</span>
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    {totalWeightKg > 0 ? `${totalVolumeM3} m³` : '0 m³'}
                  </div>
                </div>
              </div>
            </div>

            {/* Parcel Category Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Parcel Type</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['Documents', 'Electronics', 'Clothing', 'Food', 'Other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setParcelType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      parcelType === type
                        ? 'bg-[#EAB308] text-slate-950 shadow-md font-black'
                        : 'bg-[#10182E] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Custom parcel description input */}
              {parcelType === 'Other' && (
                <div className="pt-1.5 animate-in fade-in">
                  <input
                    type="text"
                    value={customParcelType}
                    onChange={(e) => setCustomParcelType(e.target.value)}
                    placeholder="Enter custom parcel type (e.g. Medical, Glass, Gifts...)"
                    className="w-full bg-[#10182E] border border-amber-500/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Delivery Locations Search & Stop List */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Delivery Locations</h3>
                {waypoints.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllStops}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search or Add Address Input */}
              <div className="relative">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchAddress}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setSearchAddress(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStop();
                      }
                    }}
                    placeholder="Search or add address"
                    className="w-full bg-[#10182E] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition placeholder:text-slate-500"
                  />
                  {searchAddress ? (
                    <button
                      type="button"
                      onClick={() => setSearchAddress('')}
                      className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddStop()}
                      className="absolute right-2 text-amber-400 hover:text-amber-300 p-0.5"
                      title="Add Stop"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && (
                  <div className="absolute left-0 right-0 top-[38px] z-50 bg-[#0B1220] border border-slate-700/90 rounded-2xl shadow-2xl p-2 space-y-1 max-h-56 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Popular Locations
                    </div>
                    {filteredSuggestions.slice(0, 5).map((item) => (
                      <div
                        key={item.name}
                        onMouseDown={() => handleAddStop(`${item.name}, ${item.address}`)}
                        className="p-2 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 cursor-pointer transition flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.address}</div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stop Sequence List */}
              <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                {/* Origin: Warehouse (Start) */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-black text-xs text-amber-400">
                      W
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Warehouse (Start)</div>
                      <div className="text-[10px] text-slate-400">Bhubaneswar</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    Base
                  </span>
                </div>

                {/* Active Waypoints Queue */}
                {waypoints.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#10182E]/50 border border-dashed border-slate-800 text-center space-y-2">
                    <Package className="w-6 h-6 text-slate-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No delivery stops added yet</p>
                    <p className="text-[11px] text-slate-500">
                      Type any address above to add your first delivery location.
                    </p>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1 justify-center pt-1">
                      {['Trident Academy', 'KIIT Square', 'Unit 2', 'Rasulgarh'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleAddStop(loc)}
                          className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer font-semibold"
                        >
                          + {loc}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLoadSampleStops}
                        className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                      >
                        Load Sample Bhubaneswar Stops
                      </button>
                    </div>
                  </div>
                ) : (
                  waypoints.map((wp, idx) => {
                    const pinColor = STOP_PIN_COLORS[idx % STOP_PIN_COLORS.length];
                    const distKm = (2.5 + idx * 2.1).toFixed(1);
                    const parcels = Math.round(wp.packageWeightKg || 3);

                    return (
                      <div
                        key={wp.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800/80 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: pinColor }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              Stop {idx + 1} - {wp.recipientName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {distKm} km • {parcels} {parcels === 1 ? 'parcel' : 'parcels'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStop(wp.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Optimize Multi-Stop Corridor */}
              <button
                type="button"
                onClick={handleOptimizeRoutes}
                className="w-full py-3 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 mt-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Optimize Routes</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              COLUMN 2: INTERACTIVE ROUTE MAP (col-span-12 lg:col-span-6)
             ========================================================================= */}
          <div className="lg:col-span-6 bg-[#0B1222] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl relative h-[480px] sm:h-[540px] flex flex-col">
            {/* Top Floating Filter Pills: [✨ Optimized Routes] [All Locations] */}
            <div className="absolute top-3.5 left-3.5 z-[1000] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMapPill('optimized')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                  activeMapPill === 'optimized'
                    ? 'bg-[#121A2B]/95 text-amber-400 border border-amber-500/60 shadow-amber-500/20'
                    : 'bg-[#121A2B]/80 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>Optimized Routes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMapPill('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                  activeMapPill === 'all'
                    ? 'bg-[#121A2B]/95 text-amber-400 border border-amber-500/60 shadow-amber-500/20'
                    : 'bg-[#121A2B]/80 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>All Locations</span>
              </button>
            </div>

            {/* Map Container */}
            <div className="w-full h-full relative z-0">
              <MapContainer
                center={[20.2961, 85.8245]}
                zoom={12}
                className="w-full h-full z-0"
                zoomControl={false}
              >
                <MapBoundsUpdater
                  coords={[
                    [originHub.lat, originHub.lng],
                    ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
                  ]}
                />

                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
                  attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                  maxZoom={19}
                />

                {/* Warehouse Origin Pin */}
                <Marker position={[originHub.lat, originHub.lng]} icon={createLogisticsWarehouseIcon()}>
                  <Popup>
                    <div className="text-xs font-bold text-slate-900 p-1">
                      <span className="text-amber-600 font-extrabold block">🏠 Dispatch Warehouse</span>
                      <span>Baramunda Hub, Bhubaneswar</span>
                    </div>
                  </Popup>
                </Marker>

                {/* Van 1 Polyline Route (Blue) */}
                {van1Stops.length > 0 && (
                  <Polyline
                    positions={filterValidLatLngs([
                      [originHub.lat, originHub.lng],
                      ...van1Stops.map((w) => [w.lat, w.lng] as [number, number]),
                    ])}
                    pathOptions={{ color: '#3B82F6', weight: 4.5, opacity: 0.95 }}
                  />
                )}

                {/* Van 2 Polyline Route (Green) */}
                {van2Stops.length > 0 && (
                  <Polyline
                    positions={filterValidLatLngs([
                      [originHub.lat, originHub.lng],
                      ...van2Stops.map((w) => [w.lat, w.lng] as [number, number]),
                    ])}
                    pathOptions={{ color: '#10B981', weight: 4.5, opacity: 0.95 }}
                  />
                )}

                {/* Van 3 Polyline Route (Orange) */}
                {van3Stops.length > 0 && (
                  <Polyline
                    positions={filterValidLatLngs([
                      [originHub.lat, originHub.lng],
                      ...van3Stops.map((w) => [w.lat, w.lng] as [number, number]),
                    ])}
                    pathOptions={{ color: '#F97316', weight: 4.5, opacity: 0.95 }}
                  />
                )}

                {/* Waypoint Numbered Markers */}
                {waypoints.filter((wp) => isValidLatLng([wp.lat, wp.lng])).map((wp, idx) => {
                  return (
                    <Marker
                      key={wp.id}
                      position={[wp.lat, wp.lng]}
                      icon={createNumberedPinIcon(idx + 1, wp.recipientName)}
                    >
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <div className="font-black text-slate-950">Stop {idx + 1}: {wp.recipientName}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{wp.address}</div>
                          <div className="text-[10px] text-emerald-600 font-mono mt-1 font-extrabold">
                            GPS: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Vehicle Fleet Allocation Overview */}
            <div className="absolute left-3.5 bottom-3.5 z-[1000] bg-[#0C1425]/92 border border-slate-800/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl space-y-2 min-w-[170px]">
              <h4 className="font-extrabold text-slate-400 text-[11px] uppercase tracking-wider">Vehicles</h4>
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex items-center gap-2 text-white">
                  <span className="w-3 h-1 bg-blue-500 rounded-full inline-block" />
                  <span>Van 1</span>
                  <span className="text-slate-400 text-[11px] font-normal">({van1Parcels} parcels)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
                  <span>Van 2</span>
                  <span className="text-slate-400 text-[11px] font-normal">({van2Parcels} parcels)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-3 h-1 bg-amber-500 rounded-full inline-block" />
                  <span>Van 3</span>
                  <span className="text-slate-400 text-[11px] font-normal">({van3Parcels} parcels)</span>
                </div>
              </div>
            </div>

            {/* Bottom-Right Floating Compass & Zoom Controls */}
            <div className="absolute right-3.5 bottom-3.5 z-[1000] flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="w-8 h-8 rounded-xl bg-[#0C1425]/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
                title="Fullscreen Map"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              COLUMN 3: OPTIMIZED ROUTE SUMMARY & TRACKING (col-span-12 lg:col-span-3)
             ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Route Metrics & Optimization Summary */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-black">Optimized Route Summary</h3>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Total Distance */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Total Distance</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-black text-white">
                      {waypoints.length > 0 ? `${(18 + waypoints.length * 2.1).toFixed(1)} km` : '28.4 km'}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>32%</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Estimated Time</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-black text-white">
                      {waypoints.length > 0 ? `${Math.floor(plan.totalDurationMinutes / 60)}h ${plan.totalDurationMinutes % 60}m` : '1h 45m'}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>40%</span>
                    </div>
                  </div>
                </div>

                {/* Fuel Consumption */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-slate-400" />
                    <span>Fuel Consumption</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-black text-white">
                      {waypoints.length > 0 ? `${((plan.totalDistanceKm || 28.4) * 0.28).toFixed(1)} L` : '8.2 L'}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>35%</span>
                    </div>
                  </div>
                </div>

                {/* CO2 Emission */}
                <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span>CO₂ Emission</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-black text-white">
                      {waypoints.length > 0 ? `${(plan.co2SavedKg * 1.8).toFixed(1)} kg` : '19.6 kg'}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>36%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Vehicle Dispatch Assignment */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Vehicle Assignment</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(true)}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2">
                {/* Van 1 */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Van 1</div>
                      <div className="text-[10px] text-slate-400">{van1Parcels} parcels | 92 kg</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] font-bold text-slate-200 transition cursor-pointer"
                  >
                    View Route
                  </button>
                </div>

                {/* Van 2 */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Van 2</div>
                      <div className="text-[10px] text-slate-400">{van2Parcels} parcels | 78 kg</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] font-bold text-slate-200 transition cursor-pointer"
                  >
                    View Route
                  </button>
                </div>

                {/* Van 3 */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Van 3</div>
                      <div className="text-[10px] text-slate-400">{van3Parcels} parcels | 66 kg</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] font-bold text-slate-200 transition cursor-pointer"
                  >
                    View Route
                  </button>
                </div>
              </div>
            </div>

            {/* Real-Time Corridor Tracking */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Real-Time Tracking</h3>
                </div>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Van 1 */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-white">Van 1</span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      On Time
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">12 min</span>
                </div>

                {/* Van 2 */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-white">Van 2</span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      On Time
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">18 min</span>
                </div>

                {/* Van 3 */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-white">Van 3</span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      On Time
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">24 min</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ─── 3. BOTTOM SECTION: KEY FEATURES IN LOGISTICS (Matching media_1788877567294.jpg) ─── */}
        <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-black">Key Features in Logistics</h3>
          </div>

          {/* 8 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              {
                title: 'Smart Delivery Routing',
                desc: 'Shortest + fastest routes for multiple deliveries.',
                icon: MapPin,
                color: 'text-amber-400',
              },
              {
                title: 'Vehicle Capacity Matching',
                desc: 'Assigns the right vehicle based on parcel size/weight.',
                icon: Truck,
                color: 'text-amber-400',
              },
              {
                title: 'Multi-Stop Optimization',
                desc: 'Arranges delivery points in the best order.',
                icon: Package,
                color: 'text-amber-400',
              },
              {
                title: 'Parcel Pooling & Consolidation',
                desc: 'Combines nearby parcels to reduce trips & fuel.',
                icon: Boxes,
                color: 'text-amber-400',
              },
              {
                title: 'Real-Time Re-Routing',
                desc: 'Adjusts to traffic, accidents, roadblocks or weather.',
                icon: RotateCcw,
                color: 'text-amber-400',
              },
              {
                title: 'Eco Route',
                desc: 'Suggests low fuel / low CO₂ routes.',
                icon: Leaf,
                color: 'text-emerald-400',
              },
              {
                title: 'Return Trip Optimization',
                desc: 'Assigns nearby pickups for backhaul.',
                icon: RotateCcw,
                color: 'text-amber-400',
              },
              {
                title: 'Load Balancing',
                desc: 'Distributes parcels across available vehicles.',
                icon: Scale,
                color: 'text-amber-400',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#10182E] border border-slate-800/80 hover:border-slate-700 transition flex flex-col items-center text-center justify-between min-h-[140px]"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
                    <Icon className={`w-4 h-4 ${feat.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">{feat.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sustainability & Carbon Offset Banner */}
          <div className="w-full py-3 px-4 rounded-2xl bg-[#18392B] border border-emerald-600/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
            <Leaf className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Smarter logistics today for a more connected and sustainable tomorrow.</span>
          </div>
        </div>

      </div>

      {/* ─── FULLSCREEN MAP MODAL ─── */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in">
          <div className="flex items-center justify-between p-4 bg-[#0B1220] border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Full City Logistics Corridor</h3>
                <p className="text-[11px] text-slate-400">{waypoints.length} Active Delivery Stops</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMapExpanded(false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 w-full h-full relative">
            <MapContainer
              center={[20.2961, 85.8245]}
              zoom={13}
              className="w-full h-full z-0"
              zoomControl={true}
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                maxZoom={19}
              />

              <Marker position={[originHub.lat, originHub.lng]} icon={createLogisticsWarehouseIcon()}>
                <Popup>
                  <div className="text-xs font-bold text-slate-900 p-1">
                    <span className="text-amber-600 font-extrabold block">🏠 Dispatch Warehouse</span>
                    <span>Baramunda Logistics Hub, Bhubaneswar</span>
                  </div>
                </Popup>
              </Marker>

              {/* Polyline Routes */}
              {van1Stops.length > 0 && (
                <Polyline
                  positions={filterValidLatLngs([
                    [originHub.lat, originHub.lng],
                    ...van1Stops.map((w) => [w.lat, w.lng] as [number, number]),
                  ])}
                  pathOptions={{ color: '#3B82F6', weight: 5, opacity: 0.95 }}
                />
              )}
              {van2Stops.length > 0 && (
                <Polyline
                  positions={filterValidLatLngs([
                    [originHub.lat, originHub.lng],
                    ...van2Stops.map((w) => [w.lat, w.lng] as [number, number]),
                  ])}
                  pathOptions={{ color: '#10B981', weight: 5, opacity: 0.95 }}
                />
              )}
              {van3Stops.length > 0 && (
                <Polyline
                  positions={filterValidLatLngs([
                    [originHub.lat, originHub.lng],
                    ...van3Stops.map((w) => [w.lat, w.lng] as [number, number]),
                  ])}
                  pathOptions={{ color: '#F97316', weight: 5, opacity: 0.95 }}
                />
              )}

              {/* Waypoints */}
              {waypoints.filter((wp) => isValidLatLng([wp.lat, wp.lng])).map((wp, idx) => (
                <Marker
                  key={wp.id}
                  position={[wp.lat, wp.lng]}
                  icon={createNumberedPinIcon(idx + 1, wp.recipientName)}
                >
                  <Popup>
                    <div className="text-xs font-bold text-slate-900 p-1">
                      <div className="font-black text-slate-950">Stop {idx + 1}: {wp.recipientName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{wp.address}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {isPaymentOpen && (
        <PaymentGatewayModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          amount={Math.round(plan.estimatedCostInr || 240)}
          purpose="Logistics Corridor Dispatch"
          onPaymentSuccess={() => {
            setIsPaymentOpen(false);
            setToastMessage('✅ Dispatch payment completed successfully!');
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
};
