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
  Navigation,
  ArrowRight,
  Sparkles,
  Layers,
  Send,
  AlertTriangle,
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
  RotateCcw,
  Calendar,
  FileCheck,
  Share2,
  Copy,
  ChevronRight,
  Shield,
  Leaf,
  Info,
  Building,
  BarChart3,
  Cpu,
  Compass,
  Radio,
  Sliders,
  CloudRain,
  Activity,
  SlidersHorizontal,
  Flame,
  BatteryCharging,
  Gauge,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Eye,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  DeliveryWaypoint,
  VehicleOption,
  VEHICLE_FLEET_OPTIONS,
  DRIVER_ROSTER,
  SAMPLE_DELIVERY_STOPS,
  optimizeSmartDeliveryRoute,
  OptimizationGoal,
  LIVE_TRAFFIC_CORRIDORS,
  predictStopETAWithAI,
  BHUBANESWAR_MFC_NETWORK,
  BHUBANESWAR_ZEZ_ZONES,
  BBSR_EV_CHARGERS,
  runUCCSimulation,
  UCCSimulationScenario,
  BHUBANESWAR_MAPPLS_PINS,
  resolveMapplsEloc,
  MONSOON_HAZARDS_BBSR,
  BBSR_SMART_SIGNALS,
  LIVE_CONTROL_TOWER_EXCEPTIONS,
  GOVT_INTEGRATIONS_REGISTRY,
} from '../../services/logisticsOptimizerService';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { isValidLatLng } from '../../utils/latLngValidator';

// ─── Map bounds auto-fitter ──────────────────────────────────────────────────
const MapBoundsAutoFit: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    const valid = coords.filter(isValidLatLng);
    if (valid.length > 0) {
      try {
        const bounds = L.latLngBounds(valid);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14, animate: true });
      } catch (e) {
        console.warn('Map fit bounds error:', e);
      }
    }
  }, [coords, map]);
  return null;
};

// ─── Custom Logistics Brand Logo ──────────────────────────────────────────────
export const MusafirLogisticsLogo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 36 }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/25"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full bg-[#0B1120] rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Hexagon & Fleet Grid Pattern */}
          <svg viewBox="0 0 40 40" className="w-full h-full text-blue-400 p-1.5" fill="none" stroke="currentColor">
            <path
              d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
              strokeWidth="2"
              strokeLinejoin="round"
              className="text-blue-500/60"
            />
            <path
              d="M20 4V36M6 12L34 28M34 12L6 28"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="text-indigo-400/40"
            />
            <circle cx="20" cy="20" r="4.5" fill="#3B82F6" className="animate-pulse" />
            <circle cx="20" cy="20" r="2" fill="#FFFFFF" />
            <circle cx="34" cy="12" r="2" fill="#F59E0B" />
            <circle cx="6" cy="28" r="2" fill="#10B981" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-white font-mono">MUSAFIR</span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
            LOGISTICS
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          Urban Freight & VRP Platform · SIH26215
        </span>
      </div>
    </div>
  );
};

// ─── Coordinate Resolver ──────────────────────────────────────────────────────
export function resolveLogisticsCoordinates(inputAddress: string): { lat: number; lng: number; formatted: string } {
  const clean = (inputAddress || '').toLowerCase().trim();

  // 1. Mappls PIN match
  const elocMatch = resolveMapplsEloc(clean);
  if (elocMatch) {
    return { lat: elocMatch.lat, lng: elocMatch.lng, formatted: `${elocMatch.placeName} [eLoc: ${elocMatch.elocPin}], ${elocMatch.fullAddress}` };
  }

  // 2. Trident Academy
  if (clean.includes('trident') || clean.includes('tat')) {
    return { lat: 20.3542, lng: 85.8078, formatted: 'Trident Academy of Technology, Chandaka Industrial Estate, Patia, Bhubaneswar' };
  }

  // 3. Mani Tribhuban
  const normalized = clean.replace(/[\s\-_]+/g, '');
  if (clean.includes('mani') || clean.includes('tribhuban') || normalized.includes('manitribhuban')) {
    return { lat: 20.3688, lng: 85.8242, formatted: 'Mani Tribhuban, Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (751024)' };
  }

  // 4. Popular Locations
  const popMatch = POPULAR_INDIAN_LOCATIONS.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean) || loc.formattedAddress.toLowerCase().includes(clean)
  );
  if (popMatch?.lat && popMatch?.lng) {
    return { lat: popMatch.lat, lng: popMatch.lng, formatted: popMatch.formattedAddress || popMatch.name };
  }

  // 5. Bhubaneswar Localities
  const locMatch = BHUBANESWAR_LOCALITIES.find(
    (loc) => clean.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(clean)
  );
  if (locMatch) return { lat: locMatch.lat, lng: locMatch.lng, formatted: `${locMatch.name}, Bhubaneswar` };

  // 6. Stop Coordinates Map
  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: coords[0], lng: coords[1], formatted: `${key.toUpperCase()}, Bhubaneswar` };
    }
  }

  // Landmark fallbacks
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

