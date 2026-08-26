import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, HeartPulse, Droplet, Users, Cloud,
  CheckCircle2, ShieldCheck, Plus, Trash2, GraduationCap, Headphones,
  Leaf, Zap, Navigation, History, Clock, ArrowRight
} from 'lucide-react';
import { UserProfile, EmergencyContact } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { authService } from '../../services/supabaseClient';
import { tripService, TripRecord } from '../../services/tripService';
import { TranslationDictionary } from '../../types/i18n';

interface UserProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenStudent: () => void;
  onOpenSupport: () => void;
  t: TranslationDictionary;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenStudent,
  onOpenSupport,
  t,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Parent');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripRecord[]>(tripService.getTrips());

  useEffect(() => {
    tripService.fetchUserTrips().then(setTrips);
  }, []);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    sosService.saveProfile(profile);
    onUpdateProfile(profile);

    // Sync to Supabase if configured
    const res = await authService.updateProfile({ full_name: profile.name });
    setIsSyncing(false);
    setSyncMessage(res.success ? 'Profile saved & synced to Supabase! ✅' : 'Saved locally (connect Supabase for cloud sync)');
    setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    const newC: EmergencyContact = {
      id: 'ec-' + Date.now(),
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation,
    };
    const updated = {
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, newC],
    };
    setProfile(updated);
    sosService.saveProfile(updated);
    onUpdateProfile(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (id: string) => {
    const updated = {
      ...profile,
      emergencyContacts: profile.emergencyContacts.filter((c) => c.id !== id),
    };
    setProfile(updated);
    sosService.saveProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-slate-900 dark:text-white">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-md shadow-blue-500/20">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                Active Commuter
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {profile.phone} • {profile.email}
            </p>
          </div>
        </div>

        {/* Supabase Cloud Sync Action */}
        <button
          onClick={handleSaveAndSync}
          disabled={isSyncing}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
        >
          <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing to Supabase...' : 'Save & Sync Cloud'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* ── Trips Record in Database Section ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                My Trips Record
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanently recorded journeys in Supabase Cloud Database
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-xl">
            {trips.length} Trips Saved
          </span>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-2">
            <Navigation className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No trips recorded yet. Start any route navigation to record your journey!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {trips.map((tr) => (
              <div
                key={tr.id}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-blue-400 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {tr.origin} ➔ {tr.destination}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {tr.mode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>🛣️ {tr.distance_km} km</span>
                    <span>⏱️ {tr.duration_mins} mins</span>
                    <span>💳 ₹{tr.fare_amount}</span>
                    <span className="font-mono text-[10px] text-slate-400">Ref: {tr.booking_reference}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Recorded in DB
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eco-Impact & Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base text-slate-900 dark:text-white flex items-center gap-2 font-bold">
            <Leaf className="w-5 h-5 text-emerald-600" /> Eco-Impact Dashboard
          </h3>
          <span className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-xl font-bold">
            Green Commuter
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold">CO₂ SAVED</p>
            <p className="text-3xl font-extrabold text-emerald-600 font-mono">18.4 <span className="text-sm font-normal text-slate-400">kg</span></p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold">SAVINGS</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">₹640 <span className="text-sm font-normal text-slate-400">saved</span></p>
          </div>
        </div>
      </div>

      {/* Basic Personal Details Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal & Commute Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Full Legal Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Primary Mobile Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Home Commute Address</label>
            <input
              type="text"
              value={profile.homeAddress}
              onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Emergency Medical ID & Blood Group */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
          <HeartPulse className="w-4 h-4" /> Emergency Medical & Blood Card
        </h3>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">Select Blood Group</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setProfile({ ...profile, bloodGroup: bg as UserProfile['bloodGroup'] })}
                className={`py-2 rounded-xl font-bold text-xs border transition font-mono ${
                  profile.bloodGroup === bg
                    ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Medical Conditions / Inhaler</label>
            <input
              type="text"
              value={profile.medicalNotes}
              onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Known Allergies</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Users className="w-4 h-4" /> Emergency SOS Contacts ({profile.emergencyContacts.length})
        </h3>

        <div className="space-y-2">
          {profile.emergencyContacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{c.name} <span className="text-[10px] text-blue-600 dark:text-blue-400">({c.relation})</span></div>
                <div className="text-[11px] text-slate-500 font-mono">{c.phone}</div>
              </div>
              <button
                onClick={() => handleRemoveContact(c.id)}
                className="text-rose-500 hover:text-rose-700 p-1.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={handleAddContact}
            className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenStudent}
          className="bg-white dark:bg-slate-900 hover:border-blue-400 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between transition group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                DigiLocker Student Hub
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                50% concession pass & college ID scanner
              </div>
            </div>
          </div>
          <span className="text-xs text-blue-600 font-bold">Open ➔</span>
        </button>

        <button
          onClick={onOpenSupport}
          className="bg-white dark:bg-slate-900 hover:border-blue-400 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between transition group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                24x7 Customer Support
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Lost & found, fare dispute tickets & helpline
              </div>
            </div>
          </div>
          <span className="text-xs text-purple-600 font-bold">Help ➔</span>
        </button>
      </div>
    </div>
  );
};
