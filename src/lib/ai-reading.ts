/* ============================================================
   R7 Fortune — AI-Enhanced Dynamic Reading Generator
   Uses real astrology data (astrology-engine.ts) + template
   blending to create personalized, non-repetitive readings.
   Ready for ChatGPT API integration — replace generate()
   with API call when key is configured.
   ============================================================ */

import { calculateNatalChart, type NatalChart, type NatalReading, PLANETS, ZODIAC_ZH, ELEMENTS, MODALITIES } from "@/lib/astrology-engine";
import type { ZodiacSign } from "@/lib/astrology-engine";

// ---- Dynamic sentence fragments (combinatorial — millions of variations) ----

const OPENING_PHRASES: Record<string, string[]> = {
  Fire: ["你的星盤燃燒著熾熱的生命力", "一股不可抑制的創造之火在你體內流動", "你的靈魂不屬於平靜的港灣——它渴望乘風破浪"],
  Earth: ["你的星盤如同一座沉穩的山脈", "務實的能量流淌在你的每一個決定中", "你的根基深厚，不急於追逐，卻從不真正停下"],
  Air: ["你的思維像風一樣自由穿行", "在你腦海中，世界永遠有多一種解釋", "你天生是資訊的編織者——把看似無關的線索編成意義"],
  Water: ["你的星盤深處藏著一片寧靜的海洋", "情感是你的母語，直覺是你的指南針", "那些別人感受不到的暗流，你卻能清晰地觸摸"],
};

const PLANET_VOICES: Record<string, string[]> = {
  Sun: ["你的核心本質由太陽指引——那是你來到這個世界要成為的人", "太陽的位置揭示了你生命中最根本的驅動力"],
  Moon: ["月亮守護著你的情緒世界——那些不為人知的柔軟與脆弱", "你的情感需求藏在月亮的陰晴圓缺之中"],
  Mercury: ["水星掌管你如何思考、如何表達", "你的語言風格不是學來的——是星盤賦予的本能"],
  Venus: ["金星訴說著你如何去愛、你被什麼吸引", "在愛情面前，你的金星比太陽更誠實"],
  Mars: ["火星是你內在的引擎——它推動你去爭取、去捍衛", "你的慾望模式寫在火星的軌跡之中"],
  Jupiter: ["木星標記著你的天賦與機遇之門", "幸運從來不是偶然——你的木星知道答案"],
  Saturn: ["土星是你此生最重要的老師——嚴厲，但從不撒謊", "那些讓你感到受限的地方，恰好藏著你最大的成長"],
};

const CLOSING_STYLES: string[] = [
  "這不是一份冰冷的報告——而是一面鏡子。你所讀到的每一句話，都早已在你的生命中有過回聲。",
  "星盤不會替你決定命運，但它會告訴你——你的選擇，在星辰的哪一條軌跡上。",
  "讀完這份解讀，也許你會發現：那些你一直以為的偶然，其實都不是。",
  "星辰只是背景音樂。你才是那個決定旋律的人。",
];

// ================================================================
//  Generate dynamic reading (template blending)
// ================================================================
export function generateAIReading(
  year: number, month: number, day: number,
  hour: number = 12, minute: number = 0,
  name: string = ""
): {
  intro: string;
  sunMoonRising: string;
  planets: { planet: string; reading: string }[];
  challenges: string;
  closing: string;
  rawChart: NatalChart;
} {
  const chart = calculateNatalChart(year, month, day, hour, minute);
  const sun = chart.sun;
  const moon = chart.moon;
  const rising = chart.rising;
  const dominantEl = chart.dominantElement as string;
  const dominantMod = chart.dominantModality as string;

  // Seed for variation per person
  const seed = Math.abs(year * 10000 + month * 100 + day + hour);

  // Intro — pick based on dominant element
  const openPool = OPENING_PHRASES[dominantEl] || OPENING_PHRASES["Water"];
  const intro = `${name ? name + "，" : ""}${openPool[seed % openPool.length]}。你的太陽${ZODIAC_ZH[sun]}、月亮${ZODIAC_ZH[moon]}、上升${ZODIAC_ZH[rising]}交織出一幅獨一無二的靈魂地圖——${dominantEl}元素是主旋律，${dominantMod}特質是節奏。`;

  // Sun + Moon + Rising blurb
  const smr = `太陽${ZODIAC_ZH[sun]}賦予你${getSunCoreTrait(sun, seed)}。而月亮${ZODIAC_ZH[moon]}則揭示了你情感深處的${getMoonCoreTrait(moon, seed)}。上升${ZODIAC_ZH[rising]}是你與世界之間的那層濾鏡——別人第一眼看到的是這個你。${sun === moon ? "日月同座的人，內外極為一致——你不需要在不同場合扮演不同的人。" : sun === rising ? "太陽合上升，你給外界的印象與真實自我高度吻合，這是一種罕見的透明。" : ""}`;

  // Individual planet readings
  const planetReadings = chart.planets
    .filter(p => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.planet))
    .map(p => {
      const voicePool = PLANET_VOICES[p.planet] || [""];
      const voice = voicePool[(seed + PLANETS.indexOf(p.planet as any)) % voicePool.length];
      const detail = `${voice}。你的${p.planet}落在${ZODIAC_ZH[p.sign]}第${p.house}宮——這代表${getHouseMeaning(p.house, seed)}。${p.retrograde ? "逆行賦予你一種獨特的內省力——別人向外看的時候，你向內看。" : ""}`;
      return { planet: p.planet, reading: detail };
    });

  // Challenges (based on aspects)
  const squares = chart.aspects.filter(a => a.type === "square").length;
  const oppositions = chart.aspects.filter(a => a.type === "opposition").length;
  const challenges = squares + oppositions > 3
    ? "你的星盤中蘊含著豐富的張力——這不是缺陷，而是深度。那些看似矛盾的內在拉扯，恰恰是你創造力的源泉。學會與自己的陰影共舞，比追逐陽光更需要勇氣。"
    : squares + oppositions > 1
    ? "你的星盤整體和諧，但仍有幾處需要你特別關注的成長點。這些微小的摩擦不是阻礙——它們是靈魂選擇的進修課題。"
    : "你的星盤相位較為順暢——但不要因此掉以輕心。最大的功課往往不是來自衝突，而是來自過於舒適的慣性。";

  // Closing
  const closing = CLOSING_STYLES[(seed * 7) % CLOSING_STYLES.length];

  return {
    intro,
    sunMoonRising: smr,
    planets: planetReadings,
    challenges,
    closing,
    rawChart: chart,
  };
}

