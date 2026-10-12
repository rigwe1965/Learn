"use client";

import { startTransition, useActionState } from "react";
import type { ActionState } from "@/lib/admin-validation";

// Wraps a server action for a form. Submitting through onSubmit instead of the
// form's `action` prop stops React from clearing the fields when validation fails.
export function useAdminAction(action: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return { state, pending, onSubmit };
}
