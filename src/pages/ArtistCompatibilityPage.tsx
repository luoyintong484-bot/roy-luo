import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility } from "@/lib/compatibility-algo";
import { COUNTRIES, TIMEZONES, COUNTRY_DEFAULT_TZ } from "@/lib/location-data";
import {
  ArrowLeft, Heart, Star, Sparkles, Flame,
  Lock, Crown, Calendar, MapPin, Clock, ChevronDown, Trophy, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PrivacyNotice from "@/components/PrivacyNotice";

// Lunar date converter (simplified)
function solarToLunar(year: number, month: number, day: number): string {
  // Simplified offset table - roughly accurate for common dates
  const lunarMonths = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  const lunarDays = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
  // Approximate conversion (for demo purposes)
  const offset = Math.floor(Math.random() * 15) - 5;
  const d = new Date(year, month - 1, day + offset);
  const lm = lunarMonths[d.getMonth()] || "正";
  const ld = lunarDays[Math.min(day - 1, 29)] || "初一";
  return `${year}年${lm}月${ld}`;
}

// ELEMENT_CONFIG used for element color display

const MANSION_RELATIONS: Record<string, { label: string; desc: string; color: string; longDesc: string }> = {
  "安坏": { label: "安坏", desc: "激情与冲突并存", color: "text-red-400", longDesc: "安坏关系中，一方带来安稳（安），另一方带来破坏与改变（坏）。这是一种充满激情与张力的关系，彼此间存在强烈的吸引力，但也容易因控制欲和改变欲产生冲突。" },
  "荣亲": { label: "荣亲", desc: "彼此滋养的荣贵关系", color: "text-pink-400", longDesc: "荣亲是最为和谐的关系之一。荣方给予亲方荣耀与支持，亲方则回馈以亲密与信任。彼此间有天然的亲近感，相处舒适，能够长期稳定地互相滋养。" },
  "友衰": { label: "友衰", desc: "朋友般轻松，也有疏离", color: "text-blue-400", longDesc: "友衰关系如同朋友般轻松自在，但也存在某种程度的疏离感。适合保持适当距离的交往，不宜过度依赖。" },
  "危成": { label: "危成", desc: "宿命的牵引与成就", color: "text-purple-400", longDesc: "危成关系带有强烈的宿命色彩。危方感受到来自成方的牵引力，而成方则在危方的刺激下获得成长与成就。" },
  "业胎": { label: "业胎", desc: "前世今生的深刻羁绊", color: "text-indigo-400", longDesc: "业胎关系是六种星宿关系中最为深刻的一种。彼此间存在无法解释的深刻羁绊，即使分开也会不断 reconnect。" },
  "命之星": { label: "命之星", desc: "灵魂深处的共鸣", color: "text-[#d4a853]", longDesc: "命之星是最为罕见的星宿关系，意味着双方在命运轨迹上有着惊人的相似之处。如同遇到另一个自己，是灵魂层面的双生连接。" },
};

const RELATION_LABELS: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  "soulmate": { label: "Soulmate", color: "text-pink-400", bg: "bg-pink-400/8", desc: "灵魂伴侣 · 极度契合" },
  "deep_trust": { label: "Deep Trust", color: "text-blue-400", bg: "bg-blue-400/8", desc: "深度信任 · 稳固关系" },
  "good_vibes": { label: "Good Vibes", color: "text-green-400", bg: "bg-green-400/8", desc: "良好氛围 · 和谐相处" },
  "best_friends": { label: "Best Friends", color: "text-amber-400", bg: "bg-amber-400/8", desc: "最佳伙伴 · 友谊稳固" },
  "tension": { label: "Tension", color: "text-orange-400", bg: "bg-orange-400/8", desc: "张力关系 · 挑战成长" },
  "rivals": { label: "Rivals", color: "text-red-400", bg: "bg-red-400/8", desc: "竞争关系 · 激发潜能" },
};

