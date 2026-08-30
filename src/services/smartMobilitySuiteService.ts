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
