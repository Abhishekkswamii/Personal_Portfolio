/**
 * Route transition.
 *
 * Deliberately a plain element with a CSS animation, and deliberately NOT a
 * client component. The previous version branched on `useReducedMotion()` and
 * returned a bare fragment in one case and a wrapper in the other — the server
 * rendered one tree, the browser rendered the other, and React discarded the
 * server HTML with a hydration error. Same markup everywhere now; the
 * reduced-motion media query cancels the animation without changing the DOM.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
