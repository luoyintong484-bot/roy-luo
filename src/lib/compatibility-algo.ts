// ===== Compatibility Algorithms for Idol Compatibility Zone =====

// --- 1. Western Synastry (Simplified) ---
interface SynastryResult {
  score: number;
  keywords: string[];
  timeEstimated: boolean;
}

const ZODIAC_SIGNS = [
  "白羊座","金牛座","双子座","巨蟹座","狮子座","处女座",
  "天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"
];

const ZODIAC_ELEMENTS: Record<string, string> = {
  "白羊座": "火", "金牛座": "土", "双子座": "风", "巨蟹座": "水",
  "狮子座": "火", "处女座": "土", "天秤座": "风", "天蝎座": "水",
  "射手座": "火", "摩羯座": "土", "水瓶座": "风", "双鱼座": "水",
};

function getZodiacSign(birthDate: string): string {
  const d = new Date(birthDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  return "双鱼座";
}

function calcSynastry(userBirth: string, artistBirth: string, _userTime?: string, _artistTime?: string): SynastryResult {
  const userSign = getZodiacSign(userBirth);
  const artistSign = getZodiacSign(artistBirth);
  const userEl = ZODIAC_ELEMENTS[userSign];
  const artistEl = ZODIAC_ELEMENTS[artistSign];

  let score = 50;
  const keywords: string[] = [];

  // Element compatibility
  const elementCompat: Record<string, Record<string, number>> = {
    "火": { "火": 8, "风": 10, "土": 4, "水": 6 },
    "风": { "火": 10, "风": 8, "土": 6, "水": 4 },
    "土": { "火": 4, "风": 6, "土": 8, "水": 10 },
    "水": { "火": 6, "风": 4, "土": 10, "水": 8 },
  };
  const elBonus = elementCompat[userEl]?.[artistEl] || 5;
  score += elBonus * 3;

  // Sign harmony (trine = +15, sextile = +10, opposition = -5)
  const uIdx = ZODIAC_SIGNS.indexOf(userSign);
  const aIdx = ZODIAC_SIGNS.indexOf(artistSign);
  const diff = Math.abs(uIdx - aIdx);
  if (diff === 0) { score += 12; keywords.push("灵魂共鸣"); }
  else if (diff === 4 || diff === 8) { score += 15; keywords.push("天然和谐"); }
  else if (diff === 2 || diff === 6 || diff === 10) { score += 10; keywords.push("互补吸引"); }
  else if (diff === 6) { score -= 5; keywords.push("张力挑战"); }

  if (keywords.length === 0) {
    keywords.push(elBonus >= 8 ? "相性良好" : elBonus >= 6 ? "潜力发展" : "磨合成长");
  }

  return { score: Math.min(99, Math.max(10, score)), keywords, timeEstimated: !_userTime };
}

// --- 2. Bazi Five Elements (Simplified) ---
interface BaziResult {
  userElement: string;
  artistElement: string;
  score: number;
  complement: string;
  details: {
    userStrength: string;
    artistStrength: string;
    relation: string;
  };
}

const STEM_ELEMENTS: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
  "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};

const ELEMENT_CYCLE: Record<string, { generates: string; overcomes: string }> = {
  "木": { generates: "火", overcomes: "土" },
  "火": { generates: "土", overcomes: "金" },
  "土": { generates: "金", overcomes: "水" },
  "金": { generates: "水", overcomes: "木" },
  "水": { generates: "木", overcomes: "火" },
};

function getDayPillarElement(dayPillar: string): string {
  if (!dayPillar || dayPillar.length < 1) return "土";
  return STEM_ELEMENTS[dayPillar[0]] || "土";
}

function calcBazi(userDayPillar: string, artistDayPillar: string): BaziResult {
  const userEl = getDayPillarElement(userDayPillar);
  const artistEl = getDayPillarElement(artistDayPillar);
  const cycle = ELEMENT_CYCLE[userEl];

  let score = 50;
  let relation = "中性";
  let complement = "五行平和";

  if (cycle) {
    if (artistEl === cycle.generates) { score += 25; relation = "生助"; complement = `${userEl}生${artistEl}，相互滋养`; }
    else if (cycle.overcomes === artistEl) { score -= 15; relation = "克制"; complement = `${userEl}克${artistEl}，需要磨合`; }
    else if (userEl === artistEl) { score += 10; relation = "比肩"; complement = `同为${userEl}命，志同道合`; }
    else {
      // Artist generates user
      const artistCycle = ELEMENT_CYCLE[artistEl];
      if (artistCycle?.generates === userEl) { score += 20; relation = "被生"; complement = `${artistEl}生${userEl}，对方滋养你`; }
      else { score += 5; relation = "中性"; complement = `五行${userEl}与${artistEl}，自然相处`; }
    }
  }

  return {
    userElement: userEl,
    artistElement: artistEl,
    score: Math.min(99, Math.max(10, score)),
    complement,
    details: {
      userStrength: `${userEl}命`,
      artistStrength: `${artistEl}命`,
      relation,
    },
  };
}

// --- 3. Star Mansion (28 Constellations) Relation ---
type MansionRelation = "安坏" | "荣亲" | "友衰" | "危成" | "业胎" | "命之星";

const MANSION_ORDER = [
  "角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危",
  "室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳",
  "星","张","翼","轸"
];

const RELATION_TABLE: Record<number, MansionRelation> = {
  0: "命之星", 1: "安坏", 2: "荣亲", 3: "友衰", 4: "危成", 5: "业胎",
  6: "命之星", 7: "安坏", 8: "荣亲", 9: "友衰", 10: "危成", 11: "业胎",
  12: "命之星", 13: "安坏",
};

function calcStarMansionRelation(userMansion: string, artistMansion: string): MansionRelation {
  const uIdx = MANSION_ORDER.indexOf(userMansion.replace("宿", ""));
  const aIdx = MANSION_ORDER.indexOf(artistMansion.replace("宿", ""));
  if (uIdx === -1 || aIdx === -1) return "友衰";
  const diff = Math.abs(uIdx - aIdx) % 14;
  return RELATION_TABLE[diff] || "友衰";
}

// --- 4. Overall Relation Tag ---
export const RELATION_CONFIG: Record<string, { label: string; emoji: string; color: string; descEn: string; descZh: string }> = {
  soulmate:    { label: "Soulmate",    emoji: "💕", color: "#FF6B8A", descEn: "A cosmic bond beyond time",             descZh: "跨越时间的宇宙羁绊" },
  deep_trust:  { label: "Deep Trust",  emoji: "💙", color: "#6B9FFF", descEn: "Rooted in karmic depth",                descZh: "根植于业力深处的信任" },
  good_vibes:  { label: "Good Vibes",  emoji: "💚", color: "#6BFF8A", descEn: "Harmonious energy flows naturally",    descZh: "能量自然流动的和谐" },
  best_friends:{ label: "Best Friends",emoji: "💛", color: "#FFD86B", descEn: "Warmth that feels like home",            descZh: "如同归家般的温暖" },
  tension:     { label: "Tension",     emoji: "💔", color: "#FF9F6B", descEn: "Magnetic pull with beautiful friction", descZh: "美丽摩擦中的磁力拉扯" },
  rivals:      { label: "Rivals",      emoji: "⚔️", color: "#9BA3AF", descEn: "Opposing forces that sharpen each other", descZh: "相互砥砺的对立力量" },
};

function calcRelationTag(synastryScore: number, baziScore: number, mansionRelation: MansionRelation): {
  tag: string; label: string; emoji: string; color: string;
} {
  const avg = (synastryScore + baziScore) / 2;

  const mansionBonus: Record<MansionRelation, number> = {
    "命之星": 15, "荣亲": 10, "安坏": 5, "友衰": 3, "危成": 0, "业胎": -2,
  };

  const final = avg + (mansionBonus[mansionRelation] || 0);

  if (final >= 85) return { tag: "soulmate", ...RELATION_CONFIG.soulmate };
  if (final >= 70) return { tag: "deep_trust", ...RELATION_CONFIG.deep_trust };
  if (final >= 55) return { tag: "good_vibes", ...RELATION_CONFIG.good_vibes };
  if (final >= 40) return { tag: "best_friends", ...RELATION_CONFIG.best_friends };
  if (final >= 25) return { tag: "tension", ...RELATION_CONFIG.tension };
  return { tag: "rivals", ...RELATION_CONFIG.rivals };
}

// --- 5. Cosmic Answer Generator ---
export function generateCosmicAnswer(
  userName: string, artistName: string,
  userElement: string, artistElement: string,
  userStarMansion: string, artistStarMansion: string,
  relationTag: string, mansionRelation: string,
  locale: "zh" | "en" = "en"
): string {
  const cfg = RELATION_CONFIG[relationTag];
  const templates: Record<string, { en: string; zh: string }> = {
    soulmate: {
      en: `The cosmos wove your souls into the same constellation, ${userName}. Your encounter with ${artistName} is no coincidence — your elemental energies (${userElement} & ${artistElement}) resonate in perfect harmony. Under the star mansions ${userStarMansion} and ${artistStarMansion}, this ${mansionRelation} bond transcends time. Every astral alignment points to one truth: you were meant to find each other.`,
      zh: `宇宙将你们的灵魂编织在同一星河之中，${userName}。你与${artistName}的相遇绝非偶然——你们的五行能量（${userElement}与${artistElement}）完美共振。在${userStarMansion}与${artistStarMansion}的星宿映照下，这份${mansionRelation}之缘跨越了时空。所有的星象都在指向同一个真相：你们的相遇是命中注定。`,
    },
    deep_trust: {
      en: `${userName}, the karmic threads between you and ${artistName} run deep. Your Bazi pillars reveal a foundation of unwavering trust — ${userElement} and ${artistElement} form a bond that requires no words. The star mansion ${mansionRelation} connection speaks of past-life recognition. This is the kind of relationship where silence feels like home.`,
      zh: `${userName}，你与${artistName}之间的业力之线深不可测。你们的八字命柱揭示了一种无需言语的坚定信任——${userElement}与${artistElement}形成了最稳固的连接。星宿${mansionRelation}关系诉说着前世的相识。这就是那种沉默也如同归家般安心的关系。`,
    },
    good_vibes: {
      en: `A refreshing breeze of harmony flows between you and ${artistName}, ${userName}. Your ${userElement} nature dances effortlessly with ${artistName}'s ${artistElement} essence. The ${mansionRelation} star connection amplifies this natural resonance. You don't need to try — the universe already tuned your frequencies to the same channel.`,
      zh: `一阵清新的和谐之风在你与${artistName}之间流动，${userName}。你的${userElement}之性与${artistName}的${artistElement}之质自然地共舞。${mansionRelation}星宿连接放大了这份天然的共振。你无需刻意——宇宙早已将你们的频率调至同一频道。`,
    },
    best_friends: {
      en: `${userName}, what you share with ${artistName} is the warmth of a thousand shared sunsets. ${userElement} and ${artistElement} create a friendship written in the stars — easy, reliable, endlessly supportive. The ${mansionRelation} star mansion bond ensures this connection ages like fine wine, growing richer with every cosmic cycle.`,
      zh: `${userName}，你与${artistName}之间拥有的是如同共享千次日落的温暖。${userElement}与${artistElement}造就了一种写于星辰中的友谊——轻松、可靠、无尽支持。${mansionRelation}星宿之缘确保这份连接如同陈年美酒，在每一个宇宙周期中愈发醇厚。`,
    },
    tension: {
      en: `There's an electric charge in the space between you and ${artistName}, ${userName}. Your ${userElement} energy and their ${artistElement} essence create a beautiful friction — a push-and-pull that keeps the cosmos spinning. The ${mansionRelation} star dynamic adds an irresistible magnetic tension. This isn't chaos; it's chemistry in its most cosmic form.`,
      zh: `你与${artistName}之间存在着一种电流般的张力，${userName}。你的${userElement}能量与Ta的${artistElement}本质制造了一种美丽的摩擦——一种推动宇宙旋转的推拉之力。${mansionRelation}星宿动力增添了不可抗拒的磁力拉扯。这不是混乱；这是最宇宙化的化学反应。`,
    },
    rivals: {
      en: `${userName}, the stars have placed you and ${artistName} on opposing trajectories — not as enemies, but as whetstones that sharpen each other's blades. ${userElement} challenges ${artistElement} in ways that force growth. The ${mansionRelation} star mansion relation is the universe's way of teaching through contrast. Iron sharpens iron, and so do stars.`,
      zh: `${userName}，星辰将你与${artistName}置于对立轨迹之上——并非敌人，而是砥砺彼此的磨刀石。${userElement}以迫使成长的方式挑战着${artistElement}。${mansionRelation}星宿关系是宇宙通过对比施教的方式。铁磨铁，星亦然。`,
    },
  };
  const t = templates[relationTag] || templates.good_vibes;
  return locale === "zh" ? t.zh : t.en;
}

// --- Main Calculation ---
export interface CompatibilityCalcResult {
  synastry: SynastryResult;
  bazi: BaziResult;
  starMansionRelation: MansionRelation;
  overallTag: { tag: string; label: string; emoji: string; color: string };
  overallScore: number;
  summary: string;
  summaryZh: string;
}

export function calculateCompatibility(
  userBirth: string,
  artistBirth: string,
  userBirthTime: string | undefined,
  userDayPillar: string,
  artistDayPillar: string,
  userMansion: string,
  artistMansion: string,
): CompatibilityCalcResult {
  const synastry = calcSynastry(userBirth, artistBirth, userBirthTime);
  const bazi = calcBazi(userDayPillar, artistDayPillar);
  const starMansionRelation = calcStarMansionRelation(userMansion, artistMansion);
  const overallTag = calcRelationTag(synastry.score, bazi.score, starMansionRelation);
  const overallScore = Math.round((synastry.score + bazi.score) / 2);

  return {
    synastry,
    bazi,
    starMansionRelation,
    overallTag,
    overallScore,
    summary: RELATION_CONFIG[overallTag.tag]?.descEn || "Harmonious connection",
    summaryZh: RELATION_CONFIG[overallTag.tag]?.descZh || "和谐连接",
  };
}

// Get all 28 mansions
export function getMansionFromIndex(idx: number): string {
  if (idx < 0 || idx >= MANSION_ORDER.length) return "角宿";
  return MANSION_ORDER[idx] + "宿";
}

export { ZODIAC_SIGNS, ZODIAC_ELEMENTS, MANSION_ORDER };
export type { MansionRelation };
