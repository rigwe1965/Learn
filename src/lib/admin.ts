import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// The one admin check. Layouts and hidden links are not a security boundary, so
// call this first in every admin server action and admin data read.
// Signed-out visitors go to sign-in; signed-in non-admins get a 404 so the
// admin area isn't advertised.
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const { user } = session;
  if (user.role !== "admin" || !user.emailVerified) notFound();
  return user;
}
