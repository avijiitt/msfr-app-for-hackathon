import React from 'react';
import { Navigation2, MapPin, Wallet, Menu, Sparkles, Mic } from 'lucide-react';
import { MusafirSidebarTab } from './MusafirSidebar';

interface MobileBottomNavProps {
  activeTab: MusafirSidebarTab;
  onTabChange: (tab: MusafirSidebarTab) => void;
  walletBalance: number;
  onOpenWallet: () => void;
  onOpenAI: () => void;
  onOpenMenuDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  walletBalance,
  onOpenWallet,
  onOpenAI,
  onOpenMenuDrawer,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around lg:hidden shadow-lg safe-area-bottom">
      {/* 1. Plan Journey */}
      <button
        onClick={() => onTabChange('plan')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'plan'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Navigation2 className={`w-5 h-5 ${activeTab === 'plan' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Plan</span>
      </button>

      {/* 2. Live Map Tracking */}
      <button
        onClick={() => onTabChange('tracking')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'tracking'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MapPin className={`w-5 h-5 ${activeTab === 'tracking' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Live Map</span>
      </button>

      {/* 3. Center AI Assistant Button (Elevated Circle) */}
      <button
        onClick={onOpenAI}
        className="flex flex-col items-center -mt-5 group"
        title="Voice & AI Assistant"
      >
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white p-3 shadow-lg shadow-blue-600/40 border-3 border-white dark:border-slate-900 flex items-center justify-center group-active:scale-95 transition">
          <Mic className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">Musafir AI</span>
      </button>

      {/* 4. Mo-Wallet */}
      <button
        onClick={onOpenWallet}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'wallet'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[10px] font-mono font-bold">₹{walletBalance.toFixed(0)}</span>
      </button>

      {/* 5. Menu Drawer (All features) */}
      <button
        onClick={onOpenMenuDrawer}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">Menu</span>
      </button>
    </nav>
  );
};
