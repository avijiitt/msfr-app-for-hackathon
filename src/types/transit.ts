export type TransitMode = 'bus' | 'metro' | 'train' | 'tram' | 'ferry' | 'auto' | 'walk' | 'bike';

export type RouteMode = 'fastest' | 'cheapest' | 'senior' | 'night' | 'eco' | 'weather';

export type OccupancyLevel = 'low' | 'moderate' | 'full' | 'crowded';

export type ThemeMode = 'dark' | 'light';

export type SupabaseSyncStatus = 'synced' | 'local_cached' | 'syncing' | 'offline';

export interface UserLiveLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  address?: string;
  isRealGps: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  mode: TransitMode;
  routeId: string;
  lineName: string;
  color: string;
  lat: number;
  lng: number;
  speedKmH: number;
  heading: number;
  nextStopId: string;
  nextStopName: string;
  etaSeconds: number;
  delaySeconds: number;
  occupancy: OccupancyLevel;
  isWomenOnlyCoachAvailable?: boolean;
  isLowFloorAccessible?: boolean;
  isAc?: boolean;
  evVehicle?: boolean;
}

export interface StationDeparture {
  routeId: string;
  lineName: string;
  destination: string;
  mode: TransitMode;
  etaMinutes: number;
  delayMinutes: number;
  platform: string;
  occupancy: OccupancyLevel;
}

export interface Station {
  id: string;
  name: string;
  localNames?: Record<string, string>;
  mode: TransitMode;
  lat: number;
  lng: number;
  lines: string[];
  isElevatorAccessible: boolean;
  hasCCTV: boolean;
  isWellLit: boolean;
  hasRestroom: boolean;
  hasPharmacyNearby: boolean;
  hasPolicePostNearby: boolean;
  hasParcelLocker: boolean;
  isCoveredWalkway: boolean;
  departures: StationDeparture[];
}

export interface TransitRoute {
  id: string;
  name: string;
  lineCode: string;
  mode: TransitMode;
  color: string;
  path: [number, number][];
  stationIds: string[];
  frequencyMins: number;
  baseFare: number;
  isNightSafe: boolean;
  isWeatherCovered: boolean;
  isEcoElectric: boolean;
  operationalStatus?: 'operational' | 'under_construction' | 'planned';
}

export interface RouteLeg {
  id: string;
  mode: TransitMode;
  lineName: string;
  lineCode?: string;
  color: string;
  fromStation: string;
  toStation: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  path?: [number, number][];
  durationMins: number;
  distanceKm: number;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  co2Grams: number;
  isStepFree: boolean;
  safetyScore: number;
  instructions: string[];
}

export interface JourneyOption {
  id: string;
  title: string;
  modeType: RouteMode;
  totalDurationMins: number;
  totalFare: number;
  co2SavingsGrams: number;
  safetyScore: number;
  accessibilityScore: number;
  weatherResilienceScore: number;
  transfersCount: number;
  legs: RouteLeg[];
  isRecommended?: boolean;
  badges: string[];
  warningMessage?: string;
}

export interface Incident {
  id: string;
  type: 'strike' | 'breakdown' | 'weather_flood' | 'signal_issue' | 'crowd_surge' | 'festival_special';
  title: string;
  description: string;
  affectedLines: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  locationName?: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'store' | 'supermarket' | 'cafe' | 'hospital' | 'pharmacy' | 'police' | 'restroom' | 'hotel' | 'ev_charging';
  lat: number;
  lng: number;
  address: string;
  distanceMeters: number;
  isOpen24x7: boolean;
  isOpenNow?: boolean;
  openHours?: string;
  phone?: string;
  rating?: number;
  userReviewsCount?: number;
  priceLevel?: '₹' | '₹₹' | '₹₹₹';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  homeAddress: string;
  workAddress: string;
  emergencyContacts: EmergencyContact[];
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalNotes: string;
  allergies: string;
  studentVerification: StudentVerification;
  isSeniorVerified: boolean;
  isWomenPassenger: boolean;
  familyShareActive: boolean;
  supabaseSyncedAt?: string;
}

export interface StudentVerification {
  isVerified: boolean;
  verificationMethod: 'digilocker' | 'ocr_card' | 'none';
  rollNo?: string;
  collegeName?: string;
  courseName?: string;
  validUntil?: string;
  studentIdCardUrl?: string;
  verifiedAt?: string;
}

export interface ScheduledRide {
  id: string;
  originStationId: string;
  originStationName: string;
  destStationId: string;
  destStationName: string;
  date: string;
  time: string;
  isRecurring: boolean;
  recurringDays?: string[];
  routeTitle: string;
  estimatedFare: number;
  notificationMinutesBefore: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ParcelBooking {
  id: string;
  trackingCode: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  alternateRecipientPhone: string;
  originStation: string;
  destStation: string;
  lockerNumber: string;
  lockerPin: string;
  weightKg: number;
  fare: number;
  status: 'booked' | 'in_transit' | 'ready_pickup' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

export interface ParcelLockerItem {
  id: string;
  trackingCode: string;
  stationName: string;
  lockerNumber: string;
  pin: string;
  status: 'ready_pickup' | 'in_transit' | 'delivered';
  recipientName: string;
  recipientPhone: string;
  expiryTime: string;
}

export interface SupportTicket {
  id: string;
  category: 'lost_found' | 'fare_dispute' | 'bus_delay' | 'driver_feedback' | 'safety_concern' | 'general';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  resolutionNotes?: string;
}

export interface TransitPass {
  id: string;
  type: 'student' | 'senior' | 'daily' | 'women_pink' | 'standard';
  title: string;
  validUntil: string;
  qrPayload: string;
  passengerName: string;
  discountPercentage: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'topup' | 'fare_debit' | 'pass_purchase' | 'refund';
  title: string;
  timestamp: string;
  balanceAfter: number;
  status: 'success' | 'failed';
  routeOrMethod?: string;
}
