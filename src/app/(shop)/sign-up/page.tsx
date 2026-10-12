import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <main>
      <Suspense fallback={<div className="container-page section" aria-hidden />}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </main>
  );
}
