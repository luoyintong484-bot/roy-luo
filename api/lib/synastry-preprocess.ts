/* ============================================================
   R7 Fortune — Synastry Preprocessing Engine
   Computes full bazi, western synastry, star mansion, and Vedic
   astrology, then outputs ONLY compact key conclusions for AI.
   Raw complete chart data stored in DB — never sent to AI.
   ============================================================ */

// ---- Types ----
export interface PersonData {
  name: string;
  birthDate: string;       // ISO date string
  birthTime?: string;      // HH:MM format
  birthPlace?: string;
  zodiacSign: string;
  element: string;
  baziDayPillar: string;
  starMansion: string;
}

export interface CompactPreprocessResult {
  // Essential identifiers only
  person1: { name: string; zodiac: string; element: string; dayPillar: string; mansion: string };
  person2: { name: string; zodiac: string; element: string; dayPillar: string; mansion: string };

  // Bazi: just the relationship dynamics
  bazi: {
    p1Element: string;
    p2Element: string;
    relation: string;       // e.g. "木生火，p1滋养p2"
    score: number;
    complement: string;     // one-line summary
  };

  // Western synastry: key aspects only
  synastry: {
    score: number;
    keywords: string[];
    elementDynamic: string; // e.g. "火-风：经典燃烧循环"
    signHarmony: string;    // e.g. "三分相，天然和谐"
    keyAspect: string;      // single most important aspect
  };

  // Star mansion: relationship type
  starMansion: {
    relation: string;       // e.g. "安坏", "荣亲", "命之星"
    description: string;    // one-line archetype description
  };

  // Vedic / Indian astrology: karmic nodes
  vedic: {
    rahuKetuConnection: string;  // whether nodes contact personal planets
    seventhLordDynamic: string;  // 7th house lord relationship
    karmicSummary: string;       // one-line karmic conclusion
  };

  // Overall compatibility snapshot
  overall: {
    score: number;
    tag: string;
    label: string;
    summary: string;
  };
}

// ---- Zodiac and Element Maps ----
const ZODIAC_SIGNS = [
  "白羊座","金牛座","双子座","巨蟹座","狮子座","处女座",
  "天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"
];

const ZODIAC_ELEMENTS: Record<string, string> = {
  "白羊座":"火","金牛座":"土","双子座":"风","巨蟹座":"水",
  "狮子座":"火","处女座":"土","天秤座":"风","天蝎座":"水",
  "射手座":"火","摩羯座":"土","水瓶座":"风","双鱼座":"水",
};

const STEM_ELEMENTS: Record<string, string> = {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土",
  "己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
};

const MANSION_ORDER = [
  "角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危",
  "室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳",
  "星","张","翼","轸"
];

// ---- Helper Functions (available for future use) ----
function _getZodiacSign(birthDate: string): string {
  const d = new Date(birthDate);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "白羊座";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "金牛座";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 21)) return "双子座";
  if ((m === 6 && day >= 22) || (m === 7 && day <= 22)) return "巨蟹座";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "狮子座";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "处女座";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 23)) return "天秤座";
  if ((m === 10 && day >= 24) || (m === 11 && day <= 22)) return "天蝎座";
  if ((m === 11 && day >= 23) || (m === 12 && day <= 21)) return "射手座";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "摩羯座";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "水瓶座";
  return "双鱼座";
}

function getDayPillarElement(dayPillar: string): string {
  if (!dayPillar || dayPillar.length < 1) return "土";
  return STEM_ELEMENTS[dayPillar[0]] || "土";
}

function _getStarMansion(birthDate: string): string {
  const d = new Date(birthDate);
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return MANSION_ORDER[doy % 28] + "宿";
}

