import { createHash, createSign, createVerify, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Context } from "hono";
import { authenticateRequest } from "./kimi/auth";
import {
  closePaymentProviderOrder,
  completePaymentProviderOrder,
  createPaymentProviderOrder,
  findPaymentProviderOrder,
  markReadingPaid,
} from "./queries/payment-provider-orders";

const ALIPAY_GATEWAY = "https://openapi.alipay.com/gateway.do";
const SITE_URL = (
  process.env.PUBLIC_SITE_URL || "https://www.r7fortune.com"
).replace(/\/$/, "");

// The server owns the product/amount relationship. A global amount whitelist is
// insufficient because a cheap product amount could otherwise buy an expensive
// report by changing only reportType in the browser request.
const PRODUCT_SUBJECTS: Record<string, string> = {
  tarot: "Tarot Reading Report",
  ziweiTarot: "Ziwei Tarot Dual Reading Report",
  ziweiTarotFirst: "Ziwei Tarot Dual Reading Report",
  natal: "Ziwei Natal Chart Report",
  synastry: "Ziwei Compatibility Report",
  cp: "CP Deep Report",
  idolGuide: "Fan Guidance Report",
  followupPack: "Follow-up Questions Pack",
};
const VALID_REPORT_TYPES = new Set(Object.keys(PRODUCT_SUBJECTS));
const PRODUCT_AMOUNTS: Record<string, ReadonlySet<string>> = {
  tarot: new Set(["9.90"]),
  ziweiTarot: new Set(["19.90", "39.90"]),
  natal: new Set(["39.90", "79.00"]),
  synastry: new Set(["99.90", "109.00"]),
  cp: new Set(["69.90"]),
  idolGuide: new Set(["9.90"]),
  followupPack: new Set(["9.90"]),
};

