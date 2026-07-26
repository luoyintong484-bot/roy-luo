import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Lock } from "lucide-react";
import { WELLNESS_FORM } from "@/data/wellness-content";

/**
 * Wellness Self-Discovery Form
 * Psychology-framed version of DestinySection's natal chart input.
 * Collects birth info to generate a Personality Pattern Blueprint report.
 */

const COUNTRIES = [
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman",
  "United States", "United Kingdom", "Canada", "Australia",
  "China", "Japan", "South Korea", "India", "Singapore", "Malaysia",
  "Germany", "France", "Italy", "Spain", "Netherlands",
];

export default function WellnessSelfDiscovery() {
  const navigate = useNavigate();

  const locale = (() => {
    try {
      const stored = localStorage.getItem("r7-locale");
      if (stored === "zh-TW") return "zh-TW";
    } catch {}
    return "en";
  })();

  const f = WELLNESS_FORM[locale] || WELLNESS_FORM["en"];
  const isZh = locale === "zh-TW";

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("12");
  const [birthMinute, setBirthMinute] = useState("00");
  const [isSolar, setIsSolar] = useState(true);
  const [gender, setGender] = useState("");

  const handleSubmit = () => {
    if (!country) return;
    const params = new URLSearchParams({
      name: name || "Guest",
      country,
      province,
      city,
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthHour,
      minute: birthMinute,
      solar: isSolar ? "1" : "0",
      gender,
    });
    navigate(`/wellness/self-discovery/report?${params.toString()}`);
  };

  const isValid = country && birthYear && birthMonth && birthDay;

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-[#0a0e12]">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5ec8b215] bg-[#5ec8b206] mb-4">
            <Sparkles className="w-3 h-3 text-[#5ec8b2]" />
            <span className="text-[10px] font-medium text-[#5ec8b2] tracking-[0.12em] uppercase">
              {f.title}
            </span>
          </div>
          <p className="text-sm text-[#8a8aad] max-w-sm mx-auto">{f.subtitle}</p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-[#5ec8b210] space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={f.namePlaceholder}
              className="w-full h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240] transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.gender}</label>
            <div className="flex gap-2">
              {[
                { v: "male", l: isZh ? "男" : "Male" },
                { v: "female", l: isZh ? "女" : "Female" },
                { v: "other", l: isZh ? "其他" : "Other" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setGender(opt.v)}
                  className={`flex-1 h-10 rounded-lg text-xs font-medium transition-all border ${
                    gender === opt.v
                      ? "border-[#5ec8b2] bg-[#5ec8b210] text-[#5ec8b2]"
                      : "border-[#5ec8b210] text-[#8a8aad] hover:border-[#5ec8b230]"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.country}</label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setProvince(""); }}
              className="w-full h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#5ec8b240] transition-colors"
            >
              <option value="">{f.selectCountryFirst}</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Province */}
          {country && (
            <div>
              <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.province}</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240] transition-colors"
              />
            </div>
          )}

          {/* City */}
          {country && (
            <div>
              <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.cityLabel}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={f.cityPlaceholder}
                className="w-full h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240] transition-colors"
              />
            </div>
          )}

          {/* Calendar Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.calendarType}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSolar(true)}
                className={`flex-1 h-10 rounded-lg text-xs font-medium transition-all border ${
                  isSolar ? "border-[#5ec8b2] bg-[#5ec8b210] text-[#5ec8b2]" : "border-[#5ec8b210] text-[#8a8aad]"
                }`}
              >
                {f.solar}
              </button>
              <button
                onClick={() => setIsSolar(false)}
                className={`flex-1 h-10 rounded-lg text-xs font-medium transition-all border ${
                  !isSolar ? "border-[#5ec8b2] bg-[#5ec8b210] text-[#5ec8b2]" : "border-[#5ec8b210] text-[#8a8aad]"
                }`}
              >
                {f.lunar}
              </button>
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.birthDate}</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number" min="1900" max="2026" placeholder="YYYY"
                value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                className="h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240]"
              />
              <input
                type="number" min="1" max="12" placeholder="MM"
                value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                className="h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240]"
              />
              <input
                type="number" min="1" max="31" placeholder="DD"
                value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
                className="h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#5ec8b240]"
              />
            </div>
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-xs font-medium text-[#8a8aad] mb-1.5">{f.birthTime}</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={birthHour}
                onChange={(e) => setBirthHour(e.target.value)}
                className="h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#5ec8b240]"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}{isZh ? "時" : "h"}</option>
                ))}
              </select>
              <select
                value={birthMinute}
                onChange={(e) => setBirthMinute(e.target.value)}
                className="h-10 bg-[#0a0e12] border border-[#5ec8b215] rounded-lg px-3 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#5ec8b240]"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={String(m).padStart(2, "0")}>{String(m).padStart(2, "0")}{isZh ? "分" : "m"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#5ec8b2] to-[#3da892] text-[#0a0e12] text-sm font-bold hover:from-[#6edcc6] hover:to-[#4dbaa2] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-6"
          >
            <Sparkles className="w-4 h-4" />
            {f.start}
          </button>

          {/* Privacy */}
          <div className="flex items-center gap-1.5 justify-center pt-1">
            <Lock className="w-3 h-3 text-[#8a8aad44]" />
            <p className="text-[10px] text-[#8a8aad44]">{f.privacyNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
