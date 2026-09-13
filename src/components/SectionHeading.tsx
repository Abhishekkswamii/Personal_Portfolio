import type { ReactNode } from "react";
import { Reveal, RevealRule } from "./Reveal";

/**
 * One masthead for every section: a drawn hairline, a slashed mono label left,
 * a note right, and an optional editorial intro beneath. Using the same object
 * everywhere is what makes the page read as one document.
 */
export function SectionHeading({
  label,
  note,
  intro,
  dark = false,
}: {
  label: string;
  note?: ReactNode;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <header>
      <RevealRule dark={dark} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-5 md:pt-6">
        <Reveal y={14}>
          <h2 className={`label ${dark ? "text-paper" : "text-ink"}`}>
            <span
              aria-hidden="true"
              className={dark ? "text-paper/40" : "text-gray-light"}
            >
              /
            </span>
            {label}
          </h2>
        </Reveal>
        {note ? (
          <Reveal y={14} delay={0.08}>
            <p className={`label ${dark ? "text-paper/45" : "text-gray-light"}`}>
              {note}
            </p>
          </Reveal>
        ) : null}
      </div>

      {intro ? (
        <Reveal y={18} delay={0.16}>
          <p className="lede mt-7 max-w-[32ch] text-ink/70 md:mt-8">{intro}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
