import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { limitSignInByAccount, signInRule } from "@/lib/auth-rate-limit";

// Sends through Resend when RESEND_API_KEY is set. Without it, development
// prints the link to the server log; production must not log tokens, so it
// fails loudly instead. Public callbacks must contain delivery failures.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendEmail(subject: string, to: string, url: string, action: string) {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured");
    }
    console.log(`[auth] ${subject} for ${to}: ${url}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Atelier Nord <onboarding@resend.dev>",
    to,
    subject,
    text: `${action}:\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>${action}:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
  if (error) throw new Error(`Email delivery failed: ${error.message}`);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        "Reset your Atelier Nord password",
        user.email,
        url,
        "Use this link to reset your password",
      );
    },
  },
  // Better Auth enables rate limiting in production only. Counts live in the
  // database so the limit holds across serverless instances and restarts.
  rateLimit: {
    storage: "database",
    customRules: {
      "/sign-in/email": signInRule,
    },
  },
  hooks: { before: limitSignInByAccount },
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
        await sendEmail(
          "Verify your Atelier Nord email",
          user.email,
          url,
          "Use this link to verify your email address",
        );
      } catch {
        // Resend only delivers for existing unverified users. Let Better Auth
        // return its generic response even if delivery fails, to avoid enumeration.
        // Do not log the error: a provider may include addresses or token URLs.
        console.error("[auth] Verification email delivery failed");
      }
    },
  },
});
