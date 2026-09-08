import React, { useState, useMemo, useEffect } from 'react';
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
  Calendar,
  ArrowUpDown,
  FileCheck,
  Save,
  Bot,
  Share2,
  Copy,
  Radio,
  Timer,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  SAMPLE_DELIVERY_STOPS,
  RESTRICTED_NO_FLY_ZONES,
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute,
  VEHICLE_FLEET_OPTIONS,
  DRIVER_ROSTER,
  VehicleOption,
  DriverProfile,
  LogisticsCostBreakdown,
  calculateVolumetricWeight,
  suggestOptimalVehicle,
  optimizeSmartDeliveryRoute,
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { isValidLatLng, filterValidLatLngs } from '../../utils/latLngValidator';

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
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
  },
  {
    corridor: 'Nandankanan Rd (Jayadev Vihar ➔ Patia KIIT)',
    status: '🟡 Moderate Flow',
    speed: '19 km/h',
    delay: '+6 mins (Damana Square signal)',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
  },
  {
    corridor: 'Rasulgarh Flyover / NH-16 Junction',
    status: '🔴 Heavy Congestion',
    speed: '8 km/h',
    delay: '+14 mins (Take service road bypass)',
    color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
  },
  {
    corridor: 'Cuttack-Puri Bypass Expressway',
    status: '🟢 Fast Flow',
    speed: '44 km/h',
    delay: '0 mins delay',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
  },
];

const STOP_PIN_COLORS = [
  '#3B82F6', // Blue (Van 1)
  '#10B981', // Green (Van 2)
  '#F97316', // Orange (Van 3)
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#EAB308', // Yellow
];

