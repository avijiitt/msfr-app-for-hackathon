import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Camera,
  Check,
  X,
  PhoneCall,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  ArrowLeft,
  Search,
  Bell,
  Calendar,
  FileCheck,
  Share2,
  Copy,
  AlertTriangle,
  RefreshCcw,
  MessageSquare,
  RotateCcw,
  ChevronRight,
  Zap,
  Star,
  Shield,
  Leaf,
  Info,
  Edit3,
  XCircle,
  Home,
  Building,
  ClipboardList,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  DeliveryWaypoint,
  AntiGravityRoutePlan,
  computeAntiGravityRoute,
  optimizeSmartDeliveryRoute,
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { isValidLatLng } from '../../utils/latLngValidator';

// ─── Coordinate resolver ────────────────────────────────────────────────────
export function resolveLogisticsCoordinates(inputAddress: string): { lat: number; lng: number; formatted: string } {
  const clean = (inputAddress || '').toLowerCase().trim();

  if (clean.includes('trident') || clean.includes('tat'))
    return { lat: 20.3542, lng: 85.8078, formatted: 'Trident Academy of Technology, Chandaka Industrial Estate, Patia, Bhubaneswar' };

  const normalized = clean.replace(/[\s\-_]+/g, '');
  if (clean.includes('mani') || clean.includes('tribhuban') || clean.includes('tribhuvan') || normalized.includes('manitribhuban'))
    return { lat: 20.3688, lng: 85.8242, formatted: 'Mani Tribhuban, Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (751024)' };

  const popMatch = POPULAR_INDIAN_LOCATIONS.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean) || loc.formattedAddress.toLowerCase().includes(clean)
  );
  if (popMatch?.lat && popMatch?.lng)
    return { lat: popMatch.lat, lng: popMatch.lng, formatted: popMatch.formattedAddress || popMatch.name };

  const locMatch = BHUBANESWAR_LOCALITIES.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean)
  );
  if (locMatch) return { lat: locMatch.lat, lng: locMatch.lng, formatted: `${locMatch.name}, Bhubaneswar` };

  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (clean.includes(key) || key.includes(clean))
      return { lat: coords[0], lng: coords[1], formatted: `${key.toUpperCase()}, Bhubaneswar` };
  }

  if (clean.includes('kiit')) return { lat: 20.3541, lng: 85.8175, formatted: 'KIIT Square, Patia, Bhubaneswar' };
  if (clean.includes('unit 2') || clean.includes('unit-2')) return { lat: 20.2721, lng: 85.8341, formatted: 'Unit 2, Market Building, Bhubaneswar' };
  if (clean.includes('lingaraj')) return { lat: 20.2382, lng: 85.8338, formatted: 'Lingaraj Temple, Old Town, Bhubaneswar' };
  if (clean.includes('vani vihar')) return { lat: 20.3015, lng: 85.8458, formatted: 'Vani Vihar Square, Bhubaneswar' };
  if (clean.includes('rasulgarh')) return { lat: 20.2974, lng: 85.8647, formatted: 'Rasulgarh Square, NH-16, Bhubaneswar' };
  if (clean.includes('master canteen')) return { lat: 20.2667, lng: 85.8436, formatted: 'Master Canteen Square, Railway Station' };
  if (clean.includes('baramunda')) return { lat: 20.2818, lng: 85.7938, formatted: 'Baramunda ISBT Hub, Bhubaneswar' };

  const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return { lat: 20.315 + ((hash % 100) / 100 - 0.5) * 0.05, lng: 85.82 + (((hash >> 2) % 100) / 100 - 0.5) * 0.05, formatted: inputAddress };
}

// ─── Types ──────────────────────────────────────────────────────────────────
type ShipmentStatus = 'confirmed' | 'picked_up' | 'at_hub' | 'out_for_delivery' | 'delivered' | 'delayed';

interface Shipment {
  id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: 'standard' | 'fragile' | 'temperature' | 'special';
  weight: string;
  deliveryPreference: 'fastest' | 'cheapest' | 'eco';
  status: ShipmentStatus;
  createdAt: string;
  estimatedDelivery: string;
  driverName: string;
  vehicleNumber: string;
  driverPhone: string;
  timeline: { status: ShipmentStatus; label: string; time: string; done: boolean }[];
  lat: number;
  lng: number;
  pod?: { receiverName: string; signature: string; otp: string; photoUrl?: string; notes: string; deliveredAt: string };
}

