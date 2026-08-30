/**
 * Musafir Smart Transportation & Transit Intelligence Service
 * Powers Smart Route Distribution, Crowd-Level Prediction, Load Balancing,
 * Green Route Score, Disruption Management, Park & Ride, and Mobility Heatmap.
 */

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'jam_packed';

export interface RouteCrowdStatus {
  routeId: string;
  routeName: string;
  mode: 'bus' | 'metro' | 'e_ride';
  currentOccupancyPercent: number; // 0 - 100
  crowdLevel: CrowdLevel;
  availableSeats: number;
  standingCapacity: number;
  peakHourForecast: Array<{ hour: string; occupancyPercent: number; label: string }>;
  suggestedAlternative?: {
    routeId: string;
    routeName: string;
    occupancyPercent: number;
    incentiveDiscount: string;
    timeDiffMins: number;
  };
}

export interface ParkAndRideHub {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  totalSpots: number;
  availableSpots: number;
  evChargingSpots: number;
  hourlyRate: number;
  connectingTransit: string[];
  distanceFromCityCenterKm: number;
  estimatedCongestionSavedPercent: number;
}

export interface DisruptionAlert {
  id: string;
  title: string;
  type: 'road_closure' | 'waterlogging' | 'strike' | 'breakdown' | 'heavy_traffic' | 'vip_movement';
  severity: 'low' | 'medium' | 'critical';
  affectedCorridor: string;
  impactedRoutes: string[];
  recommendedBypass: string;
  bypassTimeSavedMins: number;
  lat: number;
  lng: number;
  reportedAt: string;
}

export interface HeatmapZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number; // 0.1 to 1.0
  type: 'congestion' | 'high_passenger_density' | 'transit_shortage';
  commuterVolumePerHour: number;
  averageDelayMins: number;
}

export interface GreenScoreComparison {
  mode: string;
  co2GramsPerKm: number;
  co2SavedGramsVsCar: number;
  greenCreditsEarned: number;
  ecoRatingStars: number;
  isRecommended: boolean;
}

