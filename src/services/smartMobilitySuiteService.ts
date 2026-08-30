/**
 * Smart Mobility & Urban Traffic Intelligence Suite
 * Handles:
 * 1. 30–60 Min Traffic Congestion Forecasting
 * 2. Problem Simulation (Accidents, Rain/Waterlogging, Roadblocks, Large Events)
 * 3. Area Traffic & Safety Scores (0 - 100 Index)
 * 4. Emergency Green Corridor Routing (Ambulances / Fire Response)
 * 5. Road Hazard Reporting (Potholes, Roadblocks, Illegal Parking)
 * 6. Public Transport Congestion Shift Advisor
 * 7. Fuel & Emissions Analytics (Time, Fuel Litres, CO2 Savings)
 * 8. City Official Admin Dashboard State
 * 9. Off-Peak Delivery Time Slot Advisor
 */

export interface TrafficPredictionCorridor {
  id: string;
  roadName: string;
  currentSpeedKmph: number;
  freeFlowSpeedKmph: number;
  currentCongestionLevel: 'low' | 'moderate' | 'heavy' | 'gridlock';
  predicted30MinLevel: 'low' | 'moderate' | 'heavy' | 'gridlock';
  predicted60MinLevel: 'low' | 'moderate' | 'heavy' | 'gridlock';
  peakReason: string;
  recommendedAlternative: string;
}

export interface AreaTrafficScore {
  areaId: string;
  areaName: string;
  scoreOutOf100: number; // 100 = flawless traffic & safety, <40 = severely congested/hazardous
  status: 'excellent' | 'good' | 'moderate' | 'congested' | 'critical';
  activeDeliveriesCount: number;
  reportedIncidentsCount: number;
  avgTravelDelayMins: number;
  majorBottleneck: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: 'accident' | 'heavy_rain' | 'roadblock' | 'large_event' | 'vip_movement';
  location: string;
  severity: 'low' | 'medium' | 'high' | 'catastrophic';
  simulatedDelayMins: number;
  affectedRadiusKm: number;
  impactedRoutes: string[];
  suggestedAction: string;
  automatedSignalAdjustment: string;
}

export interface RoadProblemReport {
  id: string;
  problemType: 'accident' | 'pothole' | 'waterlogging' | 'roadblock' | 'illegal_parking';
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  reportedAt: string;
  severity: 'minor' | 'moderate' | 'severe';
  status: 'reported' | 'acknowledged_by_police' | 'crews_dispatched' | 'resolved';
  upvotes: number;
  actionTaken?: string;
}

export interface EmergencyRoutePlan {
  id: string;
  emergencyType: 'ambulance' | 'fire_engine' | 'police_siren';
  originHospital: string;
  destinationPatient: string;
  directDistanceKm: number;
  standardDurationMins: number;
  clearedGreenCorridorDurationMins: number;
  timeSavedMins: number;
  clearedSignalJunctions: string[];
  smartBypassRoads: string[];
  recommendedSpeedKmph: number;
}

export interface DeliveryTimeSuggestion {
  timeSlot: string;
  trafficLevel: 'very_low' | 'low' | 'moderate' | 'peak';
  trafficScore: number;
  isRecommended: boolean;
  timeSavedPercent: number;
  fuelSavedLitres: number;
  reason: string;
}

