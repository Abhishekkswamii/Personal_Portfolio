import "server-only";

import { cache } from "react";
import { getJSON, getManyJSON, keys, zRange } from "@/lib/redis/client";
import { isRedisConfigured } from "@/lib/redis/config";
import { seed } from "./seed";
import type {
  Education,
  Experience,
  Patent,
  Profile,
  Project,
  Service,
  SiteContent,
  SiteSettings,
  SkillCategory,
  SocialLink,
} from "./types";

/**
 * The one place the public site reads content from.
 *
 * If Redis answers, use it. Otherwise fall back to the bundled seed — an
 * outage degrades to last-known-good content rather than an error page,
 * because a portfolio should never be down because its backend is.
 *
 * Every document is written by the admin in exactly the shape these types
 * expect (see actions.ts), so reading is mostly "parse and fall back to the
 * default for anything missing" rather than field-by-field coercion — the
 * MySQL/Supabase versions of this file needed that coercion because a SQL row
 * doesn't know your TypeScript types; a JSON document already does.
 *
 * `cache()` dedupes within one render pass, so a whole page costs one round
 * trip of Redis calls regardless of how many sections ask for content.
 */

const bool = (v: unknown, fallback = false) =>
  typeof v === "boolean" ? v : fallback;
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const list = <T>(v: unknown, fallback: T[] = []) => (Array.isArray(v) ? (v as T[]) : fallback);

function withPublishedDefault<T extends { published?: unknown }>(
  docs: (T | null)[],
): (T & { published: boolean })[] {
  return docs
    .filter((d): d is T => d !== null)
    .map((d) => ({ ...d, published: bool(d.published, true) }));
}

/**
 * Environment overrides, applied on every path — seed or Redis — so a
 * deployment can set the form URL and site URL before any content exists.
 * A value stored in Redis still wins over the environment.
 */
function withEnv(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    contactFormUrl: settings.contactFormUrl || (process.env.CONTACT_FORM_URL ?? ""),
    siteUrl: settings.siteUrl || (process.env.NEXT_PUBLIC_SITE_URL ?? ""),
  };
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const fallback: SiteContent = { ...seed, settings: withEnv(seed.settings) };
  if (!isRedisConfigured) return fallback;

  try {
    const [
      profile,
      settings,
      projectIds,
      experienceIds,
      serviceIds,
      skillCategoryIds,
      educationIds,
      patentIds,
      socialIds,
    ] = await Promise.all([
      getJSON<Profile>(keys.profile),
      getJSON<SiteSettings>(keys.settings),
      zRange(keys.projectsIndex),
      zRange(keys.experiencesIndex),
      zRange(keys.servicesIndex),
      zRange(keys.skillCategoriesIndex),
      zRange(keys.educationIndex),
      zRange(keys.patentsIndex),
      zRange(keys.socialsIndex),
    ]);

    // No profile AND no projects — Redis is either unreachable or genuinely
    // empty. Either way the seed is the right thing to show.
    if (!profile && projectIds.length === 0) return fallback;

    const [projects, experiences, services, skillCategories, education, patents, socials] =
      await Promise.all([
        getManyJSON<Project>(projectIds.map(keys.project)),
        getManyJSON<Experience>(experienceIds.map(keys.experience)),
        getManyJSON<Service>(serviceIds.map(keys.service)),
        getManyJSON<SkillCategory>(skillCategoryIds.map(keys.skillCategory)),
        getManyJSON<Education>(educationIds.map(keys.education)),
        getManyJSON<Patent>(patentIds.map(keys.patent)),
        getManyJSON<SocialLink>(socialIds.map(keys.social)),
      ]);

    const content: SiteContent = {
      live: true,
      profile: profile ?? seed.profile,
      settings: withEnv(settings ?? seed.settings),
      // The sorted set is already the order; only publication needs filtering.
      projects: withPublishedDefault(projects).filter((p) => p.published),
      experiences: withPublishedDefault(experiences).filter((e) => e.published),
      services: withPublishedDefault(services).filter((s) => s.published),
      skillCategories: withPublishedDefault(skillCategories).filter((c) => c.published),
      education: withPublishedDefault(education).filter((e) => e.published),
      patent: withPublishedDefault(patents).filter((p) => p.published)[0] ?? null,
      socials: withPublishedDefault(socials).filter((s) => s.published),
    };

    // An empty collection shouldn't produce an empty section before the
    // database has been seeded — the bundled content still stands in.
    if (!content.projects.length) content.projects = seed.projects;
    if (!content.socials.length) content.socials = seed.socials;
    if (!content.experiences.length) content.experiences = seed.experiences;
    if (!content.services.length) content.services = seed.services;
    if (!content.skillCategories.length) content.skillCategories = seed.skillCategories;
    if (!content.education.length) content.education = seed.education;
    if (!content.patent) content.patent = seed.patent;

    return content;
  } catch {
    return fallback;
  }
});

export async function getProject(slug: string): Promise<Project | null> {
  const { projects } = await getSiteContent();
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getAdjacentProject(slug: string): Promise<Project | null> {
  const { projects } = await getSiteContent();
  if (projects.length < 2) return null;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  return projects[(i + 1) % projects.length];
}

// Re-exported so callers that only need type coercion helpers (str/list/bool)
// for admin-side reads don't need to duplicate them.
export { bool as redisBool, str as redisStr, list as redisList };
