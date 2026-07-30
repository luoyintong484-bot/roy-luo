/* ============================================================
   R7 Fortune — Unlocked Report History
   A single per-device (localStorage) store of reports the visitor
   has paid for / unlocked, so they can revisit them later from a
   "My Reports" page without re-entering birth data or re-paying.
   ============================================================ */

import { getArtistById, getArtistDisplayName } from "@/data/artists";

export interface ReportHistoryItem {
  reportKey: string;
  reportType: string;
  titleZh: string;
  title: string;
  route: string;
  unlockedAt: string;
  expiresAt: string;
  icon: string;
  summary?: string;
}

const HISTORY_KEY = "r7_report_history";
const UNLOCKED_KEY = "r7_unlocked_reports";
const DEFAULT_UNLOCK_DAYS = 30;

type UnlockRecord = boolean | { unlockedAt: string; expiresAt: string };

/** Resolve a human title + deep-link route from a reportKey. */
function resolveMeta(
  reportKey: string,
  reportType: string,
  route?: string,
): { titleZh: string; title: string; route: string; icon: string } {
  const idolMatch = reportKey.match(/^idol_guide_(.+)$/);
  if (idolMatch) {
    const aid = idolMatch[1];
    let name = "";
    try {
      const a = getArtistById(Number(aid));
      if (a) name = getArtistDisplayName(a, "zh-TW");
    } catch {
      /* artist lookup is best-effort */
    }
    return {
      titleZh: name ? `${name} 追星指引` : "追星指引報告",
      title: name ? `${name} Fan Guidance` : "Fan Guidance Report",
      route: route || `/idol-guide?artist=${aid}`,
      icon: "🌟",
    };
  }

  switch (reportKey) {
    case "natal_full_report":
      return {
        titleZh: "紫微斗數個人完整解析",
        title: "Ziwei Natal Report",
        route: route || "/destiny-full-report",
        icon: "🔮",
      };
    case "synastry_full_report":
      return {
        titleZh: "紫微斗數雙人合盤",
        title: "Ziwei Synastry Report",
        route: route || "/synastry-full-report",
        icon: "💞",
      };
    case "wellness_personality_blueprint":
      return {
        titleZh: "人格模式藍圖",
        title: "Personality Blueprint",
        route: route || "/wellness/self-discovery",
        icon: "🌿",
      };
    case "wellness_relationship_dynamics":
      return {
        titleZh: "關係動力分析",
        title: "Relationship Dynamics",
        route: route || "/wellness/relationship",
        icon: "🌿",
      };
    default: {
      const ziwei = reportKey.match(/^ziwei_dual_(.+)$/);
      if (ziwei) {
        return {
          titleZh: "紫微塔羅雙牌解讀",
          title: "Ziwei-Tarot Reading",
          route: route || "/ziwei-tarot",
          icon: "🌗",
        };
      }
      return {
        titleZh: "完整版報告",
        title: "Full Report",
        route: route || "/",
        icon: "📄",
      };
    }
  }
}

function deriveReportType(reportKey: string): string {
  if (reportKey.startsWith("idol_guide_")) return "idolGuide";
  if (reportKey === "natal_full_report") return "natal";
  if (reportKey === "synastry_full_report") return "synastry";
  if (reportKey.startsWith("wellness_")) return "wellness";
  if (reportKey.startsWith("ziwei_dual_")) return "ziweiTarot";
  if (reportKey === "vip_monthly") return "vip";
  return "report";
}

/** Record (or refresh) a report in the history store. Dedupes by reportKey. */
export function addReportHistory(input: {
  reportKey: string;
  reportType: string;
  route?: string;
  summary?: string;
}): void {
  try {
    const meta = resolveMeta(input.reportKey, input.reportType, input.route);
    const list: ReportHistoryItem[] = getReportHistory();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEFAULT_UNLOCK_DAYS * 86400000).toISOString();
    const existing = list.find((i) => i.reportKey === input.reportKey);
    const item: ReportHistoryItem = {
      reportKey: input.reportKey,
      reportType: input.reportType,
      titleZh: meta.titleZh,
      title: meta.title,
      route: meta.route,
      icon: meta.icon,
      summary: input.summary || existing?.summary,
      unlockedAt: existing?.unlockedAt || now.toISOString(),
      expiresAt,
    };
    const filtered = list.filter((i) => i.reportKey !== input.reportKey);
    filtered.push(item);
    filtered.sort(
      (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch {
    /* private mode / quota — history is best-effort */
  }
}

export function getReportHistory(): ReportHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function removeReportHistory(reportKey: string): void {
  try {
    const list = getReportHistory().filter((i) => i.reportKey !== reportKey);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Merge explicit history entries with already-unlocked reports that were
 * never recorded (e.g. unlocked before this feature existed). This guarantees
 * a visitor can always re-open a report they have paid for.
 */
export function getMergedReportHistory(): ReportHistoryItem[] {
  const byKey = new Map<string, ReportHistoryItem>();
  for (const h of getReportHistory()) byKey.set(h.reportKey, h);

  try {
    const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "{}") as Record<
      string,
      UnlockRecord
    >;
    for (const key of Object.keys(unlocked)) {
      if (byKey.has(key)) continue;
      const reportType = deriveReportType(key);
      const meta = resolveMeta(key, reportType);
      const nowIso = new Date().toISOString();
      byKey.set(key, {
        reportKey: key,
        reportType,
        titleZh: meta.titleZh,
        title: meta.title,
        route: meta.route,
        icon: meta.icon,
        unlockedAt: nowIso,
        expiresAt: new Date(Date.now() + DEFAULT_UNLOCK_DAYS * 86400000).toISOString(),
      });
    }
  } catch {
    /* ignore */
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
  );
}