// ---- 1. Bazi Preprocessing ----
function preprocessBazi(p1Pillar: string, p2Pillar: string) {
  const p1El = getDayPillarElement(p1Pillar);
  const p2El = getDayPillarElement(p2Pillar);

  const generating: Record<string, string> = { "木":"火","火":"土","土":"金","金":"水","水":"木" };
  const overcoming: Record<string, string> = { "木":"土","土":"水","水":"火","火":"金","金":"木" };

  let relation: string;
  let score: number;
  let complement: string;

  if (generating[p1El] === p2El) {
    relation = `${p1El}生${p2El}`;
    score = 85;
    complement = `你的${p1El}能量天然滋养对方的${p2El}，形成顺畅的能量流动。`;
  } else if (generating[p2El] === p1El) {
    relation = `${p2El}生${p1El}`;
    score = 80;
    complement = `对方的${p2El}能量天然滋养你的${p1El}，你在这段关系中感受到被呵护。`;
  } else if (overcoming[p1El] === p2El) {
    relation = `${p1El}克${p2El}`;
    score = 45;
    complement = `你的${p1El}能量克制对方的${p2El}，需要察觉力量感的差异。`;
  } else if (overcoming[p2El] === p1El) {
    relation = `${p2El}克${p1El}`;
    score = 40;
    complement = `对方的${p2El}能量克制你的${p1El}，这是成长课题而非障碍。`;
  } else if (p1El === p2El) {
    relation = `同为${p1El}命·比肩`;
    score = 70;
    complement = `同为${p1El}命，志同道合，彼此理解无需多言。`;
  } else {
    relation = `${p1El}-${p2El}·中性`;
    score = 60;
    complement = `五行${p1El}与${p2El}各自独立，互不干扰，自然相处。`;
  }

  return { p1Element: p1El, p2Element: p2El, relation, score, complement };
}

// ---- 2. Western Synastry Preprocessing ----
function preprocessSynastry(p1Zodiac: string, p2Zodiac: string) {
  const p1El = ZODIAC_ELEMENTS[p1Zodiac] || "水";
  const p2El = ZODIAC_ELEMENTS[p2Zodiac] || "水";

  const elementCompat: Record<string, Record<string, number>> = {
    "火":{ "火":8,"风":10,"土":4,"水":6 },
    "风":{ "火":10,"风":8,"土":6,"水":4 },
    "土":{ "火":4,"风":6,"土":8,"水":10 },
    "水":{ "火":6,"风":4,"土":10,"水":8 },
  };
  const elScore = elementCompat[p1El]?.[p2El] || 5;

  // Element dynamic description
  const dynamicMap: Record<string, Record<string, string>> = {
    "火":{ "风":"经典燃烧循环——火提供火花，风供应氧气，共同创造无法独自维持的烈焰。",
           "火":"共振谐波——如同两把调至同一音高的乐器，即时的本能理解绕过语言限制。",
           "水":"两极张力——火的强度可能蒸发水的细微情感，水的深度可能让火感到窒息。",
           "土":"互补挑战——火的热力可以温暖土的沉稳，土的结构可以给火提供容器。" },
    "风":{ "火":"经典燃烧循环——风供应氧气，火提供火花，最具动态张力的元素配对。",
           "风":"思维共振——两颗心灵在同一频率上飘荡，对话永远不会枯竭。",
           "水":"智性与感性的碰撞——风的逻辑遇上水的直觉，需要彼此翻译。",
           "土":"自由与安稳的拉扯——风需要空间，土需要定所，各有各的真理。" },
    "土":{ "火":"互补挑战——土的稳固给火提供根基，火的热情给土注入生命。",
           "风":"自由与安稳的拉扯——土需要定所，风需要空间，平衡是共同课题。",
           "土":"稳定共振——两座山脉并肩而立，沉默中的默契同样深沉。",
           "水":"滋养根基——水带来情感深度与流动，土提供结构与稳定，如雨水落在肥沃土壤。" },
    "水":{ "火":"两极张力——水的深度可能让火感到窒息，火的强度可能蒸发水的细微情感。",
           "风":"智性与感性的碰撞——水的直觉遇上风的逻辑，各有各的母语。",
           "土":"滋养根基——如同雨水落在肥沃土壤，创造深根生长的条件，抵御任何风暴。",
           "水":"情感深洋——两条河流汇合，情绪的暗涌彼此共鸣，无需言语。" },
  };

  const elementDynamic = dynamicMap[p1El]?.[p2El] || `${p1El}-${p2El}元素组合形成独特能量场。`;

  // Sign harmony
  const p1Idx = ZODIAC_SIGNS.indexOf(p1Zodiac);
  const p2Idx = ZODIAC_SIGNS.indexOf(p2Zodiac);
  const diff = Math.abs(p1Idx - p2Idx);
  let signHarmony: string;
  let signBonus: number;

  if (diff === 0) { signHarmony = "同座共振——彼此如镜中倒影"; signBonus = 12; }
  else if (diff === 4 || diff === 8) { signHarmony = "三分相·天然和谐——灵魂深处的共鸣"; signBonus = 15; }
  else if (diff === 2 || diff === 10) { signHarmony = "六分相·互补吸引——对方填补了你的空缺"; signBonus = 10; }
  else if (diff === 6) { signHarmony = "对分相·张力吸引——对立产生深刻的磁力"; signBonus = -5; }
  else { signHarmony = "一般相位·缓慢发酵——需要时间发现彼此的深度"; signBonus = 0; }

  const score = Math.min(99, Math.max(10, 40 + elScore * 3 + signBonus));
  const keywords: string[] = [];
  if (elScore >= 8) keywords.push("元素高度互补");
  if (diff === 0 || diff === 4 || diff === 8) keywords.push("灵魂共振");
  if (diff === 6) keywords.push("张力吸引");
  if (score >= 70) keywords.push("高匹配度");

  // Key aspect (simplified — uses sign relationship as proxy)
  const aspectMap: Record<string, string> = {
    "同座共振——彼此如镜中倒影": "太阳-太阳合相：核心本质高度一致",
    "三分相·天然和谐——灵魂深处的共鸣": "金星-火星三分相：爱与被爱的方式自然契合",
    "六分相·互补吸引——对方填补了你的空缺": "月亮-水星六分相：情感与思维相互补充",
    "对分相·张力吸引——对立产生深刻的磁力": "金星-火星对分相：吸引力与冲突并存，经典chemistry",
  };
  const keyAspect = aspectMap[signHarmony] || "日月互动相位：各自发光，相互辉映";

  return { score, keywords, elementDynamic, signHarmony, keyAspect };
}

