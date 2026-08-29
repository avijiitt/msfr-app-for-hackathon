import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, X, Loader2, Mic, MicOff, Volume2, VolumeX, 
  ArrowRight, ShieldAlert, Package, Wallet, Calculator, Award, RotateCcw, 
  GraduationCap, Calendar, Headphones, Navigation, MapPin
} from 'lucide-react';
import { aiAssistantService, AIMessage, AIActionType } from '../../services/aiAssistantService';
import { TranslationDictionary } from '../../types/i18n';

interface PopupAIAssistantProps {
  onExecuteAction: (actionType: AIActionType, payload?: string) => void;
  t?: TranslationDictionary;
  currentLang?: string;
}

export const PopupAIAssistant: React.FC<PopupAIAssistantProps> = ({
  onExecuteAction,
  t,
  currentLang = 'en',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: t?.aiTagline
        ? `Namaste! 🙏 ${t.aiAssistantName || 'Musafir AI'} — ${t.aiTagline}\n\n• "${t.aiSuggestedPrompt1}"\n• "${t.aiSuggestedPrompt2}"\n• "${t.aiSuggestedPrompt3}"`
        : 'Namaste! 🙏 I\'m **Musafir AI** — your smart voice-enabled Indian transit operator.\n\nTalk to me or ask anything:\n• "Book a parcel at Jayadev Vihar"\n• "Open my wallet / recharge ₹500"\n• "Find fastest bus to KIIT Square"\n• "Check student 50% discount"\n• "Emergency SOS / Women Safety"',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English / Hindi mix

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow mic in browser.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('Could not recognize voice. Try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (!isVoiceOutputEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // stop current speech
      // Clean markdown symbols for natural speech
      const cleaned = text
        .replace(/[*_#`~[\]()]/g, '')
        .replace(/➔/g, 'to')
        .replace(/₹/g, 'Rupees ');

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select an English or Indian voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) || voices.find(v => v.lang.startsWith('en'));
      if (indianVoice) utterance.voice = indianVoice;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Mic start failed:', err);
        }
      } else {
        setSpeechError('Voice recognition not supported in this browser. Please type your query.');
      }
    }
  };

  const handleSend = async (overrideText?: string, wasSpoken = false) => {
    const query = (overrideText || inputText).trim();
    if (!query || isThinking) return;

    const userMsg: AIMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    const streamId = 'msg-s-' + Date.now();
    let streamingText = '';

    try {
      const result = await aiAssistantService.generateResponse(
        query,
        'en',
        (chunk: string) => {
          streamingText = chunk;
          setMessages(prev => {
            const existing = prev.find(m => m.id === streamId);
            if (existing) {
              return prev.map(m => m.id === streamId ? { ...m, text: chunk } : m);
            } else {
              return [...prev, {
                id: streamId,
                sender: 'assistant' as const,
                text: chunk,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isStreaming: true,
              }];
            }
          });
        }
      );

      const finalMsg = { ...result, text: result.text || streamingText };

      setMessages(prev => {
        const withoutStream = prev.filter(m => m.id !== streamId);
        return [...withoutStream, finalMsg];
      });

      // Speak output aloud if voice is enabled or user spoke
      if (isVoiceOutputEnabled || wasSpoken) {
        speakText(finalMsg.text);
      }
    } catch {
      const errText = 'Sorry, I had trouble connecting. Please try again.';
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: errText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      if (isVoiceOutputEnabled) speakText(errText);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionClick = (actionType: AIActionType, payload?: string) => {
    setIsOpen(false);
    onExecuteAction(actionType, payload);
  };

  const quickPrompts = [
    { label: '📦 Book Parcel', query: 'Book a transit parcel locker' },
    { label: '💳 Open Wallet', query: 'Open Mo-Wallet and check balance' },
    { label: '🗺️ Plan Route', query: 'Best route from Jayadev Vihar to KIIT Square' },
    { label: '🎓 Student 50% Off', query: 'How to get student concession pass?' },
    { label: '🛡️ Women Safety', query: 'Show women reserved pink buses and safety hub' },
    { label: '🛡️ Claim Refund', query: 'My bus was delayed by 20 minutes, refund claim' },
  ];

  return (
    <>
      {/* Floating Launcher Bubble (Hidden on mobile to avoid overlapping CTAs, bottom-6 right-6 on desktop) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed hidden md:flex bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-xl shadow-blue-600/40 items-center gap-2 transition-all animate-bounce"
          title="Open Musafir AI Voice & Chat Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base">
            🤖
          </div>
          <span>Musafir AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}


      {/* Popup Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[9999] w-[calc(100vw-24px)] sm:w-[410px] max-h-[85vh] h-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-sm">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Musafir AI Assistant</span>
                  <span className="text-[10px] bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 px-1.5 py-0.2 rounded-full font-mono font-bold">
                    Voice + App Control
                  </span>
                </h4>
                <span className="text-[11px] text-blue-100 flex items-center gap-1">
                  ● Ready to execute all in-app tasks
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Output Speaker Toggle */}
              <button
                onClick={() => {
                  const next = !isVoiceOutputEnabled;
                  setIsVoiceOutputEnabled(next);
                  if (!next && window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className={`p-1.5 rounded-xl transition ${
                  isVoiceOutputEnabled ? 'bg-white/20 text-white' : 'bg-black/20 text-white/60'
                }`}
                title={isVoiceOutputEnabled ? 'Mute AI Voice Output' : 'Enable AI Voice Output'}
              >
                {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-400 whitespace-nowrap transition shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="p-2 px-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="font-bold text-xs ml-2">✕</button>
            </div>
          )}

          {/* Chat Messages Body (With visible side scrollbar) */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Dynamic Action Trigger Button */}
                  {m.actionButton && (
                    <button
                      onClick={() => handleActionClick(m.actionButton!.actionType, m.actionButton!.payload)}
                      className="mt-2.5 w-full py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{m.actionButton.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isThinking && (
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Musafir AI is processing & executing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening Pulsing Banner */}
          {isListening && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span>Listening... Speak your command in English or Hindi</span>
              </div>
              <button
                onClick={toggleListening}
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold"
              >
                Stop
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full transition shadow-sm flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600'
              }`}
              title={isListening ? 'Stop voice recording' : 'Speak to Musafir AI (Voice Input)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask anything or say 'open wallet'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
