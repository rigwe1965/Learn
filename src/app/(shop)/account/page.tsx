import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountDetails } from "@/components/account-details";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <main>
      <section className="container-page section" aria-labelledby="account-title">
        <div className="mx-auto w-full max-w-md">
          <h1 id="account-title" className="mb-8 md:mb-12">
            Account
          </h1>
          <Suspense fallback={<div className="min-h-64" aria-hidden />}>
            <AccountDetails />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
