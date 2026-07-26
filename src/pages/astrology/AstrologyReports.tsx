import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ZiweiDoushuPanel, ZiweiSynastryPanel } from "@/components/ZiweiDoushuPanel";
import DestinyFullReport from "@/pages/DestinyFullReport";
import SynastryFullReport from "@/pages/SynastryFullReport";
import { buildZiweiNatalReport, buildZiweiSynastryReport, type ZiweiReportSection } from "@/lib/ziwei-report-templates";
import { loadBirthRecord, loadSynastryRecord } from "@/pages/astrology/astrology-storage";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";

function SectionPreview({ section }: { section: ZiweiReportSection }) {
  return (
    <details open className="rounded-2xl border border-[#d4a85322] bg-[#151520]/88 p-4">
      <summary className="list-none">
        <div className="mb-2 text-2xl">{section.icon}</div>
        <h2 className="font-display text-2xl font-black text-[#f7d9a8]">{section.title}</h2>
        <p className="mt-1 text-sm text-[#b8b2d8]">{section.subtitle}</p>
      </summary>
      <div className="mt-4 rounded-xl border border-[#d4a85320] bg-[#d4a8530d] p-3 text-sm font-semibold leading-7 text-[#ffe1a8]">
        {section.highlight}
      </div>
      <div className="mt-4 space-y-3">
        {section.body.slice(0, 3).map((paragraph, index) => (
          <p key={index} className="text-sm leading-7 text-[#f5ead7]/88">{paragraph}</p>
        ))}
      </div>
    </details>
  );
}

function MissingRecord({ type }: { type: "birth" | "synastry" }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-28 text-center">
        <p className="text-[#f5ead7]">未找到资料，请重新输入。</p>
        <Link to={type === "birth" ? "/astrology/birth-chart/new" : "/astrology/synastry/new"} className="mt-5 inline-flex rounded-full bg-[#d4a853] px-5 py-3 font-black text-black">
          重新开始
        </Link>
      </main>
    </div>
  );
}

export function BirthBasicReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = loadBirthRecord(id);
  const sections = useMemo(() => record ? buildZiweiNatalReport(record.chart) : [], [record]);
  if (!record) return <MissingRecord type="birth" />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate(`/astrology/birth-chart/${record.id}/verify`)} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回盘面校验
        </button>
        <div className="grid gap-5">
          <ZiweiDoushuPanel chart={record.chart} />
          <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1 text-xs font-bold text-emerald-200">
                  <Sparkles className="h-4 w-4" /> 免费基础报告
                </div>
                <h1 className="font-display mt-3 text-3xl font-black text-[#f5ead7]">命盘基础解析</h1>
              </div>
              <Link to={`/astrology/birth-chart/${record.id}/full-report`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4a85335] bg-[#d4a85312] px-5 py-3 font-black text-[#f7d9a8]">
                <Lock className="h-4 w-4" /> 完整版 Coming Soon
              </Link>
            </div>
            <div className="space-y-4">
              {sections.slice(0, 3).map((section) => <SectionPreview key={section.id} section={section} />)}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

export function SynastryBasicReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = loadSynastryRecord(id);
  const sections = useMemo(() => record ? buildZiweiSynastryReport(record.personA.chart, record.personB.chart, record.result) : [], [record]);
  if (!record) return <MissingRecord type="synastry" />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate(`/astrology/synastry/${record.id}/verify`)} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回合盘校验
        </button>
        <div className="grid gap-5">
          <ZiweiSynastryPanel chartA={record.personA.chart} chartB={record.personB.chart} result={record.result} />
          <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1 text-xs font-bold text-emerald-200">
                  <Sparkles className="h-4 w-4" /> 免费合盘报告
                </div>
                <h1 className="font-display mt-3 text-3xl font-black text-[#f5ead7]">关系基础解析</h1>
              </div>
              <Link to={`/astrology/synastry/${record.id}/full-report`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f3c0d035] bg-[#f3c0d010] px-5 py-3 font-black text-[#ffd9e9]">
                <Lock className="h-4 w-4" /> 完整版 Coming Soon
              </Link>
            </div>
            <div className="space-y-4">
              {sections.slice(0, 2).map((section) => <SectionPreview key={section.id} section={section} />)}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

export function BirthFullReportBridge() {
  const { id } = useParams();
  const record = loadBirthRecord(id);
  if (record) localStorage.setItem("r7_ziwei_natal_report", JSON.stringify(record.chart));
  return <DestinyFullReport previewUnlocked />;
}

export function SynastryFullReportBridge() {
  const { id } = useParams();
  const record = loadSynastryRecord(id);
  if (record) {
    localStorage.setItem("r7_ziwei_synastry_report", JSON.stringify({
      chartA: record.personA.chart,
      chartB: record.personB.chart,
      result: record.result,
    }));
  }
  return <SynastryFullReport previewUnlocked />;
}
