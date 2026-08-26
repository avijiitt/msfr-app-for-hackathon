import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Navigation2, Loader2,
  AlertCircle, CheckCircle2, X, Phone, Shield, RefreshCw
} from 'lucide-react';
import { authService, isSupabaseConfigured, supabase } from '../../services/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = 'google' | 'phone' | 'email';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<Tab>('google');
  const [isSignUp, setIsSignUp] = useState(false);

  // Email fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null); setSuccess(null); setOtpSent(false);
    setOtp(''); setPhone(''); setEmail(''); setPassword('');
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true); setError(null);
    const result = await authService.signInWithGoogle();
    if (!result.success) {
      setError(result.error || 'Google sign-in failed. Make sure Google is enabled in Supabase Auth settings.');
    }
    setLoading(false);
  };

  // ── Phone OTP — Send OTP ───────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.trim().replace(/\s/g, '');
    if (!cleaned) { setError('Enter a valid phone number.'); return; }

    // Normalize to E.164 format for India (+91)
    const e164 = cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0/, '')}`;
    if (e164.length < 12) { setError('Enter a valid 10-digit Indian mobile number.'); return; }

    setLoading(true); setError(null);

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setOtpSent(true);
    setSuccess(`OTP sent to ${e164} ✅`);
    setLoading(false);

    // 60-second countdown before resend
    let t = 60;
    setCountdown(t);
    const interval = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) clearInterval(interval);
    }, 1000);
  };

  // ── Phone OTP — Verify OTP ─────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.trim().length < 4) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true); setError(null);

    const e164 = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim().replace(/^0/, '')}`;

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: 'sms' });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setSuccess('Phone verified! Welcome to musafir 🎉');
    setTimeout(() => { onSuccess(); onClose(); }, 1000);
    setLoading(false);
  };

  // ── Email + Password ───────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    let result;
    if (isSignUp) {
      if (!fullName.trim()) { setError('Enter your full name.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      result = await authService.signUpWithEmail(email, password, fullName);
      if (result.success) {
        setSuccess(isSupabaseConfigured()
          ? '✅ Account created! Check your email to verify, then sign in.'
          : '✅ Welcome! (Demo mode — add Supabase keys for cloud auth)');
        setTimeout(() => { onSuccess(); onClose(); }, 1800);
      }
    } else {
      result = await authService.signInWithEmail(email, password);
      if (result.success) { setSuccess('Welcome back! 👋'); setTimeout(() => { onSuccess(); onClose(); }, 700); }
    }
    if (!result.success) setError(result.error || 'Something went wrong. Try again.');
    setLoading(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'google', label: 'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
    { id: 'phone', label: 'Phone OTP', icon: <Phone className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 top-10 w-16 h-16 bg-white/10 rounded-full" />
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3 relative">
            <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center">
              <Navigation2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight block">musafir</span>
              <span className="text-blue-200 text-xs">Smart Transit for India</span>
            </div>
          </div>
          <p className="text-blue-100 text-sm relative">Sign in to unlock wallet, rewards, live tracking & more.</p>
        </div>

        {/* Method Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); resetState(); }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                tab === t.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-900'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Status messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl p-3 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-xl p-3 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ── Google Tab ── */}
          {tab === 'google' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Sign in instantly with your Google account. No password needed.
              </p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold rounded-2xl text-sm transition flex items-center justify-center gap-3 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Your Google account email will be linked to your musafir profile.
              </p>
            </div>
          )}

          {/* ── Phone OTP Tab ── */}
          {tab === 'phone' && (
            <div className="space-y-3">
              {!otpSent ? (
                <>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 flex items-center gap-1.5">
                      <span className="text-sm">🇮🇳</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">+91</span>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-20 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-mono tracking-widest"
                      maxLength={10}
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Send OTP via SMS
                  </button>
                  <p className="text-center text-[11px] text-slate-400">
                    A 6-digit OTP will be sent to your Indian mobile number via SMS.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                    Enter the OTP sent to <strong>+91 {phone}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                    maxLength={6}
                    autoFocus
                  />
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Verify OTP
                  </button>
                  <button
                    onClick={() => { countdown <= 0 && handleSendOTP(); }}
                    disabled={countdown > 0}
                    className="w-full text-xs text-blue-600 disabled:text-slate-400 flex items-center justify-center gap-1.5 py-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Email Tab ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button type="button" onClick={() => setIsSignUp(false)} className={`flex-1 py-2 transition ${!isSignUp ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>Sign In</button>
                <button type="button" onClick={() => setIsSignUp(true)} className={`flex-1 py-2 transition ${isSignUp ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>Create Account</button>
              </div>
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-3.5 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-400 pt-1">
            By continuing, you agree to musafir's Terms of Service & Privacy Policy.
            {!isSupabaseConfigured() && ' 🔧 Demo mode active.'}
          </p>
        </div>
      </div>
    </div>
  );
};
