import { revalidateTag } from "next/cache";
import { fulfillCheckoutSession, getStripe } from "@/lib/stripe";

// Backup to the success page: records the order even if the buyer closes the tab.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Not configured", { status: 400 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const result = await fulfillCheckoutSession(event.data.object.id);
    // Stock just changed: expire the cached product reads so shoppers see it.
    if (result === "created") revalidateTag("products", { expire: 0 });
  }
  return new Response(null, { status: 200 });
}
