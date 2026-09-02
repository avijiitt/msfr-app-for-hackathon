import React from 'react';
import { Search, Bell, Sun, Moon, Wallet, Activity } from 'lucide-react';

interface TopNavbarProps {
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onProfileClick: () => void;
  onOpenDatabase?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ themeMode, onToggleTheme, onProfileClick, onOpenDatabase }) => {
  return (
    <header className="hidden md:flex h-16 w-full items-center justify-between px-6 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 z-40 sticky top-0">
      
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-500/20">
            M
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">MUSAFIR</span>
        </div>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search stations, routes, or parcels..." 
            className="w-full bg-slate-100 dark:bg-slate-900/50 border-transparent dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-full pl-10 pr-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Live Database Inspector Button */}
        {onOpenDatabase && (
          <button
            onClick={onOpenDatabase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 rounded-full text-teal-700 dark:text-teal-300 text-xs font-bold transition shadow-xs"
            title="Inspect live database tables & CSV"
          >
            <Activity className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
            <span>Database</span>
          </button>
        )}

        {/* Active Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">System Online</span>
        </div>

        {/* Wallet Balance */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <Wallet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">₹1930</span>
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#0B1120]"></span>
        </button>

        {/* User Profile */}
        <button 
          onClick={onProfileClick}
          className="ml-2 w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Musafir" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>

    </header>
  );
};
