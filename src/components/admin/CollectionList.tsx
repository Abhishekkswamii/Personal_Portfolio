"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  duplicateRecord,
  reorderRecords,
  setPublished,
} from "@/app/admin/actions";

export type ListRow = {
  id: string;
  title: string;
  subtitle?: string;
  published: boolean;
  href: string;
};

/**
 * Listing for any collection: reorder, publish, duplicate, edit.
 * Reordering is optimistic — the list moves immediately and persists after,
 * reverting only if the write fails.
 */
export function CollectionList({
  table,
  rows: initialRows,
  orderable,
  publishable,
  duplicable = false,
  emptyLabel,
}: {
  table: string;
  rows: ListRow[];
  orderable: boolean;
  publishable: boolean;
  duplicable?: boolean;
  emptyLabel: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [status, setStatus] = useState("");

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-14 text-center">
        <p className="text-[0.9375rem] text-neutral-500">{emptyLabel}</p>
      </div>
    );
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setStatus("Saving order…");
    const res = await reorderRecords(table, next.map((r) => r.id));
    setStatus(res.ok ? "Order saved" : res.message);
    if (!res.ok) setRows(rows);
    router.refresh();
  }

  async function togglePublished(row: ListRow) {
    const next = rows.map((r) =>
      r.id === row.id ? { ...r, published: !r.published } : r,
    );
    setRows(next);
    const res = await setPublished(table, row.id, !row.published);
    setStatus(res.message);
    if (!res.ok) setRows(rows);
    router.refresh();
  }

  async function duplicate(row: ListRow) {
    setStatus("Duplicating…");
    const res = await duplicateRecord(table, row.id);
    setStatus(res.message);
    router.refresh();
  }

  return (
    <div>
      <ul className="overflow-hidden rounded-xl border border-neutral-200">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 last:border-b-0 sm:flex-nowrap"
          >
            {orderable ? (
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${row.title} up`}
                  className="flex h-5 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1}
                  aria-label={`Move ${row.title} down`}
                  className="flex h-5 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-25"
                >
                  ↓
                </button>
              </div>
            ) : null}

            <Link href={row.href} className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-medium text-neutral-900">
                {row.title || "Untitled"}
              </span>
              {row.subtitle ? (
                <span className="mt-0.5 block truncate text-[0.8125rem] text-neutral-500">
                  {row.subtitle}
                </span>
              ) : null}
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              {publishable ? (
                <button
                  type="button"
                  onClick={() => togglePublished(row)}
                  className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wider transition-colors ${
                    row.published
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {row.published ? "Published" : "Draft"}
                </button>
              ) : null}
              {duplicable ? (
                <button
                  type="button"
                  onClick={() => duplicate(row)}
                  className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[0.75rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  Duplicate
                </button>
              ) : null}
              <Link
                href={row.href}
                className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[0.75rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-3 h-4 text-[0.8125rem] text-neutral-500">
        {status}
      </p>
    </div>
  );
}
