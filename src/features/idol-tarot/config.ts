import { Check, Eye, MapPin, Sparkles, type LucideIcon } from "lucide-react";

export type IdolSingleReadingType = "yes-no" | "fan-luck" | "live-tip" | "daily";

export type IdolTarotLocale = "zh-TW" | "en";

export type IdolSceneCopy = {
  key: IdolSingleReadingType;
  category: "fansign" | "concert";
  icon: LucideIcon;
  badge: Record<IdolTarotLocale, string>;
  title: Record<IdolTarotLocale, string>;
  description: Record<IdolTarotLocale, string>;
  bestFor: Record<IdolTarotLocale, string>;
  placeholder: Record<IdolTarotLocale, string>;
  fallbackQuestion: Record<IdolTarotLocale, string>;
  unresolved: Record<IdolTarotLocale, string>;
  paywallTitle: Record<IdolTarotLocale, string>;
  cta: Record<IdolTarotLocale, string>;
  benefits: Record<IdolTarotLocale, string[]>;
  followups: Record<IdolTarotLocale, string[]>;
};

export const IDOL_TAROT_SCENES: IdolSceneCopy[] = [
  {
    key: "yes-no",
    category: "fansign",
    icon: Check,
    badge: { "zh-TW": "快速解答", en: "Quick answer" },
    title: { "zh-TW": "這件事的答案偏向 Yes 還是 No？", en: "Is the Answer Leaning Toward Yes or No?" },
    description: { "zh-TW": "用一張牌確認一個明確追星問題的當前傾向。", en: "A focused reading for one clear fandom-related question." },
    bestFor: { "zh-TW": "適合搶票、抽選、名額與是否行動", en: "Best for tickets, lotteries, entries, and decisions" },
    placeholder: { "zh-TW": "例如：這次活動，我有機會得到期待中的結果嗎？", en: "Example: Is this event likely to bring the outcome I am hoping for?" },
    fallbackQuestion: { "zh-TW": "這件追星相關的事情，答案偏向 Yes 還是 No？", en: "Is this fandom-related situation leaning toward yes or no?" },
    unresolved: { "zh-TW": "目前哪個現實條件，正在決定答案能否從保留走向明確？", en: "Which practical condition is keeping the answer tentative rather than clear?" },
    paywallTitle: { "zh-TW": "查看完整答案與判斷依據", en: "Reveal the Full Answer and Reasoning" },
    cta: { "zh-TW": "查看完整判斷", en: "Reveal My Full Answer" },
    benefits: {
      "zh-TW": ["Yes / No 的明確傾向", "雙牌如何支持這個判斷", "造成保留的現實條件", "結果可能改變的因素", "現在最適合的行動"],
      en: ["A clear yes/no leaning", "How both cards support it", "The practical reservation", "What could change the outcome", "Your best next action"],
    },
    followups: {
      "zh-TW": ["哪個因素最可能改變目前結果？", "我現在主動會帶來什麼變化？", "這件事適合等到什麼狀態？"],
      en: ["What could change the current outcome?", "What changes if I act now?", "What condition should I wait for?"],
    },
  },
  {
    key: "fan-luck",
    category: "concert",
    icon: Sparkles,
    badge: { "zh-TW": "最受歡迎", en: "Most popular" },
    title: { "zh-TW": "我近期的追星運勢如何？", en: "What Is My Upcoming Fandom Energy?" },
    description: { "zh-TW": "查看未來 30 天的好運節奏、驚喜機會與注意事項。", en: "Explore your upcoming luck, opportunities, surprises, and cautions." },
    bestFor: { "zh-TW": "適合回歸期、活動安排、物料與追星節奏", en: "Best for comebacks, events, content, and fandom rhythm" },
    placeholder: { "zh-TW": "例如：未來 30 天，我的追星運勢有哪些值得期待的變化？", en: "Example: What positive developments may appear in my fandom life over the next 30 days?" },
    fallbackQuestion: { "zh-TW": "未來 30 天，我的追星運勢有哪些值得期待的變化？", en: "What positive developments may appear in my fandom life over the next 30 days?" },
    unresolved: { "zh-TW": "接下來 30 天，哪個時間點最值得投入，哪種消耗需要先避開？", en: "Which moment in the next 30 days deserves your energy, and which drain should you avoid?" },
    paywallTitle: { "zh-TW": "查看未來 30 天完整追星運勢", en: "Unlock My Full 30-Day Fandom Reading" },
    cta: { "zh-TW": "解鎖 30 天追星運勢", en: "Unlock My 30-Day Reading" },
    benefits: {
      "zh-TW": ["未來 30 天整體能量", "容易出現驚喜的節點", "情緒消耗與避雷來源", "適合主動參與的事情", "消費與活動注意事項"],
      en: ["Your 30-day fandom energy", "Likely surprise windows", "Emotional drains to avoid", "Where to participate actively", "Spending and event cautions"],
    },
    followups: {
      "zh-TW": ["未來 30 天最值得期待的是什麼？", "近期需要避免哪種追星消耗？", "哪類活動更容易帶來好體驗？"],
      en: ["What is most promising in the next 30 days?", "What fandom drain should I avoid?", "Which activity may bring the best experience?"],
    },
  },
  {
    key: "live-tip",
    category: "concert",
    icon: MapPin,
    badge: { "zh-TW": "活動前必測", en: "Before the event" },
    title: { "zh-TW": "這次活動，我怎樣更容易留下好印象？", en: "How Can I Make the Most of This Event?" },
    description: { "zh-TW": "適合簽售、見面會、演唱會、快閃與其他線下互動。", en: "For fan signs, concerts, meet-and-greets, pop-ups, and in-person events." },
    bestFor: { "zh-TW": "適合準備方式、臨場狀態與互動節奏", en: "Best for preparation, presence, and interaction rhythm" },
    placeholder: { "zh-TW": "例如：這次簽售，我該怎樣準備，才能呈現最好的自己？", en: "Example: How should I prepare to show up as my best self at this fan sign?" },
    fallbackQuestion: { "zh-TW": "這次活動，我該怎樣準備才能呈現最好的自己？", en: "How should I prepare to show up as my best self at this event?" },
    unresolved: { "zh-TW": "臨場時最能加分的準備是什麼，又該避開哪個容易失誤的環節？", en: "What preparation will help most on site, and which likely mistake should you avoid?" },
    paywallTitle: { "zh-TW": "查看我的完整活動指引", en: "Unlock My Full Event Guidance" },
    cta: { "zh-TW": "解鎖完整活動指引", en: "Unlock My Event Guide" },
    benefits: {
      "zh-TW": ["當日整體臨場狀態", "最能展現你的特質", "適合的互動與話題方向", "容易緊張或失誤的地方", "可立即執行的準備清單"],
      en: ["Your on-site energy", "Your most visible quality", "Interaction and topic direction", "Likely nerves or mistakes", "A practical preparation list"],
    },
    followups: {
      "zh-TW": ["當天什麼狀態最適合我？", "我該主動表達還是自然互動？", "怎樣減少臨場緊張和失誤？"],
      en: ["What state suits me best that day?", "Should I express more or interact naturally?", "How can I reduce nerves and mistakes?"],
    },
  },
  {
    key: "daily",
    category: "concert",
    icon: Eye,
    badge: { "zh-TW": "今日提點", en: "Daily cue" },
    title: { "zh-TW": "今天的追星能量在提醒我什麼？", en: "What Is Today’s Fandom Energy Telling Me?" },
    description: { "zh-TW": "用輕量單牌查看今天適合關注、行動或暫停的方向。", en: "A light one-card cue for what to notice, do, or pause today." },
    bestFor: { "zh-TW": "適合蹲消息、做應援、收物料與當日安排", en: "Best for updates, fan support, content, and today’s plan" },
    placeholder: { "zh-TW": "例如：今天適合蹲物料、做應援，還是先休息？", en: "Example: Should I watch for updates, do fan support, or rest today?" },
    fallbackQuestion: { "zh-TW": "今天的追星能量在提醒我什麼？", en: "What is today’s fandom energy telling me?" },
    unresolved: { "zh-TW": "今天更適合主動參與、留意消息，還是先保留精力？", en: "Is today better for participating, watching for updates, or conserving your energy?" },
    paywallTitle: { "zh-TW": "查看今天的完整追星提點", en: "Unlock Today’s Full Fandom Guidance" },
    cta: { "zh-TW": "解鎖今日完整提點", en: "Unlock Today’s Guidance" },
    benefits: {
      "zh-TW": ["今日追星狀態", "可能出現的小驚喜", "需要留意的消息與情緒", "適合做與不適合做的事", "今天最有利的節奏"],
      en: ["Today’s fandom state", "A possible small surprise", "Updates and emotions to watch", "What to do and avoid", "Your best rhythm today"],
    },
    followups: {
      "zh-TW": ["今天最值得留意哪類消息？", "我今天需要避免什麼消耗？", "今天更適合主動還是休息？"],
      en: ["What kind of update matters today?", "What drain should I avoid today?", "Is today better for action or rest?"],
    },
  },
];