// ── 1. Real-Time 30–60 Min Predictive Congestion Data ────────
export const TRAFFIC_PREDICTIONS: TrafficPredictionCorridor[] = [
  {
    id: 'tp-1',
    roadName: 'Janpath Corridor (Master Canteen ➔ Vani Vihar)',
    currentSpeedKmph: 22,
    freeFlowSpeedKmph: 45,
    currentCongestionLevel: 'moderate',
    predicted30MinLevel: 'heavy',
    predicted60MinLevel: 'heavy',
    peakReason: 'Evening commercial market rush & coaching institutes dispersal',
    recommendedAlternative: 'DCP Square ➔ Unit 9 Inner Link',
  },
  {
    id: 'tp-2',
    roadName: 'Nandankanan Road (Damana ➔ Patia ➔ KIIT Square)',
    currentSpeedKmph: 18,
    freeFlowSpeedKmph: 50,
    currentCongestionLevel: 'heavy',
    predicted30MinLevel: 'gridlock',
    predicted60MinLevel: 'heavy',
    peakReason: 'IT Infocity shift change & KIIT University student movement',
    recommendedAlternative: 'Sailashree Vihar Phase 2 Outer Ring Bypass',
  },
  {
    id: 'tp-3',
    roadName: 'NH-16 Flyover (Rasulgarh ➔ Jayadev Vihar)',
    currentSpeedKmph: 32,
    freeFlowSpeedKmph: 60,
    currentCongestionLevel: 'moderate',
    predicted30MinLevel: 'heavy',
    predicted60MinLevel: 'moderate',
    peakReason: 'Intercity interstate freight & office commuter convergence',
    recommendedAlternative: 'Cuttack-Puri Bypass Service Road',
  },
  {
    id: 'tp-4',
    roadName: 'Khandagiri - Baramunda Link',
    currentSpeedKmph: 38,
    freeFlowSpeedKmph: 45,
    currentCongestionLevel: 'low',
    predicted30MinLevel: 'low',
    predicted60MinLevel: 'moderate',
    peakReason: 'Smooth traffic flow, minor bus terminal queue at 06:00 PM',
    recommendedAlternative: 'Main Highway is optimal',
  },
  {
    id: 'tp-5',
    roadName: 'Kalpana Square ➔ Puri Road (Garage Chhak)',
    currentSpeedKmph: 20,
    freeFlowSpeedKmph: 40,
    currentCongestionLevel: 'heavy',
    predicted30MinLevel: 'heavy',
    predicted60MinLevel: 'moderate',
    peakReason: 'Old Town temple pilgrim traffic & vegetable market loading',
    recommendedAlternative: 'Sishupalgarh Outer Ring Road',
  },
];

// ── 2. Area Traffic & Safety Scores (0 - 100 Index) ───────────
export const AREA_TRAFFIC_SCORES: AreaTrafficScore[] = [
  {
    areaId: 'area-patia',
    areaName: 'Patia / Infocity / KIIT Corridor',
    scoreOutOf100: 54,
    status: 'congested',
    activeDeliveriesCount: 42,
    reportedIncidentsCount: 3,
    avgTravelDelayMins: 14,
    majorBottleneck: 'Infocity Square U-turn & Silicon Gate',
  },
  {
    areaId: 'area-jayadev',
    areaName: 'Jayadev Vihar / Nayapalli / IRC Village',
    scoreOutOf100: 68,
    status: 'moderate',
    activeDeliveriesCount: 28,
    reportedIncidentsCount: 1,
    avgTravelDelayMins: 8,
    majorBottleneck: 'Pal Heights underpass merge',
  },
  {
    areaId: 'area-master-canteen',
    areaName: 'Master Canteen / Janpath / Ashok Nagar',
    scoreOutOf100: 42,
    status: 'congested',
    activeDeliveriesCount: 65,
    reportedIncidentsCount: 4,
    avgTravelDelayMins: 18,
    majorBottleneck: 'Station Plaza auto rickshaw queue',
  },
  {
    areaId: 'area-khandagiri',
    areaName: 'Khandagiri / Baramunda ISBT / Kalinga Nagar',
    scoreOutOf100: 84,
    status: 'good',
    activeDeliveriesCount: 19,
    reportedIncidentsCount: 0,
    avgTravelDelayMins: 3,
    majorBottleneck: 'ISBT entry slip road',
  },
  {
    areaId: 'area-rasulgarh',
    areaName: 'Rasulgarh / Palasuni / Mancheswar IE',
    scoreOutOf100: 38,
    status: 'critical',
    activeDeliveriesCount: 52,
    reportedIncidentsCount: 6,
    avgTravelDelayMins: 24,
    majorBottleneck: 'Rasulgarh Square flyover underpass & Cuttack Road bottleneck',
  },
  {
    areaId: 'area-nandankanan',
    areaName: 'Nandankanan / Raghunathpur / Royal Lagoon',
    scoreOutOf100: 78,
    status: 'good',
    activeDeliveriesCount: 15,
    reportedIncidentsCount: 1,
    avgTravelDelayMins: 5,
    majorBottleneck: 'Nandan Vihar crossing',
  },
];

