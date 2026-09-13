import "server-only";

import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata, type Sharp } from "sharp";

/**
 * Local-filesystem media storage.
 *
 * WHY NOT public/uploads:
 * Render's web services run on an ephemeral filesystem by default — anything
 * written into the app's own directory at runtime, `public/` included, is
 * gone on the next deploy or restart. The Render-native answer is a
 * **persistent disk**, mounted at a path you choose (see render.yaml), which
 * is the only part of the filesystem guaranteed to survive both.
 *
 * So uploads live at MEDIA_ROOT — that persistent-disk mount point in
 * production, e.g. `/var/data/uploads` — and are served by the route handler
 * at /uploads/[...path]. Redis stores only the resulting URL plus width,
 * height and alt text; never the image bytes.
 */

/** Absolute path to the writable media root. */
export function uploadsRoot(): string {
  const configured = process.env.MEDIA_ROOT?.trim();
  if (configured) return path.resolve(configured);
  // Development default. Git-ignored, and fine locally because nothing
  // redeploys — in production MEDIA_ROOT must point at the persistent disk.
  return path.resolve(process.cwd(), "public", "uploads");
}

export const PUBLIC_PREFIX = "/uploads";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/** Magic-number sniffing — the declared Content-Type is attacker-controlled. */
function sniff(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  ) {
    return "image/png";
  }
  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  // AVIF/HEIF: 'ftyp' box with an avif-family brand.
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
  }
  return null;
}

export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB ?? 12);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** For the file picker's `accept` attribute — matches ALLOWED_MIME exactly. */
export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,image/avif";

/** Only these characters survive into a path segment. */
function safeSegment(input: string, fallback: string): string {
  const cleaned = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return cleaned || fallback;
}

/**
 * Sanitises a folder path one segment at a time, so "projects/signal-router"
 * stays a real directory instead of collapsing into one flattened name. Depth
 * is capped, and ".." can never survive because only [a-z0-9-] is kept.
 */
function safeFolder(input: string, fallback: string): string {
  const segments = input
    .split("/")
    .map((part) => safeSegment(part, ""))
    .filter(Boolean)
    .slice(0, 3);
  return segments.length ? segments.join("/") : fallback;
}

/**
 * Resolves a relative path inside the uploads root, refusing to escape it.
 * Every filesystem operation in this module goes through here.
 */
export function resolveInsideUploads(relative: string): string | null {
  const root = uploadsRoot();
  // Reject NUL bytes and absolute paths before they reach the filesystem.
  if (relative.includes("\0") || path.isAbsolute(relative)) return null;

  const resolved = path.resolve(root, relative);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(rootWithSep)) return null;
  return resolved;
}

export type StoredImage = {
  /** Site-relative URL, e.g. /uploads/projects/sehatconnect/hero-9f2a.webp */
  url: string;
  /** Path relative to the uploads root, for filesystem operations. */
  path: string;
  width: number;
  height: number;
  bytes: number;
  contentType: string;
};

export type UploadFailure = { error: string };

/**
 * Validates, optimises and writes one image.
 *
 * The stored file is always WebP: storage on a shared plan is limited, and a
 * single modern format keeps the directory predictable. Originals are not
 * retained — next/image derives every size it needs from this one.
 */
export async function storeImage(
  file: File,
  folder: string,
  basename: string,
): Promise<StoredImage | UploadFailure> {
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `Images must be ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB or smaller.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const sniffed = sniff(buffer);
  if (!sniffed || !ALLOWED_MIME.has(sniffed)) {
    return { error: "Only JPEG, PNG, WebP and AVIF images are accepted." };
  }
  // The declared type must agree with the bytes; a mismatch is a red flag.
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return { error: "Only JPEG, PNG, WebP and AVIF images are accepted." };
  }

  let pipeline: Sharp;
  let meta: Metadata;
  try {
    // failOn: "error" makes sharp reject malformed files rather than guess.
    pipeline = sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 });
    meta = await pipeline.metadata();
  } catch {
    return { error: "That image could not be read." };
  }

  if (!meta.width || !meta.height) return { error: "That image has no dimensions." };

  // Cap the longest edge. Beyond this adds storage, not quality.
  const MAX_EDGE = 2400;
  const resized =
    meta.width > MAX_EDGE || meta.height > MAX_EDGE
      ? pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      : pipeline;

  let output: Buffer;
  let width: number;
  let height: number;
  try {
    const result = await resized
      .rotate() // honour EXIF orientation, then drop the metadata
      .webp({ quality: 82, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    output = result.data;
    width = result.info.width;
    height = result.info.height;
  } catch {
    return { error: "That image could not be processed." };
  }

  const folderSegment = safeFolder(folder, "misc");
  const nameSegment = safeSegment(basename, "image");
  // A random suffix makes the URL content-addressed enough to cache forever
  // and stops a re-upload from being served from a stale cache.
  const filename = `${nameSegment}-${randomBytes(4).toString("hex")}.webp`;
  const relative = path.join(...folderSegment.split("/"), filename);

  const absolute = resolveInsideUploads(relative);
  if (!absolute) return { error: "Invalid upload path." };

  try {
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, output, { mode: 0o644 });
  } catch {
    return {
      error:
        "Could not write to the uploads directory. Check that MEDIA_ROOT exists and is writable.",
    };
  }

  return {
    url: `${PUBLIC_PREFIX}/${relative.split(path.sep).join("/")}`,
    path: relative.split(path.sep).join("/"),
    width,
    height,
    bytes: output.byteLength,
    contentType: "image/webp",
  };
}

/** Deletes one stored file. Missing files are not an error. */
export async function deleteStoredFile(relative: string): Promise<boolean> {
  const absolute = resolveInsideUploads(relative);
  if (!absolute) return false;
  try {
    await rm(absolute, { force: true });
    return true;
  } catch {
    return false;
  }
}

export async function uploadsDirWritable(): Promise<boolean> {
  const root = uploadsRoot();
  try {
    if (!existsSync(root)) await mkdir(root, { recursive: true });
    const probe = path.join(root, `.write-probe-${randomBytes(3).toString("hex")}`);
    await writeFile(probe, "ok");
    await rm(probe, { force: true });
    return true;
  } catch {
    return false;
  }
}

export async function fileStats(relative: string) {
  const absolute = resolveInsideUploads(relative);
  if (!absolute) return null;
  try {
    return await stat(absolute);
  } catch {
    return null;
  }
}
