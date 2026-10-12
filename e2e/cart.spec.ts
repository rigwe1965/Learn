import { expect, type Page, test } from "@playwright/test";

// The cart lives in localStorage, so each test starts from a fresh browser
// context with an empty bag and needs no database cleanup.

// Opens the first product that can be bought and returns its name.
async function openBuyableProduct(page: Page) {
  await page.goto("/products");
  const hrefs = await page
    .locator("main a[href^='/products/']")
    .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href")!))]);

  for (const href of hrefs) {
    await page.goto(href);
    if (await page.getByRole("button", { name: "Add to bag" }).isEnabled()) {
      return (await page.getByRole("heading", { level: 1 }).innerText()).trim();
    }
  }
  throw new Error("No in-stock product found to add to the bag");
}

test("shows an empty bag with a way back to the shop", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Bag" })).toBeVisible();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test("adds a product, keeps it after a reload, and lists it in the bag", async ({ page }) => {
  const name = await openBuyableProduct(page);

  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.getByRole("button", { name: "Added to bag" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();

  await page.getByRole("link", { name: "Bag (1)" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  await expect(main.getByRole("group", { name: `Quantity for ${name}` })).toContainText("1");
  await expect(main.getByText("Subtotal (1 item)")).toBeVisible();
  await expect(main.getByRole("button", { name: "Checkout coming soon" })).toBeDisabled();

  await page.reload();
  await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();

  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
});

test("changes quantity and removes the item", async ({ page }) => {
  const name = await openBuyableProduct(page);
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto("/cart");

  const main = page.getByRole("main");
  const quantity = main.getByRole("group", { name: `Quantity for ${name}` });

  const increase = main.getByRole("button", { name: `Increase quantity of ${name}` });
  if (await increase.isEnabled()) {
    await increase.click();
    await expect(quantity).toContainText("2");
    await expect(main.getByText("Subtotal (2 items)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
    await main.getByRole("button", { name: `Decrease quantity of ${name}` }).click();
    await expect(quantity).toContainText("1");
  }

  // Stepping down from 1 removes the line.
  await main.getByRole("button", { name: `Decrease quantity of ${name}` }).click();
  await expect(main.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();

  await page.goto(`/cart`);
  await expect(main.getByText("Your bag is empty.")).toBeVisible();
});

test("removes an item with the Remove button", async ({ page }) => {
  const name = await openBuyableProduct(page);
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto("/cart");

  await page.getByRole("main").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name })).toHaveCount(0);
});
