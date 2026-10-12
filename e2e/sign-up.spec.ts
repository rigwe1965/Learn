import { expect, test } from "@playwright/test";
import { inArray } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";

const PASSWORD = "correct-horse-battery";

// Local dev uses the live Neon branch, so every address created here is
// tracked and removed afterwards (session/account rows cascade).
const created: string[] = [];
function uniqueEmail() {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  created.push(email);
  return email;
}

test.afterAll(async () => {
  if (created.length > 0) {
    await db.delete(user).where(inArray(user.email, created));
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto("/sign-up");
});

test("renders the sign-up form without horizontal scroll", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Create account" })).toBeVisible();
  await expect(page.locator("#name")).toBeVisible();
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
});

test("shows a live password strength hint", async ({ page }) => {
  const hint = page.locator("#password-hint");
  await expect(hint).toContainText("Use at least 8 characters");
  await page.fill("#password", "abc");
  await expect(hint).toContainText("Use at least 8 characters");
  await page.fill("#password", "abcdefgh");
  await expect(hint).toContainText("Strength: Weak");
  await page.fill("#password", "Abcdefgh1");
  await expect(hint).toContainText("Strength: Fair");
  await page.fill("#password", "Correct-Horse-Battery-9");
  await expect(hint).toContainText("Strength: Strong");
});

test("blocks an empty submit", async ({ page }) => {
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#name:invalid")).toHaveCount(1);
  await expect(page).toHaveURL(/\/sign-up$/);
});

test("blocks a password shorter than 8 characters", async ({ page }) => {
  await page.fill("#name", "E2E Test");
  await page.fill("#email", uniqueEmail());
  await page.fill("#password", "short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#password:invalid")).toHaveCount(1);
  await expect(page).toHaveURL(/\/sign-up$/);
});

test("creates an account and asks the user to verify their email", async ({
  page,
  context,
}) => {
  const email = uniqueEmail();
  await page.fill("#name", "E2E Test");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Check your email" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(email);
  // No session until the address is verified.
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name.includes("session_token"))).toBe(false);
});

test("doesn't reveal that an email is already registered", async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail();
  const res = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: baseURL! },
    data: { name: "E2E Existing", email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();

  await page.fill("#name", "E2E Test");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  // Same confirmation as a new address, so sign-up can't be used to probe
  // which emails have accounts.
  await expect(page.getByRole("heading", { level: 1, name: "Check your email" })).toBeVisible();
});
