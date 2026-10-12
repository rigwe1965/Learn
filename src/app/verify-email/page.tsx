import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailStatus } from "@/components/verify-email-status";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function VerifyEmailPage() {
  return (
    <main>
      <Suspense fallback={<div className="container-page section" aria-hidden />}>
        <VerifyEmailStatus />
      </Suspense>
    </main>
  );
}
