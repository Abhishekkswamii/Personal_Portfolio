"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  del,
  getJSON,
  getManyJSON,
  keys,
  setJSON,
  transaction,
  zAddOrUpdate,
  zCard,
  zRange,
  zRem,
  zReplaceAll,
  zScore,
} from "@/lib/redis/client";
import { isRedisConfigured } from "@/lib/redis/config";
import {
  assertSameOrigin,
  createSession,
  destroySession,
  getSessionUser,
  isAuthConfigured,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";
import { deleteStoredFile, storeImage } from "@/lib/storage/uploads";
import {
  isCollectionKey,
  isSingletonKey,
  slugify,
  type CollectionKey,
} from "@/lib/admin/schema";
import { INDEX_KEY, DOC_KEY } from "@/lib/admin/data";
import { seed } from "@/lib/content/seed";

export type ActionResult = { ok: boolean; message: string };

/* ==========================================================================
   AUTHORISATION
   Every mutation starts here. No session, no write — and the collection must
   be in the schema allowlist, so a crafted form post cannot reach anything
   else. Table names never reach a query string here (there's no query
   language to inject into), but the allowlist still matters: it's what stops
   a forged request from writing into a Redis key this app doesn't expect.
   ========================================================================== */

type Guard = { ok: true } | { ok: false; message: string };

function isKnownCollection(v: string): v is CollectionKey | "profile" | "site_settings" | "media" {
  return isCollectionKey(v) || isSingletonKey(v) || v === "media";
}

async function authorize(collection?: string): Promise<Guard> {
  if (!isRedisConfigured) {
    return { ok: false, message: "No database is configured." };
  }
  const user = await getSessionUser();
  if (!user) return { ok: false, message: "Your session has expired. Sign in again." };

  if (!(await assertSameOrigin())) {
    return { ok: false, message: "Request rejected: origin mismatch." };
  }

  if (collection && !isKnownCollection(collection)) {
    return { ok: false, message: "Unknown collection." };
  }
  return { ok: true };
}

function revalidateEverything() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
}

function failure(e: unknown, fallback: string): ActionResult {
  const message = e instanceof Error ? e.message : fallback;
  // Surface real problems, but never leak a connection string or a stack trace.
  return { ok: false, message: message.slice(0, 240) };
}

/* ==========================================================================
   AUTH
   ========================================================================== */

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthConfigured()) {
    return { ok: false, message: "AUTH_SECRET is not set on the server." };
  }
  if (!isRedisConfigured) {
    return { ok: false, message: "REDIS_URL is not set on the server." };
  }
  if (!(await assertSameOrigin())) {
    return { ok: false, message: "Request rejected: origin mismatch." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  // Throttle per client IP and per account, so neither a single address nor a
  // single target can be hammered.
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  for (const key of [`ip:${ip}`, `email:${email}`]) {
    const limit = checkRateLimit(key);
    if (!limit.allowed) {
      return {
        ok: false,
        message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
      };
    }
  }

  const account = await getJSON<{ email: string; name: string | null; passwordHash: string }>(
    keys.adminUser(email),
  );

  // Always run a verification, even with no account, so response time doesn't
  // reveal whether the address exists.
  const stored = account?.passwordHash ?? "scrypt$16384$8$1$00000000000000000000000000000000$00";
  const valid = await verifyPassword(password, stored);

  if (!account || !valid) {
    return { ok: false, message: "Those details weren't recognised." };
  }

  clearRateLimit(`ip:${ip}`);
  clearRateLimit(`email:${email}`);

  await createSession({ email: account.email, name: account.name });
  await setJSON(keys.adminUser(email), { ...account, lastLoginAt: new Date().toISOString() });

  redirect("/admin");
}

export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}

/* ==========================================================================
   RECORDS
   One entry point for both shapes the admin edits: the two fixed singleton
   documents (profile, site settings) and the seven ordered collections.
   RecordForm always calls this, and doesn't need to know which kind of
   record it's holding — that's decided here, from the schema allowlist.
   ========================================================================== */

/** Picks a unique id for a new record, preferring a readable slug. */
async function uniqueId(collection: CollectionKey, base: string): Promise<string> {
  const wanted = slugify(base) || `rec-${Date.now().toString(36)}`;
  const existingIds = new Set(await zRange(INDEX_KEY[collection]));
  if (!existingIds.has(wanted)) return wanted;
  let i = 2;
  while (existingIds.has(`${wanted}-${i}`)) i += 1;
  return `${wanted}-${i}`;
}

