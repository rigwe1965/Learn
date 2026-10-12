import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { type OrderItem, type ShippingAddress, orders, products, stock } from "./schema";

// Uncached on purpose: orders are per-user and checkout needs live prices/stock.

export async function getCheckoutProducts(slugs: string[]) {
  if (slugs.length === 0) return [];
  return db
    .select({
      slug: products.slug,
      name: products.name,
      priceCents: products.priceCents,
      image: products.image,
      stock: stock.quantity,
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(inArray(products.slug, slugs));
}

// Records a paid order and takes its quantities out of stock in ONE statement,
// so the two can't get out of step (the Neon HTTP driver has no transactions).
// The unique stripe_session_id makes it idempotent: when the webhook and the
// success page race, only the insert that wins also decrements stock.
// Stock is clamped at zero rather than failing: the customer has already paid,
// so the order must still be recorded even if the item was oversold.
// Returns true if this call created the order.
export async function createOrder(order: {
  stripeSessionId: string;
  userId: string | null;
  email: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  shippingCents: number;
  totalCents: number;
  currency: string;
}) {
  const bySlug = new Map<string, number>();
  for (const item of order.items) {
    if (item.slug) bySlug.set(item.slug, (bySlug.get(item.slug) ?? 0) + item.quantity);
  }
  const lines = [...bySlug].map(([slug, qty]) => ({ slug, qty }));

  const result = await db.execute(sql`
    with new_order as (
      insert into orders
        (stripe_session_id, user_id, email, items, shipping_address,
         shipping_cents, total_cents, currency)
      values (
        ${order.stripeSessionId}, ${order.userId}, ${order.email},
        ${JSON.stringify(order.items)}::jsonb,
        ${order.shippingAddress ? JSON.stringify(order.shippingAddress) : null}::jsonb,
        ${order.shippingCents}, ${order.totalCents}, ${order.currency}
      )
      on conflict (stripe_session_id) do nothing
      returning id
    ),
    take_stock as (
      update stock
      set quantity = greatest(stock.quantity - d.qty, 0), updated_at = now()
      from (
        select p.id as product_id, x.qty
        from jsonb_to_recordset(${JSON.stringify(lines)}::jsonb) as x(slug text, qty int)
        join products p on p.slug = x.slug
      ) d
      where stock.product_id = d.product_id
        and exists (select 1 from new_order)
      returning stock.product_id
    )
    select id from new_order
  `);
  return result.rows.length > 0;
}

export async function getOrderBySessionId(stripeSessionId: string) {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId))
    .limit(1);
  return row;
}

export async function getUserOrders(userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}
