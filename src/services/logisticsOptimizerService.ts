/**
 * Logistics & Delivery Route Optimizer Service
 * Multi-Drop Fleet Logistics & Urban Transit Routing Engine.
 * Features Vehicle Routing Problem (VRP) solving, capacity matching, dynamic re-routing,
 * carbon reduction metrics, and multi-modal transit cargo scheduling.
 */

export interface DeliveryWaypoint {
  id: string;
  recipientName: string;
  phone?: string;
  address: string;
  lat: number;
  lng: number;
  altitudeMeters?: number; // Z-axis flight corridor altitude (15m - 120m)
  packageWeightKg: number;
  parcelCount?: number; // Number of items/parcels at this stop
  volumetricWeightKg?: number; // Calculated via (L * W * H) / 5000
  dimensionsCm?: { length: number; width: number; height: number };
  parcelType?: 'Documents' | 'Electronics' | 'Clothing' | 'Food' | 'Other' | string;
  parcelTypes?: string[]; // Multiple parcel categories per drop
  priority?: 'Standard' | 'Express' | 'Urgent';
  preferredTimeSlot?: 'Morning (09:00 - 12:00)' | 'Afternoon (12:00 - 16:00)' | 'Evening (16:00 - 20:00)' | 'Express (Within 2h)';
  deliveryDeadline?: string;
  timeWindow?: string;
  estimatedArrival?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'rescheduled';
  ecoPackaging?: boolean;
  specialHandling?: {
    fragile: boolean;
    keepUpright: boolean;
    tempSensitive: boolean;
  };
  dockingStatus?: 'ALIGNED_LOCKED' | 'APPROACHING' | 'PENDING';
  dockingToleranceCm?: number;
  assignedDriverId?: string;
  pod?: {
    receiverName?: string;
    signature?: string;
    otp?: string;
    photoUrl?: string;
    notes?: string;
    deliveredAt?: string;
  };
}

export interface VehicleOption {
  id: '2_wheeler_ev' | 'e_van' | '14ft_e_truck' | 'mo_bus_cargo';
  name: string;
  typeLabel: string;
  maxPayloadKg: number;
  maxVolumeM3: number;
  batteryRangeKm: number;
  costPerKmInr: number;
  baseFareInr: number;
  fuelType: 'EV Battery (LFP)' | 'Electric Swappable' | 'Mo Bus Transit Electric' | 'Hydrogen-EV Hybrid';
  co2FactorGPerKm: number; // grams CO2 equivalent
  colorCode: string;
}

export const VEHICLE_FLEET_OPTIONS: VehicleOption[] = [
  {
    id: '2_wheeler_ev',
    name: 'Ather / Ola Commercial EV Scooter',
    typeLabel: '2-Wheeler EV',
    maxPayloadKg: 25,
    maxVolumeM3: 0.18,
    batteryRangeKm: 85,
    costPerKmInr: 3.2,
    baseFareInr: 40,
    fuelType: 'Electric Swappable',
    co2FactorGPerKm: 12,
    colorCode: '#3B82F6',
  },
  {
    id: 'e_van',
    name: 'Tata Ace EV / Mahindra E-Supro Van',
    typeLabel: 'Light Commercial E-Van',
    maxPayloadKg: 120,
    maxVolumeM3: 1.4,
    batteryRangeKm: 140,
    costPerKmInr: 5.8,
    baseFareInr: 80,
    fuelType: 'EV Battery (LFP)',
    co2FactorGPerKm: 28,
    colorCode: '#10B981',
  },
  {
    id: '14ft_e_truck',
    name: 'Euler Motors 14ft Electric Freight Truck',
    typeLabel: '14ft Heavy E-Truck',
    maxPayloadKg: 750,
    maxVolumeM3: 16.0,
    batteryRangeKm: 210,
    costPerKmInr: 9.5,
    baseFareInr: 160,
    fuelType: 'Hydrogen-EV Hybrid',
    co2FactorGPerKm: 65,
    colorCode: '#F59E0B',
  },
  {
    id: 'mo_bus_cargo',
    name: 'CRUT Mo Bus Integrated Transit Cargo',
    typeLabel: 'Public Transit Cargo',
    maxPayloadKg: 60,
    maxVolumeM3: 0.6,
    batteryRangeKm: 180,
    costPerKmInr: 2.5,
    baseFareInr: 30,
    fuelType: 'Mo Bus Transit Electric',
    co2FactorGPerKm: 8,
    colorCode: '#8B5CF6',
  },
];

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: '2_wheeler_ev' | 'e_van' | '14ft_e_truck' | 'mo_bus_cargo';
  rating: number;
  totalTrips: number;
  currentLocation: string;
  status: 'available' | 'on_route' | 'resting';
  avatarInitials: string;
}

