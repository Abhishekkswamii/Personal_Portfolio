/**
 * Declarative admin schema.
 *
 * Every editor screen — forms, list columns, validation, defaults — is
 * generated from these definitions. Adding a field is a one-line change here,
 * not a new form component.
 *
 * Field names are camelCase and match `content/types.ts` exactly — the admin
 * writes a Redis document in precisely the shape the public site reads, so
 * there is no column-name translation layer anywhere between the form and
 * the stored JSON.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "list"
  | "paragraphs"
  | "image"
  | "gallery"
  | "steps"
  | "url"
  | "email";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  required?: boolean;
  /** Lay out side by side on wide screens. */
  half?: boolean;
};

export type CollectionKey =
  | "projects"
  | "experiences"
  | "services"
  | "skill_categories"
  | "education"
  | "patents"
  | "social_links";

export type SingletonKey = "profile" | "site_settings";

export type Collection = {
  key: CollectionKey;
  /** The allowlist server actions check against — nothing can write outside it. */
  table: CollectionKey;
  /** URL segment under /admin. */
  route: string;
  singular: string;
  plural: string;
  description: string;
  /** Field used as the row title in listings. */
  titleField: string;
  subtitleField?: string;
  /** Rows are ordered by their position in the collection's Redis sorted set. */
  orderable: boolean;
  /** Rows carry a published flag. */
  publishable: boolean;
  fields: Field[];
};

export const SINGLETONS: Record<SingletonKey, { route: string; title: string; description: string; fields: Field[] }> = {
  profile: {
    route: "profile",
    title: "Profile",
    description: "Your name, title, bio, availability and contact details.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true },
      { name: "title", label: "Professional title", type: "text", required: true, half: true, help: "Shown in the hero and as the page subtitle." },
      { name: "secondary", label: "Secondary line", type: "text", half: true, placeholder: "AI · Full-Stack · Systems" },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "lede", label: "Hero statement", type: "textarea", help: "One sentence, under the name. Keep it short — it sits at large type." },
      { name: "bio", label: "About paragraphs", type: "paragraphs", help: "One paragraph per block. The first is set larger than the rest." },
      { name: "availability", label: "Availability label", type: "text", half: true, placeholder: "Available for opportunities" },
      { name: "availabilityOpen", label: "Currently available", type: "boolean", half: true, help: "Off turns the status dot grey and stops it pulsing." },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone", type: "text", half: true, help: "Not shown on the public site. Stored for your reference." },
      { name: "image", label: "Portrait", type: "image", help: "Use a cut-out on a transparent background — it overlaps the hero typography." },
    ],
  },
  site_settings: {
    route: "settings",
    title: "Site settings",
    description: "Titles, SEO, the contact form and footer.",
    fields: [
      { name: "siteTitle", label: "Site title", type: "text", half: true },
      { name: "siteUrl", label: "Site URL", type: "url", half: true, help: "Used for canonical links and social previews." },
      { name: "seoTitle", label: "SEO title", type: "text", help: "Shown in search results and the browser tab." },
      { name: "seoDescription", label: "SEO description", type: "textarea", help: "Aim for 150–160 characters." },
      { name: "contactFormUrl", label: "Google Form URL", type: "url", help: "Open your form → Send → < > and copy the src. The embed parameter is added automatically. Leave blank and “Let’s talk” opens an email instead." },
      { name: "contactFormHeading", label: "Contact form heading", type: "text", half: true },
      { name: "contactFormBlurb", label: "Contact form blurb", type: "textarea", half: true },
      { name: "contactHeadline", label: "Contact headline", type: "list", help: "One line per entry — they stack as separate lines of large type." },
      { name: "footerText", label: "Footer line", type: "text" },
    ],
  },
};

