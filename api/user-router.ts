import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, userProfiles, payments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const userRouter = createRouter({
  getProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userResult = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const user = userResult[0];
    const profileResult = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return { user, profile: profileResult[0] ?? null };
  }),

  updateProfile: authedQuery
    .input(z.object({
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      birthPlace: z.string().max(100).optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(userProfiles).set({
          birthDate: new Date(input.birthDate),
          birthTime: input.birthTime,
          birthPlace: input.birthPlace,
          gender: input.gender,
        }).where(eq(userProfiles.id, existing[0].id));
      } else {
        await db.insert(userProfiles).values({
          userId: ctx.user.id,
          birthDate: new Date(input.birthDate),
          birthTime: input.birthTime,
          birthPlace: input.birthPlace,
          gender: input.gender,
        });
      }
      return { success: true };
    }),

  getWallet: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const paymentList = await db.select().from(payments)
      .where(eq(payments.userId, ctx.user.id))
      .orderBy(desc(payments.createdAt))
      .limit(50);

    const totalSpent = paymentList
      .filter((p: { status: string }) => p.status === "completed")
      .reduce((sum: number, p: { amount: string | number }) => sum + parseFloat(String(p.amount)), 0);

    return {
      totalSpent,
      paymentCount: paymentList.length,
      payments: paymentList,
    };
  }),

  updateSettings: authedQuery
    .input(z.object({
      language: z.enum(["zh", "en"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users).set({
        language: input.language,
      }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
