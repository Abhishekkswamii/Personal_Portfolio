/**
 * The content model.
 *
 * Every string, image and ordering on the public site comes from these types.
 * Components render them; they never contain copy of their own. The admin
 * writes them; Redis stores them; `repository.ts` reads them.
 *
 * Optional fields are genuinely optional — the public site hides the
 * corresponding element rather than rendering an empty heading or a broken
 * image. Treat `null` and `""` as "not provided".
 */

export type ImageRef = {
  url: string;
  alt: string;
  /** Intrinsic dimensions, so next/image can reserve space and avoid CLS. */
  width: number;
  height: number;
};

export type ProjectImages = {
  thumbnail: ImageRef | null;
  hero: ImageRef | null;
  architecture: ImageRef | null;
  gallery: ImageRef[];
};

export type ArchitectureStep = { step: string; detail: string };

export type Project = {
  id: string;
  slug: string;
  /** Display number. Data-driven, so project 04 needs no code change. */
  number: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  period: string;
  summary: string;
  technologies: string[];
  highlights: string[];
  problem: string;
  approach: string[];
  architecture: ArchitectureStep[];
  /** Free-form extra detail. Hidden entirely when absent. */
  details: string | null;
  outcomes: string | null;
  images: ProjectImages;
  links: {
    github: string | null;
    live: string | null;
  };
  /** Fallback drawing used until a real image is uploaded. */
  diagram: "sehat" | "vyapariq" | "fileint" | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  secondary: string;
  lede: string;
  bio: string[];
  availability: string;
  availabilityOpen: boolean;
  email: string;
  phone: string | null;
  location: string;
  image: ImageRef | null;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  handle: string | null;
  sortOrder: number;
  published: boolean;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  period: string;
  current: boolean;
  points: string[];
  sortOrder: number;
  published: boolean;
};

export type Service = {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string | null;
  capabilities: string[];
  sortOrder: number;
  published: boolean;
};

export type SkillCategory = {
  id: string;
  title: string;
  skills: string[];
  sortOrder: number;
  published: boolean;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  grade: string | null;
  period: string;
  description: string | null;
  sortOrder: number;
  published: boolean;
};

export type Patent = {
  id: string;
  title: string;
  type: string;
  description: string;
  applicationNumber: string;
  status: string | null;
  year: string | null;
  published: boolean;
};

export type SiteSettings = {
  siteTitle: string;
  seoTitle: string;
  seoDescription: string;
  /** Google Form embed URL. Empty disables the modal and falls back to email. */
  contactFormUrl: string;
  contactFormHeading: string;
  contactFormBlurb: string;
  contactHeadline: string[];
  footerText: string;
  /** Absolute site URL, used for metadataBase and canonicals. */
  siteUrl: string;
};

/** Everything the public site needs, resolved in one pass. */
export type SiteContent = {
  profile: Profile;
  settings: SiteSettings;
  socials: SocialLink[];
  projects: Project[];
  experiences: Experience[];
  services: Service[];
  skillCategories: SkillCategory[];
  education: Education[];
  patent: Patent | null;
  /** True when the data came from the database rather than the bundled seed. */
  live: boolean;
};

/* -- Helpers the UI uses to decide whether to render at all -------------- */

export const hasText = (v: string | null | undefined): v is string =>
  typeof v === "string" && v.trim().length > 0;

export const hasItems = <T,>(v: T[] | null | undefined): v is T[] =>
  Array.isArray(v) && v.length > 0;

export const hasImage = (v: ImageRef | null | undefined): v is ImageRef =>
  !!v && hasText(v.url) && v.width > 0 && v.height > 0;

/** Shown wherever a case-study field was never filled in. Never invented. */
export const DETAILS_ON_REQUEST = "Details available on request.";
