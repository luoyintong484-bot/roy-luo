import { useState } from "react"
import { useNavigate } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { Sparkles, Star, Users, Loader2, MapPin, Clock, User, ChevronDown, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============ Global Location Data with Cities ============
interface Country {
  name: string; nameEn: string
  subdivisions: { name: string; cities: string[] }[]
}
const COUNTRIES: Country[] = [
  { name: "中国大陆", nameEn: "China", subdivisions: [
    { name: "北京", cities: ["东城区","西城区","朝阳区","海淀区","丰台区","石景山区","通州区","大兴区"] },
    { name: "上海", cities: ["黄浦区","徐汇区","长宁区","静安区","普陀区","虹口区","杨浦区","浦东新区","闵行区"] },
    { name: "广东", cities: ["广州","深圳","珠海","东莞","佛山","中山","惠州","汕头"] },
    { name: "浙江", cities: ["杭州","宁波","温州","嘉兴","湖州","绍兴","金华","台州"] },
    { name: "江苏", cities: ["南京","苏州","无锡","常州","南通","扬州","徐州","镇江"] },
    { name: "四川", cities: ["成都","绵阳","德阳","宜宾","南充","泸州","乐山"] },
    { name: "湖北", cities: ["武汉","宜昌","襄阳","荆州","黄石","十堰"] },
    { name: "湖南", cities: ["长沙","株洲","湘潭","衡阳","岳阳","常德"] },
    { name: "山东", cities: ["济南","青岛","烟台","潍坊","临沂","淄博","威海"] },
    { name: "河南", cities: ["郑州","洛阳","开封","南阳","许昌","新乡"] },
    { name: "福建", cities: ["福州","厦门","泉州","漳州","莆田","龙岩"] },
    { name: "重庆", cities: ["渝中区","江北区","沙坪坝区","九龙坡区","南岸区","渝北区"] },
    { name: "陕西", cities: ["西安","咸阳","宝鸡","渭南","延安","汉中"] },
    { name: "辽宁", cities: ["沈阳","大连","鞍山","抚顺","锦州","营口"] },
    { name: "河北", cities: ["石家庄","唐山","保定","邯郸","廊坊","秦皇岛"] },
    { name: "台湾", cities: ["台北","新北","台中","高雄","台南","桃园"] },
    { name: "香港", cities: ["中西区","湾仔区","东区","南区","油尖旺区","深水埗区"] },
    { name: "澳门", cities: ["澳门半岛","氹仔","路环"] },
  ]},
  { name: "韩国", nameEn: "South Korea", subdivisions: [
    { name: "首尔特别市", cities: ["江南区","瑞草区","钟路区","麻浦区","龙山区","城东区","松坡区"] },
    { name: "釜山广域市", cities: ["海云台区","釜山镇区","东莱区","南区","沙下区"] },
    { name: "仁川广域市", cities: ["中区","东区","南区","延寿区","富平区"] },
    { name: "京畿道", cities: ["水原市","城南市","高阳市","富川市","安养市","龙仁市"] },
    { name: "济州道", cities: ["济州市","西归浦市"] },
  ]},
  { name: "日本", nameEn: "Japan", subdivisions: [
    { name: "东京都", cities: ["千代田区","中央区","港区","新宿区","文京区","台东区","墨田区","江东区","品川区","目黑区","大田区","世田谷区","涩谷区","中野区","杉并区","丰岛区","北区","荒川区","板桥区","练马区"] },
    { name: "大阪府", cities: ["大阪市","堺市","丰中市","吹田市","枚方市"] },
    { name: "京都府", cities: ["京都市","宇治市","亀冈市"] },
    { name: "神奈川县", cities: ["横滨市","川崎市","相模原市","横须贺市"] },
    { name: "爱知县", cities: ["名古屋市","丰田市","冈崎市","一宫市"] },
    { name: "北海道", cities: ["札幌市","函馆市","旭川市"] },
    { name: "福冈县", cities: ["福冈市","北九州市","久留米市"] },
    { name: "冲绳县", cities: ["那霸市","冲绳市","宜野湾市"] },
  ]},
  { name: "美国", nameEn: "United States", subdivisions: [
    { name: "加利福尼亚州", cities: ["洛杉矶","旧金山","圣何塞","圣地亚哥","萨克拉门托"] },
    { name: "纽约州", cities: ["纽约市","布法罗","罗切斯特","奥尔巴尼"] },
    { name: "德克萨斯州", cities: ["休斯顿","达拉斯","奥斯汀","圣安东尼奥"] },
    { name: "佛罗里达州", cities: ["迈阿密","奥兰多","坦帕","杰克逊维尔"] },
    { name: "伊利诺伊州", cities: ["芝加哥","斯普林菲尔德"] },
    { name: "华盛顿州", cities: ["西雅图","斯波坎","塔科马"] },
    { name: "马萨诸塞州", cities: ["波士顿","剑桥","伍斯特"] },
    { name: "华盛顿特区", cities: ["华盛顿"] },
  ]},
  { name: "英国", nameEn: "United Kingdom", subdivisions: [
    { name: "英格兰", cities: ["伦敦","曼彻斯特","伯明翰","利物浦","利兹","谢菲尔德","布里斯托"] },
    { name: "苏格兰", cities: ["爱丁堡","格拉斯哥","阿伯丁"] },
    { name: "威尔士", cities: ["卡迪夫","斯旺西"] },
    { name: "北爱尔兰", cities: ["贝尔法斯特","德里"] },
  ]},
  { name: "加拿大", nameEn: "Canada", subdivisions: [
    { name: "安大略省", cities: ["多伦多","渥太华","密西沙加","汉密尔顿"] },
    { name: "魁北克省", cities: ["蒙特利尔","魁北克市"] },
    { name: "不列颠哥伦比亚省", cities: ["温哥华","维多利亚","本拿比"] },
    { name: "阿尔伯塔省", cities: ["卡尔加里","埃德蒙顿"] },
  ]},
  { name: "澳大利亚", nameEn: "Australia", subdivisions: [
    { name: "新南威尔士州", cities: ["悉尼","纽卡斯尔","伍伦贡"] },
    { name: "维多利亚州", cities: ["墨尔本","吉朗","巴拉瑞特"] },
    { name: "昆士兰州", cities: ["布里斯班","黄金海岸","凯恩斯"] },
    { name: "西澳大利亚州", cities: ["珀斯","弗里曼特尔"] },
  ]},
  { name: "法国", nameEn: "France", subdivisions: [
    { name: "法兰西岛大区", cities: ["巴黎","布洛涅-比扬古","圣但尼"] },
    { name: "普罗旺斯-阿尔卑斯-蔚蓝海岸大区", cities: ["马赛","尼斯","土伦"] },
    { name: "奥弗涅-罗讷-阿尔卑斯大区", cities: ["里昂","格勒诺布尔","圣艾蒂安"] },
  ]},
  { name: "德国", nameEn: "Germany", subdivisions: [
    { name: "柏林州", cities: ["柏林"] },
    { name: "巴伐利亚州", cities: ["慕尼黑","纽伦堡","奥格斯堡"] },
    { name: "黑森州", cities: ["法兰克福","威斯巴登"] },
    { name: "北莱茵-威斯特法伦州", cities: ["科隆","杜塞尔多夫","多特蒙德"] },
  ]},
  { name: "泰国", nameEn: "Thailand", subdivisions: [
    { name: "曼谷直辖市", cities: ["巴吞旺","素坤逸","是隆","拉差达"] },
    { name: "清迈府", cities: ["清迈"] },
    { name: "普吉府", cities: ["普吉"] },
  ]},
  { name: "越南", nameEn: "Vietnam", subdivisions: [
    { name: "河内市", cities: ["巴亭郡","还剑郡","西湖郡"] },
    { name: "胡志明市", cities: ["第一郡","第二郡","第三郡","富润郡"] },
  ]},
  { name: "新加坡", nameEn: "Singapore", subdivisions: [
    { name: "新加坡", cities: ["市中心","兀兰","裕廊","淡滨尼","榜鹅"] },
  ]},
  { name: "马来西亚", nameEn: "Malaysia", subdivisions: [
    { name: "吉隆坡", cities: ["武吉免登","蕉赖","甲洞"] },
    { name: "雪兰莪州", cities: ["八打灵再也","梳邦再也","莎阿南"] },
    { name: "槟城州", cities: ["乔治市","北海"] },
  ]},
  { name: "意大利", nameEn: "Italy", subdivisions: [
    { name: "拉齐奥大区", cities: ["罗马"] },
    { name: "伦巴第大区", cities: ["米兰","贝尔加莫"] },
    { name: "托斯卡纳大区", cities: ["佛罗伦萨","比萨"] },
  ]},
  { name: "西班牙", nameEn: "Spain", subdivisions: [
    { name: "马德里自治区", cities: ["马德里"] },
    { name: "加泰罗尼亚自治区", cities: ["巴塞罗那"] },
    { name: "安达卢西亚自治区", cities: ["塞维利亚","马拉加"] },
  ]},
  { name: "其他", nameEn: "Other", subdivisions: [
    { name: "其他地区", cities: [] },
  ]},
]

// ============ Global Timezone Options (bilingual) ============
const TIMEZONES = [
  { value: "UTC-12", labelEn: "UTC-12 (Baker Island)", labelZh: "UTC-12（贝克岛）" },
  { value: "UTC-11", labelEn: "UTC-11 (American Samoa)", labelZh: "UTC-11（美属萨摩亚）" },
  { value: "UTC-10", labelEn: "UTC-10 (Hawaii)", labelZh: "UTC-10（夏威夷）" },
  { value: "UTC-9", labelEn: "UTC-9 (Alaska)", labelZh: "UTC-9（阿拉斯加）" },
  { value: "UTC-8", labelEn: "UTC-8 (Pacific Time, Los Angeles)", labelZh: "UTC-8（太平洋时间，洛杉矶）" },
  { value: "UTC-7", labelEn: "UTC-7 (Mountain Time, Denver)", labelZh: "UTC-7（山地时间，丹佛）" },
  { value: "UTC-6", labelEn: "UTC-6 (Central Time, Chicago)", labelZh: "UTC-6（中部时间，芝加哥）" },
  { value: "UTC-5", labelEn: "UTC-5 (Eastern Time, New York)", labelZh: "UTC-5（东部时间，纽约）" },
  { value: "UTC-4", labelEn: "UTC-4 (Atlantic Time)", labelZh: "UTC-4（大西洋时间）" },
  { value: "UTC-3", labelEn: "UTC-3 (Brazil, Argentina)", labelZh: "UTC-3（巴西、阿根廷）" },
  { value: "UTC-2", labelEn: "UTC-2 (South Georgia)", labelZh: "UTC-2（南乔治亚）" },
  { value: "UTC-1", labelEn: "UTC-1 (Azores)", labelZh: "UTC-1（亚速尔群岛）" },
  { value: "UTC+0", labelEn: "UTC+0 (GMT, London)", labelZh: "UTC+0（格林尼治标准时间，伦敦）" },
  { value: "UTC+1", labelEn: "UTC+1 (CET, Paris, Berlin)", labelZh: "UTC+1（中欧时间，巴黎、柏林）" },
  { value: "UTC+2", labelEn: "UTC+2 (EET, Cairo)", labelZh: "UTC+2（东欧时间，开罗）" },
  { value: "UTC+3", labelEn: "UTC+3 (Moscow, Istanbul)", labelZh: "UTC+3（莫斯科、伊斯坦布尔）" },
  { value: "UTC+4", labelEn: "UTC+4 (Dubai)", labelZh: "UTC+4（迪拜）" },
  { value: "UTC+5", labelEn: "UTC+5 (Karachi)", labelZh: "UTC+5（卡拉奇）" },
  { value: "UTC+5:30", labelEn: "UTC+5:30 (India, Mumbai)", labelZh: "UTC+5:30（印度，孟买）" },
  { value: "UTC+6", labelEn: "UTC+6 (Dhaka)", labelZh: "UTC+6（达卡）" },
  { value: "UTC+7", labelEn: "UTC+7 (Bangkok, Hanoi)", labelZh: "UTC+7（曼谷、河内）" },
  { value: "UTC+8", labelEn: "UTC+8 (Beijing, Singapore)", labelZh: "UTC+8（北京、新加坡）" },
  { value: "UTC+9", labelEn: "UTC+9 (Tokyo, Seoul)", labelZh: "UTC+9（东京、首尔）" },
  { value: "UTC+10", labelEn: "UTC+10 (Sydney)", labelZh: "UTC+10（悉尼）" },
  { value: "UTC+11", labelEn: "UTC+11 (Solomon Islands)", labelZh: "UTC+11（所罗门群岛）" },
  { value: "UTC+12", labelEn: "UTC+12 (New Zealand)", labelZh: "UTC+12（新西兰）" },
]

const COUNTRY_DEFAULT_TZ: Record<string, string> = {
  "中国大陆": "UTC+8", "韩国": "UTC+9", "日本": "UTC+9",
  "美国": "UTC-5", "英国": "UTC+0", "加拿大": "UTC-5",
  "澳大利亚": "UTC+10", "法国": "UTC+1", "德国": "UTC+1",
  "泰国": "UTC+7", "越南": "UTC+7", "新加坡": "UTC+8",
  "马来西亚": "UTC+8", "菲律宾": "UTC+8",
  "印度": "UTC+5:30", "巴西": "UTC-3", "墨西哥": "UTC-6",
  "俄罗斯": "UTC+3", "意大利": "UTC+1", "西班牙": "UTC+1",
  "土耳其": "UTC+3", "阿联酋": "UTC+4", "沙特阿拉伯": "UTC+3",
  "埃及": "UTC+2", "南非": "UTC+2", "阿根廷": "UTC-3", "新西兰": "UTC+12",
}

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

  const [activeTab, setActiveTab] = useState<"natal" | "synastry">("natal")

  // Form
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [country, setCountry] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [cityInput, setCityInput] = useState("")
  const [timezone, setTimezone] = useState("")

  const [isLunar, setIsLunar] = useState(false)
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [birthHour, setBirthHour] = useState("")
  const [birthMinute, setBirthMinute] = useState("")

  // Partner
  const [name2, setName2] = useState("")
  const [gender2, setGender2] = useState<"male" | "female" | "">("")
  const [birthYear2, setBirthYear2] = useState("")
  const [birthMonth2, setBirthMonth2] = useState("")
  const [birthDay2, setBirthDay2] = useState("")
  const [birthHour2, setBirthHour2] = useState("")
  const [birthMinute2, setBirthMinute2] = useState("")

  const [freeCount, setFreeCount] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  const selectedCountry = COUNTRIES.find((c) => c.name === country)
  const selectedProvince = selectedCountry?.subdivisions.find((s) => s.name === province)
  const days = getDays(parseInt(birthYear), parseInt(birthMonth))
  const days2 = getDays(parseInt(birthYear2), parseInt(birthMonth2))

  // Autodetect timezone from country
  const autoDetectedTz = country ? (COUNTRY_DEFAULT_TZ[country] || "") : ""

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

  const handleCalculate = () => {
    if (!birthYear || !birthMonth || !birthDay) return
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      const bd = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}T00:00:00.000Z`
      const bt = birthHour !== "" && birthMinute !== "" ? `${String(birthHour).padStart(2, "0")}:${String(birthMinute).padStart(2, "0")}` : undefined

      const params: any = { birthDate: bd, birthTime: bt, name, country, province, city: city || cityInput, timezone, gender, calendar: isLunar ? "lunar" : "solar", type: activeTab }

      if (activeTab === "synastry") {
        const bd2 = `${birthYear2}-${String(birthMonth2).padStart(2, "0")}-${String(birthDay2).padStart(2, "0")}T00:00:00.000Z`
        const bt2 = birthHour2 !== "" && birthMinute2 !== "" ? `${String(birthHour2).padStart(2, "0")}:${String(birthMinute2).padStart(2, "0")}` : undefined
        params.birthDate2 = bd2; params.birthTime2 = bt2; params.name2 = name2; params.gender2 = gender2
      }

      if (freeCount > 0) {
        setFreeCount((c) => c - 1)
        navigate("/destiny-result", { state: params })
      } else {
        navigate("/payment", { state: { type: "destiny", amount: 2.99, redirect: "/destiny-result", destinyParams: params } })
      }
    }, 500)
  }

  const isFormValid = birthYear && birthMonth && birthDay
  const cityOptions = selectedProvince?.cities || []

  const renderLocationFields = () => (
    <>
      {/* Country / Province */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{t("destiny.country")}
          </label>
          <div className="relative">
            <select value={country} onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{t("destiny.country")}</option>
              {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{t("destiny.province")}
          </label>
          <div className="relative">
            <select value={province} onChange={(e) => handleProvinceChange(e.target.value)} disabled={!country}
              className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer disabled:opacity-30 pr-8">
              <option value="">{country ? t("destiny.province") : t("destiny.selectCountryFirst")}</option>
              {selectedCountry?.subdivisions.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* City + Timezone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />{t("destiny.cityLabel")}
          </label>
          {province && cityOptions.length > 0 ? (
            <select value={city} onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{t("destiny.city")}</option>
              {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input type="text" value={cityInput} onChange={(e) => handleCitySelect(e.target.value)}
              placeholder={t("destiny.cityPlaceholder")}
              list="city-suggestions"
              className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366] transition-colors" />
          )}
          {cityOptions.length > 0 && (
            <datalist id="city-suggestions">
              {cityOptions.map((c) => <option key={c} value={c} />)}
            </datalist>
          )}
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />{t("destiny.timezoneLabel")}
          </label>
          <div className="relative">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#d4a853] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
              <option value="">{locale === "zh" ? "自动检测..." : "Auto-detect..."}</option>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {locale === "zh" ? tz.labelZh : tz.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          </div>
          {autoDetectedTz && (
            <p className="text-[9px] text-[#8a8aad44] mt-1">
              {locale === "zh" ? `检测到: ${autoDetectedTz}` : `Detected: ${autoDetectedTz}`}
              {!timezone && (
                <button onClick={() => setTimezone(autoDetectedTz)} className="ml-1 text-[#d4a853] hover:underline">
                  {locale === "zh" ? "点击应用" : "Apply"}
                </button>
              )}
            </p>
          )}
        </div>
      </div>
    </>
  )

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
                className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366] transition-colors" />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{t("destiny.gender")}</label>
              <div className="flex gap-3">
                <button onClick={() => setGender("male")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender === "male" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#0a0a0f] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                  {locale === "zh" ? "男" : "Male"}
                </button>
                <button onClick={() => setGender("female")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender === "female" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#0a0a0f] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                  {locale === "zh" ? "女" : "Female"}
                </button>
              </div>
            </div>

            {/* Cascading Location Fields */}
            {renderLocationFields()}

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
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthYear")}</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthDay("") }}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthMonth")}</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} disabled={!birthYear || !birthMonth}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer disabled:opacity-30 pr-8">
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
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                    <option value="">{t("destiny.birthHour")}</option>
                    {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
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
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{t("destiny.partnerGender")}</label>
                  <div className="flex gap-3">
                    <button onClick={() => setGender2("male")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender2 === "male" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#0a0a0f] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                      {locale === "zh" ? "男" : "Male"}
                    </button>
                    <button onClick={() => setGender2("female")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${gender2 === "female" ? "bg-[#d4a853] text-[#0a0a0f] border-[#d4a853]" : "bg-[#0a0a0f] text-[#8a8aad] border-[#d4a85322] hover:border-[#d4a85344]"}`}>
                      {locale === "zh" ? "女" : "Female"}
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
                          className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
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
                      className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                      <option value="">{t("destiny.birthHour")}</option>
                      {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={birthMinute2} onChange={(e) => setBirthMinute2(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer pr-8">
                      <option value="">{t("destiny.birthMinute")}</option>
                      {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                  </div>
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
                {locale === "zh" ? "西方星盘 · 五行缘分 · 星宿关系 — 探索你与爱豆的宇宙连接" : "Western Synastry · Five Elements · Star Mansion Relations — Explore your cosmic connection with idols"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8aad33] group-hover:text-[#d4a853] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>
    </section>
  )
}
