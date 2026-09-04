import { Station, TransitRoute, Vehicle } from '../../types/transit';

export const BHUBANESWAR_CENTER: [number, number] = [20.2961, 85.8245]; // Master Canteen / Central Area

export const BHUBANESWAR_STATIONS: Station[] = [
  {
    id: 'bbs-master-canteen',
    name: 'Master Canteen Bus Terminal & Railway Hub',
    localNames: { or: 'ମାଷ୍ଟର କ୍ୟାଣ୍ଟିନ ବସ୍ ଟର୍ମିନାଲ୍', hi: 'मास्टर कैंटीन बस टर्मिनल' },
    mode: 'bus',
    lat: 20.2668,
    lng: 85.8436,
    lines: ['MOBUS-10', 'MOBUS-11', 'PINK-EV', 'MOBUS-NIGHT'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Ama Bus 10 (AC Electric Trunk)', destination: 'Patia / KIIT / InfoCity', mode: 'bus', etaMinutes: 3, delayMinutes: 0, platform: 'Bay 1', occupancy: 'moderate' },
      { routeId: 'MOBUS-11', lineName: 'Ama Bus 11 (Affordable Non-AC)', destination: 'Cuttack Badambadi', mode: 'bus', etaMinutes: 6, delayMinutes: 1, platform: 'Bay 2', occupancy: 'low' },
      { routeId: 'PINK-EV', lineName: 'Women Pink Ama Bus', destination: 'Patia IT Corridor', mode: 'bus', etaMinutes: 8, delayMinutes: 0, platform: 'Bay W (Pink)', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-vani-vihar',
    name: 'Vani Vihar Transit Shelter',
    localNames: { or: 'ବାଣୀବିହାର ଛକ (Utkal Univ)', hi: 'वाणी विहार चौराहा' },
    mode: 'bus',
    lat: 20.3015,
    lng: 85.8365,
    lines: ['MOBUS-10', 'MOBUS-11', 'MOBUS-24'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Mo Bus 10 (AC Electric)', destination: 'Patia / KIIT', mode: 'bus', etaMinutes: 4, delayMinutes: 0, platform: 'Shelter A', occupancy: 'moderate' },
      { routeId: 'MOBUS-11', lineName: 'Mo Bus 11 (Ordinary Bus)', destination: 'Master Canteen', mode: 'bus', etaMinutes: 5, delayMinutes: 2, platform: 'Shelter B', occupancy: 'full' },
    ],
  },
  {
    id: 'bbs-jaydev-vihar',
    name: 'Jaydev Vihar Transit Hub',
    localNames: { or: 'ଜୟଦେବ ବିହାର ହବ୍', hi: 'जयदेव विहार हब' },
    mode: 'bus',
    lat: 20.3039,
    lng: 85.8188,
    lines: ['MOBUS-10', 'MOBUS-24', 'PINK-EV', 'MOBUS-NIGHT'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Mo Bus 10', destination: 'InfoCity Tech Park', mode: 'bus', etaMinutes: 2, delayMinutes: 0, platform: 'Bay 1', occupancy: 'moderate' },
      { routeId: 'MOBUS-NIGHT', lineName: 'Night Safe Owl Express', destination: 'Airport Terminal', mode: 'bus', etaMinutes: 12, delayMinutes: 0, platform: 'Bay N', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-patia-kiit',
    name: 'Patia / KIIT University Bus Terminal',
    localNames: { or: 'ପଟିଆ / କିଟ୍ ବିଶ୍ୱବିଦ୍ୟାଳୟ', hi: 'पटिया / केआईआईटी टर्मिनल' },
    mode: 'bus',
    lat: 20.3541,
    lng: 85.8175,
    lines: ['MOBUS-10', 'PINK-EV', 'MOBUS-NIGHT'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Mo Bus 10 (AC Electric)', destination: 'Master Canteen', mode: 'bus', etaMinutes: 3, delayMinutes: 0, platform: 'Bay 1', occupancy: 'low' },
      { routeId: 'PINK-EV', lineName: 'Women Pink Mo Bus', destination: 'Master Canteen', mode: 'bus', etaMinutes: 7, delayMinutes: 0, platform: 'Bay Pink', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-infocity',
    name: 'InfoCity Tech Park Gate 1',
    localNames: { or: 'ଇନଫୋସିଟି ଟେକ୍ ପାର୍କ', hi: 'इन्फोसिटी टेक पार्क' },
    mode: 'bus',
    lat: 20.3602,
    lng: 85.8035,
    lines: ['MOBUS-10', 'PINK-EV'],
    isElevatorAccessible: false,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: false,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Mo Bus 10', destination: 'Master Canteen / Central', mode: 'bus', etaMinutes: 6, delayMinutes: 1, platform: 'Main Gate Bay', occupancy: 'moderate' },
    ],
  },
  {
    id: 'bbs-aiims',
    name: 'AIIMS Hospital & Trauma Bus Bay',
    localNames: { or: 'ଏମ୍ସ ହସ୍ପିଟାଲ୍ (AIIMS)', hi: 'एम्स अस्पताल' },
    mode: 'bus',
    lat: 20.2312,
    lng: 85.7761,
    lines: ['MOBUS-10', 'MOBUS-24'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-24', lineName: 'Hospital Express Feeder', destination: 'Master Canteen', mode: 'bus', etaMinutes: 4, delayMinutes: 0, platform: 'Med Bay 1', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-airport',
    name: 'Biju Patnaik International Airport (BBI)',
    localNames: { or: 'ବିଜୁ ପଟ୍ଟନାୟକ ବିମାନବନ୍ଦର', hi: 'बीजू पटनायक हवाई अड्डा' },
    mode: 'bus',
    lat: 20.2524,
    lng: 85.8178,
    lines: ['MOBUS-10', 'MOBUS-NIGHT'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-NIGHT', lineName: 'Night Safe Owl Express', destination: 'Patia / KIIT', mode: 'bus', etaMinutes: 8, delayMinutes: 0, platform: 'Arrival Bay', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-baramunda',
    name: 'Baramunda ISBT (Babasaheb Ambedkar Bus Terminal)',
    localNames: { or: 'ବରମୁଣ୍ଡା ଆନ୍ତଃରାଜ୍ୟ ବସ୍ ଟର୍ମିନାଲ୍ (ISBT)', hi: 'बरमुंडा बस टर्मिनल' },
    mode: 'bus',
    lat: 20.2798,
    lng: 85.7958,
    lines: ['MOBUS-10', 'MOBUS-17', 'MOBUS-20', 'MOBUS-30', 'MOBUS-41'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-10', lineName: 'Mo Bus 10 (AC Electric)', destination: 'Nandankanan / KIIT', mode: 'bus', etaMinutes: 2, delayMinutes: 0, platform: 'Bay 1', occupancy: 'low' },
      { routeId: 'MOBUS-20', lineName: 'Mo Bus 20 (Non-AC)', destination: 'Khordha New Bus Stand', mode: 'bus', etaMinutes: 5, delayMinutes: 1, platform: 'Bay 4', occupancy: 'moderate' },
    ],
  },
  {
    id: 'bbs-rasulgarh',
    name: 'Rasulgarh Square Transit Junction',
    localNames: { or: 'ରସୁଲଗଡ଼ ଛକ', hi: 'रसूलगढ़ चौराहा' },
    mode: 'bus',
    lat: 20.2977,
    lng: 85.8643,
    lines: ['MOBUS-11', 'MOBUS-17', 'MOBUS-25'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-11', lineName: 'Mo Bus 11 (Cuttack Trunk)', destination: 'Cuttack Badambadi', mode: 'bus', etaMinutes: 4, delayMinutes: 0, platform: 'NH16 Bay', occupancy: 'moderate' },
    ],
  },
  {
    id: 'bbs-khandagiri',
    name: 'Khandagiri Square & Caves Heritage Stop',
    localNames: { or: 'ଖଣ୍ଡଗିରି ଛକ', hi: 'खंडगिरि चौराहा' },
    mode: 'bus',
    lat: 20.2588,
    lng: 85.7865,
    lines: ['MOBUS-20', 'MOBUS-23', 'MOBUS-27'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-20', lineName: 'Mo Bus 20', destination: 'Master Canteen', mode: 'bus', etaMinutes: 3, delayMinutes: 0, platform: 'Bay 1', occupancy: 'low' },
    ],
  },
  {
    id: 'bbs-cuttack-badambadi',
    name: 'Cuttack Netaji Bus Terminal (CNBT Badambadi)',
    localNames: { or: 'କଟକ ନେତାଜୀ ବସ୍ ଟର୍ମିନାଲ୍ (ବାଦାମବାଡ଼ି)', hi: 'कटक बादामबाड़ी बस टर्मिनल' },
    mode: 'bus',
    lat: 20.4578,
    lng: 85.8732,
    lines: ['MOBUS-11', 'MOBUS-17', 'MOBUS-18'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-11', lineName: 'Mo Bus 11 (Non-AC Ordinary)', destination: 'Master Canteen Bhubaneswar', mode: 'bus', etaMinutes: 3, delayMinutes: 0, platform: 'Bay 1', occupancy: 'moderate' },
    ],
  },
  {
    id: 'bbs-puri-terminal',
    name: 'Puri Jagannath Bus Stand (Talabania)',
    localNames: { or: 'ପୁରୀ ଜଗନ୍ନାଥ ବସ୍ ଷ୍ଟାଣ୍ଡ (ତାଳବଣିଆ)', hi: 'पुरी जगन्नाथ बस स्टैंड' },
    mode: 'bus',
    lat: 19.8242,
    lng: 85.8456,
    lines: ['MOBUS-13', 'MOBUS-50'],
    isElevatorAccessible: true,
    hasCCTV: true,
    isWellLit: true,
    hasRestroom: true,
    hasPharmacyNearby: true,
    hasPolicePostNearby: true,
    hasParcelLocker: true,
    isCoveredWalkway: true,
    departures: [
      { routeId: 'MOBUS-50', lineName: 'Mo Bus 50 (Puri Express)', destination: 'Bhubaneswar Railway Station', mode: 'bus', etaMinutes: 5, delayMinutes: 0, platform: 'Bay P1', occupancy: 'low' },
    ],
  },
];

export const BHUBANESWAR_ROUTES: TransitRoute[] = [
  {
    id: 'MOBUS-10',
    name: 'Mo Bus Route 10 (Baramunda ISBT ➔ Nandankanan / KIIT)',
    lineCode: 'MB-10',
    mode: 'bus',
    color: '#06B6D4',
    path: [
      [20.2798, 85.7958], // Baramunda ISBT
      [20.2668, 85.8436], // Master Canteen
      [20.3015, 85.8365], // Vani Vihar
      [20.3039, 85.8188], // Jaydev Vihar
      [20.3541, 85.8175], // Patia / KIIT
      [20.3602, 85.8035], // InfoCity
    ],
    stationIds: ['bbs-baramunda', 'bbs-master-canteen', 'bbs-vani-vihar', 'bbs-jaydev-vihar', 'bbs-patia-kiit', 'bbs-infocity'],
    frequencyMins: 5,
    baseFare: 15,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: true,
    operationalStatus: 'operational',
  },
  {
    id: 'MOBUS-11',
    name: 'Mo Bus Route 11 (Master Canteen ➔ Cuttack CNBT Badambadi)',
    lineCode: 'MB-11',
    mode: 'bus',
    color: '#10B981',
    path: [
      [20.2668, 85.8436], // Master Canteen
      [20.2977, 85.8643], // Rasulgarh
      [20.3015, 85.8365], // Vani Vihar
      [20.4578, 85.8732], // Cuttack CNBT Badambadi
    ],
    stationIds: ['bbs-master-canteen', 'bbs-rasulgarh', 'bbs-vani-vihar', 'bbs-cuttack-badambadi'],
    frequencyMins: 8,
    baseFare: 10,
    isNightSafe: true,
    isWeatherCovered: false,
    isEcoElectric: false,
    operationalStatus: 'operational',
  },
  {
    id: 'MOBUS-20',
    name: 'Mo Bus Route 20 (Master Canteen ➔ Khandagiri ➔ Khordha)',
    lineCode: 'MB-20',
    mode: 'bus',
    color: '#3B82F6',
    path: [
      [20.2668, 85.8436], // Master Canteen
      [20.2798, 85.7958], // Baramunda ISBT
      [20.2588, 85.7865], // Khandagiri
    ],
    stationIds: ['bbs-master-canteen', 'bbs-baramunda', 'bbs-khandagiri'],
    frequencyMins: 10,
    baseFare: 10,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: false,
    operationalStatus: 'operational',
  },
  {
    id: 'MOBUS-24',
    name: 'Mo Bus Route 24 (Kalinga Hospital ➔ Jayadev Vihar ➔ Master Canteen)',
    lineCode: 'MB-24',
    mode: 'bus',
    color: '#F59E0B',
    path: [
      [20.3039, 85.8188], // Jaydev Vihar
      [20.3015, 85.8365], // Vani Vihar
      [20.2668, 85.8436], // Master Canteen
      [20.2312, 85.7761], // AIIMS
    ],
    stationIds: ['bbs-jaydev-vihar', 'bbs-vani-vihar', 'bbs-master-canteen', 'bbs-aiims'],
    frequencyMins: 8,
    baseFare: 10,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: false,
    operationalStatus: 'operational',
  },
  {
    id: 'MOBUS-50',
    name: 'Mo Bus Route 50 (Bhubaneswar Station ➔ Puri Jagannath Temple Express)',
    lineCode: 'MB-50',
    mode: 'bus',
    color: '#E11D48',
    path: [
      [20.2668, 85.8436], // Master Canteen
      [20.2524, 85.8178], // Airport
      [19.8242, 85.8456], // Puri Jagannath Temple
    ],
    stationIds: ['bbs-master-canteen', 'bbs-airport', 'bbs-puri-terminal'],
    frequencyMins: 15,
    baseFare: 35,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: true,
    operationalStatus: 'operational',
  },
  {
    id: 'PINK-EV',
    name: 'Women Pink Mo Bus (Safe AC Electric Express)',
    lineCode: 'PINK-1',
    mode: 'bus',
    color: '#EC4899',
    path: [
      [20.2668, 85.8436], // Master Canteen
      [20.3039, 85.8188], // Jaydev Vihar
      [20.3541, 85.8175], // Patia
      [20.3602, 85.8035], // InfoCity
    ],
    stationIds: ['bbs-master-canteen', 'bbs-jaydev-vihar', 'bbs-patia-kiit', 'bbs-infocity'],
    frequencyMins: 10,
    baseFare: 10,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: true,
    operationalStatus: 'operational',
  },
  {
    id: 'MOBUS-NIGHT',
    name: 'Night Owl 24x7 Mo Bus Corridor Shuttle',
    lineCode: 'NIGHT-X',
    mode: 'bus',
    color: '#8B5CF6',
    path: [
      [20.2524, 85.8178], // Airport
      [20.2668, 85.8436], // Master Canteen
      [20.3039, 85.8188], // Jaydev Vihar
      [20.3541, 85.8175], // Patia
    ],
    stationIds: ['bbs-airport', 'bbs-master-canteen', 'bbs-jaydev-vihar', 'bbs-patia-kiit'],
    frequencyMins: 15,
    baseFare: 20,
    isNightSafe: true,
    isWeatherCovered: true,
    isEcoElectric: true,
    operationalStatus: 'operational',
  },
];

export const INITIAL_BHUBANESWAR_VEHICLES: Vehicle[] = [
  {
    id: 'V-BUS-10-A',
    name: 'Mo Bus Electric #402',
    mode: 'bus',
    routeId: 'MOBUS-10',
    lineName: 'Mo Bus Route 10 (AC Electric)',
    color: '#06B6D4',
    lat: 20.2850,
    lng: 85.8410,
    speedKmH: 42,
    heading: 25,
    nextStopId: 'bbs-vani-vihar',
    nextStopName: 'Vani Vihar Shelter',
    etaSeconds: 120,
    delaySeconds: 0,
    occupancy: 'moderate',
    isWomenOnlyCoachAvailable: true,
    isLowFloorAccessible: true,
    isAc: true,
    evVehicle: true,
  },
  {
    id: 'V-BUS-11-B',
    name: 'Mo Bus Standard #214',
    mode: 'bus',
    routeId: 'MOBUS-11',
    lineName: 'Mo Bus Route 11',
    color: '#10B981',
    lat: 20.2668,
    lng: 85.8436,
    speedKmH: 34,
    heading: 15,
    nextStopId: 'bbs-vani-vihar',
    nextStopName: 'Vani Vihar Shelter',
    etaSeconds: 240,
    delaySeconds: 60,
    occupancy: 'low',
    isWomenOnlyCoachAvailable: false,
    isLowFloorAccessible: false,
    isAc: false,
    evVehicle: false,
  },
  {
    id: 'V-PINK-01',
    name: 'Women Pink Mo Bus #108',
    mode: 'bus',
    routeId: 'PINK-EV',
    lineName: 'Women Pink Safe Mo Bus',
    color: '#EC4899',
    lat: 20.3200,
    lng: 85.8180,
    speedKmH: 38,
    heading: 10,
    nextStopId: 'bbs-patia-kiit',
    nextStopName: 'Patia / KIIT Terminal',
    etaSeconds: 180,
    delaySeconds: 0,
    occupancy: 'low',
    isWomenOnlyCoachAvailable: true,
    isLowFloorAccessible: true,
    isAc: true,
    evVehicle: true,
  },
  {
    id: 'V-NIGHT-01',
    name: 'Night Owl Express #99',
    mode: 'bus',
    routeId: 'MOBUS-NIGHT',
    lineName: 'Night Safe Owl Shuttle',
    color: '#8B5CF6',
    lat: 20.2524,
    lng: 85.8178,
    speedKmH: 45,
    heading: 45,
    nextStopId: 'bbs-master-canteen',
    nextStopName: 'Master Canteen',
    etaSeconds: 300,
    delaySeconds: 0,
    occupancy: 'low',
    isWomenOnlyCoachAvailable: true,
    isLowFloorAccessible: true,
    isAc: true,
    evVehicle: true,
  },
];

export interface BhubaneswarLocality {
  id: string;
  name: string;
  category: 'transit_hub' | 'neighborhood' | 'tech_park' | 'education' | 'hospital' | 'shopping' | 'heritage';
  lat: number;
  lng: number;
  popularLandmark?: string;
  hubStationId?: string;
}

export const BHUBANESWAR_LOCALITIES: BhubaneswarLocality[] = [
  { id: 'mani-tribhuban', name: 'Mani Tribhuban / Mani Tribhuvan (Raghunathpur)', category: 'neighborhood', lat: 20.3688, lng: 85.8242, popularLandmark: 'Nandankanan Road, Raghunathpur, Patia, Bhubaneswar (751024)', hubStationId: 'bbs-patia-kiit' },
  { id: 'patia', name: 'Patia / Big Bazaar Square', category: 'neighborhood', lat: 20.3541, lng: 85.8175, popularLandmark: 'Near KIIT Road & Big Bazaar', hubStationId: 'bbs-patia-kiit' },
  { id: 'kiit-univ', name: 'KIIT University (Campus 1 to 20)', category: 'education', lat: 20.3533, lng: 85.8164, popularLandmark: 'KIIT International School & KIMS Hospital', hubStationId: 'bbs-patia-kiit' },
  { id: 'infocity', name: 'InfoCity Tech Park / DLF Cybercity', category: 'tech_park', lat: 20.3602, lng: 85.8035, popularLandmark: 'TCS, Infosys, Mindtree, DLF', hubStationId: 'bbs-infocity' },
  { id: 'jayadev-vihar', name: 'Jayadev Vihar / Pal Heights', category: 'transit_hub', lat: 20.3039, lng: 85.8188, popularLandmark: 'Pal Heights Mall & Mayfair Hotel', hubStationId: 'bbs-jaydev-vihar' },
  { id: 'master-canteen', name: 'Master Canteen / Railway Station', category: 'transit_hub', lat: 20.2668, lng: 85.8436, popularLandmark: 'Bhubaneswar Central Railway Station', hubStationId: 'bbs-master-canteen' },
  { id: 'saheed-nagar', name: 'Saheed Nagar / BMC Bhawani Mall', category: 'shopping', lat: 20.2895, lng: 85.8445, popularLandmark: 'BMC Bhawani Mall & Angan Restaurant' },
  { id: 'rasulgarh', name: 'Rasulgarh Square / Esplanade One', category: 'shopping', lat: 20.2977, lng: 85.8643, popularLandmark: 'Esplanade One Mall (Nexus Malls)', hubStationId: 'bbs-rasulgarh' },
  { id: 'khandagiri', name: 'Khandagiri & Udayagiri Caves', category: 'heritage', lat: 20.2588, lng: 85.7865, popularLandmark: 'Ancient Caves & NH16 Overbridge', hubStationId: 'bbs-khandagiri' },
  { id: 'baramunda-isbt', name: 'Baramunda ISBT Bus Terminal', category: 'transit_hub', lat: 20.2798, lng: 85.7958, popularLandmark: 'Dr. B.R. Ambedkar Inter-State Bus Terminal', hubStationId: 'bbs-baramunda' },
  { id: 'nayapalli', name: 'Nayapalli / IRC Village / ISKCON', category: 'neighborhood', lat: 20.2982, lng: 85.8105, popularLandmark: 'ISKCON Krishna Temple & Crown Hotel' },
  { id: 'damana', name: 'Damana Square / Chandrasekharpur', category: 'transit_hub', lat: 20.3340, lng: 85.8205, popularLandmark: 'Damana Chhak & Housing Board Colony' },
  { id: 'kalinga-hosp', name: 'Kalinga Hospital Square', category: 'hospital', lat: 20.3225, lng: 85.8218, popularLandmark: 'Kalinga Hospital & Nalco Square' },
  { id: 'aiims-bbsr', name: 'AIIMS Hospital Bhubaneswar (Sijua)', category: 'hospital', lat: 20.2312, lng: 85.7761, popularLandmark: 'AIIMS Trauma Center & College', hubStationId: 'bbs-aiims' },
  { id: 'airport-bbi', name: 'Biju Patnaik Airport (Terminal 1/2)', category: 'transit_hub', lat: 20.2524, lng: 85.8178, popularLandmark: 'Domestic & International Airport Gate', hubStationId: 'bbs-airport' },
  { id: 'vani-vihar', name: 'Vani Vihar / Utkal University', category: 'education', lat: 20.3015, lng: 85.8365, popularLandmark: 'Utkal University Main Entrance', hubStationId: 'bbs-vani-vihar' },
  { id: 'acharya-vihar', name: 'Acharya Vihar / Regional Science Center', category: 'transit_hub', lat: 20.3055, lng: 85.8285, popularLandmark: 'Science Park & RPRC Botanical Garden' },
  { id: 'old-town', name: 'Old Town / Lingaraj Temple', category: 'heritage', lat: 20.2385, lng: 85.8335, popularLandmark: '11th-Century Lingaraj Temple & Bindusagar' },
  { id: 'sailashree-vihar', name: 'Sailashree Vihar / DAV School', category: 'neighborhood', lat: 20.3420, lng: 85.8110, popularLandmark: 'DAV Public School CSPUR & Jagannath Temple' },
  { id: 'niladri-vihar', name: 'Niladri Vihar / Utkal Hospital', category: 'hospital', lat: 20.3370, lng: 85.8055, popularLandmark: 'Utkal Multi-speciality Hospital' },
  { id: 'iter-soa', name: 'ITER / SOA University (Jagamara)', category: 'education', lat: 20.2515, lng: 85.7985, popularLandmark: 'ITER Engineering College & SUM Ultimate' },
  { id: 'outr-cet', name: 'OUTR (Formerly CET) / Ghatikia', category: 'education', lat: 20.2745, lng: 85.7765, popularLandmark: 'Odisha University of Technology & Research' },
  { id: 'sum-hosp', name: 'SUM Hospital / Kalinga Nagar', category: 'hospital', lat: 20.2760, lng: 85.7580, popularLandmark: 'IMS & SUM Hospital & Medical Campus' },
  { id: 'pokhariput', name: 'Pokhariput / Aerodrome / DAV School', category: 'neighborhood', lat: 20.2440, lng: 85.8040, popularLandmark: 'Ananda Bazar & DAV Pokhariput' },
  { id: 'mancheswar', name: 'Mancheswar Industrial Area / VSS Nagar', category: 'neighborhood', lat: 20.3165, lng: 85.8560, popularLandmark: 'Railway Carriage Workshop & VSS Nagar' },
  { id: 'palasuni', name: 'Palasuni / Hi-Tech Square', category: 'transit_hub', lat: 20.3115, lng: 85.8620, popularLandmark: 'NH16 Flyover & Hi-Tech Medical Link' },
  { id: 'fire-station', name: 'Fire Station Square / Baramunda', category: 'transit_hub', lat: 20.2770, lng: 85.8060, popularLandmark: 'Odisha State Fire Academy' },
  { id: 'unit1-market', name: 'Unit-1 Daily Market / Rajmahal', category: 'shopping', lat: 20.2640, lng: 85.8340, popularLandmark: 'Market Building & Rajmahal Square' },
  { id: 'unit4-mla', name: 'Unit-4 / MLA Colony / Madhusudan Marg', category: 'neighborhood', lat: 20.2720, lng: 85.8280, popularLandmark: 'Odisha State Assembly & Secretariat' },
  { id: 'kalpana-sq', name: 'Kalpana Square / State Museum', category: 'heritage', lat: 20.2570, lng: 85.8420, popularLandmark: 'Odisha State Museum & BJB Nagar' },
  { id: 'tamando', name: 'Tamando / Info Valley / IIIT', category: 'tech_park', lat: 20.2195, lng: 85.7480, popularLandmark: 'Info Valley 2 & IIIT Tech Park' },
  { id: 'cuttack-badambadi', name: 'Cuttack Netaji Bus Terminal (Badambadi)', category: 'transit_hub', lat: 20.4578, lng: 85.8732, popularLandmark: 'CNBT Central Badambadi Terminal', hubStationId: 'bbs-cuttack-badambadi' },
];

/**
 * Computes all nearby stations, landmarks, and transit junctions located
 * along or near the route corridor between Origin and Destination.
 */
export function getNearbyLocationsAlongCorridor(
  originQuery: string,
  destQuery: string,
  originCoords?: { lat: number; lng: number },
  destCoords?: { lat: number; lng: number }
): BhubaneswarLocality[] {
  const normOrigin = originQuery.toLowerCase();
  const normDest = destQuery.toLowerCase();

  // If no queries provided, return major transit junctions
  if (!normOrigin && !normDest) {
    return BHUBANESWAR_LOCALITIES.slice(0, 8);
  }

  // 1. If we have coordinates, calculate distance from line segment
  if (originCoords && destCoords && originCoords.lat && destCoords.lat) {
    const minLat = Math.min(originCoords.lat, destCoords.lat) - 0.02;
    const maxLat = Math.max(originCoords.lat, destCoords.lat) + 0.02;
    const minLng = Math.min(originCoords.lng, destCoords.lng) - 0.02;
    const maxLng = Math.max(originCoords.lng, destCoords.lng) + 0.02;

    const inBoundingBox = BHUBANESWAR_LOCALITIES.filter(
      (loc) => loc.lat >= minLat && loc.lat <= maxLat && loc.lng >= minLng && loc.lng <= maxLng
    );

    if (inBoundingBox.length >= 3) {
      return inBoundingBox;
    }
  }

  // 2. Corridors based on keywords
  const isPatiaNorth = normOrigin.includes('patia') || normOrigin.includes('kiit') || normOrigin.includes('infocity') || normDest.includes('patia') || normDest.includes('kiit') || normDest.includes('infocity');
  const isCentral = normOrigin.includes('master') || normOrigin.includes('railway') || normOrigin.includes('canteen') || normDest.includes('master') || normDest.includes('railway') || normDest.includes('canteen');
  const isCuttack = normOrigin.includes('cuttack') || normDest.includes('cuttack') || normOrigin.includes('badambadi') || normDest.includes('badambadi');
  const isKhandagiriWest = normOrigin.includes('khandagiri') || normOrigin.includes('baramunda') || normOrigin.includes('aiims') || normDest.includes('khandagiri') || normDest.includes('baramunda') || normDest.includes('aiims');

  if (isPatiaNorth && isCentral) {
    // Trunk corridor 10 (Master Canteen <-> Patia / Infocity)
    return BHUBANESWAR_LOCALITIES.filter((loc) =>
      ['jayadev-vihar', 'acharya-vihar', 'vani-vihar', 'kalinga-hosp', 'damana', 'sailashree-vihar', 'niladri-vihar', 'patia', 'kiit-univ', 'infocity'].includes(loc.id)
    );
  }

  if (isCuttack) {
    // NH16 Cuttack Corridor
    return BHUBANESWAR_LOCALITIES.filter((loc) =>
      ['vani-vihar', 'rasulgarh', 'palasuni', 'mancheswar', 'cuttack-badambadi'].includes(loc.id)
    );
  }

  if (isKhandagiriWest) {
    // West Corridor (Baramunda, Khandagiri, AIIMS, ITER)
    return BHUBANESWAR_LOCALITIES.filter((loc) =>
      ['baramunda-isbt', 'fire-station', 'khandagiri', 'iter-soa', 'outr-cet', 'aiims-bbsr', 'sum-hosp'].includes(loc.id)
    );
  }

  // Fallback: match by query partial or popular stops
  const matches = BHUBANESWAR_LOCALITIES.filter(
    (loc) =>
      normOrigin.includes(loc.id) ||
      normDest.includes(loc.id) ||
      loc.name.toLowerCase().includes(normOrigin.slice(0, 4)) ||
      loc.name.toLowerCase().includes(normDest.slice(0, 4))
  );

  return matches.length > 0 ? matches : BHUBANESWAR_LOCALITIES.slice(0, 7);
}

export interface MoBusRouteInfo {
  route: string;
  path: string;
  isSpecial?: boolean;
  frequencyMinutes?: number;
  origin?: string;
  destination?: string;
}

// ── Official Complete CRUT Mo Bus Routes Dataset ─────────────────────────────
export const STANDARD_MO_BUS_ROUTES: MoBusRouteInfo[] = [
  { route: "09", path: "Bhubaneswar Railway Station – Patia (via Niladri Vihar)", origin: "Bhubaneswar Railway Station", destination: "Patia" },
  { route: "10", path: "Bhubaneswar Airport – MANU University, Cuttack (Via Jaydev Vihar, KIIT Square, Biju Pattnaik Park)", origin: "Bhubaneswar Airport", destination: "MANU University, Cuttack" },
  { route: "11", path: "Bhubaneswar Railway Station – Nandankanan (via Acharya Vihar)", origin: "Bhubaneswar Railway Station", destination: "Nandankanan" },
  { route: "12", path: "Bhubaneswar Railway Station – Nandankanan (via Jaydev Vihar)", origin: "Bhubaneswar Railway Station", destination: "Nandankanan" },
  { route: "13", path: "Nandankanan – Lingipur (via AG Square)", origin: "Nandankanan", destination: "Lingipur" },
  { route: "14", path: "Kalinga Vihar – Bhubaneswar Railway Station (Via Sum Ultimate, BSABT, OUAT, AG)", origin: "Kalinga Vihar", destination: "Bhubaneswar Railway Station" },
  { route: "16", path: "Bhubaneswar Railway Station – Sri Sri University, Cuttack (via NH)", origin: "Bhubaneswar Railway Station", destination: "Sri Sri University, Cuttack" },
  { route: "17", path: "Biju Patnaik International Airport, BBSR – Barabati Stadium, Cuttack", origin: "Biju Patnaik International Airport, BBSR", destination: "Barabati Stadium, Cuttack" },
  { route: "18", path: "Baramunda BSABT – Jagatpur (via Nandankanan)", origin: "Baramunda BSABT", destination: "Jagatpur" },
  { route: "19", path: "AIIMS – OMP Square-Mahanadi Vihar (via NH)", origin: "AIIMS", destination: "OMP Square-Mahanadi Vihar" },
  { route: "20", path: "Bhubaneswar Railway Station – Khordha New Bus Stand (via Vani Vihar)", origin: "Bhubaneswar Railway Station", destination: "Khordha New Bus Stand" },
  { route: "21", path: "Bhubaneswar Railway Station – Khordha New Bus Stand (via OUAT)", origin: "Bhubaneswar Railway Station", destination: "Khordha New Bus Stand" },
  { route: "22A", path: "Bhubaneswar Railway Station – Khordha Road Station", origin: "Bhubaneswar Railway Station", destination: "Khordha Road Station" },
  { route: "22B", path: "Jatani Gate – Khordha New Bus Stand (via Jatani)", origin: "Jatani Gate", destination: "Khordha New Bus Stand" },
  { route: "23", path: "Bhubaneswar Railway Station – Sum Hospital", origin: "Bhubaneswar Railway Station", destination: "Sum Hospital" },
  { route: "24", path: "Kalinga Vihar – Sai Temple", origin: "Kalinga Vihar", destination: "Sai Temple" },
  { route: "24E", path: "Kalinga Vihar – Bainchua (via Sai Temple)", origin: "Kalinga Vihar", destination: "Bainchua" },
  { route: "25", path: "Dumduma – Gadakana (via Master Canteen, Mancheswar)", origin: "Dumduma", destination: "Gadakana" },
  { route: "26", path: "Dumduma (Jadupur) – Rokat, Rajdhani Engg College (via Chakeisiani)", origin: "Dumduma (Jadupur)", destination: "Rokat, Rajdhani Engg College" },
  { route: "27", path: "Bhubaneswar Railway Station – Bhagwanpur (via AIIMS)", origin: "Bhubaneswar Railway Station", destination: "Bhagwanpur" },
  { route: "28", path: "Bhubaneswar Railway Station – Kalinga Nagar (Trident Galaxy)", origin: "Bhubaneswar Railway Station", destination: "Kalinga Nagar (Trident Galaxy)" },
  { route: "29", path: "Bhagwanpur – Sai Mandir", origin: "Bhagwanpur", destination: "Sai Mandir" },
  { route: "29E", path: "Bhagwanpur – SBI Colony (via Sai Mandir)", origin: "Bhagwanpur", destination: "SBI Colony" },
  { route: "30", path: "Bhubaneswar Railway Station – Chatabar (via Sum Hospital)", origin: "Bhubaneswar Railway Station", destination: "Chatabar" },
  { route: "31", path: "Bhubaneswar Railway Station – Hi-Tech Hospital (via Toshali Bhawan, Laxmi Sagar)", origin: "Bhubaneswar Railway Station", destination: "Hi-Tech Hospital" },
  { route: "32", path: "Baramunda BSABT – Lingaraj Temple (via Bhubaneswar Railway Station)", origin: "Baramunda BSABT", destination: "Lingaraj Temple" },
  { route: "33", path: "Bhubaneswar Railway Station – Pipili", origin: "Bhubaneswar Railway Station", destination: "Pipili" },
  { route: "34", path: "Bhubaneswar Railway Station – Balakati (Sai Hospital)", origin: "Bhubaneswar Railway Station", destination: "Balakati (Sai Hospital)" },
  { route: "35", path: "Bhubaneswar Railway Station – Adaspur (via Jayadev Pitha)", origin: "Bhubaneswar Railway Station", destination: "Adaspur" },
  { route: "36", path: "Bhubaneswar Railway Station – Jagadguru Krupalu University (JKU)", origin: "Bhubaneswar Railway Station", destination: "Jagadguru Krupalu University (JKU)" },
  { route: "37", path: "Baramunda BSABT – Naraj Railway Station (via Trisulia Square)", origin: "Baramunda BSABT", destination: "Naraj Railway Station" },
  { route: "38", path: "Bhubaneswar Railway Station – Taraboi (via Khordha Bypass, IIT)", origin: "Bhubaneswar Railway Station", destination: "Taraboi" },
  { route: "39", path: "Bhubaneswar Railway Station – AIIMS (via Capital Hospital, Bhimtangi)", origin: "Bhubaneswar Railway Station", destination: "AIIMS" },
  { route: "40", path: "AIIMS – Sai Mandir (Kesora) (via Capital Hospital)", origin: "AIIMS", destination: "Sai Mandir (Kesora)" },
  { route: "41", path: "Baramunda BSABT – Tangi (via NH)", origin: "Baramunda BSABT", destination: "Tangi" },
  { route: "42", path: "Baramunda BSABT – Nandankanan (via Chandaka)", origin: "Baramunda BSABT", destination: "Nandankanan" },
  { route: "43", path: "Baramunda BSABT – Banamalipur (via Rasulgarh, Kalpana Sqr)", origin: "Baramunda BSABT", destination: "Banamalipur" },
  { route: "44", path: "Baramunda BSABT – SVNIRTAR, Olatpur", origin: "Baramunda BSABT", destination: "SVNIRTAR, Olatpur" },
  { route: "45", path: "Bhubaneswar Railway Station – Jayadev Pitha", origin: "Bhubaneswar Railway Station", destination: "Jayadev Pitha" },
  { route: "46", path: "Bhubaneswar Railway Station – Nandankanan (via Kalyanpur)", origin: "Bhubaneswar Railway Station", destination: "Nandankanan" },
  { route: "47", path: "Sum Hospital – SCB Medical, Cuttack (via Ekamra Kanan, Mayfair)", origin: "Sum Hospital", destination: "SCB Medical, Cuttack" },
  { route: "48", path: "Khordha New Bus Stand – Jagatpur, Cuttack (via Pitapalli, Chandaka)", origin: "Khordha New Bus Stand", destination: "Jagatpur, Cuttack" },
  { route: "49", path: "Bhubaneswar Railway Station – Delanga Hata (via Pipili)", origin: "Bhubaneswar Railway Station", destination: "Delanga Hata" },
  { route: "50", path: "Bhubaneswar Railway Station – Puri Bus Stand", origin: "Bhubaneswar Railway Station", destination: "Puri Bus Stand" },
  { route: "51", path: "Baramunda BSABT – Puri Bus Stand (via Vani Vihar)", origin: "Baramunda BSABT", destination: "Puri Bus Stand" },
  { route: "52", path: "Puri Bus Stand – Omkareshwar Temple (via Beach Road)", origin: "Puri Bus Stand", destination: "Omkareshwar Temple" },
  { route: "53", path: "Malatipatpur Bus Stand – Shree Mandira (via Puri Bus Stand)", origin: "Malatipatpur Bus Stand", destination: "Shree Mandira" },
  { route: "54", path: "NLU, Cuttack – Puri Bus Stand (via Badambadi)", origin: "NLU, Cuttack", destination: "Puri Bus Stand" },
  { route: "56", path: "Khordha New Bus Stand – Puri Bus Stand (via Jatani, Pipili)", origin: "Khordha New Bus Stand", destination: "Puri Bus Stand" },
  { route: "58", path: "Jagatpur, Cuttack – Puri Bus Stand", origin: "Jagatpur, Cuttack", destination: "Puri Bus Stand" },
  { route: "59", path: "Mahanadi Vihar, Cuttack – Puri Bus Stand (via Badambadi, Link Road)", origin: "Mahanadi Vihar, Cuttack", destination: "Puri Bus Stand" },
  { route: "62", path: "Bhubaneswar Railway Station – Suando (via Kalpana Square, Pipili Bypass, Pattanaikia)", origin: "Bhubaneswar Railway Station", destination: "Suando" },
  { route: "63", path: "BSABT – Madhabananda Temple, Niali (via Vani Vihar, Master Canteen, Rasulgarh, Nakhara, Adaspur)", origin: "BSABT", destination: "Madhabananda Temple, Niali" },
  { route: "64", path: "Bhubaneswar Railway Station – Jatani Gate (via Vani Vihar, Gohiria Square, Madanpur, Bagchi Sri Shankara Hospital)", origin: "Bhubaneswar Railway Station", destination: "Jatani Gate" },
  { route: "65", path: "Bhubaneswar Railway Station – Wonderla Amusement Park (via Vani Vihar)", origin: "Bhubaneswar Railway Station", destination: "Wonderla Amusement Park" },
  { route: "66", path: "Airport – Pathargadia Square (Via Kiss College, Kelucharan Park, Vani Vihar)", origin: "Airport", destination: "Pathargadia Square" },
  { route: "70", path: "Bhubaneswar Railway Station – Konark", origin: "Bhubaneswar Railway Station", destination: "Konark" },
  { route: "71", path: "Baramunda BSABT – Konark (via Rasulgarh Square)", origin: "Baramunda BSABT", destination: "Konark" },
  { route: "73", path: "Puri Bus Stand – Jagannath Medical College (via Medical Sqr, Collector Office, Sanskrit University, Grid Station)", origin: "Puri Bus Stand", destination: "Jagannath Medical College" },
  { route: "74", path: "Puri Railway Station – Shree Mandira (Via Puri Bus Stand)", origin: "Puri Railway Station", destination: "Shree Mandira" },
  { route: "75", path: "Shree Mandira – Kakatpur (Via Puri Bus Stand, Balighai, Marine Drive, Konark)", origin: "Shree Mandira", destination: "Kakatpur" },
  { route: "76", path: "Puri Bus Stand – Sakhigopal Temple", origin: "Puri Bus Stand", destination: "Sakhigopal Temple" },
  { route: "77", path: "Puri Bus Stand – Nimapada Bus Stand", origin: "Puri Bus Stand", destination: "Nimapada Bus Stand" },
  { route: "78", path: "Shree Mandira – Alarnath (Brahamgiri New Bus Stand)", origin: "Shree Mandira", destination: "Alarnath" },
  { route: "79", path: "Shree Mandira – Pipili (Via Delanga)", origin: "Shree Mandira", destination: "Pipili" },
  { route: "80", path: "Naraj Police Outpost – Agrahat, Charbatia (via NLU, Badambadi, SCB Medical)", origin: "Naraj Police Outpost", destination: "Agrahat, Charbatia" },
  { route: "80E", path: "Naraj Police Outpost – Mangarajpur (via NLU, Badambadi, SCB Medical)", origin: "Naraj Police Outpost", destination: "Mangarajpur" },
  { route: "81", path: "Barabati Stadium – Jagannath Temple, Salepur (via SCB Medical, OMP Square, Jagatpur)", origin: "Barabati Stadium", destination: "Jagannath Temple, Salepur" },
  { route: "82", path: "Bhubaneswar Airport - SCB Medical (Settlement Office) (via NH)", origin: "Bhubaneswar Airport", destination: "SCB Medical (Settlement Office)" },
  { route: "83", path: "Dhabaleswar - Kandarpur (via 42 Mouza)", origin: "Dhabaleswar", destination: "Kandarpur" },
  { route: "84", path: "Biju pattanaik Park,CDA – Madhabananda Temple, Niali (via Badambadi, Link Road, SVNIRTAR, Olatpur)", origin: "Biju pattanaik Park,CDA", destination: "Madhabananda Temple, Niali" },
  { route: "85", path: "Cuttack Netaji Bus Terminal - Gadama (via OMP, Kandarpur)", origin: "Cuttack Netaji Bus Terminal", destination: "Gadama" },
  { route: "86", path: "MANU University – Mahanadi Vihar (Via Chahata Square)", origin: "MANU University", destination: "Mahanadi Vihar" },
  { route: "87", path: "Naraj Police Outpost – Mahanadi Vihar (Via CDA, Judicial Square, Link Road)", origin: "Naraj Police Outpost", destination: "Mahanadi Vihar" },
  { route: "88", path: "NLU – SCB Hospital (Via CDA, Judicial Square, Dolamundai, Professorpada)", origin: "NLU", destination: "SCB Hospital" },
  { route: "89", path: "Trishulia Bus Stand – Jagadguru Krupalu University", origin: "Trishulia Bus Stand", destination: "Jagadguru Krupalu University" },
  { route: "90", path: "Khordha New Bus Stand – Jagatpur, Cuttack (Via NH)", origin: "Khordha New Bus Stand", destination: "Jagatpur, Cuttack" },
  { route: "91", path: "Baramunda BSABT – Biju Patnaik Park, Cuttack (Via NH)", origin: "Baramunda BSABT", destination: "Biju Patnaik Park, Cuttack" },
  { route: "92", path: "Baramunda BSABT – Sai Temple (Via Khandagiri, Lingraj Station, Bhim Tangi, Capital Hospital, Kalpana)", origin: "Baramunda BSABT", destination: "Sai Temple" },
  { route: "93", path: "Bhubaneswar Railway Station – Biju Patnaik Park, CDA (Via Fire Station, Sum Hospital, Kateni)", origin: "Bhubaneswar Railway Station", destination: "Biju Patnaik Park, CDA" },
];

export const SPECIAL_MO_BUS_ROUTES: MoBusRouteInfo[] = [
  { route: "1H", path: "Nandankanan, Botanical Garden - Dhauli (via Jaydev Vihar, Master Canteen, Lingaraj Temple)", isSpecial: true, origin: "Nandankanan", destination: "Dhauli" },
  { route: "2H", path: "Sai Mandir - Khandagiri-Udaygiri (via Panchu Pandav, Bhubaneswar Railway Station, BSABT, Jaydev Vatika)", isSpecial: true, origin: "Sai Mandir", destination: "Khandagiri-Udaygiri" },
  { route: "DD1", path: "International Airport, Bhubaneswar – Shree Mandira Parking, Puri (Via Kalpana Square)", isSpecial: true, origin: "International Airport, Bhubaneswar", destination: "Shree Mandira Parking, Puri" }
];

export const ALL_MO_BUS_ROUTES: MoBusRouteInfo[] = [
  ...STANDARD_MO_BUS_ROUTES,
  ...SPECIAL_MO_BUS_ROUTES,
];

/**
 * Intelligent Mo Bus Route Recommender
 * Searches all 82 routes and finds the most relevant Mo Bus numbers matching the trip corridor.
 */
export function findMatchingMoBusRoutes(originQuery: string, destQuery: string): {
  directRoutes: MoBusRouteInfo[];
  connectedRoutes: MoBusRouteInfo[];
  primarySuggestion: MoBusRouteInfo;
} {
  const normO = (originQuery || '').toLowerCase();
  const normD = (destQuery || '').toLowerCase();

  // Helper keyword tokenizer
  const getKeywords = (str: string) => {
    return str
      .replace(/bhubaneswar|cuttack|odisha|india|square|chhak|bus|stand|station|terminal/gi, '')
      .toLowerCase()
      .split(/[\s,–—\-\/]+/)
      .filter((w) => w.length >= 3);
  };

  const originTokens = getKeywords(normO);
  const destTokens = getKeywords(normD);

  const directMatches: MoBusRouteInfo[] = [];
  const partialMatches: MoBusRouteInfo[] = [];

  for (const r of ALL_MO_BUS_ROUTES) {
    const routeText = (r.route + ' ' + r.path).toLowerCase();
    
    // Check if route text contains words from both origin and dest
    const matchesOrigin = originTokens.length === 0 || originTokens.some((tok) => routeText.includes(tok));
    const matchesDest = destTokens.length === 0 || destTokens.some((tok) => routeText.includes(tok));

    if (matchesOrigin && matchesDest && (originTokens.length > 0 || destTokens.length > 0)) {
      directMatches.push(r);
    } else if (matchesOrigin || matchesDest) {
      partialMatches.push(r);
    }
  }

  // Fallbacks if no direct match is found
  if (directMatches.length === 0) {
    // Check popular corridors
    if (normO.includes('trident') || normD.includes('trident')) {
      directMatches.push(
        {
          route: '10',
          path: 'Biju Patnaik Airport – Infocity Square (Drop at Infocity Square ➔ 200m Walk or Auto to Trident)',
          origin: 'Biju Patnaik Airport',
          destination: 'Infocity Square (Connect to Trident)'
        }
      );
    } else if (normO.includes('airport') || normD.includes('airport')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '10')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '17')!,
        SPECIAL_MO_BUS_ROUTES.find((r) => r.route === 'DD1')!
      );
    } else if (normO.includes('nandankanan') || normD.includes('nandankanan')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '11')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '12')!,
        SPECIAL_MO_BUS_ROUTES.find((r) => r.route === '1H')!
      );
    } else if (normO.includes('puri') || normD.includes('puri')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '50')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '51')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '56')!
      );
    } else if (normO.includes('aiims') || normD.includes('aiims')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '19')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '39')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '27')!
      );
    } else if (normO.includes('sum') || normD.includes('sum')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '23')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '47')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '30')!
      );
    } else if (normO.includes('baramunda') || normD.includes('baramunda')) {
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '18')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '32')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '42')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '51')!
      );
    } else {
      // Default central high-frequency trunk lines
      directMatches.push(
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '10')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '11')!,
        STANDARD_MO_BUS_ROUTES.find((r) => r.route === '24')!
      );
    }
  }

  const cleanDirect = directMatches.filter(Boolean);
  const cleanPartial = partialMatches.filter(Boolean);

  return {
    directRoutes: cleanDirect,
    connectedRoutes: cleanPartial.slice(0, 4),
    primarySuggestion: cleanDirect[0] || STANDARD_MO_BUS_ROUTES[1],
  };
}

