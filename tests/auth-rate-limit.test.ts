// Run with Node 24+: npx tsx --test tests/auth-rate-limit.test.ts
import assert from "node:assert/strict";
// @ts-expect-error The repository uses Node 20 types; this test runs on Node 24.
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { toNextJsHandler } from "better-auth/next-js";

test("sign-in limits survive forged source addresses", async (t) => {
  const previousEnv = { ...process.env };
  t.after(() => { process.env = previousEnv; });
  Object.assign(process.env, {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_SECRET: "synthetic-test-secret-for-rate-limiting-123456789",
    BETTER_AUTH_URL: "http://localhost:3000",
  });
  const { auth } = await import("../src/lib/auth");
  const database = new DatabaseSync(":memory:");
  t.after(() => database.close());
  let passwordChecks = 0;
  const options = {
    ...auth.options,
    database,
    rateLimit: { ...auth.options.rateLimit, enabled: true },
    emailAndPassword: {
      ...auth.options.emailAndPassword,
      enabled: true,
      password: {
        hash: async () => "synthetic-hash",
        verify: async ({ password }: { password: string }) => {
          passwordChecks++;
          return password === "correct-password";
        },
      },
    },
    logger: { disabled: true },
  };
  await (await getMigrations(options, {})).runMigrations();
  const first = betterAuth(options);
  const context = await first.$context;
  const user = await context.internalAdapter.createUser({
    name: "Test User", email: "target@example.com", emailVerified: true,
  }, { method: "email-password" });
  await context.internalAdapter.createAccount({
    userId: user.id, accountId: user.id, providerId: "credential", password: "synthetic-hash",
  });
  const handlers = [first, betterAuth(options)].map((instance) => toNextJsHandler(instance).POST);
  let requestNumber = 0;
  const signIn = (email = "target@example.com", password = "wrong-password", form = false, ip?: string) => {
    const index = requestNumber++;
    return handlers[index % handlers.length](new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "content-type": form ? "application/x-www-form-urlencoded" : "application/json",
        origin: "http://localhost:3000",
        ...(ip === "" ? {} : { "x-forwarded-for": ip ?? `192.0.2.${index + 1}` }),
      },
      body: form ? new URLSearchParams({ email, password }) : JSON.stringify({ email, password }),
    }));
  };

  for (let i = 0; i < 5; i++) {
    assert.equal((await signIn(i % 2 ? "TARGET@example.com" : undefined)).status, 401);
  }
  assert.equal(passwordChecks, 5);
  const blocked = await signIn("TARGET@example.com", "correct-password", true);
  assert.equal(blocked.status, 429, "A fresh forwarded address must not unlock the account");
  assert.equal(blocked.headers.get("set-cookie"), null);
  assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  assert.equal(passwordChecks, 5, "Blocked requests must not verify passwords");
  assert.equal((await signIn(undefined, undefined, false, "")).status, 429);
  assert.equal((await signIn(undefined, undefined, false, "invalid-address")).status, 429);

  assert.equal((await signIn("absent@example.com")).status, 401, "Accounts have independent limits");
  for (let i = 0; i < 4; i++) assert.equal((await signIn("absent@example.com")).status, 401);
  assert.equal((await signIn("ABSENT@example.com")).status, 429, "Unknown accounts get the same limit");

  // A new instance shares the database; no process-local counters are used.
  handlers.push(toNextJsHandler(betterAuth(options)).POST);
  assert.equal((await signIn()).status, 429);

  // Expire the counters without waiting or changing the application clock.
  database.prepare('UPDATE "rateLimit" SET "lastRequest" = ?').run(Date.now() - 60_001);
  assert.equal((await signIn(undefined, "correct-password")).status, 200);
  assert.equal(passwordChecks, 6);

  const concurrent = await Promise.all(Array.from({ length: 12 }, () => signIn()));
  assert.equal(concurrent.filter((response) => response.status === 401).length, 4);
  assert.equal(concurrent.filter((response) => response.status === 429).length, 8);
  assert.equal(passwordChecks, 10, "Concurrent guesses must atomically consume the remaining allowance");

  const cold = await Promise.all(Array.from({ length: 12 }, () => signIn("new@example.com")));
  assert.equal(cold.filter((response) => response.status === 401).length, 5);
  assert.equal(cold.filter((response) => response.status === 429).length, 7,
    "Concurrent creation of a counter must respect the unique database key");

  database.prepare('UPDATE "rateLimit" SET "lastRequest" = ?').run(Date.now() - 60_001);
  const reset = await Promise.all(Array.from({ length: 12 }, () => signIn()));
  assert.equal(reset.filter((response) => response.status === 401).length, 5);
  assert.equal(reset.filter((response) => response.status === 429).length, 7,
    "Concurrent expiry resets must not overwrite consumed attempts");
  assert.equal(passwordChecks, 15);

  // Simulate a counter-storage outage at the account hook. Requests must stop
  // before password verification, even if the source limiter already passed.
  const failedStore = t.mock.method(context.adapter, "findOne", async () => {
    throw new Error("Synthetic database outage");
  });
  const response = await handlers[0](new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.1" },
    body: JSON.stringify({ email: "target@example.com", password: "correct-password" }),
  }));
  assert.equal(response.status, 500);
  assert.equal(passwordChecks, 15);
  failedStore.mock.restore();
});
