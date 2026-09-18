import React, { useState } from 'react';
import { 
  X, AlertTriangle, ArrowRight, Camera, CheckCircle2, ShieldAlert, Sparkles, ThumbsUp, MapPin, Eye
} from 'lucide-react';
import { ReportCategory, SeverityLevel, AiDuplicateMatch } from '../../services/communityReportsService';
import { authService } from '../../services/supabaseClient';

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
  onCheckAiDuplicate?: (params: {
    category: ReportCategory;
    title?: string;
    description?: string;
    lat: number;
    lng: number;
    photoUrl?: string;
  }) => AiDuplicateMatch | null;
  onSupportExistingReport?: (reportId: string, citizenName?: string) => void;
  onDuplicateWarning?: (category: ReportCategory, lat: number, lng: number) => boolean;
}

export const ReportIncidentDrawer: React.FC<ReportIncidentDrawerProps> = ({ 
  onClose, 
  onSubmit, 
  onCheckAiDuplicate, 
  onSupportExistingReport,
  onDuplicateWarning 
}) => {
  const currentUser = authService.getCurrentUser();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reporterName, setReporterName] = useState(currentUser?.fullName || 'Avijeet Rout');
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [aiDuplicateMatch, setAiDuplicateMatch] = useState<AiDuplicateMatch | null>(null);
  const [supportedSuccess, setSupportedSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Mock location bounds for Bhubaneswar (near transit stops like Master Canteen, Jayadev Vihar, or Trisulia)
  const [mockLat] = useState(() => 20.2644 + (Math.random() * 0.04));
  const [mockLng] = useState(() => 85.8395 + (Math.random() * 0.04));

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
    { id: 'pothole', icon: '🕳️', label: 'Pothole / Road Damage' },
    { id: 'waterlogging', icon: '🌧️', label: 'Waterlogging' },
    { id: 'overcrowding', icon: '🚨', label: 'Overcrowding' },
    { id: 'road_blockage', icon: '🚧', label: 'Road Blockage' },
    { id: 'poor_lighting', icon: '💡', label: 'Poor Lighting' },
    { id: 'damaged_shelter', icon: '🚏', label: 'Damaged Shelter' },
    { id: 'safety_concern', icon: '🛡️', label: 'Safety Concern' }
  ];

  const handleNextStep = () => {
    if (step === 2 && category) {
      // Run AI Duplicate Check with high precision
      if (onCheckAiDuplicate) {
        const match = onCheckAiDuplicate({
          category,
          title: title || `${category} issue near ${locationName}`,
          description,
          lat: mockLat,
          lng: mockLng,
          photoUrl: photoUrl || undefined
        });

        if (match && match.isDuplicate) {
          setAiDuplicateMatch(match);
          return; // Show AI Duplicate suggestion screen
        }
      } else if (onDuplicateWarning) {
        const duplicateFound = onDuplicateWarning(category, mockLat, mockLng);
        setHasDuplicate(duplicateFound);
      }
    }
    setStep(step + 1);
  };

  const handleSupportExisting = () => {
    if (!aiDuplicateMatch) return;
    if (onSupportExistingReport) {
      onSupportExistingReport(aiDuplicateMatch.matchedReport.id, reporterName);
    }
    setSupportedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleBypassDuplicate = () => {
    setAiDuplicateMatch(null);
    setHasDuplicate(true);
    setStep(3);
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
      reporterName: reporterName.trim() || 'Avijeet Rout',
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
          
          {/* AI Duplicate Consolidation Success Toast */}
          {supportedSuccess && (
            <div className="p-6 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-white">Report Supported & Consolidated!</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Instead of filing 20 separate complaints for the same issue, your vote was merged into this unified high-priority ticket. 
              </p>
              <div className="inline-block px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                🌟 +15 Civic Karma Points Credited!
              </div>
            </div>
          )}

          {/* AI Duplicate Detection Suggestion Screen */}
          {!supportedSuccess && aiDuplicateMatch && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-white">AI Duplicate Report Detection</h4>
                    <span className="text-[10px] text-purple-400 font-bold">Auto-Scanning Nearby Geotags & Photos</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {aiDuplicateMatch.similarityScore}% Match
                </span>
              </div>

              {/* System Suggestion Banner (Exact Requirement) */}
              <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-900/40 border-2 border-purple-500/60 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-black text-white leading-snug">
                      "{aiDuplicateMatch.suggestionText}"
                    </h5>
                    <p className="text-[11px] text-purple-200/90 font-medium mt-1 leading-relaxed">
                      <strong className="text-white font-bold">Benefit:</strong> If 20 citizens report the same {aiDuplicateMatch.matchedReport.category.replace(/_/g, ' ')}, supporting this report unifies them into 1 verified incident—escalating priority to <span className="text-amber-400 font-bold">P1 (Urgent Municipal Dispatch)</span> instead of cluttering duplicates.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Point AI Verification Checklist */}
              <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>AI Verification Parameters</span>
                  <span className="text-emerald-400 font-mono">4/4 Checks Passed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Same Location?</span>
                      <span className="text-slate-200 font-bold text-[11px]">
                        {aiDuplicateMatch.distanceMeters}m away (Within radius)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Similar Issue?</span>
                      <span className="text-slate-200 font-bold text-[11px] capitalize">
                        {aiDuplicateMatch.matchedReport.category.replace(/_/g, ' ')} detected
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Similar Photo?</span>
                      <span className="text-slate-200 font-bold text-[11px]">
                        {aiDuplicateMatch.photoSimilarityPercentage > 0 
                          ? `${aiDuplicateMatch.photoSimilarityPercentage}% road surface match` 
                          : 'Verified via GPS & Corridor Radar'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Already Reported?</span>
                      <span className="text-slate-200 font-bold text-[11px]">
                        Yes ({aiDuplicateMatch.matchedReport.duplicateReportCount || aiDuplicateMatch.matchedReport.upvotes} citizens supported)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Report Card Preview */}
              <div className="bg-[#0B1220] border border-purple-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/60">
                    Existing Active Report
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">
                    ⚡ Priority: {aiDuplicateMatch.matchedReport.priorityLevel || 'P1 (Critical)'}
                  </span>
                </div>

                <h5 className="text-xs font-black text-white">{aiDuplicateMatch.matchedReport.title}</h5>
                <p className="text-[11px] text-slate-300 line-clamp-2">{aiDuplicateMatch.matchedReport.description}</p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span className="truncate">{aiDuplicateMatch.matchedReport.locationName}</span>
                </div>

                {aiDuplicateMatch.matchedReport.photoUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-800 mt-1">
                    <img
                      src={aiDuplicateMatch.matchedReport.photoUrl}
                      alt="Existing Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSupportExisting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer active:scale-95 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Support This Report Instead (+15 Karma)</span>
                </button>

                <button
                  type="button"
                  onClick={handleBypassDuplicate}
                  className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  I want to submit a separate new report anyway
                </button>
              </div>
            </div>
          )}

          {!supportedSuccess && !aiDuplicateMatch && step === 1 && (
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reporter Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Avijeet Rout"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heavy overcrowding on Route 11 bus"
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

        {/* Footer Navigation (Hidden during duplicate resolution or success) */}
        {!aiDuplicateMatch && !supportedSuccess && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#161026] flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={step === 1 && !category}
                className="flex-1 py-3.5 bg-purple-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition cursor-pointer active:scale-95"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || !locationName.trim()}
                className="flex-1 py-3.5 bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                Publish Report (+25 Karma)
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
