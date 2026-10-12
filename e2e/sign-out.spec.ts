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

test("signs the user out from the header", async ({ page, baseURL }) => {
  // Sign in over the API; page.request shares the browser context's cookies.
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL! },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();

  await page.goto("/");

  // Below the `sm` breakpoint the control lives in the mobile menu.
  const mobile = page.viewportSize()!.width < 640;
  if (mobile) {
    await page.getByRole("button", { name: "Menu" }).click();
  }
  const nav = mobile ? page.locator("#mobile-nav") : page.locator("header");
  await expect(nav.getByRole("link", { name: "Account", exact: true })).toHaveCount(0);
  await nav.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL("/");
  if (mobile) {
    await page.getByRole("button", { name: "Menu" }).click();
  }
  await expect(nav.getByRole("link", { name: "Account", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Sign out" })).toHaveCount(0);

  const cookies = await page.context().cookies();
  expect(cookies.some((c) => c.name.includes("session_token") && c.value)).toBe(false);
});
