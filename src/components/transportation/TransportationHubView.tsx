import React, { useState } from 'react';
import {
  Zap,
  Users,
  Leaf,
  Navigation,
  Car,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingDown,
  Sparkles,
  ParkingCircle,
  Footprints,
  Compass,
  Layers,
  Info,
  Siren,
  Activity,
  BarChart3,
  Cpu,
  Fuel,
  Plus,
  ThumbsUp,
  MapPin,
  Moon
} from 'lucide-react';
import {
  CRUCIAL_CORRIDOR_CROWDS,
  PARK_AND_RIDE_HUBS,
  ACTIVE_DISRUPTION_ALERTS,
  CITY_MOBILITY_HEATMAP_ZONES,
  calculateGreenRouteScores,
  getSmartLoadBalancedOptions,
  RouteCrowdStatus
} from '../../services/crowdPredictionService';
import { calculateLastMileOptions, LastMileOption } from '../../services/lastMileService';
import {
  TRAFFIC_PREDICTIONS,
  AREA_TRAFFIC_SCORES,
  PRESET_SIMULATION_SCENARIOS,
  INITIAL_ROAD_PROBLEM_REPORTS,
  generateEmergencyCorridor,
  calculateFuelAndPollutionSavings,
  isCrutAmaBusServiceClosed,
  RoadProblemReport,
  SimulationScenario,
  SAMPLE_SMART_STOPS,
  ACTIVE_EVENT_PLANS,
  SAMPLE_EMPTY_TRIP_MATCHES,
  MUNICIPAL_WASTE_BINS,
  TIER2_SMART_PARKINGS,
  SMART_BUS_DISPATCHES,
  EventTransportPlan
} from '../../services/smartMobilitySuiteService';

interface TransportationHubProps {
  originName?: string;
  destinationName?: string;
  onSelectRoute?: (routeId: string) => void;
  onNavigateToMap?: () => void;
}

export type TransportationSubTab = 
  | 'smart_stops'
  | 'event_planner'
  | 'empty_trips'
  | 'waste_routes'
  | 'smart_parking'
  | 'bus_dispatch'
  | 'traffic_predict'
  | 'problem_sim'
  | 'emergency_route'
  | 'road_problem'
  | 'area_scores'
  | 'admin_dash'
  | 'fuel_pollution'
  | 'load_balance'
  | 'crowd_predict'
  | 'green_score'
  | 'last_mile'
  | 'park_ride'
  | 'disruptions'
  | 'heatmap';

