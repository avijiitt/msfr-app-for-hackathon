/**
 * Trip History & Database Recording Service
 * Records journeys in Supabase database & local offline storage
 */

import { supabase, isSupabaseConfigured, authService } from './supabaseClient';

export interface TripRecord {
  id: string;
  user_id?: string;
  origin: string;
  destination: string;
  origin_lat?: number;
  origin_lng?: number;
  dest_lat?: number;
  dest_lng?: number;
  distance_km: number;
  duration_mins: number;
  fare_amount: number;
  mode: string;
  route_name: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  booking_reference: string;
  co2_saved_kg: number;
  created_at: string;
}

const STORAGE_KEY = 'musafir_trip_history';

// Initial pre-loaded realistic trips for rich initial view
const INITIAL_TRIPS: TripRecord[] = [
  {
    id: 'trip-rec-1',
    origin: 'Jayadev Vihar Square',
    destination: 'KIIT Square, Patia',
    origin_lat: 20.3039,
    origin_lng: 85.8188,
    dest_lat: 20.3541,
    dest_lng: 85.8175,
    distance_km: 7.8,
    duration_mins: 22,
    fare_amount: 25,
    mode: 'bus',
    route_name: 'Route 101 AC Express',
    status: 'completed',
    booking_reference: 'MSFR-OD-94821',
    co2_saved_kg: 1.4,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'trip-rec-2',
    origin: 'Master Canteen Station',
    destination: 'Infocity IT Park',
    origin_lat: 20.2668,
    origin_lng: 85.8436,
    dest_lat: 20.3602,
    dest_lng: 85.8035,
    distance_km: 12.4,
    duration_mins: 34,
    fare_amount: 40,
    mode: 'metro',
    route_name: 'Blue Line Rapid Corridor',
    status: 'completed',
    booking_reference: 'MSFR-OD-61902',
    co2_saved_kg: 2.1,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

class TripService {
  private trips: TripRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.trips = JSON.parse(stored);
      } else {
        this.trips = INITIAL_TRIPS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
      }
    } catch {
      this.trips = INITIAL_TRIPS;
    }
  }

  public getTrips(): TripRecord[] {
    return [...this.trips];
  }

  public clearTrips(): void {
    this.trips = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Save a new trip to Supabase Cloud Database and local storage
   */
  public async recordTrip(tripData: {
    origin: string;
    destination: string;
    originCoords?: [number, number] | null;
    destCoords?: [number, number] | null;
    distanceKm?: number;
    durationMins?: number;
    fareAmount?: number;
    mode?: string;
    routeName?: string;
    status?: 'completed' | 'in_progress' | 'scheduled';
  }): Promise<TripRecord> {
    const user = authService.getCurrentUser();
    const tripId = `trip-${Date.now()}`;
    const refCode = `MSFR-IN-${Math.floor(10000 + Math.random() * 90000)}`;
    const dist = tripData.distanceKm || 8.5;
    const dur = tripData.durationMins || 25;
    const fare = tripData.fareAmount || 30;

    const newTrip: TripRecord = {
      id: tripId,
      user_id: user?.id,
      origin: tripData.origin,
      destination: tripData.destination,
      origin_lat: tripData.originCoords ? tripData.originCoords[0] : undefined,
      origin_lng: tripData.originCoords ? tripData.originCoords[1] : undefined,
      dest_lat: tripData.destCoords ? tripData.destCoords[0] : undefined,
      dest_lng: tripData.destCoords ? tripData.destCoords[1] : undefined,
      distance_km: dist,
      duration_mins: dur,
      fare_amount: fare,
      mode: tripData.mode || 'bus',
      route_name: tripData.routeName || 'Smart Transit Corridor',
      status: tripData.status || 'completed',
      booking_reference: refCode,
      co2_saved_kg: Math.round(dist * 0.16 * 10) / 10,
      created_at: new Date().toISOString(),
    };

    // 1. Save locally
    this.trips.unshift(newTrip);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trips));
    } catch {}

    // 2. Save to Supabase DB if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('trips').insert([
          {
            id: newTrip.id,
            user_id: newTrip.user_id,
            origin: newTrip.origin,
            destination: newTrip.destination,
            distance_km: newTrip.distance_km,
            duration_mins: newTrip.duration_mins,
            fare_amount: newTrip.fare_amount,
            mode: newTrip.mode,
            route_name: newTrip.route_name,
            status: newTrip.status,
            booking_reference: newTrip.booking_reference,
            created_at: newTrip.created_at,
          },
        ]);
      } catch (err) {
        console.warn('Supabase trip insert fallback to local:', err);
      }
    }

    return newTrip;
  }

  /**
   * Fetch user's latest trip history from Supabase or local storage
   */
  public async fetchUserTrips(): Promise<TripRecord[]> {
    const user = authService.getCurrentUser();
    if (supabase && isSupabaseConfigured() && user?.id) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          this.trips = data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      } catch {}
    }
    return this.getTrips();
  }
}

export const tripService = new TripService();
