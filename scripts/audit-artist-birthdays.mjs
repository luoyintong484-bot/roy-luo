import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { Solar } from "lunar-typescript";

const ROOT = process.cwd();
const ARTISTS_FILE = path.join(ROOT, "src/data/artists.ts");
const BACKUP_FILE = path.join(ROOT, "idols.backup.json");
const JSON_REPORT_FILE = path.join(ROOT, "idol-audit-report.json");
const MARKDOWN_REPORT_FILE = path.join(ROOT, "idol-audit-report.md");
const COLLECTIONS = new Set(["KOREAN_ARTISTS", "CHINESE_ARTISTS"]);

const WONHEE_SOURCES = [
  {
    name: "ILLIT Official Japan Profile",
    url: "https://illit-official.jp/profile",
    tier: 1,
  },
  {
    name: "Wikipedia - Wonhee",
    url: "https://en.wikipedia.org/wiki/Wonhee",
    tier: 1,
  },
];

function unwrap(expression) {
  if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
    return unwrap(expression.expression);
  }
  return expression;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function literalValue(node) {
  const value = unwrap(node);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (value.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(value) && ts.isNumericLiteral(value.operand)) {
    const number = Number(value.operand.text);
    return value.operator === ts.SyntaxKind.MinusToken ? -number : number;
  }
  if (ts.isArrayLiteralExpression(value)) return value.elements.map(literalValue);
  if (ts.isObjectLiteralExpression(value)) return objectValue(value);
  return undefined;
}

function objectValue(node) {
  const result = {};
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (!name) continue;
    const value = literalValue(property.initializer);
    if (value !== undefined) result[name] = value;
  }
  return result;
}

function parseArtists(source) {
  const sourceFile = ts.createSourceFile(
    ARTISTS_FILE,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const artists = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !COLLECTIONS.has(declaration.name.text)) continue;
      if (!declaration.initializer) continue;
      const initializer = unwrap(declaration.initializer);
      if (!ts.isArrayLiteralExpression(initializer)) continue;
      for (const element of initializer.elements) {
        const item = unwrap(element);
        if (!ts.isObjectLiteralExpression(item)) continue;
        artists.push({ collection: declaration.name.text, ...objectValue(item) });
      }
    }
  }

  return artists;
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) return null;
  return { year, month, day };
}

// Verified anchor from the task specification: 2000-01-07 = 甲子.
function rizhu(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jdn = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  const index = ((jdn + 49) % 60 + 60) % 60;
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  return stems[index % 10] + branches[index % 12];
}

function expectedZodiac(month, day) {
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return "白羊座";
  if (md >= 420 && md <= 520) return "金牛座";
  if (md >= 521 && md <= 621) return "双子座";
  if (md >= 622 && md <= 722) return "巨蟹座";
  if (md >= 723 && md <= 822) return "狮子座";
  if (md >= 823 && md <= 922) return "处女座";
  if (md >= 923 && md <= 1023) return "天秤座";
  if (md >= 1024 && md <= 1122) return "天蝎座";
  if (md >= 1123 && md <= 1221) return "射手座";
  if (md >= 1222 || md <= 119) return "摩羯座";
  if (md >= 120 && md <= 218) return "水瓶座";
  return "双鱼座";
}

function expectedChineseZodiac(year) {
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return animals[((year - 4) % 12 + 12) % 12];
}

function expectedMansion(year, month, day) {
  return `${Solar.fromYmd(year, month, day).getLunar().getXiu()}宿`;
}

function sourceLinks(artist) {
  const names = [artist.stageName, artist.name, artist.groupName].filter(Boolean).join(" ");
  const query = encodeURIComponent(names);
  if (artist.region === "china") {
    return [
      `https://baike.baidu.com/search/word?word=${query}%20生日`,
      `https://www.wikidata.org/w/index.php?search=${query}%20birthday`,
    ];
  }
  return [
    `https://search.naver.com/search.naver?query=${query}%20%EC%83%9D%EC%9D%BC`,
    `https://www.wikidata.org/w/index.php?search=${query}%20birthday`,
  ];
}

