import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const PAYMENTS_COMING_SOON = true;

export const paymentRouter = createRouter({
  create: authedQuery
    .input(z.object({
      type: z.enum(["reading", "membership"]),
      amount: z.number().positive(),
      readingId: z.number().int().positive().optional(),
      description: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (PAYMENTS_COMING_SOON) {
        return { id: 0, status: "coming_soon" };
      }

      const db = getDb();
      const [result] = await db.insert(payments).values({
        userId: ctx.user.id,
        readingId: input.readingId,
        type: input.type,
        amount: String(input.amount),
        description: input.description,
      }).$returningId();
      return { id: result?.id ?? 0, status: "pending" };
    }),

  // Payment callback — unlock premium after successful payment
  complete: authedQuery
    .input(z.object({
      id: z.number().int().positive(),
      reportType: z.enum(["tarot", "synastry", "natal", "cp", "idol"]).optional(),
    }))
    .mutation(async () => {
      // A browser-authenticated mutation is never a trusted payment callback.
      // Provider notifications are verified only by /payment/notify.
      return { success: false, isPremium: false, message: "Provider callback verification required" };
    }),

  // Webhook endpoint for 3rd-party payment callback
  paymentWebhook: authedQuery
    .input(z.object({
      orderId: z.string(),
      amount: z.number().positive(),
      status: z.enum(["completed", "failed"]),
    }))
    .mutation(async () => {
      // Kept only for API compatibility. Never trust provider status supplied
      // by the browser; the signed Alipay notification is the sole authority.
      return { success: false, message: "Provider callback verification required" };
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
