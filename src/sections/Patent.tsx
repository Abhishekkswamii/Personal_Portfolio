import type { Patent as PatentType } from "@/lib/content/types";
import { hasText } from "@/lib/content/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal, RevealLine } from "@/components/Reveal";

/**
 * A credential, set like one — the record given room, on the warm ground so it
 * reads as a plate rather than another list. No badge, no seal, no graphic.
 */
export function Patent({ patent }: { patent: PatentType | null }) {
  if (!patent || !hasText(patent.title)) return null;

  const facts = [
    hasText(patent.applicationNumber)
      ? { term: "Application No.", value: patent.applicationNumber, mono: true }
      : null,
    hasText(patent.status) ? { term: "Status", value: patent.status } : null,
    hasText(patent.year) ? { term: "Year", value: patent.year } : null,
  ].filter((f): f is { term: string; value: string; mono?: boolean } => f !== null);

  return (
    <section className="shell section-gap">
      <SectionHeading
        label="Patent"
        note={patent.status ?? patent.year ?? undefined}
      />

      <Reveal y={22} className="mt-10 md:mt-14">
        <div className="bg-paper-warm px-(--spacing-gutter) py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <p className="label text-gray">{patent.type}</p>
              <h3 className="display-tight mt-4 text-[clamp(2.5rem,6.4vw,5rem)]">
                <RevealLine>{patent.title}</RevealLine>
              </h3>
              {hasText(patent.description) ? (
                <p className="lede mt-7 max-w-[40ch] text-ink/80 md:mt-8">
                  {patent.description}
                </p>
              ) : null}
            </div>

            {facts.length ? (
              <dl className="md:col-span-4 md:col-start-9 md:self-end">
                {facts.map((f) => (
                  <div key={f.term} className="border-t border-ink/12 py-4">
                    <dt className="label text-gray">{f.term}</dt>
                    <dd
                      className={`mt-2 tracking-[-0.01em] ${
                        f.mono ? "font-mono text-[1.0625rem]" : "text-[1.0625rem]"
                      }`}
                    >
                      {f.value}
                    </dd>
                  </div>
                ))}
                <div className="border-t border-ink/12" />
              </dl>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
