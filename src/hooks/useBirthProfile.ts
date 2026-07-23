import { useState, useCallback, useEffect } from "react";

// ============================================================
// Shared birth profile — auto-save + auto-fill across all
// pages that need birth info (Destiny, Synastry, IdolMatch).
// ============================================================

const STORAGE_KEY = "r7_birth_profile";

export interface BirthProfile {
  name: string;
  gender: "male" | "female" | "";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  birthPlace: string;
  timezone: string;
  /** Computed fields */
  baziDayPillar: string;
  starMansion: string;
  zodiacSign: string;
}

const EMPTY_PROFILE: BirthProfile = {
  name: "",
  gender: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  birthHour: "",
  birthMinute: "",
  birthPlace: "",
  timezone: "",
  baziDayPillar: "",
  starMansion: "",
  zodiacSign: "",
};

function loadProfile(): BirthProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = { ...EMPTY_PROFILE, ...JSON.parse(raw) };
      const derived = computeDerivedFields(loaded.birthYear, loaded.birthMonth, loaded.birthDay);
      if (derived.baziDayPillar) {
        return { ...loaded, ...derived };
      }
      return loaded;
    }
  } catch {}
  return { ...EMPTY_PROFILE };
}

function saveProfile(profile: BirthProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

// ---- Bazi Day Pillar from birth date (simplified) ----
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIAC_SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
];
const MANSIONS = [
  "角宿", "亢宿", "氐宿", "房宿", "心宿", "尾宿", "箕宿",
  "斗宿", "牛宿", "女宿", "虚宿", "危宿", "室宿", "壁宿",
  "奎宿", "娄宿", "胃宿", "昴宿", "毕宿", "觜宿", "参宿",
  "井宿", "鬼宿", "柳宿", "星宿", "张宿", "翼宿", "轸宿",
];

function isValidDate(year: number, month: number, day: number): boolean {
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  return (
    targetDate.getUTCFullYear() === year &&
    targetDate.getUTCMonth() === month - 1 &&
    targetDate.getUTCDate() === day
  );
}

function computeBaziDayPillar(year: number, month: number, day: number): string {
  if (!isValidDate(year, month, day)) return "";

  // 1900-01-01 is a Jia-Xu day. Use UTC noon-neutral dates so browser timezone
  // differences do not shift the day pillar for users outside China.
  const refDate = new Date(Date.UTC(1900, 0, 1));
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const diffDays = Math.floor((targetDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleIdx = ((10 + diffDays) % 60 + 60) % 60;
  return HEAVENLY_STEMS[cycleIdx % 10] + EARTHLY_BRANCHES[cycleIdx % 12];
}

function computeZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return ZODIAC_SIGNS[2];
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return ZODIAC_SIGNS[6];
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return ZODIAC_SIGNS[7];
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11];
}

function computeStarMansion(baziDayPillar: string): string {
  if (!baziDayPillar || baziDayPillar.length < 2) return MANSIONS[0];
  const stem = baziDayPillar[0];
  const branch = baziDayPillar[1];
  const sIdx = HEAVENLY_STEMS.indexOf(stem);
  const bIdx = EARTHLY_BRANCHES.indexOf(branch);
  if (sIdx < 0 || bIdx < 0) return MANSIONS[0];
  const mansionIdx = (sIdx * 12 + bIdx) % 28;
  return MANSIONS[mansionIdx];
}

/** Compute all derived fields from raw birth data */
export function computeDerivedFields(
  birthYear: string,
  birthMonth: string,
  birthDay: string
): { baziDayPillar: string; starMansion: string; zodiacSign: string } {
  const y = parseInt(birthYear);
  const m = parseInt(birthMonth);
  const d = parseInt(birthDay);
  if (!y || !m || !d || !isValidDate(y, m, d)) return { baziDayPillar: "", starMansion: "", zodiacSign: "" };
  const baziDayPillar = computeBaziDayPillar(y, m, d);
  const starMansion = computeStarMansion(baziDayPillar);
  const zodiacSign = computeZodiacSign(m, d);
  return { baziDayPillar, starMansion, zodiacSign };
}

// ============================================================
// HOOK
// ============================================================
export function useBirthProfile() {
  const [profile, setProfile] = useState<BirthProfile>(loadProfile);

  // Reload from storage on mount (in case another tab changed it)
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const updateProfile = useCallback((partial: Partial<BirthProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };

      // Auto-compute derived fields when date changes
      if (partial.birthYear || partial.birthMonth || partial.birthDay) {
        const y = parseInt(next.birthYear || partial.birthYear || prev.birthYear);
        const m = parseInt(next.birthMonth || partial.birthMonth || prev.birthMonth);
        const d = parseInt(next.birthDay || partial.birthDay || prev.birthDay);
        if (y && m && d) {
          const derived = computeDerivedFields(String(y), String(m), String(d));
          next.baziDayPillar = derived.baziDayPillar;
          next.starMansion = derived.starMansion;
          next.zodiacSign = derived.zodiacSign;
        }
      }

      saveProfile(next);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    const empty = { ...EMPTY_PROFILE };
    setProfile(empty);
    saveProfile(empty);
  }, []);

  const hasProfile = !!(profile.birthYear && profile.birthMonth && profile.birthDay);

  return {
    profile,
    hasProfile,
    updateProfile,
    clearProfile,
    /** Derived fields for compatibility calculations */
    baziDayPillar: profile.baziDayPillar,
    starMansion: profile.starMansion,
    zodiacSign: profile.zodiacSign,
  };
}