// ─── Demo data ───────────────────────────────────────────────────────────────
const DEMO_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-001', trackingId: 'MSF-20240901-001',
    senderName: 'Trident Academy of Technology', receiverName: 'Rahul Sharma', receiverPhone: '+91 98765 43210',
    pickupAddress: 'Trident Academy of Technology, Patia, Bhubaneswar',
    deliveryAddress: 'Saheed Nagar, Janpath, Bhubaneswar',
    packageType: 'standard', weight: '2.5 kg', deliveryPreference: 'fastest', status: 'out_for_delivery',
    createdAt: '09/09 09:00', estimatedDelivery: 'Today, 2:30 PM',
    driverName: 'Bibek Sahoo', vehicleNumber: 'OD-05-AB-1234', driverPhone: '+91 94370 55501',
    timeline: [
      { status: 'confirmed', label: 'Order Confirmed', time: '09:00 AM', done: true },
      { status: 'picked_up', label: 'Picked Up', time: '10:15 AM', done: true },
      { status: 'at_hub', label: 'At Logistics Hub', time: '11:30 AM', done: true },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '12:45 PM', done: true },
      { status: 'delivered', label: 'Delivered', time: '--', done: false },
    ],
    lat: 20.2850, lng: 85.8340,
  },
  {
    id: 'sh-002', trackingId: 'MSF-20240901-002',
    senderName: 'Flipkart Seller', receiverName: 'Priya Das', receiverPhone: '+91 97654 32109',
    pickupAddress: 'Baramunda ISBT Hub, Bhubaneswar',
    deliveryAddress: 'KIIT Square, Patia, Bhubaneswar',
    packageType: 'fragile', weight: '1.2 kg', deliveryPreference: 'eco', status: 'at_hub',
    createdAt: '09/09 08:30', estimatedDelivery: 'Today, 4:00 PM',
    driverName: 'Sanjay Patra', vehicleNumber: 'OD-05-CD-5678', driverPhone: '+91 94370 55502',
    timeline: [
      { status: 'confirmed', label: 'Order Confirmed', time: '08:30 AM', done: true },
      { status: 'picked_up', label: 'Picked Up', time: '09:45 AM', done: true },
      { status: 'at_hub', label: 'At Logistics Hub', time: '11:00 AM', done: true },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '--', done: false },
      { status: 'delivered', label: 'Delivered', time: '--', done: false },
    ],
    lat: 20.2818, lng: 85.7938,
  },
  {
    id: 'sh-003', trackingId: 'MSF-20240901-003',
    senderName: 'Amazon Seller', receiverName: 'Suresh Nayak', receiverPhone: '+91 96543 21098',
    pickupAddress: 'Rasulgarh Square, NH-16, Bhubaneswar',
    deliveryAddress: 'Lingaraj Temple Road, Old Town, Bhubaneswar',
    packageType: 'standard', weight: '4.0 kg', deliveryPreference: 'cheapest', status: 'delayed',
    createdAt: '08/09 14:00', estimatedDelivery: 'Tomorrow, 11:00 AM (Delayed)',
    driverName: 'Manash Tripathy', vehicleNumber: 'OD-05-EF-9012', driverPhone: '+91 94370 55503',
    timeline: [
      { status: 'confirmed', label: 'Order Confirmed', time: 'Yesterday 2:00 PM', done: true },
      { status: 'picked_up', label: 'Picked Up', time: 'Yesterday 4:30 PM', done: true },
      { status: 'at_hub', label: 'At Logistics Hub', time: 'Yesterday 6:00 PM', done: true },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: 'Today 9:00 AM', done: true },
      { status: 'delivered', label: 'Delayed — Tomorrow', time: 'Delayed', done: false },
    ],
    lat: 20.2382, lng: 85.8338,
  },
];

// ─── Config maps ─────────────────────────────────────────────────────────────
const statusConfig: Record<ShipmentStatus, { label: string; color: string; bg: string; dotColor: string }> = {
  confirmed:          { label: 'Confirmed',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   dotColor: 'bg-blue-500' },
  picked_up:          { label: 'Picked Up',        color: 'text-indigo-400', bg: 'bg-indigo-500/15', dotColor: 'bg-indigo-500' },
  at_hub:             { label: 'At Hub',           color: 'text-yellow-400', bg: 'bg-yellow-500/15', dotColor: 'bg-yellow-500' },
  out_for_delivery:   { label: 'Out for Delivery', color: 'text-orange-400', bg: 'bg-orange-500/15', dotColor: 'bg-orange-500' },
  delivered:          { label: 'Delivered',        color: 'text-green-400',  bg: 'bg-green-500/15',  dotColor: 'bg-green-500' },
  delayed:            { label: 'Delayed',          color: 'text-red-400',    bg: 'bg-red-500/15',    dotColor: 'bg-red-500' },
};

