"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";

/**
 * The signature element.
 *
 * Composition: the portrait sits BETWEEN the two lines of the name — the
 * outlined given name passes behind the head, the solid surname crosses in
 * front of the chest. That interleaving is what makes the figure read as cut
 * into the typography rather than placed behind it, and it keeps the face
 * clear of the heaviest ink on the page.
 *
 * Entrance: a CSS keyframe (`.portrait-rise`). The figure starts fully below
 * its own clipping frame and rises once, after the typography has begun to
 * settle. Doing this in CSS rather than JavaScript is what keeps it
 * hydration-safe — no client-only state, so server and browser render the
 * same markup — and `prefers-reduced-motion` cancels it in the stylesheet.
 *
 * Hover: editorial registration marks, not a HUD. Thin corner brackets, one
 * guide, a crosshair and a small index label fade in. Nothing else — no
 * second image, no colour, no floating panel. The figure itself never scales
 * and never moves beyond ~3px of parallax, which is lerped in a rAF loop so
 * it reads as weight rather than as an effect.
 */
export function HeroPortrait({ image }: { image: ImageRef }) {
  const [hovered, setHovered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);

  // Target (raw pointer) and current (smoothed) positions, in px within the
  // figure. Refs, not state: this loop runs at frame rate.
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const seeded = useRef(false);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    target.current = { x: e.clientX - box.left, y: e.clientY - box.top };
    // First move inside the figure: jump rather than glide in from a corner.
    if (!seeded.current) {
      current.current = { ...target.current };
      seeded.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hovered) return;

    const el = root.current;
    const fig = figure.current;
    if (!el) return;

    const tick = () => {
      // Lerp toward the pointer. 0.14 trails just enough to read as weight
      // without feeling laggy.
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;

      // The lerped pointer drives one thing only: a few pixels of
      // counter-movement on the figure. A response, not an effect.
      if (fig) {
        const box = el.getBoundingClientRect();
        const dx = (current.current.x / box.width - 0.5) * 6;
        const dy = (current.current.y / box.height - 0.5) * 6;
        fig.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      }

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [hovered]);

  const reset = useCallback(() => {
    setHovered(false);
    seeded.current = false;
    if (figure.current) figure.current.style.transform = "translate3d(0,0,0)";
  }, []);

  return (
    /* The figure is centred by a flex parent rather than by a transform on
       itself. A transform creates a stacking context, and that context was
       trapping the whole annotation layer underneath the name — which is why
       the label came out sliced by the letterforms. `inset-0` keeps the
       parent's height definite, so the figure's `100%` height cap (the thing
       stopping it bursting the stage on small screens) still resolves.

       The interleave (z-20, between the two name lines) applies from `md`
       up only. On a phone the figure fills most of the stage, so putting it
       above the outlined line hides that line completely — half the name
       disappears. There it stays the back layer and both lines read over
       it. */
    <div className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center md:z-20">
    <div
      ref={root}
      data-cursor="portrait"
      data-hovered={hovered ? "true" : "false"}
      onPointerEnter={(e) => {
        // Only a real pointer gets the annotation layer; touch never does.
        if (e.pointerType === "touch") return;
        setHovered(true);
      }}
      onPointerLeave={reset}
      onPointerMove={onPointerMove}
      className="portrait-figure group pointer-events-auto relative select-none"
    >
      <div className="relative h-full">
        {/* The clipping frame the figure rises out of. */}
        <div className="h-full overflow-hidden">
          <div className="portrait-rise h-full origin-bottom">
            <div
              ref={figure}
              className="h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <Image
                src={image.url}
                alt=""
                width={image.width}
                height={image.height}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) 60vw, 26vw"
                className="portrait-cutout portrait-hero h-full w-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        {/* -- Annotation layer. Hover only, desktop only, monochrome. ----- */}
        <div
          aria-hidden="true"
          className="portrait-marks pointer-events-none absolute inset-0 hidden md:block"
        >
          {(
            [
              ["left-0 top-0", "border-l border-t"],
              ["right-0 top-0", "border-r border-t"],
              ["bottom-0 left-0", "border-b border-l"],
              ["bottom-0 right-0", "border-b border-r"],
            ] as const
          ).map(([pos, edges]) => (
            <span
              key={pos}
              className={`absolute size-5 border-ink/45 ${pos} ${edges}`}
            />
          ))}

          {/* One guide, on the subject's eyeline. A second, vertical rule
              started to look like a targeting overlay rather than an
              editorial mark. */}
          <span className="absolute left-0 top-[22%] h-px w-full bg-ink/12" />

          {/* Crosshair on the subject. */}
          <span className="absolute left-1/2 top-[22%] flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span className="absolute h-px w-4 bg-ink/45" />
            <span className="absolute h-4 w-px bg-ink/45" />
          </span>

          <span className="portrait-tag label absolute -left-px top-[calc(22%+1.5rem)] whitespace-nowrap text-ink/55">
            01 / Portrait
          </span>
        </div>

      </div>
    </div>
    </div>
  );
}

/** The same asset as a static plate in About. Loads lazily, below the fold. */
export function PortraitPlate({
  image,
  className = "",
}: {
  image: ImageRef;
  className?: string;
}) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(max-width: 1024px) 60vw, 30vw"
      className={`h-auto w-full object-contain ${className}`}
    />
  );
}
