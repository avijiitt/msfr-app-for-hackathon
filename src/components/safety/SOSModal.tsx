import React, { useState, useEffect } from 'react';
import { Shield, PhoneCall, HeartPulse, Send, AlertOctagon, Volume2, VolumeX, CheckCircle, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 text-slate-900 dark:text-white space-y-5 border-2 border-rose-500 shadow-2xl transition-colors">
        {/* Header Title with Pulsing Beacon */}
        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {t.sosTitle || 'Emergency SOS Network'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant Emergency Dispatch & Live GPS Broadcast
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleAlarm}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isAlarmPlaying
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isAlarmPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAlarmPlaying ? 'Mute Siren' : 'Play Siren'}</span>
          </button>
        </div>

        {/* Live Coordinates & Dispatch Badge */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/50 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800 dark:text-rose-300">Live GPS Coordinates:</span>
            <span className="font-mono font-bold text-rose-900 dark:text-white bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-600">
              {currentCoords[0].toFixed(5)}° N, {currentCoords[1].toFixed(5)}° E
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800 dark:text-rose-300">Nearest Landmark:</span>
            <span className="font-bold text-slate-900 dark:text-white">{nearestStationName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800 dark:text-rose-300">Dispatch Reference:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-cyan-300">{dispatchDetails?.dispatchId || 'SOS-ACTIVE'}</span>
          </div>
        </div>

        {/* Helplines Dispatched List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> Direct Emergency Helplines Alerted
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Police (112)</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">GPS Transmitted</div>
              </div>
              <a href="tel:112" className="p-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px]">Call</a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Ambulance (108)</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Medical Ready</div>
              </div>
              <a href="tel:108" className="p-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px]">Call</a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Women Helpline (1091)</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Priority Line</div>
              </div>
              <a href="tel:1091" className="p-1.5 bg-rose-600 text-white rounded-lg font-bold text-[10px]">Call</a>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Alerted */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-blue-600" /> Family Emergency Contacts SMS Dispatched
          </h3>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {userProfile.emergencyContacts.length === 0 ? (
              <div className="text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                No custom family contacts added. (Configure in Settings)
              </div>
            ) : (
              userProfile.emergencyContacts.map((c) => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">{c.phone}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> SMS Sent
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancelSOS}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-md transition"
        >
          Cancel SOS Alert & Silence Siren
        </button>
      </div>
    </div>
  );
};
