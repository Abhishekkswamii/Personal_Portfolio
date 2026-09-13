import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAuthConfigured } from "@/lib/auth/session";
import { isRedisConfigured } from "@/lib/redis/config";
import { COLLECTION_LIST, SINGLETONS } from "@/lib/admin/schema";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { SetupNotice } from "@/components/admin/SetupNotice";

/** Everything inside this group requires a session. */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without a database or a signing secret there is nothing to sign in to —
  // say so plainly rather than showing an admin that cannot work.
  if (!isRedisConfigured || !isAuthConfigured()) return <SetupNotice />;

  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const groups = [
    {
      title: "Content",
      items: [
        { href: "/admin", label: "Dashboard" },
        { href: `/admin/single/profile`, label: SINGLETONS.profile.title },
        ...COLLECTION_LIST.map((c) => ({
          href: `/admin/${c.route}`,
          label: c.plural,
        })),
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/admin/media", label: "Media" },
        { href: `/admin/single/site_settings`, label: SINGLETONS.site_settings.title },
      ],
    },
  ];

  return (
    <div className="min-h-svh bg-neutral-50 text-neutral-900">
      <AdminNav groups={groups} email={user.email ?? ""} signOut={signOut} />

      <div className="lg:pl-64">
        <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8 lg:py-12">
          {children}
        </div>
      </div>

      <Link
        href="/"
        target="_blank"
        className="fixed bottom-4 right-4 z-20 hidden rounded-full border border-neutral-300 bg-white px-4 py-2 text-[0.8125rem] text-neutral-600 shadow-sm transition-colors hover:border-neutral-900 hover:text-neutral-900 lg:inline-flex"
      >
        View site ↗
      </Link>
    </div>
  );
}
