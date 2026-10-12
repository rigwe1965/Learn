import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    // No email provider is wired up yet: in development the reset link is
    // printed to the server log. Production must not log tokens, so it fails
    // loudly until a provider is added here.
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Password reset email is not configured");
      }
      console.log(`[auth] Password reset link for ${user.email}: ${url}`);
    },
  },
});
