import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";

// Local dev uses the live Neon branch, so each worker gets its own throwaway
// user and removes it afterwards (session/account rows cascade).
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.beforeAll(async ({ request, baseURL }) => {
  await createVerifiedUser(request, baseURL!, email, PASSWORD);
});

test.afterAll(async () => {
  await db.delete(user).where(eq(user.email, email));
});

test.beforeEach(async ({ page }) => {
  await page.goto("/sign-in");
});

test("renders the sign-in form without horizontal scroll", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
});

test("blocks an empty submit", async ({ page }) => {
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#email:invalid")).toHaveCount(1);
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("shows an error for a wrong password", async ({ page }) => {
  await page.fill("#email", email);
  await page.fill("#password", "wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("p[role=alert]")).toHaveText("Invalid email or password");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("signs in with valid credentials", async ({ page, context }) => {
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name.includes("session_token"))).toBe(true);
});
