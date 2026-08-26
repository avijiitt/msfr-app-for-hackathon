import React, { useState } from 'react';
import { Wallet, Plus, QrCode, Sparkles, CheckCircle2, History, ArrowUpRight, ArrowDownLeft, GraduationCap, Accessibility, AlertCircle } from 'lucide-react';
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
      }, 2000);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full glass-panel rounded-3xl p-5 sm:p-6 text-on-surface space-y-5 border border-primary/30 shadow-2xl ambient-glow-primary">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline-md">
                {t.walletTitle}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Digital Pass & Mo-Wallet (UPI limit up to ₹10,000)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant text-sm border border-primary/20"
          >
            ✕
          </button>
        </div>

        {/* Digital Wallet Hero Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden neon-border ambient-glow-primary">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider">Mo-Wallet Balance</p>
              <div className="text-3xl font-display-lg text-primary font-black font-mono mt-1">
                ₹ {walletBalance.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-tertiary font-label-caps px-2.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
                ● ACTIVE TILL 31 OCT
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-primary/15 flex items-center justify-between text-xs text-on-surface-variant font-label-caps">
            <div>
              <span>CARD HOLDER:</span> <strong className="text-on-surface">ABHIJIT SAHOO</strong>
            </div>
            <div className="text-primary font-mono font-bold">
              ID: JAY-889-UNI
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-container p-1 rounded-xl border border-primary/20 text-xs font-label-caps">
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              activeTab === 'topup' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.addMoney} (UPI Limit ₹10k)
          </button>
          <button
            onClick={() => setActiveTab('passes')}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              activeTab === 'passes' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.quickPasses}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              activeTab === 'history' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.recentTransactions}
          </button>
        </div>

        {/* Tab 1: Top-Up with ₹10,000 limit */}
        {activeTab === 'topup' && (
          <div className="space-y-4">
            {topupSuccessMessage && (
              <div className="bg-tertiary-container/20 border border-tertiary-fixed/40 rounded-2xl p-3 text-center text-tertiary-fixed font-bold text-xs flex items-center justify-center gap-2 font-label-caps">
                <CheckCircle2 className="w-4 h-4 text-tertiary-fixed" />
                <span>{topupSuccessMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-error-container/30 border border-error rounded-2xl p-3 text-center text-error font-bold text-xs flex items-center justify-center gap-2 font-label-caps">
                <AlertCircle className="w-4 h-4 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-on-surface font-bold">
                <span>Select Recharge Amount:</span>
                <span className="text-primary font-mono">Max: ₹10,000</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[100, 500, 1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedTopupAmount(amt); setCustomAmountStr(''); }}
                    className={`py-2 rounded-xl font-mono font-bold text-xs border transition ${
                      selectedTopupAmount === amt && !customAmountStr
                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                        : 'bg-surface-container border-primary/20 text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-on-surface-variant font-semibold block">Or Enter Custom Amount (₹1 to ₹10,000):</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-primary font-bold">₹</span>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="Enter amount (e.g. 7500)"
                  value={customAmountStr}
                  onChange={(e) => setCustomAmountStr(e.target.value)}
                  className="w-full bg-surface-container border border-primary/20 rounded-xl pl-8 pr-3 py-2 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-on-surface">Choose Instant Payment Method:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-label-caps">
                <button
                  type="button"
                  onClick={() => handleTopup('Google Pay UPI')}
                  className="p-3 rounded-xl bg-surface-container hover:bg-surface-bright border border-primary/20 font-bold flex items-center justify-center gap-2 text-primary transition"
                >
                  <span>🔵 Google Pay UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTopup('PhonePe / Paytm UPI')}
                  className="p-3 rounded-xl bg-surface-container hover:bg-surface-bright border border-primary/20 font-bold flex items-center justify-center gap-2 text-tertiary transition"
                >
                  <span>🟣 PhonePe / Paytm</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Passes */}
        {activeTab === 'passes' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <div className="bg-surface-container border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-on-surface">{t.studentPass}</div>
                  <div className="text-[11px] text-on-surface-variant">50% concession for DigiLocker verified students</div>
                </div>
              </div>
              <button
                onClick={() => handleBuyPass('student')}
                className="py-1.5 px-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs shadow transition whitespace-nowrap font-label-caps"
              >
                ₹20 (50% Off)
              </button>
            </div>

            <div className="bg-surface-container border border-tertiary/20 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center text-tertiary">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-on-surface">{t.seniorCitizenPass}</div>
                  <div className="text-[11px] text-on-surface-variant">Low-floor bus priority seating</div>
                </div>
              </div>
              <button
                onClick={() => handleBuyPass('senior')}
                className="py-1.5 px-3 rounded-xl bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container font-bold text-xs shadow transition whitespace-nowrap font-label-caps"
              >
                ₹10 (80% Off)
              </button>
            </div>

            <div className="bg-surface-container border border-secondary/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary">
                  🌸
                </div>
                <div>
                  <div className="font-bold text-sm text-secondary">{t.womenPinkPass}</div>
                  <div className="text-[11px] text-on-surface-variant">Reserved safe electric bus pass</div>
                </div>
              </div>
              <button
                onClick={() => handleBuyPass('women_pink')}
                className="py-1.5 px-3 rounded-xl bg-secondary-container hover:bg-secondary text-white font-bold text-xs shadow transition whitespace-nowrap font-label-caps"
              >
                FREE (₹0)
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-surface-container border border-primary/15 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'topup' ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/20 text-primary'
                  }`}>
                    {tx.type === 'topup' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">{tx.title}</div>
                    <div className="text-[10px] text-on-surface-variant">{tx.timestamp} • {tx.routeOrMethod}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold ${tx.type === 'topup' ? 'text-tertiary' : 'text-on-surface'}`}>
                    {tx.type === 'topup' ? '+' : '-'}₹{tx.amount}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">Bal: ₹{tx.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Digital QR Pass Modal */}
        {viewingPass && (
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
            <div className="max-w-sm w-full glass-panel border border-primary/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl neon-border">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface font-headline-md">{viewingPass.title}</h3>
                <p className="text-xs text-primary font-mono mt-1">Passenger: {viewingPass.passengerName}</p>
              </div>
              <div className="bg-white p-3 rounded-2xl inline-block">
                <div className="w-36 h-36 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-[10px] font-label-caps text-primary">{viewingPass.id}</div>
                  <div className="text-[8px] text-slate-400 mt-2 font-mono break-all px-1">{viewingPass.qrPayload}</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-on-surface font-bold font-label-caps tracking-widest text-base">JAY-889-UNI</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Tap scanner to board</p>
              </div>
              <button
                onClick={() => setViewingPass(null)}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-bold text-xs font-label-caps border border-primary/20"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
