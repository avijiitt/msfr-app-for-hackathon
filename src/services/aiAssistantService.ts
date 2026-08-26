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

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  actionButton?: {
    label: string;
    actionType:
      | 'navigate_tab'
      | 'trigger_sos'
      | 'open_pass'
      | 'open_planner'
      | 'open_amenities'
      | 'open_student'
      | 'open_schedule'
      | 'open_support'
      | 'open_fare'
      | 'open_rewards'
      | 'open_refund';
    payload?: string;
  };
}

// System prompt — makes Gemini an expert Indian transit assistant
const MUSAFIR_SYSTEM_PROMPT = `You are Musafir AI, an expert smart transit assistant built specifically for India.

Your expertise covers:
- Indian public transport: city buses (Mo Bus, DTC, BMTC, BEST, MTC, KSRTC, WBTC, PMPML), Metro Rail (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Kochi, Jaipur, Ahmedabad, Pune, Lucknow, Kanpur, Nagpur), suburban local trains, EV autos, e-rickshaws, shared cabs.
- Indian transit routes, live fare matrices, and multimodal interchange hubs across all Indian states.
- Multi-lingual intelligence: fluent in English, Hindi, Odia, Bengali, Tamil, Telugu, Marathi.
- Musafir app features: 6 smart route modes (Fastest, Cheapest, Eco-Friendly, Senior Citizen, Night Safety, Weather-Aware), Mo-Wallet (₹10,000 max UPI top-up), Parcel Lockers, Automated Ride Scheduling, DigiLocker Student Verification (50% off), Trip Assurance Instant Refunds, and Emergency SOS.

Formatting guidelines:
- Be concise, direct, and helpful (4-6 lines max for standard queries).
- Always use ₹ for Indian Rupees (e.g. ₹20, ₹45).
- For route directions, format cleanly: Origin ➔ Waypoint ➔ Destination.
- For fares, highlight the best value option.
- Tone: Welcoming, sharp, knowledgeable Indian transit companion.`;

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
      const text = `🚨 **Emergency Alert Triggered!**\nYour live GPS coordinates and blood group are ready to transmit to 112 emergency services and family contacts.\n\n📞 Police: 112 | Ambulance: 108 | Women Helpline: 1091`;
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

  /**
   * AI Journey Explainer — Generates smart AI summary for selected route
   */
  public async getRouteAdvice(origin: string, destination: string, mode: string): Promise<string> {
    if (isGeminiConfigured()) {
      try {
        const prompt = `Give a 1-sentence quick transit tip for traveling from ${origin} to ${destination} using ${mode} in India. Include expected rush hour or fare savings tip.`;
        if (ai) {
          const res = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            config: { maxOutputTokens: 100, temperature: 0.6 },
            contents: prompt,
          });
          if (res.text) return res.text.trim();
        }
      } catch {}
    }
    return `✨ AI Tip: Take the primary arterial corridor to save ~12 mins with lowest passenger crowd level.`;
  }

  private detectActionButton(query: string, _response: string): AIMessage['actionButton'] | undefined {
    if (query.includes('fare') || query.includes('price') || query.includes('cost') || query.includes('ticket'))
      return { label: '📊 Compare Fares', actionType: 'open_fare' };
    if (query.includes('reward') || query.includes('coin') || query.includes('point') || query.includes('miles'))
      return { label: '🏆 Open Rewards', actionType: 'open_rewards' };
    if (query.includes('refund') || query.includes('delay') || query.includes('late') || query.includes('cancel'))
      return { label: '🛡️ Claim Refund', actionType: 'open_refund' };
    if (query.includes('student') || query.includes('concession') || query.includes('digilocker'))
      return { label: '🎓 Student Hub', actionType: 'open_student' };
    if (query.includes('schedule') || query.includes('book') || query.includes('plan'))
      return { label: '📅 Schedule Ride', actionType: 'open_schedule' };
    if (query.includes('support') || query.includes('complaint') || query.includes('help'))
      return { label: '💬 Customer Support', actionType: 'open_support' };
    if (query.includes('route') || query.includes('how to reach') || query.includes('directions'))
      return { label: '🗺️ Plan Trip', actionType: 'open_planner' };
    return undefined;
  }

  private fallbackResponse(id: string, q: string, now: string): AIMessage {
    if (q.includes('fare') || q.includes('price') || q.includes('cost')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `💳 **Fares Overview (Corridor ~8km):**\n• City Bus (Non-AC): ₹10–₹20\n• City Bus (AC): ₹20–₹35\n• Metro Rail: ₹20–₹45\n• Shared Auto: ₹30–₹50\n• Prime Cab: ₹80–₹160\n\n*Tip: Use Mo-Wallet for auto-discount passes!*`,
        actionButton: { label: '📊 Compare Fares', actionType: 'open_fare' },
      };
    }
    if (q.includes('metro')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🚇 **Metro Transit Networks:**\nDelhi (395km), Mumbai (80km), Bengaluru (73km), Hyderabad (72km), Kolkata (45km), Chennai (54km), Kochi (26km), Ahmedabad (40km), Pune (12km).\n\n*All lines integrated with QR passes in Musafir!*`,
        actionButton: { label: '🗺️ Plan Metro Trip', actionType: 'open_planner' },
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
      text: `Namaste! 🙏 I'm **Musafir AI**, your intelligent India transit companion.\n\nI can assist you with:\n• 🗺️ Smart multi-modal routes across India\n• 💳 Real fare comparisons (Bus vs Metro vs Cab)\n• 🎓 Student concession passes (50% off)\n• 🛡️ Instant trip delay refunds\n• 🌙 Night-safe & weather-resilient journeys`,
      actionButton: { label: '🗺️ Plan a Trip', actionType: 'open_planner' },
    };
  }

  public clearHistory(): void {
    conversationHistory = [];
  }
}

export const aiAssistantService = new AIAssistantService();
