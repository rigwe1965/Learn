import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

// No email provider is wired up yet: in development the link is printed to the
// server log. Production must not log tokens, so delivery fails until a
// provider is added here. Public callbacks must contain delivery failures.
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
  // Better Auth enables rate limiting in production only. Counts live in the
  // database so the limit holds across serverless instances and restarts.
  rateLimit: {
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  user: {
    deleteUser: { enabled: true },
    additionalFields: {
      // input: false keeps clients from setting their own role at sign-up or update.
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail("Verification link", user.email, url);
      } catch {
        // Resend only delivers for existing unverified users. Let Better Auth
        // return its generic response even if delivery fails, to avoid enumeration.
        // Do not log the error: a provider may include addresses or token URLs.
        console.error("[auth] Verification email delivery failed");
      }
    },
  },
});
