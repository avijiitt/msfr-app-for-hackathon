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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-glass border-b border-slate-200/80 dark:border-slate-800/80 px-2.5 sm:px-4 py-2 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={onOpenMenu}
          className="p-1.5 -ml-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all flex-shrink-0"
          aria-label="Open Menu"
        >
          <span className="material-symbols-outlined text-[22px] block">menu</span>
        </button>

        <div 
          onClick={onOpenMenu}
          className="flex items-center gap-1.5 cursor-pointer select-none truncate"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-blue-600/30 flex-shrink-0">
            M
          </div>
          <span className="font-extrabold text-base tracking-tight text-blue-600 dark:text-blue-400">
            MUSAFIR
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* SOS Emergency Button */}
        <button
          onClick={onTriggerSOS}
          className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-black flex items-center gap-0.5 active:scale-95 shadow-2xs animate-pulse flex-shrink-0"
          title="Emergency SOS"
        >
          <span className="material-symbols-outlined text-[14px]">emergency</span>
          <span>SOS</span>
        </button>

        {/* Wallet Balance Badge */}
        <button
          onClick={onOpenWallet}
          className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 flex-shrink-0"
          title="TransitPay Wallet"
        >
          <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">account_balance_wallet</span>
          <span>₹{walletBalance}</span>
        </button>

        {/* Language Modal */}
        <button
          onClick={onOpenLanguage}
          className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex-shrink-0"
          title="Change Language"
        >
          <span className="material-symbols-outlined text-[19px]">translate</span>
        </button>

        {/* Dark/Light Mode */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex-shrink-0"
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined text-[19px]">
            {themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Live Transit Alerts Notification Bell - Always 100% visible */}
        <button
          onClick={onOpenAlerts}
          className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative active:scale-95 flex-shrink-0 bg-amber-500/10 dark:bg-amber-400/10"
          title="Live Transit Alerts"
        >
          <span className="material-symbols-outlined text-[20px] text-amber-600 dark:text-amber-400">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};

