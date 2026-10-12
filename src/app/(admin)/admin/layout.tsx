import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<div className="min-h-64" aria-hidden />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}
