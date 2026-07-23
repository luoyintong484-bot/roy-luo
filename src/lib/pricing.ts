/* ============================================================
   R7 Fortune — Unified Pricing & Currency System
   IP-based auto-detection · Manual CNY/USD toggle
   Real-time exchange rate · 3% fee included
   ============================================================ */

const STORAGE_CURRENCY = "r7_currency_override";
const STORAGE_RATE = "r7_exchange_rate";

// Base exchange rate (updated via API in production)
const DEFAULT_RATE = 7.2;

// Product pricing (USD base, 3% fee included)
export const PRODUCTS = {
  singleDraw:      { usd: 1.99, name: "Single Tarot Draw", nameZh: "單次抽牌" },
  monthlyMember:   { usd: 12.99, name: "Monthly Member · VIP", nameZh: "月度會員 · 無限次抽牌+完整解析" },
  aiDeepReading:   { usd: 30.83, name: "AI 1v1 Deep Reading", nameZh: "AI 1v1 深度占卜" },
  cpReport:        { usd: 10.00, name: "CP Report", nameZh: "CP 合盤報告" },
} as const;

// ===== 国内人民币固定定价（微信/支付宝收款通道） =====
export const CNY_PRICES = {
  tarot:   { cny: 29.90,  label: "塔羅解讀",         labelEn: "Tarot Reading" },
  ziweiTarot: { cny: 39.90, label: "紫微塔羅雙牌", labelEn: "Ziwei Tarot Dual Reading" },
  natal:   { cny: 79.00,  label: "紫微斗數個人完整解析",   labelEn: "Ziwei Doushu Natal Report" },
  synastry:{ cny: 109.00, label: "紫微斗數雙人合盤解析",   labelEn: "Ziwei Doushu Synastry Report" },
  cp:      { cny: 69.90,  label: "CP 专属合盤解讀",    labelEn: "CP Compatibility Report" },
} as const;

export type CnyPriceKey = keyof typeof CNY_PRICES;

/** Get CNY display price for a report type */
export function getCnyPrice(key: CnyPriceKey): string {
  return `¥${CNY_PRICES[key].cny.toFixed(2)}`;
}

/** Get display price: CNY for CN users, USD otherwise */
export function getLocalPrice(key: CnyPriceKey): { amount: number; display: string; currency: "CNY" | "USD" } {
  const c = detectCurrency();
  if (c === "CNY") {
    return { amount: CNY_PRICES[key].cny, display: `¥${CNY_PRICES[key].cny.toFixed(2)}`, currency: "CNY" };
  }
  // USD fallback: map to approximate USD amounts
  const usdMap: Record<CnyPriceKey, number> = {
    tarot: 3.99, ziweiTarot: 4.99, natal: 10.99, synastry: 15.99, cp: 9.99,
  };
  return { amount: usdMap[key], display: `$${usdMap[key].toFixed(2)}`, currency: "USD" };
}

export type ProductKey = keyof typeof PRODUCTS;

// ---- Currency ----
export type Currency = "USD" | "CNY";

export function getRate(): number {
  try { return parseFloat(localStorage.getItem(STORAGE_RATE) || "") || DEFAULT_RATE; } catch { return DEFAULT_RATE; }
}

export function setRate(rate: number) { localStorage.setItem(STORAGE_RATE, String(rate)); }

export function detectCurrency(): Currency {
  const override = localStorage.getItem(STORAGE_CURRENCY) as Currency | null;
  if (override === "USD" || override === "CNY") return override;
  if (typeof navigator !== "undefined") {
    const lang = navigator.language;
    if (lang.startsWith("zh") && !lang.startsWith("zh-TW") && !lang.startsWith("zh-HK")) return "CNY";
  }
  return "USD";
}

export function setCurrency(c: Currency) { localStorage.setItem(STORAGE_CURRENCY, c); }

export function formatPrice(usd: number, currency?: Currency): string {
  const c = currency || detectCurrency();
  if (c === "CNY") {
    const cny = Math.round(usd * getRate() * 100) / 100;
    return `¥${cny.toFixed(2)}`;
  }
  return `$${usd.toFixed(2)}`;
}

export function getPrice(product: ProductKey): { usd: number; display: string; currency: Currency } {
  const p = PRODUCTS[product];
  const c = detectCurrency();
  return { usd: p.usd, display: formatPrice(p.usd, c), currency: c };
}

// ---- Auto-fetch exchange rate (call on app init) ----
export async function fetchExchangeRate(): Promise<number> {
  try {
    // Free exchange rate API
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.CNY;
      if (rate) { setRate(rate); return rate; }
    }
  } catch {}
  return getRate();
}
