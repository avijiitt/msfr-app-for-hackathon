export interface RewardItem {
  id: string;
  title: string;
  category: 'Pass Discount' | 'Free Ride' | 'Eco Benefit' | 'Partner Deal';
  coinsCost: number;
  description: string;
  code: string;
  expiresIn: string;
  icon: string;
}

export interface UserRewardsData {
  totalCoins: number;
  currentStreakDays: number;
  ridesCompletedThisMonth: number;
  co2OffsetKg: number;
  tier: 'Silver Commuter' | 'Gold Musafir' | 'Platinum Elite';
  unlockedBadges: string[];
  redeemedVouchers: { rewardTitle: string; code: string; date: string }[];
}

const STORAGE_KEY_REWARDS = 'musafir_user_rewards';

const DEFAULT_REWARDS: UserRewardsData = {
  totalCoins: 480,
  currentStreakDays: 7,
  ridesCompletedThisMonth: 28,
  co2OffsetKg: 18.4,
  tier: 'Gold Musafir',
  unlockedBadges: ['🌱 Eco Pioneer', '🔥 7-Day Commute Streak', '⚡ Electric Transit Pro'],
  redeemedVouchers: [
    { rewardTitle: '₹10 Off Electric Metro Pass', code: 'MUSAFIR-E10-9921', date: 'Yesterday' },
  ],
};

export const AVAILABLE_REWARDS: RewardItem[] = [
  {
    id: 'RWD-01',
    title: 'Free 24-Hour Multi-Modal Transit Pass',
    category: 'Free Ride',
    coinsCost: 250,
    description: 'Unlimited travel on all buses and metro lines for a whole day across your city.',
    code: 'FREE-DAY-PASS-MUSAFIR',
    expiresIn: 'Valid for 30 days',
    icon: '🎟️',
  },
  {
    id: 'RWD-02',
    title: '50% Off Weekly Express Commuter Pass',
    category: 'Pass Discount',
    coinsCost: 350,
    description: 'Enjoy 50% flat discount on 7-day city transit pass with priority booking.',
    code: 'WEEK-50-OFF',
    expiresIn: 'Valid for 14 days',
    icon: '⚡',
  },
  {
    id: 'RWD-03',
    title: '₹25 Smart E-Rickshaw / Auto Ride Voucher',
    category: 'Partner Deal',
    coinsCost: 120,
    description: 'Direct discount on first/last-mile shared electric auto connectors.',
    code: 'AUTO-EV-25',
    expiresIn: 'Valid for 45 days',
    icon: '🛺',
  },
  {
    id: 'RWD-04',
    title: 'Verified Green Tree Plantation in Odisha / Delhi',
    category: 'Eco Benefit',
    coinsCost: 300,
    description: 'Musafir partners with SankalpTaru to plant a real geo-tagged sapling in your name.',
    code: 'TREE-PLANT-GEO',
    expiresIn: 'Permanent Impact',
    icon: '🌳',
  },
];

class RewardsService {
  private data: UserRewardsData;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY_REWARDS);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch {
        this.data = DEFAULT_REWARDS;
      }
    } else {
      this.data = DEFAULT_REWARDS;
      this.persist();
    }
  }

  public getRewardsData(): UserRewardsData {
    return { ...this.data };
  }

  public earnCoins(amount: number, reason: string): UserRewardsData {
    this.data.totalCoins += amount;
    this.data.ridesCompletedThisMonth += 1;
    this.persist();
    return { ...this.data };
  }

  /**
   * 1 Refer = 200 Points for Referrer, 100 Points for Person who installed
   */
  public processReferralBonus(referralCode: string): { success: boolean; coinsAwarded: number; message: string } {
    this.data.totalCoins += 200;
    this.persist();
    return {
      success: true,
      coinsAwarded: 200,
      message: `🎉 Referral Successful! You earned 200 Points (Worth ₹20). Your friend gets 100 Points (Worth ₹10)!`,
    };
  }

  /**
   * Convert Points to INR Wallet Cash: 10 Points = ₹1 INR
   */
  public convertPointsToCash(points: number): { success: boolean; inrValue: number; error?: string } {
    if (points <= 0) {
      return { success: false, inrValue: 0, error: 'Please enter points to convert.' };
    }
    if (points > this.data.totalCoins) {
      return { success: false, inrValue: 0, error: `You have ${this.data.totalCoins} points. Cannot convert ${points}.` };
    }
    if (points % 10 !== 0) {
      return { success: false, inrValue: 0, error: 'Points must be in multiples of 10 (10 Points = ₹1 INR).' };
    }

    const inrValue = points / 10;
    this.data.totalCoins -= points;
    this.persist();

    return {
      success: true,
      inrValue,
    };
  }

  public redeemReward(reward: RewardItem): { success: boolean; code?: string; error?: string } {
    if (this.data.totalCoins < reward.coinsCost) {
      return {
        success: false,
        error: `Insufficient Musafir Coins (You have ${this.data.totalCoins}, need ${reward.coinsCost} coins).`,
      };
    }

    this.data.totalCoins -= reward.coinsCost;
    const generatedCode = `${reward.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.data.redeemedVouchers.unshift({
      rewardTitle: reward.title,
      code: generatedCode,
      date: 'Just now',
    });
    this.persist();

    return {
      success: true,
      code: generatedCode,
    };
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY_REWARDS, JSON.stringify(this.data));
  }
}

export const rewardsService = new RewardsService();
