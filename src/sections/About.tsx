import type { Education, Profile } from "@/lib/content/types";
import { hasImage, hasItems, hasText } from "@/lib/content/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal, RevealLine } from "@/components/Reveal";
import { PortraitPlate } from "@/components/HeroPortrait";

export function About({
  profile,
  education,
}: {
  profile: Profile;
  education: Education[];
}) {
  const showAside = hasImage(profile.image) || hasItems(education);

  return (
    <section id="about" className="shell section-gap scroll-mt-(--nav-h)">
      <SectionHeading label="About" note={profile.location} />

      <div className="mt-12 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <h3 className="display-tight text-[clamp(2.25rem,5.4vw,4.25rem)]">
            <RevealLine>I like building</RevealLine>
            <RevealLine delay={0.08}>things that work.</RevealLine>
          </h3>

          {hasItems(profile.bio) ? (
            <div className="mt-9 max-w-[46ch] space-y-5 md:mt-12">
              {profile.bio.map((para, i) => (
                <Reveal key={para.slice(0, 24)} delay={i * 0.06}>
                  <p className={i === 0 ? "lede" : "body-copy"}>{para}</p>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>

        {showAside ? (
          <div className="md:col-span-4 md:col-start-9">
            {hasImage(profile.image) ? (
              <Reveal y={22}>
                <div className="relative bg-paper-warm">
                  <PortraitPlate image={profile.image} className="mix-blend-multiply" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border border-ink/[0.06]"
                  />
                </div>
              </Reveal>
            ) : null}

            {hasItems(education) ? (
              <Reveal y={16} delay={0.08}>
                <div className={hasImage(profile.image) ? "mt-9 md:mt-10" : ""}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
                    <h4 className="label text-ink">Education</h4>
                    <span className="label text-gray-light">
                      {education.length.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <ul>
                    {education.map((e) => (
                      <li key={e.id} className="border-b border-rule-soft py-4">
                        <p className="text-[0.9375rem] tracking-[-0.01em]">
                          {e.institution}
                        </p>
                        <p className="mt-1 text-[0.8125rem] leading-[1.5] text-gray">
                          {e.degree}
                          {hasText(e.field) ? ` — ${e.field}` : ""}
                        </p>
                        <p className="label mt-2 text-gray-light">
                          {e.period}
                          {hasText(e.grade) ? ` · ${e.grade}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
