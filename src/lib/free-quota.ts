/* ============================================================
   R7 Fortune — Unified Free Quota System
   Per-module free attempt tracking with device fingerprinting.
   Three modules: tarot_classic / tarot_idol / destiny
   Each gets 3 free attempts; share invites add +1.
   ============================================================ */

import { TEST_MODE } from "@/const";

// ---- Device fingerprint (consistent across sessions on same browser) ----
function getDeviceId(): string {
  try {
    const nav = navigator;
    const fp = [nav.language, screen.width, screen.colorDepth, nav.hardwareConcurrency || 4].join("|");
    let hash = 0;
    for (let i = 0; i < fp.length; i++) { hash = ((hash << 5) - hash) + fp.charCodeAt(i); hash |= 0; }
    return "dev_" + Math.abs(hash).toString(36);
  } catch { return "dev_fallback"; }
}

const DEVICE_ID = typeof window !== "undefined" ? getDeviceId() : "ssr";

// ---- Module types ----
export type QuotaModule = "tarot_classic" | "tarot_idol" | "destiny";

const QUOTA_KEYS: Record<QuotaModule, string> = {
  tarot_classic: `r7_quota_tc_${DEVICE_ID}`,
  tarot_idol: `r7_quota_ti_${DEVICE_ID}`,
  destiny: `r7_quota_dn_${DEVICE_ID}`,
};

const MAX_FREE = 3;

// ---- Public API ----

/** Get remaining free attempts for a module */
export function getFreeQuota(module: QuotaModule): number {
  if (TEST_MODE) return MAX_FREE;
  try {
    const used = parseInt(localStorage.getItem(QUOTA_KEYS[module]) || "0");
    return Math.max(0, MAX_FREE - used);
  } catch { return MAX_FREE; }
}

/** Consume 1 free attempt. Returns true if successful, false if exhausted. */
export function consumeFreeQuota(module: QuotaModule): boolean {
  if (TEST_MODE) return true;
  const remaining = getFreeQuota(module);
  if (remaining <= 0) return false;
  const key = QUOTA_KEYS[module];
  const used = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(used));
  return true;
}

/** Add free attempts (from share invites, etc.) */
export function addFreeQuota(module: QuotaModule, amount: number): void {
  const key = QUOTA_KEYS[module];
  const used = Math.max(0, parseInt(localStorage.getItem(key) || "0") - amount);
  localStorage.setItem(key, String(used));
}

/** Get used count */
export function getUsedCount(module: QuotaModule): number {
  try { return parseInt(localStorage.getItem(QUOTA_KEYS[module]) || "0"); }
  catch { return 0; }
}

/** Check if any free attempts remain */
export function hasFreeQuota(module: QuotaModule): boolean {
  return getFreeQuota(module) > 0;
}

/** Reset all quotas for this device (dev only) */
export function resetAllQuotas(): void {
  Object.values(QUOTA_KEYS).forEach(k => localStorage.removeItem(k));
}
