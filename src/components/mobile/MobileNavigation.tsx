import React from 'react';

export type MobileTab = 'home' | 'map' | 'tickets' | 'alerts' | 'profile';

interface MobileNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  unreadAlertsCount?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  unreadAlertsCount = 2,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-glass border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] rounded-t-2xl flex justify-around items-center px-3 py-2 pb-safe transition-colors">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'home'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>
          home
        </span>
        <span className="text-[11px] leading-tight font-bold">Home</span>
      </button>

      <button
        onClick={() => onTabChange('map')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'map'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: activeTab === 'map' ? "'FILL' 1" : "'FILL' 0" }}>
          explore
        </span>
        <span className="text-[11px] leading-tight font-bold">Map</span>
      </button>

      <button
        onClick={() => onTabChange('tickets')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'tickets'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: activeTab === 'tickets' ? "'FILL' 1" : "'FILL' 0" }}>
          confirmation_number
        </span>
        <span className="text-[11px] leading-tight font-bold">Tickets</span>
      </button>

      <button
        onClick={() => onTabChange('alerts')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative active:scale-90 ${
          activeTab === 'alerts'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: activeTab === 'alerts' ? "'FILL' 1" : "'FILL' 0" }}>
          notifications
        </span>
        {unreadAlertsCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        )}
        <span className="text-[11px] leading-tight font-bold">Alerts</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
          activeTab === 'profile'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/60 shadow-inner'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>
          person
        </span>
        <span className="text-[11px] leading-tight font-bold">Profile</span>
      </button>
    </nav>
  );
};
