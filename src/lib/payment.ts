/* ============================================================
   R7 Fortune — Alipay RSA2 Payment Integration
   One server-signed checkout path for every visitor and paid report.
   ============================================================ */

import { PAYMENT_COMING_SOON } from "@/const";
import { getAppPath } from "@/lib/route-helpers";

// ---- IP Region Detection ----
export type PaymentRegion = "cn" | "global";

export function detectRegion(): PaymentRegion {
  // Kept for UI compatibility. Checkout no longer changes provider by IP.
  return "cn";
}

// ---- Payment Methods by Region ----
// 微信支付已下架：仅保留支付宝一种收银方式
export const PAYMENT_METHODS: Record<
  PaymentRegion,
  { id: string; name: string; nameZh: string; icon: string }[]
> = {
  cn: [{ id: "alipay_h5", name: "Alipay", nameZh: "支付寶", icon: "🔵" }],
  global: [{ id: "alipay_h5", name: "Alipay", nameZh: "支付寶", icon: "🔵" }],
};

// ---- Checkout Session ----
export interface CheckoutParams {
  amount: number; // CNY
  currency?: string; // checkout is CNY; retained for API compatibility
  productName: string;
  productNameZh: string;
  userId?: string;
  metadata?: Record<string, string>;
}

export type PaymentOrder = {
  orderId: string;
  amount: number;
  product: string;
  type: "membership" | "single";
  date: string;
  sessionId: string;
  reportKey?: string;
  accessUrl?: string;
  status: "completed" | "pending" | "failed";
  paymentMethod?: string;
  autoRenew?: boolean;
  nextBillingAt?: string;
};

export type MembershipState = {
  plan?: "monthly" | "yearly";
  vip?: boolean;
  vipSince?: string;
  expiresAt?: string;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  renewalStatus?: "active" | "cancelled" | "off";
  nextBillingAt?: string;
  lastPaymentSessionId?: string;
  singlePurchases?: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeExpiry(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function getPaymentOrders(): PaymentOrder[] {
  return readJson<PaymentOrder[]>("r7_orders", []);
}

export function getMembershipState(): MembershipState {
  return readJson<MembershipState>("r7_sub_state", {});
}

export function saveMembershipState(next: MembershipState): MembershipState {
  writeJson("r7_sub_state", next);
  return next;
}

export function setMembershipAutoRenew(enabled: boolean): MembershipState {
  const sub = getMembershipState();
  const next: MembershipState = {
    ...sub,
    autoRenew: enabled,
    cancelAtPeriodEnd: enabled ? false : true,
    renewalStatus: enabled ? "active" : "cancelled",
  };
  return saveMembershipState(next);
}

function getReturnPath(metadata?: Record<string, string>): string {
  if (metadata?.returnPath) return metadata.returnPath;
  if (typeof window === "undefined") return "/";
  return getAppPath();
}

export async function createCheckout(
  params: CheckoutParams,
): Promise<{ url: string; sessionId: string } | { error: string }> {
  if (PAYMENT_COMING_SOON) {
    return { error: "支付功能即将上线，敬请期待" };
  }

  const region = detectRegion();
  // 偶像报告：把 artistId 编码进回跳路径，支付后可自动恢复已生成报告
  let returnPath = getReturnPath(params.metadata);
  const _rk = params.metadata?.reportKey || "";
  if (_rk.startsWith("idol_guide_")) {
    const _aid = _rk.slice("idol_guide_".length);
    if (_aid) returnPath = `/idol-guide?artist=${encodeURIComponent(_aid)}`;
  }

  try {
    const response = await fetch("/api/alipay/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportType: params.metadata?.reportType,
        reportKey: params.metadata?.reportKey,
        readingId: params.metadata?.readingId
          ? Number(params.metadata.readingId)
          : undefined,
        returnPath: returnPath,
        amount: params.amount,
        offerCode:
          params.metadata?.offerCode ||
          (params.metadata?.reportType === "ziweiTarot" &&
          params.amount === 19.9
            ? "first"
            : undefined),
      }),
    });
    const data = await response.json();
    if (
      !response.ok ||
      !data.checkoutUrl ||
      !data.orderId ||
      !data.accessToken
    ) {
      return { error: data.error || "支付宝收银台暂时不可用" };
    }
    localStorage.setItem(`r7_alipay_token_${data.orderId}`, data.accessToken);
    localStorage.setItem(
      "r7_pending_payment",
      JSON.stringify({
        ...params,
        sessionId: data.orderId,
        region,
        paymentMethod: "alipay",
        returnPath: getReturnPath(params.metadata),
      }),
    );
    return { url: data.checkoutUrl, sessionId: data.orderId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "支付宝支付连接失败",
    };
  }
}

