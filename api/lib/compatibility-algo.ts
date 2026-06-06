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
function calcRelationTag(synastryScore: number, baziScore: number, mansionRelation: MansionRelation): {
  tag: "soulmate" | "deep_trust" | "good_vibes" | "best_friends" | "tension" | "rivals";
  label: string;
} {
  const avg = (synastryScore + baziScore) / 2;

  const mansionBonus: Record<MansionRelation, number> = {
    "命之星": 15, "荣亲": 10, "安坏": 5, "友衰": 3, "危成": 0, "业胎": -2,
  };

  const final = avg + (mansionBonus[mansionRelation] || 0);

  if (final >= 85) return { tag: "soulmate", label: "Soulmate" };
  if (final >= 70) return { tag: "deep_trust", label: "Deep Trust" };
  if (final >= 55) return { tag: "good_vibes", label: "Good Vibes" };
  if (final >= 40) return { tag: "best_friends", label: "Best Friends" };
  if (final >= 25) return { tag: "tension", label: "Tension" };
  return { tag: "rivals", label: "Rivals" };
}

// --- Main Calculation ---
export interface CompatibilityCalcResult {
  synastry: SynastryResult;
  bazi: BaziResult;
  starMansionRelation: MansionRelation;
  overallTag: { tag: string; label: string };
  overallScore: number;
  summary: string;
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

  const summaries: Record<string, string> = {
    "soulmate": `你们的星盘与五行高度契合，星宿关系为${starMansionRelation}。这是极为罕见的灵魂伴侣组合，彼此间存在深层的吸引力与理解。`,
    "deep_trust": `星盘与五行显示出强烈的信任基础，星宿${starMansionRelation}关系。你们可以建立深厚而持久的连接。`,
    "good_vibes": `整体能量场非常和谐，星宿${starMansionRelation}关系。相处轻松愉快，彼此带来正面的影响。`,
    "best_friends": `适合成为彼此的好朋友，星宿${starMansionRelation}关系。友谊稳固，互相支持。`,
    "tension": `存在吸引力但也有挑战，星宿${starMansionRelation}关系。需要更多理解与磨合。`,
    "rivals": `能量场存在冲突，星宿${starMansionRelation}关系。但这不代表不好，有时候正是挑战促成成长。`,
  };

  return {
    synastry,
    bazi,
    starMansionRelation,
    overallTag,
    overallScore,
    summary: summaries[overallTag.tag] || summaries["good_vibes"],
  };
}

// Get all 28 mansions
export function getMansionFromIndex(idx: number): string {
  if (idx < 0 || idx >= MANSION_ORDER.length) return "角宿";
  return MANSION_ORDER[idx] + "宿";
}

export { ZODIAC_SIGNS, ZODIAC_ELEMENTS, MANSION_ORDER };
export type { MansionRelation };
