// Mirrors ReferralStatus in the backend's schema.prisma
export type ReferralStatus = "PENDING" | "EARNED" | "REVERSED";

export interface ReferralEntry {
  id: string;
  referredName: string;
  rewardAmount: number;
  status: ReferralStatus;
  createdAt: string;
}

export interface MyReferrals {
  code: string;
  rate: number;
  // Waiting on the friend's order to complete
  pendingAmount: number;
  earnedAmount: number;
  // pendingAmount + earnedAmount
  totalAmount: number;
  // Earned and not yet spent; can be used at checkout on product prices
  availableCredit: number;
  referrals: ReferralEntry[];
}

export interface ValidatedReferralCode {
  code: string;
  rate: number;
}
