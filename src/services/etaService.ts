/**
 * Musafir Dynamic ETA & Transit Duration Engine
 * 
 * Accurately models real-world urban and intercity travel times by combining:
 * 1. Segment-based vehicle speeds (Walking, City Bus, Metro, Auto, Cab, Bike, Intercity Rail/Bus).
 * 2. Intermediate transit stop dwell times (passenger boarding & alighting).
 * 3. Urban traffic signal & junction delays based on density and road topology.
 * 4. Time-of-day dynamic congestion matrix (IST peak hour awareness).
 * 5. Multi-modal transfer and interchange buffers.
 * 6. Adverse weather & monsoon road condition multipliers.
 */

export type TransitMode = 
  | 'walk' 
  | 'bus' 
  | 'metro' 
  | 'train' 
  | 'auto' 
  | 'cab' 
  | 'bike' 
  | 'ferry';

export type TrafficCongestionLevel = 'low' | 'moderate' | 'heavy' | 'peak' | 'auto';
export type WeatherCondition = 'clear' | 'rain' | 'storm';

export interface ETACalculationParams {
  distanceKm: number;
  mode: TransitMode;
  stopsCount?: number;
  transfersCount?: number;
  trafficLevel?: TrafficCongestionLevel;
  weather?: WeatherCondition;
  isIntercity?: boolean;
  hasPriorityLane?: boolean; // Dedicated bus lane / Green corridor
}

export interface ETABreakdown {
  totalDurationMins: number;
  cruisingDurationMins: number;
  dwellTimeMins: number;
  signalDelayMins: number;
  dispatchOrBoardingWaitMins: number;
  transferBufferMins: number;
  averageSpeedKmH: number;
  trafficLevel: 'low' | 'moderate' | 'heavy' | 'peak';
  trafficDelayMins: number;
  formattedDuration: string;
  arrivalTimeStr: string;
}

/**
 * Returns real-time traffic condition based on current Indian Standard Time (IST).
 */
export function getCurrentISTTrafficCondition(): {
  level: 'low' | 'moderate' | 'heavy' | 'peak';
  multiplier: number;
  description: string;
} {
  // Compute current hour in Indian Standard Time (UTC + 5:30)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  const hour = istDate.getHours() + istDate.getMinutes() / 60;
  const day = istDate.getDay(); // 0 = Sunday

  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    if (hour >= 11 && hour <= 20) {
      return { level: 'moderate', multiplier: 1.12, description: 'Weekend Leisure Traffic' };
    }
    return { level: 'low', multiplier: 0.95, description: 'Light Weekend Flow' };
  }

  // Weekday Peak Hours
  if ((hour >= 8.5 && hour <= 11.5) || (hour >= 17.0 && hour <= 20.5)) {
    return { level: 'peak', multiplier: 1.35, description: 'Peak Rush Hour (Slow Moving)' };
  }
  // Normal Daytime
  if (hour >= 11.5 && hour < 17.0) {
    return { level: 'moderate', multiplier: 1.10, description: 'Moderate Daytime Flow' };
  }
  // Late Evening
  if (hour >= 20.5 && hour <= 22.5) {
    return { level: 'moderate', multiplier: 1.05, description: 'Normal Evening Traffic' };
  }
  // Night / Early Morning
  return { level: 'low', multiplier: 0.88, description: 'Clear Free-Flow Roads' };
}

/**
 * Mode-specific base cruising speeds on open/uncongested corridors (in km/h).
 */
const BASE_CRUISING_SPEEDS: Record<TransitMode, { urban: number; intercity: number }> = {
  walk: { urban: 4.6, intercity: 4.8 },
  bus: { urban: 28.0, intercity: 58.0 },
  metro: { urban: 36.0, intercity: 45.0 },
  train: { urban: 48.0, intercity: 76.0 },
  auto: { urban: 24.0, intercity: 32.0 },
  cab: { urban: 30.0, intercity: 72.0 },
  bike: { urban: 34.0, intercity: 52.0 },
  ferry: { urban: 18.0, intercity: 22.0 },
};

/**
 * Dwell time (in minutes) per intermediate stop / station.
 */
const STOP_DWELL_MINS: Record<TransitMode, number> = {
  walk: 0,
  bus: 0.65, // ~39 seconds per passenger stop
  metro: 0.55, // ~33 seconds per metro platform stop
  train: 2.50, // ~2.5 mins per railway station
  auto: 0.15,
  cab: 0.10,
  bike: 0.05,
  ferry: 2.0,
};

/**
 * Initial boarding, hail or dispatch delay (in minutes).
 */
const INITIAL_DISPATCH_WAIT_MINS: Record<TransitMode, number> = {
  walk: 0,
  bus: 2.5, // Boarding & initial bus stop wait
  metro: 2.0, // Turnstile, escalator & platform wait
  train: 12.0, // Platform arrival, security & boarding
  auto: 2.5, // Auto hail & startup
  cab: 3.5, // Driver arrival & pickup
  bike: 2.0, // Bike taxi arrival
  ferry: 5.0,
};

/**
 * Calculates dynamic travel time and Estimated Time of Arrival (ETA)
 * using segment-based speeds, stop dwell times, traffic signals, and weather.
 */
