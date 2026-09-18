import React, { useState, useMemo } from 'react';
import {
  Package,
  Truck,
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
  Check,
  X,
  PhoneCall,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Coins,
  Leaf,
  Sliders,
  Activity,
  Maximize2,
  Search,
  Bell,
  RotateCcw,
  Scale,
  Boxes,
  Download,
  Calendar,
  Play,
  Pause,
  RefreshCw,
  Share2,
  DollarSign,
  AlertCircle,
  Timer,
  Car,
  CheckSquare,
  BarChart3,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute,
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';
import { isValidLatLng, filterValidLatLngs } from '../../utils/latLngValidator';

// Live Corridor Traffic & Civic Road Condition Data
const LIVE_CORRIDOR_TRAFFIC = [
  {
    corridor: 'Janpath Arterial (Master Canteen ➔ Vani Vihar)',
    status: '🟢 Smooth Flow',
    speed: '28 km/h',
    delay: '0 mins delay',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
  },
  {
    corridor: 'Nandankanan Rd (Jayadev Vihar ➔ Patia KIIT)',
    status: '🟡 Moderate Flow',
    speed: '19 km/h',
    delay: '+6 mins (Damana Square signal)',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
  },
  {
    corridor: 'Rasulgarh Flyover / NH-16 Junction',
    status: '🔴 Heavy Waterlogging & Congestion',
    speed: '7 km/h',
    delay: '+18 mins delay (Civic Report #OD-209)',
    color: 'border-rose-500/50 bg-rose-950/30 text-rose-300',
  },
  {
    corridor: 'Cuttack-Puri Bypass Expressway (AI Alternate)',
    status: '🟢 Fast Bypass Available',
    speed: '48 km/h',
    delay: '0 mins (14 mins saved via bypass)',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
  },
];

// Past Dispatch History Data
const SAMPLE_DISPATCH_HISTORY = [
  {
    id: 'DSP-8821',
    date: 'Today, 09:30 AM',
    routeTitle: 'Baramunda ➔ Patia ➔ KIIT ➔ Rasulgarh',
    van: 'Mini Truck (OD-02-BT-9901)',
    driver: 'Subrat Nayak',
    stopsCount: 4,
    parcelsDelivered: 12,
    distanceKm: 24.8,
    fuelCost: '₹165',
    status: 'Delivered',
    co2Saved: '3.4 kg',
  },
  {
    id: 'DSP-8819',
    date: 'Yesterday, 03:15 PM',
    routeTitle: 'Baramunda ➔ Master Canteen ➔ Rasulgarh',
    van: 'EV Loader (OD-33-E-4512)',
    driver: 'Biswajit Jena',
    stopsCount: 5,
    parcelsDelivered: 11,
    distanceKm: 19.2,
    fuelCost: '₹72 (EV)',
    status: 'Delivered',
    co2Saved: '2.8 kg',
  },
  {
    id: 'DSP-8815',
    date: 'Yesterday, 10:00 AM',
    routeTitle: 'Baramunda ➔ Unit 2 ➔ Lingaraj Old Town',
    van: 'Delivery Bike (OD-02-AX-8910)',
    driver: 'Rajesh Mohanty',
    stopsCount: 6,
    parcelsDelivered: 8,
    distanceKm: 16.5,
    fuelCost: '₹55',
    status: 'Delivered',
    co2Saved: '2.1 kg',
  },
];

// Illustrative 4-Stop Delivery Plan (from User Prompt)
const ILLUSTRATIVE_4_STOPS: DeliveryWaypoint[] = [
  {
    id: 'stop-patia',
    recipientName: 'Patia Hub (Delivery 1)',
    phone: '+91 94371 88101',
    address: 'Patia Main Road, Near Big Bazaar, Bhubaneswar',
    lat: 20.3588,
    lng: 85.8142,
    packageWeightKg: 14,
    parcelType: 'Electronics',
    priority: 'Express',
    timeWindow: '10 AM–12 PM',
    estimatedArrival: '10:35 AM',
    status: 'in_transit',
    ecoPackaging: true,
  },
  {
    id: 'stop-kiit',
    recipientName: 'KIIT Square (Delivery 2)',
    phone: '+91 94370 22910',
    address: 'KIIT University Campus 6, Patia, Bhubaneswar',
    lat: 20.3541,
    lng: 85.8175,
    packageWeightKg: 8.5,
    parcelType: 'Documents',
    priority: 'Standard',
    timeWindow: '12 PM–2 PM',
    estimatedArrival: '11:15 AM',
    status: 'pending',
    ecoPackaging: true,
  },
  {
    id: 'stop-rasulgarh',
    recipientName: 'Rasulgarh (Delivery 3)',
    phone: '+91 98610 99420',
    address: 'Rasulgarh Square Commercial Complex, NH-16, Bhubaneswar',
    lat: 20.2974,
    lng: 85.8647,
    packageWeightKg: 32,
    parcelType: 'Clothing',
    priority: 'Standard',
    timeWindow: '2 PM–4 PM',
    estimatedArrival: '01:30 PM',
    status: 'pending',
    ecoPackaging: true,
  },
  {
    id: 'stop-customer',
    recipientName: 'Customer Residence (Delivery 4)',
    phone: '+91 70081 44521',
    address: 'Khandagiri Enclave, Near Udayagiri Caves, Bhubaneswar',
    lat: 20.2612,
    lng: 85.7891,
    packageWeightKg: 6,
    parcelType: 'Food',
    priority: 'Urgent',
    timeWindow: '4 PM–6 PM',
    estimatedArrival: '02:45 PM',
    status: 'pending',
    ecoPackaging: true,
  },
];

// 10-Stop Mega Delivery Plan for Truck
const MEGA_10_STOPS: DeliveryWaypoint[] = [
  ...ILLUSTRATIVE_4_STOPS,
  {
    id: 'stop-5',
    recipientName: 'Master Canteen Hub (Stop 5)',
    phone: '+91 94370 11223',
    address: 'Station Square, Master Canteen, Bhubaneswar',
    lat: 20.2667,
    lng: 85.8436,
    packageWeightKg: 18,
    parcelType: 'Electronics',
    priority: 'Standard',
    timeWindow: '10 AM–12 PM',
    status: 'pending',
  },
  {
    id: 'stop-6',
    recipientName: 'Unit 2 Market (Stop 6)',
    phone: '+91 94370 44556',
    address: 'Market Building, Unit 2, Ashok Nagar, Bhubaneswar',
    lat: 20.2721,
    lng: 85.8341,
    packageWeightKg: 25,
    parcelType: 'Clothing',
    priority: 'Standard',
    timeWindow: '12 PM–2 PM',
    status: 'pending',
  },
  {
    id: 'stop-7',
    recipientName: 'Vani Vihar University (Stop 7)',
    phone: '+91 94370 77889',
    address: 'Utkal University Gate, Vani Vihar, Bhubaneswar',
    lat: 20.3015,
    lng: 85.8458,
    packageWeightKg: 12,
    parcelType: 'Documents',
    priority: 'Standard',
    timeWindow: '12 PM–2 PM',
    status: 'pending',
  },
  {
    id: 'stop-8',
    recipientName: 'Chandrasekharpur Hub (Stop 8)',
    phone: '+91 94370 99001',
    address: 'Housing Board Colony, Chandrasekharpur, Bhubaneswar',
    lat: 20.3245,
    lng: 85.8198,
    packageWeightKg: 40,
    parcelType: 'Other',
    priority: 'Standard',
    timeWindow: '2 PM–4 PM',
    status: 'pending',
  },
  {
    id: 'stop-9',
    recipientName: 'Mancheswar Industrial Estate (Stop 9)',
    phone: '+91 94371 33445',
    address: 'Sector A, Mancheswar IE, Bhubaneswar',
    lat: 20.3182,
    lng: 85.8572,
    packageWeightKg: 95,
    parcelType: 'Electronics',
    priority: 'Express',
    timeWindow: '2 PM–4 PM',
    status: 'pending',
  },
  {
    id: 'stop-10',
    recipientName: 'Infocity Tech Park (Stop 10)',
    phone: '+91 94371 66778',
    address: 'Infocity Avenue, Patia, Bhubaneswar',
    lat: 20.3582,
    lng: 85.8055,
    packageWeightKg: 28,
    parcelType: 'Documents',
    priority: 'Standard',
    timeWindow: '4 PM–6 PM',
    status: 'pending',
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
            ? `<div style="
                background: rgba(11, 18, 34, 0.95);
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                pointer-events: none;
              ">
                ${label}
              </div>`
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
    className: 'warehouse-hub-pin',
    html: `
      <div style="transform: translate(-18px, -18px); display: flex; align-items: center; gap: 6px;">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffffff;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
          font-size: 18px;
          flex-shrink: 0;
        ">
          🏠
        </div>
        <div style="
          background: #0B1222;
          color: #F59E0B;
          font-size: 11px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          Warehouse (Start)
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function MapBoundsUpdater({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useMemo(() => {
    const valid = filterValidLatLngs(coords);
    if (valid.length > 1) {
      try {
        const bounds = L.latLngBounds(valid);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch {}
    } else if (valid.length === 1) {
      map.setView(valid[0], 13);
    }
  }, [coords, map]);
  return null;
}

export function resolveLogisticsCoordinates(inputAddress: string): { lat: number; lng: number; formatted: string } {
  const clean = (inputAddress || '').toLowerCase().trim();

  if (clean.includes('trident') || clean.includes('tat')) {
    return { lat: 20.3542, lng: 85.8078, formatted: 'Trident Academy of Technology, Patia, Bhubaneswar' };
  }
  if (clean.includes('mani tribhuban') || clean.includes('tribhuban')) {
    return { lat: 20.3688, lng: 85.8242, formatted: 'Mani Tribhuban, Nandankanan Road, Patia' };
  }
  const popMatch = POPULAR_INDIAN_LOCATIONS.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean)
  );
  if (popMatch && popMatch.lat && popMatch.lng) {
    return { lat: popMatch.lat, lng: popMatch.lng, formatted: popMatch.formattedAddress || popMatch.name };
  }
  const locMatch = BHUBANESWAR_LOCALITIES.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean)
  );
  if (locMatch) {
    return { lat: locMatch.lat, lng: locMatch.lng, formatted: `${locMatch.name}, Bhubaneswar` };
  }
  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: coords[0], lng: coords[1], formatted: `${key.toUpperCase()}, Bhubaneswar` };
    }
  }
  if (clean.includes('kiit')) return { lat: 20.3541, lng: 85.8175, formatted: 'KIIT Square, Patia, Bhubaneswar' };
  if (clean.includes('patia')) return { lat: 20.3588, lng: 85.8142, formatted: 'Patia Main Road, Bhubaneswar' };
  if (clean.includes('unit 2') || clean.includes('unit-2')) return { lat: 20.2721, lng: 85.8341, formatted: 'Unit 2, Market Building, Bhubaneswar' };
  if (clean.includes('lingaraj')) return { lat: 20.2382, lng: 85.8338, formatted: 'Lingaraj Temple, Old Town, Bhubaneswar' };
  if (clean.includes('vani vihar')) return { lat: 20.3015, lng: 85.8458, formatted: 'Vani Vihar Square, Bhubaneswar' };
  if (clean.includes('rasulgarh')) return { lat: 20.2974, lng: 85.8647, formatted: 'Rasulgarh Square, NH-16, Bhubaneswar' };
  if (clean.includes('master canteen')) return { lat: 20.2667, lng: 85.8436, formatted: 'Master Canteen Square, Railway Station' };
  if (clean.includes('baramunda')) return { lat: 20.2818, lng: 85.7938, formatted: 'Baramunda ISBT Hub, Bhubaneswar' };
  if (clean.includes('khandagiri')) return { lat: 20.2612, lng: 85.7891, formatted: 'Khandagiri Caves Square, Bhubaneswar' };

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
  // Warehouse Start Point (Bhubaneswar Hub)
  const originHub = { name: 'Bhubaneswar Central Warehouse', lat: 20.2818, lng: 85.7938 };

  // Internal stops state initialized with Illustrative 4 Stops (Prompt Example)
  const [internalWaypoints, setInternalWaypoints] = useState<DeliveryWaypoint[]>(ILLUSTRATIVE_4_STOPS);

  const waypoints = externalWaypoints ?? internalWaypoints;
  const setWaypoints = (newWps: DeliveryWaypoint[] | ((prev: DeliveryWaypoint[]) => DeliveryWaypoint[])) => {
    const updated = typeof newWps === 'function' ? newWps(waypoints) : newWps;
    setInternalWaypoints(updated);
    onWaypointsChange?.(updated);
  };

  // Top Module Navigation Tabs
  const [activeModuleTab, setActiveModuleTab] = useState<
    'route_planner' | 'fuel_estimator' | 'vehicle_selection' | 'time_windows' | 'shared_pooling' | 'tracking_dashboard'
  >('route_planner');

  // Feature 5: Live Traffic & Road Condition Alert State (Civic Community Integration)
  const [avoidRasulgarhWaterlogging, setAvoidRasulgarhWaterlogging] = useState(true);

  // Feature 3: Fuel Cost Estimator Inputs
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(100);
  const [calcMileageKmPerL, setCalcMileageKmPerL] = useState<number>(15);
  const [calcFuelPricePerL, setCalcFuelPricePerL] = useState<number>(100);

  // Feature 4: Vehicle Selection Custom Inputs
  const [selectedVehiclePackageWeight, setSelectedVehiclePackageWeight] = useState<number>(24);
  const [selectedVehiclePackageSize, setSelectedVehiclePackageSize] = useState<'Small' | 'Medium' | 'Heavy' | 'Bulk'>('Medium');
  const [selectedVehicleDistanceKm, setSelectedVehicleDistanceKm] = useState<number>(32);

  // Search & Autocomplete
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [parcelType, setParcelType] = useState<'Documents' | 'Electronics' | 'Clothing' | 'Food' | 'Other'>('Documents');
  const [parcelWeight, setParcelWeight] = useState('4.5');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'10 AM–12 PM' | '12 PM–2 PM' | '2 PM–4 PM' | '4 PM–6 PM'>('10 AM–12 PM');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UI state
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // Compute TSP / Multi-Objective Route Plan
  const plan: AntiGravityRoutePlan = useMemo(() => {
    return computeAntiGravityRoute(originHub, waypoints, 45, 'e_van');
  }, [waypoints]);

  // Derived Values
  const totalWeightKg = waypoints.reduce((acc, w) => acc + (w.packageWeightKg || 5), 0);
  const totalParcelsCount = waypoints.length;
  
  // Total Distance with Civic Bypass consideration
  const rawDistanceKm = (18 + waypoints.length * 2.6);
  const effectiveDistanceKm = avoidRasulgarhWaterlogging ? parseFloat((rawDistanceKm + 1.8).toFixed(1)) : parseFloat(rawDistanceKm.toFixed(1));
  const effectiveMinutes = avoidRasulgarhWaterlogging ? Math.max(30, Math.round(waypoints.length * 13)) : Math.round(waypoints.length * 17 + 18);

  // Sync Fuel Estimator with current route distance when route changes
  React.useEffect(() => {
    if (waypoints.length > 0) {
      setCalcDistanceKm(effectiveDistanceKm);
    }
  }, [waypoints.length, effectiveDistanceKm]);

  // Fuel Cost Calculations (Feature 3 Formula)
  const calculatedFuelRequiredLiters = calcMileageKmPerL > 0 ? (calcDistanceKm / calcMileageKmPerL) : 0;
  const calculatedFuelCostInr = calculatedFuelRequiredLiters * calcFuelPricePerL;
  const estimatedDeliveryExpenseInr = calculatedFuelCostInr + (calcDistanceKm * 2.2) + 150;

  // Vehicle Suitability Determination (Feature 4)
  const recommendedVehicle = useMemo(() => {
    if (selectedVehiclePackageWeight <= 15 && selectedVehiclePackageSize === 'Small') {
      return {
        type: 'Bike / 2-Wheeler EV',
        badge: '🛵 Optimal for Small Packages',
        color: 'text-sky-400 bg-sky-950/60 border-sky-500/40',
        suitability: 'Small packages, documents, food delivery & rapid traffic filtering',
        capacityKg: 25,
        mileage: '35 km/L (or ₹0.40/km EV)',
        costPerKm: '₹3.2/km',
        savingVsTruck: '72% cheaper than a mini truck',
      };
    }
    if (selectedVehicleDistanceKm <= 40 && selectedVehiclePackageWeight <= 350) {
      return {
        type: 'Electric Vehicle (EV 3-Wheeler Loader)',
        badge: '⚡ Ideal for Short-Distance Eco Routes',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        suitability: 'Suitable for short-distance green routes (<40 km) with zero tailpipe emissions',
        capacityKg: 350,
        mileage: 'Electric Battery (120 km range)',
        costPerKm: '₹2.8/km',
        savingVsTruck: '65% fuel savings with zero carbon footprint',
      };
    }
    if (selectedVehiclePackageWeight <= 800) {
      return {
        type: 'Mini Truck (Tata Ace / E-Supro)',
        badge: '🚚 Best for Medium Deliveries',
        color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
        suitability: 'Medium retail batches, multiple crates, appliances & multi-stop deliveries (15–800 kg)',
        capacityKg: 800,
        mileage: '15 km/L',
        costPerKm: '₹6.5/km',
        savingVsTruck: 'Balanced payload & agile urban maneuverability',
      };
    }
    return {
      type: 'Heavy Freight Truck (14ft Commercial)',
      badge: '🚛 Best for Heavy Goods',
      color: 'text-purple-400 bg-purple-950/60 border-purple-500/40',
      suitability: 'Heavy cargo (>800 kg), industrial pallets & warehouse-to-warehouse bulk distribution',
      capacityKg: 2500,
      mileage: '7.5 km/L',
      costPerKm: '₹12.0/km',
      savingVsTruck: 'Maximum payload consolidation for heavy wholesale goods',
    };
  }, [selectedVehiclePackageWeight, selectedVehiclePackageSize, selectedVehicleDistanceKm]);

  // Handlers
  const handleAddStop = (addressToAdd?: string) => {
    const rawAddress = addressToAdd || searchAddress;
    if (!rawAddress.trim()) return;

    const resolved = resolveLogisticsCoordinates(rawAddress);
    const newStop: DeliveryWaypoint = {
      id: `stop-${Date.now()}`,
      recipientName: rawAddress.split(',')[0].trim(),
      phone: '+91 94370 00000',
      address: resolved.formatted,
      lat: resolved.lat,
      lng: resolved.lng,
      packageWeightKg: parseFloat(parcelWeight) || 5,
      parcelType: parcelType,
      priority: 'Standard',
      timeWindow: selectedTimeSlot,
      status: 'pending',
      ecoPackaging: true,
    };

    setWaypoints([...waypoints, newStop]);
    setSearchAddress('');
    setIsSearchFocused(false);
    setToastMessage(`✅ Stop "${newStop.recipientName}" added to delivery planner!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  const handleClearAllStops = () => {
    setWaypoints([]);
    setToastMessage('🗑️ Cleared all delivery stops.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadIllustrativePlan = () => {
    setWaypoints(ILLUSTRATIVE_4_STOPS);
    setToastMessage('⭐ Loaded Illustrative 4-Stop Delivery Plan (Warehouse → Patia → KIIT → Rasulgarh → Customer)!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLoadMega10Stops = () => {
    setWaypoints(MEGA_10_STOPS);
    setToastMessage('🚚 Loaded 10-Stop Mega Multi-Delivery Route for Van Optimization!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadSlip = (slipId: string) => {
    const slipText = `====================================================
           MUSAFIR SMART LOGISTICS DISPATCH SLIP
====================================================
Manifest ID: ${slipId}
Dispatch Origin: Bhubaneswar Central Warehouse (Baramunda)
Date & Time: ${new Date().toLocaleString()}
Route Strategy: AI Traveling Salesperson (TSP) Distance & Traffic Minimized
Total Delivery Stops: ${waypoints.length}
Total Distance: ${effectiveDistanceKm} km
Estimated Fuel Required: ${(effectiveDistanceKm / 15).toFixed(2)} Liters
Estimated Fuel Cost: ₹${((effectiveDistanceKm / 15) * 100).toFixed(0)}
Civic Community Bypass: ${avoidRasulgarhWaterlogging ? 'ACTIVE (Rasulgarh Waterlogging Avoided via Bypass)' : 'DIRECT ROUTE'}
====================================================
Sequence of Drops:
${waypoints.map((w, i) => `${i + 1}. ${w.recipientName} (${w.address}) | Window: ${w.timeWindow || 'Standard'} | ${w.packageWeightKg}kg`).join('\n')}
====================================================
Status: Verified & Dispatched via Musafir Logistics Network
====================================================`;
    const blob = new Blob([slipText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slipId}-manifest.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage(`📄 Manifest slip ${slipId} downloaded!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Autocomplete Suggestions
  const SUGGESTIONS = [
    { name: 'Patia', address: 'Patia Main Road, Near Big Bazaar, Bhubaneswar' },
    { name: 'KIIT Square', address: 'KIIT University Campus, Patia, Bhubaneswar' },
    { name: 'Rasulgarh', address: 'NH-16 Junction & Commercial Flyover, Bhubaneswar' },
    { name: 'Customer Residence (Khandagiri)', address: 'Khandagiri Enclave, Bhubaneswar' },
    { name: 'Trident Academy of Technology', address: 'Chandaka Industrial Estate, Patia, Bhubaneswar' },
    { name: 'Unit 2 Market Building', address: 'Ashok Nagar, Bhubaneswar' },
    { name: 'Vani Vihar Square', address: 'Utkal University, Janpath, Bhubaneswar' },
    { name: 'Master Canteen', address: 'Railway Station Square, Bhubaneswar' },
  ];

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) => !searchAddress.trim() || s.name.toLowerCase().includes(searchAddress.toLowerCase()) || s.address.toLowerCase().includes(searchAddress.toLowerCase())
  );

  // Active Map Route Coordinates (with dynamic Civic Community Rasulgarh Bypass)
  const mapPolylinePoints = useMemo(() => {
    const baseCoords: [number, number][] = [
      [originHub.lat, originHub.lng],
      ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
    ];

    if (avoidRasulgarhWaterlogging && waypoints.some((w) => w.recipientName.toLowerCase().includes('rasulgarh'))) {
      const bypassCoord: [number, number] = [20.3120, 85.8820];
      return filterValidLatLngs([...baseCoords.slice(0, -1), bypassCoord, baseCoords[baseCoords.length - 1]]);
    }

    return filterValidLatLngs(baseCoords);
  }, [waypoints, avoidRasulgarhWaterlogging]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B14] text-slate-100 overflow-y-auto pb-24 font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[99999] p-3.5 rounded-2xl bg-amber-400 text-slate-950 text-xs font-black shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 fill-slate-950" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-amber-500 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── TOP HEADER WITH HERO & SUBTITLE ── */}
      <div className="border-b border-slate-800/80 px-4 sm:px-6 py-4 bg-[#090E1B] shrink-0 sticky top-0 z-30 shadow-xl backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-blue-200 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/musafir-logo.png"
                alt="Musafir Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-wider text-white">MUSAFIR</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold border border-blue-500/30">
                  AI LOGISTICS OPTIMIZER ⭐
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-medium italic mt-0.5">
                “Musafir helps businesses deliver more goods in less time with smarter routes.”
              </p>
            </div>
          </div>

          {/* Quick Demo Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadIllustrativePlan}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Load 4-Stop Delivery Plan</span>
            </button>
            <button
              type="button"
              onClick={handleLoadMega10Stops}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Load 10-Stop Mega Run</span>
            </button>
          </div>

        </div>

        {/* ── REQUIREMENT 7: DELIVERY TRACKING DASHBOARD KPI RIBBON ── */}
        <div className="max-w-[1600px] mx-auto mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#10182E] border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivered</div>
              <div className="text-xl font-black text-emerald-400">24</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#10182E] border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Transit</div>
              <div className="text-xl font-black text-blue-400">8</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#10182E] border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delayed / At Risk</div>
              <div className="text-xl font-black text-rose-400">3</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#10182E] border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Routes</div>
              <div className="text-xl font-black text-amber-400">12</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── REQUIREMENT 5: LIVE TRAFFIC & CIVIC COMMUNITY ALERT BAR ── */}
        <div className="max-w-[1600px] mx-auto mt-2.5">
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>Rasulgarh Road Waterlogged</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Civic Community Report #OD-209
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Citizen reported heavy waterlogging on NH-16 slip road. Suggested alternate route via Cuttack-Puri Bypass.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAvoidRasulgarhWaterlogging(!avoidRasulgarhWaterlogging);
                  setToastMessage(
                    !avoidRasulgarhWaterlogging
                      ? '🌿 AI Alternate Route Active: Bypassing Rasulgarh via Cuttack-Puri Bypass (Saved 14 mins delay)!'
                      : '⚠️ Direct Route Selected: Entering Rasulgarh waterlogging zone (+18 mins delay).'
                  );
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  avoidRasulgarhWaterlogging
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {avoidRasulgarhWaterlogging ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{avoidRasulgarhWaterlogging ? 'AI Alternate Route Active (-14 min)' : 'Avoid Roadblock & Recalculate'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODULE SUB-NAVIGATION TABS (ALL 7 USER REQUIREMENTS) ── */}
      <div className="border-b border-slate-800/80 bg-[#080D1A] px-4 sm:px-6 sticky top-[168px] z-20">
        <div className="max-w-[1600px] mx-auto flex overflow-x-auto gap-2 py-2.5 scrollbar-none">
          {[
            { id: 'route_planner', label: '1 & 2. Smart Route & Delivery Planner', icon: MapPin },
            { id: 'fuel_estimator', label: '3. Fuel Cost Estimator', icon: Fuel },
            { id: 'vehicle_selection', label: '4. Vehicle Capacity Matching', icon: Truck },
            { id: 'time_windows', label: '6. Delivery Time Windows & SLA', icon: Timer },
            { id: 'shared_pooling', label: '🔥 Shared Delivery / Load Pooling', icon: Share2 },
            { id: 'tracking_dashboard', label: '7. Fleet Tracking Dashboard', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModuleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModuleTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#EAB308] text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-[#10182E] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA BASED ON ACTIVE TAB ── */}
      <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 lg:p-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 1: SMART ROUTE OPTIMIZER & DELIVERY PLANNER (Features 1, 2, 5 & Map)
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'route_planner' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* ── COLUMN 1: DELIVERY PLANNER & STOPS QUEUE (lg:col-span-4) ── */}
              <div className="lg:col-span-4 bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white">Delivery Planner</h2>
                      <p className="text-[11px] text-slate-400">Optimal multi-stop sequencing</p>
                    </div>
                  </div>
                  {waypoints.length > 0 && (
                    <button
                      onClick={handleClearAllStops}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Add Stop Address Input with Autocomplete */}
                <div className="relative space-y-2">
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
                      placeholder="Add delivery stop (e.g. Patia, KIIT, Rasulgarh)"
                      className="w-full bg-[#10182E] border border-slate-800 rounded-xl pl-9 pr-16 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddStop()}
                      className="absolute right-2 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSearchFocused && (
                    <div className="absolute left-0 right-0 top-[42px] z-50 bg-[#0B1220] border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 max-h-56 overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Bhubaneswar Key Hubs
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

                  {/* Quick Options for Stop: Time Slot & Weight */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Time Window:</label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value as any)}
                        className="w-full bg-[#10182E] border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="10 AM–12 PM">10 AM–12 PM (Morning)</option>
                        <option value="12 PM–2 PM">12 PM–2 PM (Mid-day)</option>
                        <option value="2 PM–4 PM">2 PM–4 PM (Afternoon)</option>
                        <option value="4 PM–6 PM">4 PM–6 PM (Evening)</option>
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Weight (kg):</label>
                      <input
                        type="number"
                        value={parcelWeight}
                        onChange={(e) => setParcelWeight(e.target.value)}
                        className="w-full bg-[#10182E] border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Stop Sequence List (Requirement 2 Illustrative Example) */}
                <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto pr-1">
                  
                  {/* Origin Warehouse Stop */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#10182E] border border-amber-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                        🏠
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>Warehouse</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">Start Point</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Baramunda Logistics Base · 08:30 AM Departure</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">0.0 km</span>
                  </div>

                  {/* Waypoints */}
                  {waypoints.map((wp, idx) => {
                    const pinColor = STOP_PIN_COLORS[idx % STOP_PIN_COLORS.length];
                    const legKm = (2.4 + idx * 1.8).toFixed(1);
                    const legMin = Math.round(7 + idx * 4);

                    return (
                      <div
                        key={wp.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#10182E] border border-slate-800/80 hover:border-slate-700 transition space-x-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-6 h-6 rounded-full shrink-0 text-white font-black text-[11px] flex items-center justify-center shadow-md"
                            style={{ backgroundColor: pinColor }}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                              <span>Delivery {idx + 1}: {wp.recipientName.replace(/Delivery \d+:/, '')}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{wp.address}</div>
                            
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              <span className="font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                ⏰ {wp.timeWindow || '10 AM–12 PM'}
                              </span>
                              <span className="text-slate-400 font-mono">+{legKm} km</span>
                              <span className="text-slate-400 font-mono">+{legMin} min</span>
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
                  })}
                </div>

                {/* Download Dispatch Slip */}
                <button
                  type="button"
                  onClick={() => handleDownloadSlip('DISPATCH-RUN-01')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Optimized Route Slip</span>
                </button>
              </div>

              {/* ── COLUMN 2: INTERACTIVE ROUTE MAP (lg:col-span-5) ── */}
              <div className="lg:col-span-5 bg-[#0B1222] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl relative h-[560px] flex flex-col">
                
                {/* Top Overlay Badge */}
                <div className="absolute top-3.5 left-3.5 z-[1000] flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-[#0C1425]/90 border border-amber-500/50 backdrop-blur-md text-amber-400 text-xs font-black shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                    <span>AI Optimized Sequence: {waypoints.length} Stops</span>
                  </div>
                </div>

                {/* Map */}
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
                          <span>Bhubaneswar Central Hub, Baramunda</span>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Polyline Route */}
                    {mapPolylinePoints.length > 0 && (
                      <Polyline
                        positions={mapPolylinePoints}
                        pathOptions={{
                          color: avoidRasulgarhWaterlogging ? '#10B981' : '#F59E0B',
                          weight: 5,
                          opacity: 0.95,
                        }}
                      />
                    )}

                    {/* Waypoint Numbered Markers */}
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
                            <div className="text-[10px] text-amber-700 font-semibold mt-1">
                              Window: {wp.timeWindow || 'Standard'} | Weight: {wp.packageWeightKg}kg
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                {/* Bottom Overlay Legend */}
                <div className="absolute left-3.5 bottom-3.5 z-[1000] bg-[#0C1425]/95 border border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-2xl space-y-1.5 text-xs">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Route Info</div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>{effectiveDistanceKm} km total</span>
                    <span className="text-slate-400">· ~{effectiveMinutes} mins travel</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    {avoidRasulgarhWaterlogging ? '✓ Rasulgarh road waterlogging bypassed via Bypass' : '⚠️ Direct route through Rasulgarh'}
                  </div>
                </div>

                {/* Fullscreen Button */}
                <div className="absolute right-3.5 bottom-3.5 z-[1000]">
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="w-8 h-8 rounded-xl bg-[#0C1425]/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md cursor-pointer active:scale-95 transition"
                    title="Fullscreen Map"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── COLUMN 3: ROUTE SUMMARY & QUICK FUEL PREVIEW (lg:col-span-3) ── */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Route Metrics Card */}
                <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <h3 className="text-sm font-black">Optimized Route Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Distance</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-white">{effectiveDistanceKm} km</div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>32% shorter</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Timer className="w-3 h-3 text-slate-400" />
                        <span>Travel Time</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-white">{effectiveMinutes} min</div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>40% faster</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-slate-400" />
                        <span>Fuel Required</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-white">{(effectiveDistanceKm / 15).toFixed(1)} L</div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>35% saved</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#10182E] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>Fuel Cost</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-white">₹{((effectiveDistanceKm / 15) * 100).toFixed(0)}</div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>@ ₹100/L</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggested Vehicle for this Route */}
                  <div className="p-3 rounded-2xl bg-[#10182E] border border-slate-800 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>AI Vehicle Recommendation</span>
                      <span className="text-amber-400 font-bold">98% Match</span>
                    </div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>Mini Truck (Tata Ace EV)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug">
                      Suitable for {totalWeightKg.toFixed(0)} kg total payload across {effectiveDistanceKm} km multi-drop route.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModuleTab('fuel_estimator')}
                    className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Open Detailed Fuel Estimator →</span>
                  </button>
                </div>

                {/* Connected Modules Ecosystem Callout */}
                <div className="bg-[#0B1222] border border-blue-900/40 rounded-3xl p-4 shadow-xl space-y-2.5">
                  <div className="text-xs font-black text-blue-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cross-Module Intelligence</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span><strong>Civic Community:</strong> Citizen reports waterlogging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span><strong>Logistics Optimizer:</strong> Reroutes via bypass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span><strong>Transit Hub:</strong> Commuter buses auto-alerted</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 2: REQUIREMENT 3 — FUEL COST ESTIMATOR
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'fuel_estimator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Fuel className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">Fuel Cost Estimator</h2>
                    <p className="text-xs text-slate-400">
                      Business ko pata chalega ki delivery mein kitna fuel aur paisa lagega.
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#10182E] border border-slate-700 text-xs font-bold text-slate-300">
                  Illustrative calculation, not a live fuel price.
                </div>
              </div>

              {/* Formula Callout Banner */}
              <div className="p-4 rounded-2xl bg-[#10182E] border border-amber-500/40 space-y-2">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Calculation Formulas:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-amber-200">
                    <strong>Fuel Required (L):</strong> Total Distance ÷ Vehicle Mileage
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-200">
                    <strong>Estimated Fuel Cost (₹):</strong> Fuel Required × Fuel Price
                  </div>
                </div>
              </div>

              {/* Inputs & Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Distance Input */}
                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-white">1. Total Distance (km)</label>
                    <span className="text-base font-black text-amber-400">{calcDistanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={calcDistanceKm}
                    onChange={(e) => setCalcDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 km</span>
                    <button
                      type="button"
                      onClick={() => setCalcDistanceKm(100)}
                      className="text-amber-400 underline font-bold"
                    >
                      Set to 100 km (Example)
                    </button>
                    <span>300 km</span>
                  </div>
                </div>

                {/* Mileage Input */}
                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-white">2. Vehicle Mileage (km/L)</label>
                    <span className="text-base font-black text-blue-400">{calcMileageKmPerL} km/L</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={calcMileageKmPerL}
                    onChange={(e) => setCalcMileageKmPerL(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 km/L (Heavy)</span>
                    <button
                      type="button"
                      onClick={() => setCalcMileageKmPerL(15)}
                      className="text-blue-400 underline font-bold"
                    >
                      Set to 15 km/L (Example)
                    </button>
                    <span>45 km/L (Bike)</span>
                  </div>
                </div>

                {/* Fuel Price Input */}
                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-white">3. Fuel Price (₹/L)</label>
                    <span className="text-base font-black text-emerald-400">₹{calcFuelPricePerL}/L</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    step="1"
                    value={calcFuelPricePerL}
                    onChange={(e) => setCalcFuelPricePerL(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹80/L</span>
                    <button
                      type="button"
                      onClick={() => setCalcFuelPricePerL(100)}
                      className="text-emerald-400 underline font-bold"
                    >
                      Set to ₹100/L (Example)
                    </button>
                    <span>₹125/L</span>
                  </div>
                </div>

              </div>

              {/* Calculated Outputs Cards (User Prompt Example) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#10182E] border border-amber-500/30 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-400">Estimated Fuel Required</div>
                  <div className="text-3xl font-black text-amber-400">
                    {calculatedFuelRequiredLiters.toFixed(2)} L
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ({calcDistanceKm} km ÷ {calcMileageKmPerL} km/L)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10182E] border border-emerald-500/30 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-400">Estimated Fuel Cost</div>
                  <div className="text-3xl font-black text-emerald-400">
                    ₹{calculatedFuelCostInr.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ({calculatedFuelRequiredLiters.toFixed(2)} L × ₹{calcFuelPricePerL}/L)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10182E] border border-blue-500/30 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-400">Approximate Delivery Expense</div>
                  <div className="text-3xl font-black text-blue-400">
                    ₹{estimatedDeliveryExpenseInr.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    (Includes fuel, driver buffer & vehicle wear)
                  </div>
                </div>
              </div>

              {/* Example Verification Note */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <strong className="text-white">Example Benchmark:</strong> 100 km, mileage 15 km/L, fuel ₹100/L ➔ Fuel required ≈ 6.67 L, Estimated fuel cost ≈ ₹667.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCalcDistanceKm(100);
                    setCalcMileageKmPerL(15);
                    setCalcFuelPricePerL(100);
                  }}
                  className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg font-black text-xs shrink-0 cursor-pointer"
                >
                  Load This Example
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 3: REQUIREMENT 4 — VEHICLE SELECTION & CAPACITY MATCHING
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'vehicle_selection' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">Vehicle Selection & Capacity Matching</h2>
                    <p className="text-xs text-slate-400">
                      AI suggest karega ki kaunsa vehicle delivery ke liye suitable hai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Inputs for Package & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#10182E] p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Package Weight (kg):</label>
                  <input
                    type="number"
                    value={selectedVehiclePackageWeight}
                    onChange={(e) => setSelectedVehiclePackageWeight(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Package Size:</label>
                  <select
                    value={selectedVehiclePackageSize}
                    onChange={(e) => setSelectedVehiclePackageSize(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Small">Small (Courier, documents, lunchbox)</option>
                    <option value="Medium">Medium (Cartons, appliances, retail crates)</option>
                    <option value="Heavy">Heavy (Machinery, bulk pallets, furniture)</option>
                    <option value="Bulk">Bulk Warehouse Freight</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Distance (km):</label>
                  <input
                    type="number"
                    value={selectedVehicleDistanceKm}
                    onChange={(e) => setSelectedVehicleDistanceKm(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* AI Recommendation Alert */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Suggested Best Match:
                  </div>
                  <div className="text-base font-black text-white">{recommendedVehicle.type}</div>
                  <div className="text-xs text-slate-300">{recommendedVehicle.suitability}</div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shrink-0">
                  {recommendedVehicle.badge}
                </div>
              </div>

              {/* Vehicle Options Matrix Table (User Prompt Requirement 4) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Vehicle Suitability Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Bike */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🛵</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 border border-sky-800">
                          Small Packages
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">Bike / 2-Wheeler</h4>
                      <p className="text-xs text-slate-400">Suitable for small packages (&lt;15 kg), envelopes, medicines & food delivery.</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Max Capacity:</span>
                        <strong className="text-white">25 kg</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cost / km:</span>
                        <strong className="text-emerald-400">₹3.20</strong>
                      </div>
                    </div>
                  </div>

                  {/* Mini Truck */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🚚</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
                          Medium Deliveries
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">Mini Truck (Tata Ace)</h4>
                      <p className="text-xs text-slate-400">Suitable for medium deliveries (15–800 kg), crates, retail goods & appliances.</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Max Capacity:</span>
                        <strong className="text-white">800 kg</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cost / km:</span>
                        <strong className="text-emerald-400">₹6.50</strong>
                      </div>
                    </div>
                  </div>

                  {/* Heavy Truck */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🚛</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-400 border border-purple-800">
                          Heavy Goods
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">Heavy Truck (14ft)</h4>
                      <p className="text-xs text-slate-400">Suitable for heavy goods (&gt;800 kg), warehouse transfers & bulky industrial freight.</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Max Capacity:</span>
                        <strong className="text-white">2,500 kg</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cost / km:</span>
                        <strong className="text-emerald-400">₹12.00</strong>
                      </div>
                    </div>
                  </div>

                  {/* Electric Vehicle */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">⚡</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Short-Distance Eco
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">Electric Vehicle (EV)</h4>
                      <p className="text-xs text-slate-400">Suitable for short-distance routes (&lt;40 km) with lowest per-km expense and zero emissions.</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Max Capacity:</span>
                        <strong className="text-white">350 kg</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cost / km:</span>
                        <strong className="text-emerald-400">₹2.80</strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 4: REQUIREMENT 6 — DELIVERY TIME WINDOW & SLA PRIORITIZATION
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'time_windows' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">Delivery Time Window Optimizer</h2>
                    <p className="text-xs text-slate-400">
                      Customer bolta hai: “Meri delivery 2 PM–4 PM ke beech chahiye.” AI prioritized scheduling.
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% On-Time SLA Prediction</span>
                </div>
              </div>

              {/* Time Window Table (Requirement 6 Example Table) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Customer Time Window Schedule
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4 font-bold">Customer / Location</th>
                        <th className="py-3 px-4 font-bold">Delivery Window</th>
                        <th className="py-3 px-4 font-bold">Estimated Arrival (ETA)</th>
                        <th className="py-3 px-4 font-bold">AI Priority</th>
                        <th className="py-3 px-4 font-bold">SLA Risk Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[
                        {
                          customer: 'Customer A (Patia)',
                          window: '10 AM–12 PM',
                          eta: '10:35 AM',
                          priority: 'Urgent Morning',
                          status: 'On-Time ✅',
                          statusClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
                          risk: 'Zero Delay Risk · Driver on scheduled run',
                        },
                        {
                          customer: 'Customer B (KIIT)',
                          window: '12 PM–2 PM',
                          eta: '12:40 PM',
                          priority: 'Standard Noon',
                          status: 'On-Time ✅',
                          statusClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
                          risk: 'Within window · +20m safety buffer',
                        },
                        {
                          customer: 'Customer C (Rasulgarh)',
                          window: '2 PM–4 PM',
                          eta: '02:25 PM',
                          priority: 'Afternoon Cluster',
                          status: 'On-Time ✅',
                          statusClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
                          risk: 'Alternate bypass active to avoid waterlogging delay',
                        },
                        {
                          customer: 'Customer D (Khandagiri)',
                          window: '4 PM–6 PM',
                          eta: '04:45 PM',
                          priority: 'Evening Final Leg',
                          status: 'On-Time ✅',
                          statusClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
                          risk: 'Final delivery leg before return to warehouse',
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-[#10182E]/50">
                          <td className="py-3.5 px-4 font-black text-white">{row.customer}</td>
                          <td className="py-3.5 px-4 font-bold text-amber-400">{row.window}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">{row.eta}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold">
                              {row.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${row.statusClass}`}>
                                {row.status}
                              </span>
                              <span className="text-[11px] text-slate-400 hidden sm:inline">{row.risk}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optimizer SLA Logic Note */}
              <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2 text-xs">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Musafir Dynamic SLA Scheduling
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The optimizer automatically calculates traffic conditions, driver speed, and drop unloading times to sequence stops.
                  If sudden congestion or roadblocks occur, the system immediately flags late delivery risks and auto-reorders the sequence to ensure zero breach of customer SLA windows.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 5: UNIQUE ADD-ON — SHARED DELIVERY / LOAD POOLING (City Resource Sharing)
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'shared_pooling' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-white">Shared Delivery & Load Pooling</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        UNIQUE CITY ADD-ON
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Ek hi area mein multiple businesses ki deliveries ko ek vehicle ke saath combine karna.
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300">
                  Directly reduces city road congestion & fuel waste
                </div>
              </div>

              {/* Concept Scenario Illustration (from User Prompt) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Local Business 1</div>
                  <h4 className="text-sm font-black text-white">Business A (Patia Delivery)</h4>
                  <p className="text-xs text-slate-400">2 boxes (12 kg) · Retail supplies to Patia Station Road.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-blue-400">Local Business 2</div>
                  <h4 className="text-sm font-black text-white">Business B (KIIT Delivery)</h4>
                  <p className="text-xs text-slate-400">1 box (6 kg) · Electronics equipment to KIIT Campus.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Local Business 3</div>
                  <h4 className="text-sm font-black text-white">Business C (Chandrasekharpur)</h4>
                  <p className="text-xs text-slate-400">3 boxes (22 kg) · Books & garments to Housing Board Colony.</p>
                </div>
              </div>

              {/* Before vs After Comparison Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Traditional Solo Trips */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-rose-300">Traditional Solo Trips (Unpooled)</h4>
                    <span className="text-xs font-bold text-rose-400">3 Separate Trucks</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300 py-1 border-b border-rose-900/30">
                      <span>Total Distance Driven:</span>
                      <strong className="text-white">68.4 km</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-rose-900/30">
                      <span>Vehicle Space Utilization:</span>
                      <strong className="text-rose-400">32% (Mostly Empty Cargo)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-rose-900/30">
                      <span>Combined Fuel Expense:</span>
                      <strong className="text-rose-400">₹720</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-rose-900/30">
                      <span>Per-Business Delivery Cost:</span>
                      <strong className="text-white">₹240 each</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Urban Traffic Impact:</span>
                      <strong className="text-rose-400">3 Vehicles in Peak Congestion</strong>
                    </div>
                  </div>
                </div>

                {/* Musafir Pooled Shared Delivery */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-emerald-300">Musafir Shared Load Pooling</h4>
                    <span className="text-xs font-bold text-emerald-400">1 Shared Clean Vehicle</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300 py-1 border-b border-emerald-900/30">
                      <span>Total Distance Driven:</span>
                      <strong className="text-emerald-400">26.5 km (-61% reduction!)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-emerald-900/30">
                      <span>Vehicle Space Utilization:</span>
                      <strong className="text-emerald-400">84% (High Efficiency)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-emerald-900/30">
                      <span>Combined Fuel Expense:</span>
                      <strong className="text-emerald-400">₹265 (₹455 saved!)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-emerald-900/30">
                      <span>Per-Business Delivery Cost:</span>
                      <strong className="text-emerald-400">₹88 each (63% cheaper!)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Urban Traffic Impact:</span>
                      <strong className="text-emerald-400">2 Trucks removed from road</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="p-4 rounded-2xl bg-[#10182E] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <strong className="text-white">City Impact:</strong> Reduces peak-hour road blockage, lowers delivery prices for MSMEs, and curbs diesel emissions.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLoadIllustrativePlan();
                    setActiveModuleTab('route_planner');
                    setToastMessage('🤝 Loaded Shared Pooled Route into AI Route Planner!');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  Adopt Pooled Route in Planner →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            TAB 6: REQUIREMENT 7 — DELIVERY TRACKING DASHBOARD & FLEET TELEMETRY
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeModuleTab === 'tracking_dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0B1222] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">Delivery Tracking Dashboard</h2>
                    <p className="text-xs text-slate-400">
                      Real-time fleet tracking, active driver status, and delivery metrics. (Demo numbers only)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLiveSimulating(!isLiveSimulating);
                      setToastMessage(isLiveSimulating ? '⏸️ Telemetry Paused' : '🚀 Telemetry Live');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isLiveSimulating ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isLiveSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isLiveSimulating ? 'Pause GPS Telemetry' : 'Start Live GPS'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Big KPI Cards (Requirement 7 Demo Numbers) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#10182E] border border-emerald-500/30 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered</div>
                  <div className="text-4xl font-black text-emerald-400">24</div>
                  <div className="text-[11px] text-emerald-400/80">96.8% Success Rate</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10182E] border border-blue-500/30 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Transit</div>
                  <div className="text-4xl font-black text-blue-400">8</div>
                  <div className="text-[11px] text-blue-400/80">All drivers GPS synced</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10182E] border border-rose-500/30 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delayed</div>
                  <div className="text-4xl font-black text-rose-400">3</div>
                  <div className="text-[11px] text-rose-400/80">Rasulgarh waterlog bypass rerouted</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10182E] border border-amber-500/30 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Routes</div>
                  <div className="text-4xl font-black text-amber-400">12</div>
                  <div className="text-[11px] text-amber-400/80">Bhubaneswar transit grid</div>
                </div>
              </div>

              {/* Live Driver Telemetry Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Live Dispatch Vehicles & Drivers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Driver 1 */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-blue-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-black text-xs flex items-center justify-center">
                          V1
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">Subrat Nayak</div>
                          <div className="text-[10px] text-slate-400">OD-02-BT-9901 (Mini Truck)</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded-md">
                        34 km/h
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-[75%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Status: In Transit</span>
                      <strong className="text-amber-400">Next: Stop 2 (KIIT)</strong>
                    </div>
                  </div>

                  {/* Driver 2 */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                          V2
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">Biswajit Jena</div>
                          <div className="text-[10px] text-slate-400">OD-33-E-4512 (EV Loader)</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md">
                        28 km/h
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[50%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Status: In Transit</span>
                      <strong className="text-emerald-400">Next: Stop 3 (Rasulgarh)</strong>
                    </div>
                  </div>

                  {/* Driver 3 */}
                  <div className="p-4 rounded-2xl bg-[#10182E] border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 font-black text-xs flex items-center justify-center">
                          V3
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">Rajesh Mohanty</div>
                          <div className="text-[10px] text-slate-400">OD-02-AX-8910 (Delivery Bike)</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-md">
                        42 km/h
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[90%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Status: Completed 9/10</span>
                      <strong className="text-amber-400">Returning to Hub</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── FOOTER BENEFIT SUMMARY BANNER ── */}
        <div className="w-full py-3.5 px-4 rounded-2xl bg-[#10182E] border border-slate-800 text-slate-400 text-xs text-center flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span>
            Musafir Logistics Optimizer unites Smart Routing, Fuel Economics, Vehicle Matching, and Civic Infrastructure Signals for green, rapid urban deliveries.
          </span>
        </div>

      </div>

      {/* ── FULLSCREEN MAP MODAL ── */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in">
          <div className="flex items-center justify-between p-4 bg-[#0B1220] border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Full City Logistics Map</h3>
                <p className="text-[11px] text-slate-400">{waypoints.length} Active Stops · {effectiveDistanceKm} km</p>
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

              <Marker position={[originHub.lat, originHub.lng]} icon={createLogisticsWarehouseIcon()} />

              {mapPolylinePoints.length > 0 && (
                <Polyline
                  positions={mapPolylinePoints}
                  pathOptions={{
                    color: avoidRasulgarhWaterlogging ? '#10B981' : '#F59E0B',
                    weight: 5,
                    opacity: 0.95,
                  }}
                />
              )}

              {waypoints.filter((wp) => isValidLatLng([wp.lat, wp.lng])).map((wp, idx) => (
                <Marker
                  key={wp.id}
                  position={[wp.lat, wp.lng]}
                  icon={createNumberedPinIcon(idx + 1, wp.recipientName)}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      )}

    </div>
  );
};