/**
 * Returns a clean, human-readable landmark name for any GPS coordinates in Bhubaneswar/Odisha
 * e.g., "Near Institute of Physics, Sachivalaya Marg" instead of raw numbers.
 */
export function getHumanReadableLocationName(lat: number, lng: number): string {
  let closestDist = Infinity;
  let closestName = '';
  let subArea = '';

  for (const loc of BHUBANESWAR_LOCALITIES) {
    const d = Math.hypot(loc.lat - lat, (loc.lng - lng) * Math.cos((lat * Math.PI) / 180));
    if (d < closestDist) {
      closestDist = d;
      closestName = loc.name.split('/')[0].trim();
      subArea = loc.popularLandmark || '';
    }
  }

  for (const st of BHUBANESWAR_STATIONS) {
    const d = Math.hypot(st.lat - lat, (st.lng - lng) * Math.cos((lat * Math.PI) / 180));
    if (d < closestDist) {
      closestDist = d;
      closestName = st.name
        .split('(')[0]
        .replace('Bus Terminal & Railway Hub', '')
        .replace('Transit Shelter', '')
        .trim();
      subArea = st.lines ? `Mo Bus Transit Hub` : '';
    }
  }

  // If very close to Institute of Physics coordinates or similar tech area
  if (Math.abs(lat - 20.300) < 0.015 && Math.abs(lng - 85.825) < 0.015) {
    return 'Near Institute of Physics (Sachivalaya Marg)';
  }

  // Within ~2.5 km of a specific known landmark
  if (closestDist < 0.025 && closestName) {
    return `Near ${closestName}${subArea ? ` (${subArea.split('&')[0].trim()})` : ''}`;
  }

  // Within ~6 km of Bhubaneswar city bounds
  if (closestDist < 0.06 && closestName) {
    return `Near ${closestName}`;
  }

  // Outside Bhubaneswar region (e.g. Delhi, Mumbai, Kolkata, Bengaluru) - do NOT claim an Odisha landmark
  return `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
