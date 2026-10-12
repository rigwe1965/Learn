import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    priceCents: integer("price_cents").notNull(),
    image: text("image").notNull(),
    alt: text("alt").notNull(),
    badge: text("badge"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_cents_check", sql`${t.priceCents} >= 0`),
  ],
);

export const stock = pgTable(
  "stock",
  {
    productId: integer("product_id")
      .primaryKey()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check("stock_quantity_check", sql`${t.quantity} >= 0`)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: one(stock, {
    fields: [products.id],
    references: [stock.productId],
  }),
}));

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
}));
