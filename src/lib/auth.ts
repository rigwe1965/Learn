import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

// No email provider is wired up yet: in development the link is printed to the
// server log. Production must not log tokens, so it fails loudly until a
// provider is added here.
function sendEmail(subject: string, to: string, url: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Email delivery is not configured");
  }
  console.log(`[auth] ${subject} for ${to}: ${url}`);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      sendEmail("Password reset link", user.email, url);
    },
  },
  user: { deleteUser: { enabled: true } },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      sendEmail("Verification link", user.email, url);
    },
  },
});
