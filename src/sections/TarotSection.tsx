import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Loader2, Eye, Unlock, Lock, Check, CreditCard, X, ShieldCheck, Heart, MapPin, Music, Mail, Send, UserPlus, Share2 } from "lucide-react";
import { TEST_MODE } from "@/const";
import { trpc } from "@/providers/trpc";
import { TAROT_CARDS, FREE_READING_LIMIT, UNLOCK_PRICE } from "@/data/tarotCards";
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal";
import { getIdolSceneReading, getMajorScene } from "@/data/idolTarotScenes";
import { getShareLink, getShareText } from "@/lib/share-points";
import { generateAIReading } from "@/lib/tarot-ai-reader";
import type { CardReading } from "@/lib/tarot-ai-reader";
import SubscriptionCard from "@/components/SubscriptionCard";

const IDOL_UNLOCK_PRICE = 5.99;

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
            className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg pl-8 pr-3 py-2.5 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144]"
          />
        </div>
        <button
          type="submit"
          disabled={!email.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-lg text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          {isZh ? "預約 $29.90" : "Book $29.90"}
        </button>
      </div>
      <p className="text-[9px] text-[#8a8aad33] text-center">
        {isZh ? "專業占星師 1v1 深度解讀 · 完整報告發送至郵箱 · 24 小時內送達" : "Professional 1v1 deep reading · Full report via email · Delivered within 24h"}
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
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up">
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
              <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-3 border border-[#d4a85320]"><Lock className="w-6 h-6 text-[#d4a853]" /></div>
              <h3 className="font-display text-lg font-bold text-[#f0e6d3]">{t("tarot.unlockTitle")}</h3>
              <p className="text-xs text-[#8a8aad] mt-1">{t("tarot.unlockDesc")}</p>
            </div>
            <div className="bg-[#151520] rounded-lg p-4 mb-5 border border-[#d4a85308]">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-[#8a8aad]">{t("tarot.serviceContent")}</span><span className="text-xs text-[#f0e6d3]">{t("tarot.threeCardReading")}</span></div>
              <div className="flex items-center justify-between mb-3"><span className="text-xs text-[#8a8aad]">{t("tarot.includes")}</span><span className="text-xs text-[#8a8aad55]">{t("tarot.includesDesc")}</span></div>
              <div className="border-t border-[#d4a85306] pt-3 flex items-center justify-between"><span className="text-sm text-[#f0e6d3] font-medium">{t("tarot.total")}</span><span className="text-2xl font-display font-bold text-[#d4a853]">${amount.toFixed(2)}</span></div>
            </div>
            <div className="space-y-2 mb-5">
              {["WeChat Pay", "Alipay"].map(m => (
                <button key={m} className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d4a85315] hover:border-[#d4a85340] transition-colors text-left"><CreditCard className="w-4 h-4 text-[#d4a853]" /><span className="text-xs text-[#f0e6d3]">{m}</span></button>
              ))}
            </div>
            <button onClick={handlePay} disabled={paying} className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
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

function ClassicAIReading({ cards, question, locale }: { cards: Array<typeof TAROT_CARDS[0] & { reversed: boolean }>; question: string; locale: "zh-TW" | "en" }) {
  const isZh = locale === "zh-TW";
  const reading = generateAIReading(
    cards.map(c => ({ card: c as any, reversed: c.reversed })),
    question, locale
  );

  return (
    <div className="space-y-4">
      {reading.cards.map((cr, idx) => (
        <div key={idx} className="bg-[#1e1e2a]/85 rounded-lg p-4 border border-[#d4a85315] space-y-3">
          <p className="text-xs font-semibold text-[#d4a853]">
            {[isZh ? "過去" : "Past", isZh ? "現在" : "Present", isZh ? "未來" : "Future"][idx]} · {cards[idx].nameCn}
            {cards[idx].reversed && <span className="text-rose-400 ml-1 text-[10px]">({isZh ? "逆位" : "R"})</span>}
          </p>
          {/* 本心状态 */}
          <div>
            <p className="text-[10px] text-[#8a8aad66] mb-0.5">{isZh ? "💭 本心狀態" : "💭 Inner State"}</p>
            <p className="text-xs text-[#f0e6d3]/90 leading-relaxed italic">{cr.heart.elegant}</p>
            <p className="text-[11px] text-[#8a8aad] mt-1">{cr.heart.plain}</p>
          </div>
          {/* 当下现状 */}
          <div>
            <p className="text-[10px] text-[#8a8aad66] mb-0.5">{isZh ? "🔍 當下現狀" : "🔍 Current Situation"}</p>
            <p className="text-xs text-[#f0e6d3]/90 leading-relaxed">{cr.situation.elegant}</p>
            <p className="text-[11px] text-[#8a8aad] mt-1">{cr.situation.plain}</p>
          </div>
          {/* 后期发展 */}
          <div>
            <p className="text-[10px] text-[#8a8aad66] mb-0.5">{isZh ? "🔮 後期發展" : "🔮 Future Development"}</p>
            <p className="text-xs text-[#f0e6d3]/90 leading-relaxed">{cr.future.elegant}</p>
            <p className="text-[11px] text-[#8a8aad] mt-1">{cr.future.plain}</p>
          </div>
          {/* 建议 */}
          <div>
            <p className="text-[10px] text-[#8a8aad66] mb-0.5">{isZh ? "💡 專屬建議" : "💡 Your Advice"}</p>
            <p className="text-xs text-[#d4a853] leading-relaxed">{cr.advice}</p>
          </div>
        </div>
      ))}
      {/* Overview */}
      <div className="bg-[#d4a85308] rounded-lg p-5 border-2 border-[#d4a85322] space-y-2">
        <p className="text-sm font-bold text-[#d4a853] mb-1">{isZh ? "🔮 整體總結" : "🔮 Overview"}</p>
        <p className="text-sm text-[#f0e6d3] leading-relaxed font-semibold">{reading.overview.elegant}</p>
        <p className="text-xs text-[#8a8aad] mt-1">{reading.overview.plain}</p>
      </div>
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
    { name: "微信", icon: "💬", color: "hover:bg-green-400/10 hover:text-green-300" },
    { name: "Instagram", icon: "📷", color: "hover:bg-pink-500/10 hover:text-pink-400" },
    { name: "小红书", icon: "📕", color: "hover:bg-red-400/10 hover:text-red-400" },
  ];

  return (
    <div>
      <div className="flex justify-center gap-3 flex-wrap bg-[#14142a]/60 rounded-xl p-3 border border-[#d4a85315]">
        {platforms.map((p) => (
          <button key={p.name} onClick={() => handleShare(p.name)}
            className={`flex flex-col items-center gap-1 px-3 py-2 glass rounded-xl border border-[#d4a85310] ${p.color} transition-all text-[#8a8aad] hover:scale-105`}>
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

export default function TarotSection() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Array<typeof TAROT_CARDS[0] & { reversed: boolean }>>([]);
  const [showReading, setShowReading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tarotMode, setTarotMode] = useState<"classic" | "idol">("classic");
  const [idolCategory, setIdolCategory] = useState<string>("");

  // Guest tracking: localStorage-based, max 3 draws
  const { user, isAuthenticated } = useAuth();
  const [guestUsed, setGuestUsed] = useState(() => {
    try { return parseInt(localStorage.getItem("tarot_guest_used") || "0"); } catch { return 0; }
  });
  const GUEST_MAX = 3;
  const guestRemaining = Math.max(0, GUEST_MAX - guestUsed);
  const [showLockModal, setShowLockModal] = useState(false);

  // Fetch real free reading count from backend (logged-in users only)
  const { data: accessInfo } = trpc.reading.getFreeCount.useQuery(undefined, {
    staleTime: 1000 * 10,
    enabled: isAuthenticated,
  });
  const dbRemaining = Math.max(0, accessInfo?.tarotRemaining ?? (accessInfo?.freeReadings ?? 0));
  const isPremiumUser = accessInfo?.isPremium ?? false;
  const extraFromInvites = accessInfo?.inviteUnlockTimes ?? 0;

  // Effective remaining: guest uses localStorage, logged-in uses DB
  const effectiveRemaining = isAuthenticated ? dbRemaining : guestRemaining;
  const effectiveUsed = isAuthenticated ? (accessInfo?.tarotUsed ?? 0) : guestUsed;
  const effectiveMax = isAuthenticated ? (accessInfo?.tarotTotal ?? 3) : GUEST_MAX;

  const idolCategories = [
    { key: "fansign", icon: Heart, labelEn: "Fansign Fortune", labelZh: "签售运势", descEn: "What energy surrounds your next fansign?", descZh: "下一次签售会，你的运势如何？" },
    { key: "concert", icon: MapPin, labelEn: "Concert Direction", labelZh: "演唱会应援方位", descEn: "Which direction brings the best concert luck?", descZh: "演唱会站在哪个方位最幸运？" },
    { key: "idol-draw", icon: Music, labelEn: "Idol Career Reading", labelZh: "愛豆事業占卜", descEn: "Artist comeback trends, hidden schedules, inner state, team dynamics, future trajectory.", descZh: "藝人回歸動向、隱藏行程、內心狀態、隊內關係、後續走勢。" },
  ];

  const useDrawMutation = trpc.reading.useDraw.useMutation();
  const drawCards = useCallback(() => {
    if (tarotMode === "classic" && !question.trim()) return;
    if (tarotMode === "idol" && !idolCategory) return;

    // Check limit: premium always passes, otherwise check remaining
    if (!isPremiumUser && effectiveRemaining <= 0) {
      setShowLockModal(true);
      return;
    }

    // Deduct: guest → localStorage, logged-in → backend API
    if (!isPremiumUser) {
      if (isAuthenticated) {
        useDrawMutation.mutate();
      } else {
        const newUsed = guestUsed + 1;
        setGuestUsed(newUsed);
        localStorage.setItem("tarot_guest_used", String(newUsed));
      }
    }

    setIsShuffling(true);
    setIsDrawing(true);
    setDrawnCards([]);
    setShowReading(false);
    if (!TEST_MODE && !isPremiumUser) setIsUnlocked(false);
  }, [question, effectiveRemaining, isPremiumUser, tarotMode, idolCategory, isAuthenticated, guestUsed, useDrawMutation]);

  const handleShuffleComplete = useCallback(() => {
    setIsShuffling(false);
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3).map(card => ({
      ...card,
      reversed: Math.random() > 0.5,
    }));
    setDrawnCards(selected);
    setIsDrawing(false);
    // Auto-save to localStorage
    try {
      const cardNames = selected.map((c: any) => c.nameCn + (c.reversed ? "逆" : "正")).join(" → ");
      const record = {
        title: `塔羅: ${question.slice(0, 20) || "運勢占卜"}`,
        type: "tarot",
        date: new Date().toLocaleDateString("zh-CN"),
        preview: `${cardNames} · ${tarotMode === "idol" ? "愛豆占卜" : "經典塔羅"}`,
      };
      const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]");
      existing.unshift(record);
      localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)));
    } catch {}
    setTimeout(() => setShowReading(true), 800);
  }, [question, tarotMode, idolCategory]);

  return (
    <section id="tarot" className="py-24 relative">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">{t("tarot.title")}</h2>
          <p className="mt-2 text-sm text-[#8a8aad]">{t("tarot.subtitle")}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85308] border border-[#d4a85315] rounded-full">
            <Sparkles className="w-3 h-3 text-[#d4a853]" />
            <span className="text-[10px] text-[#d4a853]">
              {effectiveRemaining > 0
                ? (locale === "zh-TW" ? `剩餘免費次數：${effectiveRemaining}` : `Remaining Free: ${effectiveRemaining}`)
                : (locale === "zh-TW" ? "免費額度已用完" : "Free credits exhausted")}
            </span>
            {/* Hint text */}
            <span className="text-[9px] text-[#8a8aad55] hidden sm:inline">
              {locale === "zh-TW"
                ? "註冊解鎖第 4 次抽牌，每邀請 3 位好友註冊額外贈 1 次抽牌"
                : locale === "zh"
                ? "注册解锁第 4 次，每成功邀请 3 位好友注册额外赠 1 次抽牌"
                : "Register to unlock your 4th draw; get +1 draw per 3 successful invited registrations"}
            </span>
          </div>
          {/* Subscription + Referral */}
          <div className="max-w-xl mx-auto mt-4">
            <SubscriptionCard onPurchase={(type) => window.open("/payment", "_blank")} />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { key: "classic" as const, label: locale === "zh-TW" ? "經典塔羅" : "Classic Tarot" },
            { key: "idol" as const, label: locale === "zh-TW" ? "愛豆塔羅" : "Idol Tarot", hot: true },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setTarotMode(tab.key); setIdolCategory(""); setQuestion(""); setDrawnCards([]); setShowReading(false); }}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tarotMode === tab.key ? "bg-[#d4a853] text-[#0a0a0f]" : "bg-[#14142a] text-[#8a8aad] hover:text-[#f0e6d3] border border-[#d4a85315]"
              }`}>
              {tab.label}
              {tab.hot && <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[8px] font-bold rounded-full">NEW</span>}
            </button>
          ))}
        </div>

        <div className="max-w-xl mx-auto mb-12">
          {tarotMode === "classic" ? (
            <>
              <label className="block text-xs text-[#8a8aad] mb-2 uppercase tracking-wider">{t("tarot.question")}</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("tarot.questionPlaceholder")} rows={3}
                className="w-full bg-[#1e1e2a]/85 border border-[#d4a85315] rounded-lg px-4 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad66] focus:outline-none focus:border-[#d4a85344] transition-all resize-none" />
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {idolCategories.map(cat => {
                const Icon = cat.icon;
                const isSelected = idolCategory === cat.key;
                const label = locale === "zh-TW" ? cat.labelZh : cat.labelEn;
                const desc = locale === "zh-TW" ? cat.descZh : cat.descEn;
                return (
                  <div key={cat.key}
                    className={`rounded-xl p-4 text-center border-2 transition-all hover:-translate-y-1 ${
                      isSelected ? "border-[#d4a853] bg-[#1a1a2e]" : "border-[#d4a85315] bg-[#111122] hover:border-[#d4a85333]"
                    }`}>
                    <button onClick={() => setIdolCategory(cat.key)} className="w-full">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-[#d4a853]" : "text-[#8a8aad]"}`} />
                      <p className="text-xs font-semibold text-[#f0e6d3]">{label}</p>
                      <p className="text-[9px] text-[#8a8aad44] mt-1">{desc}</p>
                    </button>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#d4a85315]">
                        <input
                          type="text"
                          value={question}
                          onChange={e => setQuestion(e.target.value)}
                          placeholder={locale === "zh-TW" ? "輸入你想問的問題..." : "Type your question..."}
                          className="w-full bg-[#1a1a2e] border-2 border-[#d4a85333] rounded-lg px-3 py-2.5 text-xs text-[#f0e6d3] placeholder-[#8a8aad66] focus:outline-none focus:border-[#d4a85366] focus:bg-[#1e1e35] transition-colors"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={drawCards}
            disabled={isDrawing || (tarotMode === "classic" ? !question.trim() : !idolCategory)}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
            {isShuffling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isShuffling ? (locale === "zh-TW" ? "洗牌中..." : locale === "zh-TW" ? "洗牌中..." : "Shuffling...") : t("tarot.draw")}
          </button>
        </div>

        {/* Shuffle Animation */}
        {isShuffling && (
          <div className="flex justify-center mb-12">
            <ShuffleAnimation onComplete={handleShuffleComplete} />
          </div>
        )}

        {/* Card Display */}
        {drawnCards.length > 0 && !isDrawing && (
          <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 mb-12">
            {drawnCards.map((card, idx) => (
              <div key={card.id} className="group">
                <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-[#d4a85333] shadow-lg shadow-[#d4a85310]"
                  style={{ opacity: 0, animation: `cardDeal 0.6s ease-out ${idx * 0.3}s forwards` }}>
                  <img src={`/tarot/${card.id}.jpg`} alt={card.nameCn}
                    className={`w-full h-full object-cover ${card.reversed ? "rotate-180" : ""}`}
                    loading="eager"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">
                      {[t("tarot.past"), t("tarot.present"), t("tarot.future")][idx]}
                      {card.reversed && <span className="ml-1 text-[8px] text-rose-400">(R)</span>}
                    </span>
                    <p className="text-xs font-semibold text-[#f0e6d3]">{card.nameCn}</p>
                    <p className="text-[9px] text-[#8a8aad]">{card.name}</p>
                  </div>
                  {card.suit !== "major" && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#d4a85322] rounded text-[8px] text-[#d4a853] capitalize">{card.suit}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reading Result */}
        {showReading && drawnCards.length > 0 && (
          <div className="max-w-2xl mx-auto glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-[#d4a853] mb-4 font-display flex items-center gap-2">
              <Eye className="w-5 h-5" /> {t("tarot.reading")}
              {effectiveRemaining > 0 && !isUnlocked && (
                <span className="ml-2 px-2 py-0.5 bg-green-400/10 text-green-400 text-[10px] rounded-full">FREE {effectiveUsed}/{effectiveMax}</span>
              )}
            </h3>

            <div className="space-y-3">
              {drawnCards.map((card, idx) => (
                <div key={card.id} className="border-l-2 border-[#d4a85333] pl-4">
                  <p className="text-xs text-[#d4a853] mb-1">
                    {[t("tarot.past"), t("tarot.present"), t("tarot.future")][idx]} · {card.nameCn} {card.reversed && <span className="text-rose-400 ml-0.5">(Reversed)</span>}
                    {card.suit !== "major" && <span className="text-[#8a8aad44] ml-1 capitalize">({card.suit})</span>}
                  </p>
                  <p className="text-sm text-[#8a8aad] leading-relaxed">
                    {tarotMode === "idol" && idolCategory
                      ? (() => {
                          const sceneKey = idolCategory === "concert" ? "concert" : idolCategory === "fansign" ? "fansign" : "career";
                          const major = getMajorScene(card.id, sceneKey as any, card.reversed);
                          if (major) return locale === "zh-TW" ? major.freeZh : major.freeEn;
                          const gen = getIdolSceneReading(card.id, sceneKey as any, card.reversed, false);
                          return locale === "zh-TW" ? gen.zh : gen.en;
                        })()
                      : card.reversed ? (card.meaningReversedZh || card.meaningUprightZh) : card.meaningUprightZh
                    }
                  </p>
                </div>
              ))}
            </div>

            {/* Comprehensive guidance */}
            {(effectiveRemaining > 0 || isUnlocked) ? (
              <div className="mt-6 pt-4 border-t border-[#d4a85310]">
                <h4 className="text-sm font-medium text-[#f0e6d3] mb-2">
                  {tarotMode === "idol"
                    ? (idolCategory === "idol-draw"
                        ? (locale === "zh-TW" ? "✨ 藝人事業深度解析" : "✨ Artist Career Deep Analysis")
                        : (locale === "zh-TW" ? "✨ 追星專屬詳細解讀" : "✨ Idol-Specific Deep Reading"))
                    : (locale === "zh-TW" ? "✨ AI 深度解析 · 一問一解" : "✨ AI Deep Reading")}
                </h4>
                {tarotMode === "classic" ? (
                  <ClassicAIReading cards={drawnCards} question={question} locale={locale as "zh-TW" | "en"} />
                ) : tarotMode === "idol" && idolCategory ? (
                  <ClassicAIReading cards={drawnCards} question={question} locale={locale as "zh-TW" | "en"} />
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
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-[#d4a85310]">
                <div className="relative">
                  <div className="blur-sm select-none opacity-30 pointer-events-none">
                    <h4 className="text-sm font-medium text-[#f0e6d3] mb-2">{t("tarot.guidance")}</h4>
                    <p className="text-sm text-[#8a8aad] leading-relaxed">{t("tarot.paywallText")}</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <button onClick={() => setShowPaymentModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center gap-2 shadow-lg">
                      <Unlock className="w-4 h-4" /> {t("tarot.unlockBtn")}{tarotMode === "idol" ? IDOL_UNLOCK_PRICE : UNLOCK_PRICE}
                    </button>
                  </div>
                </div>
                {/* AI 私域升级入口 */}
                {effectiveRemaining <= 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#FFB6C108] to-[#d4a85308] rounded-xl border border-[#FFB6C115] text-center">
                    <p className="text-xs font-semibold text-[#FFB6C1] mb-1">
                      {locale === "zh-TW" ? "✨ AI 解讀僅為基礎指引" : "✨ AI reading is basic guidance only"}
                    </p>
                    <p className="text-[10px] text-[#8a8aad] mb-3">
                      {locale === "zh-TW"
                        ? "預約專業占星師 1v1 深度解讀，獲取完整個人化報告發送至你的郵箱"
                        : "Book a professional astrologer 1v1 deep reading — full personalized report delivered to your inbox"}
                    </p>
                    <AITarotUpgrade locale={locale} />
                  </div>
                )}
              </div>
            )}

            {isUnlocked && (
              <div className="mt-4 p-3 bg-[#d4a85308] border border-[#d4a85315] rounded-lg">
                <p className="text-xs text-[#d4a853] text-center flex items-center justify-center gap-1"><Check className="w-3 h-3" /> {t("tarot.unlocked")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share row — visible after reading */}
      {showReading && drawnCards.length > 0 && (
        <div className="max-w-2xl mx-auto mt-4 glass rounded-xl p-4 border border-[#d4a85310]">
          <p className="text-[10px] text-[#8a8aad] text-center mb-2 uppercase tracking-wider">
            {locale === "zh-TW" ? "分享你的塔羅解讀" : "Share Your Reading"}
          </p>
          <TarotShareRow locale={locale} />
        </div>
      )}

      {/* ===== Lock Modal: free draws exhausted ===== */}
      {showLockModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)} />
          <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up text-center">
            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]"><X className="w-4 h-4" /></button>
            <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-4 border border-[#d4a85320]">
              <Lock className="w-7 h-7 text-[#d4a853]" />
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
                className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {locale === "zh-TW" ? "去註冊" : locale === "zh" ? "去注册" : "Register"}
              </button>
              <button
                onClick={async () => {
                  const refCode = user?.id ? `r7_${user.id}` : "guest";
                  const link = `${window.location.origin}/?ref=${refCode}`;
                  const text = locale === "zh-TW"
                    ? `快來 R7 Fortune 免費占卜！用我的邀請碼 ${refCode} 註冊，我倆都能解鎖更多次數 🎴 ${link}`
                    : locale === "zh"
                    ? `快来 R7 Fortune 免费占卜！用我的邀请码 ${refCode} 注册，我俩都能解锁更多次数 🎴 ${link}`
                    : `Join me on R7 Fortune for free tarot! Use my invite code ${refCode} when you register — we both unlock more draws 🎴 ${link}`;
                  if (navigator.share) {
                    try { await navigator.share({ title: "R7 Fortune", text, url: link }); } catch {}
                  } else {
                    await navigator.clipboard.writeText(text).catch(() => {});
                  }
                  setShowLockModal(false);
                  navigate(`/?ref=${refCode}`);
                }}
                className="w-full py-3 bg-[#151520] border border-[#d4a85322] text-[#f0e6d3] rounded-xl text-sm font-medium hover:border-[#d4a85355] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {locale === "zh-TW" ? "去邀請好友" : locale === "zh" ? "去邀请好友" : "Invite Friends"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaid={() => setIsUnlocked(true)}
        config={{
          ...PAYWALL_CONFIGS.tarot,
          reportKey: `tarot_${Date.now()}`,
          amount: tarotMode === "idol" ? IDOL_UNLOCK_PRICE : UNLOCK_PRICE,
        }}
      />
    </section>
  );
}