// ── 3. Simulation Scenarios (What-If Interactive Simulator) ────
export const PRESET_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim-rain-acharya',
    title: 'Monsoon Heavy Downpour at Acharya Vihar Underpass',
    category: 'heavy_rain',
    location: 'Acharya Vihar Square & IMMT Gate',
    severity: 'high',
    simulatedDelayMins: 25,
    affectedRadiusKm: 2.2,
    impactedRoutes: ['Route 10', 'Route 11', 'Route 13', 'Route 24'],
    suggestedAction: 'Divert south-bound commuters via Sainik School ➔ Press Square bypass road.',
    automatedSignalAdjustment: 'Extend green signal time by +40s at Vani Vihar Flyover junction.',
  },
  {
    id: 'sim-accident-rasulgarh',
    title: 'Multi-Vehicle Accident on Rasulgarh Flyover Incline',
    category: 'accident',
    location: 'Rasulgarh Flyover Northbound',
    severity: 'high',
    simulatedDelayMins: 35,
    affectedRadiusKm: 3.5,
    impactedRoutes: ['Route 16', 'Route 18', 'Route 28', 'Route 42'],
    suggestedAction: 'Close entry ramp; direct traffic via Mancheswar Industrial Estate internal corridor.',
    automatedSignalAdjustment: 'Dispatch rapid towing crane & switch traffic lights to emergency flashing amber.',
  },
  {
    id: 'sim-event-janta-maidan',
    title: 'Major Tech & Cultural Expo at Janata Maidan (35,000 Visitors)',
    category: 'large_event',
    location: 'Janata Maidan / Xavier Square / Mayfair Road',
    severity: 'medium',
    simulatedDelayMins: 20,
    affectedRadiusKm: 1.8,
    impactedRoutes: ['Route 09', 'Route 10', 'Route 12', 'Route 26'],
    suggestedAction: 'Activate Park-and-Ride shuttle at Apollo ground; restrict private cabs on Mayfair road.',
    automatedSignalAdjustment: 'Set synchronized green wave on Fortune Tower ➔ Kalinga Hospital corridor.',
  },
  {
    id: 'sim-roadblock-kalpana',
    title: 'Pipeline Emergency Repair at Kalpana Square',
    category: 'roadblock',
    location: 'Kalpana Square / BJB Nagar',
    severity: 'medium',
    simulatedDelayMins: 15,
    affectedRadiusKm: 1.2,
    impactedRoutes: ['Route 13', 'Route 14', 'Route 33'],
    suggestedAction: 'Reroute via State Museum ➔ Ravi Talkies inner lane.',
    automatedSignalAdjustment: 'Increase Rajmahal green cycle by +25s.',
  },
];

