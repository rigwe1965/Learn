"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CheckoutButton({ items }: { items: { slug: string; quantity: number }[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout is unavailable right now.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-block mt-8" onClick={onClick} disabled={pending}>
        {pending ? "Please wait…" : "Checkout"}
      </button>
      <p role="alert" className="mt-4 min-h-5 text-sm text-danger">
        {error}
      </p>
    </>
  );
}
