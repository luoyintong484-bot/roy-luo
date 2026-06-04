import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { trpc } from "@/providers/trpc"
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal"
import { isReportPaid, unlockReport } from "@/lib/payment-service"
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
        {isZh ? "12宮位 · 行星位置 · 完整星盤計算即將推出" : "12 Houses · Planetary positions · Full chart calculation coming soon"}
      </p>
    </div>
  )
}

function BoldBrackets({ text }: { text: string }) {
  const parts = text.split(/(【[^】]+】)/g);
  return <>{parts.map((p, i) => p.startsWith("【") ? <strong key={i} className="font-semibold text-[#f5e8d0]">{p}</strong> : p)}</>;
}

function ComprehensiveReport({ isZh }: { isZh: boolean }) {
  const sections = [
    {
      icon: "💼", title: isZh ? "事業發展" : "Career Development",
      content: isZh
        ? `綜合八字日柱丙火與本命星盤第十宮太陽落位，你的職業天賦指向需要「可見度」和「影響力」的領域。丙火日主天生自帶光芒——你不是那種適合躲在幕後埋頭苦幹的類型，而是需要在舞臺中央被看見、被認可的配置。\n\n【天賦方向】太陽第十宮與火星形成六分相，賦予你極強的執行力和公眾表達能力。適合的行業包括：品牌管理、公關媒體、教育培訓、創意總監、創業者——任何需要「站出來說話」的崗位都是你的主場。\n\n【職場優勢】八字中木火通明，印星有力——你的學習能力比同齡人快很多。進入新領域的前三個月是你的黃金期，你能迅速掌握別人需要半年才能理解的東西。\n\n【關鍵轉折點】30歲前後土星回歸期間，你會面臨一次重要的職業重新定位。不要害怕轉行——你的星盤配置支持跨界發展，而且往往在「看起來不相關」的領域之間找到獨特的結合點。印度占星中第十宮主星與木星產生關聯，暗示34歲左右會有一次事業上的重大躍升，可能是創業、升職或轉換到更適合的賽道。\n\n【注意事項】你的火星在第八宮——在合夥或合作時，務必把財務條款寫清楚。你對合作夥伴的信任是優點，但沒有合約的信任是風險。`
        : `Based on your Bazi Bing Fire Day Master and Natal Chart 10th House Sun placement, your career talents point toward fields requiring "visibility" and "influence." Bing Fire individuals are born radiant — you're not built for backstage anonymity but for center-stage impact.\n\n【Talent Direction】Sun in 10th House sextile Mars grants exceptional execution and public expression. Suitable industries: brand management, PR/media, education & training, creative direction, entrepreneurship — any role demanding "standing up and speaking" is your arena.\n\n【Career Edge】Wood-Fire thriving in your Bazi chart with strong Seal star — your learning speed surpasses peers. The first 3 months in a new field are your golden window. Key turning point: Saturn return around age 30 brings a career recalibration. Don't fear pivoting — your chart supports cross-disciplinary growth.\n\n【Caution】Mars in 8th House — when entering partnerships, get financial terms in writing. Trust is a virtue, but trust without contracts is risk.`
    },
    {
      icon: "💰", title: isZh ? "財富運勢" : "Wealth & Finance",
      content: isZh
        ? `本命星盤中第二宮木星入廟，這是非常罕見的財富配置——你對金錢的直覺天生準確。你賺的每一筆錢背後都有你的邏輯，不是運氣好，是你的潛意識在做對的判斷。\n\n【正財偏財格局】八字中正財星坐於月柱，偏財星見於時柱——你的收入結構是「穩定工資+副業或投資收益」的組合。不要滿足於單一收入來源，你的配置天生適合雙軌甚至多軌收入模式。\n\n【財富積累方式】金星與木星的三分相賦予你「透過合作和人脈放大財富」的能力。比起自己埋頭苦幹，你更適合通過建立團隊、整合資源或利用社交網絡來創造財富。印度占星中第十一宮（收益宮）主星與木星產生連接，暗示你的財富增長與你的社交圈質量直接相關。\n\n【破財風險】火星八宮的配置警示你要注意合夥財務、借貸和投資中的風險。你比較容易因為信任對方而忽略必要的審查和合約——這不是你判斷力不好，是你傾向於看到人好的一面。建議所有涉及金錢的合作都要經過第三方審核。另外，木星雖然是吉星，但有時也會讓人過度樂觀——避免在情緒高漲時做大的投資決定。\n\n【財富轉折點】36歲前後，流年木星進入第二宮時，會有一次顯著的財富提升機會。這可能是一筆之前投資的回報、一個新的收入渠道、或一次職業躍升帶來的薪資大幅增長。保持你目前的積累節奏，不要因為短期的波動而打亂長期規劃。`
        : `Your Natal Chart shows Jupiter in the 2nd House — a rare wealth configuration. Your intuition about money is naturally accurate. Every dollar you earn has logic behind it.\n\n【Income Structure】Bazi shows Stable Wealth Star in the Month Pillar and Speculative Wealth in the Hour Pillar — your income is "stable salary + side/investment income." Don't settle for a single income stream.\n\n【Wealth Method】Venus trine Jupiter grants the ability to "amplify wealth through partnerships and networks." Focus on team-building and resource integration. Vedic astrology shows your 11th House (gains) connected to Jupiter — your wealth growth directly correlates with your social circle quality.\n\n【Risk Alert】Mars in 8th House warns caution in partnerships and investments. You tend to trust people easily — always get third-party review for money-related collaborations. Also, avoid making big investment decisions when emotionally high.\n\n【Key Window】Around age 36, transiting Jupiter enters your 2nd House — expect a significant wealth boost: investment returns, new income channels, or a major salary increase from career advancement.`
    },
    {
      icon: "💕", title: isZh ? "感情姻緣" : "Love & Relationships",
      content: isZh
        ? `金星落在第五宮——你對愛情的理解從來不只是「被愛」，而是「共同創造」。你需要的是能在精神層面與你共鳴的伴侶，而不僅僅是生活搭檔。\n\n【正緣特徵】綜合八字與星盤，你的正緣通常具有以下一個或多個特質：八字日支帶寅或午（與你的丙火形成良好互動）、星盤中太陽或月亮落在火象或風象星座、職業上具有一定創造性或公眾屬性。你們的相遇往往發生在與「學習、旅行、社交活動」相關的場合。\n\n【戀愛模式】月亮與水星的柔和相位讓你在感情中擅長表達——這很加分。但太陽與土星的對沖可能讓你一開始顯得有些距離感，需要時間才會真正打開心扉。你屬於「慢熱但持久」的類型，不是一見鍾情派，但一旦認定一個人，你的忠誠度極高。\n\n【婚姻走勢】印度占星中第七宮主星的位置暗示，你的婚姻會在30-35歲之間進入穩定階段。在此之前，你可能會經歷1-2段重要的戀愛關係，每一段都在幫你更清楚自己的需求。不要因為年齡焦慮而倉促決定——你的星盤顯示「晚婚但婚姻質量高」的趨勢。\n\n【相處建議】你的月亮在第六宮，這讓你在關係中容易「用做事代替說愛」——你以為把對方照顧好就是愛，但對方可能需要的是你的時間和注意力，而不是你的勞動成果。學會停下來，看著對方的眼睛，告訴Ta「我在這裡」。這對你來說可能比做任何事都更難——但也更重要。`
        : `Venus in the 5th House — your definition of love isn't just "being loved" but "co-creating." You need a partner who resonates with you spiritually, not just logistically.\n\n【Partner Traits】Bazi + Chart shows your ideal partner has: Day Branch containing Yin or Wu (harmonizing with your Bing Fire), Sun or Moon in Fire/Air signs, and a creative or public-facing career. Meeting often happens through learning, travel, or social events.\n\n【Love Pattern】Moon-Mercury soft aspect makes you emotionally expressive — a major plus. But Sun-Saturn opposition may create initial distance. You're "slow to warm but lasting" — not a love-at-first-sight person, but fiercely loyal once committed.\n\n【Marriage Timing】Vedic 7th House lord suggests marriage stabilizes between ages 30-35. Before that, 1-2 significant relationships help clarify what you truly need. Don't rush due to age anxiety — your chart shows "later marriage but higher quality."\n\n【Advice】Moon in 6th House makes you "show love through doing" — you think taking care of everything is love, but your partner may need your undivided attention, not your completed tasks. Learn to pause, look into their eyes, and simply say, "I'm here."`
    },
    {
      icon: "🏥", title: isZh ? "健康狀況" : "Health & Wellness",
      content: isZh
        ? `火星在第一宮的人通常精力充沛，但有一個容易被忽略的問題——你的意志力太強，強大到會覆蓋身體的疲勞信號。這不是優勢，是需要警惕的。\n\n【體質特點】八字中火旺木相，先天體質偏熱性。容易出現的問題集中在：心血管系統、肝膽功能、以及因為長期精神緊繃導致的偏頭痛或睡眠障礙。你比較不容易感冒或感染，但一旦生病，往往是因為長期積累的壓力和疲勞突然爆發。\n\n【易患疾病】印度占星中第六宮的配置提示需要特別關注消化系統——不是因為你吃得不好，而是因為你吃飯的時候在想別的事。你的腸胃問題多半是「情緒型」的——壓力大就胃痛、焦慮就腹瀉、生氣就脹氣。這不是藥能解決的，需要從情緒管理入手。另外，木星雖然是吉星，但當它影響你的健康宮時，可能讓你有「過度放縱」的傾向——暴飲暴食、熬夜、久坐不動。這些都需要有意識地去調整。\n\n【日常養生】不需要極端的飲食或運動方案。最適合你的是「穩定節奏」——固定時間吃飯、固定時間睡覺、每週2-3次中等強度的運動。瑜伽或太極比HIIT更適合你的體質。冥想或正念練習對你的幫助可能比你想像中大得多——你的問題不是身體不夠好，是頭腦停不下來。`
        : `Mars in 1st House gives abundant energy, but your willpower is so strong it overrides fatigue signals. This isn't a strength — it's a liability.\n\n【Constitution】Bazi shows dominant Fire with Wood support — naturally warm constitution. Vulnerable areas: cardiovascular, liver/gallbladder, and stress-induced migraines or insomnia.\n\n【Risk Areas】Vedic 6th House points to digestive issues — not from poor diet, but from eating while distracted. Your gut problems are largely emotional: stress→stomach pain, anxiety→digestive issues. This needs emotional management, not just medication. Jupiter's influence may lead to overindulgence — binge eating, late nights, sedentary patterns.\n\n【Daily Care】No extreme regimens needed. What suits you is "steady rhythm" — fixed meal times, fixed sleep times, 2-3 moderate workouts weekly. Yoga or Tai Chi suit your constitution better than HIIT. Meditation may help more than you think — your problem isn't physical fitness, it's an unstoppable mind.`
    },
  ];

  return (
    <div className="glass rounded-2xl p-5 sm:p-6 border-2 border-[#d4a85333] space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-[#d4a853]">
          {isZh ? "🔮 綜合命理完整報告" : "🔮 Comprehensive Destiny Report"}
        </h2>
        <p className="text-[10px] text-[#8a8aad44] mt-1">
          {isZh ? "八字 · 本命星盤 · 印度占星 交叉驗證分析" : "Bazi · Natal · Vedic Cross-Validation"}
        </p>
      </div>
      {sections.map((s, i) => (
        <div key={i} className="bg-[#151520] rounded-xl p-4 border border-[#FFB6C108]">
          <h3 className="text-base font-bold text-[#FFB6C1] mb-3 flex items-center gap-2">
            <span>{s.icon}</span> {s.title}
          </h3>
          <p className="text-xs text-[#f0e6d3] font-[450] leading-[1.6] tracking-[0.5px] whitespace-pre-line"><BoldBrackets text={s.content} /></p>
        </div>
      ))}
    </div>
  );
}

