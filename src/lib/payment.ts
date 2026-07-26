/* ============================================================
   R7 Fortune — Creem Payment Integration
   Single API · Auto IP detection · WeChat/Alipay/PayPal/Card
   Test mode ready · Swap TEST_API_KEY for production
   ============================================================ */

import { PAYMENT_COMING_SOON } from "@/const";
import { getAppPath } from "@/lib/route-helpers";

// ---- Configuration ----
// ⚠️ PRODUCTION: Move CREEM_BASE + API key to server-side env variables only.
// Frontend must never hold payment provider secrets. All checkout requests
// must proxy through api/payment-router.ts on the backend.
const CREEM_BASE = "https://api.creem.io/v1";
const CREEM_API_KEY = ""; // Set via server env CREEM_API_KEY — NEVER hardcode here
const IS_TEST = false;    // false = live checkout (CN→Alipay, global→manual QR fallback)

// ---- IP Region Detection ----
export type PaymentRegion = "cn" | "global";

export function detectRegion(): PaymentRegion {
  // In production: call a geo-IP service or check request headers
  // For now: check browser language as a heuristic
  if (typeof navigator !== "undefined") {
    const lang = navigator.language;
    if (lang.startsWith("zh") && !lang.startsWith("zh-TW") && !lang.startsWith("zh-HK")) {
      return "cn";
    }
  }
  return "global";
}

// ---- Payment Methods by Region ----
export const PAYMENT_METHODS: Record<PaymentRegion, { id: string; name: string; nameZh: string; icon: string }[]> = {
  cn: [
    { id: "alipay_h5", name: "Alipay", nameZh: "支付寶", icon: "🔵" },
    { id: "wechat_h5", name: "WeChat Pay", nameZh: "微信支付", icon: "💚" },
  ],
  global: [
    { id: "paypal", name: "PayPal", nameZh: "PayPal", icon: "🅿️" },
    { id: "card", name: "Credit Card", nameZh: "國際信用卡", icon: "💳" },
  ],
};

// ---- Checkout Session ----
export interface CheckoutParams {
  amount: number;        // in USD, e.g. 2.99
  currency?: string;     // default USD
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

function buildLocalSuccessUrl(sessionId: string, params: CheckoutParams): string {
  const query = new URLSearchParams({
    session: sessionId,
    return: getReturnPath(params.metadata),
  });
  if (params.metadata?.reportKey) query.set("report", params.metadata.reportKey);
  return `/payment-success?${query.toString()}`;
}

function buildProviderUrl(path: "/payment-success" | "/payment", params: CheckoutParams): string {
  const returnPath = encodeURIComponent(getReturnPath(params.metadata));
  const report = params.metadata?.reportKey ? `&report=${encodeURIComponent(params.metadata.reportKey)}` : "";
  const session = path === "/payment-success" ? "session={session_id}&" : "";
  const cancelled = path === "/payment" ? "cancelled=1&" : "";
  // HashRouter compat: use /#/ prefix
  return `${window.location.origin}/#${path}?${session}${cancelled}return=${returnPath}${report}`;
}

export async function createCheckout(params: CheckoutParams): Promise<{ url: string; sessionId: string } | { error: string }> {
  if (PAYMENT_COMING_SOON) {
    return { error: "支付功能即将上线，敬请期待" };
  }

  const region = detectRegion();
  const methods = PAYMENT_METHODS[region];

  if (region === "cn") {
    try {
      const response = await fetch("/api/alipay/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: params.metadata?.reportType,
          reportKey: params.metadata?.reportKey,
          readingId: params.metadata?.readingId ? Number(params.metadata.readingId) : undefined,
          returnPath: getReturnPath(params.metadata),
          offerCode: params.metadata?.offerCode || (params.metadata?.reportType === "ziweiTarot" && params.amount === 19.9 ? "first" : undefined),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl || !data.orderId || !data.accessToken) {
        return { error: data.error || "支付宝收银台暂时不可用" };
      }
      localStorage.setItem(`r7_alipay_token_${data.orderId}`, data.accessToken);
      localStorage.setItem("r7_pending_payment", JSON.stringify({
        ...params,
        sessionId: data.orderId,
        region,
        paymentMethod: "alipay",
        returnPath: getReturnPath(params.metadata),
      }));
      return { url: data.checkoutUrl, sessionId: data.orderId };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "支付宝支付连接失败" };
    }
  }

