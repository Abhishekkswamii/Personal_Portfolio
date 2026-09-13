import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  // The admin must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Shared metadata for every admin route, including the login page.
 *
 * The authentication check deliberately lives one level down, in
 * (protected)/layout.tsx — a guard here would also wrap /admin/login and
 * redirect it to itself.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
