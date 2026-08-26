import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const isGeminiConfigured = (): boolean =>
  Boolean(GEMINI_API_KEY) && GEMINI_API_KEY.length > 10 && !GEMINI_API_KEY.includes('your-gemini');

let ai: GoogleGenAI | null = null;
if (isGeminiConfigured()) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.warn('GoogleGenAI SDK init notice:', err);
  }
}

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
  | 'toggle_theme';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  actionButton?: {
    label: string;
    actionType: AIActionType;
    payload?: string;
  };
}

// System prompt — makes Gemini an expert Indian transit assistant
const MUSAFIR_SYSTEM_PROMPT = `You are Musafir AI, an expert smart transit companion and in-app automated operator built specifically for India.

Your capabilities:
1. Indian Public Transit: Buses (Mo Bus, DTC, BMTC, BEST, MTC, KSRTC, WBTC, PMPML), Metro Rail (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Kochi, Jaipur, Ahmedabad, Pune, Nagpur), Suburban local trains, EV autos, e-rickshaws, shared cabs.
2. In-App Control: You can trigger and open any feature in the app — Parcel Hub, Mo-Wallet, Schedule Rides, Student Pass Hub (50% off), Live Family Location Sharing, Emergency SOS, Fare Calculator, Refunds, Nearby Amenities, and Night-Safe Routing.
3. Multi-Lingual: Fluent in English, Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी).
4. Formatting:
- Keep answers concise, clear, and punchy (3-5 lines max).
- Always use ₹ for Indian Rupees (e.g. ₹20, ₹45).
- For route navigation, format as: Origin ➔ Waypoint ➔ Destination.
- Be proactive in recommending the exact feature or pass that saves money/time.`;

// Conversation history for context
let conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

