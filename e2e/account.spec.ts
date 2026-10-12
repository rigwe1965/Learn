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

test("redirects a signed-out visitor to sign in", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("shows the signed-in user's details and signs out", async ({ page, baseURL }) => {
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();

  await page.goto("/account");
  await expect(page.getByRole("heading", { level: 1, name: "Account" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("E2E Test")).toBeVisible();
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);

  await page.getByRole("main").getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");

  // The session is gone, so the page is protected again.
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/);
});
