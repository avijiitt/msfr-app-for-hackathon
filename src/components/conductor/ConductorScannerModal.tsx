import React, { useState, useEffect } from 'react';
import { 
  Scan, X, CheckCircle2, AlertTriangle, XCircle, 
  Volume2, ShieldAlert, Users, IndianRupee, KeyRound, 
  Sparkles, RefreshCw, Smartphone, Bus, Camera, 
  Clock, RotateCcw, Award, Check
} from 'lucide-react';
import { 
  ticketSecurityService, 
  ValidationResult, 
  ShiftStats, 
  DEMO_TICKETS 
} from '../../services/ticketSecurityService';

interface ConductorScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPassengerTicket?: () => void;
}

export const ConductorScannerModal: React.FC<ConductorScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenPassengerTicket,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('10');
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [shiftStats, setShiftStats] = useState<ShiftStats>(() => ticketSecurityService.getShiftStats());
  const [activeTab, setActiveTab] = useState<'camera' | 'keypad' | 'tests'>('tests');
  
  // 6-digit manual passkey state
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [manualInputString, setManualInputString] = useState<string>('');
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setShiftStats(ticketSecurityService.getShiftStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleValidate = (input: string) => {
    const result = ticketSecurityService.validateTicketOffline(input, selectedRoute !== 'ALL' ? selectedRoute : undefined);
    setLastResult(result);
    setShiftStats(ticketSecurityService.getShiftStats());

    if (soundEnabled) {
      if (result.isValid) {
        ticketSecurityService.playValidationTone('valid');
      } else if (result.status === 'ALREADY_SCANNED') {
        ticketSecurityService.playValidationTone('already_scanned');
      } else {
        ticketSecurityService.playValidationTone('invalid');
      }
    }
  };

  // 1-Click SIH Judge Tests
  const handleTestValidScan = () => {
    const active = ticketSecurityService.getActiveTicket();
    const payload = ticketSecurityService.generateDynamicTicketPayload(active);
    handleValidate(JSON.stringify(payload));
  };

  const handleTestDuplicateScan = () => {
    // Re-verify the active ticket to trigger double-tap detection
    const active = ticketSecurityService.getActiveTicket();
    const payload = ticketSecurityService.generateDynamicTicketPayload(active);
    handleValidate(JSON.stringify(payload));
  };

  const handleTestExpiredScreenshot = () => {
    const expiredPayload = ticketSecurityService.generateExpiredScreenshotPayload(DEMO_TICKETS[1]);
    handleValidate(expiredPayload);
  };

  const handleTestTamperedTicket = () => {
    const tamperedPayload = ticketSecurityService.generateTamperedPayload(DEMO_TICKETS[2]);
    handleValidate(tamperedPayload);
  };

  const handleResetShift = () => {
    if (confirm('Reset current conductor shift history and counters?')) {
      ticketSecurityService.resetShift();
      setShiftStats(ticketSecurityService.getShiftStats());
      setLastResult(null);
      setKeypadInput('');
    }
  };

  // Numeric keypad key press
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setKeypadInput('');
      return;
    }
    if (val === 'BACK') {
      setKeypadInput(prev => prev.slice(0, -1));
      return;
    }
    if (keypadInput.length < 6) {
      const next = keypadInput + val;
      setKeypadInput(next);
      if (next.length === 6) {
        // Auto-submit when 6 digits entered
        handleValidate(next);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700 text-white rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight text-white uppercase font-mono">
                  CRUT ETM Terminal
                </h3>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  OFFLINE 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Electronic Ticket Machine • Device #OD-CRUT-82A</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition ${
                soundEnabled 
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Scanner Audio Enabled' : 'Scanner Audio Muted'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operating Route Selector & Shift Stats Pill */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center gap-1">
              <Bus className="w-3 h-3 text-blue-400" />
              Conductor Bus Route
            </span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-1.5 font-bold outline-none focus:border-blue-500"
            >
              <option value="10">Route 10: Master Canteen ➔ Nandankanan</option>
              <option value="11">Route 11: Rly Stn ➔ Badambadi</option>
              <option value="24">Route 24: Baramunda ➔ AIIMS</option>
              <option value="ALL">All Routes (Interchange Check)</option>
            </select>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center justify-between">
              <span>Shift Metrics</span>
              <button 
                onClick={handleResetShift} 
                className="text-[9px] text-slate-500 hover:text-rose-400 transition"
                title="Reset shift"
              >
                Reset
              </button>
            </span>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-emerald-400" title="Valid Passengers">{shiftStats.totalPassengers} Pax</span>
              <span className="text-blue-400" title="Fare Collected">₹{shiftStats.totalFareCollected}</span>
              <span className="text-rose-400" title="Fraud / Duplicates Blocked">{shiftStats.fraudBlocked} Blocked</span>
            </div>
          </div>
        </div>

        {/* SIH Judge Simulation 1-Click Testing Suite */}
        <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              SIH Judge Demonstration Suite (1-Click)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Offline Cryptographic Engine</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTestValidScan}
              className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>🧪 Scan Valid Ticket</span>
            </button>

            <button
              onClick={handleTestDuplicateScan}
              className="py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 active:scale-98 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>⚠️ Test Double-Tap</span>
            </button>

            <button
              onClick={handleTestExpiredScreenshot}
              className="py-2 px-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-700/20 active:scale-98 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>🛑 Test Old Screenshot</span>
            </button>

            <button
              onClick={handleTestTamperedTicket}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>🛡️ Test Fake/Tampered</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-800 p-1 text-xs font-bold border border-slate-700">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scanner View
          </button>
          <button
            onClick={() => setActiveTab('keypad')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              activeTab === 'keypad' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>6-Digit Keypad</span>
          </button>
        </div>

        {/* Tab Content: Keypad View */}
        {activeTab === 'keypad' && (
          <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex flex-col items-center gap-3">
            <div className="text-center">
              <span className="text-[11px] text-slate-400 block font-mono">
                EMERGENCY MANUAL PASSKEY ENTRY
              </span>
              <div className="text-2xl font-mono font-black tracking-[0.4em] text-white mt-1 h-9 flex items-center justify-center">
                {keypadInput.padEnd(6, '•')}
              </div>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className={`py-2.5 rounded-xl font-mono text-sm font-black transition active:scale-95 ${
                    key === 'CLEAR'
                      ? 'bg-slate-800 text-rose-400 text-xs'
                      : key === 'BACK'
                      ? 'bg-slate-800 text-amber-400 text-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-white text-base shadow-sm'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Scanner View / Simulated Camera Frame */}
        {activeTab === 'tests' && (
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser-scan shadow-[0_0_12px_#34d399] pointer-events-none"></div>

            <div className="w-36 h-36 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-2 relative">
              <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Scanner Active</span>
              
              {/* Corner crosshairs */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
              Align commuter's dynamic QR code inside the target reticle
            </p>
          </div>
        )}

        {/* Instant Validation Result Card */}
        {lastResult && (
          <div className={`rounded-2xl p-3.5 border shadow-xl flex flex-col gap-2 animate-in zoom-in-95 duration-150 ${
            lastResult.status === 'VALID'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
              : lastResult.status === 'ALREADY_SCANNED'
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-100'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {lastResult.status === 'VALID' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
                {lastResult.status === 'ALREADY_SCANNED' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
                {lastResult.status !== 'VALID' && lastResult.status !== 'ALREADY_SCANNED' && (
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                    <XCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {lastResult.status === 'VALID' && 'BOARDING APPROVED'}
                    {lastResult.status === 'ALREADY_SCANNED' && 'DUPLICATE SCAN DETECTED'}
                    {lastResult.status === 'EXPIRED_SCREENSHOT' && 'EXPIRED SCREENSHOT / FAKE'}
                    {lastResult.status === 'INVALID_SIGNATURE' && 'INVALID CRYPTOGRAPHIC TOKEN'}
                    {lastResult.status === 'ROUTE_MISMATCH' && 'INCORRECT BUS ROUTE'}
                  </h4>
                  <p className="text-[11px] opacity-90">{lastResult.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-75">{lastResult.scannedAt}</span>
            </div>

            {/* Scanned Ticket Attributes */}
            {lastResult.ticket && (
              <div className="bg-black/30 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="opacity-70 text-[9px] block">PASSENGER & ROUTE</span>
                  <span className="font-bold">
                    {lastResult.ticket.passengerName || 'Passenger'} • Rte {lastResult.ticket.routeNumber || selectedRoute}
                  </span>
                </div>
                <div className="text-right">
                  <span className="opacity-70 text-[9px] block">FARE</span>
                  <span className="font-black text-sm">₹{lastResult.ticket.fareAmount || 15}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Switch to Passenger Pass Viewer */}
        {onOpenPassengerTicket && (
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-800">
            <span className="text-slate-400 text-[11px]">Testing as Commuter?</span>
            <button
              onClick={() => {
                onClose();
                onOpenPassengerTicket();
              }}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition"
            >
              <span>View Dynamic Passenger Ticket 🎟️</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
