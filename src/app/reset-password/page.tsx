import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function ResetPasswordPage() {
  return (
    <main>
      <Suspense fallback={<div className="container-page section" aria-hidden />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
