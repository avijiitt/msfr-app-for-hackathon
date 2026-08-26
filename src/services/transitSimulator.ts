import { Vehicle } from '../types/transit';
import { BHUBANESWAR_ROUTES, INITIAL_BHUBANESWAR_VEHICLES } from '../data/cities/bhubaneswar';

export class TransitSimulator {
  private vehicles: Vehicle[];
  private speedMultiplier = 1;
  private isRunning = true;
  private simTimeMinutes = 10 * 60; // Starts at 10:00 AM
  private tickInterval: number | null = null;
  private subscribers: ((vehicles: Vehicle[], simTime: string) => void)[] = [];

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

  public subscribe(cb: (vehicles: Vehicle[], simTime: string) => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  public injectDelay(vehicleId: string, delayMinutes: number) {
    const v = this.vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      v.delaySeconds += delayMinutes * 60;
      this.notify();
    }
  }

  public resetSchedule() {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_BHUBANESWAR_VEHICLES));
    this.notify();
  }

  private tick() {
    const deltaSeconds = 1 * this.speedMultiplier;
    this.simTimeMinutes += (deltaSeconds / 60);

    // Update vehicle positions
    this.vehicles.forEach(v => {
      const route = BHUBANESWAR_ROUTES.find(r => r.id === v.routeId);
      if (!route || route.path.length < 2) return;

      // Small simulated coordinate delta
      const driftLat = (Math.random() - 0.48) * 0.0003 * this.speedMultiplier;
      const driftLng = (Math.random() - 0.48) * 0.0003 * this.speedMultiplier;

      v.lat += driftLat;
      v.lng += driftLng;

      if (v.etaSeconds > 10) {
        v.etaSeconds = Math.max(10, v.etaSeconds - deltaSeconds);
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

  public getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }
}

export const transitSimulator = new TransitSimulator();