// ─── Leaflet Marker Helpers ──────────────────────────────────────────────────
const createPinIcon = (numberOrIcon: string | number, color: string, sublabel?: string) => {
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div style="display:flex;align-items:center;gap:4px;transform:translate(-14px,-14px);">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.6);
        ">
          ${numberOrIcon}
        </div>
        ${
          sublabel
            ? `<div style="
                background: rgba(12, 18, 33, 0.95);
                color: #f1f5f9;
                border: 1px solid rgba(255,255,255,0.25);
                font-weight: 700;
                font-size: 10px;
                padding: 1px 6px;
                border-radius: 5px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.6);
              ">${sublabel}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface LogisticsHubProps {
  onNavigateToMap?: () => void;
  waypoints?: DeliveryWaypoint[];
  onWaypointsChange?: (waypoints: DeliveryWaypoint[]) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOGISTICS OPTIMIZATION PLATFORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const LogisticsHubView: React.FC<LogisticsHubProps> = ({
  onNavigateToMap,
  waypoints: externalWaypoints,
  onWaypointsChange,
}) => {
  // Navigation Tabs
  type ModuleTab =
    | 'dynamic_router'
    | 'control_tower'
    | 'ai_eta_ml'
    | 'mfc_isochrone'
    | 'ev_zez_routing'
    | 'ucc_simulator'
    | 'govt_apis'
    | 'shipments';

  const [activeTab, setActiveTab] = useState<ModuleTab>('dynamic_router');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delivery Stops State
  const [internalWaypoints, setInternalWaypoints] = useState<DeliveryWaypoint[]>(SAMPLE_DELIVERY_STOPS);
  const waypoints = externalWaypoints ?? internalWaypoints;

  const setWaypoints = (newWps: DeliveryWaypoint[] | ((prev: DeliveryWaypoint[]) => DeliveryWaypoint[])) => {
    const updated = typeof newWps === 'function' ? newWps(waypoints) : newWps;
    setInternalWaypoints(updated);
    onWaypointsChange?.(updated);
  };

  const originHub = { name: 'Central Warehouse Depot (Baramunda)', lat: 20.2818, lng: 85.7938 };

  // Feature 1: Dynamic Router & VRP State
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>('balanced');
  const [selectedVehicleId, setSelectedVehicleId] = useState<'2_wheeler_ev' | 'e_van' | '14ft_e_truck' | 'mo_bus_cargo'>('e_van');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(DRIVER_ROSTER[0].id);
  const [isMonsoonMode, setIsMonsoonMode] = useState<boolean>(false);
  const [isDynamicRerouteActive, setIsDynamicRerouteActive] = useState<boolean>(false);
  const [newStopInput, setNewStopInput] = useState<string>('');
  const [mapplsPinInput, setMapplsPinInput] = useState<string>('');

  // Feature 2: AI ETA ML Prediction State
  const [selectedStopForAI, setSelectedStopForAI] = useState<DeliveryWaypoint | null>(waypoints[0] || null);

  // Feature 3: Micro-Fulfillment & Isochrone State
  const [selectedMFCId, setSelectedMFCId] = useState<string>(BHUBANESWAR_MFC_NETWORK[0].id);
  const [showIsochroneRings, setShowIsochroneRings] = useState<boolean>(true);

  // Feature 4: EV & ZEZ Routing State
  const [enforceZEZCompliance, setEnforceZEZCompliance] = useState<boolean>(true);
  const [currentBatterySOC, setCurrentBatterySOC] = useState<number>(76);

  // Feature 5: UCC Simulator State
  const [uccScenario, setUccScenario] = useState<UCCSimulationScenario>({
    consolidationLevelPercent: 65,
    fleetElectrificationPercent: 70,
    crossCarrierCollaboration: true,
    activeParcelVolumeDaily: 4500,
  });

  // Proof of Delivery Modal State
  const [podModalStop, setPodModalStop] = useState<{ waypoint: DeliveryWaypoint; index: number } | null>(null);

  const showToast = (msg: string, ms = 3200) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), ms);
  };

  // Active Vehicle Spec
  const activeVehicle = useMemo(() => {
    return VEHICLE_FLEET_OPTIONS.find((v) => v.id === selectedVehicleId) || VEHICLE_FLEET_OPTIONS[1];
  }, [selectedVehicleId]);

  // Active Driver Spec
  const activeDriver = useMemo(() => {
    return DRIVER_ROSTER.find((d) => d.id === selectedDriverId) || DRIVER_ROSTER[0];
  }, [selectedDriverId]);

  // Smart Optimization computation (OR-Tools heuristic + 2-Opt)
  const smartOptimization = useMemo(() => {
    const effectiveDisruption = isDynamicRerouteActive ? 'disrupt-1' : isMonsoonMode ? 'hz-1' : null;
    return optimizeSmartDeliveryRoute(originHub, waypoints, selectedVehicleId, optimizationGoal, effectiveDisruption);
  }, [originHub, waypoints, selectedVehicleId, optimizationGoal, isDynamicRerouteActive, isMonsoonMode]);

  // AI ETA Prediction for selected stop
  const aiEtaResult = useMemo(() => {
    if (!selectedStopForAI) return null;
    const distanceKm = Math.hypot(selectedStopForAI.lat - originHub.lat, selectedStopForAI.lng - originHub.lng) * 111 * 1.25;
    return predictStopETAWithAI(selectedStopForAI, distanceKm, isDynamicRerouteActive ? 'heavy' : 'moderate', isMonsoonMode);
  }, [selectedStopForAI, originHub, isDynamicRerouteActive, isMonsoonMode]);

  // UCC Simulation output
  const uccResult = useMemo(() => {
    return runUCCSimulation(uccScenario);
  }, [uccScenario]);

  // Map Coordinates for polyline
  const mapPolylinePoints = useMemo(() => {
    const points: [number, number][] = [[originHub.lat, originHub.lng]];
    for (const s of smartOptimization.optimizedStops) {
      if (isValidLatLng([s.lat, s.lng])) points.push([s.lat, s.lng]);
    }
    return points;
  }, [originHub, smartOptimization]);

  // Add Stop Handler
  const handleAddStop = (addressToAdd?: string) => {
    const target = addressToAdd || newStopInput;
    if (!target.trim()) return;

    const resolved = resolveLogisticsCoordinates(target);
    const newStop: DeliveryWaypoint = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientName: target.split(',')[0].trim(),
      phone: '+91 94370 ' + Math.floor(10000 + Math.random() * 90000),
      address: resolved.formatted,
      lat: resolved.lat,
      lng: resolved.lng,
      altitudeMeters: 45,
      packageWeightKg: 4.5,
      parcelCount: 1,
      parcelType: 'Standard',
      priority: 'Standard',
      status: 'pending',
      ecoPackaging: true,
      dockingStatus: 'ALIGNED_LOCKED',
      dockingToleranceCm: 6.5,
      assignedDriverId: selectedDriverId,
    };

    setWaypoints([...waypoints, newStop]);
    setNewStopInput('');
    showToast(`✅ Added delivery stop: "${newStop.recipientName}"`);
  };

  const handleMapplsPinSearch = () => {
    if (!mapplsPinInput.trim()) return;
    const match = resolveMapplsEloc(mapplsPinInput);
    if (match) {
      handleAddStop(match.fullAddress);
      setMapplsPinInput('');
      showToast(`📍 Found Mappls eLoc [${match.elocPin}]: ${match.placeName}`);
    } else {
      showToast(`⚠️ No eLoc PIN found for "${mapplsPinInput}". Try "BBS001", "KIIT09", "ISBT77"`);
    }
  };

  // Proof of Delivery Handler
  const handleCompletePOD = (
    waypointId: string,
    podData: { receiverName: string; signature: string; otp: string; photoUrl?: string; notes: string; deliveredAt: string }
  ) => {
    const updated = waypoints.map((w) => (w.id === waypointId ? { ...w, status: 'delivered' as const, pod: podData } : w));
    setWaypoints(updated);
    setPodModalStop(null);
    showToast(`🎉 e-POD confirmed for ${podData.receiverName}!`);
  };

  return (
    <div className="flex flex-col h-full bg-[#070B14] text-white select-none overflow-hidden">
      {/* ─── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#0F172A] border border-blue-500/40 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 pointer-events-none">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── PROOF OF DELIVERY MODAL ────────────────────────────────────────── */}
      {podModalStop && (
        <ProofOfDeliveryModal
          isOpen={true}
          waypoint={podModalStop.waypoint}
          stopIndex={podModalStop.index}
          onCompletePOD={handleCompletePOD}
          onClose={() => setPodModalStop(null)}
        />
      )}

      {/* ─── TOP PLATFORM HEADER & LOGISTICS LOGO ───────────────────────────── */}
      <div className="bg-[#0A0F1D] border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <MusafirLogisticsLogo />

        {/* Live System Badges */}
        <div className="flex items-center gap-2">
          {/* Monsoon Mode Quick Switch */}
          <button
            onClick={() => {
              setIsMonsoonMode(!isMonsoonMode);
              showToast(isMonsoonMode ? '☀️ Monsoon Mode Deactivated.' : '🌧️ Monsoon Mode Engaged: Waterlogged roads avoided!');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isMonsoonMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <CloudRain size={13} className={isMonsoonMode ? 'text-amber-400 animate-pulse' : ''} />
            <span>Monsoon Hazard Mode</span>
            <span className={`w-2 h-2 rounded-full ${isMonsoonMode ? 'bg-amber-400' : 'bg-slate-600'}`} />
          </button>

          {/* Dynamic Reroute Toggle */}
          <button
            onClick={() => {
              setIsDynamicRerouteActive(!isDynamicRerouteActive);
              showToast(
                !isDynamicRerouteActive
                  ? '⚡ Live Re-route Engaged! Rasulgarh congestion bypassed via Expressway.'
                  : '🔄 Standard route restored.'
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isDynamicRerouteActive
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/25'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <Zap size={13} className={isDynamicRerouteActive ? 'text-yellow-300' : ''} />
            <span>Dynamic Re-Routing</span>
          </button>
        </div>
      </div>

      {/* ─── MODULE NAVIGATION TABS ─────────────────────────────────────────── */}
      <div className="bg-[#0C1222] border-b border-white/5 px-3 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 shrink-0">
        {[
          { id: 'dynamic_router', label: '1. Dynamic Router & VRP', icon: Compass },
          { id: 'control_tower', label: '2. Control Tower', icon: Activity, badge: LIVE_CONTROL_TOWER_EXCEPTIONS.length },
          { id: 'ai_eta_ml', label: '3. AI ETA (ML/GNN)', icon: Cpu },
          { id: 'mfc_isochrone', label: '4. MFC & Isochrones', icon: Building },
          { id: 'ev_zez_routing', label: '5. EV & ZEZ Routing', icon: BatteryCharging },
          { id: 'ucc_simulator', label: '6. UCC "What-If" Simulator', icon: Sliders },
          { id: 'govt_apis', label: '7. Govt APIs (VAHAN/GST)', icon: ShieldCheck },
          { id: 'shipments', label: '8. Shipment Operations', icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ModuleTab)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-[10px] font-black text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 1: DYNAMIC ROUTER & VRP SOLVER
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dynamic_router' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Control Panel */}
            <div className="w-full md:w-96 bg-[#090E1A] border-r border-white/5 flex flex-col overflow-y-auto p-4 gap-4 shrink-0">
              {/* Optimization Goal Selector */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center justify-between">
                  <span>Optimization Objective</span>
                  <span className="text-[10px] text-blue-400 font-normal">Multi-Objective VRP</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-[#0D1424] p-1 rounded-xl border border-white/5">
                  {(['balanced', 'speed', 'cost', 'eco'] as OptimizationGoal[]).map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setOptimizationGoal(goal)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all ${
                        optimizationGoal === goal
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mappls 6-Digit eLoc Pin Input */}
              <div className="bg-[#0D1424] border border-blue-500/20 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <MapPin size={13} /> Mappls 6-Char eLoc Pin
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">India Digital Address</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={mapplsPinInput}
                    onChange={(e) => setMapplsPinInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleMapplsPinSearch()}
                    placeholder="e.g. BBS001, KIIT09, ISBT77"
                    maxLength={6}
                    className="flex-1 bg-[#090E1A] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 uppercase tracking-widest focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleMapplsPinSearch}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    Resolve
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2 overflow-x-auto">
                  {BHUBANESWAR_MAPPLS_PINS.slice(0, 3).map((pin) => (
                    <button
                      key={pin.elocPin}
                      onClick={() => {
                        setMapplsPinInput(pin.elocPin);
                        handleAddStop(pin.fullAddress);
                      }}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 text-slate-300 whitespace-nowrap"
                    >
                      {pin.elocPin} ({pin.placeName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Delivery Stop */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Add Delivery Drop
                </label>
                <div className="flex gap-2">
                  <input
                    value={newStopInput}
                    onChange={(e) => setNewStopInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
                    placeholder="Search Bhubaneswar address or landmark..."
                    className="flex-1 bg-[#0D1424] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAddStop()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Vehicle & Fleet Selector */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Assigned Fleet Vehicle
                </label>
                <div className="flex flex-col gap-1.5">
                  {VEHICLE_FLEET_OPTIONS.map((veh) => (
                    <button
                      key={veh.id}
                      onClick={() => setSelectedVehicleId(veh.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        selectedVehicleId === veh.id
                          ? 'bg-blue-600/15 border-blue-500/50 text-white'
                          : 'bg-[#0D1424] border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${veh.colorCode}20`, color: veh.colorCode }}
                        >
                          <Truck size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{veh.typeLabel}</p>
                          <p className="text-[10px] text-slate-400">
                            Payload: {veh.maxPayloadKg} kg · {veh.batteryRangeKm} km range
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-300">₹{veh.costPerKmInr}/km</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Waypoints Sequence List */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stops ({waypoints.length})
                  </span>
                  <button
                    onClick={() => {
                      setWaypoints(SAMPLE_DELIVERY_STOPS);
                      showToast('🔄 Benchmark stops reloaded.');
                    }}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {waypoints.map((wp, i) => (
                    <div
                      key={wp.id}
                      className="bg-[#0D1424] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">{wp.recipientName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{wp.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {wp.status === 'delivered' ? (
                          <span className="text-[10px] text-green-400 font-bold px-1.5 py-0.5 rounded bg-green-500/10">
                            ✓ Done
                          </span>
                        ) : (
                          <button
                            onClick={() => setPodModalStop({ waypoint: wp, index: i })}
                            className="text-[10px] text-blue-400 hover:bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 font-semibold"
                          >
                            e-POD
                          </button>
                        )}
                        <button
                          onClick={() => setWaypoints(waypoints.filter((w) => w.id !== wp.id))}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Map & Route Intelligence View */}
            <div className="flex-1 flex flex-col relative h-full">
              {/* Map Canvas */}
              <div className="flex-1 relative">
                <MapContainer
                  center={[originHub.lat, originHub.lng]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapBoundsAutoFit coords={mapPolylinePoints} />

                  {/* Origin Depot Pin */}
                  <Marker
                    position={[originHub.lat, originHub.lng]}
                    icon={createPinIcon('🏠', '#F59E0B', 'Baramunda ISBT Hub')}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-xs">{originHub.name}</p>
                        <p className="text-[10px] text-slate-600">Central Cross-Dock DC</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Stops Pins */}
                  {smartOptimization.optimizedStops.map((stop, i) => (
                    <Marker
                      key={stop.id}
                      position={[stop.lat, stop.lng]}
                      icon={createPinIcon(
                        stop.status === 'delivered' ? '✓' : i + 1,
                        stop.status === 'delivered' ? '#10B981' : '#3B82F6',
                        stop.recipientName
                      )}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-xs">
                            Stop #{i + 1}: {stop.recipientName}
                          </p>
                          <p className="text-[10px] text-slate-600">{stop.address}</p>
                          <p className="text-[10px] font-bold text-blue-600 mt-1">
                            Payload: {stop.packageWeightKg} kg · Status: {stop.status}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Optimized Route Polyline */}
                  {mapPolylinePoints.length >= 2 && (
                    <Polyline
                      positions={mapPolylinePoints}
                      pathOptions={{
                        color: isDynamicRerouteActive ? '#10B981' : isMonsoonMode ? '#F59E0B' : '#3B82F6',
                        weight: 4,
                        dashArray: isMonsoonMode ? '8 6' : undefined,
                      }}
                    />
                  )}

                  {/* ZEZ Protected Area Overlay */}
                  {BHUBANESWAR_ZEZ_ZONES.map((zez) => (
                    <Circle
                      key={zez.id}
                      center={[zez.centerLat, zez.centerLng]}
                      radius={zez.radiusKm * 1000}
                      pathOptions={{
                        color: '#10B981',
                        fillColor: '#10B981',
                        fillOpacity: 0.12,
                        weight: 2,
                        dashArray: '4 4',
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-xs text-green-700">🌿 {zez.name}</p>
                          <p className="text-[10px] text-slate-600">{zez.description}</p>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </MapContainer>

                {/* Floating Metrics Summary Bar */}
                <div className="absolute top-3 right-3 z-[1000] bg-[#0A0F1D]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Corridor</span>
                    <span className="font-bold text-white text-sm font-mono">
                      {smartOptimization.totalDistanceKm} km
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated SLA</span>
                    <span className="font-bold text-blue-400 text-sm font-mono">
                      {smartOptimization.estimatedMinutes} mins
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trip Cost</span>
                    <span className="font-bold text-amber-400 text-sm font-mono">
                      ₹{smartOptimization.costBreakdown.totalCostInr}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">CO₂ Saved</span>
                    <span className="font-bold text-green-400 text-sm font-mono">
                      {smartOptimization.co2SavedKg} kg
                    </span>
                  </div>
                </div>

                {/* Traffic Signals Live Advisory */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-[#0A0F1D]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Radio size={13} className="text-green-400 animate-pulse" /> ITMS Smart Signal Timers
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">GLOSA Advisory</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BBSR_SMART_SIGNALS.slice(0, 2).map((sig) => (
                      <div key={sig.junctionName} className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-semibold text-slate-300 truncate">{sig.junctionName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              sig.currentPhase === 'green' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {sig.currentPhase} ({sig.countdownSeconds}s)
                          </span>
                          <span className="text-[10px] font-mono text-blue-400">{sig.optimizedGreenSpeedKmH} km/h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 2: CONTROL TOWER & REAL-TIME EXCEPTION WORKFLOWS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'control_tower' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-400" /> Control Tower & Telemetry Visibility Layer
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time driver geofence tracking, automated exception handling, and SLA breach mitigation.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold font-mono">
                ● Telemetry Stream Active (2s pings)
              </span>
            </div>

            {/* Live Exception Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LIVE_CONTROL_TOWER_EXCEPTIONS.map((exc) => {
                const isCrit = exc.severity === 'critical';
                const isWarn = exc.severity === 'warning';
                return (
                  <div
                    key={exc.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 ${
                      isCrit
                        ? 'bg-red-500/10 border-red-500/30'
                        : isWarn
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCrit
                              ? 'bg-red-500/20 text-red-400'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {exc.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{exc.timestamp}</span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        {exc.driverName} ({exc.vehicleNumber})
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">{exc.message}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] text-slate-400 mb-2">Recommended Mitigation:</p>
                      <button
                        onClick={() => showToast(`⚡ Mitigation action triggered: "${exc.recommendedAction}"`)}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Zap size={13} className="text-amber-400" />
                        <span>{exc.recommendedAction}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Driver Roster Live Telemetry Table */}
            <div className="bg-[#0D1424] border border-white/5 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Truck size={16} className="text-blue-400" /> Active Fleet Dispatch & Driver Telemetry
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                      <th className="pb-2">Driver</th>
                      <th className="pb-2">Vehicle</th>
                      <th className="pb-2">Current Location</th>
                      <th className="pb-2">Trips Done</th>
                      <th className="pb-2">Rating</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {DRIVER_ROSTER.map((drv) => (
                      <tr key={drv.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center">
                            {drv.avatarInitials}
                          </div>
                          <span>{drv.name}</span>
                        </td>
                        <td className="py-3 font-mono text-slate-400">{drv.vehicleNumber}</td>
                        <td className="py-3 text-slate-300">{drv.currentLocation}</td>
                        <td className="py-3 font-mono">{drv.totalTrips}</td>
                        <td className="py-3 text-amber-400 font-bold">★ {drv.rating}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              drv.status === 'available'
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-blue-500/15 text-blue-400'
                            }`}
                          >
                            {drv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => showToast(`📞 Calling ${drv.name} at ${drv.phone}...`)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                          >
                            <PhoneCall size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 3: AI ETA PREDICTION & DELAY FORECASTING (ML / GNN)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai_eta_ml' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu size={20} className="text-indigo-400" /> AI ETA Prediction & Risk Forecasting (XGBoost + GNN)
                </h2>
                <p className="text-xs text-slate-400">
                  Spatio-Temporal Graph Neural Network predicting arrival confidence intervals and first-attempt failure probability.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                Model: GNN-BBS-v2.4 (94.2% Acc)
              </span>
            </div>

            {/* Select Drop for AI Inference */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {waypoints.map((stop, i) => (
                <button
                  key={stop.id}
                  onClick={() => setSelectedStopForAI(stop)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedStopForAI?.id === stop.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-[#0D1424] border-white/5 text-slate-400 hover:border-white/15'
                  }`}
                >
                  <p className="text-xs font-bold text-white truncate">
                    Stop #{i + 1}: {stop.recipientName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{stop.address}</p>
                  <span className="text-[10px] font-mono text-indigo-400 mt-2 block">
                    Weight: {stop.packageWeightKg} kg
                  </span>
                </button>
              ))}
            </div>

            {/* AI Inference Detail Breakdown */}
            {aiEtaResult && selectedStopForAI && (
              <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 block mb-1">Predicted Arrival</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {aiEtaResult.predictedArrivalFormatted}
                    </span>
                    <span className="text-[10px] text-indigo-400 block mt-1">
                      ± {aiEtaResult.confidenceIntervalMinutes} mins (95% CI)
                    </span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 block mb-1">Window Breach Risk</span>
                    <span className="text-xl font-bold text-amber-400 font-mono">
                      {aiEtaResult.timeWindowViolationRiskPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">SLA Target Risk</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 block mb-1">First-Attempt Failure Risk</span>
                    <span className="text-xl font-bold text-red-400 font-mono">
                      {aiEtaResult.firstAttemptFailureRiskPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Gate / Customer Absence</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 block mb-1">Stop Dwell Service Time</span>
                    <span className="text-xl font-bold text-green-400 font-mono">
                      {aiEtaResult.stopServiceTimeMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Unload + e-POD OTP</span>
                  </div>
                </div>

                {/* Feature Attribution (SHAP weights) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    ML Feature Contribution Weights (SHAP Analysis)
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {aiEtaResult.featureContributions.map((fc) => (
                      <div key={fc.name} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">{fc.name}</span>
                          <span className="font-mono text-indigo-400 font-bold">{fc.weightPercent}% weight</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${fc.weightPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 4: MICRO-FULFILLMENT CENTER (MFC) & ISOCHRONE NETWORK
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mfc_isochrone' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building size={20} className="text-amber-400" /> Micro-Fulfillment Center (MFC) Network Planning
                </h2>
                <p className="text-xs text-slate-400">
                  15 & 30-minute isochrone delivery zones, cross-docking hubs, and dark store inventory density in Bhubaneswar.
                </p>
              </div>
              <button
                onClick={() => setShowIsochroneRings(!showIsochroneRings)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  showIsochroneRings
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                {showIsochroneRings ? 'Isochrones Active' : 'Show Isochrones'}
              </button>
            </div>

            {/* MFC Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BHUBANESWAR_MFC_NETWORK.map((mfc) => (
                <div
                  key={mfc.id}
                  onClick={() => setSelectedMFCId(mfc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedMFCId === mfc.id
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-[#0D1424] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20">
                        {mfc.code}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{mfc.name}</h3>
                      <p className="text-xs text-slate-400">{mfc.zoneType}</p>
                    </div>
                    <span className="text-xs font-bold text-green-400 font-mono">
                      {mfc.currentUtilizationPercent}% Capacity
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center bg-white/5 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Daily Parcels</span>
                      <span className="text-xs font-bold text-white font-mono">{mfc.dailyCapacityParcels}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">15m Reach</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">{mfc.isochrone15MinRadiusKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cross-Dock</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">{mfc.crossDockingRatePercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>Active Fleet: {mfc.activeFleetCount} Vehicles</span>
                    <span className="text-slate-500">Connected: {mfc.connectedCarriers.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 5: MULTI-MODAL & EV-AWARE / ZERO-EMISSION ZONE (ZEZ) ROUTING
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ev_zez_routing' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BatteryCharging size={20} className="text-green-400" /> Multi-Modal & Zero-Emission Zone (ZEZ) Fleet
                  Manager
                </h2>
                <p className="text-xs text-slate-400">
                  Battery state-of-charge constraints, fast charger waypoint reservation, and green heritage zone compliance.
                </p>
              </div>
              <button
                onClick={() => setEnforceZEZCompliance(!enforceZEZCompliance)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  enforceZEZCompliance
                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                {enforceZEZCompliance ? '🌿 ZEZ Enforced' : 'ZEZ Optional'}
              </button>
            </div>

            {/* Battery State & Range Gauge */}
            <div className="bg-[#0D1424] border border-white/5 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  EV Fleet Battery SOC
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-green-400">{currentBatterySOC}%</span>
                  <span className="text-xs text-slate-400">({Math.round((currentBatterySOC / 100) * 140)} km range)</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={currentBatterySOC}
                  onChange={(e) => setCurrentBatterySOC(Number(e.target.value))}
                  className="w-full accent-green-500 mt-3"
                />
              </div>

              <div className="md:col-span-2 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Cost Efficiency vs Diesel Fleet
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">EV Power Cost</span>
                    <span className="text-sm font-bold text-green-400 font-mono">₹1.4 / km</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Diesel Baseline</span>
                    <span className="text-sm font-bold text-red-400 font-mono">₹7.8 / km</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Total Savings</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">82% Lower</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Charging Stations */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> Fast Charging Network in Bhubaneswar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BBSR_EV_CHARGERS.map((chg) => (
                  <div key={chg.id} className="bg-[#0D1424] border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-bold text-white">{chg.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{chg.operator}</p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-green-400 font-bold">{chg.fastChargersAvailable} Slots Free</span>
                      <span className="font-mono text-slate-300">{chg.powerKw} kW DC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 6: URBAN CONSOLIDATION CENTRE (UCC) "WHAT-IF" SIMULATOR
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ucc_simulator' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders size={20} className="text-purple-400" /> Urban Consolidation Centre (UCC) "What-If" Policy
                Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Quantify the city-wide impact of freight consolidation, multi-carrier collaboration, and fleet electrification.
              </p>
            </div>

            {/* Simulator Controls & Sliders */}
            <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">Centralized Consolidation Level</span>
                    <span className="font-mono text-purple-400">{uccScenario.consolidationLevelPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={uccScenario.consolidationLevelPercent}
                    onChange={(e) =>
                      setUccScenario({ ...uccScenario, consolidationLevelPercent: Number(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Reduces fragmented carrier trips entering city center.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">Fleet Electrification Level</span>
                    <span className="font-mono text-green-400">{uccScenario.fleetElectrificationPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={uccScenario.fleetElectrificationPercent}
                    onChange={(e) =>
                      setUccScenario({ ...uccScenario, fleetElectrificationPercent: Number(e.target.value) })
                    }
                    className="w-full accent-green-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Replaces diesel LCVs with zero-emission electric vans.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">Daily Urban Parcel Volume</span>
                    <span className="font-mono text-blue-400">{uccScenario.activeParcelVolumeDaily} pkgs</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={15000}
                    step={500}
                    value={uccScenario.activeParcelVolumeDaily}
                    onChange={(e) =>
                      setUccScenario({ ...uccScenario, activeParcelVolumeDaily: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">Cross-Carrier Shared Routing</p>
                    <p className="text-[10px] text-slate-400">Delhivery, BlueDart & Musafir joint last-mile drops</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={uccScenario.crossCarrierCollaboration}
                    onChange={(e) =>
                      setUccScenario({ ...uccScenario, crossCarrierCollaboration: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Results Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                <span className="text-xs text-purple-300 block mb-1">Vehicle-KM Reduction</span>
                <span className="text-2xl font-black text-purple-400 font-mono">
                  -{uccResult.vehicleKmReductionPercent}%
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Saved {uccResult.baselineVehicleKmDaily - uccResult.optimizedVehicleKmDaily} km / day
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                <span className="text-xs text-green-300 block mb-1">CO₂ Emissions Saved</span>
                <span className="text-2xl font-black text-green-400 font-mono">
                  {uccResult.co2EmissionsSavedKgDaily} kg
                </span>
                <p className="text-[10px] text-slate-400 mt-1">-{uccResult.co2ReductionPercent}% total emissions</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                <span className="text-xs text-blue-300 block mb-1">Daily Trips Saved</span>
                <span className="text-2xl font-black text-blue-400 font-mono">
                  {uccResult.totalTripsSavedDaily} trips
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Fewer commercial vans in city core</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <span className="text-xs text-amber-300 block mb-1">Cost / Parcel</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{uccResult.averageDeliveryCostPerParcelInr}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Reduced from baseline ₹38.0</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 7: GOVERNMENT & ENTERPRISE OPEN APIS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'govt_apis' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" /> Government of India & Enterprise Open API Integrations
              </h2>
              <p className="text-xs text-slate-400">
                Connected to National Logistics Portal, MoRTH VAHAN, GST E-Way Bill, and NPCI FASTag NETC.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOVT_INTEGRATIONS_REGISTRY.map((api) => (
                <div key={api.serviceName} className="bg-[#0D1424] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{api.serviceName}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        {api.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{api.category}</p>
                    <p className="text-xs text-slate-200 mt-2 font-medium">{api.badgeText}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Verified: {api.verifiedEntitiesCount} Records</span>
                    <span>Sync: {api.lastSyncTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 8: SHIPMENT OPERATIONS & TRACKING (END USER)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'shipments' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package size={20} className="text-blue-400" /> Active Shipment Operations
                </h2>
                <p className="text-xs text-slate-400">Manage, dispatch, and track live multi-drop consignments.</p>
              </div>
              <button
                onClick={() => {
                  handleAddStop('Trident Academy of Technology, Patia');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Plus size={14} /> Create Fast Shipment
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {waypoints.map((wp, i) => (
                <div
                  key={wp.id}
                  className="bg-[#0D1424] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{wp.recipientName}</p>
                      <p className="text-xs text-slate-400">{wp.address}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Weight: {wp.packageWeightKg} kg · Phone: {wp.phone || '+91 94370 12345'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {wp.status === 'delivered' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                        <CheckCircle size={13} /> Delivered
                      </span>
                    ) : (
                      <button
                        onClick={() => setPodModalStop({ waypoint: wp, index: i })}
                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold transition-colors"
                      >
                        Confirm e-POD
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
