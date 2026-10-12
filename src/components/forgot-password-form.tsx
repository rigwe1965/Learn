"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email"));

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setPending(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <section className="container-page section" aria-labelledby="auth-title">
      <div className="mx-auto w-full max-w-md">
        <h1 id="auth-title" className="mb-8 md:mb-12">
          Reset password
        </h1>

        {sent ? (
          <p role="status">
            If an account exists for that email, we&rsquo;ve sent a link to reset your
            password.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <p className="text-sm text-muted">
              Enter your email and we&rsquo;ll send you a link to choose a new password.
            </p>
            <div>
              <label htmlFor="email" className="label text-muted">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <p role="alert" className="min-h-5 text-sm text-danger">
              {error}
            </p>

            <button type="submit" className="btn btn-block" disabled={pending}>
              {pending ? "Please wait…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/sign-in" className="link text-foreground">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
