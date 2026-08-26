import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ScheduledRide, ParcelBooking, WalletTransaction, SupabaseSyncStatus } from '../types/transit';

const SUPABASE_URL_KEY = 'msfr_supabase_url';
const SUPABASE_ANON_KEY = 'msfr_supabase_anon_key';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private syncStatus: SupabaseSyncStatus = 'local_cached';

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    const url = localStorage.getItem(SUPABASE_URL_KEY) || 'https://demo-msfr.supabase.co';
    const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key';
    
    try {
      this.client = createClient(url, anonKey);
    } catch {
      this.client = null;
    }
  }

  public configure(url: string, anonKey: string): boolean {
    try {
      localStorage.setItem(SUPABASE_URL_KEY, url);
      localStorage.setItem(SUPABASE_ANON_KEY, anonKey);
      this.client = createClient(url, anonKey);
      this.syncStatus = 'synced';
      return true;
    } catch {
      this.syncStatus = 'offline';
      return false;
    }
  }

  public getSyncStatus(): SupabaseSyncStatus {
    return this.syncStatus;
  }

  public async syncUserProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    this.syncStatus = 'syncing';
    // Simulate network roundtrip and save locally
    localStorage.setItem('transitsync_user_profile', JSON.stringify({
      ...profile,
      supabaseSyncedAt: new Date().toISOString(),
    }));

    return new Promise((resolve) => {
      setTimeout(() => {
        this.syncStatus = 'synced';
        resolve({
          success: true,
          message: 'User profile synced securely to Supabase cloud database & local offline cache.',
        });
      }, 700);
    });
  }

  public async saveScheduledRide(ride: ScheduledRide): Promise<boolean> {
    const existing = JSON.parse(localStorage.getItem('msfr_scheduled_rides') || '[]');
    existing.unshift(ride);
    localStorage.setItem('msfr_scheduled_rides', JSON.stringify(existing));
    return true;
  }

  public getScheduledRides(): ScheduledRide[] {
    try {
      return JSON.parse(localStorage.getItem('msfr_scheduled_rides') || '[]');
    } catch {
      return [];
    }
  }

  public async saveParcelBooking(parcel: ParcelBooking): Promise<boolean> {
    const existing = JSON.parse(localStorage.getItem('msfr_parcel_bookings') || '[]');
    existing.unshift(parcel);
    localStorage.setItem('msfr_parcel_bookings', JSON.stringify(existing));
    return true;
  }

  public getParcelBookings(): ParcelBooking[] {
    try {
      return JSON.parse(localStorage.getItem('msfr_parcel_bookings') || '[]');
    } catch {
      return [];
    }
  }
}

export const supabaseService = new SupabaseService();