// ── 4. Initial Road Hazard Citizen Reports ─────────────────────
export const INITIAL_ROAD_PROBLEM_REPORTS: RoadProblemReport[] = [
  {
    id: 'rp-101',
    problemType: 'waterlogging',
    title: 'Severe Waterlogging at Acharya Vihar Low Bridge',
    description: 'Knee-deep water after afternoon rain. 2-wheelers cannot pass. Heavy traffic jam.',
    locationName: 'Acharya Vihar Underpass, Bhubaneswar',
    lat: 20.2920,
    lng: 85.8340,
    reportedAt: '12 mins ago',
    severity: 'severe',
    status: 'crews_dispatched',
    upvotes: 48,
    actionTaken: 'BMC drainage pump deployed on site.',
  },
  {
    id: 'rp-102',
    problemType: 'pothole',
    title: 'Deep Dangerous Pothole near Infocity Square',
    description: 'Large trench near left bus lane. Causing sudden swerving of scooters.',
    locationName: 'Infocity Road, Near DLF Cybercity, Patia',
    lat: 20.3602,
    lng: 85.8035,
    reportedAt: '35 mins ago',
    severity: 'moderate',
    status: 'acknowledged_by_police',
    upvotes: 27,
    actionTaken: 'Safety barricade placed; scheduled for bitumen repair at 11 PM.',
  },
  {
    id: 'rp-103',
    problemType: 'illegal_parking',
    title: 'Illegal Double Parking blocking Mo Bus Bay',
    description: 'Private SUVs parked directly in the bus pickup bay causing buses to stop in middle lane.',
    locationName: 'Master Canteen Janpath Market, Bhubaneswar',
    lat: 20.2668,
    lng: 85.8436,
    reportedAt: '1 hour ago',
    severity: 'moderate',
    status: 'reported',
    upvotes: 19,
  },
  {
    id: 'rp-104',
    problemType: 'accident',
    title: 'Minor Auto-Cab Collision on Rasulgarh Flyover',
    description: 'One lane blocked on the climb towards Cuttack. Slow moving traffic.',
    locationName: 'Rasulgarh Flyover, NH16, Bhubaneswar',
    lat: 20.2982,
    lng: 85.8643,
    reportedAt: '18 mins ago',
    severity: 'moderate',
    status: 'acknowledged_by_police',
    upvotes: 34,
    actionTaken: 'Traffic police clearance team arriving in 5 mins.',
  },
];

// ── 5. Emergency Green Corridor Routing Generator ─────────────
export function generateEmergencyCorridor(
  hospitalName: string = 'KIMS Hospital, Patia',
  destinationName: string = 'Apollo Hospital, Sainik School Road'
): EmergencyRoutePlan {
  return {
    id: `emg-${Date.now()}`,
    emergencyType: 'ambulance',
    originHospital: hospitalName,
    destinationPatient: destinationName,
    directDistanceKm: 7.2,
    standardDurationMins: 26,
    clearedGreenCorridorDurationMins: 11,
    timeSavedMins: 15,
    clearedSignalJunctions: [
      'KIIT Square (Signal Preempted - Active Green)',
      'Damana Square (Signal Preempted - Active Green)',
      'Kalinga Hospital Square (Rapid Police Clearance)',
      'Press Square (Free Left Corridor)',
    ],
    smartBypassRoads: [
      'Outer Ring Transit Corridor (0 bottlenecks)',
      'Emergency Bus Lane Preemption',
    ],
    recommendedSpeedKmph: 55,
  };
}

// ── 6. Off-Peak Delivery Time Slot Suggestions ────────────────
export const DELIVERY_TIME_SUGGESTIONS: DeliveryTimeSuggestion[] = [
  {
    timeSlot: '08:00 AM – 10:30 AM',
    trafficLevel: 'peak',
    trafficScore: 35,
    isRecommended: false,
    timeSavedPercent: 0,
    fuelSavedLitres: 0,
    reason: 'Morning peak commute rush across Janpath and Nandankanan road.',
  },
  {
    timeSlot: '11:00 AM – 01:30 PM',
    trafficLevel: 'low',
    trafficScore: 92,
    isRecommended: true,
    timeSavedPercent: 38,
    fuelSavedLitres: 1.8,
    reason: '⭐ Optimal Window! Wide-open roads, quick parking, and zero junction queues.',
  },
  {
    timeSlot: '02:00 PM – 04:30 PM',
    trafficLevel: 'low',
    trafficScore: 88,
    isRecommended: true,
    timeSavedPercent: 32,
    fuelSavedLitres: 1.4,
    reason: 'Smooth commercial traffic and quick delivery drop-offs.',
  },
  {
    timeSlot: '05:30 PM – 08:30 PM',
    trafficLevel: 'peak',
    trafficScore: 28,
    isRecommended: false,
    timeSavedPercent: 0,
    fuelSavedLitres: 0,
    reason: 'Heavy evening gridlock at Jayadev Vihar, Rasulgarh, and Patia.',
  },
  {
    timeSlot: '09:00 PM – 10:30 PM',
    trafficLevel: 'very_low',
    trafficScore: 96,
    isRecommended: true,
    timeSavedPercent: 46,
    fuelSavedLitres: 2.2,
    reason: 'Fastest night delivery window with empty arterial roads.',
  },
];

