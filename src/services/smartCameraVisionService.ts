/**
 * Smart Camera AI Vision & Optical Telemetry Service
 * Analyzes traffic congestion levels and low-lux / poor lighting darkness
 * zones using real-time computer vision inference simulation.
 */

export interface SmartCameraFeed {
  id: string;
  cameraId: string;
  junctionName: string;
  corridor: string;
  coords: [number, number];
  status: 'online' | 'recalibrating' | 'night_mode';
  fps: number;
  vehicleCount: number;
  twoWheelersCount: number;
  fourWheelersCount: number;
  heavyBusesCount: number;
  avgSpeedKmph: number;
  congestionLevel: 'low' | 'moderate' | 'heavy' | 'gridlock';
  congestionScorePercent: number; // 0 to 100%
  ambientLux: number; // Low Lux (<25) = Poor Lighting, >60 = Well Lit
  lightingQuality: 'poor' | 'moderate' | 'optimal';
  streetlightsStatus: string;
  isDarkSpotWarning: boolean;
  pedestrianCount: number;
  activeAnomalies: string[];
  aiDetectionConfidence: number;
  lastScannedAt: string;
  recommendedAction: string;
}

export const SMART_CAMERA_FEEDS: SmartCameraFeed[] = [
  {
    id: 'cam-01',
    cameraId: 'BSCL-CCTV-JV-01',
    junctionName: 'Jayadev Vihar Flyover & Underpass Junction',
    corridor: 'Nandankanan Road ➔ Cuttack Highway',
    coords: [20.2988, 85.8236],
    status: 'online',
    fps: 30,
    vehicleCount: 94,
    twoWheelersCount: 52,
    fourWheelersCount: 34,
    heavyBusesCount: 8,
    avgSpeedKmph: 18,
    congestionLevel: 'heavy',
    congestionScorePercent: 78,
    ambientLux: 48,
    lightingQuality: 'moderate',
    streetlightsStatus: '7/8 Active',
    isDarkSpotWarning: false,
    pedestrianCount: 38,
    activeAnomalies: ['Slow bus stop queuing at lane 1', 'High pedestrian crossing volume'],
    aiDetectionConfidence: 98.6,
    lastScannedAt: 'Just Now',
    recommendedAction: 'Extend green signal by +15s towards Patia to flush tailback.',
  },
  {
    id: 'cam-02',
    cameraId: 'BSCL-CCTV-RS-02',
    junctionName: 'Rasulgarh High-Density Interchange',
    corridor: 'NH-16 Highway & Puri Bypass',
    coords: [20.2882, 85.8614],
    status: 'online',
    fps: 28,
    vehicleCount: 136,
    twoWheelersCount: 68,
    fourWheelersCount: 52,
    heavyBusesCount: 16,
    avgSpeedKmph: 11,
    congestionLevel: 'gridlock',
    congestionScorePercent: 92,
    ambientLux: 62,
    lightingQuality: 'optimal',
    streetlightsStatus: '12/12 High-Mast Active',
    isDarkSpotWarning: false,
    pedestrianCount: 14,
    activeAnomalies: ['Stalled mini-truck near right turn bay', 'Merge bottleneck on NH-16'],
    aiDetectionConfidence: 99.1,
    lastScannedAt: '12s ago',
    recommendedAction: 'Dispatch traffic warden; divert Mo Bus Route 11 via Cuttack Road.',
  },
  {
    id: 'cam-03',
    cameraId: 'BSCL-CCTV-KT-03',
    junctionName: 'KIIT Square & University Avenue',
    corridor: 'Patia IT Hub ➔ Infocity Road',
    coords: [20.3541, 85.8192],
    status: 'online',
    fps: 30,
    vehicleCount: 46,
    twoWheelersCount: 30,
    fourWheelersCount: 14,
    heavyBusesCount: 2,
    avgSpeedKmph: 34,
    congestionLevel: 'low',
    congestionScorePercent: 28,
    ambientLux: 88,
    lightingQuality: 'optimal',
    streetlightsStatus: '10/10 Smart LED Poles Active',
    isDarkSpotWarning: false,
    pedestrianCount: 62,
    activeAnomalies: ['Safe pedestrian crosswalk active'],
    aiDetectionConfidence: 97.8,
    lastScannedAt: '3s ago',
    recommendedAction: 'Traffic moving smoothly; standard 45s cycle retained.',
  },
  {
    id: 'cam-04',
    cameraId: 'BSCL-CCTV-VV-04',
    junctionName: 'Vani Vihar University Cut & Underpass Stretch',
    corridor: 'Janpath Arterial ➔ Saheed Nagar',
    coords: [20.2974, 85.8451],
    status: 'online',
    fps: 25,
    vehicleCount: 68,
    twoWheelersCount: 44,
    fourWheelersCount: 20,
    heavyBusesCount: 4,
    avgSpeedKmph: 22,
    congestionLevel: 'moderate',
    congestionScorePercent: 54,
    ambientLux: 16,
    lightingQuality: 'poor',
    streetlightsStatus: '2/6 Active (4 Faulty Streetlights Detected ⚠️)',
    isDarkSpotWarning: true,
    pedestrianCount: 24,
    activeAnomalies: ['🚨 POOR LIGHTING DETECTED: Ambient Lux 16 (Below Safety Threshold <25)', 'Low night visibility for cyclists'],
    aiDetectionConfidence: 96.9,
    lastScannedAt: '5s ago',
    recommendedAction: 'Flagged to BMC Electrical Division for priority LED luminaire repair.',
  },
  {
    id: 'cam-05',
    cameraId: 'BSCL-CCTV-MC-05',
    junctionName: 'Master Canteen Station Commercial Plaza',
    corridor: 'Railway Station Plaza ➔ Rajmahal Square',
    coords: [20.2678, 85.8421],
    status: 'online',
    fps: 30,
    vehicleCount: 112,
    twoWheelersCount: 60,
    fourWheelersCount: 38,
    heavyBusesCount: 14,
    avgSpeedKmph: 14,
    congestionLevel: 'heavy',
    congestionScorePercent: 82,
    ambientLux: 74,
    lightingQuality: 'optimal',
    streetlightsStatus: 'All High-Mast Poles ON',
    isDarkSpotWarning: false,
    pedestrianCount: 110,
    activeAnomalies: ['Auto-rickshaw double parking at bay 3', 'Heavy rail commuter egress'],
    aiDetectionConfidence: 98.4,
    lastScannedAt: '1s ago',
    recommendedAction: 'Trigger Ama E-Ride feeder dispatch; clear station pickup lane.',
  },
  {
    id: 'cam-06',
    cameraId: 'BSCL-CCTV-DS-06',
    junctionName: 'Damana Chhak – Sailashree Vihar Link Road',
    corridor: 'Residential Connector ➔ Infocity',
    coords: [20.3312, 85.8198],
    status: 'online',
    fps: 25,
    vehicleCount: 24,
    twoWheelersCount: 18,
    fourWheelersCount: 6,
    heavyBusesCount: 0,
    avgSpeedKmph: 32,
    congestionLevel: 'low',
    congestionScorePercent: 22,
    ambientLux: 12,
    lightingQuality: 'poor',
    streetlightsStatus: '1/5 Active (Severe Dark Stretch ⚠️)',
    isDarkSpotWarning: true,
    pedestrianCount: 9,
    activeAnomalies: ['🚨 HIGH ACCIDENT RISK: Poor illumination on curved road section', 'Dark spots near residential bus bay'],
    aiDetectionConfidence: 97.4,
    lastScannedAt: '8s ago',
    recommendedAction: 'Automated civic ticket #BSCL-ELEC-4091 dispatched to municipal team.',
  },
  {
    id: 'cam-07',
    cameraId: 'BSCL-CCTV-KH-07',
    junctionName: 'Khandagiri Square & Caves Tourist Junction',
    corridor: 'NH-16 Highway Entry ➔ Baramunda Bus Terminal',
    coords: [20.2584, 85.7824],
    status: 'online',
    fps: 30,
    vehicleCount: 78,
    twoWheelersCount: 36,
    fourWheelersCount: 30,
    heavyBusesCount: 12,
    avgSpeedKmph: 24,
    congestionLevel: 'moderate',
    congestionScorePercent: 58,
    ambientLux: 55,
    lightingQuality: 'moderate',
    streetlightsStatus: '8/10 Active',
    isDarkSpotWarning: false,
    pedestrianCount: 42,
    activeAnomalies: ['Inter-city buses merging from terminal exit'],
    aiDetectionConfidence: 98.2,
    lastScannedAt: 'Just Now',
    recommendedAction: 'Maintain priority for highway egress; synchronize Baramunda exit light.',
  },
  {
    id: 'cam-08',
    cameraId: 'BSCL-CCTV-PT-08',
    junctionName: 'Patia Chhak / Big Bazaar Corridor',
    corridor: 'Nandankanan Road Commercial Strip',
    coords: [20.3582, 85.8188],
    status: 'online',
    fps: 30,
    vehicleCount: 104,
    twoWheelersCount: 58,
    fourWheelersCount: 38,
    heavyBusesCount: 8,
    avgSpeedKmph: 15,
    congestionLevel: 'heavy',
    congestionScorePercent: 76,
    ambientLux: 72,
    lightingQuality: 'optimal',
    streetlightsStatus: 'All Commercial & Public Poles Active',
    isDarkSpotWarning: false,
    pedestrianCount: 75,
    activeAnomalies: ['Delivery van loading on curb', 'High shopper pedestrian volume'],
    aiDetectionConfidence: 98.9,
    lastScannedAt: '4s ago',
    recommendedAction: 'Dynamic signal timing adjusted; alternate route via Infocity suggested.',
  },
];

