import React, { useState, useEffect } from 'react';
import { Shield, PhoneCall, HeartPulse, Send, AlertOctagon, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { UserProfile, EmergencyContact } from '../../types/transit';
import { audioService } from '../../services/audioService';
import { sosService } from '../../services/sosService';
import { TranslationDictionary } from '../../types/i18n';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentCoords: [number, number];
  nearestStationName: string;
  t: TranslationDictionary;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentCoords,
  nearestStationName,
  t,
}) => {
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(true);
  const [dispatchDetails, setDispatchDetails] = useState<{
    dispatchId: string;
    alertMessage: string;
    helplinesNotified: string[];
    familyContactsNotified: EmergencyContact[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const details = sosService.triggerEmergencySOS(currentCoords, nearestStationName);
      setDispatchDetails(details);
      setIsAlarmPlaying(true);
    } else {
      sosService.cancelEmergencySOS();
      setIsAlarmPlaying(false);
    }
  }, [isOpen, currentCoords, nearestStationName]);

  const handleToggleAlarm = () => {
    if (isAlarmPlaying) {
      audioService.stopSiren();
      setIsAlarmPlaying(false);
    } else {
      audioService.startSiren();
      setIsAlarmPlaying(true);
    }
  };

  const handleCancelSOS = () => {
    sosService.cancelEmergencySOS();
    setIsAlarmPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-xl w-full glass-panel-danger rounded-3xl p-5 sm:p-7 text-white space-y-5 border-2 border-rose-500/50 shadow-2xl shadow-rose-900/50">
        {/* Header Title with Pulsing Beacon */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50 animate-pulse">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight">
                {t.sosTitle}
              </h2>
              <p className="text-xs text-rose-200/80">
                SIH26198 Instant Emergency Network
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleAlarm}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isAlarmPlaying
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            {isAlarmPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAlarmPlaying ? 'Mute Siren' : 'Play Siren'}</span>
          </button>
        </div>

        {/* Live Coordinates & Dispatch Badge */}
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300">Live GPS Coordinates:</span>
            <span className="font-mono font-bold text-white bg-rose-900/80 px-2 py-0.5 rounded border border-rose-400/30">
              {currentCoords[0].toFixed(5)}° N, {currentCoords[1].toFixed(5)}° E
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300">Nearest Landmark:</span>
            <span className="font-bold text-white">{nearestStationName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300">Dispatch Reference:</span>
            <span className="font-mono text-cyan-300">{dispatchDetails?.dispatchId || 'SOS-ACTIVE'}</span>
          </div>
        </div>

        {/* Helplines Dispatched List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> Direct Emergency Helplines Alerted
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Police (112)</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Live GPS Sent
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-pink-300">Women (1091)</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Broadcasted
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-red-300">Ambulance (108)</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Alert Queued
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical ID Quick Summary */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-lg">
            {userProfile.bloodGroup}
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Medical Emergency Card Attached</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {userProfile.medicalNotes} • Allergies: {userProfile.allergies}
            </p>
          </div>
        </div>

        {/* Family Contacts SMS Broadcast Preview */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-cyan-400" /> Family SMS Broadcast ({userProfile.emergencyContacts.length} Contacts)
          </h3>
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-white/10 text-[11px] text-slate-300 font-mono space-y-1">
            {userProfile.emergencyContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-slate-300">
                <span>{c.name} ({c.phone})</span>
                <span className="text-emerald-400">● SMS Delivered</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Cancel or Direct Call */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleCancelSOS}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 transition"
          >
            I am Safe now (Cancel SOS)
          </button>

          <a
            href="tel:112"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 text-center transition flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" /> Call 112 Directly
          </a>
        </div>
      </div>
    </div>
  );
};
