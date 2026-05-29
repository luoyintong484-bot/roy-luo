import { useState } from "react"
import { Link } from "react-router"
import Navbar from "@/components/Navbar"
import CustomerService from "@/components/CustomerService"
import Footer from "@/sections/Footer"
import {
  ArrowLeft, Star, Sparkles, Calendar, MapPin, Clock, Moon,
  Sun, ChevronRight, TrendingUp, Heart, Coins, Activity, BookOpen,
  Crown, Lock, ChevronDown, Users
} from "lucide-react"

const aspectIcons: Record<string, typeof TrendingUp> = {
  "事业": TrendingUp, "感情": Heart, "财运": Coins, "健康": Activity, "学业": BookOpen,
}

// Western-style circular natal chart (placeholder SVG)
function NatalChartSvg() {
  const houses = [
    { label: "上升 ASC", angle: 0, sign: "狮子", deg: "23°", color: "#d4a853" },
    { label: "财帛 2H", angle: 30, sign: "处女", deg: "17°", color: "#8a8aad" },
    { label: "兄弟 3H", angle: 60, sign: "天秤", deg: "12°", color: "#8a8aad" },
    { label: "田宅 4H", angle: 90, sign: "天蝎", deg: "8°", color: "#8a8aad" },
    { label: "子女 5H", angle: 120, sign: "射手", deg: "5°", color: "#8a8aad" },
    { label: "奴仆 6H", angle: 150, sign: "摩羯", deg: "29°", color: "#8a8aad" },
    { label: "夫妻 7H", angle: 180, sign: "水瓶", deg: "23°", color: "#d4a853" },
    { label: "疾厄 8H", angle: 210, sign: "双鱼", deg: "17°", color: "#8a8aad" },
    { label: "迁移 9H", angle: 240, sign: "白羊", deg: "12°", color: "#8a8aad" },
    { label: "官禄 10H", angle: 270, sign: "金牛", deg: "8°", color: "#d4a853" },
    { label: "福德 11H", angle: 300, sign: "双子", deg: "5°", color: "#8a8aad" },
    { label: "玄秘 12H", angle: 330, sign: "巨蟹", deg: "29°", color: "#8a8aad" },
  ]
  const cx = 180, cy = 180, r = 160
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)

  return (
    <div className="glass rounded-xl p-5 text-center">
      <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Natal Chart (Western Style)</h3>
      <svg viewBox="0 0 360 360" className="w-full max-w-[360px] mx-auto">
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d4a85322" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke="#d4a85315" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r - 60} fill="none" stroke="#d4a85310" strokeWidth="0.5" />
        {/* House lines */}
        {houses.map((h, i) => {
          const a = toRad(h.angle)
          const x2 = cx + r * Math.cos(a), y2 = cy + r * Math.sin(a)
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#d4a85315" strokeWidth="1" />
        })}
        {/* House labels */}
        {houses.map((h, i) => {
          const a = toRad(h.angle + 15)
          const lx = cx + (r - 12) * Math.cos(a), ly = cy + (r - 12) * Math.sin(a)
          return (
            <g key={i}>
              <text x={lx} y={ly} textAnchor="middle" fill={h.color} fontSize="8" fontFamily="Inter, sans-serif">
                {h.label}
              </text>
              <text x={lx} y={ly + 10} textAnchor="middle" fill="#8a8aad66" fontSize="7" fontFamily="Inter, sans-serif">
                {h.sign} {h.deg}
              </text>
            </g>
          )
        })}
        {/* Center symbol */}
        <circle cx={cx} cy={cy} r={18} fill="#0a0a0f" stroke="#d4a85333" strokeWidth="1.5" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#d4a853" fontSize="12" fontFamily="serif">
          ☉
        </text>
        {/* Planet indicators */}
        {[
          { label: "☉", sign: "双鱼", angle: 350, dist: 100 },
          { label: "☽", sign: "天蝎", angle: 120, dist: 75 },
          { label: "☿", sign: "白羊", angle: 20, dist: 130 },
          { label: "♀", sign: "水瓶", angle: 330, dist: 110 },
          { label: "♂", sign: "射手", angle: 80, dist: 90 },
        ].map((p, i) => {
          const a = toRad(p.angle)
          const px = cx + p.dist * Math.cos(a), py = cy + p.dist * Math.sin(a)
          return (
            <g key={`planet-${i}`}>
              <circle cx={px} cy={py} r="10" fill="#0a0a0f" stroke="#d4a85333" strokeWidth="1" />
              <text x={px} y={py + 3} textAnchor="middle" fill="#d4a853" fontSize="9" fontFamily="serif">
                {p.label}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-[10px] text-[#8a8aad33] mt-3">
        Outer 12 houses · Planetary positions · Full chart calculation coming soon
      </p>
    </div>
  )
}

export default function DestinyDetail() {
  const [activeTab, setActiveTab] = useState<"overview" | "bazi" | "zodiac" | "advice" | "chart" | "ziwei">("overview")
  const [showZiwei, setShowZiwei] = useState(false)

  // Mock detailed data
  const userInfo = { name: "User", birthDate: "1995-03-15", birthTime: "14:30", location: "Beijing" }
  const baziData = {
    year: { gan: "乙", zhi: "亥", element: "木", hidden: "壬甲" },
    month: { gan: "己", zhi: "卯", element: "土", hidden: "乙" },
    day: { gan: "丙", zhi: "午", element: "火", hidden: "丁己" },
    hour: { gan: "乙", zhi: "未", element: "木", hidden: "己丁乙" },
  }
  const zodiacData = {
    sun: "双鱼座", moon: "天蝎座", rising: "狮子座",
    mercury: "白羊座", venus: "水瓶座", mars: "射手座",
  }
  const aspects = [
    { name: "事业", level: 4, desc: "贵人相助，新项目推进顺利", detail: "本月事业宫受吉星照拂，适合推进新计划。职场中容易获得上司认可，有升职加薪的机会。建议多参加行业交流活动，扩展人脉。" },
    { name: "感情", level: 3, desc: "桃花初现，需耐心经营", detail: "感情运势平稳上升，单身者可能在工作场合遇到心仪对象。有伴侣者需要注意沟通方式，避免小误会影响感情。" },
    { name: "财运", level: 5, desc: "财星高照，偏财运极佳", detail: "财运为本月最强项，正财稳定的同时偏财运也非常旺盛。适合进行小额投资，但切忌贪心。月底可能有意外之财。" },
    { name: "健康", level: 3, desc: "注意休息，避免过劳", detail: "整体健康状况良好，但工作压力可能导致睡眠质量下降。建议适当增加运动量，保持规律作息，多补充水分。" },
    { name: "学业", level: 4, desc: "思维敏捷，考试运佳", detail: "学习状态极佳，理解力和记忆力都处于高峰期。适合备考或学习新技能。考试发挥稳定，有望取得理想成绩。" },
  ]
  const advice = [
    { title: "Favorable this month", items: ["Attend social events", "Start new projects", "Learn new skills", "Invest and manage finances"] },
    { title: "Unfavorable this month", items: ["Impulse spending", "Arguments with others", "Overtime and late nights", "Trusting others too easily"] },
    { title: "Lucky Tips", items: ["Wear gold accessories", "Dress in warm colors", "Place green plants on your desk", "Meditate 15 minutes daily"] },
  ]

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: Star },
    { key: "bazi" as const, label: "Bazi Chart", icon: Calendar },
    { key: "zodiac" as const, label: "Zodiac Analysis", icon: Moon },
    { key: "chart" as const, label: "Natal Chart", icon: Sun },
    { key: "advice" as const, label: "Advice", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Home
          </Link>

          {/* Header */}
          <div className="glass rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a85330] to-[#14142a] flex items-center justify-center text-2xl border border-[#d4a85320]">
                <Sparkles className="w-7 h-7 text-[#d4a853]" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#f0e6d3]">{userInfo.name}'s Bazi & Astrology Reading</h1>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a8aad]">
                  <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{userInfo.birthDate}</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{userInfo.birthTime}</span>
                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{userInfo.location}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {["丙火", "双鱼座", "壁宿", "火", "乙亥年"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-[#d4a85308] text-[#d4a85388] text-[9px] rounded-full border border-[#d4a85310]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-[#d4a853] text-[#0a0a0f]"
                    : "bg-[#14142a]/60 text-[#8a8aad] hover:text-[#f0e6d3] border border-[#d4a85308]"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall Score */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Monthly Fortune Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {aspects.map((a) => {
                    const Icon = aspectIcons[a.name] || TrendingUp
                    return (
                      <div key={a.name} className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon className="w-3.5 h-3.5 text-[#8a8aad]" />
                          <span className="text-xs text-[#8a8aad]">{a.name}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className={`w-4 h-1.5 rounded-full ${i < a.level ? "bg-[#d4a853]" : "bg-[#8a8aad15]"}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-[#8a8aad55] leading-relaxed">{a.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Key Insights */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">Core Insights</h3>
                <div className="bg-[#d4a85308] rounded-lg p-4 border border-[#d4a85310]">
                  <p className="text-sm text-[#f0e6d3]/90 leading-relaxed">
                    Your <span className="text-[#d4a853]">Bing Fire Day Master</span> was born in the Mao month — Wood and Fire shine bright, granting natural leadership and creativity. This month, the <span className="text-[#d4a853]">Wealth star shines brightly</span>, making it an ideal time to advance your career and financial plans. A Romance star enters your relationship palace; singles should take initiative. For health, pay attention to <span className="text-[#d4a853]">liver and gallbladder care</span> and avoid staying up late.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bazi" && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Four Pillars Bazi Chart</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Year", ...baziData.year },
                    { label: "Month", ...baziData.month },
                    { label: "Day", ...baziData.day },
                    { label: "Hour", ...baziData.hour },
                  ].map((col) => (
                    <div key={col.label} className="bg-[#0a0a0f] rounded-lg p-3 text-center border border-[#d4a85306]">
                      <div className="text-[9px] text-[#8a8aad44] mb-2">{col.label}</div>
                      <div className="text-lg font-display font-bold text-[#d4a853]">{col.gan}{col.zhi}</div>
                      <div className="text-[9px] text-[#8a8aad33] mt-1">Hidden Stems: {col.hidden}</div>
                      <div className="text-[9px] text-[#d4a85344] mt-0.5">{col.element}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">Ten Gods Analysis</h3>
                <div className="space-y-2">
                  {[
                    { name: "正官", desc: "代表事业、地位、规则", level: "旺" },
                    { name: "偏财", desc: "代表投资、机遇、额外收入", level: "旺" },
                    { name: "食神", desc: "代表才华、表达、享受", level: "平" },
                    { name: "比肩", desc: "代表竞争、合作、同辈", level: "弱" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3 border border-[#d4a85304]">
                      <div>
                        <span className="text-xs text-[#f0e6d3]">{item.name}</span>
                        <span className="text-[10px] text-[#8a8aad33] ml-2">{item.desc}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${item.level === "旺" ? "text-[#d4a853] bg-[#d4a85310]" : item.level === "平" ? "text-[#8a8aad] bg-[#8a8aad10]" : "text-[#8a8aad44]"}`}>{item.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "zodiac" && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Zodiac Chart</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Sun", value: zodiacData.sun, desc: "Core Self", icon: Sun },
                    { label: "Moon", value: zodiacData.moon, desc: "Inner Emotions", icon: Moon },
                    { label: "Rising", value: zodiacData.rising, desc: "Outer Persona", icon: Star },
                    { label: "Mercury", value: zodiacData.mercury, desc: "Mind", icon: Sparkles },
                    { label: "Venus", value: zodiacData.venus, desc: "Love", icon: Heart },
                    { label: "Mars", value: zodiacData.mars, desc: "Drive", icon: TrendingUp },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                      <div className="text-[9px] text-[#8a8aad44]">{item.label}</div>
                      <div className="text-sm text-[#d4a853] font-semibold mt-0.5">{item.value}</div>
                      <div className="text-[9px] text-[#8a8aad33] mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "advice" && (
            <div className="space-y-4 animate-fade-in">
              {advice.map((section) => (
                <div key={section.title} className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{section.title}</h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-[#0a0a0f] rounded-lg px-4 py-2.5 border border-[#d4a85304]">
                        <ChevronRight className="w-3 h-3 text-[#d4a853] flex-shrink-0" />
                        <span className="text-xs text-[#f0e6d3]/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "chart" && (
            <div className="animate-fade-in space-y-4">
              <NatalChartSvg />
              {/* Synastry chart placeholder */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4a853]" />Synastry
                </h3>
                <p className="text-xs text-[#8a8aad] leading-relaxed">
                  The synastry feature will be available in a future update. It will support comparison charts, composite midpoint charts, and space-time midpoint charts, accurately analyzing compatibility, interaction patterns, and relationship development.
                </p>
                <div className="mt-3 p-2.5 bg-[#d4a85306] rounded-lg border border-[#d4a85310]">
                  <p className="text-[10px] text-[#d4a853]">Under development</p>
                </div>
              </div>
            </div>
          )}

          {/* Compatibility Upgrade — $9.99 Bazi + Five Elements */}
          <div className="mt-6 glass rounded-xl p-5 border border-[#d4a85315]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#d4a853]" /> Premium Compatibility Report
              </h3>
              <span className="text-lg font-bold text-[#d4a853]">$9.99</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                <p className="text-[10px] text-green-400/80 mb-1">✓ Free Tier</p>
                <p className="text-xs text-[#f0e6d3]">Western Zodiac</p>
                <p className="text-[10px] text-[#8a8aad44]">Sun, Moon, Rising, Venus, Mars</p>
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                <p className="text-[10px] text-green-400/80 mb-1">✓ Free Tier</p>
                <p className="text-xs text-[#f0e6d3]">Star Mansion</p>
                <p className="text-[10px] text-[#8a8aad44]">Relationship type & description</p>
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85320] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-[2px] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#d4a853]" />
                </div>
                <p className="text-[10px] text-[#d4a853] mb-1">🔒 Premium</p>
                <p className="text-xs text-[#f0e6d3]">Bazi Day Pillar</p>
                <p className="text-[10px] text-[#8a8aad44]">Deep elemental compatibility</p>
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85320] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-[2px] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#d4a853]" />
                </div>
                <p className="text-[10px] text-[#d4a853] mb-1">🔒 Premium</p>
                <p className="text-xs text-[#f0e6d3]">Five Elements</p>
                <p className="text-[10px] text-[#8a8aad44]">Elemental harmony & conflict</p>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all">
              Unlock Full Report · $9.99
            </button>

            {/* Share Section */}
            <div className="mt-5 pt-4 border-t border-[#d4a85310]">
              <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">Share Your Destiny Chart</p>
              <div className="flex justify-center gap-3">
                {[
                  { name: "Instagram", icon: "📷", tags: "#R7Fortune #DestinyChart #Astrology" },
                  { name: "TikTok", icon: "🎵", tags: "#R7Fortune #DestinyReading #Zodiac" },
                  { name: "Xiaohongshu", icon: "📕", tags: "#R7Fortune #星盘 #命理 #星座" },
                ].map(p => (
                  <button key={p.name} onClick={() => {
                    const text = `🌟 My Destiny Chart on R7 Fortune!\nZodiac: Sun ${zodiacData.sun} · Moon ${zodiacData.moon} · Rising ${zodiacData.rising}\n${p.tags}`
                    navigator.clipboard.writeText(text).catch(() => {})
                  }}
                    className="flex flex-col items-center gap-1 px-4 py-3 glass rounded-xl border border-[#d4a85310] hover:border-[#d4a85330] transition-all text-[#8a8aad] hover:text-[#f0e6d3] hover:scale-105">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-[9px]">{p.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-[#8a8aad33] text-center mt-2">Share to unlock a free reading credit! Auto-generated watermark included.</p>
            </div>
          </div>

          {/* Ziwei Entrance - Collapsible at bottom */}
          <div className="mt-6">
            <button
              onClick={() => setShowZiwei(!showZiwei)}
              className="w-full glass rounded-xl p-4 border border-[#d4a85315] hover:border-[#d4a85330] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85310] to-[#1a1a2e] flex items-center justify-center border border-[#d4a85310]">
                  <Crown className="w-5 h-5 text-[#d4a85355]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2">
                    Ziwei Destiny Chart
                    <span className="px-1.5 py-0.5 bg-[#d4a85310] text-[#d4a85366] text-[9px] rounded">Coming Later</span>
                  </p>
                  <p className="text-[10px] text-[#8a8aad33]">12 Palaces · Four Transformations · Life & Body Palaces · Annual Cycles</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-[#8a8aad] transition-transform ${showZiwei ? "rotate-180" : ""}`} />
            </button>
            {showZiwei && (
              <div className="glass rounded-xl p-5 mt-2 border border-[#d4a85310] animate-fade-in">
                <div className="grid grid-cols-4 gap-2">
                  {["Life", "Siblings", "Spouse", "Children", "Wealth", "Health", "Travel", "Friends", "Career", "Property", "Fortune", "Parents"].map((palace) => (
                    <div key={palace} className="bg-[#0a0a0f] rounded-lg p-3 text-center border border-[#d4a85304]">
                      <div className="text-[9px] text-[#8a8aad44]">{palace}</div>
                      <div className="text-lg mt-1">🏛️</div>
                      <div className="text-[8px] text-[#d4a85344] mt-0.5">Coming Soon</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-[#d4a85304] rounded-lg border border-[#d4a85308] text-center">
                  <Lock className="w-4 h-4 text-[#d4a85344] mx-auto mb-1" />
                  <p className="text-[10px] text-[#8a8aad33]">Full Ziwei chart features coming in a future update</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  )
}
