import React, { useState } from 'react';
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
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  SAMPLE_DELIVERY_STOPS,
  RESTRICTED_NO_FLY_ZONES,
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';
import { PaymentVerificationResult } from '../../services/paymentService';

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

const createLogisticsStopIcon = (num: number, isLast: boolean) => {
  return L.divIcon({
    className: 'logistics-stop-pin',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${isLast ? '#ef4444' : '#10b981'};
        color: #ffffff;
        font-weight: 900;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      ">
        ${num}
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
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #2563eb;
        color: #ffffff;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(37,99,235,0.7);
      ">
        🏭
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const MapBoundsUpdater: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  React.useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15, animate: true });
    }
  }, [coords, map]);
  return null;
};

export function resolveLogisticsCoordinates(inputAddress: string): { lat: number; lng: number; formatted: string } {
  const clean = (inputAddress || '').toLowerCase().trim();

  // 1. Exact match for Mani Tribhuban / Mani Tribhuvan / Manitri bhuban
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

  // 2. Search POPULAR_INDIAN_LOCATIONS
  const popMatch = POPULAR_INDIAN_LOCATIONS.find((loc) =>
    clean.includes(loc.name.toLowerCase()) ||
    loc.name.toLowerCase().includes(clean) ||
    loc.formattedAddress.toLowerCase().includes(clean)
  );
  if (popMatch && popMatch.lat && popMatch.lng) {
    return { lat: popMatch.lat, lng: popMatch.lng, formatted: popMatch.formattedAddress || popMatch.name };
  }

  // 3. Search BHUBANESWAR_LOCALITIES
  const locMatch = BHUBANESWAR_LOCALITIES.find((loc) =>
    clean.includes(loc.name.toLowerCase()) ||
    loc.name.toLowerCase().includes(clean)
  );
  if (locMatch) {
    return { lat: locMatch.lat, lng: locMatch.lng, formatted: `${locMatch.name}, Bhubaneswar` };
  }

  // 4. Search STOP_COORDINATES_MAP
  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: coords[0], lng: coords[1], formatted: `${key.toUpperCase()}, Bhubaneswar` };
    }
  }

  // 5. Default anchor to Patia corridor
  return { lat: 20.3541, lng: 85.8175, formatted: inputAddress };
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
  const originHub = { name: 'Warehouse (Baramunda Logistics Base)', lat: 20.2818, lng: 85.7938 };
  const [internalWaypoints, setInternalWaypoints] = useState<DeliveryWaypoint[]>(SAMPLE_DELIVERY_STOPS);

  const waypoints = externalWaypoints ?? internalWaypoints;
  const setWaypoints = (newWps: DeliveryWaypoint[] | ((prev: DeliveryWaypoint[]) => DeliveryWaypoint[])) => {
    const updated = typeof newWps === 'function' ? newWps(waypoints) : newWps;
    setInternalWaypoints(updated);
    onWaypointsChange?.(updated);
  };

  // Form State matching User Mockup exactly
  const [recipientName, setRecipientName] = useState('anweshi');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState('Mani Tribhuban, Nandankanan Road, Patia');
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [parcelType, setParcelType] = useState<'Documents' | 'Electronics' | 'Clothing' | 'Food' | 'Other'>('Documents');
  const [parcelWeight, setParcelWeight] = useState('2.5');
  const [deliveryPriority, setDeliveryPriority] = useState<'Standard' | 'Express' | 'Urgent'>('Standard');
  const [ecoPackaging, setEcoPackaging] = useState(true);

  // More Details Accordion State
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(true);
  const [dimLength, setDimLength] = useState('20');
  const [dimWidth, setDimWidth] = useState('15');
  const [dimHeight, setDimHeight] = useState('10');
  const [isFragile, setIsFragile] = useState(true);
  const [isKeepUpright, setIsKeepUpright] = useState(false);
  const [isTempSensitive, setIsTempSensitive] = useState(false);

  // 3D Altitude Slider State (15m to 120m Z-axis corridor)
  const [altitudeMeters, setAltitudeMeters] = useState(45);
  const [showAltitudeModal, setShowAltitudeModal] = useState(false);

  // Payment Gateway Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    orderId: string;
    amount: number;
    timestamp: string;
    waypointCount: number;
    trackingId: string;
  } | null>(null);

  // Active View Tab on small devices: 'form' | 'route' | 'safety'
  const [activeMobileView, setActiveMobileView] = useState<'both' | 'form' | 'route' | 'safety'>('both');

  // Full-screen Logistics Map State & Google Maps Layer
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [logisticsMapLayer, setLogisticsMapLayer] = useState<'google-traffic' | 'google-roadmap' | 'google-hybrid'>('google-traffic');

  // Compute Anti-Gravity / Multi-Objective Route Plan
  const plan: AntiGravityRoutePlan = computeAntiGravityRoute(
    originHub,
    waypoints,
    altitudeMeters,
    'anti_gravity_evtol'
  );

  // Driver Pre-Delivery Safety & Mishap Reporting State
  const [reportingWaypoint, setReportingWaypoint] = useState<DeliveryWaypoint | null>(null);
  const [mishapType, setMishapType] = useState<'traffic_accident' | 'weather_flood' | 'vehicle_breakdown' | 'cargo_damage'>('traffic_accident');
  const [mishapLocation, setMishapLocation] = useState('Near Rasulgarh Flyover, NH-16 Corridor');
  const [mishapDescription, setMishapDescription] = useState('');
  const [mishapPhotoUrl, setMishapPhotoUrl] = useState('');
  const [isPhotoCompressing, setIsPhotoCompressing] = useState(false);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<Record<string, {
    recipientName: string;
    incidentType: string;
    photoUrl: string;
    message: string;
    timestamp: string;
    claimStatus: string;
  }>>({});
  const [alertSuccessToast, setAlertSuccessToast] = useState<string | null>(null);
  const [activeDriverTab, setActiveDriverTab] = useState<'traffic' | 'stay'>('traffic');

  const handleMishapPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.75);
          setMishapPhotoUrl(base64);
        }
        setIsPhotoCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSendMishapAlert = () => {
    if (!reportingWaypoint) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedMessage = `🚨 [MUSAFIR TRANSIT ALERT]\nDear ${reportingWaypoint.recipientName},\nAn unforeseen en-route mishap occurred near ${mishapLocation}.\nIncident Type: ${mishapType.replace('_', ' ').toUpperCase()}.\nPhoto proof has been recorded and attached.\n100% Transit Assurance Claim Initiated (Zero customer liability, instant refund/replacement guarantee).`;

    setDispatchedAlerts((prev) => ({
      ...prev,
      [reportingWaypoint.id]: {
        recipientName: reportingWaypoint.recipientName,
        incidentType: mishapType,
        photoUrl: mishapPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400',
        message: formattedMessage,
        timestamp: now,
        claimStatus: 'Insurance Claim Auto-Processed (₹2,500 Full Coverage)',
      },
    }));

    setAlertSuccessToast(`✅ Emergency alert & photo proof dispatched to ${reportingWaypoint.recipientName}!`);
    setTimeout(() => setAlertSuccessToast(null), 5000);
    setReportingWaypoint(null);
    setMishapPhotoUrl('');
    setMishapDescription('');
  };

  // Add Waypoint handler matching User Mockup
  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !deliveryAddress.trim()) return;

    const resolved = resolveLogisticsCoordinates(deliveryAddress);

    const newStop: DeliveryWaypoint = {
      id: `dp-${Date.now()}`,
      recipientName: recipientName.trim(),
      phone: recipientPhone.trim(),
      address: resolved.formatted || deliveryAddress.trim(),
      lat: resolved.lat,
      lng: resolved.lng,
      altitudeMeters: altitudeMeters,
      packageWeightKg: parseFloat(parcelWeight) || 2.5,
      parcelType: parcelType,
      priority: deliveryPriority,
      timeWindow: '10:30 - 11:30 AM',
      estimatedArrival: '10:45 AM',
      status: 'pending',
      ecoPackaging: ecoPackaging,
      dimensionsCm: {
        length: parseFloat(dimLength) || 20,
        width: parseFloat(dimWidth) || 15,
        height: parseFloat(dimHeight) || 10,
      },
      specialHandling: {
        fragile: isFragile,
        keepUpright: isKeepUpright,
        tempSensitive: isTempSensitive,
      },
      dockingStatus: 'ALIGNED_LOCKED',
      dockingToleranceCm: 7.8,
    };

    setWaypoints([...waypoints, newStop]);
    setAlertSuccessToast(`✅ Stop "${recipientName}" (${resolved.lat.toFixed(4)}, ${resolved.lng.toFixed(4)}) added! Live route updated.`);
    setTimeout(() => setAlertSuccessToast(null), 4000);
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  const handlePaymentSuccess = (result: PaymentVerificationResult) => {
    setIsPaymentOpen(false);
    setDispatchReceipt({
      orderId: result.orderId || result.paymentId,
      amount: result.amount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waypointCount: waypoints.length,
      trackingId: `AG-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B13] text-slate-100 overflow-y-auto pb-16 font-sans">
      {/* Toast */}
      {alertSuccessToast && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{alertSuccessToast}</span>
          </div>
          <button onClick={() => setAlertSuccessToast(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dual-Screen / Responsive Container */}
      <div className="max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-6 space-y-5">
        {/* Top Controls Bar for Quick Switching on Mobile */}
        <div className="flex items-center justify-between bg-[#0E1726] border border-slate-800/80 px-4 py-3 rounded-2xl md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-wide">MUSAFIR 3D LOGISTICS</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMobileView('both')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition ${
                activeMobileView === 'both' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveMobileView('form')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition ${
                activeMobileView === 'form' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              + Add
            </button>
            <button
              onClick={() => setActiveMobileView('route')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition ${
                activeMobileView === 'route' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Route ({waypoints.length})
            </button>
          </div>
        </div>

        {/* ─── TWO PANELS SIDE BY SIDE (MATCHING USER MOCKUP EXACTLY) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* =========================================================================
              LEFT PANEL: ADD DELIVERY WAYPOINT (MATCHES LEFT SCREEN OF MOCKUP)
             ========================================================================= */}
          <div
            className={`bg-[#0C1322] border border-slate-800/90 rounded-[28px] p-5 md:p-6 shadow-2xl shadow-black/40 space-y-5 ${
              activeMobileView === 'route' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wider text-white">MUSAFIR</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Move Smarter • Deliver Greener</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 text-emerald-400">
              <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-200">
                ADD DELIVERY WAYPOINT
              </h1>
            </div>

            <form onSubmit={handleAddWaypoint} className="space-y-4">
              {/* Recipient Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recipient Name</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full bg-[#111B2E] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Recipient Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recipient Phone Number</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#111B2E] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition font-mono placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Delivery Address / Stop */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Delivery Address / Stop</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span>Google Maps Verified</span>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onFocus={() => setIsAddressFocused(true)}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      setIsAddressFocused(true);
                    }}
                    placeholder="e.g. Mani Tribhuban, Patia, Infocity"
                    className="w-full bg-[#111B2E] border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                    required
                  />
                  {deliveryAddress && (
                    <button
                      type="button"
                      onClick={() => setDeliveryAddress('')}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '📍 Mani Tribhuban', val: 'Mani Tribhuban, Nandankanan Road, Patia' },
                    { label: '🏢 Royal Lagoon', val: 'Royal Lagoon Apartments, Raghunathpur' },
                    { label: '🎓 KIIT Square', val: 'KIIT Square, Patia, Bhubaneswar' },
                    { label: '💻 Infocity DLF', val: 'Infocity DLF Cybercity, Patia' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setDeliveryAddress(item.val);
                        setIsAddressFocused(false);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-emerald-950/40 hover:text-emerald-300 text-slate-400 border border-slate-700/50 transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Live Google Maps Resolved Verification Card */}
                {deliveryAddress.trim() && (() => {
                  const resolved = resolveLogisticsCoordinates(deliveryAddress);
                  return (
                    <div className="p-2.5 rounded-xl bg-[#091120] border border-emerald-500/40 flex items-center justify-between gap-2 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-[11px] truncate">
                            {resolved.formatted}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Google Maps GPS: <span className="text-emerald-400 font-bold">{resolved.lat.toFixed(4)}, {resolved.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${resolved.lat},${resolved.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-[10px] font-bold whitespace-nowrap flex items-center gap-1"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  );
                })()}

                {/* Autocomplete Dropdown */}
                {isAddressFocused && (
                  <div className="absolute left-0 right-0 top-[70px] z-50 bg-[#0B1220] border border-slate-700/90 rounded-xl shadow-2xl p-1.5 space-y-1 max-h-56 overflow-y-auto">
                    {[
                      {
                        name: 'Mani Tribhuban / Mani Tribhuvan',
                        address: 'Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (PIN 751024)',
                        coords: '20.3688, 85.8242',
                      },
                      {
                        name: 'Royal Lagoon Apartments',
                        address: 'Nandankanan Road, Raghunathpur, Patia, Bhubaneswar',
                        coords: '20.3664, 85.8235',
                      },
                      {
                        name: 'KIIT Square & Campus',
                        address: 'Patia / KIIT Road, Bhubaneswar',
                        coords: '20.3541, 85.8175',
                      },
                      {
                        name: 'InfoCity Tech Park & DLF Cybercity',
                        address: 'Patia IT Corridor, Bhubaneswar',
                        coords: '20.3602, 85.8035',
                      },
                      {
                        name: 'Jayadev Vihar Square',
                        address: 'NH-16 Junction, Bhubaneswar',
                        coords: '20.3039, 85.8188',
                      },
                    ]
                      .filter(
                        (item) =>
                          !deliveryAddress.trim() ||
                          item.name.toLowerCase().includes(deliveryAddress.toLowerCase()) ||
                          item.address.toLowerCase().includes(deliveryAddress.toLowerCase()) ||
                          deliveryAddress.toLowerCase().includes('mani') ||
                          deliveryAddress.toLowerCase().includes('tribh')
                      )
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.name}
                          onMouseDown={() => {
                            setDeliveryAddress(`${item.name}, ${item.address.split(',')[0]}`);
                            setIsAddressFocused(false);
                          }}
                          className="p-2 rounded-lg hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 cursor-pointer transition flex items-start justify-between gap-2 text-left"
                        >
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{item.address}</div>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                            {item.coords}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Parcel Type Chips */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parcel Type</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Documents', 'Electronics', 'Clothing', 'Food', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setParcelType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        parcelType === type
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                          : 'bg-[#111B2E] text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parcel Weight (Kg) */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Parcel Weight (Kg)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['0.5', '1.0', '2.5', '5.0', '10.0', '20.0', '35.0'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setParcelWeight(w)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        parcelWeight === w
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#111B2E] text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={parcelWeight}
                    onChange={(e) => setParcelWeight(e.target.value)}
                    className="w-full bg-[#111B2E] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="absolute right-3.5 top-3 text-[10px] text-slate-500 font-bold uppercase">
                    KG
                  </span>
                </div>
              </div>

              {/* Delivery Priority */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivery Priority</span>
                </label>
                <div className="flex gap-2">
                  {(['Standard', 'Express', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDeliveryPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        deliveryPriority === p
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#111B2E] text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaging Option */}
              <div className="space-y-2 pt-1">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Packaging</span>
                </label>
                <div className="flex items-center justify-between bg-[#111B2E] border border-slate-800 p-3 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ecoPackaging}
                      onChange={(e) => setEcoPackaging(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Use eco-friendly / recyclable packaging
                    </span>
                  </label>
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

              {/* More Details (Optional) Accordion */}
              <div className="border border-slate-800 bg-[#111B2E]/70 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span>More Details (Optional)</span>
                  {isMoreDetailsOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isMoreDetailsOpen && (
                  <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-800/60">
                    {/* Parcel Dimensions */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>Parcel Dimensions (cm)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center bg-[#0B111E] border border-slate-800 rounded-lg px-2 py-1.5 text-xs">
                          <span className="text-[10px] text-slate-500 mr-1.5">Length</span>
                          <input
                            type="number"
                            value={dimLength}
                            onChange={(e) => setDimLength(e.target.value)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center bg-[#0B111E] border border-slate-800 rounded-lg px-2 py-1.5 text-xs">
                          <span className="text-[10px] text-slate-500 mr-1.5">Width</span>
                          <input
                            type="number"
                            value={dimWidth}
                            onChange={(e) => setDimWidth(e.target.value)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center bg-[#0B111E] border border-slate-800 rounded-lg px-2 py-1.5 text-xs">
                          <span className="text-[10px] text-slate-500 mr-1.5">Height</span>
                          <input
                            type="number"
                            value={dimHeight}
                            onChange={(e) => setDimHeight(e.target.value)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Handling */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Special Handling</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={isFragile}
                            onChange={(e) => setIsFragile(e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 accent-emerald-600"
                          />
                          <span>Fragile</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={isKeepUpright}
                            onChange={(e) => setIsKeepUpright(e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 accent-emerald-600"
                          />
                          <span>Keep Upright</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={isTempSensitive}
                            onChange={(e) => setIsTempSensitive(e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 accent-emerald-600"
                          />
                          <span>Temperature Sensitive</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button (Bright Emerald Green Pill Button) */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs md:text-sm rounded-full shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Waypoint & Re-Optimize</span>
              </button>
            </form>
          </div>

          {/* =========================================================================
              RIGHT PANEL: OPTIMIZED ROUTE & STATS (MATCHES RIGHT SCREEN OF MOCKUP)
             ========================================================================= */}
          <div
            className={`bg-[#0C1322] border border-slate-800/90 rounded-[28px] p-5 md:p-6 shadow-2xl shadow-black/40 space-y-5 ${
              activeMobileView === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wider text-white">MUSAFIR</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Move Smarter • Deliver Greener</p>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Success Banner matching Mockup */}
            <div className="p-3.5 md:p-4 rounded-2xl bg-[#112423] border border-emerald-500/30 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 flex-shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Route Re-Optimized!</h3>
                  <p className="text-[11px] text-emerald-300/80 font-medium">New waypoint added successfully.</p>
                </div>
              </div>
              <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            </div>

            {/* 8-Stat Grid (Matching user image 2 columns x 4 rows) */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Total Delivery Stops */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Delivery Stops</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">{plan.sequencedWaypoints.length}</span>
                  <span className="text-[11px] font-bold text-emerald-400">(+1 new)</span>
                </div>
              </div>

              {/* 2. Vehicle Capacity */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vehicle Capacity</span>
                </div>
                <div className="mt-1">
                  <div className="text-sm font-black text-white">
                    {plan.payloadStability.currentPayloadKg} kg / {plan.payloadStability.maxAllowableCapacityKg} kg
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (plan.payloadStability.currentPayloadKg / plan.payloadStability.maxAllowableCapacityKg) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Total Load */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Load</span>
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  {plan.payloadStability.currentPayloadKg} kg
                </div>
              </div>

              {/* 4. Estimated Delivery Time */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estimated Delivery Time</span>
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  {Math.floor(plan.totalDurationMinutes / 60)}h {plan.totalDurationMinutes % 60}m
                </div>
              </div>

              {/* 5. Estimated Cost */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estimated Cost</span>
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  ₹{plan.estimatedCostInr}
                </div>
              </div>

              {/* 6. Fuel Saving */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fuel Saving</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-black text-white">{plan.fuelOrEnergySavedPercent}%</span>
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* 7. CO2 Reduction */}
              <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CO₂ Reduction</span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black text-white">{plan.co2ReductionPercent}%</span>
                  <div className="text-[10px] text-slate-400 font-medium">(~ {plan.co2SavedKg} kg CO₂)</div>
                </div>
              </div>

              {/* 8. Greener Deliveries Banner Card */}
              <div className="bg-[#0B251F] border border-emerald-600/30 rounded-2xl p-3.5 flex flex-col justify-center text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-white">Greener Deliveries</div>
                <div className="text-[10px] text-emerald-300 font-medium">A Cleaner Tomorrow</div>
              </div>
            </div>

            {/* ─── OPTIMIZED ROUTE SECTION (REAL-TIME LIVE MAP & TIMELINE) ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Optimized Route Corridor</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold">Google Maps</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Live Multi-Drop Road GPS Tracking (Zero API Key Required)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111B2E] border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Map</span>
                </button>
              </div>

              {/* Real-time Interactive Google Maps Preview with Multi-Stop Polyline */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#0A111E] border border-slate-800">
                <MapContainer
                  center={[originHub.lat, originHub.lng]}
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

                  {/* Google Maps Real-Time Tile Layer (Zero API Key Required) */}
                  <TileLayer
                    url={
                      logisticsMapLayer === 'google-traffic'
                        ? 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}'
                        : logisticsMapLayer === 'google-hybrid'
                        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                    }
                    attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                    maxZoom={20}
                  />

                  {/* Warehouse Origin Pin */}
                  <Marker position={[originHub.lat, originHub.lng]} icon={createLogisticsWarehouseIcon()}>
                    <Popup>
                      <div className="text-xs font-bold text-slate-900 p-1">
                        <span className="text-blue-600 font-extrabold block">🏭 Dispatch Warehouse</span>
                        <span className="text-slate-800 block">{originHub.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          GPS: {originHub.lat.toFixed(4)}, {originHub.lng.toFixed(4)}
                        </span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Connected Dispatch Corridor Polyline */}
                  <Polyline
                    positions={[
                      [originHub.lat, originHub.lng],
                      ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
                    ]}
                    pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9 }}
                  />

                  {/* Waypoint Pins */}
                  {waypoints.map((wp, idx) => {
                    const isLast = idx === waypoints.length - 1;
                    return (
                      <Marker
                        key={wp.id}
                        position={[wp.lat, wp.lng]}
                        icon={createLogisticsStopIcon(idx + 1, isLast)}
                      >
                        <Popup>
                          <div className="text-xs font-bold text-slate-900 p-1 min-w-[190px]">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                              <span className="text-emerald-600 font-extrabold">Stop #{idx + 1}</span>
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                {wp.packageWeightKg} kg
                              </span>
                            </div>
                            <div className="text-xs font-black text-slate-900 mt-1 capitalize">{wp.recipientName}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{wp.address}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">
                              Google Maps: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-bold mt-1.5"
                            >
                              <span>📍 Verify on Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                {/* Live Floating Badge on Map */}
                <div className="absolute top-2.5 left-2.5 z-[1000] bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Google Maps Live: {waypoints.length} Stops Active</span>
                </div>

                {/* Google Maps Layer Selector (Zero API Key) */}
                <div className="absolute bottom-2.5 right-2.5 z-[1000] flex gap-1 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-traffic')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-traffic'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🚦 Traffic
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-roadmap')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-roadmap'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗺️ Roads
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-hybrid')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-hybrid'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛰️ Satellite
                  </button>
                </div>
              </div>

              {/* Waypoint Timeline Stops */}
              <div className="space-y-2 bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5">
                {/* 0: Start */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-300">Start (Baramunda Logistics Base)</span>
                      <span className="text-[10px] text-slate-500 block font-mono">20.2818, 85.7938</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">09:00 AM</span>
                </div>

                {/* Waypoints */}
                {plan.sequencedWaypoints.map((wp, idx) => {
                  const isLast = idx === plan.sequencedWaypoints.length - 1;
                  const times = ['09:25 AM', '10:05 AM', '10:45 AM', '11:15 AM', '11:45 AM'];
                  const estTime = wp.estimatedArrival || times[idx] || '11:00 AM';

                  return (
                    <div
                      key={wp.id}
                      className="flex items-center justify-between py-2 border-b border-slate-800/40 text-xs last:border-0"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white mt-0.5 flex-shrink-0 ${
                            isLast ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white capitalize truncate">{wp.recipientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">({wp.packageWeightKg} kg)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{wp.address}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                              📍 {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-0.5 whitespace-nowrap"
                            >
                              <span>Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono text-slate-300 text-[11px]">{estTime}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(wp.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="flex-1 py-3.5 rounded-full border border-slate-700 bg-[#111B2E] hover:bg-slate-800 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>View Optimized Route</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="flex-1 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Dispatch Parcel</span>
              </button>
            </div>

            {/* Footer Quote matching user mockup */}
            <div className="text-center pt-2 text-slate-500 text-[11px] font-medium italic">
              "Optimized today, a better tomorrow." — Musafir
            </div>
          </div>
        </div>

        {/* ─── EXTRA UTILITIES ACCORDION: DRIVER SAFETY & STAY HUBS ─── */}
        <div className="bg-[#0C1322] border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Driver En-Route Readiness & Safety Hubs (लाइव ट्रैफिक & स्टे)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Live arterial traffic conditions, driver rest pods, and instant mishap insurance claims.
                </p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center bg-[#111B2E] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveDriverTab('traffic')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeDriverTab === 'traffic'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🚦 Live Traffic
              </button>
              <button
                onClick={() => setActiveDriverTab('stay')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeDriverTab === 'stay'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🛏️ Aas-Paas Stay Hubs
              </button>
            </div>
          </div>

          {/* Traffic Tab */}
          {activeDriverTab === 'traffic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LIVE_CORRIDOR_TRAFFIC.map((tf, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${tf.color} space-y-1`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black truncate max-w-[200px]">{tf.corridor}</span>
                    <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80">
                      {tf.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Avg Speed: {tf.speed}</span>
                    <span className="font-mono">{tf.delay}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stay Hubs Tab */}
          {activeDriverTab === 'stay' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DRIVER_STAY_HUBS.map((stay) => (
                <div
                  key={stay.id}
                  className="p-3.5 rounded-2xl bg-[#111B2E] border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-black text-xs text-white leading-tight">{stay.name}</div>
                    <span className="text-[10px] font-bold text-amber-400">{stay.safetyRating}</span>
                  </div>
                  <div className="text-[10px] font-bold text-blue-400">📍 {stay.distance}</div>
                  <div className="flex flex-wrap gap-1">
                    {stay.amenities.map((am, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-medium text-slate-300"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] border-t border-slate-800">
                    <span className="text-slate-400 font-mono">{stay.phone}</span>
                    <a
                      href={`tel:${stay.phone}`}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                    >
                      Call Hub
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── DISPATCH PAYMENT MODAL (OPENED ON "DISPATCH PARCEL") ─── */}
      <PaymentGatewayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={plan.estimatedCostInr}
        purpose={`Musafir 3D Levitation Dispatch - ${plan.sequencedWaypoints.length} Drops (₹${plan.estimatedCostInr})`}
        customerName={recipientName}
        customerPhone={recipientPhone}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* ─── LIVE DISPATCH CONFIRMATION RECEIPT MODAL ─── */}
      {dispatchReceipt && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0C1322] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Payment Verified & Dispatched
              </span>
              <h2 className="text-xl font-black text-white mt-2">Flight Clearance Granted! 🚀</h2>
              <p className="text-xs text-slate-400 mt-1">
                Vehicle assigned to Urban Skyway Lane ({altitudeMeters}m AGL). Auto-docking precision lock ready.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-slate-800 rounded-2xl p-4 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tracking ID:</span>
                <span className="font-black text-emerald-400">{dispatchReceipt.trackingId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount Paid:</span>
                <span className="font-black text-white">₹{dispatchReceipt.amount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Waypoint Drops:</span>
                <span className="text-white">{dispatchReceipt.waypointCount} stops</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Docking Precision:</span>
                <span className="text-emerald-400">±8 cm (ALIGNED_LOCKED)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Time Dispatched:</span>
                <span className="text-white">{dispatchReceipt.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setDispatchReceipt(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-xs uppercase tracking-wide transition cursor-pointer"
            >
              Track Live Fleet on Radar
            </button>
          </div>
        </div>
      )}

      {/* ─── MISHAP REPORTING MODAL ─── */}
      {reportingWaypoint && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0C1322] border border-rose-800 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-rose-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-sm text-white">Report Road Mishap & Damage (हादसा)</h3>
              </div>
              <button
                onClick={() => setReportingWaypoint(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Affected Parcel Drop:</strong> {reportingWaypoint.recipientName}</div>
              <div><strong>Delivery Address:</strong> {reportingWaypoint.address}</div>
            </div>

            {/* Mishap Type Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Incident Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'traffic_accident', label: '💥 Road Traffic Accident' },
                  { id: 'weather_flood', label: '🌧️ Waterlogging / Flood' },
                  { id: 'vehicle_breakdown', label: '🚚 Vehicle Breakdown' },
                  { id: 'cargo_damage', label: '📦 Parcel Physical Damage' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMishapType(t.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      mishapType === t.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-[#111B2E] border-slate-800 text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Location */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mishap Location *
              </label>
              <input
                type="text"
                value={mishapLocation}
                onChange={(e) => setMishapLocation(e.target.value)}
                className="w-full bg-[#111B2E] border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500 text-white"
              />
            </div>

            {/* Photo Evidence */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Photo Proof of Damage (फोटो प्रमाण) *
              </label>
              <label className="cursor-pointer block border-2 border-dashed border-rose-800 hover:border-rose-600 rounded-2xl p-3 text-center bg-rose-950/20 transition">
                <input type="file" accept="image/*" onChange={handleMishapPhotoChange} className="hidden" />
                {isPhotoCompressing ? (
                  <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-bold py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compressing Evidence Photo...</span>
                  </div>
                ) : mishapPhotoUrl ? (
                  <div className="space-y-2">
                    <img
                      src={mishapPhotoUrl}
                      alt="Mishap Proof"
                      className="max-h-40 rounded-xl mx-auto object-cover border border-rose-500"
                    />
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      ✓ Photo Proof Attached. Tap to change.
                    </span>
                  </div>
                ) : (
                  <div className="py-2 space-y-1">
                    <Camera className="w-6 h-6 text-rose-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-200 block">
                      Click to Take / Upload Photo of Damage
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setReportingWaypoint(null)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMishapAlert}
                className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Alert & Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Google Maps Logistics Corridor Modal (Zero API Key) */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0C1322] border border-slate-800 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Google Maps Logistics Corridor</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      Zero API Key Required
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Warehouse + {waypoints.length} Dispatch Stops Active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Layer switch */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-traffic')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-traffic'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🚦 Live Traffic
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-roadmap')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-roadmap'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗺️ Roads
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogisticsMapLayer('google-hybrid')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      logisticsMapLayer === 'google-hybrid'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛰️ Satellite
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapExpanded(false)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close Map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Map */}
            <div className="flex-1 w-full h-full relative">
              <MapContainer
                center={[originHub.lat, originHub.lng]}
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
                  url={
                    logisticsMapLayer === 'google-traffic'
                      ? 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}'
                      : logisticsMapLayer === 'google-hybrid'
                      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                  }
                  attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>'
                  maxZoom={20}
                />

                {/* Warehouse Origin Marker */}
                <Marker
                  position={[originHub.lat, originHub.lng]}
                  icon={createLogisticsWarehouseIcon()}
                >
                  <Popup>
                    <div className="text-xs font-bold text-slate-900 p-1">
                      <div className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <span>🏭 Logistics Base Hub</span>
                      </div>
                      <div className="text-slate-800 font-bold mt-1">{originHub.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Google Maps: {originHub.lat.toFixed(4)}, {originHub.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Route Path */}
                <Polyline
                  positions={[
                    [originHub.lat, originHub.lng],
                    ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
                  ]}
                  pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
                />

                {/* Waypoints */}
                {waypoints.map((wp, idx) => {
                  const isLast = idx === waypoints.length - 1;
                  return (
                    <Marker
                      key={wp.id}
                      position={[wp.lat, wp.lng]}
                      icon={createLogisticsStopIcon(idx + 1, isLast)}
                    >
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1 min-w-[200px]">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="text-emerald-600 font-extrabold">Stop #{idx + 1}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                              {wp.packageWeightKg} kg
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900 mt-1 capitalize">{wp.recipientName}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{wp.address}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            Google Maps: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-bold mt-1.5"
                          >
                            <span>📍 Verify on Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
