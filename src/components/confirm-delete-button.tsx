"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/admin-validation";
import { useAdminAction } from "@/lib/use-admin-action";

// Two-step delete, same shape as the account page: ask first, then confirm.
export function ConfirmDeleteButton({
  action,
  id,
  label,
  warning,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id: number;
  label: string;
  warning: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const { state, pending, onSubmit } = useAdminAction(action);

  if (!confirming) {
    return (
      <button type="button" className="btn btn-outline" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-muted">{warning}</p>
      <p role="alert" className="min-h-5 text-sm text-danger">
        {state.error}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Please wait…" : "Permanently delete"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
