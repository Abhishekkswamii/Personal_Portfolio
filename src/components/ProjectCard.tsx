import Link from "next/link";
import type { Project } from "@/lib/content/types";
import { hasItems, hasText } from "@/lib/content/types";
import { ProjectMedia } from "./ProjectMedia";
import { Arrow } from "./ArrowLink";
import { Reveal } from "./Reveal";

/**
 * An editorial project row: full plate on one side, the record on the other,
 * alternating down the page. Hover moves three things a few pixels — the
 * plate, the title, the arrow — and a hairline frame draws inside the plate.
 * Nothing else changes.
 */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const flipped = index % 2 === 1;

  return (
    <Reveal as="div" y={34}>
      <Link
        href={`/work/${project.slug}`}
        data-cursor="view"
        aria-label={`${project.title} — ${project.subtitle}. View case study.`}
        className="group grid grid-cols-1 items-center gap-7 border-t border-rule py-10 md:grid-cols-12 md:gap-10 md:py-14 lg:py-16"
      >
        {/* -- Plate ----------------------------------------------------- */}
        <div className={`md:col-span-7 ${flipped ? "md:order-2 md:col-start-6" : "md:order-1"}`}>
          <div className="relative aspect-[16/11] overflow-hidden bg-paper-warm">
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
              <ProjectMedia project={project} variant="card" priority={index === 0} />
            </div>
            {/* Technical frame, drawn on approach. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 border border-ink/0 transition-colors duration-[700ms] group-hover:border-ink/12 md:inset-5"
            />
          </div>
        </div>

        {/* -- Record ---------------------------------------------------- */}
        <div
          className={`md:col-span-4 ${flipped ? "md:order-1 md:col-start-1" : "md:order-2 md:col-start-9"}`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="label text-gray-light">
              {project.number}
              {hasText(project.category) ? ` — ${project.category}` : ""}
            </span>
            {hasText(project.year) ? (
              <span className="label text-gray-light">{project.year}</span>
            ) : null}
          </div>

          <h3 className="display mt-5 text-[clamp(2rem,4.2vw,3.25rem)]">
            <span className="inline-block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
              {project.title}
            </span>
          </h3>

          {hasText(project.subtitle) ? (
            <p className="mt-2 text-[0.9375rem] tracking-[-0.01em] text-gray">
              {project.subtitle}
            </p>
          ) : null}

          {hasText(project.summary) ? (
            <p className="body-copy mt-5 max-w-[42ch]">{project.summary}</p>
          ) : null}

          {hasItems(project.technologies) ? (
            <ul className="mt-7 flex flex-wrap items-baseline gap-x-1.5 gap-y-1.5 border-t border-rule-soft pt-4">
              {project.technologies.map((tech, i) => (
                <li key={tech} className="flex items-baseline gap-1.5">
                  <span className="label text-gray">{tech}</span>
                  {i < project.technologies.length - 1 ? (
                    <span aria-hidden="true" className="label text-gray-light">
                      ·
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <span className="mt-8 inline-flex items-center gap-2 text-[0.875rem] tracking-[-0.01em]">
            <span className="relative">
              Case study
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100"
              />
            </span>
            <Arrow className="transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
