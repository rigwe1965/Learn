"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function VerifyEmailStatus() {
  const failed = useSearchParams().get("error") !== null;

  return (
    <section className="container-page section" aria-labelledby="auth-title">
      <div className="mx-auto w-full max-w-md">
        <h1 id="auth-title" className="mb-8 md:mb-12">
          {failed ? "Link expired" : "Email verified"}
        </h1>
        <p role={failed ? "alert" : "status"} className={failed ? "text-danger" : undefined}>
          {failed
            ? "This verification link is invalid or has expired. Sign in and we’ll send you a new one."
            : "Your email address is confirmed. You can now sign in."}
        </p>
        <Link href="/sign-in" className="btn btn-block mt-8">
          Sign in
        </Link>
      </div>
    </section>
  );
}