export function getIdolTarotScene(key: IdolSingleReadingType) {
  return IDOL_TAROT_SCENES.find((scene) => scene.key === key) || IDOL_TAROT_SCENES[0];
}

export function getIdolLocale(locale: string): IdolTarotLocale {
  return locale === "en" ? "en" : "zh-TW";
}

type LocalizedZiwei = { name: string; traits: string[]; meaning: string };

const ZIWEI_EN: Record<string, LocalizedZiwei> = {
  ziwei: { name: "Zi Wei", traits: ["leadership", "perspective", "responsibility", "pressure"], meaning: "The situation centers on direction and perspective. Take the wider view instead of reacting to short-term emotion." },
  tianji: { name: "Tian Ji", traits: ["change", "strategy", "insight", "movement"], meaning: "The foundation is changeable. Better information and a flexible plan matter more than forcing immediate progress." },
  taiyang: { name: "Tai Yang", traits: ["visibility", "openness", "initiative", "connection"], meaning: "The situation benefits from clarity and visible action. Straightforward preparation is more useful than guessing." },
  wuqu: { name: "Wu Qu", traits: ["practicality", "resources", "decisiveness", "results"], meaning: "The core issue is practical return, time, and resources. Judge the situation by measurable conditions." },
  tiantong: { name: "Tian Tong", traits: ["ease", "support", "gentleness", "delay"], meaning: "There is room for ease and support, although comfort or delay can cause a useful window to pass." },
  lianzhen: { name: "Lian Zhen", traits: ["complexity", "attraction", "boundaries", "precision"], meaning: "The situation contains mixed motives and boundaries. Clarify what you want before acting." },
  tianfu: { name: "Tian Fu", traits: ["stability", "capacity", "resources", "accumulation"], meaning: "The foundation is steady and favors gradual accumulation rather than a high-risk, all-at-once move." },
  taiyin: { name: "Tai Yin", traits: ["sensitivity", "security", "subtle support", "reflection"], meaning: "The deeper issue concerns emotional security and subtle signals. Careful observation reveals more than urgency." },
  tanlang: { name: "Tan Lang", traits: ["desire", "attraction", "opportunity", "variety"], meaning: "Attraction and opportunity are strong, but too many wants at once can scatter your attention." },
  jumen: { name: "Ju Men", traits: ["questions", "communication", "doubt", "discernment"], meaning: "Unclear information and assumptions are the main source of friction. Verify details before drawing conclusions." },
  tianxiang: { name: "Tian Xiang", traits: ["coordination", "order", "presentation", "planning"], meaning: "Cooperation, presentation, and following the process improve the outcome more than improvisation." },
  tianliang: { name: "Tian Liang", traits: ["protection", "guidance", "resolution", "standards"], meaning: "Rules, experience, or mature guidance can protect the situation and help resolve the current difficulty." },
  qisha: { name: "Qi Sha", traits: ["drive", "risk", "breakthrough", "intensity"], meaning: "The situation has breakthrough energy and visible risk. Move decisively only after the cost is clear." },
  pojun: { name: "Po Jun", traits: ["reset", "disruption", "innovation", "change"], meaning: "The old structure is changing. A reset may be useful, but expecting everything to remain familiar will create friction." },
  zuofu: { name: "Zuo Fu", traits: ["support", "assistance", "allies", "persistence"], meaning: "Practical support is available. Accept help and keep the next step consistent." },
  youbi: { name: "You Bi", traits: ["coordination", "quiet support", "network", "tact"], meaning: "Indirect support and tactful communication can open the situation more effectively than pressure." },
  wenchang: { name: "Wen Chang", traits: ["clarity", "learning", "documents", "structure"], meaning: "Clear information, written details, and organized preparation are the strongest advantages here." },
  wenqu: { name: "Wen Qu", traits: ["expression", "creativity", "appeal", "detail"], meaning: "Expression, aesthetic detail, and creativity can make your effort more noticeable and memorable." },
  lucun: { name: "Lu Cun", traits: ["gain", "stability", "saving", "reward"], meaning: "The situation has tangible value and favors protecting a steady gain rather than chasing a faster result." },
  qingyang: { name: "Qing Yang", traits: ["friction", "obstacle", "impulse", "strain"], meaning: "Hard resistance is present. Pushing impulsively is likely to increase friction and cost." },
  tuoluo: { name: "Tuo Luo", traits: ["delay", "entanglement", "repetition", "drain"], meaning: "Delay and repeated uncertainty are draining the situation. A clear boundary or deadline is needed." },
  huoxing: { name: "Huo Xing", traits: ["urgency", "surprise", "temper", "conflict"], meaning: "Fast-changing conditions require a quick response, but emotional haste can damage the result." },
  lingxing: { name: "Ling Xing", traits: ["hidden drain", "tension", "misunderstanding", "fatigue"], meaning: "The main issue is a quiet accumulation of tension or fatigue that needs to be acknowledged early." },
  tiankui: { name: "Tian Kui", traits: ["visible support", "opportunity", "guidance", "access"], meaning: "A visible opportunity or helpful person can move the situation forward if you actively use the opening." },
  tianyue: { name: "Tian Yue", traits: ["quiet support", "timing", "connection", "assistance"], meaning: "Subtle support and indirect information may provide the useful opening. Stay receptive and tactful." },
};

