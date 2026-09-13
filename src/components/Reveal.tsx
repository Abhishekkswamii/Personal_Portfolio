"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Scroll reveals, done in CSS.
 *
 * The markup is identical on the server and in the browser — the only thing
 * JavaScript ever does is set `data-visible="true"` once the element has been
 * seen, which CSS transitions against. Nothing branches on
 * `prefers-reduced-motion` here; the stylesheet handles that, so there is no
 * way for these to produce a hydration mismatch.
 */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen at mount (above the fold): show it without waiting.
    const show = () => el.setAttribute("data-visible", "true");

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    // threshold 0, deliberately: a hairline rule is 1px tall, and asking for
    // 15% of its area to be visible left three of them permanently
    // undrawn. The negative bottom margin is what delays the reveal instead,
    // and it works the same for a 1px rule and a full-height block.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    observer.observe(el);

    // Last resort. If an element somehow never intersects — a container that
    // clips it, a browser quirk — content must not stay invisible. Reveals are
    // decoration; the text underneath is the point.
    const failsafe = window.setTimeout(show, 3000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return ref;
}

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "p" | "span";
  /** Forwarded so a revealed row can still carry its own interactions. */
  onMouseEnter?: () => void;
  onFocus?: () => void;
};

/** The site's only scroll-reveal primitive. Whole blocks, not every element. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
  onMouseEnter,
  onFocus,
}: Props) {
  const ref = useRevealOnce<HTMLElement>();
  // The polymorphic tag makes the ref type a union of every element it could
  // be; the observer only ever touches HTMLElement members.
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      className={`reveal-on-scroll ${className ?? ""}`}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/**
 * A line of display type. Reserved for section headings and the largest
 * statements. Uses the same soft-to-contrast grammar as everything else, just
 * with more travel, so the biggest type reads as the heaviest object landing.
 */
export function RevealLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRevealOnce<HTMLSpanElement>();

  return (
    <span
      ref={ref}
      className="reveal-on-scroll block"
      style={
        { "--reveal-delay": `${delay}s`, "--reveal-y": "34px" } as React.CSSProperties
      }
    >
      {/* The trailing space is load-bearing: without it, consecutive lines run
          together in the element's accessible name. */}
      <span className={className}>{children} </span>
    </span>
  );
}

/** Hairline that draws itself left to right as the section arrives. */
export function RevealRule({
  className = "",
  dark = false,
  delay = 0,
}: {
  className?: string;
  dark?: boolean;
  delay?: number;
}) {
  const ref = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal-rule ${dark ? "bg-rule-invert" : "bg-rule"} ${className}`}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    />
  );
}
// hot reload trigger