const packageTypeConfig: Record<string, { label: string; icon: string; desc: string }> = {
  standard:    { label: 'Standard',              icon: '📦', desc: 'Regular items, books, clothes' },
  fragile:     { label: 'Fragile',               icon: '🔮', desc: 'Electronics, glassware' },
  temperature: { label: 'Temperature-Sensitive', icon: '🌡️', desc: 'Food, medicine, cold chain' },
  special:     { label: 'Special Handling',      icon: '⭐', desc: 'Oversized or extra care' },
};

const deliveryPrefConfig: Record<string, { label: string; icon: React.FC<{className?: string; size?: number}>; desc: string; eta: string }> = {
  fastest:  { label: 'Fast Delivery', icon: Zap,  desc: 'Priority dispatch',   eta: '2–4 hrs' },
  cheapest: { label: 'Low Cost',      icon: Star, desc: 'Scheduled batch',     eta: '6–12 hrs' },
  eco:      { label: 'Eco-Friendly',  icon: Leaf, desc: 'Green vehicle route', eta: '4–8 hrs' },
};

const BBSR_QUICK_LOCATIONS = [
  'Trident Academy of Technology, Patia',
  'KIIT Square, Patia',
  'Master Canteen Square, Bhubaneswar',
  'Rasulgarh Square, NH-16',
  'Saheed Nagar, Janpath',
  'Unit 2 Market, Bhubaneswar',
  'Baramunda ISBT Hub',
  'Vani Vihar Square',
  'Infocity, DLF Cybercity, Patia',
  'Mani Tribhuban, Nandankanan Road',
  'Lingaraj Temple Road, Old Town',
  'Nayapalli, IRC Village',
  'Cuttack Road, Bidyadharpur',
  'Station Square, Bhubaneswar',
  'Pokhariput, Bhubaneswar',
];

function generateTrackingId() {
  const d = new Date();
  const ds = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `MSF-${ds}-${Math.floor(100 + Math.random() * 900)}`;
}

const createSimplePin = (color: string, label: string) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;gap:4px;transform:translate(-13px,-13px)"><div style="width:26px;height:26px;border-radius:50%;background:${color};color:#fff;font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.5)">${label}</div></div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
  });

