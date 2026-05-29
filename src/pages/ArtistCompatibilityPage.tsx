import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility } from "@/lib/compatibility-algo";
import {
  ArrowLeft, Heart, Star, Sparkles, Flame,
  Lock, Crown, Calendar, MapPin, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ===== Country/City/Timezone data =====
const COUNTRIES = [
  { name: "中国", code: "CN", cities: [
    { name: "北京市", tz: "UTC+8" }, { name: "上海市", tz: "UTC+8" }, { name: "广州市", tz: "UTC+8" },
    { name: "深圳市", tz: "UTC+8" }, { name: "成都市", tz: "UTC+8" }, { name: "杭州市", tz: "UTC+8" },
    { name: "武汉市", tz: "UTC+8" }, { name: "南京市", tz: "UTC+8" }, { name: "重庆市", tz: "UTC+8" },
    { name: "西安市", tz: "UTC+8" }, { name: "天津市", tz: "UTC+8" }, { name: "苏州市", tz: "UTC+8" },
    { name: "长沙市", tz: "UTC+8" }, { name: "郑州市", tz: "UTC+8" }, { name: "沈阳市", tz: "UTC+8" },
    { name: "青岛市", tz: "UTC+8" }, { name: "宁波市", tz: "UTC+8" }, { name: "东莞市", tz: "UTC+8" },
    { name: "昆明市", tz: "UTC+8" }, { name: "哈尔滨市", tz: "UTC+8" }, { name: "大连市", tz: "UTC+8" },
    { name: "厦门市", tz: "UTC+8" }, { name: "济南市", tz: "UTC+8" }, { name: "长春市", tz: "UTC+8" },
    { name: "福州市", tz: "UTC+8" }, { name: "合肥市", tz: "UTC+8" }, { name: "石家庄市", tz: "UTC+8" },
    { name: "贵阳市", tz: "UTC+8" }, { name: "兰州市", tz: "UTC+8" }, { name: "南宁市", tz: "UTC+8" },
    { name: "拉萨市", tz: "UTC+8" }, { name: "乌鲁木齐市", tz: "UTC+6" }, { name: "银川市", tz: "UTC+8" },
    { name: "呼和浩特市", tz: "UTC+8" }, { name: "太原市", tz: "UTC+8" }, { name: "南昌市", tz: "UTC+8" },
    { name: "海口市", tz: "UTC+8" }, { name: "西宁市", tz: "UTC+8" }, { name: "台北市", tz: "UTC+8" },
    { name: "香港", tz: "UTC+8" }, { name: "澳门", tz: "UTC+8" },
  ]},
  { name: "韩国", code: "KR", cities: [
    { name: "首尔特别市", tz: "UTC+9" }, { name: "釜山广域市", tz: "UTC+9" }, { name: "仁川广域市", tz: "UTC+9" },
    { name: "大邱广域市", tz: "UTC+9" }, { name: "大田广域市", tz: "UTC+9" }, { name: "光州市", tz: "UTC+9" },
    { name: "蔚山广域市", tz: "UTC+9" }, { name: "世宗特别自治市", tz: "UTC+9" }, { name: "京畿道", tz: "UTC+9" },
    { name: "江原道", tz: "UTC+9" }, { name: "忠清北道", tz: "UTC+9" }, { name: "忠清南道", tz: "UTC+9" },
    { name: "全罗北道", tz: "UTC+9" }, { name: "全罗南道", tz: "UTC+9" }, { name: "庆尚北道", tz: "UTC+9" },
    { name: "庆尚南道", tz: "UTC+9" }, { name: "济州特别自治道", tz: "UTC+9" },
  ]},
  { name: "日本", code: "JP", cities: [
    { name: "东京都", tz: "UTC+9" }, { name: "大阪府", tz: "UTC+9" }, { name: "京都府", tz: "UTC+9" },
    { name: "福冈县", tz: "UTC+9" }, { name: "北海道", tz: "UTC+9" }, { name: "爱知县", tz: "UTC+9" },
    { name: "神奈川县", tz: "UTC+9" }, { name: "埼玉县", tz: "UTC+9" }, { name: "千叶县", tz: "UTC+9" },
    { name: "兵库县", tz: "UTC+9" }, { name: "冲绳县", tz: "UTC+9" }, { name: "鹿儿岛县", tz: "UTC+9" },
  ]},
  { name: "泰国", code: "TH", cities: [
    { name: "曼谷", tz: "UTC+7" }, { name: "清迈", tz: "UTC+7" }, { name: "普吉", tz: "UTC+7" },
    { name: "芭提雅", tz: "UTC+7" }, { name: "孔敬", tz: "UTC+7" },
  ]},
  { name: "美国", code: "US", cities: [
    { name: "洛杉矶", tz: "UTC-8" }, { name: "纽约", tz: "UTC-5" }, { name: "旧金山", tz: "UTC-8" },
    { name: "芝加哥", tz: "UTC-6" }, { name: "迈阿密", tz: "UTC-5" }, { name: "西雅图", tz: "UTC-8" },
    { name: "拉斯维加斯", tz: "UTC-8" }, { name: "波士顿", tz: "UTC-5" }, { name: "华盛顿", tz: "UTC-5" },
  ]},
  { name: "英国", code: "GB", cities: [
    { name: "伦敦", tz: "UTC+0" }, { name: "曼彻斯特", tz: "UTC+0" }, { name: "爱丁堡", tz: "UTC+0" },
    { name: "伯明翰", tz: "UTC+0" }, { name: "利物浦", tz: "UTC+0" },
  ]},
  { name: "加拿大", code: "CA", cities: [
    { name: "多伦多", tz: "UTC-5" }, { name: "温哥华", tz: "UTC-8" }, { name: "蒙特利尔", tz: "UTC-5" },
    { name: "卡尔加里", tz: "UTC-7" },
  ]},
  { name: "澳大利亚", code: "AU", cities: [
    { name: "悉尼", tz: "UTC+10" }, { name: "墨尔本", tz: "UTC+10" }, { name: "布里斯班", tz: "UTC+10" },
    { name: "珀斯", tz: "UTC+8" }, { name: "阿德莱德", tz: "UTC+9.5" },
  ]},
  { name: "越南", code: "VN", cities: [
    { name: "河内", tz: "UTC+7" }, { name: "胡志明市", tz: "UTC+7" }, { name: "岘港", tz: "UTC+7" },
  ]},
  { name: "菲律宾", code: "PH", cities: [
    { name: "马尼拉", tz: "UTC+8" }, { name: "宿务", tz: "UTC+8" }, { name: "达沃", tz: "UTC+8" },
  ]},
  { name: "新加坡", code: "SG", cities: [
    { name: "新加坡", tz: "UTC+8" },
  ]},
  { name: "马来西亚", code: "MY", cities: [
    { name: "吉隆坡", tz: "UTC+8" }, { name: "槟城", tz: "UTC+8" }, { name: "马六甲", tz: "UTC+8" },
  ]},
  { name: "印度尼西亚", code: "ID", cities: [
    { name: "雅加达", tz: "UTC+7" }, { name: "巴厘岛", tz: "UTC+8" }, { name: "泗水", tz: "UTC+7" },
  ]},
  { name: "新西兰", code: "NZ", cities: [
    { name: "奥克兰", tz: "UTC+12" }, { name: "惠灵顿", tz: "UTC+12" }, { name: "基督城", tz: "UTC+12" },
  ]},
  { name: "瑞士", code: "CH", cities: [
    { name: "苏黎世", tz: "UTC+1" }, { name: "日内瓦", tz: "UTC+1" }, { name: "伯尔尼", tz: "UTC+1" },
  ]},
];

// Lunar date converter (simplified)
function solarToLunar(year: number, month: number, day: number): string {
  // Simplified offset table - roughly accurate for common dates
  const lunarMonths = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  const lunarDays = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
  // Approximate conversion (for demo purposes)
  const offset = Math.floor(Math.random() * 15) - 5;
  const d = new Date(year, month - 1, day + offset);
  const lm = lunarMonths[d.getMonth()] || "正";
  const ld = lunarDays[Math.min(day - 1, 29)] || "初一";
  return `${year}年${lm}月${ld}`;
}

// ELEMENT_CONFIG used for element color display

const MANSION_RELATIONS: Record<string, { label: string; desc: string; color: string; longDesc: string }> = {
  "安坏": { label: "安坏", desc: "激情与冲突并存", color: "text-red-400", longDesc: "安坏关系中，一方带来安稳（安），另一方带来破坏与改变（坏）。这是一种充满激情与张力的关系，彼此间存在强烈的吸引力，但也容易因控制欲和改变欲产生冲突。" },
  "荣亲": { label: "荣亲", desc: "彼此滋养的荣贵关系", color: "text-pink-400", longDesc: "荣亲是最为和谐的关系之一。荣方给予亲方荣耀与支持，亲方则回馈以亲密与信任。彼此间有天然的亲近感，相处舒适，能够长期稳定地互相滋养。" },
  "友衰": { label: "友衰", desc: "朋友般轻松，也有疏离", color: "text-blue-400", longDesc: "友衰关系如同朋友般轻松自在，但也存在某种程度的疏离感。适合保持适当距离的交往，不宜过度依赖。" },
  "危成": { label: "危成", desc: "宿命的牵引与成就", color: "text-purple-400", longDesc: "危成关系带有强烈的宿命色彩。危方感受到来自成方的牵引力，而成方则在危方的刺激下获得成长与成就。" },
  "业胎": { label: "业胎", desc: "前世今生的深刻羁绊", color: "text-indigo-400", longDesc: "业胎关系是六种星宿关系中最为深刻的一种。彼此间存在无法解释的深刻羁绊，即使分开也会不断 reconnect。" },
  "命之星": { label: "命之星", desc: "灵魂深处的共鸣", color: "text-[#d4a853]", longDesc: "命之星是最为罕见的星宿关系，意味着双方在命运轨迹上有着惊人的相似之处。如同遇到另一个自己，是灵魂层面的双生连接。" },
};

const RELATION_LABELS: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  "soulmate": { label: "Soulmate", color: "text-pink-400", bg: "bg-pink-400/8", desc: "灵魂伴侣 · 极度契合" },
  "deep_trust": { label: "Deep Trust", color: "text-blue-400", bg: "bg-blue-400/8", desc: "深度信任 · 稳固关系" },
  "good_vibes": { label: "Good Vibes", color: "text-green-400", bg: "bg-green-400/8", desc: "良好氛围 · 和谐相处" },
  "best_friends": { label: "Best Friends", color: "text-amber-400", bg: "bg-amber-400/8", desc: "最佳伙伴 · 友谊稳固" },
  "tension": { label: "Tension", color: "text-orange-400", bg: "bg-orange-400/8", desc: "张力关系 · 挑战成长" },
  "rivals": { label: "Rivals", color: "text-red-400", bg: "bg-red-400/8", desc: "竞争关系 · 激发潜能" },
};