// ── 1. Real-Time & Forecasted Crowd Prediction ──────────────────────────────
export const CRUCIAL_CORRIDOR_CROWDS: RouteCrowdStatus[] = [
  {
    routeId: 'Route 10',
    routeName: 'Bhubaneswar Railway Station ➔ Nandankanan (Via Jayadev Vihar & Patia)',
    mode: 'bus',
    currentOccupancyPercent: 88,
    crowdLevel: 'high',
    availableSeats: 3,
    standingCapacity: 22,
    peakHourForecast: [
      { hour: '08:00 AM', occupancyPercent: 92, label: 'Heavy Morning Peak' },
      { hour: '11:00 AM', occupancyPercent: 55, label: 'Moderate' },
      { hour: '02:00 PM', occupancyPercent: 40, label: 'Comfortable' },
      { hour: '05:30 PM', occupancyPercent: 95, label: 'Jam-Packed Evening Rush' },
      { hour: '08:30 PM', occupancyPercent: 60, label: 'Moderate' },
    ],
    suggestedAlternative: {
      routeId: 'Route 26 (Express via Outer Ring)',
      routeName: 'Master Canteen ➔ Patia via Outer Bypass',
      occupancyPercent: 38,
      incentiveDiscount: '₹5 Green Off',
      timeDiffMins: 4,
    },
  },
  {
    routeId: 'Route 11',
    routeName: 'Master Canteen ➔ Ghatikia / SUM Hospital',
    mode: 'bus',
    currentOccupancyPercent: 45,
    crowdLevel: 'moderate',
    availableSeats: 16,
    standingCapacity: 8,
    peakHourForecast: [
      { hour: '08:00 AM', occupancyPercent: 70, label: 'Busy' },
      { hour: '12:00 PM', occupancyPercent: 42, label: 'Comfortable' },
      { hour: '05:00 PM', occupancyPercent: 68, label: 'Busy' },
      { hour: '09:00 PM', occupancyPercent: 30, label: 'Empty Seats' },
    ],
  },
  {
    routeId: 'Route 24',
    routeName: 'Kalinga Hospital ➔ Jayadev Vihar ➔ Master Canteen',
    mode: 'bus',
    currentOccupancyPercent: 32,
    crowdLevel: 'low',
    availableSeats: 24,
    standingCapacity: 0,
    peakHourForecast: [
      { hour: '09:00 AM', occupancyPercent: 50, label: 'Moderate' },
      { hour: '01:00 PM', occupancyPercent: 28, label: 'Seating Available' },
      { hour: '06:00 PM', occupancyPercent: 58, label: 'Moderate' },
    ],
  },
  {
    routeId: 'Metro Line 1',
    routeName: 'Bhubaneswar Airport ➔ Cuttack Netaji Bus Terminal (Phase 1 Corridor)',
    mode: 'metro',
    currentOccupancyPercent: 62,
    crowdLevel: 'moderate',
    availableSeats: 48,
    standingCapacity: 35,
    peakHourForecast: [
      { hour: '08:30 AM', occupancyPercent: 85, label: 'Office Peak' },
      { hour: '01:00 PM', occupancyPercent: 45, label: 'Comfortable' },
      { hour: '06:30 PM', occupancyPercent: 88, label: 'Office Peak' },
    ],
    suggestedAlternative: {
      routeId: 'Mo E-Ride AC Feeder',
      routeName: 'Direct Sector Express',
      occupancyPercent: 25,
      incentiveDiscount: '₹10 Off QR Pass',
      timeDiffMins: -2,
    },
  },
  {
    routeId: 'Route 70',
    routeName: 'Baramunda ISBT ➔ Cuttack CDA Sector 9 & 11',
    mode: 'bus',
    currentOccupancyPercent: 78,
    crowdLevel: 'high',
    availableSeats: 6,
    standingCapacity: 18,
    peakHourForecast: [
      { hour: '08:00 AM', occupancyPercent: 82, label: 'High Rush' },
      { hour: '02:00 PM', occupancyPercent: 48, label: 'Moderate' },
      { hour: '06:00 PM', occupancyPercent: 90, label: 'Intercity Rush' },
    ],
  },
];

// ── 2. Smart Load Balancing Alternative Calculator ──────────────────────────
export function getSmartLoadBalancedOptions(origin: string, destination: string) {
  const isHighDensityCorridor = 
    (origin.toLowerCase().includes('patia') || origin.toLowerCase().includes('kiit') || origin.toLowerCase().includes('canteen')) &&
    (destination.toLowerCase().includes('patia') || destination.toLowerCase().includes('kiit') || destination.toLowerCase().includes('canteen'));

  return {
    primaryCorridorCrowded: isHighDensityCorridor,
    recommendedAlternative: isHighDensityCorridor ? {
      title: '🌿 Smart Load-Balanced Route (Save 12 mins & Avoid Rush)',
      via: 'Via Rasulgarh - Sailashree Vihar Bypass (Mo Bus Route 26 AC)',
      crowdLevel: 'low',
      occupancyPercent: 34,
      seatAvailability: '18+ Seats Empty',
      fareIncentive: '₹5 Discount Auto-Applied (Peak Diversion Bonus)',
      co2Saved: '320g CO₂',
    } : null,
  };
}

