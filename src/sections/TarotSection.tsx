import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Loader2, Unlock, Lock, Check, CreditCard, X, ShieldCheck, Heart, MapPin, Music, Mail, Send, UserPlus, Share2 } from "lucide-react";
import { PAYMENT_COMING_SOON, TEST_MODE } from "@/const";
import { trpc } from "@/providers/trpc";
import { TAROT_CARDS, FREE_READING_LIMIT, UNLOCK_PRICE } from "@/data/tarotCards";
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal";
import { getIdolSceneReading, getMajorScene } from "@/data/idolTarotScenes";
import { getShareLink, getShareText } from "@/lib/share-points";
import { generateAIReading } from "@/lib/tarot-ai-reader";
import type { CardReading } from "@/lib/tarot-ai-reader";
import SubscriptionCard from "@/components/SubscriptionCard";
import { detectIdolScenario, type TarotScenarioKey } from "@/data/tarotScenarioScripts";
import { buildDualReading, detectDualScene, drawZiweiCard, type DualReading, type ZiweiCard } from "@/data/ziweiTarot";
import { PaidReadingConversion } from "@/features/paid-reading/PaidReadingConversion";
import { detectPaidReadingScene, getPaidReadingPlan, SCENE_COPY } from "@/features/paid-reading/config";
import { trackEvent } from "@/lib/analytics";
import { addReportHistory } from "@/lib/report-history";
import { getPaymentOrders } from "@/lib/payment";
import { localizedText } from "@/lib/chinese";
import { IdolFullReportContent, IdolPaidReading } from "@/features/idol-tarot/IdolPaidReading";
import {
  IDOL_TAROT_SCENES,
  buildIdolAiPrompt,
  buildIdolFreeResult,
  getIdolLocale,
  getIdolTarotScene,
  localizeZiweiCard,
  type IdolSingleReadingType,
} from "@/features/idol-tarot/config";

const IDOL_UNLOCK_PRICE = 5.99;
const PREVIEW_FULL_TAROT = false;
const TAROT_ANALYSIS_COMING_SOON = true;
const LAST_TAROT_RESULT_KEY = "r7_last_tarot_result_v2";

type TarotSpreadKey = "one" | "three" | "five";
type ClassicQuickReadingType = "yes-no" | "daily-guidance";

type IdolOneCardPrompt = {
  key: IdolSingleReadingType;
  icon: typeof Sparkles;
  category: string;
  labelZh: string;
  labelEn: string;
  descZh: string;
  descEn: string;
  questionZh: string;
  questionEn: string;
};

type ClassicQuickPrompt = {
  key: ClassicQuickReadingType;
  icon: typeof Sparkles;
  labelZh: string;
  labelEn: string;
  descZh: string;
  descEn: string;
  questionZh: string;
  questionEn: string;
};

type TarotSpread = {
  key: TarotSpreadKey;
  count: 1 | 3 | 5;
  labelZh: string;
  labelEn: string;
  descZh: string;
  descEn: string;
  bestForZh: string;
  bestForEn: string;
  positionsZh: string[];
  positionsEn: string[];
};

const CLASSIC_SPREADS: TarotSpread[] = [
  {
    key: "one",
    count: 1,
    labelZh: "單張指引",
    labelEn: "One-Card Signal",
    descZh: "快速抓重點，適合今天該不該做、對方現在態度、當下提醒。",
    descEn: "Fast clarity for yes/no-ish questions, today’s advice, or someone’s current attitude.",
    bestForZh: "當下建議 / 快速判斷 / 今日運勢",
    bestForEn: "Quick advice / current answer / daily guidance",
    positionsZh: ["核心答案"],
    positionsEn: ["Core Answer"],
  },
  {
    key: "three",
    count: 3,
    labelZh: "三張走勢",
    labelEn: "Three-Card Flow",
    descZh: "適合大多數問題，看過去影響、當前狀態和下一步趨勢。",
    descEn: "Best for most questions: past influence, current state, and next movement.",
    bestForZh: "感情走勢 / 事業選擇 / 近期變化",
    bestForEn: "Relationship trend / career choice / near-future shift",
    positionsZh: ["過去影響", "當前狀態", "未來趨勢"],
    positionsEn: ["Past Influence", "Current State", "Future Trend"],
  },
  {
    key: "five",
    count: 5,
    labelZh: "五張深問",
    labelEn: "Five-Card Deep Spread",
    descZh: "適合複雜問題，拆開看現狀、阻礙、隱藏因素、建議和結果。",
    descEn: "For layered questions: situation, obstacle, hidden factor, advice, and outcome.",
    bestForZh: "復合 / 長期關係 / 跳槽 / 財運規劃",
    bestForEn: "Reconciliation / long-term love / job change / money planning",
    positionsZh: ["問題現狀", "主要阻礙", "隱藏影響", "行動建議", "趨勢結果"],
    positionsEn: ["Situation", "Obstacle", "Hidden Factor", "Advice", "Likely Outcome"],
  },
];

const IDOL_SPREADS: TarotSpread[] = [
  {
    key: "one",
    count: 1,
    labelZh: "追星即時籤",
    labelEn: "Fan Moment Signal",
    descZh: "一鍵抽牌看近期追星運勢、臨場小提示、Yes or No 和當日小運。",
    descEn: "For one quick fan question: should I try, should I post, is there a small surprise?",
    bestForZh: "近期追星運勢 / 臨場小提示 / Yes or No / 當日小運",
    bestForEn: "Quick fan luck / same-day advice / instant cue",
    positionsZh: ["即時答案"],
    positionsEn: ["Fan Signal"],
  },
  {
    key: "three",
    count: 3,
    labelZh: "三張現場運",
    labelEn: "Three-Card Event Flow",
    descZh: "適合簽售、演唱會、抽座這類現場問題，看準備、現場和結果。",
    descEn: "For fansign, concert, seat lottery: preparation, on-site energy, and result.",
    bestForZh: "簽售 / 演唱會 / 搶票 / 抽位置",
    bestForEn: "Fansign / concert / ticketing / seat lottery",
    positionsZh: ["準備能量", "現場變量", "最終體驗"],
    positionsEn: ["Preparation", "On-Site Energy", "Final Experience"],
  },
  {
    key: "five",
    count: 5,
    labelZh: "五張追星全景",
    labelEn: "Five-Card Idol Panorama",
    descZh: "適合愛豆回歸、事業走勢、隱藏行程和粉絲互動的深度問題。",
    descEn: "For comeback, career momentum, hidden schedules, and fan interaction questions.",
    bestForZh: "回歸動向 / 事業上升 / 團隊資源 / 粉絲互動",
    bestForEn: "Comeback / career rise / team resources / fan interaction",
    positionsZh: ["當前氣場", "機會窗口", "隱藏阻力", "粉絲行動", "後續走向"],
    positionsEn: ["Current Energy", "Opportunity", "Hidden Block", "Fan Action", "Next Trend"],
  },
];

function getSpread(spreads: TarotSpread[], key: TarotSpreadKey) {
  return spreads.find((spread) => spread.key === key) || spreads[1];
}

function isIdolRelatedQuestion(question: string) {
  const trimmed = question.trim();
  if (!trimmed) return true;
  return /爱豆|愛豆|偶像|追星|饭圈|飯圈|签售|簽售|握手|抢票|搶票|票务|票務|演唱会|演唱會|应援|應援|回归|回歸|物料|小卡|抽卡|周边|周邊|专辑|專輯|舞台|打歌|站姐|饭拍|飯拍|接机|接機|机场|機場|入场|入場|座位|排位|名额|名額|中签|中籤|抽选|抽選|idol|kpop|fan|fansign|concert|ticket|comeback|album|photocard|merch|stage|queue|seat|event/i.test(trimmed);
}

function getCardKeywords(card: typeof TAROT_CARDS[0] & { reversed: boolean }, locale: string) {
  const base = card.reversed
    ? [locale === "en" ? "delay" : "延迟", locale === "en" ? "blocked signal" : "卡点", locale === "en" ? "needs adjustment" : "需要调整"]
    : [locale === "en" ? "opening" : "机会", locale === "en" ? "flow" : "推进", locale === "en" ? "visible signal" : "信号清晰"];
  if (card.suit === "cups") return locale === "en" ? ["emotion", "support", ...base] : ["情绪", "互动", ...base];
  if (card.suit === "wands") return locale === "en" ? ["action", "speed", ...base] : ["行动", "热度", ...base];
  if (card.suit === "swords") return locale === "en" ? ["information", "rules", ...base] : ["信息", "规则", ...base];
  if (card.suit === "pentacles") return locale === "en" ? ["resources", "result", ...base] : ["资源", "结果", ...base];
  return locale === "en" ? ["turning point", "theme", ...base] : ["转折", "主线", ...base];
}

function getCardPolarity(card: typeof TAROT_CARDS[0]) {
  const positiveIds = new Set([0, 1, 3, 6, 9, 10, 14, 17, 19, 21, 23, 24, 25, 27, 28, 32, 33, 35, 36, 40, 41, 43, 44, 46, 47, 49, 50, 53, 54, 57, 58, 59, 60, 61, 62, 64, 67, 68, 69, 70, 72, 73, 75, 76, 77]);
  const negativeIds = new Set([12, 13, 15, 16, 18, 31, 34, 37, 38, 39, 45, 48, 51, 52, 55, 56, 63, 65, 66, 71, 74]);
  if (positiveIds.has(card.id)) return "positive";
  if (negativeIds.has(card.id)) return "negative";
  return "neutral";
}

function buildIdolSingleReading({
  card,
  type,
  question,
  locale,
}: {
  card: typeof TAROT_CARDS[0] & { reversed: boolean };
  type: IdolSingleReadingType;
  question: string;
  locale: "zh-TW" | "zh" | "en";
}) {
  const isEn = locale === "en";
  const q = question.trim();
  const cardName = isEn ? card.name : card.nameCn;
  const orientation = isEn ? (card.reversed ? "reversed" : "upright") : (card.reversed ? "逆位" : "正位");
  const keywords = getCardKeywords(card, locale).slice(0, 3).join(isEn ? ", " : "、");
  const topic = q || (isEn ? "your idol/fandom question" : "你的追星问题");
  const suitCue = card.suit === "swords"
    ? (isEn ? "rules, messages, timing, and platform details matter most" : "重点在规则、消息、时间点和平台细节")
    : card.suit === "cups"
    ? (isEn ? "emotion, interaction, and fan atmosphere are the key signals" : "重点在情绪、互动和现场氛围")
    : card.suit === "wands"
    ? (isEn ? "action speed, heat, and competition decide the outcome" : "重点在行动速度、热度和竞争强度")
    : card.suit === "pentacles"
    ? (isEn ? "resources, budget, queue, and practical preparation matter" : "重点在资源、预算、排位和实际准备")
    : (isEn ? "this is a bigger turning-point signal, so do not treat it casually" : "这是一个偏主线的转折信号，不适合随手应付");

  if (type === "yes-no") {
    const polarity = getCardPolarity(card);
    const answer = polarity === "positive"
      ? (card.reversed ? (isEn ? "Leaning No" : "偏向否") : (isEn ? "Yes" : "是"))
      : polarity === "negative"
      ? (card.reversed ? (isEn ? "Leaning Yes" : "偏向是") : (isEn ? "No" : "否"))
      : (card.reversed ? (isEn ? "Leaning No" : "偏向否") : (isEn ? "Leaning Yes" : "偏向是"));
    const basis = isEn
      ? `${cardName} ${orientation} carries ${keywords}. For "${topic}", the card points to ${suitCue}; the answer is not based on wishful thinking, but on whether the current conditions are open enough.`
      : `${cardName}${orientation}的核心关键词是「${keywords}」。放到「${topic}」里看，${suitCue}；这张牌不是看你想不想冲，而是看当前条件是否真的打开。`;
    const tip = isEn
      ? (answer.includes("No") ? "Pause and verify rules, timing, and backup route before acting." : "Take one clean action now, but keep a backup option ready.")
      : (answer.includes("否") ? "先暂停一下，把规则、时间点和备选方案确认清楚再行动。" : "可以推进一个明确动作，但不要把所有希望压在单一路径上。");
    return {
      title: isEn ? "Yes / No Idol Tarot" : "Yes or No 是非判断",
      lines: [
        `✅ ${isEn ? "Answer" : "结论"}：${answer}`,
        `📌 ${isEn ? "Basis" : "判断依据"}：${basis}`,
        `💡 ${isEn ? "Tip" : "小提示"}：${tip}`,
        isEn ? "*For entertainment reference only" : "*内容仅供娱乐参考",
      ],
    };
  }

  if (type === "fan-luck") {
    return {
      title: isEn ? "Near-Term Idol Luck" : "近期追星运势",
      lines: [
        `🌟 ${isEn ? "Overall" : "近期追星运势总评"}：${isEn ? `${cardName} ${orientation} says the next 7-14 days are shaped by ${keywords}.` : `${cardName}${orientation}显示，未来7-14天的追星节奏会围绕「${keywords}」展开。`}`,
        `✨ ${isEn ? "Good chance" : "好运机遇"}：${isEn ? `Watch moments where ${suitCue}; small updates, ticket windows, or fan-content timing can be useful.` : `可以重点留意${suitCue}的场景；物料更新、票务窗口、站内互动或小卡相关机会更容易给你反馈。`}`,
        `⚠️ ${isEn ? "Watch out" : "注意避雷"}：${card.reversed ? (isEn ? "Do not rush because of anxiety; reversed energy makes mistakes easier." : "不要因为焦虑硬冲，逆位能量容易让你在细节上出错。") : (isEn ? "Do not over-read every signal; keep your plan simple." : "不要把每个风吹草动都过度解读，计划越简单越稳。")}`,
        `💡 ${isEn ? "Action" : "行动建议"}：${isEn ? "Pick one fandom task worth doing and finish it cleanly." : "挑一件最值得做的追星任务完成好，比同时蹲很多入口更有效。"}`,
        isEn ? "*For entertainment reference only" : "*内容仅供娱乐参考",
      ],
    };
  }

  if (type === "live-tip") {
    return {
      title: isEn ? "On-Site Tip" : "临场小提示",
      lines: [
        `🎯 ${isEn ? "On-site tips" : "临场提示"}`,
        `1. ${isEn ? "Do more" : "加分做法"}：${isEn ? `Use ${cardName} ${orientation} as a cue: prepare around ${keywords}, especially where ${suitCue}.` : `按${cardName}${orientation}的提示，把「${keywords}」先准备好，尤其要处理好${suitCue}这一块。`}`,
        `2. ${isEn ? "Avoid" : "需要避开"}：${card.reversed ? (isEn ? "Avoid last-minute changes and emotional decisions." : "避开临时改计划和情绪化决定。") : (isEn ? "Avoid overpacking the plan; leave room for venue changes." : "避开把行程排得太满，给现场变化留一点空间。")}`,
        `3. ${isEn ? "Mindset" : "心态建议"}：${isEn ? "Go in with a clear priority: safety, entry, then interaction." : "进场前只抓一个优先级：安全、入场，再到互动体验。"}`,
        isEn ? "*For entertainment reference only" : "*内容仅供娱乐参考",
      ],
    };
  }

  return {
    title: isEn ? "Daily Idol Cue" : "当日小运",
    lines: [
      `🌙 ${isEn ? "Daily idol cue" : "今日追星小运"}`,
      `${isEn ? "Today" : "今日状态"}：${isEn ? `${cardName} ${orientation} makes today a ${keywords} kind of day.` : `${cardName}${orientation}让今天的追星状态落在「${keywords}」上。`}`,
      `${isEn ? "Small surprise" : "小惊喜"}：${isEn ? `You may catch a useful update if you watch ${suitCue}.` : `如果你留意${suitCue}，有机会捕捉到一个对你有用的小信号。`}`,
      `${isEn ? "Reminder" : "小提醒"}：${card.reversed ? (isEn ? "Do not react too fast to incomplete news." : "不要对不完整消息反应太快。") : (isEn ? "Keep it light and enjoy the small moment." : "轻松一点，今天更适合享受小确幸。")}`,
      isEn ? "*For entertainment reference only" : "*内容仅供娱乐参考",
    ],
  };
}

