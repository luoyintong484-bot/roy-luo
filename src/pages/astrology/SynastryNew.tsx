import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { BirthInputFields, DEFAULT_BIRTH_FORM, type BirthFormValue } from "@/pages/astrology/BirthChartNew";
import { createSynastryRecord, saveSynastryRecord } from "@/pages/astrology/astrology-storage";
import { resolveCityCoordinates } from "@/lib/astrology/true-solar-time";
import { ArrowLeft, HeartHandshake } from "lucide-react";

function toInput(form: BirthFormValue) {
  const coordinate = resolveCityCoordinates(form.city, form.country);
  return {
    name: form.name || "You",
    gender: form.gender,
    birthDate: form.birthDate,
    birthTime: form.birthTime,
    country: form.country,
    city: form.city,
    calendar: form.calendar,
    longitude: coordinate?.longitude,
  };
}

export default function SynastryNew() {
  const navigate = useNavigate();
  const [a, setA] = useState<BirthFormValue>({ ...DEFAULT_BIRTH_FORM, name: "You" });
  const [b, setB] = useState<BirthFormValue>({ ...DEFAULT_BIRTH_FORM, name: "Partner", birthDate: "1999-05-20", city: "首尔", country: "韩国" });

  const submit = () => {
    if (!a.birthDate || !b.birthDate) return;
    const record = createSynastryRecord(toInput(a), toInput(b));
    saveSynastryRecord(record);
    navigate(`/astrology/synastry/${record.id}/verify`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate("/astrology")} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回命理专区
        </button>
        <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-7 w-7 text-[#ffb6c1]" />
            <div>
              <h1 className="font-display text-3xl font-black text-[#f5ead7]">双人合盘</h1>
              <p className="mt-1 text-sm text-[#b8b2d8]">合盘免费，深度报告即将上线。</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <div>
              <h2 className="mb-3 text-sm font-black text-[#d4a853]">第一位资料</h2>
              <BirthInputFields value={a} onChange={setA} prefix="A · " />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-black text-[#ffb6c1]">第二位资料</h2>
              <BirthInputFields value={b} onChange={setB} prefix="B · " />
            </div>
          </div>

          <button onClick={submit} className="mt-6 w-full rounded-2xl bg-[#ffb6c1] px-5 py-4 text-base font-black text-black transition hover:brightness-110">
            生成免费合盘
          </button>
        </section>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