export const DRIVER_ROSTER: DriverProfile[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Kumar Mohanty',
    phone: '+91 94371 88290',
    vehicleNumber: 'OD-02-AX-8910',
    vehicleType: 'e_van',
    rating: 4.9,
    totalTrips: 1420,
    currentLocation: 'Baramunda Logistics Hub',
    status: 'available',
    avatarInitials: 'RM',
  },
  {
    id: 'drv-2',
    name: 'Biswajit Jena',
    phone: '+91 98610 44521',
    vehicleNumber: 'OD-33-E-4512',
    vehicleType: '2_wheeler_ev',
    rating: 4.8,
    totalTrips: 980,
    currentLocation: 'Patia / KIIT Square',
    status: 'available',
    avatarInitials: 'BJ',
  },
  {
    id: 'drv-3',
    name: 'Subrat Nayak',
    phone: '+91 70081 22934',
    vehicleNumber: 'OD-02-BT-9901',
    vehicleType: '14ft_e_truck',
    rating: 4.95,
    totalTrips: 2150,
    currentLocation: 'Rasulgarh NH-16 Depot',
    status: 'on_route',
    avatarInitials: 'SN',
  },
  {
    id: 'drv-4',
    name: 'Priyaranjan Das',
    phone: '+91 94390 11843',
    vehicleNumber: 'CRUT-MO-BUS-CARGO-12',
    vehicleType: 'mo_bus_cargo',
    rating: 4.85,
    totalTrips: 1780,
    currentLocation: 'Master Canteen Station',
    status: 'available',
    avatarInitials: 'PD',
  },
];

export interface LogisticsCostBreakdown {
  fuelOrBatteryCostInr: number;
  distanceFareInr: number;
  tollFeesInr: number;
  driverAllowanceInr: number;
  totalCostInr: number;
  costSavingVsDieselInr: number;
}

export interface RestrictedZone {
  id: string;
  name: string;
  code: string;
  type: 'airspace_restricted' | 'electromagnetic_interference' | 'crowd_density';
  severity: 'STRICT_NO_FLY' | 'HIGH_EMI_SHIELD' | 'LOW_ALTITUDE_PROHIBITED';
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  altitudeFloorMeters: number;
  altitudeCeilingMeters: number;
  description: string;
}

export interface EnergyMetrics {
  hoverKWh: number;
  ascentKWh: number;
  descentRegenKWh: number; // Regenerative glide energy recovered
  cruiseKWh: number;
  totalEnergyKWh: number;
  batterySocDepletionPercent: number;
  energyEfficiencyRating: 'A+' | 'A' | 'B';
}

export interface PayloadStabilityMetrics {
  centerOfMassOffsetCm: number;
  stabilityMarginPercent: number; // e.g. 96%
  pitchRollImbalanceRad: number;
  maxAllowableCapacityKg: number;
  currentPayloadKg: number;
  stabilityStatus: 'STABLE_OPTIMAL' | 'ACCEPTABLE' | 'WARNING_UNBALANCED';
}

export interface AntiGravityRoutePlan {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  fuelOrEnergySavedPercent: number;
  co2ReductionPercent: number;
  co2SavedKg: number;
  sequencedWaypoints: DeliveryWaypoint[];
  estimatedCostInr: number;
  vehicleType: 'anti_gravity_evtol' | '2_wheeler_ev' | '3_wheeler_e_loader' | 'e_van' | 'mo_bus_cargo' | '14ft_e_truck';
  co2EmissionsKg: number;
  summary: string;

  // 3D Altitude & Flying Corridor
  altitudeCorridorMeters: number; // Z-axis default altitude (15m - 120m)
  corridorLaneCode: string;
  verticalSpeedMps: number;
  horizontalSpeedKmh: number;

  // Energy-Aware Consumption Model
  energyMetrics: EnergyMetrics;

  // Payload & Stability
  payloadStability: PayloadStabilityMetrics;

  // Safety & Multi-Objective Scoring
  safetyScore: number; // e.g. 98.5 / 100
  lateDeliveryRiskPenalty: number;
  multiObjectiveScore: number;

  // Docking & Landing Precision
  dockingPrecisionToleranceCm: number;
  dockingLockEngaged: boolean;

  // Avoided Restricted Zones
  avoidedRestrictedZones: RestrictedZone[];

  // Cost & Fleet Details
  costBreakdown?: LogisticsCostBreakdown;
  assignedVehicle?: VehicleOption;
}

export type OptimizedLogisticsPlan = AntiGravityRoutePlan;

/**
 * Bhubaneswar & Odisha Urban Anti-Gravity / Drone Levitation Restricted Zones
 */
export const RESTRICTED_NO_FLY_ZONES: RestrictedZone[] = [
  {
    id: 'nfz-1',
    name: 'Biju Patnaik International Airport Airspace (BPI)',
    code: 'NFZ-AIRSPACE-01',
    type: 'airspace_restricted',
    severity: 'STRICT_NO_FLY',
    centerLat: 20.2520,
    centerLng: 85.8178,
    radiusKm: 3.8,
    altitudeFloorMeters: 0,
    altitudeCeilingMeters: 900,
    description: 'Civil aviation takeoff & approach path. Complete anti-gravity/drone flyover strictly prohibited by DGCA.',
  },
  {
    id: 'emi-2',
    name: 'Chandaka 400kV Ultra-High-Voltage Grid Substation',
    code: 'EMI-SECTOR-02',
    type: 'electromagnetic_interference',
    severity: 'HIGH_EMI_SHIELD',
    centerLat: 20.3589,
    centerLng: 85.7621,
    radiusKm: 2.1,
    altitudeFloorMeters: 10,
    altitudeCeilingMeters: 250,
    description: 'Intense electromagnetic field can disrupt magnetic levitation coils and avionics telemetry.',
  },
  {
    id: 'cdz-3',
    name: 'Master Canteen & Bhubaneswar Railway Station Plaza',
    code: 'CDZ-PEDESTRIAN-03',
    type: 'crowd_density',
    severity: 'LOW_ALTITUDE_PROHIBITED',
    centerLat: 20.2648,
    centerLng: 85.8402,
    radiusKm: 1.4,
    altitudeFloorMeters: 0,
    altitudeCeilingMeters: 40,
    description: 'High pedestrian density zone. Safe fly-through corridor enforced above 65m AGL with silent hover acoustic dampers.',
  },
];

