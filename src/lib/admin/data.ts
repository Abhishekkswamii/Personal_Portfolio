import "server-only";

import { getJSON, getManyJSON, keys, zRange, zCard } from "@/lib/redis/client";
import { isRedisConfigured } from "@/lib/redis/config";
import { COLLECTION_LIST, type CollectionKey } from "./schema";

/**
 * Raw document access for the admin.
 *
 * The public repository filters to published rows and applies environment
 * overrides; the admin needs the documents exactly as stored, including
 * drafts, so the generated forms round-trip every field untouched.
 */

export type Row = Record<string, unknown>;

const INDEX_KEY: Record<CollectionKey, string> = {
  projects: keys.projectsIndex,
  experiences: keys.experiencesIndex,
  services: keys.servicesIndex,
  skill_categories: keys.skillCategoriesIndex,
  education: keys.educationIndex,
  patents: keys.patentsIndex,
  social_links: keys.socialsIndex,
};

const DOC_KEY: Record<CollectionKey, (id: string) => string> = {
  projects: keys.project,
  experiences: keys.experience,
  services: keys.service,
  skill_categories: keys.skillCategory,
  education: keys.education,
  patents: keys.patent,
  social_links: keys.social,
};

export function collectionByRoute(route: string) {
  return COLLECTION_LIST.find((c) => c.route === route) ?? null;
}

export async function listRows(collection: CollectionKey): Promise<Row[]> {
  if (!isRedisConfigured) return [];
  const ids = await zRange(INDEX_KEY[collection]);
  const docs = await getManyJSON<Row>(ids.map(DOC_KEY[collection]));
  return docs.filter((d): d is Row => d !== null);
}

export async function getRow(collection: CollectionKey, id: string): Promise<Row | null> {
  if (!isRedisConfigured) return null;
  return getJSON<Row>(DOC_KEY[collection](id));
}

export async function getSingleton(key: "profile" | "site_settings"): Promise<Row | null> {
  if (!isRedisConfigured) return null;
  return getJSON<Row>(key === "profile" ? keys.profile : keys.settings);
}

export async function listMedia(): Promise<Row[]> {
  if (!isRedisConfigured) return [];
  // The index score is the upload timestamp, ascending — reverse it so the
  // library reads newest first, the order that matters when you're looking
  // for the image you just uploaded.
  const ids = await zRange(keys.mediaIndex);
  const docs = await getManyJSON<Row>(ids.map(keys.media));
  return docs.filter((d): d is Row => d !== null).reverse();
}

export async function countRows(collection: CollectionKey): Promise<number> {
  if (!isRedisConfigured) return 0;
  return zCard(INDEX_KEY[collection]);
}

/**
 * URLs currently referenced by content. The media library uses this to flag
 * files nothing points at — replacing an image leaves the old one on disk,
 * and that storage is worth reclaiming deliberately.
 */
export async function referencedImageUrls(): Promise<Set<string>> {
  if (!isRedisConfigured) return new Set();
  const used = new Set<string>();

  const projects = await listRows("projects");
  for (const p of projects) {
    const images = p.images as
      | { thumbnail?: { url?: string } | null; hero?: { url?: string } | null; architecture?: { url?: string } | null; gallery?: { url?: string }[] }
      | undefined;
    if (!images) continue;
    for (const img of [images.thumbnail, images.hero, images.architecture, ...(images.gallery ?? [])]) {
      if (img?.url) used.add(img.url);
    }
  }

  const profile = await getSingleton("profile");
  const profileImage = profile?.image as { url?: string } | null | undefined;
  if (profileImage?.url) used.add(profileImage.url);

  return used;
}

export { INDEX_KEY, DOC_KEY };
