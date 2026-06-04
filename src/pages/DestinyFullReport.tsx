import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ArrowLeft, Sparkles } from "lucide-react";

function BoldBrackets({ text }: { text: string }) {
  const parts = text.split(/(【[^】]+】)/g);
  return <>{parts.map((p, i) => p.startsWith("【") ? <strong key={i} className="font-semibold text-[#f5e8d0]">{p}</strong> : p)}</>;
}

export default function DestinyFullReport() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW" || locale === "zh";

  const sections = [
    {
      icon: "💼", title: isZh ? "事業發展" : "Career Development",
      content: isZh
        ? `綜合八字日柱丙火與本命星盤第十宮太陽落位，你的職業天賦指向需要「可見度」和「影響力」的領域。丙火日主天生自帶光芒——你不是那種適合躲在幕後埋頭苦幹的類型，而是需要在舞臺中央被看見、被認可的配置。\n\n【天賦方向】太陽第十宮與火星形成六分相，賦予你極強的執行力和公眾表達能力。適合的行業包括：品牌管理、公關媒體、教育培訓、創意總監、創業者——任何需要「站出來說話」的崗位都是你的主場。\n\n【職場優勢】八字中木火通明，印星有力——你的學習能力比同齡人快很多。進入新領域的前三個月是你的黃金期，你能迅速掌握別人需要半年才能理解的東西。\n\n【關鍵轉折點】30歲前後土星回歸期間，你會面臨一次重要的職業重新定位。不要害怕轉行——你的星盤配置支持跨界發展，而且往往在「看起來不相關」的領域之間找到獨特的結合點。印度占星中第十宮主星與木星產生關聯，暗示34歲左右會有一次事業上的重大躍升。`
        : `Based on your Bazi Bing Fire Day Master and Natal Chart 10th House Sun placement, your career talents point toward fields requiring "visibility" and "influence." Bing Fire individuals are born radiant — you're not built for backstage anonymity but for center-stage impact.\n\n【Talent Direction】Sun in 10th House sextile Mars grants exceptional execution and public expression. Suitable industries: brand management, PR/media, education, creative direction, entrepreneurship.\n\n【Career Edge】Wood-Fire thriving in your Bazi with strong Seal star — your learning speed surpasses peers. First 3 months in a new field are your golden window.\n\n【Key Turning Point】Saturn return around age 30 brings career recalibration. Vedic 10th lord connected to Jupiter suggests a major leap around age 34.`
    },
    {
      icon: "💰", title: isZh ? "財富運勢" : "Wealth & Finance",
      content: isZh
        ? `本命星盤中第二宮木星入廟，這是非常罕見的財富配置——你對金錢的直覺天生準確。你賺的每一筆錢背後都有你的邏輯，不是運氣好，是你的潛意識在做對的判斷。\n\n【正財偏財格局】八字中正財星坐於月柱，偏財星見於時柱——你的收入結構是「穩定工資+副業或投資收益」的組合。不要滿足於單一收入來源，你的配置天生適合雙軌甚至多軌收入模式。\n\n【財富積累方式】金星與木星的三分相賦予你「透過合作和人脈放大財富」的能力。比起自己埋頭苦幹，你更適合通過建立團隊、整合資源或利用社交網絡來創造財富。\n\n【破財風險】火星八宮的配置警示你要注意合夥財務、借貸和投資中的風險。你比較容易因為信任對方而忽略必要的審查和合約——建議所有涉及金錢的合作都要經過第三方審核。\n\n【財富轉折點】36歲前後，流年木星進入第二宮時，會有一次顯著的財富提升機會。保持你目前的積累節奏，不要因為短期的波動而打亂長期規劃。`
        : `Your Natal Chart shows Jupiter in the 2nd House — a rare wealth configuration. Your intuition about money is naturally accurate.\n\n【Income Structure】Bazi shows Stable Wealth in Month Pillar and Speculative Wealth in Hour Pillar — your income is "stable salary + side/investment income."\n\n【Wealth Method】Venus trine Jupiter grants ability to "amplify wealth through partnerships and networks."\n\n【Risk Alert】Mars in 8th House warns caution in partnerships — always get third-party review for money-related collaborations.\n\n【Key Window】Around age 36, transiting Jupiter enters your 2nd House — expect a significant wealth boost.`
    },
    {
      icon: "💕", title: isZh ? "感情姻緣" : "Love & Relationships",
      content: isZh
        ? `金星落在第五宮——你對愛情的理解從來不只是「被愛」，而是「共同創造」。你需要的是能在精神層面與你共鳴的伴侶，而不僅僅是生活搭檔。\n\n【正緣特徵】八字日支帶寅或午（與你的丙火形成良好互動）、星盤中太陽或月亮落在火象或風象星座、職業上具有一定創造性或公眾屬性。你們的相遇往往發生在與「學習、旅行、社交活動」相關的場合。\n\n【戀愛模式】月亮與水星的柔和相位讓你在感情中擅長表達——這很加分。但太陽與土星的對沖可能讓你一開始顯得有些距離感，需要時間才會真正打開心扉。你屬於「慢熱但持久」的類型。\n\n【婚姻走勢】印度占星中第七宮主星的位置暗示，你的婚姻會在30-35歲之間進入穩定階段。不要因為年齡焦慮而倉促決定——你的星盤顯示「晚婚但婚姻質量高」的趨勢。\n\n【相處建議】你的月亮在第六宮，這讓你在關係中容易「用做事代替說愛」——你以為把對方照顧好就是愛，但對方可能需要的是你的時間和注意力。學會停下來，看著對方的眼睛，告訴Ta「我在這裡」。`
        : `Venus in the 5th House — your definition of love isn't just "being loved" but "co-creating." You need a partner who resonates with you spiritually.\n\n【Partner Traits】Bazi + Chart shows your ideal partner has: Day Branch containing Yin or Wu, Sun/Moon in Fire/Air signs, and creative or public-facing career.\n\n【Love Pattern】Moon-Mercury soft aspect makes you emotionally expressive. You're "slow to warm but lasting."\n\n【Marriage Timing】Vedic 7th House lord suggests marriage stabilizes between ages 30-35. Your chart shows "later marriage but higher quality."\n\n【Advice】Moon in 6th House makes you "show love through doing" — learn to pause, look into their eyes, and simply say, "I'm here."`
    },
    {
      icon: "🏥", title: isZh ? "健康狀況" : "Health & Wellness",
      content: isZh
        ? `火星在第一宮的人通常精力充沛，但你的意志力太強，強大到會覆蓋身體的疲勞信號。這不是優勢，是需要警惕的。\n\n【體質特點】八字中火旺木相，先天體質偏熱性。容易出現的問題集中在：心血管系統、肝膽功能、以及因為長期精神緊繃導致的偏頭痛或睡眠障礙。\n\n【易患疾病】印度占星中第六宮的配置提示需要特別關注消化系統——不是因為你吃得不好，而是因為你吃飯的時候在想別的事。你的腸胃問題多半是「情緒型」的。\n\n【日常養生】最適合你的是「穩定節奏」——固定時間吃飯、固定時間睡覺、每週2-3次中等強度的運動。瑜伽或太極比HIIT更適合你的體質。冥想或正念練習對你的幫助可能比你想像中大得多。`
        : `Mars in 1st House gives abundant energy, but your willpower overrides fatigue signals. This needs attention.\n\n【Constitution】Bazi shows dominant Fire with Wood support — naturally warm constitution. Vulnerable areas: cardiovascular, liver/gallbladder, stress-induced migraines.\n\n【Risk Areas】Vedic 6th House points to digestive issues — your gut problems are largely emotional.\n\n【Daily Care】Steady rhythm suits you best — fixed meal times, fixed sleep times, 2-3 moderate workouts weekly. Yoga or Tai Chi suit your constitution better than HIIT. Meditation may help more than you think.`
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />{isZh ? "返回上一頁" : "Back"}
          </button>

          <div className="glass rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C133] space-y-6">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-[#FFB6C1] mx-auto mb-2" />
              <h2 className="font-display text-xl font-bold text-[#FFB6C1]">
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
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
