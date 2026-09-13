import Link from "next/link";

/**
 * Shown when the admin is reachable but not configured. Tells you exactly what
 * to do rather than failing with a stack trace — and the public site is
 * unaffected either way, because it runs on the bundled seed.
 */
export function SetupNotice() {
  const steps = [
    "Create a free database at Redis Cloud (or point at any Redis 6.2+ instance) and copy its connection string.",
    "Copy .env.example to .env.local (locally) or set the same variables in Render → Environment. REDIS_URL and AUTH_SECRET are both required.",
    "Create your login: npm run admin:create — it prompts for an email and password and writes a scrypt hash. No password is ever stored in plain text.",
    "Restart the app, sign in at /admin/login, then use “Copy content into the database”.",
  ];

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-50 px-5 py-16">
      <div className="w-full max-w-xl">
        <p className="text-[0.75rem] font-medium uppercase tracking-wider text-neutral-400">
          Admin
        </p>
        <h1 className="mt-2 text-[1.625rem] font-semibold tracking-[-0.02em]">
          Connect the database to enable editing
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-[1.65] text-neutral-600">
          The portfolio is live and running on the content bundled with the
          code — nothing is broken. Connect Redis and you can edit it all from
          here instead of in the source.
        </p>

        <ol className="mt-7 flex flex-col gap-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3.5"
            >
              <span className="font-mono text-[0.75rem] text-neutral-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.875rem] leading-[1.6] text-neutral-700">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-[0.8125rem] leading-[1.6] text-neutral-500">
          Full instructions, including the Render deployment steps, are in the
          project README.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block text-[0.875rem] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900"
        >
          Back to the site
        </Link>
      </div>
    </div>
  );
}