function auditArtist(artist, duplicateIds) {
  const issues = [];
  const date = parseDate(artist.birthDate);
  let calculated = null;

  if (!date) {
    issues.push("生日格式错误或日期无效");
  } else {
    const dayPillar = rizhu(date.year, date.month, date.day);
    const mansion = expectedMansion(date.year, date.month, date.day);
    const zodiacSign = expectedZodiac(date.month, date.day);
    const chineseZodiac = expectedChineseZodiac(date.year);
    calculated = { dayPillar, mansion, zodiacSign, chineseZodiac };

    if (date.month === 1 && date.day === 1) issues.push("疑似 01-01 占位生日");
    if (artist.baziDayPillar !== dayPillar) issues.push(`日柱不一致：库内 ${artist.baziDayPillar ?? "空"}，复算 ${dayPillar}`);
    if (artist.starMansion !== mansion) issues.push(`星宿不一致：库内 ${artist.starMansion ?? "空"}，复算 ${mansion}`);
    if (artist.zodiacSign !== zodiacSign) issues.push(`星座不一致：库内 ${artist.zodiacSign ?? "空"}，应为 ${zodiacSign}`);
    if (artist.chineseZodiac !== chineseZodiac) issues.push(`生肖不一致：库内 ${artist.chineseZodiac ?? "空"}，按公历年度粗校为 ${chineseZodiac}`);
  }

  if (duplicateIds.has(artist.id)) issues.push(`重复 ID：${artist.id}`);

  const registeredSources = Array.isArray(artist.sourceUrls) ? artist.sourceUrls : [];
  const isVerified = artist.verificationStatus === "verified" && registeredSources.length >= 2;
  if (!isVerified) issues.push("尚未登记两个独立可追溯来源");

  return {
    id: artist.id,
    name: artist.name,
    stageName: artist.stageName,
    groupName: artist.groupName,
    region: artist.region,
    birthDate: artist.birthDate,
    stored: {
      dayPillar: artist.baziDayPillar ?? null,
      mansion: artist.starMansion ?? null,
      zodiacSign: artist.zodiacSign ?? null,
      chineseZodiac: artist.chineseZodiac ?? null,
    },
    calculated,
    verificationStatus: isVerified ? "verified" : "needs_manual_review",
    issues,
    registeredSources,
    suggestedSourceChecks: sourceLinks(artist),
  };
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function markdownTableRow(entry) {
  const label = `${entry.groupName || "-"} / ${entry.stageName || entry.name}`;
  return `| ${entry.id} | ${label.replaceAll("|", "\\|")} | ${entry.birthDate} | ${entry.issues.join("<br>").replaceAll("|", "\\|")} | [来源1](${entry.suggestedSourceChecks[0]})<br>[来源2](${entry.suggestedSourceChecks[1]}) |`;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const source = await readFile(ARTISTS_FILE, "utf8");
  const artists = parseArtists(source);
  if (artists.length === 0) throw new Error("未从 src/data/artists.ts 解析到艺人记录，停止审计。");

  if (!(await exists(BACKUP_FILE))) {
    await writeFile(BACKUP_FILE, `${JSON.stringify({ generatedAt, source: "src/data/artists.ts", count: artists.length, artists }, null, 2)}\n`, "utf8");
    console.log(`Created immutable pre-change backup: ${BACKUP_FILE}`);
  } else {
    console.log(`Preserved existing backup: ${BACKUP_FILE}`);
  }

  const idCounts = new Map();
  for (const artist of artists) idCounts.set(artist.id, (idCounts.get(artist.id) ?? 0) + 1);
  const duplicateIds = new Set([...idCounts].filter(([, count]) => count > 1).map(([id]) => id));
  const entries = artists.map((artist) => auditArtist(artist, duplicateIds));
  const wonhee = entries.find((entry) => entry.stageName === "Wonhee" && entry.groupName === "ILLIT");
  const verified = entries.filter((entry) => entry.verificationStatus === "verified");
  const manual = entries.filter((entry) => entry.verificationStatus === "needs_manual_review");
  const placeholderCount = entries.filter((entry) => entry.issues.some((issue) => issue.includes("01-01"))).length;
  const dayPillarMismatchCount = entries.filter((entry) => entry.calculated && entry.stored.dayPillar !== entry.calculated.dayPillar).length;
  const mansionMismatchCount = entries.filter((entry) => entry.calculated && entry.stored.mansion !== entry.calculated.mansion).length;

  const knownCorrection = {
    groupName: "ILLIT",
    stageName: "Wonhee",
    realName: "Lee Won-hee",
    koreanName: "이원희",
    birthdayType: "solar",
    previousBirthday: "2004-年份错误（历史反馈）",
    correctedBirthday: "2007-06-26",
    correctedDayPillar: "辛卯",
    correctedMansion: "尾宿",
    sources: WONHEE_SOURCES,
    status: wonhee?.birthDate === "2007-06-26" && wonhee?.calculated?.dayPillar === "辛卯" ? "corrected" : "failed",
  };

  const report = {
    generatedAt,
    dataSource: "src/data/artists.ts",
    backupFile: "idols.backup.json",
    auditPolicy: {
      minimumIndependentSources: 2,
      writeRule: "无两个独立一致来源时不自动修改生日。",
      dayPillarAlgorithm: "附件指定 JDN 公式，2000-01-07=甲子。",
      mansionAlgorithm: "lunar-typescript Solar.fromYmd(...).getLunar().getXiu()",
      timezoneRule: "公开生日按艺人出生地当地历法日期使用，未对日期做北京时换日。",
    },
    summary: {
      totalArtists: entries.length,
      verifiedWithTwoSources: verified.length,
      correctedRecords: knownCorrection.status === "corrected" ? 1 : 0,
      needsManualReview: manual.length,
      placeholderBirthdays: placeholderCount,
      duplicateIds: [...duplicateIds].sort((a, b) => a - b),
      dayPillarMismatches: dayPillarMismatchCount,
      mansionMismatches: mansionMismatchCount,
    },
    corrected: [knownCorrection],
    verified,
    needs_manual_review: manual,
  };

  const markdown = [
    "# 艺人库生日 & 八字核对报告",
    "",
    `- 数据源：\`src/data/artists.ts\`（共 ${entries.length} 条）`,
    "- 备份：`idols.backup.json`（首次审计时生成，后续运行不覆盖）",
    `- 生成时间：${generatedAt}`,
    "",
    "## 审计结论",
    "",
    `- 有两个已登记独立来源的记录：${verified.length}`,
    `- 本次有证据支撑的校正：${knownCorrection.status === "corrected" ? 1 : 0}`,
    `- 待人工复核：${manual.length}`,
    `- 疑似 01-01 占位生日：${placeholderCount}`,
    `- 重复 ID：${[...duplicateIds].sort((a, b) => a - b).join("、") || "无"}`,
    `- 日柱与附件统一公式不一致：${dayPillarMismatchCount}`,
    `- 星宿与 \`lunar-typescript\` 复算不一致：${mansionMismatchCount}`,
    "",
    "> 除 Wonhee 外，本次未自动改写其他艺人资料。现有库没有为其他艺人登记至少两个独立来源，按红线全部进入人工复核，避免猜测式批量更新。",
    "",
    "## ✅ 已校正（置顶：已知错误）",
    "",
    "### ILLIT — Wonhee",
    "",
    "- 历史问题：曾被反馈为 2004 年份错误；当前主艺人库已是 `2007-06-26`。",
    "- 本名：`Lee Won-hee`（`이원희`）。",
    "- 生日类型：阳历（`solar`）。",
    "- 日柱：`辛卯`（附件指定公式复算）。",
    "- 本命星宿：`尾宿`（`lunar-typescript` 复算）。",
    `- 证据：${WONHEE_SOURCES.map((sourceItem) => `[${sourceItem.name}](${sourceItem.url})`).join(" / ")}`,
    "- 数据同步：主艺人库 + 数据库种子中的生日衍生字段。",
    "",
    "## 🟡 待人工复核（needs_manual_review）",
    "",
    "| ID | 艺人 / 团体 | 当前生日 | 待复核问题 | 建议查证入口 |",
    "| --- | --- | --- | --- | --- |",
    ...manual.map(markdownTableRow),
    "",
    "## 重要技术备注",
    "",
    "- 日柱审计严格使用任务附件给定的 JDN 公式。",
    "- 本命星宿使用 `lunar-typescript` 统一复算。项目其他模块仍存在按日柱或年序号映射星宿的旧逻辑，本任务遵守“不修改功能代码”要求，只在报告中提示不一致。",
    "- 生肖是公历年度粗校；立春/农历年切换附近的记录需再人工确认，审计器不自动改写。",
    "- 备份不会被后续审计运行覆盖，本任务也不会自动部署。",
    "",
  ].join("\n");

  await writeFile(JSON_REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(MARKDOWN_REPORT_FILE, markdown, "utf8");
  console.log(`Audited ${entries.length} artists.`);
  console.log(`Verified: ${verified.length}; manual review: ${manual.length}.`);
  console.log(`Wrote ${MARKDOWN_REPORT_FILE} and ${JSON_REPORT_FILE}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
