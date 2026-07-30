import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import ReportLock from "@/components/ReportLock";
import { isReportPaid } from "@/lib/payment-service";
import { addReportHistory } from "@/lib/report-history";
import { WELLNESS_DISCLAIMER, getPersonalityBlueprintSections } from "@/data/wellness-content";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

function ReportBody({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => {
        const match = p.match(/^(【[^】]+】)\s*(.*)$/s);
        if (!match) {
          return (
            <p key={i} className="text-[15px] leading-[1.9] text-[#f5ead7] font-[520] tracking-[0.2px]">
              {p}
            </p>
          );
        }
        return (
          <div key={i} className="rounded-xl border border-[#5ec8b214] bg-[#0f1419]/72 p-4 shadow-[inset_3px_0_0_rgba(94,200,178,0.72)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5ec8b2]" />
              <span className="rounded-full border border-[#5ec8b226] bg-[#5ec8b212] px-3 py-1 text-[13px] font-bold leading-none text-[#a0f0dd]">
                {match[1]}
              </span>
            </div>
            <p className="text-[14px] leading-[1.85] text-[#f0e6d3]/92 font-[480] tracking-[0.15px]">
              {match[2]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function WellnessSelfDiscoveryReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isZh = (() => {
    try { const l = localStorage.getItem("r7-locale"); return l === "zh-TW"; } catch { return false; }
  })();

  const name = searchParams.get("name") || (isZh ? "訪客" : "Guest");
  const sections = getPersonalityBlueprintSections(isZh);
  const reportKey = "wellness_personality_blueprint";
  const [isUnlocked, setIsUnlocked] = useState(() => isReportPaid(reportKey));

  return (
    <div className="min-h-screen bg-[#0a0e12]">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate("/wellness/self-discovery")}
            className="flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#5ec8b2] transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isZh ? "返回" : "Back"}
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-[#f0e6d3] mb-2">
              {isZh ? `${name}的人格模式藍圖` : `${name}'s Personality Pattern Blueprint`}
            </h1>
            <p className="text-xs text-[#8a8aad]">
              {isZh ? "基於多體系人格分析的自我認知報告" : "A self-discovery report based on multi-system personality analysis"}
            </p>
          </div>

          {/* Report Content */}
          <ReportLock
            isUnlocked={isUnlocked}
            reportType="natal"
            reportKey={reportKey}
            onUnlocked={() => { setIsUnlocked(true); addReportHistory({ reportKey, reportType: "wellness" }); }}
          >
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="border-b border-[#5ec8b208] pb-6 last:border-b-0">
                  <h2 className="flex items-center gap-2 text-lg font-display font-bold text-[#f0e6d3] mb-4">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </h2>
                  <ReportBody text={section.content} />
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-[#5ec8b210]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5ec8b240] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#8a8aad44] leading-relaxed">
                  {WELLNESS_DISCLAIMER[isZh ? "zh-TW" : "en"]}
                </p>
              </div>
            </div>
          </ReportLock>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
