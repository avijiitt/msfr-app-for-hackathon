import React from 'react';
import { 
  Navigation2, MapPin, Calendar, Package, Wallet, Clock, Bookmark, 
  Bell, Calculator, Award, RotateCcw, Settings, X, ShieldAlert, Share2, 
  GraduationCap, Bus, ChevronRight, Sparkles, User, Sun, Moon
} from 'lucide-react';
import { MusafirSidebarTab } from './MusafirSidebar';
import { ThemeMode } from '../../types/transit';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MusafirSidebarTab;
  onTabChange: (tab: MusafirSidebarTab) => void;
  walletBalance: number;
  onOpenNearbyStops: () => void;
  onOpenShareLocation: () => void;
  onOpenSOS: () => void;
  onOpenStudent: () => void;
  onOpenWomenSafety: () => void;
  onOpenProfile: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  walletBalance,
  onOpenNearbyStops,
  onOpenShareLocation,
  onOpenSOS,
  onOpenStudent,
  onOpenWomenSafety,
  onOpenProfile,
  themeMode,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  // Read actual logged-in user details
  let userName = 'Traveller';
  let userEmail = '';
  try {
    const stored = localStorage.getItem('musafir_demo_user');
    if (stored) {
      const u = JSON.parse(stored);
      userName = u.fullName || u.full_name || 'Traveller';
      userEmail = u.email || '';
    }
  } catch {}
  const initials = userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSelectTab = (tab: MusafirSidebarTab) => {
    onTabChange(tab);
    onClose();
  };

  const navItems = [
    { id: 'plan' as MusafirSidebarTab, label: 'Plan Journey', icon: Navigation2, color: 'text-blue-600' },
    { id: 'tracking' as MusafirSidebarTab, label: 'Live Vehicle Tracking', icon: MapPin, color: 'text-emerald-600' },
    { id: 'schedule' as MusafirSidebarTab, label: 'Schedule Ride', icon: Calendar, color: 'text-indigo-600', badge: 'New' },
    { id: 'parcel' as MusafirSidebarTab, label: 'Transit Parcel Hub', icon: Package, color: 'text-amber-600' },
    { id: 'wallet' as MusafirSidebarTab, label: 'Mo-Wallet & Passes', icon: Wallet, color: 'text-blue-600', badge: `₹${walletBalance.toFixed(0)}` },
    { id: 'trips' as MusafirSidebarTab, label: 'My Trips Record', icon: Clock, color: 'text-slate-600 dark:text-slate-300' },
    { id: 'fare_calc' as MusafirSidebarTab, label: 'Fare Calculator', icon: Calculator, color: 'text-purple-600' },
    { id: 'rewards' as MusafirSidebarTab, label: 'Rewards & Miles', icon: Award, color: 'text-emerald-600', badge: '480 pts' },
    { id: 'refunds' as MusafirSidebarTab, label: 'Refunds & Assurance', icon: RotateCcw, color: 'text-rose-600' },
    { id: 'alerts' as MusafirSidebarTab, label: 'Live Alerts & Disruptions', icon: Bell, color: 'text-rose-600', badge: '3' },
    { id: 'settings' as MusafirSidebarTab, label: 'Profile & Settings', icon: Settings, color: 'text-slate-600 dark:text-slate-300' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex justify-start animate-in fade-in lg:hidden">
      <div className="w-[85%] max-w-[340px] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200">
        {/* Drawer Top Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-base shadow-sm">
              M
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">musafir</h3>
              <p className="text-[11px] text-blue-100 font-medium">Pan-India Transit Companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Shortcut */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => { onOpenProfile(); onClose(); }}>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
              {initials || <User className="w-5 h-5" />}
            </div>
            <div>
              <strong className="text-xs text-slate-900 dark:text-white block">{userName}</strong>
              {userEmail && <span className="text-[10px] text-slate-400 block">{userEmail}</span>}
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                Wallet: ₹{walletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            title="Toggle theme"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Quick Safety & Pass Buttons */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { onOpenSOS(); onClose(); }}
            className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Emergency SOS</span>
          </button>

          <button
            onClick={() => { onOpenStudent(); onClose(); }}
            className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Student Pass</span>
          </button>

          <button
            onClick={() => { onOpenWomenSafety(); onClose(); }}
            className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-bold flex items-center gap-2"
          >
            <span>🌸</span>
            <span>Women Safety</span>
          </button>

          <button
            onClick={() => { onOpenNearbyStops(); onClose(); }}
            className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-2"
          >
            <Bus className="w-4 h-4 text-blue-600" />
            <span>Nearby Stops</span>
          </button>
        </div>

        {/* All Main Navigation Links (With visible scrollbar) */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
            All Features & Services
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">musafir • Multi-Modal India Transit v2.0</p>
        </div>
      </div>
    </div>
  );
};
