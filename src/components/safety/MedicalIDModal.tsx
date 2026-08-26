import React, { useState } from 'react';
import { HeartPulse, Droplet, QrCode, Save, ShieldAlert, X } from 'lucide-react';
import { UserProfile } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { TranslationDictionary } from '../../types/i18n';

interface MedicalIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  t: TranslationDictionary;
}

export const MedicalIDModal: React.FC<MedicalIDModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  t,
}) => {
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup);
  const [medicalNotes, setMedicalNotes] = useState(userProfile.medicalNotes);
  const [allergies, setAllergies] = useState(userProfile.allergies);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: UserProfile = {
      ...userProfile,
      bloodGroup: bloodGroup as UserProfile['bloodGroup'],
      medicalNotes,
      allergies,
    };
    onUpdateProfile(updated);
    sosService.saveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.medicalId || 'Emergency Medical & Blood Card'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Tap First-Responder Transit Telemetry
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

        {/* Blood Group Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-rose-600" /> Select Blood Group
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setBloodGroup(bg as UserProfile['bloodGroup'])}
                className={`py-2.5 rounded-xl font-bold text-xs font-mono transition border ${
                  bloodGroup === bg
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Medical Notes & Allergies Form */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Critical Medical Conditions (e.g. Asthma, Diabetes, Heart Condition)
            </label>
            <input
              type="text"
              placeholder="e.g. Asthma (carries inhaler in bag)"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Known Allergies (Medications / Food)
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
            Medical Card Saved Successfully!
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Medical Card
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
