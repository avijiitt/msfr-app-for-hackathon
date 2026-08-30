import React, { useState } from 'react';
import { Award, Gift, Flame, Leaf, Check, Sparkles, X, ChevronRight, Coins } from 'lucide-react';
import { rewardsService, AVAILABLE_REWARDS, RewardItem, UserRewardsData } from '../../services/rewardsService';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsUpdated?: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose, onCoinsUpdated }) => {
  const [rewardsData, setRewardsData] = useState<UserRewardsData>(rewardsService.getRewardsData());
  const [redeemedCode, setRedeemedCode] = useState<{ title: string; code: string } | null>(null);

  if (!isOpen) return null;

  const handleRedeem = (reward: RewardItem) => {
    const res = rewardsService.redeemReward(reward);
    if (!res.success) {
      alert(res.error);
      return;
    }
    setRewardsData(rewardsService.getRewardsData());
    setRedeemedCode({ title: reward.title, code: res.code! });
    if (onCoinsUpdated) onCoinsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Musafir Miles & Rewards
              </h3>
              <p className="text-xs text-slate-400">Earn coins on every commute across India & redeem free rides.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Balance & Tier Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              {rewardsData.tier}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
              <Coins className="w-8 h-8 text-amber-300" />
              <span>{rewardsData.totalCoins}</span>
              <span className="text-base font-normal text-blue-200">Coins</span>
            </div>
            <p className="text-xs text-blue-100">
              🔥 {rewardsData.currentStreakDays}-Day Commute Streak • {rewardsData.ridesCompletedThisMonth} Rides This Month
            </p>
          </div>

          <div className="flex gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-center">
              <span className="text-xs text-blue-200 block">CO₂ Saved</span>
              <span className="font-bold text-sm text-emerald-300">{rewardsData.co2OffsetKg} kg</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-center">
              <span className="text-xs text-blue-200 block">Streak Multiplier</span>
              <span className="font-bold text-sm text-amber-300">1.5x</span>
            </div>
          </div>
        </div>

        {/* Redeemed Success Alert */}
        {redeemedCode && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-200 text-xs block">
                🎉 Reward Unlocked: {redeemedCode.title}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-300 font-mono">
                Coupon Code: <strong>{redeemedCode.code}</strong> (Applied to your wallet)
              </span>
            </div>
            <button
              onClick={() => setRedeemedCode(null)}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Done
            </button>
          </div>
        )}

        {/* Referral & Rewards Program */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  🎁 Refer & Earn: 200 Points per Referral
                </span>
                <span className="text-[9px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold px-2 py-0.5 rounded-full">10 Pts = ₹1</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Share your code: You get <strong>200 Points (₹20)</strong> when they install, and your friend gets <strong>100 Points (₹10)</strong> welcome bonus!
              </p>
            </div>
            <button
              onClick={() => {
                const res = rewardsService.processReferralBonus('REF-ODISHA-2026');
                setRewardsData(rewardsService.getRewardsData());
                alert(res.message);
                if (onCoinsUpdated) onCoinsUpdated();
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex-shrink-0"
            >
              Simulate Invite Referral (+200 Pts)
            </button>
          </div>

          <div className="pt-2 border-t border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Your Referral Code: <strong className="font-mono text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">MUSAFIR-ODISHA-200</strong>
            </div>

            <button
              onClick={() => {
                const ptsToConvert = Math.min(rewardsData.totalCoins, 200);
                if (ptsToConvert < 10) {
                  alert('You need at least 10 points to convert to wallet cash (10 Points = ₹1).');
                  return;
                }
                const res = rewardsService.convertPointsToCash(ptsToConvert);
                if (res.success) {
                  setRewardsData(rewardsService.getRewardsData());
                  alert(`🎉 Converted ${ptsToConvert} Points into ₹${res.inrValue} Wallet Cash! (10 Pts = ₹1 INR).`);
                  if (onCoinsUpdated) onCoinsUpdated();
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Convert 200 Pts to ₹20 Cash ➔
            </button>
          </div>
        </div>

        {/* Available Rewards Catalog */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Redeem Musafir Coins
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_REWARDS.map((rwd) => {
              const canAfford = rewardsData.totalCoins >= rwd.coinsCost;
              return (
                <div
                  key={rwd.id}
                  className="dashboard-card p-4 rounded-2xl flex flex-col justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{rwd.icon}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {rwd.coinsCost} Coins
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {rwd.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {rwd.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRedeem(rwd)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{canAfford ? 'Redeem Now' : 'Need More Coins'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
