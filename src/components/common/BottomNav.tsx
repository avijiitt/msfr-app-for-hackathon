import React from 'react';
import { Map, Navigation, Wallet, ShieldAlert, GraduationCap, User } from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';

export type NavTab = 'map' | 'routes' | 'wallet' | 'safety' | 'student' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  t: TranslationDictionary;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, t }) => {
  const tabs = [
    { id: 'map' as NavTab, label: t.navMap, icon: Map, color: 'text-primary' },
    { id: 'routes' as NavTab, label: t.navRoutes, icon: Navigation, color: 'text-primary' },
    { id: 'wallet' as NavTab, label: t.navWallet, icon: Wallet, color: 'text-tertiary' },
    { id: 'safety' as NavTab, label: t.navSafety, icon: ShieldAlert, color: 'text-secondary', badge: 'SOS' },
    { id: 'student' as NavTab, label: t.navStudent, icon: GraduationCap, color: 'text-tertiary-fixed', badge: '50%' },
    { id: 'profile' as NavTab, label: t.navProfile, icon: User, color: 'text-primary' },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl">
      <nav className="bg-surface-container-lowest/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_-4px_25px_rgba(250,189,0,0.15)] px-2 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 tap-highlight-transparent active:scale-95 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/40 shadow-inner font-bold'
                  : 'text-on-surface-variant/70 hover:text-primary hover:bg-surface-bright/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 ' + tab.color : 'text-on-surface-variant'}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2.5 text-[8px] font-bold px-1 py-0.2 rounded-full ${
                    tab.badge === 'SOS' ? 'bg-secondary-container text-white' : 'bg-tertiary-container text-on-tertiary-container'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-label-caps text-[10px] mt-1 tracking-wider uppercase truncate max-w-[65px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#fabd00]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