function normalizePem(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function readSecret(
  inlineValue: string | undefined,
  filePath: string | undefined,
) {
  if (filePath) {
    try {
      return normalizePem(readFileSync(filePath, "utf8"));
    } catch {
      return "";
    }
  }
  return normalizePem(inlineValue || "");
}

function config() {
  return {
    enabled: process.env.ALIPAY_ENABLED === "true",
    wapEnabled: process.env.ALIPAY_WAP_ENABLED === "true",
    appId: process.env.ALIPAY_APP_ID || "",
    privateKey: readSecret(
      process.env.ALIPAY_APP_PRIVATE_KEY,
      process.env.ALIPAY_APP_PRIVATE_KEY_FILE,
    ),
    publicKey: readSecret(
      process.env.ALIPAY_PUBLIC_KEY,
      process.env.ALIPAY_PUBLIC_KEY_FILE,
    ),
    sellerId: process.env.ALIPAY_SELLER_ID || "",
  };
}

function assertConfigured() {
  const current = config();
  if (!current.enabled) throw new Error("支付宝支付尚未启用");
  if (!current.appId || !current.privateKey || !current.publicKey) {
    throw new Error("支付宝服务端凭证未完整配置");
  }
  return current;
}

function canonicalize(params: Record<string, string>, excludeSignType = false) {
  return Object.entries(params)
    .filter(
      ([key, value]) =>
        key !== "sign" &&
        (!excludeSignType || key !== "sign_type") &&
        value !== "",
    )
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function sign(params: Record<string, string>, privateKey: string) {
  const signer = createSign("RSA-SHA256");
  signer.update(canonicalize(params), "utf8");
  signer.end();
  return signer.sign(privateKey, "base64");
}

function verify(
  params: Record<string, string>,
  signature: string,
  publicKey: string,
) {
  const verifier = createVerify("RSA-SHA256");
  // Alipay callbacks exclude both sign and sign_type from the verification payload.
  verifier.update(canonicalize(params, true), "utf8");
  verifier.end();
  return verifier.verify(publicKey, signature, "base64");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function setPrivateResponseHeaders(c: Context) {
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, private");
  c.header("Pragma", "no-cache");
}

function safeReturnPath(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value.slice(0, 500)
    : "/profile?tab=payments";
}

function makeOrderNo() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `R7A${stamp}${randomBytes(5).toString("hex").toUpperCase()}`;
}

async function optionalUserId(c: Context) {
  try {
    return (await authenticateRequest(c.req.raw.headers))?.id;
  } catch {
    return undefined;
  }
}

export async function createAlipayCheckout(c: Context) {
  try {
    setPrivateResponseHeaders(c);
    const current = assertConfigured();
    const body = await c.req.json<{
      reportType?: string;
      reportKey?: string;
      readingId?: number;
      returnPath?: string;
      offerCode?: string;
      amount?: number;
    }>();
    const baseType = body.reportType || "";
    if (
      !VALID_REPORT_TYPES.has(baseType) ||
      !body.reportKey ||
      body.reportKey.length > 255
    ) {
      return c.json({ error: "无效的支付商品或报告编号" }, 400);
    }
    const requestedAmount = Number(body.amount);
    const amountStr = Number.isFinite(requestedAmount)
      ? requestedAmount.toFixed(2)
      : "";
    if (!PRODUCT_AMOUNTS[baseType]?.has(amountStr)) {
      return c.json({ error: "无效的商品金额" }, 400);
    }

    const outTradeNo = makeOrderNo();
    const accessToken = randomBytes(24).toString("base64url");
    const returnPath = safeReturnPath(body.returnPath);
    const userId = await optionalUserId(c);
    const readingId =
      Number.isInteger(body.readingId) && Number(body.readingId) > 0
        ? Number(body.readingId)
        : undefined;

    await createPaymentProviderOrder({
      outTradeNo,
      userId,
      readingId,
      reportType: baseType,
      reportKey: body.reportKey,
      subject: PRODUCT_SUBJECTS[baseType],
      amount: amountStr,
      accessTokenHash: hashToken(accessToken),
      returnPath,
    });

    const returnUrl = `${SITE_URL}/payment/return?access_token=${encodeURIComponent(accessToken)}`;
    const userAgent = c.req.header("user-agent") || "";
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
    const useWap = isMobile && current.wapEnabled;
    const bizContent = JSON.stringify({
      out_trade_no: outTradeNo,
      product_code: useWap ? "QUICK_WAP_WAY" : "FAST_INSTANT_TRADE_PAY",
      total_amount: amountStr,
      subject: PRODUCT_SUBJECTS[baseType],
    });
    const params: Record<string, string> = {
      app_id: current.appId,
      method: useWap ? "alipay.trade.wap.pay" : "alipay.trade.page.pay",
      format: "JSON",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: new Date().toLocaleString("sv-SE", {
        timeZone: "Asia/Shanghai",
      }),
      version: "1.0",
      notify_url: `${SITE_URL}/payment/notify`,
      return_url: returnUrl,
      biz_content: bizContent,
    };
    params.sign = sign(params, current.privateKey);
    const query = new URLSearchParams(params).toString();

    return c.json({
      checkoutUrl: `${ALIPAY_GATEWAY}?${query}`,
      orderId: outTradeNo,
      accessToken,
      amount: amountStr,
      currency: "CNY",
      channel: useWap ? "wap" : "page",
    });
  } catch (error) {
    console.error(
      "[alipay] create checkout failed",
      error instanceof Error ? error.message : error,
    );
    return c.json(
      { error: error instanceof Error ? error.message : "创建支付宝订单失败" },
      503,
    );
  }
}

export async function handleAlipayNotify(c: Context) {
  try {
    const current = assertConfigured();
    const form = await c.req.parseBody();
    const params = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, String(value)]),
    );
    const signature = params.sign || "";
    if (!signature || !verify(params, signature, current.publicKey))
      return c.text("fail", 400);
    if (params.app_id !== current.appId) return c.text("fail", 400);
    if (current.sellerId && params.seller_id !== current.sellerId)
      return c.text("fail", 400);

    const order = await findPaymentProviderOrder(params.out_trade_no || "");
    const notifiedAmount = Number(params.total_amount);
    const orderAmount = Number(order?.amount);
    if (
      !order ||
      !Number.isFinite(notifiedAmount) ||
      !Number.isFinite(orderAmount) ||
      orderAmount.toFixed(2) !== notifiedAmount.toFixed(2)
    ) {
      return c.text("fail", 400);
    }

    if (
      params.trade_status === "TRADE_SUCCESS" ||
      params.trade_status === "TRADE_FINISHED"
    ) {
      if (
        order.providerTradeNo &&
        params.trade_no &&
        order.providerTradeNo !== params.trade_no
      ) {
        return c.text("fail", 409);
      }
      if (order.status !== "completed") {
        await completePaymentProviderOrder(order.id, params.trade_no || null);
        if (order.readingId) {
          await markReadingPaid(order.readingId);
        }
      }
    } else if (params.trade_status === "TRADE_CLOSED") {
      await closePaymentProviderOrder(
        order.id,
        order.status === "completed" ? "refunded" : "failed",
        params.trade_no || order.providerTradeNo,
      );
    }
    return c.text("success");
  } catch (error) {
    console.error(
      "[alipay] notify failed",
      error instanceof Error ? error.message : error,
    );
    return c.text("fail", 500);
  }
}

