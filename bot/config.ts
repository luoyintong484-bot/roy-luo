/* R7 Wellness Bot — Configuration */
import "dotenv/config";

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
export const STRIPE_SECRET = process.env.STRIPE_SECRET || "";
export const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || "";
export const MOONSHOT_BASE_URL = "https://api.moonshot.cn/v1";
export const KIMI_MODEL = process.env.KIMI_MODEL || "kimi-k2.6";
export const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "paypal";
export const PAYMENT_CONFIRMATION_MODE = process.env.PAYMENT_CONFIRMATION_MODE || "manual";
export const PAYPAL_ME_USERNAME = process.env.PAYPAL_ME_USERNAME || "";
export const PAYPAL_LINK_EMOTIONAL_DEPTH = process.env.PAYPAL_LINK_EMOTIONAL_DEPTH || "";
export const PAYPAL_LINK_DREAM_EMOTION = process.env.PAYPAL_LINK_DREAM_EMOTION || "";
export const PAYPAL_LINK_CAREER_MEANING = process.env.PAYPAL_LINK_CAREER_MEANING || "";
export const PAYPAL_LINK_BODY_EMOTION_BALANCE = process.env.PAYPAL_LINK_BODY_EMOTION_BALANCE || "";
export const PAYPAL_LINK_INNER_RICHNESS_PERSONALITY = process.env.PAYPAL_LINK_INNER_RICHNESS_PERSONALITY || "";
export const PAYPAL_LINK_RELATIONSHIP_EMOTIONAL_GROWTH = process.env.PAYPAL_LINK_RELATIONSHIP_EMOTIONAL_GROWTH || "";

// Free tier limits
export const FREE_CHAT_MESSAGES = 5;
export const FREE_SELF_DISCOVERY_PREVIEW = 1; // 1 section preview
export const FREE_RELATIONSHIP_PREVIEW = 1;

// Stripe price display
export const PRICE_EMOTIONAL_DEPTH = "$49";
export const PRICE_DREAM_EMOTION = "$59";
export const PRICE_CAREER_MEANING = "$69";
export const PRICE_BODY_EMOTION_BALANCE = "$79";
export const PRICE_INNER_RICHNESS_PERSONALITY = "$99";
export const PRICE_RELATIONSHIP_EMOTIONAL_GROWTH = "$129";
