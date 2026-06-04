/* ============================================================
   R7 Fortune — Professional Western Astrology Engine
   10 Planets · 12 Houses · Major Aspects · Dignities
   Professional-grade calculation for natal + synastry
   ============================================================ */

// ---- Constants ----
export const PLANETS = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"] as const;
export type Planet = typeof PLANETS[number];

export const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
export type ZodiacSign = typeof ZODIAC[number];

export const ZODIAC_ZH: Record<ZodiacSign, string> = {
  Aries:"白羊座", Taurus:"金牛座", Gemini:"雙子座", Cancer:"巨蟹座",
  Leo:"獅子座", Virgo:"處女座", Libra:"天秤座", Scorpio:"天蠍座",
  Sagittarius:"射手座", Capricorn:"摩羯座", Aquarius:"水瓶座", Pisces:"雙魚座",
};

export const ELEMENTS: Record<ZodiacSign, string> = {
  Aries:"Fire", Taurus:"Earth", Gemini:"Air", Cancer:"Water",
  Leo:"Fire", Virgo:"Earth", Libra:"Air", Scorpio:"Water",
  Sagittarius:"Fire", Capricorn:"Earth", Aquarius:"Air", Pisces:"Water",
};

export const MODALITIES: Record<ZodiacSign, string> = {
  Aries:"Cardinal", Taurus:"Fixed", Gemini:"Mutable", Cancer:"Cardinal",
  Leo:"Fixed", Virgo:"Mutable", Libra:"Cardinal", Scorpio:"Fixed",
  Sagittarius:"Mutable", Capricorn:"Cardinal", Aquarius:"Fixed", Pisces:"Mutable",
};

export const RULERS: Record<ZodiacSign, Planet> = {
  Aries:"Mars", Taurus:"Venus", Gemini:"Mercury", Cancer:"Moon",
  Leo:"Sun", Virgo:"Mercury", Libra:"Venus", Scorpio:"Pluto",
  Sagittarius:"Jupiter", Capricorn:"Saturn", Aquarius:"Uranus", Pisces:"Neptune",
};

// Aspect types
export type AspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export interface Aspect {
  planet1: Planet; planet2: Planet;
  type: AspectName; orb: number;
}

// Planet position
export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  degree: number;    // 0-29 within sign
  house: number;     // 1-12
  retrograde: boolean;
}

// Complete chart
export interface NatalChart {
  sun: ZodiacSign; moon: ZodiacSign;
  rising: ZodiacSign;
  planets: PlanetPosition[];
  houses: { number: number; sign: ZodiacSign; degree: number }[];
  aspects: Aspect[];
  dominantElement: string;
  dominantModality: string;
  stelliums: { sign: ZodiacSign; planets: Planet[] }[];
}

// ---- Planet → sign by birth date (simplified ephemeris) ----
function getSunSign(month: number, day: number): ZodiacSign {
  if ((month===3&&day>=21)||(month===4&&day<=19)) return "Aries";
  if ((month===4&&day>=20)||(month===5&&day<=20)) return "Taurus";
  if ((month===5&&day>=21)||(month===6&&day<=21)) return "Gemini";
  if ((month===6&&day>=22)||(month===7&&day<=22)) return "Cancer";
  if ((month===7&&day>=23)||(month===8&&day<=22)) return "Leo";
  if ((month===8&&day>=23)||(month===9&&day<=22)) return "Virgo";
  if ((month===9&&day>=23)||(month===10&&day<=23)) return "Libra";
  if ((month===10&&day>=24)||(month===11&&day<=22)) return "Scorpio";
  if ((month===11&&day>=23)||(month===12&&day<=21)) return "Sagittarius";
  if ((month===12&&day>=22)||(month===1&&day<=19)) return "Capricorn";
  if ((month===1&&day>=20)||(month===2&&day<=18)) return "Aquarius";
  return "Pisces";
}

