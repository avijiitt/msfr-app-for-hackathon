import React, { useState } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, X, ChevronDown, MessageSquare, Zap } from 'lucide-react';
import { aiAssistantService, AIMessage } from '../../services/aiAssistantService';

interface PopupAIAssistantProps {
  onOpenFareMatrix?: () => void;
  onOpenRewards?: () => void;
  onOpenTripAssurance?: () => void;
  onOpenSOS?: () => void;
}

export const PopupAIAssistant: React.FC<PopupAIAssistantProps> = ({
  onOpenFareMatrix,
  onOpenRewards,
  onOpenTripAssurance,
  onOpenSOS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: 'Namaste! I am Musafir AI, your personal multi-modal travel assistant across India. How can I help you navigate today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = (overrideText?: string) => {
    const query = overrideText || inputText;
    if (!query.trim()) return;

    const userMsg: AIMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');

    setTimeout(() => {
      const botResponse = aiAssistantService.generateResponse(query, 'en');
      setMessages([...updated, botResponse]);
    }, 450);
  };

  const handleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSend('What is the fastest route to KIIT Square right now?');
      }, 1800);
    } else {
      setIsListening(false);
    }
  };

  const quickPrompts = [
    'Fastest route to KIIT Square?',
    'Compare bus vs metro fare',
    'How to claim delayed refund?',
    'Redeem Musafir Coins',
  ];

  return (
    <>
      {/* Floating Launcher Bubble (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-xl shadow-blue-600/40 flex items-center gap-2.5 transition-all animate-bounce"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base">
            🤖
          </div>
          <span>Musafir AI</span>
        </button>
      )}

      {/* Popup Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] max-h-[580px] h-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Musafir AI Assistant</h4>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  ● Live Transit Intelligence Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 whitespace-nowrap transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {m.actionButton && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (m.actionButton!.actionType === 'open_fare' && onOpenFareMatrix) onOpenFareMatrix();
                        if (m.actionButton!.actionType === 'open_rewards' && onOpenRewards) onOpenRewards();
                        if (m.actionButton!.actionType === 'trigger_sos' && onOpenSOS) onOpenSOS();
                        if (m.actionButton!.actionType === 'open_refund' && onOpenTripAssurance) onOpenTripAssurance();
                      }}
                      className="mt-2 px-3 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{m.actionButton.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isListening && (
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-bold flex items-center gap-2 animate-pulse">
                <Mic className="w-4 h-4" />
                <span>Listening in Hindi / Odia / English...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={handleVoice}
              className={`p-2.5 rounded-full border transition ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Voice assistant"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask anything about routes, fares, traffic..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
