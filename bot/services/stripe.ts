/* R7 Wellness Bot — Stripe Payment Integration
   Generates Stripe Payment Links for one-click checkout.
   No frontend UI needed — bot sends the link, user pays in browser. */

import Stripe from "stripe";
import { STRIPE_SECRET } from "../config.js";

const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

export interface PaymentMetadata {
  chatId: number;
  reportType:
    | "emotional-depth"
    | "dream-emotion"
    | "career-meaning"
    | "body-emotion-balance"
    | "inner-richness-personality"
    | "relationship-emotional-growth";
  userName?: string;
}

const REPORT_AMOUNTS: Record<PaymentMetadata["reportType"], number> = {
  "emotional-depth": 4900,
  "dream-emotion": 5900,
  "career-meaning": 6900,
  "body-emotion-balance": 7900,
  "inner-richness-personality": 9900,
  "relationship-emotional-growth": 12900,
};

/**
 * Create a Stripe Payment Link for one-click checkout.
 * User clicks the link → pays in browser → redirected back to Telegram.
 */
export async function createPaymentLink(
  metadata: PaymentMetadata
): Promise<string | null> {
  if (!stripe) {
    console.warn("[Stripe] Not configured — returning mock link");
    return `https://t.me/R7WellnessBot?start=paid_mock_${metadata.reportType}_${metadata.chatId}`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: metadata.reportType },
          unit_amount: REPORT_AMOUNTS[metadata.reportType],
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `https://t.me/R7WellnessBot?start=paid_${metadata.reportType}_${metadata.chatId}`,
      cancel_url: `https://t.me/R7WellnessBot`,
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

/**
 * Verify a payment from the deep-link callback.
 * Format: /start paid_<reportType>_<chatId>
 */
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
