import { Vehicle } from '../types/transit';
import { INITIAL_BHUBANESWAR_VEHICLES } from '../data/cities/bhubaneswar';

export class TransitSimulator {
  private vehicles: Vehicle[];
  private speedMultiplier = 1;
  private isRunning = true;
  private simTimeMinutes = 10 * 60; // Starts at 10:00 AM
  private tickInterval: number | null = null;
  private subscribers: ((vehicles: Vehicle[], simTime: string) => void)[] = [];
  private currentCenter: [number, number] = [20.3050, 85.8300];
  private activeRouteCoords: [number, number][] = [];

  constructor() {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_BHUBANESWAR_VEHICLES));
  }

  public start() {
    if (this.tickInterval) return;
    this.isRunning = true;
    this.tickInterval = window.setInterval(() => {
      if (!this.isRunning) return;
      this.tick();
    }, 1000);
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  public isSimRunning(): boolean {
    return this.isRunning;
  }

  public getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  public subscribe(cb: (vehicles: Vehicle[], simTime: string) => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  /**
   * Set active map center or route corridor and spawn realistic multi-modal vehicles
   */
  public updateRegion(centerLat: number, centerLng: number, routeCoords?: [number, number][]) {
    this.currentCenter = [centerLat, centerLng];
    if (routeCoords && routeCoords.length > 1) {
      this.activeRouteCoords = routeCoords;
    }

    // Check if current vehicles are too far from this center
    const isFar = this.vehicles.length === 0 || this.vehicles.some(v => {
      const dLat = Math.abs(v.lat - centerLat);
      const dLng = Math.abs(v.lng - centerLng);
      return dLat > 0.6 || dLng > 0.6;
    });

    if (isFar) {
      this.generateVehiclesForRegion(centerLat, centerLng, routeCoords);
    }
  }

  private generateVehiclesForRegion(centerLat: number, centerLng: number, routeCoords?: [number, number][]) {
    const newVehicles: Vehicle[] = [];
    const hasRoute = routeCoords && routeCoords.length > 2;

    const templates = [
      { prefix: 'BUS', mode: 'bus' as const, line: 'Route 101 AC Express', color: '#10B981', isAc: true, ev: true },
      { prefix: 'BUS', mode: 'bus' as const, line: 'Route 204 Metro Feeder', color: '#059669', isAc: false, ev: false },
      { prefix: 'BUS', mode: 'bus' as const, line: 'Route 311 City Link', color: '#16A34A', isAc: true, ev: true },
      { prefix: 'METRO', mode: 'metro' as const, line: 'Blue Line (Rapid)', color: '#2563EB', isAc: true, ev: true },
      { prefix: 'METRO', mode: 'metro' as const, line: 'Red Line (Corridor)', color: '#DC2626', isAc: true, ev: true },
      { prefix: 'AUTO', mode: 'auto' as const, line: 'Smart EV Auto (Ride-42)', color: '#0D9488', isAc: false, ev: true },
      { prefix: 'AUTO', mode: 'auto' as const, line: 'Green E-Rickshaw', color: '#0F766E', isAc: false, ev: true },
      { prefix: 'CAB', mode: 'auto' as const, line: 'Rapid City Cab (Prime)', color: '#F59E0B', isAc: true, ev: true },
    ];

    templates.forEach((tmpl, i) => {
      let lat = centerLat;
      let lng = centerLng;

      if (hasRoute && routeCoords) {
        // Place along the active route
        const index = Math.floor((i / templates.length) * (routeCoords.length - 1));
        const pt = routeCoords[index];
        const offsetLat = (Math.random() - 0.5) * 0.003;
        const offsetLng = (Math.random() - 0.5) * 0.003;
        lat = pt[0] + offsetLat;
        lng = pt[1] + offsetLng;
      } else {
        // Distribute within 2-4 km radius around center
        const angle = (i / templates.length) * Math.PI * 2;
        const radius = 0.012 + Math.random() * 0.015;
        lat = centerLat + Math.sin(angle) * radius;
        lng = centerLng + Math.cos(angle) * radius;
      }

      newVehicles.push({
        id: `veh-${tmpl.prefix.toLowerCase()}-${i + 1}`,
        name: `${tmpl.line}`,
        mode: tmpl.mode,
        routeId: `route-${i + 1}`,
        lineName: tmpl.line,
        color: tmpl.color,
        lat,
        lng,
        speedKmH: Math.floor(25 + Math.random() * 25),
        heading: Math.floor(Math.random() * 360),
        nextStopId: `stop-${i + 1}`,
        nextStopName: `Transit Hub Junction ${i + 1}`,
        etaSeconds: Math.floor(60 + Math.random() * 240),
        delaySeconds: 0,
        occupancy: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'moderate' : 'full',
        isAc: tmpl.isAc,
        evVehicle: tmpl.ev,
        isWomenOnlyCoachAvailable: tmpl.mode === 'metro' || i === 0,
        isLowFloorAccessible: true,
      });
    });

    this.vehicles = newVehicles;
    this.notify();
  }

  public injectDelay(vehicleId: string, delayMinutes: number) {
    const v = this.vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      v.delaySeconds += delayMinutes * 60;
      this.notify();
    }
  }

  public resetSchedule() {
    this.generateVehiclesForRegion(this.currentCenter[0], this.currentCenter[1], this.activeRouteCoords);
  }

  private tick() {
    const deltaSeconds = 1 * this.speedMultiplier;
    this.simTimeMinutes += (deltaSeconds / 60);

    // Update vehicle positions with smooth movement
    this.vehicles.forEach(v => {
      const driftLat = (Math.random() - 0.49) * 0.00025 * this.speedMultiplier;
      const driftLng = (Math.random() - 0.49) * 0.00025 * this.speedMultiplier;

      v.lat += driftLat;
      v.lng += driftLng;

      // Realistic speed fluctuation
      v.speedKmH = Math.max(12, Math.min(55, v.speedKmH + Math.floor((Math.random() - 0.5) * 4)));

      if (v.etaSeconds > 10) {
        v.etaSeconds = Math.max(5, v.etaSeconds - deltaSeconds);
      } else {
        v.etaSeconds = Math.floor(120 + Math.random() * 180);
      }
    });

    this.notify();
  }

  private notify() {
    const hours = Math.floor(this.simTimeMinutes / 60) % 24;
    const mins = Math.floor(this.simTimeMinutes % 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const dispHours = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr = `${dispHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;

    this.subscribers.forEach(cb => cb([...this.vehicles], timeStr));
  }
}

export const transitSimulator = new TransitSimulator();
