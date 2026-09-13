import type { ReactNode } from "react";
import type { Profile, SocialLink } from "@/lib/content/types";
import { HeroPortrait } from "@/components/HeroPortrait";
import { HeroActions } from "@/components/HeroActions";
import { PillLink } from "@/components/ArrowLink";

/**
 * The hero is three bands inside one `100svh` column:
 *
 *   upper    role + social links, each in its own grid column
 *   stage    the name and the portrait — the only element allowed to flex
 *   lower    the statement and the actions
 *
 * The stage takes the remaining height (`flex-1 min-h-0`) and the name is
 * sized against both width and height, so the composition fits a short laptop
 * window instead of overflowing it.
 *
 * Load choreography follows the site's one motion grammar — soft, then
 * moving, then full contrast, then still:
 *
 *   0.18s  role and social links drop in
 *   0.34s  ABHISHEK settles out of an oversized, pale state
 *   0.42s  SWAMI follows
 *   0.80s  the portrait begins rising from below its frame
 *   1.05s  the statement resolves
 *   1.15s  the actions resolve
 *
 * Entirely a server component: the choreography is CSS, so there is no
 * client/server branch to mismatch during hydration.
 */

function Band({
  children,
  delay,
  className = "",
  from = "down",
}: {
  children: ReactNode;
  delay: number;
  className?: string;
  from?: "down" | "up";
}) {
  return (
    <div
      className={`${from === "down" ? "enter-down" : "enter-up"} ${className}`}
      style={{ "--enter-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function Hero({
  profile,
  socials,
}: {
  profile: Profile;
  socials: SocialLink[];
}) {
  return (
    <section
      aria-label="Introduction"
      className="hero-scale flex min-h-svh flex-col overflow-hidden pb-7 pt-[calc(var(--nav-h)+1.5rem)] md:pb-9 md:pt-[calc(var(--nav-h)+2.25rem)]"
    >
      {/* -- Upper register ------------------------------------------------
          Two columns that never share space, so the role block and the social
          list cannot run into one another however narrow the window gets. */}
      <div className="hero-upper shell flex shrink-0 flex-col gap-3.5 md:grid md:grid-cols-2 md:items-start md:gap-x-6">
        <Band delay={0.18}>
          <p className="label text-gray">{profile.title}</p>
          <p className="label mt-2.5 whitespace-nowrap text-ink">
            {profile.secondary}
          </p>
        </Band>

        <Band delay={0.24} className="md:justify-self-end">
          <ul className="hero-socials flex flex-row gap-x-6 md:flex-col md:items-end md:gap-3">
            {socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="label text-gray transition-colors duration-300 hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${profile.email}`}
                data-cursor="link"
                className="label text-gray transition-colors duration-300 hover:text-ink"
              >
                Email
              </a>
            </li>
          </ul>
        </Band>
      </div>

      {/* -- Stage ----------------------------------------------------------
          Name and portrait as one composition. Stacking, back to front:
          outlined given name (z-10) · portrait (z-20) · solid surname (z-30).
          The figure is interleaved BETWEEN the two lines rather than sitting
          behind both: the outline passes behind the head, the solid surname
          crosses the chest. That is the difference between a photograph
          placed on a page and one cut into it. */}
      <div className="relative flex min-h-0 flex-1 items-end justify-center">
        {/* The figure is anchored to the STAGE, not to the name block: its
            height is capped at 100% of its containing block, and that cap is
            only meaningful against the space the stage actually has. It comes
            first in the DOM so the type paints over it. */}
        {profile.image ? <HeroPortrait image={profile.image} /> : null}

        {/* pointer-events-none on the wrapper, not just the lines: it is a
            positioned block covering the whole stage, so without this it
            swallows the pointer and the figure beneath never sees a hover.
            Everything inside is decorative or screen-reader-only. */}
        <div className="shell pointer-events-none relative w-full text-center">
          <h1 className="sr-only">
            {profile.name} — {profile.title}
          </h1>

          {/* One lockup. Stacked on mobile, single horizontal line on desktop. */}
          <div aria-hidden="true" className="name-lockup">
            <div className="relative z-10">
              <span
                className="settle-type name-line name-line--lead name-outline"
                style={{ "--enter-delay": "0.34s" } as React.CSSProperties}
              >
                {profile.firstName}
              </span>
            </div>

            <div className="relative z-30">
              <span
                className="settle-type name-line name-line--trail"
                style={{ "--enter-delay": "0.34s" } as React.CSSProperties}
              >
                {profile.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -- Lower register ------------------------------------------------- */}
      <div className="hero-lower shell mt-7 grid shrink-0 grid-cols-1 items-end gap-5 md:mt-9 md:grid-cols-12 md:gap-6">
        <Band delay={1.05} from="up" className="md:col-span-5">
          <p className="lede max-w-[34ch] text-balance">{profile.lede}</p>
        </Band>

        <Band
          delay={1.15}
          from="up"
          className="md:col-span-6 md:col-start-7 md:justify-self-end"
        >
          <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
            <HeroActions />
            <PillLink
              href="/#work"
              variant="outline"
              direction="down"
              cursor="link"
            >
              View my work
            </PillLink>
          </div>
        </Band>
      </div>
    </section>
  );
}