// ─── Props ────────────────────────────────────────────────────────────────────
interface LogisticsHubProps {
  onNavigateToMap?: () => void;
  waypoints?: DeliveryWaypoint[];
  onWaypointsChange?: (waypoints: DeliveryWaypoint[]) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
export const LogisticsHubView: React.FC<LogisticsHubProps> = ({ onNavigateToMap, waypoints: externalWaypoints, onWaypointsChange }) => {

  type View = 'home' | 'create' | 'track' | 'detail';
  const [view, setView] = useState<View>('home');
  const [toast, setToast] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>(DEMO_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState<Shipment | null>(null);
  const [trackError, setTrackError] = useState('');
  const [podShipment, setPodShipment] = useState<Shipment | null>(null);

  // Create wizard
  const [step, setStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState('Trident Academy of Technology, Patia');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageType, setPackageType] = useState<'standard' | 'fragile' | 'temperature' | 'special'>('standard');
  const [weight, setWeight] = useState('');
  const [deliveryPref, setDeliveryPref] = useState<'fastest' | 'cheapest' | 'eco'>('fastest');
  const [pickupSugs, setPickupSugs] = useState<string[]>([]);
  const [deliverySugs, setDeliverySugs] = useState<string[]>([]);

  const showToast = (msg: string, ms = 3000) => { setToast(msg); setTimeout(() => setToast(null), ms); };
  const filterLocs = (q: string) => q.length < 2 ? [] : BBSR_QUICK_LOCATIONS.filter(l => l.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  const activeCount = shipments.filter(s => s.status !== 'delivered').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const delayedCount = shipments.filter(s => s.status === 'delayed').length;

  const canProceed = () => {
    if (step === 1) return pickupAddress.trim().length > 3 && deliveryAddress.trim().length > 3;
    if (step === 2) return receiverName.trim().length > 1;
    return true;
  };

  const handleCreateShipment = () => {
    const resolved = resolveLogisticsCoordinates(deliveryAddress);
    const trackingId = generateTrackingId();
    const now = new Date();
    const etaH = deliveryPref === 'fastest' ? 3 : deliveryPref === 'cheapest' ? 9 : 6;
    const eta = new Date(now.getTime() + etaH * 3600000);
    const etaStr = `Today, ${eta.getHours()}:${String(eta.getMinutes()).padStart(2,'0')} ${eta.getHours() >= 12 ? 'PM' : 'AM'}`;
    const drivers = ['Bibek Sahoo','Sanjay Patra','Manash Tripathy','Rohan Mishra'];
    const vehicles = ['OD-05-AB-1234','OD-05-CD-5678','OD-05-EF-9012','OD-05-GH-3456'];
    const phones = ['+91 94370 55501','+91 94370 55502','+91 94370 55503','+91 94370 55504'];
    const di = Math.floor(Math.random() * 4);
    const newShipment: Shipment = {
      id: `sh-${Date.now()}`, trackingId,
      senderName: 'Trident Academy of Technology', receiverName: receiverName || 'Customer',
      receiverPhone: receiverPhone || '+91 XXXXX XXXXX', pickupAddress, deliveryAddress: resolved.formatted,
      packageType, weight: weight ? `${weight} kg` : '1–5 kg', deliveryPreference: deliveryPref, status: 'confirmed',
      createdAt: `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`,
      estimatedDelivery: etaStr, driverName: drivers[di], vehicleNumber: vehicles[di], driverPhone: phones[di],
      timeline: [
        { status: 'confirmed', label: 'Order Confirmed', time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`, done: true },
        { status: 'picked_up', label: 'Picked Up', time: '--', done: false },
        { status: 'at_hub', label: 'At Logistics Hub', time: '--', done: false },
        { status: 'out_for_delivery', label: 'Out for Delivery', time: '--', done: false },
        { status: 'delivered', label: 'Delivered', time: '--', done: false },
      ],
      lat: resolved.lat, lng: resolved.lng,
    };
    setShipments(prev => [newShipment, ...prev]);
    showToast(`✅ Shipment created! ID: ${trackingId}`);
    setStep(1); setDeliveryAddress(''); setReceiverName(''); setReceiverPhone('');
    setPackageType('standard'); setWeight(''); setDeliveryPref('fastest');
    setSelectedShipment(newShipment); setView('detail');
  };

  const handleTrack = () => {
    setTrackError('');
    const found = shipments.find(s => s.trackingId.toLowerCase() === trackingQuery.toLowerCase().trim());
    if (found) { setTrackedResult(found); } else { setTrackedResult(null); setTrackError('No shipment found. Please check your tracking ID.'); }
  };

  const handleDelayAction = (action: string, shipment: Shipment) => {
    const msgs: Record<string, string> = {
      call_driver: `📞 Calling ${shipment.driverName}... ${shipment.driverPhone}`,
      reschedule: '📅 Reschedule request sent. Confirmation coming soon.',
      change_address: '📍 Address change request submitted.',
      cancel: '❌ Cancellation sent. Refund in 3–5 business days.',
      notify_customer: '🔔 Customer notified via SMS.',
    };
    showToast(msgs[action] || 'Done!');
  };

  const handleCompletePOD = (
    shipmentId: string,
    podData: { receiverName: string; signature: string; otp: string; photoUrl?: string; notes: string; deliveredAt: string }
  ) => {
    setShipments(prev => prev.map(s =>
      s.id === shipmentId
        ? { ...s, status: 'delivered', pod: podData, timeline: s.timeline.map(t => t.status === 'delivered' ? { ...t, time: podData.deliveredAt, done: true } : t) }
        : s
    ));
    if (selectedShipment?.id === shipmentId) setSelectedShipment(prev => prev ? { ...prev, status: 'delivered', pod: podData } : prev);
    setPodShipment(null);
    showToast(`🎉 Delivery confirmed for ${podData.receiverName}!`);
  };

  const originHub = { lat: 20.2818, lng: 85.7938 };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#070B14] text-white relative overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#0F172A] border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl max-w-xs text-center pointer-events-none">
          {toast}
        </div>
      )}

      {/* e-POD Modal */}
      {podShipment && (() => {
        const wp: DeliveryWaypoint = {
          id: podShipment.id, recipientName: podShipment.receiverName, phone: podShipment.receiverPhone,
          address: podShipment.deliveryAddress, lat: podShipment.lat, lng: podShipment.lng,
          altitudeMeters: 45, packageWeightKg: 2, parcelType: podShipment.packageType,
          priority: 'Standard', status: 'in_transit', ecoPackaging: true, dockingStatus: 'ALIGNED_LOCKED', dockingToleranceCm: 7,
        };
        return <ProofOfDeliveryModal isOpen={true} waypoint={wp} stopIndex={0} onCompletePOD={(id, data) => handleCompletePOD(podShipment.id, data)} onClose={() => setPodShipment(null)} />;
      })()}

      {/* ═══ HOME VIEW ═══════════════════════════════════════════════════════ */}
      {view === 'home' && (
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="bg-[#0C1220] border-b border-white/5 px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold text-white">Musafir Delivery</h1>
                <p className="text-xs text-slate-400">Bhubaneswar Logistics Network</p>
              </div>
              <button onClick={() => showToast(delayedCount > 0 ? `⚠️ ${delayedCount} delayed shipment(s) need attention.` : '🔔 All shipments on track!')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                <Bell size={18} className="text-slate-400" />
                {delayedCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{delayedCount}</span>}
              </button>
            </div>
            {/* KPIs */}
            <div className="flex gap-2">
              {[{l:'Active', v:activeCount, c:'text-blue-400', b:'bg-blue-500/10'},{l:'Delivered', v:deliveredCount, c:'text-green-400', b:'bg-green-500/10'},{l:'Delayed', v:delayedCount, c:'text-red-400', b:'bg-red-500/10'}].map(k => (
                <div key={k.l} className={`flex-1 ${k.b} rounded-xl px-3 py-2 text-center`}>
                  <p className={`text-xl font-bold ${k.c}`}>{k.v}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-4 mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => { setView('create'); setStep(1); }}
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20">
              <Plus size={24} />
              <span className="text-sm font-semibold">Create Shipment</span>
            </button>
            <button onClick={() => { setView('track'); setTrackedResult(null); setTrackingQuery(''); setTrackError(''); }}
              className="flex flex-col items-center gap-2 bg-[#0F172A] border border-white/10 rounded-2xl p-4 hover:bg-white/5 transition-all">
              <Search size={24} className="text-slate-300" />
              <span className="text-sm font-semibold text-slate-300">Track Shipment</span>
            </button>
          </div>

          {/* Shipments list */}
          <div className="px-4 mt-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">My Shipments</h2>
            {shipments.length === 0 && (
              <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-8 text-center">
                <Package size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No shipments yet. Create your first one!</p>
              </div>
            )}
            <div className="flex flex-col gap-3 pb-6">
              {shipments.map(shipment => {
                const cfg = statusConfig[shipment.status];
                return (
                  <button key={shipment.id} onClick={() => { setSelectedShipment(shipment); setView('detail'); }}
                    className="w-full text-left bg-[#0F172A] border border-white/5 rounded-2xl p-4 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} inline-block`} />
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{shipment.trackingId}</span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">To: {shipment.receiverName}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{shipment.deliveryAddress}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-500">ETA</p>
                        <p className="text-xs font-medium text-slate-300">{shipment.estimatedDelivery.replace('Today, ','')}</p>
                        <ChevronRight size={14} className="text-slate-600 ml-auto mt-1" />
                      </div>
                    </div>
                    {/* Mini progress */}
                    <div className="mt-3 flex gap-1">
                      {shipment.timeline.map((t, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${t.done ? (shipment.status === 'delayed' && i === shipment.timeline.length-1 ? 'bg-red-500' : 'bg-blue-500') : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE SHIPMENT VIEW ════════════════════════════════════════════ */}
      {view === 'create' && (
        <div className="flex flex-col h-full">
          <div className="bg-[#0C1220] border-b border-white/5 px-4 py-3 flex items-center gap-3">
            <button onClick={() => setView('home')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-slate-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white">New Shipment</h1>
              <p className="text-[10px] text-slate-400">Step {step} of 4</p>
            </div>
          </div>

          {/* Step bar */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex gap-1.5">
              {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-white/10'}`} />)}
            </div>
            <div className="flex justify-between mt-1">
              {['Locations','Receiver','Package','Confirm'].map((l, i) => (
                <span key={i} className={`text-[9px] ${i < step ? 'text-blue-400' : 'text-slate-600'}`}>{l}</span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">

            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold">Where to send?</h2>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1"><Home size={11} className="text-blue-400" /> Pickup Location</label>
                  <input value={pickupAddress} onChange={e => { setPickupAddress(e.target.value); setPickupSugs(filterLocs(e.target.value)); }}
                    onFocus={() => setPickupSugs(filterLocs(pickupAddress))} onBlur={() => setTimeout(() => setPickupSugs([]), 200)}
                    placeholder="Pickup address..." className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                  {pickupSugs.length > 0 && (
                    <div className="mt-1 bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden">
                      {pickupSugs.map(s => <button key={s} onMouseDown={() => { setPickupAddress(s); setPickupSugs([]); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 last:border-0"><MapPin size={11} className="inline mr-1.5 text-slate-500" />{s}</button>)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1"><MapPin size={11} className="text-green-400" /> Delivery Location</label>
                  <input value={deliveryAddress} onChange={e => { setDeliveryAddress(e.target.value); setDeliverySugs(filterLocs(e.target.value)); }}
                    onFocus={() => setDeliverySugs(filterLocs(deliveryAddress))} onBlur={() => setTimeout(() => setDeliverySugs([]), 200)}
                    placeholder="Search delivery address in Bhubaneswar..." className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50" />
                  {deliverySugs.length > 0 && (
                    <div className="mt-1 bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden">
                      {deliverySugs.map(s => <button key={s} onMouseDown={() => { setDeliveryAddress(s); setDeliverySugs([]); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 last:border-0"><MapPin size={11} className="inline mr-1.5 text-slate-500" />{s}</button>)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Quick picks</p>
                  <div className="flex flex-wrap gap-2">
                    {['KIIT Square','Master Canteen','Rasulgarh NH-16','Saheed Nagar','Unit 2 Market','Baramunda Hub'].map(loc => (
                      <button key={loc} onClick={() => setDeliveryAddress(loc)} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors">{loc}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold">Receiver Details</h2>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Receiver Name *</label>
                  <input value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="Full name of receiver..."
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Phone Number</label>
                  <input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel"
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wide">Route</p>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center mt-1 gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /><div className="w-0.5 h-6 bg-white/10" /><div className="w-2 h-2 rounded-full bg-green-400" /></div>
                    <div className="flex flex-col gap-2 flex-1"><p className="text-xs text-slate-300 truncate">{pickupAddress}</p><p className="text-xs text-slate-300 truncate">{deliveryAddress}</p></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold">Package Details</h2>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">Package Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(packageTypeConfig).map(([key, cfg]) => (
                      <button key={key} onClick={() => setPackageType(key as typeof packageType)}
                        className={`p-3 rounded-xl border text-left transition-all ${packageType === key ? 'bg-blue-500/15 border-blue-500/50' : 'bg-[#0F172A] border-white/10 hover:border-white/20'}`}>
                        <span className="text-xl block mb-1">{cfg.icon}</span>
                        <p className={`text-xs font-semibold ${packageType === key ? 'text-white' : 'text-slate-300'}`}>{cfg.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cfg.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Approx. Weight (kg)</label>
                  <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 2.5" type="number" step="0.1" min="0.1"
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">Delivery Preference</label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(deliveryPrefConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => setDeliveryPref(key as typeof deliveryPref)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${deliveryPref === key ? 'bg-blue-500/15 border-blue-500/50' : 'bg-[#0F172A] border-white/10 hover:border-white/20'}`}>
                          <Icon size={18} className={deliveryPref === key ? 'text-blue-400' : 'text-slate-500'} />
                          <div className="flex-1 text-left">
                            <p className={`text-sm font-semibold ${deliveryPref === key ? 'text-white' : 'text-slate-300'}`}>{cfg.label}</p>
                            <p className="text-[11px] text-slate-500">{cfg.desc}</p>
                          </div>
                          <span className={`text-xs font-bold ${deliveryPref === key ? 'text-blue-400' : 'text-slate-500'}`}>{cfg.eta}</span>
                          {deliveryPref === key && <Check size={14} className="text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold">Confirm & Book</h2>
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                  {[
                    {l:'Pickup', v: pickupAddress},
                    {l:'Delivery', v: deliveryAddress},
                    {l:'Receiver', v: `${receiverName || 'Not specified'}${receiverPhone ? ' · '+receiverPhone : ''}`},
                    {l:'Package', v: `${packageTypeConfig[packageType].icon} ${packageTypeConfig[packageType].label}${weight ? ` · ${weight} kg` : ''}`},
                    {l:'Preference', v: `${deliveryPrefConfig[deliveryPref].label} (${deliveryPrefConfig[deliveryPref].eta})`},
                  ].map((r, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                      <p className="text-xs text-slate-500 w-20 shrink-0 pt-0.5">{r.l}</p>
                      <p className="text-xs text-slate-200 flex-1">{r.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Clock size={18} className="text-green-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Estimated Delivery</p>
                    <p className="text-sm font-bold text-green-400">{deliveryPrefConfig[deliveryPref].eta} from now</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 text-center">By confirming, our logistics team will dispatch your shipment. You will receive live updates.</p>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="border-t border-white/5 bg-[#0C1220] p-4 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(s => s-1)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors">Back</button>
            )}
            {step < 4 ? (
              <button onClick={() => { if (canProceed()) setStep(s => s+1); else showToast('⚠️ Please fill in the required fields'); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${canProceed() ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                Continue <ChevronRight size={14} className="inline" />
              </button>
            ) : (
              <button onClick={handleCreateShipment} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all">
                ✅ Confirm Shipment
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══ TRACK VIEW ══════════════════════════════════════════════════════ */}
      {view === 'track' && (
        <div className="flex flex-col h-full">
          <div className="bg-[#0C1220] border-b border-white/5 px-4 py-3 flex items-center gap-3">
            <button onClick={() => setView('home')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ArrowLeft size={18} className="text-slate-400" /></button>
            <h1 className="text-sm font-bold">Track Shipment</h1>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex gap-2 mb-4">
              <input value={trackingQuery} onChange={e => setTrackingQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="Enter Tracking ID (e.g. MSF-20240901-001)" className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono" />
              <button onClick={handleTrack} className="px-4 py-3 bg-blue-600 rounded-xl text-white text-sm font-semibold hover:bg-blue-500 transition-colors">Track</button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Demo tracking IDs:</p>
              <div className="flex flex-col gap-1.5">
                {shipments.slice(0, 3).map(s => (
                  <button key={s.id} onClick={() => { setTrackingQuery(s.trackingId); setTrackedResult(s); setTrackError(''); }}
                    className="text-left text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 transition-colors font-mono flex justify-between items-center">
                    <span>{s.trackingId}</span>
                    <span className={`text-[10px] ${statusConfig[s.status].color}`}>{statusConfig[s.status].label}</span>
                  </button>
                ))}
              </div>
            </div>
            {trackError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm mb-4"><AlertTriangle size={16} /> {trackError}</div>}
            {trackedResult && (() => {
              const cfg = statusConfig[trackedResult.status];
              return (
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                  <div className={`${cfg.bg} p-4`}>
                    <div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} /><span className={`text-base font-bold ${cfg.color}`}>{cfg.label}</span></div>
                    <p className="text-xs text-slate-400 font-mono">{trackedResult.trackingId}</p>
                    <p className="text-sm text-white mt-1 font-semibold">ETA: {trackedResult.estimatedDelivery}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Timeline</p>
                    {trackedResult.timeline.map((t, i) => {
                      const isLast = i === trackedResult.timeline.length - 1;
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${t.done ? (trackedResult.status === 'delayed' && isLast ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500') : 'border-white/20'}`} />
                            {!isLast && <div className={`w-0.5 h-7 ${t.done ? 'bg-blue-500/40' : 'bg-white/10'}`} />}
                          </div>
                          <div className="pb-4">
                            <p className={`text-sm font-semibold ${t.done ? 'text-white' : 'text-slate-500'}`}>{t.label}</p>
                            <p className="text-[11px] text-slate-500">{t.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center"><User size={16} className="text-blue-400" /></div>
                      <div><p className="text-sm font-semibold">{trackedResult.driverName}</p><p className="text-xs text-slate-400">{trackedResult.vehicleNumber}</p></div>
                    </div>
                    <button onClick={() => showToast(`📞 Calling ${trackedResult.driverName}...`)}
                      className="flex items-center gap-1.5 bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-600/30 transition-colors">
                      <PhoneCall size={13} /> Call
                    </button>
                  </div>
                  <div className="border-t border-white/5 p-3">
                    <button onClick={() => { setSelectedShipment(trackedResult); setView('detail'); }} className="w-full py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/5 rounded-xl transition-colors">
                      View Full Details <ChevronRight size={14} className="inline" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ DETAIL VIEW ══════════════════════════════════════════════════════ */}
      {view === 'detail' && selectedShipment && (() => {
        const s = selectedShipment;
        const cfg = statusConfig[s.status];
        const isDelayed = s.status === 'delayed';
        const isDelivered = s.status === 'delivered';
        const mapCoords: [number, number][] = [[originHub.lat, originHub.lng]];
        if (isValidLatLng([s.lat, s.lng])) mapCoords.push([s.lat, s.lng]);

        return (
          <div className="flex flex-col h-full">
            <div className="bg-[#0C1220] border-b border-white/5 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setView('home')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ArrowLeft size={18} className="text-slate-400" /></button>
              <div className="flex-1"><h1 className="text-sm font-bold">Shipment Details</h1><p className="text-[10px] text-slate-500 font-mono">{s.trackingId}</p></div>
              <button onClick={() => { navigator.clipboard?.writeText(s.trackingId); showToast('📋 Tracking ID copied!'); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><Copy size={16} className="text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Status bar */}
              <div className={`${cfg.bg} border-b border-white/5 px-4 py-3`}>
                <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} /><span className={`text-base font-bold ${cfg.color}`}>{cfg.label}</span></div>
                <p className="text-xs text-slate-300 mt-1">ETA: <span className="font-semibold text-white">{s.estimatedDelivery}</span></p>
                {isDelayed && <p className="text-xs text-red-400 mt-1">⚠️ Road congestion causing delay. We apologize for the inconvenience.</p>}
              </div>

              {/* Map */}
              {mapCoords.length >= 1 && (
                <div className="h-36">
                  <MapContainer center={[s.lat || 20.315, s.lng || 85.82]} zoom={13} style={{ height: '100%', width: '100%' }}
                    zoomControl={false} attributionControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[originHub.lat, originHub.lng]} icon={createSimplePin('#F59E0B', '🏠')}><Popup>Pickup Hub</Popup></Marker>
                    {isValidLatLng([s.lat, s.lng]) && <Marker position={[s.lat, s.lng]} icon={createSimplePin('#10B981', '📍')}><Popup>{s.deliveryAddress}</Popup></Marker>}
                    {mapCoords.length >= 2 && <Polyline positions={mapCoords} pathOptions={{ color: isDelayed ? '#EF4444' : '#3B82F6', weight: 3, dashArray: isDelayed ? '6 4' : undefined }} />}
                  </MapContainer>
                </div>
              )}

              <div className="px-4 py-4 flex flex-col gap-4">
                {/* Timeline */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Delivery Progress</p>
                  {s.timeline.map((t, i) => {
                    const isLast = i === s.timeline.length - 1;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${t.done ? (isDelayed && isLast ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500') : 'border-white/20'}`} />
                          {!isLast && <div className={`w-0.5 h-7 ${t.done ? 'bg-blue-500/30' : 'bg-white/10'}`} />}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-semibold ${t.done ? 'text-white' : 'text-slate-500'}`}>{t.label}</p>
                          <p className="text-[11px] text-slate-500">{t.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Route */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Route</p>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center mt-1 gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-400" /><div className="w-0.5 h-8 bg-white/10" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div><p className="text-xs text-slate-400">From</p><p className="text-sm text-white">{s.pickupAddress}</p></div>
                      <div><p className="text-xs text-slate-400">To</p><p className="text-sm text-white">{s.deliveryAddress}</p></div>
                    </div>
                  </div>
                </div>

                {/* Package */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Package</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{packageTypeConfig[s.packageType]?.icon || '📦'}</span>
                    <div>
                      <p className="text-sm font-semibold">{packageTypeConfig[s.packageType]?.label || 'Standard'}</p>
                      <p className="text-xs text-slate-400">{s.weight} · {deliveryPrefConfig[s.deliveryPreference]?.label || 'Standard'}</p>
                    </div>
                  </div>
                </div>

                {/* Driver */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Delivery Agent</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><User size={18} className="text-blue-400" /></div>
                      <div><p className="text-sm font-bold">{s.driverName}</p><p className="text-xs text-slate-400">{s.vehicleNumber}</p></div>
                    </div>
                    <button onClick={() => showToast(`📞 Calling ${s.driverName}... ${s.driverPhone}`)}
                      className="flex items-center gap-1.5 bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-600/30 transition-colors">
                      <PhoneCall size={13} /> Call
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {!isDelivered && s.status === 'out_for_delivery' && (
                      <button onClick={() => setPodShipment(s)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl py-3 text-sm font-semibold hover:bg-green-600/30 transition-colors">
                        <FileCheck size={16} /> Confirm Delivery (e-POD)
                      </button>
                    )}
                    {isDelayed && (
                      <>
                        <button onClick={() => handleDelayAction('reschedule', s)} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-blue-500/20 transition-colors"><Calendar size={13} /> Reschedule</button>
                        <button onClick={() => handleDelayAction('change_address', s)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-white/10 transition-colors"><MapPin size={13} /> Change Address</button>
                        <button onClick={() => handleDelayAction('notify_customer', s)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-white/10 transition-colors"><MessageSquare size={13} /> Notify Customer</button>
                        <button onClick={() => handleDelayAction('cancel', s)} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-red-500/20 transition-colors"><XCircle size={13} /> Cancel Order</button>
                      </>
                    )}
                    {!isDelayed && !isDelivered && (
                      <>
                        <button onClick={() => handleDelayAction('reschedule', s)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-white/10 transition-colors"><Calendar size={13} /> Reschedule</button>
                        <button onClick={() => handleDelayAction('cancel', s)} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 px-3 text-xs font-semibold hover:bg-red-500/20 transition-colors"><XCircle size={13} /> Cancel</button>
                      </>
                    )}
                    <button onClick={() => { navigator.clipboard?.writeText(s.trackingId); showToast('📤 Tracking ID copied! Share with receiver.'); }}
                      className="col-span-2 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-white/10 transition-colors">
                      <Share2 size={13} /> Share Tracking ID
                    </button>
                  </div>
                </div>

                {isDelivered && s.pod && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">✅ Proof of Delivery</p>
                    <p className="text-xs text-slate-300">Received by: <span className="text-white font-semibold">{s.pod.receiverName}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">Delivered at: {s.pod.deliveredAt}</p>
                    {s.pod.notes && <p className="text-xs text-slate-400 mt-0.5 italic">"{s.pod.notes}"</p>}
                  </div>
                )}
                <div className="pb-2" />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
