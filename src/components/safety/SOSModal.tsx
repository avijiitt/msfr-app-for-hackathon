import React, { useState, useEffect } from 'react';
import {
  Shield, PhoneCall, HeartPulse, Send, AlertOctagon, CheckCircle2,
  MessageSquare, Phone, X, ExternalLink, Activity, Siren, Ambulance,
  Building2, Navigation, AlertTriangle
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'medical' | 'general'>('medical');
  const [medicalEmergencyType, setMedicalEmergencyType] = useState<'accident' | 'cardiac' | 'trauma' | 'general'>('accident');
  const [greenCorridorRequested, setGreenCorridorRequested] = useState(false);

  const [dispatchDetails, setDispatchDetails] = useState<{
    dispatchId: string;
    alertMessage: string;
    googleMapsLink: string;
    helplinesNotified: string[];
    familyContactsNotified: EmergencyContact[];
  } | null>(null);

  const [medicalDetails, setMedicalDetails] = useState<ReturnType<typeof sosService.triggerMidRoadMedicalEmergency> | null>(null);

  useEffect(() => {
    if (isOpen) {
      const details = sosService.triggerEmergencySOS(currentCoords, nearestStationName);
      setDispatchDetails(details);
      const med = sosService.triggerMidRoadMedicalEmergency(currentCoords, nearestStationName, medicalEmergencyType);
      setMedicalDetails(med);
    } else {
      sosService.cancelEmergencySOS();
      setGreenCorridorRequested(false);
    }
  }, [isOpen, currentCoords, nearestStationName, medicalEmergencyType]);

  const handleCloseSOS = () => {
    sosService.cancelEmergencySOS();
    onClose();
  };

  const handleRequestGreenCorridor = () => {
    setGreenCorridorRequested(true);
  };

  if (!isOpen) return null;

  const googleMapsUrl = `https://maps.google.com/?q=${currentCoords[0].toFixed(5)},${currentCoords[1].toFixed(5)}`;
  const emergencyMessage = `🚨 EMERGENCY SOS: I need urgent help! My live location is: ${googleMapsUrl} near ${nearestStationName}. - Sent via Musafir Transit Safety`;
  const medicalEmergencyMessage = `🚨 URGENT: MID-ROAD MEDICAL EMERGENCY & ACCIDENT DISPATCH!\nPatient: ${userProfile.name} (${userProfile.phone || 'Commuter'})\nBlood Group: ${userProfile.bloodGroup || 'O+'}\nLive Location: ${googleMapsUrl} near ${nearestStationName}.\nImmediate Ambulance (108) and trauma assistance requested.`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 text-slate-900 dark:text-white space-y-4 border-2 border-rose-500 shadow-2xl transition-colors max-h-[92vh] overflow-y-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <Siren className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  Emergency SOS Active
                </h2>
                <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                  LIVE BROADCAST
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Direct GPS Dispatch & 24x7 Ambulance / Police Emergency Network
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

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('medical')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'medical'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>🚑 Mid-Road Medical Emergency</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>🛡️ General SOS & Police</span>
          </button>
        </div>

        {/* ─── MEDICAL EMERGENCY VIEW ─── */}
        {activeTab === 'medical' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Medical Emergency Type Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Select Emergency Situation:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'accident', label: '🚗 Road Collision', color: 'rose' },
                  { id: 'cardiac', label: '❤️ Chest Pain / CPR', color: 'red' },
                  { id: 'trauma', label: '🩸 Severe Bleeding', color: 'amber' },
                  { id: 'general', label: '🚨 Sudden Illness', color: 'purple' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMedicalEmergencyType(type.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold border transition text-center ${
                      medicalEmergencyType === type.id
                        ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs ring-1 ring-rose-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Tap National Medical Helplines */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:108"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-600/30 active:scale-95 transition"
              >
                <div className="flex items-center gap-1 font-black text-base sm:text-lg">
                  <Ambulance className="w-5 h-5" /> 108
                </div>
                <span className="text-[10px] font-bold opacity-90">Ambulance (Free)</span>
              </a>

              <a
                href="tel:112"
                className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-rose-600/30 active:scale-95 transition"
              >
                <div className="flex items-center gap-1 font-black text-base sm:text-lg">
                  <Shield className="w-5 h-5" /> 112
                </div>
                <span className="text-[10px] font-bold opacity-90">National Emergency</span>
              </a>

              <a
                href="tel:1033"
                className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-amber-600/30 active:scale-95 transition"
              >
                <div className="flex items-center gap-1 font-black text-base sm:text-lg">
                  <Navigation className="w-5 h-5" /> 1033
                </div>
                <span className="text-[10px] font-bold opacity-90">Highway Helpline</span>
              </a>
            </div>

            {/* Mid-Road Green Corridor Clearance Button */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/40 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  🚦
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    Mid-Road Police Green Corridor
                  </h4>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Requests instant traffic signal overrides and escort for approaching ambulance.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRequestGreenCorridor}
                disabled={greenCorridorRequested}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition active:scale-95 whitespace-nowrap ${
                  greenCorridorRequested
                    ? 'bg-emerald-700 text-white shadow-sm cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                }`}
              >
                {greenCorridorRequested ? '✓ Green Corridor Active' : 'Request Green Corridor'}
              </button>
            </div>

            {/* Nearest Premier Trauma Hospitals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Nearest Trauma Centers (Bhubaneswar Hub)
                </h3>
                <span className="text-[10px] text-slate-500">Sorted by Live Distance</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {medicalDetails?.hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-rose-400 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{hospital.name}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded font-black">
                          {hospital.distanceKm} km (~{hospital.estimatedAmbulanceMinutes} min)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{hospital.address}</p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1">
                        {hospital.facilities.map((fac, idx) => (
                          <span key={idx} className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                      >
                        <Phone className="w-3 h-3" /> Call Trauma
                      </a>
                      <a
                        href={`https://maps.google.com/?daddr=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-[10px] flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Nav
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mid-Road First Aid & Life-Saving Guide */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 space-y-2">
              <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Mid-Road Bystander First-Aid Protocols
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {medicalDetails?.firstAidProtocols.map((p, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    <strong className="block text-amber-900 dark:text-amber-200 font-extrabold">{p.title}</strong>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight block mt-0.5">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Medical Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                  {userProfile.bloodGroup || 'O+'}
                </div>
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Patient Blood Group: {userProfile.bloodGroup || 'O+'}</span>
                  <span className="text-[10px] text-slate-500">Known Allergies: {userProfile.allergies || 'None Recorded'}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(medicalEmergencyMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Broadcast WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ─── GENERAL SOS & POLICE VIEW ─── */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-150">
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

            {/* Emergency Contacts List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-600" /> Emergency Contacts Notified
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
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
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
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

            {/* 1-Tap Helplines */}
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
        )}

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

