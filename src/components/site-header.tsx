"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND, navLinks } from "@/data/catalog";
import { authClient } from "@/lib/auth-client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function signOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container-page relative flex w-full items-center justify-between">
        <button
          type="button"
          className="label -ml-2 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav aria-label="Primary" className="hidden flex-1 gap-8 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="label">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="display absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-base uppercase tracking-[0.3em] hover:no-underline sm:text-xl"
        >
          {BRAND}
        </Link>

        <div className="label flex flex-1 items-center justify-end gap-5 lg:gap-8">
          <Link href="#" className="hidden sm:inline">
            Search
          </Link>
          <Link href={session ? "/account" : "/sign-in"} className="hidden sm:inline">
            Account
          </Link>
          {session && (
            <button type="button" className="label hidden sm:inline" onClick={signOut}>
              Sign out
            </button>
          )}
          <Link href="#">Bag (0)</Link>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-line bg-background lg:hidden"
        >
          <ul className="container-page divider-y py-2">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="display block py-4 text-xl"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <Link
                href={session ? "/account" : "/sign-in"}
                className="display block py-4 text-xl"
                onClick={() => setOpen(false)}
              >
                Account
              </Link>
            </li>
            {session && (
              <li className="sm:hidden">
                <button type="button" className="display block py-4 text-xl" onClick={signOut}>
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
