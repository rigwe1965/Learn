import Stripe from "stripe";
import { createOrder } from "@/db/orders";

// Created lazily so builds and dev work without keys until checkout is used.
let client: Stripe | undefined;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return (client ??= new Stripe(key));
}

export const SHIPPING_FREE_OVER_CENTS = 25_000;
export const SHIPPING_FLAT_CENTS = 1_500;

// Stamped on every Checkout Session this store creates. The Stripe account may
// have other sessions (other sites, dashboard links); only ours become orders.
export const CHECKOUT_SOURCE = "atelier-nord";

export type FulfillResult =
  | "foreign" // not created by this store, ignored
  | "unpaid" // ours, but not paid yet
  | "created" // order recorded and stock reduced by this call
  | "existing"; // order was already recorded

// Records a paid Checkout Session as an order. Safe to call repeatedly, from
// both the webhook and the success page.
export async function fulfillCheckoutSession(sessionId: string): Promise<FulfillResult> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });
  if (session.metadata?.source !== CHECKOUT_SOURCE || !session.client_reference_id) {
    return "foreign";
  }
  if (session.payment_status !== "paid") return "unpaid";

  const lines = session.line_items?.data ?? [];
  const ship = session.collected_information?.shipping_details;
  const created = await createOrder({
    stripeSessionId: session.id,
    userId: session.client_reference_id,
    email: session.customer_details?.email ?? null,
    items: lines.map((l) => {
      const product = l.price?.product;
      const slug =
        product && typeof product === "object" && !product.deleted
          ? product.metadata?.slug
          : undefined;
      return {
        ...(slug ? { slug } : {}),
        name: l.description ?? "Item",
        quantity: l.quantity ?? 1,
        unitPriceCents: l.price?.unit_amount ?? 0,
      };
    }),
    shippingAddress: ship
      ? {
          name: ship.name,
          line1: ship.address.line1 ?? null,
          line2: ship.address.line2 ?? null,
          city: ship.address.city ?? null,
          state: ship.address.state ?? null,
          postalCode: ship.address.postal_code ?? null,
          country: ship.address.country ?? null,
        }
      : null,
    shippingCents: session.total_details?.amount_shipping ?? 0,
    totalCents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
  });
  return created ? "created" : "existing";
}
