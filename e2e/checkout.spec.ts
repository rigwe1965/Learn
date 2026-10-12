import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";
import { db } from "../src/db";
import { orders, products, stock, user } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";

// These tests never reach Stripe: they cover our own validation, access rules and
// the orders list. Local dev uses the live Neon branch, so the throwaway user and
// the order inserted for it are removed afterwards (orders keep a null user_id
// when their user is deleted, so they're deleted explicitly first).
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `e2e-checkout-${suffix}@example.com`;
const sessionPrefix = `cs_e2e_${suffix}`;
let userId: string;

test.beforeAll(async ({ request, baseURL }) => {
  userId = await createVerifiedUser(request, baseURL!, email, PASSWORD);
});

test.afterAll(async () => {
  await db.delete(orders).where(like(orders.stripeSessionId, `${sessionPrefix}%`));
  await db.delete(user).where(eq(user.email, email));
});

async function signIn(page: Page, baseURL: string) {
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
}

async function anyProductSlug() {
  const [row] = await db
    .select({ slug: products.slug })
    .from(products)
    .innerJoin(stock, eq(stock.productId, products.id))
    .limit(1);
  return row.slug;
}

test("requires sign-in to start checkout", async ({ request }) => {
  const res = await request.post("/api/checkout", { data: { items: [{ slug: "x", quantity: 1 }] } });
  expect(res.status()).toBe(401);
});

test("rejects empty and malformed bags", async ({ page, baseURL }) => {
  await signIn(page, baseURL!);
  const post = (items: unknown) => page.request.post("/api/checkout", { data: { items } });

  expect((await post([])).status()).toBe(400);
  expect((await post("nope")).status()).toBe(400);
  expect((await post([{ slug: "x", quantity: 0 }])).status()).toBe(400);
  expect((await post([{ slug: "x", quantity: 1.5 }])).status()).toBe(400);
});

test("rejects items that are unknown or exceed stock, using server-side stock", async ({ page, baseURL }) => {
  await signIn(page, baseURL!);
  const post = (items: unknown) => page.request.post("/api/checkout", { data: { items } });

  const unknown = await post([{ slug: "no-such-product", quantity: 1 }]);
  expect(unknown.status()).toBe(409);

  const tooMany = await post([{ slug: await anyProductSlug(), quantity: 1_000_000 }]);
  expect(tooMany.status()).toBe(409);
  expect((await tooMany.json()).error).toMatch(/low on stock/);
});

test("fails cleanly when Stripe isn't configured", async ({ page, baseURL }) => {
  test.skip(Boolean(process.env.STRIPE_SECRET_KEY), "A real Stripe key would create a live test session");
  await signIn(page, baseURL!);
  const res = await page.request.post("/api/checkout", {
    data: { items: [{ slug: await anyProductSlug(), quantity: 1 }] },
  });
  expect(res.status()).toBe(502);
  expect((await res.json()).error).toBe("Checkout is unavailable right now.");
});

test("the Stripe webhook rejects unsigned requests", async ({ request }) => {
  const res = await request.post("/api/stripe/webhook", { data: "{}" });
  expect(res.status()).toBe(400);
});

test("the success page needs a signed-in user and never confirms an unknown session", async ({ page, baseURL }) => {
  await page.goto("/checkout/success?session_id=cs_test_bogus");
  await expect(page).toHaveURL(/\/sign-in$/);

  await signIn(page, baseURL!);
  await page.goto("/checkout/success?session_id=cs_test_bogus");
  await expect(page.getByRole("heading", { level: 1, name: /confirming your payment/ })).toBeVisible();
  await expect(page.getByText("Thank you")).toHaveCount(0);
});

test("the account page lists the user's orders", async ({ page, baseURL }) => {
  await signIn(page, baseURL!);
  await page.goto("/account");
  await expect(page.getByText("You haven’t placed an order yet.")).toBeVisible();

  const [order] = await db
    .insert(orders)
    .values({
      stripeSessionId: `${sessionPrefix}_a`,
      userId,
      email,
      items: [{ name: "E2E Coat", quantity: 2, unitPriceCents: 10_000 }],
      shippingAddress: {
        name: "E2E Buyer",
        line1: "1 Test Street",
        line2: null,
        city: "London",
        state: null,
        postalCode: "N1 1AA",
        country: "GB",
      },
      shippingCents: 1_500,
      totalCents: 21_500,
      currency: "usd",
    })
    .returning({ id: orders.id });

  await page.reload();
  const section = page.getByRole("region", { name: "Orders" });
  await expect(section).toContainText(`Order ${String(order.id).padStart(5, "0")}`);
  await expect(section).toContainText("E2E Coat");
  await expect(section).toContainText("× 2");
  await expect(section).toContainText("$215");
  await expect(page.getByRole("region", { name: "Payment" })).toContainText("$215");
});
