/* R7 Wellness Bot — Payment Callback Handler
   Handles deep-linking callbacks from checkout success URLs.
   Format: /start paid_<reportType>_<chatId> */

import { Context } from "grammy";
import { parsePaymentCallback } from "../services/payments.js";
import { M } from "../content/messages.js";
import { deliverSelfDiscoveryReport } from "./self-discovery.js";
import { deliverRelationshipReport } from "./relationship.js";
import { resetChatUsage } from "./chat.js";

/**
 * Handle /start with a paid_ prefix from checkout success redirects.
 * Example: User pays → redirected to https://t.me/R7WellnessBot?start=paid_self-discovery_123456
 */
export async function handlePaymentCallback(ctx: Context) {
  const payload = ctx.message?.text?.split(" ").slice(1).join(" ") || "";
  if (!payload.startsWith("paid_")) return false; // not a payment callback

  const parsed = parsePaymentCallback(payload);
  if (!parsed) {
    await ctx.reply("⚠️ Could not verify payment. Please contact support.");
    return true;
  }

  const { reportType, chatId } = parsed;

  // Deliver the appropriate report
  if (reportType === "self_discovery" || reportType === "self-discovery") {
    await deliverSelfDiscoveryReport(ctx, chatId);
  } else if (reportType === "relationship") {
    await deliverRelationshipReport(ctx, chatId);
  } else if (reportType === "chat_monthly" || reportType === "chat-monthly") {
    resetChatUsage(chatId);
    await ctx.api.sendMessage(
      chatId,
      "<b>Subscription active!</b> You now have unlimited wellness chat. Send /start to begin.",
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply("✅ Payment confirmed! Your report has been unlocked.");
  }

  return true;
}

export async function handleManualPaymentConfirmation(ctx: Context) {
  const data = (ctx as any).callbackQuery?.data || "";
  const chatId = ctx.chat?.id;
  if (!chatId || !data.startsWith("confirm:")) return false;

  await ctx.answerCallbackQuery();
  const reportType = data.replace("confirm:", "");

  if (reportType === "self_discovery" || reportType === "self-discovery") {
    await deliverSelfDiscoveryReport(ctx, chatId);
  } else if (reportType === "relationship") {
    await deliverRelationshipReport(ctx, chatId);
  } else if (reportType === "chat_monthly" || reportType === "chat-monthly") {
    resetChatUsage(chatId);
    await ctx.api.sendMessage(
      chatId,
      "<b>Access confirmed.</b> You now have unlimited wellness chat for this early access session. Send /start to begin.",
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply(M.payment.success, { parse_mode: "HTML" });
  }

  return true;
}
