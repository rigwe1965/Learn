"use client";

import { useState } from "react";
import { PasswordStrengthHint } from "@/components/password-strength-hint";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setSaved(false);
    setPending(true);
    const currentPassword = String(new FormData(form).get("currentPassword"));

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    form.reset();
    setNewPassword("");
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-labelledby="change-password-title">
      <h2 id="change-password-title">Change password</h2>

      <div>
        <label htmlFor="currentPassword" className="label text-muted">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="label text-muted">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          aria-describedby="new-password-hint"
        />
        <PasswordStrengthHint id="new-password-hint" password={newPassword} />
      </div>

      <p
        role={error ? "alert" : "status"}
        className={`min-h-5 text-sm ${error ? "text-danger" : ""}`}
      >
        {error ?? (saved ? "Your password has been updated." : "")}
      </p>

      <button type="submit" className="btn btn-block" disabled={pending}>
        {pending ? "Please wait…" : "Update password"}
      </button>
    </form>
  );
}
