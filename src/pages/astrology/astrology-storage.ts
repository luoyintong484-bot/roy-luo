import { buildZiweiChart, buildZiweiSynastry, type ZiweiBirthInput, type ZiweiChart, type ZiweiSynastry } from "@/lib/ziwei-doushu";
import { calculateTrueSolarTime, type TrueSolarTimeResult } from "@/lib/astrology/true-solar-time";
import { buildRetroVerificationItems, type RetroVerificationItem } from "@/lib/astrology/retro-verification";

export type AstrologyBirthRecord = {
  id: string;
  input: ZiweiBirthInput & { country?: string; city?: string; calendar?: "solar" | "lunar" };
  trueSolar: TrueSolarTimeResult;
  chart: ZiweiChart;
  verification: RetroVerificationItem[];
  verificationChoice?: "match" | "unsure" | "mismatch";
  createdAt: string;
};

export type AstrologySynastryRecord = {
  id: string;
  personA: AstrologyBirthRecord;
  personB: AstrologyBirthRecord;
  result: ZiweiSynastry;
  verificationChoice?: "match" | "unsure" | "mismatch";
  createdAt: string;
};

export function createBirthRecord(input: AstrologyBirthRecord["input"]): AstrologyBirthRecord {
  const trueSolar = calculateTrueSolarTime({
    birthDate: input.birthDate || "",
    birthTime: input.birthTime,
    city: input.city,
    country: input.country,
    longitude: input.longitude,
  });
  const chart = buildZiweiChart({
    ...input,
    birthDate: trueSolar.date,
    birthTime: trueSolar.trueSolarTime,
    // `calculateTrueSolarTime` has already applied longitude/equation-of-time.
    // Do not pass longitude into the chart engine again or the offset is doubled.
    longitude: undefined,
    calendarType: input.calendar || input.calendarType || "solar",
  });
  chart.trueSolarTime = trueSolar.trueSolarTime;
  chart.timeTrace = [...trueSolar.trace, ...trueSolar.warnings];
  chart.birthLabel = `${input.birthDate || trueSolar.date} ${trueSolar.inputTime} / 真太阳时 ${trueSolar.trueSolarTime}`;
  chart.calculationMeta.features.timeCalibration = {
    calculationAvailable: true,
    calculationSource: "rule-engine",
    confidenceLevel: trueSolar.warnings.length ? "medium" : "high",
    note: trueSolar.trace.join("；") || "已按出生资料完成时间校准",
  };

  return {
    id: `birth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    input,
    trueSolar,
    chart,
    verification: buildRetroVerificationItems(chart),
    createdAt: new Date().toISOString(),
  };
}

export function saveBirthRecord(record: AstrologyBirthRecord) {
  localStorage.setItem(`r7_astrology_birth_${record.id}`, JSON.stringify(record));
}

export function loadBirthRecord(id?: string): AstrologyBirthRecord | null {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(`r7_astrology_birth_${id}`);
    if (!raw) return null;
    const record = JSON.parse(raw) as AstrologyBirthRecord;
    if (!record.chart?.calculationMeta && record.input) {
      const migrated = createBirthRecord(record.input);
      const upgraded = {
        ...migrated,
        id: record.id,
        verificationChoice: record.verificationChoice,
        createdAt: record.createdAt || migrated.createdAt,
      };
      saveBirthRecord(upgraded);
      return upgraded;
    }
    return record;
  } catch {
    return null;
  }
}

export function createSynastryRecord(aInput: AstrologyBirthRecord["input"], bInput: AstrologyBirthRecord["input"]): AstrologySynastryRecord {
  const personA = createBirthRecord(aInput);
  const personB = createBirthRecord(bInput);
  const result = buildZiweiSynastry(personA.chart, personB.chart);
  return {
    id: `syn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    personA,
    personB,
    result,
    createdAt: new Date().toISOString(),
  };
}

export function saveSynastryRecord(record: AstrologySynastryRecord) {
  localStorage.setItem(`r7_astrology_synastry_${record.id}`, JSON.stringify(record));
}

export function loadSynastryRecord(id?: string): AstrologySynastryRecord | null {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(`r7_astrology_synastry_${id}`);
    if (!raw) return null;
    const record = JSON.parse(raw) as AstrologySynastryRecord;
    if ((!record.personA?.chart?.calculationMeta || !record.personB?.chart?.calculationMeta) && record.personA?.input && record.personB?.input) {
      const personA = createBirthRecord(record.personA.input);
      const personB = createBirthRecord(record.personB.input);
      personA.id = record.personA.id;
      personB.id = record.personB.id;
      const upgraded: AstrologySynastryRecord = {
        ...record,
        personA,
        personB,
        result: buildZiweiSynastry(personA.chart, personB.chart),
      };
      saveSynastryRecord(upgraded);
      return upgraded;
    }
    return record;
  } catch {
    return null;
  }
}