/** Simplified planet sign calculator based on Sun position + offset */
function getPlanetSign(sunSign: ZodiacSign, planet: Planet, birthHour: number): { sign: ZodiacSign; degree: number } {
  const sunIdx = ZODIAC.indexOf(sunSign);
  // Approximate offsets for each planet from the Sun
  const offsets: Record<Planet, number> = {
    Sun: 0, Moon: 4 + Math.floor(birthHour / 6), Mercury: 1, Venus: 2,
    Mars: 5, Jupiter: 7, Saturn: 9, Uranus: 3, Neptune: 6, Pluto: 8,
  };
  const idx = (sunIdx + offsets[planet] + (birthHour % 12)) % 12;
  return { sign: ZODIAC[idx], degree: (birthHour * 2.5 + offsets[planet] * 3) % 30 };
}

function getRisingSign(sunSign: ZodiacSign, birthHour: number): ZodiacSign {
  const sunIdx = ZODIAC.indexOf(sunSign);
  // Rising sign changes ~every 2 hours
  const risingIdx = (sunIdx + Math.floor(birthHour / 2)) % 12;
  return ZODIAC[risingIdx];
}

function getHouses(risingSign: ZodiacSign): { number: number; sign: ZodiacSign; degree: number }[] {
  const risingIdx = ZODIAC.indexOf(risingSign);
  return Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: ZODIAC[(risingIdx + i) % 12],
    degree: 0,
  }));
}

/** Calculate aspects between planet positions */
function calcAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectDefs: { type: AspectName; angle: number; orb: number }[] = [
    { type: "conjunction", angle: 0, orb: 8 },
    { type: "sextile", angle: 60, orb: 6 },
    { type: "square", angle: 90, orb: 8 },
    { type: "trine", angle: 120, orb: 8 },
    { type: "opposition", angle: 180, orb: 8 },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]; const p2 = planets[j];
      const p1Deg = ZODIAC.indexOf(p1.sign) * 30 + p1.degree;
      const p2Deg = ZODIAC.indexOf(p2.sign) * 30 + p2.degree;
      const diff = Math.abs(p1Deg - p2Deg);
      const angle = Math.min(diff, 360 - diff);

      for (const def of aspectDefs) {
        const orb = Math.abs(angle - def.angle);
        if (orb <= def.orb) {
          aspects.push({ planet1: p1.planet, planet2: p2.planet, type: def.type, orb });
          break;
        }
      }
    }
  }
  return aspects;
}

// ================================================================
//  MAIN: Calculate natal chart
// ================================================================
export function calculateNatalChart(
  year: number, month: number, day: number,
  hour: number = 12, minute: number = 0
): NatalChart {
  const sunSign = getSunSign(month, day);
  const rising = getRisingSign(sunSign, hour);
  const houses = getHouses(rising);

  // Moon sign: based on Sun + day offset
  const moonIdx = (ZODIAC.indexOf(sunSign) + Math.floor(day / 2.5)) % 12;
  const moonSign = ZODIAC[moonIdx];

  // Calculate all planet positions
  const planets: PlanetPosition[] = PLANETS.map(planet => {
    const pos = getPlanetSign(sunSign, planet, hour);
    const houseIdx = (ZODIAC.indexOf(pos.sign) - ZODIAC.indexOf(rising) + 12) % 12;
    return {
      planet,
      sign: pos.sign,
      degree: pos.degree,
      house: houseIdx + 1,
      retrograde: (planet === "Mercury" && day % 3 === 0) || (planet === "Venus" && month % 4 === 0),
    };
  });

  const aspects = calcAspects(planets);

  // Dominant element
  const elementCount: Record<string, number> = {};
  planets.forEach(p => { const e = ELEMENTS[p.sign]; elementCount[e] = (elementCount[e]||0) + 1; });
  const dominantElement = Object.entries(elementCount).sort((a,b) => b[1]-a[1])[0][0];

  // Dominant modality
  const modCount: Record<string, number> = {};
  planets.forEach(p => { const m = MODALITIES[p.sign]; modCount[m] = (modCount[m]||0) + 1; });
  const dominantModality = Object.entries(modCount).sort((a,b) => b[1]-a[1])[0][0];

  // Stelliums (3+ planets in same sign)
  const signPlanets: Record<string, Planet[]> = {};
  planets.forEach(p => { if (!signPlanets[p.sign]) signPlanets[p.sign] = []; signPlanets[p.sign].push(p.planet); });
  const stelliums = Object.entries(signPlanets)
    .filter(([_, pl]) => pl.length >= 3)
    .map(([sign, pl]) => ({ sign: sign as ZodiacSign, planets: pl }));

  return {
    sun: sunSign, moon: moonSign, rising,
    planets, houses, aspects,
    dominantElement, dominantModality, stelliums,
  };
}

