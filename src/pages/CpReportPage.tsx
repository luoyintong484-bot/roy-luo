import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility, generateCosmicAnswer, RELATION_CONFIG } from "@/lib/compatibility-algo";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { Sparkles, Heart, Star, Lock, Share2, Download, Crown, ChevronDown, Loader2, ArrowLeft } from "lucide-react";

type Step = "input" | "loading" | "report";

export default function CpReportPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("input");

  // User form
  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("UTC+8");

  // Artist selection
  const [artist1Id, setArtist1Id] = useState<number | null>(null);
  const [artist2Id, setArtist2Id] = useState<number | null>(null);
  const [showPaid, setShowPaid] = useState(false);

  // Results
  const [result, setResult] = useState<any>(null);

  const artist1 = artist1Id ? getArtistById(artist1Id) : null;
  const artist2 = artist2Id ? getArtistById(artist2Id) : null;

  const t = (en: string, zh: string, tw: string) =>
    locale === "zh" ? zh : locale === "zh-TW" ? tw : en;

  const handleGenerate = () => {
    if (!userName || !birthYear || !birthMonth || !birthDay || !artist1Id || !artist2Id) return;
    setStep("loading");
    setTimeout(() => {
      const a1 = getArtistById(artist1Id);
      const a2 = getArtistById(artist2Id);
      if (!a1 || !a2) return;
      const calc = calculateCompatibility(
        `${birthYear}-${birthMonth.padStart(2,"0")}-${birthDay.padStart(2,"0")}`,
        a2.birthDate, undefined,
        a1.baziDayPillar, a2.baziDayPillar,
        a1.starMansion, a2.starMansion,
      );
      setResult({ artist1: a1, artist2: a2, calc });
      setStep("report");
    }, 2000);
  };

  const handleShare = async () => {
    const cfg = RELATION_CONFIG[result?.calc?.overallTag?.tag] || RELATION_CONFIG.good_vibes;
    const text = `${cfg.emoji} CP Fate Report: ${artist1?.stageName} × ${artist2?.stageName}\n` +
      `${t("缘分评分","缘分評分","Fate Score")}: ${result?.calc?.overallScore} · ${cfg.label}\n` +
      `#R7Fortune #CPReport #IdolMatch`;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const YEARS = Array.from({ length: 30 }, (_, i) => 2000 + i);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
  const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFB6C110] border border-[#FFB6C120] rounded-full mb-4 relative">
              <Heart className="w-3 h-3 text-[#FFB6C1]" />
              <span className="text-[10px] text-[#FFB6C1] uppercase tracking-wider">
                {t("CP Fate Report","CP 缘分合盘报告","CP 緣分合盤報告")}
              </span>
              <span className="absolute -top-2 -right-3 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[8px] font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">HOT</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">
              {t("Cosmic Pair Reading","宇宙双人星盘解读","宇宙雙人星盤解讀")}
            </h1>
          </div>

          {/* Step: Input */}
          {step === "input" && (
            <div className="glass rounded-2xl p-6 border border-[#d4a85315] space-y-5">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{t("Your Info","你的信息","你的資訊")}</h3>
                <div className="space-y-3">
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                    placeholder={t("Your name","你的名字","你的名字")}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                  <div className="grid grid-cols-3 gap-2">
                    <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Year","年","年")}</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Month","月","月")}</option>
                      {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                    </select>
                    <select value={birthDay} onChange={e => setBirthDay(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Day","日","日")}</option>
                      {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={birthHour} onChange={e => setBirthHour(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Hour","时","時")}</option>
                      {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                    </select>
                    <select value={birthMinute} onChange={e => setBirthMinute(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Minute","分","分")}</option>
                      {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Artist Selection */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{t("Select Two Idols","选择两位爱豆","選擇兩位愛豆")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[artist1Id, artist2Id].map((selId, idx) => (
                    <select key={idx} value={selId || ""} onChange={e => { const v = parseInt(e.target.value); idx === 0 ? setArtist1Id(v || null) : setArtist2Id(v || null) }}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t(`Idol ${idx+1}`,`爱豆 ${idx+1}`,`愛豆 ${idx+1}`)}</option>
                      {ALL_ARTISTS.slice(0, 100).map(a => (
                        <option key={a.id} value={a.id}>{a.stageName} ({a.groupName})</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate}
                disabled={!userName || !birthYear || !artist1Id || !artist2Id}
                className="w-full py-3.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                {t("Generate CP Report","生成 CP 缘分报告","生成 CP 緣分報告")}
              </button>
            </div>
          )}

          {/* Step: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-20">
              <Heart className="w-12 h-12 text-[#FFB6C1] animate-pulse" />
              <p className="mt-4 text-sm text-[#f0e6d3]">{t("Weaving your cosmic story...","正在编织你们的宇宙故事...","正在編織你們的宇宙故事...")}</p>
            </div>
          )}

          {/* Step: Report */}
          {step === "report" && result && (
            <div className="space-y-5 animate-fade-in">
              <button onClick={() => { setStep("input"); setResult(null); setShowPaid(false); }}
                className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853]">
                <ArrowLeft className="w-3.5 h-3.5" /> {t("Back","返回重选","返回重選")}
              </button>

              {/* Hero */}
              <div className="glass rounded-2xl p-6 border border-[#FFB6C120] text-center">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div>
                    <span className="text-4xl">{ZODIAC_EMOJIS[artist1?.zodiacSign || ""] || "✨"}</span>
                    <p className="text-sm font-semibold text-[#f0e6d3] mt-1">{artist1?.stageName}</p>
                  </div>
                  <Heart className="w-8 h-8 text-[#FFB6C1]" />
                  <div>
                    <span className="text-4xl">{ZODIAC_EMOJIS[artist2?.zodiacSign || ""] || "✨"}</span>
                    <p className="text-sm font-semibold text-[#f0e6d3] mt-1">{artist2?.stageName}</p>
                  </div>
                </div>
                {(() => { const cfg = RELATION_CONFIG[result.calc.overallTag.tag]; return (
                  <>
                    <span className="text-4xl">{cfg?.emoji}</span>
                    <p className="text-3xl font-bold mt-2" style={{ color: cfg?.color }}>{result.calc.overallScore}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: cfg?.color }}>{cfg?.label}</p>
                  </>
                );})()}
              </div>

              {/* Free Preview */}
              <div className="glass rounded-2xl p-5 border border-[#d4a85310] space-y-4">
                <Section title={t("Magnetic Attraction","先天磁场契合","先天磁場契合")} icon="🫧">
                  {t(
                    `Like two stars caught in the same orbit, ${artist1?.stageName} and ${artist2?.stageName} share an undeniable cosmic pull. Their elemental energies create a field where silence speaks louder than words.`,
                    `${artist1?.stageName}和${artist2?.stageName}就像两颗被同一轨道捕获的星辰，彼此之间存在不可否认的宇宙引力。他们的元素能量创造了一种无声胜有声的磁场。`,
                    `${artist1?.stageName}和${artist2?.stageName}就像兩顆被同一軌道捕獲的星辰，彼此之間存在不可否認的宇宙引力。他們的元素能量創造了一種無聲勝有聲的磁場。`
                  )}
                </Section>
                <Section title={t("First Impression","初见潜意识印象","初見潛意識印象")} icon="👁️">
                  {t(
                    `Before words were exchanged, their souls had already recognized each other. ${artist1?.stageName}'s ${artist1?.element} nature instinctively responds to ${artist2?.stageName}'s ${artist2?.element} essence — a quiet knowing that transcends conscious thought.`,
                    `在言语交换之前，他们的灵魂已经认出了彼此。${artist1?.stageName}的${artist1?.element}之性本能地回应着${artist2?.stageName}的${artist2?.element}之质——一种超越意识思维的安静感知。`,
                    `在言語交換之前，他們的靈魂已經認出了彼此。${artist1?.stageName}的${artist1?.element}之性本能地回應著${artist2?.stageName}的${artist2?.element}之質——一種超越意識思維的安靜感知。`
                  )}
                </Section>

                {/* Paid Content */}
                {!showPaid ? (
                  <div className="relative">
                    <div className="space-y-4 blur-sm select-none opacity-20 pointer-events-none">
                      <Section title={t("Deep Bond","深层宿命羁绊","深層宿命羈絆")} icon="💫">
                        {t("Premium content — unlock to reveal the full cosmic story between these two souls.","付费内容 — 解锁查看完整宇宙缘分故事。","付費內容 — 解鎖查看完整宇宙緣分故事。")}
                      </Section>
                      <Section title={t("Hidden Feelings","彼此内心真实看法","彼此內心真實看法")} icon="💭">{t("Premium content","付费内容","付費內容")}</Section>
                      <Section title={t("Future Path","未来缘分走势","未來緣分走勢")} icon="🔮">{t("Premium content","付费内容","付費內容")}</Section>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => setShowPaid(true)}
                        className="px-8 py-4 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center gap-2 shadow-xl">
                        <Crown className="w-5 h-5" />
                        {t("Unlock Full Report · $6.99","解锁完整报告 · $6.99","解鎖完整報告 · $6.99")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Section title={t("Deep Bond","深层宿命羁绊","深層宿命羈絆")} icon="💫">
                      {generateCosmicAnswer(userName, `${artist1?.stageName} & ${artist2?.stageName}`,
                        artist1?.element || "?", artist2?.element || "?",
                        artist1?.starMansion || "", artist2?.starMansion || "",
                        result.calc.overallTag.tag, result.calc.starMansionRelation, locale as "zh" | "en")}
                    </Section>
                    <Section title={t("Hidden Feelings","彼此内心真实看法","彼此內心真實看法")} icon="💭">
                      {t(
                        `${artist1?.stageName} sees in ${artist2?.stageName} a mirror reflecting their own unspoken dreams. There's a tenderness beneath the surface — an admiration that doesn't need to be voiced. ${artist2?.stageName}, in turn, finds in ${artist1?.stageName} a gravity that feels inexplicably like home.`,
                        `${artist1?.stageName}在${artist2?.stageName}身上看到了一面镜子，映照出自己尚未言说的梦想。表面之下藏着一种温柔——一种无需言说的欣赏。而${artist2?.stageName}则在${artist1?.stageName}身上找到了一种不可思议的归属引力。`,
                        `${artist1?.stageName}在${artist2?.stageName}身上看到了一面鏡子，映照出自己尚未言說的夢想。表面之下藏著一種溫柔——一種無需言說的欣賞。而${artist2?.stageName}則在${artist1?.stageName}身上找到了一種不可思議的歸屬引力。`
                      )}
                    </Section>
                    <Section title={t("Future Path","未来缘分走势","未來緣分走勢")} icon="🔮">
                      {t(
                        `The stars don't promise forever — they promise alignment. The path ahead for ${artist1?.stageName} and ${artist2?.stageName} is one of deepening resonance. Every shared moment adds another thread to the cosmic tapestry being woven between them. Trust the timing of the universe.`,
                        `星辰不承诺永远——它们承诺的是对齐。${artist1?.stageName}和${artist2?.stageName}前方的道路将越来越深度共振。每一个共享时刻都在为宇宙织锦添上一根新线。相信宇宙的时机。`,
                        `星辰不承諾永遠——它們承諾的是對齊。${artist1?.stageName}和${artist2?.stageName}前方的道路將越來越深度共振。每一個共享時刻都在為宇宙織錦添上一根新線。相信宇宙的時機。`
                      )}
                    </Section>
                  </>
                )}
              </div>

              {/* Share */}
              <div className="flex gap-2">
                <button onClick={handleShare}
                  className="flex-1 py-3 glass rounded-xl text-xs text-[#d4a853] border border-[#d4a85315] hover:border-[#d4a85340] transition-colors flex items-center justify-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> {t("Copy & Share","复制文案分享","複製文案分享")}
                </button>
                <button onClick={() => window.print()}
                  className="flex-1 py-3 glass rounded-xl text-xs text-[#d4a853] border border-[#d4a85315] hover:border-[#d4a85340] transition-colors flex items-center justify-center gap-1">
                  <Download className="w-3.5 h-3.5" /> {t("Save Report","保存报告","保存報告")}
                </button>
              </div>

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
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0f] rounded-xl p-4 border border-[#d4a85306]">
      <h4 className="text-xs font-semibold text-[#f0e6d3] mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h4>
      <p className="text-xs text-[#8a8aad] leading-relaxed">{children}</p>
    </div>
  );
}
