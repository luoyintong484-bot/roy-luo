import { useNavigate, useParams } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ZiweiDoushuPanel } from "@/components/ZiweiDoushuPanel";
import { loadBirthRecord, saveBirthRecord } from "@/pages/astrology/astrology-storage";
import { ArrowLeft, CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";

export default function BirthChartVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = loadBirthRecord(id);

  if (!record) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pt-28 text-center">
          <p className="text-[#f5ead7]">未找到排盘资料，请重新输入。</p>
          <button onClick={() => navigate("/astrology/birth-chart/new")} className="mt-5 rounded-full bg-[#d4a853] px-5 py-3 font-black text-black">重新排盘</button>
        </main>
      </div>
    );
  }

  const choose = (choice: "match" | "unsure" | "mismatch") => {
    const next = { ...record, verificationChoice: choice };
    saveBirthRecord(next);
    if (choice === "mismatch") navigate(`/astrology/birth-chart/${record.id}/error`);
    else navigate(`/astrology/birth-chart/${record.id}/basic-report`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate("/astrology/birth-chart/new")} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回修改资料
        </button>
        <div className="grid gap-5">
          <ZiweiDoushuPanel chart={record.chart} />

          <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-7">
            <h1 className="font-display text-2xl font-black text-[#f5ead7]">排盘回溯验证</h1>
            <p className="mt-2 text-sm leading-6 text-[#b8b2d8]">
              为了降低出生时间、出生地误差，请先看下面三条是否大致贴近你。符合或不确定都可以继续看免费报告；不符合则建议返回修正资料。
            </p>

            <div className="mt-5 grid gap-3">
              {record.verification.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#d4a85318] bg-[#11111a]/78 p-4">
                  <h2 className="font-bold text-[#f7d9a8]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#f5ead7]/86">{item.description}</p>
                  <p className="mt-2 text-xs text-[#8a8aad]">依据：{item.dataPoint}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button onClick={() => choose("match")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4a853] px-4 py-3 font-black text-black">
                <CheckCircle2 className="h-5 w-5" /> 基本符合
              </button>
              <button onClick={() => choose("unsure")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4a85330] bg-[#151520] px-4 py-3 font-black text-[#f5ead7]">
                <HelpCircle className="h-5 w-5" /> 不确定，继续看
              </button>
              <button onClick={() => choose("mismatch")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ffb6c130] bg-[#ffb6c10d] px-4 py-3 font-black text-[#ffb6c1]">
                <XCircle className="h-5 w-5" /> 不符合
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d4a85318] bg-[#0f0f19]/70 p-4 text-xs leading-6 text-[#8a8aad]">
              <RotateCcw className="mr-1 inline h-3.5 w-3.5 text-[#d4a853]" />
              真太阳时追溯：{record.trueSolar.trace.join("；")}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