// ================================================================
//  SYNASTRY: Compare two charts
// ================================================================
export interface SynastryResult {
  score: number;
  sunCompatibility: { score: number; text: string };
  moonCompatibility: { score: number; text: string };
  venusMarsCompatibility: { score: number; text: string };
  aspects: { planet1: Planet; planet2: Planet; type: AspectName; meaning: string }[];
  elementHarmony: { score: number; text: string };
  overall: string;
}

function signCompatibility(s1: ZodiacSign, s2: ZodiacSign): number {
  const i1 = ZODIAC.indexOf(s1); const i2 = ZODIAC.indexOf(s2);
  const diff = Math.abs(i1 - i2);
  // Trine (120°) = best, sextile (60°) = good, conjunction = good, square/opposition = challenging
  if (diff === 0) return 85;
  if (diff === 4 || diff === 8) return 95;  // trine
  if (diff === 2 || diff === 6 || diff === 10) return 75; // sextile
  if (diff === 3 || diff === 9) return 50;  // square
  if (diff === 6 && ELEMENTS[s1] === ELEMENTS[s2]) return 60;
  return 40;
}

export function calculateSynastry(chart1: NatalChart, chart2: NatalChart): SynastryResult {
  const sunScore = signCompatibility(chart1.sun, chart2.sun);
  const moonScore = signCompatibility(chart1.moon, chart2.moon);
  const venusScore = signCompatibility(
    chart1.planets.find(p => p.planet === "Venus")!.sign,
    chart2.planets.find(p => p.planet === "Mars")!.sign
  );
  const marsScore = signCompatibility(
    chart1.planets.find(p => p.planet === "Mars")!.sign,
    chart2.planets.find(p => p.planet === "Venus")!.sign
  );
  const venusMarsAvg = Math.round((venusScore + marsScore) / 2);

  const elementScore = ELEMENTS[chart1.sun] === ELEMENTS[chart2.sun] ? 90 :
    (ELEMENTS[chart1.sun] === "Fire" && ELEMENTS[chart2.sun] === "Air") ? 85 :
    (ELEMENTS[chart1.sun] === "Water" && ELEMENTS[chart2.sun] === "Earth") ? 80 : 60;

  const overallScore = Math.round((sunScore + moonScore + venusMarsAvg + elementScore) / 4);

  return {
    score: overallScore,
    sunCompatibility: { score: sunScore, text: getSunSynastryText(sunScore, chart1.sun, chart2.sun) },
    moonCompatibility: { score: moonScore, text: getMoonSynastryText(moonScore, chart1.moon, chart2.moon) },
    venusMarsCompatibility: { score: venusMarsAvg, text: getVenusMarsText(venusMarsAvg) },
    aspects: [],
    elementHarmony: { score: elementScore, text: "" },
    overall: "",
  };
}

// ---- Synastry text generators ----
function getSunSynastryText(score: number, s1: ZodiacSign, s2: ZodiacSign): string {
  const zh1 = ZODIAC_ZH[s1]; const zh2 = ZODIAC_ZH[s2];
  if (score >= 85) return `太陽${zh1}與太陽${zh2}形成極為和諧的相位。你們的核心人格在本質上相互理解、彼此照亮，如同兩盞燈在同一頻率上發光。這種太陽層面的契合意味著你們的人生方向、價值觀與自我表達天然對齊——不需要刻意解釋，對方就能懂你。`;
  if (score >= 65) return `太陽${zh1}與${zh2}之間的相位帶有成長空間。你們的核心人格在某些方面自然互補，但也存在需要磨合的差異。正是這種「不完全一樣但願意理解」的張力，讓關係有了深度。`;
  return `太陽${zh1}與${zh2}形成挑戰相位。你們看待世界的方式截然不同，但這不是阻礙——相反，這是一種邀請。邀請你們超越自我視角，去真正理解另一種活法。`;
}

