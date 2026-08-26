import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, AlertCircle, X, ArrowRight, Wallet } from 'lucide-react';
import { refundService, RefundClaim } from '../../services/refundService';

interface TripAssuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefundClaimed?: (newBalance: number) => void;
}

export const TripAssuranceModal: React.FC<TripAssuranceModalProps> = ({
  isOpen,
  onClose,
  onRefundClaimed,
}) => {
  const [claims, setClaims] = useState<RefundClaim[]>(refundService.getClaims());
  const [selectedReason, setSelectedReason] = useState<RefundClaim['reason']>('Severe Delay (>15 mins)');
  const [routeInput, setRouteInput] = useState('Bus 24A (Jayadev Vihar ➔ Master Canteen)');
  const [claimAmount, setClaimAmount] = useState(35);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const res = refundService.fileInstantRefund(routeInput, claimAmount, selectedReason);
    setClaims(refundService.getClaims());
    setClaimSuccessMsg(`₹${claimAmount} successfully refunded to your Musafir Wallet in 60 seconds (Claim ID: ${res.claim.id}).`);
    if (onRefundClaimed) onRefundClaimed(res.newBalance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Musafir Trip Assurance Guarantee
              </h3>
              <p className="text-xs text-slate-400">100% Punctuality & Disruption Protection across India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Assurance Policy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-1">
            <div className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">
              ⏱️ &gt;15 Min Delay
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatic 100% fare refund to your wallet.</p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 space-y-1">
            <div className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
              ⚡ Missed Transfer
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Alternate ride connector covered by Musafir.</p>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 space-y-1">
            <div className="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-1">
              💳 60-Sec Payout
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant credit to Musafir wallet or UPI.</p>
          </div>
        </div>

        {/* Claim Success Banner */}
        {claimSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs text-emerald-800 dark:text-emerald-200 font-semibold">
              {claimSuccessMsg}
            </div>
          </div>
        )}

        {/* 1-Tap Claim Form */}
        <form onSubmit={handleClaimRefund} className="dashboard-card p-4 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            File Instant Trip Assurance Refund
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Affected Trip / Route
              </label>
              <input
                type="text"
                value={routeInput}
                onChange={(e) => setRouteInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Disruption Reason
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value as RefundClaim['reason'])}
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Severe Delay (>15 mins)">Severe Vehicle Delay (&gt;15 mins)</option>
                <option value="Vehicle Breakdown">Vehicle Breakdown on Route</option>
                <option value="Missed Connecting Transfer">Missed Connecting Metro/Bus Transfer</option>
                <option value="Cancelled Route">Cancelled Scheduled Trip</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-500 font-medium">
              Refund Amount: <strong className="text-slate-900 dark:text-white text-sm">₹{claimAmount}</strong>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Claim Instant 60-Sec Refund</span>
            </button>
          </div>
        </form>

        {/* Claim History */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
            Recent Assurance Claims
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {claims.map((cl) => (
              <div
                key={cl.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{cl.routeTitle}</div>
                  <div className="text-[11px] text-slate-400">{cl.reason} • {cl.claimedAt}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">+₹{cl.amountRefunded}</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    ● {cl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
