import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, HeartPulse, Droplet, Users, Cloud, RefreshCw, CheckCircle2, ShieldCheck, QrCode, Plus, Trash2, GraduationCap, Headphones, Award, Leaf, Zap, Flame } from 'lucide-react';
import { UserProfile, EmergencyContact } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { authService } from '../../services/supabaseClient';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Parent');

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    sosService.saveProfile(profile);
    onUpdateProfile(profile);

    // Sync to Supabase if configured
    const res = await authService.updateProfile({ full_name: profile.name });
    setIsSyncing(false);
    setSyncMessage(res.success ? 'Profile saved successfully! ✅' : 'Saved locally (connect Supabase for cloud sync)');
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
      emergencyContacts: profile.emergencyContacts.filter(c => c.id !== id),
    };
    setProfile(updated);
    sosService.saveProfile(updated);
    onUpdateProfile(updated);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20">
      {/* Profile Hero Card with Cyberpunk Avatar */}
      <div className="glass-panel p-6 rounded-3xl border border-primary/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ambient-glow-primary">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-3xl font-black text-primary border-2 border-primary shadow-[0_0_15px_rgba(250,189,0,0.3)]">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-on-surface font-headline-md">{profile.name}</h2>
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 rounded-full font-bold font-label-caps">
                Elite Commuter
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
              {profile.phone} • {profile.email}
            </p>
          </div>
        </div>

        {/* Supabase Cloud Sync Action */}
        <button
          onClick={handleSaveAndSync}
          disabled={isSyncing}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container font-bold text-xs shadow-lg shadow-tertiary-container/30 transition flex items-center justify-center gap-2 font-label-caps"
        >
          <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync Supabase Cloud'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="bg-tertiary-container/20 border border-tertiary-fixed/40 rounded-2xl p-3.5 text-xs text-tertiary-fixed font-bold flex items-center gap-2 animate-in zoom-in-95 font-label-caps">
          <CheckCircle2 className="w-4 h-4 text-tertiary-fixed flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Eco-Impact Dashboard Card (From Mockup) */}
      <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-tertiary-container space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-lg text-on-surface flex items-center gap-2 font-bold">
            <Leaf className="w-5 h-5 text-tertiary-container" /> Eco-Impact Dashboard
          </h3>
          <span className="text-xs text-tertiary-container bg-tertiary-container/10 px-2.5 py-1 rounded font-bold font-label-caps">
            Top 10% Commuter
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-xl p-4 border border-surface-variant">
            <p className="text-xs text-on-surface-variant mb-1 font-label-caps">CO₂ SAVED</p>
            <p className="text-3xl font-extrabold text-tertiary-container font-mono">18.4 <span className="text-sm font-normal text-on-surface-variant">kg</span></p>
          </div>
          <div className="bg-surface-container rounded-xl p-4 border border-surface-variant">
            <p className="text-xs text-on-surface-variant mb-1 font-label-caps">RIDES COMPLETED</p>
            <p className="text-3xl font-extrabold text-on-surface font-mono">42 <span className="text-sm font-normal text-on-surface-variant">this month</span></p>
          </div>
        </div>

        <div>
          <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider mb-2">Recent Achievements</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-xl border border-tertiary/30">
              <span className="text-xl">🌿</span>
              <div>
                <div className="text-xs font-bold text-tertiary">Green Guardian</div>
                <div className="text-[10px] text-on-surface-variant">50kg offset goal</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-xl border border-primary/30">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs font-bold text-primary">7-Day Streak</div>
                <div className="text-[10px] text-on-surface-variant">Daily Mo Bus Commuter</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Personal Details Form */}
      <div className="glass-panel p-5 rounded-3xl border border-primary/20 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-label-caps">
          <User className="w-4 h-4 text-primary" /> Personal & Commute Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Full Legal Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-surface-container border border-primary/20 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Primary Mobile Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-surface-container border border-primary/20 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-surface-container border border-primary/20 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Home Commute Address</label>
            <input
              type="text"
              value={profile.homeAddress}
              onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
              className="w-full bg-surface-container border border-primary/20 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Emergency Medical ID & Blood Group */}
      <div className="glass-panel p-5 rounded-3xl border border-secondary/30 space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2 font-label-caps">
          <HeartPulse className="w-4 h-4 text-secondary" /> Emergency Medical & Blood Card
        </h3>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-on-surface-variant block">Select Blood Group</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setProfile({ ...profile, bloodGroup: bg as UserProfile['bloodGroup'] })}
                className={`py-2 rounded-xl font-bold text-xs border transition font-mono ${
                  profile.bloodGroup === bg
                    ? 'bg-secondary-container border-secondary text-white shadow-lg glow-ambient-pink'
                    : 'bg-surface-container border-primary/15 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Medical Conditions / Inhaler</label>
            <input
              type="text"
              value={profile.medicalNotes}
              onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
              className="w-full bg-surface-container border border-secondary/30 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Known Allergies</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              className="w-full bg-surface-container border border-secondary/30 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="glass-panel p-5 rounded-3xl border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-label-caps">
            <Users className="w-4 h-4 text-primary" /> Emergency SOS Contacts ({profile.emergencyContacts.length})
          </h3>
        </div>

        <div className="space-y-2">
          {profile.emergencyContacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-surface-container border border-primary/10 p-3 rounded-2xl text-xs">
              <div>
                <div className="font-bold text-on-surface">{c.name} <span className="text-[10px] text-tertiary font-label-caps">({c.relation})</span></div>
                <div className="text-[11px] text-on-surface-variant font-mono">{c.phone}</div>
              </div>
              <button
                onClick={() => handleRemoveContact(c.id)}
                className="text-secondary hover:text-secondary-fixed p-1.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-primary/10">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="bg-surface-container border border-primary/20 rounded-xl p-2 text-xs text-on-surface focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            className="bg-surface-container border border-primary/20 rounded-xl p-2 text-xs text-on-surface focus:outline-none font-mono"
          />
          <button
            onClick={handleAddContact}
            className="py-2 rounded-xl bg-surface-bright hover:bg-surface-variant text-primary font-bold text-xs border border-primary/30 flex items-center justify-center gap-1 font-label-caps"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenStudent}
          className="glass-panel hover:border-tertiary/40 p-4 rounded-2xl border border-primary/20 text-left flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-on-surface group-hover:text-tertiary transition">
                DigiLocker Student Hub
              </div>
              <div className="text-xs text-on-surface-variant">
                50% concession pass & college ID scanner
              </div>
            </div>
          </div>
          <span className="text-xs text-tertiary font-bold font-label-caps">Open ➔</span>
        </button>

        <button
          onClick={onOpenSupport}
          className="glass-panel hover:border-primary/40 p-4 rounded-2xl border border-primary/20 text-left flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-on-surface group-hover:text-primary transition">
                24x7 Customer Support
              </div>
              <div className="text-xs text-on-surface-variant">
                Lost & found, fare dispute tickets & helpline
              </div>
            </div>
          </div>
          <span className="text-xs text-primary font-bold font-label-caps">Help ➔</span>
        </button>
      </div>
    </div>
  );
};