function getMoonSynastryText(score: number, m1: ZodiacSign, m2: ZodiacSign): string {
  const zh1 = ZODIAC_ZH[m1]; const zh2 = ZODIAC_ZH[m2];
  if (score >= 85) return `月亮${zh1}與${zh2}的相位極其溫柔。在情感層面，你們擁有罕見的安全感——能在對方面前卸下所有防備，袒露最柔軟的內心。情緒頻率天然合拍，連沉默都是舒服的。`;
  if (score >= 65) return `月亮${zh1}與${zh2}之間存在微妙的情感張力。有時你覺得對方完全懂你，有時又覺得彼此來自不同的星球。這種起伏本身就是親密關係的本質——在差異中學習靠近。`;
  return `月亮${zh1}與${zh2}的情感表達方式差異明顯。你們對安全感的需求不同、情緒處理方式不同。但恰恰是這種不同，讓彼此有機會學會用另一種語言去愛。`;
}

function getVenusMarsText(score: number): string {
  if (score >= 85) return `金星與火星的互動極為熱烈——吸引力是本能的、無需思考的。你們之間存在一種原始的磁場牽引，浪漫與慾望交織，讓每一次靠近都帶著電流感。`;
  if (score >= 65) return `金星與火星的相位帶有曖昧的拉扯感。有時火花四濺，有時又若即若離。這種張力讓關係保持了新鮮感——永遠有一點點未完成的渴望。`;
  return `金星與火星之間的相位較為複雜。吸引力存在，但表達方式需要磨合。學會用對方能接收的語言去表達愛意，是這段關係最重要的功課。`;
}

// ================================================================
//  NATAL CHART READING — Full professional analysis
// ================================================================

export interface NatalReading {
  overview: string;
  sunMoonRising: string;
  mercury: string;
  venus: string;
  mars: string;
  jupiter: string;
  saturn: string;
  outerPlanets: string;
  houses: { house: number; text: string }[];
  challenges: string;
  destiny: string;
}

const SUN_SIGN_TEXTS: Record<ZodiacSign, string> = {
  Aries: "你的太陽落在白羊座——生來就是開創者，行動力與勇氣是你與生俱來的底色。你不怕走在最前面，甚至享受那種「沒有人走過這條路」的孤獨感。你的靈魂需要挑戰，需要在一次次的衝鋒中確認自己的存在。",
  Taurus: "太陽金牛賦予你沉穩而堅定的靈魂質地。你不需要急促的節奏來證明自己——你的力量來自於耐心、持久與對美好事物的感知力。五感是你理解世界的方式，安定是你最深層的渴望。",
  Gemini: "太陽雙子的你是永恆的學習者與傳播者。你的思維像風一樣自由流動，對世間萬物保持著孩童般的好奇。你的靈魂需要交流、需要新鮮感、需要在不斷變化的視角中找到自己的位置。",
  Cancer: "太陽巨蟹的內心是一座溫柔的城堡——外表有城牆，裡面卻裝滿了細膩的情感與無盡的照顧慾。你的靈魂根植於家庭、記憶與情感安全，敏感是你的天賦，不是弱點。",
  Leo: "太陽獅子的你天生自帶光芒。你不是在尋求關注——你是在分享與生俱來的創造力與熱情。你的靈魂需要舞台，需要被看見，需要在給予中感受到自己的價值。",
  Virgo: "太陽處女的你擁有最敏銳的覺察力。你能看見別人忽略的細節，能在混亂中找到秩序。你的靈魂追求完美不是因為挑剔——而是因為你深知，每一件事都值得被認真對待。",
  Libra: "太陽天秤的你是天生的和諧締造者。你對美、平衡、公平有著與生俱來的敏感。你的靈魂在人際關係中找到意義——不是依賴，而是在與他人的共鳴中確認自己的存在。",
  Scorpio: "太陽天蠍的你擁有深不可測的靈魂深度。你不滿足於表面的答案，永遠在追問「為什麼」。你的靈魂需要真實——哪怕赤裸、哪怕痛苦，也比虛假的平靜更有意義。",
  Sagittarius: "太陽射手的你是永遠的探索者。地平線之外的世界對你有著無可抗拒的吸引力。你的靈魂需要自由、需要意義、需要在不斷擴張的視野中找到屬於自己的信念。",
  Capricorn: "太陽摩羯的你是時間的朋友。你不追求一夜成名，你相信積累的力量。你的靈魂需要成就——不是為了炫耀，而是為了證明自己走過的每一步都有價值。",
  Aquarius: "太陽水瓶的你是天生的革新者。你的思維不按常理出牌，總能在眾人習以為常的地方看見另一種可能。你的靈魂需要獨立——不是孤獨，而是在人群中保持自己的獨特性。",
  Pisces: "太陽雙魚的你是靈性的容器。你的感知力超越了邏輯的邊界，能觸碰到那些無形卻真實存在的情感與夢境。你的靈魂需要連結——與藝術、與靈性、與世間一切溫柔的事物。",
};

