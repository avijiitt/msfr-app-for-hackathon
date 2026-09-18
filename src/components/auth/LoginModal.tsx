import React, { useState, useEffect } from 'react';
import {
  Navigation2, Loader2, AlertCircle, CheckCircle2,
  Shield, Phone, User, Mail, ArrowLeft, ArrowRight, X, Smartphone, RefreshCw, KeyRound, Sparkles, ChevronRight
} from 'lucide-react';
import { authService, supabase, isSupabaseConfigured } from '../../services/supabaseClient';
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
  // Method: Always 'GOOGLE' (Email OTP)
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'GOOGLE'>('GOOGLE');

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Email / Gmail Flow
  const [emailStep, setEmailStep] = useState<'EMAIL_INPUT' | 'OTP_INPUT' | 'NAME_INPUT'>('EMAIL_INPUT');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleCategory, setGoogleCategory] = useState<'general' | 'student' | 'senior' | 'women'>('general');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      setUserEnteredOtp(pasted);
      executeEmailVerification(pasted);
    }
  };

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



  // ── 4. Google / Gmail Flow: Email OTP Login ─────────────────────────────────────
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = googleEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.signInWithEmailOtp(email);
      if (result.success) {
        setToastMessage(`OTP sent to ${email}`);
        setOtpDigits(['', '', '', '', '', '']);
        setUserEnteredOtp('');
        setEmailStep('OTP_INPUT');
        setResendTimer(60);
      } else {
        setError(result.error || 'Failed to send OTP to email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending Email OTP');
    }
    setLoading(false);
  };

  const executeEmailVerification = async (codeToVerify: string) => {
    setError(null);
    const cleanOtp = codeToVerify.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    const email = googleEmailInput.trim().toLowerCase();
    setLoading(true);

    try {
      const result = await authService.verifyEmailOtp(email, cleanOtp);
      if (result.success) {
        const existingProfile = getStoredProfile(email);
        if (existingProfile && existingProfile.name && existingProfile.name !== 'Traveller') {
          // Returning User
          finalizeLogin({
            name: existingProfile.name,
            phone: existingProfile.phone || '',
            email: email,
            category: existingProfile.category || 'general',
            savedLocations: existingProfile.savedLocations || sosService.getSavedLocations(),
            bloodGroup: existingProfile.bloodGroup || 'B+',
            homeAddress: existingProfile.homeAddress || 'Bhubaneswar, Odisha',
          });
          return;
        }
        // Brand New User
        setLoading(false);
        setToastMessage('');
        setEmailStep('NAME_INPUT');
      } else {
        setError(result.error || 'Invalid OTP code.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP');
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    executeEmailVerification(userEnteredOtp || otpDigits.join(''));
  };

  const handleSaveEmailProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleNameInput.trim()) {
      setError('Please enter your Name.');
      return;
    }
    finalizeLogin({
      name: googleNameInput.trim(),
      phone: '',
      email: googleEmailInput.trim().toLowerCase(),
      category: googleCategory,
      savedLocations: sosService.getSavedLocations(),
      bloodGroup: 'B+',
      homeAddress: 'Bhubaneswar, Odisha',
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
      studentDetails: userData.category === 'student' ? { college: userData.studentCollege || 'Trident Academy of Technology' } : null,
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
      // Save to Supabase Database if configured
      if (isSupabaseConfigured() && supabase) {
        const currentUser = authService.getCurrentUser();
        const userId = currentUser?.id || authObj.id;
        await supabase.from('user_profiles').upsert({
          id: userId,
          email: userData.email,
          full_name: userData.name,
          phone: userData.phone || null,
          blood_group: userData.bloodGroup || 'B+',
          home_city: userData.homeAddress || 'Bhubaneswar, Odisha',
          category: userData.category || 'general',
          student_college: userData.studentCollege || null,
          wallet_balance: walletService.getBalance() || 100,
          musafir_coins: 0,
        });
      }

      // Send login email notification (optional)
      if (userData.email.includes('@gmail.com') || userData.email.includes('@')) {
        await fetch('/api/auth/login-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            fullName: userData.name,
            phone: userData.phone,
            category: userData.category,
            homeCity: userData.homeAddress,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Backend sync notice:', e);
    }

    setToastMessage('');
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto min-h-screen flex flex-col justify-between animate-in fade-in duration-300 font-sans text-slate-900 relative">
      
      {/* ── BLURRED BACKGROUND IMAGE LAYER ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <img
          src="/login-bg.png"
          alt="Transit background"
          className="w-full h-full object-cover scale-105 filter blur-[4px] brightness-[0.97] contrast-[1.02]"
        />
        {/* Soft atmospheric overlay for high text contrast */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
      </div>

      {/* ── TOP NAVBAR ── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/60 shadow-xs">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 shadow-xs border border-blue-100 flex items-center justify-center flex-shrink-0">
            <img
              src="/musafir-logo.png"
              alt="Musafir Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0F265C] font-sans">
            Musafir
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs sm:text-sm font-bold text-slate-800 bg-white/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/60 shadow-xs">
            Your Journey, Our Intelligence
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT: 2-COLUMN SPLIT (DESKTOP) / RESPONSIVE STACK (MOBILE) ── */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* ── LEFT HERO: BRANDING & INTELLIGENT TRANSIT OVERVIEW ── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            <div className="bg-white/75 backdrop-blur-xl border border-white/70 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-900/10 space-y-5">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-md border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/musafir-logo.png"
                    alt="Musafir Original Brand Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black text-[#0F265C] tracking-tight">
                    Musafir
                  </h1>
                  <p className="text-sm sm:text-base text-blue-700 font-bold">
                    Your Journey, Our Intelligence
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                Unified Multi-Modal Transit Grid for seamless travel, smart ticketing, and live route intelligence.
              </p>

              {/* Transit Modes Strip (Metro and Cabs & Autos removed as circled in red) */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-800 pt-1">
                <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 border border-white/80 shadow-xs">
                  🚌 Buses
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 border border-white/80 shadow-xs">
                  🚆 Trains
                </span>
              </div>

              {/* Live Transit Stats Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2 bg-emerald-50/90 text-emerald-900 border border-emerald-200/90 px-3.5 py-2 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Bhubaneswar Multi-Modal Transit Grid Live</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50/90 text-blue-900 border border-blue-200/90 px-3.5 py-2 rounded-full font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>₹100 Welcome Joining Bonus</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: GLASSMORPHISM LOGIN CARD ── */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-slate-900/15 w-full max-w-md space-y-5 transition-all">
              
              {/* Card Header */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Welcome back!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {emailStep === 'EMAIL_INPUT' && 'Log in to continue your journey'}
                  {emailStep === 'OTP_INPUT' && 'Enter 6-digit OTP code sent to your email'}
                  {emailStep === 'NAME_INPUT' && 'Complete your commuter profile details'}
                </p>
              </div>

              {/* Toast & Error Alerts */}
              {toastMessage && (
                <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
                  <span className="text-base">📩</span>
                  <span>{toastMessage}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── STEP 1: EMAIL INPUT (ONLY EMAIL OPTION) ── */}
              {emailStep === 'EMAIL_INPUT' && (
                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="yourname@gmail.com"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/90 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-blue-600 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Remember Me & Help */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Remember me</span>
                    </label>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> ₹100 Bonus Included
                    </span>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Log In</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500 font-medium">
                      Don't have an account? <span className="font-bold text-blue-600 hover:underline cursor-pointer">Sign Up</span>
                    </p>
                  </div>
                </form>
              )}

              {/* ── STEP 2: OTP ENTRY (AS CURRENTLY IMPLEMENTED) ── */}
              {emailStep === 'OTP_INPUT' && (
                <form onSubmit={handleVerifyEmailOTP} className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="p-3 bg-blue-50/90 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                    <div className="truncate">
                      <span className="text-slate-500 block text-[10px]">OTP sent to:</span>
                      <strong className="text-blue-900 font-bold truncate">{googleEmailInput}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailStep('EMAIL_INPUT')}
                      className="text-blue-600 font-bold text-xs hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* 6 Digit Boxes */}
                  <div className="flex justify-center gap-1.5 sm:gap-2 my-4">
                    {otpDigits.map((d, idx) => (
                      <input
                        key={idx}
                        id={`otp-email-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onPaste={handlePasteOtp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newDigits = [...otpDigits];
                          newDigits[idx] = val;
                          setOtpDigits(newDigits);
                          setUserEnteredOtp(newDigits.join(''));
                          if (val && idx < 5) {
                            document.getElementById(`otp-email-${idx + 1}`)?.focus();
                          }
                          if (val && idx === 5) {
                            executeEmailVerification(newDigits.join(''));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !d && idx > 0) {
                            document.getElementById(`otp-email-${idx - 1}`)?.focus();
                          }
                        }}
                        className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-black bg-white/90 border-2 border-slate-200/90 focus:border-blue-600 focus:bg-white rounded-xl focus:outline-none text-slate-900 transition shadow-xs"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || userEnteredOtp.length !== 6}
                    className="w-full py-3.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify OTP & Continue</span><ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendEmailOTP}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center justify-center gap-1.5 w-full transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {resendTimer > 0 ? `Resend code in 00:${resendTimer.toString().padStart(2, '0')}` : 'Resend OTP Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: NAME & PASSENGER PROFILE SETUP (IF NEW USER) ── */}
              {emailStep === 'NAME_INPUT' && (
                <form onSubmit={handleSaveEmailProfile} className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abhijit Rout"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white/90 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Passenger Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'general', label: 'General', icon: '🚆' },
                        { id: 'student', label: 'Student', icon: '🎓' },
                        { id: 'senior', label: 'Senior', icon: '🧓' },
                        { id: 'women', label: 'Women', icon: '👩' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setGoogleCategory(cat.id as any)}
                          className={`p-2.5 rounded-xl text-center font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                            googleCategory === cat.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white/80 text-slate-700 border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-[10px]">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer"
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

              {/* Card Footer Privacy Note */}
              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by Verified Government Transit Registry</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-slate-800 font-semibold flex-shrink-0 z-20">
        <div className="inline-block bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-xs">
          © 2026 Musafir. Multi-Modal Unified Transit & Mobility Grid. All rights reserved.
        </div>
      </footer>

    </div>
  );
};
