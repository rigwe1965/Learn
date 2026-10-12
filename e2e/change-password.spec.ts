import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";
const NEW_PASSWORD = "even-better-staple-9";

// Changing the password would break other tests that share a user, so this
// file has its own. Local dev uses the live Neon branch, so each worker's
// throwaway user is removed afterwards (session/account rows cascade).
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.beforeAll(async ({ request, baseURL }) => {
  await createVerifiedUser(request, baseURL!, email, PASSWORD);
});

test.afterAll(async () => {
  await db.delete(user).where(eq(user.email, email));
});

test.beforeEach(async ({ page, baseURL }) => {
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  await page.goto("/account");
});

test("rejects a wrong current password", async ({ page }) => {
  await page.fill("#currentPassword", "not-my-password");
  await page.fill("#newPassword", NEW_PASSWORD);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator("p[role=alert]")).toHaveText("Invalid password");
});

test("blocks a new password shorter than 8 characters", async ({ page }) => {
  await page.fill("#currentPassword", PASSWORD);
  await page.fill("#newPassword", "short");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator("#newPassword:invalid")).toHaveCount(1);
});

test("changes the password", async ({ page, baseURL }) => {
  await page.fill("#currentPassword", PASSWORD);
  await page.fill("#newPassword", NEW_PASSWORD);
  await expect(page.locator("#new-password-hint")).toContainText("Strength:");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("status").filter({ hasText: "has been updated" })).toBeVisible();
  await expect(page.locator("#currentPassword")).toHaveValue("");
  await expect(page.locator("#newPassword")).toHaveValue("");

  // The old password no longer works; the new one does.
  const old = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(old.status()).toBe(401);
  const fresh = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: NEW_PASSWORD },
  });
  expect(fresh.ok()).toBeTruthy();
});
