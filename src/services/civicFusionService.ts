/**
 * Civic Multi-Source Intelligence & IoT Fusion Service
 * Unifies:
 * 1. 🌦️ IoT Rainfall & Storm Drainage Level Sensors
 * 2. 🏛️ Municipal Smart City Data Feeds (BMC / BSCL Work Orders & Alerts)
 * 3. 📹 AI-Based CCTV Optical Safety & Hazard Detections
 * 4. 📡 Environmental & Air Quality IoT Nodes
 */

export interface IoTRainfallSensor {
  id: string;
  sensorCode: string;
  locationName: string;
  coords: [number, number];
  waterLevelCm: number;
  drainageCapacityPercent: number;
  rainfallRateMmPerHour: number;
  status: 'normal' | 'warning' | 'critical_inundation';
  lastReadingTime: string;
  pumpStatus: 'active' | 'standby' | 'auto_triggered';
}

export interface MunicipalWorkOrder {
  id: string;
  orderNumber: string;
  department: 'BMC Drainage' | 'BSCL Electrical' | 'CRUT Transit' | 'Traffic Police' | 'Sanitation';
  category: 'pothole_repair' | 'streetlight_grid' | 'waterlogging_pumping' | 'signal_calibration' | 'road_clearing';
  title: string;
  location: string;
  status: 'dispatched' | 'in_progress' | 'resolved' | 'escalated';
  workersDispatched: number;
  initiatedTime: string;
  slaTargetTime: string;
}

export interface AiCctvDetection {
  id: string;
  cameraCode: string;
  locationName: string;
  hazardType: 'poor_lighting' | 'stalled_vehicle' | 'waterlogging' | 'crowd_surge' | 'illegal_parking';
  title: string;
  description: string;
  confidenceScorePercent: number;
  luxLevel?: number;
  timestamp: string;
  verifiedBy: 'AI Neural Net (YOLOv8 + OpenCV Vision)';
  actionTaken: string;
}

export interface EnvironmentalSensor {
  id: string;
  zone: string;
  aqi: number;
  pm25: number;
  humidityPercent: number;
  surfaceTempC: number;
  status: 'good' | 'moderate' | 'poor' | 'hazardous';
}

export const IOT_RAINFALL_SENSORS: IoTRainfallSensor[] = [
  {
    id: 'rain-01',
    sensorCode: 'BMC-DRAIN-ISKCON-01',
    locationName: 'Iskcon Temple Highway Underpass & Service Road',
    coords: [20.2974, 85.8188],
    waterLevelCm: 32,
    drainageCapacityPercent: 78,
    rainfallRateMmPerHour: 18.4,
    status: 'warning',
    lastReadingTime: '1m ago',
    pumpStatus: 'auto_triggered',
  },
  {
    id: 'rain-02',
    sensorCode: 'BMC-DRAIN-VV-02',
    locationName: 'Vani Vihar Canal Sump & Rail Underbridge',
    coords: [20.2985, 85.8442],
    waterLevelCm: 14,
    drainageCapacityPercent: 42,
    rainfallRateMmPerHour: 6.2,
    status: 'normal',
    lastReadingTime: 'Just Now',
    pumpStatus: 'standby',
  },
  {
    id: 'rain-03',
    sensorCode: 'BMC-DRAIN-ACH-03',
    locationName: 'Acharya Vihar Low-Lying Culvert Zone',
    coords: [20.2952, 85.8312],
    waterLevelCm: 48,
    drainageCapacityPercent: 89,
    rainfallRateMmPerHour: 24.5,
    status: 'critical_inundation',
    lastReadingTime: '2m ago',
    pumpStatus: 'active',
  },
  {
    id: 'rain-04',
    sensorCode: 'BMC-DRAIN-PATIA-04',
    locationName: 'Patia Railway Station Overpass Sump',
    coords: [20.3548, 85.8214],
    waterLevelCm: 8,
    drainageCapacityPercent: 25,
    rainfallRateMmPerHour: 4.1,
    status: 'normal',
    lastReadingTime: 'Just Now',
    pumpStatus: 'standby',
  },
];

export const MUNICIPAL_WORK_ORDERS: MunicipalWorkOrder[] = [
  {
    id: 'muni-01',
    orderNumber: 'BSCL-ELEC-4091',
    department: 'BSCL Electrical',
    category: 'streetlight_grid',
    title: 'Faulty LED Luminaire Pole Restoration',
    location: 'Damana Chhak – Sailashree Vihar Link Road',
    status: 'dispatched',
    workersDispatched: 4,
    initiatedTime: '25m ago',
    slaTargetTime: 'Within 45 mins',
  },
  {
    id: 'muni-02',
    orderNumber: 'BMC-ROAD-8120',
    department: 'BMC Drainage',
    category: 'waterlogging_pumping',
    title: 'High-Capacity Submersible Pump Deployment',
    location: 'Acharya Vihar Square Service Bay',
    status: 'in_progress',
    workersDispatched: 6,
    initiatedTime: '15m ago',
    slaTargetTime: 'Within 30 mins',
  },
  {
    id: 'muni-03',
    orderNumber: 'CRUT-INFRA-2311',
    department: 'CRUT Transit',
    category: 'pothole_repair',
    title: 'Bus Bay Bitumen Asphalt Patching',
    location: 'Master Canteen Bus Bay #2',
    status: 'in_progress',
    workersDispatched: 5,
    initiatedTime: '1h ago',
    slaTargetTime: 'Within 2 hours',
  },
  {
    id: 'muni-04',
    orderNumber: 'BSCL-ELEC-4098',
    department: 'BSCL Electrical',
    category: 'streetlight_grid',
    title: 'High-Mast Luminaire Repair (Dark Spot Resolution)',
    location: 'Vani Vihar University Underpass Stretch',
    status: 'dispatched',
    workersDispatched: 3,
    initiatedTime: '10m ago',
    slaTargetTime: 'Within 60 mins',
  },
];

