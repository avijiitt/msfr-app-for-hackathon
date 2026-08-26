import React, { useState } from 'react';
import { HeartPulse, Droplet, QrCode, Save, ShieldAlert } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-rose-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.medicalId}
              </h2>
              <p className="text-xs text-slate-400">
                Paramedic & First Responder Emergency Card
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

        {/* Blood Group Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-rose-400" /> Select Blood Group
          </label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setBloodGroup(bg as UserProfile['bloodGroup'])}
                className={`py-2.5 rounded-xl font-bold text-sm border transition ${
                  bloodGroup === bg
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Known Medical Conditions / Medications:
          </label>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Mild Asthma, Diabetic, Pacemaker..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Allergies */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Known Allergies (Food / Medicines):
          </label>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. Penicillin, Peanuts, Sulfa drugs..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Emergency First Responder Notice */}
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-[11px] text-rose-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>
            This information is securely embedded into your Emergency SOS broadcast to ambulance paramedics (108) and attending trauma centers.
          </span>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? 'Saved Successfully!' : 'Save Medical Card & ICE QR'}</span>
        </button>
      </div>
    </div>
  );
};
