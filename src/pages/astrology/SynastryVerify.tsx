import { useNavigate, useParams } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ZiweiSynastryPanel } from "@/components/ZiweiDoushuPanel";
import { loadSynastryRecord, saveSynastryRecord } from "@/pages/astrology/astrology-storage";
import { ArrowLeft, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

export default function SynastryVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = loadSynastryRecord(id);

  if (!record) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pt-28 text-center">
          <p className="text-[#f5ead7]">未找到合盘资料，请重新输入。</p>
          <button onClick={() => navigate("/astrology/synastry/new")} className="mt-5 rounded-full bg-[#ffb6c1] px-5 py-3 font-black text-black">重新合盘</button>
        </main>
      </div>
    );
  }

  const choose = (choice: "match" | "unsure" | "mismatch") => {
    const next = { ...record, verificationChoice: choice };
    saveSynastryRecord(next);
    if (choice === "mismatch") navigate(`/astrology/synastry/${record.id}/error`);
    else navigate(`/astrology/synastry/${record.id}/basic-report`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate("/astrology/synastry/new")} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回修改资料
        </button>
        <div className="grid gap-5">
          <ZiweiSynastryPanel chartA={record.personA.chart} chartB={record.personB.chart} result={record.result} />

          <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-7">
            <h1 className="font-display text-2xl font-black text-[#f5ead7]">合盘回溯验证</h1>
            <p className="mt-2 text-sm leading-6 text-[#b8b2d8]">
              请先确认双方资料和盘面倾向是否大致贴近现实相处感。若不符合，建议先修正出生时间或出生地。
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[record.personA, record.personB].map((person) => (
                <div key={person.id} className="rounded-2xl border border-[#d4a85318] bg-[#11111a]/78 p-4">
                  <h2 className="font-bold text-[#f7d9a8]">{person.chart.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#f5ead7]/86">{person.chart.summary}</p>
                  <p className="mt-2 text-xs text-[#8a8aad]">真太阳时：{person.trueSolar.trueSolarTime}；{person.trueSolar.trace.join("；")}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button onClick={() => choose("match")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffb6c1] px-4 py-3 font-black text-black">
                <CheckCircle2 className="h-5 w-5" /> 基本符合
              </button>
              <button onClick={() => choose("unsure")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4a85330] bg-[#151520] px-4 py-3 font-black text-[#f5ead7]">
                <HelpCircle className="h-5 w-5" /> 不确定，继续看
              </button>
              <button onClick={() => choose("mismatch")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ffb6c130] bg-[#ffb6c10d] px-4 py-3 font-black text-[#ffb6c1]">
                <XCircle className="h-5 w-5" /> 不符合
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
