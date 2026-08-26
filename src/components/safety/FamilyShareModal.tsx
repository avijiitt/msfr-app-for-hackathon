import React, { useState } from 'react';
import { Share2, Users, Plus, Trash2, Copy, Check, ShieldCheck, MapPin } from 'lucide-react';
import { UserProfile, EmergencyContact } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { TranslationDictionary } from '../../types/i18n';

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  t: TranslationDictionary;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Parent');

  if (!isOpen) return null;

  const shareInfo = sosService.generateFamilyShareLink();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareInfo.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddContact = () => {
    if (!newName || !newPhone) return;
    const newContact: EmergencyContact = {
      id: 'ec-' + Date.now(),
      name: newName,
      phone: newPhone,
      relation: newRelation,
    };
    const updated = {
      ...userProfile,
      emergencyContacts: [...userProfile.emergencyContacts, newContact],
    };
    onUpdateProfile(updated);
    sosService.saveProfile(updated);
    setNewName('');
    setNewPhone('');
  };

  const handleRemoveContact = (id: string) => {
    const updated = {
      ...userProfile,
      emergencyContacts: userProfile.emergencyContacts.filter(c => c.id !== id),
    };
    onUpdateProfile(updated);
    sosService.saveProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.familyLocationSharing}
              </h2>
              <p className="text-xs text-slate-400">
                End-to-End Encrypted Live Transit Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Active Commute Share Link:
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">● Active for 4h</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
            <span className="truncate flex-1 text-cyan-200">{shareInfo.link}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1 transition shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Family members can view your live bus/metro vehicle location, arrival ETAs, and battery status without installing an app.
          </p>
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Trusted Emergency Contacts
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {userProfile.emergencyContacts.length} Contacts
            </span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {userProfile.emergencyContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-white">{c.name} <span className="text-[10px] text-cyan-400 font-normal">({c.relation})</span></div>
                  <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                </div>
                <button
                  onClick={() => handleRemoveContact(c.id)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Contact Form */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
          <span className="text-xs font-bold text-slate-300 block">Add New Emergency Contact</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <select
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend / Roommate</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>
          <button
            onClick={handleAddContact}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Emergency Broadcast Network</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};
