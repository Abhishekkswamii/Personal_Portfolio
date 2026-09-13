import { seed } from "./seed";
import type { Project, SiteContent, SiteSettings } from "./types";

/**
 * The one place the public site reads content from.
 *
 * The site is a static export — there is no database, so this always
 * resolves to the bundled seed. Kept as its own module (rather than
 * importing `seed` directly in pages) so a future content source only
 * needs to change here.
 */

/**
 * Environment overrides, applied on top of the seed so a deployment can set
 * the form URL and site URL without editing the seed itself.
 */
function withEnv(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    contactFormUrl: settings.contactFormUrl || (process.env.CONTACT_FORM_URL ?? ""),
    siteUrl: settings.siteUrl || (process.env.NEXT_PUBLIC_SITE_URL ?? ""),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  return { ...seed, settings: withEnv(seed.settings) };
}

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
