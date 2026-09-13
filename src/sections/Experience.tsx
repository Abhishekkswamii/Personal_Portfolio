"use client";

import { useState } from "react";
import type { Experience as ExperienceItem } from "@/lib/content/types";
import { hasItems, hasText } from "@/lib/content/types";
import { Reveal, RevealRule } from "@/components/Reveal";

/**
 * The dark register — one inversion in the whole page, so it lands.
 * Rows dim to 40% and lift back on hover; only the detail moves, never the row.
 */
export function Experience({
  experiences,
  note,
}: {
  experiences: ExperienceItem[];
  note?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  if (!experiences.length) return null;

  return (
    <section
      id="experience"
      className="on-dark relative mt-(--spacing-section) overflow-hidden bg-ink py-(--spacing-section) text-paper"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.2em] left-1/2 -translate-x-1/2 select-none text-[21vw] font-medium leading-none tracking-[-0.05em] text-paper/[0.05]"
      >
        Experience
      </span>

      <div className="shell relative">
        <RevealRule dark />
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-5 md:pt-6">
          <Reveal as="div" y={12}>
            <h2 className="label text-paper">
              <span aria-hidden="true" className="text-paper/40">
                /
              </span>
              Experience
            </h2>
          </Reveal>
          {hasText(note) ? (
            <Reveal as="div" y={12} delay={0.06}>
              <p className="label text-paper/45">{note}</p>
            </Reveal>
          ) : null}
        </div>

        <ul className="mt-12 md:mt-16" onMouseLeave={() => setActive(null)}>
          {experiences.map((role, i) => {
            const dimmed = active !== null && active !== i;
            return (
              <Reveal
                as="li"
                key={role.id}
                y={26}
                delay={i * 0.09}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="border-t border-rule-invert"
              >
                <div
                  tabIndex={0}
                  role="group"
                  aria-label={`${role.company} — ${role.role}, ${role.period}`}
                  className="group block py-7 outline-offset-8 transition-opacity duration-[600ms] md:py-9"
                  style={{ opacity: dimmed ? 0.4 : 1 }}
                >
                  <div className="transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:translate-x-2.5 md:group-focus-within:translate-x-2.5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-baseline md:gap-8">
                      <div className="flex items-baseline gap-3 md:col-span-5">
                        <h3 className="display text-[clamp(1.75rem,3.6vw,2.875rem)]">
                          {role.company}
                        </h3>
                        {role.current ? (
                          <span
                            aria-label="Current role"
                            className="size-1.5 shrink-0 -translate-y-[0.55em] rounded-full bg-clay"
                          />
                        ) : null}
                      </div>

                      <p className="label text-paper/75 md:col-span-4">{role.role}</p>

                      <p className="label text-paper/50 md:col-span-3 md:text-right">
                        {role.period}
                      </p>
                    </div>

                    {hasItems(role.points) ? (
                      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-within:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <ul className="grid grid-cols-1 gap-3 pt-5 md:grid-cols-12 md:gap-8 md:pt-7">
                            {role.points.map((point) => (
                              <li
                                key={point}
                                className="text-[0.875rem] leading-[1.55] tracking-[-0.005em] text-paper/60 md:col-span-4 md:text-[0.9375rem]"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                          {hasText(role.location) ? (
                            <p className="label mt-5 text-paper/30 md:mt-6">
                              {role.location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
          <li className="border-t border-rule-invert" aria-hidden="true" />
        </ul>
      </div>
    </section>
  );
}