export const AI_CCTV_HAZARD_DETECTIONS: AiCctvDetection[] = [
  {
    id: 'cctv-det-01',
    cameraCode: 'BSCL-CCTV-VV-04',
    locationName: 'Vani Vihar University Cut & Underpass',
    hazardType: 'poor_lighting',
    title: 'Critical Low-Lux Dark Stretch Warning',
    description: 'AI detected ambient illumination level at 16 Lux (Safety threshold: >25 Lux). 4/6 streetlights non-operational.',
    confidenceScorePercent: 96.9,
    luxLevel: 16,
    timestamp: '5m ago',
    verifiedBy: 'AI Neural Net (YOLOv8 + OpenCV Vision)',
    actionTaken: 'Automated civic work order generated & flagged to BMC Electrical squad.',
  },
  {
    id: 'cctv-det-02',
    cameraCode: 'BSCL-CCTV-RS-02',
    locationName: 'Rasulgarh High-Density Interchange',
    hazardType: 'stalled_vehicle',
    title: 'Stalled Commercial Carrier Bottleneck',
    description: 'Breakdown in right turning lane creating 350m congestion queue on NH-16 feeder.',
    confidenceScorePercent: 99.1,
    timestamp: '12m ago',
    verifiedBy: 'AI Neural Net (YOLOv8 + OpenCV Vision)',
    actionTaken: 'Traffic Control Room notified; Mo Bus corridor diversion broadcasted.',
  },
  {
    id: 'cctv-det-03',
    cameraCode: 'BSCL-CCTV-DS-06',
    locationName: 'Damana Chhak – Sailashree Vihar Link Road',
    hazardType: 'poor_lighting',
    title: 'Dark Zone Alert on Sharp Curve',
    description: 'Zero functional lighting detected on curved connector. Pedestrian visibility < 10 meters.',
    confidenceScorePercent: 97.4,
    luxLevel: 12,
    timestamp: '8m ago',
    verifiedBy: 'AI Neural Net (YOLOv8 + OpenCV Vision)',
    actionTaken: 'Night-safe transit routing re-directed through well-lit CSPUR main corridor.',
  },
  {
    id: 'cctv-det-04',
    cameraCode: 'BSCL-CCTV-JV-01',
    locationName: 'Jayadev Vihar Overbridge Service Lane',
    hazardType: 'waterlogging',
    title: 'Storm Runoff Ponding Detected on Left Curb',
    description: 'Optical reflection analysis indicates 15-20cm water accumulation obstructing 1 lane.',
    confidenceScorePercent: 98.6,
    timestamp: '18m ago',
    verifiedBy: 'AI Neural Net (YOLOv8 + OpenCV Vision)',
    actionTaken: 'Drainage suction vehicle dispatched by BMC Control Room.',
  },
];

export const ENVIRONMENTAL_SENSORS: EnvironmentalSensor[] = [
  {
    id: 'env-01',
    zone: 'Janpath Arterial Commercial Corridor',
    aqi: 72,
    pm25: 28,
    humidityPercent: 74,
    surfaceTempC: 31.4,
    status: 'moderate',
  },
  {
    id: 'env-02',
    zone: 'Patia IT Park & University Green Zone',
    aqi: 48,
    pm25: 14,
    humidityPercent: 68,
    surfaceTempC: 29.8,
    status: 'good',
  },
  {
    id: 'env-03',
    zone: 'Rasulgarh Industrial & Freight Gateway',
    aqi: 118,
    pm25: 45,
    humidityPercent: 65,
    surfaceTempC: 33.2,
    status: 'poor',
  },
];

export class CivicFusionService {
  private static instance: CivicFusionService;

  public static getInstance(): CivicFusionService {
    if (!CivicFusionService.instance) {
      CivicFusionService.instance = new CivicFusionService();
    }
    return CivicFusionService.instance;
  }

  public getRainfallSensors(): IoTRainfallSensor[] {
    return IOT_RAINFALL_SENSORS;
  }

  public getMunicipalWorkOrders(): MunicipalWorkOrder[] {
    return MUNICIPAL_WORK_ORDERS;
  }

  public getAiCctvDetections(): AiCctvDetection[] {
    return AI_CCTV_HAZARD_DETECTIONS;
  }

  public getEnvironmentalSensors(): EnvironmentalSensor[] {
    return ENVIRONMENTAL_SENSORS;
  }

  public getCombinedCivicMetrics() {
    const activeDarkSpots = AI_CCTV_HAZARD_DETECTIONS.filter((d) => d.hazardType === 'poor_lighting').length;
    const activeFloodAlerts = IOT_RAINFALL_SENSORS.filter((s) => s.status !== 'normal').length;
    const activeWorkOrders = MUNICIPAL_WORK_ORDERS.filter((w) => w.status !== 'resolved').length;
    const avgAqi = Math.round(ENVIRONMENTAL_SENSORS.reduce((acc, s) => acc + s.aqi, 0) / ENVIRONMENTAL_SENSORS.length);

    return {
      activeDarkSpots,
      activeFloodAlerts,
      activeWorkOrders,
      avgAqi,
      iotSensorCount: IOT_RAINFALL_SENSORS.length + ENVIRONMENTAL_SENSORS.length,
      aiCameraCount: 16,
      overallCityResilienceScore: 84, // 0-100
    };
  }
}

export const civicFusionService = CivicFusionService.getInstance();
