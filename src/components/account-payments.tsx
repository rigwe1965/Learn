import { formatPrice } from "@/data/catalog";

// Cards are entered on Stripe's hosted page and never stored here.
export function AccountPayments({ orderCount, totalCents }: { orderCount: number; totalCents: number }) {
  return (
    <section className="border border-line p-6 md:p-8" aria-labelledby="account-payments-title">
      <h2 id="account-payments-title">Payment</h2>
      <dl className="divider-y mt-6 border-y border-line">
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Total spent</dt>
          <dd>{formatPrice(totalCents / 100)}</dd>
        </div>
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Payments made</dt>
          <dd>{orderCount}</dd>
        </div>
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Card details</dt>
          <dd>Entered at checkout</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted">
        Payments are processed securely by Stripe. We never see or store your card number.
      </p>
    </section>
  );
}
