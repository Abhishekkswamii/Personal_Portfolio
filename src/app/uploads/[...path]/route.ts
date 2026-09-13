import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { fileStats, resolveInsideUploads } from "@/lib/storage/uploads";

/**
 * Serves uploaded media from MEDIA_ROOT.
 *
 * Needed because the media directory deliberately sits outside the build —
 * Render's default filesystem is ephemeral, so `public/` cannot hold anything
 * a user adds after deploy. MEDIA_ROOT points at the mounted persistent disk
 * in production, and this route hands those files back over HTTP.
 *
 * Filenames carry a random suffix and are never rewritten in place, so the
 * response is immutable and can be cached indefinitely.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _request: Request,
  context: RouteContext<"/uploads/[...path]">,
) {
  const { path: segments } = await context.params;
  const relative = (segments ?? []).join("/");

  // resolveInsideUploads rejects traversal, absolute paths and NUL bytes.
  const absolute = resolveInsideUploads(relative);
  if (!absolute) return new Response("Not found", { status: 404 });

  const extension = relative.slice(relative.lastIndexOf(".")).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  // Only serve the image types this app writes — never arbitrary files.
  if (!contentType) return new Response("Not found", { status: 404 });

  const stats = await fileStats(relative);
  if (!stats || !stats.isFile()) return new Response("Not found", { status: 404 });

  const stream = Readable.toWeb(
    createReadStream(absolute),
  ) as unknown as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ETag: `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`,
    },
  });
}
