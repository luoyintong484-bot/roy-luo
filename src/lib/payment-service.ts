/* ============================================================
   R7 Fortune — Unified Payment Service
   Single entry for all paywalls: Synastry / CP / Idol / Tarot.
   Wraps Creem integration; localStorage for test mode.
   Extensible: swap payment provider by replacing createCheckout().
   ============================================================ */

import { createCheckout as createCreemCheckout, grantBenefits, verifyPayment as verifyCreemPayment } from "@/lib/payment";
import { getAppPath } from "@/lib/route-helpers";
import { PAYMENT_COMING_SOON, TEST_MODE } from "@/const";

// ---- Types ----
export type ReportType = "tarot" | "ziweiTarot" | "synastry" | "cp" | "idolGuide" | "natal" | "followupPack";

export interface PaymentConfig {
  reportType: ReportType;
  reportKey: string;       // unique key to track unlock state, e.g. "synastry_abc123"
  amount: number;          // USD
  productName: string;
  productNameZh: string;
  metadata?: Record<string, string>;
}

// ---- Storage keys ----
const UNLOCKED_KEY = "r7_unlocked_reports";
const UNLOCK_SIG_PREFIX = "r7_unlock_sig_";
const DEFAULT_UNLOCK_DAYS = 30;

type UnlockRecord = boolean | { unlockedAt: string; expiresAt: string };

function getUnlockedReports(): Record<string, UnlockRecord> {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "{}");
  } catch { return {}; }
}

function saveUnlockedReports(reports: Record<string, UnlockRecord>) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(reports));
}

/** Generate a simple integrity signature for the unlock record */
function signUnlock(reportKey: string, expiresAt: string): string {
  // Dynamic salt: device fingerprint prevents cross-device signature forgery
  const devicePart = typeof navigator !== "undefined"
    ? btoa(encodeURIComponent(navigator.userAgent)).slice(0, 12)
    : "ssr_fallback";
  const payload = `${reportKey}:${expiresAt}:${devicePart}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  return "sig_" + Math.abs(hash).toString(36);
}

/** Verify the integrity signature matches */
function verifyUnlockSig(reportKey: string, expiresAt: string): boolean {
  const expected = signUnlock(reportKey, expiresAt);
  const actual = localStorage.getItem(`${UNLOCK_SIG_PREFIX}${reportKey}`);
  return actual === expected;
}

// ---- Public API ----

/** Check if a specific report is paid/unlocked */
export function isReportPaid(reportKey: string): boolean {
  if (PAYMENT_COMING_SOON) return false;
  if (TEST_MODE) return true;

  const unlocked = getUnlockedReports();
  const record = unlocked[reportKey];
  if (!record) return false;

  // Backward compatibility for old local preview records.
  if (record === true) {
    // Old records without signature — accept but upgrade
    const expiresAt = new Date(Date.now() + DEFAULT_UNLOCK_DAYS * 86400000).toISOString();
    unlocked[reportKey] = { unlockedAt: new Date().toISOString(), expiresAt };
    saveUnlockedReports(unlocked);
    localStorage.setItem(`${UNLOCK_SIG_PREFIX}${reportKey}`, signUnlock(reportKey, expiresAt));
    return true;
  }

  // Verify integrity signature — reject tampered records
  if (!verifyUnlockSig(reportKey, record.expiresAt)) {
    delete unlocked[reportKey];
    saveUnlockedReports(unlocked);
    localStorage.removeItem(`${UNLOCK_SIG_PREFIX}${reportKey}`);
    return false;
  }

  if (new Date(record.expiresAt).getTime() > Date.now()) return true;

  delete unlocked[reportKey];
  saveUnlockedReports(unlocked);
  localStorage.removeItem(`${UNLOCK_SIG_PREFIX}${reportKey}`);
  return false;
}

/** Mark a report as paid after successful payment */
export function unlockReport(reportKey: string, days = DEFAULT_UNLOCK_DAYS): void {
  if (PAYMENT_COMING_SOON) return;
  const unlocked = getUnlockedReports();
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  unlocked[reportKey] = {
    unlockedAt: new Date().toISOString(),
    expiresAt,
  };
  saveUnlockedReports(unlocked);
  // Write integrity signature
  localStorage.setItem(`${UNLOCK_SIG_PREFIX}${reportKey}`, signUnlock(reportKey, expiresAt));
}

/** Initiate payment flow — returns checkout URL or throws error */
export async function initiatePayment(config: PaymentConfig): Promise<{ url: string; sessionId: string } | { error: string }> {
  if (PAYMENT_COMING_SOON) {
    return { error: "完整版报告功能即将开放，敬请期待" };
  }

  const result = await createCreemCheckout({
    amount: config.amount,
    productName: config.productName,
    productNameZh: config.productNameZh,
    metadata: {
      reportType: config.reportType,
      reportKey: config.reportKey,
      returnPath: getAppPath(),
      offerCode: config.reportType === "ziweiTarot" && config.amount === 19.9 ? "first" : "standard",
      ...config.metadata,
    },
  });

  if ("error" in result) return result;

  // Store pending payment info for callback
  localStorage.setItem("r7_pending_report", JSON.stringify({
    reportKey: config.reportKey,
    reportType: config.reportType,
    sessionId: result.sessionId,
    amount: config.amount,
    productName: config.productName,
    productNameZh: config.productNameZh,
    accessUrl: getAppPath(),
    metadata: config.metadata || {},
  }));

  return result;
}

/** Handle payment success callback — unlock report + grant benefits */
type VerifiedReportPurchase = {
  reportKey?: string;
  reportType?: string;
  amount?: number;
  returnPath?: string;
};

export function handlePaymentSuccess(
  sessionId?: string,
  verified?: VerifiedReportPurchase,
): { reportKey?: string; success: boolean } {
  if (PAYMENT_COMING_SOON) return { success: false };

  const pending = JSON.parse(localStorage.getItem("r7_pending_report") || "{}");

  if (!verified?.reportKey && sessionId && pending.sessionId && pending.sessionId !== sessionId) {
    return { success: false };
  }

  const reportKey = verified?.reportKey || pending.reportKey;
  if (reportKey) {
    unlockReport(reportKey);

    // Grant benefits (VIP, etc.)
    grantBenefits({
      amount: verified?.amount ?? pending.amount ?? 0,
      productName: pending.productName || pending.reportType || "Report",
      productNameZh: pending.productNameZh || pending.reportType || "报告",
      metadata: {
        ...(pending.metadata || {}),
        sessionId: sessionId || pending.sessionId || "",
        reportKey,
        accessUrl: verified?.returnPath || pending.accessUrl || "/profile?tab=payments",
        reportType: verified?.reportType || pending.reportType || "",
      },
    });

    // Clear pending
    localStorage.removeItem("r7_pending_report");
    return { reportKey, success: true };
  }

  return { success: false };
}

// ================================================================
//  AGGREGATED PAYMENT GATEWAY — Extension Point
//  Replace the implementation below to swap payment provider
//  (e.g. Stripe, Paddle, LemonSqueezy, custom aggregator).
//  Interface: { createCheckout, verifyPayment, grantBenefits }
// ================================================================

export { createCreemCheckout as providerCreateCheckout, verifyCreemPayment as providerVerifyPayment };
