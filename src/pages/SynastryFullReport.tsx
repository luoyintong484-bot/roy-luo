import { useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal";
import { isReportPaid, unlockReport } from "@/lib/payment-service";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { ArrowLeft, Heart, Lock } from "lucide-react";

function BoldBrackets({ text }: { text: string }) {
  const parts = text.split(/(【[^】]+】)/g);
  return <>{parts.map((p, i) => p.startsWith("【") ? <strong key={i} className="font-semibold text-[#f5e8d0]">{p}</strong> : p)}</>;
}

export default function SynastryFullReport() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW" || locale === "zh";
  const [isPaid, setIsPaid] = useState(() => isReportPaid("synastry_full_report"));
  const [showPayModal, setShowPayModal] = useState(false);

  const sections = [
    {
      icon: "💫", title: isZh ? "核心吸引力" : "Core Attraction",
      content: isZh
        ? `你們的合盤中，太陽與金星形成了極為罕見的和諧相位——這不是普通的互相欣賞，而是發自內在的、不求回報的吸引。對方的存在本身就讓你感到舒適，不需要刻意做什麼來維持。\n\n【吸引力來源】從八字角度來看，你的日柱與對方的日柱形成了相生關係——你的五行能量恰好補足了對方最匱乏的部分，反之亦然。這種互補不是刻意為之，而是天生的能量共振。從印度占星的角度，雙方的第七宮主星相互照應，這在合盤中是非常有利的配置——你們在彼此面前能自然地展現最真實的一面，無需偽裝。\n\n【無法解釋的連結】有些夫妻或伴侶在一起多年，卻始終說不清楚為什麼被對方吸引——就是覺得「對了」。你們的合盤恰好屬於這種類型。不是外表、不是條件，是更深層的、連你們自己都說不清楚的東西。這就是占星學中所謂的「宿命吸引力」。`
        : `Your synastry chart shows a rare harmonious aspect between Sun and Venus — this isn't ordinary mutual appreciation, but a deep, unconditional attraction. The other person's mere presence brings you comfort, without effort.\n\n【Attraction Source】From a Bazi perspective, your Day Pillars form a generating relationship — your elemental energy precisely fills what the other lacks, and vice versa. From Vedic astrology, both 7th House lords aspect each other favorably — you can be your most authentic selves together.\n\n【Inexplicable Pull】Some couples can't explain why they're drawn together — it just feels "right." Your synastry belongs to this category: not about looks or status, but something deeper, something even you can't fully articulate. This is what astrology calls "destined attraction."`
    },
    {
      icon: "🏠", title: isZh ? "日常相處模式" : "Daily Interaction Pattern",
      content: isZh
        ? `你們的日常相處中，月亮的位置揭示了情感交流的底層邏輯。你習慣用行動表達關心（把事情都做好就是愛），而對方更傾向於用語言和直接的情感表達（需要聽到、感覺到）。這兩種模式本身沒有對錯，但如果不理解對方的「情感語言」，容易產生「我已經很努力了，為什麼Ta還是不滿意」的誤解。\n\n【溝通風格】水星的相位顯示你們在討論具體問題時非常高效——你們能迅速理解對方的邏輯，並找到解決方案。但在討論「感受」時，容易各說各話。這是因為水星雖然在同一元素，但月亮的情感需求不在同一頻道。\n\n【日常節奏】從印度占星的角度，雙方的第六宮主星形成的關係暗示著：你們在「日常分工」上會有自然的默契——誰擅長什麼、誰負責什麼，不需要太多討論就會自動形成。但需要注意：這種自動分工久了，可能變成「理所當然」，反而少了感謝。建議定期刻意表達對對方付出的認可，哪怕只是口頭上的。`
        : `Your Moon positions reveal the underlying logic of your emotional communication. You tend to express care through actions (getting everything done = love), while the other person leans toward verbal and direct emotional expression (needs to hear and feel it). Neither mode is wrong — but without understanding each other's "emotional language," misunderstandings arise.\n\n【Communication】Mercury aspects show you're highly efficient discussing concrete problems — you quickly understand each other's logic. But when discussing "feelings," you may talk past each other. Mercury shares an element, but Moon's emotional needs are on different frequencies.\n\n【Daily Rhythm】Vedic 6th House lords suggest natural默契 in daily division of labor — who's good at what gets sorted without much discussion. But beware: this can become "taken for granted" over time. Regularly express appreciation, even verbally.`
    },
    {
      icon: "⚡", title: isZh ? "核心矛盾與課題" : "Core Conflicts & Lessons",
      content: isZh
        ? `每段關係都有需要磨合的地方——你們的合盤顯示，最大的潛在矛盾點在於「獨立與親密」的平衡。\n\n【火星相位揭示的摩擦】你們的火星形成了對沖相位——這在合盤中是非常典型的「吸引力與衝突並存」配置。在某方面，你們互相激發對方的行動力和熱情；在另一方面，你們也容易因為意見不合而產生摩擦。火星對沖的伴侶往往「吵完架反而感情更好」——關鍵在於：吵架的時候不要說出會留下疤痕的話。\n\n【土星的考驗】印度占星中，土星在你們的合盤中佔據了重要位置——這意味著這段關係不是那種輕鬆愉快的「玩玩而已」，而是帶有業力功課的認真連接。土星會讓你們在某些時刻感到「壓力」或「責任感大於快樂」，但這恰恰是這段關係能走得長遠的原因——土星的功課完成之後，收穫的是一份經得起考驗的羈絆。\n\n【需要共同面對的課題】① 學會在爭論中「暫停」——不是冷戰，而是約定好「我們先冷靜30分鐘再回來聊」；② 不要用各自的童年經驗去解讀對方的行為——你們來自不同的家庭系統，對同一件事的理解可能完全不同；③ 定期做「關係盤點」——不是翻舊帳，而是誠實地問彼此「最近哪裡讓我覺得被愛，哪裡讓我覺得孤單」。`
        : `Every relationship has friction points. Your synastry shows the biggest potential conflict is the balance between "independence and intimacy."\n\n【Mars Opposition】Your Mars forms an opposition — classic "attraction + conflict" synastry. You spark each other's drive and passion, but also clash. Mars-opposition couples often "fight and grow closer." Key: don't say things during arguments that leave scars.\n\n【Saturn's Test】In Vedic, Saturn occupies a significant position in your composite — this isn't a casual relationship, but a karmic one. Saturn brings moments of "pressure" or "duty over joy," but this is precisely why this bond can last — completing Saturn's lessons yields a tested, enduring connection.\n\n【Shared Lessons】① Learn to "pause" during arguments — not silent treatment, but agreed cooling-off periods. ② Don't interpret each other through childhood experiences — you come from different family systems. ③ Do regular "relationship check-ins" — honestly ask: "Where did I feel loved lately? Where did I feel alone?"`
    },
    {
      icon: "🌙", title: isZh ? "緣分深度解析" : "Destiny Depth Analysis",
      content: isZh
        ? `從二十八星宿體系來看，你們的星宿關係屬於特殊類型——這不是每一對伴侶都有的配置。\n\n【前世緣分牽引】你們的合盤中出現了明顯的「業力節點」——印度占星中的羅喉與計都（北交點與南交點）與雙方的個人行星產生了緊密聯繫。這在合盤解讀中是非常強烈的信號：你們的相遇不是偶然。在前世（或更早的生命階段），你們可能已經有過交集——可能是伴侶、師生、家人，或者其他形式的親密關係。今生的相遇，是為了完成前世未完成的課題。\n\n【正緣匹配度】綜合八字、星盤與印度占星三個體系，你們的匹配度屬於「高度互補型正緣」。所謂正緣，不是說這段關係一定會一帆風順——恰恰相反，正緣往往是最能讓你成長的關係。你們互相映照出對方需要成長的部分，這就是「正緣」的真正意義。\n\n【關係宿命感】這種「好像早就認識」的感覺不是錯覺。當雙方的南北交點與個人行星形成相位時，這種「似曾相識」的宿命感是合盤中的客觀信號，而不是你的主觀想像。但宿命不等於被動等待——你們今生的任務，是把這份宿命變成主動的選擇。`
        : `From the 28-Mansion system, your mansion relationship is a special type — not every couple has this configuration.\n\n【Past-Life Connection】Your synastry shows clear "karmic nodes" — Vedic Rahu/Ketu (North/South Nodes) closely contact both personal planets. This is a powerful signal: your meeting isn't coincidence. In past lives (or earlier life phases), you may have been partners, teacher-student, family, or other close bonds. This life's meeting is to complete unfinished lessons.\n\n【Fated Match Level】Across Bazi, Natal, and Vedic systems, your compatibility is "highly complementary destined connection." "Destined" doesn't mean smooth sailing — quite the opposite. Destined connections are often the ones that make you grow most. You mirror each other's growth areas — this is the true meaning of "destined love."\n\n【Sense of Destiny】That "I feel like I've known you forever" feeling isn't an illusion. When Nodes aspect personal planets, this déjà-vu is an objective synastry signal, not subjective imagination. But destiny doesn't equal passivity — your life's task is turning this destiny into conscious choice.`
    },
    {
      icon: "⚠️", title: isZh ? "關鍵注意事項" : "Key Cautions",
      content: isZh
        ? `這部分可能是整份報告中最重要的內容——不是要嚇你，而是要讓你提前知道哪些地方需要多加留意，避免踩了可以避免的雷。\n\n【容易踩雷的雷區】① 不要在對方疲憊或壓力大的時候談重要的事情——你們的火星相位讓你們在情緒高漲時容易說出傷人的話，而土星的影響會讓這些話比一般的爭吵留下更深的痕跡。② 不要拿對方的家庭背景或成長經歷開玩笑——即使你覺得是幽默，對方可能完全無法接受。這是因為雙方的月亮配置差異很大。③ 不要試圖「改造」對方——你的金星告訴你「這樣會更好」，但對方的火星會告訴你「我不需要你來教我怎麼活」。\n\n【不同階段的避坑指南】熱戀期（0-6個月）：享受彼此的吸引力，但不要因為「感覺太對了」就忽略了三觀和長期目標的匹配度檢查。磨合期（6個月-2年）：這是土星開始做功課的階段——不要因為爭吵變多就覺得「是不是不合適」，恰恰相反，這是關係從浪漫進入現實的必要過程。穩定期（2年+）：警惕「平淡變冷漠」——你們的配置決定了你們需要定期的新鮮感和共同目標來維持熱度，不要讓關係變成「室友模式」。\n\n【分手風險預警】需要警惕的信號：① 雙方開始對彼此「無話可說」超過兩週；② 一方開始頻繁單獨做出影響雙方的決定而不商量；③ 對外人的熱情超過對伴侶的熱情成為常態。這些不是「平淡期的正常現象」，而是需要正視的紅燈。`
        : `This may be the most important section — not to scare you, but to help you navigate potential pitfalls.\n\n【Minefields】① Don't discuss important matters when the other is tired or stressed — your Mars aspects make hurtful words more likely in heightened emotions, and Saturn's influence makes these scars deeper. ② Don't joke about family background or upbringing — what you find humorous may be completely unacceptable due to vastly different Moon configurations. ③ Don't try to "fix" the other person — your Venus says "this would be better," but their Mars says "I don't need you to teach me how to live."\n\n【Stage-by-Stage Guide】Honeymoon (0-6 months): Enjoy the attraction, but don't skip checking long-term compatibility just because it "feels so right." Adjustment (6 months-2 years): Saturn's phase begins — more arguments don't mean "we're wrong for each other." This is the necessary process of romance entering reality. Stability (2+ years): Guard against "flat becoming cold" — your configuration needs periodic freshness and shared goals to maintain warmth.\n\n【Breakup Red Flags】① Mutual "nothing to say" lasting over 2 weeks. ② One party frequently makes decisions affecting both without consultation. ③ Enthusiasm for outsiders consistently exceeds enthusiasm for partner. These aren't "normal phases of settling down" — they're red lights requiring attention.`
    },
    {
      icon: "🔮", title: isZh ? "長期發展建議" : "Long-Term Development Advice",
      content: isZh
        ? `綜合以上所有分析，這段關係的長期潛力是存在的——但不是「自動駕駛」就能走到最後的類型，而是需要雙方都有意識地去經營。\n\n【未來1-3年】這段時期是你們關係的「地基期」。土星在合盤中的位置暗示：如果你們能在這個階段一起完成一件「有挑戰性的事」（比如一起創業、一起買房、一起面對家庭的阻力並站在一起），你們的羈絆會比那些一帆風順的伴侶更深。共同經歷過困難的伴侶，關係韌性更強。\n\n【3-7年】木星的影響在這個階段開始顯現——如果你們在前期把地基打好了，這個階段會有明顯的「收穫感」。可能是事業上的互相助力、家庭上的穩定和諧、或是共同目標的實現。這個階段也是「擴張期」——適合一起規劃更大的事情：換城市、出國、創業、生孩子。\n\n【7年以上】如果你們走到了這一步，說明你們已經完成了合盤中最困難的功課。此時的關係會進入一種「不需言語的默契」——不是激情消退，而是激情轉化成了更深層的東西。印度占星中第七宮主星的配置暗示：長期來看，你們的關係會成為彼此人生中最穩定的支撐點。\n\n【最後一句話】不要用這份報告來預測「能不能走到最後」——報告是鏡子，不是劇本。它告訴你路在哪裡、哪裡有坑、哪裡有風景——但走不走、怎麼走，是你們兩個人的選擇。`
        : `Synthesizing all analysis above: this relationship has long-term potential — but it's not an "autopilot" type. It requires conscious cultivation from both sides.\n\n【Years 1-3】This is your "foundation period." Saturn's position suggests: if you can complete a "challenging thing together" during this phase (starting a business, buying a home, facing family opposition united), your bond will be deeper than couples who had smooth sailing. Shared adversity builds resilience.\n\n【Years 3-7】Jupiter's influence emerges — if you built a solid foundation, this phase brings a sense of "harvest." Mutual career support, stable family harmony, shared goal achievement. This is also an "expansion phase" — suitable for bigger plans: relocating, going abroad, entrepreneurship, having children.\n\n【7+ Years】If you've reached this point, you've completed synastry's hardest lessons. The relationship enters "wordless understanding" — not passion fading, but passion transforming into something deeper. Vedic 7th House lord suggests: long-term, this relationship becomes life's most stable anchor.\n\n【Final Word】Don't use this report to predict "will we make it." This report is a mirror, not a script. It shows you where the path goes, where the potholes are, where the views are beautiful — but whether and how you walk it is your choice, together.`
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
              <Heart className="w-8 h-8 text-[#FFB6C1] mx-auto mb-2" />
              <h2 className="font-display text-xl font-bold text-[#FFB6C1]">
                {isZh ? "💕 雙人合盤完整報告" : "💕 Synastry Full Report"}
              </h2>
              <p className="text-[10px] text-[#8a8aad44] mt-1">
                {isZh ? "八字 · 本命星盤 · 印度占星 交叉驗證" : "Bazi · Natal · Vedic Cross-Validation"}
              </p>
            </div>

            {/* Paywall gate: only first section visible for free */}
            {sections.map((s, i) => {
              if (!isPaid && i > 0) return null; // Hide sections 2-6 until paid
              return (
                <div key={i} className="bg-[#151520] rounded-xl p-4 border border-[#FFB6C108]">
                  <h3 className="text-base font-bold text-[#FFB6C1] mb-3 flex items-center gap-2">
                    <span>{s.icon}</span> {s.title}
                  </h3>
                  <p className="text-xs text-[#f0e6d3] font-[450] leading-[1.6] tracking-[0.5px] whitespace-pre-line">
                    <BoldBrackets text={s.content} />
                  </p>
                </div>
              );
            })}

            {!isPaid && (
              <div className="text-center space-y-3 pt-2">
                <p className="text-xs text-[#8a8aad]">
                  {isZh
                    ? "以上為免費預覽，解鎖後查看完整 6 大維度深度解析"
                    : "Free preview — unlock full 6-dimension deep analysis"}
                </p>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isZh ? "解鎖完整合盤報告 $9.99" : "Unlock Full Synastry Report $9.99"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaid={() => { unlockReport("synastry_full_report"); setIsPaid(true); }}
        config={{ ...PAYWALL_CONFIGS.synastry, reportKey: "synastry_full_report" }}
      />
      <Footer />
      <CustomerService />
    </div>
  );
}
