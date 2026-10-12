"use client";

import { changeStock } from "@/app/(admin)/admin/actions";
import { useAdminAction } from "@/lib/use-admin-action";
import { AdminField } from "./admin-field";

export function StockForm({ productId, quantity }: { productId: number; quantity: number }) {
  const { state, pending, onSubmit } = useAdminAction(changeStock);

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Adjust stock" className="max-w-md">
      <input type="hidden" name="id" value={productId} />
      <p className="text-sm text-muted">In stock now: {quantity}</p>

      <fieldset className="mt-4 flex gap-6">
        <legend className="sr-only">How to change the stock</legend>
        <label className="label flex items-center gap-2">
          <input type="radio" name="mode" value="adjust" defaultChecked className="!w-auto" />
          Adjust by
        </label>
        <label className="label flex items-center gap-2">
          <input type="radio" name="mode" value="set" className="!w-auto" />
          Set to
        </label>
      </fieldset>

      <AdminField id="amount" label="Amount" error={state.fieldErrors?.amount} hint="For example 5 or -3 when adjusting.">
        <input id="amount" name="amount" inputMode="numeric" required />
      </AdminField>

      <p role="status" className="min-h-5 text-sm text-accent">
        {state.message}
      </p>
      <p role="alert" className="min-h-5 text-sm text-danger">
        {state.error}
      </p>

      <button type="submit" className="btn mt-2" disabled={pending}>
        {pending ? "Please wait…" : "Update stock"}
      </button>
    </form>
  );
}