// ===== AI 塔羅私域升級組件 =====
function AITarotUpgrade({ locale }: { locale: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isZh = locale === "zh-TW";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Save to localStorage + could send to backend
    const leads = JSON.parse(localStorage.getItem("r7_tarot_leads") || "[]");
    leads.push({ email: email.trim(), date: new Date().toISOString() });
    localStorage.setItem("r7_tarot_leads", JSON.stringify(leads));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-3">
        <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-[#f0e6d3]">
          {isZh ? "預約已提交！我們將在 24 小時內發送深度解讀報告至你的郵箱" : "Submitted! Full reading will be sent to your inbox within 24 hours"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isZh ? "輸入你的郵箱地址" : "Enter your email"}
            className="w-full bg-[#151520] border border-[#c99aa618] rounded-lg pl-8 pr-3 py-2.5 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#c99aa644]"
          />
        </div>
        <button
          type="submit"
          disabled={!email.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-[#c99aa6] to-[#FF8FA8] text-[#0a0a0f] rounded-lg text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          {PAYMENT_COMING_SOON ? (isZh ? "即將上線" : "Coming Soon") : (isZh ? "預約 $29.90" : "Book $29.90")}
        </button>
      </div>
      <p className="text-[9px] text-[#8a8aad33] text-center">
        {PAYMENT_COMING_SOON
          ? (isZh ? "專業占星師 1v1 深度解讀籌備中 · 可先留下郵箱等待通知" : "Professional 1v1 deep reading is preparing · Leave your email for updates")
          : (isZh ? "專業占星師 1v1 深度解讀 · 完整報告發送至郵箱 · 24 小時內送達" : "Professional 1v1 deep reading · Full report via email · Delivered within 24h")}
      </p>
    </form>
  );
}

function TarotPaymentModal({
  isOpen, onClose, onPaid, amount,
}: { isOpen: boolean; onClose: () => void; onPaid: () => void; amount: number }) {
  const { t } = useI18n();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setPaid(true); setTimeout(() => { onPaid(); setPaid(false); onClose(); }, 600); }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#b99a6220] shadow-2xl animate-fade-in-up">
        {paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4 border border-green-400/20"><Check className="w-8 h-8 text-green-400" /></div>
            <h3 className="font-display text-lg font-bold text-[#f0e6d3] mb-1">{t("tarot.unlockSuccess")}</h3>
            <p className="text-xs text-[#8a8aad]">{t("tarot.fullReadingUnlocked")}</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors"><X className="w-4 h-4" /></button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#b99a6210] flex items-center justify-center mx-auto mb-3 border border-[#b99a6220]"><Lock className="w-6 h-6 text-[#b99a62]" /></div>
              <h3 className="font-display text-lg font-bold text-[#f0e6d3]">{t("tarot.unlockTitle")}</h3>
              <p className="text-xs text-[#8a8aad] mt-1">{t("tarot.unlockDesc")}</p>
            </div>
            <div className="bg-[#151520] rounded-lg p-4 mb-5 border border-[#b99a6208]">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-[#8a8aad]">{t("tarot.serviceContent")}</span><span className="text-xs text-[#f0e6d3]">{t("tarot.threeCardReading")}</span></div>
              <div className="flex items-center justify-between mb-3"><span className="text-xs text-[#8a8aad]">{t("tarot.includes")}</span><span className="text-xs text-[#8a8aad55]">{t("tarot.includesDesc")}</span></div>
              <div className="border-t border-[#b99a6206] pt-3 flex items-center justify-between"><span className="text-sm text-[#f0e6d3] font-medium">{t("tarot.total")}</span><span className="text-2xl font-display font-bold text-[#b99a62]">${amount.toFixed(2)}</span></div>
            </div>
            <div className="space-y-2 mb-5">
              {["WeChat Pay", "Alipay"].map(m => (
                <button key={m} className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#b99a6215] hover:border-[#b99a6240] transition-colors text-left"><CreditCard className="w-4 h-4 text-[#b99a62]" /><span className="text-xs text-[#f0e6d3]">{m}</span></button>
              ))}
            </div>
            <button onClick={handlePay} disabled={paying} className="w-full py-3 bg-gradient-to-r from-[#b99a62] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#b99a62] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {t("tarot.confirmPay")}{amount.toFixed(2)}
            </button>
            <p className="text-center text-[10px] text-[#8a8aad33] mt-3">{t("tarot.securePay")}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ShuffleAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 400; const h = 300;
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.scale(2, 2);

    const cardW = 60; const cardH = 90;
    const cards: { x: number; y: number; rot: number; vx: number; vy: number; vr: number; phase: number }[] = [];
    for (let i = 0; i < 30; i++) {
      cards.push({ x: w / 2 + (Math.random() - 0.5) * 300, y: h / 2 + (Math.random() - 0.5) * 200, rot: Math.random() * 360, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, vr: (Math.random() - 0.5) * 8, phase: Math.random() * Math.PI * 2 });
    }

    let frame = 0; const totalFrames = 140; let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const progress = frame / totalFrames;
      const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.85 ? (1 - progress) / 0.15 : 1;

      for (const c of cards) {
        const settleFactor = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3);
        c.x += c.vx * settleFactor + Math.sin(frame * 0.05 + c.phase) * 2;
        c.y += c.vy * settleFactor + Math.cos(frame * 0.05 + c.phase) * 2;
        c.rot += c.vr * settleFactor;

        const grad = ctx.createLinearGradient(c.x - cardW / 2, c.y, c.x + cardW / 2, c.y);
        grad.addColorStop(0, `rgba(212, 168, 83, ${0.3 * alpha})`);
        grad.addColorStop(0.5, `rgba(20, 20, 42, ${0.7 * alpha})`);
        grad.addColorStop(1, `rgba(212, 168, 83, ${0.2 * alpha})`);

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = grad;
        ctx.strokeStyle = `rgba(212, 168, 83, ${0.5 * alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = `rgba(212, 168, 83, ${0.3 * alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(-cardW / 4, -cardH / 3); ctx.lineTo(cardW / 4, cardH / 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cardW / 4, -cardH / 3); ctx.lineTo(-cardW / 4, cardH / 3); ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = `rgba(240, 230, 211, ${alpha})`;
      ctx.font = "14px 'Playfair Display', serif";
      ctx.textAlign = "center";
      const stage = progress < 0.3 ? "✦" : progress < 0.7 ? "✦ ✦" : "✦ ✦ ✦";
      ctx.fillText(stage, w / 2, h / 2 + 60);

      frame++;
      if (frame < totalFrames) { raf = requestAnimationFrame(draw); } else { onComplete(); }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return <canvas ref={canvasRef} className="mx-auto rounded-xl" style={{ width: 400, height: 300 }} />;
}

function ScriptBlock({
  title,
  shortText,
  detailedText,
  locale,
  accent = false,
}: {
  title: string;
  shortText: string;
  detailedText: string;
  locale: "zh-TW" | "zh" | "en";
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? "bg-[#b99a6210] border-[#b99a6228]" : "bg-[#151520]/86 border-[#b99a6214]"}`}>
      <p className="text-sm font-bold text-[#d1b06f] mb-2 tracking-[0.04em]">{title}</p>
      <p className="text-sm text-[#f5ead7] leading-7">{shortText}</p>
      <p className="mt-2 text-sm text-[#aaa6c8] leading-7">{detailedText}</p>
    </div>
  );
}

function buildSpreadSummary({
  cards,
  readings,
  labels,
  locale,
  question,
}: {
  cards: Array<typeof TAROT_CARDS[0] & { reversed: boolean }>;
  readings: CardReading[];
  labels: string[];
  locale: "zh-TW" | "zh" | "en";
  question: string;
}) {
  const isZh = locale !== "en";
  const q = question.trim();
  const shortQuestion = q ? `「${q.slice(0, 26)}${q.length > 26 ? "..." : ""}」` : (isZh ? "這個問題" : "this question");
  const reversedCount = cards.filter((card) => card.reversed).length;
  const cardTrail = cards.map((card) => `${card.nameCn}${card.reversed ? (isZh ? "逆位" : " R") : ""}`).join(" → ");
  const title = cards.length === 1
    ? (isZh ? "單張牌核心答案" : "One-Card Core Answer")
    : cards.length === 3
    ? (isZh ? "三張牌整體脈絡" : "Three-Card Storyline")
    : (isZh ? "五張牌完整結論" : "Five-Card Full Pattern");

  if (cards.length === 1) {
    return {
      title,
      lead: isZh
        ? `${cardTrail} 直接回答 ${shortQuestion}。先看結論，再看行動。`
        : `${cardTrail} answers ${shortQuestion}. Read the verdict first, then act.`,
      bullets: [
        isZh ? `牌面訊號：${readings[0]?.heart.plain || "先看清當下，再決定下一步。"}` : `Signal: ${readings[0]?.heart.plain || "Read the present clearly before moving."}`,
        isZh ? `下一步：${readings[0]?.advice || "先做一個小而穩的選擇。"}` : `Next step: ${readings[0]?.advice || "Take one small steady step."}`,
      ],
      conclusion: isZh
        ? "一句話：不要把問題想散，先按牌面給出的單一步驟處理。"
        : "Bottom line: keep it focused and follow the single step shown by the card.",
    };
  }

  if (cards.length === 3) {
    return {
      title,
      lead: isZh
        ? `${shortQuestion} 的走向是：${cardTrail}。重點看「前因 → 現狀 → 下一步」是否能接上。`
        : `The line for ${shortQuestion}: ${cardTrail}. Read it as cause → now → next move.`,
      bullets: cards.map((card, idx) => {
        const label = labels[idx] || (isZh ? `第 ${idx + 1} 張` : `Card ${idx + 1}`);
        const point = idx === 0
          ? (isZh ? "前因" : "Cause")
          : idx === 1
          ? (isZh ? "現狀" : "Now")
          : (isZh ? "下一步" : "Next");
        return isZh
          ? `${label}｜${point}：${card.nameCn}${card.reversed ? "逆位" : "正位"}，${readings[idx]?.future.plain || readings[idx]?.heart.plain || ""}`
          : `${label} | ${point}: ${card.name} ${card.reversed ? "reversed" : "upright"}, ${readings[idx]?.future.plain || readings[idx]?.heart.plain || ""}`;
      }),
      conclusion: isZh
        ? reversedCount >= 2
          ? "結論：先不要衝。卡點比機會更明顯，等訊息或回應更清楚再動。"
          : "結論：可以小步推進。先做低風險試探，再看現實反饋。"
        : reversedCount >= 2
        ? "Verdict: do not rush. The blocks are louder than the opening."
        : "Verdict: move in small steps and let real feedback decide.",
    };
  }

  return {
    title,
    lead: isZh
      ? `${shortQuestion} 的完整脈絡是：${cardTrail}。五張牌只看現狀、阻礙、隱藏點、行動和結果。`
      : `The full pattern for ${shortQuestion}: ${cardTrail}. Five cards read situation, block, hidden factor, action, and result.`,
    bullets: cards.map((card, idx) => {
      const label = labels[idx] || (isZh ? `第 ${idx + 1} 張` : `Card ${idx + 1}`);
      const layer = [
        isZh ? "現狀" : "Situation",
        isZh ? "阻礙" : "Block",
        isZh ? "隱藏點" : "Hidden factor",
        isZh ? "行動" : "Action",
        isZh ? "結果" : "Result",
      ][idx] || "";
      return isZh
        ? `${label}｜${layer}：${card.nameCn}${card.reversed ? "逆位" : "正位"}，${readings[idx]?.advice || readings[idx]?.future.plain || ""}`
        : `${label} | ${layer}: ${card.name} ${card.reversed ? "reversed" : "upright"}, ${readings[idx]?.advice || readings[idx]?.future.plain || ""}`;
    }),
    conclusion: isZh
      ? reversedCount >= 3
        ? "結論：現在不是硬推局。先處理阻礙和隱藏點，結果才會鬆動。"
        : "結論：有推進空間，但要按行動牌的小步驟走，不靠一次翻盤。"
      : reversedCount >= 3
      ? "Verdict: do not force it. Work through the block and hidden factor first."
      : "Verdict: there is room to move, but only through the action card step by step.",
  };
}

function isYesNoQuestion(question: string) {
  return /yes\s*or\s*no|yes\/no|能不能|能成|會不會|会不会|可不可以|該不該|该不该|要不要|是否|能否|會成功|会成功|should|will|can|whether/i.test(question);
}

function getYesNoAnswer(card: typeof TAROT_CARDS[0] & { reversed: boolean }, question: string, locale: "zh-TW" | "zh" | "en") {
  const isZh = locale !== "en";
  const name = card.name.toLowerCase();
  const cnName = card.nameCn;
  const strongYes = [
    "the magician", "the empress", "the emperor", "the lovers", "the chariot", "strength",
    "wheel of fortune", "temperance", "the star", "the sun", "judgement", "the world",
    "ace of cups", "two of cups", "three of cups", "six of cups", "nine of cups", "ten of cups",
    "ace of wands", "six of wands", "ace of pentacles", "ten of pentacles",
  ];
  const strongNo = [
    "the hanged man", "death", "the devil", "the tower", "the moon",
    "three of swords", "five of cups", "seven of swords", "eight of swords", "nine of swords", "ten of swords",
    "five of pentacles", "five of wands", "ten of wands", "four of cups", "eight of cups",
  ];
  const softYes = [
    "the fool", "the high priestess", "justice", "page", "knight", "queen", "king",
    "two of wands", "three of wands", "four of wands", "eight of wands",
    "three of pentacles", "six of pentacles", "eight of pentacles", "nine of pentacles",
  ];
  const softNo = ["the hermit", "seven of cups", "two of swords", "four of swords", "two of pentacles", "four of pentacles"];
  let score = 0;
  if (strongYes.some((item) => name.includes(item))) score = 2;
  else if (softYes.some((item) => name.includes(item))) score = 1;
  else if (strongNo.some((item) => name.includes(item))) score = -2;
  else if (softNo.some((item) => name.includes(item))) score = -1;
  else score = card.keywordsZh.some((word) => /成功|和谐|和諧|胜利|勝利|丰盛|豐盛|机会|機會|成长|成長|喜悦|喜悅/.test(word)) ? 1 : 0;

  if (card.reversed) score -= score > 0 ? 2 : 1;
  const isYes = score > 0;
  const confidence = Math.abs(score) >= 2 ? (isZh ? "高" : "High") : (isZh ? "中等" : "Medium");
  const answer = isYes ? "YES" : "NO";
  const cardMeaning = isZh
    ? (card.reversed ? card.meaningReversedZh : card.meaningUprightZh)
    : (card.reversed ? card.meaningReversedEn : card.meaningUprightEn);
  const cardSignal = cardMeaning.split(isZh ? "。" : ".")[0] || cardMeaning;
  const direction = isYes
    ? (isZh ? "牌面支持这件事继续推进" : "the card supports moving forward")
    : (isZh ? "牌面不支持现在强行推进" : "the card does not support forcing it now");
  const reason = isZh
    ? `${cnName}${card.reversed ? "逆位" : "正位"}给出的倾向是 ${answer}。它回应的是「${question}」：${direction}。牌面原因是：${cardSignal}。`
    : `${card.name} ${card.reversed ? "reversed" : "upright"} gives a ${answer}. For "${question}", ${direction}. Card signal: ${cardSignal}.`;
  const action = isYes
    ? (isZh ? "可以行动，但不要一次押满；先做一个低风险推进，观察现实反馈。" : "Move, but do not overcommit; take one low-risk step and watch the response.")
    : (isZh ? "先不要硬冲。等条件、回应或信息更清楚后再决定下一步。" : "Do not push now. Wait until conditions, response, or information becomes clearer.");
  return { answer, confidence, reason, action, isYes };
}

function firstSentence(text: string) {
  const clean = (text || "").trim();
  const match = clean.match(/^.*?[。.!?！？]/);
  return (match?.[0] || clean).replace(/\s+/g, " ").trim();
}

function getCompactCardPreview({
  card,
  question,
  locale,
  mode,
  category,
}: {
  card: typeof TAROT_CARDS[0] & { reversed: boolean };
  question: string;
  locale: "zh-TW" | "zh" | "en";
  mode: "classic" | "idol";
  category?: string | null;
}) {
  const isZh = locale !== "en";
  const q = question.trim();
  const questionLabel = q
    ? (isZh ? `「${q.slice(0, 22)}${q.length > 22 ? "..." : ""}」` : `"${q.slice(0, 38)}${q.length > 38 ? "..." : ""}"`)
    : (isZh ? "這個問題" : "this question");

  if (cardsNeedYesNo(card, q)) {
    const yesNo = getYesNoAnswer(card, q, locale);
    return isZh
      ? `${yesNo.answer}｜${card.nameCn}${card.reversed ? "逆位" : "正位"}給 ${questionLabel} 的答案是：${yesNo.isYes ? "可以推進，但要低風險試探。" : "先不要硬衝，等條件更清楚。"}`
      : `${yesNo.answer} | ${card.name} ${card.reversed ? "reversed" : "upright"} answers ${questionLabel}: ${yesNo.isYes ? "move with a low-risk test." : "do not force it yet."}`;
  }

  if (mode === "idol" && category) {
    const sceneKey = category === "concert" ? "concert" : category === "fansign" ? "fansign" : "career";
    const major = getMajorScene(card.id, sceneKey as any, card.reversed);
    const raw = major ? (locale === "zh-TW" ? major.freeZh : major.freeEn) : (() => {
      const gen = getIdolSceneReading(card.id, sceneKey as any, card.reversed, false);
      return locale === "zh-TW" ? gen.zh : gen.en;
    })();
    const line = firstSentence(raw);
    return isZh
      ? `針對 ${questionLabel}：${line}`
      : `For ${questionLabel}: ${line}`;
  }

  const raw = card.reversed
    ? (isZh ? card.meaningReversedZh : card.meaningReversedEn)
    : (isZh ? card.meaningUprightZh : card.meaningUprightEn);
  const line = firstSentence(raw);
  return isZh
    ? `針對 ${questionLabel}：${line}`
    : `For ${questionLabel}: ${line}`;
}

function cardsNeedYesNo(card: typeof TAROT_CARDS[0] & { reversed: boolean }, question: string) {
  return Boolean(card) && isYesNoQuestion(question);
}

function ClassicAIReading({
  cards,
  question,
  locale,
  spread,
  scenarioOverride,
}: {
  cards: Array<typeof TAROT_CARDS[0] & { reversed: boolean }>;
  question: string;
  locale: "zh-TW" | "zh" | "en";
  spread: TarotSpread;
  scenarioOverride?: TarotScenarioKey;
}) {
  const isZh = locale !== "en";
  const isTraditional = locale === "zh-TW";
  const positionLabels = locale === "en" ? spread.positionsEn : spread.positionsZh;
  const reading = generateAIReading(
    cards.map(c => ({ card: c as any, reversed: c.reversed })),
    question, locale, scenarioOverride, positionLabels
  );
  const spreadSummary = buildSpreadSummary({
    cards,
    readings: reading.cards,
    labels: positionLabels,
    locale,
    question,
  });
  const yesNo = cards.length === 1 && isYesNoQuestion(question)
    ? getYesNoAnswer(cards[0], question, locale)
    : null;
  const focusLabel = yesNo
    ? (isZh ? "Yes or No 直答" : "Yes or No Answer")
    : reading.scenario.label;

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-[#b99a6230] bg-[#0f0f18]/94 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#b99a6214] pb-3">
          <div>
            <p className="text-[10px] text-[#8a8aad88] tracking-[0.22em] uppercase">
              {isZh ? (isTraditional ? "本次問題方向" : "本次问题方向") : "Reading Focus"}
            </p>
            <h5 className="font-display text-2xl font-bold text-[#f7d9a8] mt-1">{focusLabel}</h5>
            <p className="text-xs text-[#8a8aad] mt-1">
              {locale === "en" ? spread.labelEn : spread.labelZh} · {spread.count} {locale === "en" ? "cards" : "张牌"}
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-[#b99a62]" />
        </div>
      </div>

      {yesNo && (
        <div className={`overflow-hidden rounded-[24px] border-2 p-5 sm:p-6 ${
          yesNo.isYes
            ? "border-emerald-300/35 bg-gradient-to-br from-emerald-300/14 via-[#10101b]/96 to-[#08080f]/96"
            : "border-rose-300/35 bg-gradient-to-br from-rose-300/14 via-[#10101b]/96 to-[#08080f]/96"
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b99a62]">
                {isZh ? "YES / NO 直答" : "YES / NO ANSWER"}
              </p>
              <h5 className="mt-1 font-display text-5xl font-black text-[#f7ecd8]">
                {yesNo.answer}
              </h5>
            </div>
            <span className="w-fit rounded-full border border-[#f0e6d333] bg-[#f0e6d30d] px-4 py-2 text-sm font-bold text-[#f0e6d3]">
              {isZh ? "信號強度" : "Signal"}：{yesNo.confidence}
            </span>
          </div>
          <p className="mt-4 text-[15px] font-semibold leading-8 text-[#f0e6d3]">{yesNo.reason}</p>
          <p className="mt-3 rounded-2xl border border-[#f0e6d31c] bg-[#08080f]/58 px-4 py-3 text-sm leading-7 text-[#d8d2ec]">
            {yesNo.action}
          </p>
        </div>
      )}

      <div className="rounded-[24px] border-2 border-[#b99a6230] bg-gradient-to-br from-[#17131c]/96 via-[#10101b]/96 to-[#090911]/96 p-5 sm:p-6 shadow-[0_16px_42px_rgba(0,0,0,0.22)]">
        <div className="mb-4 flex flex-col gap-2 border-b border-[#b99a6218] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#b99a62] uppercase">
              {isZh ? "SPREAD SUMMARY" : "SPREAD SUMMARY"}
            </p>
            <h5 className="mt-1 font-display text-2xl font-bold text-[#f7d9a8]">{spreadSummary.title}</h5>
          </div>
          <span className="w-fit rounded-full border border-[#b99a6236] bg-[#15111a] px-3 py-1.5 text-xs font-semibold text-[#d8c6a4]">
            {spread.count}{locale === "en" ? "-card read" : " 張牌總結"}
          </span>
        </div>
        <p className="text-[15px] leading-8 text-[#f0e6d3]">{spreadSummary.lead}</p>
        <div className="mt-4 grid gap-2.5">
          {spreadSummary.bullets.map((bullet, idx) => (
            <div key={idx} className="rounded-2xl border border-[#b99a6218] bg-[#08080f]/70 px-3.5 py-3">
              <p className="text-sm leading-6 text-[#d8d2ec]">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#b99a6218] text-xs font-bold text-[#d1b06f]">
                  {idx + 1}
                </span>
                {bullet}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-2xl border border-[#d1b06f28] bg-[#d1b06f12] px-4 py-3 text-[15px] font-semibold leading-7 text-[#f2e7d2]">
          {spreadSummary.conclusion}
        </p>
      </div>

      <div className="rounded-[24px] border border-[#b99a621f] bg-[#101018]/90 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b99a62]">
              {isZh ? "CARD EVIDENCE" : "CARD EVIDENCE"}
            </p>
            <h5 className="mt-1 text-lg font-bold text-[#f0e6d3]">
              {isZh ? "牌面證據" : "Why the cards say this"}
            </h5>
          </div>
          <span className="rounded-full border border-[#b99a6228] bg-[#b99a620d] px-3 py-1 text-xs font-semibold text-[#d1b06f]">
            {cards.length}{locale === "en" ? " cards" : " 張"}
          </span>
        </div>
        <div className="grid gap-3">
          {reading.cards.map((cr, idx) => (
            <div key={idx} className="rounded-2xl border border-[#b99a6216] bg-[#08080f]/64 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#b99a6216] px-2.5 py-1 text-[11px] font-bold text-[#d1b06f]">
                  {positionLabels[idx] || (locale === "en" ? `Card ${idx + 1}` : `第 ${idx + 1} 張`)}
                </span>
                <span className="text-sm font-bold text-[#f7ecd8]">
                  {cards[idx].nameCn}{cards[idx].reversed ? (isZh ? "逆位" : " Reversed") : (isZh ? "正位" : " Upright")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#d8d2ec]">
                {cr.future.plain || cr.heart.plain}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#d1b06f]">
                {isZh ? "建議：" : "Advice: "}{cr.advice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/*
        Keep the AI reading concise: detailed per-card prose and generic closing copy were
        intentionally removed so the result feels closer to a direct AI tarot answer.
      */}
      {false && (
      <>
      {reading.cards.map((cr, idx) => (
        <div key={idx} className="overflow-hidden rounded-[22px] border border-[#b99a621d] bg-[#15151f]/90">
          <div className="flex flex-col gap-2 border-b border-[#b99a6214] bg-[#1b1b29]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#8a8aad88] uppercase">
                {positionLabels[idx] || (locale === "en" ? `Card ${idx + 1}` : `第 ${idx + 1} 张`)}
              </p>
              <h6 className="mt-1 text-lg font-bold text-[#f0e6d3]">
                {cards[idx].nameCn}
                {cards[idx].reversed && <span className="text-rose-300 ml-1 text-sm">({isZh ? "逆位" : "R"})</span>}
              </h6>
            </div>
            <span className="w-fit rounded-full border border-[#b99a6224] bg-[#b99a6210] px-3 py-1 text-xs font-semibold text-[#d1b06f]">
              {idx + 1} / {cards.length}
            </span>
          </div>
          <div className="grid gap-3 p-4">
            <div className="rounded-2xl border border-[#b99a6214] bg-[#08080f]/54 p-3.5">
              <p className="mb-1.5 text-xs font-bold text-[#d1b06f]">{isZh ? "牌位定位" : "Position"}</p>
              <p className="text-sm leading-7 text-[#e7ddcb]">{cr.position.plain}</p>
            </div>
            <div className="rounded-2xl border border-[#8a8aad1f] bg-[#11111c]/76 p-3.5">
              <p className="mb-1.5 text-xs font-bold text-[#c99aa6]">{isZh ? "核心解讀" : "Core Reading"}</p>
              <p className="text-sm leading-7 text-[#f0e6d3]">{cr.situation.elegant}</p>
              <p className="mt-2 text-sm leading-7 text-[#aaa6c8]">{cr.future.plain}</p>
            </div>
            <div className="rounded-2xl border border-[#d1b06f24] bg-[#d1b06f0f] p-3.5">
              <p className="mb-1.5 text-xs font-bold text-[#d1b06f]">{isZh ? "行動建議" : "Action Advice"}</p>
              <p className="text-sm font-semibold leading-7 text-[#f2e7d2]">{cr.advice}</p>
            </div>
          </div>
        </div>
      ))}
      {/* Overview */}
      <div className="bg-[#b99a6208] rounded-[22px] p-5 border border-[#b99a6222] space-y-2">
        <p className="text-base font-bold text-[#b99a62] mb-1">{isZh ? "最終提醒" : "Final Note"}</p>
        <p className="text-sm text-[#f0e6d3] leading-7 font-semibold">{reading.overview.elegant}</p>
        <p className="text-sm text-[#aaa6c8] leading-7 mt-1">{reading.overview.plain}</p>
        <p className="text-sm text-[#d8c6a4] leading-7 pt-2 border-t border-[#b99a6214]">{reading.scenario.closing.detailed}</p>
      </div>
      </>
      )}
    </div>
  );
}

function TarotShareRow({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const link = getShareLink();
    const text = getShareText(platform);
    navigator.clipboard.writeText(`${text}\n${link}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { name: "Google", icon: "🔍", color: "hover:bg-blue-500/10 hover:text-blue-400" },
    { name: isZh ? "微信" : "WeChat", icon: "💬", color: "hover:bg-green-400/10 hover:text-green-300" },
    { name: "Instagram", icon: "📷", color: "hover:bg-pink-500/10 hover:text-pink-400" },
    { name: isZh ? "小紅書" : "RedNote", icon: "📕", color: "hover:bg-red-400/10 hover:text-red-400" },
  ];

  return (
    <div>
      <div className="flex justify-center gap-3 flex-wrap bg-[#14142a]/60 rounded-xl p-3 border border-[#b99a6215]">
        {platforms.map((p) => (
          <button key={p.name} onClick={() => handleShare(p.name)}
            className={`flex flex-col items-center gap-1 px-3 py-2 glass rounded-xl border border-[#b99a6210] ${p.color} transition-all text-[#8a8aad] hover:scale-105`}>
            <span className="text-lg">{p.icon}</span>
            <span className="text-[8px]">{p.name}</span>
          </button>
        ))}
      </div>
      {copied && (
        <p className="text-[10px] text-green-400 text-center mt-2 animate-fade-in">
          {isZh ? "✨ 專屬鏈接已複製！分享給好友獲取點數" : "✨ Link copied! Share with friends to earn points"}
        </p>
      )}
    </div>
  );
}

function buildTarotAIPrompt({
  locale,
  mode,
  category,
  question,
  spread,
  cards,
  ziwei,
  dualReading,
}: {
  locale: string;
  mode: "classic" | "idol";
  category?: string | null;
  question: string;
  spread: TarotSpread;
  cards: Array<typeof TAROT_CARDS[0] & { reversed: boolean }>;
  ziwei: ZiweiCard | null;
  dualReading: DualReading | null;
}) {
  const isEn = locale === "en";
  const labels = isEn ? spread.positionsEn : spread.positionsZh;
  const cardLines = cards.map((card, idx) => {
    const position = labels[idx] || (isEn ? `Card ${idx + 1}` : `第 ${idx + 1} 張`);
    const orientation = card.reversed ? (isEn ? "Reversed" : "逆位") : (isEn ? "Upright" : "正位");
    const keywords = isEn ? card.keywordsEn.join(", ") : card.keywordsZh.join("、");
    return `${idx + 1}. ${position}: ${isEn ? card.name : card.nameCn} / ${orientation} / ${keywords}`;
  }).join("\n");
  const flowLines = cards.map((card, idx) => {
    const position = labels[idx] || (isEn ? `Card ${idx + 1}` : `第 ${idx + 1} 張`);
    return `${idx + 1}. ${position} → ${getCompactCardPreview({
      card,
      question,
      locale: locale as "zh-TW" | "zh" | "en",
      mode,
      category,
    })}`;
  }).join("\n");
  const spreadLogic = (() => {
    if (spread.count === 1) {
      return isEn
        ? "One-card logic: read this as the direct signal. If the question is Yes/No, answer YES / NO / NOT YET first; then explain the card evidence and one immediate action."
        : "一张牌逻辑：把这张牌当作直接信号。若问题是 Yes/No，第一句必须先给 YES / NO / 暂不建议；再说明牌面证据和一个立刻能做的动作。";
    }
    if (spread.count === 3) {
      return isEn
        ? "Three-card logic: read the spread as a movement chain: Card 1 = previous cause / existing condition, Card 2 = current core state, Card 3 = next trend. The final answer must explain how Card 1 pushes into Card 2, and how Card 2 leads to Card 3."
        : "三张牌逻辑：请按「前因/既有条件 → 当前核心状态 → 下一步趋势」串联。最终结论必须说明第1张如何影响第2张，第2张又如何推到第3张，不要逐张孤立解释。";
    }
    return isEn
      ? "Five-card logic: read this as a full diagnostic path: current state → main obstacle → hidden factor → action advice → likely outcome. The final answer must identify the decisive card and explain whether the outcome is supported or blocked."
      : "五张牌逻辑：请按「现状 → 主要阻碍 → 隐藏因素 → 行动建议 → 趋势结果」做完整诊断。最终结论必须指出哪一张是决定性牌，并说明结果是被支持还是被阻断。";
  })();
  const ziweiLine = ziwei
    ? `${ziwei.name}｜${ziwei.traits.join("、")}｜${dualReading ? `${dualReading.ziweiLabel}；${dualReading.matrix}` : ziwei.bodyMeaning}`
    : isEn ? "Not drawn" : "未抽取";
  const classicScene = (() => {
    const detected = detectDualScene(question);
    const zhMap = {
      love: "經典塔羅 / 感情關係",
      career: "經典塔羅 / 事業工作",
      money: "經典塔羅 / 財運投入",
      decision: "經典塔羅 / 選擇判斷",
      general: "經典塔羅 / 通用趨勢",
    };
    const enMap = {
      love: "classic tarot / love and relationship",
      career: "classic tarot / career and work",
      money: "classic tarot / money and investment",
      decision: "classic tarot / decision and yes-no",
      general: "classic tarot / general trend",
    };
    return isEn ? enMap[detected] : zhMap[detected];
  })();
  const scene = mode === "idol"
    ? category === "fansign"
      ? (isEn ? "idol fansign / offline interaction" : "愛豆簽售 / 線下互動")
      : category === "concert"
      ? (isEn ? "idol concert / ticketing / seat / fan support" : "愛豆演唱會 / 搶票 / 座位 / 應援")
      : (isEn ? "idol career / comeback / resources" : "愛豆事業 / 回歸 / 資源")
    : classicScene;

  if (isEn) {
    return `You are a professional tarot reader who also understands Ziwei Doushu symbolism. Please interpret this reading with a direct, question-specific style.

Question:
${question || "The user did not enter a custom question. Please read the spread according to the selected scene."}

Scene:
${scene}

Reading method:
- This is a dual system draw: Ziwei card = the root/body of the matter; Waite tarot = the visible movement/use.
- Do not read the Ziwei card and tarot cards separately. Link them into one conclusion.
- Spread logic: ${spreadLogic}
- Be concise, precise, and practical. Avoid vague comfort talk.
- If this is a Yes/No question, give a clear YES / NO / NOT YET first, then explain why.
- If the cards do not directly support the user's expectation, say so clearly and point out the exact card conflict.
- Do not predict death, severe illness, illegal events, or absolute fate. Treat this as psychological and trend guidance.

Ziwei core card:
${ziweiLine}

Waite tarot spread:
${spread.labelEn} (${spread.count} cards)
${cardLines}

Card movement summary:
${flowLines}

Please output:
1. Direct answer in one sentence
2. Why the Ziwei root supports or blocks the matter
3. Waite spread movement: connect the cards in position order, not one-by-one only
4. The hidden risk, key opportunity, or contradiction in the spread
5. 2 concrete actions the user should take next`;
  }

  return `你是一位专业塔罗解读师，同时理解紫微斗数星曜象义。请根据以下牌面，给出贴合问题本身的解读。

用户问题：
${question || "用户没有输入自定义问题，请按所选场景解读。"}

问题场景：
${scene}

解读规则：
- 这是「紫微 + 韦特塔罗」双系统抽牌：紫微牌为「体」，看事件根基、长期底色、真正卡点；韦特塔罗为「用」，看当下状态、短期走向和外在结果。
- 不要把紫微和塔罗分开机械解释，要把两者合在一起判断。
- 牌阵串联规则：${spreadLogic}
- 语言要直接、具体、少废话，必须围绕用户问题回答。
- 如果问题是 Yes or No，请第一句直接给 YES / NO / 暂不建议，并说明牌面理由。
- 如果牌面不支持用户期待，请直接说出来，并指出是哪张牌造成冲突。
- 禁止断言生死、重疾、违法犯罪或绝对命运，只做心理参考与趋势建议。

紫微核心牌：
${ziweiLine}

韦特塔罗牌阵：
${spread.labelZh}（${spread.count} 张）
${cardLines}

牌面走向摘要：
${flowLines}

请按以下结构输出：
1. 一句话直接结论
2. 紫微牌显示的根本原因
3. 韦特塔罗的牌面走向：必须按牌位顺序串联，不要只逐张解释
4. 隐藏风险、关键机会，或牌面中的矛盾点
5. 给用户的 2 条具体行动建议`;
}

function TarotAIPromptBox({
  locale,
  mode,
  category,
  question,
  spread,
  cards,
  ziwei,
  dualReading,
  promptOverride,
  className = "",
}: {
  locale: string;
  mode: "classic" | "idol";
  category?: string | null;
  question: string;
  spread: TarotSpread;
  cards: Array<typeof TAROT_CARDS[0] & { reversed: boolean }>;
  ziwei: ZiweiCard | null;
  dualReading: DualReading | null;
  promptOverride?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const prompt = promptOverride || buildTarotAIPrompt({ locale, mode, category, question, spread, cards, ziwei, dualReading });
  const isEn = locale === "en";

  const copyPrompt = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = prompt;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!success) throw new Error("execCommand copy failed");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Copy prompt failed", err);
      window.alert(isEn ? "Copy failed. Please select and copy manually." : "複製失敗，請手動選取複製。");
    }
  };

  return (
    <div className={`max-w-4xl mx-auto overflow-hidden rounded-[24px] border border-[#c99aa62a] bg-gradient-to-br from-[#17111a]/94 via-[#10101b]/94 to-[#08080f]/94 p-4 sm:p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99aa6]">
            {isEn ? "AI Prompt" : "給 AI 的解牌 Prompt"}
          </p>
          <h4 className="mt-1 font-display text-xl font-bold text-[#f7ecd8]">
            {isEn ? "Copy this to ask AI for deeper interpretation" : "複製牌面結果，丟給 AI 深度追問"}
          </h4>
          <p className="mt-1 text-sm leading-6 text-[#aaa6c8]">
            {isEn
              ? "Includes your question, Ziwei core card, Waite spread, orientation, and strict reading rules."
              : "已整理你的問題、紫微核心牌、韋特牌陣、正逆位與解讀規則，避免 AI 回答太泛。"}
          </p>
        </div>
        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#c99aa64a] bg-[#c99aa616] px-4 py-2 text-sm font-bold text-[#ffd4e4] transition-colors hover:border-[#ffd4e499] hover:bg-[#c99aa626]"
        >
          <Share2 className="h-4 w-4" />
          {copied ? (isEn ? "Copied" : "已複製") : (isEn ? "Copy Prompt" : "複製 Prompt")}
        </button>
      </div>
      <div className="mt-4 max-h-64 overflow-auto rounded-2xl border border-[#b99a6218] bg-[#08080f]/78 p-3">
        <pre className="whitespace-pre-wrap text-xs leading-6 text-[#d8d2ec]">{prompt}</pre>
      </div>
    </div>
  );
}

export default function TarotSection() {
  const { t, locale } = useI18n();
  const idolLocale = getIdolLocale(locale);
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Array<typeof TAROT_CARDS[0] & { reversed: boolean }>>([]);
  const [drawnZiweiCard, setDrawnZiweiCard] = useState<ZiweiCard | null>(null);
  const [dualReading, setDualReading] = useState<DualReading | null>(null);
  const [showReading, setShowReading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(PREVIEW_FULL_TAROT);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const initialIdolMode = typeof window !== "undefined" && /[?&]mode=idol\b/.test(window.location.hash);
  const [tarotMode, setTarotMode] = useState<"classic" | "idol">(initialIdolMode ? "idol" : "classic");
  const [idolCategory, setIdolCategory] = useState<string>(initialIdolMode ? "fansign" : "");
  const [idolQuestions, setIdolQuestions] = useState<Record<string, string>>({
    fansign: "",
    concert: "",
    "idol-draw": "",
  });
  const [selectedSpread, setSelectedSpread] = useState<TarotSpreadKey>(initialIdolMode ? "one" : "three");
  const [idolSingleType, setIdolSingleType] = useState<IdolSingleReadingType>("yes-no");
  const [idolSingleQuestion, setIdolSingleQuestion] = useState("");
  const [idolName, setIdolName] = useState("");
  const [idolContext, setIdolContext] = useState("");
  const [idolQuestionError, setIdolQuestionError] = useState("");
  const [classicQuickType, setClassicQuickType] = useState<ClassicQuickReadingType>("yes-no");
  const [classicQuickQuestion, setClassicQuickQuestion] = useState("");
  const [resultCopied, setResultCopied] = useState(false);
  const [tarotPageView, setTarotPageView] = useState<"form" | "result">("form");
  const [currentSessionId, setCurrentSessionId] = useState(() => `tarot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);
  const currentSessionIdRef = useRef(currentSessionId);
  const pendingDrawRef = useRef<{
    mode: "classic" | "idol";
    category?: string;
    question: string;
    userQuestion?: string;
    spread: TarotSpreadKey;
    idolSingleType?: IdolSingleReadingType;
    idolName?: string;
    idolContext?: string;
  } | null>(null);

  // Device fingerprint: stable across localStorage clears
  const getDeviceId = () => {
    const fp = [
      navigator.hardwareConcurrency || 4,
      navigator.maxTouchPoints || 0,
      screen.colorDepth,
      screen.width + "x" + screen.height,
      new Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
    ].join("|");
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
      hash = ((hash << 5) - hash) + fp.charCodeAt(i);
      hash |= 0;
    }
    return "dev_" + Math.abs(hash).toString(36);
  };

  const DEVICE_ID = getDeviceId();
  const GUEST_MAX = 3;

  // Guest tracking: classic & idol each get 3 independent free draws
  const GUEST_CLASSIC_KEY = `r7_guest_classic_${DEVICE_ID}`;
  const GUEST_IDOL_KEY = `r7_guest_idol_${DEVICE_ID}`;
  const FREE_FULL_ANALYSIS_KEY = `r7_tarot_free_full_analysis_used_${DEVICE_ID}`;
  const { user, isAuthenticated } = useAuth();
  const [guestClassicUsed, setGuestClassicUsed] = useState(() => {
    try { return parseInt(localStorage.getItem(GUEST_CLASSIC_KEY) || "0"); } catch { return 0; }
  });
  const [guestIdolUsed, setGuestIdolUsed] = useState(() => {
    try { return parseInt(localStorage.getItem(GUEST_IDOL_KEY) || "0"); } catch { return 0; }
  });
  const [hasUsedFreeFullAnalysis, setHasUsedFreeFullAnalysis] = useState(() => {
    try { return localStorage.getItem(FREE_FULL_ANALYSIS_KEY) === "1"; } catch { return false; }
  });
  const [currentFullAnalysisFree, setCurrentFullAnalysisFree] = useState(false);

  // Get guest remaining for current mode
  const guestModeUsed = tarotMode === "idol" ? guestIdolUsed : guestClassicUsed;
  const guestModeRemaining = Math.max(0, GUEST_MAX - guestModeUsed);
  // Classic & idol both exhausted?
  const classicExhausted = guestClassicUsed >= GUEST_MAX;
  const idolExhausted = guestIdolUsed >= GUEST_MAX;
  const bothGuestExhausted = classicExhausted && idolExhausted;

  const [showLockModal, setShowLockModal] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);

  // Always use guest localStorage tracking.
  // DB-based tracking (logged-in users) is reserved for future use.
  // This ensures new guests always see "3 remaining" regardless of auth state.
  const isPremiumUser = false;
  const effectiveRemaining = hasUsedFreeFullAnalysis ? 0 : 1;
  const effectiveUsed = hasUsedFreeFullAnalysis ? 1 : 0;
  const effectiveMax = 1;
  const hasFullAnalysisAccess = isUnlocked;
  const spreadOptions = tarotMode === "idol" ? IDOL_SPREADS : CLASSIC_SPREADS;
  const activeSpread = getSpread(spreadOptions, selectedSpread);
  const activePositionLabels = locale === "en" ? activeSpread.positionsEn : activeSpread.positionsZh;
  const activeQuestion = tarotMode === "idol" ? (idolQuestions[idolCategory] || "") : question;
  const pendingDraw = pendingDrawRef.current;
  const resultMode = pendingDraw?.mode || tarotMode;
  const resultCategory = pendingDraw?.category || idolCategory;
  const resultQuestion = pendingDraw?.question || activeQuestion;
  const resultUserQuestion = pendingDraw?.userQuestion || "";
  const resultIdolSingleType = pendingDraw?.idolSingleType;
  const resultSpread = getSpread(resultMode === "idol" ? IDOL_SPREADS : CLASSIC_SPREADS, pendingDraw?.spread || selectedSpread);
  const resultPositionLabels = locale === "en" ? resultSpread.positionsEn : resultSpread.positionsZh;
  const resultScene = detectPaidReadingScene(resultUserQuestion || resultQuestion, resultMode);
  const resultSceneCopy = SCENE_COPY[resultScene];
  const localCompletedOrders = getPaymentOrders().filter((order) => order.status === "completed");
  const paymentHistoryQuery = trpc.payment.list.useQuery(
    { page: 1, limit: 1 },
    { enabled: isAuthenticated, retry: false },
  );
  const hasServerPurchase = Boolean(paymentHistoryQuery.data?.some((payment) => payment.status === "completed"));
  const isFirstPurchase = !hasServerPurchase && localCompletedOrders.length === 0;
  const activePaidPlan = getPaidReadingPlan(isFirstPurchase);

  const conversionFreeSummary = (() => {
    const cardTrail = drawnCards.map((card, index) => {
      const position = resultPositionLabels[index] || `第 ${index + 1} 张`;
      return `${position}的${card.nameCn}${card.reversed ? "逆位" : "正位"}`;
    }).join("、");
    const root = dualReading?.freeSummary || (drawnCards[0]
      ? getCompactCardPreview({
          card: drawnCards[0],
          question: resultQuestion,
          locale: locale as "zh-TW" | "zh" | "en",
          mode: resultMode,
          category: resultCategory,
        })
      : "牌面正在形成当前问题的核心趋势。");
    const prefix = cardTrail ? `本次${cardTrail}。` : "";
    return `${prefix}${root}`.slice(0, 220);
  })();

  const conversionUnresolved = (() => {
    const reversedCount = drawnCards.filter((card) => card.reversed).length;
    if (reversedCount > 0) {
      return `牌组中出现 ${reversedCount} 张逆位，当前最关键的是：${resultSceneCopy.unresolvedLabel}`;
    }
    return `牌面整体具备推进空间，但仍需要确认：${resultSceneCopy.unresolvedLabel}`;
  })();

  const handlePaidReadingFollowup = useCallback((nextQuestion: string) => {
    pendingDrawRef.current = null;
    setTarotPageView("form");
    setDrawnCards([]);
    setDrawnZiweiCard(null);
    setDualReading(null);
    setShowReading(false);
    if (resultMode === "idol") {
      const category = resultCategory || "idol-draw";
      setTarotMode("idol");
      setIdolCategory(category);
      setIdolQuestions((current) => ({ ...current, [category]: nextQuestion }));
      setIdolSingleQuestion(nextQuestion);
    } else {
      setTarotMode("classic");
      setQuestion(nextQuestion);
      setClassicQuickQuestion(nextQuestion);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resultCategory, resultMode]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_TAROT_RESULT_KEY) || "null");
      if (!saved || Date.now() - new Date(saved.savedAt).getTime() > 24 * 60 * 60 * 1000) return;
      if (!saved.pending || !Array.isArray(saved.cards) || !saved.cards.length || !saved.ziwei) return;

      pendingDrawRef.current = saved.pending;
      currentSessionIdRef.current = saved.sessionId;
      setCurrentSessionId(saved.sessionId);
      setDrawnCards(saved.cards);
      setDrawnZiweiCard(saved.ziwei);
      setDualReading(saved.dualReading || null);
      setTarotMode(saved.pending.mode || "classic");
      setIdolSingleType(saved.pending.idolSingleType || "yes-no");
      setIdolName(saved.pending.idolName || "");
      setIdolContext(saved.pending.idolContext || "");
      setIdolSingleQuestion(saved.pending.userQuestion || "");
      setSelectedSpread(saved.pending.spread || "three");
      setTarotPageView("result");
      setShowReading(true);
      setIsUnlocked(Boolean(saved.isUnlocked));
    } catch {
      localStorage.removeItem(LAST_TAROT_RESULT_KEY);
    }
  }, []);

  // Generate unique share code: user-based if logged in, device-based if guest
  const generateShareCode = () => {
    const code = isAuthenticated ? `r7_${user?.id || "user"}` : `inv_${DEVICE_ID.slice(0, 12)}`;
    const link = `${window.location.origin}/?ref=${code}`;
    setInviteCode(code);
    setInviteLink(link);
    setShowInviteCode(true);
    setInviteCopied(false);
  };

  const copyInviteLink = async () => {
    const text = locale === "zh-TW"
      ? `快來 R7 Fortune 免費占卜！註冊時輸入邀請碼 ${inviteCode}，我倆都能解鎖更多抽牌次數 🎴 ${inviteLink}`
      : locale === "zh"
      ? `快来 R7 Fortune 免费占卜！注册时输入邀请码 ${inviteCode}，我俩都能解锁更多抽牌次数 🎴 ${inviteLink}`
      : `Join me on R7 Fortune for free tarot! Use invite code ${inviteCode} when registering — we both unlock more draws 🎴 ${inviteLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "R7 Fortune", text, url: inviteLink }); } catch {}
    }
    await navigator.clipboard.writeText(text).catch(() => {});
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  const idolSingleReading = resultMode === "idol" && resultSpread.count === 1 && drawnCards[0] && resultIdolSingleType
    ? buildIdolSingleReading({
        card: drawnCards[0],
        type: resultIdolSingleType,
        question: resultUserQuestion || resultQuestion,
        locale: locale as "zh-TW" | "zh" | "en",
      })
    : null;
  const localizedZiwei = drawnZiweiCard ? localizeZiweiCard(drawnZiweiCard, idolLocale) : null;
  const idolFreeResult = resultMode === "idol" && resultIdolSingleType && localizedZiwei && drawnCards[0]
    ? buildIdolFreeResult({
        locale: idolLocale,
        scene: getIdolTarotScene(resultIdolSingleType),
        question: resultUserQuestion || resultQuestion,
        ziwei: localizedZiwei,
        tarot: {
          name: locale === "en" ? drawnCards[0].name : localizedText(drawnCards[0].nameCn, locale),
          orientation: locale === "en" ? (drawnCards[0].reversed ? "Reversed" : "Upright") : (drawnCards[0].reversed ? "逆位" : "正位"),
          keywords: getCardKeywords(drawnCards[0], locale).slice(0, 4),
        },
      })
    : null;

  const copyTarotResult = async () => {
    if (!drawnCards.length) return;
    const cardLines = drawnCards.map((card, idx) => {
      const label = resultPositionLabels[idx] || (locale === "en" ? `Card ${idx + 1}` : `第 ${idx + 1}张`);
      return `${label}: ${card.nameCn}/${card.name} ${card.reversed ? (locale === "en" ? "Reversed" : "逆位") : (locale === "en" ? "Upright" : "正位")}`;
    });
    const text = [
      locale === "en" ? "R7 Fortune Idol Tarot Result" : "R7 Fortune 爱豆塔罗结果",
      resultUserQuestion ? `${locale === "en" ? "Question" : "你的问题"}：${resultUserQuestion}` : "",
      ...cardLines,
      idolSingleReading ? "" : "",
      ...(idolSingleReading?.lines || []),
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text).catch(() => {});
    setResultCopied(true);
    setTimeout(() => setResultCopied(false), 2200);
  };

  const resetToIdolSingleDraw = () => {
    pendingDrawRef.current = null;
    setTarotMode("idol");
    setSelectedSpread("one");
    setTarotPageView("form");
    setDrawnCards([]);
    setDrawnZiweiCard(null);
    setDualReading(null);
    setShowReading(false);
    setIsDrawing(false);
    setIsShuffling(false);
    setResultCopied(false);
  };

  const idolCategories = [
    { key: "fansign", icon: Heart, labelEn: "Fansign Fortune", labelZh: "簽售運勢", descEn: "What energy surrounds your next fansign?", descZh: "下一次簽售會，你的運勢如何？" },
    { key: "concert", icon: MapPin, labelEn: "Concert Direction", labelZh: "演唱會應援方位", descEn: "Which direction brings the best concert luck?", descZh: "演唱會站在哪個方位最幸運？" },
    { key: "idol-draw", icon: Music, labelEn: "Idol Career Reading", labelZh: "愛豆事業占卜", descEn: "Artist comeback trends, hidden schedules, inner state, team dynamics, future trajectory.", descZh: "藝人回歸動向、隱藏行程、內心狀態、隊內關係、後續走勢。" },
  ];

  const idolOneCardPrompts: IdolOneCardPrompt[] = IDOL_TAROT_SCENES.map((scene) => ({
    key: scene.key,
    icon: scene.icon,
    category: scene.category,
    labelZh: scene.title["zh-TW"],
    labelEn: scene.title.en,
    descZh: scene.description["zh-TW"],
    descEn: scene.description.en,
    questionZh: scene.fallbackQuestion["zh-TW"],
    questionEn: scene.fallbackQuestion.en,
  }));

  const useDrawMutation = trpc.reading.useDraw.useMutation();
  const drawCards = useCallback((override?: {
    mode?: "classic" | "idol";
    category?: string;
    question?: string;
    userQuestion?: string;
    spread?: TarotSpreadKey;
    idolSingleType?: IdolSingleReadingType;
    idolName?: string;
    idolContext?: string;
  }) => {
    const mode = override?.mode || tarotMode;
    const category = override?.category || idolCategory;
    const drawQuestion = override?.question ?? (mode === "idol" ? activeQuestion : question);
    const spread = override?.spread || selectedSpread;
    if (mode === "classic" && !drawQuestion.trim()) return;
    if (mode === "idol") {
      const userQuestion = override?.userQuestion ?? drawQuestion;
      if (!category) return;
      if (!isIdolRelatedQuestion(userQuestion)) {
        setIdolQuestionError(locale === "en" ? "This feature only supports idol/fandom questions." : "本功能仅支持追星相关问题哦～");
        return;
      }
    }

    const nextSessionId = `tarot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    currentSessionIdRef.current = nextSessionId;
    setCurrentSessionId(nextSessionId);
    trackEvent("tarot_question_submitted", {
      scene_type: detectPaidReadingScene(drawQuestion, mode),
      spread_type: spread,
      user_type: isAuthenticated ? "member" : "guest",
      session_id: nextSessionId,
      question_length: drawQuestion.trim().length,
      source_page: "tarot",
    });

    setIsShuffling(true);
    setIsDrawing(true);
    setIdolQuestionError("");
    setResultCopied(false);
    pendingDrawRef.current = {
      mode,
      category,
      question: drawQuestion,
      userQuestion: override?.userQuestion,
      spread,
      idolSingleType: override?.idolSingleType,
      idolName: override?.idolName,
      idolContext: override?.idolContext,
    };
    setTarotPageView("result");
    setDrawnCards([]);
    setDrawnZiweiCard(null);
    setDualReading(null);
    setShowReading(false);
    setCurrentFullAnalysisFree(false);
    if (!isPremiumUser) setIsUnlocked(false);
  }, [question, activeQuestion, tarotMode, idolCategory, selectedSpread, locale, isAuthenticated]);

  const drawIdolOneCard = useCallback((prompt: IdolOneCardPrompt) => {
    const rawQuestion = idolSingleQuestion.trim().slice(0, 120);
    if (rawQuestion.length < 5) {
      setIdolQuestionError(locale === "en" ? "Please enter a focused question (5–120 characters)." : "請輸入 5–120 字的具體追星問題。小問題越清楚，解讀越聚焦。");
      return;
    }
    if (!isIdolRelatedQuestion(rawQuestion)) {
      setIdolQuestionError(locale === "en" ? "This feature only supports idol/fandom questions." : "本功能仅支持追星相关问题哦～");
      return;
    }
    const promptText = rawQuestion || (locale === "en" ? prompt.questionEn : prompt.questionZh);
    setTarotMode("idol");
    setIdolCategory(prompt.category);
    setSelectedSpread("three");
    setDrawnCards([]);
    setShowReading(false);
    drawCards({
      mode: "idol",
      category: prompt.category,
      question: promptText,
      userQuestion: rawQuestion,
      spread: "three",
      idolSingleType: prompt.key,
      idolName: idolName.trim(),
      idolContext: idolContext.trim(),
    });
    trackEvent("idol_question_submitted", {
      scene_type: prompt.key,
      spread_type: "one",
      user_type: isAuthenticated ? "member" : "guest",
      question_length: rawQuestion.length,
      session_id: currentSessionIdRef.current,
      source_page: "idol_tarot",
    });
  }, [drawCards, idolContext, idolName, idolSingleQuestion, isAuthenticated, locale]);

  const classicQuickPrompts: ClassicQuickPrompt[] = [
    {
      key: "yes-no",
      icon: Check,
      labelZh: "Yes or No",
      labelEn: "Yes or No",
      descZh: "適合問能不能成、該不該做、要不要繼續。",
      descEn: "For can-it-work, should-I-do-it, and continue-or-stop decisions.",
      questionZh: "這件事能成嗎？請給我 Yes or No 的直接指引。",
      questionEn: "Will this work out? Give me a direct yes-or-no tarot signal.",
    },
    {
      key: "daily-guidance",
      icon: Sparkles,
      labelZh: "運勢提點",
      labelEn: "Daily Guidance",
      descZh: "快速看今天/近期最需要注意的能量和行動提醒。",
      descEn: "A quick cue for today or the near term: energy, warning, and action.",
      questionZh: "我今天或近期最需要注意什麼？請給我一張牌運勢提點。",
      questionEn: "What should I pay attention to today or in the near term? Give me one-card guidance.",
    },
  ];

  const drawClassicOneCard = useCallback((prompt: ClassicQuickPrompt) => {
    const rawQuestion = classicQuickQuestion.trim().slice(0, 100);
    const promptText = rawQuestion || (locale === "en" ? prompt.questionEn : prompt.questionZh);
    setTarotMode("classic");
    setSelectedSpread("one");
    setQuestion(promptText);
    setDrawnCards([]);
    setShowReading(false);
    drawCards({ mode: "classic", question: promptText, userQuestion: rawQuestion, spread: "one" });
  }, [classicQuickQuestion, drawCards, locale]);

  const handleShuffleComplete = useCallback(() => {
    setIsShuffling(false);
    const pending = pendingDrawRef.current;
    const resolvedMode = pending?.mode || tarotMode;
    const resolvedSpread = getSpread(resolvedMode === "idol" ? IDOL_SPREADS : CLASSIC_SPREADS, pending?.spread || selectedSpread);
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, resolvedSpread.count).map(card => ({
      ...card,
      reversed: Math.random() > 0.5,
    }));
    const ziwei = drawZiweiCard();
    setDrawnCards(selected);
    setDrawnZiweiCard(ziwei);
    setIsDrawing(false);
    const nextDualReading = buildDualReading(ziwei, selected[0], pending?.question || activeQuestion);
    setDualReading(nextDualReading);
    trackEvent("tarot_draw_completed", {
      scene_type: detectPaidReadingScene(pending?.question || activeQuestion, resolvedMode),
      spread_type: resolvedSpread.key,
      user_type: isAuthenticated ? "member" : "guest",
      session_id: currentSessionIdRef.current,
      question_length: (pending?.question || activeQuestion).trim().length,
      source_page: "tarot",
    });
    if (resolvedMode === "idol") {
      trackEvent("idol_dual_cards_revealed", {
        scene_type: pending?.idolSingleType || "idol",
        spread_type: resolvedSpread.key,
        user_type: isAuthenticated ? "member" : "guest",
        session_id: currentSessionIdRef.current,
        question_length: (pending?.userQuestion || pending?.question || "").trim().length,
        source_page: "idol_tarot",
      });
    }
    try {
      localStorage.setItem(LAST_TAROT_RESULT_KEY, JSON.stringify({
        sessionId: currentSessionIdRef.current,
        pending,
        cards: selected,
        ziwei,
        dualReading: nextDualReading,
        isUnlocked: false,
        savedAt: new Date().toISOString(),
      }));
    } catch {}
    // Auto-save to localStorage
    try {
      const cardNames = selected.map((c: any) => c.nameCn + (c.reversed ? "逆" : "正")).join(" → ");
      const record = {
        title: `塔羅: ${(pending?.question || activeQuestion).slice(0, 20) || "運勢占卜"}`,
        type: "tarot",
        date: new Date().toLocaleDateString("zh-CN"),
        preview: `${ziwei.name} × ${cardNames} · ${resolvedMode === "idol" ? "愛豆占卜" : "經典塔羅"}`,
      };
      const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]");
      existing.unshift(record);
      localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)));
    } catch {}
    setTimeout(() => {
      setShowReading(true);
    }, 800);
  }, [activeQuestion, tarotMode, selectedSpread, isAuthenticated]);

  const activeIdolScene = getIdolTarotScene(idolSingleType);

  useEffect(() => {
    if (tarotMode !== "idol") return;
    trackEvent("idol_page_viewed", { source_page: "tarot", user_type: isAuthenticated ? "member" : "guest" });
  }, [isAuthenticated, tarotMode]);

  return (
    <section id="tarot" className="py-24 relative">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">{t("tarot.title")}</h2>
          <p className="mt-2 text-sm text-[#8a8aad]">{t("tarot.subtitle")}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#b99a6208] border border-[#b99a6215] rounded-full">
            <Sparkles className="w-3 h-3 text-[#b99a62]" />
            <span className="text-[10px] text-[#b99a62]">
              {locale === "en"
                ? "Free draw · Deep reports from ¥9.9"
                : "抽牌免費 · 深度報告新人首購 ¥9.9"}
            </span>
            {/* Hint text */}
            <span className="text-[9px] text-[#8a8aad55] hidden sm:inline">
              {locale === "en"
                ? "Every tarot draw now combines Waite tarot with a Ziwei core card"
                : "每次塔羅抽牌都同步抽取紫微核心牌，先看牌面，解析另行開放"}
            </span>
          </div>
          {/* Subscription + Referral */}
          <div className="max-w-xl mx-auto mt-4">
            {false && <SubscriptionCard onPurchase={(type) => window.open("/payment", "_blank")} />}
          </div>
        </div>

        {tarotPageView === "form" && (
          <>
        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { key: "classic" as const, label: locale === "zh-TW" ? "經典塔羅" : "Classic Tarot" },
            { key: "idol" as const, label: locale === "zh-TW" ? "愛豆塔羅" : "Idol Tarot", hot: true },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setTarotMode(tab.key);
                setIdolCategory(tab.key === "idol" ? "fansign" : "");
                setQuestion("");
                setSelectedSpread("three");
                setDrawnCards([]);
                setShowReading(false);
                setTarotPageView("form");
              }}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tarotMode === tab.key ? "bg-[#b99a62] text-[#0a0a0f]" : "bg-[#14142a] text-[#8a8aad] hover:text-[#f0e6d3] border border-[#b99a6215]"
              }`}>
              {tab.label}
              {tab.hot && <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[8px] font-bold rounded-full">NEW</span>}
            </button>
          ))}
        </div>

        {tarotMode === "idol" && (
          <div className="mx-auto mb-7 max-w-5xl overflow-hidden rounded-[30px] border border-[#d5b4674a] bg-[linear-gradient(135deg,rgba(31,18,30,0.96),rgba(13,12,22,0.96)_54%,rgba(20,15,22,0.96))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d49ab24a] bg-[#d49ab214] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd8e6]"><Sparkles className="h-3.5 w-3.5" /> Ziwei Tarot + Rider–Waite</div>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-[#fff3df] sm:text-5xl">{idolLocale === "zh-TW" ? "Idol Destiny｜你與本命之間的能量連結" : "Idol Destiny｜Explore the Energy Between You and Your Bias"}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c8c1da] sm:text-base">{idolLocale === "zh-TW" ? "以紫微塔羅與韋特塔羅，解讀你此刻最在意的追星問題。" : "A dual-system reading combining Zi Wei Tarot and Rider–Waite Tarot for the fandom questions that matter to you most."}</p>
              </div>
              <div className="rounded-[24px] border border-[#d5b46735] bg-[#090911]/72 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4b46f]">Reading preview</p>
                <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-[#d5b46726] bg-[#15121b] p-3"><p className="text-xs font-bold text-[#d8c08d]">{idolLocale === "zh-TW" ? "紫微塔羅" : "Zi Wei Tarot"}</p><p className="mt-1 text-sm text-[#f2e7d2]">{idolLocale === "zh-TW" ? "核心局勢" : "Core situation"}</p></div><div className="rounded-2xl border border-[#d49ab22b] bg-[#17111a] p-3"><p className="text-xs font-bold text-[#e5b9ca]">{idolLocale === "zh-TW" ? "韋特塔羅" : "Rider–Waite"}</p><p className="mt-1 text-sm text-[#f2e7d2]">{idolLocale === "zh-TW" ? "情緒與行動" : "Emotion & action"}</p></div></div>
                <p className="mt-3 text-xs leading-5 text-[#9792b0]">{idolLocale === "zh-TW" ? "免費抽牌並查看初步結論，再自行選擇 AI Prompt 或完整報告。" : "Draw for free, view your first insight, then choose an AI prompt or full report."}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto mb-12">
          <div className="mb-6 rounded-[28px] border border-[#b99a6230] bg-[#080810]/88 p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <div className={`items-start justify-between gap-4 mb-5 ${tarotMode === "idol" ? "hidden" : "flex"}`}>
              <div>
                <p className="text-[11px] text-[#b99a62] font-bold tracking-[0.22em] uppercase">
                  {locale === "en" ? "Tarot Spread" : "TAROT SPREAD"}
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-display font-bold text-[#f2e7d2]">
                  {locale === "en" ? "Choose a Spread" : "選擇抽牌方式"}
                </h2>
                <p className="text-sm text-[#aaa6c8] mt-2">
                  {locale === "en" ? "Different questions need different card structures." : "不同問題適合不同牌陣，先選抽法再抽牌。"}
                </p>
              </div>
              <span className="hidden sm:inline-flex min-w-[82px] justify-center rounded-full border border-[#b99a6248] bg-[#15111a] px-4 py-2 text-sm font-bold text-[#dfc894]">
                {activeSpread.count} {locale === "en" ? "Cards" : "張牌"}
              </span>
            </div>
            {tarotMode === "idol" && (
              <div className="mb-5 overflow-hidden rounded-[24px] border border-[#d49ab24a] bg-gradient-to-br from-[#1b111b]/95 via-[#100d16]/94 to-[#08080f]/95 p-4 sm:p-5 shadow-[0_18px_46px_rgba(212,154,178,0.10)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d49ab2]">
                      {locale === "en" ? "Idol three-card reading" : "愛豆三牌占卜"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#f7ecd8]">
                      {locale === "en" ? "Choose a scene, then draw three cards" : "先選問題類型，再抽三張追星靈感籤"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#bdb4d6]">
                      {locale === "en"
                        ? "Choose one scene and enter a focused question. The same question and cards stay attached throughout the reading."
                        : "先選一個場景，再輸入具體問題；同一問題與牌面會完整保留至結果頁。"}
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-[#d49ab242] bg-[#d49ab214] px-3 py-1 text-xs font-bold text-[#ffd4e4]">
                    {locale === "en" ? "3-card focused answer" : "3 張牌精準回覆"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {idolOneCardPrompts.map((prompt) => {
                    const PromptIcon = prompt.icon;
                    const selected = idolSingleType === prompt.key;
                    return (
                      <button
                        key={prompt.key}
                        type="button"
                        onClick={() => {
                          setIdolSingleType(prompt.key);
                          setIdolQuestionError("");
                          trackEvent("idol_scene_selected", { scene_type: prompt.key, source_page: "idol_tarot", user_type: isAuthenticated ? "member" : "guest" });
                        }}
                        className={`group flex items-start gap-3 rounded-[18px] border p-3.5 text-left transition-all hover:-translate-y-0.5 ${
                          selected
                            ? "border-[#ffd4e485] bg-gradient-to-r from-[#d49ab226] via-[#18111d] to-[#0d0b12] shadow-[0_12px_30px_rgba(212,154,178,0.12)]"
                            : "border-[#d49ab22d] bg-[#0d0b12]/84 hover:border-[#d49ab265] hover:bg-[#17101a]"
                        }`}
                      >
                        <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${
                          selected ? "border-[#ffd4e485] bg-[#ffd4e422] text-[#ffd4e4]" : "border-[#d49ab245] bg-[#d49ab216] text-[#ffd4e4]"
                        }`}>
                            <PromptIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="block text-base font-black text-[#f7ecd8]">
                              {locale === "en" ? prompt.labelEn : prompt.labelZh}
                            </span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-[#ffd4e4] bg-[#ffd4e4] text-[#120c14]" : "border-[#d49ab245] text-transparent"
                            }`}>
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[#cfc6df]">
                            {locale === "en" ? prompt.descEn : prompt.descZh}
                          </span>
                          <span className="mt-2 inline-flex rounded-full border border-[#d49ab235] bg-[#d49ab210] px-2.5 py-1 text-[10px] font-black text-[#e9becf]">
                            {getIdolTarotScene(prompt.key).badge[idolLocale]}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[20px] border border-[#d49ab22f] bg-[#0d0b12]/82 p-3.5">
                  <div className="mb-3 grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#d49ab2]">{idolLocale === "zh-TW" ? "IDOL 名稱（選填）" : "IDOL NAME (OPTIONAL)"}</span><input value={idolName} maxLength={50} onChange={(event) => setIdolName(event.target.value.slice(0, 50))} placeholder={idolLocale === "zh-TW" ? "例如：Karina / 張員瑛" : "Example: Karina"} className="w-full rounded-2xl border border-[#9f7c8548] bg-[#11111d] px-4 py-3 text-sm font-semibold text-[#f0e6d3] placeholder-[#8f8aa388] outline-none focus:border-[#c99aa6]" /></label>
                    <div className="rounded-2xl border border-[#d49ab22b] bg-[#d49ab20b] p-3"><p className="text-xs font-bold text-[#efc7d6]">{activeIdolScene.badge[idolLocale]}</p><p className="mt-1 text-xs leading-5 text-[#aaa4bf]">{activeIdolScene.bestFor[idolLocale]}</p></div>
                  </div>
                  <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-[#d49ab2]">
                    {locale === "en" ? "YOUR IDOL QUESTION · REQUIRED" : "你的追星問題 · 必填"}
                  </label>
                  <input
                    type="text"
                    value={idolSingleQuestion}
                    maxLength={120}
                    onChange={(event) => {
                      setIdolSingleQuestion(event.target.value.slice(0, 120));
                      setIdolQuestionError("");
                    }}
                    placeholder={activeIdolScene.placeholder[idolLocale]}
                    className="w-full rounded-2xl border border-[#9f7c8548] bg-[#11111d] px-4 py-3 text-sm font-semibold text-[#f0e6d3] placeholder-[#8f8aa388] outline-none transition-colors focus:border-[#c99aa6] focus:bg-[#151523]"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8f8aa3]"><span>{idolLocale === "zh-TW" ? "問題越具體，解讀越能貼近你真正想確認的重點。" : "The more specific your question, the more focused your reading can be."}</span><span>{idolSingleQuestion.length}/120</span></div>
                  <label className="mt-4 block"><span className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#d49ab2]">{idolLocale === "zh-TW" ? "補充背景（選填）" : "CONTEXT (OPTIONAL)"}</span><textarea value={idolContext} maxLength={300} rows={3} onChange={(event) => setIdolContext(event.target.value.slice(0, 300))} placeholder={idolLocale === "zh-TW" ? "可補充活動日期、目前準備或你最在意的現實條件。" : "Add the event date, your preparation, or the practical condition you care about."} className="w-full resize-none rounded-2xl border border-[#9f7c8548] bg-[#11111d] px-4 py-3 text-sm leading-6 text-[#f0e6d3] placeholder-[#8f8aa388] outline-none focus:border-[#c99aa6]" /><span className="mt-1 block text-right text-[11px] text-[#8f8aa3]">{idolContext.length}/300</span></label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(locale === "en"
                      ? ["Will ticketing work this time?", "How should I prepare for the event?", "Is today good for fan support?"]
                      : ["這次搶票能成功嗎？", "簽售排位會順利嗎？", "今天適合做應援嗎？"]).map(example => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => {
                          setIdolSingleQuestion(example);
                          setIdolQuestionError("");
                        }}
                        className="rounded-full border border-[#d49ab235] bg-[#d49ab210] px-3 py-1.5 text-xs font-semibold text-[#ffd4e4] transition-colors hover:border-[#ffd4e485] hover:bg-[#d49ab220]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                  {idolQuestionError && (
                    <p className="mt-3 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-200">
                      {idolQuestionError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = idolOneCardPrompts.find(item => item.key === idolSingleType) || idolOneCardPrompts[0];
                      drawIdolOneCard(prompt);
                    }}
                    disabled={isDrawing || isShuffling || idolSingleQuestion.trim().length < 5}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d49ab2] via-[#d1b06f] to-[#b99a62] px-5 py-3 text-sm font-black text-[#0a0a0f] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isShuffling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {locale === "en" ? "Draw One Card" : "立即抽牌"}
                  </button>
                </div>
              </div>
            )}

            {tarotMode === "classic" && (
              <div className="mb-5 rounded-[26px] border border-[#b99a6230] bg-gradient-to-br from-[#0d0b12]/96 via-[#10101b]/92 to-[#08080f]/96 p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d1b06f]">
                      {locale === "en" ? "Classic one-card reading" : "經典單牌占卜"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#f7ecd8]">
                      {locale === "en" ? "Choose a quick question type" : "先選單牌類型，再輸入問題"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#bdb4d6]">
                      {locale === "en"
                        ? "Yes/No and daily guidance now support a specific question before drawing."
                        : "Yes or No 和運勢提點都可以先填問題，解讀會更貼近你的提問。"}
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-[#d1b06f42] bg-[#d1b06f14] px-3 py-1 text-xs font-bold text-[#f0d49c]">
                    {locale === "en" ? "1-card focused answer" : "1 張牌精準回覆"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {classicQuickPrompts.map((prompt) => {
                    const PromptIcon = prompt.icon;
                    const selected = classicQuickType === prompt.key;
                    return (
                      <button
                        key={prompt.key}
                        type="button"
                        onClick={() => setClassicQuickType(prompt.key)}
                        className={`group flex items-start gap-3 rounded-[18px] border p-3.5 text-left transition-all hover:-translate-y-0.5 ${
                          selected
                            ? "border-[#d1b06f85] bg-gradient-to-r from-[#d1b06f24] via-[#171623] to-[#0d0b12] shadow-[0_12px_30px_rgba(185,154,98,0.12)]"
                            : "border-[#b99a622d] bg-[#0d0b12]/84 hover:border-[#d1b06f65] hover:bg-[#171623]"
                        }`}
                      >
                        <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${
                          selected ? "border-[#f0d49c85] bg-[#f0d49c22] text-[#f0d49c]" : "border-[#d1b06f45] bg-[#d1b06f16] text-[#f0d49c]"
                        }`}>
                          <PromptIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="block text-base font-black text-[#f7ecd8]">
                              {locale === "en" ? prompt.labelEn : prompt.labelZh}
                            </span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-[#f0d49c] bg-[#f0d49c] text-[#120c14]" : "border-[#d1b06f45] text-transparent"
                            }`}>
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[#cfc6df]">
                            {locale === "en" ? prompt.descEn : prompt.descZh}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[20px] border border-[#b99a622f] bg-[#0d0b12]/82 p-3.5">
                  <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-[#d1b06f]">
                    {locale === "en" ? "YOUR QUESTION" : "你的問題"}
                  </label>
                  <input
                    type="text"
                    value={classicQuickQuestion}
                    maxLength={100}
                    onChange={(event) => setClassicQuickQuestion(event.target.value.slice(0, 100))}
                    placeholder={
                      locale === "en"
                        ? "Type your specific question (optional)"
                        : locale === "zh"
                        ? "请输入你想提问的具体问题（选填）"
                        : "請輸入你想提問的具體問題（選填）"
                    }
                    className="w-full rounded-2xl border border-[#b99a6248] bg-[#11111d] px-4 py-3 text-sm font-semibold text-[#f0e6d3] placeholder-[#8f8aa388] outline-none transition-colors focus:border-[#d1b06f] focus:bg-[#151523]"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {((classicQuickType === "yes-no")
                      ? (locale === "en"
                        ? ["Will this work out?", "Should I keep going?", "Will they respond?"]
                        : ["这件事能成吗？", "我该不该继续？", "对方会主动吗？"])
                      : (locale === "en"
                        ? ["What should I notice today?", "What is my near-term focus?", "What should I do next?"]
                        : ["今天要注意什么？", "近期运势重点是什么？", "下一步怎么做？"])
                    ).map(example => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setClassicQuickQuestion(example)}
                        className="rounded-full border border-[#d1b06f35] bg-[#d1b06f10] px-3 py-1.5 text-xs font-semibold text-[#f0d49c] transition-colors hover:border-[#f0d49c85] hover:bg-[#d1b06f20]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = classicQuickPrompts.find(item => item.key === classicQuickType) || classicQuickPrompts[0];
                      drawClassicOneCard(prompt);
                    }}
                    disabled={isDrawing || isShuffling}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d1b06f] via-[#e5c783] to-[#b99a62] px-5 py-3 text-sm font-black text-[#0a0a0f] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isShuffling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {locale === "en" ? "Draw One Card" : "立即抽牌"}
                  </button>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 gap-4 ${tarotMode === "idol" ? "hidden" : "sm:grid-cols-2"}`}>
              {(tarotMode === "idol" || tarotMode === "classic" ? spreadOptions.filter((spread) => spread.key !== "one") : spreadOptions).map((spread, spreadIdx) => {
                const selected = selectedSpread === spread.key;
                const positionPreview = locale === "en" ? spread.positionsEn : spread.positionsZh;
                const displayIndex = spread.key === "three" ? 2 : spread.key === "five" ? 3 : spreadIdx + 1;
                return (
                  <button
                    key={`${tarotMode}-${spread.key}`}
                    onClick={() => { setSelectedSpread(spread.key); setDrawnCards([]); setShowReading(false); }}
                    className={`group relative min-h-[226px] overflow-hidden rounded-[22px] border p-5 text-left transition-all hover:-translate-y-0.5 ${
                      selected
                        ? "border-[#d1b06f] bg-gradient-to-br from-[#211b23] via-[#171623] to-[#101019] shadow-[0_0_0_2px_rgba(209,176,111,0.16),0_18px_34px_rgba(185,154,98,0.14)]"
                        : "border-[#b99a6220] bg-[#08080f]/82 hover:border-[#b99a6260] hover:bg-[#101018]/92"
                    }`}
                  >
                    <div className="absolute right-4 top-4 text-7xl font-display font-bold leading-none text-[#b99a6208]">{spread.count}</div>
                    <div className={`absolute inset-x-0 top-0 h-1 ${selected ? "bg-gradient-to-r from-[#d1b06f] via-[#f0d49c] to-[#d49ab2]" : "bg-[#b99a6218]"}`} />
                    <div className="relative">
                      <div className="mb-4 flex items-start gap-3">
                        <span className={`h-12 w-12 rounded-full flex shrink-0 items-center justify-center text-lg font-black tracking-tight shadow-inner ${
                          selected ? "bg-[#d1b06f] text-[#08080f]" : "bg-[#171726] text-[#d1b06f] border border-[#b99a6230]"
                        }`}>
                          {String(displayIndex).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="block text-xl font-bold leading-tight text-[#f7ecd8]">{locale === "en" ? spread.labelEn : spread.labelZh}</span>
                          <span className="mt-1 inline-flex rounded-full border border-[#b99a6228] bg-[#b99a6210] px-2.5 py-0.5 text-xs font-semibold text-[#d1b06f]">
                            {spread.count} {locale === "en" ? "card spread" : "張牌陣"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[15px] leading-7 text-[#c8c3df]">{locale === "en" ? spread.descEn : spread.descZh}</p>
                      <div className="mt-4 rounded-xl border border-[#b99a6224] bg-[#121016] px-3.5 py-3">
                        <span className="mb-1 block text-[11px] font-bold tracking-[0.16em] text-[#d1b06f]">
                          {locale === "en" ? "BEST FOR" : "適合問題"}
                        </span>
                        <p className="text-sm leading-6 text-[#e2d6be]">{locale === "en" ? spread.bestForEn : spread.bestForZh}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {positionPreview.map((position, positionIdx) => (
                          <span
                            key={position}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                              selected
                                ? "border-[#d1b06f44] bg-[#d1b06f18] text-[#f2e7d2]"
                                : "border-[#8a8aad20] bg-[#141421] text-[#aaa6c8]"
                            }`}
                          >
                            {positionIdx + 1}. {position}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {tarotMode === "classic" ? (
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[#b99a6240] bg-[#08080f]/92 p-4 sm:p-5 shadow-[0_0_36px_rgba(212,168,83,0.10)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#b99a62] via-[#e3c38a] to-[#c99aa6]" />
              <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b99a6240] bg-[#15111a] text-[#d1b06f]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.22em] text-[#b99a62]">
                      {locale === "en" ? "QUESTION" : "QUESTION"}
                    </p>
                    <h3 className="mt-1 text-2xl sm:text-3xl font-display font-bold text-[#f7ecd8]">
                      {locale === "en" ? "Ask your tarot question" : "輸入你的塔羅問題"}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#c8c3df]">
                      {locale === "en"
                        ? "Be specific: relationship, career, money, decision, or near-future direction."
                        : "問題越具體，牌面越容易給到清楚方向：感情、事業、財運、選擇或近期走勢都可以。"}
                    </p>
                  </div>
                </div>
                <span className="w-fit rounded-2xl border border-[#b99a6240] bg-[#15111a] px-5 py-3 text-sm font-bold leading-tight text-[#e2d6be] shadow-[0_0_18px_rgba(212,168,83,0.08)]">
                  {locale === "en" ? `${activeSpread.count} cards selected` : `已選：${activeSpread.count} 張牌`}
                </span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-5 text-2xl font-bold text-[#d1b06f]">?</span>
                <textarea
                  value={question}
                  onChange={e => {
                    setQuestion(e.target.value);
                    setDrawnCards([]);
                    setShowReading(false);
                  }}
                  placeholder={
                    locale === "en"
                      ? "Example: What is the next step in this relationship? What should I pay attention to this month?"
                      : "例如：這段關係接下來會怎麼發展？我這個月需要注意什麼？"
                  }
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[#8f7a5258] bg-[#141421]/96 py-5 pl-14 pr-5 text-[17px] font-semibold leading-7 text-[#f0e6d3] placeholder-[#8f8aa380] outline-none shadow-[inset_0_0_0_1px_rgba(185,154,98,0.06),0_0_18px_rgba(185,154,98,0.06)] transition-colors focus:border-[#d1b06f] focus:bg-[#171723] focus:placeholder-[#9d98b080]"
                />
              </div>
              <div className="relative mt-4">
                <p className="mb-3 text-xs font-bold tracking-[0.18em] text-[#d1b06f]">
                  {locale === "en" ? "QUICK QUESTIONS" : "快速提問"}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(locale === "en"
                    ? ["What does he/she really think?", "Will my career improve soon?", "What should I do next?"]
                    : ["對方現在怎麼想？", "近期事業會變好嗎？", "我下一步該怎麼做？"]).map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuestion(example);
                        setDrawnCards([]);
                        setShowReading(false);
                      }}
                      className="rounded-full border border-[#b99a6240] bg-[#15111a] px-4 py-2 text-sm font-semibold text-[#e2d6be] transition-colors hover:border-[#b99a6288] hover:bg-[#1d1720]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden rounded-[28px] border-2 border-[#c99aa624] bg-[#0c0c16]/88 p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold tracking-[0.14em] text-[#c99aa6] uppercase">
                    {locale === "en" ? "Idol Tarot Topics" : "愛豆占卜主題"}
                  </p>
                  <p className="mt-1 text-xs text-[#8a8aad]">
                    {locale === "en" ? "Pick the scene first, then choose the spread that matches your question." : "先選追星場景，再用對應牌陣看具體走向。"}
                  </p>
                </div>
                <span className="hidden sm:inline-flex rounded-full border border-[#c99aa630] bg-[#c99aa610] px-3.5 py-1.5 text-xs font-bold text-[#d8b8c0]">
                  {locale === "en" ? "Fan-focused" : "追星專屬"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {idolCategories.map((cat, catIdx) => {
                  const Icon = cat.icon;
                  const isSelected = idolCategory === cat.key;
                  const label = locale === "zh-TW" ? cat.labelZh : cat.labelEn;
                  const desc = locale === "zh-TW" ? cat.descZh : cat.descEn;
                  const tags = cat.key === "fansign"
                    ? ["名額", "排位", "互動"]
                    : cat.key === "concert"
                    ? ["搶票", "座位", "應援"]
                    : ["回歸", "曝光", "事業"];
                  return (
                    <div key={cat.key}
                      className={`group relative min-h-[152px] overflow-hidden rounded-2xl p-4 border transition-all hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-[#c99aa6] bg-gradient-to-br from-[#241923] via-[#171623] to-[#0f0f1a] shadow-[0_14px_36px_rgba(255,182,193,0.12)] ring-1 ring-[#c99aa628]"
                          : "border-[#b99a621c] bg-gradient-to-br from-[#151520]/96 to-[#0f0f1a]/92 hover:border-[#c99aa655]"
                      }`}>
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#c99aa60a] blur-2xl" />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#b99a62] via-[#c99aa6] to-transparent opacity-60" />
                      <button
                        onClick={() => {
                          setIdolCategory(cat.key);
                          if (cat.key === "idol-draw") setSelectedSpread("five");
                          else if (selectedSpread === "five") setSelectedSpread("three");
                          setDrawnCards([]);
                          setShowReading(false);
                        }}
                        className="relative flex h-full w-full flex-col text-left"
                      >
                        <div className="mb-2.5 flex items-start justify-between gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                            isSelected ? "bg-[#c99aa6] border-[#c99aa6] text-[#0a0a0f]" : "bg-[#1a1a2e] border-[#b99a6228] text-[#b99a62]"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-right">
                            <span className="block font-display text-2xl font-bold leading-none text-[#b99a6218]">
                              {String(catIdx + 1).padStart(2, "0")}
                            </span>
                            {isSelected && <span className="mt-0.5 inline-flex rounded-full bg-[#c99aa6] px-2 py-0.5 text-[8px] font-bold text-[#0a0a0f]">SELECTED</span>}
                          </div>
                        </div>
                        <p className="font-display text-lg font-bold text-[#f0e6d3]">{label}</p>
                        <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-[#a2a2c3]">{desc}</p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {tags.map(tag => (
                            <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                              isSelected ? "border-[#c99aa634] bg-[#c99aa612] text-[#d8b8c0]" : "border-[#b99a6218] bg-[#b99a6208] text-[#b99a62]"
                            }`}>{tag}</span>
                          ))}
                        </div>
                        <div className="mt-auto pt-2.5 text-[11px] text-[#8a8aad88]">
                          {cat.key === "idol-draw"
                            ? (locale === "en" ? "Recommended: five-card panorama" : "建議使用：五張追星全景")
                            : (locale === "en" ? "Recommended: three-card event flow" : "建議使用：三張現場運")}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-5 overflow-hidden rounded-3xl border-2 border-[#c99aa645] bg-gradient-to-br from-[#1a1119]/96 via-[#10101d]/96 to-[#090911]/96 p-4 sm:p-5 shadow-[0_0_36px_rgba(255,182,193,0.10)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b99a62] via-[#c99aa6] to-[#b99a62]" />
                <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#c99aa612] blur-3xl" />
                <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c99aa644] bg-[#c99aa615] text-[#c99aa6]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#d8c2c8]">
                        {locale === "en" ? "Ask your idol tarot question" : "輸入你的愛豆塔羅問題"}
                      </p>
                      <p className="mt-1 text-sm text-[#b7b2d6]">
                      {idolCategory === "fansign"
                        ? (locale === "en" ? "Selected: Fansign Fortune" : "已選：簽售運勢")
                        : idolCategory === "concert"
                        ? (locale === "en" ? "Selected: Concert Direction" : "已選：演唱會應援方位")
                        : (locale === "en" ? "Selected: Idol Career Reading" : "已選：愛豆事業占卜")}
                      </p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full border border-[#c99aa644] bg-[#c99aa616] px-4 py-2 text-xs font-bold text-[#d8b8c0] shadow-[0_0_18px_rgba(255,182,193,0.08)]">
                    {locale === "en" ? "Select a topic above first" : "先選上方主題，再輸入問題"}
                  </span>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#b99a62]">?</span>
                  <input
                    type="text"
                    value={activeQuestion}
                    onChange={e => {
                      const value = e.target.value;
                      const category = idolCategory || "fansign";
                      setIdolCategory(category);
                      setIdolQuestions(prev => ({ ...prev, [category]: value }));
                      setDrawnCards([]);
                      setShowReading(false);
                    }}
                    placeholder={
                      idolCategory === "fansign"
                        ? (locale === "en" ? "Example: Will I get a good fansign queue number this time?" : "例如：這次簽售能拿到好名次嗎？對方會記得我嗎？")
                        : idolCategory === "concert"
                        ? (locale === "en" ? "Example: How is my ticketing / seat / fan support luck this time?" : "例如：這次搶票能成功嗎？座位視野和現場運勢如何？")
                        : (locale === "en" ? "Example: How will this comeback perform? Will exposure increase?" : "例如：這次回歸熱度如何？後續資源和曝光會變好嗎？")
                    }
                    className="w-full rounded-2xl border-2 border-[#9f7c8548] bg-[#11111d] py-5 pl-10 pr-4 text-lg font-medium text-[#e9ddc9] placeholder-[#8f8aa388] outline-none shadow-[inset_0_0_0_1px_rgba(201,154,166,0.06),0_0_18px_rgba(201,154,166,0.06)] transition-colors focus:border-[#c99aa6] focus:bg-[#151523] focus:placeholder-[#8a8aad77]"
                  />
                </div>
                <div className="relative mt-4">
                  <p className="mb-2 text-xs font-bold tracking-[0.12em] text-[#b99a62]">
                    {locale === "en" ? "QUICK QUESTIONS" : "快速提問"}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                  {(idolCategory === "fansign"
                    ? ["這次簽售能進嗎？", "排位會靠前嗎？", "互動氛圍會好嗎？"]
                    : idolCategory === "concert"
                    ? ["這次搶票能成功嗎？", "座位運勢如何？", "應援現場會順利嗎？"]
                    : ["這次回歸熱度如何？", "後續資源會變好嗎？", "團隊曝光會上升嗎？"]).map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        const category = idolCategory || "fansign";
                        setIdolCategory(category);
                        setIdolQuestions(prev => ({ ...prev, [category]: example }));
                        setDrawnCards([]);
                      setShowReading(false);
                    }}
                      className="rounded-full border border-[#b99a6240] bg-[#b99a6212] px-4 py-2 text-sm font-semibold text-[#cdbb98] transition-colors hover:border-[#b99a6288] hover:bg-[#b99a6220]"
                    >
                      {example}
                    </button>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => drawCards()}
            disabled={isDrawing || (tarotMode === "classic" ? !question.trim() : (!idolCategory || !activeQuestion.trim()))}
            className={`${tarotMode === "idol" ? "hidden" : "flex"} w-full max-w-xl mx-auto mt-6 px-6 py-4 bg-gradient-to-r from-[#b99a62] to-[#c9953a] text-[#0a0a0f] rounded-xl text-base font-bold hover:from-[#e0b860] hover:to-[#b99a62] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 items-center justify-center gap-2.5`}>
            {isShuffling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isShuffling ? (locale === "zh-TW" ? "洗牌中..." : locale === "zh-TW" ? "洗牌中..." : "Shuffling...") : `${t("tarot.draw")} · ${activeSpread.count}${locale === "en" ? " Cards" : "張"}`}
          </button>
        </div>
          </>
        )}

        {tarotPageView === "result" && (
          <div className="mx-auto mb-8 max-w-4xl rounded-[28px] border border-[#b99a6230] bg-[#080810]/92 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <button
              type="button"
              onClick={() => {
                pendingDrawRef.current = null;
                setTarotPageView("form");
                setIsDrawing(false);
                setIsShuffling(false);
                setDrawnCards([]);
                setShowReading(false);
              }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b99a6240] bg-[#15111a] px-4 py-2 text-sm font-bold text-[#e2d6be] transition-colors hover:border-[#d1b06f88] hover:bg-[#1d1720]"
            >
              ← {locale === "en" ? "Back to draw" : "返回重抽"}
            </button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b99a62]">
                  {locale === "en" ? "Tarot Result" : "TAROT RESULT"}
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold text-[#f7ecd8]">
                  {resultMode === "idol"
                    ? (locale === "en" ? "Idol Dual Tarot Draw" : "愛豆雙牌占卜")
                    : (locale === "en" ? "Waite + Ziwei Dual Draw" : "西塔 × 紫微雙牌占卜")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#aaa6c8]">
                  {pendingDraw?.idolName ? `${pendingDraw.idolName} · ` : ""}{resultUserQuestion || resultQuestion || (locale === "en" ? "Quick one-card reading" : "快速一張牌解讀")}
                </p>
                {resultMode === "idol" && resultIdolSingleType && <p className="mt-2 text-xs font-bold text-[#d7b8c4]">{getIdolTarotScene(resultIdolSingleType).title[idolLocale]} · {new Date().toLocaleString(locale === "en" ? "en" : "zh-TW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
              </div>
              <span className="w-fit rounded-full border border-[#b99a6248] bg-[#15111a] px-4 py-2 text-sm font-bold text-[#dfc894]">
                {locale === "en" ? `Ziwei + ${resultSpread.count} Tarot` : `紫微 1 張 + 塔羅 ${resultSpread.count} 張`}
              </span>
            </div>
          </div>
        )}

        {/* Shuffle Animation */}
        {isShuffling && (
          <div className="flex justify-center mb-12">
            <ShuffleAnimation onComplete={handleShuffleComplete} />
          </div>
        )}

        {/* Dual Card Display */}
        {drawnZiweiCard && drawnCards.length > 0 && !isDrawing && (
          <div className="mx-auto mb-8 max-w-4xl rounded-[28px] border border-[#c99aa638] bg-gradient-to-br from-[#1a1018]/92 via-[#10101b]/92 to-[#08080f]/92 p-4 sm:p-5 shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99aa6]">
                  {locale === "en" ? "Dual Draw" : "雙牌同抽"}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#f7ecd8]">
                  {locale === "en" ? "Ziwei as the root, Waite as the movement" : "紫微為體，西塔為用"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#aaa6c8]">
                  {locale === "en"
                    ? "The Ziwei card reads the inner root of the matter; the Waite spread reads the visible trend."
                    : "紫微牌看事件根基與長期底色，韋特塔羅看當下走向與外在結果。"}
                </p>
              </div>
              <span className="w-fit rounded-full border border-[#c99aa644] bg-[#c99aa612] px-3 py-1.5 text-xs font-bold text-[#ffd4e4]">
                {hasFullAnalysisAccess
                  ? (locale === "en" ? "Full reading active" : "完整解析已開啟")
                  : (locale === "en" ? "Analysis coming soon" : "解析即將上線")}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-3xl border border-[#d1b06f30] bg-[#08080f]/70 p-3">
                    <p className="mb-2 text-xs font-bold text-[#d1b06f]">{locale === "en" ? "Core Situation · Ziwei Tarot" : "核心局勢 · 紫微塔羅"}</p>
                <div className="grid grid-cols-[92px_1fr] gap-3 sm:grid-cols-1">
                  <img src={drawnZiweiCard.image} alt={localizedZiwei?.name || drawnZiweiCard.name} className="aspect-[2/3] w-full rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-display text-2xl font-bold text-[#f7ecd8]">{localizedZiwei?.name || drawnZiweiCard.name}</h4>
                    <p className="mt-1 text-xs leading-5 text-[#d8c6a4]">{localizedZiwei?.traits.join(" · ") || localizedText(drawnZiweiCard.traits.join(" · "), locale)}</p>
                    <p className="mt-3 text-sm leading-6 text-[#aaa6c8]">{localizedZiwei?.meaning || localizedText(drawnZiweiCard.bodyMeaning, locale)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-[#8a8aad24] bg-[#10101b]/72 p-3">
                    <p className="mb-2 text-xs font-bold text-[#b99a62]">{locale === "en" ? "Emotion & Action · Rider–Waite" : "情緒與行動 · 韋特塔羅"}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {drawnCards.map((card, idx) => (
                    <div key={card.id} className="rounded-2xl border border-[#b99a6218] bg-[#08080f]/68 p-2">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                        <img
                          src={`/tarot/${card.id}.jpg`}
                          alt={locale === "en" ? card.name : localizedText(card.nameCn, locale)}
                          className={`h-full w-full object-cover ${card.reversed ? "rotate-180" : ""}`}
                          loading="eager"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-[9px] font-bold text-[#b99a62]">{resultPositionLabels[idx] || `Card ${idx + 1}`}</p>
                          <p className="text-xs font-bold text-[#f0e6d3]">{locale === "en" ? card.name : localizedText(card.nameCn, locale)}{card.reversed ? (locale === "en" ? " · R" : " · 逆") : ""}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Display */}
        {drawnCards.length > 0 && !isDrawing && (
          <div className="hidden flex-wrap justify-center items-start gap-4 sm:gap-6 mb-12">
            {drawnCards.map((card, idx) => (
              <div key={card.id} className="group">
                <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-[#b99a6233] shadow-lg shadow-[#b99a6210]"
                  style={{ opacity: 0, animation: `cardDeal 0.6s ease-out ${idx * 0.3}s forwards` }}>
                  <img src={`/tarot/${card.id}.jpg`} alt={card.nameCn}
                    className={`w-full h-full object-cover ${card.reversed ? "rotate-180" : ""}`}
                    loading="eager"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[10px] text-[#b99a62] uppercase tracking-wider">
                      {resultPositionLabels[idx] || (locale === "en" ? `Card ${idx + 1}` : `第 ${idx + 1} 张`)}
                      {card.reversed && <span className="ml-1 text-[8px] text-rose-400">(R)</span>}
                    </span>
                    <p className="text-xs font-semibold text-[#f0e6d3]">{card.nameCn}</p>
                    <p className="text-[9px] text-[#8a8aad]">{card.name}</p>
                  </div>
                  {card.suit !== "major" && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#b99a6222] rounded text-[8px] text-[#b99a62] capitalize">{card.suit}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reading Result */}
        {showReading && drawnCards.length > 0 && (
          <div className="max-w-4xl mx-auto glass rounded-[28px] border border-[#b99a6220] p-5 sm:p-6 animate-fade-in">
            {idolSingleReading && (
              <div className="mb-5 overflow-hidden rounded-[24px] border border-[#d49ab24a] bg-gradient-to-br from-[#1b111b]/92 via-[#10101b]/92 to-[#08080f]/92 p-4 sm:p-5 shadow-[0_18px_42px_rgba(212,154,178,0.10)]">
                <div className="mb-4 flex flex-col gap-3 border-b border-[#d49ab21d] pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d49ab2]">
                      {locale === "en" ? "Idol Tarot AI Reading" : "愛豆塔羅標準解讀"}
                    </p>
                    <h4 className="mt-1 font-display text-2xl font-bold text-[#f7ecd8]">
                      {localizedText(idolSingleReading.title, locale)}
                    </h4>
                    {resultUserQuestion && (
                      <p className="mt-2 rounded-full border border-[#d49ab22f] bg-[#d49ab210] px-3 py-1.5 text-xs font-semibold text-[#ffd4e4]">
                        {locale === "en" ? "Your question: " : "你的問題："}{resultUserQuestion}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyTarotResult}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d49ab240] bg-[#d49ab214] px-3.5 py-2 text-xs font-black text-[#ffd4e4] transition-colors hover:border-[#ffd4e485] hover:bg-[#d49ab226]"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {resultCopied ? (locale === "en" ? "Copied" : "已複製") : (locale === "en" ? "Copy Result" : "複製結果")}
                    </button>
                    <button
                      type="button"
                      onClick={resetToIdolSingleDraw}
                      className="inline-flex items-center gap-2 rounded-full border border-[#b99a6240] bg-[#15111a] px-3.5 py-2 text-xs font-black text-[#e2d6be] transition-colors hover:border-[#d1b06f88] hover:bg-[#1d1720]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {locale === "en" ? "Draw Again" : "再抽一次"}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-[#d1b06f38] bg-[#d1b06f12] px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d1b06f]">{locale === "en" ? "Card signals" : "牌面關鍵詞"}</p><p className="mt-1.5 text-sm font-bold leading-7 text-[#f7ecd8]">{drawnCards[0] ? localizedText(getCardKeywords(drawnCards[0], locale).slice(0, 4).join(" · "), locale) : ""}</p></div>
                  <div className="rounded-2xl border border-[#d49ab21d] bg-[#08080f]/58 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d49ab2]">{locale === "en" ? "First insight" : "初步結論"}</p><p className="mt-1.5 text-sm leading-7 text-[#d8d2ec]">{idolFreeResult?.summary || localizedText(conversionFreeSummary, locale)}</p></div>
                </div>
              </div>
            )}

            <div className={`${idolSingleReading ? "hidden" : "grid"} gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
              {drawnCards.map((card, idx) => (
                <div key={card.id} className="rounded-2xl border border-[#b99a6218] bg-[#10101b]/78 p-4">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#b99a62] uppercase">
                    {localizedText(resultPositionLabels[idx] || (locale === "en" ? `Card ${idx + 1}` : `第 ${idx + 1} 張`), locale)}
                  </p>
                  <h4 className="mt-1 text-base font-bold text-[#f0e6d3]">
                    {localizedText(card.nameCn, locale)}
                    {card.reversed && <span className="text-rose-300 ml-1 text-xs">({locale === "en" ? "Reversed" : "逆位"})</span>}
                  </h4>
                  {card.suit !== "major" && <p className="mt-0.5 text-[10px] capitalize text-[#8a8aad66]">{card.suit}</p>}
                  <p className="mt-3 text-sm text-[#aaa6c8] leading-7">
                    {localizedText(getCompactCardPreview({
                      card,
                      question: resultQuestion,
                      locale: locale as "zh-TW" | "zh" | "en",
                      mode: resultMode,
                      category: resultCategory,
                    }), locale)}
                  </p>
                </div>
              ))}
            </div>

            <TarotAIPromptBox
              locale={locale}
              mode={resultMode}
              category={resultCategory}
              question={resultQuestion}
              spread={resultSpread}
              cards={drawnCards}
              ziwei={drawnZiweiCard}
              dualReading={dualReading}
              promptOverride={resultMode === "idol" && resultIdolSingleType && drawnZiweiCard && drawnCards[0] && localizedZiwei ? buildIdolAiPrompt({ locale: idolLocale, scene: getIdolTarotScene(resultIdolSingleType), question: resultUserQuestion || resultQuestion, context: pendingDraw?.idolContext, ziweiCard: { name: localizedZiwei.name, traits: localizedZiwei.traits }, tarotCard: { name: locale === "en" ? drawnCards[0].name : localizedText(drawnCards[0].nameCn, locale), orientation: locale === "en" ? (drawnCards[0].reversed ? "reversed" : "upright") : (drawnCards[0].reversed ? "逆位" : "正位"), keywords: getCardKeywords(drawnCards[0], locale).slice(0, 4) } }) : undefined}
              className="mt-5"
            />

            {/* Comprehensive guidance */}
            {hasFullAnalysisAccess ? (
              <div className="mt-6 pt-4 border-t border-[#b99a6210]">
                {resultMode === "idol" && resultIdolSingleType && drawnZiweiCard && drawnCards[0] && dualReading && localizedZiwei && <IdolFullReportContent locale={idolLocale} sceneType={resultIdolSingleType} question={resultUserQuestion || resultQuestion} ziweiName={localizedZiwei.name} ziweiMeaning={localizedZiwei.meaning} tarotName={locale === "en" ? drawnCards[0].name : localizedText(drawnCards[0].nameCn, locale)} tarotOrientation={locale === "en" ? (drawnCards[0].reversed ? "Reversed" : "Upright") : (drawnCards[0].reversed ? "逆位" : "正位")} tarotSignal={localizedText(getCompactCardPreview({ card: drawnCards[0], question: resultQuestion, locale: locale as "zh-TW" | "zh" | "en", mode: "idol", category: resultCategory }), locale)} headline={idolFreeResult?.headline || localizedText(dualReading.headline, locale)} crossReading={locale === "en" ? (idolSingleReading?.lines || [idolFreeResult?.summary || ""]) : dualReading.deep.map((line) => localizedText(line, locale))} actions={idolFreeResult?.actions || dualReading.actions.map((line) => localizedText(line, locale))} />}
                <h4 className={`${resultMode === "idol" && resultIdolSingleType ? "hidden" : ""} text-xl font-display font-bold text-[#f7d9a8] mb-4`}>
                  {resultMode === "idol"
                    ? (resultCategory === "idol-draw"
                        ? (locale === "zh-TW" ? "✨ 藝人事業牌組總結" : "✨ Artist Career Spread Summary")
                        : (locale === "zh-TW" ? "✨ 追星牌組整體總結" : "✨ Idol Spread Summary"))
                    : (locale === "zh-TW" ? "✨ 牌組整體總結" : "✨ Spread Summary")}
                </h4>
                {resultMode === "idol" && resultIdolSingleType ? null : resultMode === "classic" ? (
                  <ClassicAIReading cards={drawnCards} question={resultQuestion} locale={locale as "zh-TW" | "zh" | "en"} spread={resultSpread} />
                ) : resultMode === "idol" && resultCategory ? (
                  <ClassicAIReading
                    cards={drawnCards}
                    question={resultQuestion}
                    locale={locale as "zh-TW" | "zh" | "en"}
                    spread={resultSpread}
                    scenarioOverride={detectIdolScenario(resultCategory, resultQuestion)}
                  />
                ) : (
                <p className="text-sm text-[#8a8aad] leading-relaxed">
                  {(() => {
                    const interpretations: Record<string, string> = {
                      love: "In matters of love...",
                      career: "In your career...",
                      health: "For health...",
                      wealth: "Financially...",
                      spirit: "On a spiritual level...",
                      relation: "In relationships...",
                    };
                    const keys = Object.keys(interpretations);
                    return interpretations[keys[drawnCards.reduce((s, c) => s + c.id, 0) % keys.length]];
                  })()}
                </p>
                )}
                {dualReading && !(resultMode === "idol" && resultIdolSingleType) && (
                  <div className="mt-5 rounded-[24px] border border-[#c99aa62a] bg-[#0f0f18]/88 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99aa6]">
                      {locale === "en" ? "Ziwei + Waite Deep Link" : "紫微 × 西塔深度聯動"}
                    </p>
                    <div className="mt-3 grid gap-3">
                      {dualReading.deep.map((line, idx) => (
                        <p key={idx} className="rounded-2xl border border-[#b99a6214] bg-[#08080f]/64 px-4 py-3 text-sm leading-7 text-[#e7ddcb]">{line}</p>
                      ))}
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#d1b06f2a] bg-[#d1b06f10] px-4 py-3">
                      <p className="text-xs font-bold text-[#d1b06f]">{locale === "en" ? "Action Guide" : "行動指引"}</p>
                      <ul className="mt-2 space-y-2">
                        {dualReading.actions.map((action, idx) => (
                          <li key={idx} className="text-sm leading-6 text-[#f2e7d2]">{idx + 1}. {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {currentFullAnalysisFree && (
                  <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/8 px-4 py-3 text-center text-xs font-semibold text-emerald-200">
                    {locale === "en"
                      ? "This is your complimentary full interpretation. Future full interpretations will open after payment launches."
                      : "這是贈送的 1 次完整解析體驗。後續完整解析將在支付功能上線後開放。"}
                  </div>
                )}
              </div>
            ) : (
              resultMode === "idol" && resultIdolSingleType && drawnZiweiCard && drawnCards[0] ? <IdolPaidReading
                locale={idolLocale}
                sceneType={resultIdolSingleType}
                question={resultUserQuestion || resultQuestion}
                freeSummary={idolFreeResult?.summary || localizedText(conversionFreeSummary, locale)}
                unresolvedQuestion={idolFreeResult?.unresolved || localizedText(conversionUnresolved, locale)}
                cards={{ ziwei: localizedZiwei?.name || localizedText(drawnZiweiCard.name, locale), tarot: locale === "en" ? drawnCards[0].name : localizedText(drawnCards[0].nameCn, locale), orientation: locale === "en" ? (drawnCards[0].reversed ? "Reversed" : "Upright") : (drawnCards[0].reversed ? "逆位" : "正位") }}
                sessionId={currentSessionId}
                isFirstPurchase={isFirstPurchase}
                isPaid={false}
                onUnlock={() => setShowPaymentModal(true)}
                onFollowup={handlePaidReadingFollowup}
              /> : <PaidReadingConversion
                scene={resultScene}
                question={resultUserQuestion || resultQuestion}
                freeSummary={conversionFreeSummary}
                unresolvedQuestion={conversionUnresolved}
                cards={drawnCards.map((card, index) => ({
                  name: card.nameCn,
                  orientation: card.reversed ? "逆位" : "正位",
                  position: resultPositionLabels[index],
                }))}
                sessionId={currentSessionId}
                spreadType={resultSpread.key}
                isFirstPurchase={isFirstPurchase}
                isPaid={hasFullAnalysisAccess}
                onUnlock={() => setShowPaymentModal(true)}
                onFollowup={handlePaidReadingFollowup}
              />
            )}

            {hasFullAnalysisAccess && (
              resultMode === "idol" && resultIdolSingleType && drawnZiweiCard && drawnCards[0] ? <IdolPaidReading
                locale={idolLocale}
                sceneType={resultIdolSingleType}
                question={resultUserQuestion || resultQuestion}
                freeSummary={idolFreeResult?.summary || localizedText(conversionFreeSummary, locale)}
                unresolvedQuestion={idolFreeResult?.unresolved || localizedText(conversionUnresolved, locale)}
                cards={{ ziwei: localizedZiwei?.name || localizedText(drawnZiweiCard.name, locale), tarot: locale === "en" ? drawnCards[0].name : localizedText(drawnCards[0].nameCn, locale), orientation: locale === "en" ? (drawnCards[0].reversed ? "Reversed" : "Upright") : (drawnCards[0].reversed ? "逆位" : "正位") }}
                sessionId={currentSessionId}
                isFirstPurchase={isFirstPurchase}
                isPaid
                onUnlock={() => {}}
                onFollowup={handlePaidReadingFollowup}
              /> : <PaidReadingConversion
                scene={resultScene}
                question={resultUserQuestion || resultQuestion}
                freeSummary={conversionFreeSummary}
                unresolvedQuestion={conversionUnresolved}
                cards={drawnCards.map((card, index) => ({
                  name: card.nameCn,
                  orientation: card.reversed ? "逆位" : "正位",
                  position: resultPositionLabels[index],
                }))}
                sessionId={currentSessionId}
                spreadType={resultSpread.key}
                isFirstPurchase={isFirstPurchase}
                isPaid
                onUnlock={() => {}}
                onFollowup={handlePaidReadingFollowup}
              />
            )}

            {hasFullAnalysisAccess && (
              <div className="mt-4 p-3 bg-[#b99a6208] border border-[#b99a6215] rounded-lg">
                <p className="text-xs text-[#b99a62] text-center flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" />
                  {locale === "en" ? "Full interpretation available" : "完整解析已開啟"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share row — visible after reading */}
      {showReading && drawnCards.length > 0 && (
        <div className="max-w-2xl mx-auto mt-4 glass rounded-xl p-4 border border-[#b99a6210]">
          <p className="text-[10px] text-[#8a8aad] text-center mb-2 uppercase tracking-wider">
            {locale === "zh-TW" ? "分享你的塔羅解讀" : "Share Your Reading"}
          </p>
          <TarotShareRow locale={locale} />
        </div>
      )}

      {/* ===== Guest login prompt: shown after each free draw (not blocking) ===== */}
      {false && !PREVIEW_FULL_TAROT && showReading && drawnCards.length > 0 && !isAuthenticated && guestModeRemaining > 0 && (
        <div className="max-w-2xl mx-auto mt-3 glass rounded-xl p-4 border border-[#c99aa620] bg-[#c99aa605] animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <UserPlus className="w-4 h-4 text-[#c99aa6] flex-shrink-0" />
              <p className="text-xs text-[#f0e6d3] truncate">
                {locale === "zh-TW"
                  ? `${tarotMode === "idol" ? "Idol占卜" : "經典塔羅"} 還有 ${guestModeRemaining} 次免費 · 註冊解鎖更多，每邀請 3 位好友額外贈 1 次`
                  : locale === "zh"
                  ? `${tarotMode === "idol" ? "Idol占卜" : "经典塔罗"} 还有 ${guestModeRemaining} 次免费 · 注册解锁更多，每邀请 3 位好友额外赠 1 次`
                  : `${tarotMode === "idol" ? "Idol" : "Classic"} tarot: ${guestModeRemaining} free left · Register to unlock more, +1 per 3 invited friends`}
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gradient-to-r from-[#c99aa6] to-[#FF8FA8] text-[#0a0a0f] rounded-lg text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex-shrink-0"
            >
              {locale === "zh-TW" ? "註冊 / 登錄" : locale === "zh" ? "注册 / 登录" : "Register / Login"}
            </button>
          </div>
        </div>
      )}

      {/* ===== Lock Modal: Step 1 - choices ===== */}
      {false && !PREVIEW_FULL_TAROT && showLockModal && !showInviteCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)} />
          <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#b99a6220] shadow-2xl animate-fade-in-up text-center">
            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]"><X className="w-4 h-4" /></button>
            <div className="w-14 h-14 rounded-full bg-[#b99a6210] flex items-center justify-center mx-auto mb-4 border border-[#b99a6220]">
              <Lock className="w-7 h-7 text-[#b99a62]" />
            </div>
            <h3 className="text-lg font-bold text-[#f0e6d3] mb-2">
              {locale === "zh-TW" ? "免費次數已耗盡" : locale === "zh" ? "免费次数已用完" : "Free Draws Exhausted"}
            </h3>
            <p className="text-xs text-[#8a8aad] mb-6">
              {locale === "zh-TW"
                ? "免費 3 次占卜已耗盡，註冊帳號或邀請新用戶解鎖抽牌"
                : locale === "zh"
                ? "免费 3 次占卜已用完，注册账号或邀请好友注册即可解锁更多测算次数"
                : "Your 3 free readings are used up. Register or invite new users to unlock more draws"}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowLockModal(false); navigate("/login"); }}
                className="w-full py-3 bg-gradient-to-r from-[#b99a62] to-[#c9953a] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#e0b860] hover:to-[#b99a62] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {locale === "zh-TW" ? "去註冊" : locale === "zh" ? "去注册" : "Register"}
              </button>
              <button
                onClick={generateShareCode}
                className="w-full py-3 bg-[#151520] border border-[#b99a6222] text-[#f0e6d3] rounded-xl text-sm font-medium hover:border-[#b99a6255] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {locale === "zh-TW" ? "去邀請好友" : locale === "zh" ? "去邀请好友" : "Invite Friends"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Lock Modal: Step 2 - invite code ===== */}
      {false && !PREVIEW_FULL_TAROT && showLockModal && showInviteCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={() => { setShowInviteCode(false); setShowLockModal(false); }} />
          <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#b99a6220] shadow-2xl animate-fade-in-up text-center">
            <button onClick={() => { setShowInviteCode(false); setShowLockModal(false); }} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]"><X className="w-4 h-4" /></button>
            <div className="w-14 h-14 rounded-full bg-[#c99aa610] flex items-center justify-center mx-auto mb-4 border border-[#c99aa620]">
              <Share2 className="w-7 h-7 text-[#c99aa6]" />
            </div>
            <h3 className="text-lg font-bold text-[#f0e6d3] mb-2">
              {locale === "zh-TW" ? "你的專屬邀請碼" : locale === "zh" ? "你的专属邀请码" : "Your Invite Code"}
            </h3>
            <p className="text-xs text-[#8a8aad] mb-4">
              {locale === "zh-TW"
                ? "好友透過此碼註冊，每滿 3 人你將自動獲得 +1 次免費抽牌"
                : locale === "zh"
                ? "好友通过此码注册，每满 3 人你将自动获得 +1 次免费抽牌"
                : "Friends who register with this code earn you +1 free draw per 3 signups"}
            </p>
            {/* Invite code display */}
            <div className="bg-[#151520] rounded-xl p-4 mb-3 border border-[#b99a6215]">
              <p className="text-[10px] text-[#8a8aad44] mb-2 uppercase tracking-wider">
                {locale === "zh-TW" ? "邀請碼" : locale === "zh" ? "邀请码" : "Invite Code"}
              </p>
              <p className="text-2xl font-display font-bold text-[#c99aa6] tracking-widest select-all">{inviteCode}</p>
              <p className="text-[9px] text-[#8a8aad44] mt-2 break-all">{inviteLink}</p>
            </div>
            <button
              onClick={copyInviteLink}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                inviteCopied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gradient-to-r from-[#c99aa6] to-[#FF8FA8] text-[#0a0a0f] hover:from-[#FFC4CF] hover:to-[#FFA0B5]"
              }`}
            >
              {inviteCopied ? (
                <><Check className="w-4 h-4" /> {locale === "zh-TW" ? "已複製" : locale === "zh" ? "已复制" : "Copied!"}</>
              ) : (
                <><Share2 className="w-4 h-4" /> {locale === "zh-TW" ? "複製邀請連結" : locale === "zh" ? "复制邀请链接" : "Copy Invite Link"}</>
              )}
            </button>
            <button
              onClick={() => setShowInviteCode(false)}
              className="w-full py-2.5 text-xs text-[#8a8aad] hover:text-[#f0e6d3] transition-colors mt-1"
            >
              {locale === "zh-TW" ? "返回上一步" : locale === "zh" ? "返回上一步" : "Go Back"}
            </button>
          </div>
        </div>
      )}

      <PayModal
        isOpen={!PREVIEW_FULL_TAROT && showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaid={() => {
          setIsUnlocked(true);
          try {
            const saved = JSON.parse(localStorage.getItem(LAST_TAROT_RESULT_KEY) || "{}");
            localStorage.setItem(LAST_TAROT_RESULT_KEY, JSON.stringify({ ...saved, isUnlocked: true }));
          } catch {}
          // Record into the user's "My Reports" history (with tarot_ prefix for clarity)
          try {
            addReportHistory({
              reportKey: `tarot_${currentSessionId}`,
              reportType: "tarot",
              summary: (resultUserQuestion || resultQuestion || "").slice(0, 80),
            });
          } catch {}
          trackEvent("payment_success", {
            scene_type: resultScene,
            spread_type: resultSpread.key,
            user_type: isAuthenticated ? "member" : "guest",
            is_first_purchase: isFirstPurchase,
            price: activePaidPlan.priceCny,
            session_id: currentSessionId,
            question_length: (resultUserQuestion || resultQuestion).trim().length,
            source_page: "tarot_result",
          });
          if (resultMode === "idol" && resultIdolSingleType) {
            trackEvent("idol_payment_success", {
              scene_type: resultIdolSingleType,
              spread_type: "one",
              user_type: isAuthenticated ? "member" : "guest",
              is_first_purchase: isFirstPurchase,
              price: activePaidPlan.priceCny,
              session_id: currentSessionId,
              question_length: (resultUserQuestion || resultQuestion).trim().length,
              source_page: "idol_tarot_result",
            });
          }
        }}
        config={{
          ...PAYWALL_CONFIGS.tarot,
          reportKey: currentSessionId,
          amount: activePaidPlan.priceCny,
          title: resultMode === "idol" && resultIdolSingleType ? getIdolTarotScene(resultIdolSingleType).paywallTitle.en : resultSceneCopy.paywallTitle,
          titleZh: resultMode === "idol" && resultIdolSingleType ? getIdolTarotScene(resultIdolSingleType).paywallTitle["zh-TW"] : resultSceneCopy.paywallTitle,
          desc: resultSceneCopy.subtitle,
          descZh: resultSceneCopy.subtitle,
          includes: resultMode === "idol" && resultIdolSingleType ? getIdolTarotScene(resultIdolSingleType).benefits.en.join(" · ") : resultSceneCopy.benefits.join(" · "),
          includesZh: resultMode === "idol" && resultIdolSingleType ? getIdolTarotScene(resultIdolSingleType).benefits["zh-TW"].join(" · ") : resultSceneCopy.benefits.join(" · "),
        }}
      />
    </section>
  );
}