// ---- 3. Star Mansion Preprocessing ----
type MansionRelation = "安坏" | "荣亲" | "友衰" | "危成" | "业胎" | "命之星";

function preprocessStarMansion(p1Mansion: string, p2Mansion: string) {
  const uIdx = MANSION_ORDER.indexOf(p1Mansion.replace("宿", ""));
  const aIdx = MANSION_ORDER.indexOf(p2Mansion.replace("宿", ""));
  if (uIdx === -1 || aIdx === -1) {
    return { relation: "友衰" as MansionRelation, description: "轻松愉快的陪伴，彼此欣赏。" };
  }

  const diff = Math.abs(uIdx - aIdx) % 14;
  const relationTable: Record<number, MansionRelation> = {
    0: "命之星", 1: "安坏", 2: "荣亲", 3: "友衰", 4: "危成", 5: "业胎",
    6: "命之星", 7: "安坏", 8: "荣亲", 9: "友衰", 10: "危成", 11: "业胎",
    12: "命之星", 13: "安坏",
  };
  const relation = relationTable[diff] || "友衰";

  const descriptions: Record<MansionRelation, string> = {
    "命之星": "最稀有的灵魂链接——两个灵魂由同一星体模具铸造。在不同生命中互為折射，遇见的瞬间即认出彼此。",
    "荣亲": "互相提升的业力羁绊——一方自然抬升另一方，对方的成功如同自己的一般喜悦。",
    "安坏": "強烈兩極的磁力推拉——稳定与破坏相遇，在摩擦中双方被彻底转化。不是舒适的连结，但绝对难以忘怀。",
    "友衰": "轻松陪伴的自然契合——无需戏剧性的深度也能彼此滋养，如憋气太久后的呼氣。",
    "危成": "在挑战中锻造的连结——共同面对外部逆境时，情谊反而最深。",
    "业胎": "跨越生世的未竟之事——故事在此生之前就已开始，今生相遇是为完成前世的约定。",
  };

  return { relation, description: descriptions[relation] };
}