// ── 3. Green Route Score Calculator ─────────────────────────────────────────
export function calculateGreenRouteScores(distanceKm: number = 10): GreenScoreComparison[] {
  const dist = Math.max(1, distanceKm);
  const baseCarEmission = 192; // g CO2 / km
  const baseCabEmission = 135; // g CO2 / km
  const moBusEmission = 24; // g CO2 / km (Mo Bus Electric & CNG)
  const metroEmission = 14; // g CO2 / km (Electric Metro)
  const eRideEmission = 8; // g CO2 / km (Solar/EV Auto)

  return [
    {
      mode: 'Mo Bus Electric & CNG (Shared)',
      co2GramsPerKm: moBusEmission,
      co2SavedGramsVsCar: Math.round((baseCarEmission - moBusEmission) * dist),
      greenCreditsEarned: Math.round(dist * 5),
      ecoRatingStars: 5,
      isRecommended: true,
    },
    {
      mode: 'Bhubaneswar Metro Rapid Transit',
      co2GramsPerKm: metroEmission,
      co2SavedGramsVsCar: Math.round((baseCarEmission - metroEmission) * dist),
      greenCreditsEarned: Math.round(dist * 6),
      ecoRatingStars: 5,
      isRecommended: true,
    },
    {
      mode: 'Mo E-Ride Shared Electric Feeder',
      co2GramsPerKm: eRideEmission,
      co2SavedGramsVsCar: Math.round((baseCarEmission - eRideEmission) * dist),
      greenCreditsEarned: Math.round(dist * 7),
      ecoRatingStars: 5,
      isRecommended: true,
    },
    {
      mode: 'Auto Rickshaw (CNG / Petrol)',
      co2GramsPerKm: 78,
      co2SavedGramsVsCar: Math.round((baseCarEmission - 78) * dist),
      greenCreditsEarned: Math.round(dist * 2),
      ecoRatingStars: 3,
      isRecommended: false,
    },
    {
      mode: 'Private Cab (Petrol / Diesel Sedan)',
      co2GramsPerKm: baseCabEmission,
      co2SavedGramsVsCar: Math.round((baseCarEmission - baseCabEmission) * dist),
      greenCreditsEarned: 0,
      ecoRatingStars: 2,
      isRecommended: false,
    },
    {
      mode: 'Single Occupant Private Car',
      co2GramsPerKm: baseCarEmission,
      co2SavedGramsVsCar: 0,
      greenCreditsEarned: 0,
      ecoRatingStars: 1,
      isRecommended: false,
    },
  ];
}

// ── 4. Park & Ride Hubs for Parking Pressure Reduction ───────────────────────
export const PARK_AND_RIDE_HUBS: ParkAndRideHub[] = [
  {
    id: 'pr-baramunda',
    name: 'ISBT Baramunda Multi-Level Smart Parking Hub',
    location: 'NH16, Baramunda Bus Terminal Plaza',
    lat: 20.2818,
    lng: 85.7938,
    totalSpots: 450,
    availableSpots: 184,
    evChargingSpots: 32,
    hourlyRate: 10,
    connectingTransit: ['Mo Bus Line 10', 'Line 11', 'Line 70', 'Mo E-Ride Express'],
    distanceFromCityCenterKm: 4.2,
    estimatedCongestionSavedPercent: 42,
  },
  {
    id: 'pr-patia',
    name: 'Patia Station North Park & Ride',
    location: 'Patia Railway Station & KIIT Gateway',
    lat: 20.3567,
    lng: 85.8166,
    totalSpots: 280,
    availableSpots: 92,
    evChargingSpots: 18,
    hourlyRate: 10,
    connectingTransit: ['Mo Bus Line 10', 'Line 13', 'Line 26', 'Mo Cycle Docks'],
    distanceFromCityCenterKm: 7.5,
    estimatedCongestionSavedPercent: 55,
  },
  {
    id: 'pr-master-canteen',
    name: 'Master Canteen Station Plaza Underground Parking',
    location: 'Bhubaneswar Central Station West Entry',
    lat: 20.2668,
    lng: 85.8436,
    totalSpots: 350,
    availableSpots: 64,
    evChargingSpots: 24,
    hourlyRate: 15,
    connectingTransit: ['Metro Phase 1', 'Mo Bus Terminal 1 & 2', 'Pre-paid E-Auto'],
    distanceFromCityCenterKm: 0.8,
    estimatedCongestionSavedPercent: 38,
  },
  {
    id: 'pr-khandagiri',
    name: 'Khandagiri Bypass Park & Transit Hub',
    location: 'Near Khandagiri Caves Square, NH16',
    lat: 20.2605,
    lng: 85.7865,
    totalSpots: 200,
    availableSpots: 110,
    evChargingSpots: 14,
    hourlyRate: 10,
    connectingTransit: ['Mo Bus Line 11', 'Line 28', 'Direct SUM Hospital Shuttle'],
    distanceFromCityCenterKm: 5.8,
    estimatedCongestionSavedPercent: 48,
  },
];

