import Link from "next/link";
import { BRAND } from "@/data/catalog";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "./admin-nav";

// Everything admin renders sits behind this check, header included, so a
// visitor who isn't an admin never sees the admin chrome.
export async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <header className="site-header">
        <div className="container-page flex w-full items-center justify-between gap-6">
          <p className="display text-base uppercase tracking-[0.3em] sm:text-xl">
            {BRAND} <span className="label text-muted">Admin</span>
          </p>
          <div className="flex items-center gap-6 sm:gap-10">
            <AdminNav />
            <Link href="/" className="label hidden sm:inline">
              Back to store
            </Link>
          </div>
        </div>
      </header>
      <main className="container-page flex-1 py-8 md:py-12">{children}</main>
    </>
  );
}
