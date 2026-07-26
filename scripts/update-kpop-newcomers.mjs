import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ARTISTS_FILE = path.join(ROOT, "src/data/artists.ts");
const REGISTRY_FILE = path.join(ROOT, "data/artist_source_registry.json");
const DOCS_DIR = path.join(ROOT, "docs");
const REPORT_FILE = path.join(DOCS_DIR, "artist-database-update-2026-07-02.md");
const PENDING_FILE = path.join(ROOT, "data/artist_pending_review.json");
const RUN_DATE = new Date().toISOString().slice(0, 10);

const encode = (value) => encodeURIComponent(String(value).replace(/\s+/g, " ").trim());

function parseArtists(source) {
  const rows = [];
  const entryRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]*)",\s*stageName:\s*"([^"]*)",\s*groupName:\s*"([^"]*)",[\s\S]*?birthDate:\s*"([^"]*)"[\s\S]*?zodiacSign:\s*"([^"]*)"[\s\S]*?debutDate:\s*"([^"]*)"[\s\S]*?agency:\s*"([^"]*)"[\s\S]*?position:\s*"([^"]*)"[\s\S]*?(?:verificationStatus:\s*"([^"]*)")?/g;
  let match;

  while ((match = entryRegex.exec(source))) {
    rows.push({
      id: Number(match[1]),
      name: match[2],
      stageName: match[3],
      groupName: match[4],
      birthDate: match[5],
      zodiacSign: match[6],
      debutDate: match[7],
      agency: match[8],
      position: match[9],
      verificationStatus: match[10] || "legacy",
    });
  }

  return rows;
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

function inspectArtist(artist) {
  const issues = [];
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(artist.birthDate);

  if (!dateMatch) {
    issues.push("生日格式不是 YYYY-MM-DD");
  } else {
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    if (month === 1 && day === 1) issues.push("疑似占位生日 01-01");
    const zodiac = expectedZodiac(month, day);
    if (artist.zodiacSign !== zodiac) issues.push(`星座与生日不一致，应为 ${zodiac}`);
  }

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(artist.debutDate)) {
    issues.push("出道日期格式不是 YYYY.MM.DD");
  }

  if (artist.agency === "Unknown") issues.push("经纪公司缺失");

  return issues;
}

function naverQuery(row) {
  return `https://search.naver.com/search.naver?query=${encode(`${row.groupName} ${row.stageName} 프로필 생년월일 데뷔`)}`;
}

function summarizeGroups(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.groupName)) {
      groups.set(row.groupName, {
        groupName: row.groupName,
        count: 0,
        debutDate: row.debutDate,
        agency: row.agency,
        statuses: new Set(),
      });
    }
    const group = groups.get(row.groupName);
    group.count += 1;
    group.statuses.add(row.verificationStatus);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    statuses: [...group.statuses].join(", "),
  }));
}

