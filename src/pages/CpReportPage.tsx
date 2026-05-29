import { useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility, generateCosmicAnswer, RELATION_CONFIG } from "@/lib/compatibility-algo";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { Sparkles, Heart, Share2, Download, Crown, Loader2, ArrowLeft } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

type Step = "input" | "loading" | "report";

export default function CpReportPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("input");

  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");

  const [artist1Id, setArtist1Id] = useState<number | null>(null);
  const [artist2Id, setArtist2Id] = useState<number | null>(null);
  const [showPaid] = useState(true); // Paywall temporarily disabled — full content visible

  const [result, setResult] = useState<any>(null);
  const artist1 = artist1Id ? getArtistById(artist1Id) : null;
  const artist2 = artist2Id ? getArtistById(artist2Id) : null;

  const t = (en: string, zh: string, tw: string) => locale === "zh" ? zh : locale === "zh-TW" ? tw : en;

  const handleGenerate = () => {
    if (!userName || !birthYear || !birthMonth || !birthDay || !artist1Id || !artist2Id) return;
    setStep("loading");
    setTimeout(() => {
      const a1 = getArtistById(artist1Id); const a2 = getArtistById(artist2Id);
      if (!a1 || !a2) return;
      const calc = calculateCompatibility(
        `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`,
        a2.birthDate, undefined, a1.baziDayPillar, a2.baziDayPillar, a1.starMansion, a2.starMansion,
      );
      setResult({ artist1: a1, artist2: a2, calc });
      setStep("report");
    }, 2000);
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
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{t("Your Info", "你的信息", "你的資訊")}</h3>
                <div className="space-y-3">
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                    placeholder={t("Your name", "你的名字", "你的名字")}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                  <div className="grid grid-cols-3 gap-2">
                    <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Year", "年", "年")}</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Month", "月", "月")}</option>
                      {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                    <select value={birthDay} onChange={e => setBirthDay(e.target.value)} className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] appearance-none cursor-pointer">
                      <option value="">{t("Day", "日", "日")}</option>
                      {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{t("Select Two Idols", "选择两位爱豆", "選擇兩位愛豆")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[artist1Id, artist2Id].map((selId, idx) => (
                    <SearchableSelect key={idx}
                      options={ALL_ARTISTS.map(a => ({ id: a.id, label: a.stageName, sub: a.groupName, heat: a.cpHeat || 0 }))}
                      value={selId}
                      onChange={(id) => { const v = parseInt(id); idx === 0 ? setArtist1Id(v || null) : setArtist2Id(v || null) }}
                      placeholder={t(`Idol ${idx + 1}`, `爱豆 ${idx + 1}`, `愛豆 ${idx + 1}`)}
                    />
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!userName || !birthYear || !artist1Id || !artist2Id}
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

          {step === "report" && result && (
            <div className="space-y-5 animate-fade-in">
              <button onClick={() => { setStep("input"); setResult(null); }}
                className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853]">
                <ArrowLeft className="w-3.5 h-3.5" /> {t("Back", "返回重选", "返回重選")}
              </button>

              {/* Hero Score */}
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
                <p className="text-[10px] text-[#8a8aad44] mt-2">
                  {t("Comprehensive Fate Score · Higher scores indicate stronger cosmic resonance", "综合缘分评分 · 分数越高代表宇宙共振越强", "綜合緣分評分 · 分數越高代表宇宙共振越強")}
                </p>
              </div>

              {/* ===== FULL REPORT SECTIONS (paywall disabled — all visible) ===== */}
              <div className="glass rounded-2xl p-5 border border-[#d4a85310] space-y-4">
                {/* 1. Magnetic Attraction */}
                <Section title={t("Innate Magnetic Attraction", "先天磁场契合度", "先天磁場契合度")} icon="🫧">
                  {t(
                    `${artist1?.stageName} and ${artist2?.stageName} exist on the same cosmic frequency — an invisible thread woven through their birth charts pulls them into each other's orbit. Their elemental signatures (${artist1?.element} and ${artist2?.element}) create a unique vibrational field where even silence feels charged with meaning.`,
                    `${artist1?.stageName}与${artist2?.stageName}存在于同一宇宙频率之上——一条贯穿他们出生星盘的隐形丝线，将两人拉入彼此的轨道。他们的元素印记（${artist1?.element}与${artist2?.element}）创造出一种独特的振动场域，连沉默都充满了意义的电荷。这种磁场并非肉眼可见，却真实地环绕着他们——如同两颗恒星共享同一引力中心，各自旋转却又永不分离。`,
                    `${artist1?.stageName}與${artist2?.stageName}存在於同一宇宙頻率之上——一條貫穿他們出生星盤的隱形絲線，將兩人拉入彼此的軌道。他們的元素印記（${artist1?.element}與${artist2?.element}）創造出一種獨特的振動場域，連沉默都充滿了意義的電荷。這種磁場並非肉眼可見，卻真實地環繞著他們——如同兩顆恆星共享同一引力中心，各自旋轉卻又永不分離。`
                  )}
                </Section>

                {/* 2. Venus Character Complement */}
                <Section title={t("Venus Character Complement", "金星性格互补", "金星性格互補")} icon="💫">
                  {t(
                    `${artist1?.stageName}'s ${artist1?.zodiacSign} Venus radiates ${artist1?.element === "火" || artist1?.element === "风" ? "warmth and spontaneity" : "depth and sensitivity"}, while ${artist2?.stageName}'s ${artist2?.zodiacSign} energy brings ${artist2?.element === "水" || artist2?.element === "土" ? "grounded stability and quiet strength" : "curiosity and intellectual spark"}. Together, they form a yin-yang dance of complementary temperaments — one fills the spaces the other leaves open, like two puzzle pieces carved from the same nebula.`,
                    `${artist1?.stageName}的${artist1?.zodiacSign}金星散发着${artist1?.element === "火" || artist1?.element === "风" ? "热烈而率真的光芒" : "深邃而敏感的温柔"}，而${artist2?.stageName}的${artist2?.zodiacSign}能量则带来了${artist2?.element === "水" || artist2?.element === "土" ? "沉稳的安定与静默的力量" : "灵动的好奇与智慧的火花"}。两人形成了阴阳交织的互补之舞——一方填补了另一方留下的空白，如同从同一片星云中切割而成的两块拼图，天衣无缝。`,
                    `${artist1?.stageName}的${artist1?.zodiacSign}金星散發著${artist1?.element === "火" || artist1?.element === "风" ? "熱烈而率真的光芒" : "深邃而敏感的溫柔"}，而${artist2?.stageName}的${artist2?.zodiacSign}能量則帶來了${artist2?.element === "水" || artist2?.element === "土" ? "沉穩的安定與靜默的力量" : "靈動的好奇與智慧的火花"}。兩人形成了陰陽交織的互補之舞——一方填補了另一方留下的空白，如同從同一片星雲中切割而成的兩塊拼圖，天衣無縫。`
                  )}
                </Section>

                {/* 3. First Impression */}
                <Section title={t("First Subconscious Impression", "彼此第一眼潜意识印象", "彼此第一眼潛意識印象")} icon="👁️">
                  {t(
                    `Before a single word passed between them, their souls had already completed an entire conversation. ${artist1?.stageName}'s subconscious registered ${artist2?.stageName} as ${artist2?.element === "火" ? "a blazing presence impossible to ignore" : artist2?.element === "水" ? "a deep, still ocean hiding unfathomable worlds" : artist2?.element === "木" ? "a gentle spring breeze carrying the scent of new beginnings" : artist2?.element === "金" ? "a polished gem reflecting light in unexpected directions" : "a mountain — immovable, commanding quiet respect"}. ${artist2?.stageName}, in turn, sensed in ${artist1?.stageName} ${artist1?.element === "火" ? "a warmth that felt inexplicably familiar" : artist1?.element === "水" ? "an emotional depth that whispered of shared past lives" : artist1?.element === "木" ? "a nurturing presence that promised growth and safety" : artist1?.element === "金" ? "an elegance and clarity that cut through the noise" : "a grounding force that made the chaotic world feel manageable"}.`,
                    `在两人交换第一个字之前，他们的灵魂已经完成了一整场对话。${artist1?.stageName}的潜意识中，${artist2?.stageName}是${artist2?.element === "火" ? "一团无法忽视的炽热火焰" : artist2?.element === "水" ? "一片静谧深邃、藏着无尽世界的海洋" : artist2?.element === "木" ? "一缕携带着新生气息的春日微风" : artist2?.element === "金" ? "一颗折射出意外光芒的精致宝石" : "一座沉默伫立、令人肃然起敬的山峰"}。而${artist2?.stageName}则在${artist1?.stageName}身上感知到了${artist1?.element === "火" ? "一种说不清缘由的熟悉温暖" : artist1?.element === "水" ? "一种深沉的情感共鸣，仿佛来自某个共同的过去" : artist1?.element === "木" ? "一种滋养的陪伴感，让人安心成长" : artist1?.element === "金" ? "一份利落优雅的气质，穿透了所有喧嚣" : "一股让人安心的扎根之力，让纷乱的世界变得有序"}`,
                    `在兩人交換第一個字之前，他們的靈魂已經完成了一整場對話。${artist1?.stageName}的潛意識中，${artist2?.stageName}是${artist2?.element === "火" ? "一團無法忽視的熾熱火焰" : artist2?.element === "水" ? "一片靜謐深邃、藏著無盡世界的海洋" : artist2?.element === "木" ? "一縷攜帶著新生氣息的春日微風" : artist2?.element === "金" ? "一顆折射出意外光芒的精緻寶石" : "一座沉默佇立、令人肅然起敬的山峰"}。而${artist2?.stageName}則在${artist1?.stageName}身上感知到了${artist1?.element === "火" ? "一種說不清緣由的熟悉溫暖" : artist1?.element === "水" ? "一種深沉的情感共鳴，仿佛來自某個共同的過去" : artist1?.element === "木" ? "一種滋養的陪伴感，讓人安心成長" : artist1?.element === "金" ? "一份俐落優雅的氣質，穿透了所有喧囂" : "一股讓人安心的扎根之力，讓紛亂的世界變得有序"}`
                  )}
                </Section>

                {/* 4. Mutual True Feelings */}
                <Section title={t("Mutual True Feelings", "双向看待对方的真实本心", "雙向看待對方的真實本心")} icon="💭">
                  {t(
                    `Looking at ${artist2?.stageName}, ${artist1?.stageName} sees a soul that shines at a wavelength only they can fully perceive — a mix of admiration, protectiveness, and an unspoken "I understand you." There's a quiet reverence that doesn't demand reciprocation. In return, when ${artist2?.stageName} gazes at ${artist1?.stageName}, there's a gravitational pull that defies logic — a feeling of "you are the gravity that keeps my orbit stable." Beneath the surface, a mutual recognition hums: we are cut from the same cloth of stardust.`,
                    `${artist1?.stageName}看向${artist2?.stageName}时，看到的是一种只有Ta能完全感知的灵魂波长——掺杂着欣赏、守护欲，以及一句无声的"我懂你"。那份安静的珍视不求任何回应。而${artist2?.stageName}凝望${artist1?.stageName}时，则感到一种超越逻辑的引力——"你是让我轨道稳定的重力。"表象之下，共同的认知在低语：我们是由同一片星尘裁剪而成。`,
                    `${artist1?.stageName}看向${artist2?.stageName}時，看到的是一種只有Ta能完全感知的靈魂波長——摻雜著欣賞、守護慾，以及一句無聲的「我懂你」。那份安靜的珍視不求任何回應。而${artist2?.stageName}凝望${artist1?.stageName}時，則感到一種超越邏輯的引力——「你是讓我軌道穩定的重力。」表象之下，共同的認知在低語：我們是由同一片星塵裁剪而成。`
                  )}
                </Section>

                {/* 5. Ambiguous Destiny Bond */}
                <Section title={t("Ambiguous Destiny Bond", "暧昧宿命羁绊", "曖昧宿命羈絆")} icon="💕">
                  {t(
                    `There exists between them an invisible elastic band — the more the universe tries to separate their paths, the stronger the recoil that brings them back together. Their ${result.calc.starMansionRelation} star mansion connection suggests past-life recognition: a familiar story picked up from where it was left off. This isn't a simple crush; it's a karmic echo. Every glance exchanged adds another knot to the thread tying their fates together. The universe seems to whisper: "You two have unfinished business."`,
                    `他们之间存在一根无形的弹力带——宇宙越是试图将他们的轨迹分开，回弹的力量就越强，将两人再次拉回彼此身边。他们的${result.calc.starMansionRelation}星宿关系暗示着前世的相识：一个未完待续的故事，从当初停笔的地方又被拾起。这不是简单的crush——这是业力的回响。每一次目光交汇，都在命运的绳索上又添了一个结。宇宙仿佛在低语："你们之间，还有未完成的约定。"`,
                    `他們之間存在一根無形的彈力帶——宇宙越是試圖將他們的軌跡分開，回彈的力量就越強，將兩人再次拉回彼此身邊。他們的${result.calc.starMansionRelation}星宿關係暗示著前世的相識：一個未完待續的故事，從當初停筆的地方又被拾起。這不是簡單的crush——這是業力的迴響。每一次目光交匯，都在命運的繩索上又添了一個結。宇宙仿佛在低語：「你們之間，還有未完成的約定。」`
                  )}
                </Section>

                {/* 6. Strengths & Weaknesses */}
                <Section title={t("Dynamic Strengths & Hidden Frictions", "相处优缺点与隐形隔阂", "相處優缺點與隱形隔閡")} icon="⚖️">
                  {t(
                    `STRENGTHS: The ${artist1?.element}-${artist2?.element} dynamic creates a natural ${artist1?.element === artist2?.element ? "resonance chamber where both instinctively understand each other's rhythms" : "contrast that keeps the relationship dynamic and prevents stagnation"}. Their ${result.calc.starMansionRelation} bond fosters ${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "uncommon emotional safety — the kind where masks fall away without effort" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "an exhilarating push-pull tension that keeps both growing" : "a refreshing ease that makes every interaction feel like coming home"}. WEAKNESSES: ${artist1?.element === "火" && artist2?.element === "水" ? "Fire can evaporate Water's subtle signals; Water can dampen Fire's enthusiasm without meaning to" : artist1?.element === "金" && artist2?.element === "木" ? "Metal's sharp clarity can cut Wood's gentle growth; Wood's sprawling nature can feel chaotic to Metal" : artist1?.element === artist2?.element ? "Too much similarity can breed complacency — they may forget to challenge each other" : "Their elemental differences require conscious translation — what feels natural to one may confuse the other"}.`,
                    `优点：${artist1?.element}-${artist2?.element}的五行动态创造了${artist1?.element === artist2?.element ? "天然的共振空间，两人本能地理解彼此的节奏" : "鲜活的对比张力，让关系永不停滞、永远新鲜"}。他们的${result.calc.starMansionRelation}星宿连接带来了${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "难得的情感安全感——面具无需费力就能卸下的那种" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "令人心动的推拉张力，让彼此持续成长" : "清新的轻松感，让每次互动都宛如归家"}。隐患：${artist1?.element === "火" && artist2?.element === "水" ? "火会蒸发水的细微信号；水可能无意间浇灭火的热情" : artist1?.element === "金" && artist2?.element === "木" ? "金的锐利清晰会斩断木的生长；木的蔓延会让金感到混乱" : artist1?.element === artist2?.element ? "过多的相似可能滋生安逸——他们也许会忘记挑战彼此" : "元素差异需要有意识的翻译——对一方自然而然的东西，可能让另一方困惑"}`,
                    `優點：${artist1?.element}-${artist2?.element}的五行動態創造了${artist1?.element === artist2?.element ? "天然的共振空間，兩人本能地理解彼此的節奏" : "鮮活的對比張力，讓關係永不停滯、永遠新鮮"}。他們的${result.calc.starMansionRelation}星宿連接帶來了${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "難得的情感安全感——面具無需費力就能卸下的那種" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "令人心動的推拉張力，讓彼此持續成長" : "清新的輕鬆感，讓每次互動都宛如歸家"}。隱患：${artist1?.element === "火" && artist2?.element === "水" ? "火會蒸發水的細微信號；水可能無意間澆滅火的熱情" : artist1?.element === "金" && artist2?.element === "木" ? "金的銳利清晰會斬斷木的生長；木的蔓延會讓金感到混亂" : artist1?.element === artist2?.element ? "過多的相似可能滋生安逸——他們也許會忘記挑戰彼此" : "元素差異需要有意識的翻譯——對一方自然而然的東西，可能讓另一方困惑"}`
                  )}
                </Section>

                {/* 7. Long-term Fate Trajectory */}
                <Section title={t("Future Fate Trajectory", "未来整体缘分走势", "未來整體緣分走勢")} icon="🔮">
                  {t(
                    `The combined astrological arc between ${artist1?.stageName} and ${artist2?.stageName} points toward ${result.calc.overallScore >= 70 ? "a long, evolving journey — the kind of connection that deepens rather than fades with time. Saturn's steady hand suggests commitment potential; Jupiter's expansive energy hints at shared adventures yet to unfold." : result.calc.overallScore >= 40 ? "a meaningful chapter regardless of its duration — some connections are meant to be seasons, not lifetimes, and every season has its own beauty. The North Node alignment points to mutual growth as the core purpose." : "a catalyst of transformation — sometimes the most important people are those who come to shake us awake, not to stay. Their intersection carries karmic lessons that will echo long after paths diverge."} The ${result.calc.starMansionRelation} star mansion pattern indicates ${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "longevity with intentional nurturing — this bond has roots deep enough to weather cosmic storms" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "intensity that may fluctuate — the highs are euphoric, the challenges demand maturity" : "a steady, quiet unfolding — not a fireworks display, but a constellation that slowly reveals its full shape over time"}. Trust the timing.`,
                    `${artist1?.stageName}与${artist2?.stageName}的合盘走势指向${result.calc.overallScore >= 70 ? "一段漫长而不断演化的旅程——那种随时间流逝反而愈加深邃的连接。土星稳定的手掌暗示着承诺的可能；木星扩展的能量预示着尚未展开的共同冒险。" : result.calc.overallScore >= 40 ? "一段不论长短都意义深远的篇章——有些连接是季节而非一生，而每个季节都有其独特的美。交点轴的对齐指向以互相成长为核心意义。" : "一场蜕变的催化——有时候最重要的人，是来唤醒我们的，而不是来停留的。他们的交集携带着业力课程，即使在轨迹分岔之后仍会久久回响。"}他们的${result.calc.starMansionRelation}星宿格局显示${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "用心经营即可长久——这份连接的根系深到足以抵御宇宙风暴" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "强度可能起伏不定——巅峰是欣喜若狂的，挑战则需要成熟来应对" : "一种沉稳安静的生长——不是烟花表演，而是一座星座，随时间慢慢显露全貌"}。相信宇宙的时机。`,
                    `${artist1?.stageName}與${artist2?.stageName}的合盤走勢指向${result.calc.overallScore >= 70 ? "一段漫長而不斷演化的旅程——那種隨時間流逝反而愈加深邃的連接。土星穩定的手掌暗示著承諾的可能；木星擴展的能量預示著尚未展開的共同冒險。" : result.calc.overallScore >= 40 ? "一段不論長短都意義深遠的篇章——有些連接是季節而非一生，而每個季節都有其獨特的美。交點軸的對齊指向以互相成長為核心意義。" : "一場蛻變的催化——有時候最重要的人，是來喚醒我們的，而不是來停留的。他們的交集攜帶著業力課程，即使在軌跡分岔之後仍會久久迴響。"}他們的${result.calc.starMansionRelation}星宿格局顯示${["命之星", "荣亲"].includes(result.calc.starMansionRelation) ? "用心經營即可長久——這份連接的根系深到足以抵禦宇宙風暴" : ["安坏", "危成"].includes(result.calc.starMansionRelation) ? "強度可能起伏不定——巔峰是欣喜若狂的，挑戰則需要成熟來應對" : "一種沉穩安靜的生長——不是煙花表演，而是一座星座，隨時間慢慢顯露全貌"}。相信宇宙的時機。`
                  )}
                </Section>

                {/* 8. Fate Encounter Probability + Destiny tag */}
                <Section title={t("Fate Encounter & Destiny Tag", "相遇概率与专属宿命标签", "相遇概率與專屬宿命標籤")} icon="🏷️">
                  {t(
                    `In the vast sea of humanity — 8 billion souls spread across 196 countries — the statistical probability of two individuals with ${artist1?.stageName}'s exact ${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion} configuration encountering someone with ${artist2?.stageName}'s ${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion} signature is astronomically rare.`,
                    `在人海茫茫之中——80亿灵魂分布在196个国家——拥有${artist1?.stageName}的${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion}配置的个体，与拥有${artist2?.stageName}的${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion}特征的灵魂相遇的概率，在天文学尺度上都是极为罕见的。`,
                    `在人海茫茫之中——80億靈魂分佈在196個國家——擁有${artist1?.stageName}的${artist1?.zodiacSign}-${artist1?.baziDayPillar}-${artist1?.starMansion}配置的個體，與擁有${artist2?.stageName}的${artist2?.zodiacSign}-${artist2?.baziDayPillar}-${artist2?.starMansion}特徵的靈魂相遇的概率，在天文學尺度上都是極為罕見的。`
                  )}
                  <div className="mt-3 p-3 bg-[#d4a85308] rounded-lg border border-[#d4a85315] text-center">
                    {(() => { const cfg = RELATION_CONFIG[result.calc.overallTag.tag]; return (
                      <p className="text-sm font-bold" style={{ color: cfg?.color }}>
                        {cfg?.emoji} {t("Destiny Tag: ", "专属宿命标签：", "專屬宿命標籤：")}{cfg?.label}
                      </p>
                    );})()}
                    <p className="text-[10px] text-[#8a8aad55] mt-1">
                      {t("This tag is uniquely generated from your combined astrological data", "此标签由你与他人的合盘星象数据专属生成", "此標籤由你與他人的合盤星象數據專屬生成")}
                    </p>
                  </div>
                </Section>
              </div>

              {/* ===== SOCIAL SHARE ROW ===== */}
              <div className="glass rounded-xl p-4 border border-[#d4a85310]">
                <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">
                  {t("Share This CP Report", "分享这份 CP 缘分报告", "分享這份 CP 緣分報告")}
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {[
                    { name: "Xiaohongshu", icon: "📕", color: "hover:bg-red-400/20 hover:text-red-400" },
                    { name: "TikTok", icon: "🎵", color: "hover:bg-gray-300/20 hover:text-gray-300" },
                    { name: "Instagram", icon: "📷", color: "hover:bg-pink-500/20 hover:text-pink-400" },
                    { name: "Facebook", icon: "📘", color: "hover:bg-blue-500/20 hover:text-blue-400" },
                    { name: "Twitter / X", icon: "🐦", color: "hover:bg-sky-400/20 hover:text-sky-400" },
                  ].map(p => {
                    const cfg = RELATION_CONFIG[result.calc.overallTag.tag];
                    return (
                      <button key={p.name} onClick={async () => {
                        const text = `${cfg?.emoji} CP Fate: ${artist1?.stageName} × ${artist2?.stageName} | ${t("缘分评分", "緣分評分", "Fate Score")}: ${result.calc.overallScore} · ${cfg?.label}\n#R7Fortune #CPReport #IdolMatch`;
                        try { await navigator.clipboard.writeText(text); } catch {}
                      }}
                        className={`flex flex-col items-center gap-1 px-3 py-2 glass rounded-xl border border-[#d4a85310] ${p.color} transition-all text-[#8a8aad] hover:scale-105`}>
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[8px]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[8px] text-[#8a8aad33] text-center mt-2">
                  {t("Click to copy report text — paste on any platform", "点击复制报告文案 — 粘贴至任意平台发布", "點擊複製報告文案 — 粘貼至任意平台發布")}
                </p>
              </div>

              {/* ===== SHARE POSTER ARCHITECTURE PLACEHOLDER ===== */}
              {/* TODO: Dynamic share poster generation system
                  - Server-side canvas render: deep blue starry bg + gold vintage style
                  - Auto-fetches user's compatibility data (score, tag, traits, fate quotes)
                  - Each poster is unique per reading — one person, one design
                  - Bottom-right: permanent QR code linking to R7 Fortune homepage
                  - Supports HD one-click save, optimized for all social platforms
                  - Implementation: api/lib/poster-generator.ts + src/components/SharePoster.tsx */}
              <div className="glass rounded-xl p-3 border border-[#d4a85306] opacity-40">
                <p className="text-[9px] text-[#8a8aad44] text-center">
                  📸 {t("Share Poster · Coming Soon", "专属分享海报 · 即将上线", "專屬分享海報 · 即將上線")}
                </p>
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
