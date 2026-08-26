import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const isGeminiConfigured = (): boolean =>
  GEMINI_API_KEY.length > 10 && !GEMINI_API_KEY.includes('your-gemini');

let ai: GoogleGenAI | null = null;
if (isGeminiConfigured()) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
- Indian public transport: city buses (OSRTC, BMTC, DTC, KSRTC, etc.), Metro (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Kochi, Jaipur, Ahmedabad, Pune, Nagpur, Bhubaneswar upcoming), suburban trains, auto-rickshaws, e-rickshaws, shared cabs
- Indian cities, routes, fare structures, and transit schedules
- Regional languages: can understand queries in Hindi and Odia (respond in English unless asked otherwise)
- Musafir app features: 6 route modes (Fastest, Cheapest, Eco-Friendly, Senior Citizen, Night Safety, Weather-Aware), Wallet (max ₹10,000 UPI), Parcel Hub, Schedule Rides, DigiLocker Student Verification, Musafir Miles Rewards, Trip Assurance refunds, SOS emergency

Formatting rules:
- Keep responses concise (max 4-5 lines for simple queries)
- Use ₹ for Indian rupees, not Rs or INR
- Use 24-hour time for schedules (e.g., "09:30")  
- For routes, format as: Origin → Stop1 → Destination
- For fares, always compare at least 2 modes
- Never make up specific bus numbers or timings you're not sure about — say "check live updates in the app"

Personality: Friendly, helpful, and efficient. Speak like a knowledgeable local friend, not a robot.`;

// Conversation history for context (last 10 messages)
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

    // ── Emergency shortcut (always instant, no AI needed) ──────────────────
    const q = query.toLowerCase();
    if (q.includes('sos') || q.includes('emergency') || (q.includes('help') && q.includes('danger'))) {
      const text = `🚨 **Emergency detected!**\nCalling SOS now — your live GPS and blood group are being sent to 112 and your family contacts.\n\n📞 Police: 112 | Ambulance: 108 | Women Helpline: 1091`;
      conversationHistory.push({ role: 'model', parts: [{ text }] });
      return {
        id,
        sender: 'assistant',
        text,
        timestamp: now,
        actionButton: { label: '🚨 Launch Emergency SOS', actionType: 'trigger_sos' },
      };
    }

    // ── Try Gemini AI ───────────────────────────────────────────────────────
    if (ai && isGeminiConfigured()) {
      try {
        let fullText = '';

        if (onStream) {
          // Streaming mode
          const stream = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 400 },
            contents: conversationHistory,
          });

          for await (const chunk of stream) {
            const chunkText = chunk.text || '';
            fullText += chunkText;
            onStream(fullText);
          }
        } else {
          // Non-streaming
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: MUSAFIR_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 400 },
            contents: conversationHistory,
          });
          fullText = response.text || '';
        }

        conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });

        // Detect if action button is needed based on response content
        const actionButton = this.detectActionButton(q, fullText);

        return { id, sender: 'assistant', text: fullText, timestamp: now, actionButton };
      } catch (err) {
        console.warn('Gemini API error, using fallback:', err);
      }
    }

    // ── Offline / Fallback keyword matching ────────────────────────────────
    return this.fallbackResponse(id, q, now);
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
    // Rich keyword-based fallback responses
    if (q.includes('fare') || q.includes('price') || q.includes('cost')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `💳 **Typical Fares (City Corridor ~8km):**\n• City Bus (Non-AC): ₹10–₹20\n• City Bus (AC): ₹20–₹35\n• Metro Rail: ₹20–₹45\n• Suburban Train: ₹5–₹15\n• Shared Auto: ₹30–₹60\n• App Cab (OLA/Uber): ₹80–₹180\n\n*Tip: Add Gemini API key for city-specific real fares!*`,
        actionButton: { label: '📊 Compare Fares', actionType: 'open_fare' },
      };
    }
    if (q.includes('metro')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🚇 **Metro Systems in India:**\nDelhi (395km), Mumbai (80km), Bengaluru (73km), Hyderabad (72km), Kolkata (45km), Chennai (54km), Kochi (26km), Jaipur (12km), Ahmedabad (40km), Pune (12km).\n\nBhubaneswar Metro is under construction (Phase 1: 26km).\n\n*For exact routes, add Gemini API key for AI-powered answers!*`,
        actionButton: { label: '🗺️ Plan Metro Trip', actionType: 'open_planner' },
      };
    }
    if (q.includes('reward') || q.includes('coin') || q.includes('miles')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🏆 **Musafir Miles Rewards:**\n• Earn +10 coins per trip\n• Daily streak = 1.5x multiplier\n• 500 coins = 1 Free Day Pass\n• 1000 coins = ₹50 wallet credit`,
        actionButton: { label: '🏆 Open Rewards', actionType: 'open_rewards' },
      };
    }
    if (q.includes('refund') || q.includes('delay') || q.includes('late')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🛡️ **Trip Assurance Guarantee:**\nIf your bus or metro is delayed 15+ minutes — Musafir gives you a 100% instant refund in under 60 seconds back to your wallet.`,
        actionButton: { label: '🛡️ Claim Refund Now', actionType: 'open_refund' },
      };
    }
    if (q.includes('student')) {
      return {
        id, sender: 'assistant', timestamp: now,
        text: `🎓 **Student Concession — 50% Off:**\nVerify your student ID via DigiLocker or AI OCR scan to unlock half-price passes on all city buses and metros across India.`,
        actionButton: { label: '🎓 Verify Student ID', actionType: 'open_student' },
      };
    }
    // Default
    return {
      id, sender: 'assistant', timestamp: now,
      text: `Namaste! 🙏 I'm **Musafir AI**, your smart India transit companion.\n\nI can help you with:\n• 🗺️ Best routes between any two places in India\n• 💳 Real fare comparisons across bus, metro, train\n• 🎓 Student concession verification\n• 🛡️ Trip delay refunds\n• 🌧️ Weather-aware & night-safe routes\n\n*Connect a Gemini API key for full AI-powered answers!*`,
      actionButton: { label: '🗺️ Plan a Trip', actionType: 'open_planner' },
    };
  }

  public clearHistory(): void {
    conversationHistory = [];
  }
}

export const aiAssistantService = new AIAssistantService();