// ---- 4. Vedic / Indian Astrology Preprocessing ----
function preprocessVedic(p1Zodiac: string, p2Zodiac: string, p1Mansion: string, p2Mansion: string) {
  // Simplified Vedic: derive Rahu/Ketu (North/South Node) indicators from zodiac + mansion
  const p1Idx = ZODIAC_SIGNS.indexOf(p1Zodiac);
  const p2Idx = ZODIAC_SIGNS.indexOf(p2Zodiac);
  // Check if nodes contact personal planets (simplified: significant angle differences)
  const nodeContact = Math.abs((p1Idx - p2Idx + 12) % 12);
  const hasNodeContact = nodeContact === 0 || nodeContact === 4 || nodeContact === 6 || nodeContact === 8 || nodeContact === 10;

  const rahuKetuConnection = hasNodeContact
    ? "双方南北交点与个人行星形成紧密相位——这是强烈的业力信号，表明相遇绝非偶然。"
    : "南北交点未与个人行星形成主要相位——今生的连接更多是当下的选择而非前世的牵引。";

  // 7th house lord (simplified: use sign ruler)
  const rulers: Record<string, string> = {
    "白羊座":"火星","金牛座":"金星","双子座":"水星","巨蟹座":"月亮",
    "狮子座":"太阳","处女座":"水星","天秤座":"金星","天蝎座":"火星",
    "射手座":"木星","摩羯座":"土星","水瓶座":"土星","双鱼座":"木星",
  };
  const p1Lord = rulers[p1Zodiac] || "未知";
  const p2Lord = rulers[p2Zodiac] || "未知";

  const seventhDynamic = p1Lord === p2Lord
    ? `双方第七宫主星同为${p1Lord}——你们在伴侣关系中追求的东西惊人地相似，这既是祝福也是考验。`
    : `你的第七宫主星${p1Lord}与对方的${p2Lord}${["火星","金星","月亮"].includes(p1Lord) && ["火星","金星","月亮"].includes(p2Lord) ? "形成有利的情感互动——亲密关系中的化学反应强烈而真实。" : "形成互补视角——你们各自带来了对方在关系中最需要的东西。"}`;

  // Karmic summary
  const karmicPatterns: Record<string, string> = {
    "命之星": "罗喉-计都轴线激活：两人共享一个灵魂蓝图。这不是第一次相遇，也不会是最后一次。",
    "荣亲": "南交点和谐相位：前世曾为亲近之人（家人、挚友）。今生继续彼此成就的业力功课。",
    "安坏": "北交点张力相位：相遇就是为了打破对方的舒适区。转化性的关系，带有强烈的进化意图。",
    "业胎": "南北交点轴线贯穿：最沉重的业力类型——有未完成的约定跨越了不止一生。",
  };

  const mansionRel = preprocessStarMansion(p1Mansion, p2Mansion).relation;
  const karmicSummary = karmicPatterns[mansionRel]
    || "业力中性的相遇——你们选择了彼此，而不是被命运推到一起。这同样美丽。";

  return { rahuKetuConnection, seventhLordDynamic: seventhDynamic, karmicSummary };
}

