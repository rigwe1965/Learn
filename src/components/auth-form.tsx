"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const COPY = {
  "sign-in": {
    title: "Sign in",
    submit: "Sign in",
    alt: "New to Atelier Nord?",
    altLabel: "Create an account",
    altHref: "/sign-up",
  },
  "sign-up": {
    title: "Create account",
    submit: "Create account",
    alt: "Already have an account?",
    altLabel: "Sign in",
    altHref: "/sign-in",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const justReset = useSearchParams().get("reset") === "1";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = COPY[mode];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({
            name: String(data.get("name")),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <section className="container-page section" aria-labelledby="auth-title">
      <div className="mx-auto w-full max-w-md">
        <h1 id="auth-title" className="mb-8 md:mb-12">
          {copy.title}
        </h1>

        {mode === "sign-in" && justReset && (
          <p role="status" className="mb-6 text-sm">
            Your password has been updated. Sign in with your new password.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {mode === "sign-up" && (
            <div>
              <label htmlFor="name" className="label text-muted">
                Name
              </label>
              <input id="name" name="name" type="text" autoComplete="name" required />
            </div>
          )}
          <div>
            <label htmlFor="email" className="label text-muted">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="password" className="label text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>

          {mode === "sign-in" && (
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="link text-muted">
                Forgot password?
              </Link>
            </p>
          )}

          <p role="alert" className="min-h-5 text-sm text-danger">
            {error}
          </p>

          <button type="submit" className="btn btn-block" disabled={pending}>
            {pending ? "Please wait…" : copy.submit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {copy.alt}{" "}
          <Link href={copy.altHref} className="link text-foreground">
            {copy.altLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