export function localizeZiweiCard(
  card: { id: string; name: string; traits: string[]; bodyMeaning: string },
  locale: IdolTarotLocale,
): LocalizedZiwei {
  if (locale === "en") return ZIWEI_EN[card.id] || { name: card.id, traits: [], meaning: "This card describes the underlying pattern of the current situation." };
  return { name: card.name, traits: card.traits, meaning: card.bodyMeaning };
}

export function buildIdolFreeResult(params: {
  locale: IdolTarotLocale;
  scene: IdolSceneCopy;
  question: string;
  ziwei: LocalizedZiwei;
  tarot: { name: string; orientation: string; keywords: string[] };
}) {
  const { locale, scene, question, ziwei, tarot } = params;
  if (locale === "en") {
    return {
      headline: `${ziwei.name} sets the underlying pattern while ${tarot.name} ${tarot.orientation.toLowerCase()} shows the immediate movement.`,
      summary: `For “${question},” ${ziwei.name} points to ${ziwei.traits.slice(0, 2).join(" and ")} at the root of the situation. ${tarot.name} ${tarot.orientation.toLowerCase()} adds ${tarot.keywords.slice(0, 2).join(" and ")} to the near-term picture. Together, the cards suggest that the outcome depends less on wishful thinking and more on timing, preparation, and observable feedback.`,
      unresolved: scene.unresolved.en,
      actions: ["Check the practical conditions before increasing your effort.", "Choose one low-cost action that gives you clear feedback."],
    };
  }
  return {
    headline: `${ziwei.name}定下核心格局，${tarot.name}${tarot.orientation}補充近期走向。`,
    summary: `針對「${question}」，${ziwei.name}指出事情根基與${ziwei.traits.slice(0, 2).join("、")}有關；${tarot.name}${tarot.orientation}則帶出${tarot.keywords.slice(0, 2).join("、")}的近期訊號。雙牌合看，結果不只取決於期待，也取決於時機、準備與現實回饋。`,
    unresolved: scene.unresolved["zh-TW"],
    actions: ["先核對現實條件，再決定是否增加投入。", "選擇一個成本低、能得到明確回饋的行動。"],
  };
}

