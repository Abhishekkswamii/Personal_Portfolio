"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query rather than sampling it once in an effect.
 * This keeps the value correct when the user changes the setting mid-session —
 * plugging in a mouse, or switching on Reduce Motion — and avoids the
 * cascading render that setState-in-an-effect causes.
 *
 * Returns `false` during SSR and the first client render, so anything gated on
 * it is opt-in after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True only for a real pointer that can hover, with motion allowed. */
export function useFinePointer(): boolean {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return fine && !reduced;
}
