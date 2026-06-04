/* ============================================================
   R7 Fortune — Synastry AI Router
   API endpoints for AI-powered synastry report generation.
   Uses preprocessing + 6-chapter split to stay under token limits.
   ============================================================ */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { compatibilityResults, artists } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  preprocessCompatibilityData,
  generateRawChartData,
  type PersonData,
} from "./lib/synastry-preprocess";
import {
  generateSynastryReport,
  regenerateChapter,
  CHAPTERS,
} from "./lib/synastry-ai";

// ---- Helpers ----
function getZodiacSign(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "白羊座";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "金牛座";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return "双子座";
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return "巨蟹座";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "狮子座";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "处女座";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) return "天秤座";
  if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) return "天蝎座";
  if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) return "射手座";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "摩羯座";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "水瓶座";
  return "双鱼座";
}

const ZODIAC_ELEMENTS: Record<string, string> = {
  "白羊座":"火","金牛座":"土","双子座":"风","巨蟹座":"水",
  "狮子座":"火","处女座":"土","天秤座":"风","天蝎座":"水",
  "射手座":"火","摩羯座":"土","水瓶座":"风","双鱼座":"水",
};

function getStarMansion(date: Date): string {
  const ms = ["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"];
  const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return ms[doy % 28] + "宿";
}

function getBaziDayPillar(date: Date): string {
  const s = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const b = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const base = new Date(1900, 0, 31);
  const diff = Math.floor((date.getTime() - base.getTime()) / 86400000);
  return s[(diff + 10) % 10] + b[(diff + 12) % 12];
}

function buildPersonData(name: string, birthDate: string, birthTime?: string, birthPlace?: string): PersonData {
  const d = new Date(birthDate);
  const zodiac = getZodiacSign(d);
  return {
    name,
    birthDate,
    birthTime,
    birthPlace,
    zodiacSign: zodiac,
    element: ZODIAC_ELEMENTS[zodiac] || "未知",
    baziDayPillar: getBaziDayPillar(d),
    starMansion: getStarMansion(d),
  };
}

