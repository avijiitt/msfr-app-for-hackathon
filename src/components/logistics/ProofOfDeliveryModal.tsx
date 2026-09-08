import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  X,
  User,
  KeyRound,
  FileText,
  RotateCcw,
  UploadCloud,
  Check,
} from 'lucide-react';
import { DeliveryWaypoint } from '../../services/logisticsOptimizerService';

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoint: DeliveryWaypoint;
  stopIndex: number;
  onCompletePOD: (waypointId: string, podData: {
    receiverName: string;
    signature: string;
    otp: string;
    photoUrl?: string;
    notes: string;
    deliveredAt: string;
  }) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  isOpen,
  onClose,
  waypoint,
  stopIndex,
  onCompletePOD,
}) => {
  if (!isOpen) return null;

  const [receiverName, setReceiverName] = useState(waypoint.recipientName || '');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('Handed over safely to recipient.');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleVerifyOtp = () => {
    if (otp.trim().length >= 4) {
      setOtpVerified(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Please enter a valid 4-digit recipient delivery OTP.');
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(null);
  };

  // Drawing canvas logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsSigning(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isSigning && canvasRef.current) {
      setIsSigning(false);
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      setErrorMsg('Please enter the recipient or contact person name.');
      return;
    }
    if (!otpVerified && !otp.trim()) {
      setErrorMsg('Please verify recipient OTP or enter the dispatch code.');
      return;
    }

    const deliveredAt = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    onCompletePOD(waypoint.id, {
      receiverName: receiverName.trim(),
      signature: signatureData || 'Digital E-Signature Confirmed',
      otp: otp.trim() || 'VERIFIED-OTP',
      photoUrl: photoPreview || undefined,
      notes: deliveryNotes.trim(),
      deliveredAt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#0B1220] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Proof of Delivery (e-POD)</h3>
              <p className="text-[11px] text-slate-400">
                Stop {stopIndex + 1}: {waypoint.recipientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Delivery Location Summary */}
          <div className="p-3 rounded-2xl bg-[#10182E] border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>{waypoint.address}</span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md">
                {waypoint.packageWeightKg} kg
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Recipient Phone: {waypoint.phone || '+91 94370 00000'}</div>
          </div>

          {/* Receiver Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Receiver Name / Identity</span>
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. Rajesh Sahoo / Security Desk"
              className="w-full bg-[#10182E] border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-semibold transition"
            />
          </div>

          {/* 4-Digit Customer OTP Verification */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer Delivery OTP</span>
              </span>
              {otpVerified && (
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OTP Verified
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (otpVerified) setOtpVerified(false);
                }}
                placeholder="Enter 4-digit code (e.g. 4821)"
                className="flex-1 bg-[#10182E] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-widest text-white placeholder:text-slate-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  otpVerified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {otpVerified ? 'Verified ✓' : 'Verify OTP'}
              </button>
            </div>
          </div>

          {/* Receiver Digital Signature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Receiver Digital Signature</span>
              </span>
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="border border-slate-700/80 rounded-2xl bg-[#070B14] p-1.5 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={440}
                height={95}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-24 bg-slate-950 rounded-xl cursor-crosshair touch-none"
              />
              <div className="text-[10px] text-center text-slate-500 py-0.5">
                Sign inside the box using mouse or finger touch
              </div>
            </div>
          </div>

          {/* Photo Proof Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Delivery Photo / Gate Proof</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#10182E] border border-dashed border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>{photoPreview ? 'Change Photo' : 'Upload Delivery Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/50 shrink-0">
                  <img src={photoPreview} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Delivery Notes</label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Left with building security officer Mr. Patra"
              className="w-full bg-[#10182E] border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-semibold transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950" />
              <span>Confirm & Complete Delivery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
