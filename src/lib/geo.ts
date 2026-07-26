/* ============================================================
   R7 Fortune — Geo / VPN Region Detection
   IP-based country detection (follows VPN exit IP) · price tier
   Synchronous cached read + async refresh + React subscription
   ============================================================ */
import { useSyncExternalStore } from "react";

export type PriceTier = "cn" | "intl" | "ppp";

// High-income / developed markets → full USD market price.
// Everything that is NOT mainland China and NOT in this set is treated
// as an emerging market and gets a purchasing-power-parity (PPP) discount.
const INTL_COUNTRIES = new Set<string>([
  "US", "CA", "GB", "IE", "AU", "NZ",
  "JP", "KR", "SG", "HK", "TW",
  "AE", "SA", "IL", "QA", "KW", "BH", "OM",
  "CH", "NO", "DK", "SE", "FI", "IS", "LU",
  "NL", "BE", "AT", "DE", "FR", "ES", "IT", "PT",
  "MT", "CY", "SI", "SK", "HR", "EE", "LV", "LT",
  "CZ", "HU", "GR", "PL", "MC", "SM", "AD", "LI", "VA",
]);

export function getTier(country: string | null | undefined): PriceTier {
  const c = (country || "").toUpperCase();
  if (c === "CN") return "cn";
  if (INTL_COUNTRIES.has(c)) return "intl";
  return "ppp";
}

const STORAGE_COUNTRY = "r7_geo_country";
let cachedCountry: string | null = null;
const listeners = new Set<() => void>();

function languageHeuristic(): string {
  if (typeof navigator === "undefined") return "US";
  const lang = navigator.language || "";
  if (lang.startsWith("zh-CN")) return "CN";
  if (lang.startsWith("zh")) return "HK"; // zh-TW / zh-HK → treat as intl-high
  return "US";
}

/** Synchronous country read: cached resolution → localStorage → language heuristic. */
export function getCountrySync(): string {
  if (cachedCountry) return cachedCountry;
  try {
    const s = localStorage.getItem(STORAGE_COUNTRY);
    if (s) {
      cachedCountry = s;
      return s;
    }
  } catch {
    /* localStorage unavailable */
  }
  return languageHeuristic();
}

export function getTierSync(): PriceTier {
  return getTier(getCountrySync());
}

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeGeo(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Async IP-based geo detection. Follows the visitor's actual connection
 * (including VPN exit IP). Result cached in localStorage so it survives
 * reloads. Falls back to the language heuristic when the lookup fails
 * (offline / blocked, e.g. inside mainland China).
 */
export async function detectCountryRemote(): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const cc = data?.country_code;
    if (typeof cc === "string" && cc.length === 2) {
      const upper = cc.toUpperCase();
      cachedCountry = upper;
      try {
        localStorage.setItem(STORAGE_COUNTRY, upper);
      } catch {
        /* ignore */
      }
      notify();
      return upper;
    }
  } catch {
    /* offline / blocked → keep heuristic default */
  }
  return getCountrySync();
}

// ---- React hooks ----
export function useCountry(): string {
  return useSyncExternalStore(subscribeGeo, getCountrySync, getCountrySync);
}

export function useTier(): PriceTier {
  const country = useCountry();
  return getTier(country);
}
