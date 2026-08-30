import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, ShieldCheck, Upload, QrCode, Sparkles, Building, X } from 'lucide-react';
import { UserProfile, StudentVerification } from '../../types/transit';
import { walletService } from '../../services/walletService';
import { TranslationDictionary } from '../../types/i18n';
import confetti from 'canvas-confetti';

interface StudentHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onPassClaimed: () => void;
  t: TranslationDictionary;
}

export const StudentHubModal: React.FC<StudentHubModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onPassClaimed,
  t,
}) => {
  const [isVerifyingDigiLocker, setIsVerifyingDigiLocker] = useState(false);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrStep, setOcrStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const verification = userProfile.studentVerification;

  const handleDigiLockerVerify = () => {
    setIsVerifyingDigiLocker(true);
    setTimeout(() => {
      const updatedVerification: StudentVerification = {
        isVerified: true,
        verificationMethod: 'digilocker',
        rollNo: '2023-CS-0842',
        collegeName: 'KIIT University, Bhubaneswar',
        courseName: 'B.Tech Computer Science & Engineering',
        validUntil: 'July 2027',
        verifiedAt: new Date().toISOString().split('T')[0],
      };
      const updated = {
        ...userProfile,
        studentVerification: updatedVerification,
      };
      onUpdateProfile(updated);
      setIsVerifyingDigiLocker(false);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }, 1800);
  };

  const handleScanIdOCR = () => {
    setIsScanningOCR(true);
    setOcrStep('1/3: Enhancing ID Image & Detecting Text...');
    setTimeout(() => {
      setOcrStep('2/3: Extracting Roll Number & College Seal...');
      setTimeout(() => {
        setOcrStep('3/3: Government SIS Database Verification...');
        setTimeout(() => {
          const updatedVerification: StudentVerification = {
            isVerified: true,
            verificationMethod: 'ocr_card',
            rollNo: 'OUTR-ECE-9102',
            collegeName: 'Odisha University of Tech & Research',
            courseName: 'B.Tech Electronics & Comm',
            validUntil: 'June 2026',
            verifiedAt: new Date().toISOString().split('T')[0],
          };
          const updated = {
            ...userProfile,
            studentVerification: updatedVerification,
          };
          onUpdateProfile(updated);
          setIsScanningOCR(false);
          setOcrStep(null);
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }, 800);
      }, 800);
    }, 800);
  };

  const handleClaimStudentPass = (type: 'student_yearly' | 'student' = 'student_yearly') => {
    walletService.purchasePass(type, userProfile.name);
    onPassClaimed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.studentHubTitle || 'DigiLocker Student Pass Hub'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yearly ₹1,700 • Monthly with 20% Discount
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

        {/* Verification Status Card */}
        {verification.isVerified ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t.studentVerifiedSuccess || 'Verified Student Identity'}
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full font-mono font-bold">
                {verification.verificationMethod.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 text-xs bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <strong className="text-slate-900 dark:text-white">{verification.collegeName}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                <span>Roll: {verification.rollNo}</span>
                <span>Valid: {verification.validUntil}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleClaimStudentPass('student_yearly')}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex flex-col items-center justify-center gap-0.5"
              >
                <span className="font-extrabold">Student Pass Yearly</span>
                <span className="text-[11px] text-blue-200 font-mono">₹1,700 / 1 Year Unlimited</span>
              </button>
              <button
                onClick={() => handleClaimStudentPass('student')}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex flex-col items-center justify-center gap-0.5"
              >
                <span className="font-extrabold">Student Monthly Pass</span>
                <span className="text-[11px] text-emerald-200 font-mono">₹160 / Month (20% Off)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 p-4 rounded-2xl space-y-1 text-slate-800 dark:text-slate-200">
              <span className="font-bold block text-blue-600 dark:text-blue-400">Student Concession Benefits:</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                • 50% off standard bus and metro ticket fares across all urban routes.
                <br />• Unlimited daily travel with free transfer within 90 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDigiLockerVerify}
                disabled={isVerifyingDigiLocker || isScanningOCR}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white block">DigiLocker Instant Sync</strong>
                  <span className="text-[11px] text-slate-500">Auto-verify student status in 5s</span>
                </div>
                {isVerifyingDigiLocker && (
                  <span className="text-[10px] text-blue-600 font-bold animate-pulse block">Verifying with DigiLocker...</span>
                )}
              </button>

              <button
                onClick={handleScanIdOCR}
                disabled={isVerifyingDigiLocker || isScanningOCR}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white block">Scan College ID Card</strong>
                  <span className="text-[11px] text-slate-500">AI OCR text extraction</span>
                </div>
                {isScanningOCR && (
                  <span className="text-[10px] text-purple-600 font-bold animate-pulse block">{ocrStep}</span>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close Hub
        </button>
      </div>
    </div>
  );
};