const createNumberedPinIcon = (stopNumber: number, recipientName?: string, status?: string) => {
  const isDelivered = status === 'delivered';
  const bgColor = isDelivered ? '#10B981' : STOP_PIN_COLORS[(stopNumber - 1) % STOP_PIN_COLORS.length];
  const shortName = (recipientName || `Stop ${stopNumber}`).split(',')[0].slice(0, 16);

  return L.divIcon({
    className: 'custom-numbered-logistics-pin',
    html: `
      <div style="display: flex; align-items: center; gap: 5px; transform: translate(-14px, -14px);">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${bgColor};
          color: #ffffff;
          font-weight: 900;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          flex-shrink: 0;
        ">
          ${isDelivered ? '✓' : stopNumber}
        </div>
        ${
          shortName
            ? `<div style="
                background: rgba(12, 20, 37, 0.95);
                color: #f1f5f9;
                border: 1px solid rgba(255, 255, 255, 0.2);
                font-weight: 700;
                font-size: 11px;
                padding: 2px 7px;
                border-radius: 6px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.6);
              ">${shortName}</div>`
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
          background: rgba(12, 20, 37, 0.95);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.5);
          font-weight: 800;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        ">
          Warehouse Base
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const MapBoundsUpdater: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
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

  // 2. Mani Tribhuban
  const normalized = clean.replace(/[\s\-_]+/g, '');
  if (
    clean.includes('mani') ||
    clean.includes('tribhuban') ||
    clean.includes('tribhuvan') ||
    normalized.includes('manitribhuban')
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

// Categorized Suggested Addresses
const CATEGORIZED_LOCATIONS = {
  popular: [
    { name: 'Trident Academy of Technology', address: 'Chandaka Industrial Estate, Patia' },
    { name: 'KIIT Square', address: 'KIIT Road, Patia, Bhubaneswar' },
    { name: 'Master Canteen Square', address: 'Railway Station Commercial Area' },
    { name: 'Rasulgarh NH-16 Flyover', address: 'NH-16 Commercial Junction' },
  ],
  recent: [
    { name: 'Mani Tribhuban', address: 'Nandankanan Road, Patia (751024)' },
    { name: 'Infocity DLF Cybercity', address: 'Patia IT Corridor, Bhubaneswar' },
    { name: 'Baramunda ISBT Hub', address: 'Khandagiri-Baramunda Depot' },
    { name: 'Saheed Nagar Commercial Block', address: 'Saheed Nagar, Janpath' },
  ],
  saved: [
    { name: 'Central Warehouse Depot', address: 'Baramunda Logistics Park, Bhubaneswar' },
    { name: 'Nayapalli Tech Zone', address: 'IRC Village, Nayapalli' },
    { name: 'Unit 2 Market Complex', address: 'Market Building, Ashok Nagar' },
  ],
};

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

  // Waypoints state
  const [internalWaypoints, setInternalWaypoints] = useState<DeliveryWaypoint[]>([]);
  const waypoints = externalWaypoints ?? internalWaypoints;

  const setWaypoints = (newWps: DeliveryWaypoint[] | ((prev: DeliveryWaypoint[]) => DeliveryWaypoint[])) => {
    const updated = typeof newWps === 'function' ? newWps(waypoints) : newWps;
    setInternalWaypoints(updated);
    onWaypointsChange?.(updated);
  };

  // Top Nav Tab: 'plans' | 'live_map' | 'history'
  const [activeMainTab, setActiveMainTab] = useState<'plans' | 'live_map' | 'history'>('plans');

  // Search & Input States
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryTab, setCategoryTab] = useState<'popular' | 'recent' | 'saved'>('popular');

  // Parcel Multi-Selection & Specs
  const [selectedParcelTypes, setSelectedParcelTypes] = useState<string[]>(['Documents']);
  const [customParcelType, setCustomParcelType] = useState('');
  const [parcelCount, setParcelCount] = useState<number>(1);
  const [parcelWeight, setParcelWeight] = useState<string>('4.5');
  const [lengthCm, setLengthCm] = useState<number>(30);
  const [widthCm, setWidthCm] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(15);

  // Delivery Timing & Priority
  const [deliveryDate, setDeliveryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [preferredSlot, setPreferredSlot] = useState<'Morning (09:00 - 12:00)' | 'Afternoon (12:00 - 16:00)' | 'Evening (16:00 - 20:00)' | 'Express (Within 2h)'>('Morning (09:00 - 12:00)');
  const [dispatchPriority, setDispatchPriority] = useState<'Standard' | 'Express' | 'Urgent'>('Standard');

  // Fleet Vehicle & Driver
  const [selectedVehicleId, setSelectedVehicleId] = useState<'2_wheeler_ev' | 'e_van' | '14ft_e_truck' | 'mo_bus_cargo'>('e_van');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(DRIVER_ROSTER[0].id);

  // Modals & Drawers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMapPill, setActiveMapPill] = useState<'optimized' | 'all'>('optimized');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);

  // Proof of Delivery (e-POD) Modal State
  const [podModalStop, setPodModalStop] = useState<{ waypoint: DeliveryWaypoint; index: number } | null>(null);

  // Load saved draft on mount if available
  useEffect(() => {
    try {
      const draft = localStorage.getItem('musafir_logistics_draft_v1');
      if (draft && internalWaypoints.length === 0) {
        const parsed = JSON.parse(draft);
        if (parsed.waypoints && Array.isArray(parsed.waypoints) && parsed.waypoints.length > 0) {
          setInternalWaypoints(parsed.waypoints);
          if (parsed.vehicleId) setSelectedVehicleId(parsed.vehicleId);
          if (parsed.driverId) setSelectedDriverId(parsed.driverId);
        }
      }
    } catch (e) {
      console.warn('Could not read logistics draft:', e);
    }
  }, []);

  // Volumetric weight
  const volumetricWeightKg = useMemo(() => {
    return calculateVolumetricWeight(lengthCm, widthCm, heightCm);
  }, [lengthCm, widthCm, heightCm]);

  // Derived Totals
  const totalParcelsCount = waypoints.length > 0
    ? waypoints.reduce((acc, w) => acc + (w.parcelCount || 1), 0)
    : 0;
  const totalWeightKg = waypoints.length > 0
    ? waypoints.reduce((acc, w) => acc + (w.packageWeightKg || 5), 0)
    : 0;
  const totalVolumeM3 = (totalWeightKg * 0.0051).toFixed(2);

  // Active Vehicle Spec
  const activeVehicle = useMemo(() => {
    return VEHICLE_FLEET_OPTIONS.find((v) => v.id === selectedVehicleId) || VEHICLE_FLEET_OPTIONS[1];
  }, [selectedVehicleId]);

  // Active Driver Spec
  const activeDriver = useMemo(() => {
    return DRIVER_ROSTER.find((d) => d.id === selectedDriverId) || DRIVER_ROSTER[0];
  }, [selectedDriverId]);

  // Vehicle Capacity Calculations
  const vehicleCapacityPercent = Math.min(
    100,
    Math.round((totalWeightKg / activeVehicle.maxPayloadKg) * 100)
  );
  const remainingVolumeM3 = Math.max(0, activeVehicle.maxVolumeM3 - parseFloat(totalVolumeM3)).toFixed(2);

  // Compute Route Plan
  const plan: AntiGravityRoutePlan = useMemo(() => {
    return computeAntiGravityRoute(originHub, waypoints, 45, selectedVehicleId);
  }, [originHub, waypoints, selectedVehicleId]);

  // Progress Bar Statistics
  const completedStopsCount = waypoints.filter((w) => w.status === 'delivered').length;
  const progressPercent = waypoints.length > 0
    ? Math.round((completedStopsCount / waypoints.length) * 100)
    : 0;

  // Split waypoints among 3 Vans
  const van1Stops = waypoints.slice(0, Math.ceil(waypoints.length / 3));
  const van2Stops = waypoints.slice(Math.ceil(waypoints.length / 3), Math.ceil((waypoints.length * 2) / 3));
  const van3Stops = waypoints.slice(Math.ceil((waypoints.length * 2) / 3));

  const van1Parcels = van1Stops.reduce((sum, s) => sum + (s.parcelCount || 1), 0) || (waypoints.length > 0 ? 8 : 0);
  const van2Parcels = van2Stops.reduce((sum, s) => sum + (s.parcelCount || 1), 0) || (waypoints.length > 0 ? 6 : 0);
  const van3Parcels = van3Stops.reduce((sum, s) => sum + (s.parcelCount || 1), 0) || (waypoints.length > 0 ? 4 : 0);

  // Toggle Parcel Type Multi-selection
  const handleToggleParcelType = (type: string) => {
    if (selectedParcelTypes.includes(type)) {
      if (selectedParcelTypes.length > 1) {
        setSelectedParcelTypes(selectedParcelTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedParcelTypes([...selectedParcelTypes, type]);
    }
  };

  // Add Stop Handler
  const handleAddStop = (addressToAdd?: string) => {
    const rawAddress = addressToAdd || searchAddress;
    if (!rawAddress.trim()) return;

    const resolved = resolveLogisticsCoordinates(rawAddress);
    const effectiveTypes = selectedParcelTypes.includes('Other') && customParcelType.trim()
      ? [...selectedParcelTypes.filter((t) => t !== 'Other'), customParcelType.trim()]
      : selectedParcelTypes;

    const newStop: DeliveryWaypoint = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientName: rawAddress.split(',')[0].trim(),
      phone: '+91 94370 ' + Math.floor(10000 + Math.random() * 90000),
      address: resolved.formatted,
      lat: resolved.lat,
      lng: resolved.lng,
      altitudeMeters: 45,
      packageWeightKg: parseFloat(parcelWeight) || 4.5,
      parcelCount: parcelCount > 0 ? parcelCount : 1,
      volumetricWeightKg,
      dimensionsCm: { length: lengthCm, width: widthCm, height: heightCm },
      parcelType: effectiveTypes[0],
      parcelTypes: effectiveTypes,
      priority: dispatchPriority,
      preferredTimeSlot: preferredSlot,
      deliveryDeadline: `${deliveryDate}T18:00`,
      status: 'pending',
      ecoPackaging: true,
      dockingStatus: 'ALIGNED_LOCKED',
      dockingToleranceCm: 7.5,
      assignedDriverId: selectedDriverId,
    };

    setWaypoints([...waypoints, newStop]);
    setSearchAddress('');
    setIsSearchFocused(false);
    setToastMessage(`✅ Stop "${newStop.recipientName}" added with ${effectiveTypes.join(', ')}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  // Stop Reordering: Move Up
  const handleMoveStopUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...waypoints];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    setWaypoints(reordered);
    setToastMessage(`↕️ Moved Stop ${index + 1} to position ${index}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Stop Reordering: Move Down
  const handleMoveStopDown = (index: number) => {
    if (index === waypoints.length - 1) return;
    const reordered = [...waypoints];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    setWaypoints(reordered);
    setToastMessage(`↕️ Moved Stop ${index + 1} to position ${index + 2}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Update Status of Stop
  const handleUpdateStopStatus = (id: string, newStatus: DeliveryWaypoint['status']) => {
    const updated = waypoints.map((w) => (w.id === id ? { ...w, status: newStatus } : w));
    setWaypoints(updated);
    setToastMessage(`📦 Stop status updated to: ${newStatus.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const draftPayload = {
        waypoints,
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('musafir_logistics_draft_v1', JSON.stringify(draftPayload));
      setToastMessage('💾 Logistics plan saved as draft! Your data is preserved.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      setToastMessage('⚠️ Unable to save draft locally.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Smart Route Optimization (TSP + Priority)
  const handleSmartOptimizeRoutes = () => {
    if (waypoints.length === 0) {
      setToastMessage('ℹ️ Add at least 1 delivery stop to calculate optimal routes.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const res = optimizeSmartDeliveryRoute(originHub, waypoints, selectedVehicleId);
    setWaypoints(res.optimizedStops);
    setToastMessage(
      `✨ Smart Route re-ordered! Urgent deliveries prioritized. ${res.totalDistanceKm} km total corridor.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Benchmark Stops
  const handleLoadSampleStops = () => {
    setWaypoints(SAMPLE_DELIVERY_STOPS);
    setToastMessage('✅ Loaded sample Bhubaneswar delivery routes!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clear All
  const handleClearAllStops = () => {
    setWaypoints([]);
    setToastMessage('🗑️ Cleared all delivery stops.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Proof of Delivery Completion Handler
  const handleCompletePOD = (
    waypointId: string,
    podData: {
      receiverName: string;
      signature: string;
      otp: string;
      photoUrl?: string;
      notes: string;
      deliveredAt: string;
    }
  ) => {
    const updated = waypoints.map((w) => {
      if (w.id === waypointId) {
        return {
          ...w,
          status: 'delivered' as const,
          pod: podData,
        };
      }
      return w;
    });
    setWaypoints(updated);
    setToastMessage(`🎉 e-POD complete for ${podData.receiverName}! Stop marked as Delivered.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Actionable Musafir AI Prompts
  const handleAIPrompt = (actionKey: string) => {
    if (waypoints.length === 0 && actionKey !== 'vehicle') {
      setAiActionMessage('ℹ️ Please add delivery stops first so I can analyze and optimize your route.');
      return;
    }

    switch (actionKey) {
      case 'optimize': {
        const res = optimizeSmartDeliveryRoute(originHub, waypoints, selectedVehicleId);
        setWaypoints(res.optimizedStops);
        setAiActionMessage(
          `🤖 **Musafir AI Optimized Route:** Arranged ${res.optimizedStops.length} stops using Nearest-Neighbor TSP + Priority clustering. Distance reduced to **${res.totalDistanceKm} km**, saving ~18% battery cost.`
        );
        break;
      }
      case 'urgent': {
        const urgentList = waypoints.filter((w) => w.priority === 'Urgent');
        if (urgentList.length > 0) {
          setAiActionMessage(
            `🚨 **Urgent Priority Stop:** "${urgentList[0].recipientName}" at ${urgentList[0].address} has top delivery priority. Recommended dispatch window: within 45 mins.`
          );
        } else {
          setAiActionMessage(
            `✅ All current ${waypoints.length} stops are marked Standard/Express. No critical urgent delays detected!`
          );
        }
        break;
      }
      case 'fuel': {
        const optimal = suggestOptimalVehicle(totalWeightKg, parseFloat(totalVolumeM3));
        setSelectedVehicleId(optimal.id);
        setAiActionMessage(
          `🌱 **Eco Fuel Recommendation:** Selected **${optimal.name}** (${optimal.fuelType}). Fuel & energy cost drops to **₹${activeVehicle.costPerKmInr}/km** with 0g local tailpipe emissions!`
        );
        break;
      }
      case 'sms': {
        const nextPending = waypoints.find((w) => w.status !== 'delivered') || waypoints[0];
        const msg = `Namaste ${nextPending.recipientName}! Your Musafir Delivery parcel is arriving in ~25 mins via ${activeVehicle.typeLabel} (Driver: ${activeDriver.name}, ${activeDriver.phone}). Track live at musafir.in/track`;
        navigator.clipboard?.writeText(msg);
        setAiActionMessage(
          `📱 **Customer Alert Generated (Copied to Clipboard):**\n\n"${msg}"`
        );
        break;
      }
      case 'vehicle': {
        const optimal = suggestOptimalVehicle(totalWeightKg, parseFloat(totalVolumeM3));
        setSelectedVehicleId(optimal.id);
        setAiActionMessage(
          `🚛 **Fleet Match:** For ${totalWeightKg.toFixed(1)} kg and ${totalVolumeM3} m³ load, **${optimal.name}** is the most cost-effective (${optimal.maxPayloadKg} kg max, ${optimal.batteryRangeKm} km range).`
        );
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B14] text-slate-100 overflow-y-auto pb-24 font-sans">
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

      {/* ─── 1. TOP HEADER & STATUS BAR ─── */}
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
            <h1 className="text-xs sm:text-sm font-black text-white leading-none">Smart Logistics Hub</h1>
            <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
              Multi-Drop Route Optimization, Fleet Allocation & e-POD
            </p>
          </div>
        </div>

        {/* Right Controls: Notifications, Save Draft, Musafir AI, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Actionable Musafir AI Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsAIDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition cursor-pointer active:scale-95"
            title="Actionable Musafir AI"
          >
            <Bot className="w-4 h-4 fill-slate-950" />
            <span className="hidden md:inline">Musafir AI</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold transition cursor-pointer"
            title="Save Plan Draft"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </button>

          <div className="flex items-center gap-2 bg-[#10182E] border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:border-slate-700">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">Logistics Dispatcher</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ─── 2. TOP PROGRESS & DISPATCH METRICS BAR ─── */}
      <div className="bg-[#0B1222] border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Progress text */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {completedStopsCount}/{waypoints.length || 4} Stops Completed
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-mono">
                {waypoints.length > 0 ? (18 + waypoints.length * 2.1).toFixed(1) : '28.4'} km
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-semibold">
                Estimated {Math.floor(plan.totalDurationMinutes / 60)}h {plan.totalDurationMinutes % 60}m
              </span>
            </div>

            {waypoints.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                {progressPercent}% Done
              </span>
            )}
          </div>

          {/* Animated Visual Progress Bar */}
          <div className="w-full md:w-72 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/90">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── 3. NOTIFICATION DRAWER / DROPDOWN ─── */}
      {isNotificationOpen && (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 pt-3 animate-in fade-in">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Route & Traffic Alerts</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Damana Square Delay (+6 min)</div>
                  <div className="text-[11px] text-amber-300/80">Moderate signal congestion on Nandankanan corridor.</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Route Deviation Avoided</div>
                  <div className="text-[11px] text-blue-300/80">Re-routed via Service Road to bypass Rasulgarh jam.</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Fast-Track Verification</div>
                  <div className="text-[11px] text-emerald-300/80">e-POD OTP enabled for all active deliveries.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. MAIN DASHBOARD CONTENT ─── */}
      <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 lg:p-6 space-y-6">
        {/* Navigation Tabs: Plans | Live Map | History */}
        <div className="flex bg-[#0B1222] p-1.5 rounded-2xl border border-slate-800 max-w-md gap-1">
          <button
            type="button"
            onClick={() => setActiveMainTab('plans')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMainTab === 'plans'
                ? 'bg-[#EAB308] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Plans</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('live_map')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMainTab === 'live_map'
                ? 'bg-[#EAB308] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live Map</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMainTab === 'history'
                ? 'bg-[#EAB308] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* =========================================================================
              COLUMN 1: LOGISTICS PLANNER (col-span-12 lg:col-span-4)
             ========================================================================= */}
          <div className="lg:col-span-4 bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Logistics Dispatch Planner</h2>
                  <p className="text-[11px] text-slate-300 font-medium">Configure payload, schedule & stops</p>
                </div>
              </div>
            </div>

            {/* Delivery Details Summary: Total Parcels, Weight, Volumetric, Volume */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5">
                <div className="text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1">
                  <Package className="w-3 h-3 text-amber-400" />
                  <span>Parcels</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {totalParcelsCount > 0 ? totalParcelsCount : '0'}
                </div>
              </div>

              <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5">
                <div className="text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1">
                  <Scale className="w-3 h-3 text-blue-400" />
                  <span>Weight</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {totalWeightKg > 0 ? `${totalWeightKg.toFixed(1)} kg` : '0 kg'}
                </div>
              </div>

              <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-2.5">
                <div className="text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1">
                  <Boxes className="w-3 h-3 text-emerald-400" />
                  <span>Volume</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {totalWeightKg > 0 ? `${totalVolumeM3} m³` : '0 m³'}
                </div>
              </div>
            </div>

            {/* Parcel Category Multi-Select */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>Parcel Types (Multi-select)</span>
                </label>
                <span className="text-[10px] text-slate-400">{selectedParcelTypes.length} selected</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Documents', 'Electronics', 'Clothing', 'Food', 'Other'] as const).map((type) => {
                  const isSelected = selectedParcelTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleParcelType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#EAB308] text-slate-950 shadow-md font-black'
                          : 'bg-[#10182E] text-slate-300 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom 'Other' specification */}
              {selectedParcelTypes.includes('Other') && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={customParcelType}
                    onChange={(e) => setCustomParcelType(e.target.value)}
                    placeholder="Specify other parcel (e.g. Medical Supplies, Fragile Glass)"
                    className="w-full bg-[#10182E] border border-amber-500/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Parcel Count, Weight & Dimensions (L x W x H) */}
            <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-3 space-y-2.5">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Parcel Dimensions & Quantity</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  Volumetric: {volumetricWeightKg} kg
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={parcelCount}
                    onChange={(e) => setParcelCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">L (cm)</label>
                  <input
                    type="number"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">W (cm)</label>
                  <input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">H (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Pickup & Delivery Date/Time Slot & Priority */}
            <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-3 space-y-2.5">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Date & Delivery Time Slot</span>
                </span>
                <span className="text-[10px] text-slate-400">Bhubaneswar Dispatch</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as any)}
                    className="w-full bg-[#10182E] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="Standard">Standard (Normal)</option>
                    <option value="Express">Express (4h SLA)</option>
                    <option value="Urgent">Urgent (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Time Slot Options */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold block">Preferred Slot</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Morning (09:00 - 12:00)',
                    'Afternoon (12:00 - 16:00)',
                    'Evening (16:00 - 20:00)',
                    'Express (Within 2h)',
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredSlot(slot as any)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition ${
                        preferredSlot === slot
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-[#10182E] text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Locations Search & Categorized Suggestions */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Delivery Locations</h3>
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
                  <span className="absolute left-3 text-slate-400">
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
                    placeholder="Search address in Bhubaneswar..."
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
                      Popular Hubs
                    </div>
                    {CATEGORIZED_LOCATIONS.popular.map((item) => (
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

              {/* Categorized Location Chips: Popular | Recent | Saved */}
              <div className="space-y-1.5">
                <div className="flex gap-1 border-b border-slate-800/80 pb-1 text-[10px] font-bold">
                  {(['popular', 'recent', 'saved'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryTab(cat)}
                      className={`px-2 py-0.5 rounded-md transition capitalize cursor-pointer ${
                        categoryTab === cat
                          ? 'bg-slate-800 text-amber-400 font-black'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'saved' ? 'Saved' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {CATEGORIZED_LOCATIONS[categoryTab].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleAddStop(`${item.name}, ${item.address}`)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-[#10182E] hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition cursor-pointer font-medium flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5 text-amber-400" />
                      <span>{item.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop Sequence Queue & Manual Reordering */}
              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
                {/* Warehouse Origin (Base) */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10182E] border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                      W
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Warehouse Dispatch Base</div>
                      <div className="text-[10px] text-slate-400">Baramunda Logistics Hub</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Origin
                  </span>
                </div>

                {/* Empty State with Prominent "Add First Stop" Button */}
                {waypoints.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#10182E]/60 border border-dashed border-slate-800 text-center space-y-2.5">
                    <Package className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-200">No delivery stops added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Add delivery addresses to calculate optimal shortest routes and fleet allocations.
                    </p>

                    {/* Prominent Add First Stop Button */}
                    <button
                      type="button"
                      onClick={() => handleAddStop('Trident Academy of Technology, Chandaka Industrial Estate')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Add First Stop (Trident Academy)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSampleStops}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer block mx-auto"
                    >
                      Load Sample Bhubaneswar Stops
                    </button>
                  </div>
                ) : (
                  waypoints.map((wp, idx) => {
                    const pinColor = STOP_PIN_COLORS[idx % STOP_PIN_COLORS.length];
                    const isDelivered = wp.status === 'delivered';

                    return (
                      <div
                        key={wp.id}
                        className={`p-2.5 rounded-2xl border transition space-y-1.5 ${
                          isDelivered
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-[#10182E] border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {/* Number Pin */}
                            <div
                              className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 text-white"
                              style={{ backgroundColor: isDelivered ? '#10B981' : pinColor }}
                            >
                              {isDelivered ? '✓' : idx + 1}
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{wp.recipientName}</span>
                                {wp.priority === 'Urgent' && (
                                  <span className="text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-300 truncate">
                                {wp.packageWeightKg} kg • {wp.parcelCount || 1} parcel
                                {wp.parcelTypes ? ` • ${wp.parcelTypes.join(', ')}` : ''}
                              </div>
                            </div>
                          </div>

                          {/* Reordering & Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveStopUp(idx)}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
                              title="Move Stop Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={idx === waypoints.length - 1}
                              onClick={() => handleMoveStopDown(idx)}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
                              title="Move Stop Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Stop */}
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(wp.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition"
                              title="Remove Stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Status Selector & e-POD Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-semibold">Status:</span>
                            <select
                              value={wp.status}
                              onChange={(e) => handleUpdateStopStatus(wp.id, e.target.value as any)}
                              className={`bg-[#070D1A] rounded px-1.5 py-0.5 font-bold text-[10px] border ${
                                wp.status === 'delivered'
                                  ? 'text-emerald-400 border-emerald-500/50'
                                  : wp.status === 'in_transit'
                                  ? 'text-blue-400 border-blue-500/50'
                                  : wp.status === 'failed'
                                  ? 'text-rose-400 border-rose-500/50'
                                  : 'text-amber-400 border-slate-700'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="failed">Failed</option>
                              <option value="rescheduled">Rescheduled</option>
                            </select>
                          </div>

                          {/* Proof of Delivery Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setPodModalStop({ waypoint: wp, index: idx })}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>{wp.status === 'delivered' ? 'View POD ✓' : 'e-POD'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Smart Route Optimization Button */}
              <button
                type="button"
                onClick={handleSmartOptimizeRoutes}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 mt-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Smart Route Optimization (TSP)</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              COLUMN 2: INTERACTIVE ROUTE MAP (col-span-12 lg:col-span-5)
             ========================================================================= */}
          <div className="lg:col-span-5 bg-[#0B1222] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl relative h-[520px] sm:h-[600px] flex flex-col">
            {/* Top Floating Filter Pills */}
            <div className="absolute top-3.5 left-3.5 z-[1000] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMapPill('optimized')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                  activeMapPill === 'optimized'
                    ? 'bg-[#121A2B]/95 text-amber-400 border border-amber-500/60 shadow-amber-500/20'
                    : 'bg-[#121A2B]/80 text-slate-300 border border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>Optimized Corridors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMapPill('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                  activeMapPill === 'all'
                    ? 'bg-[#121A2B]/95 text-amber-400 border border-amber-500/60 shadow-amber-500/20'
                    : 'bg-[#121A2B]/80 text-slate-300 border border-slate-700 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>All Stops</span>
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

                {/* Polylines for 3 Fleet Delivery Clusters */}
                {van1Stops.length > 0 && (
                  <Polyline
                    positions={filterValidLatLngs([
                      [originHub.lat, originHub.lng],
                      ...van1Stops.map((w) => [w.lat, w.lng] as [number, number]),
                    ])}
                    pathOptions={{ color: '#3B82F6', weight: 4.5, opacity: 0.95 }}
                  />
                )}

                {van2Stops.length > 0 && (
                  <Polyline
                    positions={filterValidLatLngs([
                      [originHub.lat, originHub.lng],
                      ...van2Stops.map((w) => [w.lat, w.lng] as [number, number]),
                    ])}
                    pathOptions={{ color: '#10B981', weight: 4.5, opacity: 0.95 }}
                  />
                )}

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
                {waypoints
                  .filter((wp) => isValidLatLng([wp.lat, wp.lng]))
                  .map((wp, idx) => (
                    <Marker
                      key={wp.id}
                      position={[wp.lat, wp.lng]}
                      icon={createNumberedPinIcon(idx + 1, wp.recipientName, wp.status)}
                    >
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1 space-y-1">
                          <div className="font-black text-slate-950">
                            Stop {idx + 1}: {wp.recipientName}
                          </div>
                          <div className="text-[11px] text-slate-600">{wp.address}</div>
                          <div className="text-[10px] text-slate-500">
                            Weight: {wp.packageWeightKg} kg • Status: {wp.status.toUpperCase()}
                          </div>
                          {wp.pod && (
                            <div className="p-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ Received by {wp.pod.receiverName} ({wp.pod.deliveredAt})
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            {/* Vehicle Fleet Live Allocation Floating Card */}
            <div className="absolute left-3.5 bottom-3.5 z-[1000] bg-[#0C1425]/95 border border-slate-800/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl space-y-2 min-w-[190px]">
              <h4 className="font-extrabold text-slate-300 text-[11px] uppercase tracking-wider">Fleet Clusters</h4>
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <span>Van 1 (Patia/KIIT)</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{van1Parcels} pkgs</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span>Van 2 (Janpath/Vani)</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{van2Parcels} pkgs</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span>Van 3 (Rasulgarh/NH)</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{van3Parcels} pkgs</span>
                </div>
              </div>
            </div>

            {/* Map Expand Button */}
            <div className="absolute right-3.5 bottom-3.5 z-[1000]">
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="w-9 h-9 rounded-xl bg-[#0C1425]/95 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
                title="Fullscreen Map"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              COLUMN 3: VEHICLE DETAILS, DRIVER & COST BREAKDOWN (col-span-12 lg:col-span-3)
             ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            {/* Card 1: Vehicle Details & Dynamic Capacity Gauge */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Vehicle Details & Fleet</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {/* Vehicle Type Picker */}
              <div className="grid grid-cols-2 gap-1.5">
                {VEHICLE_FLEET_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      selectedVehicleId === v.id
                        ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                        : 'bg-[#10182E] border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight truncate">{v.typeLabel}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">₹{v.costPerKmInr}/km • {v.maxPayloadKg}kg</div>
                  </button>
                ))}
              </div>

              {/* Dynamic Capacity Visual Gauge */}
              <div className="p-3 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Payload Capacity</span>
                  <span className={vehicleCapacityPercent > 90 ? 'text-rose-400' : 'text-amber-400 font-mono'}>
                    {vehicleCapacityPercent}% Filled
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      vehicleCapacityPercent > 90
                        ? 'bg-rose-500'
                        : vehicleCapacityPercent > 65
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(4, vehicleCapacityPercent)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-300 font-semibold flex items-center justify-between pt-0.5">
                  <span>Remaining: {remainingVolumeM3} m³</span>
                  <span>{activeVehicle.batteryRangeKm} km Range</span>
                </div>
              </div>
            </div>

            {/* Card 2: Driver Assignment Card */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Driver Assignment</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Bhubaneswar Fleet</span>
              </div>

              {/* Driver Details */}
              <div className="p-3 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-xs text-blue-400">
                      {activeDriver.avatarInitials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{activeDriver.name}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        ★ {activeDriver.rating} • {activeDriver.totalTrips} deliveries
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeDriver.phone}`}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                    title="Call Driver"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-[11px] text-slate-300 font-medium space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vehicle Number:</span>
                    <span className="font-mono text-white font-bold">{activeDriver.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Station:</span>
                    <span className="text-slate-200">{activeDriver.currentLocation}</span>
                  </div>
                </div>

                {/* Driver Roster Dropdown */}
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-xl p-1.5 text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
                >
                  {DRIVER_ROSTER.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.name} ({drv.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card 3: Granular Cost Estimation Breakdown */}
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Cost Estimation</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  EV Discount 38%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#10182E] border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Distance Fare:</span>
                  <span className="font-mono text-white font-bold">
                    ₹{plan.costBreakdown?.distanceFareInr || 110}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Battery / Fuel Cost:</span>
                  <span className="font-mono text-white font-bold">
                    ₹{plan.costBreakdown?.fuelOrBatteryCostInr || 35}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tolls & Corridor Access:</span>
                  <span className="font-mono text-white font-bold">
                    ₹{plan.costBreakdown?.tollFeesInr || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Handling & Driver Allowance:</span>
                  <span className="font-mono text-white font-bold">
                    ₹{plan.costBreakdown?.driverAllowanceInr || 55}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-sm font-black text-white">
                  <span>Total Estimated:</span>
                  <span className="text-amber-400 text-base font-mono">
                    ₹{plan.costBreakdown?.totalCostInr || plan.estimatedCostInr || 200}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              >
                Pay & Authorize Dispatch
              </button>
            </div>
          </div>
        </div>

        {/* ─── 5. BOTTOM SECTION: KEY FEATURES IN LOGISTICS ─── */}
        <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-black">Key Features in Logistics Planning</h3>
          </div>

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

          {/* Eco Banner Footer */}
          <div className="w-full py-3 px-4 rounded-2xl bg-[#18392B] border border-emerald-600/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
            <Leaf className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Smarter logistics today for a more connected and sustainable tomorrow.</span>
          </div>
        </div>
      </div>

      {/* ─── ACTIONABLE MUSAFIR AI ASSISTANT DRAWER / MODAL ─── */}
      {isAIDrawerOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-[#0B1220] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Actionable Musafir AI Logistics</h3>
                  <p className="text-[11px] text-slate-300">Click any action to execute instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAIDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
              {aiActionMessage && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 whitespace-pre-line font-medium leading-relaxed">
                  {aiActionMessage}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  One-Click Logistics Actions
                </div>

                {[
                  {
                    key: 'optimize',
                    title: '“Mere stops ka best route banao.”',
                    subtitle: 'Auto-solves TSP nearest-neighbor shortest sequence.',
                  },
                  {
                    key: 'urgent',
                    title: '“Is route mein sabse urgent delivery kaunsi hai?”',
                    subtitle: 'Scans all stops for express deadlines and urgency flags.',
                  },
                  {
                    key: 'fuel',
                    title: '“Fuel cost kam karne ke liye route optimize karo.”',
                    subtitle: 'Selects high-efficiency EV fleet and minimizes detours.',
                  },
                  {
                    key: 'sms',
                    title: '“Late delivery ka message customer ko bhejo.”',
                    subtitle: 'Generates ready-to-send SMS/WhatsApp notification with live ETA.',
                  },
                  {
                    key: 'vehicle',
                    title: '“Is shipment ke liye suitable vehicle suggest karo.”',
                    subtitle: 'Calculates total payload weight and assigns right vehicle.',
                  },
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => handleAIPrompt(act.key)}
                    className="w-full text-left p-3 rounded-2xl bg-[#10182E] hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{act.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROOF OF DELIVERY (e-POD) MODAL ─── */}
      {podModalStop && (
        <ProofOfDeliveryModal
          isOpen={Boolean(podModalStop)}
          onClose={() => setPodModalStop(null)}
          waypoint={podModalStop.waypoint}
          stopIndex={podModalStop.index}
          onCompletePOD={handleCompletePOD}
        />
      )}

      {/* ─── FULLSCREEN MAP MODAL ─── */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in">
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer"
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

              {/* Polylines */}
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
              {waypoints
                .filter((wp) => isValidLatLng([wp.lat, wp.lng]))
                .map((wp, idx) => (
                  <Marker
                    key={wp.id}
                    position={[wp.lat, wp.lng]}
                    icon={createNumberedPinIcon(idx + 1, wp.recipientName, wp.status)}
                  >
                    <Popup>
                      <div className="text-xs font-bold text-slate-900 p-1">
                        <div className="font-black text-slate-950">
                          Stop {idx + 1}: {wp.recipientName}
                        </div>
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
          amount={Math.round(plan.costBreakdown?.totalCostInr || plan.estimatedCostInr || 240)}
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
