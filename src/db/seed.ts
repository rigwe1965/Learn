import { config } from "dotenv";

config({ path: ".env.local" });

const seedProducts = [
  {
    "slug": "leather-biker-jacket",
    "name": "Leather Biker Jacket",
    "description": "A fitted biker jacket in supple lambskin, finished with an asymmetric zip and tonal hardware. Softens with wear.",
    "details": [
      "100% lambskin leather",
      "Cotton-twill lining",
      "Asymmetric front zip",
      "Made in Portugal"
    ],
    "priceCents": 145000,
    "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    "alt": "Black leather jacket on a white surface",
    "badge": "New",
    "category": "Outerwear",
    "quantity": 8
  },
  {
    "slug": "chain-shoulder-bag",
    "name": "Chain Shoulder Bag",
    "description": "A compact flap bag in smooth calfskin with a removable chain strap that can be worn long or doubled.",
    "details": [
      "Smooth calfskin",
      "Magnetic flap closure",
      "Removable chain strap",
      "H 15 cm / W 22 cm / D 6 cm"
    ],
    "priceCents": 89000,
    "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800",
    "alt": "Pink shoulder bag with a chain strap",
    "badge": null,
    "category": "Bags",
    "quantity": 3
  },
  {
    "slug": "satin-bomber",
    "name": "Satin Bomber",
    "description": "A lightweight bomber in washed satin with a ribbed collar and cuffs. Easy over knitwear or a shirt.",
    "details": [
      "Recycled satin",
      "Ribbed collar, cuffs and hem",
      "Zip front, two pockets",
      "Machine washable at 30°C"
    ],
    "priceCents": 62000,
    "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
    "alt": "Rust-coloured bomber jacket on a hanger",
    "badge": null,
    "category": "Outerwear",
    "quantity": 12
  },
  {
    "slug": "suede-brogue",
    "name": "Suede Brogue",
    "description": "A classic brogue reworked in soft suede, with a flexible leather sole and hand-punched detailing.",
    "details": [
      "Suede upper",
      "Leather sole",
      "Lace-up fastening",
      "Made in Italy"
    ],
    "priceCents": 54000,
    "image": "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800",
    "alt": "Green suede brogue shoe",
    "badge": "New",
    "category": "Shoes",
    "quantity": 0
  },
  {
    "slug": "poppy-wrap-dress",
    "name": "Poppy Wrap Dress",
    "description": "A full-skirted wrap dress in a printed cotton blend, with a defined waist and a self-tie belt.",
    "details": [
      "Cotton-blend poplin",
      "Fully lined",
      "Wrap front with belt",
      "Hidden side pockets"
    ],
    "priceCents": 78000,
    "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
    "alt": "Woman in a red floral dress",
    "badge": null,
    "category": "Dresses",
    "quantity": 5
  },
  {
    "slug": "blossom-top-handle-bag",
    "name": "Blossom Top-Handle Bag",
    "description": "A structured top-handle bag in a painterly floral print, with a roomy interior and a detachable strap.",
    "details": [
      "Printed coated canvas",
      "Leather trim",
      "Detachable shoulder strap",
      "H 24 cm / W 30 cm / D 14 cm"
    ],
    "priceCents": 112000,
    "image": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800",
    "alt": "Floral printed handbag",
    "badge": null,
    "category": "Bags",
    "quantity": 2
  },
  {
    "slug": "garden-print-dress",
    "name": "Garden Print Dress",
    "description": "A fluid wrap dress in a soft garden print. Cut for movement, with a flattering side tie.",
    "details": [
      "Viscose crêpe",
      "V-neck with side tie",
      "Mid-length hem",
      "Dry clean only"
    ],
    "priceCents": 69000,
    "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
    "alt": "Woman in a floral wrap dress by the sea",
    "badge": null,
    "category": "Dresses",
    "quantity": 9
  },
  {
    "slug": "everyday-backpack",
    "name": "Everyday Backpack",
    "description": "A clean-lined backpack in water-resistant nylon with a padded laptop sleeve and adjustable straps.",
    "details": [
      "Water-resistant nylon",
      "Padded 15-inch laptop sleeve",
      "Internal zip pocket",
      "H 44 cm / W 30 cm / D 14 cm"
    ],
    "priceCents": 43000,
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    "alt": "Navy backpack on a light floor",
    "badge": null,
    "category": "Bags",
    "quantity": 20
  }
] as const;

async function main() {
  // Imported after dotenv so DATABASE_URL is set when the client is created.
  const { db } = await import("./index");
  const { categories, products, stock } = await import("./schema");
  const { sql } = await import("drizzle-orm");

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  for (const name of new Set(seedProducts.map((p) => p.category))) {
    await db
      .insert(categories)
      .values({ slug: slugify(name), name })
      .onConflictDoUpdate({ target: categories.slug, set: { name } });
  }
  const categoryRows = await db.select().from(categories);
  const categoryId = new Map(categoryRows.map((c) => [c.name, c.id]));

  for (const { category, quantity, ...p } of seedProducts) {
    const values = {
      ...p,
      details: [...p.details],
      categoryId: categoryId.get(category)!,
    };
    const [row] = await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({ target: products.slug, set: values })
      .returning({ id: products.id });
    await db
      .insert(stock)
      .values({ productId: row.id, quantity })
      .onConflictDoUpdate({
        target: stock.productId,
        set: { quantity, updatedAt: sql`now()` },
      });
  }

  console.log(
    `Seeded ${categoryId.size} categories and ${seedProducts.length} products.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
