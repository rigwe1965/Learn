import { headers } from "next/headers";
import { getCheckoutProducts } from "@/db/orders";
import { auth } from "@/lib/auth";
import {
  CHECKOUT_SOURCE,
  SHIPPING_FLAT_CENTS,
  SHIPPING_FREE_OVER_CENTS,
  getStripe,
} from "@/lib/stripe";

const MAX_LINES = 20;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Sign in to check out." }, { status: 401 });

  // Only slugs and quantities come from the client; prices and stock are read here.
  const body = await request.json().catch(() => null);
  const requested: unknown = body?.items;
  if (!Array.isArray(requested) || requested.length === 0 || requested.length > MAX_LINES) {
    return Response.json({ error: "Your bag is empty." }, { status: 400 });
  }
  const wanted = new Map<string, number>();
  for (const r of requested) {
    const slug = typeof r?.slug === "string" ? r.slug : "";
    const quantity = Number(r?.quantity);
    if (!slug || !Number.isInteger(quantity) || quantity < 1) {
      return Response.json({ error: "Invalid bag." }, { status: 400 });
    }
    wanted.set(slug, (wanted.get(slug) ?? 0) + quantity);
  }

  const found = await getCheckoutProducts([...wanted.keys()]);
  if (found.length !== wanted.size) {
    return Response.json({ error: "An item in your bag is no longer available." }, { status: 409 });
  }
  for (const p of found) {
    if ((p.stock ?? 0) < wanted.get(p.slug)!) {
      return Response.json({ error: `${p.name} is low on stock. Update your bag.` }, { status: 409 });
    }
  }

  const subtotalCents = found.reduce((n, p) => n + p.priceCents * wanted.get(p.slug)!, 0);
  const shippingCents = subtotalCents > SHIPPING_FREE_OVER_CENTS ? 0 : SHIPPING_FLAT_CENTS;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      metadata: { source: CHECKOUT_SOURCE },
      client_reference_id: session.user.id,
      customer_email: session.user.email,
      line_items: found.map((p) => ({
        quantity: wanted.get(p.slug)!,
        price_data: {
          currency: "usd",
          unit_amount: p.priceCents,
          // The slug lets us take the right product out of stock once it's paid.
          product_data: { name: p.name, images: [p.image], metadata: { slug: p.slug } },
        },
      })),
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shippingCents === 0 ? "Complimentary shipping" : "Standard shipping",
            fixed_amount: { amount: shippingCents, currency: "usd" },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });
    return Response.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout]", err);
    return Response.json({ error: "Checkout is unavailable right now." }, { status: 502 });
  }
}