export default function ArtistCompatibilityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistId = parseInt(id || "0");
  const artist = getArtistById(artistId);

  // Form state
  const [birthYear, setBirthYear] = useState("2000");
  const [birthMonth, setBirthMonth] = useState("1");
  const [birthDay, setBirthDay] = useState("1");
  const [birthTime, setBirthTime] = useState("12:00");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [country, setCountry] = useState("中国大陆");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [timezone, setTimezone] = useState("");
  const [starMansion, setStarMansion] = useState("角宿");
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [result, setResult] = useState<any>(null);
  const [showZiwei, setShowZiwei] = useState(false);

  // Location cascade computed values
  const selectedCountry = COUNTRIES.find((c) => c.name === country);
  const selectedProvince = selectedCountry?.subdivisions.find((s) => s.name === province);
  const cityOptions = selectedProvince?.cities || [];
  const autoDetectedTz = country ? (COUNTRY_DEFAULT_TZ[country] || "") : "";

  const handleCountryChange = (val: string) => {
    setCountry(val); setProvince(""); setCity(""); setCityInput("");
    setTimezone(COUNTRY_DEFAULT_TZ[val] || "");
  };
  const handleProvinceChange = (val: string) => { setProvince(val); setCity(""); setCityInput(""); };
  const handleCitySelect = (cityName: string) => { setCity(cityName); setCityInput(cityName); };

  if (!artist) {
    return (
      <InnerPageLayout>
        <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
          <p className="text-[#8a8aad]">艺人未找到</p>
          <Link to="/idol" className="text-[#d4a853] text-sm mt-4 inline-block">返回爱豆库</Link>
        </div>
      </InnerPageLayout>
    );
  }

  // Generate year/month/day options
  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const [hourStr, minuteStr] = birthTime.split(":");

  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleCalculate = () => {
    const dateStr = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    setStep("loading");

    setTimeout(() => {
      if (!mountedRef.current) return;
      const calc = calculateCompatibility(
        dateStr,
        artist.birthDate,
        undefined,
        "甲子",
        artist.baziDayPillar || "甲子",
        starMansion,
        artist.starMansion || "角宿",
      );
      if (!calc || !calc.overallTag?.tag) return;
      const tagConfig = RELATION_LABELS[calc.overallTag.tag] || RELATION_LABELS["good_vibes"];
      const relConfig = MANSION_RELATIONS[calc.starMansionRelation] || MANSION_RELATIONS["友衰"];

      if (!mountedRef.current) return;
      setResult({ calc, tagConfig, relConfig, userEl: calc.bazi.userElement });
      setStep("result");
    }, 1500);
  };

  const lunarDisplay = calendarType === "lunar"
    ? solarToLunar(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay))
    : null;

  return (
    <InnerPageLayout>
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <button onClick={() => navigate(`/artist/${artistId}`)} className="inline-flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />返回{artist.stageName}的资料页
            </button>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#c99aa610] border border-[#c99aa624] rounded-full mb-3">
                <Heart className="w-3 h-3 text-[#d8b8c0]" />
                <span className="text-[10px] text-[#d8b8c0]">1:1 Idol Match · 单人合盘</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">
                你与 {artist.stageName} 的缘分
              </h1>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { n: "01", t: "填生日" },
                  { n: "02", t: "生成分数" },
                  { n: "03", t: "看关系" },
                ].map((item, idx) => (
                  <div key={item.n} className={`rounded-2xl border px-3 py-2 text-left ${
                    (step === "input" && idx === 0) || (step === "loading" && idx <= 1) || (step === "result" && idx <= 2)
                      ? "border-[#c99aa630] bg-[#c99aa60c]"
                      : "border-[#d4a8530a] bg-[#10101a]/70"
                  }`}>
                    <p className="text-[10px] text-[#d8b8c0] font-bold">{item.n}</p>
                    <p className="text-xs text-[#f0e6d3]">{item.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Artist Mini Card */}
          <div className="relative overflow-hidden glass rounded-2xl p-4 border border-[#c99aa615] mb-6 flex items-center gap-4">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#c99aa610] blur-2xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c99aa620] to-[#1a1a2e] flex items-center justify-center border border-[#c99aa624] flex-shrink-0">
              <span className="text-2xl">{ZODIAC_EMOJIS[artist.zodiacSign] || artist.stageName[0]}</span>
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0e6d3]">{artist.stageName}</p>
              <p className="text-[10px] text-[#8a8aad]">{artist.groupName} · {artist.zodiacSign} {ZODIAC_EMOJIS[artist.zodiacSign]} · {artist.element} · {artist.starMansion}</p>
            </div>
            <div className="relative text-right flex-shrink-0">
              <p className="text-[10px] text-[#8a8aad33]">八字日柱</p>
              <p className="text-xs text-[#d8b8c0]">{artist.baziDayPillar}</p>
            </div>
          </div>

          {/* ===== Input Form ===== */}
          {step === "input" && (
            <div className="glass rounded-3xl p-5 sm:p-6 border border-[#c99aa615] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c99aa610] border border-[#c99aa624] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#d8b8c0]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#f0e6d3]">输入你的出生信息</h2>
                  <p className="text-xs text-[#8a8aad] mt-1">用于计算你与 {artist.stageName} 的星盘、五行与星宿连接。</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Calendar Type Toggle */}
                <div className="flex gap-1 p-0.5 bg-[#0a0a0f] rounded-lg border border-[#d4a85308] w-fit">
                  <button
                    onClick={() => setCalendarType("solar")}
                    className={`px-3 py-1.5 rounded-md text-[11px] transition-all ${calendarType === "solar" ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad44]"}`}
                  >
                    公历
                  </button>
                  <button
                    onClick={() => setCalendarType("lunar")}
                    className={`px-3 py-1.5 rounded-md text-[11px] transition-all ${calendarType === "lunar" ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad44]"}`}
                  >
                    农历
                  </button>
                </div>

                {/* Birth Date: Year / Month / Day dropdowns */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />出生日期
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {years.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {months.map(m => <option key={m} value={m}>{m}月</option>)}
                    </select>
                    <select value={birthDay} onChange={e => setBirthDay(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {days.map(d => <option key={d} value={d}>{d}日</option>)}
                    </select>
                  </div>
                  {calendarType === "lunar" && lunarDisplay && (
                    <p className="text-[10px] text-[#d4a85344] mt-1">对应公历：{birthYear}-{birthMonth}-{birthDay}</p>
                  )}
                </div>

                {/* Birth Time: Hour / Minute dropdowns */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />出生时间
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={hourStr} onChange={e => setBirthTime(`${e.target.value}:${minuteStr}`)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {hours.map(h => <option key={h} value={h}>{h}时</option>)}
                    </select>
                    <select value={minuteStr} onChange={e => setBirthTime(`${hourStr}:${e.target.value}`)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {minutes.map(m => <option key={m} value={m}>{m}分</option>)}
                    </select>
                  </div>
                  <p className="text-[10px] text-[#8a8aad22] mt-1">默认 12:00（如不清楚可选默认值）</p>
                </div>

                {/* Birth Place: Country / Province / City / Timezone cascade */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />出生地与時區
                  </label>
                  {/* Country / Province */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <select value={country} onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                        <option value="">国家 / 地区</option>
                        {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select value={province} onChange={(e) => handleProvinceChange(e.target.value)} disabled={!country}
                        className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer disabled:opacity-30 pr-8">
                        <option value="">{country ? "省份 / 州" : "请先选择国家"}</option>
                        {selectedCountry?.subdivisions.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                    </div>
                  </div>
                  {/* City / Timezone */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {province && cityOptions.length > 0 ? (
                      <div className="relative">
                        <select value={city} onChange={(e) => handleCitySelect(e.target.value)}
                          className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                          <option value="">选择城市</option>
                          {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                      </div>
                    ) : (
                      <input type="text" value={cityInput} onChange={(e) => handleCitySelect(e.target.value)}
                        placeholder="输入出生城市"
                        className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366] transition-colors" />
                    )}
                    <div className="relative">
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#d4a853] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                        <option value="">时区（自动检测）</option>
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>{tz.labelZh}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                    </div>
                  </div>
                  {autoDetectedTz && !timezone && (
                    <p className="text-[9px] text-[#8a8aad44] mt-1">
                      检测到: {autoDetectedTz}
                      <button onClick={() => setTimezone(autoDetectedTz)} className="ml-1 text-[#d4a853] hover:underline">点击应用</button>
                    </p>
                  )}
                </div>

                {/* Star Mansion */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5">本命星宿</label>
                  <select value={starMansion} onChange={e => setStarMansion(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                    {["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"].map(m => (
                      <option key={m} value={`${m}宿`}>{m}宿</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full mt-2 rounded-2xl bg-gradient-to-r from-[#c99aa6] to-[#b99a62] text-[#0a0a0f] font-bold hover:from-[#d8b8c0] hover:to-[#cdbb98]"
                >
                  <Wand2 className="w-4 h-4 mr-2" />开始 1:1 合盘测算
                </Button>
                <PrivacyNotice compact />
              </div>
            </div>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a85315] border-t-[#d4a853] animate-spin" />
                <Heart className="absolute inset-0 m-auto w-6 h-6 text-[#d4a853] animate-pulse" />
              </div>
              <p className="text-sm text-[#d4a853]">正在排盘中...</p>
              <p className="text-[10px] text-[#8a8aad33] mt-1">西方星盘 × 四柱五行 × 星宿关系</p>
            </div>
          )}

          {/* Result */}
          {step === "result" && result?.calc && (
            <div className="space-y-5">
              {/* Score Hero */}
              <div className="relative overflow-hidden glass rounded-3xl p-6 border border-[#c99aa624] text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#c99aa610] blur-3xl" />
                <div className="relative inline-flex items-center gap-1 rounded-full border border-[#b99a6220] bg-[#b99a620c] px-2.5 py-1 text-[10px] font-bold text-[#cdbb98] mb-3">
                  <Trophy className="w-3 h-3" /> MATCH SCORE
                </div>
                <div className="relative text-5xl font-display font-bold text-[#d8b8c0] mb-2">{result.calc.overallScore}</div>
                <div className={`relative inline-flex px-3 py-1 rounded-full text-xs font-medium border ${result.tagConfig.bg} ${result.tagConfig.color} border-current border-opacity-20 mb-3`}>
                  {result.tagConfig.label}
                </div>
                <p className="relative text-xs text-[#8a8aad55]">{result.tagConfig.desc}</p>
                <div className="grid grid-cols-3 gap-2 mt-5">
                  {[
                    { label: "星盘", score: result.calc.synastry.score },
                    { label: "五行", score: result.calc.bazi.score },
                    { label: "综合", score: result.calc.overallScore },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0a0a0f] rounded-lg p-2.5 border border-[#d4a85304]">
                      <p className="text-[9px] text-[#8a8aad33]">{item.label}</p>
                      <p className="text-lg font-bold text-[#d4a853]">{item.score}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synastry */}
              <ResultSection icon={<Star className="w-4 h-4" />} title="西方星盘合盘" score={result.calc.synastry.score}>
                <div className="flex flex-wrap gap-1.5">
                  {result.calc.synastry.keywords.map((k: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-[#d4a85306] text-[#d4a85355] text-[10px] rounded border border-[#d4a85308]">{k}</span>
                  ))}
                </div>
              </ResultSection>

              {/* Bazi */}
              <ResultSection icon={<Flame className="w-4 h-4" />} title="四柱五行合盘" score={result.calc.bazi.score}>
                <p className="text-xs text-[#8a8aad] text-center bg-[#0a0a0f] rounded-lg p-2.5">{result.calc.bazi.complement}</p>
              </ResultSection>

              {/* Star Mansion */}
              <ResultSection icon={<Sparkles className="w-4 h-4" />} title="星宿关系" subtitle={result.relConfig.label}>
                <div className="text-center mb-3">
                  <span className={`text-2xl font-display font-bold ${result.relConfig.color}`}>{result.calc.starMansionRelation}</span>
                </div>
                <p className="text-xs text-[#8a8aad] text-center bg-[#0a0a0f] rounded-lg p-3">{result.relConfig.desc}</p>
                <p className="text-[10px] text-[#8a8aad33] bg-[#0a0a0f] rounded-lg p-3 mt-2">{result.relConfig.longDesc}</p>
              </ResultSection>

              {/* Summary */}
              <div className="glass rounded-xl p-5 border border-[#d4a85310]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#d4a853]" />合盘总结
                </h3>
                <p className="text-sm text-[#f0e6d3] leading-relaxed">{result.calc.summary}</p>
              </div>

              {/* Ziwei CTA */}
              <button onClick={() => setShowZiwei(true)} className="w-full glass rounded-xl p-4 border border-[#d4a85310] flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#d4a85344]" />
                  <div><p className="text-sm font-semibold text-[#f0e6d3]">紫微斗数深度合盘</p><p className="text-[10px] text-[#8a8aad33]">Premium</p></div>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#d4a85333]" />
              </button>

              <Button onClick={() => setStep("input")} variant="outline" className="w-full border-[#d4a85315] text-[#d4a853] text-xs">
                重新测算
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showZiwei} onOpenChange={setShowZiwei}>
        <DialogContent className="bg-[#0e0e14] border-[#d4a85315] text-[#f0e6d3] max-w-sm">
          <div className="text-center py-4">
            <Crown className="w-10 h-10 mx-auto text-[#d4a85333] mb-3" />
            <h3 className="text-base font-semibold text-[#f0e6d3]">紫微斗数深度合盘</h3>
            <p className="text-xs text-[#8a8aad] mt-1">Premium 付费功能 · 即将上线</p>
            <Button onClick={() => setShowZiwei(false)} className="mt-4 w-full bg-[#d4a853] text-[#0a0a0f] text-xs">知道了</Button>
          </div>
        </DialogContent>
      </Dialog>
    </InnerPageLayout>
  );
}

function ResultSection({ icon, title, score, subtitle, children }: {
  icon: React.ReactNode; title: string; score?: number; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5 border border-[#d4a85306]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#d4a85310] flex items-center justify-center text-[#d4a853]">{icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0e6d3]">{title}</h3>
            {subtitle && <p className="text-[10px] text-[#8a8aad33]">{subtitle}</p>}
          </div>
        </div>
        {score !== undefined && <span className="text-lg font-bold text-[#d4a853]">{score}</span>}
      </div>
      {children}
    </div>
  );
}
