import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, getArtistDisplayName, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility, generateCosmicAnswer, RELATION_CONFIG } from "@/lib/compatibility-algo";
import { generateCpData } from "@/lib/cp-copywriting";
import { renderPosterToCanvas, getShareText } from "@/lib/share-utils";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import SharePoster from "@/components/SharePoster";
import type { PosterData } from "@/components/SharePoster";
import { PAYMENT_COMING_SOON } from "@/const";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Sparkles, Heart, Share2, Download, Crown, Loader2, ArrowLeft, Star, TrendingUp, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

type Step = "input" | "loading" | "report";

// ===== CP 星辰應援榜 Component =====
function CpStarRanking({ cpKey, cpName, locale }: { cpKey: string; cpName: string; locale: string }) {
  const isZh = locale === "zh-TW";
  const storageKey = `r7_cp_support_${cpKey}`;
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [count, setCount] = useState(() => {
    try { return parseInt(localStorage.getItem(storageKey) || "0"); } catch { return 0; }
  });
  const [userSupported, setUserSupported] = useState(() => {
    try { return localStorage.getItem(`${storageKey}_user`) === "true"; } catch { return false; }
  });
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    return () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); };
  }, []);

  // Simulated global ranking (randomized per CP for demo)
  const [globalRank] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [totalStars] = useState(() => Math.floor(Math.random() * 5000) + 500);

  const handleSupport = () => {
    if (PAYMENT_COMING_SOON) return;
    if (userSupported) return;
    const newCount = count + 1;
    setCount(newCount);
    setUserSupported(true);
    setAnimating(true);
    localStorage.setItem(storageKey, String(newCount));
    localStorage.setItem(`${storageKey}_user`, "true");
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setAnimating(false), 1500);
  };

  return (
    <div className="glass rounded-2xl p-5 border border-[#FFB6C120] text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Star className="w-4 h-4 text-[#FFB6C1]" />
        <h3 className="text-sm font-semibold text-[#f0e6d3]">
          {isZh ? "星辰應援榜" : "Star Support Ranking"}
        </h3>
        <Star className="w-4 h-4 text-[#FFB6C1]" />
      </div>

      <p className="text-xs text-[#8a8aad]">
        {isZh
          ? `已有 ${totalStars.toLocaleString()} 位粉絲為 ${cpName} 解鎖星辰應援`
          : `${totalStars.toLocaleString()} fans have unlocked Star Support for ${cpName}`}
      </p>

      {/* Mini ranking bar */}
      <div className="flex items-center justify-center gap-4 text-[10px]">
        <span className="text-[#FFB6C1] font-bold">
          🏆 {isZh ? "CP 榜" : "CP Rank"} #{globalRank}
        </span>
        <span className="text-[#8a8aad44]">|</span>
        <span className="text-[#8a8aad]">
          ⭐ {count.toLocaleString()} {isZh ? "次應援" : "supports"}
        </span>
        <span className="text-[#8a8aad44]">|</span>
        <span className="text-[#FFB6C1]">
          <TrendingUp className="w-3 h-3 inline mr-0.5" />
          {isZh ? "上升中" : "Rising"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#151520] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
        />
      </div>

      {/* Support button */}
      {!userSupported ? (
        <button
          onClick={handleSupport}
          className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Zap className="w-4 h-4" />
          {PAYMENT_COMING_SOON
            ? (isZh ? "星辰應援即將上線" : "Star Support Coming Soon")
            : (isZh ? `解鎖星辰應援 · $0.99` : `Unlock Star Support · $0.99`)}
        </button>
      ) : (
        <div className={`text-center py-2 ${animating ? "animate-pulse" : ""}`}>
          <p className="text-sm font-bold text-[#FFB6C1]">
            {isZh ? "✨ 應援成功！你已為這對 CP 點亮一顆星辰" : "✨ Support sent! You lit a star for this CP"}
          </p>
          <p className="text-[10px] text-[#8a8aad44] mt-1">
            {isZh ? "分享這份合盤，邀請更多人一起應援" : "Share this report to invite more supporters"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CpReportPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("input");
  const [showShare, setShowShare] = useState(false);

  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");

  const [artist1Id, setArtist1Id] = useState<number | null>(null);
  const [artist2Id, setArtist2Id] = useState<number | null>(null);

  // artist1/artist2 MUST be declared before cpKey which references them
  const artist1 = artist1Id ? getArtistById(artist1Id) : null;
  const artist2 = artist2Id ? getArtistById(artist2Id) : null;
  const artist1Name = getArtistDisplayName(artist1, locale);
  const artist2Name = getArtistDisplayName(artist2, locale);
  const cpKey = artist1?.stageName && artist2?.stageName
    ? `cp_${artist1.stageName}_${artist2.stageName}`
    : "";

  const [showPoster, setShowPoster] = useState(false);
  const [sharePosterData, setSharePosterData] = useState<PosterData | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  const [result, setResult] = useState<any>(null);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount: cancel pending timer + mark unmounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Safari bfcache: re-validate state on page restore
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page restored from bfcache — re-validate mounted flag
        mountedRef.current = true;
        // If a timer was pending, cancel it (stale)
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const t = (en: string, zh: string, tw: string) => locale === "zh" ? zh : locale === "zh-TW" ? tw : en;

  const handleGenerate = useCallback(() => {
    if (!artist1Id || !artist2Id) return;
    setStep("loading");
    // Capture IDs in closure for the timeout callback
    const id1 = artist1Id;
    const id2 = artist2Id;
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return; // Component unmounted — abort
      const a1 = getArtistById(id1); const a2 = getArtistById(id2);
      if (!a1 || !a2) return;
      const calc = calculateCompatibility(
        a1.birthDate, a2.birthDate, undefined, a1.baziDayPillar, a2.baziDayPillar, a1.starMansion, a2.starMansion,
      );
      // Defensive: ensure calc has required shape
      if (!calc || !calc.overallTag || !calc.overallScore) return;
      if (!mountedRef.current) return;
      setResult({ artist1: a1, artist2: a2, calc });
      setStep("report");
      timerRef.current = null;
      // Auto-save to localStorage
      try {
        const record = {
          title: `CP: ${getArtistDisplayName(a1, locale)} × ${getArtistDisplayName(a2, locale)}`,
          type: "cp",
          date: new Date().toLocaleDateString("zh-CN"),
          preview: `缘分评分 ${calc.overallScore} · ${calc.overallTag.label} · ${calc.starMansionRelation}`,
        };
        const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]");
        existing.unshift(record);
        localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)));
      } catch {}
    }, 2000);
  }, [artist1Id, artist2Id, locale]);

  const YEARS = Array.from({ length: 30 }, (_, i) => 2000 + i);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
  const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-16">
        <ErrorBoundary fallbackMessage="CP合盘报告加载异常">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFB6C110] border border-[#FFB6C120] rounded-full mb-4 relative">
              <Heart className="w-3 h-3 text-[#FFB6C1]" />
              <span className="text-[10px] text-[#FFB6C1] uppercase tracking-wider">
                {t("CP Fate Report", "CP 缘分合盘报告", "CP 緣分合盤報告")}
              </span>
              <span className="absolute -top-2 -right-3 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[8px] font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">HOT</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">
              {t("Cosmic Pair Reading", "宇宙双人星盘解读", "宇宙雙人星盤解讀")}
            </h1>
          </div>

          {step === "input" && (
            <div className="glass rounded-2xl p-6 border border-[#d4a85315] space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{t("Select Two Idols", "选择两位爱豆", "選擇兩位愛豆")}</h3>
                <p className="text-[10px] text-[#8a8aad44] mb-3">
                  {t("Pick two idols to generate their cosmic CP compatibility report", "选择两位爱豆，生成 CP 缘分合盘报告", "選擇兩位愛豆，生成 CP 緣分合盤報告")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[artist1Id, artist2Id].map((selId, idx) => (
                    <SearchableSelect key={idx}
                      options={ALL_ARTISTS.map(a => ({ id: a.id, label: getArtistDisplayName(a, locale), sub: a.groupName, heat: a.cpHeat || 0 }))}
                      value={selId}
                      onChange={(id) => { const v = parseInt(id); idx === 0 ? setArtist1Id(v || null) : setArtist2Id(v || null) }}
                      placeholder={t(`Idol ${idx + 1}`, `爱豆 ${idx + 1}`, `愛豆 ${idx + 1}`)}
                    />
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!artist1Id || !artist2Id}
                className="w-full py-3.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                {t("Generate CP Report", "生成 CP 缘分报告", "生成 CP 緣分報告")}
              </button>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center py-20">
              <Heart className="w-12 h-12 text-[#FFB6C1] animate-pulse" />
              <p className="mt-4 text-sm text-[#f0e6d3]">{t("Weaving your cosmic story...", "正在编织你们的宇宙故事...", "正在編織你們的宇宙故事...")}</p>
            </div>
          )}

          {step === "report" && result?.calc?.overallScore != null && result?.artist1 && result?.artist2 && (
            <div className="space-y-4 animate-fade-in">
              <button onClick={() => { setStep("input"); setResult(null); }}
                className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853]">
                <ArrowLeft className="w-3.5 h-3.5" /> {t("Back", "返回重选", "返回重選")}
              </button>

              {/* Hero Score — restructured hierarchy */}
              <div className="glass rounded-2xl p-4 sm:p-5 border border-[#FFB6C120] text-center space-y-2.5">
                {/* Logo — high-res gold, clickable to home */}
                <Link to="/" className="inline-flex items-center gap-2 group">
                  <Sparkles className="w-5 h-5 text-white group-hover:scale-110 transition-transform" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
                  <span className="font-display text-sm font-bold text-white tracking-widest" style={{ textShadow: '0 0 4px rgba(255,255,255,0.6)' }}>R7 Fortune</span>
                </Link>

                {/* Layer 1: Main title */}
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFB6C1] -mt-2.5" style={{ transform: 'translateY(-12px)' }}>
                  {t("CP Fate Report", "CP 缘分合盘报告", "CP 緣分合盤報告")}
                </h2>

                {/* Layer 2: CP names */}
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <span className="text-3xl">{ZODIAC_EMOJIS[artist1?.zodiacSign || ""] || "✨"}</span>
                    <p className="text-sm font-semibold text-[#f0e6d3] mt-0.5">{artist1Name}</p>
                  </div>
                  <Heart className="w-6 h-6 text-[#FFB6C1]" />
                  <div>
                    <span className="text-3xl">{ZODIAC_EMOJIS[artist2?.zodiacSign || ""] || "✨"}</span>
                    <p className="text-sm font-semibold text-[#f0e6d3] mt-0.5">{artist2Name}</p>
                  </div>
                </div>

                {/* Layer 3: Destiny Tag */}
                {(() => {
                  const tag = result?.calc?.overallTag?.tag;
                  const cfg = tag ? RELATION_CONFIG[tag] : null;
                  if (!cfg) return <p className="text-sm text-[#8a8aad]">—</p>;
                  return (
                    <p className="text-xl font-bold" style={{ color: cfg.color }}>{cfg.emoji} {cfg.label}</p>
                  );
                })()}
              </div>

              {/* ===== ⭐ CP 星辰應援榜 ===== */}
              <CpStarRanking
                cpKey={`${artist1?.stageName}_${artist2?.stageName}`}
                cpName={`${artist1Name} × ${artist2Name}`}
                locale={locale}
              />

              <div className="glass rounded-2xl p-4 border border-[#d4a85324] bg-[#d4a85308]">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#d4a853] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#f0e6d3]">
                      {t("Full CP Report Open for Sharing", "完整 CP 报告已开放分享", "完整 CP 報告已開放分享")}
                    </p>
                    <p className="text-xs text-[#8a8aad] mt-1">
                      {t(
                        "Read the complete report below, then save the poster or copy a share caption.",
                        "下方可查看完整报告，并保存海报或复制分享文案。",
                        "下方可查看完整報告，並儲存海報或複製分享文案。"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== FULL REPORT SECTIONS ===== */}
              <div className="glass rounded-2xl p-5 border border-[#d4a85310] space-y-4">
                {/* Data summary card */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="rounded-xl bg-[#FFB6C110] border border-[#FFB6C120] p-3 text-center">
                    <p className="text-[10px] text-[#8a8aad]">{t("Match Score", "缘分评分", "緣分評分")}</p>
                    <p className="text-lg font-bold text-[#FFB6C1] mt-0.5">{result.calc.overallScore}</p>
                  </div>
                  <div className="rounded-xl bg-[#d4a85308] border border-[#d4a85315] p-3 text-center">
                    <p className="text-[10px] text-[#8a8aad]">{t("Elements", "五行", "五行")}</p>
                    <p className="text-sm font-bold text-[#d4a853] mt-0.5">{artist1?.element} × {artist2?.element}</p>
                  </div>
                  <div className="rounded-xl bg-[#d4a85308] border border-[#d4a85315] p-3 text-center">
                    <p className="text-[10px] text-[#8a8aad]">{t("Star Bond", "星宿", "星宿")}</p>
                    <p className="text-sm font-bold text-[#d4a853] mt-0.5">{result.calc.starMansionRelation}</p>
                  </div>
                </div>
                {/* 1. Magnetic Attraction */}
                <Section title={t("Innate Magnetic Attraction", "先天磁场契合度", "先天磁場契合度")} icon="🫧">
                  {t(
                    `${artist1Name} and ${artist2Name} exist on the same cosmic frequency — an invisible thread woven through their birth charts pulls them into each other's orbit. Their elemental signatures (${artist1?.element} and ${artist2?.element}) create a unique vibrational field where even silence feels charged with meaning.\n\nFrom an astrological perspective, the ${artist1?.element}-${artist2?.element} dynamic forms ${artist1?.element === artist2?.element ? "a resonant harmonic — like two instruments tuned to the same key. When same-element pairs connect, there's an immediate, instinctive understanding that bypasses language entirely. This is not surface-level compatibility; it's a fundamental alignment of energetic blueprints." : artist1?.element === "火" && artist2?.element === "风" || artist1?.element === "风" && artist2?.element === "火" ? "a classic combustion cycle — Fire provides the spark, Air supplies the oxygen. Together they create something neither could sustain alone: a blaze that illuminates everything around them. This is the most dynamically charged elemental pairing in the zodiac." : artist1?.element === "水" && artist2?.element === "土" || artist1?.element === "土" && artist2?.element === "水" ? "a nourishing foundation — Water brings emotional depth and flow, Earth provides structure and stability. Like rain falling on fertile soil, their interaction creates the conditions for deep-rooted growth that withstands any storm." : "a complementary polarity — their elemental differences create a magnetic tension that, when consciously navigated, produces the most profound growth. The friction between their natures isn't a flaw; it's the very source of their chemistry."}\n\nThe ${result.calc.starMansionRelation} mansion connection adds another layer: this is not merely a personality match, but a karmic arrangement. In the 28-mansion system, ${result.calc.starMansionRelation} represents ${result.calc.starMansionRelation === "命之星" ? "the rarest of bonds — two souls cast from the same stellar mold. They don't just understand each other; they ARE each other, refracted through different lifetimes." : result.calc.starMansionRelation === "荣亲" ? "a bond of mutual elevation — one naturally uplifts the other, creating a cycle of shared growth and genuine pride in each other's becoming." : result.calc.starMansionRelation === "安坏" ? "a bond of intense polarity — stability meets disruption, and in that friction, both are transformed. This is not a comfortable connection, but it is an unforgettable one." : result.calc.starMansionRelation === "危成" ? "a bond forged in challenge — their connection thrives under pressure, revealing strengths neither knew they possessed. Together, they can weather what would break others." : result.calc.starMansionRelation === "业胎" ? "a bond spanning lifetimes — there is unfinished business between these souls, a story that began long before this life and will continue long after." : "a bond of easy companionship — not all profound connections need to be dramatic. Some are simply... right."}`,
                    `${artist1Name}與${artist2Name}存在於同一宇宙頻率之上——一條貫穿他們出生星盤的隱形絲線，將兩人拉入彼此的軌道。他們的元素印記（${artist1?.element}與${artist2?.element}）創造出一種獨特的振動場域，連沉默都充滿了意義的電荷。\n\n從占星學角度深入分析，${artist1?.element}-${artist2?.element}的五行動態形成了${artist1?.element === artist2?.element ? "一種共鳴諧波——如同兩把調至同一音高的樂器。當相同元素的能量相遇，會產生一種即時的、本能的理解，完全繞過了語言的限制。這不是表面的合拍，而是能量藍圖的根本對齊。" : artist1?.element === "火" && artist2?.element === "风" || artist1?.element === "风" && artist2?.element === "火" ? "經典的燃燒循環——火提供火花，風供應氧氣。兩者共同創造出任何一方都無法獨自維持的烈焰，照亮周圍的一切。這是十二星座中最具動態張力的元素配對。" : artist1?.element === "水" && artist2?.element === "土" || artist1?.element === "土" && artist2?.element === "水" ? "一種滋養的根基——水帶來情感的深度與流動，土提供結構與穩定。如同雨水落在肥沃的土壤上，他們的互動創造了深根生長的條件，能夠抵禦任何風暴。" : "一種互補的兩極——他們的元素差異創造了一種磁性的張力，當有意識地導航時，會產生最深刻的成長。他們本質之間的摩擦不是缺陷，恰恰是化學反應的源頭。"}\n\n${result.calc.starMansionRelation}星宿連接為這一切增添了另一個維度：這不僅是性格的匹配，而是一種業力安排。在二十八星宿體系中，${result.calc.starMansionRelation}代表${result.calc.starMansionRelation === "命之星" ? "最稀有的連結——兩個靈魂由同一星體模具鑄造。他們不僅理解彼此，他們在不同生命中互為對方的折射。" : result.calc.starMansionRelation === "荣亲" ? "互相提升的羈絆——一方自然而然地抬升另一方，創造出共享成長與真誠驕傲的循環。" : result.calc.starMansionRelation === "安坏" ? "強烈兩極的連結——穩定與破壞相遇，在那摩擦中，雙方都被徹底轉化。這不是舒適的連結，但絕對是難以忘懷的。" : result.calc.starMansionRelation === "危成" ? "在挑戰中鍛造的連結——他們的連結在壓力下蓬勃發展，顯露出雙方都不知道自己擁有的力量。" : result.calc.starMansionRelation === "业胎" ? "跨越生世的羈絆——這些靈魂之間有未完成的事，一個在此生之前就已開始的故事。" : "一種輕鬆陪伴的連結——並非所有深刻的連結都需要戲劇性。有些只是⋯⋯剛剛好。"}`,
                    `${artist1Name}與${artist2Name}存在於同一宇宙頻率之上——一條貫穿他們出生星盤的隱形絲線，將兩人拉入彼此的軌道。他們的元素印記（${artist1?.element}與${artist2?.element}）創造出一種獨特的振動場域，連沉默都充滿了意義的電荷。\n\n從占星學角度深入分析，${artist1?.element}-${artist2?.element}的五行動態形成了${artist1?.element === artist2?.element ? "一種共鳴諧波——如同兩把調至同一音高的樂器。當相同元素的能量相遇，會產生一種即時的、本能的理解，完全繞過了語言的限制。這不是表面的合拍，而是能量藍圖的根本對齊。" : artist1?.element === "火" && artist2?.element === "风" || artist1?.element === "风" && artist2?.element === "火" ? "經典的燃燒循環——火提供火花，風供應氧氣。兩者共同創造出任何一方都無法獨自維持的烈焰，照亮周圍的一切。這是十二星座中最具動態張力的元素配對。" : artist1?.element === "水" && artist2?.element === "土" || artist1?.element === "土" && artist2?.element === "水" ? "一種滋養的根基——水帶來情感的深度與流動，土提供結構與穩定。如同雨水落在肥沃的土壤上，他們的互動創造了深根生長的條件，能夠抵禦任何風暴。" : "一種互補的兩極——他們的元素差異創造了一種磁性的張力，當有意識地導航時，會產生最深刻的成長。他們本質之間的摩擦不是缺陷，恰恰是化學反應的源頭。"}\n\n${result.calc.starMansionRelation}星宿連接為這一切增添了另一個維度：這不僅是性格的匹配，而是一種業力安排。在二十八星宿體系中，${result.calc.starMansionRelation}代表${result.calc.starMansionRelation === "命之星" ? "最稀有的連結——兩個靈魂由同一星體模具鑄造。他們不僅理解彼此，他們在不同生命中互為對方的折射。" : result.calc.starMansionRelation === "荣亲" ? "互相提升的羈絆——一方自然而然地抬升另一方，創造出共享成長與真誠驕傲的循環。" : result.calc.starMansionRelation === "安坏" ? "強烈兩極的連結——穩定與破壞相遇，在那摩擦中，雙方都被徹底轉化。這不是舒適的連結，但絕對是難以忘懷的。" : result.calc.starMansionRelation === "危成" ? "在挑戰中鍛造的連結——他們的連結在壓力下蓬勃發展，顯露出雙方都不知道自己擁有的力量。" : result.calc.starMansionRelation === "业胎" ? "跨越生世的羈絆——這些靈魂之間有未完成的事，一個在此生之前就已開始的故事。" : "一種輕鬆陪伴的連結——並非所有深刻的連結都需要戲劇性。有些只是⋯⋯剛剛好。"}`
                  )}
                </Section>

                {/* 2. Venus Character Complement */}
                <Section title={t("Venus Character Complement", "金星性格互补", "金星性格互補")} icon="💫">
                  {t(
                    `${artist1Name}'s ${artist1?.zodiacSign} Venus radiates ${artist1?.element === "火" || artist1?.element === "风" ? "warmth and spontaneity — a love language spoken through action, through presence, through the sheer force of being fully alive in the moment" : "depth and sensitivity — a love language whispered in silences, in gestures too subtle for words, in the quiet knowing that needs no explanation"}, while ${artist2Name}'s ${artist2?.zodiacSign} energy brings ${artist2?.element === "水" || artist2?.element === "土" ? "grounded stability and quiet strength — the kind of love that shows up, that stays, that builds foundations when others are still chasing sparks" : "curiosity and intellectual spark — a love that engages the mind as much as the heart, that finds romance in conversation and intimacy in shared ideas"}.\n\nIn the Venus synastry overlay, ${artist1Name}'s approach to love ${artist1?.element === "火" ? "burns bright and direct — there is no guessing, no games, just the raw honesty of desire" : artist1?.element === "水" ? "flows like a deep current — emotions run beneath the surface, carrying profound meaning in every gesture" : artist1?.element === "木" ? "grows organically — love is not rushed but cultivated, deepening over time like roots anchoring a tree" : artist1?.element === "金" ? "seeks refinement and clarity — love should be beautiful, intentional, worthy of the standards they hold" : "anchors with purpose — love is built, stone by stone, into something that can withstand any season"}. ${artist2Name}'s Venus, meanwhile, ${artist2?.element === "火" ? "responds to this with equal intensity — two flames don't compete; they merge into something greater" : artist2?.element === "水" ? "mirrors this depth with intuitive understanding — they don't need to be told; they already feel it" : artist2?.element === "木" ? "nurtures this growth with patient care — they know that the most beautiful gardens take time" : artist2?.element === "金" ? "matches this standard with their own — together they elevate each other's expectations of what love can be" : "provides the unwavering ground — no matter how high the other reaches, there is always a place to land"}.\n\nTogether, they form a yin-yang dance of complementary temperaments — one fills the spaces the other leaves open, like two puzzle pieces carved from the same nebula.`,
                    `${artist1Name}的${artist1?.zodiacSign}金星散發著${artist1?.element === "火" || artist1?.element === "风" ? "熱烈而率真的光芒——一種用行動、用存在、用純粹的生命力來表達的愛情語言" : "深邃而敏感的溫柔——一種在沉默中、在過於細膩以至於無法言說的姿態中、在不需要解釋的安靜默契中低語的愛情語言"}，而${artist2Name}的${artist2?.zodiacSign}能量則帶來了${artist2?.element === "水" || artist2?.element === "土" ? "沉穩的安定與靜默的力量——那種會留下來、會堅守、會在別人還在追逐火花時默默建造根基的愛情" : "靈動的好奇與智慧的火花——一種同時觸動心靈與思想的愛情，在對話中發現浪漫，在共享的想法中感受親密"}。\n\n在金星合盤疊圖中，${artist1Name}的愛情方式${artist1?.element === "火" ? "燃燒得明亮而直接——沒有猜測、沒有遊戲，只有慾望的赤裸坦誠" : artist1?.element === "水" ? "像一股深流般流動——情感在表面之下運行，每一個姿態都攜帶著深邃的意義" : artist1?.element === "木" ? "自然地生長——愛情不急於求成，而是被悉心培育，如同樹根錨定大地般隨著時間加深" : artist1?.element === "金" ? "追求精緻與清晰——愛情應該是美麗的、有意識的、值得他們所堅持的標準" : "以目標為錨點——愛情是一磚一瓦建造的，足以抵禦任何季節的考驗"}。而${artist2Name}的金星則${artist2?.element === "火" ? "以同等的強度回應——兩團火焰不會競爭，它們融合成更偉大的東西" : artist2?.element === "水" ? "以直覺的理解映照這份深度——不需要被告知，他們早已感受到" : artist2?.element === "木" ? "以耐心的呵護滋養這份成長——他們知道最美的花園需要時間" : artist2?.element === "金" ? "以自身的標準匹配——他們一起提升了彼此對愛情可能性的期待" : "提供了不動搖的根基——無論對方飛得多高，總有一個可以降落的地方"}。\n\n兩人形成了陰陽交織的互補之舞——一方填補了另一方留下的空白，如同從同一片星雲中切割而成的兩塊拼圖，天衣無縫。`,
                    `${artist1Name}的${artist1?.zodiacSign}金星散發著${artist1?.element === "火" || artist1?.element === "风" ? "熱烈而率真的光芒——一種用行動、用存在、用純粹的生命力來表達的愛情語言" : "深邃而敏感的溫柔——一種在沉默中、在過於細膩以至於無法言說的姿態中、在不需要解釋的安靜默契中低語的愛情語言"}，而${artist2Name}的${artist2?.zodiacSign}能量則帶來了${artist2?.element === "水" || artist2?.element === "土" ? "沉穩的安定與靜默的力量——那種會留下來、會堅守、會在別人還在追逐火花時默默建造根基的愛情" : "靈動的好奇與智慧的火花——一種同時觸動心靈與思想的愛情，在對話中發現浪漫，在共享的想法中感受親密"}。\n\n在金星合盤疊圖中，${artist1Name}的愛情方式${artist1?.element === "火" ? "燃燒得明亮而直接——沒有猜測、沒有遊戲，只有慾望的赤裸坦誠" : artist1?.element === "水" ? "像一股深流般流動——情感在表面之下運行，每一個姿態都攜帶著深邃的意義" : artist1?.element === "木" ? "自然地生長——愛情不急於求成，而是被悉心培育，如同樹根錨定大地般隨著時間加深" : artist1?.element === "金" ? "追求精緻與清晰——愛情應該是美麗的、有意識的、值得他們所堅持的標準" : "以目標為錨點——愛情是一磚一瓦建造的，足以抵禦任何季節的考驗"}。而${artist2Name}的金星則${artist2?.element === "火" ? "以同等的強度回應——兩團火焰不會競爭，它們融合成更偉大的東西" : artist2?.element === "水" ? "以直覺的理解映照這份深度——不需要被告知，他們早已感受到" : artist2?.element === "木" ? "以耐心的呵護滋養這份成長——他們知道最美的花園需要時間" : artist2?.element === "金" ? "以自身的標準匹配——他們一起提升了彼此對愛情可能性的期待" : "提供了不動搖的根基——無論對方飛得多高，總有一個可以降落的地方"}。\n\n兩人形成了陰陽交織的互補之舞——一方填補了另一方留下的空白，如同從同一片星雲中切割而成的兩塊拼圖，天衣無縫。`
                  )}
                </Section>

                {/* 3. First Impression */}
                <Section title={t("First Subconscious Impression", "彼此第一眼潜意识印象", "彼此第一眼潛意識印象")} icon="👁️">
                  {t(
                    `Before a single word passed between them, their souls had already completed an entire conversation. The ascendant-to-ascendant recognition — what astrologers call the "first house overlay" — operates beneath conscious awareness, drawing two people together before logic has a chance to intervene.\n\n${artist1Name}'s subconscious registered ${artist2Name} as ${artist2?.element === "火" ? "a blazing presence impossible to ignore — the kind of energy that enters a room before the person does, that shifts the atmosphere simply by existing" : artist2?.element === "水" ? "a deep, still ocean hiding unfathomable worlds — there is mystery here, and the instinct is not to solve it but to dive in" : artist2?.element === "木" ? "a gentle spring breeze carrying the scent of new beginnings — something fresh, hopeful, full of potential waiting to unfold" : artist2?.element === "金" ? "a polished gem reflecting light in unexpected directions — there is precision here, a quiet elegance that doesn't need to announce itself" : "a mountain — immovable, commanding quiet respect — the kind of presence that doesn't need to speak to be felt"}.\n\n${artist2Name}, in turn, sensed in ${artist1Name} ${artist1?.element === "火" ? "a warmth that felt inexplicably familiar — as if they had known this fire in another life, another time, and the embers were simply waiting to be reignited" : artist1?.element === "水" ? "an emotional depth that whispered of shared past lives — a recognition that bypassed the mind and went straight to the soul" : artist1?.element === "木" ? "a nurturing presence that promised growth and safety — the kind of energy that makes you feel you could bloom just by standing next to it" : artist1?.element === "金" ? "an elegance and clarity that cut through the noise — in a chaotic world, this was a signal, crisp and unmistakable" : "a grounding force that made the chaotic world feel manageable — suddenly, everything that felt overwhelming seemed navigable"}.`,
                    `在兩人交換第一個字之前，他們的靈魂已經完成了一整場對話。上升星座對上升星座的識別——占星師稱之為「第一宮疊圖」——在意識察覺之前就已開始運作，在邏輯有機會介入之前就將兩個人拉向彼此。\n\n${artist1Name}的潛意識中，${artist2Name}是${artist2?.element === "火" ? "一團無法忽視的熾熱火焰——那種在人之前就先進入房間的能量，僅僅存在就足以改變整個氛圍" : artist2?.element === "水" ? "一片靜謐深邃、藏著無盡世界的海洋——這裡有神秘感，而本能不是去解開它，而是縱身潛入" : artist2?.element === "木" ? "一縷攜帶著新生氣息的春日微風——某種新鮮、充滿希望、等待綻放的無限可能" : artist2?.element === "金" ? "一顆折射出意外光芒的精緻寶石——這裡有精準、有不需要宣告自己的安靜優雅" : "一座沉默佇立、令人肅然起敬的山峰——那種不需要開口就能被感知的存在感"}。\n\n而${artist2Name}則在${artist1Name}身上感知到了${artist1?.element === "火" ? "一種說不清緣由的熟悉溫暖——彷彿在另一個生命、另一個時間裡認識過這團火焰，而餘燼只是在等待被重新點燃" : artist1?.element === "水" ? "一種深沉的情感共鳴，彷彿來自某個共同的過去——一種繞過大腦、直接抵達靈魂的確認" : artist1?.element === "木" ? "一種滋養的陪伴感，讓人安心成長——那種站在旁邊就感覺自己可以綻放的能量" : artist1?.element === "金" ? "一份利落優雅的氣質，穿透了所有喧囂——在混亂的世界中，這是一個清晰的訊號" : "一股讓人安心的扎根之力，讓紛亂的世界變得有序——突然之間，所有讓人喘不過氣的東西都變得可以面對了"}。`,
                    `在兩人交換第一個字之前，他們的靈魂已經完成了一整場對話。上升星座對上升星座的識別——占星師稱之為「第一宮疊圖」——在意識察覺之前就已開始運作，在邏輯有機會介入之前就將兩個人拉向彼此。\n\n${artist1Name}的潛意識中，${artist2Name}是${artist2?.element === "火" ? "一團無法忽視的熾熱火焰——那種在人之前就先進入房間的能量，僅僅存在就足以改變整個氛圍" : artist2?.element === "水" ? "一片靜謐深邃、藏著無盡世界的海洋——這裡有神秘感，而本能不是去解開它，而是縱身潛入" : artist2?.element === "木" ? "一縷攜帶著新生氣息的春日微風——某種新鮮、充滿希望、等待綻放的無限可能" : artist2?.element === "金" ? "一顆折射出意外光芒的精緻寶石——這裡有精準、有不需要宣告自己的安靜優雅" : "一座沉默佇立、令人肅然起敬的山峰——那種不需要開口就能被感知的存在感"}。\n\n而${artist2Name}則在${artist1Name}身上感知到了${artist1?.element === "火" ? "一種說不清緣由的熟悉溫暖——彷彿在另一個生命、另一個時間裡認識過這團火焰，而餘燼只是在等待被重新點燃" : artist1?.element === "水" ? "一種深沉的情感共鳴，彷彿來自某個共同的過去——一種繞過大腦、直接抵達靈魂的確認" : artist1?.element === "木" ? "一種滋養的陪伴感，讓人安心成長——那種站在旁邊就感覺自己可以綻放的能量" : artist1?.element === "金" ? "一份利落優雅的氣質，穿透了所有喧囂——在混亂的世界中，這是一個清晰的訊號" : "一股讓人安心的扎根之力，讓紛亂的世界變得有序——突然之間，所有讓人喘不過氣的東西都變得可以面對了"}。`
                  )}
                </Section>

                {/* 4. Mutual True Feelings */}
                <Section title={t("Mutual True Feelings", "双向看待对方的真实本心", "雙向看待對方的真實本心")} icon="💭">
                  {t(
                    `The synastry Moon-Mercury midpoint reveals the unspoken dialogue that flows beneath their conscious interactions. This is the conversation that happens in glances, in pauses, in the space between words.\n\nLooking at ${artist2Name}, ${artist1Name} sees a soul that shines at a wavelength only they can fully perceive — a mix of admiration, protectiveness, and an unspoken "I understand you." There's a quiet reverence that doesn't demand reciprocation. ${artist1?.element === "水" || artist1?.element === "土" ? "This perception runs deep — once someone has earned a place in their inner world, they are held there with a loyalty that transcends circumstance." : "This recognition is immediate and unhesitating — they trust what they see, and what they see in the other is something rare and worth protecting."}\n\nWhen ${artist2Name} gazes at ${artist1Name}, there's a gravitational pull that defies logic — a feeling of "you are the gravity that keeps my orbit stable." ${artist2?.element === "火" || artist2?.element === "风" ? "This is an active, engaged form of admiration — not passive worship, but a dynamic appreciation that seeks to celebrate and amplify what it sees." : "This is a quiet, profound recognition — the kind that doesn't need constant verbal affirmation because it is felt at a cellular level."}\n\nBeneath the surface, a mutual recognition hums: we are cut from the same cloth of stardust. The composite chart — the chart of the relationship itself — suggests that what they see in each other is, in many ways, what they are learning to see in themselves.`,
                    `合盤中的月亮-水星中點揭示了一段在意識互動之下流淌的無聲對話——那些發生在目光中、在停頓中、在言語之間空隙中的交流。\n\n${artist1Name}看向${artist2Name}時，看到的是一種只有Ta能完全感知的靈魂波長——摻雜著欣賞、守護慾，以及一句無聲的「我懂你」。那份安靜的珍視不求任何回應。${artist1?.element === "水" || artist1?.element === "土" ? "這種感知根植極深——一旦有人在他們的內心世界贏得了位置，就會被一種超越環境的忠誠所守護。" : "這種確認是即時且毫不猶豫的——他們相信自己所看到的，而他們在對方身上看到的，是某種稀有且值得守護的東西。"}\n\n當${artist2Name}凝望${artist1Name}時，則感到一種超越邏輯的引力——「你是讓我軌道穩定的重力。」${artist2?.element === "火" || artist2?.element === "风" ? "這是一種積極投入的欣賞——不是被動的崇拜，而是一種動態的珍視，試圖去慶祝和放大它所看到的。" : "這是一種安靜而深刻的確認——不需要持續的言語肯定，因為它在細胞層面上被感知。"}\n\n表象之下，共同的認知在低語：我們是由同一片星塵裁剪而成。組合盤——關係本身的星盤——顯示出，他們在彼此身上看到的，從很多方面來說，正是他們正在學習在自己身上看到的。`,
                    `合盤中的月亮-水星中點揭示了一段在意識互動之下流淌的無聲對話——那些發生在目光中、在停頓中、在言語之間空隙中的交流。\n\n${artist1Name}看向${artist2Name}時，看到的是一種只有Ta能完全感知的靈魂波長——摻雜著欣賞、守護慾，以及一句無聲的「我懂你」。那份安靜的珍視不求任何回應。${artist1?.element === "水" || artist1?.element === "土" ? "這種感知根植極深——一旦有人在他們的內心世界贏得了位置，就會被一種超越環境的忠誠所守護。" : "這種確認是即時且毫不猶豫的——他們相信自己所看到的，而他們在對方身上看到的，是某種稀有且值得守護的東西。"}\n\n當${artist2Name}凝望${artist1Name}時，則感到一種超越邏輯的引力——「你是讓我軌道穩定的重力。」${artist2?.element === "火" || artist2?.element === "风" ? "這是一種積極投入的欣賞——不是被動的崇拜，而是一種動態的珍視，試圖去慶祝和放大它所看到的。" : "這是一種安靜而深刻的確認——不需要持續的言語肯定，因為它在細胞層面上被感知。"}\n\n表象之下，共同的認知在低語：我們是由同一片星塵裁剪而成。組合盤——關係本身的星盤——顯示出，他們在彼此身上看到的，從很多方面來說，正是他們正在學習在自己身上看到的。`
                  )}
                </Section>

                {/* 5. Ambiguous Destiny Bond */}
                <Section title={t("Ambiguous Destiny Bond", "暧昧宿命羁绊", "曖昧宿命羈絆")} icon="💕">
                  {t(
                    `There exists between them an invisible elastic band — the more the universe tries to separate their paths, the stronger the recoil that brings them back together. This is the nature of the ${result.calc.starMansionRelation} mansion connection, one of the six archetypal karmic bonds in the 28-mansion system that has been studied for over two millennia.\n\nThe ${result.calc.starMansionRelation} bond specifically suggests ${result.calc.starMansionRelation === "命之星" ? "past-life recognition of the deepest kind — these are souls who have shared not just experiences, but an essential identity. Meeting in this life feels less like a new encounter and more like a reunion after an impossibly long separation. The familiarity is uncanny; the comfort is immediate." : result.calc.starMansionRelation === "荣亲" ? "a relationship of mutual elevation and genuine pride — they are each other's biggest supporters, not out of obligation but because the other's success feels like their own. This is a bond of shared destiny, not shared dependency." : result.calc.starMansionRelation === "安坏" ? "a magnetic push-pull that oscillates between intense attraction and necessary conflict — they trigger each other in ways that are uncomfortable but ultimately transformative. This is not an easy bond, but it is an unforgettable one." : result.calc.starMansionRelation === "危成" ? "a relationship forged in shared challenges — their bond deepens most when facing external adversity together. Like tempered steel, what doesn't break them makes their connection stronger." : result.calc.starMansionRelation === "业胎" ? "a karmic debt carried across incarnations — there is unfinished business between them, a story that began long before this life. The intensity can be overwhelming because it carries the weight of more than one lifetime." : "a bond of easy, natural companionship — not all significant relationships need to be dramatic. Some are simply correct, in a way that feels like exhaling after holding your breath for too long."}\n\nThis isn't a simple crush; it's a karmic echo. Every glance exchanged adds another knot to the thread tying their fates together. The universe seems to whisper: "You two have unfinished business."`,
                    `他們之間存在一根無形的彈力帶——宇宙越是試圖將他們的軌跡分開，回彈的力量就越強，將兩人再次拉回彼此身邊。這就是${result.calc.starMansionRelation}星宿連結的本質——二十八星宿體系中被研究了兩千多年的六種原型業力紐帶之一。\n\n${result.calc.starMansionRelation}之緣具體代表${result.calc.starMansionRelation === "命之星" ? "最深層的前世相認——這些靈魂不僅共享過經歷，更共享過一種本質的身分。今生相遇不像新的邂逅，更像是經歷了漫長得不可思議的分離之後的重逢。那份熟悉感令人不安；那份安心感卻即刻降臨。" : result.calc.starMansionRelation === "荣亲" ? "一種互相提升、真誠驕傲的關係——他們是彼此最大的支持者，不是出於義務，而是因為對方的成功就像自己的一樣。這是共享命運的羈絆，而非共享依賴。" : result.calc.starMansionRelation === "安坏" ? "一種在強烈吸引與必要衝突之間搖擺的磁性推拉——他們以令人不適但最終具有轉化力的方式觸發彼此。這不是一段輕鬆的連結，但絕對是一段無法忘懷的。" : result.calc.starMansionRelation === "危成" ? "一種在共同挑戰中鍛造的關係——他們的連結在面對外部逆境時最為深厚。如同淬火鋼鐵，無法摧毀他們的，只會讓他們的連結更加堅固。" : result.calc.starMansionRelation === "业胎" ? "一種跨越化身的業力債務——他們之間有未完成的事，一個在此生之前就已經開始的故事。那份強度可能讓人喘不過氣，因為它承載著不止一生的重量。" : "一種輕鬆、自然的陪伴關係——並非所有重要的關係都必須充滿戲劇性。有些就只是⋯⋯對了，就像憋氣太久之後的呼氣。"}\n\n這不是簡單的crush——這是業力的迴響。每一次目光交匯，都在命運的繩索上又添了一個結。宇宙彷彿在低語：「你們之間，還有未完成的約定。」`,
                    `他們之間存在一根無形的彈力帶——宇宙越是試圖將他們的軌跡分開，回彈的力量就越強，將兩人再次拉回彼此身邊。這就是${result.calc.starMansionRelation}星宿連結的本質——二十八星宿體系中被研究了兩千多年的六種原型業力紐帶之一。\n\n${result.calc.starMansionRelation}之緣具體代表${result.calc.starMansionRelation === "命之星" ? "最深層的前世相認——這些靈魂不僅共享過經歷，更共享過一種本質的身分。今生相遇不像新的邂逅，更像是經歷了漫長得不可思議的分離之後的重逢。那份熟悉感令人不安；那份安心感卻即刻降臨。" : result.calc.starMansionRelation === "荣亲" ? "一種互相提升、真誠驕傲的關係——他們是彼此最大的支持者，不是出於義務，而是因為對方的成功就像自己的一樣。這是共享命運的羈絆，而非共享依賴。" : result.calc.starMansionRelation === "安坏" ? "一種在強烈吸引與必要衝突之間搖擺的磁性推拉——他們以令人不適但最終具有轉化力的方式觸發彼此。這不是一段輕鬆的連結，但絕對是一段無法忘懷的。" : result.calc.starMansionRelation === "危成" ? "一種在共同挑戰中鍛造的關係——他們的連結在面對外部逆境時最為深厚。如同淬火鋼鐵，無法摧毀他們的，只會讓他們的連結更加堅固。" : result.calc.starMansionRelation === "业胎" ? "一種跨越化身的業力債務——他們之間有未完成的事，一個在此生之前就已經開始的故事。那份強度可能讓人喘不過氣，因為它承載著不止一生的重量。" : "一種輕鬆、自然的陪伴關係——並非所有重要的關係都必須充滿戲劇性。有些就只是⋯⋯對了，就像憋氣太久之後的呼氣。"}\n\n這不是簡單的crush——這是業力的迴響。每一次目光交匯，都在命運的繩索上又添了一個結。宇宙彷彿在低語：「你們之間，還有未完成的約定。」`
                  )}
                </Section>

                {/* 6. Strengths & Weaknesses */}
                <Section title={t("Dynamic Strengths & Hidden Frictions", "相处优缺点与隐形隔阂", "相處優缺點與隱形隔閡")} icon="⚖️">
                  {t(
                    `A thorough synastry analysis reveals both the harmonic convergences and the friction points that define this relationship's unique texture.\n\nSTRENGTHS: The ${artist1?.element}-${artist2?.element} five-element dynamic creates ${artist1?.element === artist2?.element ? "a natural resonance chamber where both instinctively understand each other's rhythms. Same-element pairs share an unspoken language — they move through the world at similar speeds, process emotions through similar filters, and find comfort in the same kinds of spaces. This creates a home-like safety that is rare and precious." : "a complementary contrast that keeps the relationship dynamic and prevents the stagnation that often comes with too much similarity. Their differences are not obstacles — they are the very engines of their chemistry, each providing what the other naturally lacks."}\n\nTheir ${result.calc.starMansionRelation} mansion bond specifically fosters ${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "uncommon emotional safety — the kind where masks fall away without effort. In each other's presence, there is permission to be fully, unapologetically oneself. This is the foundation upon which lasting intimacy is built." : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "an exhilarating push-pull tension that prevents complacency. This is a connection that demands evolution — neither person can remain static in the presence of the other, and that is precisely its gift." : "a refreshing ease that makes every interaction feel like coming home — not in the sense of familiarity, but in the sense of belonging. There is a natural fit here that requires no forcing."}\n\nWEAKNESSES & HIDDEN FRICTIONS: ${artist1?.element === "火" && artist2?.element === "水" ? "Fire's natural intensity can inadvertently evaporate Water's subtle emotional signals before they are fully expressed. Meanwhile, Water's depth can feel overwhelming to Fire, who prefers clarity over complexity. The solution is not for Fire to dim or Water to shallow — but for both to recognize that their different languages require translation, not correction." : artist1?.element === "金" && artist2?.element === "木" ? "Metal's sharp clarity can cut through Wood's gentle, organic growth patterns without realizing the damage. Wood's sprawling, ever-expanding nature can feel chaotic and undisciplined to Metal's need for precision. The key is for Metal to learn patience with process, and for Wood to appreciate the beauty of structure." : artist1?.element === "水" && artist2?.element === "火" ? "Water's emotional depth can feel suffocating to Fire's need for space and freedom. Fire's intensity can feel destabilizing to Water's need for emotional safety. Neither is wrong — they simply operate on different emotional frequencies. Conscious effort to meet in the middle is required." : artist1?.element === "土" && artist2?.element === "风" ? "Earth's need for stability can feel restrictive to Air's need for movement and change. Air's detachment can feel dismissive to Earth's need for tangible commitment. The balance lies in Air learning to ground, and Earth learning to bend." : artist1?.element === artist2?.element ? "The greatest risk is not conflict but complacency — two people so similar that they forget to challenge each other. Growth comes from difference, and without it, even the most harmonious connection can become stagnant. They must actively seek out perspectives that differ from their shared defaults." : "Their elemental differences, while a source of magnetic attraction, also require the most conscious navigation. What feels perfectly natural to one may be deeply confusing to the other — not because either is wrong, but because their energetic mother tongues are different languages."}`,
                    `深入合盤分析揭示了定義這段關係獨特質地的和諧交匯點與摩擦點。\n\n優點：${artist1?.element}-${artist2?.element}的五行動態創造了${artist1?.element === artist2?.element ? "天然的共振空間，兩人本能地理解彼此的節奏。同元素配對共享一套無聲的語言——他們以相似的速度穿行世界，透過相似的濾鏡處理情感，在同一類空間中找到慰藉。這創造了一種罕見而珍貴的歸屬感。" : "一種互補的對比，讓關係保持動態，防止因過於相似而產生的停滯。他們的差異不是障礙——正是他們化學反應的引擎，各自提供對方自然缺乏的東西。"}\n\n他們的${result.calc.starMansionRelation}星宿連結特別促成了${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "難得的情感安全感——那種無需費力就能卸下面具的親密。在彼此面前，有一種可以完全、毫無歉意地做自己的許可。這是持久親密關係建立的基礎。" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "令人心動的推拉張力，防止安逸——這是一段要求進化的連結。兩個人都無法在對方身邊保持靜止，而這恰恰是它的禮物。" : "一種清新的輕鬆感，讓每次互動都宛如歸家——不是熟悉感意義上的歸家，而是歸屬感意義上的。這裡有一種不需要強求的自然契合。"}\n\n隱患與隱形摩擦：${artist1?.element === "火" && artist2?.element === "水" ? "火的自然強度可能在水的細微情感訊號完全表達之前就不經意地蒸發了它們。同時，水的深度可能讓火感到難以承受——火偏愛清晰而非複雜。解決方案不是讓火變暗或讓水變淺——而是讓雙方認識到，他們不同的語言需要翻譯而非糾正。" : artist1?.element === "金" && artist2?.element === "木" ? "金的銳利清晰可能在沒有意識到傷害的情況下，切斷了木溫柔、有機的生長模式。木蔓延、不斷擴展的本質可能讓金對精確的追求感到混亂和無序。關鍵在於金要學習對過程保持耐心，木要學會欣賞結構之美。" : artist1?.element === "水" && artist2?.element === "火" ? "水的情感深度可能讓火對空間和自由的渴望感到窒息。火的強度可能讓水對情感安全的需求感到不穩定。兩者都沒有錯——他們只是以不同的情感頻率運作。需要有意識地努力在中間相遇。" : artist1?.element === "土" && artist2?.element === "风" ? "土對穩定的需求可能讓風對移動和變化的渴望感到受限。風的疏離可能讓土對有形承諾的需求感到被輕視。平衡在於風學習扎根，土學習彎曲。" : artist1?.element === artist2?.element ? "最大的風險不是衝突，而是安逸——兩個如此相似的人忘記挑戰彼此。成長來自差異，沒有差異，即使是最和諧的連結也會變得停滯。他們必須積極尋找與他們共享預設不同的視角。" : "他們的元素差異雖然是磁性吸引的來源，但也需要最有意識的導航。對一方來說完全自然的東西，可能讓另一方深感困惑——不是因為任何一方有錯，而是因為他們的能量母語是不同的語言。"}`,
                    `深入合盤分析揭示了定義這段關係獨特質地的和諧交匯點與摩擦點。\n\n優點：${artist1?.element}-${artist2?.element}的五行動態創造了${artist1?.element === artist2?.element ? "天然的共振空間，兩人本能地理解彼此的節奏。同元素配對共享一套無聲的語言——他們以相似的速度穿行世界，透過相似的濾鏡處理情感，在同一類空間中找到慰藉。這創造了一種罕見而珍貴的歸屬感。" : "一種互補的對比，讓關係保持動態，防止因過於相似而產生的停滯。他們的差異不是障礙——正是他們化學反應的引擎，各自提供對方自然缺乏的東西。"}\n\n他們的${result.calc.starMansionRelation}星宿連結特別促成了${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "難得的情感安全感——那種無需費力就能卸下面具的親密。在彼此面前，有一種可以完全、毫無歉意地做自己的許可。這是持久親密關係建立的基礎。" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "令人心動的推拉張力，防止安逸——這是一段要求進化的連結。兩個人都無法在對方身邊保持靜止，而這恰恰是它的禮物。" : "一種清新的輕鬆感，讓每次互動都宛如歸家——不是熟悉感意義上的歸家，而是歸屬感意義上的。這裡有一種不需要強求的自然契合。"}\n\n隱患與隱形摩擦：${artist1?.element === "火" && artist2?.element === "水" ? "火的自然強度可能在水的細微情感訊號完全表達之前就不經意地蒸發了它們。同時，水的深度可能讓火感到難以承受——火偏愛清晰而非複雜。解決方案不是讓火變暗或讓水變淺——而是讓雙方認識到，他們不同的語言需要翻譯而非糾正。" : artist1?.element === "金" && artist2?.element === "木" ? "金的銳利清晰可能在沒有意識到傷害的情況下，切斷了木溫柔、有機的生長模式。木蔓延、不斷擴展的本質可能讓金對精確的追求感到混亂和無序。關鍵在於金要學習對過程保持耐心，木要學會欣賞結構之美。" : artist1?.element === "水" && artist2?.element === "火" ? "水的情感深度可能讓火對空間和自由的渴望感到窒息。火的強度可能讓水對情感安全的需求感到不穩定。兩者都沒有錯——他們只是以不同的情感頻率運作。需要有意識地努力在中間相遇。" : artist1?.element === "土" && artist2?.element === "风" ? "土對穩定的需求可能讓風對移動和變化的渴望感到受限。風的疏離可能讓土對有形承諾的需求感到被輕視。平衡在於風學習扎根，土學習彎曲。" : artist1?.element === artist2?.element ? "最大的風險不是衝突，而是安逸——兩個如此相似的人忘記挑戰彼此。成長來自差異，沒有差異，即使是最和諧的連結也會變得停滯。他們必須積極尋找與他們共享預設不同的視角。" : "他們的元素差異雖然是磁性吸引的來源，但也需要最有意識的導航。對一方來說完全自然的東西，可能讓另一方深感困惑——不是因為任何一方有錯，而是因為他們的能量母語是不同的語言。"}`
                  )}
                </Section>

                {/* 7. Long-term Fate Trajectory */}
                <Section title={t("Future Fate Trajectory", "未来整体缘分走势", "未來整體緣分走勢")} icon="🔮">
                  {t(
                    `The combined astrological arc between ${artist1Name} and ${artist2Name} points toward ${result.calc.overallScore >= 70 ? "a long, evolving journey — the kind of connection that deepens rather than fades with time. Saturn's steady hand suggests commitment potential that transcends the initial spark; Jupiter's expansive energy hints at shared adventures yet to unfold. The North Node alignment is particularly significant here — it suggests that this relationship serves a higher evolutionary purpose for both individuals. They are not just lovers or companions; they are teachers to each other, mirrors reflecting back the parts of themselves that most need to grow." : result.calc.overallScore >= 40 ? "a meaningful chapter regardless of its duration — some connections are meant to be seasons, not lifetimes, and every season has its own beauty. The North Node alignment points to mutual growth as the core purpose. In the composite chart, the Sun-Moon midpoint suggests that even if paths eventually diverge, the imprint left on each soul is permanent. Not all important relationships last forever — but all of them leave us different than they found us." : "a catalyst of transformation — sometimes the most important people are those who come to shake us awake, not to stay. Their intersection carries karmic lessons that will echo long after paths diverge. The Uranus contact in their synastry suggests that this connection sparks awakening — it may be sudden, it may be disruptive, but it is never meaningless. The most profound growth often comes through the people who don't stay, but who change everything while they're here."}\n\nThe ${result.calc.starMansionRelation} star mansion pattern specifically indicates ${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "longevity with intentional nurturing — this bond has roots deep enough to weather cosmic storms, but it requires conscious tending. Like any profound connection, it cannot survive on autopilot. The potential is there; the actualization depends on both parties choosing each other, again and again." : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "intensity that may fluctuate — the highs are euphoric, the challenges demand maturity. This is not a smooth trajectory but a dynamic one, with peaks and valleys that ultimately create a richer shared landscape than any flat, uneventful path ever could." : "a steady, quiet unfolding — not a fireworks display, but a constellation that slowly reveals its full shape over time. This is the kind of bond that may not make headlines, but it makes a life."}\n\nTrust the timing. The universe doesn't rush, and it doesn't make mistakes.`,
                    `${artist1Name}與${artist2Name}的合盤走勢指向${result.calc.overallScore >= 70 ? "一段漫長而不斷演化的旅程——那種隨時間流逝反而愈加深邃的連接。土星穩定的手掌暗示著超越最初火花的承諾可能；木星擴展的能量預示著尚未展開的共同冒險。北交點的對齊在此尤為重要——它暗示著這段關係對雙方都具有更高的進化目的。他們不僅是戀人或伴侶；他們是彼此的老師，是映照出對方最需要成長之处的鏡子。" : result.calc.overallScore >= 40 ? "一段不論長短都意義深遠的篇章——有些連接是季節而非一生，而每個季節都有其獨特的美。北交點的對齊指向以互相成長為核心意義。在組合盤中，日月的中點暗示著，即使路徑最終分岔，在每個靈魂上留下的印記都是永久的。並非所有重要的關係都能持續到永遠——但它們全都讓我們與被找到時不同。" : "一場蛻變的催化——有時候最重要的人，是來喚醒我們的，而不是來停留的。他們的交集攜帶著業力課程，即使在軌跡分岔之後仍會久久迴響。他們合盤中的天王星接觸暗示著這段連結會引發覺醒——可能是突然的、可能是顛覆性的，但絕非毫無意義。最深刻的成長往往來自那些不會留下、但在存在於此期間改變了一切的人。"}\n\n${result.calc.starMansionRelation}星宿格局具體顯示${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "用心經營即可長久——這份連結的根系深到足以抵禦宇宙風暴，但需要有意識的呵護。如同任何深刻的連結，它無法在自動駕駛模式下生存。潛力存在；實現則取決於雙方一次又一次地選擇彼此。" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "強度可能起伏不定——巔峰是欣喜若狂的，挑戰則需要成熟來應對。這不是一條平滑的軌跡，而是一條動態的軌跡，充滿了高峰與低谷，最終創造出一幅比任何平穩無波的路徑更豐富的共享風景。" : "一種沉穩安靜的生長——不是煙花表演，而是一座星座，隨時間慢慢顯露全貌。這種連結可能不會登上頭條，但它造就了一種人生。"}\n\n相信宇宙的時機。宇宙不急不徐，也從不出錯。`,
                    `${artist1Name}與${artist2Name}的合盤走勢指向${result.calc.overallScore >= 70 ? "一段漫長而不斷演化的旅程——那種隨時間流逝反而愈加深邃的連接。土星穩定的手掌暗示著超越最初火花的承諾可能；木星擴展的能量預示著尚未展開的共同冒險。北交點的對齊在此尤為重要——它暗示著這段關係對雙方都具有更高的進化目的。他們不僅是戀人或伴侶；他們是彼此的老師，是映照出對方最需要成長之处的鏡子。" : result.calc.overallScore >= 40 ? "一段不論長短都意義深遠的篇章——有些連接是季節而非一生，而每個季節都有其獨特的美。北交點的對齊指向以互相成長為核心意義。在組合盤中，日月的中點暗示著，即使路徑最終分岔，在每個靈魂上留下的印記都是永久的。並非所有重要的關係都能持續到永遠——但它們全都讓我們與被找到時不同。" : "一場蛻變的催化——有時候最重要的人，是來喚醒我們的，而不是來停留的。他們的交集攜帶著業力課程，即使在軌跡分岔之後仍會久久迴響。他們合盤中的天王星接觸暗示著這段連結會引發覺醒——可能是突然的、可能是顛覆性的，但絕非毫無意義。最深刻的成長往往來自那些不會留下、但在存在於此期間改變了一切的人。"}\n\n${result.calc.starMansionRelation}星宿格局具體顯示${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "用心經營即可長久——這份連結的根系深到足以抵禦宇宙風暴，但需要有意識的呵護。如同任何深刻的連結，它無法在自動駕駛模式下生存。潛力存在；實現則取決於雙方一次又一次地選擇彼此。" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "強度可能起伏不定——巔峰是欣喜若狂的，挑戰則需要成熟來應對。這不是一條平滑的軌跡，而是一條動態的軌跡，充滿了高峰與低谷，最終創造出一幅比任何平穩無波的路徑更豐富的共享風景。" : "一種沉穩安靜的生長——不是煙花表演，而是一座星座，隨時間慢慢顯露全貌。這種連結可能不會登上頭條，但它造就了一種人生。"}\n\n相信宇宙的時機。宇宙不急不徐，也從不出錯。`
                  )}
                </Section>

                {/* 8. Fate Encounter Probability + Destiny tag */}
                <Section title={t("Fate Encounter & Destiny Tag", "相遇概率与专属宿命标签", "相遇概率與專屬宿命標籤")} icon="🏷️">
                  {t(
                    `In the vast sea of humanity — 8 billion souls spread across 196 countries — the statistical probability of two individuals with ${artist1Name}'s exact ${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion} configuration encountering someone with ${artist2Name}'s ${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion} signature is astronomically rare. When we factor in the specific ${result.calc.starMansionRelation} mansion relationship — one of only six karmic archetypes in a 28-mansion system that dates back to the Tang Dynasty — we are looking at a convergence of patterns so statistically improbable that the rational mind struggles to categorize it as mere coincidence.\n\nThis is why the ancient astrologers didn't call it chance. They called it fate.`,
                    `在人海茫茫之中——80億靈魂分佈在196個國家——擁有${artist1Name}的${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion}配置的個體，與擁有${artist2Name}的${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion}特徵的靈魂相遇的概率，在天文學尺度上都是極其罕見的。當我們再納入特定的${result.calc.starMansionRelation}星宿關係——一個可追溯至唐代的二十八星宿體系中僅有的六種業力原型之一——我們所看到的，是一種在統計學上極不可能的模式交匯，以至於理性思維難以將其歸類為單純的巧合。\n\n這就是為什麼古代占星師不稱之為偶然。他們稱之為命運。`,
                    `在人海茫茫之中——80億靈魂分佈在196個國家——擁有${artist1Name}的${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion}配置的個體，與擁有${artist2Name}的${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion}特徵的靈魂相遇的概率，在天文學尺度上都是極其罕見的。當我們再納入特定的${result.calc.starMansionRelation}星宿關係——一個可追溯至唐代的二十八星宿體系中僅有的六種業力原型之一——我們所看到的，是一種在統計學上極不可能的模式交匯，以至於理性思維難以將其歸類為單純的巧合。\n\n這就是為什麼古代占星師不稱之為偶然。他們稱之為命運。`
                  )}
                  <div className="mt-3 p-3 bg-[#d4a85308] rounded-lg border border-[#d4a85315] text-center">
                    {(() => {
                      const tag = result?.calc?.overallTag?.tag;
                      const cfg = tag ? RELATION_CONFIG[tag] : null;
                      if (!cfg) return <p className="text-xs text-[#8a8aad]">—</p>;
                      return (
                        <p className="text-sm font-bold" style={{ color: cfg.color }}>
                          {cfg.emoji} {t("Destiny Tag: ", "专属宿命标签：", "專屬宿命標籤：")}{cfg.label}
                        </p>
                      );
                    })()}
                    <p className="text-[10px] text-[#8a8aad55] mt-1">
                      {t("This tag is uniquely generated from your combined astrological data", "此标签由你与他人的合盘星象数据专属生成", "此標籤由你與他人的合盤星象數據專屬生成")}
                    </p>
                  </div>
                </Section>
              </div>

              {/* ===== SOCIAL SHARE ROW v2 — instant poster + copy text ===== */}
              <div className="glass rounded-xl p-4 border border-[#d4a85310]">
                <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">
                  {t("Share This CP Report", "分享这份 CP 缘分报告", "分享這份 CP 緣分報告")}
                </p>

                {/* Success feedback */}
                {shareMsg && (
                  <p className="text-[10px] text-green-400/70 text-center mb-2 animate-fade-in">{shareMsg}</p>
                )}

                <div className="flex justify-center gap-3 flex-wrap">
                  {[
                    { name: "Xiaohongshu", icon: "📕", color: "hover:bg-red-400/20 hover:text-red-400" },
                    { name: "TikTok", icon: "🎵", color: "hover:bg-gray-300/20 hover:text-gray-300" },
                    { name: "Instagram", icon: "📷", color: "hover:bg-pink-500/20 hover:text-pink-400" },
                    { name: "Facebook", icon: "📘", color: "hover:bg-blue-500/20 hover:text-blue-400" },
                    { name: "Twitter / X", icon: "🐦", color: "hover:bg-sky-400/20 hover:text-sky-400" },
                  ].map(p => {
                    const cpData = generateCpData({
                      name1: artist1Name || "",
                      name2: artist2Name || "",
                      score: result.calc.overallScore,
                    });
                    const isZh = locale === "zh-TW";
                    const label = isZh ? cpData.labelZh : cpData.labelEn;
                    const phrase = isZh ? cpData.phraseZh : cpData.phraseEn;
                    const essays = [isZh ? cpData.essay1Zh : cpData.essay1En, isZh ? cpData.essay2Zh : cpData.essay2En];

                    const shareText = getShareText(p.name,
                      artist1Name || "", artist2Name || "",
                      result.calc.overallScore, label, phrase
                    );

                    const kw = isZh
                      ? ["靈魂共振", "雙向奔赴", "宇宙級羈絆"]
                      : ["Soul Resonance", "Mutual Pull", "Cosmic Bond"];
                    const posterData: PosterData = {
                      title: `${artist1Name} × ${artist2Name}`,
                      subtitle: t("CP Fate Report", "CP 缘分合盘报告", "CP 緣分合盤報告"),
                      tier: cpData.tier,
                      tierColor: cpData.colors.color,
                      tierGlow: cpData.colors.glow,
                      tierGrad: cpData.colors.bgGrad,
                      label,
                      phrase,
                      essays,
                      keywords: kw,
                      leftName: artist1Name || "",
                      rightName: artist2Name || "",
                    };

                    const handleShare = () => {
                      setSharePosterData(posterData);
                      setShowPoster(true);
                      navigator.clipboard.writeText(shareText).catch(() => {});
                      setShareMsg(isZh ? "✨ 平台文案已複製，可直接貼上發布" : "✨ Text copied — paste to share");
                      setTimeout(() => setShareMsg(""), 3000);
                    };

                    return (
                      <button key={p.name} onClick={handleShare}
                        className={`flex flex-col items-center gap-1 px-3 py-2 glass rounded-xl border border-[#d4a85310] ${p.color} transition-all text-[#8a8aad] hover:scale-105`}>
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[8px]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[8px] text-[#8a8aad33] text-center mt-2">
                  {t("Click to save poster + copy text", "点击保存壁纸 + 复制分享文案", "點擊儲存壁紙 + 複製分享文案")}
                </p>
              </div>


              {/* Floating share button */}
              <button onClick={() => {
                const cpData = generateCpData({
                  name1: artist1Name || "",
                  name2: artist2Name || "",
                  score: result.calc.overallScore,
                });
                const isZh = locale === "zh-TW";
                setSharePosterData({
                  title: `${artist1Name} × ${artist2Name}`,
                  subtitle: t("CP Fate Report", "CP 缘分合盘报告", "CP 緣分合盤報告"),
                  tier: cpData.tier,
                  tierColor: cpData.colors.color,
                  tierGlow: cpData.colors.glow,
                  tierGrad: cpData.colors.bgGrad,
                  label: isZh ? cpData.labelZh : cpData.labelEn,
                  phrase: isZh ? cpData.phraseZh : cpData.phraseEn,
                  essays: [isZh ? cpData.essay1Zh : cpData.essay1En, isZh ? cpData.essay2Zh : cpData.essay2En],
                  keywords: isZh ? ["靈魂共振", "雙向奔赴", "宇宙級羈絆"] : ["Soul Resonance", "Mutual Pull", "Cosmic Bond"],
                  leftName: artist1Name || "",
                  rightName: artist2Name || "",
                });
                setShowPoster(true);
              }}
                className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-[#FFB6C1] text-[#0a0a0f] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform shadow-[#FFB6C130]">
                <Share2 className="w-5 h-5" />
              </button>

              {/* Unified Share Poster — renders with ALL text on canvas */}
              {sharePosterData && (
                <SharePoster
                  data={sharePosterData}
                  visible={showPoster}
                  onClose={() => setShowPoster(false)}
                />
              )}

              {/* Disclaimer */}
              <p className="text-[9px] text-[#8a8aad33] text-center leading-relaxed">
                {t(
                  "* This CP Fate Report is for entertainment and fan community recreational purposes only. All content is algorithmically generated based on astrological compatibility calculations and should not be interpreted as factual relationship analysis. Enjoy responsibly.",
                  "* 本 CP 缘分报告仅供娱乐趣味参考，全部内容基于星盘算法自动生成，不构成任何现实关系分析。请理性娱乐，享受饭圈文化。",
                  "* 本 CP 緣分報告僅供娛樂趣味參考，全部內容基於星盤演算法自動生成，不構成任何現實關係分析。請理性娛樂，享受飯圈文化。"
                )}
              </p>
            </div>
          )}
        </div>
        </ErrorBoundary>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const content = typeof children === "string" ? children : String(children);
  const paragraphs = content.split("\n\n").filter(Boolean);
  return (
    <div className="bg-[#1e1e2a]/85 rounded-xl p-4 border border-[#d4a85312]">
      <h4 className="text-sm font-bold text-[#FFB6C1] mb-3 flex items-center gap-2">
        <span className="text-base">{icon}</span> {title}
      </h4>
      <div className="space-y-3">
        {paragraphs.map((p, i) => {
          // Check if paragraph starts with a 【】marker for sub-heading
          const subMatch = p.match(/^【([^】]+)】([\s\S]*)$/);
          if (subMatch) {
            return (
              <div key={i}>
                <p className="text-[11px] font-bold text-[#d4a853] mb-1">【{subMatch[1]}】</p>
                <p className="text-xs text-[#f0e6d3]/80 leading-relaxed">{subMatch[2]}</p>
              </div>
            );
          }
          // Check for STRENGTHS/WEAKNESSES markers
          if (/^(STRENGTHS|WEAKNESSES|優點|隱患|优点|隐患)/.test(p)) {
            return (
              <div key={i} className="rounded-lg bg-[#d4a85308] px-3 py-2 border border-[#d4a85310]">
                <p className="text-xs text-[#f0e6d3]/85 leading-relaxed font-medium">{p}</p>
              </div>
            );
          }
          return (
            <p key={i} className="text-xs text-[#f0e6d3]/80 leading-relaxed">{p}</p>
          );
        })}
      </div>
    </div>
  );
}