export class SmartCameraVisionService {
  private static instance: SmartCameraVisionService;
  private cameras: SmartCameraFeed[] = [...SMART_CAMERA_FEEDS];

  public static getInstance(): SmartCameraVisionService {
    if (!SmartCameraVisionService.instance) {
      SmartCameraVisionService.instance = new SmartCameraVisionService();
    }
    return SmartCameraVisionService.instance;
  }

  public getCameras(): SmartCameraFeed[] {
    return this.cameras;
  }

  public getDarkSpotCameras(): SmartCameraFeed[] {
    return this.cameras.filter((cam) => cam.isDarkSpotWarning);
  }

  public getCongestedCameras(): SmartCameraFeed[] {
    return this.cameras.filter((cam) => cam.congestionLevel === 'heavy' || cam.congestionLevel === 'gridlock');
  }

  public async scanLiveCamera(cameraId: string): Promise<SmartCameraFeed> {
    // Simulate real computer vision neural net processing delay
    await new Promise((res) => setTimeout(res, 600));

    const camIndex = this.cameras.findIndex((c) => c.id === cameraId || c.cameraId === cameraId);
    if (camIndex === -1) return this.cameras[0];

    const current = this.cameras[camIndex];
    // Dynamic vehicle jitter simulation
    const deltaVehicles = Math.floor((Math.random() - 0.45) * 8);
    const updatedCount = Math.max(10, current.vehicleCount + deltaVehicles);
    const newScore = Math.min(99, Math.max(15, current.congestionScorePercent + Math.floor((Math.random() - 0.48) * 6)));

    const updated: SmartCameraFeed = {
      ...current,
      vehicleCount: updatedCount,
      congestionScorePercent: newScore,
      congestionLevel: newScore > 85 ? 'gridlock' : newScore > 65 ? 'heavy' : newScore > 40 ? 'moderate' : 'low',
      lastScannedAt: 'Just Now',
      aiDetectionConfidence: +(97 + Math.random() * 2.8).toFixed(1),
    };

    this.cameras[camIndex] = updated;
    return updated;
  }

  public async scanAllCameras(): Promise<SmartCameraFeed[]> {
    await new Promise((res) => setTimeout(res, 900));
    return this.cameras.map((cam) => {
      const delta = Math.floor((Math.random() - 0.48) * 6);
      const newScore = Math.min(98, Math.max(18, cam.congestionScorePercent + delta));
      return {
        ...cam,
        vehicleCount: Math.max(8, cam.vehicleCount + Math.floor((Math.random() - 0.48) * 8)),
        congestionScorePercent: newScore,
        congestionLevel: newScore > 85 ? 'gridlock' : newScore > 65 ? 'heavy' : newScore > 40 ? 'moderate' : 'low',
        lastScannedAt: 'Just Now',
        aiDetectionConfidence: +(97 + Math.random() * 2.8).toFixed(1),
      };
    });
  }
}

export const smartCameraVisionService = SmartCameraVisionService.getInstance();
