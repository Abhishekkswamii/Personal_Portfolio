"use client";

import { PillLink } from "./ArrowLink";
import { useContactForm } from "./ContactFormProvider";

/**
 * The hero's primary action. Split into its own client component so the hero
 * itself can stay a server component — the contact modal needs a hook, the
 * rest of the hero does not.
 */
export function HeroActions() {
  const { open } = useContactForm();

  return (
    <PillLink onClick={open} cursor="cta">
      Let&rsquo;s work together
    </PillLink>
  );
}
