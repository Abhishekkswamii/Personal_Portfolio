import Link from "next/link";

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
  action?: { label: string; href: string };
}) {
  return (
    <header className="mb-8">
      {breadcrumb?.length ? (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-neutral-500">
            {breadcrumb.map((b) => (
              <li key={b.href} className="flex items-center gap-2">
                <Link href={b.href} className="transition-colors hover:text-neutral-900">
                  {b.label}
                </Link>
                <span aria-hidden="true" className="text-neutral-300">
                  /
                </span>
              </li>
            ))}
            <li aria-current="page" className="text-neutral-900">
              {title}
            </li>
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-semibold tracking-[-0.02em]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-prose text-[0.875rem] leading-[1.6] text-neutral-500">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
