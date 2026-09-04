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
  Info
} from 'lucide-react';
import {
  SAMPLE_DELIVERY_STOPS,
  RESTRICTED_NO_FLY_ZONES,
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute
} from '../../services/logisticsOptimizerService';
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

interface LogisticsHubProps {
  onNavigateToMap?: () => void;
}

export const LogisticsHubView: React.FC<LogisticsHubProps> = ({ onNavigateToMap }) => {
  const originHub = { name: 'Warehouse (Baramunda Logistics Base)', lat: 20.2818, lng: 85.7938 };
  const [waypoints, setWaypoints] = useState<DeliveryWaypoint[]>(SAMPLE_DELIVERY_STOPS);

  // Form State matching User Mockup exactly
  const [recipientName, setRecipientName] = useState('anweshi');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState('mani trubhuban');
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

    const newStop: DeliveryWaypoint = {
      id: `dp-${Date.now()}`,
      recipientName: recipientName.trim(),
      phone: recipientPhone.trim(),
      address: deliveryAddress.trim(),
      lat: 20.3300 + (Math.random() * 0.04 - 0.02),
      lng: 85.8150 + (Math.random() * 0.04 - 0.02),
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
    setAlertSuccessToast(`✅ Waypoint "${recipientName}" added to 3D route! Corridor re-optimized.`);
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
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery Address / Stop</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. mani trubhuban, patia"
                    className="w-full bg-[#111B2E] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                    required
                  />
                </div>
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

            {/* ─── 3D ALTITUDE CORRIDOR & ENERGY-AWARE LEVITATION ENGINE ─── */}
            <div className="bg-[#111B2E] border border-slate-800/90 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-white tracking-wide">
                    3D LEVITATION CORRIDOR & ENERGY OPTIMIZER
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {plan.corridorLaneCode}
                </span>
              </div>

              {/* Z-Axis Altitude Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Z-Axis Corridor Altitude:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{altitudeMeters}m AGL</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={altitudeMeters}
                  onChange={(e) => setAltitudeMeters(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>15m (Low Rooftop)</span>
                  <span>45m (Skyway Lane)</span>
                  <span>120m (High Corridor)</span>
                </div>
              </div>

              {/* Energy Meter & Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-[#0B111E] p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Hover Power</div>
                  <div className="text-xs font-mono font-bold text-amber-400">{plan.energyMetrics.hoverKWh} kWh</div>
                </div>
                <div className="bg-[#0B111E] p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Ascent Climb</div>
                  <div className="text-xs font-mono font-bold text-sky-400">{plan.energyMetrics.ascentKWh} kWh</div>
                </div>
                <div className="bg-[#0B111E] p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Regen Glide</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">-{plan.energyMetrics.descentRegenKWh} kWh</div>
                </div>
                <div className="bg-[#0B111E] p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Total Energy</div>
                  <div className="text-xs font-mono font-black text-white">{plan.energyMetrics.totalEnergyKWh} kWh</div>
                </div>
              </div>

              {/* Stability & Docking Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-semibold border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Payload CG Stability:</span>
                  <span className="font-mono text-emerald-400 font-bold">{plan.payloadStability.stabilityMarginPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Docking Tolerance:</span>
                  <span className="font-mono text-white font-bold">±{plan.dockingPrecisionToleranceCm} cm</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Safety Score:</span>
                  <span className="font-mono text-purple-300 font-bold">{plan.safetyScore} / 100</span>
                </div>
              </div>

              {/* Avoided No-Fly Zones Warning & Compliance */}
              <div className="bg-[#09101C] p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <div className="text-slate-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated No-Fly & EMI Exclusion Zones Bypassed:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    🛡️ Biju Patnaik Airport Airspace (NFZ-1)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    ⚡ Chandaka 400kV EMI Grid (EMI-2)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    👥 Master Canteen Dense Sector (CDZ-3)
                  </span>
                </div>
              </div>
            </div>

            {/* ─── OPTIMIZED ROUTE SECTION (MAP SCHEMATIC & TIMELINE) ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">Optimized Route</h3>
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  <span>View on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Map Graphic Preview with Route Path */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-[#0A111E] border border-slate-800 flex items-center justify-center">
                {/* SVG Route Visualization */}
                <svg className="w-full h-full p-4" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="35%" stopColor="#10B981" />
                      <stop offset="70%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>

                  {/* Faint Grid lines */}
                  <line x1="20" y1="40" x2="380" y2="40" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="20" y1="80" x2="380" y2="80" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="20" y1="120" x2="380" y2="120" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Route Polyline */}
                  <path
                    d="M 50 110 Q 110 50 160 85 T 270 60 T 350 45"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Start Point */}
                  <circle cx="50" cy="110" r="11" fill="#3B82F6" />
                  <text x="50" y="114" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">0</text>
                  <text x="50" y="132" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Start</text>

                  {/* Stop 1 */}
                  <circle cx="160" cy="85" r="10" fill="#10B981" />
                  <text x="160" y="89" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

                  {/* Stop 2 */}
                  <circle cx="215" cy="98" r="9" fill="#10B981" />
                  <text x="215" y="102" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">2</text>

                  {/* Stop 3 (Mani Tribhuban) */}
                  <circle cx="270" cy="60" r="10" fill="#10B981" />
                  <text x="270" y="64" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>

                  {/* Stop 4 (Final Stop) */}
                  <circle cx="350" cy="45" r="11" fill="#EF4444" />
                  <text x="350" y="49" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
                </svg>
              </div>

              {/* Waypoint Timeline Stops */}
              <div className="space-y-2 bg-[#111B2E] border border-slate-800/90 rounded-2xl p-3.5">
                {/* 0: Start */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="font-bold text-slate-300">Start (Warehouse)</span>
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
                      className="flex items-center justify-between py-1.5 border-b border-slate-800/40 text-xs last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${
                            isLast ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-white capitalize">{wp.recipientName}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({wp.packageWeightKg} kg)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 text-[11px]">{estTime}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(wp.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-3 h-3" />
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
                onClick={onNavigateToMap}
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
    </div>
  );
};
