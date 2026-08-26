import React, { useState } from 'react';
import {
  Wallet, Plus, QrCode, Sparkles, CheckCircle2, History, ArrowUpRight,
  ArrowDownLeft, GraduationCap, AlertCircle, X, ShieldCheck, CreditCard
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import { TransitPass, WalletTransaction } from '../../types/transit';
import { TranslationDictionary } from '../../types/i18n';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onBalanceUpdated: (newBalance: number) => void;
  t: TranslationDictionary;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onBalanceUpdated,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'passes' | 'history'>('topup');
  const [selectedTopupAmount, setSelectedTopupAmount] = useState<number>(500);
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [topupSuccessMessage, setTopupSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewingPass, setViewingPass] = useState<TransitPass | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(walletService.getTransactions());

  if (!isOpen) return null;

  const handleTopup = (method = 'UPI / Google Pay') => {
    const finalAmount = customAmountStr ? parseFloat(customAmountStr) : selectedTopupAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }
    if (finalAmount > 10000) {
      setErrorMessage('UPI recharge limit is ₹10,000 per transaction.');
      return;
    }

    setErrorMessage(null);
    const res = walletService.addFunds(finalAmount, method);
    if (res.success) {
      onBalanceUpdated(res.newBalance);
      setTransactions(walletService.getTransactions());
      setTopupSuccessMessage(`₹${finalAmount} added successfully via ${method}!`);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      setTimeout(() => {
        setTopupSuccessMessage(null);
        setCustomAmountStr('');
      }, 2500);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleBuyPass = (type: 'student' | 'senior' | 'daily' | 'women_pink' | 'standard') => {
    const res = walletService.purchasePass(type, 'Abhijit Sahoo');
    if (res.success && res.pass) {
      onBalanceUpdated(walletService.getBalance());
      setTransactions(walletService.getTransactions());
      setViewingPass(res.pass);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else if (res.error) {
      alert(res.error);
    }
  };

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.walletTitle || 'Mo-Wallet & Passes'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digital Wallet • Instant UPI Top-up (Max ₹10,000)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Solid Hero Card */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Total Available Balance
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1">
                ₹{walletBalance.toFixed(2)}
              </div>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> UPI Active
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] text-blue-100 relative z-10">
            <span>Instant Auto-Debit on Bus/Metro</span>
            <span className="font-mono">Limit: ₹10,000 / txn</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => { setActiveTab('topup'); setViewingPass(null); }}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'topup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Top-up Wallet
          </button>
          <button
            onClick={() => setActiveTab('passes')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'passes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Transit Passes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({transactions.length})
          </button>
        </div>

        {/* ── Tab 1: Top-up Wallet ── */}
        {activeTab === 'topup' && (
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {topupSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{topupSuccessMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                Select Quick Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedTopupAmount(amt);
                      setCustomAmountStr('');
                      setErrorMessage(null);
                    }}
                    className={`py-2.5 rounded-xl font-extrabold text-xs font-mono transition border ${
                      selectedTopupAmount === amt && !customAmountStr
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Or Enter Custom Amount (Max ₹10,000)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 750"
                  max={10000}
                  value={customAmountStr}
                  onChange={(e) => {
                    setCustomAmountStr(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTopup('Google Pay UPI')}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Pay via Google Pay
              </button>
              <button
                type="button"
                onClick={() => handleTopup('PhonePe / Paytm UPI')}
                className="py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Other UPI Apps
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Transit Passes ── */}
        {activeTab === 'passes' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {viewingPass ? (
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 text-center space-y-3">
                <QrCode className="w-16 h-16 text-blue-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewingPass.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Pass ID: <strong className="font-mono text-blue-600">{viewingPass.qrPayload || viewingPass.id}</strong>
                </p>
                <p className="text-xs text-emerald-600 font-bold">
                  Status: Active • Unlimited travel until {viewingPass.validUntil}
                </p>
                <button
                  onClick={() => setViewingPass(null)}
                  className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  View All Passes
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Student Pass */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Monthly Student Pass</h4>
                      <p className="text-[11px] text-slate-500">50% concession on all public routes</p>
                      <span className="text-xs font-mono font-extrabold text-blue-600">₹150 / month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyPass('student')}
                    className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Buy Pass
                  </button>
                </div>

                {/* Daily Unlimited Pass */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Day Tourist / Explorer Pass</h4>
                      <p className="text-[11px] text-slate-500">Unlimited bus & metro rides for 24 hours</p>
                      <span className="text-xs font-mono font-extrabold text-emerald-600">₹50 / day</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyPass('daily')}
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Buy Pass
                  </button>
                </div>

                {/* Senior Citizen Pass */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Senior Citizen Pass</h4>
                      <p className="text-[11px] text-slate-500">Priority boarding & zero-step access</p>
                      <span className="text-xs font-mono font-extrabold text-purple-600">₹100 / month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyPass('senior')}
                    className="py-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Buy Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: History (With visible side scrollbar) ── */}
        {activeTab === 'history' && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No transactions recorded yet.</p>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.type === 'topup' || tx.type === 'refund';
                return (
                  <div
                    key={tx.id}
                    className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isCredit
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{tx.title}</div>
                        <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                      </div>
                    </div>
                    <div
                      className={`font-mono font-bold text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-slate-800 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close Wallet
        </button>
      </div>
    </div>
  );
};
