import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clipboard,
  Coins,
  Heart,
  HelpCircle,
  Layers2,
  Lock,
  RefreshCcw,
  Share2,
  Sparkles,
  Star,
  WandSparkles,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal";
import { TAROT_CARDS } from "@/data/tarotCards";
import type { DrawnTarotCard, DualReading, ZiweiCard } from "@/data/ziweiTarot";
import { buildDualReading, detectDualScene, drawZiweiCard, ZIWEI_TAROT_PRICE } from "@/data/ziweiTarot";
import { trackEvent } from "@/lib/analytics";
import { addReportHistory } from "@/lib/report-history";

type Category = "love" | "career" | "money" | "decision";
type Stage = "form" | "ziwei-ready" | "ziwei-revealed" | "tarot-ready" | "complete";

type SavedReading = {
  version: 1;
  readingId: string;
  reportKey: string;
  createdAt: string;
  category: Category;
  question: string;
  background: string;
  stage: Stage;
  ziwei?: ZiweiCard;
  tarot?: DrawnTarotCard;
  reading?: DualReading;
  unlocked: boolean;
};

const STORAGE_KEY = "r7_ziwei_dual_active_v1";

const categories: Array<{ id: Category; icon: typeof Heart; title: string; desc: string }> = [
  { id: "love", icon: Heart, title: "感情關係", desc: "曖昧、復合、相處與投入判斷" },
  { id: "career", icon: BriefcaseBusiness, title: "事業選擇", desc: "工作、轉職、合作與發展方向" },
  { id: "money", icon: Coins, title: "財運投入", desc: "副業、預算、回報與風險判斷" },
  { id: "decision", icon: HelpCircle, title: "日常決策", desc: "是否推進、等待或改變方案" },
];

