import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";

// Test mock user — used when TEST_AUTH=true for full-chain testing
const MOCK_USER: User = {
  id: 1,
  unionId: "test-union-id",
  name: "R7 Test User",
  avatar: null,
  email: null,
  freeReadings: 3,
  divinationCount: 0,
  isPremium: false,
  freeDivineTimes: 0,
  inviteSuccessCount: 0,
  inviteUnlockTimes: 0,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Test auth bypass — inject mock user for testing without real OAuth
  if (process.env.TEST_AUTH === "true") {
    ctx.user = MOCK_USER;
    return ctx;
  }

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