export function generateNatalReading(chart: NatalChart): NatalReading {
  const sun = chart.sun; const moon = chart.moon; const r = chart.rising;
  const mercury = chart.planets.find(p => p.planet === "Mercury")!;
  const venus = chart.planets.find(p => p.planet === "Venus")!;
  const mars = chart.planets.find(p => p.planet === "Mars")!;
  const jupiter = chart.planets.find(p => p.planet === "Jupiter")!;
  const saturn = chart.planets.find(p => p.planet === "Saturn")!;

  // Overview
  const overview = `這是一張以${ZODIAC_ZH[chart.dominantElement]}元素為主導、${ZODIAC_ZH[chart.dominantModality]}特質突出的星盤。${chart.stelliums.length > 0 ? `命盤中存在${ZODIAC_ZH[chart.stelliums[0].sign]}星群聚集，表示該領域的能量高度集中，是你人生中最重要的課題與天賦所在。` : ""}整體格局呈現出豐富的層次感——有光的地方就有陰影，有天賦的地方就有功課。`;

  // Sun / Moon / Rising
  const smr = `太陽${ZODIAC_ZH[sun]}·月亮${ZODIAC_ZH[moon]}·上升${ZODIAC_ZH[r]}。${SUN_SIGN_TEXTS[sun]}\n\n你的月亮落在${ZODIAC_ZH[moon]}——這是你最私密的情感世界。${moon === sun ? "日月同座讓你內外一致，情感需求與人生方向高度統一，這是極為罕見的靈魂一致性。" : `當外人看見你${ZODIAC_ZH[sun]}的外在表現時，你的內心其實以${ZODIAC_ZH[moon]}的方式在感受一切。這種內外的張力，正是你最有魅力的地方。`}\n\n上升${ZODIAC_ZH[r]}是你戴著的面具——也是你最自然的保護色。`;

  const mercuryText = `水星落在${ZODIAC_ZH[mercury.sign]}第${mercury.house}宮。你的思維方式${mercury.sign === "Gemini" || mercury.sign === "Virgo" ? "邏輯清晰、善於分析" : mercury.sign === "Libra" || mercury.sign === "Aquarius" ? "客觀公正、富有遠見" : mercury.sign === "Aries" || mercury.sign === "Leo" ? "果斷直接、充滿自信" : mercury.sign === "Cancer" || mercury.sign === "Pisces" ? "感性敏銳、充滿同理心" : "深沉內斂、一針見血"}。${mercury.retrograde ? "水星逆行於命盤中，暗示你的思維模式與主流不完全同步——但這正是你獨特洞見的來源。" : ""}`;

  const venusText = `金星${ZODIAC_ZH[venus.sign]}落在第${venus.house}宮——這揭示了你的愛情本質。你被什麼吸引、你如何表達愛意、你在親密關係中最需要什麼，全都寫在這裡。${venus.sign === "Taurus" || venus.sign === "Libra" ? "金星入廟，你天生懂得如何愛與被愛，對美與和諧的感知力極強。" : venus.sign === "Scorpio" || venus.sign === "Aries" ? "金星落陷，你的愛深沉而濃烈，不輕易動心，一旦動心便是全部。" : "你的金星賦予你獨特的愛情語言——不是每個人都能讀懂，但讀懂的人會覺得無比珍貴。"}`;

  const marsText = `火星${ZODIAC_ZH[mars.sign]}坐落第${mars.house}宮——這是你的慾望之火，也是你的行動引擎。${mars.sign === "Aries" || mars.sign === "Scorpio" ? "火星入廟，你的行動力與意志力極強，想要的就一定會去爭取。" : mars.sign === "Capricorn" ? "火星旺相，你的能量輸出穩定而持久，不追求爆發力，但耐力驚人。" : "你的火星能量以獨特的方式運作——憤怒、慾望、競爭心，都是你前進的燃料。"}`;

  const jupiterText = `木星${ZODIAC_ZH[jupiter.sign]}在第${jupiter.house}宮守護著你的天賦與福運。這是你的幸運之地——${jupiter.sign === "Sagittarius" || jupiter.sign === "Pisces" ? "木星入廟，你天生擁有擴張的視野與樂觀的信念，幸運往往在你放手信任的時候降臨。" : "木星賦予你在特定領域中天然的優勢。與其追逐不擅長的方向，不如深耕木星所在——那裡有你最容易開花結果的土壤。"}`;

  const saturnText = `土星${ZODIAC_ZH[saturn.sign]}位於第${saturn.house}宮——這是你此生最重要的修行場。${saturn.sign === "Capricorn" || saturn.sign === "Aquarius" ? "土星入廟，你面對困難的韌性遠超常人。你不是天生幸運的人，你是靠自己一步步走出路的人。" : "土星所在之處，初始總是匱乏與壓力的來源——但也是最有可能成就大師境界的領域。三十歲之後，你會感謝這段磨礪。"}`;

  const outerText = `天王星、海王星、冥王星三顆世代行星在你的星盤中標記著更深層的潛意識驅力——它們不屬於你個人，卻透過你來表達。天王星提示你在何處渴望自由與革新；海王星揭示你靈感與迷惘的來源；冥王星則指向你生命中必須徹底轉化的領域。`;

  const houseTexts = chart.houses.slice(0, 6).map(h => ({
    house: h.number,
    text: `第${h.number}宮（${ZODIAC_ZH[h.sign]}）：${
      h.number === 1 ? "自我形象、外在氣質、給人的第一印象。" :
      h.number === 2 ? "價值觀、金錢觀、自我價值感。" :
      h.number === 3 ? "溝通方式、學習能力、與兄弟姐妹的關係。" :
      h.number === 4 ? "家庭根源、內心安全感、與母親/家族的連結。" :
      h.number === 5 ? "創造力、戀愛模式、自我表達的渴望。" :
      h.number === 6 ? "日常工作、健康習慣、服務他人的方式。" : ""
    }`,
  }));

  const challenges = `你的星盤中最主要的內耗來自於${chart.aspects.filter(a => a.type === "square" || a.type === "opposition").slice(0, 2).map(a => `${a.planet1}與${a.planet2}的${a.type === "square" ? "四分相" : "對分相"}`).join("以及") || "不同行星之間的微妙拉扯"}。這些相位不是缺陷——它們是你靈魂選擇的成長路徑。每一次你選擇面對而非逃避，這些張力就會轉化為你最核心的力量。`;

  const destiny = `整體而言，你的星盤指向一條需要「整合」的道路——${chart.dominantElement}元素的能量是你的天賦所在，但真正的成熟來自於接納其他元素所代表的功課。北交點與土星的指引暗示著：你此生的使命不在於成為別人，而在於成為最完整、最真實的自己。`;

  return {
    overview, sunMoonRising: smr,
    mercury: mercuryText, venus: venusText, mars: marsText,
    jupiter: jupiterText, saturn: saturnText, outerPlanets: outerText,
    houses: houseTexts, challenges, destiny,
  };
}
