import { asc, count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db } from "./index";
import { categories, products, stock } from "./schema";

// Uncached reads for the admin area: fresh data, never shared between users, and
// each one checks the caller itself instead of trusting the page that calls it.

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  details: string[];
  priceCents: number;
  image: string;
  alt: string;
  badge: string | null;
  categoryId: number;
  category: string;
  stock: number;
};

const productColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  details: products.details,
  priceCents: products.priceCents,
  image: products.image,
  alt: products.alt,
  badge: products.badge,
  categoryId: products.categoryId,
  category: categories.name,
  stock: stock.quantity,
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const rows = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .orderBy(asc(products.id));
  return rows.map((r) => ({ ...r, stock: r.stock ?? 0 }));
}

export async function getAdminProduct(id: number): Promise<AdminProduct | undefined> {
  await requireAdmin();
  const [row] = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.id, id))
    .limit(1);
  return row ? { ...row, stock: row.stock ?? 0 } : undefined;
}

export async function listAdminCategories() {
  await requireAdmin();
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      products: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.id));
}

export async function getAdminCategory(id: number) {
  await requireAdmin();
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row;
}
