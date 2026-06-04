/* ============================================================
   R7 Fortune — Subscription & Credit System
   $9.90/mo unlimited · 3 free/month · $2.99 single purchase
   localStorage-backed (ready for backend integration)
   ============================================================ */

const STORAGE_PREFIX = "r7_sub_";

export interface SubscriptionState {
  plan: "free" | "monthly" | "yearly";
  monthlyReadingsUsed: number;
  monthlyReadingsLimit: number;   // free tier: 3
  singlePurchases: number;        // $2.99 unlocks purchased
  expiresAt: string | null;       // ISO date for monthly plan expiry
  referralCode: string;
  referredBy: string | null;
  referralRewards: number;        // extra free readings from referrals
}

const DEFAULT: SubscriptionState = {
  plan: "free",
  monthlyReadingsUsed: 0,
  monthlyReadingsLimit: 3,
  singlePurchases: 0,
  expiresAt: null,
  referralCode: "",
  referredBy: null,
  referralRewards: 0,
};

export function getSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "state");
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT, referralCode: generateReferralCode() };
}

function save(state: SubscriptionState) {
  localStorage.setItem(STORAGE_PREFIX + "state", JSON.stringify(state));
}

/** Generate unique referral code */
function generateReferralCode(): string {
  const existing = localStorage.getItem(STORAGE_PREFIX + "state");
  if (existing) {
    try {
      const s = JSON.parse(existing);
      if (s.referralCode) return s.referralCode;
    } catch {}
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "R7";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** How many free readings available this month */
export function getAvailableReadings(): number {
  const s = getSubscription();
  if (s.plan !== "free" && s.expiresAt) {
    const exp = new Date(s.expiresAt);
    if (exp > new Date()) return 999; // unlimited for paid plan
  }
  return Math.max(0, s.monthlyReadingsLimit - s.monthlyReadingsUsed + s.referralRewards + s.singlePurchases * 3);
}

/** Use one reading credit. Returns true if successful. */
export function useReadingCredit(): boolean {
  const s = getSubscription();

  // Paid plan — unlimited
  if (s.plan !== "free" && s.expiresAt && new Date(s.expiresAt) > new Date()) {
    return true;
  }

  // Use referral rewards first
  if (s.referralRewards > 0) {
    s.referralRewards--;
    save(s);
    return true;
  }

  // Use monthly free
  if (s.monthlyReadingsUsed < s.monthlyReadingsLimit) {
    s.monthlyReadingsUsed++;
    save(s);
    return true;
  }

  // Use single purchase
  if (s.singlePurchases > 0) {
    s.singlePurchases--;
    save(s);
    return true;
  }

  return false;
}

/** Purchase single unlock ($2.99) */
export function purchaseSingle(): void {
  const s = getSubscription();
  s.singlePurchases++;
  save(s);
}

/** Subscribe to monthly plan ($9.90) */
export function subscribeMonthly(): void {
  const s = getSubscription();
  s.plan = "monthly";
  const exp = new Date();
  exp.setMonth(exp.getMonth() + 1);
  s.expiresAt = exp.toISOString();
  save(s);
}

/** Apply referral code — both parties get rewards */
export function applyReferral(code: string): { success: boolean; message: string } {
  if (!code || code.length < 5) return { success: false, message: "無效的邀請碼" };

  const s = getSubscription();
  if (s.referredBy) return { success: false, message: "你已經使用過邀請碼" };
  if (code === s.referralCode) return { success: false, message: "不能使用自己的邀請碼" };

  // In production: validate code against backend
  // For now: accept any valid-format code
  s.referredBy = code;
  s.referralRewards += 3; // 3 free readings for being referred
  save(s);

  // Note: in production, the referrer's rewards would be incremented server-side
  return { success: true, message: "邀請碼已生效！獲得 3 次免費塔羅" };
}

/** Reset monthly free count (call on month change) */
export function resetMonthlyIfNeeded(): void {
  const s = getSubscription();
  const now = new Date();
  const lastReset = localStorage.getItem(STORAGE_PREFIX + "last_reset");
  if (lastReset) {
    const last = new Date(lastReset);
    if (last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()) return;
  }
  s.monthlyReadingsUsed = 0;
  localStorage.setItem(STORAGE_PREFIX + "last_reset", now.toISOString());
  save(s);
}
