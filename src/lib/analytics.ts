type AnalyticsPayload = {
  scene_type?: string;
  spread_type?: string;
  user_type?: "guest" | "member";
  is_first_purchase?: boolean;
  price?: number;
  order_id?: string;
  session_id?: string;
  question_length?: number;
  payment_method?: string;
  source_page?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, payload: AnalyticsPayload) => void;
  }
}

/**
 * Central analytics boundary. Never pass the full divination question here.
 * Only length and non-sensitive classification metadata are allowed.
 */
export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  const safePayload = { ...payload };
  delete safePayload.question;
  delete safePayload.background;

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, safePayload);
  }

  if (import.meta.env.DEV) {
    console.info(`[analytics] ${eventName}`, safePayload);
  }
}
