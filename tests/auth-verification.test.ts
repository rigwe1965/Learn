// Run with: npx tsx --test tests/auth-verification.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { toNextJsHandler } from "better-auth/next-js";

test("verification resend preserves public responses when production delivery fails", async (t) => {
  const previousEnv = { ...process.env };
  t.after(() => {
    process.env = previousEnv;
  });
  Object.assign(process.env, {
    NODE_ENV: "production",
    // Import the real auth options without connecting to an external database.
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_SECRET: "synthetic-test-secret-for-verification-only-123456789",
    BETTER_AUTH_URL: "http://localhost:3000",
  });
  const { auth } = await import("../src/lib/auth");
  const log = t.mock.method(console, "log", () => {});
  const error = t.mock.method(console, "error", () => {});
  const users = [false, true].map((emailVerified) => ({
    id: emailVerified ? "verified" : "unverified",
    name: "Test User",
    email: emailVerified ? "verified@example.com" : "unverified@example.com",
    emailVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const testAuth = betterAuth({
    ...auth.options,
    database: memoryAdapter({ user: users, session: [], rateLimit: [] }),
    // Keep production rate limiting enabled with synthetic request identities.
    rateLimit: { ...auth.options.rateLimit, enabled: true },
    logger: { disabled: true },
  });
  const { POST } = toNextJsHandler(testAuth);
  const resend = (email: string, ip = "192.0.2.1") => POST(new Request(
    "http://localhost:3000/api/auth/send-verification-email",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({ email, callbackURL: "/verify-email" }),
    },
  ));

  for (const email of ["absent@example.com", "verified@example.com", "unverified@example.com"]) {
    const response = await resend(email);
    assert.equal(response.status, 200, email);
    assert.deepEqual(await response.json(), { status: true });
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal(users[0].emailVerified, false);
  assert.equal(log.mock.callCount(), 0, "Production must not log verification links");
  assert.deepEqual(error.mock.calls.map((call) => call.arguments), [
    ["[auth] Verification email delivery failed"],
  ], "Diagnostics must not include addresses, tokens, or provider errors");

  assert.equal((await resend("unverified@example.com")).status, 429);
  assert.equal((await resend("invalid-email", "192.0.2.2")).status, 400);

  Object.assign(process.env, { NODE_ENV: "development" });
  assert.equal((await resend("unverified@example.com", "192.0.2.3")).status, 200);
  assert.equal(log.mock.callCount(), 1, "Development should still deliver via the server log");
  const loggedLink = String(log.mock.calls[0].arguments[0]);
  assert.match(loggedLink, /Verify your Atelier Nord email for unverified@example\.com:/);
  assert.match(loggedLink, /\/verify-email\?token=/);
});
