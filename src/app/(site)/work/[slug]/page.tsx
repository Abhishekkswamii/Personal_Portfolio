import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAdjacentProject,
  getProject,
  getSiteContent,
} from "@/lib/content/repository";
import {
  DETAILS_ON_REQUEST,
  hasItems,
  hasText,
  type Project,
} from "@/lib/content/types";
import { ProjectMedia, GalleryImage } from "@/components/ProjectMedia";
import { Reveal, RevealLine, RevealRule } from "@/components/Reveal";
import { Arrow, TextLink } from "@/components/ArrowLink";

export async function generateStaticParams() {
  const { projects } = await getSiteContent();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };

  const description = project.summary || project.subtitle;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/work/${project.slug}`,
      title: `${project.title} — ${project.subtitle}`,
      description,
      images: project.images.hero ? [{ url: project.images.hero.url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — ${project.subtitle}`,
      description,
    },
  };
}

/** A labelled band. Every section of the case study uses it, so they align. */
function Band({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-10 ${className}`}>
      <div className="md:col-span-3">
        <RevealRule />
        <Reveal y={10}>
          <h2 className="label mt-5 text-gray">{label}</h2>
        </Reveal>
      </div>
      <div className="md:col-span-8 md:col-start-5">{children}</div>
    </section>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((item, i) => (
        <Reveal as="li" key={item.slice(0, 32)} delay={i * 0.05} y={12}>
          <div className="flex gap-5 border-t border-rule py-5 md:gap-8 md:py-6">
            <span className="label mt-1 shrink-0 text-gray-light">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="max-w-[58ch] text-[0.9375rem] leading-[1.6] tracking-[-0.005em] text-ink/80 md:text-[1.0625rem]">
              {item}
            </p>
          </div>
        </Reveal>
      ))}
      <li className="border-t border-rule" />
    </ul>
  );
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  const next = await getAdjacentProject(slug);
  const facts: [string, string][] = [
    ["Project", project.number],
    ["Category", project.category],
    ["Period", project.period],
  ].filter((f): f is [string, string] => hasText(f[1]));

  const externalLinks = [
    project.links.github ? { label: "Source", url: project.links.github } : null,
    project.links.live ? { label: "Live", url: project.links.live } : null,
  ].filter((l): l is { label: string; url: string } => l !== null);

  return (
    <article className="pt-[calc(var(--nav-h)+2.25rem)] md:pt-[calc(var(--nav-h)+3.25rem)]">
      {/* -- Breadcrumb. Never a dead end. ------------------------------- */}
      <header className="shell">
        <Reveal y={10}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] tracking-[-0.01em]">
              <li>
                <Link
                  href="/"
                  data-cursor="link"
                  className="text-gray transition-colors duration-300 hover:text-ink"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-light">
                /
              </li>
              <li>
                <Link
                  href="/#work"
                  data-cursor="link"
                  className="group inline-flex items-center gap-2 text-gray transition-colors duration-300 hover:text-ink"
                >
                  <Arrow
                    direction="left"
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1"
                  />
                  Selected work
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-light">
                /
              </li>
              <li aria-current="page" className="text-ink">
                {project.title}
              </li>
            </ol>
          </nav>
        </Reveal>

        {facts.length ? (
          <Reveal y={10} className="mt-9 md:mt-12">
            <dl className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
              {facts.map(([term, value]) => (
                <div key={term} className="flex items-baseline gap-2.5">
                  <dt className="label text-gray-light">{term}</dt>
                  <dd className="label text-ink/75">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}

        <h1 className="display-tight mt-5 text-[clamp(2.75rem,9.5vw,8rem)]">
          <RevealLine>{project.title}</RevealLine>
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-12">
          <Reveal delay={0.12} className="md:col-span-7">
            {hasText(project.subtitle) ? (
              <p className="lede max-w-[44ch] text-ink/75 md:text-[1.25rem]">
                {project.subtitle}
              </p>
            ) : null}
          </Reveal>

          {externalLinks.length ? (
            <Reveal delay={0.16} className="md:col-span-4 md:col-start-9 md:self-end">
              <ul className="flex flex-wrap gap-x-7 gap-y-2">
                {externalLinks.map((l) => (
                  <li key={l.label}>
                    <TextLink href={l.url} external>
                      {l.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </header>

      {/* -- Hero plate --------------------------------------------------- */}
      <div className="shell mt-12 md:mt-16">
        <Reveal y={24}>
          <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-paper-warm md:aspect-[16/8]">
            <ProjectMedia project={project} variant="plate" priority />
          </div>
        </Reveal>
      </div>

      {/* -- Bands -------------------------------------------------------- */}
      <div className="shell mt-20 flex flex-col gap-16 md:mt-28 md:gap-24">
        {hasText(project.summary) || hasItems(project.highlights) ? (
          <Band label="Overview">
            {hasText(project.summary) ? (
              <Reveal>
                <p className="display text-[clamp(1.375rem,2.7vw,2rem)] leading-[1.3] text-ink/90">
                  {project.summary}
                </p>
              </Reveal>
            ) : null}
            {hasItems(project.highlights) ? (
              <ul className="mt-9 flex flex-col gap-3.5 md:mt-11">
                {project.highlights.map((h, i) => (
                  <Reveal as="li" key={h.slice(0, 32)} delay={i * 0.05} y={12}>
                    <div className="flex gap-5 border-t border-rule-soft pt-4">
                      <span className="label mt-1 shrink-0 text-gray-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="body-copy max-w-[62ch]">{h}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            ) : null}
          </Band>
        ) : null}

        {hasText(project.problem) ? (
          <Band label="Problem">
            <Reveal>
              <p className="lede max-w-[56ch] text-[clamp(1.0625rem,1.35vw,1.3125rem)] text-ink/75">
                {project.problem}
              </p>
            </Reveal>
          </Band>
        ) : null}

        {hasItems(project.approach) ? (
          <Band label="Approach">
            <NumberedList items={project.approach} />
          </Band>
        ) : null}

        {hasItems(project.architecture) ? (
          <Band label="Architecture">
            <ol className="flex flex-col">
              {project.architecture.map((step, i) => (
                <Reveal as="li" key={step.step} delay={i * 0.04} y={12}>
                  <div className="flex flex-col gap-1.5 border-t border-rule py-5 md:flex-row md:items-baseline md:justify-between md:gap-8 md:py-6">
                    <span className="flex items-baseline gap-4">
                      <span className="label text-gray-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.0625rem] tracking-[-0.02em] md:text-[1.25rem]">
                        {step.step}
                      </span>
                    </span>
                    <span className="body-copy md:text-right">{step.detail}</span>
                  </div>
                </Reveal>
              ))}
              <li className="border-t border-rule" />
            </ol>

            {project.images.architecture ? (
              <Reveal y={20} className="mt-10">
                <GalleryImage image={project.images.architecture} index={0} />
              </Reveal>
            ) : null}
          </Band>
        ) : null}

        {hasItems(project.technologies) ? (
          <Band label="Technology">
            <Reveal>
              <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-3">
                {project.technologies.map((tech, i) => (
                  <li key={tech} className="flex items-baseline gap-2">
                    <span className="text-[clamp(1.125rem,2.3vw,1.6875rem)] tracking-[-0.025em]">
                      {tech}
                    </span>
                    {i < project.technologies.length - 1 ? (
                      <span aria-hidden="true" className="text-gray-light">
                        ·
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Band>
        ) : null}

        <Band label="Project details">
          <Reveal>
            <p className="lede max-w-[50ch] text-ink/70">
              {project.details ?? project.outcomes ?? DETAILS_ON_REQUEST}
            </p>
          </Reveal>
        </Band>

        {hasItems(project.images.gallery) ? (
          <Band label="Gallery">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {project.images.gallery.map((img, i) => (
                <Reveal key={img.url} delay={i * 0.05} y={18}>
                  <GalleryImage image={img} index={i} />
                </Reveal>
              ))}
            </div>
          </Band>
        ) : null}
      </div>

      {/* -- Next / back -------------------------------------------------- */}
      <nav aria-label="Project navigation" className="mt-24 md:mt-32">
        {next && next.slug !== project.slug ? (
          <Link
            href={`/work/${next.slug}`}
            data-cursor="view"
            className="group block border-t border-rule"
          >
            <div className="shell py-12 md:py-16">
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0">
                  <p className="label text-gray-light">Next project</p>
                  <p className="display mt-4 text-[clamp(2rem,5.6vw,4.25rem)]">
                    <span className="inline-block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                      {next.title}
                    </span>
                  </p>
                  {hasText(next.category) ? (
                    <p className="label mt-4 text-gray">{next.category}</p>
                  ) : null}
                </div>
                <Arrow
                  direction="right"
                  className="size-8 shrink-0 text-ink/25 transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-ink md:size-12"
                />
              </div>
            </div>
          </Link>
        ) : null}

        <div className="border-t border-rule">
          <div className="shell flex flex-wrap items-center justify-between gap-4 py-7">
            <TextLink href="/#work" direction="left">
              All selected work
            </TextLink>
            <TextLink href="/">Back home</TextLink>
          </div>
        </div>
      </nav>
    </article>
  );
}

export type { Project };
