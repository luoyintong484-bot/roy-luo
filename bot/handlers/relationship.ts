/* R7 Wellness Bot — Relationship Dynamics conversation */

import type { ConversationFlavor } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { M } from "../content/messages.js";
import { generateRelationshipReport, type RelationshipInput } from "../services/ai-generator.js";
import { createPaymentLink } from "../services/payments.js";
import { FREE_RELATIONSHIP_PREVIEW, PRICE_RELATIONSHIP_EMOTIONAL_GROWTH } from "../config.js";

type MyContext = ConversationFlavor<Context>;

export async function relationship(conversation: any, ctx: MyContext) {
  const input: RelationshipInput = {
    name1: "", birthDate1: "", birthPlace1: "",
    name2: "", birthDate2: "", birthPlace2: "",
  };

  // Person 1
  await ctx.reply(M.rel.askYourName, { parse_mode: "HTML" });
  input.name1 = (await conversation.waitFor("message:text")).message.text.trim();

  await ctx.reply(M.rel.askYourBirthDate, { parse_mode: "HTML" });
  input.birthDate1 = (await conversation.waitFor("message:text")).message.text.trim();

  await ctx.reply(M.rel.askYourBirthTime, { parse_mode: "HTML" });
  const t1 = (await conversation.waitFor("message:text")).message.text.trim();
  if (t1.toLowerCase() !== "skip" && t1) input.birthTime1 = t1;

  await ctx.reply(M.rel.askYourBirthPlace, { parse_mode: "HTML" });
  input.birthPlace1 = (await conversation.waitFor("message:text")).message.text.trim();

  // Person 2
  await ctx.reply(M.rel.askPartnerName, { parse_mode: "HTML" });
  input.name2 = (await conversation.waitFor("message:text")).message.text.trim();

  await ctx.reply(M.rel.askPartnerBirthDate, { parse_mode: "HTML" });
  input.birthDate2 = (await conversation.waitFor("message:text")).message.text.trim();

  await ctx.reply(M.rel.askPartnerBirthTime, { parse_mode: "HTML" });
  const t2 = (await conversation.waitFor("message:text")).message.text.trim();
  if (t2.toLowerCase() !== "skip" && t2) input.birthTime2 = t2;

  await ctx.reply(M.rel.askPartnerBirthPlace, { parse_mode: "HTML" });
  input.birthPlace2 = (await conversation.waitFor("message:text")).message.text.trim();

  // Generate
  await ctx.reply(M.rel.generating, { parse_mode: "HTML" });

  let sections: string[];
  try {
    sections = await generateRelationshipReport(input);
  } catch (err) {
    console.error("[Relationship] AI generation failed:", err);
    await ctx.reply("⚠️ Something went wrong generating your report. Please try again later.");
    return;
  }

  if (sections.length === 0) {
    await ctx.reply("⚠️ Could not generate a report with the provided information. Please try again.");
    return;
  }

  // Free preview
  const previewCount = Math.min(FREE_RELATIONSHIP_PREVIEW, sections.length);
  for (let i = 0; i < previewCount; i++) {
    await ctx.reply(sections[i], { parse_mode: "HTML" });
  }

  if (sections.length > previewCount) {
    const chatId = ctx.chat?.id;
    if (chatId) {
      // Store for later delivery
      storeRelReport(chatId, sections);
    }

    const keyboard = new InlineKeyboard().text(
      M.payment.unlockButton(PRICE_RELATIONSHIP_EMOTIONAL_GROWTH),
      "pay:relationship"
    );

    await ctx.reply(
      M.rel.upsell(sections[0]?.substring(0, 300) + "..." || ""),
      { parse_mode: "HTML", reply_markup: keyboard }
    );
  }
}

export async function handleRelationshipPayment(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  await ctx.answerCallbackQuery();
  await ctx.reply(M.payment.processing, { parse_mode: "HTML" });

  const link = await createPaymentLink({ chatId, reportType: "relationship-emotional-growth" });
  if (link) {
    const isManual = link.confirmationMode === "manual";
    const keyboard = new InlineKeyboard()
      .url(M.payment.payButton(link.provider, PRICE_RELATIONSHIP_EMOTIONAL_GROWTH), link.url);

    if (isManual) {
      keyboard.row().text(M.payment.paidButton, "confirm:relationship");
    }

    await ctx.reply(M.payment.checkoutInstructions(link.provider, isManual), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } else {
    await ctx.reply(M.payment.error, { parse_mode: "HTML" });
  }
}

export async function deliverRelationshipReport(ctx: Context, chatId: number) {
  const sections = retrieveRelReport(chatId);
  if (!sections) {
    await ctx.api.sendMessage(chatId, "⚠️ Could not find your report. Please try generating a new one.");
    return;
  }
  await ctx.api.sendMessage(chatId, M.payment.success, { parse_mode: "HTML" });
  for (const s of sections) {
    await ctx.api.sendMessage(chatId, s, { parse_mode: "HTML" });
  }
  await ctx.api.sendMessage(chatId, M.disclaimer, { parse_mode: "HTML" });
  deleteRelReport(chatId);
}

// ---- In-memory storage ----
const relStore = new Map<number, string[]>();
function storeRelReport(chatId: number, sections: string[]) {
  relStore.set(chatId, sections);
  setTimeout(() => relStore.delete(chatId), 60 * 60 * 1000);
}
function retrieveRelReport(chatId: number) { return relStore.get(chatId); }
function deleteRelReport(chatId: number) { relStore.delete(chatId); }
