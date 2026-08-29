import React, { useState, useEffect } from 'react';
import { Shield, Wallet, Wifi, WifiOff, Globe, MapPin, Sun, Moon, Clock, GraduationCap, User, Headphones, Navigation2, LocateFixed } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import { LanguageCode, TranslationDictionary } from '../../types/i18n';
import { ThemeMode } from '../../types/transit';
import { ALL_INDIAN_CITIES } from '../../data/cities/indiaCities';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  selectedCity: string;
  onCityChange: (city: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  isGpsTracking: boolean;
  onToggleGps: () => void;
  walletBalance: number;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onOpenWallet: () => void;
  onOpenSOS: () => void;
  onOpenAnnouncements: () => void;
  onOpenAI: () => void;
  onOpenStudent: () => void;
  onOpenSupport: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  t,
  selectedCity,
  onCityChange,
  isOffline,
  onToggleOffline,
  isGpsTracking,
  onToggleGps,
  walletBalance,
  themeMode,
  onToggleTheme,
  onOpenWallet,
  onOpenSOS,
  onOpenAnnouncements,
  onOpenAI,
  onOpenStudent,
  onOpenSupport,
  onOpenProfile,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleString('en-IN', options) + ' IST');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface/80 dark:bg-surface/80 light:bg-white/95 backdrop-blur-xl border-b border-primary/20 shadow-[0_0_15px_rgba(250,189,0,0.1)] px-3 py-2.5 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Pan-India City Hub */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0">
              <img
                src="/musafir-logo.png"
                alt="Musafir"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-primary font-display-lg drop-shadow-[0_0_8px_rgba(255,228,175,0.3)] uppercase">
                  MUSAFIR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-label-caps">
                  India Multi-Modal
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant hidden lg:block">
                Unified Multi-Modal Transit System (Mo Bus • Metro • Mo E-Ride • EV Shuttle)
              </p>
            </div>
          </div>

          {/* India Cities Selector */}
          <div className="hidden md:flex items-center bg-surface-container border border-primary/20 rounded-xl px-2.5 py-1.5 text-xs text-on-surface">
            <MapPin className="w-3.5 h-3.5 text-primary mr-1.5 flex-shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-transparent text-on-surface focus:outline-none cursor-pointer pr-1 text-xs font-semibold"
            >
              {ALL_INDIAN_CITIES.map((city) => (
                <option key={city.id} value={city.id} className="bg-surface-container-high text-on-surface">
                  📍 {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Live Date & Time Ticker */}
        <div className="hidden xl:flex items-center gap-2 bg-surface-container border border-primary/20 px-3.5 py-1 rounded-xl text-xs font-label-caps text-primary shadow-[0_0_10px_rgba(250,189,0,0.1)]">
          <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>{currentDateTime}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Real-Time GPS Tracking Toggle */}
          <button
            onClick={onToggleGps}
            title={isGpsTracking ? 'Real-Time GPS Tracking Active' : 'Enable Real-Time Device GPS'}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all font-label-caps ${
              isGpsTracking
                ? 'bg-tertiary-container text-on-tertiary-container border-tertiary-fixed shadow-[0_0_12px_rgba(133,246,229,0.4)] animate-pulse'
                : 'bg-surface-container text-on-surface-variant hover:text-tertiary border-primary/20'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isGpsTracking ? 'GPS Live: ON' : 'Track GPS'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright border border-primary/20 text-primary text-xs flex items-center gap-1 transition"
            title={themeMode === 'dark' ? t.lightMode : t.darkMode}
          >
            {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5 text-primary" /> : <Moon className="w-3.5 h-3.5 text-slate-800" />}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {themeMode === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-surface-container border border-primary/20 rounded-lg px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-tertiary mr-1 hidden xs:block" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-on-surface font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-surface-container-high text-on-surface">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Offline Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? t.offlineReady : t.onlineSync}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-primary border-primary shadow-[0_0_10px_rgba(250,189,0,0.2)]'
                : 'bg-tertiary-container/10 text-tertiary-fixed border-tertiary-fixed/30 hover:bg-tertiary-container/20'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-primary" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isOffline ? 'Offline Mode' : 'Online Sync'}</span>
          </button>

          {/* Student Hub */}
          <button
            onClick={onOpenStudent}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30 text-tertiary text-xs font-bold transition"
            title="Student DigiLocker Pass"
          >
            <GraduationCap className="w-3.5 h-3.5 text-tertiary" />
            <span className="hidden md:inline font-label-caps">Student Pass</span>
          </button>

          {/* Digital Wallet Pill */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold transition"
          >
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span className="font-label-caps font-bold">₹{walletBalance.toFixed(0)}</span>
          </button>

          {/* User Profile */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright border border-primary/20 text-on-surface text-xs flex items-center justify-center transition"
            title="User Profile & Supabase Sync"
          >
            <User className="w-3.5 h-3.5 text-primary" />
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary-container/30 hover:bg-secondary-container/50 text-secondary font-bold text-xs shadow-lg glow-ambient-pink border border-secondary transition transform active:scale-95"
          >
            <Shield className="w-3.5 h-3.5 fill-current animate-pulse text-secondary" />
            <span className="font-label-caps">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
