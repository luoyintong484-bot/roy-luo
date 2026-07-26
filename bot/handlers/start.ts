/* R7 Wellness Bot — /start handler + Main Menu */

import { Context, InlineKeyboard } from "grammy";
import { M } from "../content/messages.js";

export async function handleStart(ctx: Context) {
  const name = ctx.from?.first_name || "friend";
  const keyboard = new InlineKeyboard()
    .text(M.menu.selfDiscovery, "menu:self_discovery")
    .row()
    .text(M.menu.relationship, "menu:relationship")
    .row()
    .text(M.menu.chat, "menu:chat");

  await ctx.reply(M.welcome(name), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

export async function handleMenuCallback(ctx: Context) {
  const data = (ctx as any).callbackQuery?.data;
  if (!data) return;
  await ctx.answerCallbackQuery();

  const conv = (ctx as any).conversation;
  if (data === "menu:self_discovery") {
    await conv.enter("selfDiscovery");
  } else if (data === "menu:relationship") {
    await conv.enter("relationship");
  } else if (data === "menu:chat") {
    await conv.enter("chat");
  } else if (data === "menu:back") {
    await handleStart(ctx);
  }
}