export async function saveRecord(
  collection: string,
  id: string | null,
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  const guard = await authorize(collection);
  if (!guard.ok) return guard;

  if (isSingletonKey(collection)) {
    try {
      const redisKey = collection === "profile" ? keys.profile : keys.settings;
      const fallback = collection === "profile" ? seed.profile : seed.settings;
      const existing = (await getJSON<Record<string, unknown>>(redisKey)) ?? fallback;
      await setJSON(redisKey, { ...existing, ...payload });
      revalidateEverything();
      return { ok: true, message: "Saved." };
    } catch (e) {
      return failure(e, "Could not save.");
    }
  }

  if (!isCollectionKey(collection)) return { ok: false, message: "Unknown collection." };

  try {
    const docKey = DOC_KEY[collection];
    const indexKey = INDEX_KEY[collection];
    const values = { ...payload };

    if (collection === "projects") {
      const slug = slugify(String(values.slug ?? values.title ?? ""));
      if (!slug) return { ok: false, message: "A project needs a title or a slug." };

      // Slugs are public URLs; a collision would make one project's page
      // silently show another's content.
      const others = await getManyJSON<{ id: string; slug: string }>(
        (await zRange(indexKey)).filter((existingId) => existingId !== id).map(docKey),
      );
      if (others.some((p) => p?.slug === slug)) {
        return { ok: false, message: "That slug is already used by another project." };
      }
      values.slug = slug;
    }

    const isNew = !id;
    const recordId = id || (await uniqueId(collection, String(
      values.slug ?? values.title ?? values.label ?? values.company ?? "",
    )));

    const existing = isNew ? null : await getJSON<Record<string, unknown>>(docKey(recordId));
    const doc: Record<string, unknown> = { ...existing, ...values, id: recordId };
    if (!("published" in doc)) doc.published = false;

    await setJSON(docKey(recordId), doc);

    // New records join at the end; edits keep their existing position.
    const score = isNew ? (await zCard(indexKey)) + 1 : ((await zScore(indexKey, recordId)) ?? (await zCard(indexKey)) + 1);
    await zAddOrUpdate(indexKey, recordId, score);

    revalidateEverything();
    return { ok: true, message: "Saved." };
  } catch (e) {
    return failure(e, "Could not save.");
  }
}

export async function deleteRecord(collection: string, id: string): Promise<ActionResult> {
  const guard = await authorize(collection);
  if (!guard.ok) return guard;
  if (!isCollectionKey(collection)) return { ok: false, message: "Unknown collection." };

  try {
    await del(DOC_KEY[collection](id));
    await zRem(INDEX_KEY[collection], id);
    revalidateEverything();
    return { ok: true, message: "Deleted." };
  } catch (e) {
    return failure(e, "Could not delete.");
  }
}

export async function duplicateRecord(collection: string, id: string): Promise<ActionResult> {
  const guard = await authorize(collection);
  if (!guard.ok) return guard;
  if (!isCollectionKey(collection)) return { ok: false, message: "Not a collection." };

  try {
    const docKey = DOC_KEY[collection];
    const indexKey = INDEX_KEY[collection];
    const original = await getJSON<Record<string, unknown>>(docKey(id));
    if (!original) return { ok: false, message: "Could not read the original." };

    const suffix = Date.now().toString(36).slice(-4);
    const newId = `${id}-copy-${suffix}`;
    const copy: Record<string, unknown> = {
      ...original,
      id: newId,
      published: false, // a duplicate always starts as a draft
    };
    if ("slug" in copy) copy.slug = `${copy.slug}-copy-${suffix}`;
    if ("title" in copy) copy.title = `${copy.title} (copy)`;

    await setJSON(docKey(newId), copy);
    await zAddOrUpdate(indexKey, newId, (await zCard(indexKey)) + 1);

    revalidateEverything();
    return { ok: true, message: "Duplicated as a draft." };
  } catch (e) {
    return failure(e, "Could not duplicate.");
  }
}

export async function setPublished(
  collection: string,
  id: string,
  published: boolean,
): Promise<ActionResult> {
  const guard = await authorize(collection);
  if (!guard.ok) return guard;
  if (!isCollectionKey(collection)) return { ok: false, message: "Unknown collection." };

  try {
    const docKey = DOC_KEY[collection](id);
    const doc = await getJSON<Record<string, unknown>>(docKey);
    if (!doc) return { ok: false, message: "That record no longer exists." };
    await setJSON(docKey, { ...doc, published });
    revalidateEverything();
    return { ok: true, message: published ? "Published." : "Moved to drafts." };
  } catch (e) {
    return failure(e, "Could not change the publish state.");
  }
}

