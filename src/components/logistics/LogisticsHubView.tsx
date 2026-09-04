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
  ExternalLink
} from 'lucide-react';
import {
  SAMPLE_DELIVERY_STOPS,
  DeliveryWaypoint,
  OptimizedLogisticsPlan,
  optimizeDeliverySequence
} from '../../services/logisticsOptimizerService';

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
  const [originHub, setOriginHub] = useState({ name: 'Baramunda Central Logistics Hub, Bhubaneswar', lat: 20.2818, lng: 85.7938 });
  const [waypoints, setWaypoints] = useState<DeliveryWaypoint[]>(SAMPLE_DELIVERY_STOPS);
  const [newRecipient, setNewRecipient] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newWeight, setNewWeight] = useState('2.0');
  const [vehicleType, setVehicleType] = useState<'2_wheeler_ev' | '3_wheeler_e_loader' | 'e_van' | 'mo_bus_cargo'>('2_wheeler_ev');

  // Compute optimized route plan
  const plan: OptimizedLogisticsPlan = optimizeDeliverySequence(originHub, waypoints, vehicleType);

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

    setDispatchedAlerts(prev => ({
      ...prev,
      [reportingWaypoint.id]: {
        recipientName: reportingWaypoint.recipientName,
        incidentType: mishapType,
        photoUrl: mishapPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400',
        message: formattedMessage,
        timestamp: now,
        claimStatus: 'Insurance Claim Auto-Processed (₹2,500 Full Coverage)',
      }
    }));

    setAlertSuccessToast(`✅ Emergency alert & photo proof dispatched to ${reportingWaypoint.recipientName} (+91 98765 43210)!`);
    setTimeout(() => setAlertSuccessToast(null), 5000);
    setReportingWaypoint(null);
    setMishapPhotoUrl('');
    setMishapDescription('');
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() || !newAddress.trim()) return;

    const newStop: DeliveryWaypoint = {
      id: `dp-${Date.now()}`,
      recipientName: newRecipient.trim(),
      address: newAddress.trim(),
      lat: 20.3200 + (Math.random() * 0.05 - 0.025),
      lng: 85.8200 + (Math.random() * 0.05 - 0.025),
      packageWeightKg: parseFloat(newWeight) || 1.5,
      timeWindow: '11:00 - 01:00 PM',
      status: 'pending',
    };

    setWaypoints([...waypoints, newStop]);
    setNewRecipient('');
    setNewAddress('');
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      {/* 1. Logistics Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-emerald-800/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Logistics & Delivery Sequencing Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Multi-Drop Route Optimization & Parcel Dispatch
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Traveling Salesperson (TSP) algorithm with Google Maps turn-by-turn routing, fleet capacity management, and Ama Bus cargo transport.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">Fuel & Energy Saved</div>
              <div className="text-sm font-black text-white">~32% Efficiency Boost</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="px-3 md:px-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Fleet Selection & Add Waypoint Form */}
        <div className="lg:col-span-1 space-y-4">
          {/* Vehicle Fleet Selector */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Select Fleet Vehicle</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '2_wheeler_ev', label: '🛵 E-Bike / 2W EV', cap: '25 kg payload' },
                { id: '3_wheeler_e_loader', label: '🛺 3W E-Loader', cap: '200 kg payload' },
                { id: 'e_van', label: '🚐 Electric E-Van', cap: '650 kg payload' },
                { id: 'mo_bus_cargo', label: '🚍 Ama Bus Cargo', cap: 'Inter-hub transit' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicleType(v.id as any)}
                  className={`p-2.5 rounded-2xl text-left border transition ${
                    vehicleType === v.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-extrabold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">{v.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{v.cap}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Stop Form */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Delivery Waypoint</span>
            </h3>

            <form onSubmit={handleAddStop} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Smart Point / Customer"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Delivery Address / Stop</label>
                <input
                  type="text"
                  placeholder="e.g. Master Canteen Square, Bhubaneswar"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Individual Parcel Weight (Kg)
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {['0.5', '1.0', '2.5', '5.0', '10.0', '20.0', '35.0'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setNewWeight(w)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition ${
                        newWeight === w
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {w} kg
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    placeholder="Enter custom parcel weight (e.g. 3.5)"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">KG</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Waypoint & Re-Optimize</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Optimized Delivery Sequence & Summary Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dispatch Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Distance</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{plan.totalDistanceKm} km</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Estimated Time</div>
              <div className="text-base font-black text-blue-600 mt-0.5">{plan.totalDurationMinutes} mins</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Energy Saved</div>
              <div className="text-base font-black text-emerald-600 mt-0.5">{plan.fuelOrEnergySavedPercent}%</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Dispatch Cost</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">₹{plan.estimatedCostInr}</div>
            </div>
          </div>

          {/* Alert Success Toast */}
          {alertSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{alertSuccessToast}</span>
              </div>
              <button onClick={() => setAlertSuccessToast(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─── Driver Pre-Delivery Readiness: Aas-Paas Stay & Live Traffic ─── */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Driver Pre-Delivery Route Readiness (लाइव ट्रैफिक & स्टे)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live road traffic bottlenecks and verified driver resting dorms along Bhubaneswar corridors.
                  </p>
                </div>
              </div>

              {/* Toggle Tab */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveDriverTab('traffic')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeDriverTab === 'traffic'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  🚦 Live Traffic
                </button>
                <button
                  onClick={() => setActiveDriverTab('stay')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeDriverTab === 'stay'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  🛏️ Aas-Paas Stay Hubs
                </button>
              </div>
            </div>

            {/* Tab 1: Live Traffic */}
            {activeDriverTab === 'traffic' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LIVE_CORRIDOR_TRAFFIC.map((tf, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${tf.color} space-y-1`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black truncate max-w-[200px]">{tf.corridor}</span>
                      <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80">
                        {tf.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Avg Speed: {tf.speed}</span>
                      <span className="font-mono">{tf.delay}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Nearby Driver Stay & Rest Hubs */}
            {activeDriverTab === 'stay' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DRIVER_STAY_HUBS.map((stay) => (
                  <div
                    key={stay.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                        {stay.name}
                      </div>
                      <span className="text-[10px] font-bold text-amber-500">{stay.safetyRating}</span>
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      📍 {stay.distance}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stay.amenities.map((am, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium">
                          {am}
                        </span>
                      ))}
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-500 font-mono">{stay.phone}</span>
                      <a
                        href={`tel:${stay.phone}`}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                      >
                        Call Hub
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sequenced Waypoints List with Mishap Reporting */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Optimal Dispatch Sequence ({plan.sequencedWaypoints.length} Drops)
                </h3>
                <div className="text-xs text-slate-500">
                  Starting Hub: <span className="font-bold text-slate-800 dark:text-slate-200">{originHub.name}</span>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full">
                TSP Route Active
              </span>
            </div>

            <div className="space-y-2.5">
              {plan.sequencedWaypoints.map((wp, idx) => {
                const alertInfo = dispatchedAlerts[wp.id];
                return (
                  <div
                    key={wp.id}
                    className={`p-3.5 rounded-2xl ${
                      alertInfo
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
                    } flex flex-col gap-2 hover:border-emerald-500 transition`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${
                          alertInfo ? 'bg-rose-600' : 'bg-emerald-600'
                        } text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">{wp.recipientName}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">{wp.address}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold">
                              📦 Weight:
                            </span>
                            <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                              <button
                                onClick={() => {
                                  const updated = waypoints.map(w => w.id === wp.id ? { ...w, packageWeightKg: Math.max(0.5, +(w.packageWeightKg - 0.5).toFixed(1)) } : w);
                                  setWaypoints(updated);
                                }}
                                className="text-xs font-bold text-slate-500 hover:text-emerald-600 px-1"
                                title="Decrease weight"
                              >
                                -
                              </button>
                              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {wp.packageWeightKg} kg
                              </span>
                              <button
                                onClick={() => {
                                  const updated = waypoints.map(w => w.id === wp.id ? { ...w, packageWeightKg: Math.min(50, +(w.packageWeightKg + 0.5).toFixed(1)) } : w);
                                  setWaypoints(updated);
                                }}
                                className="text-xs font-bold text-slate-500 hover:text-emerald-600 px-1"
                                title="Increase weight"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-400">
                              (₹{Math.ceil(wp.packageWeightKg / 0.5) * 10} Ama Bus Cargo)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {alertInfo ? (
                          <span className="text-[10px] font-black px-2.5 py-1 bg-rose-600 text-white rounded-full animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Mishap Alert Dispatched
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setReportingWaypoint(wp);
                                setMishapLocation(`En-route near ${wp.address.split(',')[0]}`);
                              }}
                              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                              title="Report Accident / Damage to Parcel"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Report Mishap (हादसा)</span>
                            </button>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full">
                              Pending Drop
                            </span>
                            <button
                              onClick={() => handleRemoveStop(wp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                              title="Remove stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dispatched Mishap Evidence Preview Card */}
                    {alertInfo && (
                      <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={alertInfo.photoUrl}
                            alt="Damage Evidence"
                            className="w-14 h-14 rounded-lg object-cover border border-rose-300 flex-shrink-0"
                          />
                          <div>
                            <div className="font-black text-rose-600 flex items-center gap-1">
                              <span>🚨 Photo Proof Sent to Sender ({alertInfo.timestamp})</span>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                              {alertInfo.claimStatus}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md">
                          ✓ SMS & WhatsApp Sent to {alertInfo.recipientName}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                onClick={onNavigateToMap}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Inspect Full Route on Map
              </button>
            </div>
          </div>

          {/* ─── Mishap Reporting Modal Overlay ─── */}
          {reportingWaypoint && (
            <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
              <div className="bg-white dark:bg-[#161026] rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border border-rose-200 dark:border-rose-900/60 p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Report Road Mishap & Damage (हादसा / पार्सल डैमेज)
                    </h3>
                  </div>
                  <button
                    onClick={() => setReportingWaypoint(null)}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Affected Parcel Drop:</strong> {reportingWaypoint.recipientName}</div>
                  <div><strong>Delivery Address:</strong> {reportingWaypoint.address}</div>
                </div>

                {/* Mishap Type Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
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
                            ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Incident Location */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mishap Location *
                  </label>
                  <input
                    type="text"
                    value={mishapLocation}
                    onChange={(e) => setMishapLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                    placeholder="e.g. Near Rasulgarh Flyover, NH-16"
                  />
                </div>

                {/* Photo Evidence Capture / Upload */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Photo Proof of Mishap / Damage (फोटो प्रमाण) *
                  </label>
                  <label className="cursor-pointer block border-2 border-dashed border-rose-300 dark:border-rose-800 hover:border-rose-500 rounded-2xl p-3 text-center bg-rose-50/40 dark:bg-rose-950/20 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMishapPhotoChange}
                      className="hidden"
                    />
                    {isPhotoCompressing ? (
                      <div className="flex items-center justify-center gap-2 text-rose-600 text-xs font-bold py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compressing Evidence Photo...</span>
                      </div>
                    ) : mishapPhotoUrl ? (
                      <div className="space-y-2">
                        <img
                          src={mishapPhotoUrl}
                          alt="Mishap Proof"
                          className="max-h-40 rounded-xl mx-auto object-cover border border-rose-400"
                        />
                        <span className="text-[11px] font-bold text-emerald-600 block">
                          ✓ Photo Proof Attached. Tap to change.
                        </span>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1">
                        <Camera className="w-6 h-6 text-rose-500 mx-auto" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Click to Take / Upload Photo of Damage
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Evidence will be attached to the message sent to sender
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReportingWaypoint(null)}
                    className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMishapAlert}
                    className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Alert & Photo to Sender</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Time Suggestions (Avoid Peak Hours) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Smart Delivery Time Slot Suggestions (Off-Peak Optimization)
                </h3>
                <p className="text-xs text-slate-500">
                  Deliver non-urgent parcels during low-congestion windows to avoid peak traffic delays and save fuel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { slot: '11:00 AM – 01:30 PM', status: '⭐ Highly Recommended', save: '38% time saved', fuel: '1.8L fuel saved', badge: 'bg-emerald-100 text-emerald-800', note: 'Wide-open roads and rapid doorstep deliveries' },
                { slot: '02:00 PM – 04:30 PM', status: '✅ Recommended', save: '32% time saved', fuel: '1.4L fuel saved', badge: 'bg-emerald-50 text-emerald-700', note: 'Smooth commercial traffic and quick parking' },
                { slot: '05:30 PM – 08:30 PM', status: '❌ Peak Gridlock', save: '0% saved (Heavy delays)', fuel: 'High idle consumption', badge: 'bg-rose-100 text-rose-800', note: 'Heavy evening commuter rush across major corridors' },
                { slot: '09:00 PM – 10:30 PM', status: '⭐ Night Super-Fast', save: '46% time saved', fuel: '2.2L fuel saved', badge: 'bg-indigo-100 text-indigo-800', note: 'Completely clear arterial roads for express freight' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 dark:text-white">{s.slot}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.badge}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{s.note}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ⚡ {s.save} • ⛽ {s.fuel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

