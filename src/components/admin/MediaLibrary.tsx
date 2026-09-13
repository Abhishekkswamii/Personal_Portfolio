"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteMedia, uploadMedia } from "@/app/admin/actions";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_LABEL,
  MAX_UPLOAD_MB,
} from "@/lib/storage/limits";

type Item = {
  id: string;
  path: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  size: number;
  used: boolean;
};

const kb = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`;

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function upload(files: FileList) {
    setBusy(true);
    for (const file of Array.from(files)) {
      setStatus(`Uploading ${file.name}…`);

      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });

      const fd = new FormData();
      fd.set("file", file);
      fd.set("width", String(dims.w));
      fd.set("height", String(dims.h));

      const res = await uploadMedia(fd);
      if (!res.ok) {
        setStatus(res.message);
        setBusy(false);
        return;
      }
    }
    setStatus("Uploaded.");
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload images"}
        </button>
        <p className="mt-2.5 text-[0.8125rem] text-neutral-500">
          {ACCEPTED_LABEL}. Up to {MAX_UPLOAD_MB}MB each — every image is
          re-encoded to WebP on upload.
        </p>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p aria-live="polite" className="mt-3 h-4 text-[0.8125rem] text-neutral-500">
        {status}
      </p>

      {items.length ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-neutral-50">
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain"
                />
              </div>
              <div className="p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-[0.6875rem] text-neutral-400">
                    {item.width}×{item.height} · {kb(item.size)}
                  </p>
                  {item.used ? null : (
                    <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider text-amber-700">
                      Unused
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(item.url);
                      setCopied(item.id);
                      setTimeout(() => setCopied(null), 1600);
                    }}
                    className="flex-1 rounded-md border border-neutral-200 px-2 py-1.5 text-[0.75rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                  >
                    {copied === item.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Delete this image? Anything still using it will fall back to a placeholder.")) return;
                      const res = await deleteMedia(item.id, item.path);
                      setStatus(res.message);
                      router.refresh();
                    }}
                    aria-label="Delete image"
                    className="rounded-md border border-neutral-200 px-2 py-1.5 text-[0.75rem] text-neutral-500 transition-colors hover:border-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 px-6 py-14 text-center">
          <p className="text-[0.9375rem] text-neutral-500">
            No images yet. Upload project screenshots here, then attach them from
            the project editor.
          </p>
        </div>
      )}
    </div>
  );
}
