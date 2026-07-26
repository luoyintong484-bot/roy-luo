import { astro } from "iztro";

export type ZiweiBirthInput = {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  longitude?: number;
  calendarType?: "solar" | "lunar";
};

export type ZiweiPalace = {
  name: string;
  branch: string;
  stem: string;
  stars: string[];
  assistants: string[];
  misc: string[];
  four: string[];
  brightness: Record<string, "庙" | "旺" | "利" | "陷">;
  changsheng: string;
  focus: string;
};

export type ZiweiDecade = {
  index: number;
  ageStart: number;
  ageEnd: number;
  palaceBranch: string;
  palaceName: string;
  stem: string;
  decadeName: string;
  fourTransformations: string[];
  isCurrent: boolean;
};

export type ZiweiCalculationFeature = {
  calculationAvailable: boolean;
  calculationSource: "rule-engine" | "derived" | "unavailable";
  confidenceLevel: "high" | "medium" | "low";
  note: string;
};

export type ZiweiCalculationMeta = {
  engineVersion: string;
  generatedAt: string;
  features: {
    timeCalibration: ZiweiCalculationFeature;
    natalFourTransformations: ZiweiCalculationFeature;
    decadeCycles: ZiweiCalculationFeature;
    palaceStemFlyingTransformations: ZiweiCalculationFeature;
    annualTransformations: ZiweiCalculationFeature;
    monthlyTransformations: ZiweiCalculationFeature;
  };
};

export type ZiweiChart = {
  name: string;
  birthLabel: string;
  mingPalace: string;
  shenPalace: string;
  elementBureau: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  lunarDate: string;
  chineseDate: string;
  soulStar: string;
  bodyStar: string;
  mainStar: string;
  trueSolarTime: string;
  timeTrace: string[];
  patterns: string[];
  palaces: ZiweiPalace[];
  summary: string;
  gender: string;
  decades: ZiweiDecade[];
  calculationMeta: ZiweiCalculationMeta;
};

export type ZiweiSynastry = {
  score: number;
  label: string;
  chemistry: string;
  risk: string;
  advice: string;
};

export const PALACE_NAMES = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const MAIN_STARS = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"] as const;
export const ASSISTANT_STARS = ["左辅", "右弼", "文昌", "文曲", "禄存", "天魁", "天钺", "擎羊", "陀罗", "火星", "铃星"] as const;
export const FOUR_TRANSFORMATIONS = ["化禄", "化权", "化科", "化忌"] as const;
export const MISC_STARS = ["天马", "红鸾", "天喜", "天姚", "天刑", "天虚", "天哭", "三台", "八座", "恩光", "天贵", "台辅", "封诰"] as const;
export const CHANGSHENG = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"] as const;

export const PALACE_FOCUS: Record<string, string> = {
  命宫: "自我气质、人生主轴、先天底色",
  兄弟: "同辈关系、协作资源、手足缘分",
  夫妻: "亲密关系、伴侣类型、长期相处模式",
  子女: "创作表达、子女缘、恋爱愉悦感",
  财帛: "收入方式、金钱安全感、资源累积",
  疾厄: "身体节律、压力出口、情绪健康",
  迁移: "外部机会、远行发展、环境适应力",
  交友: "社群人脉、粉丝朋友、团队支持",
  官禄: "事业定位、社会评价、职业路径",
  田宅: "家庭根基、不动产、内在安全感",
  福德: "精神能量、享受方式、潜意识状态",
  父母: "原生支持、长辈资源、规则与保护",
};

export const STEM_ELEMENT: Record<string, string> = {
  甲: "木三局", 乙: "木三局",
  丙: "火六局", 丁: "火六局",
  戊: "土五局", 己: "土五局",
  庚: "金四局", 辛: "金四局",
  壬: "水二局", 癸: "水二局",
};

