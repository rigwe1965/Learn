import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountOrders } from "@/components/account-orders";
import { AccountPayments } from "@/components/account-payments";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getUserOrders } from "@/db/orders";
import { auth } from "@/lib/auth";

export async function AccountDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const orders = await getUserOrders(session.user.id);
  const totalCents = orders.reduce((n, o) => n + o.totalCents, 0);
  const { name, email, emailVerified, createdAt } = session.user;
  const memberSince = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(createdAt);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-8 lg:col-span-7">
        <AccountOrders orders={orders} />
        <AccountPayments orderCount={orders.length} totalCents={totalCents} />
      </div>

      <div className="lg:col-span-5">
        <h2 className="mb-6">Details</h2>
        <dl className="divider-y border-y border-line">
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <dt className="label text-muted">Name</dt>
            <dd>{name}</dd>
          </div>
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <dt className="label text-muted">Email</dt>
            <dd className="break-all">{email}</dd>
          </div>
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <dt className="label text-muted">Email status</dt>
            <dd className={emailVerified ? "text-accent" : "text-muted"}>
              {emailVerified ? "Verified" : "Not verified"}
            </dd>
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
      </div>
    </div>
  );
}