export async function reorderRecords(
  collection: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const guard = await authorize(collection);
  if (!guard.ok) return guard;
  if (!isCollectionKey(collection)) return { ok: false, message: "Unknown collection." };

  try {
    const indexKey = INDEX_KEY[collection];
    await zReplaceAll(indexKey, orderedIds);
    revalidateEverything();
    return { ok: true, message: "Order saved." };
  } catch (e) {
    return failure(e, "Could not save the new order.");
  }
}

/* ==========================================================================
   MEDIA
   ========================================================================== */

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult & { url?: string; width?: number; height?: number }> {
  const guard = await authorize("media");
  if (!guard.ok) return guard;

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Choose a file to upload." };

  const folder = String(formData.get("folder") ?? "media");
  const basename = String(formData.get("basename") ?? file.name.replace(/\.[^.]+$/, ""));

  // storeImage validates by magic number, re-encodes with sharp and writes
  // under a generated filename — the uploaded name never touches the path.
  const stored = await storeImage(file, folder, basename);
  if ("error" in stored) return { ok: false, message: stored.error };

  try {
    const id = crypto.randomUUID();
    await setJSON(keys.media(id), {
      id,
      path: stored.path,
      url: stored.url,
      alt: String(formData.get("alt") ?? ""),
      width: stored.width,
      height: stored.height,
      sizeBytes: stored.bytes,
      contentType: stored.contentType,
      createdAt: Date.now(),
    });
    await zAddOrUpdate(keys.mediaIndex, id, Date.now());
  } catch {
    // The file is on disk and usable; only the library index failed.
    return {
      ok: true,
      message: "Uploaded, but it could not be added to the media library.",
      url: stored.url,
      width: stored.width,
      height: stored.height,
    };
  }

  revalidateEverything();
  return {
    ok: true,
    message: "Uploaded.",
    url: stored.url,
    width: stored.width,
    height: stored.height,
  };
}

export async function deleteMedia(id: string, path: string): Promise<ActionResult> {
  const guard = await authorize("media");
  if (!guard.ok) return guard;
  try {
    await deleteStoredFile(path);
    await del(keys.media(id));
    await zRem(keys.mediaIndex, id);
    revalidateEverything();
    return { ok: true, message: "Deleted." };
  } catch (e) {
    return failure(e, "Could not delete.");
  }
}

/* ==========================================================================
   FIRST RUN
   ========================================================================== */

/**
 * Writes the bundled seed into an empty database so the admin opens with the
 * real site already in it. Refuses to run if any project exists, so it can
 * never overwrite edited content.
 */
export async function seedDatabase(): Promise<ActionResult> {
  const guard = await authorize();
  if (!guard.ok) return guard;

  try {
    const existingCount = await zCard(keys.projectsIndex);
    if (existingCount > 0) {
      return { ok: false, message: "The database already has content — not overwriting it." };
    }

    await transaction((multi) => {
      multi.set(keys.profile, JSON.stringify(seed.profile));
      multi.set(keys.settings, JSON.stringify(seed.settings));

      for (const p of seed.projects) {
        multi.set(keys.project(p.id), JSON.stringify(p));
        multi.zAdd(keys.projectsIndex, { score: p.sortOrder, value: p.id });
      }
      for (const e of seed.experiences) {
        multi.set(keys.experience(e.id), JSON.stringify(e));
        multi.zAdd(keys.experiencesIndex, { score: e.sortOrder, value: e.id });
      }
      for (const s of seed.services) {
        multi.set(keys.service(s.id), JSON.stringify(s));
        multi.zAdd(keys.servicesIndex, { score: s.sortOrder, value: s.id });
      }
      for (const c of seed.skillCategories) {
        multi.set(keys.skillCategory(c.id), JSON.stringify(c));
        multi.zAdd(keys.skillCategoriesIndex, { score: c.sortOrder, value: c.id });
      }
      for (const ed of seed.education) {
        multi.set(keys.education(ed.id), JSON.stringify(ed));
        multi.zAdd(keys.educationIndex, { score: ed.sortOrder, value: ed.id });
      }
      if (seed.patent) {
        multi.set(keys.patent(seed.patent.id), JSON.stringify(seed.patent));
        multi.zAdd(keys.patentsIndex, { score: 1, value: seed.patent.id });
      }
      for (const soc of seed.socials) {
        multi.set(keys.social(soc.id), JSON.stringify(soc));
        multi.zAdd(keys.socialsIndex, { score: soc.sortOrder, value: soc.id });
      }
    });

    revalidateEverything();
    return { ok: true, message: "Database seeded with your current content." };
  } catch (e) {
    return failure(e, "Seeding failed.");
  }
}
