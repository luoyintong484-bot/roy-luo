import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { isReportPaid } from "@/lib/payment-service";
import { buildZiweiChart, type ZiweiChart } from "@/lib/ziwei-doushu";
import { buildZiweiNatalReport, type ZiweiReportSection } from "@/lib/ziwei-report-templates";
import ReportLock from "@/components/ReportLock";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";

function loadSavedChart(): ZiweiChart | null {
  try {
    const raw = localStorage.getItem("r7_ziwei_natal_report");
    return raw ? JSON.parse(raw) as ZiweiChart : null;
  } catch {
    return null;
  }
}

function fallbackChart() {
  return buildZiweiChart({
    name: "User",
    birthDate: "1995-03-15",
    birthTime: "14:30",
    calendarType: "solar",
  });
}

function parseBodyBlock(paragraph: string) {
  const match = paragraph.match(/^【([^】]+)】([\s\S]*)$/);
  if (!match) {
    return {
      title: "",
      body: paragraph,
    };
  }

  return {
    title: match[1].trim(),
    body: match[2].trim(),
  };
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
            {isZh ? "核心结论 · 先看这里" : "Section Insight"}
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
              {isZh ? "盘面依据 · 对照逻辑" : "Data Mapping"}
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

export default function DestinyFullReport({ previewUnlocked = false }: { previewUnlocked?: boolean }) {
  useI18n();
  const navigate = useNavigate();
  const isZh = true;
  const [isUnlocked, setIsUnlocked] = useState(() => previewUnlocked || isReportPaid("natal_full_report"));
  const chart = useMemo(() => loadSavedChart() || fallbackChart(), []);
  const sections = useMemo(() => buildZiweiNatalReport(chart), [chart]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/destiny");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <ErrorBoundary fallbackMessage="紫微斗數個人報告載入異常">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <button onClick={goBack} className="mb-6 flex items-center gap-1.5 text-xs text-[#8a8aad] transition-colors hover:text-[#FFB6C1]">
              <ArrowLeft className="h-4 w-4" />{isZh ? "返回上一頁" : "Back"}
            </button>

            <section className="overflow-hidden rounded-3xl border border-[#d4a85366] bg-gradient-to-b from-[#fbf6ea] via-[#f6ecd9] to-[#efe0c5] text-[#3d3328] shadow-[0_24px_80px_rgba(47,28,8,0.22)]">
              <div className="border-b border-[#d4a85340] bg-[#fffaf0]/80 px-5 py-7 text-center sm:px-7">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#FFB6C1]" />
                <div className="mx-auto mb-3 inline-flex rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  {isZh ? "東方傳統性格分析與人生規劃參考" : "Traditional personality and planning reference"}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-[0.02em] text-[#6f3f16] sm:text-4xl">
                  {isZh ? "紫微斗數個人完整解析" : "Ziwei Doushu Natal Report"}
                </h2>
                <p className="mt-3 text-[12px] uppercase tracking-[0.22em] text-[#8a6d3b]">
                  {isZh ? "命宮身宮 · 十二宮位 · 主星四化 · 大運流年" : "Life Palace · 12 Palaces · Main Stars · Transformations"}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-[#5f4630]">
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{chart.name}</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{chart.birthLabel}</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{chart.mingPalace}</span>
                  <span className="rounded-full border border-[#d4a85345] bg-[#fff4d8] px-3 py-1">{chart.elementBureau}</span>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-7">
                {!previewUnlocked && (
                  <div className="rounded-2xl border border-[#d4a85366] bg-[#fffaf0] p-4 shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a5b18]">
                          {isZh ? "免費版報告" : "Free Preview Report"}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f4630]">
                          {isZh
                            ? "已開放命格核心摘要。完整版將展開事業、財富、感情、十二宮與流年節點。"
                            : "The core life-pattern summary is free. The full report expands career, wealth, relationships, 12 palaces, and timing cycles."}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-[#d4a85355] bg-[#fff3d7] px-3 py-1 text-[11px] font-bold text-[#6f3f16]">
                        {isZh ? "排盤免費" : "Chart is free"}
                      </span>
                    </div>
                  </div>
                )}

                {sections.slice(0, 1).map((section) => (
                  <ReportSectionCard key={section.id} section={section} defaultOpen isZh={isZh} />
                ))}

                {!previewUnlocked && (
                  <div className="rounded-2xl border border-[#e8b9a966] bg-[#fff6ed] p-4 text-center shadow-[0_12px_28px_rgba(91,55,18,0.08)]">
                    <p className="text-sm font-black text-[#87445a]">
                      {isZh ? "完整版報告" : "Full Report"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b5d4e]">
                      {isZh
                        ? "完整解析屬於付費內容；目前支付通道準備中，將以「即將上線」狀態展示。"
                        : "The complete interpretation is a paid feature and is currently shown as Coming Soon while payment is being prepared."}
                    </p>
                  </div>
                )}

                <ReportLock
                  isUnlocked={isUnlocked}
                  reportType="natal"
                  reportKey="natal_full_report"
                  onUnlocked={() => setIsUnlocked(true)}
                >
                  <div className="space-y-5">
                    {sections.slice(1).map((section, index) => (
                      <ReportSectionCard
                        key={section.id}
                        section={section}
                        defaultOpen={previewUnlocked || index < 2 || section.id === "cycles"}
                        isZh={isZh}
                      />
                    ))}
                  </div>
                </ReportLock>

                <p className="rounded-2xl border border-[#d4a85355] bg-[#fffaf0]/88 p-4 text-center text-[12px] font-medium leading-relaxed text-[#6b5d4e]">
                  {isZh
                    ? "本內容為傳統文化研究參考，不構成人生決策唯一依據；重要醫療、法律、投資與人生決策請結合現實資訊與專業意見。"
                    : "This content is for traditional culture research reference and should not be the sole basis for major life decisions."}
                </p>
              </div>
            </section>
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
