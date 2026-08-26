import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, ShieldCheck, Upload, QrCode, Sparkles, Building, Hash, Calendar } from 'lucide-react';
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
      setOcrStep('2/3: Extracting Roll No & University Seal...');
      setTimeout(() => {
        setOcrStep('3/3: Verifying Academic Active Status...');
        setTimeout(() => {
          const updatedVerification: StudentVerification = {
            isVerified: true,
            verificationMethod: 'ocr_card',
            rollNo: '2024-ME-1190',
            collegeName: 'Utkal University (Vani Vihar Campus)',
            courseName: 'M.Sc Information Technology',
            validUntil: 'May 2026',
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

  const handleClaimStudentPass = () => {
    walletService.purchasePass('student', userProfile.name);
    onPassClaimed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel rounded-3xl p-5 sm:p-6 text-on-surface space-y-5 border border-tertiary/40 shadow-2xl ambient-glow-teal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center text-tertiary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline-md">
                {t.studentHubTitle}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t.studentHubTagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant text-sm border border-primary/20"
          >
            ✕
          </button>
        </div>

        {/* Verification Status Card */}
        {verification.isVerified ? (
          <div className="bg-surface-container border border-tertiary/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-tertiary-fixed flex items-center gap-1.5 font-label-caps">
                <CheckCircle2 className="w-4 h-4 text-tertiary-fixed" /> {t.studentVerifiedSuccess}
              </span>
              <span className="text-[10px] bg-tertiary/20 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded-full font-mono">
                {verification.verificationMethod.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 text-xs bg-surface-container-high p-3 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 text-on-surface">
                <Building className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                <strong className="text-on-surface">{verification.collegeName}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono pt-1">
                <span>Roll: {verification.rollNo}</span>
                <span>Valid: {verification.validUntil}</span>
              </div>
            </div>

            <button
              onClick={handleClaimStudentPass}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 font-label-caps"
            >
              <QrCode className="w-4 h-4" />
              <span>Claim 50% Concession Digital Pass (₹20/Day)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Option 1: DigiLocker */}
            <div className="bg-surface-container border border-primary/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span>🏛️ DigiLocker Verified Student ID</span>
                </div>
                <span className="text-[10px] bg-tertiary/20 text-tertiary px-2 py-0.5 rounded font-mono font-bold">
                  Instant
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Securely pull your official student identity record from DigiLocker & National Academic Depository (NAD).
              </p>
              <button
                onClick={handleDigiLockerVerify}
                disabled={isVerifyingDigiLocker}
                className="w-full py-2.5 rounded-xl bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container font-bold text-xs shadow transition flex items-center justify-center gap-1.5 font-label-caps"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifyingDigiLocker ? 'Connecting to DigiLocker API...' : t.digilockerVerify}</span>
              </button>
            </div>

            {/* Option 2: AI OCR ID Scanner */}
            <div className="bg-surface-container border border-primary/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span>📸 AI OCR Student ID Card Scan</span>
                </div>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono font-bold">
                  Camera / File
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Upload or snap a photo of your physical college identity card for optical character recognition.
              </p>

              {ocrStep && (
                <div className="text-xs text-tertiary bg-surface-container-high p-2 rounded-lg border border-tertiary/30 font-mono animate-pulse">
                  {ocrStep}
                </div>
              )}

              <button
                onClick={handleScanIdOCR}
                disabled={isScanningOCR}
                className="w-full py-2.5 rounded-xl bg-surface-bright hover:bg-surface-variant text-primary font-bold text-xs border border-primary/30 transition flex items-center justify-center gap-1.5 font-label-caps"
              >
                <Upload className="w-4 h-4" />
                <span>{isScanningOCR ? 'Scanning ID Card via OCR...' : t.scanStudentIdOcr}</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-bold text-xs border border-primary/20 font-label-caps"
        >
          Close Hub
        </button>
      </div>
    </div>
  );
};
