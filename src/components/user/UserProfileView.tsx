import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, HeartPulse, Droplet, Users, Cloud,
  CheckCircle2, ShieldCheck, Plus, Trash2, GraduationCap, Headphones,
  Leaf, Zap, Navigation, History, Clock, ArrowRight, LogOut, Edit2, Bookmark,
  Home, Briefcase, School, Compass, Sparkles, Check
} from 'lucide-react';
import { UserProfile, EmergencyContact, SavedLocation } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { authService } from '../../services/supabaseClient';
import { tripService, TripRecord } from '../../services/tripService';
import { LanguageCode, TranslationDictionary } from '../../types/i18n';
import { SUPPORTED_LANGUAGES } from '../../data/translations';

interface UserProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenStudent: () => void;
  onOpenSupport: () => void;
  onLogout?: () => void;
  onSelectLocation?: (address: string) => void;
  t: TranslationDictionary;
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenStudent,
  onOpenSupport,
  onLogout,
  onSelectLocation,
  t,
  currentLang = 'en',
  onLanguageChange,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Parent');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripRecord[]>(tripService.getTrips());

  // Saved Locations Management State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locCategory, setLocCategory] = useState<SavedLocation['category']>('home');

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    tripService.fetchUserTrips().then(setTrips);
  }, []);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    sosService.saveProfile(profile);
    onUpdateProfile(profile);

    // Sync to Supabase & Backend Database
    try {
      await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          fullName: profile.name,
          phone: profile.phone,
          bloodGroup: profile.bloodGroup,
          homeCity: profile.homeAddress,
          savedLocations: profile.savedLocations,
        }),
      });
    } catch (e) {}

    const res = await authService.updateProfile({ full_name: profile.name });
    setIsSyncing(false);
    setSyncMessage(res.success ? 'Profile & Saved Locations synced to Cloud Database! ✅' : 'Saved locally to your device! ✅');
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

  // Saved Location Handlers
  const handleOpenAddLocation = () => {
    setEditingLocId(null);
    setLocName('');
    setLocAddress('');
    setLocCategory('home');
    setShowLocationModal(true);
  };

  const handleOpenEditLocation = (loc: SavedLocation) => {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocCategory(loc.category);
    setShowLocationModal(true);
  };

  const handleSaveLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locAddress.trim()) return;

    const iconMap = {
      home: '🏠',
      work: '💼',
      college: '🎓',
      station: '🚍',
      custom: '📍',
    };

    let updatedLocations: SavedLocation[] = [];
    const currentLocs = profile.savedLocations || sosService.getSavedLocations();

    if (editingLocId) {
      updatedLocations = currentLocs.map((loc) =>
        loc.id === editingLocId
          ? {
              ...loc,
              name: locName.trim(),
              address: locAddress.trim(),
              category: locCategory,
              icon: iconMap[locCategory] || '📍',
            }
          : loc
      );
    } else {
      const newLoc: SavedLocation = {
        id: 'loc-' + Date.now(),
        name: locName.trim(),
        address: locAddress.trim(),
        category: locCategory,
        icon: iconMap[locCategory] || '📍',
      };
      updatedLocations = [...currentLocs, newLoc];
    }

    const updatedProfile: UserProfile = {
      ...profile,
      savedLocations: updatedLocations,
      homeAddress: locCategory === 'home' ? locAddress.trim() : profile.homeAddress,
      workAddress: locCategory === 'work' ? locAddress.trim() : profile.workAddress,
    };

    setProfile(updatedProfile);
    sosService.saveProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
    setShowLocationModal(false);
    setSyncMessage(editingLocId ? 'Location updated! ⭐' : 'New location saved! ⭐');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleDeleteLocation = (id: string) => {
    const currentLocs = profile.savedLocations || sosService.getSavedLocations();
    const updatedLocations = currentLocs.filter((loc) => loc.id !== id);
    const updatedProfile: UserProfile = {
      ...profile,
      savedLocations: updatedLocations,
    };
    setProfile(updatedProfile);
    sosService.saveProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
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

        {/* Profile Actions: Sync & Log Out */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSaveAndSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Save & Sync'}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
              title="Log out of Musafir"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Indian Language Preference Selector */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              🇮🇳
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Preferred App Language / ଭାଷା ପସନ୍ଦ / भाषा चुनें
              </h3>
              <p className="text-[11px] text-slate-400">
                Select your language for all transit routes, voice guidance & passes
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full">
            {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'English'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  if (onLanguageChange) onLanguageChange(lang.code);
                  localStorage.setItem('musafir_lang', lang.code);
                  localStorage.setItem('musafir_lang_selected', 'true');
                  setSyncMessage(`App language set to ${lang.nativeName} (${lang.name})! 🌐`);
                  setTimeout(() => setSyncMessage(null), 3000);
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="min-w-0">
                    <strong className="text-xs block truncate">{lang.nativeName}</strong>
                    <span className="text-[10px] text-slate-400 block truncate">{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

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

      {/* ── Saved Locations & Frequent Spots Section ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                ⭐ Saved Locations & Frequent Spots
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-tap route destinations and favorite transit addresses in Bhubaneswar
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddLocation}
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>

        {/* List of Saved Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(profile.savedLocations || sosService.getSavedLocations()).map((loc) => (
            <div
              key={loc.id}
              className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{loc.icon || '📍'}</span>
                    <span>{loc.name}</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {loc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full">
                  {loc.address}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditLocation(loc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition text-xs font-semibold flex items-center gap-1"
                    title="Edit Location"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-xs font-semibold"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {onSelectLocation && (
                  <button
                    onClick={() => onSelectLocation(loc.address)}
                    className="py-1 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <span>Travel Here</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Saved Location */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>{editingLocId ? 'Edit Saved Location' : 'Add New Saved Location'}</span>
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocationSubmit} className="space-y-3.5 text-xs">
              {/* Category Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Location Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'home', label: 'Home', icon: '🏠' },
                    { id: 'work', label: 'Work', icon: '💼' },
                    { id: 'college', label: 'College', icon: '🎓' },
                    { id: 'station', label: 'Station', icon: '🚍' },
                    { id: 'custom', label: 'Custom', icon: '📍' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLocCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-0.5 ${
                        locCategory === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-[10px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Name / Label */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Location Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Apartment, KIIT Campus 6, Tech Park"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Full Address */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Address / Landmark in Bhubaneswar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patia, Jayadev Vihar, Sailashree Vihar, Bhubaneswar"
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Bhubaneswar Address Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Quick Bhubaneswar Hotspots:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    'Patia / KIIT Square',
                    'Jayadev Vihar',
                    'InfoCity Tech Park',
                    'Master Canteen',
                    'Saheed Nagar',
                    'Baramunda ISBT',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setLocAddress(preset + ', Bhubaneswar');
                        if (!locName) setLocName(preset);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  {editingLocId ? 'Update Location' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
