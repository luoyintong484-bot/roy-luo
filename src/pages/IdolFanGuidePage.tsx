import { useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { isReportPaid } from "@/lib/payment-service";
import { buildZiweiChart, buildZiweiSynastry, type ZiweiChart, type ZiweiSynastry } from "@/lib/ziwei-doushu";
import { buildIdolFanGuide, type ZiweiReportSection, type IdolFanGuideResult } from "@/lib/ziwei-report-templates";
import { exportReportPDF } from "@/lib/pdf-export";
import ReportLock from "@/components/ReportLock";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import SearchableSelect from "@/components/SearchableSelect";
import { ALL_ARTISTS, getArtistById, getArtistDisplayName, type ArtistStatic } from "@/data/artists";
import { useBirthProfile } from "@/hooks/useBirthProfile";
import {
  ArrowLeft, ChevronDown, Sparkles, Download, Loader2, FileText, ShieldCheck, Heart, Wand2,
} from "lucide-react";

type Step = "input" | "result";

const YEARS = Array.from({ length: 76 }, (_, i) => String(1950 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i));
const MINUTES = ["00", "15", "30", "45"];

function parseBodyBlock(paragraph: string) {
  const match = paragraph.match(/^【([^】]+)】([\s\S]*)$/);
  if (!match) return { title: "", body: paragraph };
  return { title: match[1].trim(), body: match[2].trim() };
}

function ReportSectionCard({
  section,
  defaultOpen = false,
  isZh = false,
}: {
  section: ZiweiReportSection;
  defaultOpen?: boolean;
  isZh?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group relative overflow-hidden rounded-2xl border border-[#d8b87480] bg-[#fffaf0] text-[#3d3328] shadow-[0_18px_44px_rgba(91,55,18,0.12)]"
    >
      <summary className="relative flex cursor-pointer list-none items-start gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d4a85366] bg-[#fff0c9] text-xl text-[#8b5a14]">
          {section.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-0.5 w-10 rounded-full bg-[#b87a22]" />
          <h3 className="font-display text-xl font-bold tracking-[0.02em] text-[#3f2d1a] sm:text-2xl">
            {section.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#7b6b58] sm:text-sm">
            {section.subtitle}
          </p>
        </div>
        <ChevronDown className="mt-2 h-5 w-5 shrink-0 text-[#9a6b24] transition-transform duration-300 group-open:rotate-180" />
      </summary>

      <div className="space-y-5 border-t border-[#e7d7bb] px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="rounded-xl border border-[#d4a85355] bg-[#fff3d7] px-4 py-3">
          <div className="mb-2 inline-flex rounded-full border border-[#c69235]/30 bg-[#fffaf0] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a5b18]">
            {isZh ? "核心結論" : "Section Insight"}
          </div>
          <p className="text-[13px] font-semibold leading-[1.75] text-[#5a3a12] sm:text-[14px]">
            {section.highlight}
          </p>
        </div>

        <div className="space-y-4">
          {section.body.map((paragraph, index) => {
            const block = parseBodyBlock(paragraph);
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#e7d7bb] bg-[#fffdf7] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-5"
              >
                {block.title ? (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#e8b9a9] bg-[#f7e1d8] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[#87445a]">
                      {block.title}
                    </span>
                  </div>
                ) : null}
                <p className="text-[15px] font-[460] leading-[1.95] tracking-[0.01em] text-[#3d3328]">
                  {block.body}
                </p>
              </div>
            );
          })}
        </div>

        {section.bullets?.length ? (
          <div className="rounded-xl border border-[#e8b9a966] bg-[#fff6ed] p-4">
            <div className="mb-2 inline-flex rounded-full border border-[#e8b9a9] bg-[#fffaf0] px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-[#87445a]">
              {isZh ? "行動清單" : "Action Checklist"}
            </div>
            <ul className="space-y-2">
              {section.bullets.map((item) => (
                <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-[#6b5d4e]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b87a22]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export default function IdolFanGuidePage({ previewUnlocked = false }: { previewUnlocked?: boolean }) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const navigate = useNavigate();
  const { profile } = useBirthProfile();
  const [searchParams] = useSearchParams();

  const previewBypass =
    import.meta.env.DEV &&
    new URLSearchParams((window.location.hash.split("?")[1] || window.location.search)).has("preview");
  const allOpen = previewUnlocked || previewBypass;

  // ---- user birth form ----
  const [birthYear, setBirthYear] = useState(profile.birthYear || "");
  const [birthMonth, setBirthMonth] = useState(profile.birthMonth || "");
  const [birthDay, setBirthDay] = useState(profile.birthDay || "");
  const [birthHour, setBirthHour] = useState(profile.birthHour || "");
  const [birthMinute, setBirthMinute] = useState(profile.birthMinute || "00");

  const [artistId, setArtistId] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("input");
  const [guide, setGuide] = useState<IdolFanGuideResult | null>(null);
  const [userChart, setUserChart] = useState<ZiweiChart | null>(null);
  const [idolChart, setIdolChart] = useState<ZiweiChart | null>(null);
  const [artist, setArtist] = useState<ArtistStatic | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const reportKey = artistId ? `idol_guide_${artistId}` : "";
  const [isUnlocked, setIsUnlocked] = useState(false);

  const artistOptions = useMemo(
    () =>
      ALL_ARTISTS.map((a) => ({
        id: a.id,
        label: getArtistDisplayName(a, locale),
        sub: a.groupName || a.region,
        heat: 0,
      })),
    [locale],
  );

  const isValid =
    birthYear && birthMonth && birthDay && birthHour && birthMinute && artistId;

  function runGenerate(force?: { year: string; month: string; day: string; hour: string; minute: string; artistId: string }) {
    const y = force?.year ?? birthYear;
    const m = force?.month ?? birthMonth;
    const d = force?.day ?? birthDay;
    const h = force?.hour ?? birthHour;
    const min = force?.minute ?? birthMinute;
    const aid = force?.artistId ?? artistId;
    if (!y || !m || !d || !h || !min || !aid) return;
    const a = getArtistById(Number(aid));
    if (!a) return;

    const uChart = buildZiweiChart({
      name: isZh ? "你" : "You",
      birthDate: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
      birthTime: `${h.padStart(2, "0")}:${min}`,
      calendarType: "solar",
    });
    const iChart = buildZiweiChart({
      name: getArtistDisplayName(a, locale),
      birthDate: a.birthDate,
      birthTime: a.birthTime || "00:00",
      calendarType: "solar",
    });
    const syn: ZiweiSynastry = buildZiweiSynastry(uChart, iChart);
    const g = buildIdolFanGuide(uChart, iChart, syn, a);

    setUserChart(uChart);
    setIdolChart(iChart);
    setArtist(a);
    setGuide(g);
    setIsUnlocked(previewUnlocked || previewBypass || isReportPaid(`idol_guide_${aid}`));
    setStep("result");
  }

  // ---- DEV demo auto-fill (used by preview / puppeteer render) ----
  const demoParam = searchParams.get("demo");
  const autoRan = useRef(false);
  if (import.meta.env.DEV && previewBypass && demoParam && !autoRan.current && step === "input") {
    autoRan.current = true;
    const demoArtist = searchParams.get("artist") || "17"; // default: Jisoo
    // schedule after first paint
    queueMicrotask(() => {
      runGenerate({ year: "2000", month: "5", day: "20", hour: "12", minute: "00", artistId: demoArtist });
    });
  }

  const todayStr = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });

  // ======================= RENDER =======================
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <ErrorBoundary fallbackMessage="追星指引報告載入異常">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <button
              onClick={() => (step === "result" ? setStep("input") : navigate("/idol"))}
              className="mb-6 flex items-center gap-1.5 text-xs text-[#8a8aad] transition-colors hover:text-[#FFB6C1]"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === "result" ? (isZh ? "重新生成" : "Start over") : (isZh ? "返回追星首頁" : "Back to Idol")}
            </button>

            {step === "input" ? (
              /* ============ INPUT FORM ============ */
              <section className="overflow-hidden rounded-3xl border border-[#ffb6d94a] bg-gradient-to-b from-[#fff0f510] via-[#2a172d]/95 to-[#0a0a0f]/95 p-6 sm:p-8 shadow-[0_24px_80px_rgba(255,143,189,0.14)]">
                <div className="mb-1 inline-flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-[#ff9fc8]" />
                  <span className="font-display text-sm font-bold tracking-[0.15em] text-[#ffd9e9]">R7 Fortune · 追星指引</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#fff7ef] sm:text-3xl">
                  {isZh ? "追星指引 · 合盤解析與實戰提點" : "Fan Guidance Report"}
                </h2>
                <p className="mt-2 text-sm text-[#d7cbe6]">
                  {isZh
                    ? "輸入你的生日、選一位愛豆，生成專屬追星指引：簡單合盤 + 合盤深度解析 + 實戰提點（搶票／穿搭／上下半年）。"
                    : "Enter your birthday and pick an idol: simple synastry + deep compatibility + practical tips (tickets / outfit / timing)."}
                </p>

                {/* User birth */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <Field label={isZh ? "年" : "Year"}>
                    <Select value={birthYear} onChange={setBirthYear} options={YEARS} placeholder="YYYY" />
                  </Field>
                  <Field label={isZh ? "月" : "Month"}>
                    <Select value={birthMonth} onChange={setBirthMonth} options={MONTHS} placeholder="MM" />
                  </Field>
                  <Field label={isZh ? "日" : "Day"}>
                    <Select value={birthDay} onChange={setBirthDay} options={Array.from({ length: 31 }, (_, i) => String(i + 1))} placeholder="DD" />
                  </Field>
                  <Field label={isZh ? "時" : "Hour"}>
                    <Select value={birthHour} onChange={setBirthHour} options={HOURS} placeholder="HH" />
                  </Field>
                  <Field label={isZh ? "分" : "Min"}>
                    <Select value={birthMinute} onChange={setBirthMinute} options={MINUTES} placeholder="MM" />
                  </Field>
                </div>

                {/* Idol picker */}
                <div className="mt-4">
                  <Field label={isZh ? "選擇愛豆" : "Pick your idol"}>
                    <SearchableSelect
                      options={artistOptions}
                      value={artistId}
                      onChange={(id) => setArtistId(String(id))}
                      placeholder={isZh ? "搜尋愛豆 / 團體…" : "Search idol / group…"}
                      className="w-full"
                    />
                  </Field>
                </div>

                <button
                  disabled={!isValid}
                  onClick={() => runGenerate()}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#ff9fc8] via-[#ffd1e4] to-[#d8c7ff] px-6 py-4 text-[#211427] font-black shadow-[0_14px_34px_rgba(255,143,189,0.25)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isZh ? "生成我的追星指引（¥9.9 解鎖完整版）" : "Generate my Fan Guidance (¥9.9 to unlock)"}
                </button>
                <p className="mt-3 text-center text-[11px] text-[#8a8aad]">
                  {isZh
                    ? "免費預覽「緣分红毯」與「追星正源度」；付費解鎖合盤深度解析、實戰提點與行動建議。"
                    : "Free preview of Bond & Purity. Unlock deep match reading, tips & action plan."}
                </p>
              </section>
            ) : guide && artist && userChart && idolChart ? (
              /* ============ RESULT REPORT ============ */
              <>
                <div ref={reportRef}>
                  <section className="overflow-hidden rounded-3xl border border-[#d4a85366] bg-gradient-to-b from-[#fbf6ea] via-[#f6ecd9] to-[#efe0c5] text-[#3d3328] shadow-[0_24px_80px_rgba(47,28,8,0.22)]">
                    {/* Header */}
                    <div className="border-b border-[#d4a85340] bg-[#fffaf0]/80 px-5 py-7 text-center sm:px-7">
                      <div className="mx-auto mb-2 inline-flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#b87a22]" />
                        <span className="font-display text-sm font-bold tracking-[0.15em] text-[#6f3f16]">R7 Fortune</span>
                        <Sparkles className="h-5 w-5 text-[#b87a22]" />
                      </div>
                      <div className="mx-auto mb-3 inline-flex rounded-full border border-[#ff9fc855] bg-[#fff0f5] px-3 py-1 text-[11px] font-semibold text-[#c2456a]">
                        {isZh ? "健康追星 · 正向引導" : "Healthy Fandom · Positive Guidance"}
                      </div>
                      <h2 className="font-display text-2xl font-bold tracking-[0.02em] text-[#6f3f16] sm:text-4xl">
                        {isZh ? "追星指引報告" : "Fan Guidance Report"}
                      </h2>
                      <p className="mt-3 text-[12px] uppercase tracking-[0.22em] text-[#8a6d3b]">
                        {isZh ? "簡單合盤 · 追星正源度 · 合盤深度解析 · 實戰提點" : "Synastry · Purity · Deep Match · Tips"}
                      </p>
                      {/* data chips */}
                      <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-[#5f4630]">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">
                          <Heart className="h-3.5 w-3.5 text-[#c45a6a]" />
                          {getArtistDisplayName(artist, locale)}
                        </span>
                        <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">
                          {isZh ? "緣分红毯" : "Bond"} {guide.bondScore}/100
                        </span>
                        <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">
                          {isZh ? "追星正源度" : "Purity"} {guide.purityScore}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] font-medium text-[#7a5a2a]">
                        {isZh ? `正源度評級：${guide.purityLabel}` : `Purity: ${guide.purityLabel}`}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="space-y-5 p-4 sm:p-7">
                      {!previewUnlocked && (
                        <div className="rounded-2xl border border-[#d4a85366] bg-[#fffaf0] p-4 shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a5b18]">
                                {isZh ? "免費預覽" : "Free Preview"}
                              </p>
                              <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f4630]">
                                {isZh
                                  ? "已開放「緣分红毯」與「追星正源度」。解鎖後看合盤深度解析、實戰提點與行動建議。"
                                  : "Bond & Purity are free. Unlock deep compatibility, tips & action plans."}
                              </p>
                            </div>
                            <span className="inline-flex w-fit rounded-full border border-[#d4a85355] bg-[#fff3d7] px-3 py-1 text-[11px] font-bold text-[#6f3f16]">
                              ¥9.90
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Free sections (2) */}
                      {guide.sections.slice(0, 2).map((section, idx) => (
                        <ReportSectionCard key={section.id} section={section} defaultOpen={allOpen || idx === 0} isZh={isZh} />
                      ))}

                      {/* Paid section divider */}
                      {!previewUnlocked && (
                        <div className="rounded-2xl border border-[#e8b9a966] bg-[#fff6ed] p-4 text-center shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                          <p className="text-sm font-black text-[#87445a]">
                            {isZh ? "完整版追星指引" : "Full Fan Guidance"}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#6b5d4e]">
                              {isZh
                                ? "解鎖後查看 合盤深度解析 + 追星實戰提點（搶票／穿搭／上下半年）+ 行動建議 + 正能量寄語 · 30 天有效"
                                : "Unlock deep compatibility + practical tips (tickets/outfit/timing) + action plans + blessing · 30-day access"}
                          </p>
                        </div>
                      )}

                      {/* Paid sections behind ReportLock */}
                      <ReportLock
                        isUnlocked={isUnlocked}
                        reportType="idolGuide"
                        reportKey={reportKey}
                        onUnlocked={() => setIsUnlocked(true)}
                      >
                        <div className="space-y-5">
                          {guide.sections.slice(2).map((section, index) => (
                            <ReportSectionCard
                              key={section.id}
                              section={section}
                              defaultOpen={allOpen || index < 1}
                              isZh={isZh}
                            />
                          ))}
                        </div>
                      </ReportLock>

                      {/* Footer */}
                      <div className="rounded-2xl border border-[#d4a85333] bg-[#fffaf0] px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#b87a22]" />
                          <span className="text-xs font-bold tracking-[0.12em] text-[#6f3f16]">R7 FORTUNE</span>
                          <Sparkles className="h-3.5 w-3.5 text-[#b87a22]" />
                        </div>
                        <p className="text-[11px] text-[#8a6d3b]">{isZh ? "追星指引報告" : "Fan Guidance Report"}</p>
                        <p className="mt-1 text-[10px] text-[#a0926e]">
                          {isZh ? `報告生成日期：${todayStr}` : `Generated: ${todayStr}`} · 30 {isZh ? "天有效查看" : "day access"}
                        </p>
                        <p className="mt-2 text-[10px] font-medium tracking-[0.3em] text-[#b87a2266]">
                          — {isZh ? "報告完" : "END OF REPORT"} —
                        </p>
                      </div>

                      <p className="rounded-2xl border border-[#d4a85355] bg-[#fffaf0]/88 p-4 text-center text-[12px] font-medium leading-relaxed text-[#6b5d4e]">
                        {isZh
                          ? "本內容為傳統文化與命理娛樂推導，僅供情緒參考與正向引導，不構成任何現實決策的唯一依據；追星請以尊重、理性與自我成長為核心。"
                          : "This content is for traditional-culture entertainment reference and positive guidance only; it is not the sole basis for any real-life decision."}
                      </p>
                    </div>
                  </section>
                </div>

                {/* PDF Download — ONLY when unlocked */}
                {isUnlocked && (
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={async () => {
                        if (!reportRef.current || exporting) return;
                        setExporting(true);
                        try {
                          await exportReportPDF(reportRef.current, `R7_fan_guide_${artist.id}_${Date.now()}.pdf`, "#fffaf0");
                        } catch (e) {
                          console.error("PDF export failed:", e);
                        }
                        setExporting(false);
                      }}
                      disabled={exporting}
                      className="group relative w-full overflow-hidden rounded-2xl border border-[#d4a853]/50 bg-gradient-to-r from-[#fff3d7] via-[#ffe9c0] to-[#fff3d7] px-6 py-4 shadow-[0_8px_32px_rgba(212,168,83,0.2)] hover:shadow-[0_12px_40px_rgba(212,168,83,0.3)] hover:border-[#d4a853]/70 transition-all duration-300 disabled:opacity-60"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d4a85340] bg-[#fffaf0]">
                          {exporting ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin text-[#8b5a14]" />
                          ) : (
                            <Download className="h-4.5 w-4.5 text-[#8b5a14] group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold tracking-wide text-[#5a3a12]">
                            {exporting
                              ? (isZh ? "正在生成 PDF…" : "Generating PDF…")
                              : (isZh ? "下載完整 PDF 追星指引" : "Download Full PDF Report")}
                          </p>
                          <p className="text-[11px] text-[#8a6d3b]">
                            {isZh ? "含全部章節 · A4 格式 · 可離線保存" : "All sections · A4 format · offline ready"}
                          </p>
                        </div>
                        {exporting ? null : (
                          <FileText className="h-5 w-5 text-[#d4a85366] group-hover:text-[#d4a85399] transition-colors" />
                        )}
                      </div>
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8a8aad]">
                      <ShieldCheck className="h-3 w-3 text-green-500/50" />
                      <span>{isZh ? "PDF 下載功能僅對已付費解鎖的報告開放" : "PDF download is only available for unlocked reports"}</span>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

/* ---------- small form helpers ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b8a8c8]">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#d4a85322] bg-[#15121f] px-3 py-2.5 text-sm text-[#f0e6d3] focus:border-[#d4a85355] focus:outline-none"
    >
      <option value="">{placeholder || "—"}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
