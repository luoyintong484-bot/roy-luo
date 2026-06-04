/* ============================================================
   R7 Fortune — Creem Payment Integration
   Single API · Auto IP detection · WeChat/Alipay/PayPal/Card
   Test mode ready · Swap TEST_API_KEY for production
   ============================================================ */

// ---- Configuration ----
const CREEM_BASE = "https://api.creem.io/v1";
// Replace with your actual Creem API key
const TEST_API_KEY = "creem_test_xxxxxxxxxxxxxxxxxxxx";
const IS_TEST = true;

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
    { id: "wechat_h5", name: "WeChat Pay", nameZh: "微信支付", icon: "💚" },
    { id: "alipay_h5", name: "Alipay", nameZh: "支付寶", icon: "🔵" },
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

export async function createCheckout(params: CheckoutParams): Promise<{ url: string; sessionId: string } | { error: string }> {
  const region = detectRegion();
  const methods = PAYMENT_METHODS[region];

  if (IS_TEST) {
    // Test mode: simulate checkout
    console.log("[Creem Test] Creating checkout:", { ...params, region, methods });
    const sessionId = "test_" + Date.now().toString(36);
    localStorage.setItem("r7_pending_payment", JSON.stringify({ ...params, sessionId, region }));
    // In production: POST to Creem API
    // const response = await fetch(`${CREEM_BASE}/checkout/sessions`, { ... })
    return {
      url: `/payment-success?session=${sessionId}`,
      sessionId,
    };
  }

  try {
    const response = await fetch(`${CREEM_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TEST_API_KEY}`,
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
        success_url: `${window.location.origin}/payment-success?session={session_id}`,
        cancel_url: `${window.location.origin}/payment?cancelled=1`,
        // Creem auto-detects payment methods based on customer IP
        allowed_payment_methods: methods.map(m => m.id),
      }),
    });

    if (!response.ok) throw new Error("Checkout creation failed");
    const data = await response.json();
    return { url: data.checkout_url, sessionId: data.session_id };
  } catch (err: any) {
    return { error: err.message || "Payment service unavailable" };
  }
}

// ---- Verify Payment (called on success page) ----
export async function verifyPayment(sessionId: string): Promise<{ success: boolean; orderId?: string }> {
  if (IS_TEST && sessionId.startsWith("test_")) {
    // Auto-verify test sessions
    return { success: true, orderId: `order_${sessionId}` };
  }

  try {
    const response = await fetch(`${CREEM_BASE}/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${TEST_API_KEY}` },
    });
    if (!response.ok) return { success: false };
    const data = await response.json();
    return { success: data.status === "completed", orderId: data.order_id };
  } catch {
    return { success: false };
  }
}

// ---- Auto VIP Tagging + Benefit Grant ----
export function grantBenefits(params: CheckoutParams): void {
  const sub = JSON.parse(localStorage.getItem("r7_sub_state") || "{}");

  if (params.amount >= 12.00) {
    // Monthly VIP — auto tag
    sub.plan = "monthly";
    sub.vip = true;
    sub.vipSince = new Date().toISOString();
    sub.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (params.amount >= 2.99) {
    sub.singlePurchases = (sub.singlePurchases || 0) + 1;
  }

  localStorage.setItem("r7_sub_state", JSON.stringify(sub));

  // Sync to payment records
  const orders = JSON.parse(localStorage.getItem("r7_orders") || "[]");
  orders.push({
    amount: params.amount,
    product: params.productNameZh || params.productName,
    type: params.amount >= 10.00 ? "VIP" : "single",
    date: new Date().toISOString(),
    sessionId: params.metadata?.sessionId || `order_${Date.now().toString(36)}`,
    status: "completed",
  });
  localStorage.setItem("r7_orders", JSON.stringify(orders.slice(-100)));
}

// ---- Webhook handler (Creem → auto VIP) ----
export function handlePaymentWebhook(event: { type: string; data: any }): void {
  if (event.type === "checkout.session.completed") {
    const session = event.data;
    grantBenefits({
      amount: session.amount / 100,
      productName: session.product_name || "Tarot",
      productNameZh: session.product_name_zh || "塔羅",
      userId: session.metadata?.user_id,
      metadata: { sessionId: session.session_id },
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
  } catch {}
  return false;
}
