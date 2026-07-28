import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { isReportPaid } from "@/lib/payment-service";
import { buildZiweiChart, buildZiweiSynastry, type ZiweiChart, type ZiweiSynastry } from "@/lib/ziwei-doushu";
import { buildZiweiSynastryReport, type ZiweiReportSection } from "@/lib/ziwei-report-templates";
import { exportReportPDF } from "@/lib/pdf-export";
import ReportLock from "@/components/ReportLock";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ArrowLeft, ChevronDown, Heart, Download, Loader2, FileText, ShieldCheck, Sparkles } from "lucide-react";

type SavedSynastry = {
  chartA: ZiweiChart;
  chartB: ZiweiChart;
  result: ZiweiSynastry;
};

function fallbackSynastry(): SavedSynastry {
  const chartA = buildZiweiChart({ name: "You", birthDate: "1995-03-15", birthTime: "14:30", calendarType: "solar" });
  const chartB = buildZiweiChart({ name: "Partner", birthDate: "1996-09-18", birthTime: "09:20", calendarType: "solar" });
  return { chartA, chartB, result: buildZiweiSynastry(chartA, chartB) };
}

function loadSavedSynastry(): SavedSynastry {
  try {
    const raw = localStorage.getItem("r7_ziwei_synastry_report");
    if (!raw) return fallbackSynastry();
    const parsed = JSON.parse(raw) as SavedSynastry;
    if (!parsed.chartA || !parsed.chartB || !parsed.result) return fallbackSynastry();
    return parsed;
  } catch {
    return fallbackSynastry();
  }
}

function parseBodyBlock(paragraph: string) {
  const match = paragraph.match(/^【([^】]+)】([\s\S]*)$/);
  if (!match) {
    return { title: "", body: paragraph };
  }
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
      id={`sec-${section.id}`}
      open={defaultOpen}
      className="group relative overflow-hidden rounded-2xl border border-[#d8b87480] bg-[#fffaf0] text-[#3d3328] shadow-[0_18px_44px_rgba(91,55,18,0.12)] scroll-mt-24"
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
            {isZh ? "核心结论" : "Section Insight"}
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
      </div>
    </details>
  );
}

