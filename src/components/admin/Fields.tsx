"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import type { Field } from "@/lib/admin/schema";
import { uploadMedia } from "@/app/admin/actions";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/storage/limits";

/**
 * Form controls for the admin.
 *
 * Functional rather than editorial — this is a tool, not the portfolio — but
 * consistent: one control height, one border, labels and help text always
 * present, every input associated with its label.
 */

const INPUT =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[0.9375rem] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

function Shell({
  field,
  htmlFor,
  children,
}: {
  field: Field;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label
        htmlFor={htmlFor}
        className="block text-[0.8125rem] font-medium text-neutral-800"
      >
        {field.label}
        {field.required ? (
          <span className="ml-1 text-neutral-400" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {field.help ? (
        <p className="mt-1 text-[0.75rem] leading-[1.5] text-neutral-500">
          {field.help}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

type Value = unknown;
type OnChange = (v: Value) => void;

export function FieldInput({
  field,
  value,
  onChange,
  folder = "media",
}: {
  field: Field;
  value: Value;
  onChange: OnChange;
  /** Upload destination for image fields on this record. */
  folder?: string;
}) {
  const id = useId();

  switch (field.type) {
    case "boolean":
      return (
        <Shell field={field}>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/20"
            />
            <span className="text-[0.875rem] text-neutral-600">
              {value ? "Yes" : "No"}
            </span>
          </label>
        </Shell>
      );

    case "textarea":
      return (
        <Shell field={field} htmlFor={id}>
          <textarea
            id={id}
            rows={4}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${INPUT} resize-y leading-[1.6]`}
          />
        </Shell>
      );

    case "paragraphs":
    case "list":
      return (
        <Shell field={field} htmlFor={id}>
          <ListField
            id={id}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange}
            multiline={field.type === "paragraphs"}
          />
        </Shell>
      );

    case "steps":
      return (
        <Shell field={field}>
          <StepsField
            value={
              Array.isArray(value)
                ? (value as { step: string; detail: string }[])
                : []
            }
            onChange={onChange}
          />
        </Shell>
      );

    case "image":
      return (
        <Shell field={field}>
          <ImageField value={value} onChange={onChange} folder="profile" basename="portrait" />
        </Shell>
      );

    case "gallery":
      return (
        <Shell field={field}>
          <ProjectImagesField value={value} onChange={onChange} folder={folder} />
        </Shell>
      );

    case "richtext": // links object
      return (
        <Shell field={field}>
          <LinksField value={value} onChange={onChange} />
        </Shell>
      );

    case "number":
      return (
        <Shell field={field} htmlFor={id}>
          <input
            id={id}
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className={INPUT}
          />
        </Shell>
      );

    default:
      return (
        <Shell field={field} htmlFor={id}>
          <input
            id={id}
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
            className={INPUT}
          />
        </Shell>
      );
  }
}

/* -- List of strings ----------------------------------------------------- */

function ListField({
  id,
  value,
  onChange,
  multiline,
}: {
  id: string;
  value: string[];
  onChange: OnChange;
  multiline: boolean;
}) {
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3 w-5 shrink-0 text-right font-mono text-[0.6875rem] text-neutral-400">
            {i + 1}
          </span>
          {multiline ? (
            <textarea
              id={i === 0 ? id : undefined}
              rows={3}
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className={`${INPUT} resize-y leading-[1.6]`}
            />
          ) : (
            <input
              id={i === 0 ? id : undefined}
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className={INPUT}
            />
          )}
          <div className="flex shrink-0 gap-1">
            <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </IconButton>
            <IconButton
              label="Move down"
              onClick={() => move(i, 1)}
              disabled={i === value.length - 1}
            >
              ↓
            </IconButton>
            <IconButton label="Remove" onClick={() => remove(i)}>
              ×
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="self-start rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[0.8125rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
      >
        + Add
      </button>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="mt-1 flex size-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* -- Architecture steps -------------------------------------------------- */

function StepsField({
  value,
  onChange,
}: {
  value: { step: string; detail: string }[];
  onChange: OnChange;
}) {
  const update = (i: number, key: "step" | "detail", v: string) => {
    const next = value.map((s, j) => (i === j ? { ...s, [key]: v } : s));
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3 w-5 shrink-0 text-right font-mono text-[0.6875rem] text-neutral-400">
            {i + 1}
          </span>
          <input
            type="text"
            value={item.step}
            placeholder="Step"
            onChange={(e) => update(i, "step", e.target.value)}
            className={`${INPUT} sm:max-w-[13rem]`}
          />
          <input
            type="text"
            value={item.detail}
            placeholder="Detail"
            onChange={(e) => update(i, "detail", e.target.value)}
            className={INPUT}
          />
          <IconButton
            label="Remove"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            ×
          </IconButton>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { step: "", detail: "" }])}
        className="self-start rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[0.8125rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
      >
        + Add step
      </button>
    </div>
  );
}

/* -- Images -------------------------------------------------------------- */

type ImageValue = { url: string; alt: string; width: number; height: number } | null;

function asImage(v: unknown): ImageValue {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  return typeof o.url === "string" && o.url
    ? {
        url: o.url,
        alt: typeof o.alt === "string" ? o.alt : "",
        width: Number(o.width) || 1600,
        height: Number(o.height) || 1000,
      }
    : null;
}

export function ImageField({
  value,
  onChange,
  compact = false,
  folder = "media",
  basename = "image",
}: {
  value: unknown;
  onChange: OnChange;
  compact?: boolean;
  /** Directory under the uploads root, e.g. "projects/sehatconnect". */
  folder?: string;
  basename?: string;
}) {
  const image = asImage(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);

    const fd = new FormData();
    fd.set("file", file);
    fd.set("alt", image?.alt ?? "");
    fd.set("folder", folder);
    fd.set("basename", basename);

    // Dimensions come back from the server: sharp re-encodes the image, so
    // only it knows the final size. Storing them is what lets next/image
    // reserve space and keep layout shift at zero.
    const res = await uploadMedia(fd);
    setBusy(false);

    if (!res.ok || !res.url) {
      setError(res.message);
      return;
    }
    onChange({
      url: res.url,
      alt: image?.alt ?? "",
      width: res.width ?? 1600,
      height: res.height ?? 1000,
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-start gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {image ? (
            <Image
              src={image.url}
              alt=""
              width={160}
              height={160}
              unoptimized
              className="size-full object-contain"
            />
          ) : (
            <span className="text-[0.6875rem] text-neutral-400">None</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Uploading…" : image ? "Replace" : "Upload"}
            </button>
            {image ? (
              <>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(image.url)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-[0.8125rem] text-neutral-700 transition-colors hover:border-neutral-900"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-[0.8125rem] text-neutral-700 transition-colors hover:border-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </>
            ) : null}
          </div>

          <input
            ref={input}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          {image && !compact ? (
            <input
              type="text"
              value={image.alt}
              placeholder="Alt text — describe the image for screen readers"
              onChange={(e) => onChange({ ...image, alt: e.target.value })}
              className={`${INPUT} mt-2 text-[0.8125rem]`}
            />
          ) : null}

          {image ? (
            <p className="mt-2 font-mono text-[0.6875rem] text-neutral-400">
              {image.width}×{image.height}
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-[0.75rem] text-red-600">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -- Project image set --------------------------------------------------- */

function ProjectImagesField({
  value,
  onChange,
  folder = "projects",
}: {
  value: unknown;
  onChange: OnChange;
  folder?: string;
}) {
  const v = (value ?? {}) as Record<string, unknown>;
  const gallery = Array.isArray(v.gallery)
    ? (v.gallery.map(asImage).filter(Boolean) as NonNullable<ImageValue>[])
    : [];

  const set = (key: string, next: unknown) =>
    onChange({ ...v, gallery, [key]: next });

  return (
    <div className="flex flex-col gap-4">
      {(
        [
          ["thumbnail", "Thumbnail — homepage card"],
          ["hero", "Hero — top of the case study"],
          ["architecture", "Architecture diagram"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <p className="mb-2 text-[0.75rem] font-medium uppercase tracking-wider text-neutral-500">
            {label}
          </p>
          <ImageField
            value={v[key]}
            onChange={(next) => set(key, next)}
            folder={folder}
            basename={key}
          />
        </div>
      ))}

      <div>
        <p className="mb-2 text-[0.75rem] font-medium uppercase tracking-wider text-neutral-500">
          Gallery
        </p>
        <div className="flex flex-col gap-2">
          {gallery.map((img, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageField
                  value={img}
                  folder={folder}
                  basename={`gallery-${i + 1}`}
                  onChange={(next) => {
                    const list = [...gallery];
                    if (next === null) list.splice(i, 1);
                    else list[i] = next as NonNullable<ImageValue>;
                    onChange({ ...v, gallery: list });
                  }}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...v,
                gallery: [...gallery, { url: "", alt: "", width: 1600, height: 1000 }],
              })
            }
            className="self-start rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[0.8125rem] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            + Add gallery image
          </button>
        </div>
      </div>
    </div>
  );
}

/* -- Links --------------------------------------------------------------- */

function LinksField({ value, onChange }: { value: unknown; onChange: OnChange }) {
  const v = (value ?? {}) as Record<string, unknown>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(
        [
          ["github", "Source / GitHub URL"],
          ["live", "Live demo URL"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="block text-[0.75rem] text-neutral-500">{label}</label>
          <input
            type="url"
            value={String(v[key] ?? "")}
            onChange={(e) => onChange({ ...v, [key]: e.target.value || null })}
            className={`${INPUT} mt-1`}
          />
        </div>
      ))}
    </div>
  );
}
