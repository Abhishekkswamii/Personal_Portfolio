"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { seedDatabase } from "@/app/admin/actions";

export function SeedButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await seedDatabase();
          setMessage(res.message);
          setBusy(false);
          if (res.ok) router.refresh();
        }}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Copying…" : "Copy content into the database"}
      </button>
      <span aria-live="polite" className="text-[0.8125rem] text-neutral-600">
        {message}
      </span>
    </div>
  );
}
