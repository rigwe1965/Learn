import { createHash } from "node:crypto";
import type { RateLimit } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";

export const signInRule = { window: 60, max: 5 };

// Forwarding headers are not authoritative on a directly reachable server.
// Bound guesses per account as well, before any password verification.
export const limitSignInByAccount = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email" || !ctx.context.rateLimit.enabled) return;
  if (typeof ctx.body?.email !== "string") return;

  // Match Better Auth's email lookup normalization, without storing raw emails.
  const key = `sign-in-account:${createHash("sha256").update(ctx.body.email.toLowerCase()).digest("hex")}`;
  const adapter = ctx.context.adapter;
  const where = [{ field: "key", value: key }];
  const windowMs = signInRule.window * 1000;

  for (;;) {
    const row = await adapter.findOne<RateLimit>({ model: "rateLimit", where });
    const now = Date.now();
    if (!row) {
      try {
        await adapter.create({
          model: "rateLimit",
          data: { key, count: 1, lastRequest: now },
        });
        return;
      } catch (error) {
        // The unique key can be claimed by another instance between read and
        // insert. Retry only if it exists; storage failures must fail closed.
        if (!await adapter.findOne({ model: "rateLimit", where })) throw error;
        continue;
      }
    }

    const expired = now - row.lastRequest >= windowMs;
    if (!expired && row.count >= signInRule.max) {
      throw new APIError("TOO_MANY_REQUESTS", {
        message: "Too many requests. Please try again later.",
      }, {
        "Retry-After": String(Math.ceil((row.lastRequest + windowMs - now) / 1000)),
      });
    }

    // Compare-and-swap both fields so concurrent increments and window resets
    // cannot overwrite each other. Retry if the snapshot changed or was pruned.
    const consumed = await adapter.incrementOne({
      model: "rateLimit",
      where: [
        ...where,
        { field: "count", value: row.count },
        { field: "lastRequest", value: row.lastRequest },
      ],
      increment: expired ? {} : { count: 1 },
      set: expired ? { count: 1, lastRequest: now } : { lastRequest: now },
    });
    if (consumed) return;
  }
});