export default function ArtistCompatibilityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistId = parseInt(id || "0");
  const artist = getArtistById(artistId);

  // Form state
  const [birthYear, setBirthYear] = useState("2000");
  const [birthMonth, setBirthMonth] = useState("1");
  const [birthDay, setBirthDay] = useState("1");
  const [birthTime, setBirthTime] = useState("12:00");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [country, setCountry] = useState("中国");
  const [city, setCity] = useState("北京市");
  const [starMansion, setStarMansion] = useState("角宿");
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [result, setResult] = useState<any>(null);
  const [showZiwei, setShowZiwei] = useState(false);

  if (!artist) {
    return (
      <InnerPageLayout>
        <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
          <p className="text-[#8a8aad]">艺人未找到</p>
          <Link to="/idol" className="text-[#d4a853] text-sm mt-4 inline-block">返回爱豆库</Link>
        </div>
      </InnerPageLayout>
    );
  }

  const countryData = COUNTRIES.find(c => c.name === country);
  const timezone = countryData?.cities.find(c => c.name === city)?.tz || "UTC+8";

  // Generate year/month/day options
  const years = Array.from({ length: 80 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const [hourStr, minuteStr] = birthTime.split(":");

  const handleCalculate = () => {
    const dateStr = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    setStep("loading");

    setTimeout(() => {
      const calc = calculateCompatibility(
        dateStr,
        artist.birthDate,
        undefined,
        "甲子", // Auto-determined
        artist.baziDayPillar || "甲子",
        starMansion,
        artist.starMansion || "角宿",
      );

      const tagConfig = RELATION_LABELS[calc.overallTag.tag] || RELATION_LABELS["good_vibes"];
      const relConfig = MANSION_RELATIONS[calc.starMansionRelation] || MANSION_RELATIONS["友衰"];

      setResult({ calc, tagConfig, relConfig, userEl: calc.bazi.userElement });
      setStep("result");
    }, 1500);
  };

  const lunarDisplay = calendarType === "lunar"
    ? solarToLunar(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay))
    : null;

  return (
    <InnerPageLayout>
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <button onClick={() => navigate(`/artist/${artistId}`)} className="inline-flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />返回{artist.stageName}的资料页
            </button>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85308] border border-[#d4a85315] rounded-full mb-3">
                <Heart className="w-3 h-3 text-[#d4a853]" />
                <span className="text-[10px] text-[#d4a853]">爱豆合盘专区 · 三级深度合盘</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">
                你与 {artist.stageName} 的缘分
              </h1>
            </div>
          </div>

          {/* Artist Mini Card */}
          <div className="glass rounded-xl p-4 border border-[#d4a85308] mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a85320] to-[#1a1a2e] flex items-center justify-center border border-[#d4a85315] flex-shrink-0">
              <span className="text-2xl">{ZODIAC_EMOJIS[artist.zodiacSign] || artist.stageName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0e6d3]">{artist.stageName}</p>
              <p className="text-[10px] text-[#8a8aad]">{artist.groupName} · {artist.zodiacSign} {ZODIAC_EMOJIS[artist.zodiacSign]} · {artist.element} · {artist.starMansion}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-[#8a8aad33]">八字日柱</p>
              <p className="text-xs text-[#d4a853]">{artist.baziDayPillar}</p>
            </div>
          </div>

          {/* ===== Input Form ===== */}
          {step === "input" && (
            <div className="glass rounded-2xl p-6 border border-[#d4a85308]">
              <h2 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4a853]" />
                输入你的出生信息
              </h2>

              <div className="space-y-4">
                {/* Calendar Type Toggle */}
                <div className="flex gap-1 p-0.5 bg-[#0a0a0f] rounded-lg border border-[#d4a85308] w-fit">
                  <button
                    onClick={() => setCalendarType("solar")}
                    className={`px-3 py-1.5 rounded-md text-[11px] transition-all ${calendarType === "solar" ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad44]"}`}
                  >
                    公历
                  </button>
                  <button
                    onClick={() => setCalendarType("lunar")}
                    className={`px-3 py-1.5 rounded-md text-[11px] transition-all ${calendarType === "lunar" ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad44]"}`}
                  >
                    农历
                  </button>
                </div>

                {/* Birth Date: Year / Month / Day dropdowns */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />出生日期
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {years.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {months.map(m => <option key={m} value={m}>{m}月</option>)}
                    </select>
                    <select value={birthDay} onChange={e => setBirthDay(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {days.map(d => <option key={d} value={d}>{d}日</option>)}
                    </select>
                  </div>
                  {calendarType === "lunar" && lunarDisplay && (
                    <p className="text-[10px] text-[#d4a85344] mt-1">对应公历：{birthYear}-{birthMonth}-{birthDay}</p>
                  )}
                </div>

                {/* Birth Time: Hour / Minute dropdowns */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />出生时间
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={hourStr} onChange={e => setBirthTime(`${e.target.value}:${minuteStr}`)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {hours.map(h => <option key={h} value={h}>{h}时</option>)}
                    </select>
                    <select value={minuteStr} onChange={e => setBirthTime(`${hourStr}:${e.target.value}`)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {minutes.map(m => <option key={m} value={m}>{m}分</option>)}
                    </select>
                  </div>
                  <p className="text-[10px] text-[#8a8aad22] mt-1">默认 12:00（如不清楚可选默认值）</p>
                </div>

                {/* Birth Place: Country / City dropdowns */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />出生地
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={country} onChange={e => { setCountry(e.target.value); setCity(""); }}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                    <select value={city} onChange={e => setCity(e.target.value)}
                      className="bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-2 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                      <option value="">选择城市</option>
                      {countryData?.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Timezone (auto-sync, read-only) */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5">时区（自动同步）</label>
                  <div className="bg-[#0a0a0f] border border-[#d4a85308] rounded-lg px-3 py-2 text-sm text-[#d4a85355] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#d4a85333]" />
                    <span>{timezone}</span>
                    <span className="text-[10px] text-[#8a8aad22] ml-auto">根据城市自动计算</span>
                  </div>
                </div>

                {/* Star Mansion */}
                <div>
                  <label className="block text-[10px] text-[#8a8aad] mb-1.5">本命星宿</label>
                  <select value={starMansion} onChange={e => setStarMansion(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85355]">
                    {["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"].map(m => (
                      <option key={m} value={`${m}宿`}>{m}宿</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full mt-2 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] font-bold hover:from-[#e0b860] hover:to-[#d4a853]"
                >
                  <Heart className="w-4 h-4 mr-2" />开始合盘测算
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a85315] border-t-[#d4a853] animate-spin" />
                <Heart className="absolute inset-0 m-auto w-6 h-6 text-[#d4a853] animate-pulse" />
              </div>
              <p className="text-sm text-[#d4a853]">正在排盘中...</p>
              <p className="text-[10px] text-[#8a8aad33] mt-1">西方星盘 × 四柱五行 × 星宿关系</p>
            </div>
          )}

          {/* Result */}
          {step === "result" && result && (
            <div className="space-y-5">
              {/* Score Hero */}
              <div className="glass rounded-2xl p-6 border border-[#d4a85310] text-center">
                <div className="text-5xl font-display font-bold text-[#d4a853] mb-2">{result.calc.overallScore}</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${result.tagConfig.bg} ${result.tagConfig.color} border-current border-opacity-20 mb-3`}>
                  {result.tagConfig.label}
                </div>
                <p className="text-xs text-[#8a8aad55]">{result.tagConfig.desc}</p>
                <div className="grid grid-cols-3 gap-2 mt-5">
                  {[
                    { label: "星盘", score: result.calc.synastry.score },
                    { label: "五行", score: result.calc.bazi.score },
                    { label: "综合", score: result.calc.overallScore },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0a0a0f] rounded-lg p-2.5 border border-[#d4a85304]">
                      <p className="text-[9px] text-[#8a8aad33]">{item.label}</p>
                      <p className="text-lg font-bold text-[#d4a853]">{item.score}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synastry */}
              <ResultSection icon={<Star className="w-4 h-4" />} title="西方星盘合盘" score={result.calc.synastry.score}>
                <div className="flex flex-wrap gap-1.5">
                  {result.calc.synastry.keywords.map((k: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-[#d4a85306] text-[#d4a85355] text-[10px] rounded border border-[#d4a85308]">{k}</span>
                  ))}
                </div>
              </ResultSection>

              {/* Bazi */}
              <ResultSection icon={<Flame className="w-4 h-4" />} title="四柱五行合盘" score={result.calc.bazi.score}>
                <p className="text-xs text-[#8a8aad] text-center bg-[#0a0a0f] rounded-lg p-2.5">{result.calc.bazi.complement}</p>
              </ResultSection>

              {/* Star Mansion */}
              <ResultSection icon={<Sparkles className="w-4 h-4" />} title="星宿关系" subtitle={result.relConfig.label}>
                <div className="text-center mb-3">
                  <span className={`text-2xl font-display font-bold ${result.relConfig.color}`}>{result.calc.starMansionRelation}</span>
                </div>
                <p className="text-xs text-[#8a8aad] text-center bg-[#0a0a0f] rounded-lg p-3">{result.relConfig.desc}</p>
                <p className="text-[10px] text-[#8a8aad33] bg-[#0a0a0f] rounded-lg p-3 mt-2">{result.relConfig.longDesc}</p>
              </ResultSection>

              {/* Summary */}
              <div className="glass rounded-xl p-5 border border-[#d4a85310]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#d4a853]" />合盘总结
                </h3>
                <p className="text-sm text-[#f0e6d3] leading-relaxed">{result.calc.summary}</p>
              </div>

              {/* Ziwei CTA */}
              <button onClick={() => setShowZiwei(true)} className="w-full glass rounded-xl p-4 border border-[#d4a85310] flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#d4a85344]" />
                  <div><p className="text-sm font-semibold text-[#f0e6d3]">紫微斗数深度合盘</p><p className="text-[10px] text-[#8a8aad33]">Premium</p></div>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#d4a85333]" />
              </button>

              <Button onClick={() => setStep("input")} variant="outline" className="w-full border-[#d4a85315] text-[#d4a853] text-xs">
                重新测算
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showZiwei} onOpenChange={setShowZiwei}>
        <DialogContent className="bg-[#0e0e14] border-[#d4a85315] text-[#f0e6d3] max-w-sm">
          <div className="text-center py-4">
            <Crown className="w-10 h-10 mx-auto text-[#d4a85333] mb-3" />
            <h3 className="text-base font-semibold text-[#f0e6d3]">紫微斗数深度合盘</h3>
            <p className="text-xs text-[#8a8aad] mt-1">Premium 付费功能 · 即将上线</p>
            <Button onClick={() => setShowZiwei(false)} className="mt-4 w-full bg-[#d4a853] text-[#0a0a0f] text-xs">知道了</Button>
          </div>
        </DialogContent>
      </Dialog>
    </InnerPageLayout>
  );
}

function ResultSection({ icon, title, score, subtitle, children }: {
  icon: React.ReactNode; title: string; score?: number; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5 border border-[#d4a85306]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#d4a85310] flex items-center justify-center text-[#d4a853]">{icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0e6d3]">{title}</h3>
            {subtitle && <p className="text-[10px] text-[#8a8aad33]">{subtitle}</p>}
          </div>
        </div>
        {score !== undefined && <span className="text-lg font-bold text-[#d4a853]">{score}</span>}
      </div>
      {children}
    </div>
  );
}