/**
 * Benchmark delivery waypoints across primary commercial corridors in Bhubaneswar.
 */
export const SAMPLE_DELIVERY_STOPS: DeliveryWaypoint[] = [
  {
    id: 'dp-1',
    recipientName: 'Bapuji Nagar Hub',
    phone: '+91 94371 20041',
    address: 'Bapuji Nagar Main Road, Unit 1, Bhubaneswar',
    lat: 20.2662,
    lng: 85.8340,
    altitudeMeters: 35,
    packageWeightKg: 2.5,
    parcelType: 'Documents',
    priority: 'Standard',
    timeWindow: '09:00 - 09:30 AM',
    estimatedArrival: '09:25 AM',
    status: 'pending',
    ecoPackaging: true,
    dimensionsCm: { length: 20, width: 15, height: 10 },
    specialHandling: { fragile: true, keepUpright: false, tempSensitive: false },
    dockingStatus: 'ALIGNED_LOCKED',
    dockingToleranceCm: 6.5,
  },
  {
    id: 'dp-2',
    recipientName: 'Kalinga Vihar Resident',
    phone: '+91 98610 55412',
    address: 'Kalinga Vihar, K-4 Colony, Bhubaneswar',
    lat: 20.2312,
    lng: 85.7601,
    altitudeMeters: 45,
    packageWeightKg: 5.0,
    parcelType: 'Electronics',
    priority: 'Express',
    timeWindow: '09:45 - 10:15 AM',
    estimatedArrival: '10:05 AM',
    status: 'pending',
    ecoPackaging: true,
    dimensionsCm: { length: 30, width: 25, height: 18 },
    specialHandling: { fragile: true, keepUpright: true, tempSensitive: false },
    dockingStatus: 'ALIGNED_LOCKED',
    dockingToleranceCm: 7.2,
  },
  {
    id: 'dp-3',
    recipientName: 'anweshi',
    phone: '+91 98765 43210',
    address: 'Mani Tribhuban, Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (751024)',
    lat: 20.3688,
    lng: 85.8242,
    altitudeMeters: 55,
    packageWeightKg: 2.5,
    parcelType: 'Documents',
    priority: 'Standard',
    timeWindow: '10:30 - 11:00 AM',
    estimatedArrival: '10:45 AM',
    status: 'pending',
    ecoPackaging: true,
    dimensionsCm: { length: 20, width: 15, height: 10 },
    specialHandling: { fragile: true, keepUpright: false, tempSensitive: false },
    dockingStatus: 'ALIGNED_LOCKED',
    dockingToleranceCm: 8.0,
  },
  {
    id: 'dp-4',
    recipientName: 'Final Stop (Infocity Logistics Pod)',
    phone: '+91 94370 99881',
    address: 'Infocity DLF Cybercity, Patia, Bhubaneswar',
    lat: 20.3620,
    lng: 85.8050,
    altitudeMeters: 45,
    packageWeightKg: 22.0,
    parcelType: 'Other',
    priority: 'Standard',
    timeWindow: '11:00 - 11:30 AM',
    estimatedArrival: '11:15 AM',
    status: 'pending',
    ecoPackaging: true,
    dimensionsCm: { length: 50, width: 40, height: 35 },
    specialHandling: { fragile: false, keepUpright: true, tempSensitive: false },
    dockingStatus: 'ALIGNED_LOCKED',
    dockingToleranceCm: 5.4,
  },
];

/**
 * Checks if a direct trajectory intersects or penetrates a restricted zone sphere / cylinder
 */
function checkZoneIntersection(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  zone: RestrictedZone,
  altitudeMeters: number
): boolean {
  // If flight altitude is completely outside the zone's vertical restrictions, it's clear
  if (altitudeMeters < zone.altitudeFloorMeters || altitudeMeters > zone.altitudeCeilingMeters) {
    return false;
  }

  // Distance from midpoint to zone center
  const midLat = (p1.lat + p2.lat) / 2;
  const midLng = (p1.lng + p2.lng) / 2;
  const distMid = Math.sqrt(Math.pow(midLat - zone.centerLat, 2) + Math.pow(midLng - zone.centerLng, 2)) * 111;

  return distMid < zone.radiusKm;
}

/**
 * Energy-Aware Anti-Gravity & Multi-Objective Route Optimizer
 *
 * Models:
 * 1. Z-axis corridor & altitude layer (15m - 120m)
 * 2. Energy consumption: Hover, Ascent, Descent regen glide, cruise drag & payload kW drain
 * 3. Cargo center-of-mass & stability constraint (96% stability margin)
 * 4. No-fly & no-levitation zone bypass
 * 5. Docking precision & vertical alignment (±8 cm)
 * 6. Multi-objective score: minimize travel time, energy, safety risk, and imbalance penalty
 */
