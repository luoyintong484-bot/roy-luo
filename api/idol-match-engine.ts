/* ============================================================
   R7 Fortune — Idol Match Score Calculation Engine
   Server-side only. 4-dimension weighted scoring, 100-point scale.
   Idempotent: same birthdays always produce the same score.
   ============================================================ */

// ---- Constants ----

const ZODIAC_SIGNS = [
  "白羊座","金牛座","双子座","巨蟹座","狮子座","处女座",
  "天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"
] as const;

const ZODIAC_ELEMENTS: Record<string, string> = {
  "白羊座":"火","金牛座":"土","双子座":"风","巨蟹座":"水",
  "狮子座":"火","处女座":"土","天秤座":"风","天蝎座":"水",
  "射手座":"火","摩羯座":"土","水瓶座":"风","双鱼座":"水",
};

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

const STEM_ELEMENTS: Record<string, string> = {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土",
  "己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
};

const ELEMENT_CYCLE: Record<string, { generates: string; overcomes: string }> = {
  "木":{generates:"火",overcomes:"土"},
  "火":{generates:"土",overcomes:"金"},
  "土":{generates:"金",overcomes:"水"},
  "金":{generates:"水",overcomes:"木"},
  "水":{generates:"木",overcomes:"火"},
};

// 28 Mansions in order (starting from 虚宿 for lunar new year alignment)
const MANSIONS = [
  "角宿","亢宿","氐宿","房宿","心宿","尾宿","箕宿",
  "斗宿","牛宿","女宿","虚宿","危宿","室宿","壁宿",
  "奎宿","娄宿","胃宿","昴宿","毕宿","觜宿","参宿",
  "井宿","鬼宿","柳宿","星宿","张宿","翼宿","轸宿",
];

// Mansion relationship scoring
const MANSION_RELATION_SCORES: Record<string, { score: number; label: string }> = {
  "荣亲":{score:18,label:"荣亲"},
  "危成":{score:17,label:"危成"},
  "安坏":{score:13,label:"安坏"},
  "友衰":{score:12,label:"友衰"},
  "命之星":{score:7,label:"命之星"},
  "业胎":{score:14,label:"业胎"},
  "相冲":{score:6,label:"相冲"},
};

// Nayin (纳音) five-element mapping by year stem+branch
const NAYIN_MAP: Record<string, string> = {
  "甲子":"金","乙丑":"金","丙寅":"火","丁卯":"火","戊辰":"木","己巳":"木",
  "庚午":"土","辛未":"土","壬申":"金","癸酉":"金","甲戌":"火","乙亥":"火",
  "丙子":"水","丁丑":"水","戊寅":"土","己卯":"土","庚辰":"金","辛巳":"金",
  "壬午":"木","癸未":"木","甲申":"水","乙酉":"水","丙戌":"土","丁亥":"土",
  "戊子":"火","己丑":"火","庚寅":"木","辛卯":"木","壬辰":"水","癸巳":"水",
  "甲午":"金","乙未":"金","丙申":"火","丁酉":"火","戊戌":"木","己亥":"木",
  "庚子":"土","辛丑":"土","壬寅":"金","癸卯":"金","甲辰":"火","乙巳":"火",
  "丙午":"水","丁未":"水","戊申":"土","己酉":"土","庚戌":"金","辛亥":"金",
  "壬子":"木","癸丑":"木","甲寅":"水","乙卯":"水","丙辰":"土","丁巳":"土",
  "戊午":"火","己未":"火","庚申":"木","辛酉":"木","壬戌":"水","癸亥":"水",
};

// ---- Helper Functions ----

/** Get zodiac sign from birth date string (YYYY-MM-DD) */
export function getZodiacSign(birthDate: string): string {
  const d = new Date(birthDate);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m===3&&day>=21)||(m===4&&day<=19)) return "白羊座";
  if ((m===4&&day>=20)||(m===5&&day<=20)) return "金牛座";
  if ((m===5&&day>=21)||(m===6&&day<=21)) return "双子座";
  if ((m===6&&day>=22)||(m===7&&day<=22)) return "巨蟹座";
  if ((m===7&&day>=23)||(m===8&&day<=22)) return "狮子座";
  if ((m===8&&day>=23)||(m===9&&day<=22)) return "处女座";
  if ((m===9&&day>=23)||(m===10&&day<=23)) return "天秤座";
  if ((m===10&&day>=24)||(m===11&&day<=22)) return "天蝎座";
  if ((m===11&&day>=23)||(m===12&&day<=21)) return "射手座";
  if ((m===12&&day>=22)||(m===1&&day<=19)) return "摩羯座";
  if ((m===1&&day>=20)||(m===2&&day<=18)) return "水瓶座";
  return "双鱼座";
}

/** Compute Bazi Day Pillar from birth date */
export function getBaziDayPillar(birthDate: string): string {
  const base = new Date(1900, 0, 31);
  const d = new Date(birthDate);
  const diff = Math.floor((d.getTime() - base.getTime()) / 86400000);
  const stemIdx = ((diff % 10) + 10) % 10;
  const branchIdx = ((diff % 12) + 12) % 12;
  return STEMS[stemIdx] + BRANCHES[branchIdx];
}

