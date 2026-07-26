/* R7 Wellness Bot — AI Wellness Chat (open-ended) */

import type { ConversationFlavor } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { M } from "../content/messages.js";
import { generateChatResponse } from "../services/ai-generator.js";
import { FREE_CHAT_MESSAGES, PRICE_EMOTIONAL_DEPTH } from "../config.js";
import { createPaymentLink } from "../services/payments.js";

type MyContext = ConversationFlavor<Context>;

// Track usage per user (in production, use DB)
const chatUsage = new Map<number, { count: number; history: string[] }>();

export async function chat(conversation: any, ctx: MyContext) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  await ctx.reply(M.chat.intro, { parse_mode: "HTML" });

  if (!chatUsage.has(chatId)) {
    chatUsage.set(chatId, { count: 0, history: [] });
  }

  const usage = chatUsage.get(chatId)!;

  while (true) {
    // Wait for user message
    const msgCtx = await conversation.waitFor("message:text");
    const userMsg = msgCtx.message.text.trim();

    // Check for exit command
    if (userMsg.toLowerCase() === "/start" || userMsg.toLowerCase() === "menu" || userMsg.toLowerCase() === "back") {
      await ctx.reply("Returning to main menu...", { parse_mode: "HTML" });
      return;
    }

    // Free tier check
    if (usage.count >= FREE_CHAT_MESSAGES) {
      const keyboard = new InlineKeyboard().text(
        M.payment.subscribeButton,
        "pay:chat_monthly"
      );
      await ctx.reply(M.chat.freeUsed(usage.count, FREE_CHAT_MESSAGES), {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
      return;
    }

    // Generate response
    await ctx.replyWithChatAction("typing");
    usage.count++;

    try {
      const response = await generateChatResponse(userMsg, usage.history);
      usage.history.push(`User: ${userMsg}`);
      usage.history.push(`Assistant: ${response}`);

      // Keep history manageable
      if (usage.history.length > 20) {
        usage.history.splice(0, 4);
      }

      await ctx.reply(response, { parse_mode: "HTML" });

      // Reminder after each message
      if (usage.count >= FREE_CHAT_MESSAGES - 1) {
        await ctx.reply(
          `<b>1 free message remaining</b>. After that, unlock a one-time premium emotional report with guided companion turns.`,
          { parse_mode: "HTML" }
        );
      }
    } catch (err) {
      console.error("[Chat] AI generation failed:", err);
      await ctx.reply("I'm having trouble processing that right now. Could you try rephrasing?");
    }
  }
}

export async function handleChatPayment(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  await ctx.answerCallbackQuery();
  await ctx.reply(M.payment.processing, { parse_mode: "HTML" });

  const link = await createPaymentLink({ chatId, reportType: "emotional-depth" });
  if (!link) {
    await ctx.reply(M.payment.error, { parse_mode: "HTML" });
    return;
  }

  const isManual = link.confirmationMode === "manual";
  const keyboard = new InlineKeyboard()
    .url(M.payment.payButton(link.provider, PRICE_EMOTIONAL_DEPTH), link.url);

  if (isManual) {
    keyboard.row().text(M.payment.paidButton, "confirm:emotional_depth");
  }

  await ctx.reply(
    `<b>Premium Emotional Report</b>\n\nOne-time access to the emotional report and guided companion turns for ${PRICE_EMOTIONAL_DEPTH}.\n\n` +
      M.payment.checkoutInstructions(link.provider, isManual),
    { parse_mode: "HTML", reply_markup: keyboard }
  );
}

// Reset chat usage (call after successful subscription)
export function resetChatUsage(chatId: number) {
  chatUsage.delete(chatId);
}
