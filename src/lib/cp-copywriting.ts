/* ============================================================
   R7 Fortune — CP Copywriting Engine v3
   4-tier bilingual (zh-TW / EN) tags + essay
   测测-aligned score brackets · unique per pair via seed
   ============================================================ */

export interface CpTierData {
  tier: 1 | 2 | 3 | 4;
  tagZh: string;
  tagEn: string;
  essays: { zh: string; en: string }[];
}

// ---- Score → tier ----
function getTier(score: number): 1 | 2 | 3 | 4 {
  if (score >= 80) return 1;
  if (score >= 60) return 2;
  if (score >= 40) return 3;
  return 4;
}

// ---- Gradient colors per tier ----
export const TIER_COLORS: Record<number, { color: string; glow: string; bgGrad: [string, string] }> = {
  1: { color: "#F0B8A0", glow: "rgba(240,184,160,0.25)",  bgGrad: ["#F5C4B0", "#E8A890"] },  // 玫瑰蜜桃金
  2: { color: "#C4B0D8", glow: "rgba(196,176,216,0.22)",  bgGrad: ["#D4C4E6", "#B8A0CC"] },  // 淡芋紫柔粉
  3: { color: "#E8DDD0", glow: "rgba(232,221,208,0.20)",  bgGrad: ["#F0E8DE", "#DDD0C0"] },  // 奶杏浅白柔光
  4: { color: "#B8B8C0", glow: "rgba(184,184,192,0.18)",  bgGrad: ["#C8C8D0", "#A8A8B0"] },  // 冷调雾银灰
};

// ================================================================
//  TIER 1: 80-100 顶配良缘
// ================================================================
const TIER1: CpTierData = {
  tier: 1,
  tagZh: "天生一對",
  tagEn: "Soul Destined",
  essays: [
    { zh: "靈魂深處與生俱來的契合，是難得一見的宿命緣分。兩個人磁場緊緊相融，本身就是上天安排的偏愛。",
      en: "Your connection is innate spiritual resonance — a rare fate arranged by destiny. You always belong to each other deeply." },
    { zh: "宇宙花了億萬年，才把兩顆如此契合的靈魂放進同一個時代。這不是緣分，這是命中註定。",
      en: "The universe spent eons placing two souls this aligned into the same era. This isn't chance — it's destiny written in stardust." },
    { zh: "星盤上每一條相位都在說同一句話：你們是彼此的答案。從第一眼到最後一眼，都是宿命。",
      en: "Every aspect in your charts whispers the same truth: you are each other's answer. From the first glance to the last, it was always meant to be." },
    { zh: "在茫茫人海中認出彼此，不是因為運氣好——是因為靈魂記得對方的頻率。你們的磁場生來就調到同一頻道。",
      en: "Finding each other in the vast cosmos wasn't luck — your souls remembered the frequency. You were born tuned to the same channel." },
  ],
};

// ================================================================
//  TIER 2: 60-79 双向羁绊
// ================================================================
const TIER2: CpTierData = {
  tier: 2,
  tagZh: "雙向奔赴",
  tagEn: "Mutual Affection",
  essays: [
    { zh: "彼此擁有很合拍的內在磁場，慢慢相處就會愈發心動。緣分自帶朦朧拉扯感，曖昧感與生俱來。",
      en: "You share gentle magnetic attraction between two hearts. Feelings will gradually deepen along your fate." },
    { zh: "你們的化學反應不是爆炸式的，而是像春天的風慢慢吹進心裡——溫柔、持續、越來越濃。",
      en: "Your chemistry isn't explosive — it's like spring wind drifting into the heart. Gentle, steady, growing deeper with every breath." },
    { zh: "星盤上顯示一種微妙的張力——靠近時心跳加速，分開時又忍不住回頭。這就是宿命的拉扯感。",
      en: "Your charts reveal a delicate tension — heartbeats quicken when close, glances linger when apart. This is the pull of fate." },
    { zh: "不是一見鍾情的那種，而是每次見面都比上一次更確定——就是這個人了。慢熱，但熱得剛剛好。",
      en: "Not love at first sight — but with every meeting, the certainty grows. Slow-burning, but burning just right." },
  ],
};

// ================================================================
//  TIER 3: 40-59 小众默契
// ================================================================
const TIER3: CpTierData = {
  tier: 3,
  tagZh: "小眾契合",
  tagEn: "Unique Tacit",
  essays: [
    { zh: "屬於反差互補型緣分，優缺點剛好互相包容。不算轟轟烈烈，卻是獨一無二的溫柔羈絆。",
      en: "This is a complementary relationship with different personalities. You can tolerate every flaw of each other quietly." },
    { zh: "你們的合盤沒有太多華麗的詞彙可以概括，但那種微妙的默契是真實存在的——低調，卻剛剛好。",
      en: "Your synastry doesn't need grand words. The quiet understanding between you is real — understated, yet perfectly enough." },
    { zh: "像兩顆在相鄰軌道上運行的星星，不總是在一起，但始終互相守望。這種距離感，最舒服。",
      en: "Like two stars in neighboring orbits — not always together, but always watching over each other. This distance feels like home." },
    { zh: "不是所有人都懂你們的頻率。但沒關係——小眾的浪漫，往往最耐人尋味。",
      en: "Not everyone understands your frequency. But that's okay — the most intriguing romances are often the quietest ones." },
  ],
};