class AIAssistantService {
  public async generateResponse(
    query: string,
    _language: string,
    onStream?: (chunk: string) => void
  ): Promise<AIMessage> {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = 'msg-' + Date.now();

    // Add user message to history
    conversationHistory.push({ role: 'user', parts: [{ text: query }] });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    const q = query.toLowerCase();

    // ── 1. Emergency SOS Shortcut ───────────────────────────────────────────
    if (q.includes('sos') || q.includes('emergency') || (q.includes('help') && q.includes('danger'))) {
      const text = `🚨 **Emergency Alert Triggered!**\nLive GPS coordinates and medical telemetry are ready to dispatch to 112 emergency services and family contacts.\n\n📞 Police: 112 | Ambulance: 108 | Women Helpline: 1091`;
      conversationHistory.push({ role: 'model', parts: [{ text }] });
      return {
        id,
        sender: 'assistant',
        text,
        timestamp: now,
        actionButton: { label: '🚨 Launch Emergency SOS', actionType: 'trigger_sos' },
      };
    }

    // ── 2. Gemini GenAI SDK Call ───────────────────────────────────────────
    if (ai && isGeminiConfigured()) {
      try {
        let fullText = '';

        if (onStream) {
          const stream = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 450 },
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
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 450 },
            contents: conversationHistory,
          });
          fullText = response.text || '';
        }

        if (fullText.trim().length > 0) {
          conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });
          const actionButton = this.detectActionButton(q, fullText);
          return { id, sender: 'assistant', text: fullText, timestamp: now, actionButton };
        }
      } catch (sdkErr) {
        console.warn('Gemini SDK stream error, trying direct REST fallback:', sdkErr);
      }
    }

    // ── 3. Direct Gemini REST API Fallback ──────────────────────────────────
    if (isGeminiConfigured()) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const restRes = await fetch(restUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: conversationHistory,
            generationConfig: { maxOutputTokens: 450, temperature: 0.7 },
          }),
        });

        if (restRes.ok) {
          const restData = await restRes.json();
          const candidateText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            conversationHistory.push({ role: 'model', parts: [{ text: candidateText }] });
            const actionButton = this.detectActionButton(q, candidateText);
            return { id, sender: 'assistant', text: candidateText, timestamp: now, actionButton };
          }
        }
      } catch (restErr) {
        console.warn('Gemini REST API fallback error:', restErr);
      }
    }

    // ── 4. Intelligent Offline Response Matrix ─────────────────────────────
    return this.fallbackResponse(id, q, now);
  }

  public detectActionButton(query: string, _response: string): AIMessage['actionButton'] | undefined {
    const q = query.toLowerCase();

    if (q.includes('parcel') || q.includes('courier') || q.includes('locker') || q.includes('package') || q.includes('delivery'))
      return { label: '📦 Open Transit Parcel Hub', actionType: 'open_parcel_booking' };
    if (q.includes('wallet') || q.includes('recharge') || q.includes('top up') || q.includes('topup') || q.includes('balance') || q.includes('pass'))
      return { label: '💳 Open Mo-Wallet', actionType: 'open_wallet' };
    if (q.includes('women') || q.includes('pink') || q.includes('night safe') || q.includes('lady'))
      return { label: '🌸 Women Safety & Pink Hub', actionType: 'open_women_safety' };
    if (q.includes('family') || q.includes('share location') || q.includes('track me') || q.includes('telemetry'))
      return { label: '📡 Share Live Location', actionType: 'open_share_location' };
    if (q.includes('medical') || q.includes('blood') || q.includes('allergies') || q.includes('doctor') || q.includes('hospital'))
      return { label: '🏥 Open Medical Card', actionType: 'open_medical_id' };
    if (q.includes('amenit') || q.includes('nearby') || q.includes('atm') || q.includes('charging') || q.includes('restroom') || q.includes('stop'))
      return { label: '📍 View Nearby Amenities', actionType: 'open_amenities' };
    if (q.includes('alert') || q.includes('incident') || q.includes('strike') || q.includes('flood') || q.includes('traffic delay'))
      return { label: '🔔 View Live Transit Alerts', actionType: 'open_alerts' };
    if (q.includes('trip') || q.includes('history') || q.includes('my trips') || q.includes('record'))
      return { label: '📋 View My Trips History', actionType: 'open_my_trips' };
    if (q.includes('fare') || q.includes('price') || q.includes('cost') || q.includes('ticket') || q.includes('calculator'))
      return { label: '📊 Open Fare Calculator', actionType: 'open_fare' };
    if (q.includes('reward') || q.includes('coin') || q.includes('point') || q.includes('miles'))
      return { label: '🏆 Open Rewards & Miles', actionType: 'open_rewards' };
    if (q.includes('refund') || q.includes('delay') || q.includes('late') || q.includes('assurance'))
      return { label: '🛡️ Claim Instant Refund', actionType: 'open_refund' };
    if (q.includes('student') || q.includes('concession') || q.includes('digilocker') || q.includes('college'))
      return { label: '🎓 Student Concession Hub', actionType: 'open_student' };
    if (q.includes('schedule') || q.includes('commute') || q.includes('daily ride') || q.includes('pre-book'))
      return { label: '📅 Schedule Automated Ride', actionType: 'open_schedule' };
    if (q.includes('support') || q.includes('complaint') || q.includes('lost') || q.includes('helpline'))
      return { label: '💬 Customer Support & Help', actionType: 'open_support' };
    if (q.includes('dark mode') || q.includes('light mode') || q.includes('theme'))
      return { label: '🌓 Toggle Day / Night Theme', actionType: 'toggle_theme' };
    if (q.includes('route') || q.includes('how to reach') || q.includes('directions') || q.includes('travel') || q.includes('bus'))
      return { label: '🗺️ Plan Journey', actionType: 'open_planner' };

    return undefined;
  }

  private fallbackResponse(id: string, q: string, now: string): AIMessage {
    if (q.includes('parcel') || q.includes('locker')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `📦 **Transit Parcel Locker Hub:**\nDeliver and pick up packages securely at transit stations across India with OTP locker access and live SMS alerts.`,
        actionButton: { label: '📦 Open Parcel Hub', actionType: 'open_parcel_booking' },
      };
    }
    if (q.includes('fare') || q.includes('price') || q.includes('cost')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `💳 **Fares Overview (City Corridor ~8km):**\n• City Bus (Non-AC): ₹10–₹20\n• City Bus (AC): ₹20–₹35\n• Metro Rail: ₹20–₹45\n• Shared Auto: ₹30–₹50\n• Prime Cab: ₹80–₹160\n\n*Tip: Use Mo-Wallet for auto-discount passes!*`,
        actionButton: { label: '📊 Open Fare Calculator', actionType: 'open_fare' },
      };
    }
    if (q.includes('metro')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🚇 **Metro Transit Networks:**\nDelhi (395km), Mumbai (80km), Bengaluru (73km), Hyderabad (72km), Kolkata (45km), Chennai (54km), Kochi (26km), Ahmedabad (40km), Pune (12km).\n\n*All lines integrated with QR passes in Musafir!*`,
        actionButton: { label: '🗺️ Plan Journey', actionType: 'open_planner' },
      };
    }
    if (q.includes('reward') || q.includes('coin') || q.includes('miles')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🏆 **Musafir Miles Rewards:**\n• +10 coins per public transit journey\n• 500 coins = 1 Free Day Pass\n• 1000 coins = ₹50 Wallet Recharge`,
        actionButton: { label: '🏆 Open Rewards', actionType: 'open_rewards' },
      };
    }
    if (q.includes('refund') || q.includes('delay') || q.includes('late')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🛡️ **Trip Assurance Guarantee:**\nIf your bus or metro is delayed by 15+ minutes — Musafir grants an instant 100% refund in under 60 seconds back to your wallet.`,
        actionButton: { label: '🛡️ Claim Refund Now', actionType: 'open_refund' },
      };
    }
    if (q.includes('student')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🎓 **Student 50% Concession:**\nVerify with DigiLocker or scan your college ID in the Student Hub to unlock 50% off passes across all Indian transit corridors.`,
        actionButton: { label: '🎓 Verify Student ID', actionType: 'open_student' },
      };
    }
    return {
      id, sender: 'assistant', timestamp: now,
      text: `Namaste! 🙏 I'm **Musafir AI**, your smart India transit companion.\n\nI can do everything within the app for you:\n• 🗺️ Plan journeys & find fastest routes\n• 💳 Open Mo-Wallet & UPI recharge\n• 📦 Book transit parcel lockers\n• 🎓 DigiLocker student 50% concession\n• 🛡️ Claim delay refunds\n• 🌸 Women safety & night-safe routing\n• 🚨 Instant SOS dispatch`,
      actionButton: { label: '🗺️ Plan Journey', actionType: 'open_planner' },
    };
  }

  public clearHistory(): void {
    conversationHistory = [];
  }
}

export const aiAssistantService = new AIAssistantService();
