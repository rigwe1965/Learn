import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClearCart } from "@/components/clear-cart";
import { getOrderBySessionId } from "@/db/orders";
import { formatPrice } from "@/data/catalog";
import { auth } from "@/lib/auth";
import { fulfillCheckoutSession } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmed",
};

export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <main>
      <section className="container-page section" aria-labelledby="success-title">
        <div className="mx-auto w-full max-w-md text-center">
          <Suspense fallback={<div className="min-h-64" aria-hidden />}>
            <Confirmation searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function Confirmation({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { session_id } = await searchParams;
  const sessionId = typeof session_id === "string" ? session_id : "";
  let order = sessionId ? await getOrderBySessionId(sessionId) : undefined;
  if (sessionId && !order) {
    try {
      // Can't refresh the product cache while rendering; stock on product pages
      // catches up within the cache window (the webhook refreshes it right away).
      const result = await fulfillCheckoutSession(sessionId);
      if (result === "created" || result === "existing") {
        order = await getOrderBySessionId(sessionId);
      }
    } catch {
      // Unknown or foreign session id: fall through to the generic message.
    }
  }
  // Only show an order to the account that placed it.
  if (order && order.userId !== session.user.id) order = undefined;

  if (!order) {
    return (
      <>
        <h1 id="success-title">We’re confirming your payment</h1>
        <p className="mt-6 text-muted">
          If you were charged, your order will appear on your account page shortly.
        </p>
        <Link href="/account" className="btn btn-outline mt-8 inline-flex">
          View account
        </Link>
      </>
    );
  }

  return (
    <>
      <ClearCart />
      <h1 id="success-title">Thank you</h1>
      <p className="mt-6 text-muted">
        Order {String(order.id).padStart(5, "0")} is confirmed.
      </p>
      <p className="label mt-8">Total {formatPrice(order.totalCents / 100)}</p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/account" className="btn">
          View orders
        </Link>
        <Link href="/products" className="btn btn-outline">
          Continue shopping
        </Link>
      </div>
    </>
  );
}