  if (IS_TEST) {
    // Legacy test mode — auto-verify (disabled in production)
    console.log("[Payment] Test mode checkout:", { ...params, region, methods });
    const sessionId = "test_" + Date.now().toString(36);
    localStorage.setItem("r7_pending_payment", JSON.stringify({
      ...params,
      sessionId,
      region,
      returnPath: getReturnPath(params.metadata),
    }));
    return {
      url: buildLocalSuccessUrl(sessionId, params),
      sessionId,
    };
  }

  // Global users without live Creem integration: redirect to manual QR checkout
  if (region === "global") {
    const sessionId = `manual_${Date.now().toString(36)}`;
    const returnPath = getReturnPath(params.metadata);
    const reportKey = params.metadata?.reportKey || "manual";
    localStorage.setItem("r7_pending_payment", JSON.stringify({
      ...params,
      sessionId,
      region,
      returnPath,
    }));
    return {
      url: `/payment?return=${encodeURIComponent(returnPath)}&report=${encodeURIComponent(reportKey)}`,
      sessionId,
    };
  }

  // CN users with live Alipay integration: real checkout via backend
  // (handled above by the `region === "cn"` branch)

  try {
    const response = await fetch(`${CREEM_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CREEM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(params.amount * 100), // cents
        currency: params.currency || "usd",
        product_name: params.productName,
        metadata: {
          user_id: params.userId || "guest",
          ...params.metadata,
        },
        success_url: buildProviderUrl("/payment-success", params),
        cancel_url: buildProviderUrl("/payment", params),
        // Creem auto-detects payment methods based on customer IP
        allowed_payment_methods: methods.map(m => m.id),
      }),
    });

    if (!response.ok) throw new Error("Checkout creation failed");
    const data = await response.json();
    return { url: data.checkout_url, sessionId: data.session_id };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Payment service unavailable" };
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

export async function verifyPayment(sessionId: string, callbackToken?: string): Promise<VerifiedPayment> {
  if (PAYMENT_COMING_SOON) return { success: false };

  if (sessionId.startsWith("R7A")) {
    const token = callbackToken || localStorage.getItem(`r7_alipay_token_${sessionId}`) || "";
    if (!token) return { success: false };
    // Alipay's signed server notification can arrive a few seconds after the
    // browser return. Poll only our verified server state; the return URL itself
    // never grants access.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const response = await fetch(`/api/alipay/status?order=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`, {
          credentials: "include",
        });
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
      if (attempt < 7) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return { success: false };
  }

  if (sessionId.startsWith("manual_")) {
    try {
      const manualOrder = JSON.parse(localStorage.getItem("r7_manual_payment_order") || "{}");
      if (manualOrder?.sessionId === sessionId) {
        return { success: true, orderId: manualOrder.orderNo || `order_${sessionId}` };
      }
    } catch {
      // Invalid legacy local data is treated as an unverified payment.
    }
    return { success: false };
  }

  if (IS_TEST && sessionId.startsWith("test_")) {
    // Auto-verify test sessions
    return { success: true, orderId: `order_${sessionId}` };
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
    params.metadata?.productType === "membership"
    || params.metadata?.reportType === "monthly";
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
  const sessionId = params.metadata?.sessionId || `order_${Date.now().toString(36)}`;
  if (orders.some((order) => order.sessionId === sessionId)) return;

  orders.push({
    orderId: params.metadata?.orderNo || `R7${Date.now().toString(36).toUpperCase()}`,
    amount: params.amount,
    product: params.productNameZh || params.productName,
    type: isMembership ? "membership" : "single",
    date: now,
    sessionId,
    reportKey: params.metadata?.reportKey,
    accessUrl: params.metadata?.accessUrl,
    paymentMethod: params.metadata?.paymentMethod || "manual_qr",
    autoRenew: isMembership ? sub.autoRenew : undefined,
    nextBillingAt: isMembership ? sub.nextBillingAt : undefined,
    status: "completed",
  });
  writeJson("r7_orders", orders.slice(-100));
}

// ---- Webhook handler (Creem → auto VIP) ----
type LegacyCheckoutSession = {
  amount?: number;
  product_name?: string;
  product_name_zh?: string;
  session_id?: string;
  metadata?: { user_id?: string };
};

export function handlePaymentWebhook(event: { type: string; data: LegacyCheckoutSession }): void {
  if (PAYMENT_COMING_SOON) return;

  if (event.type === "checkout.session.completed") {
    const session = event.data;
    grantBenefits({
      amount: (session.amount ?? 0) / 100,
      productName: session.product_name || "Tarot",
      productNameZh: session.product_name_zh || "塔羅",
      userId: session.metadata?.user_id,
      metadata: { sessionId: session.session_id || "" },
    });
  }
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
