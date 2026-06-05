import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { readings, readingUnlocks, users, inviteRecords, guestInviteCache } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const readingRouter = createRouter({
  // Check remaining free readings + premium status
  getFreeCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      freeReadings: users.freeReadings,
      divinationCount: users.divinationCount,
      isPremium: users.isPremium,
      freeDivineTimes: users.freeDivineTimes,
      inviteUnlockTimes: users.inviteUnlockTimes,
      inviteSuccessCount: users.inviteSuccessCount,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    const used = u?.freeDivineTimes ?? 0;
    const extra = u?.inviteUnlockTimes ?? 0;
    const totalDivine = 3 + extra;
    return {
      freeReadings: u?.freeReadings ?? 0,
      divinationCount: u?.divinationCount ?? 0,
      isPremium: u?.isPremium ?? false,
      canAccess: (u?.isPremium === true) || ((u?.freeReadings ?? 0) > 0),
      tarotUsed: used,
      tarotRemaining: Math.max(0, totalDivine - used),
      tarotTotal: totalDivine,
      inviteUnlockTimes: extra,
      inviteSuccessCount: u?.inviteSuccessCount ?? 0,
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

  // ===== Tarot Draw Tracking =====

  // Check available draws (guest: 3 from localStorage; logged-in: 3 free + invite unlocks)
  checkDrawAvailability: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      freeDivineTimes: users.freeDivineTimes,
      inviteUnlockTimes: users.inviteUnlockTimes,
      inviteSuccessCount: users.inviteSuccessCount,
      isPremium: users.isPremium,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    if (!u) throw new Error("User not found");
    const used = u.freeDivineTimes ?? 0;
    const extra = u.inviteUnlockTimes ?? 0;
    const totalAvailable = 3 + extra; // 3 free + invite unlocks
    const remaining = Math.max(0, totalAvailable - used);
    return {
      used,
      extraFromInvites: extra,
      totalAvailable,
      remaining,
      isPremium: u.isPremium ?? false,
      inviteSuccessCount: u.inviteSuccessCount ?? 0,
      invitesNeededForNext: 3 - ((u.inviteSuccessCount ?? 0) % 3),
    };
  }),

  // Consume one draw (logged-in user only)
  useDraw: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      freeDivineTimes: users.freeDivineTimes,
      inviteUnlockTimes: users.inviteUnlockTimes,
      isPremium: users.isPremium,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    if (!u) throw new Error("User not found");
    const used = u.freeDivineTimes ?? 0;
    const extra = u.inviteUnlockTimes ?? 0;
    const total = 3 + extra;
    if (!u.isPremium && used >= total) {
      throw new Error("NO_DRAWS_REMAINING");
    }
    await db.update(users).set({ freeDivineTimes: used + 1 }).where(eq(users.id, ctx.user.id));
    return { used: used + 1, remaining: Math.max(0, total - used - 1) };
  }),

  // ===== Invite System =====

  // Process invite: called when new user registers with a referral code
  // Supports both user-based codes (r7_xxx) and device-based guest codes (inv_guest_xxx)
  processInvite: publicQuery
    .input(z.object({
      inviteCode: z.string().min(1),          // 邀请码
      inviteeUnionId: z.string().optional(),   // 受邀人 unionId
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const code = input.inviteCode;
      const isGuestCode = code.startsWith("inv_guest_");

      // --- Guest device code: increment guest cache ---
      if (isGuestCode) {
        const deviceId = code.replace("inv_", ""); // "inv_guest_xxx" → "guest_xxx"
        const existing = await db.select().from(guestInviteCache).where(eq(guestInviteCache.deviceId, deviceId)).limit(1);
        if (existing[0]) {
          const newCount = (existing[0].successCount ?? 0) + 1;
          const unlocks = Math.floor(newCount / 3);
          await db.update(guestInviteCache).set({
            successCount: newCount,
            updatedAt: new Date(),
          }).where(eq(guestInviteCache.id, existing[0].id));
        } else {
          await db.insert(guestInviteCache).values({
            deviceId,
            successCount: 1,
          });
        }

        // Log invite record
        await db.insert(inviteRecords).values({
          inviterUnionId: deviceId,
          inviteeUnionId: input.inviteeUnionId || null,
          inviteCode: code,
          isGuestCode: true,
          registeredAt: new Date(),
        });

        return { success: true, isGuest: true };
      }

      // --- User-based code (r7_xxx): find referrer by unionId ---
      const referrerUnionId = code.startsWith("r7_") ? code.replace("r7_", "") : code;
      const referrer = await db.select({
        id: users.id,
        unionId: users.unionId,
        inviteSuccessCount: users.inviteSuccessCount,
        inviteUnlockTimes: users.inviteUnlockTimes,
      }).from(users).where(eq(users.unionId, referrerUnionId)).limit(1);

      if (!referrer[0]) return { success: false, reason: "Referrer not found" };
      const u = referrer[0];

      const prevUnlocks = u.inviteUnlockTimes ?? 0;
      const newCount = (u.inviteSuccessCount ?? 0) + 1;
      const newUnlocks = Math.floor(newCount / 3); // every 3 → +1
      const justUnlocked = newUnlocks > prevUnlocks; // this batch crossed a 3-boundary
      const remainder = newCount % 3;

      await db.update(users).set({
        inviteSuccessCount: newCount,
        inviteUnlockTimes: newUnlocks,
      }).where(eq(users.id, u.id));

      // Log invite record
      await db.insert(inviteRecords).values({
        inviterUnionId: referrerUnionId,
        inviteeUnionId: input.inviteeUnionId || null,
        inviteCode: code,
        isGuestCode: false,
        rewardGranted: justUnlocked,
        registeredAt: new Date(),
      });

      return {
        success: true,
        isGuest: false,
        inviteSuccessCount: newCount,
        inviteUnlockTimes: newUnlocks,
        invitesNeededForNext: 3 - remainder,
        justUnlocked,
      };
    }),

  // Merge guest device invites into user account on login
  mergeGuestInvites: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const deviceId = ctx.user.unionId; // fallback: use user unionId to find device cache
    // Try to find guest cache entries that match the user's potential device codes
    // For simplicity: check if any guest_invite_cache entries exist and merge the first found
    const guestEntries = await db.select().from(guestInviteCache).limit(1);
    if (!guestEntries[0]) return { success: true, merged: 0 };

    const guest = guestEntries[0];
    // Merge guest invite count into user
    const userResult = await db.select({
      inviteSuccessCount: users.inviteSuccessCount,
      inviteUnlockTimes: users.inviteUnlockTimes,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (userResult[0]) {
      const mergedCount = (userResult[0].inviteSuccessCount ?? 0) + (guest.successCount ?? 0);
      const mergedUnlocks = Math.floor(mergedCount / 3);
      await db.update(users).set({
        inviteSuccessCount: mergedCount,
        inviteUnlockTimes: mergedUnlocks,
      }).where(eq(users.id, ctx.user.id));

      // Update invite records to point to the user
      await db.update(inviteRecords).set({
        inviterUnionId: ctx.user.unionId || String(ctx.user.id),
        isGuestCode: false,
      }).where(eq(inviteRecords.inviterUnionId, guest.deviceId));

      // Clean up guest cache
      await db.delete(guestInviteCache).where(eq(guestInviteCache.id, guest.id));
      return { success: true, merged: guest.successCount ?? 0 };
    }
    return { success: false, merged: 0 };
  }),

  // Get invite stats + history
  getInviteStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({
      inviteSuccessCount: users.inviteSuccessCount,
      inviteUnlockTimes: users.inviteUnlockTimes,
      freeDivineTimes: users.freeDivineTimes,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    if (!u) return null;

    // Fetch invite history
    const history = await db.select().from(inviteRecords)
      .where(eq(inviteRecords.inviterUnionId, ctx.user.unionId || String(ctx.user.id)))
      .orderBy(desc(inviteRecords.createdAt))
      .limit(20);

    const used = u.freeDivineTimes ?? 0;
    const extra = u.inviteUnlockTimes ?? 0;
    return {
      inviteSuccessCount: u.inviteSuccessCount ?? 0,
      inviteUnlockTimes: extra,
      usedDraws: used,
      remainingDraws: Math.max(0, 3 + extra - used),
      invitesNeededForNext: 3 - ((u.inviteSuccessCount ?? 0) % 3),
      shareCode: ctx.user.unionId || `r7_${ctx.user.id}`,
      history: history.map(r => ({
        inviteCode: r.inviteCode,
        registeredAt: r.registeredAt,
        rewardGranted: r.rewardGranted,
      })),
    };
  }),
});
