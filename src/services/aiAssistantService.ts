import { GoogleGenAI } from '@google/genai';

const getGeminiApiKey = (): string => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('musafir_gemini_api_key') ||
    ''
  );
};

const isGeminiConfigured = (): boolean => {
  const key = getGeminiApiKey();
  return Boolean(key) && key.length > 10 && !key.includes('your-gemini');
};

let ai: GoogleGenAI | null = null;
const initGeminiClient = () => {
  const key = getGeminiApiKey();
  if (isGeminiConfigured()) {
    try {
      ai = new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn('GoogleGenAI SDK init notice:', err);
    }
  }
};
initGeminiClient();

export type AIActionType =
  | 'open_parcel_booking'
  | 'open_parcel_sync'
  | 'open_wallet'
  | 'open_fare'
  | 'open_rewards'
  | 'open_refund'
  | 'open_student'
  | 'open_schedule'
  | 'open_support'
  | 'open_amenities'
  | 'open_alerts'
  | 'open_share_location'
  | 'open_medical_id'
  | 'open_women_safety'
  | 'open_my_trips'
  | 'trigger_sos'
  | 'open_planner'
  | 'plan_trip'
  | 'open_bus_routes'
  | 'open_community'
  | 'open_logistics'
  | 'open_transit_hub'
  | 'open_language'
  | 'open_profile'
  | 'toggle_offline'
  | 'toggle_theme';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  autoExecute?: boolean; // triggers automatic execution in app
  executedLabel?: string;
  actionButton?: {
    label: string;
    actionType: AIActionType;
    payload?: string;
  };
}

// System prompt for live Gemini if API key is present
const MUSAFIR_SYSTEM_PROMPT = `You are Musafir AI, the official automated smart transit assistant for India and CRUT Ama Bus Odisha.
You speak fluent English, Hindi (हिन्दी), Hinglish, and Odia (ଓଡ଼ିଆ).
Always keep answers concise, practical, and punchy (3-4 lines max).
Always mention ₹ for fares.
You can directly execute any feature in the app for the commuter.`;

// Conversation history
let conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

// Known landmarks in Bhubaneswar & Odisha for intelligent matching
const KNOWN_PLACES: { [key: string]: string } = {
  'jayadev vihar': 'Jayadev Vihar',
  'jaydev vihar': 'Jayadev Vihar',
  'kiit': 'KIIT Square',
  'kiit square': 'KIIT Square',
  'kiit university': 'KIIT Square',
  'patia': 'Patia',
  'infocity': 'Infocity',
  'master canteen': 'Master Canteen',
  'station': 'Master Canteen',
  'railway station': 'Master Canteen',
  'bhubaneswar station': 'Master Canteen',
  'airport': 'Biju Patnaik Airport',
  'biju patnaik airport': 'Biju Patnaik Airport',
  'baramunda': 'ISBT Baramunda',
  'isbt': 'ISBT Baramunda',
  'rasulgarh': 'Rasulgarh Square',
  'khandagiri': 'Khandagiri',
  'vani vihar': 'Vani Vihar',
  'utkal university': 'Vani Vihar',
  'acharya vihar': 'Acharya Vihar',
  'kalpana': 'Kalpana Square',
  'kalpana square': 'Kalpana Square',
  'saheed nagar': 'Saheed Nagar',
  'nayapalli': 'Nayapalli',
  'chandrasekharpur': 'Chandrasekharpur',
  'cs pur': 'Chandrasekharpur',
  'mancheswar': 'Mancheswar',
  'aiims': 'AIIMS Bhubaneswar',
  'sum hospital': 'SUM Hospital',
  'kalinga hospital': 'Kalinga Hospital',
  'nandankanan': 'Nandankanan Zoological Park',
  'cuttack': 'Badambadi, Cuttack',
  'badambadi': 'Badambadi, Cuttack',
  'puri': 'Puri Sea Beach',
  'jagannath temple': 'Puri Temple',
  'khurda': 'Khurda Road',
};

class AIAssistantService {
  public setApiKey(key: string): void {
    if (key && key.trim()) {
      localStorage.setItem('musafir_gemini_api_key', key.trim());
      initGeminiClient();
    }
  }

