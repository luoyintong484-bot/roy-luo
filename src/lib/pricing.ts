/* ============================================================
   R7 Fortune — Unified Pricing & Currency System
   Report checkout prices are always CNY for the unified Alipay cashier.
   ============================================================ */

const STORAGE_CURRENCY = "r7_currency_override";
const STORAGE_RATE = "r7_exchange_rate";

// Base exchange rate (updated via API in production)
const DEFAULT_RATE = 7.2;

// Product pricing (USD base, 3% fee included)
export const PRODUCTS = {
  singleDraw: { usd: 1.99, name: "Single Tarot Draw", nameZh: "單次抽牌" },
  monthlyMember: {
    usd: 12.99,
    name: "Monthly Member · VIP",
    nameZh: "月度會員 · 無限次抽牌+完整解析",
  },
  aiDeepReading: {
    usd: 30.83,
    name: "AI 1v1 Deep Reading",
    nameZh: "AI 1v1 深度占卜",
  },
  cpReport: { usd: 10.0, name: "CP Report", nameZh: "CP 合盤報告" },
} as const;

// ===== 支付宝人民币定价 =====
export const CNY_PRICES = {
  tarot: { cny: 9.9, label: "塔羅解讀", labelEn: "Tarot Reading" },
  ziweiTarot: {
    cny: 39.9,
    label: "紫微塔羅雙牌",
    labelEn: "Ziwei Tarot Dual Reading",
  },
  natal: {
    cny: 79.0,
    label: "紫微斗數個人完整解析",
    labelEn: "Ziwei Doushu Natal Report",
  },
  synastry: {
    cny: 99.9,
    label: "紫微斗數雙人合盤解析",
    labelEn: "Ziwei Doushu Synastry Report",
  },
  cp: {
    cny: 69.9,
    label: "CP 专属合盤解讀",
    labelEn: "CP Compatibility Report",
  },
  idolGuide: {
    cny: 9.9,
    label: "追星指引報告",
    labelEn: "Fan Guidance Report",
  },
  followupPack: { cny: 9.9, label: "追問續杯包", labelEn: "Follow-up Pack" },
} as const;

// ===== 国际 USD 定价（高收入市场，贴合西方单次占卜 $1–10 行情） =====
export const USD_PRICES: Record<CnyPriceKey, number> = {
  tarot: 2.99,
  ziweiTarot: 4.99,
  natal: 10.99,
  synastry: 14.99,
  cp: 9.99,
  idolGuide: 1.99,
  followupPack: 1.99,
};

// ===== 新兴市场经济平价（PPP）折扣价（约国际价 5 折，照顾印度/东南亚/拉美等） =====
export const USD_PPP_PRICES: Record<CnyPriceKey, number> = {
  tarot: 1.49,
  ziweiTarot: 2.99,
  natal: 5.99,
  synastry: 7.99,
  cp: 4.99,
  idolGuide: 0.99,
  followupPack: 0.99,
};

// ===== 套餐定价（捆绑销售提升客单价） =====
export const BUNDLE_PRICES = {
  natalSynastry: {
    cny: 159.0,
    originalCny: 188.0,
    label: "本命盤 + 合盤 情侶套餐",
    labelEn: "Natal + Synastry Bundle",
    includes: ["紫微斗數個人完整解析", "紫微斗數雙人合盤解析"],
    includesEn: ["Ziwei Doushu Natal Report", "Ziwei Doushu Synastry Report"],
  },
  firstTime: {
    cny: 39.9,
    originalCny: 79.0,
    label: "首次體驗價 · 本命盤",
    labelEn: "First-Time Offer · Natal Report",
    includes: ["紫微斗數個人完整解析"],
    includesEn: ["Ziwei Doushu Natal Report"],
  },
} as const;

export type BundleKey = keyof typeof BUNDLE_PRICES;

export type CnyPriceKey = keyof typeof CNY_PRICES;

/** Get CNY display price for a report type */
export function getCnyPrice(key: CnyPriceKey): string {
  return `¥${CNY_PRICES[key].cny.toFixed(2)}`;
}

/** Resolve the CNY amount charged by the unified Alipay checkout. */
function resolveLocalPrice(key: CnyPriceKey): {
  amount: number;
  display: string;
  currency: "CNY";
} {
  const cny = CNY_PRICES[key].cny;
  return { amount: cny, display: `¥${cny.toFixed(2)}`, currency: "CNY" };
}

/** Synchronous local price (uses cached geo tier — correct after init). */
export function getLocalPrice(key: CnyPriceKey): {
  amount: number;
  display: string;
  currency: "CNY" | "USD";
} {
  return resolveLocalPrice(key);
}

/** Report checkout price. Kept as a hook-compatible API for existing paywalls. */
export function useLocalPrice(key: CnyPriceKey): {
  amount: number;
  display: string;
  currency: "CNY" | "USD";
} {
  return resolveLocalPrice(key);
}

export type ProductKey = keyof typeof PRODUCTS;

// ---- Currency ----
export type Currency = "USD" | "CNY";

export function getRate(): number {
  try {
    return parseFloat(localStorage.getItem(STORAGE_RATE) || "") || DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

export function setRate(rate: number) {
  localStorage.setItem(STORAGE_RATE, String(rate));
}

export function detectCurrency(): Currency {
  const override = localStorage.getItem(STORAGE_CURRENCY) as Currency | null;
  if (override === "USD" || override === "CNY") return override;
  if (typeof navigator !== "undefined") {
    const lang = navigator.language;
    if (
      lang.startsWith("zh") &&
      !lang.startsWith("zh-TW") &&
      !lang.startsWith("zh-HK")
    )
      return "CNY";
  }
  return "USD";
}

export function setCurrency(c: Currency) {
  localStorage.setItem(STORAGE_CURRENCY, c);
}

export function formatPrice(usd: number, currency?: Currency): string {
  const c = currency || detectCurrency();
  if (c === "CNY") {
    const cny = Math.round(usd * getRate() * 100) / 100;
    return `¥${cny.toFixed(2)}`;
  }
  return `$${usd.toFixed(2)}`;
}

export function getPrice(product: ProductKey): {
  usd: number;
  display: string;
  currency: Currency;
} {
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
      if (rate) {
        setRate(rate);
        return rate;
      }
    }
  } catch {
    // Fall back to the last cached exchange rate.
  }
  return getRate();
}
