import { expect, test } from "@playwright/test";
import { and, eq, like } from "drizzle-orm";
import { db } from "../src/db";
import { user, verification } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";
const NEW_PASSWORD = "even-better-staple-9";

// Local dev uses the live Neon branch, so each worker gets its own throwaway
// user and removes it afterwards. Reset tokens aren't tied to the user by a
// foreign key, so they are removed explicitly.
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
let userId: string;

test.beforeAll(async ({ request, baseURL }) => {
  userId = await createVerifiedUser(request, baseURL!, email, PASSWORD);
});

test.afterAll(async () => {
  await db.delete(verification).where(eq(verification.value, userId));
  await db.delete(user).where(eq(user.email, email));
});

test("shows the same confirmation for an unknown email", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.fill("#email", `nobody-${email}`);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");
});

test("shows an error for an invalid reset link", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.locator("p[role=alert]:visible")).toContainText("invalid or has expired");
  await expect(page.getByRole("link", { name: "Request a new one" })).toBeVisible();
});

test("resets the password and signs in with the new one", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);

  await page.fill("#email", email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");

  // The email isn't sent yet (the link only goes to the dev server log), so
  // read the token from the database and follow the same link the email holds.
  await expect
    .poll(async () => {
      const rows = await db
        .select({ identifier: verification.identifier })
        .from(verification)
        .where(and(eq(verification.value, userId), like(verification.identifier, "reset-password:%")));
      return rows.length;
    })
    .toBe(1);
  const [row] = await db
    .select({ identifier: verification.identifier })
    .from(verification)
    .where(and(eq(verification.value, userId), like(verification.identifier, "reset-password:%")));
  const token = row.identifier.replace("reset-password:", "");

  await page.goto(`/api/auth/reset-password/${token}?callbackURL=%2Freset-password`);
  await expect(page).toHaveURL(/\/reset-password\?token=/);

  await page.fill("#password", "short");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator("#password:invalid")).toHaveCount(1);

  await page.fill("#password", NEW_PASSWORD);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/\/sign-in\?reset=1$/);
  await expect(page.getByRole("status")).toContainText("Your password has been updated");

  // The old password no longer works; the new one does.
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("p[role=alert]:visible")).toHaveText("Invalid email or password");

  await page.fill("#password", NEW_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  // A reset token can only be used once.
  await page.goto(`/reset-password?token=${token}`);
  await page.fill("#password", "another-password-1");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator("p[role=alert]:visible")).toBeVisible();
});
