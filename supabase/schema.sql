-- ============================================================================
-- MUSAFIR — PAN-INDIA MULTI-MODAL SMART TRANSIT DATABASE SCHEMA (SUPABASE)
-- ============================================================================

-- 1. Enable PostGIS and UUID Extensions if available
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Synced with Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  home_address text,
  work_address text,
  blood_group text check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  medical_notes text default '',
  allergies text default '',
  is_student boolean default false,
  student_roll_no text,
  student_college_name text,
  student_verified_at timestamptz,
  student_valid_until text,
  student_method text default 'none',
  is_senior_verified boolean default false,
  is_women_passenger boolean default false,
  family_share_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Emergency Contacts Table
create table if not exists public.emergency_contacts (
  id text primary key default ('ec-' || extract(epoch from now())::bigint),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  relation text default 'Family',
  created_at timestamptz default now()
);

-- 4. Trips & Journeys Table (Live & Completed)
create table if not exists public.trips (
  id text primary key default ('TRP-' || floor(100000 + random() * 900000)::text),
  user_id uuid references auth.users(id) on delete set null,
  booking_reference text unique not null,
  origin text not null,
  destination text not null,
  origin_lat numeric,
  origin_lng numeric,
  dest_lat numeric,
  dest_lng numeric,
  distance_km numeric default 0,
  duration_mins integer default 0,
  fare_amount numeric default 0,
  mode text check (mode in ('bus', 'metro', 'auto', 'cab', 'walk', 'multimodal')) default 'bus',
  route_name text default 'Smart Transit Corridor',
  status text check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'refunded')) default 'completed',
  co2_saved_grams numeric default 0,
  created_at timestamptz default now()
);

-- 5. Transit Parcel Lockers Table
create table if not exists public.parcels (
  id text primary key default ('PKL-' || floor(1000 + random() * 9000)::text),
  user_id uuid references auth.users(id) on delete set null,
  tracking_code text unique not null,
  sender_name text not null,
  sender_phone text not null,
  recipient_name text not null,
  recipient_phone text not null,
  station_name text not null,
  destination_station text,
  locker_number text not null,
  pin text not null,
  status text check (status in ('booked', 'in_transit', 'ready_pickup', 'delivered', 'expired')) default 'ready_pickup',
  weight_kg numeric default 1.0,
  fare numeric default 35.0,
  created_at timestamptz default now(),
  expiry_time timestamptz default (now() + interval '48 hours')
);

-- 6. Mo-Wallet Transactions Table
create table if not exists public.wallet_transactions (
  id text primary key default ('tx-' || extract(epoch from now())::bigint || '-' || floor(random()*1000)::text),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  type text check (type in ('topup', 'fare_debit', 'pass_purchase', 'refund')) not null,
  title text not null,
  balance_after numeric not null,
  status text check (status in ('success', 'pending', 'failed')) default 'success',
  route_or_method text default 'UPI / Google Pay',
  created_at timestamptz default now()
);

-- 7. Transit Digital Passes Table
create table if not exists public.transit_passes (
  id text primary key default ('PAS-' || floor(1000 + random() * 9000)::text),
  user_id uuid references auth.users(id) on delete cascade,
  pass_code text unique not null,
  type text check (type in ('student', 'senior', 'daily', 'women_pink', 'standard')) not null,
  title text not null,
  valid_until text not null,
  qr_payload text not null,
  passenger_name text not null,
  discount_percentage integer default 0,
  status text default 'active',
  created_at timestamptz default now()
);

-- 8. Scheduled Automated Rides Table
create table if not exists public.scheduled_rides (
  id text primary key default ('SCH-' || floor(1000 + random() * 9000)::text),
  user_id uuid references auth.users(id) on delete cascade,
  origin_station_name text not null,
  dest_station_name text not null,
  ride_date text not null,
  ride_time text not null,
  is_recurring boolean default false,
  recurring_days text[],
  route_title text not null,
  estimated_fare numeric default 20,
  notification_minutes_before integer default 15,
  status text check (status in ('active', 'completed', 'cancelled')) default 'active',
  created_at timestamptz default now()
);

-- 9. Customer Support & Lost and Found Tickets
create table if not exists public.support_tickets (
  id text primary key default ('TCK-' || floor(1000 + random() * 9000)::text),
  user_id uuid references auth.users(id) on delete set null,
  category text check (category in ('lost_found', 'fare_dispute', 'delay', 'staff_behavior', 'accessibility', 'general')) not null,
  subject text not null,
  description text not null,
  status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  resolution_notes text,
  created_at timestamptz default now()
);

-- 10. Emergency SOS Logs Table
create table if not exists public.emergency_sos_logs (
  id text primary key default ('SOS-' || floor(10000 + random() * 90000)::text),
  user_id uuid references auth.users(id) on delete set null,
  lat numeric not null,
  lng numeric not null,
  nearest_landmark text,
  helplines_notified text[],
  status text check (status in ('triggered', 'acknowledged', 'resolved', 'cancelled')) default 'triggered',
  created_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.trips enable row level security;
alter table public.parcels enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.transit_passes enable row level security;
alter table public.scheduled_rides enable row level security;
alter table public.support_tickets enable row level security;
alter table public.emergency_sos_logs enable row level security;

-- Public Profiles Policy
create policy "Users can view and manage their own profile"
  on public.profiles for all
  using (auth.uid() = id or auth.uid() is null)
  with check (auth.uid() = id or auth.uid() is null);

-- Trips Policy
create policy "Users can view and insert their own trips"
  on public.trips for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Emergency Contacts Policy
create policy "Users can manage emergency contacts"
  on public.emergency_contacts for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Parcels Policy
create policy "Users can manage parcels"
  on public.parcels for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Wallet Policy
create policy "Users can view their wallet transactions"
  on public.wallet_transactions for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Passes Policy
create policy "Users can view and claim passes"
  on public.transit_passes for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Scheduled Rides Policy
create policy "Users can view and manage scheduled rides"
  on public.scheduled_rides for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- Support Tickets Policy
create policy "Users can view and submit support tickets"
  on public.support_tickets for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- SOS Logs Policy
create policy "Users can view and trigger SOS"
  on public.emergency_sos_logs for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);
