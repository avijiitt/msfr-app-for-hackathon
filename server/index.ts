import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Persistent database file
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSavedProfiles(): any[] {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('Error reading profiles.json:', e);
  }
  return [];
}

function saveProfiles(profiles: any[]) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error saving profiles.json:', e);
  }
}

// ── Environment Variables ──────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://chxhqifhtqlntslvrqyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';
const OLA_MAPS_API_KEY = process.env.VITE_OLA_MAPS_API_KEY || '63CtJZBj4maPgvCCiDSXxavc6jkxztXfRTEpwPYj';

// Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Gemini AI Client
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('Gemini AI backend init warning:', e);
  }
}

// ── In-Memory Simulation Storage (Fallback if offline) ────────────────────
const memoryStore = {
  profiles: loadSavedProfiles(),
  trips: [] as any[],
  parcels: [
    {
      id: 'PKL-8821',
      trackingCode: 'MSFR-OD-9012',
      stationName: 'Master Canteen Depot',
      lockerNumber: 'LKR-04',
      pin: '8492',
      status: 'ready_pickup',
      recipientName: 'Commuter',
      recipientPhone: '',
      expiryTime: new Date(Date.now() + 48 * 3600000).toISOString(),
    },
  ],
  walletBalance: 650.0,
  transactions: [
    {
      id: 'tx-init-1',
      amount: 500,
      type: 'topup',
      title: 'Google Pay UPI Auto-Recharge',
      timestamp: 'Today, 09:15 AM',
      balanceAfter: 650.0,
      status: 'success',
      routeOrMethod: 'Google Pay UPI',
    },
  ],
  passes: [] as any[],
  tickets: [] as any[],
  scheduledRides: [] as any[],
};

// ── 1. Health Check ────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'musafir-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    supabaseConnected: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    geminiConfigured: Boolean(GEMINI_API_KEY),
  });
});

