"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { Arrow } from "./ArrowLink";

type ContactConfig = {
  formUrl: string;
  heading: string;
  blurb: string;
  email: string;
};

type Ctx = { open: () => void; close: () => void; isOpen: boolean; configured: boolean };

const ContactFormContext = createContext<Ctx | null>(null);

export function useContactForm() {
  const ctx = useContext(ContactFormContext);
  if (!ctx) {
    throw new Error("useContactForm must be used inside <ContactFormProvider>");
  }
  return ctx;
}

/** Google Forms only embeds from a URL carrying ?embedded=true. */
function toEmbedUrl(raw: string): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.searchParams.set("embedded", "true");
    return url.toString();
  } catch {
    return "";
  }
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,iframe,[tabindex]:not([tabindex="-1"])';

export function ContactFormProvider({
  config,
  children,
}: {
  config: ContactConfig;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const embedUrl = useMemo(() => toEmbedUrl(config.formUrl), [config.formUrl]);
  const configured = Boolean(embedUrl);

  const close = useCallback(() => setIsOpen(false), []);

  const open = useCallback(() => {
    // With no form configured, do the useful thing rather than nothing.
    if (!configured) {
      window.location.href = `mailto:${config.email}`;
      return;
    }
    restoreFocus.current = document.activeElement as HTMLElement;
    setLoaded(false);
    setIsOpen(true);
  }, [configured, config.email]);

  // Scroll lock — compensating for the scrollbar so the page doesn't shift.
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [isOpen]);

  // Escape to dismiss, Tab trapped inside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el.tagName === "IFRAME");
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Move focus in on open, and put it back where it came from on close.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        panelRef.current
          ?.querySelector<HTMLElement>("[data-autofocus]")
          ?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
    restoreFocus.current?.focus?.();
  }, [isOpen]);

  const value = useMemo(
    () => ({ open, close, isOpen, configured }),
    [open, close, isOpen, configured],
  );

  return (
    <ContactFormContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen ? (
          <div
            className="fixed inset-0 z-80 flex items-stretch justify-center md:items-center md:p-6 lg:p-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-form-title"
          >
            <motion.button
              type="button"
              aria-label="Close contact form"
              onClick={close}
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[3px]"
            />

            <motion.div
              ref={panelRef}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 28, scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }
              }
              transition={{ duration: 0.5, ease: EASE_SOFT }}
              className="relative flex h-full w-full flex-col bg-paper md:h-[min(46rem,88vh)] md:max-w-[46rem] md:rounded-[1.25rem] md:shadow-[0_32px_80px_-32px_rgba(10,9,9,0.32)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-6 border-b border-rule px-(--spacing-gutter) pb-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-8 md:pb-6 md:pt-7">
                <div className="min-w-0">
                  <h2
                    id="contact-form-title"
                    className="display text-[1.75rem] md:text-[2.125rem]"
                  >
                    {config.heading}
                  </h2>
                  <p className="body-copy mt-2 max-w-[46ch] text-[0.875rem] md:text-[0.9375rem]">
                    {config.blurb}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  data-autofocus
                  aria-label="Close"
                  className="group -mr-1 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-rule transition-colors duration-300 hover:border-ink"
                >
                  <span className="relative block size-3.5">
                    <span className="absolute top-1/2 h-px w-full rotate-45 bg-ink" />
                    <span className="absolute top-1/2 h-px w-full -rotate-45 bg-ink" />
                  </span>
                </button>
              </div>

              {/* Form */}
              <div className="relative min-h-0 flex-1">
                {!loaded ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="label text-gray-light">Loading form…</span>
                  </div>
                ) : null}
                <iframe
                  src={embedUrl}
                  title={config.heading}
                  onLoad={() => setLoaded(true)}
                  className="size-full border-0"
                  style={{ opacity: loaded ? 1 : 0, transition: "opacity 400ms" }}
                >
                  Loading…
                </iframe>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-rule px-(--spacing-gutter) pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 md:px-8 md:pb-6">
                <a
                  href={config.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[0.8125rem] tracking-[-0.01em] text-gray transition-colors duration-300 hover:text-ink"
                >
                  Open form in a new tab
                  <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href={`mailto:${config.email}`}
                  className="label text-gray-light transition-colors duration-300 hover:text-ink"
                >
                  or email directly
                </a>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ContactFormContext.Provider>
  );
}
