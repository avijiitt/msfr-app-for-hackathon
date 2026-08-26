import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if real credentials are configured
export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your-project-id') &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes('your-anon-key');

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };

// ─── Auth Service ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    if (supabase) {
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          this.currentUser = this.mapUser(session.user);
        } else {
          this.currentUser = null;
        }
        this.listeners.forEach(fn => fn(this.currentUser));
      });

      // Load initial session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          this.currentUser = this.mapUser(data.session.user);
          this.listeners.forEach(fn => fn(this.currentUser));
        }
      });
    } else {
      // Demo mode — load from localStorage
      const stored = localStorage.getItem('musafir_demo_user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch {}
      }
    }
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Traveller',
      avatarUrl: user.user_metadata?.avatar_url,
    };
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(fn: (user: AuthUser | null) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  // ── Email + Password Sign Up ──────────────────────────────────────────────
  public async signUpWithEmail(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.demoSignIn(email, fullName);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Sign-up failed. Try again.' };

    // Create user profile in DB
    await supabase.from('user_profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      wallet_balance: 0,
      musafir_coins: 0,
    });

    return { success: true, user: this.mapUser(data.user) };
  }

  // ── Email + Password Sign In ──────────────────────────────────────────────
  public async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.demoSignIn(email, email.split('@')[0]);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Sign-in failed.' };

    return { success: true, user: this.mapUser(data.user) };
  }

  // ── Google OAuth Sign In ──────────────────────────────────────────────────
  public async signInWithGoogle(): Promise<AuthResult> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.demoSignIn('google@demo.com', 'Google User');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // ── Sign Out ───────────────────────────────────────────────────────────────
  public async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem('musafir_demo_user');
    this.listeners.forEach(fn => fn(null));
  }

  // ── Update Profile ─────────────────────────────────────────────────────────
  public async updateProfile(updates: Partial<{
    full_name: string;
    phone: string;
    blood_group: string;
    emergency_contact: string;
    emergency_name: string;
    preferred_language: string;
  }>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) return { success: false, error: 'Not logged in.' };

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', this.currentUser.id);

      if (error) return { success: false, error: error.message };
    }

    // Update local state
    if (updates.full_name) {
      this.currentUser.fullName = updates.full_name;
    }

    return { success: true };
  }

  // ── Demo Mode (when Supabase not configured yet) ───────────────────────────
  private demoSignIn(email: string, name: string): AuthResult {
    const user: AuthUser = {
      id: 'demo-' + Date.now(),
      email,
      fullName: name,
    };
    this.currentUser = user;
    localStorage.setItem('musafir_demo_user', JSON.stringify(user));
    this.listeners.forEach(fn => fn(user));
    return { success: true, user };
  }
}

export const authService = new AuthService();

// ─── Supabase DB Service (kept for backward compat) ───────────────────────────
import { ScheduledRide, ParcelBooking } from '../types/transit';

class SupabaseService {
  public async saveScheduledRide(ride: ScheduledRide): Promise<boolean> {
    const existing = JSON.parse(localStorage.getItem('msfr_scheduled_rides') || '[]');
    existing.unshift(ride);
    localStorage.setItem('msfr_scheduled_rides', JSON.stringify(existing));

    if (supabase && isSupabaseConfigured() && authService.getCurrentUser()) {
      await supabase.from('scheduled_rides').upsert({ ...ride, user_id: authService.getCurrentUser()!.id });
    }
    return true;
  }

  public getScheduledRides(): ScheduledRide[] {
    try { return JSON.parse(localStorage.getItem('msfr_scheduled_rides') || '[]'); }
    catch { return []; }
  }

  public async saveParcelBooking(parcel: ParcelBooking): Promise<boolean> {
    const existing = JSON.parse(localStorage.getItem('msfr_parcel_bookings') || '[]');
    existing.unshift(parcel);
    localStorage.setItem('msfr_parcel_bookings', JSON.stringify(existing));
    return true;
  }

  public getParcelBookings(): ParcelBooking[] {
    try { return JSON.parse(localStorage.getItem('msfr_parcel_bookings') || '[]'); }
    catch { return []; }
  }
}

export const supabaseService = new SupabaseService();
