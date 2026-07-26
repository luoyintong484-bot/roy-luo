import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { createBirthRecord, saveBirthRecord } from "@/pages/astrology/astrology-storage";
import { CITY_COORDINATES, resolveCityCoordinates } from "@/lib/astrology/true-solar-time";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

export type BirthFormValue = {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  country: string;
  city: string;
  calendar: "solar" | "lunar";
};

export const DEFAULT_BIRTH_FORM: BirthFormValue = {
  name: "",
  gender: "female",
  birthDate: "1998-09-17",
  birthTime: "12:00",
  country: "中国",
  city: "上海",
  calendar: "solar",
};

export function BirthInputFields({ value, onChange, prefix = "" }: { value: BirthFormValue; onChange: (value: BirthFormValue) => void; prefix?: string }) {
  const update = (key: keyof BirthFormValue, next: string) => onChange({ ...value, [key]: next });
  const coordinate = resolveCityCoordinates(value.city, value.country);

  return (
    <div className="grid gap-4 rounded-3xl border border-[#d4a8531f] bg-[#11111a]/78 p-4 sm:grid-cols-2 sm:p-5">
      <div className="sm:col-span-2">
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}昵称 / Name</label>
        <input value={value.name} onChange={(e) => update("name", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none focus:border-[#d4a85380]" placeholder="You" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}历法</label>
        <select value={value.calendar} onChange={(e) => update("calendar", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none">
          <option value="solar">公历</option>
          <option value="lunar">农历</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}性别</label>
        <select value={value.gender} onChange={(e) => update("gender", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none">
          <option value="female">女</option>
          <option value="male">男</option>
          <option value="unknown">不透露</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}出生日期</label>
        <input type="date" value={value.birthDate} onChange={(e) => update("birthDate", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}出生时间</label>
        <input type="time" value={value.birthTime} onChange={(e) => update("birthTime", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}国家 / 地区</label>
        <input value={value.country} onChange={(e) => update("country", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none" placeholder="中国" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold text-[#d4a853]">{prefix}出生城市</label>
        <input list="r7-city-options" value={value.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-2xl border border-[#d4a85324] bg-[#09090f] px-4 py-3 text-[#f5ead7] outline-none" placeholder="上海" />
        <datalist id="r7-city-options">
          {CITY_COORDINATES.map((item) => <option key={`${item.country}-${item.city}`} value={item.city} />)}
        </datalist>
      </div>
      <div className="sm:col-span-2 rounded-2xl border border-[#d4a85318] bg-[#d4a8530a] p-3 text-xs leading-6 text-[#b8b2d8]">
        <MapPin className="mr-1 inline h-3.5 w-3.5 text-[#d4a853]" />
        {coordinate
          ? `已匹配经纬度：${coordinate.city} ${coordinate.longitude.toFixed(2)}°E，用于真太阳时校准。`
          : "暂未匹配到经纬度，将使用东八区标准经度兜底，报告会提示需人工复核。"}
      </div>
    </div>
  );
}

export default function BirthChartNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<BirthFormValue>(DEFAULT_BIRTH_FORM);

  const submit = () => {
    if (!form.birthDate) return;
    const coordinate = resolveCityCoordinates(form.city, form.country);
    const record = createBirthRecord({
      name: form.name || "You",
      gender: form.gender,
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      country: form.country,
      city: form.city,
      calendar: form.calendar,
      longitude: coordinate?.longitude,
    });
    saveBirthRecord(record);
    navigate(`/astrology/birth-chart/${record.id}/verify`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6">
        <button onClick={() => navigate("/astrology")} className="mb-5 inline-flex items-center gap-2 text-sm text-[#8a8aad] hover:text-[#f3c0d0]">
          <ArrowLeft className="h-4 w-4" /> 返回命理专区
        </button>
        <section className="glass rounded-3xl border border-[#d4a85324] p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-[#d4a853]" />
            <div>
              <h1 className="font-display text-3xl font-black text-[#f5ead7]">个人命盘排盘</h1>
              <p className="mt-1 text-sm text-[#b8b2d8]">排盘免费，完整版解析即将上线。</p>
            </div>
          </div>
          <div className="mt-6">
            <BirthInputFields value={form} onChange={setForm} />
          </div>
          <button onClick={submit} className="mt-6 w-full rounded-2xl bg-[#d4a853] px-5 py-4 text-base font-black text-black transition hover:brightness-110">
            生成免费命盘
          </button>
        </section>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
