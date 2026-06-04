import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility, generateCosmicAnswer, RELATION_CONFIG } from "@/lib/compatibility-algo";
import type { CompatibilityCalcResult } from "@/lib/compatibility-algo";
import { useBirthProfile, computeDerivedFields } from "@/hooks/useBirthProfile";
import { COUNTRIES, TIMEZONES, COUNTRY_DEFAULT_TZ } from "@/lib/location-data";
import ConnectionMap from "@/components/ConnectionMap";
import type { ConnectionNode } from "@/components/ConnectionMap";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { Sparkles, Heart, Loader2, Search, Star, ChevronRight, Users, X, ArrowLeft, Calendar, MapPin, Clock, User, ChevronDown } from "lucide-react";

type Step = "input" | "loading" | "results";

const YEARS = Array.from({ length: 76 }, (_, i) => String(1950 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i));
const MINUTES = ["00", "15", "30", "45"];

function getDaysInMonth(y: string, m: string): number[] {
  const year = parseInt(y) || 2000;
  const month = parseInt(m) || 1;
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

export default function IdolMatchPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { profile, updateProfile } = useBirthProfile();
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get("group") || "";

  const [step, setStep] = useState<Step>("input");

  // Birth form fields (auto-filled from saved profile)
  const [birthYear, setBirthYear] = useState(profile.birthYear || "");
  const [birthMonth, setBirthMonth] = useState(profile.birthMonth || "");
  const [birthDay, setBirthDay] = useState(profile.birthDay || "");
  const [birthHour, setBirthHour] = useState(profile.birthHour || "");
  const [birthMinute, setBirthMinute] = useState(profile.birthMinute || "");
  const [birthPlace, setBirthPlace] = useState(profile.birthPlace || "");

  // Location cascade state (matching DestinySection self form)
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [timezone, setTimezone] = useState("");

  const selectedCountry = COUNTRIES.find((c) => c.name === country);
  const selectedProvince = selectedCountry?.subdivisions.find((s) => s.name === province);
  const cityOptions = selectedProvince?.cities || [];
  const autoDetectedTz = country ? (COUNTRY_DEFAULT_TZ[country] || "") : "";
  const composedBirthPlace = [country, province, city || cityInput].filter(Boolean).join(" · ") || birthPlace;

  const handleCountryChange = (val: string) => {
    setCountry(val); setProvince(""); setCity(""); setCityInput("");
    setTimezone(COUNTRY_DEFAULT_TZ[val] || "");
  };
  const handleProvinceChange = (val: string) => { setProvince(val); setCity(""); setCityInput(""); };
  const handleCitySelect = (cityName: string) => { setCity(cityName); setCityInput(cityName); };

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    if (groupParam) {
      return ALL_ARTISTS.filter(a => a.groupName === groupParam).map(a => a.id);
    }
    return [];
  });
  const [results, setResults] = useState<Array<{ artistId: number; calc: CompatibilityCalcResult }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<ConnectionNode | null>(null);

  const userName = profile.name || "You";
  const days = getDaysInMonth(birthYear, birthMonth);

  // Filter artists for selection
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ARTISTS.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return ALL_ARTISTS.filter(a =>
      a.stageName.toLowerCase().includes(q) ||
      a.name.includes(q) ||
      a.groupName.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchQuery]);

  const toggleArtist = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleMatch = () => {
    if (!birthYear || !birthMonth || !birthDay || selectedIds.length === 0) return;

    // Auto-save birth info to profile
    updateProfile({ birthYear, birthMonth, birthDay, birthHour, birthMinute, birthPlace: composedBirthPlace || birthPlace });

    // Compute derived fields
    const derived = computeDerivedFields(birthYear, birthMonth, birthDay);
    const userBirthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

    setStep("loading");

    setTimeout(() => {
      const calcResults = selectedIds.map(id => {
        const artist = getArtistById(id);
        if (!artist) return null;
        const calc = calculateCompatibility(
          userBirthDate,
          artist.birthDate,
          birthHour || undefined,
          derived.baziDayPillar,
          artist.baziDayPillar,
          derived.starMansion,
          artist.starMansion,
        );
        return { artistId: id, calc };
      }).filter(Boolean) as Array<{ artistId: number; calc: CompatibilityCalcResult }>;

      calcResults.sort((a, b) => b.calc.overallScore - a.calc.overallScore);
      setResults(calcResults);
      setStep("results");
      // Auto-save to localStorage
      try {
        const topArtist = calcResults[0];
        if (topArtist) {
          const artist = getArtistById(topArtist.artistId);
          const record = {
            title: `Idol合盘: You × ${artist?.stageName || "Idol"} (等${calcResults.length}位)`,
            type: "idol",
            date: new Date().toLocaleDateString("zh-CN"),
            preview: `最佳匹配: ${artist?.stageName || "Idol"} · 评分 ${topArtist.calc.overallScore} · ${topArtist.calc.overallTag.label}`,
          };
          const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]");
          existing.unshift(record);
          localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)));
        }
      } catch {}
    }, 1500);
  };

  // Build connection nodes from results
  const connectionNodes: ConnectionNode[] = useMemo(() => results.map(r => {
    const artist = getArtistById(r.artistId);
    return {
      id: r.artistId,
      name: artist?.name || "",
      stageName: artist?.stageName || "",
      groupName: artist?.groupName || "",
      zodiacSign: artist?.zodiacSign || "",
      mbti: artist?.mbti || "",
      element: artist?.element || "",
      relationTag: r.calc.overallTag.tag,
      score: r.calc.overallScore,
    };
  }), [results]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFB6C110] border border-[#FFB6C120] rounded-full mb-4">
              <Heart className="w-3 h-3 text-[#FFB6C1]" />
              <span className="text-[10px] text-[#FFB6C1] uppercase tracking-wider">{locale === "zh-TW" ? "偶像配对合盘" : "Idol Match"}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#f0e6d3]">
              {locale === "zh-TW" ? "宇宙连线 · 缘分匹配" : "Cosmic Connection"}
            </h1>
            <p className="mt-2 text-sm text-[#8a8aad]">
              {locale === "zh-TW" ? "输入你的四柱信息，选择爱豆，探索宇宙级缘分" : "Enter your Saju info, pick your idols, discover cosmic bonds"}
            </p>
          </div>

          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-6 animate-fade-in">
              {/* Birth Info Form — matching DestinySection layout */}
              <div className="glass rounded-xl p-5 border border-[#FFB6C115]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FFB6C1]" />
                  {locale === "zh-TW" ? "你的出生信息" : locale === "zh-TW" ? "你的出生資訊" : "Your Birth Info"}
                </h3>

                <div className="space-y-4">
                  {/* Date of Birth: Year / Month / Day */}
                  <div>
                    <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{locale === "zh-TW" ? "出生日期" : locale === "zh-TW" ? "出生日期" : "Date of Birth"} *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select value={birthYear} onChange={(e) => { setBirthYear(e.target.value); setBirthDay(""); }}
                        className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                        <option value="">{locale === "zh-TW" ? "年" : locale === "zh-TW" ? "年" : "Year"}</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthDay(""); }}
                        className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                        <option value="">{locale === "zh-TW" ? "月" : locale === "zh-TW" ? "月" : "Month"}</option>
                        {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                      </select>
                      <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} disabled={!birthYear || !birthMonth}
                        className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer disabled:opacity-30">
                        <option value="">{locale === "zh-TW" ? "日" : locale === "zh-TW" ? "日" : "Day"}</option>
                        {days.map((d) => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
                      </select>
                    </div>
                    {/* Auto-computed preview */}
                    {birthYear && birthMonth && birthDay && (() => {
                      const derived = computeDerivedFields(birthYear, birthMonth, birthDay);
                      return derived.baziDayPillar ? (
                        <p className="text-[9px] text-[#8a8aad44] mt-1.5">
                          {locale === "zh-TW" ? "日柱" : locale === "zh-TW" ? "日柱" : "Day Pillar"}: {derived.baziDayPillar}
                          {" · "}{locale === "zh-TW" ? "星宿" : locale === "zh-TW" ? "星宿" : "Mansion"}: {derived.starMansion}
                          {" · "}{locale === "zh-TW" ? "星座" : locale === "zh-TW" ? "星座" : "Zodiac"}: {derived.zodiacSign}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  {/* Birth Time: Hour / Minute (optional) */}
                  <div>
                    <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />{locale === "zh-TW" ? "出生时间（可选）" : locale === "zh-TW" ? "出生時間（可選）" : "Birth Time (optional)"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)}
                        className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                        <option value="">{locale === "zh-TW" ? "时" : locale === "zh-TW" ? "時" : "Hour"}</option>
                        {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                      </select>
                      <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)}
                        className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                        <option value="">{locale === "zh-TW" ? "分" : locale === "zh-TW" ? "分" : "Minute"}</option>
                        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Birth Place — Country / Province / City / Timezone cascade */}
                  <div>
                    <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{locale === "zh-TW" ? "出生地與時區" : locale === "zh-TW" ? "出生地與時區" : "Birth Place & Timezone"}
                    </label>
                    {/* Country / Province */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select value={country} onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer pr-8">
                          <option value="">{locale === "zh-TW" ? "國家 / 地區" : locale === "zh-TW" ? "國家 / 地區" : "Country / Region"}</option>
                          {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select value={province} onChange={(e) => handleProvinceChange(e.target.value)} disabled={!country}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer disabled:opacity-30 pr-8">
                          <option value="">{country ? (locale === "zh-TW" ? "省份 / 州" : "Province / State") : (locale === "zh-TW" ? "請先選擇國家" : "Select Country First")}</option>
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
                            className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer pr-8">
                            <option value="">{locale === "zh-TW" ? "選擇城市" : "Select City"}</option>
                            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                        </div>
                      ) : (
                        <input type="text" value={cityInput} onChange={(e) => handleCitySelect(e.target.value)}
                          placeholder={locale === "zh-TW" ? "輸入出生城市" : "Enter birth city"}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#FFB6C144] transition-colors" />
                      )}
                      <div className="relative">
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#FFB6C1] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer pr-8">
                          <option value="">{locale === "zh-TW" ? "時區（自動檢測）" : "Timezone (Auto)"}</option>
                          {TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>{locale === "zh-TW" ? tz.labelZh : tz.labelEn}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                      </div>
                    </div>
                    {autoDetectedTz && !timezone && (
                      <p className="text-[9px] text-[#8a8aad44] mt-1">
                        {locale === "zh-TW" ? `檢測到: ${autoDetectedTz}` : `Detected: ${autoDetectedTz}`}
                        <button onClick={() => setTimezone(autoDetectedTz)} className="ml-1 text-[#FFB6C1] hover:underline">
                          {locale === "zh-TW" ? "點擊應用" : "Apply"}
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Auto-fill indicator */}
                  {profile.birthYear && (
                    <p className="text-[9px] text-[#8a8aad44] text-center">
                      {locale === "zh-TW" ? "已自动填入存档信息，可修改" : locale === "zh-TW" ? "已自動填入存檔資訊，可修改" : "Auto-filled from saved profile — editable"}
                    </p>
                  )}
                </div>
              </div>

              {/* Artist selection */}
              <div className="glass rounded-xl p-5 border border-[#FFB6C115]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4a853]" />
                  {locale === "zh-TW" ? `选择爱豆 (已选 ${selectedIds.length})` : `Select Idols (${selectedIds.length} selected)`}
                </h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={locale === "zh-TW" ? "搜索艺人姓名..." : "Search artist name..."}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {filteredArtists.map(a => {
                    const sel = selectedIds.includes(a.id);
                    return (
                      <button key={a.id} onClick={() => toggleArtist(a.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition-all ${
                          sel ? "border-[#FFB6C1] bg-[#FFB6C108]" : "border-[#d4a85306] hover:border-[#d4a85315]"
                        }`}>
                        <span className="text-sm">{ZODIAC_EMOJIS[a.zodiacSign] || "✨"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#f0e6d3] truncate">{a.stageName}</p>
                          <p className="text-[9px] text-[#8a8aad44] truncate">{a.groupName}</p>
                        </div>
                        {sel && <span className="text-[#FFB6C1] text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleMatch} disabled={!birthYear || !birthMonth || !birthDay || selectedIds.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                {locale === "zh-TW" ? `开始合盘测算 (${selectedIds.length} 位爱豆)` : `Start Matching (${selectedIds.length} idols)`}
              </button>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative">
                <Heart className="w-16 h-16 text-[#FFB6C1] animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#f0e6d3] animate-spin" />
                </div>
              </div>
              <p className="mt-6 text-sm text-[#f0e6d3] font-medium">
                {locale === "zh-TW" ? "正在计算星盘合盘中..." : "Calculating cosmic compatibility..."}
              </p>
              <p className="mt-1 text-xs text-[#8a8aad44]">
                {locale === "zh-TW" ? "四柱五行 × 星宿关系 × 西式星盘" : "Saju × Star Mansions × Western Synastry"}
              </p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && (
            <div className="space-y-6 animate-fade-in">
              <button onClick={() => { setStep("input"); setResults([]); }}
                className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {locale === "zh-TW" ? "返回重选" : "Back to selection"}
              </button>

              {/* Connection Map */}
              <div className="glass rounded-2xl p-4 border border-[#d4a85315]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 text-center">
                  {locale === "zh-TW" ? "缘分关系图谱" : "Connection Map"}
                </h3>
                <ConnectionMap
                  userName={userName}
                  userElement={(computeDerivedFields(birthYear, birthMonth, birthDay).baziDayPillar || "?")[0]}
                  userZodiac={computeDerivedFields(birthYear, birthMonth, birthDay).starMansion || "?"}
                  nodes={connectionNodes}
                  onNodeClick={setSelectedNode}
                />
              </div>

              {/* Results list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map(r => {
                  const artist = getArtistById(r.artistId);
                  if (!artist) return null;
                  const cfg = RELATION_CONFIG[r.calc.overallTag.tag];
                  const derived = computeDerivedFields(birthYear, birthMonth, birthDay);
                  const cosmicAnswer = generateCosmicAnswer(
                    userName, artist.stageName,
                    (derived.baziDayPillar || "?")[0], artist.element,
                    derived.starMansion, artist.starMansion,
                    r.calc.overallTag.tag, r.calc.starMansionRelation,
                    locale as "zh" | "en"
                  );

                  return (
                    <div key={r.artistId}
                      className="glass rounded-xl p-4 border hover:border-[#d4a85320] transition-all cursor-pointer"
                      onClick={() => setSelectedNode(connectionNodes.find(n => n.id === r.artistId) || null)}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{ZODIAC_EMOJIS[artist.zodiacSign] || "✨"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#f0e6d3]">{artist.stageName}</p>
                          <p className="text-[9px] text-[#8a8aad44]">{artist.groupName} · {artist.zodiacSign} · {artist.mbti}</p>
                        </div>
                        <div className="text-right">
                          <span style={{ color: cfg?.color }} className="text-lg">{cfg?.emoji}</span>
                          <p className="text-lg font-bold" style={{ color: cfg?.color }}>{r.calc.overallScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#151520] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${r.calc.overallScore}%`, background: cfg?.color }} />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: cfg?.color }}>{cfg?.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Node detail modal */}
              {selectedNode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNode(null)}>
                  <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" />
                  <div className="relative glass rounded-2xl p-6 max-w-md w-full border border-[#d4a85320] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]">
                      <X className="w-4 h-4" />
                    </button>
                    {(() => {
                      const r = results.find(r => r.artistId === selectedNode.id);
                      const artist = getArtistById(selectedNode.id);
                      if (!r || !artist) return null;
                      const cfg = RELATION_CONFIG[r.calc.overallTag.tag];
                      const derived2 = computeDerivedFields(birthYear, birthMonth, birthDay);
                      const cosmicAnswer = generateCosmicAnswer(
                        userName, artist.stageName,
                        (derived2.baziDayPillar || "?")[0], artist.element,
                        derived2.starMansion, artist.starMansion,
                        r.calc.overallTag.tag, r.calc.starMansionRelation,
                        locale as "zh" | "en"
                      );
                      return (
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-4xl">{ZODIAC_EMOJIS[artist.zodiacSign] || "✨"}</span>
                            <h3 className="text-lg font-display font-bold text-[#f0e6d3] mt-2">{artist.stageName}</h3>
                            <p className="text-xs text-[#8a8aad]">{artist.groupName}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-3xl">{cfg?.emoji}</span>
                            <p className="text-2xl font-bold mt-1" style={{ color: cfg?.color }}>{r.calc.overallScore}</p>
                            <p className="text-sm font-semibold" style={{ color: cfg?.color }}>{cfg?.label}</p>
                          </div>
                          <div className="bg-[#151520] rounded-lg p-3 border border-[#d4a85306]">
                            <p className="text-xs text-[#8a8aad] leading-relaxed">
                              <span className="text-[#d4a853] font-semibold">{locale === "zh-TW" ? "宇宙答案" : "Cosmic Answer"}: </span>
                              {cosmicAnswer}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-[#151520] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh-TW" ? "星盘" : "Synastry"}</p>
                              <p className="text-sm font-bold text-[#f0e6d3]">{r.calc.synastry.score}</p>
                            </div>
                            <div className="bg-[#151520] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh-TW" ? "五行" : "Bazi"}</p>
                              <p className="text-sm font-bold text-[#f0e6d3]">{r.calc.bazi.score}</p>
                            </div>
                            <div className="bg-[#151520] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh-TW" ? "星宿" : "Mansion"}</p>
                              <p className="text-xs font-bold text-[#d4a853]">{r.calc.starMansionRelation}</p>
                            </div>
                          </div>
                          <button onClick={() => navigate(`/artist/${artist.id}`)}
                            className="w-full py-2.5 glass rounded-lg text-xs text-[#d4a853] border border-[#d4a85315] hover:border-[#d4a85340] transition-colors flex items-center justify-center gap-1">
                            {locale === "zh-TW" ? "查看完整档案" : "View Full Profile"}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
