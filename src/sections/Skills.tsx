import type { SkillCategory } from "@/lib/content/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/**
 * Typographic, not a logo wall. The category is the structure; the
 * technologies are simply set in type. Hovering a row raises the whole
 * category rather than picking out individual words.
 */
export function Skills({ categories }: { categories: SkillCategory[] }) {
  if (!categories.length) return null;

  return (
    <section className="shell section-gap">
      <SectionHeading label="Technologies" note="What I reach for" />

      <dl className="mt-10 md:mt-14">
        {categories.map((group, i) => (
          <Reveal key={group.id} delay={i * 0.07} y={22}>
            <div className="group grid grid-cols-1 gap-2 border-t border-rule py-6 transition-colors duration-500 hover:border-ink/25 md:grid-cols-12 md:items-baseline md:gap-8 md:py-7">
              <dt className="label text-gray-light transition-colors duration-500 group-hover:text-ink md:col-span-3">
                {group.title}
              </dt>
              <dd className="md:col-span-9">
                <ul className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                  {group.skills.map((item, j) => (
                    <li key={item} className="flex items-baseline gap-1.5">
                      <span className="text-[clamp(1.0625rem,2vw,1.4375rem)] leading-[1.35] tracking-[-0.02em] text-ink/75 transition-colors duration-500 group-hover:text-ink">
                        {item}
                      </span>
                      {j < group.skills.length - 1 ? (
                        <span aria-hidden="true" className="text-gray-light">
                          ·
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </Reveal>
        ))}
        <div className="border-t border-rule" />
      </dl>
    </section>
  );
}