async function main() {
  const [source, registryText] = await Promise.all([
    readFile(ARTISTS_FILE, "utf8"),
    readFile(REGISTRY_FILE, "utf8"),
  ]);
  const registry = JSON.parse(registryText);
  const rows = parseArtists(source);
  const issues = rows
    .map((row) => ({ ...row, issues: inspectArtist(row), sourceCheck: naverQuery(row) }))
    .filter((row) => row.issues.length > 0);
  const duplicateIds = [...new Set(rows.map((row) => row.id).filter((id, index, ids) => ids.indexOf(id) !== index))];
  const groups = summarizeGroups(rows);

  const pending = {
    generatedAt: RUN_DATE,
    duplicateIds,
    pendingFromRegistry: registry.pendingReview,
    fieldIssues: issues.map(({ id, name, stageName, groupName, birthDate, debutDate, agency, issues, sourceCheck }) => ({
      id,
      name,
      stageName,
      groupName,
      birthDate,
      debutDate,
      agency,
      issues,
      sourceCheck,
    })),
  };

  const report = [
    "# Artist Database Update & Naver Review Queue",
    "",
    `Generated: ${RUN_DATE}`,
    "",
    "## 本次正式入库/修正",
    "",
    "- 新增 TWS 6 名成员，使用唯一 ID 860-865，避免触碰现有历史 ID。",
    "- 修正 ALLDAY PROJECT 团体出道日期 `2025.04.01 -> 2025.06.23`，经纪公司 `Unknown -> THEBLACKLABEL`。",
    "- 为 `ArtistStatic` 增加 `generationTag`、`verificationStatus`、`sourceUrls`，后续可以区分正式数据、待复核数据和占位数据。",
    "- 补充 2024-2025 新团 `GROUP_META`：ALLDAY PROJECT、BABYMONSTER、ILLIT、MEOVV、NCT WISH、TWS。",
    "",
    "## 数据写入原则",
    "",
    registry.policy.formalWriteRule,
    "",
    "## 新增团体",
    "",
    "| Group | Debut | Agency | Tags | Status | Source |",
    "| --- | --- | --- | --- | --- | --- |",
    ...registry.newGroups.map((group) => (
      `| ${group.groupName} | ${group.debutDate} | ${group.agency} | ${group.tags.join(", ")} | ${group.verificationStatus} | ${group.sourceUrls.map((url) => `[link](${url})`).join("<br>")} |`
    )),
    "",
    "## 修正记录",
    "",
    "| Group | Change | Old | New | Status | Source |",
    "| --- | --- | --- | --- | --- | --- |",
    ...registry.modifiedGroups.map((group) => (
      `| ${group.groupName} | ${group.changeType} | ${group.oldData.debutDate} / ${group.oldData.agency} | ${group.newData.debutDate} / ${group.newData.agency} | ${group.verificationStatus} | ${group.sourceUrls.map((url) => `[link](${url})`).join("<br>")} |`
    )),
    "",
    "## 待补全 / 禁止直接标记已验证",
    "",
    "| Group | Reason |",
    "| --- | --- |",
    ...registry.pendingReview.map((item) => `| ${item.groupName} | ${item.reason} |`),
    "",
    "## 自动字段审计结果",
    "",
    `- Parsed artists: ${rows.length}`,
    `- Groups parsed: ${groups.length}`,
    `- Duplicate IDs already present: ${duplicateIds.length ? duplicateIds.join(", ") : "none"}`,
    `- Entries with field issues: ${issues.length}`,
    "",
    "| ID | Artist | Group | Birthday | Debut | Agency | Issues | Naver Check |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...issues.map((row) => `| ${row.id} | ${row.name} / ${row.stageName} | ${row.groupName} | ${row.birthDate} | ${row.debutDate} | ${row.agency} | ${row.issues.join("<br>")} | [Naver](${row.sourceCheck}) |`),
    "",
    "## 后续爬虫接入建议",
    "",
    "1. 使用 Naver Developers Search API 或允许登录态的内部抓取任务拉取候选 URL。",
    "2. 对每个候选艺人执行 `Naver profile + agency official profile/announcement` 双源比对。",
    "3. 只把双源一致的生日、出道日期、经纪公司写入 `src/data/artists.ts` 并标记 `verificationStatus: \"verified\"`。",
    "4. 单源或冲突项写入 `data/artist_pending_review.json`，不要进入正式推荐池。",
    "",
  ].join("\n");

  await mkdir(DOCS_DIR, { recursive: true });
  await Promise.all([
    writeFile(REPORT_FILE, report, "utf8"),
    writeFile(PENDING_FILE, `${JSON.stringify(pending, null, 2)}\n`, "utf8"),
  ]);

  console.log(`Parsed ${rows.length} artists across ${groups.length} groups.`);
  console.log(`Duplicate IDs already present: ${duplicateIds.length}`);
  console.log(`Field issues: ${issues.length}`);
  console.log(`Wrote ${REPORT_FILE}`);
  console.log(`Wrote ${PENDING_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
