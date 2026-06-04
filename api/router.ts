import { authRouter } from "./auth-router";
import { artistRouter } from "./artist-router";
import { destinyRouter } from "./destiny-router";
import { readingRouter } from "./reading-router";
import { paymentRouter } from "./payment-router";
import { userRouter } from "./user-router";
import { i18nRouter } from "./i18n-router";
import { idolCompatibilityRouter } from "./idol-compatibility-router";
import { synastryAiRouter } from "./synastry-ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  artist: artistRouter,
  destiny: destinyRouter,
  reading: readingRouter,
  payment: paymentRouter,
  user: userRouter,
  i18n: i18nRouter,
  idolCompatibility: idolCompatibilityRouter,
  synastryAi: synastryAiRouter,
});

export type AppRouter = typeof appRouter;
