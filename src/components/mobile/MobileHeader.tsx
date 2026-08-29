import React from 'react';
import { LanguageCode } from '../../types/i18n';

interface MobileHeaderProps {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  onOpenLanguage: () => void;
  onOpenWallet: () => void;
  onOpenBusRoutes: () => void;
  onTriggerSOS: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  currentLang: LanguageCode;
  walletBalance: number;
  userName?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenMenu,
  onOpenProfile,
  onOpenAlerts,
  onOpenLanguage,
  onOpenWallet,
  onOpenBusRoutes,
  onTriggerSOS,
  themeMode,
  onToggleTheme,
  currentLang,
  walletBalance,
  userName = 'User',
}) => {
  const initial = userName ? userName.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-glass border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          className="p-2 -ml-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          aria-label="Open Menu"
        >
          <span className="material-symbols-outlined text-[24px] block">menu</span>
        </button>

        <div 
          onClick={onOpenMenu}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-blue-600/30">
            M
          </div>
          <span className="font-extrabold text-lg tracking-tight text-blue-600 dark:text-blue-400">
            MUSAFIR
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onTriggerSOS}
          className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-black flex items-center gap-1 active:scale-95 shadow-2xs animate-pulse"
          title="Emergency SOS"
        >
          <span className="material-symbols-outlined text-[15px]">emergency</span>
          <span className="hidden xs:inline">SOS</span>
        </button>

        <button
          onClick={onOpenWallet}
          className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          title="Musafir TransitPay Wallet"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">account_balance_wallet</span>
          <span>₹{walletBalance}</span>
        </button>

        <button
          onClick={onOpenLanguage}
          className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Language"
        >
          <span className="material-symbols-outlined text-[20px]">translate</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Theme Mode"
        >
          <span className="material-symbols-outlined text-[20px]">
            {themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onClick={onOpenAlerts}
          className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative active:scale-95"
          title="Transit Alerts"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs ml-0.5 active:scale-90 transition"
          title="User Profile"
        >
          {initial}
        </button>
      </div>
    </header>
  );
};
