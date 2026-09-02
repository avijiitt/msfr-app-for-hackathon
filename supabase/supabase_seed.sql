-- ============================================================================
-- MUSAFIR DEMO SEED DATA SCRIPT FOR SUPABASE
-- Run this in Supabase SQL Editor to populate sample users, trips, and reports
-- ============================================================================

-- 1. Insert Sample User Profiles (If not existing)
insert into public.profiles (
  id, email, full_name, phone, avatar_url, home_address, work_address, blood_group, is_student, student_college_name, student_roll_no, civic_karma_points
) values 
  (
    '81f77c46-d4a8-4806-8987-cba1c6181a2a',
    'abhijitsatapathy44@gmail.com',
    'Abhijit Satapathy',
    '+91 98765 43210',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Abhijit',
    'Jayadev Vihar, Bhubaneswar',
    'Infocity IT Park',
    'O+',
    false,
    null,
    null,
    145
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'priya.patra@kiit.ac.in',
    'Priya Patra',
    '+91 94371 88219',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Priya',
    'Patia Square, Bhubaneswar',
    'KIIT Campus 6',
    'B+',
    true,
    'KIIT University',
    '21051982',
    210
  ),
  (
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'rohan.mohanty@tcs.com',
    'Rohan Mohanty',
    '+91 70081 23456',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Rohan',
    'Saheed Nagar, Bhubaneswar',
    'DLF Cybercity',
    'A+',
    false,
    null,
    null,
    80
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  civic_karma_points = excluded.civic_karma_points;

-- 2. Insert Sample Trips
insert into public.trips (
  booking_reference, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, distance_km, duration_mins, fare_amount, mode, route_name, status, co2_saved_grams
) values 
  ('MSFR-OD-94821', 'Jayadev Vihar Square', 'KIIT Square, Patia', 20.3039, 85.8188, 20.3541, 85.8175, 7.8, 22, 25.00, 'bus', 'Route 101 AC Express', 'completed', 1400),
  ('MSFR-OD-61902', 'Master Canteen Station', 'Infocity IT Park', 20.2668, 85.8436, 20.3602, 85.8035, 12.4, 34, 40.00, 'metro', 'Blue Line Rapid Corridor', 'completed', 2100),
  ('MSFR-OD-33109', 'Khandagiri Caves', 'Biju Patnaik Airport', 20.2586, 85.7865, 20.2525, 85.8178, 6.2, 18, 20.00, 'bus', 'Route 11 Green EV Line', 'completed', 980)
on conflict (booking_reference) do nothing;

-- 3. Insert Sample Civic Reports
insert into public.community_reports (
  title, description, category, location_name, lat, lng, severity, status, upvotes, verified, authority_response
) values 
  (
    'Extreme Overcrowding during Evening Rush',
    'Route 10 Mo Bus completely packed with 40+ waiting commuters at Jayadev Vihar stop. Additional standby bus needed.',
    'overcrowding',
    'Jayadev Vihar Square',
    20.3039,
    85.8188,
    'high',
    'investigating',
    18,
    true,
    'CRUT Control Room has assigned Extra Standby EV Bus #OD-02-B-4921.'
  ),
  (
    'Non-functional Streetlights near Bus Bay',
    'Dark corridor after 7:30 PM near the women seating shelter on Janpath.',
    'lighting',
    'Janpath Master Canteen',
    20.2668,
    85.8436,
    'medium',
    'resolved',
    24,
    true,
    'BMC Electrical Dept replaced LED fixtures and restored lighting.'
  )
on conflict do nothing;
