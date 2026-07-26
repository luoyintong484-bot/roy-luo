import { describe, expect, it } from "vitest";
import {
  BRANCHES,
  FOUR_TRANSFORMATIONS,
  MAIN_STARS,
  PALACE_NAMES,
  STEMS,
  buildZiweiChart,
  buildZiweiSynastry,
  validateZiweiRuleTables,
} from "../src/lib/ziwei-doushu";
import {
  ZIWEI_REPORT_FIELD_MAP,
  buildZiweiNatalReport,
  buildZiweiSynastryReport,
} from "../src/lib/ziwei-report-templates";
import { calculateTrueSolarTime } from "../src/lib/astrology/true-solar-time";

const sensitiveWords = ["算命", "改命", "注定", "必发", "必婚", "必定发财", "一定离婚"];

describe("Ziwei Doushu rule tables", () => {
  it("keeps core rule tables structurally complete", () => {
    expect(PALACE_NAMES).toHaveLength(12);
    expect(BRANCHES).toHaveLength(12);
    expect(STEMS).toHaveLength(10);
    expect(MAIN_STARS).toHaveLength(14);
    expect(FOUR_TRANSFORMATIONS).toEqual(["化禄", "化权", "化科", "化忌"]);
    expect(validateZiweiRuleTables()).toEqual([]);
  });

  it("builds a traceable natal chart with all 12 palaces and four transformations", () => {
    const chart = buildZiweiChart({
      name: "校验样本A",
      birthDate: "1995-03-15",
      birthTime: "14:30",
      longitude: 121.47,
      calendarType: "solar",
    });

    expect(chart.palaces).toHaveLength(12);
    expect(chart.palaces.map((palace) => palace.name)).toEqual([...PALACE_NAMES]);
    expect(chart.palaces.flatMap((palace) => palace.four)).toHaveLength(4);
    expect(chart.timeTrace.join(" ")).toContain("真太阳时");
    expect(chart.summary).toContain(chart.mainStar);
    expect(chart.calculationMeta.features.timeCalibration.calculationAvailable).toBe(true);
    expect(chart.calculationMeta.features.palaceStemFlyingTransformations.calculationAvailable).toBe(false);
    expect(chart.calculationMeta.features.annualTransformations.calculationAvailable).toBe(false);
  });

  it("flags late Zi hour and early Zi hour separately", () => {
    const lateZi = buildZiweiChart({ birthDate: "2000-01-01", birthTime: "23:30" });
    const earlyZi = buildZiweiChart({ birthDate: "2000-01-02", birthTime: "00:30" });

    expect(lateZi.timeTrace.join(" ")).toContain("夜子时");
    expect(earlyZi.timeTrace.join(" ")).toContain("早子时");
  });

  it("uses each birth city's timezone meridian for true solar time", () => {
    const shanghai = calculateTrueSolarTime({ birthDate: "2000-06-01", birthTime: "12:00", city: "上海", country: "中国" });
    const newYork = calculateTrueSolarTime({ birthDate: "2000-06-01", birthTime: "12:00", city: "New York", country: "United States" });

    expect(Math.abs(shanghai.longitudeDeltaMinutes)).toBeLessThan(10);
    expect(Math.abs(newYork.longitudeDeltaMinutes)).toBeLessThan(60);
    expect(newYork.trace.join(" ")).toContain("UTC-4");
  });
});

describe("Ziwei report templates", () => {
  it("maps every natal report section to chart data without empty content", () => {
    const chart = buildZiweiChart({ name: "校验样本B", birthDate: "1988-08-08", birthTime: "08:08" });
    const report = buildZiweiNatalReport(chart);
    const combined = report.flatMap((section) => [section.title, section.subtitle, section.highlight, ...section.body]).join("\n");

    expect(report.length).toBeGreaterThanOrEqual(8);
    expect(ZIWEI_REPORT_FIELD_MAP.natal.core.length).toBeGreaterThan(0);
    expect(combined).toContain("命宫");
    expect(combined).toContain("四化");
    expect(combined).toContain("排盘依据与计算范围");
    expect(combined).toContain("未计算的飞化、流年与流月不会由文案自行补推");
    sensitiveWords.forEach((word) => expect(combined).not.toContain(word));
  });

  it("maps synastry report sections to both charts and the relationship result", () => {
    const chartA = buildZiweiChart({ name: "A", birthDate: "1992-02-12", birthTime: "06:20" });
    const chartB = buildZiweiChart({ name: "B", birthDate: "1994-11-22", birthTime: "21:45" });
    const synastry = buildZiweiSynastry(chartA, chartB);
    const report = buildZiweiSynastryReport(chartA, chartB, synastry);
    const combined = report.flatMap((section) => [section.title, section.subtitle, section.highlight, ...section.body]).join("\n");

    expect(report.length).toBeGreaterThanOrEqual(7);
    expect(combined).toContain("A");
    expect(combined).toContain("B");
    expect(combined).toContain(String(synastry.score));
    expect(combined).toContain("不声称某一方的四化“飞入”对方某宫");
    sensitiveWords.forEach((word) => expect(combined).not.toContain(word));
  });
});