// ---- Helpers ----
function getSunCoreTrait(sign: ZodiacSign, _seed: number): string {
  const map: Record<ZodiacSign, string> = {
    Aries: "無畏的開創精神與純粹的行動力",
    Taurus: "沉穩的韌性與對感官之美的天賦",
    Gemini: "永不停歇的好奇心與靈活的思維",
    Cancer: "深厚的同理心與守護所愛之人的本能",
    Leo: "與生俱來的創造光芒與慷慨的溫暖",
    Virgo: "精準的洞察力與對完美的執著追求",
    Libra: "追求平衡的優雅與對關係的深刻理解",
    Scorpio: "穿透表象的直覺力與不為人知的韌性",
    Sagittarius: "對自由與真理永不熄滅的渴望",
    Capricorn: "腳踏實地的耐力與對成就的長期耕耘",
    Aquarius: "獨立思考的勇氣與對未來的遠見",
    Pisces: "超越邏輯的感知力與無邊的想像力",
  };
  return map[sign] || "獨特的個性色彩";
}

function getMoonCoreTrait(sign: ZodiacSign, _seed: number): string {
  const map: Record<ZodiacSign, string> = {
    Aries: "即刻反應的情感熱度——愛恨分明，不藏不躲",
    Taurus: "需要時間沉澱的安全感——愛是日積月累的證明",
    Gemini: "多變的情緒頻道——需要透過對話來理解自己的感受",
    Cancer: "深如海洋的情感記憶——每一份感動都被珍藏",
    Leo: "渴望被欣賞的柔軟內心——認可比什麼都重要",
    Virgo: "用行動而非言語表達關懷——細節裡藏著最深的愛",
    Libra: "在關係中尋找情感平衡——和諧是內心的必需品",
    Scorpio: "極致的情感深度——要麼全部，要麼不要",
    Sagittarius: "自由是最深層的情感需求——被束縛比孤獨更難受",
    Capricorn: "情感上的自我節制——脆弱是需要練習的功課",
    Aquarius: "理性與感性的奇異共存——理解比擁抱更重要",
    Pisces: "無邊界的情感共鳴——能感受到所有人的悲喜",
  };
  return map[sign] || "獨特的情感模式";
}

function getHouseMeaning(house: number, _seed: number): string {
  const map: Record<number, string> = {
    1: "你在他人眼中的形象與人格面具",
    2: "你的價值觀、金錢態度與自我價值感",
    3: "溝通模式、思維習慣與早期學習經驗",
    4: "家庭根源、內心安全感與私密情感世界",
    5: "創造力、戀愛態度與自我表達的渴望",
    6: "日常工作習慣、健康管理與服務他人的方式",
    7: "伴侶關係、合作模式與一對一的互動風格",
    8: "深層轉化、共享資源與生命中不可見的力量",
    9: "信念體系、高等教育與對生命意義的追尋",
    10: "事業成就、社會地位與公眾形象",
    11: "社交圈、理想與對未來的願景",
    12: "潛意識、靈性追尋與獨處中的自我對話",
  };
  return map[house] || "生命中的一個特定領域";
}
