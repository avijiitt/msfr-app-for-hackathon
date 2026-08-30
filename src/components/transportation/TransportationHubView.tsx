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
  Info
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

interface TransportationHubProps {
  originName?: string;
  destinationName?: string;
  onSelectRoute?: (routeId: string) => void;
  onNavigateToMap?: () => void;
}

export type TransportationSubTab = 
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
  const [activeTab, setActiveTab] = useState<TransportationSubTab>('load_balance');
  const [selectedRoute, setSelectedRoute] = useState<RouteCrowdStatus>(CRUCIAL_CORRIDOR_CROWDS[0]);
  const [appliedIncentive, setAppliedIncentive] = useState(false);

  const smartBalance = getSmartLoadBalancedOptions(originName, destinationName);
  const greenScores = calculateGreenRouteScores(8.5);
  const lastMileOptions = calculateLastMileOptions(originName, destinationName);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      {/* 1. Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-blue-700/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Transit Intelligence Hub</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Transportation Optimization & Mobility Center
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Real-time route load balancing, crowd forecasting, green carbon metrics, safe last-mile routing, and city disruption mitigation.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-start md:self-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200">Grid Health</div>
              <div className="text-xs font-extrabold text-emerald-300">Optimized • 82 Lines Active</div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'load_balance', label: '⚖️ Load Balancing', icon: Zap },
            { id: 'crowd_predict', label: '👥 Crowd Prediction', icon: Users },
            { id: 'green_score', label: '🌿 Green Route Score', icon: Leaf },
            { id: 'last_mile', label: '🚶 Smart Last-Mile', icon: Footprints },
            { id: 'park_ride', label: '🅿️ Park & Ride', icon: ParkingCircle },
            { id: 'disruptions', label: '🚨 Disruption Manager', icon: AlertTriangle },
            { id: 'heatmap', label: '🔥 Mobility Heatmap', icon: Flame },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TransportationSubTab)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
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
