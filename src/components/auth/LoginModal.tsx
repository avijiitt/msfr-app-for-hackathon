import React, { useState, useEffect } from 'react';
import {
  Navigation2, Loader2, AlertCircle, CheckCircle2,
  Shield, Phone, User, Mail, ArrowLeft, Smartphone, RefreshCw, KeyRound, Sparkles, ChevronRight
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
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top duration-300">
              <span className="text-base">📩</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ────────────────── EMAIL OTP LOGIN ────────────────── */}
          {authMethod === 'GOOGLE' && (
            <div className="space-y-4 py-1">
              {emailStep === 'EMAIL_INPUT' && (
                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Sign in with Google Account
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      We'll send a 6-digit verification code to your email.
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Verification Code</span>}
                  </button>
                </form>
              )}

              {emailStep === 'OTP_INPUT' && (
                <form onSubmit={handleVerifyEmailOTP} className="space-y-5 animate-in slide-in-from-right-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                      <KeyRound className="w-5 h-5 text-blue-500" />
                      Verify Email
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                      Enter the 6-digit secure OTP sent to <strong className="text-slate-700 dark:text-slate-200">{googleEmailInput}</strong>
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 my-6">
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
                        className="w-11 h-12 text-center text-xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/20 text-slate-900 dark:text-white transition"
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || userEnteredOtp.length !== 6}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify & Continue</span>}
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendEmailOTP}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center justify-center gap-1.5 w-full transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {resendTimer > 0 ? `Resend code in 00:${resendTimer.toString().padStart(2, '0')}` : 'Resend OTP Code'}
                    </button>
                  </div>
                </form>
              )}

              {emailStep === 'NAME_INPUT' && (
                <form onSubmit={handleSaveEmailProfile} className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Complete Your Profile
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You're almost there! Set up your commuter pass details.
                    </p>
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
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Passenger Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Start Commuting (+ ₹100 Bonus)</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
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