// ── 7. Fuel & Emissions Savings Calculator ─────────────────────
export function calculateFuelAndPollutionSavings(distanceKm: number = 10, mode: 'optimized_transit' | 'car_solo' = 'optimized_transit') {
  const carFuelLitersPerKm = 0.08; // 12.5 km/l
  const busFuelLitersPerPassengerKm = 0.015; // shared
  const carCo2GramsPerKm = 142;
  const busCo2GramsPerKm = 38;

  const carFuel = distanceKm * carFuelLitersPerKm;
  const transitFuel = distanceKm * busFuelLitersPerPassengerKm;
  const fuelSavedLitres = Math.max(0, carFuel - transitFuel);

  const carCo2 = distanceKm * carCo2GramsPerKm;
  const transitCo2 = distanceKm * busCo2GramsPerKm;
  const co2SavedGrams = Math.max(0, carCo2 - transitCo2);

  const costSavedInr = Math.round(fuelSavedLitres * 103); // ~₹103/L petrol in Odisha

  return {
    distanceKm,
    fuelSavedLitres: parseFloat(fuelSavedLitres.toFixed(2)),
    co2SavedGrams: Math.round(co2SavedGrams),
    costSavedInr,
    greenPointsEarned: Math.round(co2SavedGrams / 25),
  };
}

// ── 8. CRUT Ama Bus Late Night Service Check (10 PM to 6 AM) ──
export function isCrutAmaBusServiceClosed(date: Date = new Date()): {
  isClosed: boolean;
  message: string;
  nextServiceTime: string;
} {
  const hours = date.getHours();
  const isClosed = hours >= 22 || hours < 6;

  return {
    isClosed,
    message: isClosed
      ? '🌙 CRUT Ama Bus / Mo Bus Service is Closed for the night (Regular services operate from 06:00 AM to 10:00 PM)'
      : '🟢 CRUT Ama Bus Service is currently LIVE & Operational across all 82 lines.',
    nextServiceTime: isClosed ? '06:00 AM Tomorrow' : 'Now (Active)',
  };
}

// ── 9. Smart Stop Selection Model ───────────────────────────────
export interface SmartStopChoice {
  stopName: string;
  walkDistanceMeters: number;
  walkTimeMins: number;
  upcomingBusesCount: number;
  nextBusWaitMins: number;
  expectedCrowdPercent: number;
  crowdLabel: 'Low' | 'Moderate' | 'Heavy';
  availableRoutes: string[];
  isRecommended: boolean;
  recommendationReason: string;
}

export const SAMPLE_SMART_STOPS: SmartStopChoice[] = [
  {
    stopName: 'Behera Sahi / Acharya Vihar Stop (Recommended)',
    walkDistanceMeters: 300,
    walkTimeMins: 4,
    upcomingBusesCount: 3,
    nextBusWaitMins: 3,
    expectedCrowdPercent: 35,
    crowdLabel: 'Low',
    availableRoutes: ['Route 10', 'Route 11', 'Route 26'],
    isRecommended: true,
    recommendationReason: '⭐ 3 buses arriving in next 10 mins with guaranteed seating! Only 300m walk.',
  },
  {
    stopName: 'Jayadev Vihar Main Junction (Nearest Stop)',
    walkDistanceMeters: 60,
    walkTimeMins: 1,
    upcomingBusesCount: 1,
    nextBusWaitMins: 22,
    expectedCrowdPercent: 92,
    crowdLabel: 'Heavy',
    availableRoutes: ['Route 10'],
    isRecommended: false,
    recommendationReason: '⚠️ Only 1 bus in 22 mins with heavy crowd (40+ passengers waiting).',
  },
  {
    stopName: 'Vani Vihar Outer Bay',
    walkDistanceMeters: 450,
    walkTimeMins: 6,
    upcomingBusesCount: 2,
    nextBusWaitMins: 8,
    expectedCrowdPercent: 48,
    crowdLabel: 'Moderate',
    availableRoutes: ['Route 13', 'Route 24'],
    isRecommended: false,
    recommendationReason: 'Moderate frequency and 450m walking distance.',
  },
];

