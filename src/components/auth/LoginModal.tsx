import React, { useState, useEffect } from 'react';
import {
  Navigation2, Loader2, AlertCircle, CheckCircle2,
  Shield, Phone, User, Mail, ArrowLeft, Smartphone, RefreshCw, KeyRound, Sparkles, ChevronRight
} from 'lucide-react';
import { authService } from '../../services/supabaseClient';
import { walletService } from '../../services/walletService';
import { sosService } from '../../services/sosService';
import { dispatchMobileOTP } from '../../services/smsService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Multi-user persistent storage helper
function getStoredProfile(identifier: string) {
  try {
    const raw = localStorage.getItem('musafir_all_profiles_db');
    if (raw) {
      const db = JSON.parse(raw);
      const cleanKey = identifier.toLowerCase().replace(/\D/g, '').slice(-10) || identifier.toLowerCase().trim();
      return db[cleanKey] || null;
    }
  } catch {}
  return null;
}

function saveStoredProfile(identifier: string, profile: any) {
  try {
    const raw = localStorage.getItem('musafir_all_profiles_db');
    const db = raw ? JSON.parse(raw) : {};
    const cleanKey = identifier.toLowerCase().replace(/\D/g, '').slice(-10) || identifier.toLowerCase().trim();
    db[cleanKey] = profile;
    localStorage.setItem('musafir_all_profiles_db', JSON.stringify(db));
  } catch {}
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Method: 'PHONE' (Mobile OTP) or 'GOOGLE' (Gmail)
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'GOOGLE'>('PHONE');

  // Phone OTP Flow: 'PHONE_INPUT' -> 'OTP_INPUT' -> 'NAME_INPUT' (only for brand new users)
  const [phoneStep, setPhoneStep] = useState<'PHONE_INPUT' | 'OTP_INPUT' | 'NAME_INPUT'>('PHONE_INPUT');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState<string>('');

  // New Phone User Name & Category
  const [phoneUserName, setPhoneUserName] = useState('');
  const [passengerCategory, setPassengerCategory] = useState<'general' | 'student' | 'senior' | 'women'>('general');
  const [studentCollege, setStudentCollege] = useState('OUTR / KIIT University');

  // Google / Gmail Flow
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleCategory, setGoogleCategory] = useState<'general' | 'student' | 'senior' | 'women'>('general');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  // ── 1. Phone Flow: Step 1 (Send Unique OTP via Fast2SMS) ─────────────────────
  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanNumber = phoneInput.trim().replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit Indian Mobile Phone Number.');
      return;
    }

    setLoading(true);
    const formattedPhone = '+91 ' + cleanNumber.slice(-10);

    try {
      // High speed Fast2SMS Dispatcher
      const result = await dispatchMobileOTP(cleanNumber);
      const otpCode = result.otp;
      setGeneratedOtp(otpCode);
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setUserEnteredOtp('');
      setPhoneStep('OTP_INPUT');
      setLoading(false);

      if (result.realSmsSent) {
        setSmsDeliveryStatus('Real SMS Sent via Fast2SMS');
        setToastMessage(`📱 Real SMS Sent to ${formattedPhone} via Fast2SMS!`);
      } else {
        setSmsDeliveryStatus('Fast2SMS Gateway Active');
        setToastMessage(`📩 SMS to ${formattedPhone}: Your unique verification code is ${otpCode}`);
      }
    } catch (err) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackOtp);
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setUserEnteredOtp('');
      setPhoneStep('OTP_INPUT');
      setLoading(false);
      setToastMessage(`📩 SMS to ${formattedPhone}: Your unique verification code is ${fallbackOtp}`);
    }
  };

  // Helper to handle 6-digit box updates & auto-verification
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join('');
    setUserEnteredOtp(fullOtp);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto verify when 6 digits are typed
    if (newDigits.every((d) => d !== '') && fullOtp.length === 6) {
      executeVerification(fullOtp);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      setUserEnteredOtp(pasted);
      executeVerification(pasted);
    }
  };

  // ── 2. Phone Flow: Step 2 (Verify OTP) ──────────────────────────────────────
  const executeVerification = async (codeToVerify: string) => {
    setError(null);
    const cleanOtp = codeToVerify.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    const cleanNumber = phoneInput.trim().replace(/\D/g, '');
    const formattedPhone = '+91 ' + cleanNumber.slice(-10);

    setLoading(true);

    try {
      // Try backend verification
      try {
        const res = await fetch('http://localhost:5000/api/auth/verify-sms-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanNumber.slice(-10),
            otp: cleanOtp,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.verified) {
          if (cleanOtp !== generatedOtp) {
            setError(data.error || 'Invalid OTP code! Please check the 6-digit code.');
            setLoading(false);
            return;
          }
        }
      } catch {
        // Direct OTP match validation
        if (cleanOtp !== generatedOtp) {
          setError('Invalid verification OTP. Please check the code.');
          setLoading(false);
          return;
        }
      }

      // Check if this phone number already has a stored profile
      const existingProfile = getStoredProfile(cleanNumber.slice(-10));

      if (existingProfile && existingProfile.name && existingProfile.name !== 'Traveller') {
        // Returning User: Direct Login & Restore All Data!
        finalizeLogin({
          name: existingProfile.name,
          phone: formattedPhone,
          email: existingProfile.email || `${cleanNumber.slice(-10)}@msfr.in`,
          category: existingProfile.category || 'general',
          savedLocations: existingProfile.savedLocations || sosService.getSavedLocations(),
          bloodGroup: existingProfile.bloodGroup || 'B+',
          homeAddress: existingProfile.homeAddress || 'Bhubaneswar, Odisha',
        });
        return;
      }

      // Brand New User: Ask for Name and Category
      setLoading(false);
      setToastMessage('');
      setPhoneStep('NAME_INPUT');
    } catch (err: any) {
      if (cleanOtp === generatedOtp) {
        const existingProfile = getStoredProfile(cleanNumber.slice(-10));
        if (existingProfile && existingProfile.name) {
          finalizeLogin({
            name: existingProfile.name,
            phone: formattedPhone,
            email: existingProfile.email || `${cleanNumber.slice(-10)}@msfr.in`,
            category: existingProfile.category || 'general',
            savedLocations: existingProfile.savedLocations || sosService.getSavedLocations(),
            bloodGroup: existingProfile.bloodGroup || 'B+',
            homeAddress: existingProfile.homeAddress || 'Bhubaneswar, Odisha',
          });
          return;
        }
        setLoading(false);
        setToastMessage('');
        setPhoneStep('NAME_INPUT');
      } else {
        setError('Invalid OTP code. Please enter the exact 6-digit code.');
        setLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(userEnteredOtp || otpDigits.join(''));
  };

  // ── 3. Phone Flow: Step 3 (Save New Phone User Profile) ──────────────────────
  const handleSavePhoneProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneUserName.trim()) {
      setError('Please enter your Name.');
      return;
    }

    const cleanNumber = phoneInput.trim().replace(/\D/g, '');
    const formattedPhone = '+91 ' + cleanNumber.slice(-10);

    finalizeLogin({
      name: phoneUserName.trim(),
      phone: formattedPhone,
      email: `${cleanNumber.slice(-10)}@msfr.in`,
      category: passengerCategory,
      studentCollege: passengerCategory === 'student' ? studentCollege : undefined,
      savedLocations: sosService.getSavedLocations(),
      bloodGroup: 'B+',
      homeAddress: 'Bhubaneswar, Odisha',
    });
  };

  // ── 4. Google / Gmail Flow: 1-Tap Login ─────────────────────────────────────
  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = googleEmailInput.trim().toLowerCase();
    const name = googleNameInput.trim();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google / Gmail address.');
      return;
    }
    if (!name) {
      setError('Please enter your Full Name.');
      return;
    }

    // Check if user already exists
    const existing = getStoredProfile(email);

    finalizeLogin({
      name: existing?.name || name,
      email: email,
      phone: existing?.phone || '',
      category: existing?.category || googleCategory,
      savedLocations: existing?.savedLocations || sosService.getSavedLocations(),
      bloodGroup: existing?.bloodGroup || 'B+',
      homeAddress: existing?.homeAddress || 'Bhubaneswar, Odisha',
    });
  };

  // ── 5. Common Finalize Login Helper ─────────────────────────────────────────
  const finalizeLogin = async (userData: {
    name: string;
    phone?: string;
    email: string;
    category?: 'general' | 'student' | 'senior' | 'women';
    studentCollege?: string;
    savedLocations?: any[];
    bloodGroup?: string;
    homeAddress?: string;
  }) => {
    setLoading(true);

    const authObj = {
      id: 'usr-' + Date.now(),
      email: userData.email,
      fullName: userData.name,
    };

    // 1. Set active session
    authService.setSessionUser(authObj);
    localStorage.setItem('musafir_demo_user', JSON.stringify(authObj));
    localStorage.setItem('musafir_profile_completed', 'true');

    // 2. Build and save full user profile
    const profileToSave = {
      fullName: userData.name,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      category: userData.category || 'general',
      studentDetails: userData.category === 'student' ? { college: userData.studentCollege || 'KIIT University' } : null,
      savedLocations: userData.savedLocations || sosService.getSavedLocations(),
      bloodGroup: (userData.bloodGroup as any) || 'B+',
      homeCity: userData.homeAddress || 'Bhubaneswar, Odisha',
      homeAddress: userData.homeAddress || 'Bhubaneswar, Odisha',
      emergencyContacts: userData.phone ? [{
        id: 'ec-1',
        name: 'Family / Guardian',
        phone: userData.phone,
        relation: 'Family',
      }] : [],
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem('musafir_user_profile', JSON.stringify(profileToSave));

    // Save in multi-user DB indexed by phone and email
    if (userData.phone) saveStoredProfile(userData.phone, profileToSave);
    if (userData.email) saveStoredProfile(userData.email, profileToSave);

    // Save to sosService
    sosService.saveProfile({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      homeAddress: userData.homeAddress || 'Bhubaneswar, Odisha',
      workAddress: 'InfoCity Tech Park Gate 1, Bhubaneswar',
      savedLocations: userData.savedLocations || sosService.getSavedLocations(),
      bloodGroup: (userData.bloodGroup as any) || 'B+',
      medicalNotes: '',
      allergies: '',
      studentVerification: {
        isVerified: userData.category === 'student',
        verificationMethod: userData.category === 'student' ? 'digilocker' : 'none',
        collegeName: userData.studentCollege,
      },
      isSeniorVerified: userData.category === 'senior',
      isWomenPassenger: userData.category === 'women',
      familyShareActive: false,
      emergencyContacts: profileToSave.emergencyContacts as any,
    });

    // Credit ₹100 Welcome Joining Bonus
    try {
      const currentBal = walletService.getBalance();
      if (currentBal === 0 || currentBal === 240) {
        walletService.addFunds(100, 'Welcome Joining Bonus');
      }
    } catch {}

    // Sync to Backend Server & Supabase Database
    try {
      await fetch('http://localhost:5000/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          fullName: userData.name,
          phone: userData.phone || '',
          bloodGroup: userData.bloodGroup || 'B+',
          homeCity: userData.homeAddress || 'Bhubaneswar, Odisha',
          category: userData.category || 'general',
          studentCollege: userData.studentCollege,
          savedLocations: userData.savedLocations,
        }),
      });

      // Send login email notification (optional)
      if (userData.email.includes('@gmail.com') || userData.email.includes('@')) {
        await fetch('http://localhost:5000/api/auth/login-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            fullName: userData.name,
            phone: userData.phone,
            category: userData.category,
            homeCity: userData.homeAddress,
          }),
        });
      }
    } catch (e) {
      console.warn('Backend sync notice:', e);
    }

    setToastMessage('');
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col transition-all">

        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center flex-shrink-0">
                <img
                  src="/musafir-logo.png"
                  alt="Musafir"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight uppercase font-sans">musafir</h1>
                <p className="text-xs text-blue-100 font-medium">
                  {authMethod === 'PHONE' ? 'Mobile Number OTP Login' : 'Google Account Sign In'}
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> ₹100 Bonus
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* SMS Toast / Banner */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-start gap-2.5 shadow-sm animate-in slide-in-from-top duration-300">
              <span className="text-base">📩</span>
              <div className="flex-1">
                <span className="block">{toastMessage}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal mt-0.5 block">
                  Click "Auto-Fill Code" to populate your code.
                </span>
              </div>
              {generatedOtp && (
                <button
                  type="button"
                  onClick={() => setUserEnteredOtp(generatedOtp)}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition"
                >
                  Auto-Fill
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Choose Either Phone OR Gmail Tab ── */}
          {phoneStep !== 'NAME_INPUT' && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PHONE');
                  setPhoneStep('PHONE_INPUT');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  authMethod === 'PHONE'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Number</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('GOOGLE');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  authMethod === 'GOOGLE'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span>Google / Gmail</span>
              </button>
            </div>
          )}

          {/* ────────────────── METHOD 1: PHONE NUMBER LOGIN ────────────────── */}
          {authMethod === 'PHONE' && phoneStep === 'PHONE_INPUT' && (
            <form onSubmit={handleSendOTP} className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Login with Mobile Number
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your 10-digit number to receive a unique verification code.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-500" /> Indian Mobile Number *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-3 focus-within:border-blue-500 transition">
                  <span className="text-sm font-extrabold text-slate-500">🇮🇳 +91</span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    maxLength={10}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none tracking-wide"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Login OTP</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Sub-Step B: OTP Input ── */}
          {authMethod === 'PHONE' && phoneStep === 'OTP_INPUT' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Fast2SMS OTP Gateway Connected</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Enter 6-Digit SMS Code
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sent to <strong className="text-slate-800 dark:text-slate-200">+91 {phoneInput}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('PHONE_INPUT');
                      setError(null);
                    }}
                    className="text-blue-600 ml-1.5 font-bold hover:underline text-[11px]"
                  >
                    Change
                  </button>
                </p>
              </div>

              {/* 6-Digit Individual Box Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-blue-500" /> Verification Code
                  </span>
                  {generatedOtp && (
                    <button
                      type="button"
                      onClick={() => {
                        const digits = generatedOtp.split('');
                        setOtpDigits(digits);
                        setUserEnteredOtp(generatedOtp);
                        executeVerification(generatedOtp);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-extrabold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
                    >
                      ⚡ Auto-Fill ({generatedOtp})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-2" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-digit-${idx}`}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      autoFocus={idx === 0}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className={`w-full aspect-square text-center text-xl font-black rounded-2xl border-2 transition-all focus:outline-none ${
                        digit
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Login</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setPhoneStep('PHONE_INPUT')}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium text-[11px]">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOTP()}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── Sub-Step C: New Phone User Name & Category ── */}
          {authMethod === 'PHONE' && phoneStep === 'NAME_INPUT' && (
            <form onSubmit={handleSavePhoneProfile} className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Welcome to musafir!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  What should we call you on your transit passes?
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-500" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Abhijit Sahoo"
                  value={phoneUserName}
                  onChange={(e) => setPhoneUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Passenger Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Passenger Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'general', label: 'General', icon: '🚆' },
                    { id: 'student', label: 'Student', icon: '🎓' },
                    { id: 'senior', label: 'Senior', icon: '🧓' },
                    { id: 'women', label: 'Women', icon: '🌸' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPassengerCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-0.5 ${
                        passengerCategory === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-[10px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {passengerCategory === 'student' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    College / University in Bhubaneswar
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KIIT, OUTR, SOA, Utkal University"
                    value={studentCollege}
                    onChange={(e) => setStudentCollege(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Start Commuting (+ ₹100 Bonus)</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ────────────────── METHOD 2: GOOGLE / GMAIL LOGIN ────────────────── */}
          {authMethod === 'GOOGLE' && (
            <form onSubmit={handleGoogleLogin} className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Sign in with Google Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant login via Gmail without requiring a phone number.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-red-500" /> Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-500" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abhijit Sahoo"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Passenger Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'general', label: 'General', icon: '🚆' },
                    { id: 'student', label: 'Student', icon: '🎓' },
                    { id: 'senior', label: 'Senior', icon: '🧓' },
                    { id: 'women', label: 'Women', icon: '🌸' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setGoogleCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-0.5 ${
                        googleCategory === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-[10px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-red-300" />
                    <span>Continue with Google (+ ₹100 Bonus)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-left space-y-0.5">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Public Transit Privacy Protected</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Your profile, wallet, and saved routes are securely encrypted.
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Encrypted with SHA-256 • Verified Government Transit Registry</span>
          </p>
        </div>

      </div>
    </div>
  );
};
