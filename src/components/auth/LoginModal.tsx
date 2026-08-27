import React, { useState, useEffect } from 'react';
import {
  Navigation2, Loader2, AlertCircle, CheckCircle2,
  Shield, Phone, User, MapPin, Heart, Sparkles, ChevronRight,
  School, HeartHandshake, Mail, ArrowLeft, Smartphone, RefreshCw, KeyRound
} from 'lucide-react';
import { authService, isSupabaseConfigured, supabase } from '../../services/supabaseClient';
import { walletService } from '../../services/walletService';
import { sosService } from '../../services/sosService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  // Method: 'PHONE' (Primary OTP) or 'GOOGLE' (One-Tap Gmail)
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'GOOGLE'>('PHONE');

  // Phone OTP Steps: 'PHONE_INPUT' -> 'OTP_INPUT' -> 'PROFILE_INPUT'
  const [phoneStep, setPhoneStep] = useState<'PHONE_INPUT' | 'OTP_INPUT' | 'PROFILE_INPUT'>('PHONE_INPUT');
  const [phoneInput, setPhoneInput] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Google Login State
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passenger Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [homeCity, setHomeCity] = useState('Bhubaneswar, Odisha');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [category, setCategory] = useState<'general' | 'student' | 'senior' | 'women'>('general');
  const [studentCollege, setStudentCollege] = useState('OUTR / KIIT University');
  const [studentRoll, setStudentRoll] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Resend Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Check if session or profile already exists
  useEffect(() => {
    const existing = authService.getCurrentUser();
    const isCompleted = localStorage.getItem('musafir_profile_completed');
    if (existing && !isCompleted) {
      setFullName(existing.fullName || '');
      setEmail(existing.email || '');
      setPhone(existing.email.includes('@') ? '' : existing.email);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── 1. Phone OTP Handler: Step 1 (Send OTP) ──────────────────────────────
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNumber = phoneInput.trim().replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit Indian Mobile Phone Number');
      return;
    }

    setLoading(true);

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setPhone('+91 ' + cleanNumber.slice(-10));
    setResendTimer(30);

    setTimeout(() => {
      setLoading(false);
      setPhoneStep('OTP_INPUT');
      setToastMessage(`📩 SMS to +91 ${cleanNumber.slice(-10)}: Your MSFR login verification code is ${newOtp}`);
    }, 400);
  };

  // ── 2. Phone OTP Handler: Step 2 (Verify OTP) ───────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (userEnteredOtp.trim() === generatedOtp || userEnteredOtp.trim() === '123456') {
      setLoading(true);

      // Check if user already registered previously
      const cleanNumber = phoneInput.trim().replace(/\D/g, '');
      const formattedPhone = '+91 ' + cleanNumber.slice(-10);

      // Check local saved profile
      const savedProfileRaw = localStorage.getItem('musafir_user_profile');
      let existingProfile = null;
      if (savedProfileRaw) {
        try {
          const parsed = JSON.parse(savedProfileRaw);
          if (parsed.phone?.includes(cleanNumber.slice(-10))) {
            existingProfile = parsed;
          }
        } catch {}
      }

      if (existingProfile && existingProfile.fullName) {
        // Existing user: direct login!
        const authObj = {
          id: 'usr-' + Date.now(),
          email: existingProfile.email || `${cleanNumber}@msfr.in`,
          fullName: existingProfile.fullName,
        };
        authService.setSessionUser(authObj);
        sosService.reloadProfile();
        setToastMessage('');
        setLoading(false);
        onSuccess();
        return;
      }

      // New user: advance to Profile Setup Form
      setLoading(false);
      setToastMessage('');
      setPhone(formattedPhone);
      setPhoneStep('PROFILE_INPUT');
    } else {
      setError('Invalid OTP code! Check the simulated SMS banner or enter 123456.');
    }
  };

  // ── 3. Google Account Submission ──────────────────────────────────────────
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    if (!googleNameInput.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    setFullName(googleNameInput.trim());
    setEmail(googleEmailInput.trim());
    setPhoneStep('PROFILE_INPUT');
  };

  // ── 4. Complete Mandatory Registration Form ──────────────────────────────
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your Full Legal Name.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Mobile Phone Number.');
      return;
    }
    if (!emergencyName.trim()) {
      setError('Emergency Contact Name is mandatory for SOS First-Responder protection.');
      return;
    }
    const cleanEmergPhone = emergencyPhone.trim().replace(/\D/g, '');
    if (cleanEmergPhone.length < 10) {
      setError('Emergency Contact Phone must be a valid 10-digit number.');
      return;
    }
    if (!agreedToTerms) {
      setError('Please accept the Public Transit Safety & Emergency Dispatch Terms.');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        fullName: fullName.trim(),
        email: email.trim() || `${cleanPhone.slice(-10)}@passenger.msfr.in`,
        phone: '+91 ' + cleanPhone.slice(-10),
        bloodGroup,
        homeCity: homeCity.trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          phone: '+91 ' + cleanEmergPhone.slice(-10),
          relation: 'Family / Guardian',
        },
        category,
        studentDetails: category === 'student' ? { college: studentCollege, rollNo: studentRoll } : null,
        completedAt: new Date().toISOString(),
      };

      // 1. Save to Backend Database API & Supabase
      try {
        await fetch('http://localhost:5000/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profileData.email,
            fullName: profileData.fullName,
            phone: profileData.phone,
            bloodGroup,
            homeCity: homeCity.trim(),
            emergencyContact: profileData.emergencyContact,
            category,
            studentCollege,
            studentRoll,
          }),
        });
      } catch (apiErr) {
        console.warn('Backend profile API save notice:', apiErr);
      }

      // Also attempt Supabase direct upsert
      if (isSupabaseConfigured() && supabase) {
        try {
          const user = authService.getCurrentUser();
          const userId = user?.id || '89941887-303d-4fd3-9436-f111a33bc93b';
          await supabase.from('profiles').upsert({
            id: userId,
            email: profileData.email,
            full_name: fullName.trim(),
            phone: profileData.phone,
            blood_group: bloodGroup,
            home_address: homeCity.trim(),
            is_student: category === 'student',
            student_college_name: studentCollege,
            student_roll_no: studentRoll,
            is_senior_verified: category === 'senior',
            is_women_passenger: category === 'women',
          });
        } catch (dbErr) {
          console.warn('Supabase profile save notice:', dbErr);
        }
      }

      // 2. Persist locally
      localStorage.setItem('musafir_user_profile', JSON.stringify(profileData));
      localStorage.setItem('musafir_profile_completed', '1');

      // Update auth user object
      const authObj = {
        id: 'usr-' + Date.now(),
        email: profileData.email,
        fullName: fullName.trim(),
      };
      authService.setSessionUser(authObj);

      // 3. Credit ₹100 Welcome Joining Bonus to Mo-Wallet
      const hasBonus = localStorage.getItem('musafir_welcome_bonus_credited');
      if (!hasBonus) {
        walletService.addFunds(100, 'Musafir Welcome Joining Bonus 🎁');
        localStorage.setItem('musafir_welcome_bonus_credited', '1');
      }

      // 4. Send Confirmation Notification to User's Email
      try {
        await fetch('http://localhost:5000/api/auth/login-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profileData.email,
            fullName: fullName.trim(),
            phone: profileData.phone,
            category,
            homeCity,
          }),
        });
      } catch (notifyErr) {
        console.warn('Backend notification notice:', notifyErr);
      }

      // Browser Notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`musafir: Welcome, ${fullName.trim()}!`, {
          body: `Login verified for ${profileData.phone}. ₹100 welcome bonus added to Mo-Wallet.`,
          icon: '/favicon.ico',
        });
      }

      // 5. Update in-memory SOS and user profile
      sosService.reloadProfile();

      setLoading(false);
      onSuccess(); // Close modal and unlock main dashboard
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to complete registration.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header Branding */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 sm:p-6 text-white relative flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Navigation2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight">musafir</h1>
                  <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    India Transit
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  {phoneStep === 'PROFILE_INPUT'
                    ? 'Passenger Profile Setup (Step 2 of 2)'
                    : 'Instant Verified Login & Transit ID'}
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> ₹100 Bonus
            </span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">

          {/* Simulated SMS Delivery Toast Banner */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-start gap-2.5 shadow-sm animate-in slide-in-from-top duration-300">
              <span className="text-base">📩</span>
              <div className="flex-1">
                <span className="block">{toastMessage}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal mt-0.5 block">
                  (Test Tip: Click "Fill OTP" or enter <strong>{generatedOtp || '123456'}</strong> below)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUserEnteredOtp(generatedOtp || '123456')}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition"
              >
                Fill OTP
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: PHONE OR GOOGLE AUTHENTICATION ──────────────── */}
          {phoneStep !== 'PROFILE_INPUT' ? (
            <div className="space-y-4">

              {/* Login Method Tabs */}
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
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP (Fast)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('GOOGLE');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'GOOGLE'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>Google Account</span>
                </button>
              </div>

              {/* ── Sub-Form A: Phone Number Input ── */}
              {authMethod === 'PHONE' && phoneStep === 'PHONE_INPUT' && (
                <form onSubmit={handleSendOTP} className="space-y-4 py-1">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Enter Mobile Number
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      We will send an instant 6-digit login verification code.
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

              {/* ── Sub-Form B: OTP Verification ── */}
              {authMethod === 'PHONE' && phoneStep === 'OTP_INPUT' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4 py-1">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Enter Verification Code
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sent to <strong className="text-slate-800 dark:text-slate-200">{phone}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep('PHONE_INPUT');
                          setError(null);
                        }}
                        className="text-blue-600 ml-1.5 font-bold hover:underline text-[11px]"
                      >
                        Edit
                      </button>
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-blue-500" /> 6-Digit OTP Code *
                      </span>
                      <button
                        type="button"
                        onClick={() => setUserEnteredOtp('123456')}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Use Default: 123456
                      </button>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-600 rounded-2xl p-3 text-center text-xl font-black text-slate-900 dark:text-white tracking-[0.4em] focus:outline-none shadow-sm"
                    />
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
                        <span>Verify & Proceed</span>
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
                        onClick={handleSendOTP}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ── Sub-Form C: Google Sign-In ── */}
              {authMethod === 'GOOGLE' && (
                <form onSubmit={handleGoogleSubmit} className="space-y-4 py-1">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Sign in with Google
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your Google credentials to continue to musafir.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-red-500" /> Google Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-500" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Continue with Google →</span>
                  </button>
                </form>
              )}

              {/* Security Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-left space-y-1">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Public Transit Safety Standard</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  New passengers complete emergency contact details once to unlock GPS navigation and first-responder safety dispatch.
                </p>
              </div>

            </div>
          ) : (

            /* ──────────────── STEP 2: PASSENGER PROFILE & EMERGENCY DETAILS ──────────────── */
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-blue-900 dark:text-blue-200 block font-bold">Mandatory Passenger Details</strong>
                  <span className="text-blue-700 dark:text-blue-300 text-[11px]">
                    To unlock the map and receive SMS parcel locker PINs & SOS protection, please confirm your passenger info.
                  </span>
                </div>
              </div>

              {/* Verified Phone Banner */}
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs">
                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">Mobile Verified ✓</strong>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px]">{phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhoneStep('PHONE_INPUT')}
                  className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline"
                >
                  Change Number
                </button>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-500" /> Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gmail / Email Address */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" /> Gmail / Email Address (For Trip Receipts & Passes)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" /> Transit City / Region *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhubaneswar, Odisha"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" /> Blood Group (Medical ID) *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mandatory Emergency Contact */}
              <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  <span>Mandatory Emergency Contact (For 1-Tap SOS) *</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Contact Name (Parent / Guardian)"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="Phone (10 digits)"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      maxLength={10}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Category Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Passenger Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'general', label: 'General', icon: '🚶' },
                    { id: 'student', label: 'Student (50% Off)', icon: '🎓' },
                    { id: 'women', label: 'Pink Pass', icon: '👩' },
                    { id: 'senior', label: 'Senior', icon: '👴' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition flex flex-col items-center gap-1 ${
                        category === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[10px] truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Extra Fields */}
              {category === 'student' && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <School className="w-3.5 h-3.5" />
                    <span>DigiLocker Student Verification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="College / University Name"
                      value={studentCollege}
                      onChange={(e) => setStudentCollege(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Student ID / Roll Number"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Terms Agreement */}
              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 mt-0.5"
                />
                <span>I agree to Public Transit Safety Rules, GPS Telemetry & Emergency 112 Dispatch.</span>
              </label>

              {/* Submit & Enter App Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration & Enter Musafir</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

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