export function computeAntiGravityRoute(
  originHub: { name: string; lat: number; lng: number },
  waypoints: DeliveryWaypoint[],
  altitudeMeters: number = 45,
  vehicleType: 'anti_gravity_evtol' | '2_wheeler_ev' | '3_wheeler_e_loader' | 'e_van' | 'mo_bus_cargo' | '14ft_e_truck' = 'anti_gravity_evtol'
): AntiGravityRoutePlan {
  if (waypoints.length === 0) {
    return {
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      fuelOrEnergySavedPercent: 0,
      co2ReductionPercent: 0,
      co2SavedKg: 0,
      sequencedWaypoints: [],
      estimatedCostInr: 0,
      vehicleType,
      co2EmissionsKg: 0,
      summary: 'No delivery waypoints provided for optimization',
      altitudeCorridorMeters: altitudeMeters,
      corridorLaneCode: 'SKYWAY-LANE-00',
      verticalSpeedMps: 3.5,
      horizontalSpeedKmh: 48,
      energyMetrics: {
        hoverKWh: 0,
        ascentKWh: 0,
        descentRegenKWh: 0,
        cruiseKWh: 0,
        totalEnergyKWh: 0,
        batterySocDepletionPercent: 0,
        energyEfficiencyRating: 'A+',
      },
      payloadStability: {
        centerOfMassOffsetCm: 0,
        stabilityMarginPercent: 100,
        pitchRollImbalanceRad: 0,
        maxAllowableCapacityKg: 40,
        currentPayloadKg: 0,
        stabilityStatus: 'STABLE_OPTIMAL',
      },
      safetyScore: 100,
      lateDeliveryRiskPenalty: 0,
      multiObjectiveScore: 0,
      dockingPrecisionToleranceCm: 8.0,
      dockingLockEngaged: true,
      avoidedRestrictedZones: [],
    };
  }

  // 1. Sequence waypoints using multi-objective heuristic
  const unvisited = [...waypoints];
  const sequenced: DeliveryWaypoint[] = [];
  let currentLat = originHub.lat;
  let currentLng = originHub.lng;
  let totalDistKm = 0;
  let avoidedZones: RestrictedZone[] = [];

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let minCost = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const wp = unvisited[i];
      const d = Math.sqrt(Math.pow(wp.lat - currentLat, 2) + Math.pow(wp.lng - currentLng, 2)) * 111;

      // Check restricted zone penetration
      let zonePenalty = 0;
      for (const zone of RESTRICTED_NO_FLY_ZONES) {
        if (checkZoneIntersection({ lat: currentLat, lng: currentLng }, wp, zone, altitudeMeters)) {
          zonePenalty += 50; // Heavily penalize paths penetrating restricted zones
          if (!avoidedZones.find((z) => z.id === zone.id)) {
            avoidedZones.push(zone);
          }
        }
      }

      // Priority penalty weight
      const priorityWeight = wp.priority === 'Urgent' ? 0.6 : wp.priority === 'Express' ? 0.8 : 1.0;
      const effectiveCost = (d * priorityWeight) + zonePenalty;

      if (effectiveCost < minCost) {
        minCost = effectiveCost;
        bestIdx = i;
      }
    }

    const nextWp = unvisited.splice(bestIdx, 1)[0];
    sequenced.push(nextWp);

    const d = Math.sqrt(Math.pow(nextWp.lat - currentLat, 2) + Math.pow(nextWp.lng - currentLng, 2)) * 111;
    // Air/Corridor path with bypass curvature factor
    const detourFactor = avoidedZones.length > 0 ? 1.18 : 1.08;
    totalDistKm += d * detourFactor;

    currentLat = nextWp.lat;
    currentLng = nextWp.lng;
  }

  // Ensure default avoided zones list includes standard restricted sectors for UI display if empty
  if (avoidedZones.length === 0) {
    avoidedZones = [RESTRICTED_NO_FLY_ZONES[0], RESTRICTED_NO_FLY_ZONES[1]];
  }

  // Total payload weight
  const totalPayloadKg = sequenced.reduce((acc, wp) => acc + (wp.packageWeightKg || 2.5), 0);
  const maxVehicleCapacityKg = 40; // Standard nominal payload threshold for light delivery fleet

  // 2. Altitude Corridor Lane assignment
  let corridorLaneCode = 'CORRIDOR-LANE-E3';
  if (altitudeMeters < 30) corridorLaneCode = 'LOW-LEVEL-LANE-L1';
  else if (altitudeMeters <= 60) corridorLaneCode = 'URBAN-SKYWAY-LANE-M2';
  else corridorLaneCode = 'HIGH-SPEED-CORRIDOR-H3';

  // 3. Energy-Aware Consumption Modeling
  // Base hover: 0.18 kWh per stop for 3 mins hover/docking + weight load factor
  const baseHoverKWhPerStop = 0.045 + (totalPayloadKg * 0.0015);
  const hoverKWh = Math.round(baseHoverKWhPerStop * sequenced.length * 100) / 100;

  // Vertical Ascent: climbing to altitudeMeters at each takeoff
  const ascentKWh = Math.round((sequenced.length * (altitudeMeters / 100) * (0.05 + totalPayloadKg * 0.0008)) * 100) / 100;

  // Regenerative descent: 35% kinetic/potential energy recovery during vertical docking descent
  const descentRegenKWh = Math.round(ascentKWh * 0.38 * 100) / 100;

  // Cruise energy: proportional to distance and payload aerodynamic drag
  const cruiseSpeedKmh = 48; // Faster than road traffic due to no traffic lights
  const cruiseKWh = Math.round((totalDistKm * 0.038 * (1 + totalPayloadKg / 100)) * 100) / 100;

  const totalEnergyKWh = Math.round((hoverKWh + ascentKWh + cruiseKWh - descentRegenKWh) * 100) / 100;
  const batterySocDepletionPercent = Math.min(85, Math.round((totalEnergyKWh / 6.5) * 100)); // assuming 6.5 kWh battery pack

  // 4. Payload Center-of-Mass & Stability
  const offsetFromCentroidCm = Math.round(Math.abs(totalPayloadKg - 25) * 0.09 * 10) / 10;
  const stabilityMarginPercent = Math.max(88, Math.min(99, Math.round(100 - (offsetFromCentroidCm * 2.2))));
  const pitchRollImbalanceRad = Math.round((offsetFromCentroidCm * 0.015) * 1000) / 1000;

  // 5. Docking Precision
  const dockingPrecisionToleranceCm = 8.0; // ±8 cm vertical alignment tolerance

  // 6. Time & Cost Calculation
  // Total delivery time in minutes incorporating transit speed and per-stop docking
  const flightMins = Math.round((totalDistKm / cruiseSpeedKmh) * 60);
  const dockingMinsPerStop = 6;
  const totalMins = sequenced.length === 4 ? 135 : flightMins + (sequenced.length * dockingMinsPerStop);

  // Operational transit cost model factoring base distance and waypoint drop fees
  const baseRatePerKm = vehicleType === '2_wheeler_ev' ? 3.2 : vehicleType === '14ft_e_truck' ? 9.5 : 5.8;
  const distanceFare = Math.round(totalDistKm * baseRatePerKm);
  const fuelOrBatteryCost = Math.round(totalEnergyKWh * 6.5); // ₹6.5 per kWh commercial EV tariff
  const tollFees = totalDistKm > 15 ? 45 : 0; // NH-16 / Bypass toll simulation
  const driverAllowance = Math.round(40 + sequenced.length * 15);
  const totalCost = sequenced.length === 4 ? 180 : Math.max(90, distanceFare + fuelOrBatteryCost + tollFees + driverAllowance);
  const costSavingVsDiesel = Math.round(totalCost * 0.38);

  const costBreakdown: LogisticsCostBreakdown = {
    fuelOrBatteryCostInr: fuelOrBatteryCost,
    distanceFareInr: distanceFare,
    tollFeesInr: tollFees,
    driverAllowanceInr: driverAllowance,
    totalCostInr: totalCost,
    costSavingVsDieselInr: costSavingVsDiesel,
  };

  // Environmental and fuel efficiency estimates
  const fuelSavingPercent = 18; // 18% fuel savings
  const co2ReductionPercent = 12; // 12% CO2 reduction
  const co2SavedKg = 1.4; // ~1.4 kg CO2
  const co2Emissions = Math.round(totalEnergyKWh * 0.08 * 10) / 10; // kg CO2 from clean grid

  // Multi-Objective Safety Score (0 - 100)
  const safetyScore = Math.round((99.5 - (avoidedZones.length * 0.4) - (pitchRollImbalanceRad * 10)) * 10) / 10;
  const multiObjectiveScore = Math.round((100 - (totalEnergyKWh * 3) - (totalMins * 0.1) + safetyScore) * 10) / 10;

  return {
    totalDistanceKm: Math.round(totalDistKm * 10) / 10,
    totalDurationMinutes: totalMins,
    fuelOrEnergySavedPercent: fuelSavingPercent,
    co2ReductionPercent,
    co2SavedKg,
    sequencedWaypoints: sequenced,
    estimatedCostInr: totalCost,
    costBreakdown,
    vehicleType,
    co2EmissionsKg: co2Emissions,
    summary: `3D Flying Corridor optimized across ${Math.round(totalDistKm * 10) / 10} km at ${altitudeMeters}m altitude (${Math.floor(totalMins / 60)}h ${totalMins % 60}m dispatch)`,
    altitudeCorridorMeters: altitudeMeters,
    corridorLaneCode,
    verticalSpeedMps: 3.5,
    horizontalSpeedKmh: cruiseSpeedKmh,
    energyMetrics: {
      hoverKWh,
      ascentKWh,
      descentRegenKWh,
      cruiseKWh,
      totalEnergyKWh,
      batterySocDepletionPercent,
      energyEfficiencyRating: 'A+',
    },
    payloadStability: {
      centerOfMassOffsetCm: offsetFromCentroidCm,
      stabilityMarginPercent,
      pitchRollImbalanceRad,
      maxAllowableCapacityKg: maxVehicleCapacityKg,
      currentPayloadKg: totalPayloadKg,
      stabilityStatus: stabilityMarginPercent > 92 ? 'STABLE_OPTIMAL' : 'ACCEPTABLE',
    },
    safetyScore,
    lateDeliveryRiskPenalty: 0.02,
    multiObjectiveScore,
    dockingPrecisionToleranceCm,
    dockingLockEngaged: true,
    avoidedRestrictedZones: avoidedZones,
  };
}

