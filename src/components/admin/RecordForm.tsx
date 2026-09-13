"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Field } from "@/lib/admin/schema";
import { deleteRecord, saveRecord } from "@/app/admin/actions";
import { FieldInput } from "./Fields";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * One form for every record in the admin, generated from the field schema.
 *
 * Save state is always visible — idle, saving, saved, failed — because the
 * worst thing a CMS can do is leave you unsure whether your work is stored.
 * Unsaved changes warn before the tab closes.
 */
export function RecordForm({
  table,
  id,
  fields,
  initial,
  backHref,
  publishable = false,
  deletable = false,
  title,
  uploadFolder = "media",
}: {
  table: string;
  id: string | null;
  fields: Field[];
  initial: Record<string, unknown>;
  backHref: string;
  publishable?: boolean;
  deletable?: boolean;
  title: string;
  /** Where image fields on this record upload to. */
  uploadFolder?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // For projects the destination follows the slug as it is typed, so files
  // uploaded while creating a record land where its edits will write later.
  const resolvedFolder =
    table === "projects" && typeof values.slug === "string" && values.slug.trim()
      ? `projects/${values.slug}`
      : uploadFolder;

  const setField = useCallback((name: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setDirty(true);
    setState("idle");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setMessage("");

    const payload: Record<string, unknown> = { ...values };
    if (publishable && !("published" in payload)) payload.published = false;

    const res = await saveRecord(table, id, payload);
    setState(res.ok ? "saved" : "error");
    setMessage(res.message);
    if (res.ok) {
      setDirty(false);
      router.refresh();
      if (!id) router.push(backHref);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm(`Delete “${title}”? This can't be undone.`)) return;
    const res = await deleteRecord(table, id);
    if (res.ok) {
      router.push(backHref);
      router.refresh();
    } else {
      setState("error");
      setMessage(res.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pb-28">
      <div className="grid gap-6 sm:grid-cols-2">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={values[field.name]}
            folder={resolvedFolder}
            onChange={(v) => setField(field.name, v)}
          />
        ))}
      </div>

      {/* Sticky action bar — save is always reachable on a long form. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-[16rem]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            {publishable ? (
              <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-neutral-700">
                <input
                  type="checkbox"
                  checked={Boolean(values.published)}
                  onChange={(e) => setField("published", e.target.checked)}
                  className="size-4 rounded border-neutral-300 text-neutral-900"
                />
                Published
              </label>
            ) : null}

            <span
              aria-live="polite"
              className={`text-[0.8125rem] ${
                state === "error"
                  ? "text-red-600"
                  : state === "saved"
                    ? "text-green-700"
                    : "text-neutral-500"
              }`}
            >
              {state === "saving"
                ? "Saving…"
                : state === "saved"
                  ? "Saved"
                  : state === "error"
                    ? message
                    : dirty
                      ? "Unsaved changes"
                      : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {deletable && id ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-neutral-300 px-3.5 py-2 text-[0.8125rem] text-neutral-600 transition-colors hover:border-red-500 hover:text-red-600"
              >
                Delete
              </button>
            ) : null}
            <button
              type="submit"
              disabled={state === "saving"}
              className="rounded-lg bg-neutral-900 px-5 py-2 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {state === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
