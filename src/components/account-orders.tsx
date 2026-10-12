import Link from "next/link";
import { formatPrice } from "@/data/catalog";
import type { orders } from "@/db/schema";

type Order = typeof orders.$inferSelect;

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function AccountOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="border border-line p-6 md:p-8" aria-labelledby="account-orders-title">
      <h2 id="account-orders-title">Orders</h2>
      {orders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted">You haven’t placed an order yet.</p>
          <Link href="/products" className="btn btn-outline mt-8 inline-flex">
            Explore the collection
          </Link>
        </div>
      ) : (
        <ul className="divider-y mt-6 border-y border-line">
          {orders.map((order) => (
            <li key={order.id} className="py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="label">Order {String(order.id).padStart(5, "0")}</p>
                <p>{formatPrice(order.totalCents / 100)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{date.format(order.createdAt)}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} <span className="text-muted">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