export function buildIdolAiPrompt(params: {
  locale: IdolTarotLocale;
  scene: IdolSceneCopy;
  question: string;
  context?: string;
  ziweiCard: { name: string; traits: string[] };
  tarotCard: { name: string; orientation: string; keywords: string[] };
}) {
  const { locale, scene, question, context, ziweiCard, tarotCard } = params;
  if (locale === "en") {
    return `You are a careful fandom tarot reader. Answer only the user's stated question.\nScene: ${scene.title.en}\nQuestion: ${question}\nOptional context: ${context || "None"}\nZi Wei Tarot (core situation): ${ziweiCard.name}; ${ziweiCard.traits.join(", ")}\nRider-Waite Tarot (emotion and action): ${tarotCard.name}, ${tarotCard.orientation}; ${tarotCard.keywords.join(", ")}\n\nRules:\n1. Treat Zi Wei Tarot as the larger pattern and Rider-Waite as near-term emotion/action. Cross-read them; do not paste two separate card definitions.\n2. Do not claim to know an idol's private thoughts or guarantee real-world outcomes.\n3. Give one clear tendency, the strongest opportunity, the main obstacle, a 30-day trend, and 2 practical actions.\n4. Keep the reading specific to the question and context. Avoid generic spiritual language.\n5. End with: For entertainment and self-reflection only.`;
  }
  return `你是一位克制、熟悉追星場景的專業塔羅解讀師。只回答使用者提出的問題。\n場景：${scene.title["zh-TW"]}\n問題：${question}\n補充背景：${context || "未提供"}\n紫微塔羅（核心局勢）：${ziweiCard.name}；${ziweiCard.traits.join("、")}\n韋特塔羅（情緒與行動）：${tarotCard.name}，${tarotCard.orientation}；${tarotCard.keywords.join("、")}\n\n解讀規則：\n1. 紫微塔羅看整體格局，韋特塔羅看近期情緒與行動，必須交叉解讀，不可分別貼牌義。\n2. 不聲稱知道 Idol 的私人想法，不保證現實事件結果。\n3. 先給明確傾向，再寫最大機會、主要阻礙、未來 30 天趨勢與 2 條可執行建議。\n4. 全程緊扣問題與背景，禁止通用靈性套話。\n5. 結尾標注：內容僅供娛樂與自我探索參考。`;
}
