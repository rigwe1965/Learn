"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 30;

export function ResendVerificationButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; failed: boolean } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    setPending(true);
    setMessage(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/verify-email",
    });
    setPending(false);

    if (error) {
      setMessage({
        text: error.message ?? "Something went wrong. Please try again.",
        failed: true,
      });
      return;
    }
    setMessage({ text: "We\u2019ve sent you a new link.", failed: false });
    setCooldown(COOLDOWN_SECONDS);
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        className="btn btn-outline btn-block"
        disabled={pending || cooldown > 0}
        onClick={resend}
      >
        {pending
          ? "Please wait…"
          : cooldown > 0
            ? `Resend email in ${cooldown}s`
            : "Resend email"}
      </button>
      <p
        role={message?.failed ? "alert" : "status"}
        className={`mt-4 min-h-5 text-sm ${message?.failed ? "text-danger" : "text-muted"}`}
      >
        {message?.text}
      </p>
    </div>
  );
}
