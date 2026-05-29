import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const paymentRouter = createRouter({
  create: authedQuery
    .input(z.object({
      type: z.enum(["reading", "membership"]),
      amount: z.number().positive(),
      readingId: z.number().int().positive().optional(),
      description: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(payments).values({
        userId: ctx.user.id,
        readingId: input.readingId,
        type: input.type,
        amount: String(input.amount),
        description: input.description,
      }).$returningId();
      return { id: result[0]?.id ?? 0, status: "pending" };
    }),

  complete: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(payments)
        .set({ status: "completed" })
        .where(eq(payments.id, input.id));
      return { success: true };
    }),

  list: authedQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const offset = ((input?.page ?? 1) - 1) * (input?.limit ?? 20);
      return db.select().from(payments)
        .where(eq(payments.userId, ctx.user.id))
        .orderBy(desc(payments.createdAt))
        .limit(input?.limit ?? 20)
        .offset(offset);
    }),

  getById: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(payments)
        .where(eq(payments.id, input.id))
        .limit(1);
      const payment = result[0];
      if (!payment || payment.userId !== ctx.user.id) return null;
      return payment;
    }),
});