  public async generateResponse(
    query: string,
    language: string = 'en',
    onStream?: (chunk: string) => void
  ): Promise<AIMessage> {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = 'msg-' + Date.now();

    conversationHistory.push({ role: 'user', parts: [{ text: query }] });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    const q = query.trim().toLowerCase();

    // ── 1. First priority: Intelligent Natural Language Intent & Action Parser ──
    const actionResult = this.evaluateIntentAndExecute(query, q, now, id, language);
    if (actionResult) {
      conversationHistory.push({ role: 'model', parts: [{ text: actionResult.text }] });
      return actionResult;
    }

    // ── 2. Live Gemini API if available ──
    if (ai && isGeminiConfigured()) {
      try {
        let fullText = '';
        if (onStream) {
          const stream = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 350 },
            contents: conversationHistory,
          });
          for await (const chunk of stream) {
            const chunkText = chunk.text || '';
            fullText += chunkText;
            onStream(fullText);
          }
        } else {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 350 },
            contents: conversationHistory,
          });
          fullText = response.text || '';
        }

        if (fullText.trim().length > 0) {
          conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });
          const actionButton = this.detectActionButton(q, fullText);
          return {
            id,
            sender: 'assistant',
            text: fullText,
            timestamp: now,
            actionButton,
            autoExecute: Boolean(actionButton),
          };
        }
      } catch (sdkErr) {
        console.warn('Gemini SDK error, falling back to local engine:', sdkErr);
      }
    }

    // ── 3. General Conversational Assistant Fallback ──
    return this.fallbackGeneralChat(id, q, query, now);
  }

  /**
   * Evaluates user intent and returns instant action with autoExecute
   */
  private evaluateIntentAndExecute(
    rawQuery: string,
    q: string,
    now: string,
    id: string,
    _language: string
  ): AIMessage | null {
    // ── A. EMERGENCY SOS ──────────────────────────────────────────
    if (
      q.includes('sos') ||
      q.includes('emergency') ||
      q.includes('police') ||
      q.includes('danger') ||
      q.includes('khatra') ||
      q.includes('bachao') ||
      q.includes('accident') ||
      q.includes('ambulance')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🚨 Emergency SOS Triggered',
        text: `🚨 **Emergency SOS Dispatched!**\nLive GPS location and medical profile are ready to dispatch to 112 emergency services and family contacts.\n\n📞 Police: 112 | Ambulance: 108 | Women Helpline: 1091`,
        actionButton: { label: '🚨 Launch Emergency SOS', actionType: 'trigger_sos' },
      };
    }

    // ── B. ROUTE PLANNING & NAVIGATION (X se Y / to Y) ─────────────
    const routePlan = this.parseRouteQuery(rawQuery, q);
    if (routePlan) {
      const { origin, destination, isHinglish } = routePlan;
      const payload = JSON.stringify({ origin, destination });

      const replyText = isHinglish
        ? `🗺️ **Maine Route Plan kar diya hai:**\n📍 **${origin}** ➔ **${destination}**\n\n• ⚡ Fastest Transit: **Ama Bus AC Corridor / Route 10**\n• ⏱️ Estimated Time: **~24 mins** | 🎫 Fare: **₹15–₹20**\n• 🔄 Interactive map aur live route plan open ho gaya hai!`
        : `🗺️ **Route Planned Successfully:**\n📍 **${origin}** ➔ **${destination}**\n\n• ⚡ Fastest Transit: **Ama Bus AC Corridor / Line 10**\n• ⏱️ Duration: **~24 mins** | 🎫 Official CRUT Fare: **₹15–₹20**\n• 🔄 Switched directly to the live interactive map & route plan.`;

      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: `🗺️ Route Planned: ${origin} ➔ ${destination}`,
        text: replyText,
        actionButton: {
          label: `🗺️ View Route: ${origin} ➔ ${destination}`,
          actionType: 'plan_trip',
          payload,
        },
      };
    }

    // ── C. MO-WALLET & PAYMENTS ────────────────────────────────────
    if (
      q.includes('wallet') ||
      q.includes('recharge') ||
      q.includes('balance') ||
      q.includes('paise') ||
      q.includes('topup') ||
      q.includes('top up') ||
      q.includes('upi') ||
      q.includes('add money') ||
      q.includes('wallet kholo')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '💳 Mo-Wallet Opened',
        text: `💳 **Mo-Wallet Dashboard Open ho gaya hai!**\n\n• Check live transit balance\n• Instant UPI, RuPay, Debit Card top-up\n• 10% auto-cashback on Ama Bus transit rides`,
        actionButton: { label: '💳 Open Mo-Wallet', actionType: 'open_wallet' },
      };
    }

    // ── D. PARCEL LOCKER & DELIVERY ────────────────────────────────
    if (
      q.includes('parcel') ||
      q.includes('courier') ||
      q.includes('locker') ||
      q.includes('package') ||
      q.includes('bhejna') ||
      q.includes('cargo') ||
      q.includes('delivery')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📦 Parcel Hub Opened',
        text: `📦 **Parcel Delivery Hub Open ho gaya hai!**\n\nSend and receive packages across 82 Ama Bus terminal lockers with secure OTP access and live SMS tracking.`,
        actionButton: { label: '📦 Open Parcel Booking', actionType: 'open_parcel_booking' },
      };
    }

    // ── E. STUDENT CONCESSION PASS (50% OFF) ──────────────────────
    if (
      q.includes('student') ||
      q.includes('concession') ||
      q.includes('50%') ||
      q.includes('college') ||
      q.includes('school') ||
      q.includes('digilocker')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🎓 Student Hub Opened',
        text: `🎓 **Student 50% Concession Hub Open ho gaya!**\n\nVerify your Student ID via DigiLocker or scan your college ID to unlock 50% flat discount on all Ama Bus and Metro corridor rides!`,
        actionButton: { label: '🎓 Verify Student Pass', actionType: 'open_student' },
      };
    }

    // ── F. WOMEN SAFETY & PINK BUSES ──────────────────────────────
    if (
      q.includes('women') ||
      q.includes('pink') ||
      q.includes('night safe') ||
      q.includes('safety') ||
      q.includes('mahila') ||
      q.includes('aurat') ||
      q.includes('lady')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🛡️ Women Safety Hub Opened',
        text: `🛡️ **Women Safety Hub Open ho gaya hai!**\n\n• Track all CCTV-equipped Pink Buses\n• Dedicated Women Helpline: 1091\n• Night-safe well-lit route recommendations`,
        actionButton: { label: '🛡️ Open Women Safety Hub', actionType: 'open_women_safety' },
      };
    }

    // ── G. 82 AMA BUS ROUTES & TIMETABLES ──────────────────────────
    if (
      q.includes('bus route') ||
      q.includes('bus lines') ||
      q.includes('82') ||
      q.includes('routes') ||
      q.includes('ama bus') ||
      q.includes('mo bus') ||
      q.includes('timetable') ||
      q.includes('time table') ||
      q.includes('buses')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🚌 82 Ama Bus Lines Opened',
        text: `🚌 **CRUT Ama Bus Network (82 Lines) Open ho gaya!**\n\nExplore all 82 lines across Bhubaneswar, Cuttack, Puri, and Khurda corridors with live stoppage points and frequencies.`,
        actionButton: { label: '🚌 Explore 82 Bus Lines', actionType: 'open_bus_routes' },
      };
    }

    // ── H. FARE CALCULATOR ─────────────────────────────────────────
    if (
      q.includes('fare') ||
      q.includes('kiraya') ||
      q.includes('cost') ||
      q.includes('price') ||
      q.includes('calculator') ||
      q.includes('kitna lagega') ||
      q.includes('ticket rate')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📊 Fare Calculator Opened',
        text: `📊 **Fare Calculator Open ho gaya!**\n\n• **Non-AC:** ₹5 (0-4km), ₹10 (4-8km), ₹15 (8-12km) up to ₹125\n• **AC:** ₹5 (0-2km), ₹10 (2-4km), ₹15 (4-7km), ₹20 (7-10km) up to ₹130\nCalculate exact stage fares for your specific journey!`,
        actionButton: { label: '📊 Open Fare Calculator', actionType: 'open_fare' },
      };
    }

    // ── I. TRIP ASSURANCE & REFUND CLAIM ───────────────────────────
    if (
      q.includes('refund') ||
      q.includes('delay') ||
      q.includes('late') ||
      q.includes('assurance') ||
      q.includes('claim') ||
      q.includes('paisa wapas') ||
      q.includes('cancel')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🛡️ Trip Assurance Opened',
        text: `🛡️ **Trip Assurance & Refund Guarantee Open ho gaya!**\n\nMusafir guarantees 100% instant refund if your scheduled bus is delayed by 15+ minutes or broken down. Auto-credited to your Mo-Wallet in 60 seconds!`,
        actionButton: { label: '🛡️ Claim Instant Refund', actionType: 'open_refund' },
      };
    }

    // ── J. TRIPS HISTORY & RECEIPTS ────────────────────────────────
    if (
      q.includes('trip') ||
      q.includes('history') ||
      q.includes('rides') ||
      q.includes('purani yatra') ||
      q.includes('receipt') ||
      q.includes('activity')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📋 Trip History Opened',
        text: `📋 **Aapki Trip History Open ho gayi hai!**\n\nView all your past completed journeys, verified receipts, and carbon savings credits.`,
        actionButton: { label: '📋 View Trips History', actionType: 'open_my_trips' },
      };
    }

    // ── K. REWARDS & COINS ─────────────────────────────────────────
    if (
      q.includes('reward') ||
      q.includes('coin') ||
      q.includes('point') ||
      q.includes('miles') ||
      q.includes('free pass') ||
      q.includes('inam')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🏆 Rewards Hub Opened',
        text: `🏆 **Musafir Miles Rewards Hub Open ho gaya!**\n\n• +10 coins per green transit journey\n• 500 coins = 1 Free Day Pass\n• 1000 coins = ₹50 Mo-Wallet Top-up`,
        actionButton: { label: '🏆 View Rewards', actionType: 'open_rewards' },
      };
    }

    // ── L. CIVIC COMMUNITY & INCIDENT REPORT ───────────────────────
    if (
      q.includes('community') ||
      q.includes('incident') ||
      q.includes('traffic jam') ||
      q.includes('jam') ||
      q.includes('pothole') ||
      q.includes('strike') ||
      q.includes('report') ||
      q.includes('feed')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '👥 Civic Community Opened',
        text: `👥 **Civic Community Hub par switch kar diya hai!**\n\nView and report real-time road hazards, traffic bottlenecks, and upload photo proof to help fellow commuters.`,
        actionButton: { label: '👥 Open Community Hub', actionType: 'open_community' },
      };
    }

    // ── M. LOGISTICS OPTIMIZER ─────────────────────────────────────
    if (
      q.includes('logistics') ||
      q.includes('tsp') ||
      q.includes('cargo') ||
      q.includes('delivery route') ||
      q.includes('freight')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🚚 Logistics Optimizer Opened',
        text: `🚚 **Logistics Optimizer Hub par switch kar diya hai!**\n\nMulti-stop Traveling Salesperson Problem (TSP) cargo route optimizer for smart city logistics.`,
        actionButton: { label: '🚚 Open Logistics Optimizer', actionType: 'open_logistics' },
      };
    }

    // ── N. MULTIMODAL TRANSIT HUB ──────────────────────────────────
    if (
      q.includes('transit hub') ||
      q.includes('multimodal') ||
      q.includes('train') ||
      q.includes('flight') ||
      q.includes('railway') ||
      q.includes('vande bharat')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '⚡ Transit Hub Opened',
        text: `⚡ **Multimodal Transit Hub par switch kar diya hai!**\n\nExplore integrated schedules for Indian Railways Express, Intercity OSRTC buses, and domestic flights.`,
        actionButton: { label: '⚡ Open Transit Hub', actionType: 'open_transit_hub' },
      };
    }

    // ── O. LIVE MAP & TRIP PLANNER ──────────────────────────────────
    if (
      q.includes('map') ||
      q.includes('live map') ||
      q.includes('trip plan') ||
      q.includes('navigation')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🗺️ Live Map Opened',
        text: `🗺️ **Interactive Live Map & Trip Plan par switch kar diya hai!**`,
        actionButton: { label: '🗺️ View Live Map', actionType: 'open_planner' },
      };
    }

    // ── P. THEME TOGGLE (DARK / LIGHT) ──────────────────────────────
    if (
      q.includes('theme') ||
      q.includes('dark mode') ||
      q.includes('light mode') ||
      q.includes('black mode') ||
      q.includes('white mode')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🌓 Theme Toggled',
        text: `🌓 **Theme Toggle ho gayi hai!** Switched between Dark and Light mode for optimal display.`,
        actionButton: { label: '🌓 Toggle Theme', actionType: 'toggle_theme' },
      };
    }

    // ── Q. OFFLINE MODE TOGGLE ──────────────────────────────────────
    if (
      q.includes('offline') ||
      q.includes('no internet') ||
      q.includes('internet band') ||
      q.includes('online mode')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📶 Offline Mode Toggled',
        text: `📶 **Offline Transit Mode Toggle ho gaya!**\nAll local bus schedules and geocoded stops work 100% offline without internet.`,
        actionButton: { label: '📶 Toggle Offline Mode', actionType: 'toggle_offline' },
      };
    }

    // ── R. LANGUAGE CHANGE ──────────────────────────────────────────
    if (
      q.includes('language') ||
      q.includes('bhasha') ||
      q.includes('odia') ||
      q.includes('hindi') ||
      q.includes('english') ||
      q.includes('bengali')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '🌐 Language Selection Opened',
        text: `🌐 **Language Selection Menu Open ho gaya!** Choose English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Bengali, Tamil, or Telugu.`,
        actionButton: { label: '🌐 Change Language', actionType: 'open_language' },
      };
    }

    // ── S. SCHEDULE RIDE ────────────────────────────────────────────
    if (
      q.includes('schedule') ||
      q.includes('commute') ||
      q.includes('pre-book') ||
      q.includes('kal subah') ||
      q.includes('daily ride')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📅 Schedule Ride Opened',
        text: `📅 **Schedule Commute Hub Open ho gaya!** Pre-book your recurring daily office or college rides.`,
        actionButton: { label: '📅 Schedule Ride', actionType: 'open_schedule' },
      };
    }

    // ── T. NEARBY STOPS & AMENITIES ─────────────────────────────────
    if (
      q.includes('amenit') ||
      q.includes('nearby') ||
      q.includes('atm') ||
      q.includes('charging') ||
      q.includes('restroom') ||
      q.includes('washroom') ||
      q.includes('paas mein')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📍 Nearby Amenities Opened',
        text: `📍 **Nearby Amenities Hub Open ho gaya!** Find EV fast-chargers, water points, ATMs, and public restrooms near your current stop.`,
        actionButton: { label: '📍 View Nearby Amenities', actionType: 'open_amenities' },
      };
    }

    // ── U. FAMILY LOCATION SHARING ──────────────────────────────────
    if (
      q.includes('share location') ||
      q.includes('track me') ||
      q.includes('family') ||
      q.includes('location share')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '📡 Family Tracking Opened',
        text: `📡 **Family Location Sharing Open ho gaya!** Share your live GPS telemetry link with family for peace of mind.`,
        actionButton: { label: '📡 Share Trip Location', actionType: 'open_share_location' },
      };
    }

    // ── V. PROFILE & SETTINGS ───────────────────────────────────────
    if (
      q.includes('profile') ||
      q.includes('settings') ||
      q.includes('my account') ||
      q.includes('user details')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '👤 Profile Opened',
        text: `👤 **User Profile & Settings Open ho gaya!** Manage account details, saved home/work places, and emergency contacts.`,
        actionButton: { label: '👤 Open Profile', actionType: 'open_profile' },
      };
    }

    // ── W. CUSTOMER SUPPORT ─────────────────────────────────────────
    if (
      q.includes('support') ||
      q.includes('complaint') ||
      q.includes('helpline') ||
      q.includes('help') ||
      q.includes('madad')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        autoExecute: true,
        executedLabel: '💬 Support Desk Opened',
        text: `💬 **Customer Support Desk Open ho gaya!**\nCRUT Ama Bus Toll-Free Helpline: **1800-345-1234**\nChat with live transit officials directly in the support modal.`,
        actionButton: { label: '💬 Open Support Desk', actionType: 'open_support' },
      };
    }

    return null;
  }

  /**
   * Helper to parse routes like "Jayadev Vihar se KIIT", "from Patia to Station", etc.
   */
  private parseRouteQuery(
    raw: string,
    q: string
  ): { origin: string; destination: string; isHinglish: boolean } | null {
    const isHinglish =
      q.includes('se') ||
      q.includes('jana') ||
      q.includes('kaise') ||
      q.includes('bhejo') ||
      q.includes('chalo') ||
      q.includes('chalen');

    // 1. Pattern: "X se Y (jana hai / kaise jaye / route)"
    const seMatch = raw.match(/([a-zA-Z0-9\s]+?)\s+se\s+([a-zA-Z0-9\s]+?)(\s+(jana|kaise|route|bus|chalo)|$|\?)/i);
    if (seMatch && seMatch[1] && seMatch[2]) {
      const orig = this.cleanPlaceName(seMatch[1]);
      const dest = this.cleanPlaceName(seMatch[2]);
      if (orig && dest && orig !== dest) {
        return { origin: orig, destination: dest, isHinglish };
      }
    }

    // 2. Pattern: "from X to Y"
    const fromToMatch = raw.match(/from\s+([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(\s+(bus|route|ride|trip)|$|\?)/i);
    if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
      const orig = this.cleanPlaceName(fromToMatch[1]);
      const dest = this.cleanPlaceName(fromToMatch[2]);
      if (orig && dest && orig !== dest) {
        return { origin: orig, destination: dest, isHinglish };
      }
    }

    // 3. Pattern: "X to Y"
    const toMatch = raw.match(/([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(\s+(bus|route|trip)|$|\?)/i);
    if (toMatch && toMatch[1] && toMatch[2]) {
      const p1 = toMatch[1].trim().toLowerCase();
      // Avoid false triggers like "how to", "listen to", "want to"
      if (!['how', 'listen', 'go', 'want', 'talk', 'welcome'].includes(p1)) {
        const orig = this.cleanPlaceName(toMatch[1]);
        const dest = this.cleanPlaceName(toMatch[2]);
        if (orig && dest && orig !== dest) {
          return { origin: orig, destination: dest, isHinglish };
        }
      }
    }

    // 4. Pattern: Destination only, e.g. "KIIT jana hai", "route to Patia", "bus to Airport"
    const destMatch = raw.match(/(route to|bus to|directions to|reach|jana hai|kaise jaye)\s+([a-zA-Z0-9\s]+)/i);
    if (destMatch && destMatch[2]) {
      const dest = this.cleanPlaceName(destMatch[2]);
      if (dest) {
        return { origin: 'Jayadev Vihar', destination: dest, isHinglish };
      }
    }

    // 5. Pattern: "[Landmark] jana hai"
    const landmarkJana = raw.match(/([a-zA-Z0-9\s]+?)\s+(jana hai|kaise jaye)/i);
    if (landmarkJana && landmarkJana[1]) {
      const dest = this.cleanPlaceName(landmarkJana[1]);
      if (dest) {
        return { origin: 'Jayadev Vihar', destination: dest, isHinglish: true };
      }
    }

    return null;
  }

  private cleanPlaceName(name: string): string {
    let clean = name.trim().replace(/^(from|to|near|at|se)\s+/i, '').replace(/\s+(jana|hai|kaise|route|bus|chalo|trip)$/i, '').trim();
    const lower = clean.toLowerCase();

    // Check against known landmarks dictionary
    for (const [key, val] of Object.entries(KNOWN_PLACES)) {
      if (lower === key || lower.includes(key)) {
        return val;
      }
    }

    // Capitalize first letter of each word
    return clean
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  public detectActionButton(query: string, _response: string): AIMessage['actionButton'] | undefined {
    const q = query.toLowerCase();

    if (q.includes('parcel') || q.includes('courier') || q.includes('locker'))
      return { label: '📦 Open Parcel', actionType: 'open_parcel_booking' };
    if (q.includes('wallet') || q.includes('recharge') || q.includes('balance') || q.includes('paise'))
      return { label: '💳 Open Wallet', actionType: 'open_wallet' };
    if (q.includes('women') || q.includes('pink') || q.includes('night safe'))
      return { label: '🛡️ Women Safety', actionType: 'open_women_safety' };
    if (q.includes('family') || q.includes('share location') || q.includes('track me'))
      return { label: '📡 Share Trip', actionType: 'open_share_location' };
    if (q.includes('medical') || q.includes('blood') || q.includes('doctor'))
      return { label: '🏥 Medical ID', actionType: 'open_medical_id' };
    if (q.includes('amenit') || q.includes('nearby') || q.includes('atm') || q.includes('charging'))
      return { label: '📍 Nearby Stops', actionType: 'open_amenities' };
    if (q.includes('alert') || q.includes('incident') || q.includes('traffic'))
      return { label: '🔔 Live Alerts', actionType: 'open_alerts' };
    if (q.includes('trip') || q.includes('history') || q.includes('my trips'))
      return { label: '📋 Trips', actionType: 'open_my_trips' };
    if (q.includes('fare') || q.includes('price') || q.includes('cost') || q.includes('calculator'))
      return { label: '📊 Fare Calc', actionType: 'open_fare' };
    if (q.includes('reward') || q.includes('coin') || q.includes('miles'))
      return { label: '🏆 Rewards', actionType: 'open_rewards' };
    if (q.includes('refund') || q.includes('delay') || q.includes('assurance'))
      return { label: '🛡️ Trip Assurance', actionType: 'open_refund' };
    if (q.includes('student') || q.includes('concession') || q.includes('50%'))
      return { label: '🎓 Student Pass', actionType: 'open_student' };
    if (q.includes('schedule') || q.includes('commute'))
      return { label: '📅 Schedule', actionType: 'open_schedule' };
    if (q.includes('bus route') || q.includes('82') || q.includes('routes'))
      return { label: '🚌 82 Bus Lines', actionType: 'open_bus_routes' };
    if (q.includes('community') || q.includes('feed'))
      return { label: '👥 Community', actionType: 'open_community' };
    if (q.includes('logistics') || q.includes('cargo'))
      return { label: '🚚 Logistics', actionType: 'open_logistics' };
    if (q.includes('transit hub') || q.includes('multimodal'))
      return { label: '⚡ Transit Hub', actionType: 'open_transit_hub' };
    if (q.includes('dark mode') || q.includes('light mode') || q.includes('theme'))
      return { label: '🌓 Toggle Theme', actionType: 'toggle_theme' };
    if (q.includes('offline'))
      return { label: '📶 Offline Mode', actionType: 'toggle_offline' };
    if (q.includes('language') || q.includes('bhasha'))
      return { label: '🌐 Change Language', actionType: 'open_language' };
    if (q.includes('support') || q.includes('complaint'))
      return { label: '💬 Support', actionType: 'open_support' };
    if (q.includes('profile') || q.includes('settings'))
      return { label: '👤 Profile', actionType: 'open_profile' };
    if (q.includes('route') || q.includes('plan') || q.includes('map'))
      return { label: '🗺️ Plan Trip', actionType: 'open_planner' };

    return undefined;
  }

  private fallbackGeneralChat(id: string, _q: string, query: string, now: string): AIMessage {
    const isHindi = /[\u0900-\u097F]/.test(query) || /kya|kaise|karo|batao|kholo|dikhao/i.test(query);

    const text = isHindi
      ? `Namaste! 🙏 Main **Musafir AI** hoon — aapka complete smart transit operator.\n\nAap mujhe jo bhi bolenge, main app mein turant execute kar dunga:\n• "Jayadev Vihar se KIIT Square jana hai"\n• "Mera wallet kholo / recharge karo"\n• "82 Ama Bus routes dikhao"\n• "Student 50% discount pass verify karo"\n• "Bus late ho gayi, refund claim karo"\n• "Emergency SOS / Women Safety kholo"`
      : `Namaste! 🙏 I'm **Musafir AI** — your voice & chat smart transit operator.\n\nTell me what to do and I will execute it instantly inside the app:\n• "Plan route from Jayadev Vihar to KIIT Square"\n• "Open Mo-Wallet / check balance"\n• "Show 82 Ama Bus lines & timetables"\n• "Apply for student 50% concession"\n• "Claim 100% refund for 15+ min delay"\n• "Trigger Emergency SOS or Women Safety"`;

    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text,
      actionButton: { label: '🗺️ Explore Live Map', actionType: 'open_planner' },
    };
  }

  public clearHistory(): void {
    conversationHistory = [];
  }
}

export const aiAssistantService = new AIAssistantService();
