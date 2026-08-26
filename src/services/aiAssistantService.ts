export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    actionType: 'navigate_tab' | 'trigger_sos' | 'open_pass' | 'open_planner' | 'open_amenities' | 'open_student' | 'open_schedule' | 'open_support' | 'open_fare' | 'open_rewards' | 'open_refund';
    payload?: string;
  };
}

class AIAssistantService {
  public generateResponse(query: string, language: string): AIMessage {
    const q = query.toLowerCase().trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = 'msg-' + Date.now();

    // 1. SOS / Emergency Queries
    if (q.includes('sos') || q.includes('emergency') || q.includes('help') || q.includes('danger') || q.includes('112') || q.includes('blood') || q.includes('ambulance') || q.includes('police')) {
      return {
        id,
        sender: 'assistant',
        text: `🚨 **Emergency Support Active:**\nIf you are in immediate danger or medical distress, tap the Emergency SOS button immediately.\n\n• **Police Control Room:** 112\n• **Women Safety Helpline:** 1091\n• **Ambulance / Emergency Medical:** 108\n• **Nearest Trauma Center:** AIIMS Emergency Blood Bank (120m away)\n\nYour blood group and live GPS will be instantly broadcast to 112 and your family.`,
        timestamp: now,
        actionButton: {
          label: '🚨 Launch Emergency SOS',
          actionType: 'trigger_sos',
        },
      };
    }

    // 2. Fare Comparison & Rates
    if (q.includes('fare') || q.includes('price') || q.includes('ticket') || q.includes('rate') || q.includes('cost') || q.includes('compare')) {
      return {
        id,
        sender: 'assistant',
        text: `💳 **All Available Fares in this Corridor:**\n\n• **City Bus (AC/Standard):** ₹10 – ₹25\n• **Metro Rail (Rapid):** ₹20 – ₹40\n• **Suburban Local Train:** ₹5 – ₹15\n• **Shared Auto / E-Rickshaw:** ₹30 – ₹60\n• **Shared Cab / Bike Taxi:** ₹45 – ₹140\n\nTap below to compare real-time fares for any custom route in India!`,
        timestamp: now,
        actionButton: {
          label: '📊 Open Fare Calculator',
          actionType: 'open_fare',
        },
      };
    }

    // 3. Rewards / Loyalty Coins
    if (q.includes('reward') || q.includes('coin') || q.includes('point') || q.includes('mile') || q.includes('free pass') || q.includes('discount')) {
      return {
        id,
        sender: 'assistant',
        text: `🏆 **Musafir Miles Rewards:**\nYou have **480 Musafir Coins** available!\n\n• Earn +10 Coins on every transit booking\n• Maintain daily streaks for a 1.5x coin multiplier\n• Redeem for Free 1-Day Passes and EV Auto vouchers.`,
        timestamp: now,
        actionButton: {
          label: '🏆 Open Rewards Hub',
          actionType: 'open_rewards',
        },
      };
    }

    // 4. Trip Assurance & Delay Refunds
    if (q.includes('refund') || q.includes('delay') || q.includes('cancel') || q.includes('assurance') || q.includes('breakdown') || q.includes('missed')) {
      return {
        id,
        sender: 'assistant',
        text: `🛡️ **100% Punctuality Trip Assurance:**\nIf your bus or metro is delayed by more than 15 minutes or suffers a mechanical breakdown, Musafir gives you a **100% instant refund** credited back to your wallet in under 60 seconds.`,
        timestamp: now,
        actionButton: {
          label: '🛡️ Claim Instant Refund',
          actionType: 'open_refund',
        },
      };
    }

    // 5. Student DigiLocker Verification
    if (q.includes('student') || q.includes('digilocker') || q.includes('college') || q.includes('ocr')) {
      return {
        id,
        sender: 'assistant',
        text: `🎓 **Student Concession & DigiLocker Hub:**\n\nVerify your student status with DigiLocker or AI OCR ID card scan to unlock a **50% flat concession** on monthly and daily transit passes across India.`,
        timestamp: now,
        actionButton: {
          label: '🎓 Open Student Verification Hub',
          actionType: 'open_student',
        },
      };
    }

    // Default Greeting
    return {
      id,
      sender: 'assistant',
      text: `Namaste! I am Musafir AI, your smart multi-modal transit intelligence companion. I can help you find the fastest route, compare metro vs bus fares, verify student passes, claim delay refunds, or track vehicles in real time.`,
      timestamp: now,
      actionButton: {
        label: '🗺️ Plan Multi-Modal Trip',
        actionType: 'open_planner',
      },
    };
  }
}

export const aiAssistantService = new AIAssistantService();
