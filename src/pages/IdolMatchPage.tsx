import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, getArtistDisplayName, ZODIAC_EMOJIS } from "@/data/artists";
import { RELATION_CONFIG } from "@/lib/compatibility-algo";
import { useBirthProfile, computeDerivedFields } from "@/hooks/useBirthProfile";
import { COUNTRIES, TIMEZONES, COUNTRY_DEFAULT_TZ } from "@/lib/location-data";
import { calculateMatchScore } from "@/lib/idol-match-engine";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import PrivacyNotice from "@/components/PrivacyNotice";
import { Sparkles, Heart, Loader2, Search, Star, ChevronRight, Users, ArrowLeft, Calendar, MapPin, Clock, ChevronDown, Trophy, Wand2, ShieldCheck } from "lucide-react";

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

function uniqueByArtistId<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
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

  // Mount guard: prevent state updates on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  // Safari bfcache: re-validate on page restore
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) mountedRef.current = true; };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

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
      return Array.from(new Set(ALL_ARTISTS.filter(a => a.groupName === groupParam).map(a => a.id)));
    }
    return [];
  });
  // API match results (server-side calculated scores)
  type MatchResultItem = {
    id: number;
    name: string;
    stageName: string;
    groupName: string;
    region: string;
    zodiacSign: string;
    baziDayPillar: string;
    starMansion: string;
    element: string;
    avatar?: string;
    matchScore: number;
    matchLevel: string;
    fiveElementsScore: number;
    zodiacScore: number;
    constellationScore: number;
    nayinScore: number;
    matchDetails?: {
      userDayElement: string;
      artistDayElement: string;
      elementRelation: string;
      userZodiac: string;
      artistZodiac: string;
      zodiacRelation: string;
      userMansion: string;
      artistMansion: string;
      mansionRelation: string;
      userNayin: string;
      artistNayin: string;
      nayinRelation: string;
    };
  };
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArtistLibrary, setShowArtistLibrary] = useState(false);

  const days = getDaysInMonth(birthYear, birthMonth);
  const artistLabel = (artist?: { name?: string; stageName?: string } | null) => (
    locale === "zh-TW" ? (artist?.name || artist?.stageName || "") : (artist?.stageName || artist?.name || "")
  );

  // Filter artists for selection
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return uniqueByArtistId(ALL_ARTISTS).slice(0, 50);
    const q = searchQuery.toLowerCase();
    return uniqueByArtistId(ALL_ARTISTS.filter(a =>
      a.stageName.toLowerCase().includes(q) ||
      a.name.includes(q) ||
      a.groupName.toLowerCase().includes(q)
    )).slice(0, 50);
  }, [searchQuery]);

  const toggleArtist = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const quickGroups = ["aespa", "BLACKPINK", "RIIZE", "NCT DREAM", "BTS", "IVE"];

  const selectGroup = (groupName: string) => {
    const ids = Array.from(new Set(ALL_ARTISTS.filter(a => a.groupName === groupName).map(a => a.id)));
    if (ids.length === 0) return;
    setSelectedIds(ids);
    setSearchQuery("");
    setShowArtistLibrary(false);
  };

  const isLoggedIn = () => {
    try {
      return localStorage.getItem("r7_auth_user") === "logged_in";
    } catch {
      return false;
    }
  };

  const handleMatch = () => {
    if (!birthYear || !birthMonth || !birthDay) return;

    if (isLoggedIn()) {
      updateProfile({ birthYear, birthMonth, birthDay, birthHour, birthMinute, birthPlace: composedBirthPlace || birthPlace });
    }

    const userBirthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

    setStep("loading");
    mountedRef.current = true;

    // Use setTimeout to allow the loading UI to render before heavy calculation
    setTimeout(() => {
      if (!mountedRef.current) return;

      const targetIds = selectedIds.length > 0
        ? selectedIds
        : uniqueByArtistId(ALL_ARTISTS).map(a => a.id);

      const scored: MatchResultItem[] = targetIds.map(id => {
        const artist = getArtistById(id);
        if (!artist) return null;

        // Call the match score engine (same function used by API)
        const result = calculateMatchScore({
          userBirthDate,
          artistBirthDate: artist.birthDate,
          artistDayPillar: artist.baziDayPillar || undefined,
          artistZodiacSign: artist.zodiacSign || undefined,
          artistStarMansion: artist.starMansion || undefined,
        });

        return {
          id: artist.id,
          name: artist.name,
          stageName: artist.stageName,
          groupName: artist.groupName,
          region: artist.region,
          zodiacSign: artist.zodiacSign,
          baziDayPillar: artist.baziDayPillar,
          starMansion: artist.starMansion,
          element: artist.element,
          avatar: artist.avatar,
          matchScore: result.totalScore,
          matchLevel: result.matchLevel,
          fiveElementsScore: result.fiveElementsScore,
          zodiacScore: result.zodiacScore,
          constellationScore: result.constellationScore,
          nayinScore: result.nayinScore,
          matchDetails: result.details,
        } as MatchResultItem;
      }).filter(Boolean) as MatchResultItem[];

      // Sort by score descending
      scored.sort((a, b) => b.matchScore - a.matchScore);

      if (!mountedRef.current) return;
      setResults(scored);
      setStep("results");

      // Auto-save report history
      if (isLoggedIn() && scored.length > 0) {
        try {
          const top = scored[0];
          const topName = artistLabel(top);
          const record = {
            title: `Idol推荐: You × ${topName || "Idol"} (等${scored.length}位)`,
            type: "idol",
            date: new Date().toLocaleDateString("zh-CN"),
            preview: `推荐追: ${topName || "Idol"} · 匹配 ${top.matchScore} · ${top.matchLevel || "MATCH"}`,
          };
          const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]");
          existing.unshift(record);
          localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)));
        } catch {}
      }
    }, 300);
  };

  return (
    <div className="idol-match-page min-h-screen">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff8fbd1a] border border-[#ffb6d950] rounded-full mb-4 shadow-[0_0_24px_rgba(255,143,189,0.12)]">
              <Heart className="w-3.5 h-3.5 text-[#ff9fc8]" />
              <span className="text-[11px] font-bold text-[#ffd9e9] uppercase tracking-[0.18em]">{locale === "zh-TW" ? "生日追星推荐" : "Idol Match"}</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#fff7ef] via-[#ffd1e4] to-[#d8c7ff] bg-clip-text text-transparent leading-tight">
              {locale === "zh-TW" ? "输入生日 · 推荐适合追的爱豆" : "Find Your Idol Match"}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#d7cbe6] leading-relaxed max-w-2xl mx-auto">
              {locale === "zh-TW" ? "从星座、五行、星宿和合盘分数，帮你筛出与你生日最合拍的追星对象" : "Enter your birthday to discover idols that best match your zodiac, element, and star mansion energy"}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 max-w-2xl mx-auto">
              {[
                { n: "01", t: locale === "zh-TW" ? "填生日" : "Birth" },
                { n: "02", t: locale === "zh-TW" ? "算匹配" : "Match" },
                { n: "03", t: locale === "zh-TW" ? "看推荐" : "Rank" },
              ].map((item, idx) => (
                <div key={item.n} className={`rounded-[20px] border px-3.5 py-3 text-left transition-all ${
                  (step === "input" && idx <= 1) || (step === "results" && idx <= 2) || (step === "loading" && idx <= 2)
                    ? "border-[#ffb6d946] bg-[#ff8fbd14] shadow-[0_10px_32px_rgba(255,143,189,0.08)]"
                    : "border-[#d4a85312] bg-[#171421]/70"
                }`}>
                  <p className="text-[10px] text-[#ffb6d9] font-black">{item.n}</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#fff7ef]">{item.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-6 animate-fade-in">
              {/* Birth Info Form — matching DestinySection layout */}
              <div className="rounded-[28px] p-5 sm:p-6 border border-[#ffb6d933] bg-gradient-to-br from-[#fff0f512] via-[#211427]/90 to-[#0d0d16]/95 shadow-[0_24px_80px_rgba(255,143,189,0.10)]">
                <h3 className="text-lg font-bold text-[#fff7ef] mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#ff9fc8]" />
                  {locale === "zh-TW" ? "你的出生信息" : locale === "zh-TW" ? "你的出生資訊" : "Your Birth Info"}
                </h3>
                <p className="text-xs sm:text-sm text-[#d7cbe6] mb-4">
                  {locale === "zh-TW" ? "输入生日后会自动推荐全站最适合你追的爱豆；选择团体/艺人只是可选筛选。" : "Enter your birthday to rank all idols. Picking a group or idol is optional filtering."}
                </p>

                <div className="space-y-4">
                  {/* Date of Birth: Year / Month / Day */}
                  <div>
                    <label className="block text-[11px] text-[#ffbddc] mb-2 uppercase tracking-wider flex items-center gap-1 font-bold">
                      <Calendar className="w-3 h-3" />{locale === "zh-TW" ? "出生日期" : locale === "zh-TW" ? "出生日期" : "Date of Birth"} *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select value={birthYear} onChange={(e) => { setBirthYear(e.target.value); setBirthDay(""); }}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer transition-colors">
                        <option value="">{locale === "zh-TW" ? "年" : locale === "zh-TW" ? "年" : "Year"}</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthDay(""); }}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer transition-colors">
                        <option value="">{locale === "zh-TW" ? "月" : locale === "zh-TW" ? "月" : "Month"}</option>
                        {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                      </select>
                      <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} disabled={!birthYear || !birthMonth}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer disabled:opacity-30 transition-colors">
                        <option value="">{locale === "zh-TW" ? "日" : locale === "zh-TW" ? "日" : "Day"}</option>
                        {days.map((d) => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
                      </select>
                    </div>
                    {/* Auto-computed preview */}
                    {birthYear && birthMonth && birthDay && (() => {
                      const derived = computeDerivedFields(birthYear, birthMonth, birthDay);
                      return derived.baziDayPillar ? (
                        <p className="text-[11px] text-[#cdbbff] mt-2">
                          {locale === "zh-TW" ? "日柱" : locale === "zh-TW" ? "日柱" : "Day Pillar"}: {derived.baziDayPillar}
                          {" · "}{locale === "zh-TW" ? "星宿" : locale === "zh-TW" ? "星宿" : "Mansion"}: {derived.starMansion}
                          {" · "}{locale === "zh-TW" ? "星座" : locale === "zh-TW" ? "星座" : "Zodiac"}: {derived.zodiacSign}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  {/* Birth Time: Hour / Minute (optional) */}
                  <div>
                    <label className="block text-[11px] text-[#ffbddc] mb-2 uppercase tracking-wider flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />{locale === "zh-TW" ? "出生时间（可选）" : locale === "zh-TW" ? "出生時間（可選）" : "Birth Time (optional)"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer transition-colors">
                        <option value="">{locale === "zh-TW" ? "时" : locale === "zh-TW" ? "時" : "Hour"}</option>
                        {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                      </select>
                      <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer transition-colors">
                        <option value="">{locale === "zh-TW" ? "分" : locale === "zh-TW" ? "分" : "Minute"}</option>
                        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Birth Place — Country / Province / City / Timezone cascade */}
                  <div>
                    <label className="block text-[11px] text-[#ffbddc] mb-2 uppercase tracking-wider flex items-center gap-1 font-bold">
                      <MapPin className="w-3 h-3" />{locale === "zh-TW" ? "出生地與時區" : locale === "zh-TW" ? "出生地與時區" : "Birth Place & Timezone"}
                    </label>
                    {/* Country / Province */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select value={country} onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer pr-8 transition-colors">
                          <option value="">{locale === "zh-TW" ? "國家 / 地區" : locale === "zh-TW" ? "國家 / 地區" : "Country / Region"}</option>
                          {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select value={province} onChange={(e) => handleProvinceChange(e.target.value)} disabled={!country}
                          className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer disabled:opacity-30 pr-8 transition-colors">
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
                            className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer pr-8 transition-colors">
                            <option value="">{locale === "zh-TW" ? "選擇城市" : "Select City"}</option>
                            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                        </div>
                      ) : (
                        <input type="text" value={cityInput} onChange={(e) => handleCitySelect(e.target.value)}
                          placeholder={locale === "zh-TW" ? "輸入出生城市" : "Enter birth city"}
                          className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#fff7ef] placeholder-[#d7cbe655] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] transition-colors" />
                      )}
                      <div className="relative">
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                          className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl px-3 py-3 text-sm text-[#ffbddc] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] appearance-none cursor-pointer pr-8 transition-colors">
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
                        <button onClick={() => setTimezone(autoDetectedTz)} className="ml-1 text-[#ff9fc8] hover:underline">
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
                  <PrivacyNotice compact className="border-[#ffb6d92e] bg-[#ff8fbd10]" />
                </div>
              </div>

              {/* Artist selection */}
              <div className="rounded-[28px] p-5 sm:p-6 border border-[#ffd1e42e] bg-gradient-to-br from-[#2a172d]/92 via-[#171425]/92 to-[#0d0d16]/95 shadow-[0_20px_70px_rgba(216,199,255,0.08)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#fff7ef] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#ff9fc8]" />
                      {locale === "zh-TW" ? `可选：限定团体 / 爱豆范围` : `Optional: Filter Idols`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#d7cbe6] mt-1">
                      {locale === "zh-TW" ? "不选择时默认从隐藏艺人库推荐；也可以只限定某个团体，让结果更有悬念。" : "Leave empty to rank the hidden artist library, or select a group for a more focused reveal."}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#ffb6d946] bg-[#ff8fbd16] px-3 py-1 text-xs font-black text-[#ffd9e9]">
                    {selectedIds.length} selected
                  </span>
                </div>
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                  {quickGroups.map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => selectGroup(group)}
                      className="shrink-0 rounded-full border border-[#ffd1e433] bg-[#fff7fb0d] px-4 py-2 text-xs font-bold text-[#ffd9e9] hover:border-[#ff9fc8] hover:bg-[#ff8fbd18] transition-colors"
                    >
                      {group}
                    </button>
                  ))}
                </div>
                {selectedIds.length > 0 && (
                  <div className="mb-4 rounded-2xl border border-[#ffb6d926] bg-[#fff7fb0d] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-black tracking-[0.12em] text-[#ffd9e9] uppercase">
                        {locale === "zh-TW" ? "已选择" : "Selected"}
                      </p>
                      <button onClick={() => setSelectedIds([])} className="text-[10px] text-[#d7cbe6] hover:text-[#ffd9e9]">
                        {locale === "zh-TW" ? "清空" : "Clear"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIds.slice(0, 12).map(id => {
                        const artist = getArtistById(id);
                        if (!artist) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => toggleArtist(id)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#ffb6d933] bg-[#ff8fbd14] px-2.5 py-1 text-[11px] font-semibold text-[#fff7ef]"
                          >
                            {getArtistDisplayName(artist, locale)}<X className="w-3 h-3 text-[#ffd1e4]" />
                          </button>
                        );
                      })}
                      {selectedIds.length > 12 && <span className="text-[11px] text-[#8a8aad]">+{selectedIds.length - 12}</span>}
                    </div>
                  </div>
                )}
                <div className="rounded-[24px] border border-[#ffd1e424] bg-[#0d0d16]/70 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ffb6d933] bg-[#ff8fbd12]">
                    <Sparkles className="w-5 h-5 text-[#ffbddc]" />
                  </div>
                  <p className="text-sm font-black text-[#fff7ef]">
                    {locale === "zh-TW" ? "艺人库已隐藏，等待生日揭晓" : "The idol library is hidden until your reveal"}
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#d7cbe688]">
                    {locale === "zh-TW"
                      ? "直接输入生日即可由系统从隐藏艺人库里抽取最适合你的追星对象。想指定范围时，再展开搜索或选择团体。"
                      : "Enter your birthday to let the system reveal your best idol matches. Expand only if you want to search or limit the pool."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowArtistLibrary((v) => !v)}
                    className="mt-4 rounded-full border border-[#ffb6d946] bg-[#ff8fbd14] px-4 py-2 text-xs font-black text-[#ffd9e9] hover:bg-[#ff8fbd22] transition-colors"
                  >
                    {showArtistLibrary
                      ? locale === "zh-TW" ? "收起艺人库" : "Hide Library"
                      : locale === "zh-TW" ? "展开搜索指定爱豆" : "Search Specific Idols"}
                  </button>
                </div>

                {showArtistLibrary && (
                  <div className="mt-4 animate-fade-in">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ffbddc]" />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={locale === "zh-TW" ? "搜索艺人姓名..." : "Search artist name..."}
                        className="w-full bg-[#fff7fb10] border border-[#ffb6d92e] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#fff7ef] placeholder-[#d7cbe655] focus:outline-none focus:border-[#ff9fc8] focus:bg-[#fff7fb16] transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                      {filteredArtists.map(a => {
                        const sel = selectedIds.includes(a.id);
                        return (
                          <button key={a.id} onClick={() => toggleArtist(a.id)}
                            className={`flex items-center gap-2 p-3 rounded-2xl text-left text-xs border transition-all ${
                              sel ? "border-[#ff9fc8] bg-[#ff8fbd18] shadow-[0_8px_24px_rgba(255,143,189,0.10)]" : "border-[#ffd1e415] bg-[#fff7fb08] hover:border-[#ffb6d950] hover:bg-[#fff7fb10]"
                            }`}>
                            <span className="text-base">{ZODIAC_EMOJIS[a.zodiacSign] || "✨"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#fff7ef] font-semibold truncate">{getArtistDisplayName(a, locale)}</p>
                              <p className="text-[9px] text-[#d7cbe688] truncate">{a.groupName}</p>
                            </div>
                            {sel && <span className="text-[#ffd9e9] text-xs font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleMatch} disabled={!birthYear || !birthMonth || !birthDay}
                className="w-full py-4 bg-gradient-to-r from-[#ff9fc8] via-[#ffd1e4] to-[#d8c7ff] text-[#211427] rounded-[22px] text-base font-black hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_20px_54px_rgba(255,143,189,0.22)]">
                <Wand2 className="w-4 h-4" />
                {locale === "zh-TW"
                  ? selectedIds.length > 0 ? `推荐所选范围内最适合追的爱豆 (${selectedIds.length} 位)` : "根据生日推荐适合追的爱豆"
                  : selectedIds.length > 0 ? `Find best matches (${selectedIds.length} idols)` : "Find idols that match your birthday"}
              </button>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative">
                <Heart className="w-16 h-16 text-[#ff9fc8] animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#f0e6d3] animate-spin" />
                </div>
              </div>
              <p className="mt-6 text-base text-[#fff7ef] font-bold">
                {locale === "zh-TW" ? "正在分析你的生日适合追哪些爱豆..." : "Finding idols that match your birthday..."}
              </p>
              <p className="mt-1 text-xs text-[#d7cbe688]">
                {locale === "zh-TW" ? "四柱五行 × 星宿关系 × 西式星盘" : "Saju × Star Mansions × Western Synastry"}
              </p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && (
            <div className="space-y-6 animate-fade-in">
              <button onClick={() => { setStep("input"); setResults([]); }}
                className="inline-flex items-center gap-1 rounded-full border border-[#ffb6d926] bg-[#ff8fbd10] px-3 py-1.5 text-xs font-bold text-[#ffd9e9] hover:border-[#ff9fc8] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {locale === "zh-TW" ? "返回重选" : "Back to selection"}
              </button>

              {results[0] && (() => {
                const top = results[0];
                const topName = artistLabel(top);
                const tag = top.matchScore >= 85 ? "soulmate" : top.matchScore >= 75 ? "deep_trust" : top.matchScore >= 65 ? "good_vibes" : "best_friends";
                const cfg = RELATION_CONFIG[tag];
                return (
                  <div className="relative overflow-hidden rounded-[32px] border border-[#ffb6d94a] bg-gradient-to-br from-[#fff0f518] via-[#2a172d]/95 to-[#0d0d16]/95 p-5 sm:p-6 shadow-[0_28px_90px_rgba(255,143,189,0.16)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd1e4] to-transparent" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#ffb6d94a] bg-[#ff8fbd18] text-4xl shadow-[0_16px_44px_rgba(255,143,189,0.14)]">
                          {ZODIAC_EMOJIS[top.zodiacSign] || "✨"}
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 rounded-full border border-[#ffd1e433] bg-[#fff7fb10] px-3 py-1.5 text-[10px] font-black text-[#ffd9e9]">
                            <Trophy className="w-3 h-3" /> {top.matchLevel || "TOP MATCH"}
                          </div>
                          <h2 className="mt-2 font-display text-3xl font-black text-[#fff7ef]">{topName}</h2>
                          <p className="text-xs sm:text-sm text-[#d7cbe6]">
                            {top.groupName} · {top.zodiacSign} · 五行{top.element}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-5xl font-black bg-gradient-to-r from-[#ff9fc8] to-[#d8c7ff] bg-clip-text text-transparent">{top.matchScore}</p>
                        <p className="text-sm font-bold text-[#ffd9e9]">{cfg?.emoji} 最推荐追星对象 · {cfg?.label}</p>
                        <button onClick={() => navigate(`/artist/${top.id}`)} className="mt-3 rounded-full border border-[#ffb6d946] bg-[#ff8fbd12] px-4 py-2 text-xs font-bold text-[#ffd9e9] hover:bg-[#ff8fbd20]">
                          {locale === "zh-TW" ? "查看爱豆档案" : "View profile"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Match rationale */}
              {results[0] && (() => {
                const top = results[0];
                const topName = artistLabel(top);
                const details = top.matchDetails;
                return (
                  <div className="rounded-[28px] border border-[#ffb6d938] bg-gradient-to-br from-[#fff0f512] via-[#1d1424]/94 to-[#0d0d16]/96 p-5 shadow-[0_22px_70px_rgba(255,143,189,0.10)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffbddc]">Match Logic</p>
                        <h3 className="mt-2 font-display text-2xl font-black text-[#fff7ef]">
                          {locale === "zh-TW" ? `为什么最推荐 ${topName}` : `Why ${topName} is your top match`}
                        </h3>
                        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#d7cbe6] sm:text-sm">
                          {locale === "zh-TW"
                            ? "本页只展示一位主推对象，避免同分名单干扰判断；候补对象会保留 2-3 位，方便你换风格参考。"
                            : "This page shows one primary idol match to keep the recommendation clear, with a few backups for comparison."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#ffb6d92e] bg-[#ff8fbd12] px-4 py-3 text-center">
                        <p className="text-[10px] font-bold text-[#ffd9e9]">{locale === "zh-TW" ? "主推分数" : "Top Score"}</p>
                        <p className="text-3xl font-black text-[#ff9fc8]">{top.matchScore}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          title: locale === "zh-TW" ? "星座同频" : "Zodiac Fit",
                          value: locale === "zh-TW" ? `分数 ${top.zodiacScore}` : `Score ${top.zodiacScore}`,
                          text: locale === "zh-TW"
                            ? `${top.zodiacSign}能量与你的生日节奏较合拍，适合带来轻松、明亮的追星感受。`
                            : `${top.zodiacSign} energy aligns well with your birthday rhythm.`,
                        },
                        {
                          title: locale === "zh-TW" ? "五行互补" : "Element Fit",
                          value: locale === "zh-TW" ? `分数 ${top.fiveElementsScore}` : `Score ${top.fiveElementsScore}`,
                          text: details
                            ? (locale === "zh-TW"
                              ? `你是${details.userDayElement}，Ta 是${details.artistDayElement}，关系为${details.elementRelation}。`
                              : `${details.userDayElement} and ${details.artistDayElement}: ${details.elementRelation}.`)
                            : (locale === "zh-TW" ? "五行结构偏向互补，适合长期关注。" : "The element profile is supportive for long-term interest."),
                        },
                        {
                          title: locale === "zh-TW" ? "星宿缘分" : "Mansion Bond",
                          value: details?.mansionRelation || top.starMansion,
                          text: details
                            ? (locale === "zh-TW"
                              ? `你的${details.userMansion}与 Ta 的${details.artistMansion}形成${details.mansionRelation}，容易产生稳定记忆点。`
                              : `${details.userMansion} and ${details.artistMansion} create a memorable bond.`)
                            : (locale === "zh-TW" ? "星宿关系适合观察长期情绪共鸣。" : "Star mansion bond supports emotional resonance."),
                        },
                      ].map((item) => (
                        <div key={item.title} className="rounded-2xl border border-[#ffd1e41f] bg-[#fff7fb0c] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black text-[#ffd9e9]">{item.title}</p>
                            <span className="rounded-full border border-[#d4a85324] bg-[#d4a85312] px-2.5 py-1 text-[10px] font-black text-[#f7d9a8]">{item.value}</span>
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-[#d7cbe6]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ===== 缘分深度解析 ===== */}
              {results.length > 0 && (() => {
                const best = results[0];
                const bestName = artistLabel(best);
                const tag = best.matchScore >= 85 ? "soulmate" : best.matchScore >= 75 ? "deep_trust" : best.matchScore >= 65 ? "good_vibes" : "best_friends";
                const cfg = RELATION_CONFIG[tag];
                const details = best.matchDetails;
                return (
                  <div className="rounded-[28px] p-5 sm:p-6 border border-[#ffb6d92e] bg-gradient-to-br from-[#fff0f512] via-[#211427]/92 to-[#0d0d16]/95">
                    <h3 className="text-base font-black text-[#fff7ef] mb-4 text-center">
                      {locale === "zh-TW" ? "✨ 你的追星适配解读" : "Destiny Depth Analysis"}
                    </h3>
                    {/* Top match */}
                    <div className="bg-[#fff7fb10] rounded-2xl p-4 mb-4 text-center border border-[#ffb6d92e]">
                      <p className="text-xs font-bold text-[#d7cbe6]">{locale === "zh-TW" ? "最适合你追的爱豆" : "Best Idol To Follow"}</p>
                      <p className="text-xl font-black text-[#ffd9e9] mt-1">{bestName}</p>
                      <p className="text-sm font-bold text-[#d8c7ff] mt-0.5">{cfg?.emoji} {cfg?.label} · 推荐指数 {best.matchScore}</p>
                    </div>
                    {/* 4-dimension analysis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon:"💫", t:locale==="zh-TW"?"生日适配度":"Birthday Fit",
                          d:best.matchScore>=70?(locale==="zh-TW"?`你的生日能量与${bestName}的星座、星宿和五行结构高度同频，适合把Ta作为长期追随、获得情绪能量的对象。`:`Your birthday energy is highly aligned with ${bestName}'s zodiac, mansion and element profile.`):(locale==="zh-TW"?`你和${bestName}有明显吸引点，但也带一点差异感，更适合阶段性关注或当作成长型追星对象。`:`There is attraction, with some growth friction.`)},
                        { icon:"🫧", t:locale==="zh-TW"?"五行互补":"Element Match",
                          d:details?locale==="zh-TW"?`你的日主「${details.userDayElement}」与${bestName}的「${details.artistDayElement}」形成${details.elementRelation}，说明Ta容易触发你的行动力、审美或安全感。`:`Your day element "${details.userDayElement}" and ${bestName}'s "${details.artistDayElement}" form ${details.elementRelation}.`:locale==="zh-TW"?`五行能量匹配分析中`:`Element match analysis in progress`},
                        { icon:"✨", t:locale==="zh-TW"?"星座与星宿":"Zodiac & Mansion",
                          d:details?locale==="zh-TW"?`你${details.userZodiac}·${details.userMansion}与${bestName}${details.artistZodiac}·${details.artistMansion}，${details.zodiacRelation}，星宿${details.mansionRelation}。`:locale==="zh-TW"?`${bestName}星座${best.zodiacSign}、星宿${best.starMansion}，与你形成独特能量共振。`:`${bestName}'s ${best.zodiacSign} zodiac and ${best.starMansion} mansion resonate with your energy.`:`${bestName} zodiac: ${best.zodiacSign}, mansion: ${best.starMansion}.`},
                        { icon:"⚠️", t:locale==="zh-TW"?"追星建议":"Fan Energy Advice",
                          d:locale==="zh-TW"?`如果推荐指数高，适合深度入坑、收藏物料或长期关注；如果五行分数偏低，则建议保持轻松欣赏，避免过度投入情绪和金钱。`:`High score means this idol is good for long-term emotional resonance; lower element scores suggest keeping it light and balanced.`},
                      ].map((dim,i) => (
                        <div key={i} className="bg-[#fff7fb0d] rounded-2xl p-3.5 border border-[#ffd1e41f]">
                          <h4 className="text-xs font-black text-[#ffbddc] mb-1.5">{dim.icon} {dim.t}</h4>
                          <p className="text-[11px] text-[#d7cbe6] leading-relaxed">{dim.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Backup picks */}
              {results.length > 1 && (
                <div className="rounded-[28px] border border-[#ffd1e424] bg-[#171421]/82 p-5">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a853]">Backup Picks</p>
                      <h3 className="mt-1 text-base font-black text-[#fff7ef]">
                        {locale === "zh-TW" ? "候补推荐" : "Backup recommendations"}
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#d7cbe688]">
                      {locale === "zh-TW" ? "仅展示 3 位" : "Top 3 only"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {results.slice(1, 4).map((r, index) => {
                  const displayName = artistLabel(r);
                  const tag = r.matchScore >= 85 ? "soulmate" : r.matchScore >= 75 ? "deep_trust" : r.matchScore >= 65 ? "good_vibes" : r.matchScore >= 55 ? "best_friends" : "tension";
                  const cfg = RELATION_CONFIG[tag];
                  const details = r.matchDetails;

                  return (
                    <div key={r.id}
                      className="rounded-[24px] border border-[#ffd1e41c] bg-gradient-to-br from-[#fff7fb10] to-[#15131f]/88 p-4 shadow-[0_14px_44px_rgba(0,0,0,0.16)] transition-all hover:border-[#ffb6d955] hover:bg-[#fff7fb14]">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ffb6d92e] bg-[#ff8fbd12] text-2xl">{ZODIAC_EMOJIS[r.zodiacSign] || "✨"}</span>
                        <div className="flex-1">
                          <p className="mb-0.5 text-[10px] font-black text-[#d4a853]">#{index + 2}</p>
                          <p className="text-sm font-black text-[#fff7ef]">{displayName}</p>
                          <p className="text-[10px] text-[#d7cbe688]">{r.groupName} · {r.zodiacSign} · 五行{r.element}</p>
                        </div>
                        <div className="text-right">
                          <span style={{ color: cfg?.color }} className="text-lg">{cfg?.emoji}</span>
                          <p className="text-xl font-black text-[#ffd9e9]">{r.matchScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#0d0d16] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all bg-gradient-to-r from-[#ff9fc8] to-[#d8c7ff]" style={{ width: `${r.matchScore}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-[#ffd9e9]">{cfg?.label}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        <span className="rounded-xl border border-[#ffd1e41c] bg-[#fff7fb0a] px-2 py-1 text-[9px] font-semibold text-[#ffd9e9]">{locale==="zh-TW"?"日主":"Day"} {details?.userDayElement||"?"}-{details?.artistDayElement||"?"}</span>
                        <span className="rounded-xl border border-[#ffd1e41c] bg-[#fff7fb0a] px-2 py-1 text-[9px] font-semibold text-[#ffd9e9]">星座 {r.zodiacSign}</span>
                        <span className="rounded-xl border border-[#ffd1e41c] bg-[#fff7fb0a] px-2 py-1 text-[9px] font-semibold text-[#ffd9e9]">五行 {r.element}</span>
                      </div>
                      <button onClick={() => navigate(`/artist/${r.id}`)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#ffd9e9] hover:text-[#ff9fc8]">
                        {locale === "zh-TW" ? "查看档案" : "View profile"} <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-[#ffb6d92e] bg-[#ff8fbd10] p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ffbddc] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#f7dfed] leading-relaxed">
                  {locale === "zh-TW"
                    ? "隐私提示：本次占卜不会上传任何出生数据。游客模式下不会录入数据；仅登录用户可选择保存报告记录。"
                    : "Privacy: this reading does not upload your birth data. Guest data is not recorded; only logged-in users may choose to save reports."}
                </p>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