// ── 10. Event-Based Transport Planning Model ───────────────────
export interface EventTransportPlan {
  id: string;
  eventName: string;
  category: 'sports' | 'concert' | 'festival' | 'examination';
  venueName: string;
  expectedFootfall: string;
  peakTrafficWindow: string;
  suggestedArrivalTimes: string[];
  recommendedEntryGates: string[];
  alternateEntryCorridors: string[];
  lessCrowdedTransit: string[];
  parkAndRideCombination: {
    parkingHubName: string;
    distanceToVenue: string;
    shuttleFrequency: string;
    parkingFareInr: number;
  };
  cityResourceAction: string;
}

export const ACTIVE_EVENT_PLANS: EventTransportPlan[] = [
  {
    id: 'evt-1',
    eventName: 'ISL Football Derby & Athletic Championship',
    category: 'sports',
    venueName: 'Kalinga Stadium, Bhubaneswar',
    expectedFootfall: '35,000+ Spectators',
    peakTrafficWindow: '05:30 PM – 07:30 PM & 09:45 PM',
    suggestedArrivalTimes: ['04:45 PM (Gate Open)', '05:15 PM (Smooth Entry)'],
    recommendedEntryGates: ['Gate 3 (Direct Pedestrian Plaza)', 'Gate 6 (VIP / North Flyover)'],
    alternateEntryCorridors: ['Via Bidyut Marg ➔ Shastri Nagar Backroad', 'Via Nayapalli Flyover Underpass'],
    lessCrowdedTransit: ['Mo Bus Special Event Electric Shuttle #K-1', 'Mo E-Ride from Jayadev Vihar Bay'],
    parkAndRideCombination: {
      parkingHubName: 'Janata Maidan Dedicated Event Lot',
      distanceToVenue: '900m (Free E-Shuttle every 4 mins)',
      shuttleFrequency: 'Every 4 minutes',
      parkingFareInr: 20,
    },
    cityResourceAction: 'Auto-deployed 12 extra electric feeder buses & signal green-wave extended by 40s.',
  },
  {
    id: 'evt-2',
    eventName: 'Toshali National Crafts Mela & Live Musical Concert',
    category: 'concert',
    venueName: 'Janata Maidan, Jayadev Vihar',
    expectedFootfall: '50,000+ Visitors',
    peakTrafficWindow: '06:00 PM – 09:30 PM',
    suggestedArrivalTimes: ['04:00 PM – 05:30 PM (Early Bird Entry)'],
    recommendedEntryGates: ['North Pavilion Gate 2', 'Bhubaneswar Club Side Entry'],
    alternateEntryCorridors: ['Via Nandankanan Road ➔ Damana Diversion', 'Via Sainik School Bypass'],
    lessCrowdedTransit: ['Mo Bus Route 26 (Outer Ring Express)', 'Feeder Line 101'],
    parkAndRideCombination: {
      parkingHubName: 'IDCO Exhibition Ground Lot A & B',
      distanceToVenue: '600m (Direct Walkway)',
      shuttleFrequency: 'Every 5 minutes',
      parkingFareInr: 30,
    },
    cityResourceAction: 'Designated one-way traffic loop on Nandankanan link road.',
  },
  {
    id: 'evt-3',
    eventName: 'Odisha OPSC Civil Services & Engineering Entrance Exam',
    category: 'examination',
    venueName: 'KIIT & Utkal University Campus Clusters',
    expectedFootfall: '28,000+ Candidates',
    peakTrafficWindow: '07:30 AM – 09:00 AM & 01:00 PM – 02:00 PM',
    suggestedArrivalTimes: ['07:45 AM (Strict Entry by 08:30 AM)'],
    recommendedEntryGates: ['KIIT Campus 6 Main Gate', 'Vani Vihar Gate 1'],
    alternateEntryCorridors: ['Via Chandaka Forest Corridor', 'Via Infocity DLF Ring Road'],
    lessCrowdedTransit: ['Special Exam Fast-Track Mo Bus #E-10', 'Patia Station Feeder'],
    parkAndRideCombination: {
      parkingHubName: 'Patia Railway Station Multi-Modal Lot',
      distanceToVenue: '1.2 km (Mo E-Ride ₹10 flat)',
      shuttleFrequency: 'Continuous queue',
      parkingFareInr: 15,
    },
    cityResourceAction: 'Zero-horn silence zone enforced with dedicated police escort corridors.',
  },
];

