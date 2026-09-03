import React, { useState } from 'react';
import { 
  X, AlertTriangle, ArrowRight, Camera, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { ReportCategory, SeverityLevel } from '../../services/communityReportsService';

interface ReportIncidentDrawerProps {
  onClose: () => void;
  onSubmit: (report: {
    category: ReportCategory;
    title: string;
    description: string;
    locationName: string;
    lat: number;
    lng: number;
    severity: SeverityLevel;
    isEmergency: boolean;
    reporterName: string;
    photoUrl?: string;
  }) => void;
  onDuplicateWarning?: (category: ReportCategory, lat: number, lng: number) => boolean; // returns true if duplicate exists
}

export const ReportIncidentDrawer: React.FC<ReportIncidentDrawerProps> = ({ onClose, onSubmit, onDuplicateWarning }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Mock location bounds for Bhubaneswar
  const mockLat = 20.3010 + (Math.random() * 0.05);
  const mockLng = 85.8150 + (Math.random() * 0.05);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress & convert to base64 image data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoUrl(compressedDataUrl);
        } else {
          setPhotoUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const categories: { id: ReportCategory; icon: string; label: string }[] = [
    { id: 'overcrowding', icon: '🚨', label: 'Overcrowding' },
    { id: 'road_blockage', icon: '🚧', label: 'Road Blockage' },
    { id: 'poor_lighting', icon: '💡', label: 'Poor Lighting' },
    { id: 'waterlogging', icon: '🌧️', label: 'Waterlogging' },
    { id: 'damaged_shelter', icon: '🚏', label: 'Damaged Shelter' },
    { id: 'safety_concern', icon: '🛡️', label: 'Safety Concern' }
  ];

  const handleNextStep = () => {
    if (step === 2 && onDuplicateWarning && category) {
      const duplicateFound = onDuplicateWarning(category, mockLat, mockLng);
      setHasDuplicate(duplicateFound);
      if (duplicateFound) {
        // Just show warning on step 3 but proceed
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !description.trim() || !locationName.trim()) return;

    onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim(),
      lat: mockLat,
      lng: mockLng,
      severity,
      isEmergency,
      reporterName: 'You (Verified Citizen)',
      photoUrl: photoUrl || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#161026] w-full max-w-lg sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 slide-in-from-bottom">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0B0813]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              Report Transit Issue <span className="text-slate-400 font-medium">Step {step}/3</span>
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h4 className="font-black text-lg text-slate-900 dark:text-white">What are you reporting?</h4>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      category === c.id 
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">{c.icon}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <h4 className="font-black text-lg text-slate-900 dark:text-white">Location & Severity</h4>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location / Stop Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Master Canteen Square"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-500"
                    required
                  />
                  <button className="px-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-xl whitespace-nowrap">
                    Near Me
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</label>
                <div className="flex gap-2">
                  {['low', 'moderate', 'critical'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev as SeverityLevel)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        severity === sev
                          ? sev === 'critical' ? 'bg-rose-100 border-rose-500 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border ${isEmergency ? 'bg-rose-600 border-rose-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                      {isEmergency && <CheckCircle2 className="w-full h-full text-white p-0.5" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Mark as Emergency / Immediate Danger
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      If this is an immediate safety threat, check this box. Your private details will be hidden, and authorities will be pinged instantly.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              {hasDuplicate && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                    A similar issue was recently reported near this location. Submitting this will automatically confirm the existing report if it's identical.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heavy overcrowding on Route 10 bus"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description & Details</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, bus number, or specific location..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Evidence Photo (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-purple-500/50 bg-slate-900 p-2">
                    <img
                      src={photoUrl}
                      alt="Uploaded Evidence"
                      className="w-full h-44 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition text-xs flex items-center gap-1 font-bold shadow-md"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                    <div className="mt-2 text-center text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">
                      ✓ Photo attached successfully (+10 Karma)
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-400 transition"
                  >
                    <Camera className="w-6 h-6 text-purple-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tap to upload / take photo</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">+10 Karma for verified evidence</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#161026] flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={step === 1 && !category}
              className="flex-1 py-3.5 bg-purple-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || !locationName.trim()}
              className="flex-1 py-3.5 bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Publish Report (+25 Karma)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
