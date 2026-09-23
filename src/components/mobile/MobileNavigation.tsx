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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A1514]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#1E3836] shadow-[0_-4px_20px_rgba(4,15,14,0.2)] flex justify-around items-center px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'home'
            ? 'text-[#0F766E] dark:text-[#2DD4BF] font-extrabold bg-[#0F766E]/10 dark:bg-[#0F766E]/20 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            ? 'text-[#0F766E] dark:text-[#2DD4BF] font-extrabold bg-[#0F766E]/10 dark:bg-[#0F766E]/20 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            ? 'text-[#16A34A] dark:text-emerald-400 font-extrabold bg-[#16A34A]/10 dark:bg-[#16A34A]/20 shadow-inner'
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
            ? 'text-[#F59E0B] dark:text-amber-400 font-extrabold bg-amber-500/10 dark:bg-amber-500/20 shadow-inner'
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
            ? 'text-[#0F766E] dark:text-[#2DD4BF] font-extrabold bg-[#0F766E]/10 dark:bg-[#0F766E]/20 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: activeTab === 'map' ? "'FILL' 1" : "'FILL' 0" }}>
          explore
        </span>
        <span className="text-[10px] leading-tight font-bold">Live Map & Plan</span>
      </button>
    </nav>
  );
};