export async function handleAlipayReturn(c: Context) {
  const current = config();
  const params = Object.fromEntries(new URL(c.req.url).searchParams.entries());
  const accessToken = params.access_token || "";
  delete params.access_token;
  const signature = params.sign || "";
  const valid = Boolean(
    current.publicKey &&
    signature &&
    verify(params, signature, current.publicKey),
  );
  const orderNo = params.out_trade_no || "";
  const order = orderNo ? await findPaymentProviderOrder(orderNo) : undefined;
  const returnPath = order?.returnPath || "/profile?tab=payments";
  const query = new URLSearchParams({
    session: orderNo,
    alipay_token: accessToken,
    return: returnPath,
    provider_return: valid ? "verified" : "unverified",
  });
  return c.redirect(`${SITE_URL}/#/payment-success?${query.toString()}`, 302);
}

export async function getAlipayOrderStatus(c: Context) {
  setPrivateResponseHeaders(c);
  const outTradeNo = c.req.query("order") || "";
  const accessToken = c.req.query("token") || "";
  if (!outTradeNo || !accessToken)
    return c.json({ paid: false, error: "缺少订单校验信息" }, 400);
  const order = await findPaymentProviderOrder(outTradeNo);
  if (!order || order.accessTokenHash !== hashToken(accessToken))
    return c.json({ paid: false }, 404);
  return c.json({
    paid: order.status === "completed",
    status: order.status,
    orderId: order.outTradeNo,
    reportKey: order.status === "completed" ? order.reportKey : undefined,
    reportType: order.status === "completed" ? order.reportType : undefined,
    amount: order.status === "completed" ? Number(order.amount) : undefined,
    currency: order.status === "completed" ? order.currency : undefined,
    returnPath: order.returnPath,
  });
}

export async function getPaymentUserStatus(c: Context) {
  setPrivateResponseHeaders(c);
  const userId = await optionalUserId(c);
  if (!userId) {
    return c.json({
      is_paid: false,
      expire_at: null,
      plan_name: "guest",
      is_logged_in: false,
    });
  }

  const user = await authenticateRequest(c.req.raw.headers);
  const membershipActive = Boolean(
    user.isPremium &&
    (!user.membershipExpiresAt ||
      user.membershipExpiresAt.getTime() > Date.now()),
  );
  return c.json({
    is_paid: membershipActive,
    expire_at: user.membershipExpiresAt?.toISOString() || null,
    plan_name: membershipActive ? user.membershipType : "none",
    is_logged_in: true,
  });
}
