import Link from "next/link";
import { COLLECTION_LIST } from "@/lib/admin/schema";
import { countRows, listRows } from "@/lib/admin/data";
import { ping } from "@/lib/redis/client";
import { SeedButton } from "@/components/admin/SeedButton";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminDashboard() {
  // The public site quietly falls back to seed content when Redis is
  // unreachable — that's the right behaviour for a visitor. The admin is the
  // one place that must say so plainly instead: a zero count here could mean
  // "genuinely empty" or "couldn&apos;t be reached", and those call for different
  // actions from you. `ping()` is what tells them apart.
  const connected = await ping();

  if (!connected) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Everything on the public site is editable from here."
        />
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-[0.9375rem] font-semibold text-red-900">
            Could not reach the database
          </h2>
          <p className="mt-1.5 max-w-prose text-[0.875rem] leading-[1.6] text-red-800">
            The public site is unaffected — it&apos;s serving its last known-good
            content. But nothing here can be trusted or edited until the
            connection is back: check REDIS_URL and that the Redis instance is
            reachable from this server, then reload this page.
          </p>
        </div>
      </>
    );
  }

  // Counts come from the session client, so drafts are included here — and
  // only here. The public repository can't see them at all.
  const counts = Object.fromEntries(
    await Promise.all(
      COLLECTION_LIST.map(async (c) => [c.key, await countRows(c.table)] as const),
    ),
  ) as Record<string, number>;

  const projects = await listRows("projects");
  const drafts = projects.filter((p) => !p.published).length;
  const empty = projects.length === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the public site is editable from here."
      />

      {empty ? (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-[0.9375rem] font-semibold text-amber-900">
            The database is empty
          </h2>
          <p className="mt-1.5 max-w-prose text-[0.875rem] leading-[1.6] text-amber-800">
            The public site is running on the content bundled with the code. Copy
            it into Redis to start editing — this only works while the
            database is empty, so it can never overwrite your changes.
          </p>
          <div className="mt-4">
            <SeedButton />
          </div>
        </div>
      ) : null}

      {drafts > 0 ? (
        <p className="mb-6 rounded-lg bg-neutral-100 px-4 py-3 text-[0.875rem] text-neutral-600">
          {drafts} {drafts === 1 ? "project is" : "projects are"} in draft and not
          visible on the public site.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {COLLECTION_LIST.map((c) => (
          <Link
            key={c.key}
            href={`/admin/${c.route}`}
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-900"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold">{c.plural}</h2>
              <span className="font-mono text-[0.8125rem] text-neutral-400">
                {String(counts[c.key] ?? 0).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-1.5 text-[0.8125rem] leading-[1.55] text-neutral-500">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
