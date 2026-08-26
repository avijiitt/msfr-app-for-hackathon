import React from 'react';
import { Activity, Leaf, Coins, ShieldCheck, Award, Zap, Package, Bell, TrendingUp } from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';

interface ActivityDashboardProps {
  onOpenAnnouncements: () => void;
  onOpenParcels: () => void;
  t: TranslationDictionary;
}

export const ActivityDashboard: React.FC<ActivityDashboardProps> = ({
  onOpenAnnouncements,
  onOpenParcels,
  t,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.navActivity}
              </h2>
              <p className="text-xs text-slate-400">
                SIH26198 Commuter Impact & Sustainable Mobility Score
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Level 4 Commuter
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Rides */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Rides</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">42</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+6 this week</div>
        </div>

        {/* Carbon Offset */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CO₂ Saved</span>
            <Leaf className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-400 font-mono">18.4 kg</div>
          <div className="text-[10px] text-slate-400 font-semibold">≈ 4 trees planted</div>
        </div>

        {/* Money Saved */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Money Saved</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹640</div>
          <div className="text-[10px] text-slate-400 font-semibold">via Smart Passes</div>
        </div>

        {/* On-Time Transfer Rate */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sync Success</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">98.4%</div>
          <div className="text-[10px] text-cyan-300 font-semibold">0 missed connections</div>
        </div>
      </div>

      {/* Quick Action Tiles: Announcements & Parcel Lockers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenAnnouncements}
          className="glass-panel hover:border-amber-500/40 p-4 rounded-2xl border border-white/10 text-left transition flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                {t.liveAnnouncements}
              </div>
              <div className="text-xs text-slate-400">
                Strikes, flood bypasses & festival timetables
              </div>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold">View ➔</span>
        </button>

        <button
          onClick={onOpenParcels}
          className="glass-panel hover:border-blue-500/40 p-4 rounded-2xl border border-white/10 text-left transition flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-blue-300 transition">
                {t.parcelDelivery}
              </div>
              <div className="text-xs text-slate-400">
                1 active parcel ready in Station Locker #B-14
              </div>
            </div>
          </div>
          <span className="text-xs text-blue-400 font-bold">Open ➔</span>
        </button>
      </div>

      {/* Badges & Achievements */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Commuter Badges & Green Citizen Milestones</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <div className="text-2xl">🌿</div>
            <div className="font-bold text-xs text-white">Eco Guardian</div>
            <div className="text-[10px] text-slate-400">15+ EV Bus Rides</div>
          </div>

          <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <div className="text-2xl">🛡️</div>
            <div className="font-bold text-xs text-white">Night Navigator</div>
            <div className="text-[10px] text-slate-400">100% Safe Route</div>
          </div>

          <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <div className="text-2xl">🎓</div>
            <div className="font-bold text-xs text-white">Verified Scholar</div>
            <div className="text-[10px] text-slate-400">Student Concession</div>
          </div>

          <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <div className="text-2xl">⚡</div>
            <div className="font-bold text-xs text-white">Master Sync</div>
            <div className="text-[10px] text-slate-400">0 Missed Transfers</div>
          </div>
        </div>
      </div>
    </div>
  );
};
