/* R7 Wellness Bot — Payment Link Integration
   PayPal-first for fast MVP collection, Stripe-ready for later automation. */

import Stripe from "stripe";
import {
  PAYMENT_CONFIRMATION_MODE,
  PAYMENT_PROVIDER,
  PAYPAL_LINK_BODY_EMOTION_BALANCE,
  PAYPAL_LINK_CAREER_MEANING,
  PAYPAL_LINK_DREAM_EMOTION,
  PAYPAL_LINK_EMOTIONAL_DEPTH,
  PAYPAL_LINK_INNER_RICHNESS_PERSONALITY,
  PAYPAL_LINK_RELATIONSHIP_EMOTIONAL_GROWTH,
  PAYPAL_ME_USERNAME,
  STRIPE_SECRET,
} from "../config.js";

export type ReportType =
  | "emotional-depth"
  | "dream-emotion"
  | "career-meaning"
  | "body-emotion-balance"
  | "inner-richness-personality"
  | "relationship-emotional-growth";
export type PaymentProvider = "PayPal" | "Stripe" | "Preview";
export type PaymentConfirmationMode = "manual" | "auto";

export interface PaymentMetadata {
  chatId: number;
  reportType: ReportType;
  userName?: string;
}

export interface PaymentLink {
  url: string;
  provider: PaymentProvider;
  confirmationMode: PaymentConfirmationMode;
}

const stripe = STRIPE_SECRET && !STRIPE_SECRET.includes("xxxxxxxxxx")
  ? new Stripe(STRIPE_SECRET)
  : null;

const PAYPAL_AMOUNTS: Record<ReportType, string> = {
  "emotional-depth": "49",
  "dream-emotion": "59",
  "career-meaning": "69",
  "body-emotion-balance": "79",
  "inner-richness-personality": "99",
  "relationship-emotional-growth": "129",
};

export async function createPaymentLink(
  metadata: PaymentMetadata
): Promise<PaymentLink | null> {
  if (PAYMENT_PROVIDER.toLowerCase() === "paypal") {
    const paypalUrl = getPayPalUrl(metadata.reportType);
    if (paypalUrl) {
      return {
        url: paypalUrl,
        provider: "PayPal",
        confirmationMode: normalizeConfirmationMode(PAYMENT_CONFIRMATION_MODE),
      };
    }

    console.warn("[PayPal] Not configured — returning preview link");
    return {
      url: `https://t.me/R7WellnessBot?start=paid_mock_${metadata.reportType}_${metadata.chatId}`,
      provider: "Preview",
      confirmationMode: "manual",
    };
  }

  const stripeUrl = await createStripeCheckoutSession(metadata);
  if (!stripeUrl) return null;

  return {
    url: stripeUrl,
    provider: "Stripe",
    confirmationMode: "auto",
  };
}

export function parsePaymentCallback(
  startPayload: string
): { reportType: string; chatId: number } | null {
  if (!startPayload.startsWith("paid_")) return null;
  const parts = startPayload.replace("paid_", "").split("_");
  if (parts.length < 2) return null;
  const chatId = parseInt(parts[parts.length - 1]);
  const reportType = parts.slice(0, -1).join("_");
  if (isNaN(chatId)) return null;
  return { reportType, chatId };
}

function getPayPalUrl(reportType: ReportType) {
  const configuredLinks: Record<ReportType, string> = {
    "emotional-depth": PAYPAL_LINK_EMOTIONAL_DEPTH,
    "dream-emotion": PAYPAL_LINK_DREAM_EMOTION,
    "career-meaning": PAYPAL_LINK_CAREER_MEANING,
    "body-emotion-balance": PAYPAL_LINK_BODY_EMOTION_BALANCE,
    "inner-richness-personality": PAYPAL_LINK_INNER_RICHNESS_PERSONALITY,
    "relationship-emotional-growth": PAYPAL_LINK_RELATIONSHIP_EMOTIONAL_GROWTH,
  };

  if (configuredLinks[reportType]) return configuredLinks[reportType];
  if (!PAYPAL_ME_USERNAME) return "";

  const username = PAYPAL_ME_USERNAME.replace(/^@/, "").trim();
  return `https://paypal.me/${encodeURIComponent(username)}/${PAYPAL_AMOUNTS[reportType]}`;
}

async function createStripeCheckoutSession(metadata: PaymentMetadata) {
  if (!stripe) {
    console.warn("[Stripe] Not configured — returning preview link");
    return `https://t.me/R7WellnessBot?start=paid_mock_${metadata.reportType}_${metadata.chatId}`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: metadata.reportType,
          },
          unit_amount: Math.round(Number(PAYPAL_AMOUNTS[metadata.reportType]) * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `https://t.me/R7WellnessBot?start=paid_${metadata.reportType}_${metadata.chatId}`,
      cancel_url: "https://t.me/R7WellnessBot",
      metadata: {
        chat_id: String(metadata.chatId),
        report_type: metadata.reportType,
        user_name: metadata.userName || "unknown",
      },
    });

    return session.url || null;
  } catch (err) {
    console.error("[Stripe] Failed to create checkout session:", err);
    return null;
  }
}

function normalizeConfirmationMode(value: string): PaymentConfirmationMode {
  return value.toLowerCase() === "auto" ? "auto" : "manual";
}
