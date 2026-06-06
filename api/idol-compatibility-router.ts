import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { artists, compatibilityResults } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { calculateCompatibility } from "./lib/compatibility-algo";
import { crawlIdols, getCrawlStatus } from "./lib/idol-crawler";

export const idolCompatibilityRouter = createRouter({
  // ===== Crawler =====
  triggerCrawl: publicQuery
    .input(z.object({ source: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      const result = await crawlIdols(input?.source || "all");
      return result;
    }),

  getCrawlLogs: publicQuery.query(async () => {
    return getCrawlStatus();
  }),

  // ===== Idol List for Compatibility =====
  listIdols: publicQuery
    .input(z.object({
      search: z.string().optional(),
      groupName: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = ((input?.page ?? 1) - 1) * limit;

      let query = db.select().from(artists);
      if (input?.groupName) {
        query = query.where(eq(artists.groupName, input.groupName)) as any;
      }

      const data = await query.limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(artists);
      const groups = await db.select({ groupName: artists.groupName, count: sql<number>`count(*)` })
        .from(artists).groupBy(artists.groupName);

      return {
        data,
        total: countResult[0]?.count ?? 0,
        groups: groups.filter(g => g.groupName),
      };
    }),

  // ===== Calculate Compatibility =====
  calculate: publicQuery
    .input(z.object({
      userBirthDate: z.string(),
      userBirthTime: z.string().optional(),
      userBirthPlace: z.string().optional(),
      userDayPillar: z.string(),
      userStarMansion: z.string(),
      artistId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get artist
      const artistRows = await db.select().from(artists).where(eq(artists.id, input.artistId)).limit(1);
      if (!artistRows[0]) throw new Error("Artist not found");
      const artist = artistRows[0];

      // Calculate
      const result = calculateCompatibility(
        input.userBirthDate,
        String(artist.birthDate),
        input.userBirthTime,
        input.userDayPillar,
        artist.baziDayPillar || "甲子",
        input.userStarMansion,
        artist.starMansion || "角宿",
      );

      // Save result
      const [saved] = await db.insert(compatibilityResults).values({
        userBirthDate: new Date(input.userBirthDate),
        userBirthTime: input.userBirthTime || null,
        userBirthPlace: input.userBirthPlace || null,
        artistId: input.artistId,
        synastryScore: result.synastry.score,
        synastryKeywords: result.synastry.keywords,
        userDayPillar: input.userDayPillar,
        userElement: result.bazi.userElement,
        artistElement: result.bazi.artistElement,
        elementScore: result.bazi.score,
        elementComplement: result.bazi.complement,
        elementDetails: result.bazi.details as any,
        starMansionRelation: result.starMansionRelation,
        relationTag: result.overallTag.tag as any,
        relationLabel: result.overallTag.label,
        overallScore: result.overallScore,
        overallSummary: result.summary,
        isPaid: false,
      }).$returningId();

      return { result, savedId: saved };
    }),

  // ===== Batch Calculate (for listing) =====
  batchCalculate: publicQuery
    .input(z.object({
      userBirthDate: z.string(),
      userBirthTime: z.string().optional(),
      userBirthPlace: z.string().optional(),
      userCountry: z.string().optional(),
      userProvince: z.string().optional(),
      userCity: z.string().optional(),
      userTimezone: z.string().optional(),
      userDayPillar: z.string(),
      userStarMansion: z.string(),
      filterTag: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get all artists
      const allArtists = await db.select().from(artists);

      // Calculate for each
      const results = allArtists.map(artist => {
        const calc = calculateCompatibility(
          input.userBirthDate,
          String(artist.birthDate),
          input.userBirthTime,
          input.userDayPillar,
          artist.baziDayPillar || "甲子",
          input.userStarMansion,
          artist.starMansion || "角宿",
        );

        return {
          artistId: artist.id,
          artistName: artist.stageName || artist.name,
          artistGroup: artist.groupName,
          artistAvatar: artist.avatar,
          artistBirthDate: artist.birthDate,
          artistZodiac: artist.zodiacSign,
          artistElement: calc.bazi.artistElement,
          artistStarMansion: artist.starMansion,
          synastryScore: calc.synastry.score,
          baziScore: calc.bazi.score,
          elementComplement: calc.bazi.complement,
          starMansionRelation: calc.starMansionRelation,
          relationTag: calc.overallTag.tag,
          relationLabel: calc.overallTag.label,
          overallScore: calc.overallScore,
          summary: calc.summary,
          keywords: calc.synastry.keywords,
        };
      });

      // Sort by overall score
      results.sort((a, b) => b.overallScore - a.overallScore);

      // Filter by tag if specified
      let filtered = results;
      if (input.filterTag) {
        filtered = results.filter(r => r.relationTag === input.filterTag);
      }

      return { results: filtered, total: allArtists.length };
    }),

  // ===== Get Saved Result =====
  getResult: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(compatibilityResults).where(eq(compatibilityResults.id, input.id)).limit(1);
      if (!rows[0]) return null;

      // Get artist
      const artistRows = await db.select().from(artists).where(eq(artists.id, rows[0].artistId)).limit(1);

      return { result: rows[0], artist: artistRows[0] || null };
    }),

  // ===== Get User History =====
  getHistory: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(compatibilityResults)
        .where(eq(compatibilityResults.userId, input.userId))
        .orderBy(desc(compatibilityResults.createdAt))
        .limit(50);
    }),
});
