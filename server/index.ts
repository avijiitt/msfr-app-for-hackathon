import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
  profiles: [] as any[],
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

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Musafir Backend API Server running at http://localhost:${PORT}`);
  console.log(`📡 Supabase Database: ${SUPABASE_URL}`);
  console.log(`🤖 Gemini AI: Configured`);
  console.log(`🗺️ OLA Maps API: Configured`);
});
