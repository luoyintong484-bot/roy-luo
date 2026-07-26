/* ============================================================
   R7 Wellness Bot — Main Entry Point
   Telegram Bot for Middle East psychological self-discovery.
   ============================================================ */

import { Bot, Context, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { BOT_TOKEN } from "./config.js";
import { handleStart, handleMenuCallback } from "./handlers/start.js";
import { selfDiscovery, handleSelfDiscoveryPayment } from "./handlers/self-discovery.js";
import { relationship, handleRelationshipPayment } from "./handlers/relationship.js";
import { chat, handleChatPayment } from "./handlers/chat.js";
import { handleManualPaymentConfirmation, handlePaymentCallback } from "./handlers/payment.js";

// ---- Bot Setup ----
if (!BOT_TOKEN || BOT_TOKEN === "your_telegram_bot_token_here") {
  console.error("❌ BOT_TOKEN not configured. Set it in bot/.env");
  console.error("   1. Talk to @BotFather on Telegram");
  console.error("   2. Create a new bot with /newbot");
  console.error("   3. Copy the token to bot/.env");
  process.exit(1);
}

// Use any type to avoid grammY v2 complex typing
const bot = new Bot<any>(BOT_TOKEN);

// ---- Session middleware (required by conversations) ----
bot.use(session({ initial: () => ({}) }));

// ---- Conversations plugin ----
bot.use(conversations());
bot.use(createConversation(selfDiscovery as any, "selfDiscovery"));
bot.use(createConversation(relationship as any, "relationship"));
bot.use(createConversation(chat as any, "chat"));

// ---- /start Command ----
bot.command("start", async (ctx: any) => {
  const payload = ctx.match;
  if (payload && typeof payload === "string") {
    const handled = await handlePaymentCallback(ctx as Context);
    if (handled) return;
  }
  await handleStart(ctx as Context);
});

// ---- Menu & Payment Callbacks ----
bot.on("callback_query:data", async (ctx: any) => {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  if (data.startsWith("menu:")) {
    await handleMenuCallback(ctx as Context);
  } else if (data.startsWith("confirm:")) {
    await handleManualPaymentConfirmation(ctx as Context);
  } else if (data === "pay:self_discovery") {
    await handleSelfDiscoveryPayment(ctx as Context);
  } else if (data === "pay:relationship") {
    await handleRelationshipPayment(ctx as Context);
  } else if (data === "pay:chat_monthly") {
    await handleChatPayment(ctx as Context);
  }
});

// ---- Fallback ----
bot.on("message:text", async (ctx: any) => {
  if (ctx.message.text.startsWith("/")) return;
  await handleStart(ctx as Context);
});

// ---- Error handling ----
bot.catch((err: any) => {
  console.error("[Bot] Error:", err.message);
});

// ---- Start ----
console.log("🚀 R7 Wellness Bot is running...");
console.log("   Open Telegram and search: @R7WellnessBot");

bot.start({
  onStart: (info: any) => {
    console.log(`✅ Bot @${info.username} is online!`);
  },
});
