import React, { useState, useEffect } from 'react';
import { Shield, PhoneCall, HeartPulse, Send, AlertOctagon, CheckCircle2, MessageSquare, Phone, X, ExternalLink } from 'lucide-react';
import { UserProfile, EmergencyContact } from '../../types/transit';
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
  const [dispatchDetails, setDispatchDetails] = useState<{
    dispatchId: string;
    alertMessage: string;
    googleMapsLink: string;
    helplinesNotified: string[];
    familyContactsNotified: EmergencyContact[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const details = sosService.triggerEmergencySOS(currentCoords, nearestStationName);
      setDispatchDetails(details);
    } else {
      sosService.cancelEmergencySOS();
    }
  }, [isOpen, currentCoords, nearestStationName]);

  const handleCloseSOS = () => {
    sosService.cancelEmergencySOS();
    onClose();
  };

  if (!isOpen) return null;

  const googleMapsUrl = `https://maps.google.com/?q=${currentCoords[0].toFixed(5)},${currentCoords[1].toFixed(5)}`;
  const emergencyMessage = `🚨 EMERGENCY SOS: I need urgent help! My live location is: ${googleMapsUrl} near ${nearestStationName}. - Sent via Musafir Transit Safety`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 text-slate-900 dark:text-white space-y-5 border-2 border-rose-500 shadow-2xl transition-colors">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40">
              <AlertOctagon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {t.sosTitle || 'Emergency SOS Active'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Live GPS Broadcast & Direct Contact Notification Dispatched
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseSOS}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl p-3 sm:p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">SOS Alert Message Dispatched</strong>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
              Live coordinates and emergency message have been sent to your emergency contacts via SMS and network broadcast.
            </p>
          </div>
        </div>

        {/* Live Coordinates & Landmark Badge */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Live GPS Coordinates:</span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{currentCoords[0].toFixed(5)}° N, {currentCoords[1].toFixed(5)}° E</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Nearest Landmark:</span>
            <span className="font-bold text-slate-900 dark:text-white">{nearestStationName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Dispatch Reference:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{dispatchDetails?.dispatchId || 'SOS-ACTIVE'}</span>
          </div>
        </div>

        {/* Emergency Contacts List & Quick Actions */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-blue-600" /> Emergency Contacts Notified
          </h3>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {userProfile.emergencyContacts.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                Default emergency alert sent to Musafir Transit Central Desk (112). You can add personal family contacts in Profile Settings.
              </div>
            ) : (
              userProfile.emergencyContacts.map((c) => {
                const cleanPhone = c.phone.replace(/\D/g, '');
                const waUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(emergencyMessage)}`;
                const smsUrl = `sms:${c.phone}?body=${encodeURIComponent(emergencyMessage)}`;

                return (
                  <div
                    key={c.id}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 sm:p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          ✓ Message Sent
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{c.phone} ({c.relation})</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                      <a
                        href={smsUrl}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                      >
                        <Send className="w-3 h-3" /> SMS
                      </a>
                      <a
                        href={`tel:${c.phone}`}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 1-Tap Direct Emergency Helplines */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> 1-Tap Emergency Helplines
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <a
              href="tel:112"
              className="bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition active:scale-98"
            >
              <span className="font-black text-rose-600 dark:text-rose-400 text-xs sm:text-sm">112</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Police SOS</span>
            </a>

            <a
              href="tel:108"
              className="bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition active:scale-98"
            >
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">108</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Ambulance</span>
            </a>

            <a
              href="tel:1091"
              className="bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition active:scale-98"
            >
              <span className="font-black text-purple-600 dark:text-purple-400 text-xs sm:text-sm">1091</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Women Safety</span>
            </a>
          </div>
        </div>

        {/* Dismiss / Close Button */}
        <button
          onClick={handleCloseSOS}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-md transition"
        >
          Dismiss SOS Alert
        </button>
      </div>
    </div>
  );
};
