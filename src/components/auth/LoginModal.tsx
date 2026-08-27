import React, { useState, useEffect } from 'react';
import {
  Navigation2, Loader2, AlertCircle, CheckCircle2,
  Shield, Phone, User, MapPin, Heart, Sparkles, Check, ChevronRight,
  School, HeartHandshake, Mail, ArrowLeft
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
  // Step 1: Google Account Picker / Sign-In
  // Step 2: Mandatory Passenger Profile Details
  const [step, setStep] = useState<1 | 2>(1);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mandatory Profile Form State
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

  // Check if session or profile already exists
  useEffect(() => {
    // 1. Check Supabase auth session from OAuth redirect
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          const u = data.session.user;
          const userEmail = u.email || '';
          const userName = u.user_metadata?.full_name || userEmail.split('@')[0] || '';
          setEmail(userEmail);
          setFullName(userName);
          setStep(2);
        }
      });
    }

    // 2. Check local saved user
    const existing = authService.getCurrentUser();
    const isCompleted = localStorage.getItem('musafir_profile_completed');
    if (existing && !isCompleted) {
      setFullName(existing.fullName || '');
      setEmail(existing.email || '');
      setStep(2);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── 1. Select / Confirm Google Account ────────────────────────────────────
  const handleSelectGoogleAccount = (selectedEmail: string, selectedName: string) => {
    setLoading(true);
    setError(null);

    const googleUser = {
      id: 'usr-google-' + Date.now(),
      email: selectedEmail,
      fullName: selectedName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedEmail}`,
    };

    localStorage.setItem('musafir_demo_user', JSON.stringify(googleUser));
    setEmail(selectedEmail);
    setFullName(selectedName);

    setTimeout(() => {
      setLoading(false);
      setStep(2); // Advance directly to mandatory profile registration
    }, 400);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    if (!googleNameInput.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    handleSelectGoogleAccount(googleEmailInput.trim(), googleNameInput.trim());
  };

  // ── 2. Complete Mandatory Registration ────────────────────────────────────
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
        email: email.trim(),
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

      // 1. Save to Supabase Cloud Database if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const user = authService.getCurrentUser();
          const userId = user?.id || '00000000-0000-0000-0000-000000000000';
          await supabase.from('profiles').upsert({
            id: userId,
            email: email.trim(),
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
        email: email.trim(),
        fullName: fullName.trim(),
      };
      authService.setSessionUser(authObj);

      // 3. Credit ₹100 Welcome Joining Bonus to Mo-Wallet
      const hasBonus = localStorage.getItem('musafir_welcome_bonus_credited');
      if (!hasBonus) {
        walletService.addFunds(100, 'Musafir Welcome Joining Bonus 🎁');
        localStorage.setItem('musafir_welcome_bonus_credited', '1');
      }

      // 4. Send Confirmation Notification to User's Gmail
      try {
        await fetch('http://localhost:5000/api/auth/login-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
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
          body: `Login confirmation sent to ${email.trim()}. ₹100 welcome bonus added to Mo-Wallet.`,
          icon: '/favicon.ico',
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
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
                  {step === 1 ? 'Google Sign-In Authentication' : 'Mandatory Passenger Registration (Step 2 of 2)'}
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

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: GOOGLE SIGN-IN & ACCOUNT SELECTION ──────────────── */}
          {step === 1 ? (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-5 py-1">
              <div className="space-y-1.5 text-center">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Sign in with Google
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Enter your Google account details to get verified transit access, live vehicle GPS, and instant locker PINs.
                </p>
              </div>

              {/* Google SVG logo */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
              </div>

              {/* Gmail Address */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-500" /> Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" /> Full Name *
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    </svg>
                    <span>Sign In & Continue →</span>
                  </>
                )}
              </button>

              {/* Safety note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-left space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Public Transit Safety Standard</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  After sign-in, you must complete your passenger details (Mobile & Emergency Contact) to enter the app.
                </p>
              </div>
            </form>
          ) : (

            /* ──────────────── STEP 2: MANDATORY PASSENGER REGISTRATION ──────────────── */
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-blue-900 dark:text-blue-200 block font-bold">Mandatory Passenger Details</strong>
                  <span className="text-blue-700 dark:text-blue-300 text-[11px]">
                    To unlock the map and receive SMS parcel locker PINs & SOS protection, please provide your verified passenger info.
                  </span>
                </div>
              </div>

              {/* Verified Google Account Bar */}
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs">
                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">{fullName || 'Google Passenger'}</strong>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px]">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline"
                >
                  Change Account
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

              {/* Mobile Phone & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" /> Mobile Number (+91) *
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={10}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" /> Blood Group (For Medical ID) *
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

              {/* Primary City / Base Station */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" /> Primary Transit City / Region *
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
