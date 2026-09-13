"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { Profile, SocialLink } from "@/lib/content/types";
import { AvailabilityPill } from "./AvailabilityPill";
import { Arrow } from "./ArrowLink";
import { useContactForm } from "./ContactFormProvider";
import { EASE_OUT } from "@/lib/motion";

const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "work", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function Navbar({
  profile,
  socials,
}: {
  profile: Profile;
  socials: SocialLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSection, setVisibleSection] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { open: openContact } = useContactForm();

  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Off the homepage there is no active section — derive it rather than
  // storing a value we'd then have to keep in sync.
  const active = onHome ? visibleSection : null;

  // Active section — mirrors what the reader is actually looking at.
  useEffect(() => {
    if (!onHome) return;
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setVisibleSection(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [onHome, pathname]);

  useEffect(() => {
    if (!open) return;
    // Back/forward navigation while the sheet is open should dismiss it.
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", close);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-90 rounded-full bg-ink px-4 py-2 text-sm text-paper"
      >
        Skip to content
      </a>

      {/* The navbar drops in first, ahead of the hero type — the top of the
          page establishing itself before anything is placed on the canvas.
          A CSS animation, so the markup is identical on server and client. */}
      <header
        style={{ "--enter-delay": "0.05s" } as React.CSSProperties}
        className={`enter-down fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || !onHome
            ? "border-b border-rule bg-paper"
            : "border-b border-transparent bg-paper/0"
        }`}
      >
        <nav
          aria-label="Primary"
          className="shell flex h-(--nav-h) items-center justify-between gap-6"
        >
          {/* Left — always a route home. */}
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              data-cursor="link"
              aria-label={`${profile.name} — home`}
              className="shrink-0 text-[0.9375rem] font-medium tracking-[-0.02em] lg:hidden"
            >
              {profile.name}
            </Link>
            <div className="hidden lg:block">
              {onHome ? (
                <AvailabilityPill
                  label={profile.availability}
                  open={profile.availabilityOpen}
                />
              ) : (
                <Link
                  href="/"
                  data-cursor="link"
                  className="group inline-flex items-center gap-2.5 text-[0.9375rem] font-medium tracking-[-0.02em]"
                >
                  <Arrow
                    direction="left"
                    className="text-gray transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1"
                  />
                  {profile.name}
                </Link>
              )}
            </div>
          </div>

          {/* Centre — sections. Always absolute paths, so they work off-home. */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            {SECTIONS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`/#${item.id}`}
                    data-cursor="link"
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative block py-1 text-[0.875rem] tracking-[-0.01em] transition-colors duration-300 ${
                      isActive ? "text-ink" : "text-gray hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-0.5 left-0 h-px w-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive
                          ? "scale-x-100"
                          : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right — the one CTA. */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openContact}
              data-cursor="cta"
              className="group hidden h-10 items-center gap-2 rounded-full bg-ink px-4.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-paper transition-colors duration-300 hover:bg-ink-soft lg:inline-flex"
            >
              Let&rsquo;s talk
              <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-mr-1 flex h-10 items-center gap-2.5 rounded-full border border-rule pl-4 pr-3 lg:hidden"
            >
              <span className="label w-[3.25rem] text-left">
                {open ? "Close" : "Menu"}
              </span>
              <span className="relative flex h-3 w-4 flex-col justify-center">
                <span
                  className={`absolute h-px w-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "rotate-45" : "-translate-y-[3px]"
                  }`}
                />
                <span
                  className={`absolute h-px w-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "-rotate-45" : "translate-y-[3px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="sheet"
            initial={reduced ? { opacity: 0 } : { y: "-100%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            exit={reduced ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: 0.65, ease: EASE_OUT }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-paper pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(var(--nav-h)+2rem)] lg:hidden"
          >
            <ul className="shell flex flex-col">
              {SECTIONS.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.055, duration: 0.55, ease: EASE_OUT }}
                  className="border-b border-rule-soft"
                >
                  <Link
                    href={`/#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-4.5"
                  >
                    <span className="label text-gray-light">0{i + 1}</span>
                    <span className="display text-[2.125rem] sm:text-[2.5rem]">
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="shell mt-10 flex flex-col gap-6">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openContact();
                }}
                className="group inline-flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-ink text-[0.9375rem] font-medium tracking-[-0.01em] text-paper"
              >
                Let&rsquo;s talk
                <Arrow className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label text-gray"
                  >
                    {s.label}
                  </a>
                ))}
                <a href={`mailto:${profile.email}`} className="label text-gray">
                  Email
                </a>
              </div>

              <AvailabilityPill
                label={profile.availability}
                open={profile.availabilityOpen}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
