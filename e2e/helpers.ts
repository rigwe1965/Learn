import { expect, type APIRequestContext } from "@playwright/test";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";

// Sign-in requires a verified email, so tests that need an existing user
// create one over the API and then mark it verified directly in the database.
export async function createVerifiedUser(
  request: APIRequestContext,
  baseURL: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: baseURL },
    data: { name: "E2E Test", email, password },
  });
  expect(res.ok()).toBeTruthy();
  const id: string = (await res.json()).user.id;
  // The HTTP response must not choose a privileged write outside this fixture.
  const verified = await db
    .update(user)
    .set({ emailVerified: true })
    .where(and(eq(user.id, id), eq(user.email, email)))
    .returning({ id: user.id });
  expect(verified, "Expected exactly one matching signup fixture").toHaveLength(1);
  return id;
}
