"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";

/**
 * The signature element.
 *
 * Composition: the portrait is the BACK layer. Both lines of the name render
 * over it — the outlined given name traces across the figure, the solid
 * surname crosses the chest. The name is therefore never obscured, and the
 * overlap reads as deliberate rather than accidental.
 *
 * Entrance: a CSS keyframe (`.portrait-rise`). The figure starts fully below
 * its own clipping frame and rises once, on first paint. Doing this in CSS
 * rather than JavaScript is what keeps it hydration-safe — there is no
 * client-only state, so the server and the browser render the same markup —
 * and `prefers-reduced-motion` cancels the animation in the stylesheet without
 * changing a single element.
 *
 * Hover: technical marks only — corner brackets, a centre crosshair, an index
 * label — plus a few pixels of cursor parallax. The figure itself never
 * scales. All of it is post-mount state, so none of it affects hydration.
 */
export function HeroPortrait({ image }: { image: ImageRef }) {
  const [hovered, setHovered] = useState(false);
  const inner = useRef<HTMLDivElement>(null);

  // Cursor parallax, capped at 3px — a response, not an effect.
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = inner.current;
    if (!el) return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width - 0.5) * 6;
    const y = ((e.clientY - b.top) / b.height - 0.5) * 6;
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  }, []);

  const resetPointer = useCallback(() => {
    const el = inner.current;
    if (el) el.style.transform = "translate3d(0, 0, 0)";
  }, []);

  return (
    <div
      data-cursor="portrait"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        resetPointer();
      }}
      onPointerMove={onPointerMove}
      className="portrait-figure absolute bottom-0 left-1/2 z-0 -translate-x-1/2 select-none"
    >
      <div className="relative h-full">
        {/* The clipping frame the figure rises out of. */}
        <div className="h-full overflow-hidden">
          <div className="portrait-rise h-full origin-bottom">
            <div
              ref={inner}
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

        {/* -- Technical marks. Hover only, desktop only, monochrome. ------ */}
        <div
          aria-hidden="true"
          data-visible={hovered ? "true" : "false"}
          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[visible=true]:opacity-100 md:block"
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

          {/* Alignment guides through the centre of the figure. */}
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/12" />
          <span className="absolute left-0 top-[22%] h-px w-full bg-ink/12" />

          {/* Crosshair on the subject. */}
          <span className="absolute left-1/2 top-[22%] flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span className="absolute h-px w-4 bg-ink/45" />
            <span className="absolute h-4 w-px bg-ink/45" />
          </span>

          <span className="label absolute -left-px top-[calc(22%+1.25rem)] whitespace-nowrap text-ink/40">
            01 / Portrait
          </span>
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