/** Get year pillar (stem+branch) from year */
function getYearPillar(year: number): string {
  const stemIdx = (year - 4) % 10;
  const branchIdx = (year - 4) % 12;
  return STEMS[stemIdx] + BRANCHES[branchIdx];
}

/** Get Nayin element from birth year */
export function getNayinElement(birthDate: string): string {
  const year = new Date(birthDate).getFullYear();
  const yp = getYearPillar(year);
  return NAYIN_MAP[yp] || "土";
}

/** Get day stem element from day pillar */
export function getDayStemElement(dayPillar: string): string {
  return STEM_ELEMENTS[dayPillar[0]] || "土";
}

/** Determine mansion index for a birth date */
function getMansionIndex(birthDate: string): number {
  const d = new Date(birthDate);
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return doy % 28;
}

/** Determine mansion relationship between two mansion indices */
function getMansionRelation(idx1: number, idx2: number): { score: number; label: string } {
  const diff = Math.abs(idx1 - idx2);
  const dist = Math.min(diff, 28 - diff);

  // Simplified mansion relationship mapping based on distance
  if (dist === 0) return MANSION_RELATION_SCORES["命之星"];
  if (dist <= 2) return MANSION_RELATION_SCORES["荣亲"];
  if (dist <= 4) return MANSION_RELATION_SCORES["危成"];
  if (dist <= 7) return MANSION_RELATION_SCORES["安坏"];
  if (dist <= 10) return MANSION_RELATION_SCORES["友衰"];
  if (dist <= 11) return MANSION_RELATION_SCORES["业胎"];
  return MANSION_RELATION_SCORES["相冲"];
}

// ================================================================
//  FOUR-DIMENSION SCORING ENGINE
// ================================================================

export interface MatchScoreInput {
  userBirthDate: string;      // YYYY-MM-DD
  artistBirthDate: string;     // YYYY-MM-DD
  artistDayPillar?: string;    // Pre-computed day pillar (optional, fallback to calculation)
  artistZodiacSign?: string;   // Pre-computed zodiac (optional)
  artistStarMansion?: string;  // Pre-computed mansion (optional)
}

export interface MatchScoreResult {
  totalScore: number;
  matchLevel: string;
  fiveElementsScore: number;
  zodiacScore: number;
  constellationScore: number;
  nayinScore: number;
  details: {
    userDayElement: string;
    artistDayElement: string;
    elementRelation: string;
    userZodiac: string;
    artistZodiac: string;
    zodiacRelation: string;
    userMansion: string;
    artistMansion: string;
    mansionRelation: string;
    userNayin: string;
    artistNayin: string;
    nayinRelation: string;
  };
}

/**
 * Dimension 1: Five Elements (日主五行生克) — Weight 40%, Max 40pts
 */
function scoreFiveElements(userEl: string, artistEl: string): { score: number; relation: string } {
  const cycle = ELEMENT_CYCLE;

  // User generates Artist (我生) — strong flow
  if (cycle[userEl]?.generates === artistEl) {
    return { score: 36, relation: `${userEl}生${artistEl}，流通顺遂` };
  }
  // Artist generates User (生我) — beneficial
  if (cycle[artistEl]?.generates === userEl) {
    return { score: 38, relation: `${artistEl}生${userEl}，滋养有利` };
  }
  // Same element (比和) — harmonious
  if (userEl === artistEl) {
    return { score: 35, relation: `同为${userEl}命，志同道合` };
  }
  // User overcomes Artist (我克) — controlled
  if (cycle[userEl]?.overcomes === artistEl) {
    return { score: 28, relation: `${userEl}克${artistEl}，有制可调` };
  }
  // Artist overcomes User (克我) — challenging
  if (cycle[artistEl]?.overcomes === userEl) {
    return { score: 22, relation: `${artistEl}克${userEl}，需制化调和` };
  }
  // Clash/conflict
  return { score: 15, relation: `${userEl}与${artistEl}，冲刑需救` };
}

/**
 * Dimension 2: Zodiac Compatibility (太阳星座适配) — Weight 30%, Max 30pts
 */
function scoreZodiac(userZodiac: string, artistZodiac: string): { score: number; relation: string } {
  const uEl = ZODIAC_ELEMENTS[userZodiac];
  const aEl = ZODIAC_ELEMENTS[artistZodiac];
  const uIdx = ZODIAC_SIGNS.indexOf(userZodiac);
  const aIdx = ZODIAC_SIGNS.indexOf(artistZodiac);
  const diff = Math.abs(uIdx - aIdx);
  const dist = Math.min(diff, 12 - diff);

  // Same sign
  if (dist === 0) return { score: 25, relation: "同座共鸣" };

  // Same element = trine (三分相) — very harmonious
  if (uEl === aEl) {
    return { score: 27, relation: `同为${uEl}象，三分和谐` };
  }

  // Sextile (六分相) — harmonious
  if (dist === 2 || dist === 4) {
    return { score: 22, relation: "六分和谐" };
  }

  // Opposition (对宫) or square (四分相) — conflict
  if (dist === 6) {
    return { score: 14, relation: "对宫张力" };
  }
  if (dist === 3 || dist === 5) {
    return { score: 16, relation: "四分挑战" };
  }

  return { score: 18, relation: "中性适配" };
}

