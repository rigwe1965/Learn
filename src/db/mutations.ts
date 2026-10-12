import { and, count, eq, gte, sql } from "drizzle-orm";
import type { CategoryInput, ProductInput } from "@/lib/admin-validation";
import { db } from "./index";
import { categories, products, stock } from "./schema";

// Writes only. Callers must run requireAdmin() first and call updateTag("products")
// afterwards. The Neon HTTP driver has no interactive transactions, so each
// function is a single statement or cleans up after itself.

export type MutationResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };

function pgCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
}

const slugTaken = { ok: false, error: "That slug is already in use.", field: "slug" } as const;

export async function createCategory({ name, slug }: CategoryInput): Promise<MutationResult> {
  try {
    await db.insert(categories).values({ name, slug });
    return { ok: true, data: undefined };
  } catch (err) {
    if (pgCode(err) === "23505") return slugTaken;
    throw err;
  }
}

export async function updateCategory(id: number, { name, slug }: CategoryInput): Promise<MutationResult> {
  try {
    const rows = await db
      .update(categories)
      .set({ name, slug })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return rows.length ? { ok: true, data: undefined } : { ok: false, error: "Category not found." };
  } catch (err) {
    if (pgCode(err) === "23505") return slugTaken;
    throw err;
  }
}

export async function deleteCategory(id: number): Promise<MutationResult> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.categoryId, id));
  if (total > 0) {
    return {
      ok: false,
      error: `This category still has ${total} ${total === 1 ? "product" : "products"}. Move or delete them first.`,
    };
  }
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { ok: true, data: undefined };
  } catch (err) {
    // A product was added between the check and the delete; the FK is RESTRICT.
    if (pgCode(err) === "23503") {
      return { ok: false, error: "This category still has products." };
    }
    throw err;
  }
}

export async function createProduct(input: ProductInput): Promise<MutationResult<{ id: number }>> {
  const { quantity, ...fields } = input;
  let id: number;
  try {
    [{ id }] = await db.insert(products).values(fields).returning({ id: products.id });
  } catch (err) {
    if (pgCode(err) === "23505") return slugTaken;
    if (pgCode(err) === "23503") {
      return { ok: false, error: "That category no longer exists.", field: "categoryId" };
    }
    throw err;
  }
  try {
    await db.insert(stock).values({ productId: id, quantity });
  } catch (err) {
    await db.delete(products).where(eq(products.id, id));
    throw err;
  }
  return { ok: true, data: { id } };
}

export async function updateProduct(id: number, input: ProductInput): Promise<MutationResult> {
  const { quantity, ...fields } = input;
  try {
    const rows = await db
      .update(products)
      .set(fields)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    if (!rows.length) return { ok: false, error: "Product not found." };
  } catch (err) {
    if (pgCode(err) === "23505") return slugTaken;
    if (pgCode(err) === "23503") {
      return { ok: false, error: "That category no longer exists.", field: "categoryId" };
    }
    throw err;
  }
  await setStock(id, quantity);
  return { ok: true, data: undefined };
}

export async function deleteProduct(id: number): Promise<MutationResult> {
  // The stock row goes with it (ON DELETE CASCADE).
  const rows = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  return rows.length ? { ok: true, data: undefined } : { ok: false, error: "Product not found." };
}

// Upsert: a product without a stock row reads as sold out, so create it if missing.
export async function setStock(productId: number, quantity: number) {
  await db
    .insert(stock)
    .values({ productId, quantity })
    .onConflictDoUpdate({
      target: stock.productId,
      set: { quantity, updatedAt: new Date() },
    });
}

// Relative change in one statement, so concurrent edits don't overwrite each other.
export async function adjustStock(
  productId: number,
  delta: number,
): Promise<MutationResult<{ quantity: number }>> {
  const rows = await db
    .update(stock)
    .set({ quantity: sql`${stock.quantity} + ${delta}`, updatedAt: new Date() })
    .where(and(eq(stock.productId, productId), gte(sql`${stock.quantity} + ${delta}`, 0)))
    .returning({ quantity: stock.quantity });
  if (!rows.length) {
    return { ok: false, error: "Stock can't go below zero." };
  }
  return { ok: true, data: { quantity: rows[0].quantity } };
}
