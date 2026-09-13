"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/lib/useMediaQuery";

type Mode = "default" | "view" | "link" | "cta" | "portrait";

/**
 * Desktop-only cursor. A 9px ring that grows into a label on meaningful
 * targets and does nothing at all the rest of the time.
 *
 * The ring uses `difference` blending so one element stays legible over both
 * the paper and the dark sections — no per-section colour logic.
 * Never mounts on touch, coarse pointers, or reduced motion.
 */
export function CustomCursor() {
  const enabled = useFinePointer();
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      const next = (el?.getAttribute("data-cursor") as Mode) || "default";
      setMode((m) => (m === next ? m : next));
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    const tick = () => {
      // Light trailing — enough to feel physical, not enough to feel laggy.
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    document.documentElement.classList.add("hide-native-cursor");

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("hide-native-cursor");
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  // Only "view" fills and captions. Over the portrait the cursor just opens
  // into a ring — the technical marks on the figure carry the message, and a
  // labelled disc on top of them would be two voices saying the same thing.
  //
  // Sizes are capped at 44px. The cursor is a hint, not an object: anything
  // larger starts covering the very thing it is pointing at — a button label,
  // the navigation, a face.
  //
  // The portrait deliberately does NOT enlarge it. That is the one surface
  // where the cursor sits directly over a face, and it is also where the
  // registration marks and the colour fragment are doing the talking; a
  // swollen ring there competes with both.
  const expanded = mode === "view";
  const size =
    mode === "view" ? 44 : mode === "portrait" ? 9 : mode === "cta" ? 28 : mode === "link" ? 24 : 9;
  const caption = mode === "view" ? "View" : "";

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-100 mix-blend-difference will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-white transition-[width,height,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: size,
          height: size,
          backgroundColor: expanded ? "#fff" : "transparent",
        }}
      >
        <span
          className="label text-black transition-opacity duration-300"
          style={{ opacity: expanded ? 1 : 0 }}
        >
          {caption}
        </span>
      </div>
    </div>
  );
}