// ================================================================
//  TIER 4: 0-39 限定邂逅
// ================================================================
const TIER4: CpTierData = {
  tier: 4,
  tagZh: "限定邂逅",
  tagEn: "Limited Fate",
  essays: [
    { zh: "一場轉瞬即逝的浪漫相遇，緣分帶有遺憾美感。兩個人擁有別樣氛圍感，只適合珍藏。",
      en: "It is a temporary and beautiful encounter with slight regret. This tender romance only belongs to momentary memory." },
    { zh: "星象上這是一段短暫卻美麗的交匯。不是每段緣分都要走到最後——有些人的出現，只是為了讓你記得心動的感覺。",
      en: "The stars show a brief but beautiful crossing. Not every fate needs to last forever — some people appear just to remind you what a heartbeat feels like." },
    { zh: "你們像兩條短暫交匯的軌跡，交點雖小，卻足夠明亮。珍藏這一刻就夠了。",
      en: "Like two trajectories that intersect briefly — the intersection is small, but bright enough to remember. Cherish this moment." },
    { zh: "緣分不必都是圓滿的。遺憾本身，也是另一種形式的浪漫。謝謝你曾經來過。",
      en: "Not every fate needs a perfect ending. The bittersweetness itself is another form of romance. Thank you for passing through." },
  ],
};

// ---- Tagline pool per tier ----
const TAGLINES: Record<number, string[]> = {
  1: ["天生一對", "靈魂宿命", "天作之合", "靈魂共振", "命中羈絆", "永世同頻"],
  2: ["雙向奔赴", "宿命拉扯", "溫柔合拍", "情愫暗生", "緣分繾綣"],
  3: ["小眾契合", "獨特默契", "慢熱緣分", "互補適配", "人間私藏"],
  4: ["限定邂逅", "短暫情愫", "陌路溫柔", "浮生緣分", "小眾宿命"],
};

const TAGLINES_EN: Record<number, string[]> = {
  1: ["Soul Destined", "Perfect Match", "Cosmic Fate", "Twin Soul Bond", "Eternal Sync"],
  2: ["Mutual Affection", "Fate Tension", "Soft Bond", "Hidden Crush", "Gentle Pull"],
  3: ["Unique Tacit", "Slow Burn Bond", "Complementary Soul", "Secret Romance", "Quiet Harmony"],
  4: ["Limited Fate", "Brief Encounter", "Faint Romance", "Lonely Destiny", "Fleeting Glow"],
};

// ---- Seed generator ----
function seed(str: string): number {
  let s = 0;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(s);
}

function pick<T>(arr: T[], s: number): T {
  return arr[s % arr.length];
}

// ================================================================
//  Public API
// ================================================================

interface CpContext {
  name1: string; name2: string;
  score: number;
}

export function generateCpData(ctx: CpContext) {
  const tier = getTier(ctx.score);
  const tierData: CpTierData = [TIER1, TIER2, TIER3, TIER4][tier - 1];
  const colors = TIER_COLORS[tier];
  const s = seed(ctx.name1 + ctx.name2 + String(ctx.score));

  // Pick tag
  const tagZh = pick(tier === 1 ? TAGLINES[1] : tier === 2 ? TAGLINES[2] : tier === 3 ? TAGLINES[3] : TAGLINES[4], s);
  const tagEn = pick(tier === 1 ? TAGLINES_EN[1] : tier === 2 ? TAGLINES_EN[2] : tier === 3 ? TAGLINES_EN[3] : TAGLINES_EN[4], s);

  // Pick main label
  const labelZh = tierData.tagZh;
  const labelEn = tierData.tagEn;

  // Pick 2 unique essays
  const pool = tierData.essays;
  const i1 = s % pool.length;
  const i2 = (s * 3 + 1) % pool.length;
  const essay1 = pool[i1];
  const essay2 = pool[i2 === i1 ? (i1 + 1) % pool.length : i2];

  // Tier phrases — one-line destiny summary
  const phrases: Record<number, { zh: string; en: string }[]> = {
    1: [
      { zh: "靈魂深處與生俱來的契合", en: "A resonance written in the soul" },
      { zh: "宇宙級別的宿命雙向奔赴", en: "A cosmic-level destined connection" },
      { zh: "一眼萬年的命定羈絆", en: "A bond felt across lifetimes" },
    ],
    2: [
      { zh: "慢慢靠近，愈發心動的默契", en: "Drawing closer, hearts quietly align" },
      { zh: "宿命的絲線悄然纏繞彼此", en: "Fate's thread gently ties you together" },
      { zh: "溫柔的牽引，剛剛好的合拍", en: "A gentle pull, perfectly in sync" },
    ],
    3: [
      { zh: "低調卻真實的獨特頻率", en: "A quiet but unmistakable frequency" },
      { zh: "不張揚的小眾限定浪漫", en: "An understated, exclusive romance" },
      { zh: "互補的靈魂，慢熱的溫柔", en: "Complementary souls, slow-burning warmth" },
    ],
    4: [
      { zh: "短暫交匯，卻足夠銘記於心", en: "A brief crossing, yet unforgettable" },
      { zh: "遺憾本身也是另一種浪漫", en: "Even longing holds its own beauty" },
      { zh: "有些人只是經過，卻留下了光", en: "Some pass through, yet leave their light" },
    ],
  };
  const phrase = pick(phrases[tier], s);

  return {
    tier,
    colors,
    labelZh,
    labelEn,
    tagZh,
    tagEn,
    phraseZh: phrase.zh,
    phraseEn: phrase.en,
    essay1Zh: essay1.zh,
    essay1En: essay1.en,
    essay2Zh: essay2.zh,
    essay2En: essay2.en,
  };
}