// ---- Main Export ----
export function preprocessCompatibilityData(
  p1: PersonData,
  p2: PersonData,
): CompactPreprocessResult {
  const bazi = preprocessBazi(p1.baziDayPillar, p2.baziDayPillar);
  const synastry = preprocessSynastry(p1.zodiacSign, p2.zodiacSign);
  const starMansion = preprocessStarMansion(p1.starMansion, p2.starMansion);
  const vedic = preprocessVedic(p1.zodiacSign, p2.zodiacSign, p1.starMansion, p2.starMansion);

  // Overall
  const avgScore = Math.round((bazi.score + synastry.score) / 2);
  const mansionBonus: Record<string, number> = { "命之星":15,"荣亲":10,"安坏":5,"友衰":3,"危成":0,"业胎":-2 };
  const finalScore = avgScore + (mansionBonus[starMansion.relation] || 0);

  let tag: string; let label: string; let summary: string;
  if (finalScore >= 85) {
    tag = "soulmate"; label = "Soulmate";
    summary = `星盘与五行高度契合，星宿${starMansion.relation}。极为罕见的灵魂伴侣组合，深层吸引与理解。`;
  } else if (finalScore >= 70) {
    tag = "deep_trust"; label = "Deep Trust";
    summary = `强烈信任基础，星宿${starMansion.relation}。可建立深厚持久的连接。`;
  } else if (finalScore >= 55) {
    tag = "good_vibes"; label = "Good Vibes";
    summary = `整体能量和谐，星宿${starMansion.relation}。相处轻松愉快，带来正面影响。`;
  } else if (finalScore >= 40) {
    tag = "best_friends"; label = "Best Friends";
    summary = `适合成为彼此好友，星宿${starMansion.relation}。友谊稳固，互相支持。`;
  } else if (finalScore >= 25) {
    tag = "tension"; label = "Tension";
    summary = `吸引力与挑战并存，星宿${starMansion.relation}。需要更多理解与磨合。`;
  } else {
    tag = "rivals"; label = "Rivals";
    summary = `能量场存在冲突，星宿${starMansion.relation}。挑战促成成长。`;
  }

  return {
    person1: { name: p1.name, zodiac: p1.zodiacSign, element: p1.element, dayPillar: p1.baziDayPillar, mansion: p1.starMansion },
    person2: { name: p2.name, zodiac: p2.zodiacSign, element: p2.element, dayPillar: p2.baziDayPillar, mansion: p2.starMansion },
    bazi,
    synastry,
    starMansion,
    vedic,
    overall: { score: finalScore, tag, label, summary },
  };
}

// Export for raw data storage (full chart data to store in DB, not sent to AI)
export function generateRawChartData(p: PersonData) {
  const d = new Date(p.birthDate);
  return {
    birthDate: p.birthDate,
    birthTime: p.birthTime || null,
    birthPlace: p.birthPlace || null,
    zodiacSign: p.zodiacSign,
    element: ZODIAC_ELEMENTS[p.zodiacSign] || "未知",
    baziDayPillar: p.baziDayPillar,
    dayElement: getDayPillarElement(p.baziDayPillar),
    starMansion: p.starMansion,
    // Additional computed fields (stored locally, not sent to AI)
    lunarMonth: ((d.getMonth() + 1) % 13) || 1,
    solarTerm: Math.floor((d.getDate() + 14) / 15),
    planetPositions: generateSimplifiedPlanets(d),
  };
}

function generateSimplifiedPlanets(date: Date) {
  const zodiacs = ZODIAC_SIGNS;
  const seed = date.getTime();
  return {
    sun: { sign: zodiacs[Math.floor(seed / 86400000) % 12], degree: Math.floor((seed % 30) + 1) },
    moon: { sign: zodiacs[(Math.floor(seed / 86400000) + 3) % 12], degree: Math.floor(((seed * 7) % 30) + 1) },
    mercury: { sign: zodiacs[(Math.floor(seed / 86400000) + 1) % 12], degree: Math.floor(((seed * 13) % 30) + 1) },
    venus: { sign: zodiacs[(Math.floor(seed / 86400000) + 2) % 12], degree: Math.floor(((seed * 17) % 30) + 1) },
    mars: { sign: zodiacs[(Math.floor(seed / 86400000) + 5) % 12], degree: Math.floor(((seed * 19) % 30) + 1) },
    jupiter: { sign: zodiacs[(Math.floor(seed / 86400000) + 7) % 12], degree: Math.floor(((seed * 23) % 30) + 1) },
    saturn: { sign: zodiacs[(Math.floor(seed / 86400000) + 11) % 12], degree: Math.floor(((seed * 29) % 30) + 1) },
  };
}
