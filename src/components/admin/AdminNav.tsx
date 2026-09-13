"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Group = { title: string; items: { href: string; label: string }[] };

export function AdminNav({
  groups,
  email,
  signOut,
}: {
  groups: Group[];
  email: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 lg:hidden">
        <Link href="/admin" className="text-[0.9375rem] font-semibold">
          Portfolio admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-[0.8125rem]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-30 w-64 flex-col overflow-y-auto border-r border-neutral-200 bg-white transition-transform duration-300 lg:flex lg:translate-x-0 ${
          open ? "flex translate-x-0 pt-16" : "hidden -translate-x-full lg:flex"
        }`}
      >
        <div className="hidden border-b border-neutral-200 px-5 py-5 lg:block">
          <Link href="/admin" className="text-[0.9375rem] font-semibold">
            Portfolio admin
          </Link>
          <p className="mt-1 truncate text-[0.75rem] text-neutral-500">{email}</p>
        </div>

        <nav aria-label="Admin" className="flex-1 px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-2 pb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-neutral-400">
                {group.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`block rounded-lg px-2.5 py-2 text-[0.875rem] transition-colors ${
                        isActive(item.href)
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-3">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-[0.8125rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            target="_blank"
            className="mt-2 block rounded-lg px-3 py-2 text-center text-[0.8125rem] text-neutral-500 transition-colors hover:text-neutral-900 lg:hidden"
          >
            View site ↗
          </Link>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-neutral-900/20 lg:hidden"
        />
      ) : null}
    </>
  );
}