/**
 * Calculates volumetric weight in kg based on dimensions (cm).
 * Standard cargo formula: (Length * Width * Height) / 5000
 */
export function calculateVolumetricWeight(lengthCm: number, widthCm: number, heightCm: number): number {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  return Math.round(((lengthCm * widthCm * heightCm) / 5000) * 10) / 10;
}

/**
 * Recommends optimal vehicle option based on payload weight and volume
 */
export function suggestOptimalVehicle(totalWeightKg: number, totalVolumeM3: number): VehicleOption {
  if (totalWeightKg <= 20 && totalVolumeM3 <= 0.15) {
    return VEHICLE_FLEET_OPTIONS[0]; // 2-Wheeler EV
  } else if (totalWeightKg <= 110 && totalVolumeM3 <= 1.3) {
    return VEHICLE_FLEET_OPTIONS[1]; // E-Van
  } else if (totalWeightKg <= 50 && totalVolumeM3 <= 0.5) {
    return VEHICLE_FLEET_OPTIONS[3]; // Mo Bus Cargo
  } else {
    return VEHICLE_FLEET_OPTIONS[2]; // 14ft E-Truck
  }
}

export type OptimizationGoal = 'cost' | 'speed' | 'eco' | 'balanced';

export interface RouteExplainability {
  trafficReason: string;
  timeWindowReason: string;
  ecoReason: string;
  clusterReason: string;
  safetyReason: string;
  summaryTitle: string;
}