export const COLLECTIONS: Record<CollectionKey, Collection> = {
  projects: {
    key: "projects",
    table: "projects",
    route: "projects",
    singular: "Project",
    plural: "Projects",
    description: "Case studies. Order here is the order on the homepage.",
    titleField: "title",
    subtitleField: "subtitle",
    orderable: true,
    publishable: true,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "slug", label: "Slug", type: "text", required: true, half: true, help: "The URL: /work/your-slug. Lowercase, hyphens, no spaces." },
      { name: "number", label: "Project number", type: "text", half: true, placeholder: "01" },
      { name: "category", label: "Category", type: "text", half: true, placeholder: "AI / Healthcare" },
      { name: "year", label: "Year", type: "text", half: true, placeholder: "2026" },
      { name: "period", label: "Period", type: "text", half: true, placeholder: "Jan 2026 — Feb 2026" },
      { name: "subtitle", label: "Subtitle", type: "text", help: "The full descriptive name, under the title." },
      { name: "summary", label: "Summary", type: "textarea", help: "Two sentences. Used on the homepage card and as the case-study opener." },
      { name: "technologies", label: "Technologies", type: "list" },
      { name: "highlights", label: "Highlights", type: "list", help: "What you actually built. One per line." },
      { name: "problem", label: "Problem", type: "textarea", help: "What made this hard. Left blank, the section is hidden." },
      { name: "approach", label: "Approach", type: "list", help: "One decision per entry." },
      { name: "architecture", label: "Architecture", type: "steps", help: "Each step has a name and a detail." },
      { name: "details", label: "Project details", type: "textarea", help: "Left blank, the public page shows “Details available on request.” rather than inventing anything." },
      { name: "outcomes", label: "Outcomes", type: "textarea", help: "Only fill this in with things you can substantiate." },
      { name: "images", label: "Images", type: "gallery", help: "Thumbnail for the homepage, hero for the case study, plus an optional gallery." },
      { name: "links", label: "Links", type: "richtext", help: "Source and live URLs. Blank links are hidden." },
      { name: "featured", label: "Featured", type: "boolean", half: true },
      { name: "diagram", label: "Fallback diagram", type: "text", half: true, help: "sehat · medguard · fileint — the drawn schematic shown until you upload an image. Blank shows a plain placeholder." },
    ],
  },

  experiences: {
    key: "experiences",
    table: "experiences",
    route: "experience",
    singular: "Role",
    plural: "Experience",
    description: "Roles and internships, newest first.",
    titleField: "company",
    subtitleField: "role",
    orderable: true,
    publishable: true,
    fields: [
      { name: "company", label: "Company", type: "text", required: true, half: true },
      { name: "role", label: "Role", type: "text", required: true, half: true },
      { name: "period", label: "Period", type: "text", half: true, placeholder: "Jul 2026 — Present" },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "current", label: "Current role", type: "boolean", help: "Marks the row with the accent dot." },
      { name: "points", label: "Responsibilities", type: "list", help: "Revealed on hover. One per line." },
    ],
  },

  services: {
    key: "services",
    table: "services",
    route: "services",
    singular: "Service",
    plural: "Services",
    description: "The “What I build” list.",
    titleField: "title",
    subtitleField: "description",
    orderable: true,
    publishable: true,
    fields: [
      { name: "number", label: "Number", type: "text", half: true, placeholder: "01" },
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "description", label: "Description", type: "textarea", help: "One line, shown on the closed row." },
      { name: "detail", label: "Detail", type: "textarea", help: "Revealed when the row opens." },
      { name: "capabilities", label: "Capabilities", type: "list" },
    ],
  },

  skill_categories: {
    key: "skill_categories",
    table: "skill_categories",
    route: "skills",
    singular: "Category",
    plural: "Skills",
    description: "Technology groups, set typographically.",
    titleField: "title",
    orderable: true,
    publishable: true,
    fields: [
      { name: "title", label: "Category", type: "text", required: true, half: true },
      { name: "skills", label: "Technologies", type: "list", help: "One per line. They render separated by middots." },
    ],
  },

  education: {
    key: "education",
    table: "education",
    route: "education",
    singular: "Entry",
    plural: "Education",
    description: "Shown alongside the About section.",
    titleField: "institution",
    subtitleField: "degree",
    orderable: true,
    publishable: true,
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "degree", label: "Degree", type: "text", half: true, placeholder: "B.Tech" },
      { name: "field", label: "Field", type: "text", half: true, placeholder: "Computer Science and Engineering" },
      { name: "grade", label: "Grade", type: "text", half: true, placeholder: "CGPA 7.01" },
      { name: "period", label: "Period", type: "text", half: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  patents: {
    key: "patents",
    table: "patents",
    route: "patent",
    singular: "Patent",
    plural: "Patents",
    description: "Filed patents, shown as an editorial credential.",
    titleField: "title",
    subtitleField: "type",
    orderable: false,
    publishable: true,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "type", label: "Type", type: "text", half: true, placeholder: "Design Patent" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "applicationNumber", label: "Application number", type: "text", half: true },
      { name: "status", label: "Status", type: "text", half: true, placeholder: "Filed" },
      { name: "year", label: "Year", type: "text", half: true },
    ],
  },

  social_links: {
    key: "social_links",
    table: "social_links",
    route: "social",
    singular: "Link",
    plural: "Social links",
    description: "Shown in the hero, contact section and footer.",
    titleField: "label",
    subtitleField: "url",
    orderable: true,
    publishable: true,
    fields: [
      { name: "label", label: "Label", type: "text", required: true, half: true, placeholder: "GitHub" },
      { name: "handle", label: "Handle", type: "text", half: true, help: "Shown beside the label in the contact section." },
      { name: "url", label: "URL", type: "url", required: true },
    ],
  },
};

export const COLLECTION_LIST = Object.values(COLLECTIONS);

export const isCollectionKey = (v: string): v is CollectionKey =>
  Object.prototype.hasOwnProperty.call(COLLECTIONS, v);

export const isSingletonKey = (v: string): v is SingletonKey =>
  Object.prototype.hasOwnProperty.call(SINGLETONS, v);

export const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