export const TransportationHubView: React.FC<TransportationHubProps> = ({
  originName = 'Jayadev Vihar',
  destinationName = 'KIIT Square, Bhubaneswar',
  onSelectRoute,
  onNavigateToMap,
}) => {
  const [activeTab, setActiveTab] = useState<TransportationSubTab>('smart_stops');
  const [activeCategory, setActiveCategory] = useState<'all' | 'transit' | 'events_logistics' | 'traffic'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventTransportPlan>(ACTIVE_EVENT_PLANS[0]);
  const [selectedRoute, setSelectedRoute] = useState<RouteCrowdStatus>(CRUCIAL_CORRIDOR_CROWDS[0]);
  const [appliedIncentive, setAppliedIncentive] = useState(false);

  // Simulation State
  const [activeSim, setActiveSim] = useState<SimulationScenario>(PRESET_SIMULATION_SCENARIOS[0]);
  const [simActiveState, setSimActiveState] = useState(false);

  // Road Hazards State
  const [hazardReports, setHazardReports] = useState<RoadProblemReport[]>(INITIAL_ROAD_PROBLEM_REPORTS);
  const [isReportHazardOpen, setIsReportHazardOpen] = useState(false);
  const [newHazardType, setNewHazardType] = useState<'accident' | 'pothole' | 'waterlogging' | 'roadblock' | 'illegal_parking'>('waterlogging');
  const [newHazardTitle, setNewHazardTitle] = useState('');
  const [newHazardLocation, setNewHazardLocation] = useState('Acharya Vihar Square, Bhubaneswar');
  const [newHazardDesc, setNewHazardDesc] = useState('');

  // Emergency Route State
  const emergencyPlan = generateEmergencyCorridor('KIMS Hospital, Patia', 'Apollo Hospital, Sainik School Road');

  // Bus Operating Hours Check (Closes after 10 PM)
  const busServiceStatus = isCrutAmaBusServiceClosed();
  const fuelSavings = calculateFuelAndPollutionSavings(12.5);

  const smartBalance = getSmartLoadBalancedOptions(originName, destinationName);
  const greenScores = calculateGreenRouteScores(8.5);
  const lastMileOptions = calculateLastMileOptions(originName, destinationName);

  const handleAddHazardReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHazardTitle.trim() || !newHazardDesc.trim()) return;

    const newReport: RoadProblemReport = {
      id: `rp-${Date.now()}`,
      problemType: newHazardType,
      title: newHazardTitle.trim(),
      description: newHazardDesc.trim(),
      locationName: newHazardLocation.trim(),
      lat: 20.3000,
      lng: 85.8300,
      reportedAt: 'Just now',
      severity: 'moderate',
      status: 'acknowledged_by_police',
      upvotes: 1,
      actionTaken: 'Auto-routed to Traffic Control Room',
    };

    setHazardReports([newReport, ...hazardReports]);
    setIsReportHazardOpen(false);
    setNewHazardTitle('');
    setNewHazardDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      {/* 0. CRUT Ama Bus Service Closure Notice (After 10:00 PM) */}
      <div className={`mx-3 md:mx-5 mt-3 p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
        busServiceStatus.isClosed
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
      }`}>
        <div className="flex items-center gap-2">
          {busServiceStatus.isClosed ? <Moon className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          <span>{busServiceStatus.message}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/30 font-black uppercase">
          {busServiceStatus.nextServiceTime}
        </span>
      </div>

      {/* 1. Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-blue-700/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Transit & City Command Center</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Transportation Optimization & Urban Intelligence Hub
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              30–60m traffic forecasting, problem simulation, emergency green corridors, area scores (0-100), hazard reporting & city official controls.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-start md:self-auto">
            <Activity className="w-5 h-5 text-emerald-300 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200">Urban Grid Status</div>
              <div className="text-xs font-extrabold text-emerald-300">Live AI Monitoring • 82 Lines</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'all', label: '🌟 All Tools' },
            { id: 'transit', label: '🚏 Smart Transit & Savings' },
            { id: 'events_logistics', label: '🏟️ Events & City Freight' },
            { id: 'traffic', label: '🚦 Traffic & Emergency' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'smart_stops', label: '🚏 Smart Stop Selection', cat: 'transit' },
            { id: 'event_planner', label: '🏟️ Event Transport Planning', cat: 'events_logistics' },
            { id: 'empty_trips', label: '🚛 Empty-Trip Matching', cat: 'events_logistics' },
            { id: 'waste_routes', label: '🗑️ Solid Waste Optimization', cat: 'events_logistics' },
            { id: 'smart_parking', label: '🅿️ AI Smart Parking (Tier-2)', cat: 'events_logistics' },
            { id: 'bus_dispatch', label: '🚍 Smart Bus Dispatch', cat: 'transit' },
            { id: 'fuel_pollution', label: '⛽ Fuel & CO₂ Savings', cat: 'transit' },
            { id: 'traffic_predict', label: '🚦 Traffic Prediction (30-60m)', cat: 'traffic' },
            { id: 'problem_sim', label: '🧪 Problem Simulator', cat: 'traffic' },
            { id: 'emergency_route', label: '🚑 Emergency Corridor', cat: 'traffic' },
            { id: 'road_problem', label: '⚠️ Report Road Hazard', cat: 'traffic' },
            { id: 'area_scores', label: '🛡️ Area Scores (0-100)', cat: 'traffic' },
            { id: 'admin_dash', label: '🏙️ Admin Command Center', cat: 'events_logistics' },
            { id: 'load_balance', label: '⚖️ Load Balancing', cat: 'transit' },
            { id: 'crowd_predict', label: '👥 Crowd Prediction', cat: 'transit' },
            { id: 'green_score', label: '🌿 Green Route Score', cat: 'transit' },
            { id: 'last_mile', label: '🚶 Smart Last-Mile', cat: 'transit' },
            { id: 'park_ride', label: '🅿️ Park & Ride', cat: 'transit' },
            { id: 'disruptions', label: '🚨 Disruption Manager', cat: 'traffic' },
            { id: 'heatmap', label: '🔥 Mobility Heatmap', cat: 'traffic' },
          ]
            .filter((tab) => activeCategory === 'all' || tab.cat === activeCategory)
            .map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TransportationSubTab)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-blue-900 shadow-md font-extrabold scale-100'
                      : 'bg-white/15 text-white hover:bg-white/25 active:scale-95'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 2. Main Content Views based on active subtab */}
      <div className="px-3 md:px-5 space-y-5">

        {/* ─── TAB: SMART STOP SELECTION ─── */}
        {activeTab === 'smart_stops' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-blue-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] rounded-full uppercase mb-1">
                    Smart Stop Intelligence
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚏 Optimal Stop Recommendation (Beyond Just Proximity)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Instead of sending you to the nearest congested stop, Musafir factors <strong>buses arriving, waiting time, and crowd density</strong>.
                  </p>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Commuter Rule:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Walk ~300m for 3 buses vs 60m for 1 bus with 22m wait</span>
                </div>
              </div>

              {/* Stop Cards */}
              <div className="space-y-3">
                {SAMPLE_SMART_STOPS.map((stop, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition ${
                      stop.isRecommended
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-slate-900 dark:text-white">{stop.stopName}</h3>
                          {stop.isRecommended && (
                            <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">
                              Best Choice
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                          {stop.recommendationReason}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto text-right">
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">🚶 {stop.walkDistanceMeters}m ({stop.walkTimeMins} min)</div>
                          <div className="text-[10px] text-slate-400">🚌 {stop.upcomingBusesCount} buses in next 10m</div>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[75px]">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Wait ETA</div>
                          <div className={`text-xs font-black ${stop.nextBusWaitMins <= 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ⏱️ {stop.nextBusWaitMins} mins
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500">
                        Lines passing here: <strong className="text-slate-800 dark:text-slate-200">{stop.availableRoutes.join(', ')}</strong>
                      </div>
                      <button
                        onClick={onNavigateToMap}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs ${
                          stop.isRecommended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                        }`}
                      >
                        Navigate to Stop ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EVENT-BASED TRANSPORT PLANNING ─── */}
        {activeTab === 'event_planner' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-purple-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] rounded-full uppercase mb-1">
                    Event Crowd Prediction
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏟️ Event-Based Transport Planning (Matches, Concerts, Festivals, Exams)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Predicting transport pressure around venues with alternative entry corridors, arrival timing, and park & ride combinations.
                  </p>
                </div>
              </div>

              {/* Event Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {ACTIVE_EVENT_PLANS.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedEvent.id === evt.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-300 font-black shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-purple-600">{evt.category}</div>
                    <div className="text-xs font-black truncate">{evt.eventName}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{evt.venueName}</div>
                  </button>
                ))}
              </div>

              {/* Active Event Plan Details */}
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">{selectedEvent.eventName}</h3>
                    <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">📍 {selectedEvent.venueName} • 👥 {selectedEvent.expectedFootfall}</div>
                  </div>
                  <div className="px-3 py-1 bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 text-xs font-bold rounded-xl self-start sm:self-auto">
                    Peak Rush: {selectedEvent.peakTrafficWindow}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">⏰ Suggested Arrival Windows:</span>
                    {selectedEvent.suggestedArrivalTimes.map((t, idx) => (
                      <div key={idx} className="font-bold text-emerald-600 flex items-center gap-1">
                        <span>✓</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">🚪 Alternative Entry Corridors:</span>
                    {selectedEvent.alternateEntryCorridors.map((c, idx) => (
                      <div key={idx} className="font-bold text-slate-700 dark:text-slate-200">
                        • {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">🅿️ Recommended Park & Ride:</span>
                    <span className="font-bold text-emerald-600">₹{selectedEvent.parkAndRideCombination.parkingFareInr} Flat Fee</span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedEvent.parkAndRideCombination.parkingHubName} ({selectedEvent.parkAndRideCombination.distanceToVenue})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Shuttle Service: {selectedEvent.parkAndRideCombination.shuttleFrequency}
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-blue-300">
                  🏛️ City Resource Action: {selectedEvent.cityResourceAction}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EMPTY-TRIP MATCHING & FREIGHT PLATFORM ─── */}
        {activeTab === 'empty_trips' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-full uppercase mb-1">
                    Unified Freight Matching
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚛 Empty-Trip Matching & Logistics Return Optimizer</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connecting delivery vehicles returning empty with nearby parcels going the same way. <strong>Fewer empty trips = lower fuel costs & emissions.</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SAMPLE_EMPTY_TRIP_MATCHES.map((et) => (
                  <div
                    key={et.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs rounded-lg">
                            {et.vehicleRegistration}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{et.vehicleType}</span>
                          <span className="text-xs text-slate-400">({et.driverName})</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Empty Route: {et.currentReturnOrigin} ➔ {et.returnDestination} ({et.emptyPayloadKg} kg capacity)
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 block">+₹{et.matchedParcelJob.offeredPayoutInr} Payout</span>
                        <span className="text-[10px] text-slate-400">⚡ Detour: +{et.matchedParcelJob.extraDetourKm} km</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-1 text-xs">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">
                        📦 Matched Return Cargo Job ({et.matchedParcelJob.jobId}):
                      </div>
                      <div className="text-slate-700 dark:text-slate-200">
                        Pickup: <strong>{et.matchedParcelJob.pickupLocation}</strong> ➔ Drop: <strong>{et.matchedParcelJob.dropLocation}</strong> ({et.matchedParcelJob.weightKg} kg)
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-0.5">
                        🌱 Saved {et.dieselSavedLitres}L Diesel • Prevented {et.co2PreventedKg}kg CO₂ emissions
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => alert(`Cargo Job ${et.matchedParcelJob.jobId} accepted! Navigation dispatched to driver ${et.driverName}.`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Accept Return Freight Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: MUNICIPAL SOLID WASTE COLLECTION OPTIMIZATION ─── */}
        {activeTab === 'waste_routes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] rounded-full uppercase mb-1">
                    Municipal Smart Grid
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🗑️ Municipal Solid Waste Collection Route Optimization</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time ultrasonic bin-fill telemetry dynamically sequences collection trucks to only visit bins ≥ 80% full, saving 35% municipal diesel.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs rounded-full">
                  Bin Sensors Active (BMC Grid)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MUNICIPAL_WASTE_BINS.map((b) => (
                  <div
                    key={b.binId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-slate-500">{b.binId} (Ward {b.wardNumber})</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        b.fillPercentage >= 85 ? 'bg-rose-100 text-rose-700' :
                        b.fillPercentage >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {b.fillPercentage}% Full
                      </span>
                    </div>

                    <div className="font-black text-sm text-slate-900 dark:text-white">{b.locationName}</div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.fillPercentage >= 85 ? 'bg-rose-500' :
                          b.fillPercentage >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${b.fillPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Type: {b.wasteType}</span>
                      <span>Priority: #{b.recommendedCollectionPriority}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onNavigateToMap}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Generate Optimized Municipal Waste Pickup Route (Skip Empty Bins)
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: AI SMART PARKING & DYNAMIC PRICING (TIER-2 CITIES) ─── */}
        {activeTab === 'smart_parking' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] rounded-full uppercase mb-1">
                    Tier-2 Smart Cities
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🅿️ AI-Based Parking Availability & Dynamic Pricing</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live camera & sensor slot tracking with surge-based dynamic pricing to reduce congestion in busy markets.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {TIER2_SMART_PARKINGS.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">{p.hubName}</h3>
                        <div className="text-xs text-slate-500">📍 {p.locality}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-blue-600">₹{p.currentDynamicRateInr}/hr</div>
                        <div className="text-[10px] text-slate-400">Base: ₹{p.baseHourlyRateInr}/hr (Surge {p.surgeMultiplier}x)</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Vacant Spots</div>
                        <div className="text-xs font-black text-emerald-600">{p.availableSlots} / {p.totalSlots}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">EV Chargers</div>
                        <div className="text-xs font-black text-blue-600">⚡ {p.evChargingSlotsAvailable} Available</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Demand Trend</div>
                        <div className="text-xs font-bold text-amber-600">{p.occupancyTrend}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => alert(`Spot reserved at ${p.hubName} for 45 minutes. Rate locked at ₹${p.currentDynamicRateInr}/hr.`)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Reserve Parking Spot ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: SMART BUS DISPATCH ─── */}
        {activeTab === 'bus_dispatch' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚍 Predictive Public Bus Crowding + Smart Dispatch</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time passenger overload monitors trigger automated standby feeder bus dispatches before platforms overflow.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SMART_BUS_DISPATCHES.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-blue-600">{d.routeId}</span>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">{d.routeName}</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-black rounded-full">
                        {d.currentPassengerLoadPercent}% Packed
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div>
                        <strong>Unmet Passenger Demand:</strong> {d.unmetPassengerDemandCount} commuters waiting at stops.
                      </div>
                      <div>
                        <strong>Recommended Dispatch Depot:</strong> {d.standbyDepot} (ETA {d.estimatedResolutionMinutes} mins).
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Standby Electric Feeder Bus dispatched from ${d.standbyDepot} to support ${d.routeId}!`)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      🚀 Dispatch Standby Extra Bus Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: 30–60 MIN TRAFFIC CONGESTION PREDICTION ─── */}
        {activeTab === 'traffic_predict' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Predictive Traffic Congestion Forecasting (Next 30–60 Minutes)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Predicting road bottlenecks across key arteries using historical trends, signals, and active transit volumes.
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-full self-start">
                  Live AI Forecast Active
                </span>
              </div>

              <div className="space-y-3">
                {TRAFFIC_PREDICTIONS.map((tp) => (
                  <div
                    key={tp.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">{tp.roadName}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">Factor: {tp.peakReason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 dark:text-white">{tp.currentSpeedKmph} km/h</div>
                        <div className="text-[10px] text-slate-400">Normal: {tp.freeFlowSpeedKmph} km/h</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Now</div>
                        <div className={`font-black uppercase text-[11px] ${
                          tp.currentCongestionLevel === 'gridlock' ? 'text-rose-600' :
                          tp.currentCongestionLevel === 'heavy' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {tp.currentCongestionLevel}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">In +30 Mins</div>
                        <div className={`font-black uppercase text-[11px] ${
                          tp.predicted30MinLevel === 'gridlock' ? 'text-rose-600' :
                          tp.predicted30MinLevel === 'heavy' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {tp.predicted30MinLevel}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">In +60 Mins</div>
                        <div className={`font-black uppercase text-[11px] ${
                          tp.predicted60MinLevel === 'gridlock' ? 'text-rose-600' :
                          tp.predicted60MinLevel === 'heavy' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {tp.predicted60MinLevel}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Suggested Smooth Bypass:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tp.recommendedAlternative}</span>
                      </div>
                      <button
                        onClick={onNavigateToMap}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700"
                      >
                        Map Route
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PROBLEM SIMULATOR (WHAT-IF INTERACTIVE SIMULATOR) ─── */}
        {activeTab === 'problem_sim' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>Urban Crisis & What-If Problem Simulator</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Simulate accidents, monsoon flooding, VIP closures, or concert events to test automated signal rerouting.
                  </p>
                </div>
              </div>

              {/* Scenario selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRESET_SIMULATION_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveSim(sc);
                      setSimActiveState(true);
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      activeSim.id === sc.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 font-black shadow-xs text-purple-900 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-purple-600">{sc.category.replace('_', ' ')}</div>
                    <div className="text-xs font-black truncate mt-0.5">{sc.title.split(' at ')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Active Simulation Result Card */}
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-400 dark:border-purple-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-600 text-white font-black text-[10px] rounded-full uppercase">
                      Simulated Crisis Scenario
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">{activeSim.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">Location: {activeSim.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-rose-600">+{activeSim.simulatedDelayMins}m Delay</div>
                    <div className="text-[10px] text-slate-400">Radius: {activeSim.affectedRadiusKm} km</div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="text-purple-600 font-extrabold">🚨 Automated Action: </span>
                    {activeSim.suggestedAction}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="text-emerald-600 font-extrabold">🚦 Signal Preemption: </span>
                    {activeSim.automatedSignalAdjustment}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Impacted Lines: {activeSim.impactedRoutes.join(', ')}
                  </div>
                </div>

                <button
                  onClick={onNavigateToMap}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Visualize Simulated Rerouting on Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EMERGENCY GREEN CORRIDOR ─── */}
        {activeTab === 'emergency_route' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Siren className="w-5 h-5 text-rose-600 animate-bounce" />
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Emergency Green Corridor Routing (Ambulance & Siren Priority)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rapid dispatch clearance with traffic signal preemption to save critical golden hour minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-rose-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Standard Time</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">{emergencyPlan.standardDurationMins} mins</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Green Corridor</div>
                    <div className="text-base font-black text-emerald-600">{emergencyPlan.clearedGreenCorridorDurationMins} mins</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Time Saved</div>
                    <div className="text-sm font-black text-blue-600">⚡ {emergencyPlan.timeSavedMins} mins</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Target Speed</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">{emergencyPlan.recommendedSpeedKmph} km/h</div>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="text-xs font-black text-slate-900 dark:text-white">Preempted Traffic Signals (Green Wave Active):</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {emergencyPlan.clearedSignalJunctions.map((j, idx) => (
                      <div key={idx} className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <span>🟢</span>
                        <span>{j}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onNavigateToMap}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Activate Live Emergency Siren Navigation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: REPORT A ROAD PROBLEM ─── */}
        {activeTab === 'road_problem' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Report a Road Problem (Potholes, Waterlogging, Accidents, Roadblocks)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Report road hazards directly to traffic control room & municipal authorities.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportHazardOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report Road Issue</span>
                </button>
              </div>

              <div className="space-y-3">
                {hazardReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          r.problemType === 'accident' ? 'bg-rose-100 text-rose-700' :
                          r.problemType === 'waterlogging' ? 'bg-blue-100 text-blue-700' :
                          r.problemType === 'pothole' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {r.problemType.replace('_', ' ')}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{r.title}</h3>
                      </div>
                      <span className="text-xs text-slate-400">{r.reportedAt}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{r.description}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{r.locationName}</span>
                    </div>

                    {r.actionTaken && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        🛡️ Action: {r.actionTaken}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hazard Modal */}
            {isReportHazardOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-black text-sm">Submit Road Hazard Report</h3>
                    <button onClick={() => setIsReportHazardOpen(false)} className="text-slate-400 font-bold">✕</button>
                  </div>
                  <form onSubmit={handleAddHazardReport} className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Hazard Type</label>
                      <select
                        value={newHazardType}
                        onChange={(e) => setNewHazardType(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                      >
                        <option value="pothole">🕳️ Dangerous Pothole</option>
                        <option value="waterlogging">🌧️ Waterlogging / Drainage Overflow</option>
                        <option value="accident">💥 Accident / Vehicle Collision</option>
                        <option value="roadblock">🚧 Roadblock / Construction</option>
                        <option value="illegal_parking">🚗 Illegal Parking in Bus Bay</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Title</label>
                      <input
                        type="text"
                        value={newHazardTitle}
                        onChange={(e) => setNewHazardTitle(e.target.value)}
                        placeholder="e.g. Deep pothole on left lane"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Location</label>
                      <input
                        type="text"
                        value={newHazardLocation}
                        onChange={(e) => setNewHazardLocation(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={newHazardDesc}
                        onChange={(e) => setNewHazardDesc(e.target.value)}
                        placeholder="Provide details..."
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                        required
                      ></textarea>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsReportHazardOpen(false)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs"
                      >
                        Publish Hazard
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: AREA TRAFFIC SCORES (0 TO 100) ─── */}
        {activeTab === 'area_scores' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Area Traffic & Safety Scores (0 - 100 Index)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live rating of each urban sector based on road speeds, active delivery couriers, and reported problems.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AREA_TRAFFIC_SCORES.map((area) => (
                  <div
                    key={area.areaId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">{area.areaName}</h3>
                      <div className="text-xs text-slate-500 mt-1">
                        📦 {area.activeDeliveriesCount} deliveries • ⚠️ {area.reportedIncidentsCount} hazards
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Bottleneck: {area.majorBottleneck}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black ${
                        area.scoreOutOf100 >= 75 ? 'text-emerald-600' :
                        area.scoreOutOf100 >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {area.scoreOutOf100}/100
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Delay: +{area.avgTravelDelayMins}m</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ADMIN DASHBOARD (CITY OFFICIALS) ─── */}
        {activeTab === 'admin_dash' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Municipal & Traffic Police Command Center
                    </h2>
                    <p className="text-xs text-slate-500">
                      City official dashboard: Live hotspot map, rapid signal preemption, and emergency dispatch.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black rounded-full">
                  Grid Synchronized
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Active Fleets</div>
                  <div className="text-base font-black text-blue-600">324 Buses + 180 Shuttles</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Grid Efficiency</div>
                  <div className="text-base font-black text-emerald-600">94.2% On-Time</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Active Hazards</div>
                  <div className="text-base font-black text-amber-600">4 Under Action</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Emergency Corridors</div>
                  <div className="text-base font-black text-purple-600">1 Active (KIMS ➔ Apollo)</div>
                </div>
              </div>

              <button
                onClick={onNavigateToMap}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition text-center"
              >
                Inspect Official City Command Map
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: FUEL AND POLLUTION SAVINGS ─── */}
        {activeTab === 'fuel_pollution' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Fuel className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Fuel & Pollution Savings Analytics
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comparing fuel consumption and CO₂ emissions saved by using optimal shared transit vs driving a car.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Fuel Saved</div>
                  <div className="text-base font-black text-emerald-600">{fuelSavings.fuelSavedLitres} Litres</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-300 dark:border-blue-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">CO₂ Emissions Reduced</div>
                  <div className="text-base font-black text-blue-600">{fuelSavings.co2SavedGrams}g CO₂</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Cost Saved</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">₹{fuelSavings.costSavedInr}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Green Credits</div>
                  <div className="text-base font-black text-amber-600">+{fuelSavings.greenPointsEarned} Pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 1: SMART LOAD BALANCING & ROUTE DISTRIBUTION ─── */}
        {activeTab === 'load_balance' && (
          <div className="space-y-5 animate-in fade-in">
            {/* AI Recommendation Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-blue-200 dark:border-slate-800 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Smart Route Distribution Engine
                    </h2>
                    <p className="text-xs text-slate-500">
                      Balancing commuter flow between <span className="font-bold text-blue-600">{originName}</span> and <span className="font-bold text-blue-600">{destinationName}</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-full">
                  Live Load Balancing Active
                </span>
              </div>

              {/* Overcrowded vs Recommended Alternative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Regular Overloaded Route */}
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-rose-700 dark:text-rose-400">Regular Direct Route</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded-full">88% Packed</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Mo Bus Route 10 (Direct Spine)</h3>
                  <p className="text-xs text-slate-500 mt-1">Heavy crowding at Jayadev Vihar & Damana Chhak. 32 people standing.</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 mt-3">
                    <span>⏱️ 28 mins</span>
                    <span>•</span>
                    <span>🧍 Low Comfort</span>
                    <span>•</span>
                    <span className="text-rose-600">Heavy Wait</span>
                  </div>
                </div>

                {/* Smart Balanced Alternative */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                    Recommended Bypass
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">Less-Crowded Corridor</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Mo Bus Route 26 (Express Bypass)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Smooth traffic via Outer Ring Corridor. 20+ empty seats available.</p>
                  
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
                    <span>⏱️ 22 mins (-6m)</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-extrabold">🪑 Seating Guaranteed</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Diversion Incentive</div>
                      <div className="text-xs font-black text-emerald-800 dark:text-emerald-200">₹5 Off + 40 Green Pts</div>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedIncentive(true);
                        onSelectRoute?.('Route 26');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      {appliedIncentive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selected & Discounted</span>
                        </>
                      ) : (
                        <>
                          <span>Choose Balanced Route</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Corridor Occupancy Grid */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Live Corridor Load Distribution (City-Wide)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CRUCIAL_CORRIDOR_CROWDS.map((route) => (
                  <div
                    key={route.routeId}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-xs text-blue-600 dark:text-blue-400">{route.routeId}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        route.crowdLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                        route.crowdLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {route.currentOccupancyPercent}% Occupancy
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{route.routeName}</div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          route.currentOccupancyPercent > 75 ? 'bg-rose-500' :
                          route.currentOccupancyPercent > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${route.currentOccupancyPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Seats: {route.availableSeats}</span>
                      <span>Standing: {route.standingCapacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: CROWD-LEVEL PREDICTION & STATION OCCUPANCY ─── */}
        {activeTab === 'crowd_predict' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Hourly Crowd Prediction & Peak Hour Forecast</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Predicting crowd density before you travel to help you choose the best departure time.
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {CRUCIAL_CORRIDOR_CROWDS.map((r) => (
                    <button
                      key={r.routeId}
                      onClick={() => setSelectedRoute(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        selectedRoute.routeId === r.routeId
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {r.routeId}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Route Forecast Timeline */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">{selectedRoute.routeName}</h3>
                    <div className="text-xs text-slate-500">Live Status: {selectedRoute.currentOccupancyPercent}% Capacity • {selectedRoute.availableSeats} Seats Open</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full">
                    {selectedRoute.mode.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {selectedRoute.peakHourForecast.map((f, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1.5 shadow-xs">
                      <div className="text-xs font-bold text-slate-400">{f.hour}</div>
                      <div className={`text-sm font-black ${
                        f.occupancyPercent > 80 ? 'text-rose-600' :
                        f.occupancyPercent > 50 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {f.occupancyPercent}%
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            f.occupancyPercent > 80 ? 'bg-rose-500' :
                            f.occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${f.occupancyPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: GREEN ROUTE SCORE & CARBON TRACKER ─── */}
        {activeTab === 'green_score' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Green Route Score & Carbon Offset Comparison (8.5 km Trip)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Compare environmental footprint across transit modes and earn reward points for zero-emission travel.
              </p>

              <div className="space-y-3">
                {greenScores.map((score, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      score.isRecommended
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">{score.mode}</h3>
                        {score.isRecommended && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                            Eco Pick
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Emissions: <span className="font-bold text-slate-800 dark:text-slate-200">{score.co2GramsPerKm}g CO₂/km</span>
                        {score.co2SavedGramsVsCar > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">
                            (Saved {score.co2SavedGramsVsCar}g CO₂ vs Private Car)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Green Reward</div>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">+{score.greenCreditsEarned} Pts</div>
                      </div>
                      <div className="text-amber-500 font-bold text-sm">
                        {'★'.repeat(score.ecoRatingStars)}{'☆'.repeat(5 - score.ecoRatingStars)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: SMART LAST-MILE OPTIMIZATION ─── */}
        {activeTab === 'last_mile' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Smart Last-Mile Navigation (Transit Stop ➔ Final Doorstep)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Safe, lit walking corridors, CCTV safety ratings, E-Ride feeder stands, and public bike docks.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lastMileOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                          {opt.badgeText}
                        </span>
                        <span className="font-extrabold text-xs text-emerald-600">
                          ⭐ {opt.safetyScoreOutOf10}/10 Safety
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{opt.title}</h3>
                      <div className="text-xs text-slate-500 mt-1">
                        {opt.distanceMeters}m • ~{opt.durationMins} mins • {opt.cost === 0 ? 'Free' : `₹${opt.cost}`}
                      </div>

                      <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        {opt.steps.map((st, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={onNavigateToMap}
                      className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition text-center"
                    >
                      View on Interactive Map
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 5: PARK AND RIDE HUBS ─── */}
        {activeTab === 'park_ride' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <ParkingCircle className="w-5 h-5 text-indigo-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Park & Ride Hubs — Parking Pressure Reduction
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Park your car or scooter at outer perimeter stations and switch to Mo Bus / Metro to avoid downtown traffic jams.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PARK_AND_RIDE_HUBS.map((hub) => (
                  <div
                    key={hub.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{hub.name}</h3>
                        <div className="text-xs text-slate-500">{hub.location}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black rounded-xl">
                        {hub.availableSpots} / {hub.totalSpots} Open
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">Rate</div>
                        <div className="font-black text-slate-900 dark:text-white">₹{hub.hourlyRate}/hr</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">EV Chargers</div>
                        <div className="font-black text-emerald-600">{hub.evChargingSpots} Fast Bays</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">Traffic Saved</div>
                        <div className="font-black text-blue-600">~{hub.estimatedCongestionSavedPercent}%</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold">Connecting Lines: </span>
                      {hub.connectingTransit.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: REAL-TIME DISRUPTION MANAGEMENT ─── */}
        {activeTab === 'disruptions' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Real-Time Crisis & Disruption Management
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Instant alternative bypass routing during waterlogging, strikes, VIP movements, and road closures.
              </p>

              <div className="space-y-3">
                {ACTIVE_DISRUPTION_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          alert.severity === 'critical' ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                        }`}></span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{alert.title}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{alert.reportedAt}</span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Affected Corridor: <span className="font-bold text-slate-900 dark:text-white">{alert.affectedCorridor}</span>
                      <div className="mt-0.5">Impacted Bus Lines: {alert.impactedRoutes.join(', ')}</div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-900 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Recommended Smart Bypass</div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">{alert.recommendedBypass}</div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-lg">
                        Saves {alert.bypassTimeSavedMins}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 7: CITY MOBILITY HEATMAP ─── */}
        {activeTab === 'heatmap' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    City Mobility Heatmap (Density & Delay Hotspots)
                  </h2>
                </div>
                <button
                  onClick={onNavigateToMap}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 active:scale-95 transition"
                >
                  Open Full Screen Map
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Visualizing passenger flow volume, road congestion bottlenecks, and transport shortages across Bhubaneswar & Cuttack.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CITY_MOBILITY_HEATMAP_ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          zone.intensity > 0.85 ? 'bg-rose-600 animate-pulse' :
                          zone.intensity > 0.7 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{zone.name}</h3>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Volume: <span className="font-bold text-slate-800 dark:text-slate-200">{zone.commuterVolumePerHour} commuters/hr</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Avg Corridor Delay</div>
                      <div className={`text-sm font-black ${zone.averageDelayMins > 10 ? 'text-rose-600' : 'text-amber-600'}`}>
                        +{zone.averageDelayMins} mins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
