import React from 'react';
import { 
  Navigation2, 
  MapPin, 
  Clock, 
  Bookmark, 
  Bell, 
  Calculator, 
  Settings, 
  ShieldAlert, 
  Share2, 
  Award, 
  RotateCcw, 
  Home, 
  GraduationCap, 
  Briefcase, 
  Star,
  Bus,
  Calendar,
  Package,
  Wallet,
  Zap,
  Truck,
  Users
} from 'lucide-react';

import { TranslationDictionary } from '../../types/i18n';

export type MusafirSidebarTab = 
  | 'plan' 
  | 'tracking' 
  | 'transportation'
  | 'logistics'
  | 'community'
  | 'schedule'
  | 'parcel'
  | 'wallet'
  | 'trips' 
  | 'saved' 
  | 'alerts' 
  | 'fare_calc' 
  | 'rewards' 
  | 'refunds' 
  | 'settings';

interface MusafirSidebarProps {
  activeTab: MusafirSidebarTab;
  onTabChange: (tab: MusafirSidebarTab) => void;
  onOpenNearbyStops: () => void;
  onOpenShareLocation: () => void;
  onOpenSOS: () => void;
  onOpenStudent: () => void;
  onOpenBusRoutes?: () => void;
  onSelectSavedPlace: (name: string) => void;
  t?: TranslationDictionary;
}

export const MusafirSidebar: React.FC<MusafirSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNearbyStops,
  onOpenShareLocation,
  onOpenSOS,
  onOpenStudent,
  onOpenBusRoutes,
  onSelectSavedPlace,
  t,
}) => {
  const mainNav = [
    { id: 'plan' as MusafirSidebarTab, label: t?.navRoutes || 'Plan & Routes', icon: Navigation2 },
    { id: 'tracking' as MusafirSidebarTab, label: t?.navMap || 'Live Map', icon: MapPin },
    { id: 'transportation' as MusafirSidebarTab, label: 'Transit Hub', icon: Zap, badge: 'Smart' },
    { id: 'logistics' as MusafirSidebarTab, label: 'Logistics Optimizer', icon: Truck, badge: 'TSP' },
    { id: 'community' as MusafirSidebarTab, label: 'Civic Community', icon: Users, badge: 'Feed' },
    { id: 'schedule' as MusafirSidebarTab, label: t?.navSchedule || 'Schedule', icon: Calendar },
    { id: 'parcel' as MusafirSidebarTab, label: t?.parcelDelivery || 'Parcel', icon: Package },
    { id: 'wallet' as MusafirSidebarTab, label: t?.navWallet || 'Wallet', icon: Wallet },
    { id: 'trips' as MusafirSidebarTab, label: t?.navActivity || 'Trips', icon: Clock },
    { id: 'saved' as MusafirSidebarTab, label: 'Saved Places', icon: Bookmark },
    { id: 'alerts' as MusafirSidebarTab, label: t?.liveAnnouncements || 'Alerts', icon: Bell, badge: '3' },
    { id: 'fare_calc' as MusafirSidebarTab, label: t?.fareBreakdown || 'Fare Calculator', icon: Calculator },
    { id: 'rewards' as MusafirSidebarTab, label: t?.quickPasses || 'Rewards', icon: Award, badge: '480 pts' },
    { id: 'refunds' as MusafirSidebarTab, label: 'Assurance', icon: RotateCcw },
    { id: 'settings' as MusafirSidebarTab, label: t?.navProfile || 'Settings', icon: Settings },
  ];

  const quickAccess = [
    { label: 'Mo Bus (82 Lines)', icon: Bus, color: 'text-blue-600 font-bold', action: onOpenBusRoutes || onOpenNearbyStops },
    { label: 'Nearby Stores', icon: MapPin, color: 'text-emerald-600', action: onOpenNearbyStops },
    { label: t?.studentPass || 'Student Pass', icon: GraduationCap, color: 'text-purple-600', action: onOpenStudent },
    { label: t?.shareLocationFamily || 'Share Trip', icon: Share2, color: 'text-indigo-600', action: onOpenShareLocation },
    { label: t?.emergencySOS || 'SOS', icon: ShieldAlert, color: 'text-red-500', action: onOpenSOS },
  ];

  const savedPlaces = [
    { name: 'Home', subtitle: 'Jayadev Vihar', icon: Home, color: 'text-blue-600' },
    { name: 'College', subtitle: 'KIIT University', icon: GraduationCap, color: 'text-purple-600' },
    { name: 'Work', subtitle: 'Infocity, Patia', icon: Briefcase, color: 'text-indigo-600' },
    { name: 'KIIT Square', subtitle: 'Bhubaneswar', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-130px)] lg:sticky lg:top-24 shadow-sm">
      {/* 1. Main Navigation Items */}
      <nav className="space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.id === 'alerts' 
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                    : item.id === 'schedule'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 2. Quick Access Section */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
          Quick Access
        </span>
        <div className="space-y-1">
          {quickAccess.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <button
                key={i}
                onClick={qa.action}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
              >
                <div className={`w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${qa.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">{qa.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Saved Places Section */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Saved Places
          </span>
          <button
            onClick={() => alert('Edit saved locations in your profile.')}
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="space-y-1">
          {savedPlaces.map((sp, i) => {
            const Icon = sp.icon;
            return (
              <button
                key={i}
                onClick={() => onSelectSavedPlace(sp.subtitle)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
              >
                <div className={`w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${sp.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition truncate">
                    {sp.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {sp.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
