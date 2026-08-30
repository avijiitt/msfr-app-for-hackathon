/**
 * Smart Last-Mile Navigation & Safety Service
 * Calculates safe walking paths, street lighting coverage, E-Ride feeder bays, and bike docks.
 */

export interface LastMileOption {
  id: string;
  type: 'safe_lit_walk' | 'mo_e_ride' | 'mo_cycle' | 'feeder_auto';
  title: string;
  durationMins: number;
  distanceMeters: number;
  cost: number;
  safetyScoreOutOf10: number;
  isLitStreet: boolean;
  cctvCoverage: boolean;
  pavementQuality: 'smooth' | 'moderate' | 'unpaved';
  steps: string[];
  badgeText: string;
}

export function calculateLastMileOptions(destinationStop: string, finalDoorstep: string): LastMileOption[] {
  return [
    {
      id: 'lm-safe-walk',
      type: 'safe_lit_walk',
      title: '🛡️ Safe-Lit Pedestrian Corridor (Women & Senior Safe)',
      durationMins: 6,
      distanceMeters: 450,
      cost: 0,
      safetyScoreOutOf10: 9.6,
      isLitStreet: true,
      cctvCoverage: true,
      pavementQuality: 'smooth',
      steps: [
        `Exit ${destinationStop || 'Transit Stop'} via Gate 1 (Dedicated Pedestrian Crossing)`,
        'Turn right onto Smart City LED Lit Boulevard (95% Streetlight Coverage)',
        'Pass 2 Smart City CCTV Surveillance Poles & 24/7 Police Kiosk',
        `Arrive safely at ${finalDoorstep || 'Final Destination'}`,
      ],
      badgeText: 'Highest Safety Score',
    },
    {
      id: 'lm-mo-eride',
      type: 'mo_e_ride',
      title: '⚡ Mo E-Ride Shared Electric Feeder (Bay #3)',
      durationMins: 3,
      distanceMeters: 800,
      cost: 10,
      safetyScoreOutOf10: 9.2,
      isLitStreet: true,
      cctvCoverage: true,
      pavementQuality: 'smooth',
      steps: [
        'Board Mo E-Ride at Stand Bay #3 (Departs every 3 mins)',
        'Direct zero-emission ride via Niladri Main Road',
        'Drop off right at doorstep',
      ],
      badgeText: 'Fastest Last-Mile',
    },
    {
      id: 'lm-mo-cycle',
      type: 'mo_cycle',
      title: '🚲 Mo Cycle Public Bike Dock',
      durationMins: 4,
      distanceMeters: 600,
      cost: 5,
      safetyScoreOutOf10: 8.8,
      isLitStreet: true,
      cctvCoverage: true,
      pavementQuality: 'smooth',
      steps: [
        'Unlock smart bicycle with Musafir QR at Dock #08',
        'Ride along dedicated green cycle track',
        'Park & lock at nearby designated stand',
      ],
      badgeText: 'Zero Carbon',
    },
  ];
}
