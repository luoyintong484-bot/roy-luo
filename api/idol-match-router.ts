/* ============================================================
   R7 Fortune — Idol Match API Router
   Endpoint: idolMatch.getMatches
   Server-side match score calculation using idol-match-engine.
   ============================================================ */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { calculateMatchScore, getBaziDayPillar, getZodiacSign, getDayStemElement, getNayinElement } from "../src/lib/idol-match-engine";
import { getDb } from "./queries/connection";
import { artists } from "@db/schema";
import { eq } from "drizzle-orm";

export const idolMatchRouter = createRouter({
  /**
   * Get matched idol list with dynamic match scores.
   * Input: user birthday + optional filters
   * Output: sorted idol list with matchScore, matchLevel, sub-scores
   */
  getMatches: publicQuery
    .input(
      z.object({
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
        gender: z.enum(["male", "female"]).optional(),
        groupName: z.string().optional(),
        limit: z.number().min(1).max(50).default(30),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Fetch all artists (filtered by groupName if provided)
      const where = input.groupName ? eq(artists.groupName, input.groupName) : undefined;
      const allArtists = await db.select().from(artists).where(where).limit(input.limit);

      // Calculate match score for each artist
      const scored = allArtists.map((artist: any) => {
        if (!artist.birthDate) return null;

        const result = calculateMatchScore({
          userBirthDate: input.birthDate,
          artistBirthDate: artist.birthDate,
          artistDayPillar: artist.baziDayPillar || undefined,
          artistZodiacSign: artist.zodiacSign || undefined,
          artistStarMansion: artist.starMansion || undefined,
        });

        return {
          id: artist.id,
          name: artist.name,
          stageName: artist.stageName,
          groupName: artist.groupName,
          region: artist.region,
          gender: artist.gender,
          zodiacSign: artist.zodiacSign,
          baziDayPillar: artist.baziDayPillar,
          starMansion: artist.starMansion,
          element: artist.element,
          avatar: artist.avatar,
          matchScore: result.totalScore,
          matchLevel: result.matchLevel,
          // Sub-scores for future expansion
          fiveElementsScore: result.fiveElementsScore,
          zodiacScore: result.zodiacScore,
          constellationScore: result.constellationScore,
          nayinScore: result.nayinScore,
          // Details for debug / deep view
          matchDetails: result.details,
        };
      }).filter(Boolean);

      // Sort by matchScore descending
      scored.sort((a: any, b: any) => b.matchScore - a.matchScore);

      // Add rank
      const ranked = scored.map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
      }));

      return {
        data: ranked,
        total: ranked.length,
        userBirthDate: input.birthDate,
      };
    }),

  /**
   * Calculate single match score between a user and a specific artist.
   * Used for deep-dive compatibility pages.
   */
  getSingleMatch: publicQuery
    .input(
      z.object({
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        artistId: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const artist = await db.select().from(artists).where(eq(artists.id, input.artistId)).limit(1);
      if (!artist[0]) return null;

      const a = artist[0] as any;
      const result = calculateMatchScore({
        userBirthDate: input.birthDate,
        artistBirthDate: a.birthDate,
        artistDayPillar: a.baziDayPillar || undefined,
        artistZodiacSign: a.zodiacSign || undefined,
        artistStarMansion: a.starMansion || undefined,
      });

      return {
        artistId: a.id,
        stageName: a.stageName,
        matchScore: result.totalScore,
        matchLevel: result.matchLevel,
        fiveElementsScore: result.fiveElementsScore,
        zodiacScore: result.zodiacScore,
        constellationScore: result.constellationScore,
        nayinScore: result.nayinScore,
        matchDetails: result.details,
      };
    }),
});
