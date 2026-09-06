import { getHumanReadableLocationName } from '../data/cities/bhubaneswar';

export interface LiveLocationData {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  address?: string;
}

type LocationCallback = (location: LiveLocationData) => void;
type ErrorCallback = (error: string) => void;

class GeolocationService {
  private watchId: number | null = null;
  private currentLocation: LiveLocationData | null = null;
  private isTracking = false;
  private listeners: LocationCallback[] = [];

  public getLocation(): LiveLocationData | null {
    return this.currentLocation ? { ...this.currentLocation } : null;
  }

  public isTrackingActive(): boolean {
    return this.isTracking;
  }

  public subscribe(callback: LocationCallback): () => void {
    this.listeners.push(callback);
    if (this.currentLocation) {
      callback(this.currentLocation);
    }
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public async getCurrentLivePosition(): Promise<LiveLocationData | null> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.updatePosition(pos);
          resolve(this.currentLocation);
        },
        (err) => {
          console.warn('Geolocation direct fetch error:', err.message);
          // Return null on failure instead of spoofing a fake location
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  public startLiveTracking(onError?: ErrorCallback): void {
    if (!('geolocation' in navigator)) {
      if (onError) onError('Geolocation is not supported by your browser.');
      return;
    }

    this.isTracking = true;

    // First get one immediate position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.updatePosition(pos);
      },
      (err) => {
        console.warn('Initial geolocation failed, falling back to simulated Indian GPS:', err.message);
        if (onError) onError(err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Then continuously watch position
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.updatePosition(pos);
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        if (onError) onError(err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  public stopLiveTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  public setCustomLocation(lat: number, lng: number, addressName = 'Custom Pinned Location, India'): LiveLocationData {
    const validLat = Number.isFinite(lat) ? lat : 20.2961;
    const validLng = Number.isFinite(lng) ? lng : 85.8245;
    this.currentLocation = {
      lat: validLat,
      lng: validLng,
      accuracy: 5,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      address: addressName,
    };
    this.notifyListeners();
    return { ...this.currentLocation };
  }

  private updatePosition(pos: GeolocationPosition): void {
    if (!pos || !pos.coords) return;
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Number.isNaN(lat) || Number.isNaN(lng)) {
      console.warn('Ignoring invalid GeolocationPosition with non-finite coords:', lat, lng);
      return;
    }
    const readable = getHumanReadableLocationName(lat, lng);
    const accuracy = Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : 15;
    this.currentLocation = {
      lat,
      lng,
      accuracy: Math.max(5, accuracy),
      heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null,
      speed: Number.isFinite(pos.coords.speed) && pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : null,
      timestamp: pos.timestamp || Date.now(),
      address: `Current Location (${readable.replace('Pinned Location ', '')})`,
    };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    if (!this.currentLocation) return;
    for (const cb of this.listeners) {
      cb(this.currentLocation);
    }
  }
}

export const geolocationService = new GeolocationService();
