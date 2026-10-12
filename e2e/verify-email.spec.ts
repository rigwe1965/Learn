import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { createEmailVerificationToken } from "better-auth/api";
import { db } from "../src/db";
import { user } from "../src/db/schema";
import { auth } from "../src/lib/auth";

const PASSWORD = "correct-horse-battery";

// Local dev uses the live Neon branch, so the throwaway user is removed
// afterwards (session/account rows cascade).
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.afterAll(async () => {
  await db.delete(user).where(eq(user.email, email));
});

test("an unverified user can't sign in until the email link is used", async ({ page }) => {
  await page.goto("/sign-up");
  await page.fill("#name", "E2E Test");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Check your email" })).toBeVisible();

  // Signing in before verifying is refused.
  await page.goto("/sign-in");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("p[role=alert]:visible")).toContainText("verify your email");
  await expect(page).toHaveURL(/\/sign-in$/);

  // The email isn't sent yet (the link only goes to the dev server log), so
  // build the same signed token Better Auth would put in it.
  const { secret } = await auth.$context;
  const token = await createEmailVerificationToken(secret, email);
  await page.goto(`/api/auth/verify-email?token=${token}&callbackURL=%2Fverify-email`);
  await expect(page).toHaveURL(/\/verify-email$/);
  await expect(page.getByRole("heading", { level: 1, name: "Email verified" })).toBeVisible();

  await page.getByRole("link", { name: "Sign in" }).click();
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
});

test("shows an error for an invalid verification link", async ({ page }) => {
  await page.goto("/api/auth/verify-email?token=not-a-token&callbackURL=%2Fverify-email");
  await expect(page).toHaveURL(/\/verify-email\?error=/);
  await expect(page.getByRole("heading", { level: 1, name: "Link expired" })).toBeVisible();
  await expect(page.locator("p[role=alert]")).toContainText("invalid or has expired");
});