export const synastryAiRouter = createRouter({
  // ===== Generate Full AI Synastry Report =====
  generateReport: publicQuery
    .input(z.object({
      person1: z.object({
        name: z.string().min(1).max(100),
        birthDate: z.string(),  // ISO date
        birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        birthPlace: z.string().max(100).optional(),
      }),
      person2: z.object({
        name: z.string().min(1).max(100),
        birthDate: z.string(),
        birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        birthPlace: z.string().max(100).optional(),
      }),
      locale: z.enum(["zh-TW", "en"]).default("zh-TW"),
    }))
    .mutation(async ({ input }) => {
      // 1. Build person data and compute raw chart (store locally)
      const p1 = buildPersonData(
        input.person1.name, input.person1.birthDate,
        input.person1.birthTime, input.person1.birthPlace
      );
      const p2 = buildPersonData(
        input.person2.name, input.person2.birthDate,
        input.person2.birthTime, input.person2.birthPlace
      );

      // 2. Generate raw chart data (for local DB storage, NOT sent to AI)
      const rawChart1 = generateRawChartData(p1);
      const rawChart2 = generateRawChartData(p2);

      // 3. Preprocess — compute compact conclusions ONLY
      const preprocessed = preprocessCompatibilityData(p1, p2);

      // 4. Generate AI report (6 separate API calls)
      const report = await generateSynastryReport(preprocessed, input.locale);

      // 5. Store raw data + AI report in DB (optional — for later retrieval)
      // Raw chart data stored locally; AI report contains only generated text
      let savedId: number | null = null;
      try {
        const db = getDb();
        const [saved] = await db.insert(compatibilityResults).values({
          userBirthDate: new Date(input.person1.birthDate),
          userBirthTime: input.person1.birthTime || null,
          userBirthPlace: input.person1.birthPlace || null,
          artistId: 0, // placeholder for non-artist synastry
          synastryScore: preprocessed.synastry.score,
          synastryKeywords: preprocessed.synastry.keywords,
          synastryAspects: {
            rawChart1,
            rawChart2,
            aiReport: report,
          } as any,
          userDayPillar: p1.baziDayPillar,
          userElement: p1.element,
          artistElement: p2.element,
          elementScore: preprocessed.bazi.score,
          elementComplement: preprocessed.bazi.complement,
          elementDetails: preprocessed.bazi as any,
          starMansionRelation: preprocessed.starMansion.relation,
          relationTag: preprocessed.overall.tag as any,
          relationLabel: preprocessed.overall.label,
          overallScore: preprocessed.overall.score,
          overallSummary: preprocessed.overall.summary,
          isPaid: false,
        }).$returningId();
        savedId = saved.id ?? null;
      } catch (dbError) {
        console.warn("[synastry-ai] Failed to save to DB (non-fatal):", dbError);
      }

      return {
        report,
        preprocessed,
        savedId,
      };
    }),

  // ===== Generate AI Report for Idol (fan-idol compatibility) =====
  generateIdolReport: publicQuery
    .input(z.object({
      userBirthDate: z.string(),
      userBirthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      userBirthPlace: z.string().max(100).optional(),
      artistId: z.number().int().positive(),
      locale: z.enum(["zh-TW", "en"]).default("zh-TW"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get artist
      const artistRows = await db.select().from(artists).where(eq(artists.id, input.artistId)).limit(1);
      if (!artistRows[0]) throw new Error("Artist not found");
      const artist = artistRows[0];

      // Build person data
      const p1 = buildPersonData(
        "我", input.userBirthDate,
        input.userBirthTime, input.userBirthPlace
      );
      const artistBirthDate = artist.birthDate instanceof Date
        ? artist.birthDate.toISOString()
        : String(artist.birthDate);
      const p2: PersonData = {
        name: artist.stageName || artist.name || "Artist",
        birthDate: artistBirthDate,
        zodiacSign: artist.zodiacSign || getZodiacSign(new Date(artistBirthDate)),
        element: ZODIAC_ELEMENTS[artist.zodiacSign || ""] || "未知",
        baziDayPillar: artist.baziDayPillar || "甲子",
        starMansion: artist.starMansion || "角宿",
      };

      // Preprocess
      const preprocessed = preprocessCompatibilityData(p1, p2);

      // Generate AI report
      const report = await generateSynastryReport(preprocessed, input.locale);

      // Store
      const [saved] = await db.insert(compatibilityResults).values({
        userBirthDate: new Date(input.userBirthDate),
        userBirthTime: input.userBirthTime || null,
        userBirthPlace: input.userBirthPlace || null,
        artistId: input.artistId,
        synastryScore: preprocessed.synastry.score,
        synastryKeywords: preprocessed.synastry.keywords,
        userDayPillar: p1.baziDayPillar,
        userElement: p1.element,
        artistElement: p2.element,
        elementScore: preprocessed.bazi.score,
        elementComplement: preprocessed.bazi.complement,
        elementDetails: preprocessed.bazi as any,
        starMansionRelation: preprocessed.starMansion.relation,
        relationTag: preprocessed.overall.tag as any,
        relationLabel: preprocessed.overall.label,
        overallScore: preprocessed.overall.score,
        overallSummary: preprocessed.overall.summary,
        isPaid: false,
      }).$returningId();

      return {
        report,
        preprocessed,
        savedId: saved.id ?? null,
      };
    }),

  // ===== Regenerate Single Chapter =====
  regenerateChapter: publicQuery
    .input(z.object({
      chapterKey: z.enum([
        "core_attraction", "daily_interaction", "core_conflict",
        "destiny_analysis", "key_cautions", "long_term_advice",
      ]),
      person1: z.object({
        name: z.string().min(1).max(100),
        birthDate: z.string(),
        birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        birthPlace: z.string().max(100).optional(),
      }),
      person2: z.object({
        name: z.string().min(1).max(100),
        birthDate: z.string(),
        birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        birthPlace: z.string().max(100).optional(),
      }),
      locale: z.enum(["zh-TW", "en"]).default("zh-TW"),
    }))
    .mutation(async ({ input }) => {
      const p1 = buildPersonData(
        input.person1.name, input.person1.birthDate,
        input.person1.birthTime, input.person1.birthPlace
      );
      const p2 = buildPersonData(
        input.person2.name, input.person2.birthDate,
        input.person2.birthTime, input.person2.birthPlace
      );

      const preprocessed = preprocessCompatibilityData(p1, p2);
      const chapter = await regenerateChapter(input.chapterKey, preprocessed, input.locale);

      return { chapter };
    }),

  // ===== List Available Chapters =====
  listChapters: publicQuery.query(() => {
    return CHAPTERS.map(c => ({ key: c.key, icon: c.icon, zh: c.zh, en: c.en }));
  }),
});

export type SynastryAiRouter = typeof synastryAiRouter;
