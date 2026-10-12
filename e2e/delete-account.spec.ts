import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";

// Deleting the account would break other tests that share a user, so this file
// has its own. Local dev uses the live Neon branch, so the user is removed
// afterwards if a test didn't already delete it.
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.beforeEach(async ({ page, request, baseURL }) => {
  await db.delete(user).where(eq(user.email, email));
  await createVerifiedUser(request, baseURL!, email, PASSWORD);
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  await page.goto("/account");
});

test.afterEach(async () => {
  await db.delete(user).where(eq(user.email, email));
});

test("asks for confirmation and can be cancelled", async ({ page }) => {
  await expect(page.locator("#deletePassword")).toHaveCount(0);
  await page.getByRole("button", { name: "Delete account" }).click();
  await expect(page.locator("#deletePassword")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("#deletePassword")).toHaveCount(0);
  const rows = await db.select().from(user).where(eq(user.email, email));
  expect(rows).toHaveLength(1);
});

test("rejects a wrong password and keeps the account", async ({ page }) => {
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.fill("#deletePassword", "not-my-password");
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(page.locator("p[role=alert]:visible")).toHaveText("Invalid password");
  const rows = await db.select().from(user).where(eq(user.email, email));
  expect(rows).toHaveLength(1);
});

test("deletes the account with the right password", async ({ page, baseURL }) => {
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.fill("#deletePassword", PASSWORD);
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(page).toHaveURL("/");

  const rows = await db.select().from(user).where(eq(user.email, email));
  expect(rows).toHaveLength(0);

  // The session is gone and the credentials no longer work.
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/);
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(res.status()).toBe(401);
});
