import React from 'react';
import { 
  MapPin, 
  Map, 
  BusFront, 
  Package, 
  Users, 
  CalendarClock, 
  Box,
  LayoutDashboard
} from 'lucide-react';

export type SidebarTab = 'plan' | 'map' | 'hub' | 'logistics' | 'community' | 'schedule' | 'parcel' | 'dashboard' | 'tracking' | 'transportation' | 'tickets' | 'fare_calc' | 'rewards' | 'refunds' | 'alerts' | 'settings' | 'trips' | 'wallet';

interface LeftSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onOpenDatabase?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, onTabChange, onOpenDatabase }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
    { id: 'plan', icon: <MapPin className="w-5 h-5" />, label: 'Plan Trip' },
    { id: 'map', icon: <Map className="w-5 h-5" />, label: 'Live Map' },
    { 
      id: 'transportation', 
      icon: <BusFront className="w-5 h-5" />, 
      label: 'Transit Hub',
      badge: <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider ml-auto">Smart</span>
    },
    { 
      id: 'logistics', 
      icon: <Package className="w-5 h-5" />, 
      label: 'Logistics Optimizer',
      badge: <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-wider ml-auto">TSP</span>
    },
    { id: 'community', icon: <Users className="w-5 h-5" />, label: 'Civic Community' },
    { id: 'schedule', icon: <CalendarClock className="w-5 h-5" />, label: 'Schedules' },
    { id: 'parcel', icon: <Box className="w-5 h-5" />, label: 'My Parcels' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 shrink-0">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">
          Navigation
        </div>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as SidebarTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
              {item.badge && (
                <div className="ml-auto flex items-center">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Bottom section with Live Database Inspector & CSV helper */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {onOpenDatabase && (
          <button
            onClick={onOpenDatabase}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800/60 rounded-xl text-teal-700 dark:text-teal-300 text-xs font-bold transition shadow-xs"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Database & Users
            </span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-teal-200/50 dark:bg-teal-800/50 rounded">
              CSV
            </span>
          </button>
        )}

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="font-bold text-slate-700 dark:text-slate-300">Supabase Connected</div>
          <div className="text-[10px] text-slate-400 mt-0.5">RLS Security Active</div>
        </div>
      </div>
    </aside>
  );
};
