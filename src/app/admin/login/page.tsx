import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, isAuthConfigured } from "@/lib/auth/session";
import { isRedisConfigured } from "@/lib/redis/config";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (!isRedisConfigured || !isAuthConfigured()) return <SetupNotice />;

  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-50 px-5 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-neutral-900">
          Sign in
        </h1>
        <p className="mt-2 text-[0.875rem] text-neutral-500">
          Portfolio admin. Authorised users only.
        </p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
