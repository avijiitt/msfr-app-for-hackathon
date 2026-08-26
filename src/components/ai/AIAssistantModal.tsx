import React, { useState } from 'react';
import { Bot, Send, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import { aiAssistantService, AIMessage } from '../../services/aiAssistantService';
import { TranslationDictionary } from '../../types/i18n';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  t: TranslationDictionary;
  onTriggerSOS?: () => void;
  onOpenWallet?: () => void;
  onOpenPlanner?: () => void;
  onOpenAmenities?: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  t,
  onTriggerSOS,
  onOpenWallet,
  onOpenPlanner,
  onOpenAmenities,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: 'Namaste! 🙏 I\'m Musafir AI. How can I help you navigate India today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: AIMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputQuery('');

    const botMsg = await aiAssistantService.generateResponse(q, language);
    setMessages([...newMsgs, botMsg]);
  };


  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage('What is the fastest Mo Bus to Patia right now?');
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleActionClick = (actionType: string) => {
    onClose();
    if (actionType === 'trigger_sos' && onTriggerSOS) onTriggerSOS();
    if (actionType === 'open_pass' && onOpenWallet) onOpenWallet();
    if (actionType === 'open_planner' && onOpenPlanner) onOpenPlanner();
    if (actionType === 'open_amenities' && onOpenAmenities) onOpenAmenities();
  };

  const samplePrompts = [
    'Fastest bus to KIIT Square?',
    'Any bus delays on Route 10?',
    'Emergency SOS & Blood info',
    'Nearby grocery stores?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="max-w-2xl w-full glass-panel rounded-3xl p-5 sm:p-6 text-on-surface space-y-4 border border-tertiary-fixed/30 shadow-2xl ambient-glow-teal flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-fixed/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center ai-pulse border border-tertiary-fixed shadow-[0_0_15px_rgba(133,246,229,0.3)]">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {t.aiAssistantName || 'TransitMitra AI'}
              </h2>
              <span className="text-[10px] text-tertiary-fixed font-label-caps tracking-widest uppercase flex items-center gap-1">
                ● Online • Real-time Data Active
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant text-sm border border-primary/20"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-bright border border-primary/20 text-on-surface-variant hover:text-primary whitespace-nowrap transition text-[11px] font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-surface-bright text-on-surface border border-surface-variant rounded-tr-sm shadow-md'
                    : 'bg-surface-container/70 border border-tertiary-fixed/30 text-on-surface rounded-tl-sm shadow-md relative'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="absolute -left-1 top-0 w-1 h-full bg-tertiary-fixed rounded-full opacity-60"></div>
                )}
                <div className="whitespace-pre-line">{m.text}</div>

                {m.actionButton && (
                  <button
                    onClick={() => handleActionClick(m.actionButton!.actionType)}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs shadow-md transition flex items-center gap-1.5 font-label-caps"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{m.actionButton.label}</span>
                  </button>
                )}
              </div>
              <span className="text-[9px] text-on-surface-variant font-mono mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}
        </div>

        {/* Voice listening status */}
        {isListening && (
          <div className="bg-tertiary-container/20 border border-tertiary-fixed/40 p-2.5 rounded-xl text-xs text-tertiary-fixed font-bold flex items-center justify-center gap-2 animate-pulse font-label-caps">
            <Mic className="w-4 h-4" />
            <span>Listening in Odia / English... Speak your query</span>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-primary/15"
        >
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-3 rounded-full border transition flex items-center justify-center ${
              isListening
                ? 'bg-secondary text-on-secondary border-secondary animate-pulse'
                : 'bg-surface-container text-tertiary-fixed border-tertiary-fixed/30 hover:bg-surface-bright'
            }`}
            title="Voice input in Odia or English"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={t.askTransitAI || 'Type or tap mic to speak in Odia/English...'}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-surface-container border border-primary/20 rounded-full py-3 px-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-tertiary-fixed/50 placeholder:text-on-surface-variant/50 font-medium"
          />

          <button
            type="submit"
            className="p-3 rounded-full bg-primary hover:bg-primary-fixed text-on-primary font-bold shadow-lg shadow-primary/20 transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