// ── 5. Real-Time Disruption & Crisis Management ──────────────────────────────
export const ACTIVE_DISRUPTION_ALERTS: DisruptionAlert[] = [
  {
    id: 'dis-01',
    title: 'Waterlogging & Drain Maintenance near Rasulgarh Flyover Slip Road',
    type: 'waterlogging',
    severity: 'medium',
    affectedCorridor: 'Rasulgarh to Vani Vihar Slow Lane',
    impactedRoutes: ['Route 10', 'Route 18', 'Route 42'],
    recommendedBypass: 'Take Saheed Nagar Inner Ring Road ➔ Vani Vihar North Gate',
    bypassTimeSavedMins: 14,
    lat: 20.2982,
    lng: 85.8643,
    reportedAt: '15 mins ago',
  },
  {
    id: 'dis-02',
    title: 'VIP Movement & Security Protocol on AG Square to Governor House Road',
    type: 'vip_movement',
    severity: 'critical',
    affectedCorridor: 'AG Square – Secretariat Corridor',
    impactedRoutes: ['Route 09', 'Route 20'],
    recommendedBypass: 'Divert via Capital Hospital ➔ Rajmahal Flyover ➔ Unit 1 Market Road',
    bypassTimeSavedMins: 20,
    lat: 20.2640,
    lng: 85.8280,
    reportedAt: 'Just now',
  },
  {
    id: 'dis-03',
    title: 'Smart City Cable Laying Road Diversion at Damana Square',
    type: 'road_closure',
    severity: 'low',
    affectedCorridor: 'Damana Chhak Northbound Lane',
    impactedRoutes: ['Route 10', 'Route 12', 'Route 26'],
    recommendedBypass: 'Use Niladri Vihar Service Road to connect Infocity',
    bypassTimeSavedMins: 8,
    lat: 20.3341,
    lng: 85.8202,
    reportedAt: '40 mins ago',
  },
];

// ── 6. City Mobility & Congestion Heatmap Data ──────────────────────────────
export const CITY_MOBILITY_HEATMAP_ZONES: HeatmapZone[] = [
  { id: 'hz-jayadev', name: 'Jayadev Vihar NH16 Junction', lat: 20.3039, lng: 85.8188, intensity: 0.92, type: 'congestion', commuterVolumePerHour: 4850, averageDelayMins: 12 },
  { id: 'hz-rasulgarh', name: 'Rasulgarh Highway Flyover Hub', lat: 20.2982, lng: 85.8643, intensity: 0.88, type: 'congestion', commuterVolumePerHour: 5120, averageDelayMins: 15 },
  { id: 'hz-kiit', name: 'KIIT Square & Infocity Tech Corridor', lat: 20.3541, lng: 85.8175, intensity: 0.82, type: 'high_passenger_density', commuterVolumePerHour: 3900, averageDelayMins: 8 },
  { id: 'hz-baramunda', name: 'Baramunda ISBT Terminal Entrance', lat: 20.2818, lng: 85.7938, intensity: 0.74, type: 'high_passenger_density', commuterVolumePerHour: 3400, averageDelayMins: 6 },
  { id: 'hz-station', name: 'Master Canteen Station Plaza', lat: 20.2668, lng: 85.8436, intensity: 0.85, type: 'high_passenger_density', commuterVolumePerHour: 4200, averageDelayMins: 9 },
  { id: 'hz-damana', name: 'Damana Square & CSPUR Market', lat: 20.3341, lng: 85.8202, intensity: 0.65, type: 'transit_shortage', commuterVolumePerHour: 2800, averageDelayMins: 5 },
  { id: 'hz-khandagiri', name: 'Khandagiri Chowk & Caves Area', lat: 20.2605, lng: 85.7865, intensity: 0.68, type: 'congestion', commuterVolumePerHour: 2950, averageDelayMins: 7 },
  { id: 'hz-badambadi', name: 'Badambadi Bus Stand, Cuttack', lat: 20.4625, lng: 85.8828, intensity: 0.95, type: 'congestion', commuterVolumePerHour: 6200, averageDelayMins: 18 },
];
