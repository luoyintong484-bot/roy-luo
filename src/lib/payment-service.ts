/* ============================================================
   R7 Fortune — Unified Payment Service
   Single entry for all paywalls: Synastry / CP / Idol / Tarot.
   Wraps Creem integration; localStorage for test mode.
   Extensible: swap payment provider by replacing createCheckout().
   ============================================================ */

import { createCheckout as createCreemCheckout, grantBenefits, verifyPayment as verifyCreemPayment } from "@/lib/payment";

// ---- Types ----
export type ReportType = "tarot" | "synastry" | "cp" | "idol" | "natal";

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

function getUnlockedReports(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "{}");
  } catch { return {}; }
}

function saveUnlockedReports(reports: Record<string, boolean>) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(reports));
}

// ---- Public API ----

/** Check if a specific report is paid/unlocked */
export function isReportPaid(reportKey: string): boolean {
  const unlocked = getUnlockedReports();
  return !!unlocked[reportKey];
}

/** Mark a report as paid after successful payment */
export function unlockReport(reportKey: string): void {
  const unlocked = getUnlockedReports();
  unlocked[reportKey] = true;
  saveUnlockedReports(unlocked);
}

/** Initiate payment flow — returns checkout URL or throws error */
export async function initiatePayment(config: PaymentConfig): Promise<{ url: string; sessionId: string } | { error: string }> {
  const result = await createCreemCheckout({
    amount: config.amount,
    productName: config.productName,
    productNameZh: config.productNameZh,
    metadata: {
      reportType: config.reportType,
      reportKey: config.reportKey,
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
  }));

  return result;
}

/** Handle payment success callback — unlock report + grant benefits */
export function handlePaymentSuccess(sessionId?: string): { reportKey?: string; success: boolean } {
  const pending = JSON.parse(localStorage.getItem("r7_pending_report") || "{}");

  if (sessionId && pending.sessionId && pending.sessionId !== sessionId) {
    return { success: false };
  }

  if (pending.reportKey) {
    unlockReport(pending.reportKey);

    // Grant benefits (VIP, etc.)
    grantBenefits({
      amount: pending.amount || 0,
      productName: pending.reportType || "Report",
      productNameZh: pending.reportType || "报告",
      metadata: { sessionId: pending.sessionId || sessionId || "" },
    });

    // Clear pending
    localStorage.removeItem("r7_pending_report");
    return { reportKey: pending.reportKey, success: true };
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