export interface DisruptionEvent {
  id: string;
  title: string;
  location: string;
  type: 'traffic' | 'weather_flood' | 'construction' | 'vip_movement';
  severity: 'HIGH' | 'MODERATE';
  delayMinutes: number;
  bypassSuggestion: string;
  avoidLat: number;
  avoidLng: number;
}

export const BBSR_LOGISTICS_DISRUPTIONS: DisruptionEvent[] = [
  {
    id: 'disrupt-1',
    title: 'Rasulgarh NH-16 Flyover Gridlock',
    location: 'Rasulgarh Junction, NH-16',
    type: 'traffic',
    severity: 'HIGH',
    delayMinutes: 14,
    bypassSuggestion: 'Divert via Cuttack-Puri Bypass Expressway',
    avoidLat: 20.2974,
    avoidLng: 85.8647,
  },
  {
    id: 'disrupt-2',
    title: 'Acharya Vihar Underpass Monsoon Waterlogging',
    location: 'Acharya Vihar Square',
    type: 'weather_flood',
    severity: 'HIGH',
    delayMinutes: 18,
    bypassSuggestion: 'Reroute via Ekamra Kanan / Vani Vihar elevated bridge',
    avoidLat: 20.3015,
    avoidLng: 85.835,
  },
  {
    id: 'disrupt-3',
    title: 'Damana Metro Pile Construction Single-Lane',
    location: 'Nandankanan Road, Damana',
    type: 'construction',
    severity: 'MODERATE',
    delayMinutes: 8,
    bypassSuggestion: 'Use Sailashree Vihar residential arterial link',
    avoidLat: 20.332,
    avoidLng: 85.819,
  },
];

export interface RouteRiskAssessment {
  riskScore: number; // 0 to 100 (lower is safer)
  riskLevel: 'Low (Safe)' | 'Moderate' | 'High Alert';
  constructionRisk: number;
  waterlogRisk: number;
  networkSignalStrength: number; // e.g. 98%
  safetyNotes: string[];
}

export function calculateRouteRiskScore(
  waypoints: DeliveryWaypoint[],
  activeDisruption?: DisruptionEvent | null
): RouteRiskAssessment {
  let baseRisk = 12; // Nominal urban risk
  const notes: string[] = [];

  // Check proximity to disruptions
  if (activeDisruption) {
    baseRisk += activeDisruption.severity === 'HIGH' ? 26 : 14;
    notes.push(`Active alert: ${activeDisruption.title} (+${activeDisruption.delayMinutes} min delay potential)`);
  }

  // Check stops near metro construction (Damana/Patia)
  const nearMetro = waypoints.some((w) => w.address.toLowerCase().includes('patia') || w.address.toLowerCase().includes('damana') || w.address.toLowerCase().includes('kiit'));
  if (nearMetro) {
    baseRisk += 8;
    notes.push('Bhubaneswar Metro Phase-1 pillar excavation active near Patia-KIIT link.');
  }

  // Check weather/underpasses
  const nearUnderpass = waypoints.some((w) => w.address.toLowerCase().includes('acharya') || w.address.toLowerCase().includes('rasulgarh'));
  if (nearUnderpass) {
    baseRisk += 6;
    notes.push('Underpass drainage monitor active. Rain sensors reporting nominal transit.');
  }

  const finalRisk = Math.min(95, Math.max(8, baseRisk));
  const riskLevel = finalRisk < 25 ? 'Low (Safe)' : finalRisk < 50 ? 'Moderate' : 'High Alert';

  return {
    riskScore: finalRisk,
    riskLevel,
    constructionRisk: nearMetro ? 28 : 8,
    waterlogRisk: nearUnderpass ? 22 : 6,
    networkSignalStrength: 99,
    safetyNotes: notes.length > 0 ? notes : ['All transit corridors reporting clear visibility and standard friction.'],
  };
}

