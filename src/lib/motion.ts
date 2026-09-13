/**
 * Shared easing curves.
 *
 * Most of the site's motion is CSS (see the SSR-SAFE MOTION block in
 * globals.css) — these mirror `--ease-editorial` and `--ease-soft` for the
 * handful of components that still animate in JavaScript, all of which do so
 * after mount: the contact modal, the services accordion, the mobile sheet.
 *
 * Keeping both definitions in step matters: a transition that eases one way in
 * CSS and another in JS reads as two different systems.
 */

/** --ease-editorial: decisive start, long settle. The site's default. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** --ease-soft: symmetric. For things that open and close. */
export const EASE_SOFT = [0.65, 0, 0.35, 1] as const;
