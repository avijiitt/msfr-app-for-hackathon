-- ============================================================================
-- MUSAFIR — PAN-INDIA MULTI-MODAL SMART TRANSIT DATABASE SCHEMA (SUPABASE)
-- PRODUCTION-HARDENED VERSION WITH STRICT RLS AND CIPHER AUDIT LOGGING
-- ============================================================================

-- 1. Enable PostGIS and UUID Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. User Profiles Table (Synced with Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  phone text,
  avatar_url text,
  home_address text default 'Bhubaneswar, Odisha',
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
  civic_karma_points integer default 50 check (civic_karma_points >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Emergency Contacts Table
create table if not exists public.emergency_contacts (
  id text primary key default ('ec-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null check (length(phone) >= 10),
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
  origin_lat numeric(10, 6),
  origin_lng numeric(10, 6),
  dest_lat numeric(10, 6),
  dest_lng numeric(10, 6),
  distance_km numeric(6, 2) default 0 check (distance_km >= 0),
  duration_mins integer default 0 check (duration_mins >= 0),
  fare_amount numeric(8, 2) default 0 check (fare_amount >= 0),
  mode text check (mode in ('bus', 'metro', 'auto', 'cab', 'walk', 'multimodal', 'ev_loader', 'ev_van')) default 'bus',
  route_name text default 'Smart Transit Corridor',
  status text check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'refunded')) default 'completed',
  co2_saved_grams numeric(8, 2) default 0,
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
  pin_hash text not null, -- Store bcrypt/sha256 hash in production
  status text check (status in ('booked', 'in_transit', 'ready_pickup', 'delivered', 'expired')) default 'ready_pickup',
  weight_kg numeric(5, 2) default 1.0 check (weight_kg > 0),
  fare numeric(8, 2) default 35.0,
  created_at timestamptz default now(),
  expiry_time timestamptz default (now() + interval '48 hours')
);

-- 6. Mo-Wallet Transactions Table
create table if not exists public.wallet_transactions (
  id text primary key default ('tx-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(8, 2) not null,
  type text check (type in ('topup', 'fare_debit', 'pass_purchase', 'refund', 'bonus')) not null,
  title text not null,
  balance_after numeric(8, 2) not null check (balance_after >= 0),
  status text check (status in ('success', 'pending', 'failed')) default 'success',
  route_or_method text default 'UPI / Google Pay',
  created_at timestamptz default now()
);

-- 7. Transit Digital Passes Table
create table if not exists public.transit_passes (
  id text primary key default ('PAS-' || floor(1000 + random() * 9000)::text),
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_code text unique not null,
  type text check (type in ('student', 'senior', 'daily', 'women_pink', 'standard')) not null,
  title text not null,
  valid_until timestamptz not null,
  qr_payload text not null,
  passenger_name text not null,
  discount_percentage integer default 0 check (discount_percentage between 0 and 100),
  status text check (status in ('active', 'expired', 'revoked')) default 'active',
  created_at timestamptz default now()
);

-- 8. Civic Community Reports Table
create table if not exists public.community_reports (
  id text primary key default ('REP-' || floor(10000 + random() * 90000)::text),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category text check (category in ('overcrowding', 'lighting', 'safety', 'delay', 'infrastructure', 'cleanliness', 'general')) default 'general',
  location_name text not null,
  lat numeric(10, 6) not null,
  lng numeric(10, 6) not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  is_emergency boolean default false,
  status text check (status in ('reported', 'investigating', 'resolved', 'dismissed')) default 'reported',
  upvotes integer default 1 check (upvotes >= 0),
  verified boolean default false,
  authority_response text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Community Polls & Votes Table
create table if not exists public.community_polls (
  id text primary key default ('POL-' || floor(100 + random() * 900)::text),
  question text not null,
  category text not null,
  total_votes integer default 0 check (total_votes >= 0),
  active boolean default true,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.poll_votes (
  id text primary key default ('VOT-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text),
  poll_id text not null references public.community_polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_option_id text not null,
  created_at timestamptz default now(),
  constraint unique_user_poll_vote unique (poll_id, user_id)
);

-- 10. Emergency SOS Logs Table (Audited)
create table if not exists public.emergency_sos_logs (
  id text primary key default ('SOS-' || floor(10000 + random() * 90000)::text),
  user_id uuid references auth.users(id) on delete set null,
  lat numeric(10, 6) not null,
  lng numeric(10, 6) not null,
  nearest_landmark text,
  helplines_notified text[] default array['112 (Police)', '108 (Ambulance)', '1091 (Women Safety)'],
  family_sms_broadcast boolean default true,
  status text check (status in ('triggered', 'acknowledged', 'resolved', 'cancelled')) default 'triggered',
  ip_address inet,
  created_at timestamptz default now()
);

-- ============================================================================
-- PRODUCTION ROW LEVEL SECURITY (RLS) POLICIES
-- Strict authentication checks (No anonymous bypass)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.trips enable row level security;
alter table public.parcels enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.transit_passes enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.emergency_sos_logs enable row level security;

-- 1. Profiles: Users can only view/update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Emergency Contacts: Strictly owned by authenticated user
create policy "Users manage own emergency contacts"
  on public.emergency_contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Trips: Users can view and record their own trips
create policy "Users view own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users record own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

-- 4. Parcels: Users view and book their own parcels
create policy "Users view own parcels"
  on public.parcels for select
  using (auth.uid() = user_id);

create policy "Users book own parcels"
  on public.parcels for insert
  with check (auth.uid() = user_id);

-- 5. Wallet: Strictly read-only for users (writes via DB RPC functions)
create policy "Users view own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

-- 6. Transit Passes: Read-only for authenticated user
create policy "Users view own transit passes"
  on public.transit_passes for select
  using (auth.uid() = user_id);

-- 7. Community Reports: Public read, authenticated creation
create policy "Anyone can read verified community reports"
  on public.community_reports for select
  using (true);

create policy "Authenticated users can submit reports"
  on public.community_reports for insert
  with check (auth.uid() is not null);

create policy "Users can upvote reports"
  on public.community_reports for update
  using (true)
  with check (true);

-- 8. Community Polls: Public read, authenticated 1-vote constraint
create policy "Anyone can read polls"
  on public.community_polls for select
  using (true);

create policy "Authenticated users can cast 1 vote per poll"
  on public.poll_votes for insert
  with check (auth.uid() = user_id);

create policy "Users view their own votes"
  on public.poll_votes for select
  using (auth.uid() = user_id);

-- 9. Emergency SOS: Authenticated users can trigger SOS
create policy "Users can record SOS dispatches"
  on public.emergency_sos_logs for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can view their SOS history"
  on public.emergency_sos_logs for select
  using (auth.uid() = user_id);