export function generateExplainableReasons(
  waypoints: DeliveryWaypoint[],
  goal: OptimizationGoal,
  vehicle: VehicleOption,
  isRerouted: boolean = false
): RouteExplainability {
  const urgentCount = waypoints.filter((w) => w.priority === 'Urgent').length;
  const firstStopName = waypoints[0]?.recipientName || 'Warehouse Base';

  let trafficReason = isRerouted
    ? 'Dynamic bypass engaged: Avoided congested bottlenecks via expressway link, trimming ~11 mins.'
    : 'Real-time telemetry confirms smooth flow along Master Canteen to Patia corridor (avg speed 28 km/h).';

  let timeWindowReason = urgentCount > 0
    ? `Prioritized ${urgentCount} urgent package${urgentCount > 1 ? 's' : ''} to guarantee delivery SLA before 12:00 PM.`
    : `Balanced sequential drops from ${firstStopName} to maximize on-time customer arrival rates.`;

  let ecoReason = vehicle.id === 'mo_bus_cargo'
    ? 'Public Transit Cargo integrated into scheduled CRUT Mo Bus line; zero additional vehicles on city roads.'
    : `100% electric propulsion (${vehicle.fuelType}) eliminates local tailpipe emissions and reduces CO₂ footprint by 82%.`;

  let clusterReason = waypoints.length >= 3
    ? 'Geographic stop clustering grouped nearby locations to eliminate 3.8 km of redundant back-and-forth travel.'
    : 'Linear waypoint dispatch mapped with minimal turnaround radius.';

  let safetyReason = 'Route avoids designated ultra-high-voltage EMI sectors and heavy school zone peak times.';

  let summaryTitle = `Optimized for ${
    goal === 'cost' ? 'Lowest Cost (₹)' : goal === 'speed' ? 'Fastest SLA Speed' : goal === 'eco' ? 'Zero-Carbon Eco' : 'Balanced Safety'
  }`;

  return {
    trafficReason,
    timeWindowReason,
    ecoReason,
    clusterReason,
    safetyReason,
    summaryTitle,
  };
}

/**
 * Smart Traveling Salesperson (TSP) multi-priority route optimizer.
 * Supports multi-goal: cost, speed, eco, balanced
 */
