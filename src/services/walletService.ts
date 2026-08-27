import { TransitPass, WalletTransaction } from '../types/transit';

const STORAGE_KEY_WALLET = 'msfr_wallet_balance';
const STORAGE_KEY_TXS = 'msfr_wallet_transactions';
const STORAGE_KEY_PASSES = 'msfr_active_passes';

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-1099',
    amount: 500,
    type: 'topup',
    title: 'UPI Top-Up via Google Pay',
    timestamp: 'Today, 08:30 AM',
    balanceAfter: 500,
    status: 'success',
    routeOrMethod: 'UPI via Google Pay',
  },
  {
    id: 'TX-1098',
    amount: 15,
    type: 'fare_debit',
    title: 'Mo Bus Electric #10 Tap-Out',
    timestamp: 'Yesterday, 06:15 PM',
    balanceAfter: 485,
    status: 'success',
    routeOrMethod: 'Master Canteen ➔ Patia KIIT',
  },
  {
    id: 'TX-1097',
    amount: 50,
    type: 'pass_purchase',
    title: 'Smart Daily Commuter Pass',
    timestamp: '24 Aug, 09:00 AM',
    balanceAfter: 435,
    status: 'success',
    routeOrMethod: 'Unlimited Mo Bus Pass',
  },
];

class WalletService {
  private balance: number;
  private transactions: WalletTransaction[];
  private passes: TransitPass[];

  constructor() {
    const savedBal = localStorage.getItem(STORAGE_KEY_WALLET);
    this.balance = savedBal ? parseFloat(savedBal) : 650;

    const savedTxs = localStorage.getItem(STORAGE_KEY_TXS);
    this.transactions = savedTxs ? JSON.parse(savedTxs) : INITIAL_TRANSACTIONS;

    const savedPasses = localStorage.getItem(STORAGE_KEY_PASSES);
    this.passes = savedPasses ? JSON.parse(savedPasses) : [];
  }

  public getBalance(): number {
    return this.balance;
  }

  public getTransactions(): WalletTransaction[] {
    return [...this.transactions];
  }

  public getActivePasses(): TransitPass[] {
    return [...this.passes];
  }

  public addFunds(amount: number, method = 'UPI / GPay'): { success: boolean; newBalance: number; error?: string } {
    if (amount <= 0) {
      return { success: false, newBalance: this.balance, error: 'Recharge amount must be greater than ₹0.' };
    }
    if (amount > 10000) {
      return { success: false, newBalance: this.balance, error: 'Recharge amount exceeds the maximum limit of ₹10,000 per transaction.' };
    }

    this.balance += amount;
    const tx: WalletTransaction = {
      id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
      amount,
      type: 'topup',
      title: `Wallet Top-Up via ${method}`,
      timestamp: 'Just now',
      balanceAfter: this.balance,
      status: 'success',
      routeOrMethod: method,
    };
    this.transactions.unshift(tx);
    this.persist();
    return { success: true, newBalance: this.balance };
  }

  public debitFare(amount: number, routeTitle: string): { success: boolean; newBalance: number; error?: string } {
    if (this.balance < amount) {
      return { success: false, newBalance: this.balance, error: `Insufficient wallet balance (Current: ₹${this.balance.toFixed(2)}). Please top-up.` };
    }
    this.balance -= amount;
    const tx: WalletTransaction = {
      id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
      amount,
      type: 'fare_debit',
      title: `Fare Tap-Out: ${routeTitle}`,
      timestamp: 'Just now',
      balanceAfter: this.balance,
      status: 'success',
      routeOrMethod: routeTitle,
    };
    this.transactions.unshift(tx);
    this.persist();
    return { success: true, newBalance: this.balance };
  }

  public purchasePass(
    type: 'student' | 'senior' | 'daily' | 'women_pink' | 'standard',
    passengerName: string
  ): { success: boolean; pass?: TransitPass; error?: string } {
    const costMap: Record<string, number> = {
      student: 20,
      senior: 10,
      daily: 50,
      women_pink: 0,
      standard: 25,
    };
    const cost = costMap[type] || 25;

    if (this.balance < cost) {
      return { success: false, error: `Insufficient balance (Need ₹${cost}). Please recharge wallet.` };
    }

    this.balance -= cost;

    const titles: Record<string, string> = {
      student: 'Student Concession Smart Pass (50% Off)',
      senior: 'Senior Citizen Zero-Barrier Pass',
      daily: '24-Hour Unlimited All-Transit Pass',
      women_pink: 'Women Pink Safety Transit Pass',
      standard: 'Single Multi-Modal Journey Pass',
    };

    const newPass: TransitPass = {
      id: 'PASS-' + Math.floor(100000 + Math.random() * 900000),
      type,
      title: titles[type] || 'Transit Pass',
      validUntil: 'Valid for 24 Hours',
      qrPayload: `MSFR-TRANSIT|PASS-${type.toUpperCase()}|${passengerName}|${Date.now() + 86400000}|VALID`,
      passengerName,
      discountPercentage: type === 'student' ? 50 : type === 'senior' ? 80 : 0,
    };

    this.passes.unshift(newPass);

    const tx: WalletTransaction = {
      id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
      amount: cost,
      type: 'pass_purchase',
      title: `Pass Purchase: ${titles[type]}`,
      timestamp: 'Just now',
      balanceAfter: this.balance,
      status: 'success',
      routeOrMethod: 'Instant QR Digital Pass',
    };
    this.transactions.unshift(tx);
    this.persist();

    return { success: true, pass: newPass };
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY_WALLET, this.balance.toString());
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(this.transactions));
    localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(this.passes));
  }
}

export const walletService = new WalletService();