export function calculateDynamicETA(params: ETACalculationParams): ETABreakdown {
  const {
    distanceKm,
    mode,
    transfersCount = 0,
    trafficLevel = 'auto',
    weather = 'clear',
    isIntercity = false,
    hasPriorityLane = false,
  } = params;

  const validDistance = Math.max(0.2, distanceKm);

  // 1. Determine Traffic Level and Multiplier
  let trafficMult = 1.0;
  let resolvedTraffic: 'low' | 'moderate' | 'heavy' | 'peak' = 'moderate';

  if (trafficLevel === 'auto') {
    const ist = getCurrentISTTrafficCondition();
    trafficMult = ist.multiplier;
    resolvedTraffic = ist.level;
  } else {
    resolvedTraffic = trafficLevel;
    switch (trafficLevel) {
      case 'low': trafficMult = 0.90; break;
      case 'moderate': trafficMult = 1.10; break;
      case 'heavy': trafficMult = 1.25; break;
      case 'peak': trafficMult = 1.38; break;
    }
  }

  // Exempt rail/metro/walking from road congestion
  if (mode === 'metro' || mode === 'train' || mode === 'walk' || mode === 'ferry') {
    trafficMult = 1.0;
  } else if (hasPriorityLane) {
    // Dedicated bus rapid transit corridor / Green corridor
    trafficMult = Math.min(1.02, trafficMult * 0.75);
  } else if (mode === 'bike') {
    // Two-wheelers filter through congestion much faster
    trafficMult = 1 + (trafficMult - 1) * 0.45;
  } else if (mode === 'auto') {
    // Auto-rickshaws have high agility in Indian city traffic
    trafficMult = 1 + (trafficMult - 1) * 0.65;
  }

  // 2. Weather Impact on Road Travel Times
  let weatherMult = 1.0;
  if (weather === 'rain' && mode !== 'metro' && mode !== 'train') {
    weatherMult = 1.18; // Rain slows down road traffic by ~18%
  } else if (weather === 'storm') {
    weatherMult = 1.30;
  }

  // 3. Base Cruising Speed & Cruising Time
  const speedProfile = BASE_CRUISING_SPEEDS[mode] || BASE_CRUISING_SPEEDS.bus;
  const effectiveBaseSpeed = isIntercity ? speedProfile.intercity : speedProfile.urban;
  const effectiveSpeedWithTraffic = effectiveBaseSpeed / (trafficMult * weatherMult);

  const cruisingDurationMins = (validDistance / effectiveSpeedWithTraffic) * 60;

  // 4. Transit Stop Dwell Times
  let effectiveStops = params.stopsCount;
  if (effectiveStops === undefined) {
    // Infer stop count based on mode and distance
    if (mode === 'bus') {
      effectiveStops = Math.max(1, Math.round(validDistance * 1.35)); // ~1 stop per 750m
    } else if (mode === 'metro') {
      effectiveStops = Math.max(1, Math.round(validDistance * 0.85)); // ~1 station per 1.2km
    } else if (mode === 'train') {
      effectiveStops = Math.max(0, Math.round(validDistance / 25)); // ~1 stop per 25km
    } else {
      effectiveStops = 0;
    }
  }
  const dwellTimeMins = effectiveStops * (STOP_DWELL_MINS[mode] || 0);

  // 5. Urban Traffic Signal & Intersection Delays
  // Urban Indian corridors have roughly 1 major signal every 1.4 km
  let signalDelayMins = 0;
  if (!isIntercity && (mode === 'bus' || mode === 'auto' || mode === 'cab' || mode === 'bike')) {
    const estimatedSignals = Math.max(0, Math.floor(validDistance / 1.4));
    const delayPerSignal = resolvedTraffic === 'peak' ? 1.0 : resolvedTraffic === 'heavy' ? 0.85 : 0.65;
    signalDelayMins = estimatedSignals * delayPerSignal;
    if (mode === 'bike') signalDelayMins *= 0.5; // Bikes bypass signal queues
  }

  // 6. Initial Boarding, Dispatch & Modal Transfers
  const dispatchOrBoardingWaitMins = INITIAL_DISPATCH_WAIT_MINS[mode] || 1.5;
  const transferBufferMins = transfersCount * 4.5;

  // 7. Total Dynamic Duration Calculation
  const unroundedTotal = 
    cruisingDurationMins + 
    dwellTimeMins + 
    signalDelayMins + 
    dispatchOrBoardingWaitMins + 
    transferBufferMins;

  const totalDurationMins = Math.max(
    mode === 'walk' ? 3 : 5, 
    Math.round(unroundedTotal)
  );

  const trafficDelayMins = Math.max(0, Math.round(cruisingDurationMins * (trafficMult - 1) + signalDelayMins * 0.5));
  const averageSpeedKmH = Math.round((validDistance / (totalDurationMins / 60)) * 10) / 10;

  const arrivalTimeStr = getEstimatedArrivalTime(totalDurationMins);
  const formattedDuration = formatDurationHuman(totalDurationMins);

  return {
    totalDurationMins,
    cruisingDurationMins: Math.round(cruisingDurationMins * 10) / 10,
    dwellTimeMins: Math.round(dwellTimeMins * 10) / 10,
    signalDelayMins: Math.round(signalDelayMins * 10) / 10,
    dispatchOrBoardingWaitMins,
    transferBufferMins,
    averageSpeedKmH,
    trafficLevel: resolvedTraffic,
    trafficDelayMins,
    formattedDuration,
    arrivalTimeStr,
  };
}

/**
 * Generates an arrival timestamp string e.g. "10:45 AM"
 */
export function getEstimatedArrivalTime(durationMins: number, baseDate = new Date()): string {
  const arrival = new Date(baseDate.getTime() + durationMins * 60000);
  let hours = arrival.getHours();
  const minutes = arrival.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
}

/**
 * Formats duration into human-readable format e.g. "24 mins" or "1 hr 15 mins"
 */
export function formatDurationHuman(durationMins: number): string {
  const mins = Math.round(durationMins);
  if (mins < 60) {
    return `${mins} min${mins > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
}
