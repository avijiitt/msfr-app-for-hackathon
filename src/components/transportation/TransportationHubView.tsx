import React, { useState, useEffect } from 'react';
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
  Moon,
  RotateCw,
  QrCode,
  Check,
  Send,
  Phone,
  ArrowUpRight,
  Copy,
  Radio,
  Share2,
  Trash2,
  Download
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
  EventTransportPlan,
  EmptyTripMatch,
  Tier2SmartParkingHub
} from '../../services/smartMobilitySuiteService';
import { geminiTrafficService, LiveCorridorTelemetry } from '../../services/geminiTrafficService';

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

  // Live Google Maps & Gemini AI Telemetry State
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('Live Stream Active');
  const [cityHealthScore, setCityHealthScore] = useState<number>(78);
  const [aiUrbanSummary, setAiUrbanSummary] = useState<string>(
    'Google Maps live traffic stream shows optimal flow on arterial corridors. Janpath & Nandankanan corridors operating smoothly with Mo Bus load balancing active.'
  );
  const [liveCorridors, setLiveCorridors] = useState<LiveCorridorTelemetry[]>([]);

  // Workable Modals State
  const [bookingEventModal, setBookingEventModal] = useState<EventTransportPlan | null>(null);
  const [bookingEmptyTripModal, setBookingEmptyTripModal] = useState<EmptyTripMatch | null>(null);
  const [isPostEmptyTripOpen, setIsPostEmptyTripOpen] = useState(false);
  const [reservingParkingModal, setReservingParkingModal] = useState<Tier2SmartParkingHub | null>(null);
  const [dispatchedBusInfo, setDispatchedBusInfo] = useState<{ routeId: string; depot: string; time: string; crowdBefore: number; crowdAfter: number } | null>(null);
  const [greenCorridorActive, setGreenCorridorActive] = useState(false);
  const [wasteOptimized, setWasteOptimized] = useState(false);
  const [eventAiAnalysis, setEventAiAnalysis] = useState<{ [eventId: string]: string }>({});
  const [analyzingEventId, setAnalyzingEventId] = useState<string | null>(null);

  // New empty trip form state
  const [postVehicleType, setPostVehicleType] = useState('Tata Ace (1T)');
  const [postDriverName, setPostDriverName] = useState('');
  const [postOrigin, setPostOrigin] = useState('Patia / KIIT Hub');
  const [postDestination, setPostDestination] = useState('Baramunda ISBT');
  const [postEmptyKg, setPostEmptyKg] = useState('500');
  const [emptyTripList, setEmptyTripList] = useState<EmptyTripMatch[]>(SAMPLE_EMPTY_TRIP_MATCHES);
  const [busDispatchList, setBusDispatchList] = useState(SMART_BUS_DISPATCHES);

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

  // Initial Telemetry Fetch on Mount
  useEffect(() => {
    handleRefreshTelemetry();
  }, []);

  const handleRefreshTelemetry = async () => {
    setIsRefreshingTelemetry(true);
    try {
      const data = await geminiTrafficService.fetchLiveCorridorTelemetry('Bhubaneswar');
      setLiveCorridors(data.corridors);
      setAiUrbanSummary(data.aiUrbanSummary);
      setLiveTimestamp(data.liveTimestamp);
      setCityHealthScore(data.cityHealthScore);
    } catch (err) {
      console.warn('Telemetry refresh error:', err);
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  const handleAnalyzeEvent = async (event: EventTransportPlan) => {
    setAnalyzingEventId(event.id);
    try {
      const analysis = await geminiTrafficService.analyzeEventTraffic(
        event.eventName,
        event.venueName,
        event.expectedFootfall
      );
      setEventAiAnalysis(prev => ({ ...prev, [event.id]: analysis.geminiInsights }));
    } catch (err) {
      console.warn('Event AI analysis error:', err);
    } finally {
      setAnalyzingEventId(null);
    }
  };

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

  const handlePostEmptyVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDriverName.trim()) return;

    const newEmptyTrip: EmptyTripMatch = {
      id: `et-${Date.now()}`,
      vehicleRegistration: `OD-02-EX-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType: postVehicleType as any,
      driverName: postDriverName.trim(),
      currentReturnOrigin: postOrigin,
      returnDestination: postDestination,
      emptyPayloadKg: parseInt(postEmptyKg) || 500,
      availableFromTime: 'Now Available',
      matchedParcelJob: {
        jobId: `PRCL-${Math.floor(1000 + Math.random() * 9000)}`,
        pickupLocation: `${postOrigin} Logistics Bay`,
        dropLocation: `${postDestination} Distribution Center`,
        weightKg: Math.floor(parseInt(postEmptyKg) * 0.6) || 300,
        offeredPayoutInr: Math.floor(parseInt(postEmptyKg) * 1.2) || 450,
        extraDetourKm: 0.8,
      },
      dieselSavedLitres: 3.5,
      co2PreventedKg: 8.4,
    };

    setEmptyTripList([newEmptyTrip, ...emptyTripList]);
    setIsPostEmptyTripOpen(false);
    setPostDriverName('');
    setBookingEmptyTripModal(newEmptyTrip);
  };

  const handleDispatchBus = (dispatch: typeof SMART_BUS_DISPATCHES[0]) => {
    setDispatchedBusInfo({
      routeId: dispatch.routeId,
      depot: dispatch.standbyDepot,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      crowdBefore: dispatch.currentPassengerLoadPercent,
      crowdAfter: Math.round(dispatch.currentPassengerLoadPercent * 0.52),
    });

    setBusDispatchList(prev => prev.map(d => 
      d.routeId === dispatch.routeId 
        ? { ...d, currentPassengerLoadPercent: Math.round(d.currentPassengerLoadPercent * 0.52), unmetPassengerDemandCount: 0 }
        : d
    ));
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

      {/* 1. Header Banner & Live Telemetry Dock */}
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
              <div className="text-xs font-extrabold text-emerald-300">Live AI Monitoring • Score: {cityHealthScore}/100</div>
            </div>
          </div>
        </div>

        {/* Live Google Maps & Gemini AI Stream Bar */}
        <div className="mt-4 p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="font-extrabold flex items-center gap-1.5 text-slate-100">
                <span>Google Maps Live Traffic & Gemini AI Stream</span>
                <span className="text-[10px] text-blue-200 font-mono">({liveTimestamp})</span>
              </div>
              <p className="text-[11px] text-blue-100/90 line-clamp-1 mt-0.5">
                {aiUrbanSummary}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshTelemetry}
            disabled={isRefreshingTelemetry}
            className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/30 active:scale-95 transition flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
            <span>{isRefreshingTelemetry ? 'Fetching Live...' : 'Refresh Live Telemetry'}</span>
          </button>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onSelectRoute) onSelectRoute(stop.availableRoutes[0]);
                            if (onNavigateToMap) onNavigateToMap();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 ${
                            stop.isRecommended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <span>Navigate to Stop on Google Map</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAnalyzeEvent(selectedEvent)}
                      disabled={analyzingEventId === selectedEvent.id}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${analyzingEventId === selectedEvent.id ? 'animate-spin' : ''}`} />
                      <span>{analyzingEventId === selectedEvent.id ? 'Analyzing with AI...' : 'Gemini AI Live Assessment'}</span>
                    </button>
                    <div className="px-3 py-1 bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 text-xs font-bold rounded-xl self-start sm:self-auto">
                      Peak: {selectedEvent.peakTrafficWindow}
                    </div>
                  </div>
                </div>

                {/* Gemini AI Event Insights Card if Generated */}
                {eventAiAnalysis[selectedEvent.id] && (
                  <div className="p-3 bg-purple-100/80 dark:bg-purple-900/40 rounded-xl border border-purple-300 dark:border-purple-700 text-xs text-purple-900 dark:text-purple-100 font-medium">
                    <strong className="text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini AI Urban Influx Advisory:
                    </strong>
                    {eventAiAnalysis[selectedEvent.id]}
                  </div>
                )}

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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    🏛️ City Action: {selectedEvent.cityResourceAction}
                  </div>
                  <button
                    onClick={() => setBookingEventModal(selectedEvent)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    🎫 Book Event Park & Ride Pass (₹{selectedEvent.parkAndRideCombination.parkingFareInr})
                  </button>
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

                <button
                  onClick={() => setIsPostEmptyTripOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start md:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Empty Return Vehicle</span>
                </button>
              </div>

              <div className="space-y-3">
                {emptyTripList.map((et) => (
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
                        onClick={() => setBookingEmptyTripModal(et)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Match & Book Return Cargo (Save 40%) ➔
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

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setWasteOptimized(true);
                    if (onNavigateToMap) onNavigateToMap();
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Generate Dynamic Waste Route with Google Maps (Skip Clean Bins)</span>
                </button>
              </div>
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
                        onClick={() => setReservingParkingModal(p)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Reserve Parking Spot & Mo Bus Pass (₹{p.currentDynamicRateInr}/hr) ➔
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
                {busDispatchList.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-blue-600">{d.routeId}</span>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">{d.routeName}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 text-xs font-black rounded-full ${
                        d.currentPassengerLoadPercent > 75 ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200' : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      }`}>
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
                      onClick={() => handleDispatchBus(d)}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      🚀 Deploy Standby Electric Extra Bus Now
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
                  Google Maps Live Stream
                </span>
              </div>

              <div className="space-y-3">
                {(liveCorridors.length > 0 ? liveCorridors : TRAFFIC_PREDICTIONS).map((tp: any) => (
                  <div
                    key={tp.corridorId || tp.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">{tp.name || tp.roadName}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">{tp.aiRecommendation || `Factor: ${tp.peakReason}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 dark:text-white">{tp.currentSpeedKmph} km/h</div>
                        <div className="text-[10px] text-slate-400">Normal: {tp.typicalSpeedKmph || tp.freeFlowSpeedKmph} km/h</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Live Status</div>
                        <div className="font-black text-blue-600 text-xs mt-0.5">
                          {tp.congestionStatus || tp.currentCongestionLevel}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Delay</div>
                        <div className="font-black text-amber-600 text-xs mt-0.5">
                          +{tp.delayMins || 8} mins
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Traffic Health</div>
                        <div className="font-black text-emerald-600 text-xs mt-0.5">
                          {tp.googleLiveTrafficScore || 72}/100
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Suggested Smooth Bypass:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tp.alternateCorridor || tp.recommendedAlternative}</span>
                      </div>
                      <button
                        onClick={onNavigateToMap}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700"
                      >
                        Map Route ➔
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
                    <span>Urban Problem Simulator (What-If Traffic Scenarios)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Simulate how sudden accidents, waterlogging, or events impact transit time & trigger automated signal diversions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {PRESET_SIMULATION_SCENARIOS.map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => {
                      setActiveSim(sim);
                      setSimActiveState(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      activeSim.id === sim.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-purple-600">{sim.category}</div>
                    <div className="text-xs font-black truncate">{sim.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{sim.location}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">{activeSim.title}</h3>
                    <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">📍 {activeSim.location}</div>
                  </div>
                  <button
                    onClick={() => setSimActiveState(!simActiveState)}
                    className={`px-4 py-1.5 rounded-xl font-black text-xs transition shadow-xs ${
                      simActiveState ? 'bg-rose-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {simActiveState ? '⏹️ Stop Simulation' : '▶️ Run AI Simulation'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Delay Spike</span>
                    <div className="text-base font-black text-rose-600 mt-0.5">+{activeSim.simulatedDelayMins} mins</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Affected Transit Lines</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activeSim.impactedRoutes.join(', ')}</div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Suggested Diverted Route:</strong> {activeSim.suggestedAction}
                  </div>
                  <div className="text-purple-600 font-bold">
                    ⚡ Signal Adjustment: {activeSim.automatedSignalAdjustment}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EMERGENCY GREEN CORRIDOR ─── */}
        {activeTab === 'emergency_route' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Siren className="w-5 h-5 text-rose-600 animate-pulse" />
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Emergency Green Corridor Preemption (Ambulances & Fire Engines)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Automated traffic light clearing along critical hospital routes to save critical golden hour minutes.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-full">
                  112 Police Synced
                </span>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-rose-600">Active Emergency Corridor</div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {emergencyPlan.originHospital} ➔ {emergencyPlan.destinationPatient}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600">
                      ETA: {emergencyPlan.clearedGreenCorridorDurationMins} mins (Standard: {emergencyPlan.standardDurationMins} mins)
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">Time Saved: {emergencyPlan.timeSavedMins} mins</div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">🚥 Cleared Signal Junctions (Green Wave Active):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {emergencyPlan.clearedSignalJunctions.map((j, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-[10px]">
                        🟢 {j}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setGreenCorridorActive(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Siren className="w-4 h-4 animate-spin" />
                  <span>🚨 Activate Emergency Green Corridor Signal Clearance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: REPORT ROAD HAZARD ─── */}
        {activeTab === 'road_problem' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Citizen Hazard & Road Problem Reporting</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Crowdsourced reports of potholes, waterlogging, or accidents auto-routed to BMC & CRUT dispatch teams.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportHazardOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report Road Problem</span>
                </button>
              </div>

              <div className="space-y-3">
                {hazardReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            r.problemType === 'waterlogging' ? 'bg-blue-100 text-blue-700' :
                            r.problemType === 'accident' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {r.problemType}
                          </span>
                          <h3 className="font-black text-sm text-slate-900 dark:text-white">{r.title}</h3>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">📍 {r.locationName} • {r.reportedAt}</div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {r.description}
                    </p>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-[11px] text-slate-400">Action: {r.actionTaken}</span>
                      <button
                        onClick={() => {
                          setHazardReports(prev => prev.map(h => h.id === r.id ? { ...h, upvotes: h.upvotes + 1 } : h));
                        }}
                        className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-bold text-[11px] flex items-center gap-1 hover:border-blue-500"
                      >
                        <ThumbsUp className="w-3 h-3 text-blue-500" />
                        <span>Upvote ({r.upvotes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                Inspect Official City Command Map ➔
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: FUEL AND POLLUTION SAVINGS ─── */}
        {activeTab === 'fuel_pollution' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Fuel, Financial & CO₂ Pollution Savings Calculator
                    </h2>
                    <p className="text-xs text-slate-500">
                      Calculates how shifting from single-occupant private cars to Mo Bus electric fleets saves money and reduces urban emissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Cost Saved</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">₹{fuelSavings.costSavedInr}</div>
                </div>
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Fuel Saved</div>
                  <div className="text-lg font-black text-blue-600 mt-0.5">{fuelSavings.fuelSavedLitres} L</div>
                </div>
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">CO₂ Prevented</div>
                  <div className="text-lg font-black text-purple-600 mt-0.5">{fuelSavings.co2SavedGrams} g</div>
                </div>
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Green Points</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">+{fuelSavings.greenPointsEarned} pts</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">🌿 Eco Impact Equivalent: </span>
                <span className="text-emerald-600 font-extrabold">{Math.max(1, Math.round(fuelSavings.co2SavedGrams / 80))} Trees Equivalent CO₂ Absorbed</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: SMART LOAD BALANCING ─── */}
        {activeTab === 'load_balance' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Smart Load Balancing (Distribute Passengers Across Transit Modes)
                </h2>
                <p className="text-xs text-slate-500">
                  Instead of routing all passengers to the same crowded bus corridor, Musafir dynamically suggests parallel feeder routes and Metro lines.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{originName} ➔ {destinationName} (Main Corridor)</div>
                      <div className="text-[11px] text-slate-400">Default Direct Route</div>
                    </div>
                    <span className={`text-xs font-black ${smartBalance.primaryCorridorCrowded ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {smartBalance.primaryCorridorCrowded ? '88% High Density' : '45% Normal Flow'}
                    </span>
                  </div>
                </div>

                {smartBalance.recommendedAlternative ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-emerald-500 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xs font-black text-emerald-800 dark:text-emerald-300">{smartBalance.recommendedAlternative.title}</div>
                        <div className="text-[11px] text-emerald-600">{smartBalance.recommendedAlternative.via}</div>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{smartBalance.recommendedAlternative.occupancyPercent}% Occupancy</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>{smartBalance.recommendedAlternative.seatAvailability} • {smartBalance.recommendedAlternative.fareIncentive}</span>
                      <button
                        onClick={onNavigateToMap}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
                      >
                        Take Alternative ➔
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 font-medium">
                    Current corridor has balanced passenger distribution. Standard Mo Bus direct transit is optimal.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── MODAL: EVENT PARK & RIDE BOOKING PASS ─── */}
      {bookingEventModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl text-lg">🎫</span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Event Park & Ride Pass Confirmed</h3>
                  <p className="text-[11px] text-slate-500">{bookingEventModal.eventName}</p>
                </div>
              </div>
              <button onClick={() => setBookingEventModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">✕</button>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 text-center space-y-3">
              <div className="w-28 h-28 bg-white dark:bg-slate-800 border border-purple-300 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <QrCode className="w-20 h-20 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <div className="font-mono text-xs font-black text-purple-700 dark:text-purple-300">PASS-EVT-{Math.floor(100000 + Math.random() * 900000)}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                  🅿️ {bookingEventModal.parkAndRideCombination.parkingHubName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Slot: <strong>Lot #A-32</strong> • Shuttle: {bookingEventModal.parkAndRideCombination.shuttleFrequency}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Includes Free Return Mo E-Ride Shuttle to {bookingEventModal.venueName}!</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBookingEventModal(null);
                  if (onNavigateToMap) onNavigateToMap();
                }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Navigate to Parking on Google Maps ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EMPTY TRIP FREIGHT BOOKING ─── */}
      {bookingEmptyTripModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl text-lg">🚛</span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Return Cargo Job Accepted</h3>
                  <p className="text-[11px] text-slate-500">Job #{bookingEmptyTripModal.matchedParcelJob.jobId}</p>
                </div>
              </div>
              <button onClick={() => setBookingEmptyTripModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">✕</button>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Assigned Driver:</span>
                <span className="font-black text-slate-900 dark:text-white">{bookingEmptyTripModal.driverName} ({bookingEmptyTripModal.vehicleRegistration})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Pickup Window:</span>
                <span className="font-black text-emerald-600">In 15–20 mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Payout:</span>
                <span className="font-black text-slate-900 dark:text-white">₹{bookingEmptyTripModal.matchedParcelJob.offeredPayoutInr}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800">
                <span className="text-slate-500 font-bold">Eco Impact:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Saved {bookingEmptyTripModal.dieselSavedLitres}L Diesel</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBookingEmptyTripModal(null);
                  if (onNavigateToMap) onNavigateToMap();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Track Live Return Driver on Map ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: POST EMPTY RETURN VEHICLE ─── */}
      {isPostEmptyTripOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Post Empty Return Vehicle</h3>
              <button onClick={() => setIsPostEmptyTripOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handlePostEmptyVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manas Swain"
                  value={postDriverName}
                  onChange={(e) => setPostDriverName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Vehicle Category</label>
                <select
                  value={postVehicleType}
                  onChange={(e) => setPostVehicleType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Tata Ace (1T)">Tata Ace (1T)</option>
                  <option value="E-Loader 3W">E-Loader 3W (Electric)</option>
                  <option value="Mahindra Bolero Maxi">Mahindra Bolero Maxi</option>
                  <option value="14-Wheel Freight Truck">14-Wheel Freight Truck</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Return Origin</label>
                  <input
                    type="text"
                    value={postOrigin}
                    onChange={(e) => setPostOrigin(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Return Destination</label>
                  <input
                    type="text"
                    value={postDestination}
                    onChange={(e) => setPostDestination(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Available Empty Capacity (kg)</label>
                <input
                  type="number"
                  value={postEmptyKg}
                  onChange={(e) => setPostEmptyKg(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Publish & Auto-Match Nearby Parcels
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: SMART PARKING RESERVATION ─── */}
      {reservingParkingModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl text-lg">🅿️</span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Smart Spot Reserved</h3>
                  <p className="text-[11px] text-slate-500">{reservingParkingModal.hubName}</p>
                </div>
              </div>
              <button onClick={() => setReservingParkingModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">✕</button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 text-center space-y-2">
              <div className="w-28 h-28 bg-white dark:bg-slate-800 border border-blue-300 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <QrCode className="w-20 h-20 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="font-mono text-xs font-black text-blue-700 dark:text-blue-300">
                PARK-PASS-{Math.floor(100000 + Math.random() * 900000)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Allocated Spot: <strong className="text-blue-600 font-mono">Bay #B2-18</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Rate: ₹{reservingParkingModal.currentDynamicRateInr}/hr (45 min hold active)
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReservingParkingModal(null);
                  if (onNavigateToMap) onNavigateToMap();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Navigate to Parking Bay with Google Maps ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DISPATCHED BUS POPUP ─── */}
      {dispatchedBusInfo && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center text-2xl">
              🚀
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Standby Extra Bus Dispatched!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Extra Electric Mo Bus deployed to <strong>{dispatchedBusInfo.routeId}</strong> from <strong>{dispatchedBusInfo.depot}</strong> at {dispatchedBusInfo.time}.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Corridor Crowd Before</span>
                <span className="font-black text-rose-600 text-sm">{dispatchedBusInfo.crowdBefore}%</span>
              </div>
              <div className="border-r border-slate-300 dark:border-slate-700"></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Crowd After Standby</span>
                <span className="font-black text-emerald-600 text-sm">{dispatchedBusInfo.crowdAfter}%</span>
              </div>
            </div>

            <button
              onClick={() => setDispatchedBusInfo(null)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Done & Return to Grid
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: GREEN CORRIDOR ACTIVE POPUP ─── */}
      {greenCorridorActive && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white mx-auto flex items-center justify-center text-2xl animate-pulse">
              🚨
            </div>
            <div>
              <h3 className="font-black text-lg text-rose-600">Police Green Corridor Activated!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Traffic signals preempted along <strong>KIMS Hospital ➔ Apollo Hospital</strong>. 6 Junctions switched to emergency green wave.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Ambulance ETA reduced from 32m ➔ 11 mins!</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setGreenCorridorActive(false);
                  if (onNavigateToMap) onNavigateToMap();
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Track Live Green Wave on Map ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: REPORT HAZARD ─── */}
      {isReportHazardOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Submit Road Hazard Report</h3>
              <button onClick={() => setIsReportHazardOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAddHazardReport} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Hazard Type</label>
                <select
                  value={newHazardType}
                  onChange={(e) => setNewHazardType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="pothole">🕳️ Dangerous Pothole</option>
                  <option value="waterlogging">🌧️ Waterlogging / Drainage Overflow</option>
                  <option value="accident">💥 Accident / Collision</option>
                  <option value="roadblock">🚧 Roadblock / Construction</option>
                  <option value="illegal_parking">🚗 Illegal Parking in Bus Bay</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe waterlogging near flyover underpass"
                  value={newHazardTitle}
                  onChange={(e) => setNewHazardTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={newHazardLocation}
                  onChange={(e) => setNewHazardLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details for traffic police..."
                  value={newHazardDesc}
                  onChange={(e) => setNewHazardDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportHazardOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