function drawTarotCard(): DrawnTarotCard {
  const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  return { ...card, reversed: Math.random() > 0.5 };
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function restoreReading(): SavedReading | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedReading;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function persistReading(value: SavedReading | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function saveHistory(value: SavedReading) {
  if (!value.reading || !value.ziwei || !value.tarot) return;
  try {
    const history = JSON.parse(localStorage.getItem("r7_reports") || "[]");
    if (history.some((item: { reportKey?: string }) => item.reportKey === value.reportKey)) return;
    history.unshift({
      title: `紫微雙牌: ${value.question.slice(0, 18)}`,
      type: "ziwei_dual",
      date: new Date(value.createdAt).toLocaleDateString("zh-TW"),
      preview: `${value.ziwei.name} × ${value.tarot.nameCn}${value.tarot.reversed ? "逆位" : "正位"} · ${value.reading.tone}`,
      reportKey: value.reportKey,
    });
    localStorage.setItem("r7_reports", JSON.stringify(history.slice(0, 50)));
  } catch {}
}

function buildPrompt(value: SavedReading) {
  if (!value.ziwei || !value.tarot) return "";
  const direction = value.tarot.reversed ? "逆位" : "正位";
  return `你是一位嚴謹、克制的雙系統解讀師。請只根據以下資料回答，不自行補抽牌、不宣稱能確定他人內心，也不作百分之百保證。\n\n【我的問題】\n${value.question}\n\n【問題類型】\n${categories.find(item => item.id === value.category)?.title}\n\n【背景補充】\n${value.background || "無"}\n\n【紫微牌｜體】\n${value.ziwei.name}；關鍵詞：${value.ziwei.traits.join("、")}；核心：${value.ziwei.bodyMeaning}\n\n【韋特塔羅｜用】\n${value.tarot.nameCn}・${direction}；關鍵詞：${value.tarot.keywordsZh.join("、")}；牌義：${direction === "正位" ? value.tarot.meaningUprightZh : value.tarot.meaningReversedZh}\n\n請依次輸出：\n1. 一句話核心答案\n2. 紫微牌揭示的根基與長期底色\n3. 塔羅牌揭示的當下狀態與近期走向\n4. 兩張牌的交叉結論（指出一致或矛盾之處）\n5. 最大機會與最大阻礙\n6. 未來30天的可觀察信號\n7. 兩條具體行動建議\n\n所有內容需緊扣我的原問題，避免泛泛而談。末尾註明：內容僅供娛樂與自我探索參考。`;
}

function CardBack({ label }: { label: string }) {
  return (
    <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[22px] border border-[#d4a85345] bg-[radial-gradient(circle_at_center,#2b2033_0,#12111d_45%,#07070d_100%)] shadow-[inset_0_0_0_6px_rgba(212,168,83,0.05),0_22px_55px_rgba(0,0,0,0.34)]">
      <div className="text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[#d4a853]" />
        <p className="mt-3 text-xs font-black tracking-[0.18em] text-[#d9c7a0]">{label}</p>
      </div>
    </div>
  );
}

export default function ZiweiTarotPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedReading | null>(() => restoreReading());
  const [category, setCategory] = useState<Category>(() => restoreReading()?.category || "love");
  const [question, setQuestion] = useState(() => restoreReading()?.question || "");
  const [background, setBackground] = useState(() => restoreReading()?.background || "");
  const [error, setError] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => persistReading(saved), [saved]);
  useEffect(() => {
    trackEvent("ziwei_dual_page_viewed", { source_page: "ziwei_tarot", user_type: "guest" });
  }, []);

  const complete = saved?.stage === "complete" && saved.ziwei && saved.tarot && saved.reading;
  const prompt = useMemo(() => (saved ? buildPrompt(saved) : ""), [saved]);
  const currentPrice = ZIWEI_TAROT_PRICE.first;

  const startReading = () => {
    const clean = question.trim();
    if (clean.length < 5) return setError("請把問題寫得更具體一些，至少輸入 5 個字。");
    if (clean.length > 120) return setError("問題最多 120 字，請保留最想確認的重點。");
    setError("");
    const readingId = createId("dual");
    setSaved({
      version: 1,
      readingId,
      reportKey: `ziwei_dual_${readingId}`,
      createdAt: new Date().toISOString(),
      category,
      question: clean,
      background: background.trim(),
      stage: "ziwei-ready",
      unlocked: false,
    });
    trackEvent("ziwei_dual_question_submitted", {
      scene_type: category,
      spread_type: "dual",
      session_id: readingId,
      question_length: clean.length,
      source_page: "ziwei_tarot",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const revealZiwei = () => {
    if (!saved || saved.ziwei) return;
    setSaved({ ...saved, ziwei: drawZiweiCard(), stage: "ziwei-revealed" });
    trackEvent("ziwei_card_revealed", { scene_type: saved.category, session_id: saved.readingId });
  };

  const prepareTarot = () => {
    if (!saved?.ziwei) return;
    setSaved({ ...saved, stage: "tarot-ready" });
  };

  const revealTarot = () => {
    if (!saved?.ziwei || saved.tarot) return;
    const tarot = drawTarotCard();
    const reading = buildDualReading(saved.ziwei, tarot, saved.question);
    const next = { ...saved, tarot, reading, stage: "complete" as const };
    setSaved(next);
    saveHistory(next);
    trackEvent("ziwei_dual_draw_completed", {
      scene_type: saved.category,
      spread_type: "dual",
      session_id: saved.readingId,
      source_page: "ziwei_tarot",
    });
  };

  const reset = () => {
    setSaved(null);
    setQuestion("");
    setBackground("");
    setError("");
    setShowPrompt(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    trackEvent("ziwei_dual_prompt_copied", { scene_type: saved?.category, session_id: saved?.readingId });
  };

  const share = async () => {
    if (!complete) return;
    const text = `R7 Fortune 紫微雙牌：${saved.ziwei?.name} × ${saved.tarot?.nameCn}${saved.tarot?.reversed ? "逆位" : "正位"}。${saved.reading?.headline}`;
    if (navigator.share) {
      try { await navigator.share({ title: "R7 Fortune 紫微雙牌", text, url: location.href }); return; } catch {}
    }
    await navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-16 pt-20">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4a85328] bg-[#0f0f19]/80 px-4 text-xs font-bold text-[#d9c7a0]">
            <ArrowLeft className="h-4 w-4" />返回
          </button>

          <header className="overflow-hidden rounded-[30px] border border-[#d4a85328] bg-gradient-to-br from-[#1a121c]/96 via-[#0d0d16]/97 to-[#050507]/98 p-6 shadow-[0_30px_100px_rgba(0,0,0,.32)] sm:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a85335] bg-[#d4a8530e] px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-[#d4a853]"><Layers2 className="h-3.5 w-3.5" />Ziwei × Rider–Waite</div>
            <h1 className="mt-5 font-display text-4xl font-black leading-tight text-[#f7ecd8] sm:text-6xl">一個問題，<span className="bg-gradient-to-r from-[#d4a853] via-[#ffd9b8] to-[#d49ab2] bg-clip-text text-transparent">兩套體系交叉驗證</span></h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#b8b2d0] sm:text-base">先抽紫微牌看事情的根基與長期底色，再抽韋特塔羅看當下狀態與近期走向。抽牌及牌面免費，完成後可選擇自行交給 AI 解讀，或等待完整報告功能上線。</p>
          </header>

          {!saved ? (
            <div className="mt-7 grid gap-6 lg:grid-cols-[.88fr_1.12fr]">
              <section className="rounded-[26px] border border-[#d4a85322] bg-[#090910]/88 p-5 sm:p-6">
                <p className="text-xs font-black tracking-[.16em] text-[#d4a853]">01 · 選擇問題類型</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {categories.map(item => {
                    const Icon = item.icon;
                    const active = category === item.id;
                    return <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`flex min-h-[84px] items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-[#d4a85388] bg-[#d4a85312] shadow-[0_12px_32px_rgba(212,168,83,.08)]" : "border-[#d4a85318] bg-[#11111b]/65 hover:border-[#d4a85350]"}`}>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${active ? "border-[#d4a85366] text-[#d4a853]" : "border-[#77718d44] text-[#9d96b5]"}`}><Icon className="h-5 w-5" /></span>
                      <span><strong className="block text-sm text-[#f0e6d3]">{item.title}</strong><small className="mt-1 block leading-5 text-[#8f89aa]">{item.desc}</small></span>
                      {active && <Check className="ml-auto h-4 w-4 text-[#d4a853]" />}
                    </button>;
                  })}
                </div>
              </section>

              <section className="rounded-[26px] border border-[#d49ab22e] bg-gradient-to-br from-[#1b111c]/92 to-[#090910]/94 p-5 sm:p-6">
                <p className="text-xs font-black tracking-[.16em] text-[#d49ab2]">02 · 寫下真正想確認的問題</p>
                <label className="mt-5 block text-sm font-bold text-[#f0e6d3]" htmlFor="dual-question">你的問題</label>
                <textarea id="dual-question" rows={5} maxLength={120} value={question} onChange={event => setQuestion(event.target.value)} placeholder="例如：這段曖昧關係接下來三個月值得繼續投入嗎？" className="mt-2 w-full resize-none rounded-[20px] border border-[#d49ab23b] bg-[#10101b]/86 p-4 text-base leading-7 text-[#f0e6d3] outline-none placeholder:text-[#77718d] focus:border-[#d49ab288]" />
                <div className="mt-2 flex justify-between text-[11px] text-[#77718d]"><span>建議包含時間範圍與具體選擇</span><span>{question.length}/120</span></div>
                <label className="mt-5 block text-sm font-bold text-[#f0e6d3]" htmlFor="dual-background">背景補充 <span className="font-normal text-[#77718d]">（選填）</span></label>
                <textarea id="dual-background" rows={3} maxLength={300} value={background} onChange={event => setBackground(event.target.value)} placeholder="可補充目前狀況、已發生的事情或你的限制條件。" className="mt-2 w-full resize-none rounded-[20px] border border-[#d4a85325] bg-[#10101b]/70 p-4 text-sm leading-6 text-[#d8d0ee] outline-none placeholder:text-[#6f6982] focus:border-[#d4a85366]" />
                {error && <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/8 px-3 py-2 text-xs text-rose-300">{error}</p>}
                <button type="button" onClick={startReading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c9953a] px-6 text-sm font-black text-[#08080f]"><Sparkles className="h-4 w-4" />確認問題，開始雙牌占卜</button>
                <p className="mt-3 text-center text-[11px] leading-5 text-[#77718d]">確認後問題將鎖定，兩張牌會依序抽取，不會重抽第一張牌。</p>
              </section>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              <section className="rounded-[24px] border border-[#d4a85322] bg-[#090910]/88 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-[11px] font-black tracking-[.16em] text-[#d4a853]">本次問題 · {categories.find(item => item.id === saved.category)?.title}</p><h2 className="mt-2 max-w-3xl font-display text-xl font-bold leading-8 text-[#f7ecd8] sm:text-2xl">{saved.question}</h2>{saved.background && <p className="mt-2 max-w-3xl text-xs leading-6 text-[#8f89aa]">背景：{saved.background}</p>}</div>
                  <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4a8532b] px-4 text-xs font-bold text-[#d9c7a0]"><RefreshCcw className="h-3.5 w-3.5" />重新提問</button>
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[26px] border border-[#d4a85328] bg-[#090910]/90 p-5">
                  <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-black tracking-[.15em] text-[#d4a853]">FIRST CARD</p><h3 className="mt-1 font-display text-xl font-bold text-[#f7ecd8]">紫微牌 · 事件根基</h3></div><span className="rounded-full border border-[#d4a85335] px-3 py-1 text-[10px] text-[#d9c7a0]">體</span></div>
                  {!saved.ziwei ? <CardBack label="點擊揭示紫微牌" /> : <><img src={saved.ziwei.image} alt={saved.ziwei.name} className="aspect-[3/4] w-full rounded-[22px] object-cover" /><h4 className="mt-4 text-2xl font-black text-[#f7ecd8]">{saved.ziwei.name}</h4><p className="mt-1 text-xs text-[#d4a853]">{saved.ziwei.traits.join(" · ")}</p><p className="mt-3 text-sm leading-7 text-[#b8b2d0]">{saved.ziwei.bodyMeaning}</p></>}
                  {saved.stage === "ziwei-ready" && <button type="button" onClick={revealZiwei} className="mt-4 min-h-12 w-full rounded-2xl bg-[#d4a853] text-sm font-black text-[#08080f]">揭示第一張牌</button>}
                  {saved.stage === "ziwei-revealed" && <button type="button" onClick={prepareTarot} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d49ab266] bg-[#d49ab212] text-sm font-black text-[#ffd7e5]">繼續抽韋特塔羅 <ChevronRight className="h-4 w-4" /></button>}
                </div>

                <div className={`rounded-[26px] border bg-[#090910]/90 p-5 transition ${saved.stage === "ziwei-ready" || saved.stage === "ziwei-revealed" ? "border-[#77718d24] opacity-55" : "border-[#d49ab235]"}`}>
                  <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-black tracking-[.15em] text-[#d49ab2]">SECOND CARD</p><h3 className="mt-1 font-display text-xl font-bold text-[#f7ecd8]">韋特塔羅 · 當下走向</h3></div><span className="rounded-full border border-[#d49ab23d] px-3 py-1 text-[10px] text-[#ffd7e5]">用</span></div>
                  {!saved.tarot ? <CardBack label={saved.stage === "ziwei-ready" || saved.stage === "ziwei-revealed" ? "完成第一張牌後解鎖" : "點擊揭示韋特牌"} /> : <><img src={saved.tarot.image} alt={saved.tarot.nameCn} className={`aspect-[3/4] w-full rounded-[22px] object-cover ${saved.tarot.reversed ? "rotate-180" : ""}`} /><h4 className="mt-4 text-2xl font-black text-[#f7ecd8]">{saved.tarot.nameCn}</h4><p className="mt-1 text-xs text-[#d49ab2]">{saved.tarot.reversed ? "逆位" : "正位"} · {saved.tarot.keywordsZh.slice(0, 4).join(" · ")}</p></>}
                  {saved.stage === "tarot-ready" && <button type="button" onClick={revealTarot} className="mt-4 min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#d49ab2] to-[#b480a5] text-sm font-black text-[#100912]">揭示第二張牌</button>}
                </div>
              </section>

              {complete && <>
                <section className="rounded-[28px] border border-[#d4a8532b] bg-gradient-to-br from-[#17131d]/95 to-[#090910]/96 p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-black tracking-[.17em] text-[#d4a853]">FREE CROSS-READING</p><h2 className="mt-2 font-display text-2xl font-black text-[#f7ecd8]">兩張牌共同指出什麼？</h2></div><span className="rounded-full border border-[#d4a85344] bg-[#d4a85310] px-3 py-1 text-xs font-black text-[#d4a853]">{saved.reading?.tone}</span></div>
                  <h3 className="mt-5 text-xl font-black text-[#f2dfbd]">{saved.reading?.headline}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-[#c3bdd5]">{saved.reading?.freeSummary}</p>
                  <div className="mt-5 rounded-2xl border border-[#d49ab22d] bg-[#d49ab20b] p-4"><p className="text-xs font-black text-[#d49ab2]">仍需進一步釐清</p><p className="mt-2 text-sm leading-7 text-[#d8d0ee]">這組牌目前已說明根基與短期方向，但還需要把兩張牌的矛盾或相互支持之處，落到你的背景條件、可觀察信號與下一步選擇上。</p></div>
                  <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4a8532d] px-4 text-xs font-bold text-[#d9c7a0]"><Share2 className="h-4 w-4" />分享牌面</button></div>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <button type="button" onClick={() => { setShowPrompt(true); trackEvent("ziwei_dual_prompt_opened", { scene_type: saved.category, session_id: saved.readingId }); }} className="group rounded-[26px] border border-[#d49ab23a] bg-[#130d17]/92 p-5 text-left transition hover:border-[#d49ab277] sm:p-6"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d49ab244] text-[#d49ab2]"><WandSparkles className="h-5 w-5" /></span><p className="mt-4 text-[11px] font-black tracking-[.16em] text-[#d49ab2]">FREE SELF-READING</p><h3 className="mt-2 font-display text-2xl font-black text-[#f7ecd8]">免費複製 AI 解讀 Prompt</h3><p className="mt-2 text-sm leading-7 text-[#aaa3bf]">已整理原問題、背景、兩張牌、正逆位與固定輸出規則。可複製到你常用的 AI，自行完成深度追問。</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#ffd7e5]">查看並複製 <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></button>

                  <div className="rounded-[26px] border border-[#d4a85345] bg-gradient-to-br from-[#d4a85313] to-[#0a0a11]/95 p-5 sm:p-6"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4a85345] text-[#d4a853]"><Lock className="h-5 w-5" /></span><p className="mt-4 text-[11px] font-black tracking-[.16em] text-[#d4a853]">PROFESSIONAL REPORT</p><h3 className="mt-2 font-display text-2xl font-black text-[#f7ecd8]">完整雙牌深度報告</h3><ul className="mt-4 space-y-2 text-sm text-[#c3bdd5]">{["一句話核心答案與判斷依據", "根基、當下走向與雙牌交叉結論", "最大機會、最大阻礙與30天觀察信號", "兩條緊扣原問題的行動建議"].map(item => <li key={item} className="flex gap-2"><Star className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d4a853]" />{item}</li>)}</ul><div className="mt-5 flex items-end justify-between"><div><p className="text-xs text-[#8f89aa]">首次體驗價</p><p className="font-display text-3xl font-black text-[#d4a853]">¥{currentPrice.toFixed(1)}</p><p className="text-[10px] text-[#77718d]">標準價 ¥{ZIWEI_TAROT_PRICE.standard.toFixed(1)}</p></div><button type="button" onClick={() => { setShowPayModal(true); trackEvent("ziwei_dual_unlock_clicked", { scene_type: saved.category, session_id: saved.readingId, price: currentPrice }); }} className="min-h-12 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c9953a] px-5 text-sm font-black text-[#08080f]">查看完整報告</button></div><p className="mt-3 text-[10px] leading-5 text-[#77718d]">支付後在本頁解鎖，不重新抽牌；目前付款功能為即將上線狀態，不會建立訂單。</p></div>
                </section>

                {saved.unlocked && <section className="rounded-[28px] border border-emerald-400/20 bg-[#0a0c11]/95 p-5 sm:p-7"><p className="text-sm font-black text-emerald-300"><Check className="mr-2 inline h-4 w-4" />已解鎖完整報告</p><h2 className="mt-4 font-display text-2xl font-black text-[#f7ecd8]">{saved.reading?.headline}</h2><div className="mt-5 grid gap-4">{saved.reading?.deep.map((paragraph, index) => <article key={paragraph} className="rounded-2xl border border-[#d4a85320] bg-[#11111b]/72 p-4"><p className="text-xs font-black text-[#d4a853]">{["紫微牌：整體格局", "韋特塔羅：情緒與行動", "雙牌共同訊息"][index]}</p><p className="mt-2 text-sm leading-7 text-[#d8d0ee]">{paragraph}</p></article>)}</div><div className="mt-5 rounded-2xl border border-[#d49ab22f] bg-[#d49ab20c] p-4"><h3 className="font-black text-[#ffd7e5]">具體行動建議</h3>{saved.reading?.actions.map(item => <p key={item} className="mt-2 text-sm leading-7 text-[#d8d0ee]">• {item}</p>)}</div></section>}
              </>}
            </div>
          )}
        </section>
      </main>
      <Footer /><CustomerService />

      {showPrompt && saved && <div className="fixed inset-0 z-[210] flex items-center justify-center p-4"><button aria-label="關閉" className="absolute inset-0 bg-[#05050b]/82 backdrop-blur-sm" onClick={() => setShowPrompt(false)} /><div className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[26px] border border-[#d49ab244] bg-[#0d0c15] p-5 shadow-2xl sm:p-7"><button type="button" onClick={() => setShowPrompt(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#77718d35] text-[#aaa3bf]"><X className="h-4 w-4" /></button><p className="text-[11px] font-black tracking-[.16em] text-[#d49ab2]">AI READING PROMPT</p><h2 className="mt-2 pr-10 font-display text-2xl font-black text-[#f7ecd8]">複製完整牌面資料，自行深度追問</h2><p className="mt-2 text-xs leading-6 text-[#8f89aa]">Prompt 已要求 AI 緊扣原問題，並明確區分紫微定體、塔羅定用與雙牌交叉結論。</p><pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-[#d4a85320] bg-[#07070d] p-4 font-sans text-xs leading-6 text-[#c3bdd5]">{prompt}</pre><button type="button" onClick={copyPrompt} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d49ab2] to-[#b480a5] text-sm font-black text-[#100912]"><Clipboard className="h-4 w-4" />{copied ? "已複製" : "複製 Prompt"}</button></div></div>}

      <PayModal isOpen={showPayModal} onClose={() => setShowPayModal(false)} onPaid={() => { if (!saved) return; setSaved({ ...saved, unlocked: true }); trackEvent("payment_success", { scene_type: saved.category, session_id: saved.readingId, price: currentPrice }); }} config={{ ...PAYWALL_CONFIGS.ziweiTarot, amount: currentPrice, reportKey: saved?.reportKey || createId("ziwei_dual") }} />
    </div>
  );
}
