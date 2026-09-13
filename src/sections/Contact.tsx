"use client";

import type { Profile, SiteSettings, SocialLink } from "@/lib/content/types";
import { hasText } from "@/lib/content/types";
import { RevealLine, Reveal, RevealRule } from "@/components/Reveal";
import { PillLink } from "@/components/ArrowLink";
import { useContactForm } from "@/components/ContactFormProvider";

/** The last statement on the page. Mostly whitespace, by design. */
export function Contact({
  profile,
  settings,
  socials,
}: {
  profile: Profile;
  settings: SiteSettings;
  socials: SocialLink[];
}) {
  const { open } = useContactForm();
  const headline = settings.contactHeadline.length
    ? settings.contactHeadline
    : ["Let’s build", "something useful."];

  return (
    <section
      id="contact"
      className="shell section-gap scroll-mt-(--nav-h) pb-24 md:pb-28"
    >
      <RevealRule />

      <h2 className="display-tight mt-10 text-[clamp(2.75rem,10vw,8.5rem)] md:mt-14">
        {headline.map((line, i) => (
          <RevealLine key={line} delay={i * 0.09}>
            {line}
          </RevealLine>
        ))}
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7">
          <Reveal>
            <p className="label text-gray-light">Get in touch</p>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="link"
              className="group mt-4 inline-block text-[clamp(1.125rem,2.6vw,2rem)] tracking-[-0.025em]"
            >
              <span className="relative">
                {profile.email}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100"
                />
              </span>
            </a>
            <p className="body-copy mt-6 max-w-[38ch]">
              Open to engineering roles and project work. The fastest way to
              reach me is email — I read everything.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <Reveal delay={0.08}>
            {socials.length ? (
              <ul className="flex flex-col">
                {socials.map((s) => (
                  <li key={s.id} className="border-t border-rule">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="link"
                      className="group flex items-center justify-between gap-4 py-4"
                    >
                      <span className="text-[0.9375rem] tracking-[-0.01em]">
                        {s.label}
                      </span>
                      {hasText(s.handle) ? (
                        <span className="label text-gray-light transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1">
                          {s.handle}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
                <li className="border-t border-rule" />
              </ul>
            ) : null}

            <div className="mt-8">
              <PillLink onClick={open} cursor="cta">
                {settings.contactFormHeading}
              </PillLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
