/* ============================================================
   R7 Fortune — Classic Tarot AI Dynamic Reader v2
   Card + User Question → 本心 / 现状 / 发展 / 建议
   Integrated with 78-card 4-category library
   Dual-mode: elegant prose + plain explanation
   ============================================================ */

import type { TarotCard } from "@/data/tarotCards";
import { detectCategory, getCardInterpretation, type CardCategory } from "@/lib/tarot-card-library";

export interface CardReading {
  heart: { elegant: string; plain: string };    // 本心状态
  situation: { elegant: string; plain: string }; // 当下现状
  future: { elegant: string; plain: string };    // 后期发展
  advice: string;                                 // 针对性建议
}

export interface TarotAIResult {
  cards: CardReading[];
  overview: { elegant: string; plain: string };
}

// ---- Dynamic generator: card + question + category → structured reading ----
export function generateAIReading(
  cards: Array<{ card: TarotCard; reversed: boolean }>,
  question: string,
  locale: "zh-TW" | "en"
): TarotAIResult {
  const isZh = locale === "zh-TW";
  const category = detectCategory(question);
  const q = question.trim();

  const cardReadings = cards.map(({ card, reversed }, idx) => {
    const interp = getCardInterpretation(card.id, category, card.name, card.nameCn,
      isZh ? card.keywordsZh : card.keywordsEn, reversed);
    const position = idx === 0 ? "past" : idx === 1 ? "present" : "future";

    const posLabel = position === "past" ? (isZh ? "過去" : "Past") : position === "present" ? (isZh ? "現在" : "Present") : (isZh ? "未來" : "Future");
    return {
      heart: {
        elegant: isZh
          ? `你抽到${card.nameCn}${reversed ? "逆位" : "正位"}。在「${q.slice(0, 18)}」這件事上，${reversed ? "其實你心裡早就隱約感覺到不對勁的地方了，只是之前不想正視它。這張牌要你誠實面對那個你一直在逃避的念頭。" : "你的直覺是對的。你一直在等的就是一個確認——這張牌就是在告訴你：對，你想的方向沒錯。"}`
          : `You drew ${card.name} ${reversed ? "reversed" : "upright"}. About "${q.slice(0, 30)}" — ${reversed ? "you've sensed something was off for a while. This card asks you to stop ignoring that quiet voice." : "your gut feeling is correct. You've been waiting for confirmation, and this card is it."}`,
        plain: isZh
          ? `說白了：${reversed ? "你心裡有數，只是不想承認。現在是時候正視它了。" : "你的直覺沒騙你，放心往前走。"}`
          : `Plain truth: ${reversed ? "you know what's up. Time to face it." : "your instincts are right. Keep going."}`,
      },
      situation: {
        elegant: interp.elegant,
        plain: interp.plain,
      },
      future: {
        elegant: isZh
          ? `${reversed ? "逆位的" : "正位的"}${card.nameCn}指向接下來${reversed ? "兩到三週內的轉折點——不會是突然的巨變，而是某個小契機讓你重新看待這件事。那個契機可能是一句話、一個消息、或一次偶然的碰面。" : "一個具體的進展——可能是之前卡住的事情突然鬆動了，或是有人主動來找你談。留意接下來十天內的訊息或邀約。"}`
          : `${reversed ? "Reversed" : "Upright"} ${card.name} points to ${reversed ? "a turning point within 2-3 weeks — not a dramatic shift, but a small moment that changes how you see everything. A message, a conversation, a chance encounter." : "concrete progress soon — something that was stuck will start moving, or someone will reach out. Watch for messages or invitations in the next ten days."}`,
        plain: isZh
          ? `接下來${reversed ? "先別急著推動什麼。等兩週，讓事情自己發酵。你會發現有些東西在悄悄變化。" : "快則十天，慢則一個月，你會看到事情往前走了。現在不需要做什麼，保持觀察就好。"}`
          : `In short: ${reversed ? "don't push right now. Wait two weeks. Let things develop on their own." : "within a month, you'll see movement. For now, just stay observant."}`,
      },
      advice: interp.advice,
    };
  });

  const reversedCount = cards.filter(c => c.reversed).length;
  const overview = {
    elegant: isZh
      ? `${cards[0].card.nameCn} → ${cards[1].card.nameCn} → ${cards[2].card.nameCn}。三張牌讀完，關於「${q.slice(0, 18)}」——${reversedCount === 0 ? "牌面異常清晰，不需要反覆琢磨。你已經知道答案了，現在差的就是你願不願意照做。" : reversedCount === 3 ? "三張逆位不常見，但也不可怕。它只是在用另一種方式說：先停下來，先照顧好自己，答案會自己浮出來。" : "有順有逆，恰好反映真實狀況——有些事你看得很清楚，有些還需要時間。不用急著全部釐清，讓事情自然展開。"}`
      : `${cards[0].card.name} → ${cards[1].card.name} → ${cards[2].card.name}. After reading these three cards about "${q.slice(0, 30)}" — ${reversedCount === 0 ? "the message is unusually clear. You already know what to do. The only question is whether you'll act on it." : reversedCount === 3 ? "three reversals isn't bad luck — it's a different kind of guidance. Pause. Take care of yourself first. Answers will come." : "the mix of upright and reversed mirrors real life. Some things are clear, some need time. Don't force clarity — let things unfold."}`,
    plain: isZh
      ? `一句話總結：關於「${q.slice(0, 15)}」——${reversedCount >= 2 ? "目前確實不太順，但這些卡頓不是要攔你，是要幫你看清哪些東西不適合你。該放的放，該等的等，該動的時候不要猶豫。" : "整體趨勢是好的。保持現在的步調，該做的事繼續做，不用急，但也別什麼都不做。"}`
      : `Bottom line: regarding "${q.slice(0, 25)}" — ${reversedCount >= 2 ? "things are bumpy right now. The friction isn't here to stop you — it's showing you what doesn't fit. Let go of what's not working, and when the moment comes, move decisively." : "the overall trend is positive. Keep doing what you're doing. Don't rush, but don't freeze either."}`,
  };

  return { cards: cardReadings, overview };
}
