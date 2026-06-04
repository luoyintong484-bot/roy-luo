/* ============================================================
   R7 Fortune — Tarot Share Points System
   Unique share link per user + visit tracking + points
   ============================================================ */

const STORAGE_KEY = "r7_share_points";

export function getShareLink(): string {
  const uid = getUserId();
  return `${window.location.origin}/tarot?ref=${uid}`;
}

export function getShareText(platform: string): string {
  const link = getShareLink();
  const texts: Record<string, string> = {
    LINE: `🔮 我在 R7 Fortune 抽了塔羅牌，來看看你的運勢！\n${link}`,
    微信: `🔮 我在 R7 Fortune 抽了塔羅牌，來看看你的運勢！\n${link}`,
    微博: `🔮 我在 R7 Fortune 抽了塔羅牌，來看看你的運勢！#塔羅占卜 #R7Fortune ${link}`,
    小红书: `🔮 剛在 R7 Fortune 抽完塔羅，超準的！你也來試試✨\n${link}\n#塔羅占卜 #每日運勢`,
  };
  return texts[platform] || texts["小红书"];
}

export function getSharePoints(): number {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0"); } catch { return 0; }
}

export function addSharePoints(n: number): void {
  const current = getSharePoints();
  localStorage.setItem(STORAGE_KEY, String(current + n));
}

/** Track referral visit — call on page load if ?ref= is present */
export function trackReferral(): void {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref || ref === getUserId()) return;
  const tracked = localStorage.getItem(`r7_ref_tracked_${ref}`);
  if (tracked) return;
  localStorage.setItem(`r7_ref_tracked_${ref}`, "1");

  // Increment referrer's successful invite count
  const countKey = `r7_ref_count_${ref}`;
  const current = parseInt(localStorage.getItem(countKey) || "0") + 1;
  localStorage.setItem(countKey, String(current));

  // Auto-reward: every 3 successful invites → deduct 3 + add 1 free reading
  if (current >= 3 && current % 3 === 0) {
    const rewards = parseInt(localStorage.getItem(`r7_ref_rewards_${ref}`) || "0") + 1;
    localStorage.setItem(`r7_ref_rewards_${ref}`, String(rewards));
    // Deduct the 3 used invites
    localStorage.setItem(countKey, String(current - 3));
  }

  const referrals = JSON.parse(localStorage.getItem("r7_referrals") || "[]");
  referrals.push({ ref, date: new Date().toISOString() });
  localStorage.setItem("r7_referrals", JSON.stringify(referrals));
}

/** Get invitation stats for current user */
export function getInviteStats(): { count: number; rewards: number } {
  const uid = getUserId();
  return {
    count: parseInt(localStorage.getItem(`r7_ref_count_${uid}`) || "0"),
    rewards: parseInt(localStorage.getItem(`r7_ref_rewards_${uid}`) || "0"),
  };
}

/** Get invite progress — how many more needed for next reward */
export function getInviteProgress(): { count: number; rewards: number; remainingToNext: number } {
  const stats = getInviteStats();
  return { ...stats, remainingToNext: Math.max(0, 3 - (stats.count % 3)) };
}

function getUserId(): string {
  let uid = localStorage.getItem("r7_share_uid");
  if (!uid) {
    uid = "U" + Math.random().toString(36).slice(2, 10).toUpperCase();
    localStorage.setItem("r7_share_uid", uid);
  }
  return uid;
}
