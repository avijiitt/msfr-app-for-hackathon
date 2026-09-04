import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, X, Clock, ShieldCheck, WifiOff, AlertTriangle, 
  ArrowRight, Users, Bus, RefreshCw, KeyRound, Sparkles, 
  CheckCircle2, Info, ChevronRight, UserCheck
} from 'lucide-react';
import { 
  ticketSecurityService, 
  TransitTicket, 
  DynamicQRPayload, 
  DEMO_TICKETS 
} from '../../services/ticketSecurityService';

interface DynamicTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConductorScanner?: () => void;
}

export const DynamicTicketModal: React.FC<DynamicTicketModalProps> = ({
  isOpen,
  onClose,
  onOpenConductorScanner,
}) => {
  const [activeTicket, setActiveTicket] = useState<TransitTicket>(() => ticketSecurityService.getActiveTicket());
  const [payload, setPayload] = useState<DynamicQRPayload | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
  const [isRotating, setIsRotating] = useState(false);

  const lastWindowRef = useRef<number>(-1);

  // Periodic tick: recalculates window every 500ms and updates countdown
  useEffect(() => {
    if (!isOpen) return;

    const updateTicketState = async () => {
      const now = Date.now();
      const currentPayload = ticketSecurityService.generateDynamicTicketPayload(activeTicket, now);
      setSecondsRemaining(currentPayload.secondsRemaining);
      setCurrentTimestamp(new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Regenerate QR image only when window advances (every 15 seconds)
      if (currentPayload.window !== lastWindowRef.current) {
        lastWindowRef.current = currentPayload.window;
        setIsRotating(true);
        try {
          const url = await ticketSecurityService.generateQRCodeDataUrl(currentPayload);
          setQrDataUrl(url);
          setPayload(currentPayload);
        } catch (e) {
          console.error('Failed to generate QR code data URL', e);
        } finally {
          setTimeout(() => setIsRotating(false), 400);
        }
      }
    };

    updateTicketState();
    const interval = setInterval(updateTicketState, 500);
    return () => clearInterval(interval);
  }, [isOpen, activeTicket]);

  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 15) * 100));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 text-white rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Anti-Screenshot Watermark Ribbon (Moving Animation) */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden h-6 bg-gradient-to-r from-blue-600/30 via-emerald-600/30 to-indigo-600/30 border-b border-white/10 flex items-center">
          <div className="whitespace-nowrap animate-marquee text-[10px] font-mono tracking-widest text-slate-300 flex items-center gap-6">
            <span>🛡️ ANTI-SCREENSHOT ROTATING TOKEN</span>
            <span>PASSENGER: {activeTicket.passengerName.toUpperCase()}</span>
            <span>LIVE CLOCK: {currentTimestamp}</span>
            <span>SIH ANTI-FRAUD ENGINE ACTIVE</span>
          </div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Dynamic Transit Pass</h3>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Offline TOTP-Cryptographic Pass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Ticket Switcher Pills (for SIH Evaluator Review) */}
        <div className="bg-slate-800/80 rounded-2xl p-1.5 flex items-center gap-1 border border-slate-700/60">
          {DEMO_TICKETS.map((tkt, index) => (
            <button
              key={tkt.id}
              onClick={() => {
                setActiveTicket(tkt);
                ticketSecurityService.setActiveTicket(tkt);
                lastWindowRef.current = -1; // force QR recalculation
              }}
              className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold transition truncate ${
                activeTicket.id === tkt.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              Route {tkt.routeNumber}
            </button>
          ))}
        </div>

        {/* The Digital Ticket Card */}
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-950/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col items-center gap-3 relative">
          
          {/* Route & Booking Info */}
          <div className="w-full flex items-center justify-between border-b border-slate-700/60 pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold block uppercase tracking-wider">
                {activeTicket.busType} CORRIDOR • {activeTicket.category}
              </span>
              <span className="text-sm font-black text-white">{activeTicket.routeName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">TICKET REF</span>
              <span className="text-xs font-mono font-bold text-amber-400">{activeTicket.bookingCode}</span>
            </div>
          </div>

          {/* From ➔ To Stops */}
          <div className="w-full bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-800">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Boarding</span>
              <span className="text-xs font-bold text-white truncate block">{activeTicket.origin}</span>
            </div>
            <div className="px-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="min-w-0 flex-1 text-right">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Destination</span>
              <span className="text-xs font-bold text-white truncate block">{activeTicket.destination}</span>
            </div>
          </div>

          {/* Dynamic Rotating QR Code Canvas Box */}
          <div className="relative mt-1 group">
            <div className={`p-3 bg-white rounded-2xl shadow-2xl transition-transform duration-300 ${
              isRotating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
            }`}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Musafir Dynamic Transit QR"
                  className="w-52 h-52 object-contain rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-lg">
                  <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Corner Crosshairs for Scanner Vibe */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500 pointer-events-none"></div>
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500 pointer-events-none"></div>
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500 pointer-events-none"></div>
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500 pointer-events-none"></div>
          </div>

          {/* 15-Second Holographic Countdown Bar */}
          <div className="w-full space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Rotates in:
              </span>
              <span className={`px-1.5 py-0.5 rounded-md ${
                secondsRemaining <= 4 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {secondsRemaining}s
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  secondsRemaining <= 4
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 6-Digit TOTP Emergency Passkey (Low-Light & Cracked Screen Rescue) */}
          <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Emergency 6-Digit Passkey</span>
            </div>
            <div className="text-2xl font-mono font-black tracking-[0.35em] text-white bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              {payload ? payload.otp.slice(0, 3) + ' ' + payload.otp.slice(3) : '------'}
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-tight">
              Cracked screen or low light? State this 6-digit code to the conductor.
            </p>
          </div>

          {/* Passenger & Fare Summary */}
          <div className="w-full flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">PASSENGER</span>
              <span className="font-bold text-slate-200">{activeTicket.passengerName} ({activeTicket.passengerCount} Pax)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">FARE PAID</span>
              <span className="font-black text-emerald-400 text-sm">₹{activeTicket.fareAmount}</span>
            </div>
          </div>
        </div>

        {/* 100% Offline Trust Badge */}
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-300">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-[11px]">100% Offline Verified</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Works inside tunnels and no-signal zones without internet. Screenshots expire automatically in 15 seconds.
            </p>
          </div>
        </div>

        {/* Conductor ETM Terminal Link */}
        {onOpenConductorScanner && (
          <button
            onClick={() => {
              onClose();
              onOpenConductorScanner();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <UserCheck className="w-4 h-4" />
            <span>Open Conductor ETM Handheld Terminal</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        )}
      </div>
    </div>
  );
};