/**
 * Dimension 3: Star Mansion (二十七星宿关系) — Weight 20%, Max 20pts
 */
function scoreStarMansion(userBirthDate: string, artistBirthDate: string): {
  score: number;
  relation: string;
  userMansion: string;
  artistMansion: string;
} {
  const uIdx = getMansionIndex(userBirthDate);
  const aIdx = getMansionIndex(artistBirthDate);
  const userMansion = MANSIONS[uIdx];
  const artistMansion = MANSIONS[aIdx];
  const rel = getMansionRelation(uIdx, aIdx);
  return {
    score: rel.score,
    relation: rel.label,
    userMansion,
    artistMansion,
  };
}

/**
 * Dimension 4: Nayin Five Elements (纳音五行合度) — Weight 10%, Max 10pts
 */
function scoreNayin(userBirthDate: string, artistBirthDate: string): {
  score: number;
  relation: string;
  userNayin: string;
  artistNayin: string;
} {
  const uNayin = getNayinElement(userBirthDate);
  const aNayin = getNayinElement(artistBirthDate);
  const cycle = ELEMENT_CYCLE;

  let score = 5;
  let relation = `${uNayin}-${aNayin}相克`;

  if (uNayin === aNayin) {
    score = 9;
    relation = `同为${uNayin}命，相合共振`;
  } else if (cycle[uNayin]?.generates === aNayin) {
    score = 8;
    relation = `${uNayin}生${aNayin}，天然相生`;
  } else if (cycle[aNayin]?.generates === uNayin) {
    score = 9;
    relation = `${aNayin}生${uNayin}，有利滋养`;
  } else if (cycle[uNayin]?.overcomes === aNayin) {
    score = 6;
    relation = `${uNayin}克${aNayin}，可控可调`;
  } else if (cycle[aNayin]?.overcomes === uNayin) {
    score = 4;
    relation = `${aNayin}克${uNayin}，需谨慎`;
  }

  return { score, relation, userNayin: uNayin, artistNayin: aNayin };
}

// ================================================================
//  MAIN CALCULATION — Idempotent, server-side only
// ================================================================

export function calculateMatchScore(input: MatchScoreInput): MatchScoreResult {
  const { userBirthDate, artistBirthDate } = input;

  // Compute derived fields
  const userDayPillar = getBaziDayPillar(userBirthDate);
  const artistDayPillar = input.artistDayPillar || getBaziDayPillar(artistBirthDate);
  const userDayEl = getDayStemElement(userDayPillar);
  const artistDayEl = getDayStemElement(artistDayPillar);

  const userZodiac = getZodiacSign(userBirthDate);
  const artistZodiac = input.artistZodiacSign || getZodiacSign(artistBirthDate);

  // Dimension 1: Five Elements (40%)
  const elResult = scoreFiveElements(userDayEl, artistDayEl);
  // Scale to 40-point max
  const fiveElementsScore = Math.min(40, Math.round(elResult.score * 40 / 38));

  // Dimension 2: Zodiac (30%)
  const zodiacResult = scoreZodiac(userZodiac, artistZodiac);
  const zodiacScore = Math.min(30, Math.round(zodiacResult.score * 30 / 27));

  // Dimension 3: Star Mansion (20%)
  const mansionResult = scoreStarMansion(userBirthDate, artistBirthDate);
  const constellationScore = Math.min(20, Math.round(mansionResult.score * 20 / 18));

  // Dimension 4: Nayin (10%)
  const nayinResult = scoreNayin(userBirthDate, artistBirthDate);
  const nayinScore = Math.min(10, nayinResult.score);

  // Total
  let totalScore = fiveElementsScore + zodiacScore + constellationScore + nayinScore;

  // Clamp to 52-97
  totalScore = Math.max(52, Math.min(97, totalScore));

  // Match level
  let matchLevel = "";
  if (totalScore >= 90) matchLevel = "TOP MATCH";
  else if (totalScore >= 80) matchLevel = "HIGH MATCH";
  else if (totalScore >= 70) matchLevel = "GOOD MATCH";

  return {
    totalScore,
    matchLevel,
    fiveElementsScore,
    zodiacScore,
    constellationScore,
    nayinScore,
    details: {
      userDayElement: userDayEl,
      artistDayElement: artistDayEl,
      elementRelation: elResult.relation,
      userZodiac,
      artistZodiac,
      zodiacRelation: zodiacResult.relation,
      userMansion: mansionResult.userMansion,
      artistMansion: mansionResult.artistMansion,
      mansionRelation: mansionResult.relation,
      userNayin: nayinResult.userNayin,
      artistNayin: nayinResult.artistNayin,
      nayinRelation: nayinResult.relation,
    },
  };
}
