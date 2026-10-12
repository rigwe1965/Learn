import { expect, test } from "@playwright/test";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { categories, products, user } from "../src/db/schema";
import { createVerifiedUser } from "./helpers";

const PASSWORD = "correct-horse-battery";

// Local dev uses the live Neon branch, so every record this file creates carries
// a unique suffix and is removed afterwards (stock/session rows cascade).
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `e2e-admin-${suffix}@example.com`;
const shopperEmail = `e2e-shopper-${suffix}@example.com`;
const categorySlug = `e2e-cat-${suffix}`;
const categoryName = `E2E Category ${suffix}`;
const productSlug = `e2e-product-${suffix}`;
const productName = `E2E Product ${suffix}`;

async function signIn(page: import("@playwright/test").Page, baseURL: string, email: string) {
  const res = await page.request.post("/api/auth/sign-in/email", {
    headers: { Origin: baseURL },
    data: { email, password: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
}

test.beforeAll(async ({ request, baseURL }) => {
  const adminId = await createVerifiedUser(request, baseURL!, adminEmail, PASSWORD);
  await db.update(user).set({ role: "admin" }).where(eq(user.id, adminId));
  await createVerifiedUser(request, baseURL!, shopperEmail, PASSWORD);
});

test.afterAll(async () => {
  await db.delete(products).where(eq(products.slug, productSlug));
  await db.delete(categories).where(eq(categories.slug, categorySlug));
  await db.delete(user).where(inArray(user.email, [adminEmail, shopperEmail]));
});

test("sends a signed-out visitor to sign in", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("shows a not-found page to a signed-in shopper without the admin role", async ({ page, baseURL }) => {
  await signIn(page, baseURL!, shopperEmail);
  await page.goto("/admin/products");
  // The check runs inside a Suspense boundary, so the status line may already be 200;
  // what matters is that none of the admin UI or data is rendered.
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Products" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Admin" })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("keeps the storefront header and footer off the admin pages", async ({ page, baseURL }) => {
  await signIn(page, baseURL!, adminEmail);
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { level: 1, name: "Products" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
});

test("manages a category, a product and its stock end to end", async ({ page, baseURL }) => {
  test.setTimeout(90_000); // a long flow that also compiles pages on first visit
  await signIn(page, baseURL!, adminEmail);

  // Category: create, then it appears in the list.
  await page.goto("/admin/categories/new");
  await page.getByLabel("Name", { exact: true }).fill(categoryName);
  await page.getByLabel("Slug").fill(categorySlug);
  await page.getByRole("button", { name: "Create category" }).click();
  await expect(page).toHaveURL(/\/admin\/categories$/);
  await expect(page.getByRole("link", { name: categoryName })).toBeVisible();

  // Product: validation errors keep what was typed.
  await page.goto("/admin/products/new");
  await page.getByLabel("Name", { exact: true }).fill(productName);
  await page.getByLabel("Price (USD)").fill("12.999");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByText("Enter a price such as 129 or 129.50.")).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(productName);

  // Product: create with valid values.
  await page.getByLabel("Slug").fill(productSlug);
  await page.getByLabel("Category").selectOption({ label: categoryName });
  await page.getByLabel("Price (USD)").fill("129.50");
  await page.getByLabel("Stock", { exact: true }).fill("3");
  await page.getByLabel("Description", { exact: true }).fill("A product created by the admin e2e test.");
  await page.getByLabel("Details").fill("First detail\nSecond detail");
  await page
    .getByLabel("Image URL")
    .fill("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800");
  await page.getByLabel("Image description").fill("A test image");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);

  const row = page.getByRole("row", { name: new RegExp(productName) });
  await expect(row).toContainText("$130"); // formatPrice rounds to whole dollars
  await expect(row).toContainText("Only 3 left");

  // The storefront serves it right away (the products cache tag was refreshed).
  const shopRes = await page.goto(`/products/${productSlug}`);
  expect(shopRes?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: productName })).toBeVisible();

  // Stock: adjust, set, and refuse to go below zero.
  await page.goto("/admin/products");
  await row.getByRole("link", { name: "Edit" }).click();
  const stockForm = page.getByRole("form", { name: "Adjust stock" });

  await stockForm.getByLabel("Amount").fill("5");
  await stockForm.getByRole("button", { name: "Update stock" }).click();
  await expect(stockForm.getByText("Stock is now 8.")).toBeVisible();

  await stockForm.getByLabel("Amount").fill("-20");
  await stockForm.getByRole("button", { name: "Update stock" }).click();
  await expect(stockForm.getByText("Stock can't go below zero.")).toBeVisible();

  await stockForm.getByLabel("Set to").check();
  await stockForm.getByLabel("Amount").fill("0");
  await stockForm.getByRole("button", { name: "Update stock" }).click();
  await expect(stockForm.getByText("Stock set to 0.")).toBeVisible();

  // Category with a product can't be deleted.
  await page.goto("/admin/categories");
  await page.getByRole("row", { name: new RegExp(categoryName) }).getByRole("link", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete category" }).click();
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(page.getByText(/still has 1 product/)).toBeVisible();

  // Delete the product, then the category.
  await page.goto("/admin/products");
  await row.getByRole("link", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete product" }).click();
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("link", { name: productName })).toHaveCount(0);

  await page.goto("/admin/categories");
  await page.getByRole("row", { name: new RegExp(categoryName) }).getByRole("link", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete category" }).click();
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(page).toHaveURL(/\/admin\/categories$/);
  await expect(page.getByRole("link", { name: categoryName })).toHaveCount(0);
});

test("rejects a duplicate slug", async ({ page, baseURL }) => {
  await signIn(page, baseURL!, adminEmail);
  const slug = `e2e-dup-${suffix}`;

  await page.goto("/admin/categories/new");
  await page.getByLabel("Name", { exact: true }).fill(`Dup ${suffix}`);
  await page.getByLabel("Slug").fill(slug);
  await page.getByRole("button", { name: "Create category" }).click();
  await expect(page).toHaveURL(/\/admin\/categories$/);

  await page.goto("/admin/categories/new");
  await page.getByLabel("Name", { exact: true }).fill(`Dup again ${suffix}`);
  await page.getByLabel("Slug").fill(slug);
  await page.getByRole("button", { name: "Create category" }).click();
  await expect(page.getByText("That slug is already in use.")).toBeVisible();

  await db.delete(categories).where(eq(categories.slug, slug));
});
