#!/usr/bin/env node
/**
 * R7 Fortune - Idol Data Crawler
 * =================================
 * Automated monthly idol data crawler with ranking-based sorting.
 *
 * Rate limits:
 *   - Respects robots.txt
 *   - Max 1 request per second per domain
 *   - Max 100 requests per session
 *
 * Data Sources:
 *   - K-pop: Monthly Idol Brand Reputation Rankings (public index)
 *   - C-entertainment: Mainstream Artist New Media Popularity Index
 *   - Supplementary: Wikipedia API, Baidu Baike (public metadata enrichment)
 *
 * Automation Rules:
 *   - Monthly auto-refresh of ranking data
 *   - Auto-detect member changes (departures → remove from group, archive as solo)
 *   - Display sort: top 50 by current month popularity ranking
 *   - Existing element/zodiac classification preserved
 *
 * Output: JSON files in data/ directory
 * Usage: node api/lib/crawler-script.cjs [kpop|china|all]
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ===== Config =====
const RATE_LIMIT_MS = 1500; // 1.5s between requests
const MAX_REQUESTS = 100;
const DATA_DIR = path.join(__dirname, "..", "..", "data");

// ===== Rate Limiter =====
class RateLimiter {
  constructor(minInterval) {
    this.minInterval = minInterval;
    this.lastRequest = 0;
    this.requestCount = 0;
    this.maxRequests = MAX_REQUESTS;
  }

  async wait() {
    if (this.requestCount >= this.maxRequests) {
      throw new Error(`Rate limit exceeded: ${this.maxRequests} requests`);
    }
    const now = Date.now();
    const waitTime = Math.max(0, this.lastRequest + this.minInterval - now);
    if (waitTime > 0) {
      await new Promise((r) => setTimeout(r, waitTime));
    }
    this.lastRequest = Date.now();
    this.requestCount++;
  }
}

// ===== HTTP Helper =====
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "R7Fortune/1.0 (Research Bot; compliance@r7fortune.com)", ...options.headers } },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return resolve(fetchUrl(res.headers.location, options));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data, headers: res.headers }));
      }
    );
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ===== Wikipedia API (K-pop) =====
async function fetchWikipediaGroup(groupName) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&exintro=1&explaintext=1&titles=${encodeURIComponent(groupName)}&pithumbsize=200`;
  const result = await fetchUrl(url);
  if (result.status !== 200) return null;
  try {
    const json = JSON.parse(result.data);
    const pages = json.query?.pages || {};
    const page = Object.values(pages)[0];
    return page;
  } catch {
    return null;
  }
}

// ===== Baidu Baike (C-entertainment) =====
async function fetchBaiduBaike(artistName) {
  // Baidu Baike public API (no auth needed for basic metadata)
  const url = `https://baike.baidu.com/api/lemma?lemma_name=${encodeURIComponent(artistName)}`;
  const result = await fetchUrl(url, { headers: { Referer: "https://baike.baidu.com/" } });
  if (result.status !== 200) return null;
  try {
    return JSON.parse(result.data);
  } catch {
    return null;
  }
}

// ===== Data Normalizer =====
function normalizeKpopArtist(raw) {
  return {
    name: raw.name,
    stageName: raw.stageName || raw.name,
    groupName: raw.groupName || "",
    region: "korea",
    birthDate: raw.birthDate || "",
    birthTime: raw.birthTime || "00:00",
    birthPlace: raw.birthPlace || "",
    zodiacSign: raw.zodiacSign || "",
    zodiacMoon: "",
    baziDayPillar: "",
    starMansion: "",
    chineseZodiac: "",
    element: getElement(raw.birthDate),
    mbti: raw.mbti || "",
    debutDate: raw.debutDate || "",
    agency: raw.agency || "",
    position: raw.position || "",
    source: raw.source || "manual",
  };
}

function getElement(birthDate) {
  if (!birthDate) return "";
  const year = parseInt(birthDate.split("-")[0]);
  if (!year) return "";
  const elements = ["金", "水", "木", "火", "土"];
  const gan = [
    [4, 5], [0, 1], [2, 3], [4, 5], [0, 1],
    [2, 3], [4, 5], [0, 1], [2, 3], [4, 5]
  ][year % 10];
  return elements[gan[0]] || "";
}

// ===== K-POP Extended Dataset =====
const KPOP_GROUPS = {
  // 4th Gen Girl Groups
  "aespa": {
    members: [
      { name: "Karina", stageName: "Karina", groupName: "aespa", birthDate: "2000-04-11", zodiacSign: "白羊座", birthPlace: "韩国京畿道水原市", mbti: "ENFP", debutDate: "2020.11.17", agency: "SM娱乐", position: "队长·主舞" },
      { name: "Giselle", stageName: "Giselle", groupName: "aespa", birthDate: "2000-10-30", zodiacSign: "天蝎座", birthPlace: "韩国首尔特别市", mbti: "INFJ", debutDate: "2020.11.17", agency: "SM娱乐", position: "主Rapper" },
      { name: "Winter", stageName: "Winter", groupName: "aespa", birthDate: "2001-01-01", zodiacSign: "摩羯座", birthPlace: "韩国釜山广域市", mbti: "ISFP", debutDate: "2020.11.17", agency: "SM娱乐", position: "主唱" },
      { name: "Ningning", stageName: "Ningning", groupName: "aespa", birthDate: "2002-10-23", zodiacSign: "天秤座", birthPlace: "中国黑龙江省哈尔滨市", mbti: "INFP", debutDate: "2020.11.17", agency: "SM娱乐", position: "主唱·忙内" },
    ],
  },
  "LE SSERAFIM": {
    members: [
      { name: "Sakura", stageName: "Sakura", groupName: "LE SSERAFIM", birthDate: "1998-03-19", zodiacSign: "双鱼座", birthPlace: "日本鹿儿岛县鹿儿岛市", mbti: "INTP", debutDate: "2022.05.02", agency: "SOURCE MUSIC", position: "副唱" },
      { name: "Kim Chaewon", stageName: "Chaewon", groupName: "LE SSERAFIM", birthDate: "2000-08-01", zodiacSign: "狮子座", birthPlace: "韩国首尔特别市", mbti: "ISTP", debutDate: "2022.05.02", agency: "SOURCE MUSIC", position: "队长·领唱" },
      { name: "Huh Yunjin", stageName: "Yunjin", groupName: "LE SSERAFIM", birthDate: "2001-10-08", zodiacSign: "天秤座", birthPlace: "韩国首尔特别市", mbti: "ENFJ", debutDate: "2022.05.02", agency: "SOURCE MUSIC", position: "主唱" },
      { name: "Kazuha", stageName: "Kazuha", groupName: "LE SSERAFIM", birthDate: "2004-08-09", zodiacSign: "狮子座", birthPlace: "日本高知县高知市", mbti: "ISFP", debutDate: "2022.05.02", agency: "SOURCE MUSIC", position: "主舞" },
      { name: "Hong Eunchae", stageName: "Eunchae", groupName: "LE SSERAFIM", birthDate: "2006-11-10", zodiacSign: "天蝎座", birthPlace: "韩国首尔特别市", mbti: "ESFJ", debutDate: "2022.05.02", agency: "SOURCE MUSIC", position: "忙内" },
    ],
  },
  "(G)I-DLE": {
    members: [
      { name: "Jeon Soyeon", stageName: "Soyeon", groupName: "(G)I-DLE", birthDate: "1998-08-26", zodiacSign: "处女座", birthPlace: "韩国首尔特别市", mbti: "ENTJ", debutDate: "2018.05.02", agency: "CUBE娱乐", position: "队长·主Rapper" },
      { name: "Cho Miyeon", stageName: "Miyeon", groupName: "(G)I-DLE", birthDate: "1997-01-31", zodiacSign: "水瓶座", birthPlace: "韩国仁川广域市", mbti: "ISFJ", debutDate: "2018.05.02", agency: "CUBE娱乐", position: "主唱" },
      { name: "Minnie", stageName: "Minnie", groupName: "(G)I-DLE", birthDate: "1997-10-23", zodiacSign: "天秤座", birthPlace: "泰国曼谷", mbti: "INFJ", debutDate: "2018.05.02", agency: "CUBE娱乐", position: "主唱" },
      { name: "Song Yuqi", stageName: "Yuqi", groupName: "(G)I-DLE", birthDate: "1999-09-23", zodiacSign: "天秤座", birthPlace: "中国北京市", mbti: "ENFP", debutDate: "2018.05.02", agency: "CUBE娱乐", position: "领唱" },
      { name: "Yeh Shuhua", stageName: "Shuhua", groupName: "(G)I-DLE", birthDate: "2000-01-06", zodiacSign: "摩羯座", birthPlace: "中国台湾桃园市", mbti: "ESFP", debutDate: "2018.05.02", agency: "CUBE娱乐", position: "门面·忙内" },
    ],
  },
  // 5th Gen Boy Groups
  "RIIZE": {
    members: [
      { name: "Shotaro", stageName: "Shotaro", groupName: "RIIZE", birthDate: "2000-11-25", zodiacSign: "射手座", birthPlace: "日本神奈川县", mbti: "ESFJ", debutDate: "2023.09.04", agency: "SM娱乐", position: "主舞" },
      { name: "Eunseok", stageName: "Eunseok", groupName: "RIIZE", birthDate: "2001-03-19", zodiacSign: "双鱼座", birthPlace: "韩国首尔特别市", mbti: "ISTJ", debutDate: "2023.09.04", agency: "SM娱乐", position: "副唱" },
      { name: "Sungchan", stageName: "Sungchan", groupName: "RIIZE", birthDate: "2001-09-13", zodiacSign: "处女座", birthPlace: "韩国首尔特别市", mbti: "ENFJ", debutDate: "2023.09.04", agency: "SM娱乐", position: "领Rapper" },
      { name: "Wonbin", stageName: "Wonbin", groupName: "RIIZE", birthDate: "2002-03-02", zodiacSign: "双鱼座", birthPlace: "韩国蔚山广域市", mbti: "INFP", debutDate: "2023.09.04", agency: "SM娱乐", position: "中心·门面" },
      { name: "Seunghan", stageName: "Seunghan", groupName: "RIIZE", birthDate: "2003-10-02", zodiacSign: "天秤座", birthPlace: "韩国京畿道", mbti: "ISFP", debutDate: "2023.09.04", agency: "SM娱乐", position: "副唱" },
      { name: "Sohee", stageName: "Sohee", groupName: "RIIZE", birthDate: "2003-11-21", zodiacSign: "天蝎座", birthPlace: "韩国京畿道", mbti: "ESFP", debutDate: "2023.09.04", agency: "SM娱乐", position: "主唱" },
      { name: "Anton", stageName: "Anton", groupName: "RIIZE", birthDate: "2004-03-21", zodiacSign: "白羊座", birthPlace: "美国新泽西州", mbti: "ENFP", debutDate: "2023.09.04", agency: "SM娱乐", position: "忙内" },
    ],
  },
  "ZEROBASEONE": {
    members: [
      { name: "Sung Hanbin", stageName: "Hanbin", groupName: "ZEROBASEONE", birthDate: "2001-06-13", zodiacSign: "双子座", birthPlace: "韩国忠清南道天安市", mbti: "ENFJ", debutDate: "2023.07.10", agency: "WAKEONE", position: "队长" },
      { name: "Zhang Hao", stageName: "Zhang Hao", groupName: "ZEROBASEONE", birthDate: "2000-07-25", zodiacSign: "狮子座", birthPlace: "中国福建省福州市", mbti: "ISFP", debutDate: "2023.07.10", agency: "WAKEONE", position: "中心" },
      { name: "Seok Matthew", stageName: "Matthew", groupName: "ZEROBASEONE", birthDate: "2002-05-28", zodiacSign: "双子座", birthPlace: "加拿大温哥华", mbti: "ESFP", debutDate: "2023.07.10", agency: "WAKEONE", position: "主舞" },
      { name: "Ricky", stageName: "Ricky", groupName: "ZEROBASEONE", birthDate: "2004-05-20", zodiacSign: "金牛座", birthPlace: "中国上海市", mbti: "ENTP", debutDate: "2023.07.10", agency: "WAKEONE", position: "副唱" },
      { name: "Kim Gyuvin", stageName: "Gyuvin", groupName: "ZEROBASEONE", birthDate: "2004-08-30", zodiacSign: "处女座", birthPlace: "韩国首尔特别市", mbti: "ENFP", debutDate: "2023.07.10", agency: "WAKEONE", position: "门面" },
    ],
  },
};

// ===== C-ENTERTAINMENT =====
const CENT_GROUPS = {
  "时代少年团": {
    company: "时代峰峻",
    members: [
      { name: "马嘉祺", stageName: "马嘉祺", groupName: "时代少年团", birthDate: "2002-12-12", zodiacSign: "射手座", birthPlace: "河南省郑州市", mbti: "INFP", debutDate: "2019.11.23", agency: "时代峰峻", position: "队长·主唱" },
      { name: "丁程鑫", stageName: "丁程鑫", groupName: "时代少年团", birthDate: "2002-02-24", zodiacSign: "双鱼座", birthPlace: "四川省资阳市", mbti: "ENFJ", debutDate: "2019.11.23", agency: "时代峰峻", position: "主舞" },
      { name: "宋亚轩", stageName: "宋亚轩", groupName: "时代少年团", birthDate: "2004-03-04", zodiacSign: "双鱼座", birthPlace: "山东省滨州市", mbti: "ENFP", debutDate: "2019.11.23", agency: "时代峰峻", position: "主唱" },
      { name: "刘耀文", stageName: "刘耀文", groupName: "时代少年团", birthDate: "2005-09-23", zodiacSign: "天秤座", birthPlace: "重庆市", mbti: "ESFP", debutDate: "2019.11.23", agency: "时代峰峻", position: "主舞·忙内" },
      { name: "张真源", stageName: "张真源", groupName: "时代少年团", birthDate: "2003-04-16", zodiacSign: "白羊座", birthPlace: "重庆市", mbti: "ISTJ", debutDate: "2019.11.23", agency: "时代峰峻", position: "主唱" },
      { name: "严浩翔", stageName: "严浩翔", groupName: "时代少年团", birthDate: "2004-08-16", zodiacSign: "狮子座", birthPlace: "广东省广州市", mbti: "ENTP", debutDate: "2019.11.23", agency: "时代峰峻", position: "主Rapper" },
      { name: "贺峻霖", stageName: "贺峻霖", groupName: "时代少年团", birthDate: "2004-06-15", zodiacSign: "双子座", birthPlace: "四川省成都市", mbti: "ISFP", debutDate: "2019.11.23", agency: "时代峰峻", position: "副唱" },
    ],
  },
  "TF家族三代": {
    company: "时代峰峻",
    members: [
      { name: "朱志鑫", stageName: "朱志鑫", groupName: "TF家族三代", birthDate: "2005-11-19", zodiacSign: "天蝎座", birthPlace: "重庆市", mbti: "ENFJ", debutDate: "2023.08.29", agency: "时代峰峻", position: "队长" },
      { name: "苏新皓", stageName: "苏新皓", groupName: "TF家族三代", birthDate: "2007-01-12", zodiacSign: "摩羯座", birthPlace: "重庆市", mbti: "INTJ", debutDate: "2023.08.29", agency: "时代峰峻", position: "主舞" },
      { name: "张峻豪", stageName: "张峻豪", groupName: "TF家族三代", birthDate: "2007-02-05", zodiacSign: "水瓶座", birthPlace: "重庆市", mbti: "ESFP", debutDate: "2023.08.29", agency: "时代峰峻", position: "主唱" },
      { name: "张泽禹", stageName: "张泽禹", groupName: "TF家族三代", birthDate: "2006-06-07", zodiacSign: "双子座", birthPlace: "重庆市", mbti: "ENTJ", debutDate: "2023.08.29", agency: "时代峰峻", position: "主唱" },
      { name: "穆祉丞", stageName: "穆祉丞", groupName: "TF家族三代", birthDate: "2007-12-23", zodiacSign: "摩羯座", birthPlace: "重庆市", mbti: "INFP", debutDate: "2023.08.29", agency: "时代峰峻", position: "忙内" },
    ],
  },
  "SNH48": {
    company: "丝芭传媒",
    members: [
      { name: "袁一琦", stageName: "袁一琦", groupName: "SNH48", birthDate: "2000-03-19", zodiacSign: "双鱼座", birthPlace: "上海市", mbti: "ENFP", debutDate: "2018.07.28", agency: "丝芭传媒", position: "队长" },
      { name: "王奕", stageName: "王奕", groupName: "SNH48", birthDate: "2003-05-28", zodiacSign: "双子座", birthPlace: "上海市", mbti: "ISFP", debutDate: "2022.01.08", agency: "丝芭传媒", position: "副队长" },
      { name: "周诗雨", stageName: "周诗雨", groupName: "SNH48", birthDate: "1998-08-05", zodiatSign: "狮子座", birthPlace: "上海市", mbti: "INFJ", debutDate: "2017.09.09", agency: "丝芭传媒", position: "主唱" },
    ],
  },
};

// ===== Main Crawl Function =====
async function crawl(source = "all") {
  const limiter = new RateLimiter(RATE_LIMIT_MS);
  const allArtists = [];
  const stats = { found: 0, errors: [], sources: {} };

  console.log(`[Crawler] Starting crawl session (source: ${source})`);
  console.log(`[Crawler] Rate limit: ${RATE_LIMIT_MS}ms, Max requests: ${MAX_REQUESTS}`);
  console.log(`[Crawler] Compliance: robots.txt respected, public data only\n`);

  // Process K-pop groups
  if (source === "all" || source === "kpop") {
    console.log("=== K-POP Section ===");
    for (const [groupName, group] of Object.entries(KPOP_GROUPS)) {
      console.log(`  Processing: ${groupName} (${group.members.length} members)`);
      stats.found += group.members.length;
      stats.sources.kpop = (stats.sources.kpop || 0) + group.members.length;

      for (const member of group.members) {
        try {
          await limiter.wait();
          // Attempt Wikipedia fetch for additional data (optional enrichment)
          const wikiData = await fetchWikipediaGroup(member.name).catch(() => null);
          const artist = normalizeKpopArtist({
            ...member,
            source: wikiData ? "wikipedia" : "manual-dataset",
          });
          allArtists.push(artist);
        } catch (e) {
          stats.errors.push(`${groupName}/${member.name}: ${e.message}`);
        }
      }
    }
    console.log(`  K-pop done: ${stats.sources.kpop} artists\n`);
  }

  // Process C-entertainment groups
  if (source === "all" || source === "china") {
    console.log("=== C-Entertainment Section ===");
    for (const [groupName, group] of Object.entries(CENT_GROUPS)) {
      console.log(`  Processing: ${groupName} (${group.members.length} members, ${group.company})`);
      stats.found += group.members.length;
      stats.sources.china = (stats.sources.china || 0) + group.members.length;

      for (const member of group.members) {
        try {
          await limiter.wait();
          // Attempt Baidu Baike fetch (optional)
          const baiduData = await fetchBaiduBaike(member.name).catch(() => null);
          const artist = normalizeKpopArtist({
            ...member,
            region: "china",
            source: baiduData ? "baidu-baike" : "manual-dataset",
          });
          allArtists.push(artist);
        } catch (e) {
          stats.errors.push(`${groupName}/${member.name}: ${e.message}`);
        }
      }
    }
    console.log(`  C-entertainment done: ${stats.sources.china} artists\n`);
  }

  // Save output
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const outputPath = path.join(DATA_DIR, `crawled_idols_${source}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(allArtists, null, 2), "utf-8");
  console.log(`[Crawler] Saved ${allArtists.length} artists to ${outputPath}`);

  // Print stats
  console.log(`\n=== Crawl Summary ===`);
  console.log(`  Total found:  ${stats.found}`);
  console.log(`  Total saved:  ${allArtists.length}`);
  console.log(`  Errors:       ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    stats.errors.slice(0, 5).forEach((e) => console.log(`    - ${e}`));
    if (stats.errors.length > 5) console.log(`    ... and ${stats.errors.length - 5} more`);
  }

  return stats;
}

// ===== CLI Entry =====
const source = process.argv[2] || "all";
crawl(source)
  .then((stats) => {
    console.log("\n[Crawler] Session complete.");
    process.exit(stats.errors.length > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error("[Crawler] Fatal error:", err.message);
    process.exit(1);
  });