// ── 11. Empty-Trip Matching & Unified Freight Platform ───────────
export interface EmptyTripMatch {
  id: string;
  vehicleRegistration: string;
  vehicleType: 'Tata Ace (1T)' | 'E-Loader 3W' | 'Mahindra Bolero Maxi' | '14-Wheel Freight Truck';
  driverName: string;
  currentReturnOrigin: string;
  returnDestination: string;
  emptyPayloadKg: number;
  availableFromTime: string;
  matchedParcelJob: {
    jobId: string;
    pickupLocation: string;
    dropLocation: string;
    weightKg: number;
    offeredPayoutInr: number;
    extraDetourKm: number;
  };
  dieselSavedLitres: number;
  co2PreventedKg: number;
}

export const SAMPLE_EMPTY_TRIP_MATCHES: EmptyTripMatch[] = [
  {
    id: 'et-101',
    vehicleRegistration: 'OD-02-CB-4819',
    vehicleType: 'Tata Ace (1T)',
    driverName: 'Ramesh Mohanty',
    currentReturnOrigin: 'Nandankanan Wholesale Market',
    returnDestination: 'Rasulgarh Industrial Area',
    emptyPayloadKg: 850,
    availableFromTime: 'In 15 mins (Empty Return)',
    matchedParcelJob: {
      jobId: 'PRCL-7712',
      pickupLocation: 'KIIT Square Hub, Patia',
      dropLocation: 'Vani Vihar / Saheed Nagar Hub',
      weightKg: 420,
      offeredPayoutInr: 650,
      extraDetourKm: 1.2,
    },
    dieselSavedLitres: 4.8,
    co2PreventedKg: 12.6,
  },
  {
    id: 'et-102',
    vehicleRegistration: 'OD-33-E-9021',
    vehicleType: 'E-Loader 3W',
    driverName: 'Sujit Behera',
    currentReturnOrigin: 'AIIMS Hospital Delivery Hub',
    returnDestination: 'Baramunda Central Depot',
    emptyPayloadKg: 200,
    availableFromTime: 'Now Available',
    matchedParcelJob: {
      jobId: 'PRCL-8890',
      pickupLocation: 'Khandagiri Square Depot',
      dropLocation: 'ISBT Baramunda Cargo Center',
      weightKg: 120,
      offeredPayoutInr: 280,
      extraDetourKm: 0.4,
    },
    dieselSavedLitres: 1.8,
    co2PreventedKg: 4.2,
  },
];

// ── 12. Municipal Solid Waste Collection Route Optimization ────
export interface SolidWasteBinSensor {
  binId: string;
  locationName: string;
  wardNumber: number;
  fillPercentage: number;
  status: 'critical_overflow' | 'full' | 'moderate' | 'empty';
  wasteType: 'organic' | 'dry_recyclable' | 'e_waste';
  lastCleaned: string;
  recommendedCollectionPriority: number; // 1 = immediate
}

