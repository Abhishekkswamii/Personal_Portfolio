"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Service } from "@/lib/content/types";
import { hasItems, hasText } from "@/lib/content/types";
import { SectionHeading } from "@/components/SectionHeading";
import { EASE_SOFT } from "@/lib/motion";

/** A list that opens. One row at a time, everything else holding still. */
export function Services({ services }: { services: Service[] }) {
  const [open, setOpen] = useState<string | null>(services[0]?.id ?? null);

  if (!services.length) return null;

  return (
    <section className="shell section-gap">
      <SectionHeading label="What I build" note="Four things, done properly" />

      <div className="mt-10 md:mt-14">
        {services.map((service) => {
          const isOpen = open === service.id;
          const expandable = hasText(service.detail) || hasItems(service.capabilities);

          return (
            <div key={service.id} className="border-t border-rule">
              <h3>
                <button
                  type="button"
                  onClick={() => expandable && setOpen(isOpen ? null : service.id)}
                  aria-expanded={expandable ? isOpen : undefined}
                  aria-controls={expandable ? `service-${service.id}` : undefined}
                  disabled={!expandable}
                  className="group flex w-full items-start gap-5 py-7 text-left md:items-center md:gap-8 md:py-8"
                >
                  <span
                    aria-hidden="true"
                    className={`label mt-1.5 shrink-0 transition-colors duration-500 md:mt-0 ${
                      isOpen ? "text-ink" : "text-gray-light"
                    }`}
                  >
                    {service.number}
                  </span>

                  <span className="flex flex-1 flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-10">
                    <span
                      className={`display text-[clamp(1.5rem,3.4vw,2.5rem)] transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? "md:translate-x-2" : "md:group-hover:translate-x-1.5"
                      }`}
                    >
                      {service.title}
                    </span>{" "}
                    <span className="body-copy max-w-[40ch] md:text-right md:text-[0.9375rem]">
                      {service.description}
                    </span>
                  </span>

                  {expandable ? (
                    <span
                      aria-hidden="true"
                      className={`relative mt-2 flex size-4 shrink-0 items-center justify-center transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] md:mt-0 ${
                        isOpen ? "rotate-[135deg]" : "group-hover:rotate-90"
                      }`}
                    >
                      <span className="absolute h-px w-4 bg-ink" />
                      <span className="absolute h-4 w-px bg-ink" />
                    </span>
                  ) : null}
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && expandable ? (
                  <motion.div
                    id={`service-${service.id}`}
                    key="panel"
                    // `initial={false}` unconditionally: the first row is
                    // already open in the server HTML, so animating it in on
                    // mount would mean the server and client disagreed about
                    // its inline style. Rows opened later still animate,
                    // because AnimatePresence gives them an enter transition.
                    initial={false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE_SOFT }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-8 pb-9 md:grid-cols-12 md:gap-10 md:pb-12">
                      {hasText(service.detail) ? (
                        <p className="body-copy max-w-[52ch] md:col-span-6 md:col-start-2">
                          {service.detail}
                        </p>
                      ) : null}
                      {hasItems(service.capabilities) ? (
                        <ul className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-4 md:col-start-9 md:flex-col md:gap-y-3">
                          {service.capabilities.map((item) => (
                            <li key={item} className="label flex items-center gap-2.5 text-gray">
                              <span className="h-px w-4 bg-rule" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
        <div className="border-t border-rule" />
      </div>
    </section>
  );
}
