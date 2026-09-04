import React, { useState, useRef } from 'react';
import { 
  X, MapPin, ThumbsUp, Clock, AlertTriangle, Building, CheckCircle2, Share2, MessageSquareWarning,
  Camera, Upload, Check, Loader2, ImagePlus
} from 'lucide-react';
import { CommunityReport } from '../../services/communityReportsService';

interface IncidentDetailsModalProps {
  report: CommunityReport;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onAttachPhoto?: (id: string, photoUrl: string) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({ report, onClose, onUpvote, onAttachPhoto }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(report.photoUrl || (report.evidenceUrls && report.evidenceUrls[0]) || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
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
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoUrl(compressed);
          onAttachPhoto?.(report.id, compressed);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 4000);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white dark:bg-[#161026] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
              report.severity === 'emergency' ? 'bg-rose-600 text-white animate-pulse' :
              report.severity === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
              report.severity === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
              'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
            }`}>
              {report.severity} severity
            </span>
            <span className="text-[10px] font-bold text-slate-500">{report.reportedAt}</span>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-6">
          
          {/* Main Info */}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {report.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{report.locationName}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {report.description}
            </p>
          </div>

          {/* Evidence Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Photo</h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 text-xs font-bold transition"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>{photoUrl ? 'Replace Photo' : 'Attach Evidence Photo'}</span>
                  </>
                )}
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Evidence photo attached successfully! (+10 Civic Karma points awarded)</span>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div 
              onClick={() => !photoUrl && fileInputRef.current?.click()}
              className={`min-h-36 max-h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl border ${
                !photoUrl ? 'border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 cursor-pointer' : 'border-slate-200 dark:border-slate-700'
              } flex items-center justify-center overflow-hidden relative group transition-all`}
            >
              {photoUrl ? (
                <div className="relative w-full h-full max-h-64 group">
                  <img 
                    src={photoUrl} 
                    alt="Incident Evidence" 
                    className="w-full h-full max-h-64 object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-white/90 text-slate-900 rounded-xl font-bold text-xs shadow hover:bg-white flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-6 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No photos provided yet</p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1 underline">
                    Tap to upload photo evidence from camera or gallery
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Authority Response Panel */}
          {report.authorityResponse && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300">
                  Official Response • {report.authorityResponse.department}
                </h4>
              </div>
              <p className="text-xs text-indigo-800 dark:text-indigo-200 font-medium">
                {report.authorityResponse.message}
              </p>
              {report.authorityResponse.eta && (
                <div className="inline-block mt-2 px-2 py-1 bg-white dark:bg-indigo-950 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  ETA: {report.authorityResponse.eta}
                </div>
              )}
            </div>
          )}

          {/* Status Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Timeline</h4>
            <div className="space-y-4 pl-2">
              {report.timeline.map((event, idx) => (
                <div key={idx} className="relative flex gap-4">
                  {/* Line connecting nodes */}
                  {idx !== report.timeline.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-[-16px] w-[2px] bg-slate-200 dark:bg-slate-700" />
                  )}
                  {/* Node icon */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 shrink-0 mt-0.5 ${
                    event.status === 'resolved' ? 'bg-emerald-500 text-white' :
                    event.status === 'verified_by_crut' ? 'bg-indigo-500 text-white' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {event.status === 'resolved' ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  {/* Event Content */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                        {event.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">{event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50 dark:bg-[#0B0813]">
          <div className="text-[10px] text-slate-500">
            Report ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{report.id}</span>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-300 dark:hover:bg-slate-700">
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onUpvote(report.id)}
              className={`px-4 h-9 rounded-xl flex items-center gap-2 font-bold text-xs transition active:scale-95 ${
                report.hasUpvoted 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{report.hasUpvoted ? 'Confirmed' : 'Confirm'} ({report.upvotes})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const CameraIcon = () => (
  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