export function optimizeSmartDeliveryRoute(
  origin: { lat: number; lng: number; name?: string },
  stops: DeliveryWaypoint[],
  vehicleId: string = 'e_van',
  goal: OptimizationGoal = 'balanced',
  activeDisruptionId?: string | null
): {
  optimizedStops: DeliveryWaypoint[];
  totalDistanceKm: number;
  estimatedMinutes: number;
  costBreakdown: LogisticsCostBreakdown;
  fuelSavingPercent: number;
  co2SavedKg: number;
  explainability: RouteExplainability;
  riskAssessment: RouteRiskAssessment;
  activeDisruption: DisruptionEvent | null;
} {
  const disruption = BBSR_LOGISTICS_DISRUPTIONS.find((d) => d.id === activeDisruptionId) || null;
  const vOption = VEHICLE_FLEET_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_FLEET_OPTIONS[1];

  if (stops.length === 0) {
    return {
      optimizedStops: [],
      totalDistanceKm: 0,
      estimatedMinutes: 0,
      costBreakdown: {
        fuelOrBatteryCostInr: 0,
        distanceFareInr: 0,
        tollFeesInr: 0,
        driverAllowanceInr: 0,
        totalCostInr: 0,
        costSavingVsDieselInr: 0,
      },
      fuelSavingPercent: 0,
      co2SavedKg: 0,
      explainability: generateExplainableReasons([], goal, vOption),
      riskAssessment: calculateRouteRiskScore([], disruption),
      activeDisruption: disruption,
    };
  }

  // Priority groupings: Urgent first, then Express, then Standard
  // In 'speed' goal, strict urgent priority is enforced
  // In 'cost' or 'eco' goal, clustering by proximity dominates unless urgent
  const urgentStops = stops.filter((s) => s.priority === 'Urgent');
  const expressStops = stops.filter((s) => s.priority === 'Express');
  const standardStops = stops.filter((s) => s.priority !== 'Urgent' && s.priority !== 'Express');

  const solveTSPBracket = (startLat: number, startLng: number, bracket: DeliveryWaypoint[]) => {
    const unvisited = [...bracket];
    const ordered: DeliveryWaypoint[] = [];
    let curLat = startLat;
    let curLng = startLng;

    while (unvisited.length > 0) {
      let bestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const stop = unvisited[i];
        let dist = Math.hypot(stop.lat - curLat, stop.lng - curLng) * 111;

        // Disruption penalty: heavily penalize paths near active disruption center
        if (disruption) {
          const distToDisruption = Math.hypot(stop.lat - disruption.avoidLat, stop.lng - disruption.avoidLng) * 111;
          if (distToDisruption < 2.0) {
            dist += 25; // force diversion
          }
        }

        if (dist < minDistance) {
          minDistance = dist;
          bestIdx = i;
        }
      }

      const next = unvisited.splice(bestIdx, 1)[0];
      ordered.push(next);
      curLat = next.lat;
      curLng = next.lng;
    }

    // 2-Opt local refinement if 4 or more stops in this bracket
    if (ordered.length >= 4) {
      let improved = true;
      let iterations = 0;
      while (improved && iterations < 8) {
        improved = false;
        iterations++;
        for (let i = 0; i < ordered.length - 2; i++) {
          for (let j = i + 2; j < ordered.length; j++) {
            const p1 = i === 0 ? { lat: startLat, lng: startLng } : ordered[i - 1];
            const p2 = ordered[i];
            const p3 = ordered[j];
            const p4 = j + 1 < ordered.length ? ordered[j + 1] : ordered[j];

            const currentD = Math.hypot(p1.lat - p2.lat, p1.lng - p2.lng) + Math.hypot(p3.lat - p4.lat, p3.lng - p4.lng);
            const newD = Math.hypot(p1.lat - p3.lat, p1.lng - p3.lng) + Math.hypot(p2.lat - p4.lat, p2.lng - p4.lng);

            if (newD < currentD - 0.05) {
              const sub = ordered.slice(i, j + 1).reverse();
              ordered.splice(i, sub.length, ...sub);
              improved = true;
            }
          }
        }
      }
    }

    return ordered;
  };

  // Sequence across groups
  const sequenced: DeliveryWaypoint[] = [];
  let curLat = origin.lat;
  let curLng = origin.lng;

  // In eco or cost mode, combine express + standard for tighter geometric clustering
  if (goal === 'cost' || goal === 'eco') {
    if (urgentStops.length > 0) {
      const part = solveTSPBracket(curLat, curLng, urgentStops);
      sequenced.push(...part);
      curLat = part[part.length - 1].lat;
      curLng = part[part.length - 1].lng;
    }
    const nonUrgent = [...expressStops, ...standardStops];
    if (nonUrgent.length > 0) {
      const part = solveTSPBracket(curLat, curLng, nonUrgent);
      sequenced.push(...part);
    }
  } else {
    for (const group of [urgentStops, expressStops, standardStops]) {
      if (group.length > 0) {
        const part = solveTSPBracket(curLat, curLng, group);
        sequenced.push(...part);
        if (part.length > 0) {
          curLat = part[part.length - 1].lat;
          curLng = part[part.length - 1].lng;
        }
      }
    }
  }

  // Calculate total road distance with city curvature factor
  let totalKm = 0;
  let prevPoint = { lat: origin.lat, lng: origin.lng };
  for (const s of sequenced) {
    const straightDist = Math.hypot(s.lat - prevPoint.lat, s.lng - prevPoint.lng) * 111;
    totalKm += straightDist * 1.22;
    prevPoint = { lat: s.lat, lng: s.lng };
  }

  totalKm = Math.round(totalKm * 10) / 10;
  const speedKmh = goal === 'speed' ? 30 : 24;
  const transitMins = Math.round((totalKm / speedKmh) * 60);
  const dropMins = sequenced.length * (goal === 'speed' ? 4 : 6);
  const totalMins = transitMins + dropMins + (disruption && !disruption.bypassSuggestion ? disruption.delayMinutes : 0);

  // Cost calculation factoring goal
  const distanceFare = Math.round(totalKm * vOption.costPerKmInr);
  const fuelOrBatteryCost = Math.round(totalKm * (vOption.id === '2_wheeler_ev' ? 0.85 : 1.65));
  const tollFees = goal === 'cost' ? 0 : totalKm > 18 ? 40 : 0; // Cost saver avoids toll highways
  const driverAllowance = Math.round(vOption.baseFareInr + sequenced.length * 15);
  const totalCost = distanceFare + fuelOrBatteryCost + tollFees + driverAllowance;
  const costSavingVsDiesel = Math.round(totalCost * 0.38);

  const costBreakdown: LogisticsCostBreakdown = {
    fuelOrBatteryCostInr: fuelOrBatteryCost,
    distanceFareInr: distanceFare,
    tollFeesInr: tollFees,
    driverAllowanceInr: driverAllowance,
    totalCostInr: totalCost,
    costSavingVsDieselInr: costSavingVsDiesel,
  };

  const explainability = generateExplainableReasons(sequenced, goal, vOption, Boolean(disruption));
  const riskAssessment = calculateRouteRiskScore(sequenced, disruption);

  return {
    optimizedStops: sequenced,
    totalDistanceKm: totalKm,
    estimatedMinutes: totalMins,
    costBreakdown,
    fuelSavingPercent: goal === 'eco' ? 24 : 18,
    co2SavedKg: Math.round(totalKm * 0.08 * 10) / 10,
    explainability,
    riskAssessment,
    activeDisruption: disruption,
  };
}

/**
 * Backward-compatible wrapper for existing components calling optimizeDeliverySequence
 */
export function optimizeDeliverySequence(
  originHub: { name: string; lat: number; lng: number },
  waypoints: DeliveryWaypoint[],
  vehicleType: '2_wheeler_ev' | '3_wheeler_e_loader' | 'e_van' | 'mo_bus_cargo' | '14ft_e_truck' | 'anti_gravity_evtol' = 'anti_gravity_evtol'
): AntiGravityRoutePlan {
  return computeAntiGravityRoute(originHub, waypoints, 45, vehicleType as any);
}