export const MUNICIPAL_WASTE_BINS: SolidWasteBinSensor[] = [
  {
    binId: 'BIN-101',
    locationName: 'Saheed Nagar Market Frontage',
    wardNumber: 12,
    fillPercentage: 94,
    status: 'critical_overflow',
    wasteType: 'organic',
    lastCleaned: '18 hours ago',
    recommendedCollectionPriority: 1,
  },
  {
    binId: 'BIN-102',
    locationName: 'Nayapalli VIP Road Food Court',
    wardNumber: 15,
    fillPercentage: 88,
    status: 'full',
    wasteType: 'dry_recyclable',
    lastCleaned: '14 hours ago',
    recommendedCollectionPriority: 1,
  },
  {
    binId: 'BIN-103',
    locationName: 'Master Canteen Station Plaza',
    wardNumber: 8,
    fillPercentage: 82,
    status: 'full',
    wasteType: 'organic',
    lastCleaned: '12 hours ago',
    recommendedCollectionPriority: 2,
  },
  {
    binId: 'BIN-104',
    locationName: 'Khandagiri Square Tourist Stop',
    wardNumber: 22,
    fillPercentage: 35,
    status: 'empty',
    wasteType: 'dry_recyclable',
    lastCleaned: '3 hours ago',
    recommendedCollectionPriority: 4,
  },
];

// ── 13. AI-Based Smart Parking & Dynamic Pricing for Tier-2 Cities ──
export interface Tier2SmartParkingHub {
  id: string;
  hubName: string;
  locality: string;
  totalSlots: number;
  availableSlots: number;
  evChargingSlotsAvailable: number;
  baseHourlyRateInr: number;
  currentDynamicRateInr: number;
  surgeMultiplier: number;
  occupancyTrend: 'Filling Rapidly' | 'Stable' | 'Plenty of Spots';
  hasCoveredRoof: boolean;
}

export const TIER2_SMART_PARKINGS: Tier2SmartParkingHub[] = [
  {
    id: 'sp-1',
    hubName: 'Master Canteen Multi-Level Automated Parking',
    locality: 'Station Square, Bhubaneswar',
    totalSlots: 320,
    availableSlots: 42,
    evChargingSlotsAvailable: 8,
    baseHourlyRateInr: 20,
    currentDynamicRateInr: 35,
    surgeMultiplier: 1.75,
    occupancyTrend: 'Filling Rapidly',
    hasCoveredRoof: true,
  },
  {
    id: 'sp-2',
    hubName: 'Sahid Nagar Smart Community Parking Complex',
    locality: 'Janpath, Sahid Nagar',
    totalSlots: 180,
    availableSlots: 74,
    evChargingSlotsAvailable: 12,
    baseHourlyRateInr: 20,
    currentDynamicRateInr: 20,
    surgeMultiplier: 1.0,
    occupancyTrend: 'Stable',
    hasCoveredRoof: true,
  },
  {
    id: 'sp-3',
    hubName: 'Infocity IT Corridor Parking Plaza',
    locality: 'Patia, Bhubaneswar',
    totalSlots: 450,
    availableSlots: 188,
    evChargingSlotsAvailable: 24,
    baseHourlyRateInr: 15,
    currentDynamicRateInr: 15,
    surgeMultiplier: 1.0,
    occupancyTrend: 'Plenty of Spots',
    hasCoveredRoof: true,
  },
];

// ── 14. Predictive Public Bus Crowding & Smart Dispatch ─────────
export interface SmartBusDispatchRecommendation {
  routeId: string;
  routeName: string;
  currentPassengerLoadPercent: number;
  unmetPassengerDemandCount: number;
  recommendedAction: 'Dispatch Standby Bus' | 'Short-Loop Feeder' | 'Normal Operations';
  standbyDepot: string;
  estimatedResolutionMinutes: number;
}

export const SMART_BUS_DISPATCHES: SmartBusDispatchRecommendation[] = [
  {
    routeId: 'Route 10',
    routeName: 'Bhubaneswar Airport ➔ Nandankanan',
    currentPassengerLoadPercent: 94,
    unmetPassengerDemandCount: 58,
    recommendedAction: 'Dispatch Standby Bus',
    standbyDepot: 'Baramunda Central Electric Depot',
    estimatedResolutionMinutes: 6,
  },
  {
    routeId: 'Route 11',
    routeName: 'Bhubaneswar Railway Station ➔ Ghatikia',
    currentPassengerLoadPercent: 86,
    unmetPassengerDemandCount: 34,
    recommendedAction: 'Short-Loop Feeder',
    standbyDepot: 'Master Canteen Satellite Bay',
    estimatedResolutionMinutes: 8,
  },
];

