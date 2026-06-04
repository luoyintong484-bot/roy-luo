import { useState } from "react"
import { useNavigate } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { useBirthProfile, computeDerivedFields } from "@/hooks/useBirthProfile"
import { Sparkles, Star, Users, Loader2, MapPin, Clock, User, ChevronDown, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COUNTRIES, TIMEZONES, COUNTRY_DEFAULT_TZ, type Country } from "@/lib/location-data"

const YEARS = Array.from({ length: 100 }, (_, i) => 1930 + i).reverse()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
function getDays(year: number, month: number): number[] {
  if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  const maxDay = month === 2 && isLeap ? 29 : daysInMonth[month - 1]
  return Array.from({ length: maxDay }, (_, i) => i + 1)
}
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

export default function DestinySection() {
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const { profile: savedProfile, updateProfile: saveBirthProfile } = useBirthProfile()

  const [activeTab, setActiveTab] = useState<"natal" | "synastry">("natal")

  // Form — auto-filled from saved birth profile
  const [name, setName] = useState(savedProfile.name || "")
  const [gender, setGender] = useState<"male" | "female" | "">((savedProfile.gender as "male" | "female" | "") || "")
  const [country, setCountry] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [cityInput, setCityInput] = useState("")
  const [timezone, setTimezone] = useState(savedProfile.timezone || "")

  const [isLunar, setIsLunar] = useState(false)
  const [birthYear, setBirthYear] = useState(savedProfile.birthYear || "")
  const [birthMonth, setBirthMonth] = useState(savedProfile.birthMonth || "")
  const [birthDay, setBirthDay] = useState(savedProfile.birthDay || "")
  const [birthHour, setBirthHour] = useState(savedProfile.birthHour || "")
  const [birthMinute, setBirthMinute] = useState(savedProfile.birthMinute || "")
  const [birthPlace, setBirthPlace] = useState(savedProfile.birthPlace || "")

  // Partner
  const [name2, setName2] = useState("")
  const [gender2, setGender2] = useState<"male" | "female" | "">("")
  const [country2, setCountry2] = useState("")
  const [province2, setProvince2] = useState("")
  const [city2, setCity2] = useState("")
  const [cityInput2, setCityInput2] = useState("")
  const [timezone2, setTimezone2] = useState("")
  const [birthYear2, setBirthYear2] = useState("")
  const [birthMonth2, setBirthMonth2] = useState("")
  const [birthDay2, setBirthDay2] = useState("")
  const [birthHour2, setBirthHour2] = useState("")
  const [birthMinute2, setBirthMinute2] = useState("")

  const [freeCount, setFreeCount] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  const selectedCountry = COUNTRIES.find((c) => c.name === country)
  const selectedProvince = selectedCountry?.subdivisions.find((s) => s.name === province)
  const selectedCountry2 = COUNTRIES.find((c) => c.name === country2)
  const selectedProvince2 = selectedCountry2?.subdivisions.find((s) => s.name === province2)
  const days = getDays(parseInt(birthYear), parseInt(birthMonth))
  const days2 = getDays(parseInt(birthYear2), parseInt(birthMonth2))

  // Autodetect timezone from country
  const autoDetectedTz = country ? (COUNTRY_DEFAULT_TZ[country] || "") : ""
  const autoDetectedTz2 = country2 ? (COUNTRY_DEFAULT_TZ[country2] || "") : ""

  const handleCountryChange = (val: string) => {
    setCountry(val)
    setProvince("")
    setCity("")
    setCityInput("")
    // Auto-set timezone from country
    const detectedTz = COUNTRY_DEFAULT_TZ[val] || ""
    setTimezone(detectedTz)
  }

  const handleProvinceChange = (val: string) => {
    setProvince(val)
    setCity("")
    setCityInput("")
  }

  const handleCitySelect = (cityName: string) => {
    setCity(cityName)
    setCityInput(cityName)
  }

  const handleCountryChange2 = (val: string) => {
    setCountry2(val)
    setProvince2("")
    setCity2("")
    setCityInput2("")
    const detectedTz = COUNTRY_DEFAULT_TZ[val] || ""
    setTimezone2(detectedTz)
  }

  const handleProvinceChange2 = (val: string) => {
    setProvince2(val)
    setCity2("")
    setCityInput2("")
  }

  const handleCitySelect2 = (cityName: string) => {
    setCity2(cityName)
    setCityInput2(cityName)
  }

  const handleCalculate = () => {
    if (!birthYear || !birthMonth || !birthDay) return

    // Auto-save birth info to profile
    const derived = computeDerivedFields(birthYear, birthMonth, birthDay);
    saveBirthProfile({
      name, gender: gender || "",
      birthYear, birthMonth, birthDay, birthHour, birthMinute,
      birthPlace, timezone,
      baziDayPillar: derived.baziDayPillar,
      starMansion: derived.starMansion,
      zodiacSign: derived.zodiacSign,
    });

    setIsLoading(true)
    const bd = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}T00:00:00.000Z`
    const bt = birthHour !== "" && birthMinute !== "" ? `${String(birthHour).padStart(2, "0")}:${String(birthMinute).padStart(2, "0")}` : undefined

    const params: any = { birthDate: bd, birthTime: bt, name, country, province, city: city || cityInput, timezone, gender, calendar: isLunar ? "lunar" : "solar", type: activeTab }

    if (activeTab === "synastry" && birthYear2 && birthMonth2 && birthDay2) {
      const bd2 = `${birthYear2}-${String(birthMonth2).padStart(2, "0")}-${String(birthDay2).padStart(2, "0")}T00:00:00.000Z`
      const bt2 = birthHour2 !== "" && birthMinute2 !== "" ? `${String(birthHour2).padStart(2, "0")}:${String(birthMinute2).padStart(2, "0")}` : undefined
      params.birthDate2 = bd2; params.birthTime2 = bt2; params.name2 = name2; params.gender2 = gender2
      params.country2 = country2; params.province2 = province2; params.city2 = city2 || cityInput2; params.timezone2 = timezone2
    }

    // TEMP: paywall bypass — show full report for preview
    setFreeCount((c) => Math.max(0, c - 1))
    setIsLoading(false)
    navigate("/destiny-result", { state: params })
  }

  const isFormValid = birthYear && birthMonth && birthDay
  const cityOptions = selectedProvince?.cities || []

  const renderLocationFields = (
    prefix: string,
    c: string, p: string, ci: string, ci2: string, tz: string,
    selCountry: typeof selectedCountry, selProvince: typeof selectedProvince,
    autoTz: string,
    onCountry: (v: string) => void, onProvince: (v: string) => void, onCity: (v: string) => void, onTz: (v: string) => void,
  ) => {
    const cityOptions = selProvince?.cities || []
    return (
    <>
      {/* Country / Province */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{prefix}{t("destiny.country")}
          </label>
          <div className="relative">
            <select value={c} onChange={(e) => onCountry(e.target.value)}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{t("destiny.country")}</option>
              {COUNTRIES.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{prefix}{t("destiny.province")}
          </label>
          <div className="relative">
            <select value={p} onChange={(e) => onProvince(e.target.value)} disabled={!c}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer disabled:opacity-30 pr-8">
              <option value="">{c ? t("destiny.province") : t("destiny.selectCountryFirst")}</option>
              {selCountry?.subdivisions.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* City + Timezone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{prefix}{t("destiny.cityLabel")}
          </label>
          {p && cityOptions.length > 0 ? (
            <select value={ci} onChange={(e) => onCity(e.target.value)}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{t("destiny.city")}</option>
              {cityOptions.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          ) : (
            <input type="text" value={ci2} onChange={(e) => onCity(e.target.value)}
              placeholder={t("destiny.cityPlaceholder")}
              list={`city-suggestions-${prefix}`}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366] transition-colors" />
          )}
          {cityOptions.length > 0 && (
            <datalist id={`city-suggestions-${prefix}`}>
              {cityOptions.map((x) => <option key={x} value={x} />)}
            </datalist>
          )}
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />{prefix}{t("destiny.timezoneLabel")}
          </label>
          <div className="relative">
            <select value={tz} onChange={(e) => onTz(e.target.value)}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#d4a853] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{locale === "zh-TW" ? "自动检测..." : "Auto-detect..."}</option>
              {TIMEZONES.map((x) => (
                <option key={x.value} value={x.value}>
                  {locale === "zh-TW" ? x.labelZh : x.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
          {autoTz && (
            <p className="text-[9px] text-[#8a8aad44] mt-1">
              {locale === "zh-TW" ? `检测到: ${autoTz}` : `Detected: ${autoTz}`}
              {!tz && (
                <button onClick={() => onTz(autoTz)} className="ml-1 text-[#d4a853] hover:underline">
                  {locale === "zh-TW" ? "点击应用" : "Apply"}
                </button>
              )}
            </p>
          )}
        </div>
      </div>
    </>
    )
  }

  return (
    <section id="destiny" className="py-24 relative">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">{t("destiny.title")}</h2>
          <p className="mt-2 text-sm text-[#8a8aad]">{t("destiny.subtitle")}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4a85308] rounded-full border border-[#d4a85310]">
            <Sparkles className="w-3 h-3 text-[#d4a853]" />
            <span className="text-[10px] text-[#d4a853]">{t("destiny.freeRemaining").replace("{count}", String(freeCount))}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[{ key: "natal" as const, label: t("destiny.natal"), icon: Star }, { key: "synastry" as const, label: t("destiny.synastry"), icon: Users }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`group flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 border min-w-[140px] ${activeTab === tab.key ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#14142a]/60 text-[#8a8aad] border-[#d4a85315] hover:border-[#d4a85344] hover:text-[#f0e6d3]"}`}>
              <span className="flex items-center gap-1.5"><tab.icon className="w-4 h-4" />{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="max-w-xl mx-auto glass rounded-xl p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" />{t("destiny.name")}
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("destiny.namePlaceholder")}
                className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366] transition-colors" />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{t("destiny.gender")}</label>
              <div className="flex gap-3">
                <button onClick={() => setGender("male")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender === "male" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#151520] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                  {locale === "zh-TW" ? "男" : "Male"}
                </button>
                <button onClick={() => setGender("female")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender === "female" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#151520] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                  {locale === "zh-TW" ? "女" : "Female"}
                </button>
              </div>
            </div>

            {/* Cascading Location Fields */}
            {renderLocationFields(
              "", country, province, city, cityInput, timezone,
              selectedCountry, selectedProvince, autoDetectedTz,
              handleCountryChange, handleProvinceChange, handleCitySelect, setTimezone
            )}

            {/* Date of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] text-[#8a8aad] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />{t("destiny.dateOfBirth")} *
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#8a8aad]">{t("destiny.solar")}</span>
                  <button onClick={() => setIsLunar(!isLunar)} className={`relative w-9 h-5 rounded-full transition-colors ${isLunar ? "bg-[#d4a853]" : "bg-[#8a8aad33]"}`}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: isLunar ? "translateX(18px)" : "translateX(2px)" }} />
                  </button>
                  <span className="text-[10px] text-[#8a8aad]">{t("destiny.lunar")}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select value={birthYear} onChange={(e) => { setBirthYear(e.target.value); setBirthDay("") }}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthYear")}</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthDay("") }}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthMonth")}</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} disabled={!birthYear || !birthMonth}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer disabled:opacity-30 pr-8">
                    <option value="">{t("destiny.birthDay")}</option>
                    {days.map((d) => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
              </div>
              <div className="mt-1.5 text-[10px] text-[#8a8aad33]">
                {isLunar ? t("destiny.lunarHint") : t("destiny.solarHint")}
              </div>
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />{t("destiny.preciseBirthTime")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthHour")}</option>
                    {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthMinute")}</option>
                    {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Partner */}
            {activeTab === "synastry" && (
              <div className="pt-4 border-t border-[#d4a85310] space-y-4">
                <div className="text-xs text-[#d4a853] font-medium">{t("destiny.partnerInfo")}</div>
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{t("destiny.partnerName")}</label>
                  <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} placeholder={t("destiny.namePlaceholder")}
                    className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{t("destiny.partnerGender")}</label>
                  <div className="flex gap-3">
                    <button onClick={() => setGender2("male")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender2 === "male" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#151520] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                      {locale === "zh-TW" ? "男" : "Male"}
                    </button>
                    <button onClick={() => setGender2("female")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender2 === "female" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#151520] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                      {locale === "zh-TW" ? "女" : "Female"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[birthYear2, birthMonth2, birthDay2].map((_, i) => {
                    const opts = i === 0 ? YEARS : i === 1 ? MONTHS : days2
                    const lbl = i === 0 ? t("destiny.birthYear") : i === 1 ? t("destiny.birthMonth") : t("destiny.birthDay")
                    const val = i === 0 ? birthYear2 : i === 1 ? birthMonth2 : birthDay2
                    const setter = i === 0 ? setBirthYear2 : i === 1 ? setBirthMonth2 : setBirthDay2
                    return (
                      <div className="relative" key={i}>
                        <select value={val} onChange={(e) => { setter(e.target.value); if (i < 2) setBirthDay2("") }}
                          className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                          <option value="">{lbl}</option>
                          {opts.map((o: number) => <option key={o} value={o}>{i === 0 ? o : String(o).padStart(2, "0")}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select value={birthHour2} onChange={(e) => setBirthHour2(e.target.value)}
                      className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                      <option value="">{t("destiny.birthHour")}</option>
                      {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={birthMinute2} onChange={(e) => setBirthMinute2(e.target.value)}
                      className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                      <option value="">{t("destiny.birthMinute")}</option>
                      {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                  </div>
                </div>

                {/* Partner Location Fields — 1:1 mirror of self location */}
                <div className="pt-2">
                  <label className="block text-[10px] text-[#8a8aad] mb-2 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{t("destiny.partnerBirthPlace")}
                  </label>
                  {renderLocationFields(
                    "", country2, province2, city2, cityInput2, timezone2,
                    selectedCountry2, selectedProvince2, autoDetectedTz2,
                    handleCountryChange2, handleProvinceChange2, handleCitySelect2, setTimezone2
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleCalculate} disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] hover:from-[#e0b860] hover:to-[#d4a853] font-bold rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {t("destiny.start")}
            </Button>
          </div>
        </div>

        {/* Idol Compatibility Banner */}
        <div className="max-w-xl mx-auto mt-6">
          <button onClick={() => navigate("/idol-compatibility")} className="w-full glass rounded-xl p-4 border border-[#d4a85315] hover:border-[#d4a85330] transition-all text-left group flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85320] to-[#d4a85305] flex items-center justify-center border border-[#d4a85315] flex-shrink-0">
              <Heart className="w-5 h-5 text-[#d4a853]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0e6d3] group-hover:text-[#d4a853] transition-colors">{t("destiny.compatibility")}</p>
              <p className="text-[10px] text-[#8a8aad44] mt-0.5">
                {locale === "zh-TW" ? "西方星盘 · 五行缘分 · 星宿关系 — 探索你与爱豆的宇宙连接" : "Western Synastry · Five Elements · Star Mansion Relations — Explore your cosmic connection with idols"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8aad33] group-hover:text-[#d4a853] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>
    </section>
  )
}
