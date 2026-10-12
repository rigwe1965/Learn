import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export async function AccountDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { name, email, createdAt } = session.user;
  const memberSince = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(createdAt);

  return (
    <>
      <dl className="divider-y border-y border-line">
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Name</dt>
          <dd>{name}</dd>
        </div>
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Email</dt>
          <dd>{email}</dd>
        </div>
        <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="label text-muted">Member since</dt>
          <dd>{memberSince}</dd>
        </div>
      </dl>
      <div className="mt-12">
        <ChangePasswordForm />
      </div>
      <div className="mt-12">
        <SignOutButton />
      </div>
      <div className="mt-12 border-t border-line pt-12">
        <DeleteAccountForm />
      </div>
    </>
  );
}