export const FOUR_BY_STEM: Record<string, string[]> = {
  甲: ["廉贞", "破军", "武曲", "太阳"],
  乙: ["天机", "天梁", "紫微", "太阴"],
  丙: ["天同", "天机", "文昌", "廉贞"],
  丁: ["太阴", "天同", "天机", "巨门"],
  戊: ["贪狼", "太阴", "右弼", "天机"],
  己: ["武曲", "贪狼", "天梁", "文曲"],
  庚: ["太阳", "武曲", "太阴", "天同"],
  辛: ["巨门", "太阳", "文曲", "文昌"],
  壬: ["天梁", "紫微", "左辅", "武曲"],
  癸: ["破军", "巨门", "太阴", "贪狼"],
};

export const BRIGHTNESS_SEED: Record<string, ("庙" | "旺" | "利" | "陷")[]> = {
  紫微: ["旺", "利", "庙", "旺", "庙", "利", "旺", "利", "庙", "旺", "庙", "利"],
  天机: ["旺", "陷", "利", "庙", "旺", "陷", "利", "庙", "旺", "陷", "利", "庙"],
  太阳: ["陷", "陷", "旺", "庙", "旺", "利", "旺", "利", "陷", "陷", "陷", "利"],
  武曲: ["旺", "庙", "利", "陷", "旺", "庙", "利", "陷", "旺", "庙", "利", "陷"],
  天同: ["庙", "陷", "旺", "利", "庙", "陷", "旺", "利", "庙", "陷", "旺", "利"],
  廉贞: ["利", "庙", "陷", "旺", "利", "庙", "陷", "旺", "利", "庙", "陷", "旺"],
  天府: ["庙", "旺", "利", "庙", "旺", "利", "庙", "旺", "利", "庙", "旺", "利"],
  太阴: ["庙", "旺", "利", "陷", "陷", "利", "庙", "旺", "利", "陷", "陷", "利"],
  贪狼: ["旺", "利", "庙", "陷", "旺", "利", "庙", "陷", "旺", "利", "庙", "陷"],
  巨门: ["陷", "旺", "利", "庙", "陷", "旺", "利", "庙", "陷", "旺", "利", "庙"],
  天相: ["利", "庙", "旺", "利", "庙", "旺", "利", "庙", "旺", "利", "庙", "旺"],
  天梁: ["庙", "旺", "利", "庙", "旺", "利", "庙", "旺", "利", "庙", "旺", "利"],
  七杀: ["旺", "庙", "陷", "利", "旺", "庙", "陷", "利", "旺", "庙", "陷", "利"],
  破军: ["陷", "利", "旺", "庙", "陷", "利", "旺", "庙", "陷", "利", "旺", "庙"],
};

export const ZIWEI_RULE_TABLES = {
  palaceNames: PALACE_NAMES,
  branches: BRANCHES,
  stems: STEMS,
  mainStars: MAIN_STARS,
  assistantStars: ASSISTANT_STARS,
  miscStars: MISC_STARS,
  fourTransformations: FOUR_TRANSFORMATIONS,
  fourByStem: FOUR_BY_STEM,
  brightnessSeed: BRIGHTNESS_SEED,
  changsheng: CHANGSHENG,
  palaceFocus: PALACE_FOCUS,
} as const;

export function validateZiweiRuleTables(): string[] {
  const issues: string[] = [];
  const unique = <T extends string>(label: string, items: readonly T[], expected: number) => {
    if (items.length !== expected) issues.push(`${label} 数量应为 ${expected}，当前 ${items.length}`);
    if (new Set(items).size !== items.length) issues.push(`${label} 存在重复项`);
  };

  unique("十二宫", PALACE_NAMES, 12);
  unique("十二地支", BRANCHES, 12);
  unique("十天干", STEMS, 10);
  unique("十四主星", MAIN_STARS, 14);
  unique("十二长生", CHANGSHENG, 12);

  STEMS.forEach((stem) => {
    const transformations = FOUR_BY_STEM[stem];
    if (!transformations) {
      issues.push(`缺少 ${stem} 干四化规则`);
      return;
    }
    if (transformations.length !== 4) issues.push(`${stem} 干四化数量应为 4，当前 ${transformations.length}`);
    transformations.forEach((star) => {
      if (![...MAIN_STARS, ...ASSISTANT_STARS].includes(star as never)) {
        issues.push(`${stem} 干四化引用未登记星曜：${star}`);
      }
    });
  });

  MAIN_STARS.forEach((star) => {
    const brightness = BRIGHTNESS_SEED[star];
    if (!brightness) {
      issues.push(`缺少 ${star} 庙旺利陷表`);
      return;
    }
    if (brightness.length !== 12) issues.push(`${star} 庙旺利陷表应覆盖 12 地支，当前 ${brightness.length}`);
  });

  return issues;
}