// ---- Verify Payment (called on success page) ----
export type VerifiedPayment = {
  success: boolean;
  orderId?: string;
  reportKey?: string;
  reportType?: string;
  amount?: number;
  currency?: string;
  returnPath?: string;
};

export async function verifyPayment(
  sessionId: string,
  callbackToken?: string,
): Promise<VerifiedPayment> {
  if (PAYMENT_COMING_SOON) return { success: false };

  if (sessionId.startsWith("R7A")) {
    const token =
      callbackToken ||
      localStorage.getItem(`r7_alipay_token_${sessionId}`) ||
      "";
    if (!token) return { success: false };
    // Alipay's signed server notification can arrive a few seconds after the
    // browser return. Poll only our verified server state; the return URL itself
    // never grants access.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const response = await fetch(
          `/api/alipay/status?order=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();
        if (response.ok && data.paid) {
          return {
            success: true,
            orderId: data.orderId || sessionId,
            reportKey: data.reportKey,
            reportType: data.reportType,
            amount: data.amount,
            currency: data.currency,
            returnPath: data.returnPath,
          };
        }
      } catch {
        // A transient status request failure is handled by the next poll.
      }
      if (attempt < 7)
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return { success: false };
  }

  // Live payment verification must happen on the server. The browser never receives
  // provider secrets and therefore cannot mark a production checkout as paid.
  return { success: false };
}

// ---- Auto VIP Tagging + Benefit Grant ----
export function grantBenefits(params: CheckoutParams): void {
  if (PAYMENT_COMING_SOON) return;

  const sub = getMembershipState();
  const now = new Date().toISOString();
  const isMembership =
    params.metadata?.productType === "membership" ||
    params.metadata?.reportType === "monthly";
  const nextBillingAt = makeExpiry(30);

  if (isMembership) {
    // Monthly VIP — auto tag
    sub.plan = "monthly";
    sub.vip = true;
    sub.vipSince = sub.vipSince || now;
    sub.expiresAt = nextBillingAt;
    sub.autoRenew = params.metadata?.autoRenew === "false" ? false : true;
    sub.cancelAtPeriodEnd = !sub.autoRenew;
    sub.renewalStatus = sub.autoRenew ? "active" : "cancelled";
    sub.nextBillingAt = nextBillingAt;
    sub.lastPaymentSessionId = params.metadata?.sessionId;
  } else if (params.amount >= 2.99) {
    sub.singlePurchases = (sub.singlePurchases || 0) + 1;
  }

  saveMembershipState(sub);

  // Sync to payment records
  const orders = getPaymentOrders();
  const sessionId =
    params.metadata?.sessionId || `order_${Date.now().toString(36)}`;
  if (orders.some((order) => order.sessionId === sessionId)) return;

  orders.push({
    orderId:
      params.metadata?.orderNo || `R7${Date.now().toString(36).toUpperCase()}`,
    amount: params.amount,
    product: params.productNameZh || params.productName,
    type: isMembership ? "membership" : "single",
    date: now,
    sessionId,
    reportKey: params.metadata?.reportKey,
    accessUrl: params.metadata?.accessUrl,
    paymentMethod: params.metadata?.paymentMethod || "alipay",
    autoRenew: isMembership ? sub.autoRenew : undefined,
    nextBillingAt: isMembership ? sub.nextBillingAt : undefined,
    status: "completed",
  });
  writeJson("r7_orders", orders.slice(-100));
}

// ---- Check VIP status ----
export function isVIP(): boolean {
  try {
    const sub = JSON.parse(localStorage.getItem("r7_sub_state") || "{}");
    if (sub.vip && sub.expiresAt) {
      return new Date(sub.expiresAt) > new Date();
    }
  } catch {
    // Invalid legacy membership state means the visitor is not verified as VIP.
  }
  return false;
}
