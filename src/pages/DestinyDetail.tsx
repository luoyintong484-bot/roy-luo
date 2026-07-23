import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { trpc } from "@/providers/trpc"
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal"
import ShareModal from "@/components/ShareModal"
import { ZiweiDoushuPanel, ZiweiSynastryPanel } from "@/components/ZiweiDoushuPanel"
import { unlockReport } from "@/lib/payment-service"
import { getLocalPrice } from "@/lib/pricing"
import { buildZiweiChart, buildZiweiSynastry } from "@/lib/ziwei-doushu"
import { PAYMENT_COMING_SOON } from "@/const"
import Navbar from "@/components/Navbar"
import CustomerService from "@/components/CustomerService"
import Footer from "@/sections/Footer"
import {
  ArrowLeft, Star, Sparkles, Calendar, MapPin, Clock, Moon,
  Sun, ChevronRight, TrendingUp, Heart, Coins, Activity, BookOpen,
  Crown, Users
} from "lucide-react"

const aspectIcons: Record<string, typeof TrendingUp> = {
  "事业": TrendingUp, "感情": Heart, "财运": Coins, "健康": Activity, "学业": BookOpen,
}
const PREVIEW_FULL_DESTINY = false;

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

function ReportBody({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => {
        const match = paragraph.match(/^(【[^】]+】)\s*(.*)$/s);
        if (!match) {
          return (
            <p key={index} className="text-[15px] leading-[1.9] text-[#2f261d] font-[520] tracking-[0.2px]">
              {paragraph}
            </p>
          );
        }

        return (
          <div key={index} className="rounded-xl border border-[#d4a85325] bg-[#faf3e0] p-4 shadow-[inset_3px_0_0_rgba(212,168,83,0.72)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]" />
              <span className="rounded-full border border-[#d4a85330] bg-[#d4a85320] px-3 py-1 text-[13px] font-bold leading-none text-[#8a5a16]">
                {match[1]}
              </span>
            </div>
            <p className="text-[14px] leading-[1.85] text-[#2f261d] font-[480] tracking-[0.15px]">
              {match[2]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ComprehensiveReport({ isZh }: { isZh: boolean }) {
  const sections = [
    {
      icon: "💼", title: isZh ? "事業發展" : "Career Development",
      content: isZh
        ? `綜合八字日柱丙火與本命星盤第十宮太陽落位，你的職業天賦指向需要「可見度」和「影響力」的領域。丙火日主天生自帶光芒--你不是那種適合躲在幕後埋頭苦幹的類型，而是需要在舞臺中央被看見、被認可的配置。\n\n【天賦方向】太陽第十宮與火星形成六分相，賦予你極強的執行力和公眾表達能力。適合的行業包括：品牌管理、公關媒體、教育培訓、創意總監、創業者--任何需要「站出來說話」的崗位都是你的主場。\n\n【職場優勢】八字中木火通明，印星有力--你的學習能力比同齡人快很多。進入新領域的前三個月是你的黃金期，你能迅速掌握別人需要半年才能理解的東西。\n\n【關鍵轉折點】30歲前後土星回歸期間，你會面臨一次重要的職業重新定位。不要害怕轉行--你的星盤配置支持跨界發展，而且往往在「看起來不相關」的領域之間找到獨特的結合點。印度占星中第十宮主星與木星產生關聯，暗示34歲左右會有一次事業上的重大躍升，可能是創業、升職或轉換到更適合的賽道。\n\n【注意事項】你的火星在第八宮--在合夥或合作時，務必把財務條款寫清楚。你對合作夥伴的信任是優點，但沒有合約的信任是風險。`
        : `Based on your Bazi Bing Fire Day Master and Natal Chart 10th House Sun placement, your career talents point toward fields requiring "visibility" and "influence." Bing Fire individuals are born radiant — you're not built for backstage anonymity but for center-stage impact.\n\n【Talent Direction】Sun in 10th House sextile Mars grants exceptional execution and public expression. Suitable industries: brand management, PR/media, education & training, creative direction, entrepreneurship — any role demanding "standing up and speaking" is your arena.\n\n【Career Edge】Wood-Fire thriving in your Bazi chart with strong Seal star — your learning speed surpasses peers. The first 3 months in a new field are your golden window. Key turning point: Saturn return around age 30 brings a career recalibration. Don't fear pivoting — your chart supports cross-disciplinary growth.\n\n【Caution】Mars in 8th House — when entering partnerships, get financial terms in writing. Trust is a virtue, but trust without contracts is risk.`
    },
    {
      icon: "💰", title: isZh ? "財富運勢" : "Wealth & Finance",
      content: isZh
        ? `本命星盤中第二宮木星入廟，這是非常罕見的財富配置--你對金錢的直覺天生準確。你賺的每一筆錢背後都有你的邏輯，不是運氣好，是你的潛意識在做對的判斷。\n\n【正財偏財格局】八字中正財星坐於月柱，偏財星見於時柱--你的收入結構是「穩定工資+副業或投資收益」的組合。不要滿足於單一收入來源，你的配置天生適合雙軌甚至多軌收入模式。\n\n【財富積累方式】金星與木星的三分相賦予你「透過合作和人脈放大財富」的能力。比起自己埋頭苦幹，你更適合通過建立團隊、整合資源或利用社交網絡來創造財富。印度占星中第十一宮（收益宮）主星與木星產生連接，暗示你的財富增長與你的社交圈質量直接相關。\n\n【破財風險】火星八宮的配置警示你要注意合夥財務、借貸和投資中的風險。你比較容易因為信任對方而忽略必要的審查和合約--這不是你判斷力不好，是你傾向於看到人好的一面。建議所有涉及金錢的合作都要經過第三方審核。另外，木星雖然是吉星，但有時也會讓人過度樂觀--避免在情緒高漲時做大的投資決定。\n\n【財富轉折點】36歲前後，流年木星進入第二宮時，會有一次顯著的財富提升機會。這可能是一筆之前投資的回報、一個新的收入渠道、或一次職業躍升帶來的薪資大幅增長。保持你目前的積累節奏，不要因為短期的波動而打亂長期規劃。`
        : `Your Natal Chart shows Jupiter in the 2nd House — a rare wealth configuration. Your intuition about money is naturally accurate. Every dollar you earn has logic behind it.\n\n【Income Structure】Bazi shows Stable Wealth Star in the Month Pillar and Speculative Wealth in the Hour Pillar — your income is "stable salary + side/investment income." Don't settle for a single income stream.\n\n【Wealth Method】Venus trine Jupiter grants the ability to "amplify wealth through partnerships and networks." Focus on team-building and resource integration. Vedic astrology shows your 11th House (gains) connected to Jupiter — your wealth growth directly correlates with your social circle quality.\n\n【Risk Alert】Mars in 8th House warns caution in partnerships and investments. You tend to trust people easily — always get third-party review for money-related collaborations. Also, avoid making big investment decisions when emotionally high.\n\n【Key Window】Around age 36, transiting Jupiter enters your 2nd House — expect a significant wealth boost: investment returns, new income channels, or a major salary increase from career advancement.`
    },
    {
      icon: "💕", title: isZh ? "感情姻緣" : "Love & Relationships",
      content: isZh
        ? `金星落在第五宮--你對愛情的理解從來不只是「被愛」，而是「共同創造」。你需要的是能在精神層面與你共鳴的伴侶，而不僅僅是生活搭檔。\n\n【正緣特徵】綜合八字與星盤，你的正緣通常具有以下一個或多個特質：八字日支帶寅或午（與你的丙火形成良好互動）、星盤中太陽或月亮落在火象或風象星座、職業上具有一定創造性或公眾屬性。你們的相遇往往發生在與「學習、旅行、社交活動」相關的場合。\n\n【戀愛模式】月亮與水星的柔和相位讓你在感情中擅長表達--這很加分。但太陽與土星的對沖可能讓你一開始顯得有些距離感，需要時間才會真正打開心扉。你屬於「慢熱但持久」的類型，不是一見鍾情派，但一旦認定一個人，你的忠誠度極高。\n\n【婚姻走勢】印度占星中第七宮主星的位置暗示，你的婚姻會在30-35歲之間進入穩定階段。在此之前，你可能會經歷1-2段重要的戀愛關係，每一段都在幫你更清楚自己的需求。不要因為年齡焦慮而倉促決定--你的星盤顯示「晚婚但婚姻質量高」的趨勢。\n\n【相處建議】你的月亮在第六宮，這讓你在關係中容易「用做事代替說愛」--你以為把對方照顧好就是愛，但對方可能需要的是你的時間和注意力，而不是你的勞動成果。學會停下來，看著對方的眼睛，告訴Ta「我在這裡」。這對你來說可能比做任何事都更難--但也更重要。`
        : `Venus in the 5th House — your definition of love isn't just "being loved" but "co-creating." You need a partner who resonates with you spiritually, not just logistically.\n\n【Partner Traits】Bazi + Chart shows your ideal partner has: Day Branch containing Yin or Wu (harmonizing with your Bing Fire), Sun or Moon in Fire/Air signs, and a creative or public-facing career. Meeting often happens through learning, travel, or social events.\n\n【Love Pattern】Moon-Mercury soft aspect makes you emotionally expressive — a major plus. But Sun-Saturn opposition may create initial distance. You're "slow to warm but lasting" — not a love-at-first-sight person, but fiercely loyal once committed.\n\n【Marriage Timing】Vedic 7th House lord suggests marriage stabilizes between ages 30-35. Before that, 1-2 significant relationships help clarify what you truly need. Don't rush due to age anxiety — your chart shows "later marriage but higher quality."\n\n【Advice】Moon in 6th House makes you "show love through doing" — you think taking care of everything is love, but your partner may need your undivided attention, not your completed tasks. Learn to pause, look into their eyes, and simply say, "I'm here."`
    },
    {
      icon: "🏥", title: isZh ? "健康狀況" : "Health & Wellness",
      content: isZh
        ? `火星在第一宮的人通常精力充沛，但有一個容易被忽略的問題--你的意志力太強，強大到會覆蓋身體的疲勞信號。這不是優勢，是需要警惕的。\n\n【體質特點】八字中火旺木相，先天體質偏熱性。容易出現的問題集中在：心血管系統、肝膽功能、以及因為長期精神緊繃導致的偏頭痛或睡眠障礙。你比較不容易感冒或感染，但一旦生病，往往是因為長期積累的壓力和疲勞突然爆發。\n\n【易患疾病】印度占星中第六宮的配置提示需要特別關注消化系統--不是因為你吃得不好，而是因為你吃飯的時候在想別的事。你的腸胃問題多半是「情緒型」的--壓力大就胃痛、焦慮就腹瀉、生氣就脹氣。這不是藥能解決的，需要從情緒管理入手。另外，木星雖然是吉星，但當它影響你的健康宮時，可能讓你有「過度放縱」的傾向--暴飲暴食、熬夜、久坐不動。這些都需要有意識地去調整。\n\n【日常養生】不需要極端的飲食或運動方案。最適合你的是「穩定節奏」--固定時間吃飯、固定時間睡覺、每週2-3次中等強度的運動。瑜伽或太極比HIIT更適合你的體質。冥想或正念練習對你的幫助可能比你想像中大得多--你的問題不是身體不夠好，是頭腦停不下來。`
        : `Mars in 1st House gives abundant energy, but your willpower is so strong it overrides fatigue signals. This isn't a strength — it's a liability.\n\n【Constitution】Bazi shows dominant Fire with Wood support — naturally warm constitution. Vulnerable areas: cardiovascular, liver/gallbladder, and stress-induced migraines or insomnia.\n\n【Risk Areas】Vedic 6th House points to digestive issues — not from poor diet, but from eating while distracted. Your gut problems are largely emotional: stress→stomach pain, anxiety→digestive issues. This needs emotional management, not just medication. Jupiter's influence may lead to overindulgence — binge eating, late nights, sedentary patterns.\n\n【Daily Care】No extreme regimens needed. What suits you is "steady rhythm" — fixed meal times, fixed sleep times, 2-3 moderate workouts weekly. Yoga or Tai Chi suit your constitution better than HIIT. Meditation may help more than you think — your problem isn't physical fitness, it's an unstoppable mind.`
    },
  ];

  return (
    <div className="glass rounded-3xl p-5 sm:p-7 border border-[#d4a85335] space-y-6 animate-fade-in shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="text-center border-b border-[#d4a85318] pb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#d4a853] tracking-[0.2px]">
          {isZh ? "🔮 綜合命理完整報告" : "🔮 Comprehensive Destiny Report"}
        </h2>
        <p className="text-[11px] text-[#8a8aad88] mt-2 tracking-[0.18em] uppercase">
          {isZh ? "八字 · 本命星盤 · 印度占星 交叉驗證分析" : "Bazi · Natal · Vedic Cross-Validation"}
        </p>
      </div>
      {sections.map((s, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-[#d4a8531f] bg-[#151520]/92 p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[#d4a85308] blur-2xl" />
          <div className="relative mb-5 flex items-center gap-3 border-b border-[#d4a85314] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4a85326] bg-[#d4a85312] text-xl shadow-[0_0_24px_rgba(212,168,83,0.08)]">
              {s.icon}
            </div>
            <div>
              <div className="h-0.5 w-8 rounded-full bg-[#d4a853] mb-2" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#f7d9a8] tracking-[0.4px]">
                {s.title}
              </h3>
            </div>
          </div>
          <ReportBody text={s.content} />
        </div>
      ))}
    </div>
  );
}

function SynastryReportCard({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d4a85325] bg-[#faf3e0] p-5 sm:p-6 shadow-sm">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[#d4a85308] blur-2xl" />
      <div className="relative mb-5 flex items-center gap-3 border-b border-[#d4a85320] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4a85330] bg-[#d4a85315] text-xl">
          {icon}
        </div>
        <div>
          <div className="h-0.5 w-8 rounded-full bg-[#d4a853] mb-2" />
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2f261d] tracking-[0.4px]">
            {title}
          </h3>
        </div>
      </div>
      <ReportBody text={content} />
    </div>
  );
}

function SynastryBasicReport({ p1, p2, elementRel, isZh }: { p1: any; p2: any; elementRel: string; isZh: boolean }) {
  const p1Name = p1?.name || (isZh ? "你" : "You");
  const p2Name = p2?.name || (isZh ? "對方" : "Partner");
  const sections = [
    {
      icon: "💞",
      title: isZh ? "合盤普通版報告" : "Basic Synastry Report",
      content: isZh
        ? `${p1Name}與${p2Name}的基礎合盤顯示，這段關係不是單純靠新鮮感推動，而是帶有明顯的互補與牽引。${p1Name}的${p1.zodiac}能量更像是關係裡的主動感受源，${p2Name}的${p2.zodiac}能量則會影響關係的穩定節奏；兩個人靠近時，容易先感受到「被看見」或「被理解」，但真正走下去需要把情緒默契落到日常溝通裡。\n\n【關係定位】你們的日主組合為${p1.pillar}與${p2.pillar}，五行互動呈現「${elementRel}」。這代表兩個人在關係裡不是完全同頻，而是會透過差異來補足彼此：一方提供推動力，另一方提供校準感。這種配置適合從曖昧、相處、共同完成小目標開始累積信任，不適合一開始就用過高承諾壓迫關係。\n\n【核心優勢】${p1.mansion}與${p2.mansion}的星宿連結讓這段關係有一種「越了解越有內容」的特質。你們不是只適合短暫熱烈，而是適合在反覆交流中看到對方更深的一面。普通版先看結論：這段關係有吸引力，也有磨合點；如果雙方願意說清需求，它會比表面看起來更有延展性。\n\n【需要留意】你們的主要風險不是沒有感情，而是容易在關係節奏上誤會彼此。${p1Name}可能更在意當下回應，${p2Name}可能更需要時間確認安全感。不要用「對方不立刻回應」推導成「對方不在乎」，這會放大不必要的焦慮。`
        : `${p1Name} and ${p2Name}'s basic synastry shows this relationship is not driven by novelty alone; it carries clear complementarity and pull. ${p1Name}'s ${p1.zodiac} energy acts as the active feeling source, while ${p2Name}'s ${p2.zodiac} energy shapes the relationship's rhythm. When you move closer, the first feeling is often being seen or understood, but long-term growth requires emotional resonance to become daily communication.\n\n【Relationship Positioning】Your Day Masters are ${p1.pillar} and ${p2.pillar}, with an elemental interaction of "${elementRel}". This means you are not fully identical in frequency; difference is exactly how you complete each other. One side brings movement, the other calibration. This configuration suits gradual trust-building through conversation and shared small goals, not pressure-heavy commitment at the very beginning.\n\n【Core Strength】The mansion link between ${p1.mansion} and ${p2.mansion} gives the bond a "deeper with time" quality. This is not only short-lived intensity; repeated exchange helps you discover richer layers in each other. Basic conclusion: attraction exists, friction exists too. If both sides can name their needs clearly, the relationship has more room to grow than it first appears.\n\n【Watch Point】The main risk is not lack of feeling, but mismatched pacing. ${p1Name} may care more about immediate response, while ${p2Name} may need time to confirm safety. Do not translate delayed response into lack of care; that would inflate unnecessary anxiety.`
    },
  ];

  return (
    <div className="bg-white/80 rounded-3xl p-5 sm:p-7 border border-[#d4a85325] space-y-6 animate-fade-in shadow-sm">
      <div className="text-center border-b border-[#d4a85318] pb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#d4a853] tracking-[0.2px]">
          {isZh ? "💕 合盤普通版報告" : "💕 Basic Synastry Report"}
        </h2>
        <p className="text-[11px] text-[#8a8071] mt-2 tracking-[0.18em] uppercase">
          {isZh ? "關係定位 · 核心優勢 · 相處提醒" : "Positioning · Strengths · Relationship Notes"}
        </p>
      </div>
      {sections.map((section) => (
        <SynastryReportCard key={section.title} icon={section.icon} title={section.title} content={section.content} />
      ))}
    </div>
  );
}

function SynastryFullPreviewReport({ p1, p2, elementRel, isZh }: { p1: any; p2: any; elementRel: string; isZh: boolean }) {
  const p1Name = p1?.name || (isZh ? "你" : "You");
  const p2Name = p2?.name || (isZh ? "對方" : "Partner");
  const sections = [
    {
      icon: "🧲",
      title: isZh ? "核心吸引力與比較盤" : "Core Attraction & Synastry",
      content: isZh
        ? `完整版首先看比較盤，也就是兩個人的本命能量如何互相觸發。${p1Name}的${p1.zodiac}與${p2Name}的${p2.zodiac}並不是單純的星座配對，它更像兩套心理系統的接觸：一套負責主動靠近，一套負責判斷能不能長期停留。你們的吸引不是只有「喜歡」，而是對方身上有某種自己缺少、但又很想靠近的品質。\n\n【吸引來源】${p1Name}的日主${p1.pillar}與${p2Name}的日主${p2.pillar}形成${elementRel}，這代表兩個人在一起時會啟動彼此的補償機制。感情中最上頭的點，往往不是對方完美，而是對方剛好碰到了你內在長期空缺的地方。這種吸引力很強，但也容易讓人把「被觸動」誤認成「完全適合」。\n\n【金火互動話術】從合盤語境看，金星代表愛意表達與審美偏好，火星代表欲望、行動與衝突方式。你們的配置更像「先被氣場吸引，再透過互動確認」。如果關係處於曖昧期，對方可能不一定會用很直白的方式告白，但會透過靠近、試探、主動找話題或觀察你的反應來確認安全範圍。\n\n【專業判斷】這段關係的吸引力是真實存在的，但不是無條件穩定。它需要持續溝通來把吸引落地，否則容易停留在想像、猜測和情緒拉扯裡。`
        : `The full report begins with synastry: how two natal systems trigger each other. ${p1Name}'s ${p1.zodiac} and ${p2Name}'s ${p2.zodiac} are not just a zodiac match; they are two psychological systems meeting. One initiates closeness, the other evaluates long-term safety. The attraction is not merely "liking"; the other person carries a quality you lack and instinctively want to move toward.\n\n【Attraction Source】${p1Name}'s ${p1.pillar} Day Master and ${p2Name}'s ${p2.pillar} Day Master form ${elementRel}, activating mutual compensation. The most intoxicating part is rarely that the other person is perfect; it is that they touch a long-empty inner space. This is powerful, but it can make you mistake being triggered for being fully compatible.\n\n【Venus-Mars Language】In synastry, Venus describes affection and taste; Mars describes desire, action, and conflict style. Your configuration reads as "drawn by aura first, confirmed through interaction later." If this is still a situationship, the other may not confess directly, but will test closeness through conversation, proximity, and watching your responses.\n\n【Professional Read】The attraction is real, but not automatically stable. It needs communication to become grounded; otherwise it can remain in imagination, guessing, and emotional push-pull.`
    },
    {
      icon: "🌙",
      title: isZh ? "情緒需求與相處模式" : "Emotional Needs & Daily Pattern",
      content: isZh
        ? `合盤真正能不能走長，不能只看吸引力，還要看月亮與水星象徵的情緒照顧和溝通節奏。你們的關係裡，一方更容易追求即時回應，另一方更容易先觀察再表態；這會讓互相喜歡的兩個人，因為節奏不同而誤以為對方冷淡或壓迫。\n\n【月亮需求】${p1Name}在關係裡更需要確認感：對方有沒有回應、情緒有沒有接住、說過的話是否被記得。${p2Name}則更需要空間感：不是不在乎，而是需要保留一點自己的節奏。當這兩種需求相遇時，最容易出現「一方追，一方退」的模式。\n\n【水星溝通】你們適合把關係裡的模糊感說清楚，但不適合在情緒最高點討論。水星代表信息交換，當情緒升高時，訊息會被安全感需求扭曲：一句普通的話可能被聽成拒絕，一次沉默可能被解讀為冷暴力。建議使用低壓表達，例如「我不是要你立刻給答案，我只是想知道你現在的狀態」。\n\n【相處建議】這段關係最需要建立「可預期性」。不是每天黏在一起，而是讓彼此知道：忙的時候怎麼說、需要空間時怎麼說、不舒服時怎麼說。可預期性一旦建立，吸引力會轉化成穩定感。`
        : `Long-term potential is not measured by attraction alone; it depends on Moon and Mercury themes: emotional care and communication rhythm. In this relationship, one side seeks immediate response while the other observes before expressing. Two people can like each other and still misread pacing as coldness or pressure.\n\n【Moon Needs】${p1Name} needs confirmation in relationship: response, emotional reception, and remembered details. ${p2Name} needs breathing room: not because they do not care, but because they require their own rhythm. When these needs meet, a chase-withdraw pattern can appear.\n\n【Mercury Communication】You benefit from naming ambiguity, but not at emotional peaks. Mercury governs information exchange; when emotions rise, messages are distorted by safety needs. A normal sentence may sound like rejection; silence may be read as punishment. Use low-pressure phrasing: "I don't need an immediate answer, I just want to know where you are emotionally."\n\n【Advice】The relationship needs predictability. Not constant closeness, but clear rules for busyness, space, and discomfort. Once predictability exists, attraction can become stability.`
    },
    {
      icon: "⚡",
      title: isZh ? "矛盾點、業力課題與修復方式" : "Conflict, Karma & Repair",
      content: isZh
        ? `你們的合盤不是完全無摩擦型，而是「有吸引，也有功課」的配置。這類關係最容易讓人又心動又不安：靠近時很有感覺，但一旦涉及承諾、邊界、未來安排，就容易啟動防禦。\n\n【核心矛盾】${p1Name}與${p2Name}的五行互動為${elementRel}，這說明你們的矛盾不一定來自不愛，而是來自處理安全感的方式不同。一方可能想透過確認關係來安心，另一方可能想透過保留空間來安心。兩種方式都合理，但如果不說清楚，就會互相傷害。\n\n【業力課題】${p1.mansion}與${p2.mansion}的星宿關係帶有明顯的鏡像感：你們會把彼此最需要成長的地方照出來。這不是「孽緣」的簡單標籤，而是關係中的功課感。你在對方身上看到的刺痛點，往往也是你自己需要整合的部分。\n\n【修復方式】吵架時不要追求立刻贏，而要追求立刻降溫。建議設定三句安全句：「我現在情緒上來了，但我不是要放棄你」、「我們先停一下，等30分鐘再聊」、「我想解決問題，不是攻擊你」。這三句話比講道理更能保護關係。`
        : `This is not a frictionless synastry; it is "attraction plus lessons." These relationships often feel both exciting and unsettling: closeness feels powerful, but commitment, boundaries, and future planning can activate defenses.\n\n【Core Conflict】The elemental interaction is ${elementRel}, which means conflict does not necessarily come from lack of love, but from different safety strategies. One person seeks certainty through definition; the other seeks safety through space. Both are reasonable, but unnamed differences can hurt.\n\n【Karmic Lesson】The ${p1.mansion}-${p2.mansion} mansion link has a mirror quality: you reflect each other's growth points. This is not a simplistic "bad karma" label; it is relationship coursework. What hurts in the other often reveals what you still need to integrate within yourself.\n\n【Repair Method】In conflict, do not aim to win quickly; aim to cool down quickly. Use safety sentences: "My emotions are high, but I am not giving up on you." "Let's pause and talk again in 30 minutes." "I want to solve the problem, not attack you." These protect the bond better than logic.`
    },
    {
      icon: "🧭",
      title: isZh ? "未來發展趨勢與行動建議" : "Future Trend & Action Guide",
      content: isZh
        ? `未來三到六個月，這段關係的重點不是突然定局，而是逐步看清雙方是否願意為關係投入穩定行動。合盤裡的吸引力已經存在，接下來要看的，是能不能從「情緒牽引」走向「現實配合」。\n\n【短期趨勢】如果你們正在曖昧，未來一段時間會出現一次更明確的互動窗口：可能是對方主動靠近、一次深聊、一次見面安排，或某個讓關係重新升溫的契機。你需要做的不是逼問結果，而是觀察對方是否有持續行動。\n\n【中期趨勢】如果你們已經在一起，接下來會進入生活節奏磨合期。這時候不要只看甜不甜，而要看能不能處理壓力、時間安排、金錢觀與邊界。真正有長期潛力的關係，不是永遠不吵，而是吵完之後能不能更懂彼此。\n\n【行動建議】第一，不要用測試對方的方式尋找安全感；直接表達需求更有效。第二，不要把所有問題都歸因於「不夠愛」；很多問題其實是節奏、表達和防禦方式不同。第三，保留自己的生活重心。你的穩定感越強，這段關係越不容易陷入拉扯。`
        : `Over the next three to six months, the key is not sudden finality but whether both people can invest stable actions. The attraction already exists; the question is whether emotional pull can become real-life coordination.\n\n【Short-Term Trend】If this is a situationship, a clearer interaction window is likely: more initiative, a deep conversation, a meeting arrangement, or a moment that warms the connection again. Do not force a conclusion; observe whether action becomes consistent.\n\n【Mid-Term Trend】If you are already together, the next phase tests rhythm: pressure, time management, money values, and boundaries. Long-term potential is not about never fighting; it is about whether conflict produces more understanding.\n\n【Action Guide】First, do not seek safety through testing; direct needs work better. Second, do not reduce every problem to "not enough love"; many issues are pacing, expression, and defenses. Third, keep your own center. The more stable you are, the less the relationship falls into push-pull.`
    },
  ];

  return (
    <div className="bg-white/80 rounded-3xl p-5 sm:p-7 border border-[#d4a85325] space-y-6 animate-fade-in shadow-sm">
      <div className="text-center border-b border-[#d4a85318] pb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#d4a853] tracking-[0.2px]">
          {isZh ? "💎 合盤完整版深度報告" : "💎 Full Synastry Deep Report"}
        </h2>
        <p className="text-[11px] text-[#8a8071] mt-2 tracking-[0.18em] uppercase">
          {isZh ? "比較盤 · 情緒需求 · 業力課題 · 發展建議" : "Synastry · Moon Needs · Karmic Lessons · Action Guide"}
        </p>
      </div>
      {sections.map((section) => (
        <SynastryReportCard key={section.title} icon={section.icon} title={section.title} content={section.content} />
      ))}
    </div>
  );
}

export default function DestinyDetail() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW" || locale === "zh";
  const [activeTab, setActiveTab] = useState<"overview" | "bazi" | "vedic" | "ziwei">("overview")
  const [showPayModal, setShowPayModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // ---- Read actual user input from navigation state ----
  const location = useLocation()
  const state = location.state as any
  const isSynastry = state?.type === "synastry"
  const isNatal = state?.type === "natal" || !state?.type
  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate("/destiny")
  }

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
  function getBaziYearPillar(birthDate?: string): string { if(!birthDate) return "-"; const d=new Date(birthDate); const s=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]; const b=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]; const y=d.getFullYear(); return s[(y-4)%10]+b[(y-4)%12] }
  function getBaziMonthPillar(birthDate?: string): string { if(!birthDate) return "-"; const d=new Date(birthDate); const s=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]; const b=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]; const y=d.getFullYear(); const yStem=(y-4)%10; const m=d.getMonth()+1; const mStem=(yStem*2+m)%10; return s[mStem]+b[m%12] }
  function getBaziHourPillar(birthDate?: string, birthTime?: string): string { if(!birthDate||!birthTime) return "-"; const s=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]; const b=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]; const h=parseInt(birthTime.split(":")[0])||12; const zh=(h+1)>>1; const base=new Date(1900,0,31); const diff=Math.floor((new Date(birthDate).getTime()-base.getTime())/86400000); const dayStem=(diff+10)%10; return s[(dayStem*2+zh)%10]+b[zh%12] }
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
    if (!state?.birthDate) return null
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

  const ziweiChart1 = useMemo(() => {
    if (!synastryData?.p1) {
      return buildZiweiChart({
        name: state?.name || "User",
        birthDate: state?.birthDate || "1995-03-15",
        birthTime: state?.birthTime || "14:30",
        gender: state?.gender || "male",
      });
    }
    return buildZiweiChart({
      name: synastryData.p1.name,
      birthDate: synastryData.p1.birthDate,
      birthTime: synastryData.p1.birthTime,
      gender: state?.gender || "male",
    });
  }, [synastryData?.p1?.name, synastryData?.p1?.birthDate, synastryData?.p1?.birthTime, state?.name, state?.birthDate, state?.birthTime, state?.gender]);

  const ziweiChart2 = useMemo(() => {
    if (!synastryData?.p2) return null;
    return buildZiweiChart({
      name: synastryData.p2.name,
      birthDate: synastryData.p2.birthDate,
      birthTime: synastryData.p2.birthTime,
      gender: state?.gender2 || "female",
    });
  }, [synastryData?.p2?.name, synastryData?.p2?.birthDate, synastryData?.p2?.birthTime, state?.gender2]);

  const ziweiSynastry = useMemo(() => {
    if (!ziweiChart1 || !ziweiChart2) return null;
    return buildZiweiSynastry(ziweiChart1, ziweiChart2);
  }, [ziweiChart1, ziweiChart2]);

  useEffect(() => {
    try {
      if (ziweiChart1) {
        localStorage.setItem("r7_ziwei_natal_report", JSON.stringify(ziweiChart1));
      }
      if (ziweiChart1 && ziweiChart2 && ziweiSynastry) {
        localStorage.setItem("r7_ziwei_synastry_report", JSON.stringify({
          chartA: ziweiChart1,
          chartB: ziweiChart2,
          result: ziweiSynastry,
        }));
      }
    } catch (error) {
      console.warn("[ziwei-report-cache] Failed to cache report payload:", error);
    }
  }, [ziweiChart1, ziweiChart2, ziweiSynastry]);

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
      detail: "本月事业宫受木星与金星吉星照拂，适合推进新计划。职场中容易获得上司和前辈的认可，有升职加薪的窗口期。\n\n【性格底层逻辑】你的太阳落于第十宫，天生具备领导气质和公众影响力--你不是那种甘于躲在幕后的人。这种配置赋予你对权威的天然亲和力，也让你比同龄人更早意识到「事业不只是赚钱，是实现自我」。\n\n【天赋优势】火星与土星的六分相为你提供了罕见的「行动力+耐力」组合。你不是爆发型选手，而是长跑型--这恰恰是最容易在职场走远的类型。\n\n【潜在短板】月亮在第六宫可能让你对工作细节过度敏感，容易因为同事的一句无心之言而内耗。学会区分「值得在意的」和「可以放过的」。\n\n【人生课题】学会授权和信任。你的标准很高，但不是所有人都需要达到你的标准才算合格。" },
    { name: "感情", level: 3, desc: "桃花初现，需耐心经营",
      detail: "感情运势平稳上升，单身者可能在朋友聚会或工作场合遇到心仪对象。有伴侣者需要注意沟通方式，避免小摩擦积累影响感情温度。\n\n【性格底层逻辑】金星落在第五宫--你对爱情的定义从来不只是「被爱」，而是「共同创造」。你需要的关系不是依赖，是共振。\n\n【天赋优势】月亮与水星的柔和相位赋予你极强的情感表达能力--你能说出别人心里有但说不出口的话，这在亲密关系中是非常珍贵的品质。\n\n【潜在短板】太阳与土星的对冲可能让你在感情中不自觉地筑墙。你渴望亲密，但同时也害怕失去自我--这两者并不矛盾，只是需要练习。\n\n【人生课题】允许自己在爱里不那么完美。你不需要在每一段关系中都是「做得更好」的那个人。" },
    { name: "财运", level: 5, desc: "财星高照，偏财运极佳",
      detail: "财运为本月最强领域，正财稳定的同时偏财运也相当活跃。适合进行小额分散投资，但切忌贪心追高。月底可能有之前被忽略的意外进账。\n\n【性格底层逻辑】第二宫木星入庙--你对财富的直觉天生准确。不是那种会盲目跟风的人，你赚的每一笔钱背后都有你的逻辑。\n\n【天赋优势】金星与木星的三分相赋予你「优雅地获得资源」的能力--比起蛮干，你更擅长通过合作和人际网络来放大财富。\n\n【潜在短板】火星在第八宫暗示你在「别人的钱」上容易冲动--合伙投资需谨慎，不要因为信任对方就跳过合同和条款。\n\n【人生课题】建立被动收入。你的天赋配置非常适合创造「一次努力、持续回报」的收入模式。" },
    { name: "健康", level: 3, desc: "注意休息，避免过劳",
      detail: "整体健康状况良好，但高强度工作可能导致睡眠质量下降和肩颈劳损。建议每周至少安排2-3次适度运动，保持规律作息，多补充水分和维生素B族。\n\n【性格底层逻辑】火星在第一宫的人容易把身体的信号忽略掉--你的意志力太强，强大到会覆盖身体的疲惫。这不是优势，是隐患。\n\n【天赋优势】木星的良好相位让你拥有不错的恢复力--只要给身体一点喘息的空间，它会比你想象中更快复原。\n\n【潜在短板】土星在第六宫--你容易把休息看成「浪费时间」。这是一个需要被挑战的信念：真正的长期主义，是把身体当成要用一辈子的工具来维护。\n\n【人生课题】把健康放进日程表。不是「有空就去运动」，而是「这个时间就是留给身体的，不做别的。」" },
    { name: "学业", level: 4, desc: "思维敏捷，考试运佳",
      detail: "水星进入有利位置，理解力和记忆力都处于高峰期，适合备考或学习新技能。考试发挥稳定，有望取得理想成绩。\n\n【性格底层逻辑】水星在第三宫--你的思维不是「学习」，是「吸收」。你对信息有一种不费力的处理能力，这让你在需要快速掌握新知识的领域天然占优。\n\n【天赋优势】水星与木星的六分相赋予你「把碎片拼成系统」的能力。你不是死记硬背型，你是「理解框架后再往里填内容」型--这在考试和实战中都是优势。\n\n【潜在短板】容易因为兴趣广泛而浅尝辄止。你的好奇心是天赋，但也可能变成「什么都懂一点，但什么都不精」。\n\n【人生课题】选定一个深度方向，坚持三年。你的配置需要的是「深耕」而非「广撒网」--一旦选定，你会在那个领域走得很远。" },
  ]
  const advice = [
    { titleEn: "Favorable this month", titleZh: "本月適宜", itemsEn: ["Attend social events", "Start new projects", "Learn new skills", "Invest and manage finances"], itemsZh: ["參加社交活動", "啟動新項目", "學習新技能", "小額投資理財"] },
    { titleEn: "Unfavorable this month", titleZh: "本月不宜", itemsEn: ["Impulse spending", "Arguments with others", "Overtime and late nights", "Trusting others too easily"], itemsZh: ["衝動消費", "與人爭執", "熬夜加班", "輕信他人"] },
    { titleEn: "Lucky Tips", titleZh: "幸運小物", itemsEn: ["Wear gold accessories", "Dress in warm colors", "Place green plants on your desk", "Meditate 15 minutes daily"], itemsZh: ["佩戴金色飾品", "穿著暖色調衣物", "辦公桌擺放綠植", "每日冥想15分鐘"] },
  ]

  const tabs = isSynastry ? [
    { key: "overview" as const, label: isZh ? "關係總覽" : "Relationship Overview", icon: Star },
    { key: "ziwei" as const, label: isZh ? "紫微合盤" : "Ziwei Synastry", icon: Crown },
  ] : [
    { key: "overview" as const, label: isZh ? "總覽" : "Overview", icon: Star },
    { key: "ziwei" as const, label: isZh ? "紫微命盤" : "Ziwei Chart", icon: Crown },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back */}
          <button onClick={goBack} className="inline-flex items-center gap-1.5 text-xs text-[#8a8071] hover:text-[#2f261d] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />{isZh ? "返回上一頁" : "Back"}
          </button>

          {/* Header */}
          <div className="bg-white/80 rounded-2xl p-6 mb-6 relative overflow-hidden border border-[#d4a85320] shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#faf3e0] to-[#fffaf0] flex items-center justify-center text-2xl border border-[#d4a85325]">
                <Sparkles className="w-7 h-7 text-[#d4a853]" />
              </div>
              <div>
                <div className="flex items-center justify-between flex-1">
                  <h1 className="font-display text-xl font-bold text-[#2f261d]">
                    {isSynastry && synastryData?.p2
                      ? (isZh
                          ? `${synastryData.p1.name || "你"} × ${synastryData.p2.name || "對方"} 雙人合盤`
                          : `${synastryData.p1.name || "You"} × ${synastryData.p2.name || "Partner"} Synastry`)
                      : (isZh ? `${userInfo.name} 的紫微斗數命盤` : `${userInfo.name}'s Ziwei Doushu Chart`)
                    }
                  </h1>
                  {!PREVIEW_FULL_DESTINY && (
                    <button onClick={() => setShowPayModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all animate-pulse flex-shrink-0 ml-3">
                      {PAYMENT_COMING_SOON
                        ? (isZh ? "完整報告即將上線" : "Full Report Coming Soon")
                        : (isZh
                            ? `解鎖完整解析 ${getLocalPrice(isSynastry ? "synastry" : "natal").display}`
                            : `Unlock Full Reading ${getLocalPrice(isSynastry ? "synastry" : "natal").display}`)}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a8071]">
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
                    <span key={tag} className="px-2 py-0.5 bg-[#faf3e0] text-[#b8860b] text-[9px] rounded-full border border-[#d4a85325]">{tag}</span>
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
                    ? "bg-[#d4a853] text-white shadow-sm"
                    : "bg-[#faf3e0] text-[#8a8071] hover:text-[#2f261d] border border-[#d4a85325] hover:border-[#d4a85350]"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {/* Dual basic info bar — synastry only */}
          {isSynastry && synastryData?.p2 && (
            <div className="mb-6 bg-white/80 rounded-xl p-4 border border-[#d4a85320] shadow-sm">
              <h3 className="text-xs font-semibold text-[#b8860b] mb-3 text-center">{isZh ? "雙方基礎資訊" : "Both Parties Basic Info"}</h3>
              <div className="grid grid-cols-2 gap-4">
                {[synastryData.p1, synastryData.p2].map((person,pi) => (
                  <div key={pi} className="bg-[#faf3e0] rounded-lg p-3 border border-[#d4a85320]">
                    <p className="text-xs font-bold text-[#2f261d] mb-2">{person.name}</p>
                    <div className="text-[10px] text-[#6f6470] space-y-0.5">
                      <p>{isZh ? "出生" : "Born"}: {person.birthDate?.slice(0,10) || "-"} {person.birthTime || ""}</p>
                      <p>{isZh ? "紫微参考" : "Ziwei Ref"}: {person.pillar}</p>
                      <p>{isZh ? "星座" : "Zodiac"}: {person.zodiac} · {person.element}</p>
                      <p>{isZh ? "星宿" : "Mansion"}: {person.mansion}</p>
                      <p>{isZh ? "上升" : "Rising"}: {getZodiacSign(new Date(new Date(person.birthDate).getTime()+43200000))}</p>
                    </div>
                  </div>
                ))}
              </div>
              {synastryData?.elementRel && (
                <div className="mt-3 bg-[#faf3e0] rounded-lg p-2 text-center border border-[#d4a85325]">
                  <p className="text-xs text-[#b8860b]">{synastryData.elementRel}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall Score */}
              <div className="bg-white/80 rounded-xl p-5 border border-[#d4a85320] shadow-sm">
                <h3 className="text-sm font-semibold text-[#2f261d] mb-4">{isSynastry ? (isZh ? "關係總覽" : "Relationship Overview") : (isZh ? "總覽" : "Overview")}</h3>
                {isSynastry && synastryData?.p2 ? (
                  <SynastryOverview p1={synastryData.p1} p2={synastryData.p2} elementRel={synastryData.elementRel} isZh={isZh} />
                ) : synastryData?.p1 ? (
                  <NatalOverview p1={synastryData.p1} isZh={isZh} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {aspects.map((a) => {
                      const Icon = (a.name && aspectIcons[a.name]) || TrendingUp
                      return (
                        <div key={a.name} className="bg-[#faf3e0] rounded-lg p-3 border border-[#d4a85320]">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Icon className="w-3.5 h-3.5 text-[#b8860b]" />
                            <span className="text-xs text-[#6f6470]">{a.name}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div key={i} className={`w-4 h-1.5 rounded-full ${i < a.level ? "bg-[#d4a853]" : "bg-[#e5d5b0]"}`} />
                            ))}
                          </div>
                          <p className="text-[10px] text-[#8a8071] leading-relaxed">{a.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Key Insights — dynamic for synastry, fallback for natal */}
              <div className="bg-white/80 rounded-xl p-5 border border-[#d4a85320] shadow-sm">
                <h3 className="text-sm font-semibold text-[#2f261d] mb-3">{isZh ? "核心洞察" : "Core Insights"}</h3>
                <div className="bg-[#faf3e0] rounded-lg p-4 border border-[#d4a85325]">
                  <p className="text-sm text-[#2f261d] leading-relaxed">
                    {isSynastry && synastryData?.p2 ? (
                      isZh ? (
                        <>
                          {ziweiChart1?.name || "你"}為<span className="text-[#d4a853]">{ziweiChart1?.mainStar}</span>坐命，
                          {ziweiChart2?.name || "對方"}為<span className="text-[#d4a853]">{ziweiChart2?.mainStar}</span>坐命。
                          這段合盤的重點不是單看分數，而是看雙方命宮、夫妻宮與四化互動是否能把吸引力落到日常相處。
                          目前盤面顯示<span className="text-[#d4a853]">{ziweiSynastry?.label}</span>：
                          {ziweiSynastry?.chemistry} {ziweiSynastry?.risk}
                        </>
                      ) : (
                        <>
                          {ziweiChart1?.name || "You"} has <span className="text-[#d4a853]">{ziweiChart1?.mainStar}</span> in the life palace,
                          while {ziweiChart2?.name || "Partner"} has <span className="text-[#d4a853]">{ziweiChart2?.mainStar}</span>.
                          This synastry focuses on life palaces, spouse palaces and transformation stars, not only a score.
                          Current chart tone: <span className="text-[#d4a853]">{ziweiSynastry?.label}</span>. {ziweiSynastry?.chemistry} {ziweiSynastry?.risk}
                        </>
                      )
                    ) : (
                      isZh ? (
                        <>你的紫微命盤以<span className="text-[#d4a853]">{ziweiChart1?.mainStar || "命宮主星"}</span>為核心，命宮落在<span className="text-[#d4a853]">{ziweiChart1?.mingPalace || "命宮"}</span>，身宮落在<span className="text-[#d4a853]">{ziweiChart1?.shenPalace || "身宮"}</span>。免費盤面先讓你看到十二宮與主星分布；完整解析會細拆事業、感情、財帛與未來節點。</>
                      ) : (
                        <>Your Ziwei chart centers on <span className="text-[#d4a853]">{ziweiChart1?.mainStar || "the life-palace star"}</span>, with the life palace at <span className="text-[#d4a853]">{ziweiChart1?.mingPalace || "Life Palace"}</span> and body palace at <span className="text-[#d4a853]">{ziweiChart1?.shenPalace || "Body Palace"}</span>. The free chart shows palace and star distribution; the full report expands career, love, wealth and timing.</>
                      )
                    )}
                  </p>
                </div>
              </div>

              {isSynastry && synastryData?.p2 ? (
                <>
                  <SynastryBasicReport p1={synastryData.p1} p2={synastryData.p2} elementRel={synastryData.elementRel} isZh={isZh} />
                </>
              ) : (
                <div className="bg-white/80 rounded-xl p-5 border border-[#d4a85320] shadow-sm">
                  <h3 className="text-sm font-semibold text-[#2f261d] mb-3">{isZh ? "先看这三点" : "Start With These 3 Points"}</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      [isZh ? "命宮主軸" : "Life Palace", ziweiChart1?.summary || (isZh ? "先看命宫主星和身宫落点，快速抓到你的底层节奏。" : "Start from the life and body palaces to catch the chart's core rhythm.")],
                      [isZh ? "事業方向" : "Career", isZh ? "官禄宫会告诉你更适合被看见、被认可，还是先稳扎稳打累积实力。" : "The career palace shows whether your path is visibility-led or strength-led."],
                      [isZh ? "感情模式" : "Love", isZh ? "夫妻宫重点看你在关系里要安全感、节奏感，还是精神共鸣。" : "The spouse palace highlights your main relationship need and pacing."],
                    ].map(([title, body]) => (
                      <div key={title} className="rounded-xl border border-[#d4a85320] bg-[#faf3e0] p-3">
                        <p className="text-xs font-bold text-[#b8860b]">{title}</p>
                        <p className="mt-2 text-[11px] leading-relaxed text-[#6f6470]">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!PREVIEW_FULL_DESTINY && (
                <div className="bg-gradient-to-br from-[#fff5f5] to-[#fef2f2] rounded-xl p-4 border border-[#e56b6f30] text-center shadow-sm">
                  <p className="text-xs text-[#2f261d] mb-2">
                    {isSynastry
                      ? (isZh ? "基於雙方紫微命盤、夫妻宮、主星四化與關係宮位的完整合盤報告" : "Full synastry report based on Ziwei palaces, spouse houses, main stars and transformations")
                      : (isZh ? "基於紫微十二宮、命宮身宮、主星四化與流年節點的個人完整解析" : "Full natal report based on Ziwei 12 palaces, life/body palaces, main stars and timing")}
                  </p>
                  <button onClick={() => setShowPayModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all">
                    {PAYMENT_COMING_SOON
                      ? (isZh ? "完整解析即將上線" : "Full Report Coming Soon")
                      : (isZh
                          ? `解鎖${isSynastry ? "紫微合盤" : "紫微個人"}完整解析 ${getLocalPrice(isSynastry ? "synastry" : "natal").display}`
                          : `Unlock ${isSynastry ? "Ziwei Synastry" : "Ziwei Natal"} Report ${getLocalPrice(isSynastry ? "synastry" : "natal").display}`)}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "ziwei" && (
            <div className="space-y-4 animate-fade-in">
              {isSynastry && ziweiChart1 && ziweiChart2 && ziweiSynastry ? (
                <>
                  <ZiweiSynastryPanel chartA={ziweiChart1} chartB={ziweiChart2} result={ziweiSynastry} />
                  <div className="glass rounded-xl p-4 border border-[#FFB6C120] text-center">
                    <p className="text-xs text-[#f0e6d3] mb-2">
                      {isZh ? "合盤盘面免费查看，完整版会展开夫妻宫、命宫互照、吸引力来源、长期磨合与关系建议。" : "The synastry chart is free. The full report expands spouse palaces, life-palace resonance, attraction, friction and long-term advice."}
                    </p>
                    <button onClick={() => setShowPayModal(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all">
                      {isZh ? `解鎖紫微合盤完整解析 ${getLocalPrice("synastry").display}` : `Unlock Ziwei Synastry ${getLocalPrice("synastry").display}`}
                    </button>
                  </div>
                </>
              ) : ziweiChart1 ? (
                <>
                  <ZiweiDoushuPanel chart={ziweiChart1} />
                  <div className="glass rounded-xl p-4 border border-[#FFB6C120] text-center">
                    <p className="text-xs text-[#f0e6d3] mb-2">
                      {isZh ? "紫微命盘免费查看，完整版会展开命宫、身宫、十二宫、主星四化、事业感情财运与未来节点。" : "The Ziwei chart is free. The full report expands life/body palaces, 12 palaces, four transformations, career, love, wealth and timing."}
                    </p>
                    <button onClick={() => setShowPayModal(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-xs font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all">
                      {isZh ? `解鎖紫微個人完整解析 ${getLocalPrice("natal").display}` : `Unlock Ziwei Natal Report ${getLocalPrice("natal").display}`}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === "bazi" && (
            <div className="space-y-4 animate-fade-in">
              {/* Natal: personal 4 pillars */}
              {!isSynastry && synastryData?.p1 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">{isZh ? "本八字星盤" : "Bazi Chart"} — {synastryData.p1.name}</h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {(() => { const bd=synastryData.p1.birthDate||""; const bt=synastryData.p1.birthTime||""; return [{l:isZh?"年柱":"Year",d:getBaziYearPillar(bd)},{l:isZh?"月柱":"Month",d:getBaziMonthPillar(bd)},{l:isZh?"日柱":"Day",d:synastryData.p1.pillar},{l:isZh?"時柱":"Hour",d:bt?getBaziHourPillar(bd,bt):(isZh?"未知":"N/A")}]; })().map((c,i) => (
                      <div key={i} className="bg-[#151520] rounded-lg p-3 text-center border border-[#d4a85306]">
                        <div className="text-[11px] text-[#b0b0c8] mb-2">{c.l}</div>
                        <div className="text-lg font-display font-bold text-[#d4a853]">{c.d}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#8a8aad] leading-relaxed">
                    {isZh
                      ? `日主${synastryData.p1.pillar[0]}，${synastryData.p1.element}命。${synastryData.p1.zodiac}，星宿${synastryData.p1.mansion}。四柱八字揭示了个人先天命格与运势走向的基础框架。`
                      : `Day Master ${synastryData.p1.pillar[0]}, ${synastryData.p1.element} element. ${synastryData.p1.zodiac}, mansion ${synastryData.p1.mansion}. The four pillars reveal the foundational framework of innate destiny and life direction.`}
                  </p>
                </div>
              )}

              {/* Synastry: dual 4 pillars side by side */}
              {isSynastry && synastryData?.p2 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">{isZh ? "八字合盤 · 雙方四柱" : "Bazi Synastry · Dual Four Pillars"}</h3>
                  {[synastryData.p1, synastryData.p2].map((person, pi) => (
                    <div key={pi} className={pi>0?"mt-4":""}>
                      <p className="text-xs text-[#d4a853] mb-2 font-medium">{person.name} - {isZh?"八字四柱":"Four Pillars"}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(() => { const bd=person.birthDate||""; const bt=person.birthTime||""; return [{l:isZh?"年柱":"Year",d:getBaziYearPillar(bd)},{l:isZh?"月柱":"Month",d:getBaziMonthPillar(bd)},{l:isZh?"日柱":"Day",d:person.pillar},{l:isZh?"時柱":"Hour",d:bt?getBaziHourPillar(bd,bt):(isZh?"未知":"N/A")}]; })().map((c,i) => (
                          <div key={i} className="bg-[#151520] rounded-lg p-3 text-center border border-[#d4a85306]"><div className="text-[11px] text-[#b0b0c8] mb-2">{c.l}</div><div className="text-base font-display font-bold text-[#d4a853]">{c.d}</div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {synastryData?.elementRel && (
                    <div className="mt-4 bg-[#d4a85306] rounded-lg p-3 border border-[#d4a85310]"><p className="text-xs text-[#d4a853]">{synastryData.elementRel}</p></div>
                  )}
                </div>
              )}

              {/* Fallback: mock data */}
              {!synastryData?.p1 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Four Pillars Bazi Chart</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ label: "Year", ...baziData.year },{ label: "Month", ...baziData.month },{ label: "Day", ...baziData.day },{ label: "Hour", ...baziData.hour }].map((col) => (
                      <div key={col.label} className="bg-[#151520] rounded-lg p-3 text-center border border-[#d4a85306]">
                        <div className="text-[11px] text-[#b0b0c8] mb-2">{col.label}</div><div className="text-lg font-display font-bold text-[#d4a853]">{col.gan}{col.zhi}</div><div className="text-[9px] text-[#8a8aad33] mt-1">Hidden: {col.hidden}</div><div className="text-[9px] text-[#d4a85344] mt-0.5">{col.element}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "vedic" && (
            <div className="space-y-4 animate-fade-in">
              {/* Natal: personal planet signs + houses */}
              {!isSynastry && synastryData?.p1 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">{isZh ? "印度占星星盤" : "Vedic Chart"} — {synastryData.p1.name}</h3>
                  <p className="text-xs text-[#8a8aad] mb-3">{isZh ? "行星落座" : "Planet Signs"}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[{p:"Sun",z:synastryData.p1.zodiac,h:1},{p:"Moon",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()-172800000)),h:4},{p:"Mercury",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()+86400000)),h:3},{p:"Venus",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()-86400000)),h:2},{p:"Mars",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()+259200000)),h:5},{p:"Jupiter",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()+518400000)),h:9},{p:"Saturn",z:getZodiacSign(new Date(new Date(synastryData.p1.birthDate).getTime()+777600000)),h:10}].map(pl => (
                      <div key={pl.p} className="bg-[#151520] rounded-lg p-3 border border-[#d4a85308]">
                        <div className="text-[11px] text-[#b0b0c8]">{pl.p}</div>
                        <div className="text-sm text-[#d4a853] font-semibold">{pl.z}</div>
                        <div className="text-[11px] text-[#b0b0c8]">{isZh?"第":"H"}{pl.h}{isZh?"宮":"H"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synastry: dual planet comparison */}
              {isSynastry && synastryData?.p2 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">{isZh ? "印度占星合盤 · 雙方行星" : "Vedic Synastry · Dual Planets"}</h3>
                  {[synastryData.p1, synastryData.p2].map((person,pi) => (
                    <div key={pi} className={pi>0?"mt-4":""}>
                      <p className="text-xs text-[#d4a853] mb-2 font-medium">{person.name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[{p:"Sun",z:person.zodiac},{p:"Moon",z:getZodiacSign(new Date(new Date(person.birthDate).getTime()-172800000))},{p:"Mercury",z:getZodiacSign(new Date(new Date(person.birthDate).getTime()+86400000))},{p:"Venus",z:getZodiacSign(new Date(new Date(person.birthDate).getTime()-86400000))},{p:"Mars",z:getZodiacSign(new Date(new Date(person.birthDate).getTime()+259200000))},{p:"Jupiter",z:getZodiacSign(new Date(new Date(person.birthDate).getTime()+518400000))}].map(pl => (
                          <div key={pl.p} className="bg-[#151520] rounded-lg p-2 text-center border border-[#d4a85306]"><div className="text-[11px] text-[#b0b0c8]">{pl.p}</div><div className="text-xs text-[#d4a853]">{pl.z}</div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback: mock zodiac data */}
              {!synastryData?.p1 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4">Zodiac Chart</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: "Sun", value: zodiacData.sun, desc: "Core Self", icon: Sun },{ label: "Moon", value: zodiacData.moon, desc: "Inner Emotions", icon: Moon },{ label: "Rising", value: zodiacData.rising, desc: "Outer Persona", icon: Star },{ label: "Mercury", value: zodiacData.mercury, desc: "Mind", icon: Sparkles },{ label: "Venus", value: zodiacData.venus, desc: "Love", icon: Heart },{ label: "Mars", value: zodiacData.mars, desc: "Drive", icon: TrendingUp }].map((item) => (
                      <div key={item.label} className="bg-[#151520] rounded-lg p-3 border border-[#d4a85306]"><div className="text-[11px] text-[#b0b0c8]">{item.label}</div><div className="text-sm text-[#d4a853] font-semibold mt-0.5">{item.value}</div><div className="text-[9px] text-[#8a8aad33] mt-0.5">{item.desc}</div></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Section */}
          <div className="mt-6 bg-white/80 rounded-xl p-5 border border-[#d4a85320] shadow-sm">
            <div className="border-t border-[#d4a85320]">
              <p className="text-[10px] text-[#8a8071] text-center mb-3 uppercase tracking-wider">{isZh ? "分享你的星盤" : "Share Your Destiny Chart"}</p>
              <div className="flex justify-center gap-3">
                {["📷","🎵","📕","🔗"].map((icon,i) => (
                  <button key={i} onClick={() => setShowShareModal(true)}
                    className="flex flex-col items-center gap-1 px-4 py-3 bg-[#faf3e0] rounded-xl border border-[#d4a85320] hover:border-[#d4a85350] transition-all text-[#8a8071] hover:text-[#2f261d] hover:scale-105">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[9px]">{["Instagram","TikTok","Xiaohongshu",isZh?"分享":"Share"][i]}</span>
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-[#8a8071]/50 text-center mt-2">Share to unlock a free reading credit! Auto-generated watermark included.</p>
            </div>
          </div>

        </div>

      </main>
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={isSynastry && synastryData?.p2
          ? `${synastryData.p1.name} × ${synastryData.p2.name} ${isZh ? "雙人合盤" : "Synastry"}`
          : isZh ? "我的星盤報告" : "My Destiny Chart"}
        score={isSynastry && synastryData?.p2 ? undefined : undefined}
        sharePath="/destiny-result"
        shareText={isSynastry && synastryData?.p2
          ? `💕 ${synastryData.p1.name} × ${synastryData.p2.name} ${isZh ? "雙人合盤" : "Synastry"} · ${synastryData.elementRel}`
          : `🌟 ${isZh ? "我的星盤" : "My Destiny Chart"} on R7 Fortune!`}
      />
      <PayModal
        isOpen={!PREVIEW_FULL_DESTINY && showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaid={() => {
          if (isSynastry) {
            unlockReport("synastry_full_report");
            navigate("/synastry-full-report");
          } else {
            unlockReport("natal_full_report");
            navigate("/destiny-full-report");
          }
        }}
        config={{
          ...(isSynastry ? PAYWALL_CONFIGS.synastry : PAYWALL_CONFIGS.natal),
          reportKey: isSynastry ? "synastry_full_report" : "natal_full_report",
        }}
      />
      <Footer />
      <CustomerService />
    </div>
  )
}

// Synastry Overview sub-component
function SynastryOverview({ p1, p2, elementRel, isZh }: {
  p1: any; p2: any; elementRel: string; isZh: boolean;
}) {
  const zodiacs = ["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"];
  const p1Idx = zodiacs.indexOf(p1.zodiac); const p2Idx = zodiacs.indexOf(p2.zodiac);
  const compatBonus = p1Idx === p2Idx ? 15 : Math.abs(p1Idx - p2Idx) % 6 === 0 ? -5 : Math.abs(p1Idx - p2Idx) % 4 === 0 ? 10 : 5;
  const elScore = p1.stemEl === p2.stemEl ? 65 : ((p1.stemEl === "火" && p2.stemEl === "木") || (p1.stemEl === "木" && p2.stemEl === "火") ? 80 : (p1.stemEl === "水" && p2.stemEl === "木") || (p1.stemEl === "木" && p2.stemEl === "水") ? 85 : p1.element === p2.element ? 75 : 60);
  const score = Math.round((elScore + compatBonus) / 2);
  const tier = score >= 90 ? 0 : score >= 70 ? 1 : score >= 50 ? 2 : score >= 30 ? 3 : 4;
  const tierLabelsZh = ["天作之合，靈魂伴侶，能量高度共振","非常契合，互相滋養，長期關係潛力大","中等契合，需要磨合，互補性強","挑戰較多，需要雙方共同努力","能量衝突明顯，不建議發展親密關係"];
  const tierLabelsEn = ["Soulmate resonance - destined union","Highly compatible - mutual nourishment, strong potential","Moderate compatibility - complementary but needs effort","Significant challenges - requires mutual commitment","Energy conflict - romantic relationship not recommended"];
  const karmaType = p1.stemEl === p2.stemEl ? (isZh ? "共同修行關係" : "Shared Cultivation") : (p1.stemEl === "木" && p2.stemEl === "火") || (p1.stemEl === "火" && p2.stemEl === "木") ? (isZh ? "靈魂伴侶關係" : "Soulmate Bond") : (isZh ? "還債關係" : "Karmic Debt");
  const attractType = p1.element === p2.element ? (isZh ? "一見鍾情的激情吸引" : "Love-at-first-sight passion") : (isZh ? "日久生情的溫暖吸引" : "Slow-burning warmth");
  const destinyLabel = score >= 70 ? (isZh ? "相守一生的長久緣分" : "Lifelong destined bond") : score >= 50 ? (isZh ? "相伴數年的階段性緣分" : "Multi-year karmic chapter") : (isZh ? "短暫相遇的露水情緣" : "Brief meaningful encounter");
  const relationTypes = score >= 70 ? (isZh ? ["婚姻伴侶","靈魂知己","事業合夥人"] : ["Marriage Partner","Soulmate","Business Partner"]) : score >= 50 ? (isZh ? ["親密戀人","靈魂知己","事業合夥人"] : ["Romantic Partner","Soulmate","Business Partner"]) : (isZh ? ["普通朋友","事業合夥人","競爭對手"] : ["Friends","Business Partner","Rivals"]);
  const p1Style = p1.element === "火" ? (isZh ? "直接衝動" : "fiery directness") : p1.element === "水" ? (isZh ? "情感細膩" : "emotional sensitivity") : p1.element === "风" ? (isZh ? "靈活善變" : "adaptable flexibility") : (isZh ? "沉穩務實" : "steady pragmatism");
  const p2Style = p2.element === "火" ? (isZh ? "熱情主動" : "passionate initiative") : p2.element === "水" ? (isZh ? "溫柔包容" : "gentle acceptance") : p2.element === "风" ? (isZh ? "理性溝通" : "rational communication") : (isZh ? "踏實可靠" : "grounded reliability");

  return (
    <div className="space-y-4">
      <div className="bg-[#faf3e0] rounded-xl p-5 text-center border border-[#d4a85325]">
        <p className="text-[10px] text-[#8a8071] uppercase tracking-wider mb-2">{isZh ? "緣分深度評分" : "Destiny Depth Score"}</p>
        <div className="text-5xl font-display font-bold text-[#b8860b] mb-2">{score}<span className="text-lg text-[#8a8071]">/100</span></div>
        <div className="h-2 bg-[#e5d5b0] rounded-full overflow-hidden max-w-[200px] mx-auto mb-3"><div className="h-full bg-gradient-to-r from-[#d4a853] to-[#FFB6C1] rounded-full" style={{ width: score + "%" }} /></div>
        <p className="text-sm text-[#2f261d] font-medium">{isZh ? tierLabelsZh[tier] : tierLabelsEn[tier]}</p>
      </div>
      <div className="bg-[#faf3e0] rounded-xl p-4 border border-[#d4a85320]">
        <h4 className="text-xs font-semibold text-[#b8860b] mb-3">💫 {isZh ? "緣分本質分析" : "Destiny Essence"}</h4>
        <div className="space-y-2 text-xs text-[#6f6470] leading-relaxed">
          <p><span className="text-[#2f261d] font-semibold">{isZh ? "前世業力連接" : "Past-Life Karmic Link"}</span>{isZh ? "：你們之間存在" + karmaType + "的前世業力連接，星宿" + p1.mansion + "-" + p2.mansion + "的關係揭示了你們靈魂深處的約定。" : ": Your " + karmaType + " past-life connection is revealed through mansion " + p1.mansion + "-" + p2.mansion + " - a soul-level agreement spanning lifetimes."}</p>
          <p><span className="text-[#2f261d] font-semibold">{isZh ? "吸引力來源" : "Source of Attraction"}</span>{isZh ? "：" + p1.zodiac + "與" + p2.zodiac + "的組合創造了" + attractType + "，" + p1.stemEl + "命與" + p2.stemEl + "命的" + elementRel + "是最本質的能量共振。" : ": " + p1.zodiac + "-" + p2.zodiac + " creates " + attractType + ". " + p1.stemEl + " and " + p2.stemEl + " elements form " + elementRel + " - the deepest resonance."}</p>
          <p><span className="text-[#2f261d] font-semibold">{isZh ? "緣分深淺" : "Depth of Connection"}</span>{isZh ? "：" + destinyLabel + "。" + (score >= 70 ? "你們的相遇絕非偶然，是靈魂在宇宙中的又一次匯合。" : "每段關係都有其意義和價值，珍惜當下的相遇。") : ": " + destinyLabel + ". " + (score >= 70 ? "Your meeting is no coincidence - another convergence of souls." : "Every connection has meaning - cherish this encounter.")}</p>
        </div>
      </div>
      <div className="bg-[#faf3e0] rounded-xl p-4 border border-[#d4a85320]">
        <h4 className="text-xs font-semibold text-[#b8860b] mb-3">🎯 {isZh ? "最適合的關係類型" : "Best Relationship Types"}</h4>
        <div className="flex flex-wrap gap-2">{relationTypes.map((t: string, i: number) => (<span key={i} className="px-3 py-2 bg-[#fffaf0] rounded-lg text-xs text-[#2f261d] border border-[#d4a85320]">{i + 1}. {t}</span>))}</div>
      </div>
      <div className="bg-[#faf3e0] rounded-xl p-4 border border-[#d4a85320]">
        <h4 className="text-xs font-semibold text-[#b8860b] mb-3">⚠️ {isZh ? "相處核心注意事項" : "Key Relationship Cautions"}</h4>
        <div className="space-y-2 text-xs text-[#6f6470] leading-relaxed">
          <p>1. {isZh ? "最容易產生矛盾的點" : "Most conflict-prone"}{isZh ? "：" + p1.zodiac + "的" + p1Style + "與" + p2.zodiac + "的" + p2Style + "可能導致溝通節奏不一致，建議矛盾時先暫停10分鐘再溝通。" : ": " + p1.zodiac + "'s " + p1Style + " vs " + p2.zodiac + "'s " + p2Style + " may cause rhythm mismatch - pause 10 min before discussing conflicts."}</p>
          <p>2. {isZh ? "最需要互相包容的地方" : "Most needing tolerance"}{isZh ? "：" + (p1.element === "火" || p1.element === "风" ? "主動方可能忽略被動方的細膩感受" : "被動方可能不理解主動方的表達方式") + "，彼此需要學習對方的'情感語言'。" : ": " + (p1.element === "火" || p1.element === "风" ? "The initiator may overlook subtle feelings" : "The receiver may misunderstand expression styles") + " - learn each other's emotional language."}</p>
          <p>3. {isZh ? "關係保鮮的關鍵方法" : "Keeping the spark"}{isZh ? "：定期安排專屬二人時間，一起嘗試新事物，保持溝通暢通，避免讓關係陷入慣性模式。" : ": Schedule regular quality time, try new experiences together, keep communication open, avoid relationship inertia."}</p>
          <p>4. {isZh ? "絕對不能觸碰的雷區" : "Absolute deal-breakers"}{isZh ? "：不要在爭吵時翻舊賬，不要拿對方和前任比較，不要輕易說分手。尊重是關係的基石。" : ": Don't bring up past grievances, don't compare to exes, don't threaten separation. Respect is the foundation."}</p>
        </div>
      </div>
      <p className="text-[9px] text-[#8a8071]/60 text-center">{isZh ? "* 以上分析僅供參考，最終決定權在您自己手中" : "* Analysis for reference only. The final decision is yours."}</p>
    </div>
  );
}

// Natal Overview sub-component
function NatalOverview({ p1, isZh }: { p1: any; isZh: boolean }) {
  const elScore = p1.element === "火" ? 78 : p1.element === "水" ? 72 : p1.element === "木" ? 75 : p1.element === "金" ? 70 : 68;
  const tier = elScore >= 90 ? 0 : elScore >= 70 ? 1 : elScore >= 50 ? 2 : elScore >= 30 ? 3 : 4;
  const tierLabelsZh = ["上等命格，天賦異稟，人生順遂，成就非凡","中上命格，能力出眾，貴人運好，通過努力可獲成功","中等命格，有起有落，付出才有回報","中下命格，挑戰較多，需要比別人更努力","人生坎坷，需要強大的內心和持續的修行"];
  const tierLabelsEn = ["Superior destiny - exceptional talent, destined for greatness","Above average - strong ability, good贵人 luck, success through effort","Average destiny - ups and downs, rewards come with effort","Below average - more challenges, requires harder work than others","Difficult path - needs strong inner resolve and continuous cultivation"];
  const careerZh = ["管理、教育、醫療等需要責任心的行業","創意、媒體、科技等需要靈活思維的領域","金融、地產、製造等需要穩健執行的產業","藝術、心理、文化等需要感知力的行業"][p1.element==="火"?0:p1.element==="风"?1:p1.element==="土"?2:3];
  const careerEn = ["Management, education, healthcare - fields requiring responsibility","Creative, media, tech - fields requiring flexible thinking","Finance, real estate, manufacturing - fields requiring steady execution","Arts, psychology, culture - fields requiring sensitivity"][p1.element==="火"?0:p1.element==="风"?1:p1.element==="土"?2:3];
  const bestMarriageAge = p1.element === "火" ? "26-28" : p1.element === "水" ? "28-30" : p1.element === "风" ? "27-29" : "30-32";
  const healthFocus = p1.element === "木" ? (isZh ? "肝膽、神經系統" : "Liver, nervous system") : p1.element === "火" ? (isZh ? "心臟、心血管" : "Heart, cardiovascular") : p1.element === "土" ? (isZh ? "脾胃、消化系統" : "Stomach, digestive") : p1.element === "金" ? (isZh ? "肺、呼吸系統" : "Lungs, respiratory") : (isZh ? "腎臟、泌尿系統" : "Kidneys, urinary");
  const wealthStyle = p1.element === "火" ? (isZh ? "工資收入+副業投資雙軌":"Salary + side investments") : (isZh ? "穩定的工資收入+長期積累":"Stable salary + long-term accumulation");
  const keyYears = p1.element === "火" ? "25、35、45" : p1.element === "水" ? "28、38、48" : p1.element === "风" ? "27、33、42" : "30、40、50";

  return (
    <div className="space-y-4">
      <div className="bg-[#faf3e0] rounded-xl p-5 text-center border border-[#d4a85325]">
        <p className="text-[10px] text-[#8a8071] uppercase tracking-wider mb-2">{isZh ? "整體命格評分" : "Destiny Score"}</p>
        <div className="text-5xl font-display font-bold text-[#b8860b] mb-2">{elScore}<span className="text-lg text-[#8a8071]">/100</span></div>
        <div className="h-2 bg-[#e5d5b0] rounded-full overflow-hidden max-w-[200px] mx-auto mb-3"><div className="h-full bg-gradient-to-r from-[#d4a853] to-[#FFB6C1] rounded-full" style={{ width: elScore + "%" }} /></div>
        <p className="text-sm text-[#2f261d] font-medium">{isZh ? tierLabelsZh[tier] : tierLabelsEn[tier]}</p>
      </div>
      <div className="bg-[#faf3e0] rounded-xl p-4 border border-[#d4a85320]">
        <h4 className="text-xs font-semibold text-[#b8860b] mb-3">📊 {isZh ? "五大維度核心結論" : "5 Dimensions Summary"}</h4>
        <div className="space-y-2 text-xs text-[#6f6470] leading-relaxed">
          <p><span className="text-[#2f261d] font-semibold">💼 {isZh ? "事業" : "Career"}</span>{isZh ? "：你適合" + careerZh + "，30歲前後事業逐步穩定，中年達到巔峰。" : ": Suited for " + careerEn + ". Career stabilizes around 30, peaks in middle age."}</p>
          <p><span className="text-[#2f261d] font-semibold">💕 {isZh ? "感情" : "Love"}</span>{isZh ? "：重感情，忠誠專一。最佳結婚年齡" + bestMarriageAge + "歲左右，配偶性格溫和，能力較強。" : ": Loyal and devoted. Best marriage age around " + bestMarriageAge + ". Partner will be gentle and capable."}</p>
          <p><span className="text-[#2f261d] font-semibold">🏥 {isZh ? "健康" : "Health"}</span>{isZh ? "：先天體質較好，需重點關注" + healthFocus + "，避免過度勞累和飲食不規律。" : ": Good innate constitution. Focus on " + healthFocus + ". Avoid overwork and irregular diet."}</p>
          <p><span className="text-[#2f261d] font-semibold">💰 {isZh ? "財富" : "Wealth"}</span>{isZh ? "：財富格局中等偏上，" + wealthStyle + "。中年後財運漸好。" : ": Above-average wealth potential. " + wealthStyle + ". Fortune improves after middle age."}</p>
          <p><span className="text-[#2f261d] font-semibold">📈 {isZh ? "發展" : "Development"}</span>{isZh ? "：人生整體上升趨勢，" + keyYears + "歲是三個關鍵轉折點，抓住機會可實現質的飛躍。" : ": Overall upward trajectory. Key turning points at ages " + keyYears + ". Seize these opportunities for breakthrough."}</p>
        </div>
      </div>
      <div className="bg-[#faf3e0] rounded-xl p-4 border border-[#d4a85320]">
        <h4 className="text-xs font-semibold text-[#b8860b] mb-3">⚡ {isZh ? "關鍵人生提醒" : "Key Life Alerts"}</h4>
        <div className="space-y-2 text-xs text-[#6f6470] leading-relaxed">
          <p>1. {isZh ? "最大優勢" : "Greatest Strength"}{isZh ? "：你的" + (p1.element==="火"?"行動力和執行力很強":"學習能力和適應力很強") + "，只要是你認定的事情，就一定會努力完成。" : ": Your " + (p1.element==="火"?"drive and execution":"learning ability and adaptability") + " ensure you accomplish what you commit to."}</p>
          <p>2. {isZh ? "最大挑戰" : "Greatest Challenge"}{isZh ? "：有時會過於追求完美，給自己太大壓力。學會放鬆，接受不完美，人生會更輕鬆。" : ": Sometimes pursuing perfection creates unnecessary pressure. Learning to relax and accept imperfection brings ease."}</p>
          <p>3. {isZh ? "最需注意的年份" : "Years to Watch"}{isZh ? "：" + keyYears + "歲，這些年份容易有事業變動和感情轉折，需提前做好準備。" : ": Ages " + keyYears + " - these years may bring career changes and relationship shifts. Prepare in advance."}</p>
        </div>
      </div>
      <p className="text-[9px] text-[#8a8071]/60 text-center">{isZh ? "* 僅供參考，命運不是注定的，而是先天傾向與後天努力的結合" : "* For reference only. Destiny is not fixed - it is the combination of innate tendencies and conscious effort."}</p>
    </div>
  );
}