export default function DestinyDetail() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW" || locale === "zh";
  const [activeTab, setActiveTab] = useState<"overview" | "bazi" | "zodiac" | "advice" | "chart" | "ziwei">("overview")
  const [showZiwei, setShowZiwei] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)

  // ---- Read actual user input from navigation state ----
  const location = useLocation()
  const state = location.state as any
  const isSynastry = state?.type === "synastry"
  const isNatal = state?.type === "natal" || !state?.type

  // ---- Helper: compute zodiac, bazi, element, mansion from birth date ----
  function getZodiacSign(date: Date): string {
    const m = date.getMonth() + 1; const d = date.getDate()
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "白羊座"
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "金牛座"
    if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return "双子座"
    if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return "巨蟹座"
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "狮子座"
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "处女座"
    if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) return "天秤座"
    if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) return "天蝎座"
    if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) return "射手座"
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "摩羯座"
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "水瓶座"
    return "双鱼座"
  }
  const ZODIAC_ELEMENTS: Record<string, string> = {
    "白羊座":"火","金牛座":"土","双子座":"风","巨蟹座":"水",
    "狮子座":"火","处女座":"土","天秤座":"风","天蝎座":"水",
    "射手座":"火","摩羯座":"土","水瓶座":"风","双鱼座":"水",
  }
  function getBaziDayPillar(date: Date): string {
    const s = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
    const b = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
    const base = new Date(1900, 0, 31)
    const diff = Math.floor((date.getTime() - base.getTime()) / 86400000)
    return s[(diff + 10) % 10] + b[(diff + 12) % 12]
  }
  function getStarMansion(date: Date): string {
    const ms = ["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"]
    const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    return ms[doy % 28] + "宿"
  }
  function getBaziStemElement(stem: string): string {
    const el: Record<string,string> = {"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"}
    return el[stem] || "土"
  }
  function calcElementCompat(el1: string, el2: string): string {
    const gen: Record<string,string> = {"木":"火","火":"土","土":"金","金":"水","水":"木"}
    if (gen[el1] === el2) return `${el1}生${el2}，天然滋养`
    if (gen[el2] === el1) return `${el2}生${el1}，被滋养`
    if (el1 === el2) return `同为${el1}命，志同道合`
    return `${el1}与${el2}，互补磨合`
  }

  // ---- Compute actual data from user input ----
  const synastryData = useMemo(() => {
    if (!isSynastry || !state?.birthDate) return null
    try {
      const d1 = new Date(state.birthDate)
      if (isNaN(d1.getTime())) return null
      const d2 = state.birthDate2 ? new Date(state.birthDate2) : null
      if (d2 && isNaN(d2.getTime())) return null
      const p1Name = state.name || (isZh ? "你" : "You")
      const p2Name = state.name2 || (isZh ? "对方" : "Partner")

      const p1Zodiac = getZodiacSign(d1)
      const p1Element = ZODIAC_ELEMENTS[p1Zodiac] || "未知"
      const p1Pillar = getBaziDayPillar(d1)
      const p1StemEl = getBaziStemElement(p1Pillar[0])
      const p1Mansion = getStarMansion(d1)

      if (d2) {
        const p2Zodiac = getZodiacSign(d2)
        const p2Element = ZODIAC_ELEMENTS[p2Zodiac] || "未知"
        const p2Pillar = getBaziDayPillar(d2)
        const p2StemEl = getBaziStemElement(p2Pillar[0])
        const p2Mansion = getStarMansion(d2)
        const elementRel = calcElementCompat(p1StemEl, p2StemEl)
        return {
          mode: "synastry" as const,
          p1: { name: p1Name, zodiac: p1Zodiac, element: p1Element, pillar: p1Pillar, stemEl: p1StemEl, mansion: p1Mansion, birthDate: state.birthDate, birthTime: state.birthTime, location: [state.country, state.province, state.city].filter(Boolean).join(" ") || state.birthPlace || "" },
          p2: { name: p2Name, zodiac: p2Zodiac, element: p2Element, pillar: p2Pillar, stemEl: p2StemEl, mansion: p2Mansion, birthDate: state.birthDate2, birthTime: state.birthTime2, location: [state.country2, state.province2, state.city2].filter(Boolean).join(" ") || "" },
          elementRel,
        }
      }
      return {
        mode: "natal" as const,
        p1: { name: p1Name, zodiac: p1Zodiac, element: p1Element, pillar: p1Pillar, stemEl: p1StemEl, mansion: p1Mansion, birthDate: state.birthDate, birthTime: state.birthTime, location: [state.country, state.province, state.city].filter(Boolean).join(" ") || state.birthPlace || "" },
        p2: null,
        elementRel: null,
      }
    } catch { return null }
  }, [isSynastry, state?.birthDate, state?.birthDate2, state?.name, state?.name2, isZh])

  // ---- Auto-save reading to user history (fire-once via ref) ----
  const readingCreate = trpc.reading.create.useMutation({
    onError: (err) => console.warn("[save-reading] API save failed, using localStorage fallback:", err.message),
    onSuccess: (data) => console.log("[save-reading] Saved to DB, id:", data?.id),
  })
  const savedRef = useRef(false)
  useEffect(() => {
    if (!synastryData?.p2 || savedRef.current) return
    savedRef.current = true
    const p1 = synastryData.p1
    const p2 = synastryData.p2
    const title = isZh
      ? `${p1.name || "你"} 與 ${p2.name || "對方"} 的雙人合盤`
      : `Synastry: ${p1.name || "You"} & ${p2.name || "Partner"}`
    // Build reading record
    const record = {
      title,
      type: "synastry",
      date: new Date().toLocaleDateString("zh-CN"),
      preview: `${p1.pillar} × ${p2.pillar} · ${synastryData.elementRel}`,
      person1: { name: p1.name, pillar: p1.pillar, zodiac: p1.zodiac, element: p1.element, mansion: p1.mansion },
      person2: { name: p2.name, pillar: p2.pillar, zodiac: p2.zodiac, element: p2.element, mansion: p2.mansion },
      elementRelation: synastryData.elementRel,
    }
    // 1. Try API save
    readingCreate.mutate({
      type: "synastry",
      title,
      inputData: {
        person1: { name: p1.name, birthDate: p1.birthDate, birthTime: p1.birthTime || null, location: p1.location, zodiac: p1.zodiac, element: p1.element, dayPillar: p1.pillar, starMansion: p1.mansion },
        person2: { name: p2.name, birthDate: p2.birthDate, birthTime: p2.birthTime || null, location: p2.location, zodiac: p2.zodiac, element: p2.element, dayPillar: p2.pillar, starMansion: p2.mansion },
        elementRelation: synastryData.elementRel,
      },
      price: 0,
    } as any)
    // 2. Always save to localStorage as fallback (guaranteed persistence)
    try {
      const existing = JSON.parse(localStorage.getItem("r7_reports") || "[]")
      existing.unshift(record)
      localStorage.setItem("r7_reports", JSON.stringify(existing.slice(0, 50)))
    } catch { /* silent */ }
  }, [!!synastryData?.p2])

  // Mock detailed data (kept as fallback for non-synastry / backward compat)
  const userInfo = synastryData?.p1
    ? { name: synastryData.p1.name, birthDate: synastryData.p1.birthDate?.slice(0, 10) || "", birthTime: synastryData.p1.birthTime || "12:00", location: synastryData.p1.location || "Unknown" }
    : { name: "User", birthDate: "1995-03-15", birthTime: "14:30", location: "Beijing" }
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
    { name: "事业", level: 4, desc: "贵人相助，新项目推进顺利",
      detail: "本月事业宫受木星与金星吉星照拂，适合推进新计划。职场中容易获得上司和前辈的认可，有升职加薪的窗口期。\n\n【性格底层逻辑】你的太阳落于第十宫，天生具备领导气质和公众影响力——你不是那种甘于躲在幕后的人。这种配置赋予你对权威的天然亲和力，也让你比同龄人更早意识到「事业不只是赚钱，是实现自我」。\n\n【天赋优势】火星与土星的六分相为你提供了罕见的「行动力+耐力」组合。你不是爆发型选手，而是长跑型——这恰恰是最容易在职场走远的类型。\n\n【潜在短板】月亮在第六宫可能让你对工作细节过度敏感，容易因为同事的一句无心之言而内耗。学会区分「值得在意的」和「可以放过的」。\n\n【人生课题】学会授权和信任。你的标准很高，但不是所有人都需要达到你的标准才算合格。" },
    { name: "感情", level: 3, desc: "桃花初现，需耐心经营",
      detail: "感情运势平稳上升，单身者可能在朋友聚会或工作场合遇到心仪对象。有伴侣者需要注意沟通方式，避免小摩擦积累影响感情温度。\n\n【性格底层逻辑】金星落在第五宫——你对爱情的定义从来不只是「被爱」，而是「共同创造」。你需要的关系不是依赖，是共振。\n\n【天赋优势】月亮与水星的柔和相位赋予你极强的情感表达能力——你能说出别人心里有但说不出口的话，这在亲密关系中是非常珍贵的品质。\n\n【潜在短板】太阳与土星的对冲可能让你在感情中不自觉地筑墙。你渴望亲密，但同时也害怕失去自我——这两者并不矛盾，只是需要练习。\n\n【人生课题】允许自己在爱里不那么完美。你不需要在每一段关系中都是「做得更好」的那个人。" },
    { name: "财运", level: 5, desc: "财星高照，偏财运极佳",
      detail: "财运为本月最强领域，正财稳定的同时偏财运也相当活跃。适合进行小额分散投资，但切忌贪心追高。月底可能有之前被忽略的意外进账。\n\n【性格底层逻辑】第二宫木星入庙——你对财富的直觉天生准确。不是那种会盲目跟风的人，你赚的每一笔钱背后都有你的逻辑。\n\n【天赋优势】金星与木星的三分相赋予你「优雅地获得资源」的能力——比起蛮干，你更擅长通过合作和人际网络来放大财富。\n\n【潜在短板】火星在第八宫暗示你在「别人的钱」上容易冲动——合伙投资需谨慎，不要因为信任对方就跳过合同和条款。\n\n【人生课题】建立被动收入。你的天赋配置非常适合创造「一次努力、持续回报」的收入模式。" },
    { name: "健康", level: 3, desc: "注意休息，避免过劳",
      detail: "整体健康状况良好，但高强度工作可能导致睡眠质量下降和肩颈劳损。建议每周至少安排2-3次适度运动，保持规律作息，多补充水分和维生素B族。\n\n【性格底层逻辑】火星在第一宫的人容易把身体的信号忽略掉——你的意志力太强，强大到会覆盖身体的疲惫。这不是优势，是隐患。\n\n【天赋优势】木星的良好相位让你拥有不错的恢复力——只要给身体一点喘息的空间，它会比你想象中更快复原。\n\n【潜在短板】土星在第六宫——你容易把休息看成「浪费时间」。这是一个需要被挑战的信念：真正的长期主义，是把身体当成要用一辈子的工具来维护。\n\n【人生课题】把健康放进日程表。不是「有空就去运动」，而是「这个时间就是留给身体的，不做别的。」" },
    { name: "学业", level: 4, desc: "思维敏捷，考试运佳",
      detail: "水星进入有利位置，理解力和记忆力都处于高峰期，适合备考或学习新技能。考试发挥稳定，有望取得理想成绩。\n\n【性格底层逻辑】水星在第三宫——你的思维不是「学习」，是「吸收」。你对信息有一种不费力的处理能力，这让你在需要快速掌握新知识的领域天然占优。\n\n【天赋优势】水星与木星的六分相赋予你「把碎片拼成系统」的能力。你不是死记硬背型，你是「理解框架后再往里填内容」型——这在考试和实战中都是优势。\n\n【潜在短板】容易因为兴趣广泛而浅尝辄止。你的好奇心是天赋，但也可能变成「什么都懂一点，但什么都不精」。\n\n【人生课题】选定一个深度方向，坚持三年。你的配置需要的是「深耕」而非「广撒网」——一旦选定，你会在那个领域走得很远。" },
  ]
  const advice = [
    { titleEn: "Favorable this month", titleZh: "本月適宜", itemsEn: ["Attend social events", "Start new projects", "Learn new skills", "Invest and manage finances"], itemsZh: ["參加社交活動", "啟動新項目", "學習新技能", "小額投資理財"] },
    { titleEn: "Unfavorable this month", titleZh: "本月不宜", itemsEn: ["Impulse spending", "Arguments with others", "Overtime and late nights", "Trusting others too easily"], itemsZh: ["衝動消費", "與人爭執", "熬夜加班", "輕信他人"] },
    { titleEn: "Lucky Tips", titleZh: "幸運小物", itemsEn: ["Wear gold accessories", "Dress in warm colors", "Place green plants on your desk", "Meditate 15 minutes daily"], itemsZh: ["佩戴金色飾品", "穿著暖色調衣物", "辦公桌擺放綠植", "每日冥想15分鐘"] },
  ]

  const tabs = [
    { key: "overview" as const, label: isZh ? "總覽" : "Overview", icon: Star },
    { key: "bazi" as const, label: isZh ? "八字排盤" : "Bazi Chart", icon: Calendar },
    { key: "zodiac" as const, label: isZh ? "星座分析" : "Zodiac", icon: Moon },
    { key: "chart" as const, label: isZh ? "本命星盤" : "Natal Chart", icon: Sun },
    { key: "advice" as const, label: isZh ? "運勢建議" : "Advice", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back */}
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />{isZh ? "返回上一頁" : "Back"}
          </button>

          {/* Header */}
          <div className="glass rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a85330] to-[#14142a] flex items-center justify-center text-2xl border border-[#d4a85320]">
                <Sparkles className="w-7 h-7 text-[#d4a853]" />
              </div>
              <div>
                <div className="flex items-center justify-between flex-1">
                  <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
                    {isSynastry && synastryData?.p2
                      ? (isZh
                          ? `${synastryData.p1.name || "你"} × ${synastryData.p2.name || "對方"} 雙人合盤`
                          : `${synastryData.p1.name || "You"} × ${synastryData.p2.name || "Partner"} Synastry`)
                      : `${userInfo.name}'s Bazi & Astrology Reading`
                    }
                  </h1>
                  <button onClick={() => setShowPayModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all animate-pulse flex-shrink-0 ml-3">
                    {isZh ? "解鎖完整報告 $9.99" : "Unlock Full Report $9.99"}
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a8aad]">
                  {isSynastry && synastryData?.p2 ? (
                    <>
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{synastryData.p1.birthDate?.slice(0,10)}</span>
                      <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{synastryData.p2.birthDate?.slice(0,10)}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{userInfo.birthDate}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{userInfo.birthTime}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{userInfo.location}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-1.5 mt-2">
                  {(isSynastry && synastryData
                    ? [synastryData.p1.pillar, synastryData.p1.zodiac, synastryData.p1.mansion, synastryData.p1.element,
                       ...(synastryData.p2 ? [synastryData.p2.pillar, synastryData.p2.zodiac, synastryData.p2.mansion, synastryData.p2.element] : [])]
                    : ["丙火", "双鱼座", "壁宿", "火", "乙亥年"]
                  ).map((tag) => (
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
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">{isZh ? "本月運勢總覽" : "Monthly Fortune Overview"}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {aspects.map((a) => {
                    const Icon = aspectIcons[a.name] || TrendingUp
                    return (
                      <div key={a.name} className="bg-[#151520] rounded-lg p-3 border border-[#d4a85306]">
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

              {/* Key Insights — dynamic for synastry, fallback for natal */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{isZh ? "核心洞察" : "Core Insights"}</h3>
                <div className="bg-[#d4a85308] rounded-lg p-4 border border-[#d4a85310]">
                  <p className="text-sm text-[#f0e6d3]/90 leading-relaxed">
                    {isSynastry && synastryData?.p2 ? (
                      isZh ? (
                        <>
                          {synastryData.p1.name || "你"}的<span className="text-[#d4a853]">{synastryData.p1.pillar}日主</span>（{synastryData.p1.stemEl}命）
                          與{synastryData.p2.name || "對方"}的<span className="text-[#d4a853]">{synastryData.p2.pillar}日主</span>（{synastryData.p2.stemEl}命）
                          ——{synastryData.elementRel}。
                          {synastryData.p1.zodiac}與{synastryData.p2.zodiac}的組合
                          在星盤中形成<span className="text-[#d4a853]">{
                            synastryData.p1.element === synastryData.p2.element
                              ? "同元素共振"
                              : ["火","风"].includes(synastryData.p1.element) && ["火","风"].includes(synastryData.p2.element)
                              ? "燃燒循環"
                              : ["水","土"].includes(synastryData.p1.element) && ["水","土"].includes(synastryData.p2.element)
                              ? "滋養根基"
                              : "互補張力"
                          }</span>。
                          星宿{synastryData.p1.mansion}與{synastryData.p2.mansion}的連結
                          揭示了這段關係的<span className="text-[#d4a853]">深層業力脈絡</span>。
                        </>
                      ) : (
                        <>
                          <span className="text-[#d4a853]">{synastryData.p1.pillar} Day Master</span> ({synastryData.p1.stemEl})
                          meets <span className="text-[#d4a853]">{synastryData.p2.pillar} Day Master</span> ({synastryData.p2.stemEl})
                          —{synastryData.elementRel}.
                          The {synastryData.p1.zodiac}-{synastryData.p2.zodiac} pairing
                          creates <span className="text-[#d4a853]">{
                            synastryData.p1.element === synastryData.p2.element
                              ? "same-element resonance"
                              : ["火","风"].includes(synastryData.p1.element) && ["火","风"].includes(synastryData.p2.element)
                              ? "a combustion cycle"
                              : ["水","土"].includes(synastryData.p1.element) && ["水","土"].includes(synastryData.p2.element)
                              ? "nourishing foundation"
                              : "complementary tension"
                          }</span>.
                          The {synastryData.p1.mansion}-{synastryData.p2.mansion} mansion connection
                          reveals <span className="text-[#d4a853]">deep karmic threads</span> in this relationship.
                        </>
                      )
                    ) : (
                      isZh ? (
                        <>你的<span className="text-[#d4a853]">丙火日主</span>生於卯月——木火通明，天生具備領導力與創造力。本月<span className="text-[#d4a853]">財星高照</span>，適合推進事業與財務計劃。桃花星進入感情宮位，單身者可主動出擊。健康方面需注意<span className="text-[#d4a853]">肝膽養護</span>，避免熬夜。</>
                      ) : (
                        <>Your <span className="text-[#d4a853]">Bing Fire Day Master</span> was born in the Mao month — Wood and Fire shine bright, granting natural leadership and creativity. This month, the <span className="text-[#d4a853]">Wealth star shines brightly</span>, making it an ideal time to advance your career and financial plans. A Romance star enters your relationship palace; singles should take initiative. For health, pay attention to <span className="text-[#d4a853]">liver and gallbladder care</span> and avoid staying up late.</>
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* Synastry paywall prompt — only for synastry mode */}
              {isSynastry && synastryData?.p2 && (
                <div className="glass rounded-xl p-5 border border-[#FFB6C120]">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#FFB6C1] mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-xs text-[#f0e6d3] leading-relaxed">
                        {isZh ? (
                          <>以上為基於雙方八字<span className="text-[#FFB6C1] font-semibold">{synastryData.p1.pillar}</span>與<span className="text-[#FFB6C1] font-semibold">{synastryData.p2.pillar}</span>的概要分析。完整報告涵蓋<span className="text-[#FFB6C1]">6大維度深度解讀</span>——核心吸引力、日常相處模式、矛盾課題、緣分解析、注意事項與長期建議，基於八字·本命星盤·印度占星三大體系交叉驗證，幫助你們全面理解這段關係的底層能量。</>
                        ) : (
                          <>Above is a brief analysis based on <span className="text-[#FFB6C1] font-semibold">{synastryData.p1.pillar}</span> and <span className="text-[#FFB6C1] font-semibold">{synastryData.p2.pillar}</span>. The full report covers <span className="text-[#FFB6C1]">6 deep dimensions</span> — Core Attraction, Daily Interaction, Core Conflicts, Destiny Analysis, Key Cautions & Long-Term Advice — cross-validated across Bazi, Natal & Vedic systems.</>
                        )}
                      </p>
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {isZh ? "解鎖完整合盤報告 $9.99" : "Unlock Full Synastry Report $9.99"}
                      </button>
                      <p className="text-[9px] text-[#8a8aad44] text-center">
                        {isZh ? "6大維度 · 八字×星盤×印度占星 · 永久觀看" : "6 Dimensions · Bazi×Natal×Vedic · Permanent Access"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    <div key={col.label} className="bg-[#151520] rounded-lg p-3 text-center border border-[#d4a85306]">
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
                    <div key={item.name} className="flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3 border border-[#d4a85304]">
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
                    <div key={item.label} className="bg-[#151520] rounded-lg p-3 border border-[#d4a85306]">
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
                <div key={section.titleEn} className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-3">{isZh ? section.titleZh : section.titleEn}</h3>
                  <div className="space-y-2">
                    {(isZh ? section.itemsZh : section.itemsEn).map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-[#151520] rounded-lg px-4 py-2.5 border border-[#d4a85304]">
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

          {/* Share Section */}
          <div className="mt-6 glass rounded-xl p-5 border border-[#d4a85315]">
            <div className="border-t border-[#d4a85310]">
              <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">{isZh ? "分享你的星盤" : "Share Your Destiny Chart"}</p>
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
                  {(isZh
                    ? ["命宮","兄弟","夫妻","子女","財帛","疾厄","遷移","交友","官祿","田宅","福德","父母"]
                    : ["Life","Siblings","Spouse","Children","Wealth","Health","Travel","Friends","Career","Property","Fortune","Parents"]
                  ).map((palace) => (
                    <div key={palace} className="bg-[#151520] rounded-lg p-3 text-center border border-[#d4a85304]">
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
      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaid={() => { unlockReport("synastry_full"); window.location.href = "/synastry-full-report"; }}
        config={{ ...PAYWALL_CONFIGS.synastry, reportKey: "synastry_full" }}
      />
      <Footer />
      <CustomerService />
    </div>
  )
}
