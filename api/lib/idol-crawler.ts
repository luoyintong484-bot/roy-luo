// ===== Idol Web Crawler - Kprofile / Public Sources =====
// Simulates crawling with rate limiting and data normalization

import { getDb } from "../queries/connection";
import { artists, idolCrawlLogs } from "@db/schema";
import { eq } from "drizzle-orm";

export interface CrawlIdol {
  name: string;
  stageName?: string;
  groupName?: string;
  birthDate: string;
  zodiacSign?: string;
  nationality?: string;
  agency?: string;
  position?: string;
  avatar?: string;
}

// Pre-populated idol dataset (simulating crawled data from Kprofile / Namuwiki)
// In production, this would be replaced with actual HTTP scraping
const CRAWL_DATASETS: Record<string, CrawlIdol[]> = {
  "newjeans": [
    { name: "Minji", stageName: "Minji", groupName: "NewJeans", birthDate: "2004-05-07", zodiacSign: "金牛座", nationality: "韩国", agency: "ADOR", position: "队长", avatar: "https://kprofiles.com/wp-content/uploads/2022/07/5A35DCAE-4B0B-4F46-9BF1-AA16E9C039B8-533x800.jpeg" },
    { name: "Hanni", stageName: "Hanni", groupName: "NewJeans", birthDate: "2004-10-06", zodiacSign: "天秤座", nationality: "越南", agency: "ADOR", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2022/07/7D2C185C-9CE4-43A1-AE71-C67173B2E3D9-533x800.jpeg" },
    { name: "Danielle", stageName: "Danielle", groupName: "NewJeans", birthDate: "2005-04-11", zodiacSign: "白羊座", nationality: "韩澳", agency: "ADOR", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2022/07/Danielle-1-533x800.jpeg" },
    { name: "Haerin", stageName: "Haerin", groupName: "NewJeans", birthDate: "2006-05-15", zodiacSign: "金牛座", nationality: "韩国", agency: "ADOR", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2022/07/Haerin-533x800.jpeg" },
    { name: "Hyein", stageName: "Hyein", groupName: "NewJeans", birthDate: "2008-04-21", zodiacSign: "金牛座", nationality: "韩国", agency: "ADOR", position: "忙内", avatar: "https://kprofiles.com/wp-content/uploads/2022/07/Hyein-1-533x800.jpeg" },
  ],
  "illit": [
    { name: "Yunah", stageName: "Yunah", groupName: "ILLIT", birthDate: "2004-01-15", zodiacSign: "摩羯座", nationality: "韩国", agency: "BELIFT LAB", position: "队长", avatar: "https://kprofiles.com/wp-content/uploads/2023/09/6CB5C104-83BD-4957-BF50-5888B5C865CB-533x800.jpeg" },
    { name: "Minju", stageName: "Minju", groupName: "ILLIT", birthDate: "2004-05-11", zodiacSign: "金牛座", nationality: "韩国", agency: "BELIFT LAB", position: "门面", avatar: "https://kprofiles.com/wp-content/uploads/2023/09/Minju-1-533x800.jpeg" },
    { name: "Moka", stageName: "Moka", groupName: "ILLIT", birthDate: "2004-10-08", zodiacSign: "天秤座", nationality: "日本", agency: "BELIFT LAB", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/09/Moka-533x800.jpeg" },
    { name: "Wonhee", stageName: "Wonhee", groupName: "ILLIT", birthDate: "2007-06-26", zodiacSign: "巨蟹座", nationality: "韩国", agency: "BELIFT LAB", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/09/Wonhee-533x800.jpeg" },
    { name: "Iroha", stageName: "Iroha", groupName: "ILLIT", birthDate: "2008-02-04", zodiacSign: "水瓶座", nationality: "日本", agency: "BELIFT LAB", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/09/Iroha-533x800.jpeg" },
  ],
  "babymonster": [
    { name: "Ruka", stageName: "Ruka", groupName: "BABYMONSTER", birthDate: "2002-03-20", zodiacSign: "双鱼座", nationality: "日本", agency: "YG Entertainment", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Ruka-533x800.jpg" },
    { name: "Pharita", stageName: "Pharita", groupName: "BABYMONSTER", birthDate: "2005-08-26", zodiacSign: "处女座", nationality: "泰国", agency: "YG Entertainment", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Pharita-533x800.jpg" },
    { name: "Asa", stageName: "Asa", groupName: "BABYMONSTER", birthDate: "2006-04-17", zodiacSign: "白羊座", nationality: "日本", agency: "YG Entertainment", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Asa-533x800.jpg" },
    { name: "Ahyeon", stageName: "Ahyeon", groupName: "BABYMONSTER", birthDate: "2007-04-11", zodiacSign: "白羊座", nationality: "韩国", agency: "YG Entertainment", position: "ACE", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Ahyeon-533x800.jpg" },
    { name: "Rami", stageName: "Rami", groupName: "BABYMONSTER", birthDate: "2007-10-17", zodiacSign: "天秤座", nationality: "韩国", agency: "YG Entertainment", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Rami-533x800.jpg" },
    { name: "Rora", stageName: "Rora", groupName: "BABYMONSTER", birthDate: "2008-08-14", zodiacSign: "狮子座", nationality: "韩国", agency: "YG Entertainment", position: "领唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Rora-533x800.jpg" },
    { name: "Chiquita", stageName: "Chiquita", groupName: "BABYMONSTER", birthDate: "2009-02-17", zodiacSign: "水瓶座", nationality: "泰国", agency: "YG Entertainment", position: "忙内", avatar: "https://kprofiles.com/wp-content/uploads/2023/02/Chiquita-533x800.jpg" },
  ],
  "tws": [
    { name: "Shinyu", stageName: "Shinyu", groupName: "TWS", birthDate: "2003-11-07", zodiacSign: "天蝎座", nationality: "韩国", agency: "PLEDIS", position: "队长", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/EBA19FAD-5147-470F-A9C0-032E44F2A718-533x800.jpeg" },
    { name: "Dohoon", stageName: "Dohoon", groupName: "TWS", birthDate: "2005-01-20", zodiacSign: "水瓶座", nationality: "韩国", agency: "PLEDIS", position: "门面", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/Dohoon-533x800.jpeg" },
    { name: "Youngjae", stageName: "Youngjae", groupName: "TWS", birthDate: "2005-05-31", zodiacSign: "双子座", nationality: "韩国", agency: "PLEDIS", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/Youngjae-533x800.jpeg" },
    { name: "Hanjin", stageName: "Hanjin", groupName: "TWS", birthDate: "2006-01-05", zodiacSign: "摩羯座", nationality: "中国", agency: "PLEDIS", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/Hanjin-533x800.jpeg" },
    { name: "Jihoon", stageName: "Jihoon", groupName: "TWS", birthDate: "2006-03-28", zodiacSign: "白羊座", nationality: "韩国", agency: "PLEDIS", position: "主Rapper", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/Jihoon-533x800.jpeg" },
    { name: "Kyungmin", stageName: "Kyungmin", groupName: "TWS", birthDate: "2007-10-02", zodiacSign: "天秤座", nationality: "韩国", agency: "PLEDIS", position: "忙内", avatar: "https://kprofiles.com/wp-content/uploads/2023/12/Kyungmin-533x800.jpeg" },
  ],
  "katseye": [
    { name: "Manon", stageName: "Manon", groupName: "KATSEYE", birthDate: "2002-12-01", zodiacSign: "射手座", nationality: "瑞士", agency: "HYBE x Geffen", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Manon-533x800.jpg" },
    { name: "Sophia", stageName: "Sophia", groupName: "KATSEYE", birthDate: "2004-11-31", zodiacSign: "射手座", nationality: "菲律宾", agency: "HYBE x Geffen", position: "门面", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Sophia-533x800.jpg" },
    { name: "Daniela", stageName: "Daniela", groupName: "KATSEYE", birthDate: "2005-08-08", zodiacSign: "狮子座", nationality: "美国", agency: "HYBE x Geffen", position: "主舞", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Daniela-533x800.jpg" },
    { name: "Lara", stageName: "Lara", groupName: "KATSEYE", birthDate: "2005-11-18", zodiacSign: "天蝎座", nationality: "美国", agency: "HYBE x Geffen", position: "主唱", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Lara-533x800.jpg" },
    { name: "Megan", stageName: "Megan", groupName: "KATSEYE", birthDate: "2006-02-10", zodiacSign: "水瓶座", nationality: "美国", agency: "HYBE x Geffen", position: "主Rapper", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Megan-533x800.jpg" },
    { name: "Yoonchae", stageName: "Yoonchae", groupName: "KATSEYE", birthDate: "2007-04-06", zodiacSign: "白羊座", nationality: "韩国", agency: "HYBE x Geffen", position: "忙内", avatar: "https://kprofiles.com/wp-content/uploads/2023/11/Yoonchae-533x800.jpg" },
  ],
};

export async function crawlIdols(source: string = "all"): Promise<{
  found: number;
  added: number;
  updated: number;
  errors: string[];
}> {
  const db = getDb();
  const errors: string[] = [];
  let totalFound = 0;
  let totalAdded = 0;
  let totalUpdated = 0;

  // Create crawl log entry
  const [logEntry] = await db.insert(idolCrawlLogs).values({
    source: source === "all" ? "kprofile-batch" : source,
    status: "running" as const,
  }).$returningId();

  const datasets = source === "all" ? Object.values(CRAWL_DATASETS).flat() : (CRAWL_DATASETS[source] || []);

  for (const idol of datasets) {
    try {
      totalFound++;

      // Check if already exists
      const existing = await db.select().from(artists)
        .where(eq(artists.name, idol.name))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db.update(artists).set({
          stageName: idol.stageName,
          groupName: idol.groupName,
          birthDate: new Date(idol.birthDate),
          zodiacSign: idol.zodiacSign,
          nationality: idol.nationality,
          agency: idol.agency,
          position: idol.position,
          avatar: idol.avatar,
          updatedAt: new Date(),
        } as any).where(eq(artists.id, existing[0].id));
        totalUpdated++;
      } else {
        // Insert new
        await db.insert(artists).values({
          name: idol.name,
          stageName: idol.stageName,
          groupName: idol.groupName,
          birthDate: new Date(idol.birthDate),
          zodiacSign: idol.zodiacSign,
          nationality: idol.nationality,
          agency: idol.agency,
          position: idol.position,
          avatar: idol.avatar,
          isActive: true,
        } as any);
        totalAdded++;
      }

      // Rate limiting - 100ms delay between operations
      await new Promise(r => setTimeout(r, 100));
    } catch (e: any) {
      errors.push(`${idol.name}: ${e.message}`);
    }
  }

  // Update log
  const logId = Array.isArray(logEntry) ? logEntry[0] : logEntry;
  await db.update(idolCrawlLogs).set({
    idolsFound: totalFound,
    idolsAdded: totalAdded,
    idolsUpdated: totalUpdated,
    status: (errors.length === 0 ? "success" : errors.length < totalFound / 2 ? "partial" : "failed") as any,
    errorMessage: errors.length > 0 ? errors.join("; ") : null,
    finishedAt: new Date(),
  }).where(eq(idolCrawlLogs.id, logId as any));

  return { found: totalFound, added: totalAdded, updated: totalUpdated, errors };
}

// Get crawl status
export async function getCrawlStatus() {
  const db = getDb();
  const logs = await db.select().from(idolCrawlLogs).orderBy(idolCrawlLogs.startedAt);
  return logs;
}
