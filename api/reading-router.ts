import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { readings, readingUnlocks, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const readingRouter = createRouter({
  // Check remaining free readings + premium status
  getFreeCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      freeReadings: users.freeReadings,
      divinationCount: users.divinationCount,
      isPremium: users.isPremium,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    return {
      freeReadings: u?.freeReadings ?? 0,
      divinationCount: u?.divinationCount ?? 0,
      isPremium: u?.isPremium ?? false,
      canAccess: (u?.isPremium === true) || ((u?.freeReadings ?? 0) > 0),
    };
  }),

  // Use one free reading
  useFree: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      freeReadings: users.freeReadings,
      isPremium: users.isPremium,
      divinationCount: users.divinationCount,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    if (!u) throw new Error("User not found");

    // Premium users always pass
    if (u.isPremium) {
      await db.update(users).set({ divinationCount: (u.divinationCount ?? 0) + 1 }).where(eq(users.id, ctx.user.id));
      return { remaining: -1, divinationCount: (u.divinationCount ?? 0) + 1, isPremium: true };
    }

    // Free user: enforce limit
    const current = u.freeReadings ?? 0;
    if (current <= 0) {
      throw new Error("FREE_LIMIT_REACHED"); // Special error code for frontend
    }
    await db.update(users).set({
      freeReadings: current - 1,
      divinationCount: (u.divinationCount ?? 0) + 1,
    }).where(eq(users.id, ctx.user.id));
    return { remaining: current - 1, divinationCount: (u.divinationCount ?? 0) + 1, isPremium: false };
  }),

  create: authedQuery
    .input(z.object({
      type: z.enum(["tarot", "natal_chart", "synastry", "annual_fortune", "itinerary_energy", "fan_artist_compatibility"]),
      subtype: z.string().optional(),
      title: z.string().min(1).max(200),
      question: z.string().max(1000).optional(),
      inputData: z.record(z.string(), z.any()).optional(),
      price: z.number().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Fetch fresh user data from DB (context may be stale)
      const userResult = await db.select({
        freeReadings: users.freeReadings,
        isPremium: users.isPremium,
        divinationCount: users.divinationCount,
      }).from(users).where(eq(users.id, userId)).limit(1);
      const freshUser = userResult[0];
      if (!freshUser) throw new Error("User not found");

      // Enforce free limit: premium users bypass, free users must have remaining readings
      if (input.price === 0) {
        if (!freshUser.isPremium && (freshUser.freeReadings ?? 0) <= 0) {
          throw new Error("FREE_LIMIT_REACHED");
        }
        // Deduct one free reading
        await db.update(users).set({
          freeReadings: Math.max(0, (freshUser.freeReadings ?? 0) - 1),
          divinationCount: (freshUser.divinationCount ?? 0) + 1,
        }).where(eq(users.id, userId));
      } else {
        // Paid reading: just increment count
        await db.update(users).set({
          divinationCount: (freshUser.divinationCount ?? 0) + 1,
        }).where(eq(users.id, userId));
      }

      const result = await db.insert(readings).values({
        userId: user.id,
        type: input.type,
        subtype: input.subtype,
        title: input.title,
        question: input.question,
        inputData: input.inputData ?? {},
        price: String(input.price),
        isPaid: input.price === 0,
      }).$returningId();

      const readingId = result[0]?.id ?? 0;
      return { id: readingId };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(readings).where(eq(readings.id, input.id)).limit(1);
      const reading = result[0];
      if (!reading) return null;

      let canViewFull = false;
      if (ctx.user) {
        const unlockResult = await db.select().from(readingUnlocks)
          .where(and(eq(readingUnlocks.userId, ctx.user.id), eq(readingUnlocks.readingId, input.id)))
          .limit(1);
        canViewFull = unlockResult.length > 0 || reading.isPaid;
      }

      return { ...reading, canViewFull };
    }),

  getSummary: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(readings).where(eq(readings.id, input.id)).limit(1);
      const reading = result[0];
      if (!reading) return null;
      return { id: reading.id, title: reading.title, type: reading.type, resultSummary: reading.resultSummary };
    }),

  getFull: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(readings).where(eq(readings.id, input.id)).limit(1);
      const reading = result[0];
      if (!reading) return null;

      const unlockResult = await db.select().from(readingUnlocks)
        .where(and(eq(readingUnlocks.userId, ctx.user.id), eq(readingUnlocks.readingId, input.id)))
        .limit(1);

      if (!unlockResult.length && !reading.isPaid) {
        throw new Error("Full reading not unlocked");
      }

      return { id: reading.id, resultFull: reading.resultFull };
    }),

  list: authedQuery
    .input(z.object({
      type: z.enum(["tarot", "natal_chart", "synastry", "annual_fortune", "itinerary_energy", "fan_artist_compatibility"]).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(readings.userId, ctx.user.id)];
      if (input?.type) conditions.push(eq(readings.type, input.type));
      const offset = ((input?.page ?? 1) - 1) * (input?.limit ?? 20);
      return db.select().from(readings)
        .where(and(...conditions))
        .orderBy(desc(readings.createdAt))
        .limit(input?.limit ?? 20)
        .offset(offset);
    }),

  unlock: authedQuery
    .input(z.object({ readingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(readingUnlocks).values({
        userId: ctx.user.id,
        readingId: input.readingId,
      });
      await db.update(readings).set({ isPaid: true, paidAt: new Date() }).where(eq(readings.id, input.readingId));
      return { success: true };
    }),

  updateResult: authedQuery
    .input(z.object({
      id: z.number().int().positive(),
      resultSummary: z.string().optional(),
      resultFull: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(readings).set({
        resultSummary: input.resultSummary,
        resultFull: input.resultFull,
      }).where(eq(readings.id, input.id));
      return { success: true };
    }),
});
