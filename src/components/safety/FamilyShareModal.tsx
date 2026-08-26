import React, { useState } from 'react';
import { Share2, Users, Plus, Trash2, Copy, Check, ShieldCheck, MapPin, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.familyLocationSharing || 'Live Family Safety & Telemetry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-End Encrypted Live Transit Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Active Commute Share Link:
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
              ● Active for 4h
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200">
            <span className="truncate flex-1 font-semibold">{shareInfo.link}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Family members can view your live bus/metro vehicle location, arrival ETAs, and battery status without installing an app.
          </p>
        </div>

        {/* Emergency Contacts List (With visible side scrollbar) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" /> Trusted Emergency Contacts
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {userProfile.emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-sm"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {contact.name} <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">({contact.relation})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{contact.phone}</div>
                </div>

                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  className="text-rose-500 hover:text-rose-700 p-1.5"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Contact Inputs */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone (+91)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <select
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            <button
              onClick={handleAddContact}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Trusted Contact
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