function safeDate(input?: string): Date {
  const date = input ? new Date(input) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function parseTime(input?: string): { hour: number; minute: number } {
  const [rawHour, rawMinute] = String(input || "12:00").split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  return {
    hour: Number.isFinite(hour) ? Math.max(0, Math.min(23, hour)) : 12,
    minute: Number.isFinite(minute) ? Math.max(0, Math.min(59, minute)) : 0,
  };
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function applyTrueSolarTime(hour: number, minute: number, longitude?: number) {
  if (typeof longitude !== "number" || Number.isNaN(longitude)) {
    return { hour, minute, delta: 0, note: "未提供经纬度，暂按出生地标准时间排盘" };
  }
  const delta = Math.round((longitude - 120) * 4);
  const total = ((hour * 60 + minute + delta) % 1440 + 1440) % 1440;
  return {
    hour: Math.floor(total / 60),
    minute: total % 60,
    delta,
    note: `真太阳时按经度 ${longitude.toFixed(2)}° 校正，较北京时间 ${delta >= 0 ? "+" : ""}${delta} 分钟`,
  };
}

function pillarFromYear(year: number): string {
  const stem = STEMS[((year - 4) % 10 + 10) % 10];
  const branch = BRANCHES[((year - 4) % 12 + 12) % 12];
  return `${stem}${branch}`;
}

function pillarFromDay(date: Date): string {
  const base = new Date(1900, 0, 31);
  const diff = Math.floor((date.getTime() - base.getTime()) / 86400000);
  return `${STEMS[((diff + 10) % 10 + 10) % 10]}${BRANCHES[((diff + 12) % 12 + 12) % 12]}`;
}

function placeStar(palaces: ZiweiPalace[], index: number, star: string, field: "stars" | "assistants" | "misc" | "four") {
  palaces[((index % 12) + 12) % 12][field].push(star);
}

// ============================================================
// 大运（大限）计算
// ============================================================

/** 五行局对应起运年龄 */
const BUREAU_START_AGE: Record<string, number> = {
  "水二局": 2,
  "木三局": 3,
  "金四局": 4,
  "土五局": 5,
  "火六局": 6,
};

/** 阳干 */
const YANG_STEMS = ["甲", "丙", "戊", "庚", "壬"];

/**
 * 计算十二大限
 *
 * 规则：
 * 1. 起运年龄由五行局决定（水2/木3/金4/土5/火6）
 * 2. 顺逆行由「年干阴阳 × 性别」决定：
 *    - 阳干男命 / 阴干女命 → 顺行（从命宫向寅→卯→辰…）
 *    - 阴干男命 / 阳干女命 → 逆行（从命宫向丑→子→亥…）
 * 3. 每限十年，从命宫起，依次经过十二宫
 * 4. 大限天干 = 该宫位的宫干
 * 5. 大限四化 = 以大限天干查四化表
 *
 * @param palaces - 十二宫数组（palaces[0] 为命宫）
 * @param mingIndex - 命宫在地支环上的索引
 * @param elementBureau - 五行局（如 "火六局"）
 * @param yearStem - 年柱天干（如 "丙"）
 * @param gender - "male" | "female" | 其他
 * @param birthYear - 出生年份，用于判断当前大限
 */
function buildZiweiDecades(
  palaces: ZiweiPalace[],
  mingIndex: number,
  elementBureau: string,
  yearStem: string,
  gender: string,
  birthYear: number,
): ZiweiDecade[] {
  const startAge = BUREAU_START_AGE[elementBureau] ?? 5;
  const isYangStem = YANG_STEMS.includes(yearStem);
  const isMale = gender === "male";
  // 阳男 / 阴女 → 顺行；阴男 / 阳女 → 逆行
  const clockwise = isYangStem === isMale;

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  const decades: ZiweiDecade[] = [];
  for (let i = 0; i < 12; i++) {
    // 顺行：命宫→下一宫（地支序+1）；逆行：命宫→上一宫（地支序-1）
    const palaceIdx = clockwise
      ? (mingIndex + i) % 12
      : ((mingIndex - i) % 12 + 12) % 12;

    const palace = palaces[palaceIdx];
    const ageStart = startAge + i * 10;
    const ageEnd = ageStart + 9;

    // 大限天干 = 宫干
    const stem = palace.stem;

    // 大限四化
    const fourStars = FOUR_BY_STEM[stem] || FOUR_BY_STEM.甲;
    const fourTransformations = FOUR_TRANSFORMATIONS.map((four, j) =>
      `${fourStars[j]}${four}`,
    );

    decades.push({
      index: i,
      ageStart,
      ageEnd,
      palaceBranch: palace.branch,
      palaceName: palace.name,
      stem,
      decadeName: PALACE_NAMES[i],
      fourTransformations,
      isCurrent: currentAge >= ageStart && currentAge <= ageEnd,
    });
  }

  return decades;
}

export function buildZiweiChart(input: ZiweiBirthInput): ZiweiChart {
  const date = safeDate(input.birthDate);
  const parsed = parseTime(input.birthTime);
  const solar = applyTrueSolarTime(parsed.hour, parsed.minute, input.longitude);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const normalizedDate = `${date.getFullYear()}-${month}-${day}`;
  const timeIndex = solar.hour === 23 ? 12 : solar.hour === 0 ? 0 : Math.floor((solar.hour + 1) / 2);
  const gender = String(input.gender || "male").toLowerCase().includes("female") || input.gender === "女" ? "女" : "男";
  const astrolabe = astro.withOptions({
    type: input.calendarType === "lunar" ? "lunar" : "solar",
    dateStr: normalizedDate,
    timeIndex,
    gender,
    fixLeap: true,
    language: "zh-CN",
    config: {
      algorithm: "zhongzhou",
      dayDivide: "current",
      yearDivide: "normal",
      horoscopeDivide: "normal",
      ageDivide: "normal",
    },
  });
  const normalizePalaceName = (name: string) => name === "仆役" ? "交友" : name;
  const normalizeBrightness = (value?: string): "庙" | "旺" | "利" | "陷" => {
    if (value === "庙" || value === "旺" || value === "利" || value === "陷") return value;
    if (value === "得" || value === "平") return "利";
    return value === "不" ? "陷" : "利";
  };
  const mutagenName = (value?: string) => value ? `化${value}` : "";
  const currentAge = new Date().getFullYear() - date.getFullYear() + 1;
  const palacePairs = astrolabe.palaces.map((source) => {
    const name = normalizePalaceName(String(source.name));
    const allStars = [...source.majorStars, ...source.minorStars, ...source.adjectiveStars];
    const four = allStars
      .filter((star) => Boolean(star.mutagen))
      .map((star) => `${star.name}${mutagenName(String(star.mutagen || ""))}`);
    const brightness: ZiweiPalace["brightness"] = {};
    [...source.majorStars, ...source.minorStars].forEach((star) => {
      if (star.brightness) brightness[String(star.name)] = normalizeBrightness(String(star.brightness));
    });
    const mapped: ZiweiPalace = {
      name,
      branch: String(source.earthlyBranch),
      stem: String(source.heavenlyStem),
      stars: source.majorStars.map((star) => String(star.name)),
      assistants: source.minorStars.map((star) => String(star.name)),
      misc: source.adjectiveStars.map((star) => String(star.name)),
      four,
      brightness,
      changsheng: String(source.changsheng12),
      focus: PALACE_FOCUS[name] || "人生主题与现实选择",
    };
    return { source, mapped };
  });
  const palaces = palacePairs
    .map(({ mapped }) => mapped)
    .sort((a, b) => PALACE_NAMES.indexOf(a.name as typeof PALACE_NAMES[number]) - PALACE_NAMES.indexOf(b.name as typeof PALACE_NAMES[number]));

  const mingPalace = palaces.find((item) => item.name === "命宫") || palaces[0];
  const bodyPalace = palaces.find((item) => item.branch === String(astrolabe.earthlyBranchOfBodyPalace)) || mingPalace;
  const mainStar = mingPalace.stars[0] || "紫微";
  const careerPalace = palaces.find((p) => p.name === "官禄");
  const spousePalace = palaces.find((p) => p.name === "夫妻");
  const chinesePillars = String(astrolabe.chineseDate).split(/\s+/);
  const yearPillar = chinesePillars[0] || pillarFromYear(date.getFullYear());
  const monthPillar = chinesePillars[1] || "";
  const dayPillar = chinesePillars[2] || pillarFromDay(date);
  const elementBureau = String(astrolabe.fiveElementsClass);
  const mingSource = astrolabe.palaces.find((item) => normalizePalaceName(String(item.name)) === "命宫");
  const mingIndex = astrolabe.palaces.findIndex((item) => normalizePalaceName(String(item.name)) === "命宫");
  const librarySurrounded = mingSource && typeof (mingSource as any).surroundedPalaces === "function"
    ? (mingSource as any).surroundedPalaces()
    : null;
  // Some iztro builds expose palace data without instance helper methods. In that
  // case, derive the same four-palace scope from the chart instead of inventing data.
  const fallbackSurrounded = mingSource
    ? [
        mingSource,
        mingIndex >= 0 ? astrolabe.palaces[(mingIndex + 6) % 12] : undefined,
        astrolabe.palaces.find((item) => normalizePalaceName(String(item.name)) === "财帛"),
        astrolabe.palaces.find((item) => normalizePalaceName(String(item.name)) === "官禄"),
      ].filter(Boolean)
    : [];
  const surroundedSources = librarySurrounded
    ? [librarySurrounded.target, librarySurrounded.opposite, librarySurrounded.wealth, librarySurrounded.career]
    : fallbackSurrounded;
  const surroundedStars = surroundedSources.length
    ? surroundedSources.flatMap((item: any) => item.majorStars.map((star: any) => String(star.name)))
    : mingPalace.stars;
  const surroundedMutagens = surroundedSources.flatMap((item: any) =>
    [...item.majorStars, ...item.minorStars].map((star: any) => String(star.mutagen || "")),
  );
  const patterns = [
    mingPalace.stars.includes("紫微") && mingPalace.stars.includes("天府") ? "紫府同宫" : "",
    ["七杀", "破军", "贪狼"].some((star) => mingPalace.stars.includes(star)) ? "杀破狼格" : "",
    ["天机", "太阴", "天同", "天梁"].every((star) => surroundedStars.includes(star)) ? "机月同梁" : "",
    ["禄", "权", "科"].every((value) => surroundedMutagens.includes(value)) ? "三奇嘉会" : "",
  ].filter(Boolean);
  const decades = palacePairs
    .map(({ source, mapped }, index): ZiweiDecade => {
      const stem = String(source.decadal.heavenlyStem);
      const transformationStars = FOUR_BY_STEM[stem] || FOUR_BY_STEM.甲;
      return {
        index,
        ageStart: source.decadal.range[0],
        ageEnd: source.decadal.range[1],
        palaceBranch: mapped.branch,
        palaceName: mapped.name,
        stem,
        decadeName: mapped.name,
        fourTransformations: FOUR_TRANSFORMATIONS.map((four, i) => `${transformationStars[i]}${four}`),
        isCurrent: currentAge >= source.decadal.range[0] && currentAge <= source.decadal.range[1],
      };
    })
    .sort((a, b) => a.ageStart - b.ageStart);

  return {
    name: input.name || "你",
    birthLabel: `${date.getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${formatTime(parsed.hour, parsed.minute)}`,
    mingPalace: `${mingPalace.branch}${mingPalace.name}`,
    shenPalace: `${bodyPalace.branch}${bodyPalace.name}`,
    elementBureau,
    yearPillar,
    monthPillar,
    dayPillar,
    lunarDate: String(astrolabe.lunarDate),
    chineseDate: String(astrolabe.chineseDate),
    soulStar: String(astrolabe.soul),
    bodyStar: String(astrolabe.body),
    mainStar,
    trueSolarTime: formatTime(solar.hour, solar.minute),
    timeTrace: [
      input.calendarType === "lunar" ? "用户选择农历输入：需按闰月规则换算后校验" : "用户选择公历输入",
      solar.note,
      parsed.hour === 23 ? "夜子时：23:00-24:00 默认按当日晚子时处理" : parsed.hour === 0 ? "早子时：00:00-01:00 默认按当日早子时处理" : "非子时特殊区间",
    ],
    patterns,
    palaces,
    summary: `${mainStar}坐命，${elementBureau}。命宫看先天性格，身宫落${bodyPalace.name}提示后天投入方向；官禄宫${careerPalace?.stars[0] || "无主星"}、夫妻宫${spousePalace?.stars[0] || "无主星"}是完整版解析的重点。`,
    gender: input.gender || "male",
    decades,
    calculationMeta: {
      engineVersion: "iztro-zhongzhou/2.5 + r7-adapter/0.5",
      generatedAt: new Date().toISOString(),
      features: {
        timeCalibration: {
          calculationAvailable: true,
          calculationSource: "rule-engine",
          confidenceLevel: typeof input.longitude === "number" ? "high" : "medium",
          note: typeof input.longitude === "number"
            ? "已按出生地经度换算真太阳时"
            : "未提供经度，按用户输入的当地标准时间处理",
        },
        natalFourTransformations: {
          calculationAvailable: true,
          calculationSource: "rule-engine",
          confidenceLevel: "high",
          note: "已由中州派排盘引擎按生年天干标注生年四化",
        },
        decadeCycles: {
          calculationAvailable: true,
          calculationSource: "rule-engine",
          confidenceLevel: "high",
          note: "已由中州派排盘引擎生成十二大限范围与宫位",
        },
        palaceStemFlyingTransformations: {
          calculationAvailable: false,
          calculationSource: "unavailable",
          confidenceLevel: "low",
          note: "当前版本未计算宫干飞化，报告不得引用跨宫飞化结论",
        },
        annualTransformations: {
          calculationAvailable: false,
          calculationSource: "unavailable",
          confidenceLevel: "low",
          note: "当前版本未计算流年四化，报告仅提供本命与大限层级参考",
        },
        monthlyTransformations: {
          calculationAvailable: false,
          calculationSource: "unavailable",
          confidenceLevel: "low",
          note: "当前版本未计算流月四化，报告不得生成具体流月断语",
        },
      },
    },
  };
}

export function buildZiweiSynastry(a: ZiweiChart, b: ZiweiChart): ZiweiSynastry {
  const aMain = MAIN_STARS.indexOf(a.mainStar);
  const bMain = MAIN_STARS.indexOf(b.mainStar);
  const starDistance = Math.abs(aMain - bMain);
  const sameBureau = a.elementBureau === b.elementBureau;
  const sharedStars = a.palaces.flatMap((p) => p.stars).filter((star) => b.palaces.flatMap((p) => p.stars).includes(star)).length;
  const score = Math.max(52, Math.min(96, 68 + (sameBureau ? 9 : 0) + Math.max(0, 10 - starDistance) + sharedStars));
  const label = score >= 86 ? "高吸引高共振" : score >= 74 ? "互补型缘分" : "需要磨合的牵引";
  const chemistry = sameBureau
    ? "两人的五行局相同，容易在生活节奏、审美和安全感上形成自然默契。"
    : "两人的五行局不同，吸引力来自差异互补，但节奏需要通过沟通校准。";
  const risk = starDistance > 7
    ? "主星差异较大，容易出现一方想推进、一方想观察的节奏差。"
    : "主星距离较近，优点是容易理解彼此，风险是把相似误认为理所当然。";
  const advice = score >= 80
    ? "适合把关系从情绪吸引落到具体计划：约定沟通频率、见面节奏和现实边界。"
    : "先不要急着定义关系，建议用三到四周观察对方行动是否稳定，再决定投入深度。";

  return { score, label, chemistry, risk, advice };
}
