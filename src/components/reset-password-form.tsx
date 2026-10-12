"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setPending(true);
    const newPassword = String(new FormData(e.currentTarget).get("password"));

    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }
    router.push("/sign-in?reset=1");
  }

  return (
    <section className="container-page section" aria-labelledby="auth-title">
      <div className="mx-auto w-full max-w-md">
        <h1 id="auth-title" className="mb-8 md:mb-12">
          Choose a new password
        </h1>

        {token ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="label text-muted">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <p role="alert" className="min-h-5 text-sm text-danger">
              {error}
            </p>

            <button type="submit" className="btn btn-block" disabled={pending}>
              {pending ? "Please wait…" : "Update password"}
            </button>
          </form>
        ) : (
          <p role="alert" className="text-danger">
            This reset link is invalid or has expired.{" "}
            <Link href="/forgot-password" className="link">
              Request a new one
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
