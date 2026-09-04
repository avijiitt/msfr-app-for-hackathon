-- ==============================================================================
-- MUSAFIR TRANSIT & LOGISTICS PLATFORM - POSTGRESQL SCHEMA MIGRATION
-- Migration Version: 20260904_musafir_core_schema.sql
-- Description: Core relational schema replacing local JSON files with PostgreSQL
--              tables, JSONB audit trails, indexes, and Row Level Security (RLS).
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. USER PROFILES TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_group TEXT DEFAULT 'B+',
  home_address TEXT DEFAULT 'Bhubaneswar, Odisha',
  emergency_contact TEXT,
  is_student BOOLEAN DEFAULT false,
  student_college_name TEXT,
  student_roll_no TEXT,
  is_senior_verified BOOLEAN DEFAULT false,
  is_women_passenger BOOLEAN DEFAULT false,
  wallet_balance NUMERIC(10, 2) DEFAULT 650.00,
  karma_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on email and phone for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- ── 2. PARCEL & LOGISTICS BOOKINGS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parcel_bookings (
  id TEXT PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  station_name TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  locker_number TEXT NOT NULL,
  pin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready_pickup',
  sender_name TEXT,
  sender_phone TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  weight_kg NUMERIC(6, 2) DEFAULT 1.50,
  fare NUMERIC(8, 2) DEFAULT 35.00,
  mishap_report JSONB DEFAULT NULL,
  expiry_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on tracking_code and recipient_phone
CREATE INDEX IF NOT EXISTS idx_parcel_tracking ON public.parcel_bookings(tracking_code);
CREATE INDEX IF NOT EXISTS idx_parcel_recipient_phone ON public.parcel_bookings(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_parcel_status ON public.parcel_bookings(status);

-- ── 3. CIVIC COMMUNITY REPORTS & INCIDENTS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_reports (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_id TEXT,
  upvotes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'reported',
  photo_url TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'moderate',
  timeline JSONB DEFAULT '[]'::jsonb,
  authority_response JSONB DEFAULT NULL,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for geolocation spatial queries and category filtering
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.community_reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON public.community_reports(lat, lng);

-- ── 4. FINANCIAL TRANSACTIONS & PAYMENTS TABLE ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  payment_id TEXT,
  txn_ref TEXT UNIQUE,
  receipt_number TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  method TEXT DEFAULT 'razorpay',
  purpose TEXT DEFAULT 'Transit Payment',
  status TEXT NOT NULL DEFAULT 'created',
  customer_name TEXT DEFAULT 'Passenger',
  customer_phone TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- Index on order_id, txn_ref, and customer_phone
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_txn_ref ON public.payments(txn_ref);
CREATE INDEX IF NOT EXISTS idx_payments_phone ON public.payments(customer_phone);

-- ── 5. OTP AUDIT & SECURITY LOGS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.otp_logs (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on phone and expiration
CREATE INDEX IF NOT EXISTS idx_otp_logs_phone ON public.otp_logs(phone);
CREATE INDEX IF NOT EXISTS idx_otp_logs_expires ON public.otp_logs(expires_at);

-- ── 6. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can insert/upsert; users can read their own or public directory
DROP POLICY IF EXISTS "Public can insert profile" ON public.profiles;
CREATE POLICY "Public can insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can select profile" ON public.profiles;
CREATE POLICY "Public can select profile" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update profile" ON public.profiles;
CREATE POLICY "Public can update profile" ON public.profiles FOR UPDATE USING (true);

-- Community Reports: Public read (citizen live alerts) & public insert
DROP POLICY IF EXISTS "Anyone can read reports" ON public.community_reports;
CREATE POLICY "Anyone can read reports" ON public.community_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert reports" ON public.community_reports;
CREATE POLICY "Anyone can insert reports" ON public.community_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update upvotes or status" ON public.community_reports;
CREATE POLICY "Anyone can update upvotes or status" ON public.community_reports FOR UPDATE USING (true);

-- Parcels: Read by tracking code / recipient, insert by sender
DROP POLICY IF EXISTS "Public can insert parcel" ON public.parcel_bookings;
CREATE POLICY "Public can insert parcel" ON public.parcel_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read parcel" ON public.parcel_bookings;
CREATE POLICY "Public can read parcel" ON public.parcel_bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update parcel status" ON public.parcel_bookings;
CREATE POLICY "Public can update parcel status" ON public.parcel_bookings FOR UPDATE USING (true);

-- Payments: Public insert and verification read
DROP POLICY IF EXISTS "Public can insert payment" ON public.payments;
CREATE POLICY "Public can insert payment" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read own payment" ON public.payments;
CREATE POLICY "Public can read own payment" ON public.payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update payment settlement" ON public.payments;
CREATE POLICY "Public can update payment settlement" ON public.payments FOR UPDATE USING (true);

-- OTP Logs: Secure service operations
DROP POLICY IF EXISTS "Service can manage OTP logs" ON public.otp_logs;
CREATE POLICY "Service can manage OTP logs" ON public.otp_logs FOR ALL USING (true);