export default function SynastryFullReport({ previewUnlocked = false }: { previewUnlocked?: boolean }) {
  useI18n();
  const navigate = useNavigate();
  const isZh = true;
  // DEV-only preview bypass: append ?preview=1 (works with HashRouter — reads query from hash)
  const previewBypass =
    import.meta.env.DEV &&
    new URLSearchParams((window.location.hash.split("?")[1] || window.location.search)).has("preview");
  // When previewing (DEV ?preview=1 or explicit prop), expand EVERY section for the on-screen view + PDF capture
  const allOpen = previewUnlocked || previewBypass;
  const [isUnlocked, setIsUnlocked] = useState(() => previewUnlocked || previewBypass || isReportPaid("synastry_full_report"));
  const saved = useMemo(() => loadSavedSynastry(), []);
  const sections = useMemo(() => buildZiweiSynastryReport(saved.chartA, saved.chartB, saved.result), [saved]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/destiny");
  };

  const todayStr = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <ErrorBoundary fallbackMessage="紫微斗數合盤報告載入異常">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <button onClick={goBack} className="mb-6 flex items-center gap-1.5 text-xs text-[#8a8aad] transition-colors hover:text-[#FFB6C1]">
              <ArrowLeft className="h-4 w-4" />{isZh ? "返回上一頁" : "Back"}
            </button>

            {/* ===== FULL REPORT — ref wraps everything for PDF capture ===== */}
            <div ref={reportRef}>
            <section className="overflow-hidden rounded-3xl border border-[#d4a85366] bg-gradient-to-b from-[#fbf6ea] via-[#f6ecd9] to-[#efe0c5] text-[#3d3328] shadow-[0_24px_80px_rgba(47,28,8,0.22)]">
              {/* ---- Report Header ---- */}
              <div className="border-b border-[#d4a85340] bg-[#fffaf0]/80 px-5 py-7 text-center sm:px-7">
                <div className="mx-auto mb-2 inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#b87a22]" />
                  <span className="font-display text-sm font-bold tracking-[0.15em] text-[#6f3f16]">R7 Fortune</span>
                  <Sparkles className="h-5 w-5 text-[#b87a22]" />
                </div>
                <Heart className="mx-auto mb-3 h-8 w-8 text-[#c45a6a]" />
                <div className="mx-auto mb-3 inline-flex rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  {isZh ? "雙方命盤聯動分析 · 非二元合不合判定" : "Dual chart relationship analysis"}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-[0.02em] text-[#6f3f16] sm:text-4xl">
                  {isZh ? "紫微斗數雙人合盤完整解析" : "Ziwei Doushu Synastry Report"}
                </h2>
                <p className="mt-3 text-[12px] uppercase tracking-[0.22em] text-[#8a6d3b]">
                  {isZh ? "命宮對比 · 夫妻宮互照 · 四化催化 · 長期相處" : "Life Palaces · Spouse Palaces · Transformations · Long-Term Advice"}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-[#5f4630]">
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{saved.chartA.name}: {saved.chartA.mainStar}</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{saved.chartB.name}: {saved.chartB.mainStar}</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{saved.result.score}/100</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{saved.result.label}</span>
                </div>
              </div>

              {/* ---- Report Body ---- */}
              <div className="space-y-5 p-4 sm:p-7">
                {/* ===== 合盘速览 + 章节导航 ===== */}
                <div className="rounded-2xl border border-[#d4a85355] bg-[#fffaf0] p-5 shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#b87a22]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a5b18]">
                      {isZh ? "合盘速览" : "Synastry Snapshot"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { k: isZh ? "综合评分" : "Score", v: `${saved.result.score}/100` },
                      { k: isZh ? "关系标签" : "Label", v: saved.result.label },
                      { k: `${saved.chartA.name}`, v: saved.chartA.mainStar },
                      { k: `${saved.chartB.name}`, v: saved.chartB.mainStar },
                    ].map((it) => (
                      <div key={it.k} className="rounded-xl border border-[#d4a85333] bg-[#fff3d7] px-3 py-2 text-center">
                        <p className="text-[10px] text-[#8a6d3b]">{it.k}</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-[#5a3a12]">{it.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8a5b18]">
                      {isZh ? "章节导航" : "Sections"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#d4a85340] bg-[#fffaf0] px-3 py-1 text-[11px] text-[#5f4630] transition-colors hover:border-[#d4a853] hover:bg-[#fff3d7]"
                        >
                          <span>{s.icon}</span>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Free preview notice */}
                {!previewUnlocked && (
                  <div className="rounded-2xl border border-[#d4a85366] bg-[#fffaf0] p-4 shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a5b18]">
                          {isZh ? "免費版合盤報告" : "Free Synastry Preview"}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f4630]">
                          {isZh
                            ? "已開放關係總評與核心定位。完整版將展開雙方宮位互照、四化催化、風險點與長期相處建議。"
                            : "The relationship overview is free. The full report expands palace links, transformations, risk points, and long-term advice."}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-[#d4a85355] bg-[#fff3d7] px-3 py-1 text-[11px] font-bold text-[#6f3f16]">
                        {isZh ? "合盤免費" : "Chart comparison is free"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Free sections (2) */}
                {sections.slice(0, 2).map((section, idx) => (
                  <ReportSectionCard key={section.id} section={section} defaultOpen={allOpen || idx === 0} isZh={isZh} />
                ))}

                {/* Paid section divider */}
                {!previewUnlocked && (
                  <div className="rounded-2xl border border-[#e8b9a966] bg-[#fff6ed] p-4 text-center shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                    <p className="text-sm font-black text-[#87445a]">
                      {isZh ? "完整版合盤報告" : "Full Synastry Report"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b5d4e]">
                      {isZh
                        ? "解鎖後可查看完整深度合盤解析 · 30 天有效查看 · 可下載 PDF"
                        : "Unlock to view the complete synastry report · 30-day access · PDF download"}
                    </p>
                  </div>
                )}

                {/* Paid sections behind ReportLock */}
                <ReportLock
                  isUnlocked={isUnlocked}
                  reportType="synastry"
                  reportKey="synastry_full_report"
                  onUnlocked={() => setIsUnlocked(true)}
                >
                  <div className="space-y-5">
                    {sections.slice(2).map((section, index) => (
                      <ReportSectionCard
                        key={section.id}
                        section={section}
                        defaultOpen={allOpen || index < 1}
                        isZh={isZh}
                      />
                    ))}
                  </div>
                </ReportLock>

                {/* Report Footer — shows in web and PDF */}
                <div className="rounded-2xl border border-[#d4a85333] bg-[#fffaf0] px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#b87a22]" />
                    <span className="text-xs font-bold tracking-[0.12em] text-[#6f3f16]">R7 FORTUNE</span>
                    <Sparkles className="h-3.5 w-3.5 text-[#b87a22]" />
                  </div>
                  <p className="text-[11px] text-[#8a6d3b]">
                    {isZh ? "紫微斗數雙人合盤完整解析" : "Ziwei Doushu Synastry Report"}
                  </p>
                  <p className="mt-1 text-[10px] text-[#a0926e]">
                    {isZh ? `報告生成日期：${todayStr}` : `Generated: ${todayStr}`} · 30 {isZh ? "天有效查看" : "day access"}
                  </p>
                  <p className="mt-2 text-[10px] font-medium tracking-[0.3em] text-[#b87a2266]">
                    — {isZh ? "報告完" : "END OF REPORT"} —
                  </p>
                </div>

                {/* Disclaimer */}
                <p className="rounded-2xl border border-[#d4a85355] bg-[#fffaf0]/88 p-4 text-center text-[12px] font-medium leading-relaxed text-[#6b5d4e]">
                  {isZh
                    ? "本內容為傳統文化研究參考，不構成人生或感情決策唯一依據；關係仍需以現實溝通、尊重與共同選擇為核心。"
                    : "This content is for traditional culture research reference and should not be the sole basis for relationship decisions."}
                </p>
              </div>
            </section>
            </div>

            {/* ===== PDF Download — ONLY when unlocked ===== */}
            {isUnlocked && (
              <div className="mt-5 space-y-3">
                <button
                  onClick={async () => {
                    if (!reportRef.current || exporting) return;
                    setExporting(true);
                    try {
                      await exportReportPDF(
                        reportRef.current,
                        `R7_synastry_report_${Date.now()}.pdf`,
                        "#fffaf0",
                      );
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
                          : (isZh ? "下載完整 PDF 合盤報告" : "Download Full PDF Report")}
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
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