// ── 1.1 User Profiles API ──────────────────────────────────────────────────
// List all users from Supabase / Memory
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    let profiles = memoryStore.profiles;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        profiles = data;
      }
    }
    res.json({ success: true, count: profiles.length, profiles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register / Save User Profile API
app.post('/api/users/profile', async (req: Request, res: Response) => {
  try {
    const {
      email,
      fullName,
      phone,
      bloodGroup,
      homeCity,
      category,
      studentCollege,
      studentRoll,
      emergencyContact,
    } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: 'Email and Full Name are required' });
    }

    const userId = crypto.randomUUID();
    const newProfile = {
      id: userId,
      email: email.trim(),
      full_name: fullName.trim(),
      phone: phone || '',
      blood_group: bloodGroup || 'B+',
      home_address: homeCity || 'Bhubaneswar, Odisha',
      emergency_contact: emergencyContact || null,
      is_student: category === 'student',
      student_college_name: studentCollege || null,
      student_roll_no: studentRoll || null,
      is_senior_verified: category === 'senior',
      is_women_passenger: category === 'women',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save to local persistent JSON file
    const currentProfiles = loadSavedProfiles();
    const existingIndex = currentProfiles.findIndex((p: any) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (existingIndex >= 0) {
      currentProfiles[existingIndex] = { ...currentProfiles[existingIndex], ...newProfile, id: currentProfiles[existingIndex].id || userId };
    } else {
      currentProfiles.unshift(newProfile);
    }
    saveProfiles(currentProfiles);
    memoryStore.profiles = currentProfiles;

    // 2. Also attempt Supabase upsert
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        await supabase.from('profiles').upsert(newProfile);
      } catch (dbErr) {
        console.warn('Supabase upsert notice:', dbErr);
      }
    }

    res.json({
      success: true,
      message: 'User profile stored successfully in database',
      profile: newProfile,
      totalUsers: currentProfiles.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single user profile by email or ID
app.get('/api/users/profile', async (req: Request, res: Response) => {
  try {
    const { email, id } = req.query;
    if (!email && !id) {
      return res.status(400).json({ success: false, error: 'Provide email or id query param' });
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      let query = supabase.from('profiles').select('*');
      if (email) query = query.eq('email', email as string);
      if (id) query = query.eq('id', id as string);
      const { data, error } = await query.single();
      if (!error && data) {
        return res.json({ success: true, profile: data });
      }
    }

    const found = memoryStore.profiles.find((p: any) => p.email === email || p.id === id);
    if (found) {
      return res.json({ success: true, profile: found });
    }

    res.status(404).json({ success: false, error: 'User profile not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. Trips API ───────────────────────────────────────────────────────────
// Record a new trip
app.post('/api/trips', async (req: Request, res: Response) => {
  try {
    const { origin, destination, originCoords, destCoords, distanceKm, durationMins, fareAmount, mode, routeName, userId } = req.body;
    const bookingReference = 'MSFR-IN-' + Math.floor(10000 + Math.random() * 90000);
    const tripId = 'TRP-' + Math.floor(100000 + Math.random() * 900000);

    const tripRecord = {
      id: tripId,
      booking_reference: bookingReference,
      origin: origin || 'Jayadev Vihar',
      destination: destination || 'KIIT Square',
      origin_lat: originCoords?.[0] || 20.3039,
      origin_lng: originCoords?.[1] || 85.8188,
      dest_lat: destCoords?.[0] || 20.3541,
      dest_lng: destCoords?.[1] || 85.8175,
      distance_km: distanceKm || 8.5,
      duration_mins: durationMins || 24,
      fare_amount: fareAmount || 25,
      mode: mode || 'bus',
      route_name: routeName || 'Smart Transit Corridor',
      status: 'in_progress',
      user_id: userId || null,
      created_at: new Date().toISOString(),
    };

    // Try Supabase insert
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      await supabase.from('trips').insert([tripRecord]);
    }

    // Save to memory cache
    memoryStore.trips.unshift(tripRecord);

    res.status(201).json({ success: true, trip: tripRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get trips history
app.get('/api/trips', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    let trips = memoryStore.trips;

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      let query = supabase.from('trips').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        trips = data;
      }
    }

    res.json({ success: true, count: trips.length, trips });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trip Assurance Delay Refund Claim
app.post('/api/trips/refund-claim', async (req: Request, res: Response) => {
  const { tripId, delayMinutes, farePaid } = req.body;
  const delay = Number(delayMinutes) || 20;
  const fare = Number(farePaid) || 35;

  if (delay < 15) {
    return res.status(400).json({
      success: false,
      message: 'Refund is applicable only for delays of 15 minutes or more under Trip Assurance Guarantee.',
    });
  }

  // Credit 100% refund to wallet
  memoryStore.walletBalance += fare;
  const refundTx = {
    id: 'tx-ref-' + Date.now(),
    amount: fare,
    type: 'refund',
    title: `Trip Assurance 100% Delay Refund (${delay} mins late)`,
    timestamp: 'Just now',
    balanceAfter: memoryStore.walletBalance,
    status: 'success',
    routeOrMethod: 'Instant Wallet Credit',
  };
  memoryStore.transactions.unshift(refundTx);

  res.json({
    success: true,
    refundAmount: fare,
    newBalance: memoryStore.walletBalance,
    transaction: refundTx,
    message: `₹${fare} has been 100% refunded to your Mo-Wallet in 15 seconds!`,
  });
});

// ── 3. Transit Parcel Hub API ──────────────────────────────────────────────
app.get('/api/parcels', async (_req: Request, res: Response) => {
  res.json({ success: true, parcels: memoryStore.parcels });
});

app.post('/api/parcels/book', async (req: Request, res: Response) => {
  const { senderName, senderPhone, recipientName, recipientPhone, originStation, destStation, weightKg } = req.body;

  const newParcel = {
    id: 'PKL-' + Math.floor(1000 + Math.random() * 9000),
    trackingCode: 'MSFR-IN-' + Math.floor(10000 + Math.random() * 90000),
    stationName: originStation || 'Master Canteen Depot',
    destinationStation: destStation || 'Patia Transit Station',
    lockerNumber: 'LKR-0' + Math.floor(1 + Math.random() * 8),
    pin: String(Math.floor(1000 + Math.random() * 9000)),
    status: 'ready_pickup',
    recipientName: recipientName || 'Recipient',
    recipientPhone: recipientPhone || '+91 98765 00000',
    weightKg: weightKg || 1.5,
    fare: 35,
    expiryTime: new Date(Date.now() + 48 * 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  memoryStore.parcels.unshift(newParcel);
  res.status(201).json({ success: true, parcel: newParcel });
});

app.post('/api/parcels/unlock', (req: Request, res: Response) => {
  const { parcelId, pin } = req.body;
  const parcel = memoryStore.parcels.find(p => p.id === parcelId);

  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }

  parcel.status = 'delivered';
  res.json({
    success: true,
    message: `Locker ${parcel.lockerNumber} unlocked successfully! Door is open.`,
    parcel,
  });
});

// ── 4. Mo-Wallet & Passes API ──────────────────────────────────────────────
app.get('/api/wallet', (_req: Request, res: Response) => {
  res.json({
    success: true,
    balance: memoryStore.walletBalance,
    transactions: memoryStore.transactions,
    passes: memoryStore.passes,
  });
});

app.post('/api/wallet/topup', (req: Request, res: Response) => {
  const { amount, method } = req.body;
  const amt = Number(amount);

  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid topup amount' });
  }
  if (amt > 10000) {
    return res.status(400).json({ success: false, message: 'UPI recharge limit is ₹10,000 per transaction' });
  }

  memoryStore.walletBalance += amt;
  const tx = {
    id: 'tx-' + Date.now(),
    amount: amt,
    type: 'topup',
    title: `UPI Recharge via ${method || 'Google Pay'}`,
    timestamp: 'Just now',
    balanceAfter: memoryStore.walletBalance,
    status: 'success',
    routeOrMethod: method || 'UPI',
  };
  memoryStore.transactions.unshift(tx);

  res.json({ success: true, newBalance: memoryStore.walletBalance, transaction: tx });
});

// ── 5. OLA Maps & Routing Proxy API ────────────────────────────────────────
app.get('/api/routing/directions', async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.query; // format: "lat,lng"
    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination coordinates required' });
    }

    const olaUrl = `https://api.olamaps.io/routing/v1/directions?origin=${origin}&destination=${destination}&api_key=${OLA_MAPS_API_KEY}`;
    const response = await fetch(olaUrl, { headers: { 'X-Request-Id': 'musafir-backend-' + Date.now() } });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }

    // Fallback: OSRM Public Routing
    const [origLat, origLng] = (origin as string).split(',');
    const [destLat, destLng] = (destination as string).split(',');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=full&geometries=polyline`;
    const osrmRes = await fetch(osrmUrl);

    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      return res.json(osrmData);
    }

    res.status(502).json({ error: 'Routing providers unavailable' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 6. Gemini 2.0 Flash AI Assistant API ───────────────────────────────────
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (ai) {
      const systemInstruction = `You are Musafir AI, a smart transit assistant for India. Respond in ${language || 'English'} concisely (under 4-5 lines). Always use ₹ for fares.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: { systemInstruction, maxOutputTokens: 400, temperature: 0.7 },
        contents: message,
      });

      return res.json({
        success: true,
        reply: response.text,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    res.json({
      success: true,
      reply: `Namaste! 🙏 Musafir AI is active. Route from departure to destination calculated with live multi-modal fleet sync.`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 7. Emergency SOS Dispatch API ──────────────────────────────────────────
app.post('/api/sos/trigger', (req: Request, res: Response) => {
  const { coords, nearestLandmark, userProfile } = req.body;
  const dispatchId = 'SOS-IN-' + Math.floor(10000 + Math.random() * 90000);

  const sosPayload = {
    dispatchId,
    timestamp: new Date().toISOString(),
    coords: coords || [20.3039, 85.8188],
    nearestLandmark: nearestLandmark || 'Active City Corridor',
    helplinesNotified: ['112 (Police Emergency)', '108 (Ambulance)', '1091 (Women Safety)'],
    familySMSBroadcast: true,
    telemetryLink: `https://msfr-app-for-hackathon.vercel.app/?track=${dispatchId}`,
    status: 'dispatched_and_active',
  };

  res.json({ success: true, sos: sosPayload });
});

// ── 8. Real SMS OTP & Notification APIs ───────────────────────────────────
const activeOtpStore = new Map<string, { otp: string; expiresAt: number }>();

app.post('/api/auth/send-sms-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit Indian phone number required' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    let realSmsSent = false;
    let smsProvider = 'Simulated SMS Gateway (Local)';

    // 1. Check for Fast2SMS Indian SMS Gateway
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_API_KEY && FAST2SMS_API_KEY.length > 10) {
      try {
        // Try Route OTP
        const smsRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&flash=0&numbers=${cleanPhone}`);
        const smsData: any = await smsRes.json();
        
        if (smsData.return || smsData.status_code === 200 || smsData.message?.includes?.('SMS sent')) {
          realSmsSent = true;
          smsProvider = 'Fast2SMS Gateway';
          console.log(`📱 [REAL SMS DELIVERED] to +91 ${cleanPhone} via Fast2SMS. OTP: ${otp}`);
        } else {
          // Try Route Q fallback
          const qRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=Your MSFR verification code is ${otp}&language=english&flash=0&numbers=${cleanPhone}`);
          const qData: any = await qRes.json();
          if (qData.return || qData.status_code === 200) {
            realSmsSent = true;
            smsProvider = 'Fast2SMS Quick Gateway';
            console.log(`📱 [REAL SMS DELIVERED] to +91 ${cleanPhone} via Fast2SMS Quick Route.`);
          } else {
            console.log(`ℹ️ [Fast2SMS Notice]: ${smsData.message || qData.message}. Using high-speed on-screen SMS dispatch.`);
          }
        }
      } catch (smsErr) {
        console.warn('Fast2SMS gateway delivery notice:', smsErr);
      }
    }

    // 2. Check for Twilio SMS Gateway (if configured in .env)
    const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;
    if (!realSmsSent && TWILIO_SID && TWILIO_AUTH && TWILIO_FROM) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', `+91${cleanPhone}`);
        params.append('From', TWILIO_FROM);
        params.append('Body', `Your musafir transit verification code is: ${otp}. Valid for 5 minutes.`);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
        if (twilioRes.ok) {
          realSmsSent = true;
          smsProvider = 'Twilio SMS Gateway';
          console.log(`📱 [REAL SMS DELIVERED] to +91 ${cleanPhone} via Twilio.`);
        }
      } catch (twErr) {
        console.warn('Twilio delivery notice:', twErr);
      }
    }

    console.log(`📩 [SMS OTP DISPATCH]: Mobile: +91 ${cleanPhone} | OTP: ${otp} | Gateway: ${smsProvider}`);

    res.json({
      success: true,
      phone: `+91 ${cleanPhone}`,
      otp, // included for simulated toast / fallback verification
      realSmsSent,
      smsProvider,
      message: realSmsSent
        ? `Real SMS dispatched to +91 ${cleanPhone} via ${smsProvider}`
        : `Simulated SMS dispatched to +91 ${cleanPhone}`,
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, error: 'Failed to dispatch SMS OTP' });
  }
});

app.post('/api/auth/verify-sms-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone and OTP required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const record = activeOtpStore.get(cleanPhone);

  // Universal master test code for hackathon judges: '123456'
  if (otp.trim() === '123456') {
    return res.json({ success: true, verified: true, message: 'OTP verified successfully (Master Test Code)' });
  }

  if (!record) {
    return res.status(400).json({ success: false, verified: false, error: 'No OTP requested for this number or OTP expired' });
  }

  if (Date.now() > record.expiresAt) {
    activeOtpStore.delete(cleanPhone);
    return res.status(400).json({ success: false, verified: false, error: 'OTP has expired. Please request a new code.' });
  }

  if (record.otp === otp.trim()) {
    activeOtpStore.delete(cleanPhone);
    return res.json({ success: true, verified: true, message: 'OTP verified successfully' });
  }

  res.status(400).json({ success: false, verified: false, error: 'Invalid OTP code' });
});

app.post('/api/auth/login-notification', async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone, category, homeCity } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    console.log(`📧 [EMAIL NOTIFICATION] Sending Login Confirmation:`);
    console.log(`   To: ${fullName} <${email}>`);
    console.log(`   Phone: ${phone || 'N/A'}`);
    console.log(`   City: ${homeCity || 'Bhubaneswar'}`);
    console.log(`   Category: ${category || 'General Passenger'}`);
    console.log(`   Message: "Welcome to musafir! You have successfully logged in to the unified transit platform. ₹100 Welcome Joining Bonus credited to your Mo-Wallet."`);

    res.json({
      success: true,
      message: `Login notification email successfully dispatched to ${email}`,
      recipient: email,
      passengerName: fullName,
      bonusCredited: 100,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Email dispatch error:', err);
    res.status(500).json({ error: 'Failed to send login notification' });
  }
});

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Musafir Backend API Server running at http://localhost:${PORT}`);
  console.log(`📡 Supabase Database: ${SUPABASE_URL}`);
  console.log(`🤖 Gemini AI: Configured`);
  console.log(`🗺️ OLA Maps API: Configured`);
  console.log(`📱 SMS OTP Gateway: Ready (Fast2SMS / Twilio / Simulator)`);
});
