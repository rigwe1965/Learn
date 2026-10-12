"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function DeleteAccountForm() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const password = String(new FormData(e.currentTarget).get("password"));

    const { error } = await authClient.deleteUser({ password });
    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <h2 id="delete-account-title">Delete account</h2>
      <p className="mt-4 text-sm text-muted">
        This permanently deletes your account and signs you out everywhere. It can&rsquo;t
        be undone.
      </p>

      {confirming ? (
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-6"
          aria-labelledby="delete-account-title"
        >
          <div>
            <label htmlFor="deletePassword" className="label text-muted">
              Confirm with your password
            </label>
            <input
              id="deletePassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <p role="alert" className="min-h-5 text-sm text-danger">
            {error}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn flex-1" disabled={pending}>
              {pending ? "Please wait…" : "Permanently delete"}
            </button>
            <button
              type="button"
              className="btn btn-outline flex-1"
              disabled={pending}
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-outline mt-8"
          onClick={() => setConfirming(true)}
        >
          Delete account
        </button>
      )}
    </div>
  );
}
