/* R7 Wellness Bot — Personality Blueprint conversation */

import { Conversation, type ConversationFlavor } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { M } from "../content/messages.js";
import { generateSelfDiscoveryReport, type SelfDiscoveryInput } from "../services/ai-generator.js";
import { createPaymentLink } from "../services/payments.js";
import {
  FREE_SELF_DISCOVERY_PREVIEW,
  PRICE_INNER_RICHNESS_PERSONALITY,
} from "../config.js";

type MyContext = ConversationFlavor<Context>;
type MyConversation = Conversation<MyContext>;

export async function selfDiscovery(conversation: MyConversation, ctx: MyContext) {
  const input: SelfDiscoveryInput = {
    name: "",
    birthDate: "",
    birthPlace: "",
  };

  // Step 1: Name
  await ctx.reply(M.sd.askName, { parse_mode: "HTML" });
  const nameCtx = await conversation.waitFor("message:text");
  input.name = nameCtx.message.text.trim();

  // Step 2: Birth Date
  await ctx.reply(M.sd.askBirthDate, { parse_mode: "HTML" });
  const dateCtx = await conversation.waitFor("message:text");
  input.birthDate = dateCtx.message.text.trim();

  // Step 3: Birth Time (optional)
  await ctx.reply(M.sd.askBirthTime, { parse_mode: "HTML" });
  const timeCtx = await conversation.waitFor("message:text");
  const timeRaw = timeCtx.message.text.trim();
  if (timeRaw.toLowerCase() !== "skip" && timeRaw) {
    input.birthTime = timeRaw;
  }

  // Step 4: Birth Place
  await ctx.reply(M.sd.askBirthPlace, { parse_mode: "HTML" });
  const placeCtx = await conversation.waitFor("message:text");
  input.birthPlace = placeCtx.message.text.trim();

  // Generate
  await ctx.reply(M.sd.generating, { parse_mode: "HTML" });

  let sections: string[];
  try {
    sections = await generateSelfDiscoveryReport(input);
  } catch (err) {
    console.error("[SelfDiscovery] AI generation failed:", err);
    await ctx.reply("⚠️ Something went wrong generating your report. Please try again later.");
    return;
  }

  if (sections.length === 0) {
    await ctx.reply("⚠️ Could not generate a report with the provided information. Please try again with more details.");
    return;
  }

  // Send free preview (first N sections)
  const previewCount = Math.min(FREE_SELF_DISCOVERY_PREVIEW, sections.length);
  for (let i = 0; i < previewCount; i++) {
    await ctx.reply(sections[i], { parse_mode: "HTML" });
  }

  // If there are more sections behind paywall
  if (sections.length > previewCount) {
    // Store report data for later retrieval
    const chatId = ctx.chat?.id;
    if (chatId) {
      storeReport(chatId, "self-discovery", sections, input.name);
    }

    const keyboard = new InlineKeyboard().text(
      M.payment.unlockButton(PRICE_INNER_RICHNESS_PERSONALITY),
      "pay:self_discovery"
    );

    await ctx.reply(
      M.sd.upsell(sections.slice(0, previewCount).join("\n\n").substring(0, 300) + "..."),
      { parse_mode: "HTML", reply_markup: keyboard }
    );
  }
}

// ---- Payment callback handler ----
export async function handleSelfDiscoveryPayment(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  await ctx.answerCallbackQuery();
  await ctx.reply(M.payment.processing, { parse_mode: "HTML" });

  const link = await createPaymentLink({
    chatId,
    reportType: "inner-richness-personality",
  });

  if (link) {
    const isManual = link.confirmationMode === "manual";
    const keyboard = new InlineKeyboard()
      .url(M.payment.payButton(link.provider, PRICE_INNER_RICHNESS_PERSONALITY), link.url);

    if (isManual) {
      keyboard.row().text(M.payment.paidButton, "confirm:self_discovery");
    }

    await ctx.reply(M.payment.checkoutInstructions(link.provider, isManual), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
    await ctx.reply(M.privacy, { parse_mode: "HTML" });
  } else {
    await ctx.reply(M.payment.error, { parse_mode: "HTML" });
  }
}

// ---- Deliver full report after payment ----
export async function deliverSelfDiscoveryReport(
  ctx: Context,
  chatId: number
) {
  const record = retrieveReport(chatId, "self-discovery");
  if (!record) {
    await ctx.api.sendMessage(chatId, "⚠️ Could not find your report. Please try generating a new one.");
    return;
  }

  await ctx.api.sendMessage(chatId, M.payment.success, { parse_mode: "HTML" });

  // Send all sections
  for (const section of (record.sections as string[])) {
    await ctx.api.sendMessage(chatId, section, { parse_mode: "HTML" });
  }

  await ctx.api.sendMessage(chatId, M.disclaimer, { parse_mode: "HTML" });

  // Clean up
  deleteReport(chatId, "self-discovery");
}

// ---- In-memory report storage (replace with DB in production) ----
const reportStore = new Map<string, { sections: string[]; name: string; createdAt: number }>();

function storeReport(
  chatId: number,
  type: string,
  sections: string[],
  name: string
) {
  const key = `${chatId}:${type}`;
  reportStore.set(key, { sections, name, createdAt: Date.now() });
  // Auto-clean after 1 hour
  setTimeout(() => reportStore.delete(key), 60 * 60 * 1000);
}

function retrieveReport(chatId: number, type: string) {
  return reportStore.get(`${chatId}:${type}`);
}

function deleteReport(chatId: number, type: string) {
  reportStore.delete(`${chatId}:${type}`);
}
