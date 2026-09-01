import React from 'react';

export type MobileTab = 'home' | 'map' | 'transportation' | 'logistics' | 'community' | 'profile';

interface MobileNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  unreadAlertsCount?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E091C]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2B1D47] shadow-[0_-4px_20px_rgba(7,4,15,0.2)] flex justify-around items-center px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'home'
            ? 'text-violet-600 dark:text-violet-300 font-extrabold bg-violet-50 dark:bg-violet-950/60 shadow-inner'
            : 'text-slate-500 dark:text-violet-200/60 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>
          home
        </span>
        <span className="text-[10px] leading-tight font-bold">Home</span>
      </button>

      <button
        onClick={() => onTabChange('transportation')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'transportation'
            ? 'text-violet-600 dark:text-violet-300 font-extrabold bg-violet-50 dark:bg-violet-950/60 shadow-inner'
            : 'text-slate-500 dark:text-violet-200/60 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'transportation' ? "'FILL' 1" : "'FILL' 0" }}>
          electric_bolt
        </span>
        <span className="text-[10px] leading-tight font-bold">Transit</span>
      </button>

      <button
        onClick={() => onTabChange('logistics')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'logistics'
            ? 'text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'logistics' ? "'FILL' 1" : "'FILL' 0" }}>
          local_shipping
        </span>
        <span className="text-[10px] leading-tight font-bold">Logistics</span>
      </button>

      <button
        onClick={() => onTabChange('community')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'community'
            ? 'text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50 dark:bg-purple-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'community' ? "'FILL' 1" : "'FILL' 0" }}>
          group
        </span>
        <span className="text-[10px] leading-tight font-bold">Community</span>
      </button>

      <button
        onClick={() => onTabChange('map')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'map'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'map' ? "'FILL' 1" : "'FILL' 0" }}>
          explore
        </span>
        <span className="text-[10px] leading-tight font-bold">Live Map</span>
      </button>
    </nav>
  );
};
