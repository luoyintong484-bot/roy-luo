import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { artists, artistSchedules, artistGroups } from "@db/schema";
import { like, or, eq, and, gte, lte, sql } from "drizzle-orm";

export const artistRouter = createRouter({
  // List artists with filters
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        groupName: z.string().optional(),
        groupId: z.number().optional(),
        region: z.string().optional(),
        zodiacSign: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];

      if (input?.search) {
        filters.push(
          or(
            like(artists.name, `%${input.search}%`),
            like(artists.stageName, `%${input.search}%`),
            like(artists.groupName, `%${input.search}%`)
          )
        );
      }
      if (input?.groupName) {
        filters.push(eq(artists.groupName, input.groupName));
      }
      if (input?.groupId) {
        filters.push(eq(artists.groupId, input.groupId));
      }
      if (input?.zodiacSign) {
        filters.push(eq(artists.zodiacSign, input.zodiacSign));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const limit = input?.limit ?? 20;
      const offset = ((input?.page ?? 1) - 1) * limit;

      const data = await db.select().from(artists).where(where).limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(artists).where(where);
      const total = countResult[0]?.count ?? 0;

      return { data, total, page: input?.page ?? 1, totalPages: Math.ceil(total / limit) };
    }),

  // Search artists
  search: publicQuery
    .input(z.object({ query: z.string().min(1).max(100), limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(artists).where(
        or(
          like(artists.name, `%${input.query}%`),
          like(artists.stageName, `%${input.query}%`),
          like(artists.groupName, `%${input.query}%`)
        )
      ).limit(input.limit);
    }),

  // Get artist by ID
  getById: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(artists).where(eq(artists.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  // Get artist schedules
  getSchedules: publicQuery
    .input(z.object({ artistId: z.number().int().positive(), month: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(artistSchedules.artistId, input.artistId)];
      if (input.month) {
        conditions.push(gte(artistSchedules.eventDate, new Date(`${input.month}-01`)));
        const [year, mon] = input.month.split("-");
        const endDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
        conditions.push(lte(artistSchedules.eventDate, new Date(`${input.month}-${endDay}`)));
      }
      return db.select().from(artistSchedules).where(and(...conditions)).orderBy(artistSchedules.eventDate);
    }),

  // Get all groups with member counts
  getGroups: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      groupName: artists.groupName,
      count: sql<number>`count(*)`,
    }).from(artists).groupBy(artists.groupName);

    return result
      .filter((r): r is { groupName: string; count: number } => r.groupName !== null)
      .map((r) => ({ name: r.groupName, memberCount: r.count }));
  }),

  // Get groups by region (korea/china/japan)
  getGroupsByRegion: publicQuery
    .input(z.object({ region: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const groups = await db.select().from(artistGroups);
      if (input?.region) {
        return groups.filter((g) => g.region === input.region);
      }
      return groups;
    }),

  // Get group details with members
  getGroupDetail: publicQuery
    .input(z.object({ groupId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const group = await db.select().from(artistGroups).where(eq(artistGroups.id, input.groupId)).limit(1);
      const members = await db.select().from(artists).where(eq(artists.groupId, input.groupId));
      return { group: group[0] ?? null, members };
    }),

  // Get group members by group name
  getGroupMembers: publicQuery
    .input(z.object({ groupName: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(artists).where(eq(artists.groupName, input.groupName));
    }),
});
