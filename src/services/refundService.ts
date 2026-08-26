import { walletService } from './walletService';

export interface RefundClaim {
  id: string;
  tripId: string;
  routeTitle: string;
  amountRefunded: number;
  reason: 'Severe Delay (>15 mins)' | 'Vehicle Breakdown' | 'Missed Connecting Transfer' | 'Cancelled Route' | 'Conductor Overcharge';
  status: 'Approved & Credited' | 'Under Review' | 'Processed';
  claimedAt: string;
  creditedToWallet: boolean;
}

const STORAGE_KEY_REFUNDS = 'musafir_refund_claims';

const INITIAL_REFUNDS: RefundClaim[] = [
  {
    id: 'REF-8012',
    tripId: 'TRIP-9921',
    routeTitle: 'Mo Bus 10 (Master Canteen ➔ Patia)',
    amountRefunded: 25,
    reason: 'Severe Delay (>15 mins)',
    status: 'Approved & Credited',
    claimedAt: 'Yesterday, 06:45 PM',
    creditedToWallet: true,
  },
];

class RefundService {
  private claims: RefundClaim[];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY_REFUNDS);
    if (saved) {
      try {
        this.claims = JSON.parse(saved);
      } catch {
        this.claims = INITIAL_REFUNDS;
      }
    } else {
      this.claims = INITIAL_REFUNDS;
      this.persist();
    }
  }

  public getClaims(): RefundClaim[] {
    return [...this.claims];
  }

  public fileInstantRefund(
    routeTitle: string,
    amount: number,
    reason: RefundClaim['reason']
  ): { success: boolean; claim: RefundClaim; newBalance: number } {
    const claimId = 'REF-' + Math.floor(1000 + Math.random() * 9000);
    const tripId = 'TRIP-' + Math.floor(1000 + Math.random() * 9000);

    const newClaim: RefundClaim = {
      id: claimId,
      tripId,
      routeTitle,
      amountRefunded: amount,
      reason,
      status: 'Approved & Credited',
      claimedAt: 'Just now (Instant 60s Refund)',
      creditedToWallet: true,
    };

    this.claims.unshift(newClaim);
    this.persist();

    // Automatically credit amount back to Musafir Wallet
    const topupRes = walletService.addFunds(amount, `Instant Refund (${claimId})`);

    return {
      success: true,
      claim: newClaim,
      newBalance: topupRes.newBalance,
    };
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY_REFUNDS, JSON.stringify(this.claims));
  }
}

export const refundService = new RefundService();
