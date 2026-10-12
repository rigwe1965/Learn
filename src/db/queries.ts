import { asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import type { Product } from "@/data/catalog";
import { db } from "./index";
import { categories, products, stock } from "./schema";

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
  category: categories.name,
  stock: stock.quantity,
};

type Row = {
  id: number;
  slug: string;
  name: string;
  description: string;
  details: string[];
  priceCents: number;
  image: string;
  alt: string;
  badge: string | null;
  category: string;
  stock: number | null;
};

// Keeps the Product shape the storefront components already use.
const toProduct = ({ id, priceCents, badge, stock, ...rest }: Row): Product => ({
  ...rest,
  id: String(id),
  price: priceCents / 100,
  stock: stock ?? 0,
  ...(badge ? { badge } : {}),
});

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const rows = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .orderBy(asc(products.id));
  return rows.map(toProduct);
}

export async function getNewArrivals(count = 12): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const rows = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(count);
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const [row] = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return row ? toProduct(row) : undefined;
}

// Same category first, then the rest.
export async function getRelatedProducts(product: Product, count = 4) {
  const all = await getProducts();
  const others = all.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export async function getCategories() {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  return db.select().from(categories).orderBy(asc(categories.id));
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const rows = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(categories.slug, slug))
    .orderBy(asc(products.id));
  return rows.map(toProduct);
}
