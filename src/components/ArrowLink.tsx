import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One arrow glyph for the whole site — not an icon set. Direction is a
 * rotation of the same mark so the weight never varies.
 */
export function Arrow({
  className = "",
  direction = "up-right",
}: {
  className?: string;
  direction?: "up-right" | "down" | "right" | "left";
}) {
  const rotation =
    direction === "down"
      ? "rotate-90"
      : direction === "right"
        ? "rotate-45"
        : direction === "left"
          ? "rotate-[225deg]"
          : "";
  return (
    <svg
      viewBox="0 0 12 12"
      // Intrinsic dimensions are deliberate. An SVG with no width/height falls
      // back to 300x150 if its sizing class is ever missing, which turns a
      // 40px pill into a giant circle. The em-based class still governs the
      // rendered size; these only bound the worst case.
      width="12"
      height="12"
      fill="none"
      aria-hidden="true"
      className={`size-[0.72em] shrink-0 ${rotation} ${className}`}
    >
      <path
        d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

/* ==========================================================================
   BUTTON SYSTEM
   One geometry: 2.875rem tall, full radius, 0.8125rem label, same transition.
   Three ranks — solid, outline, ghost — and nothing else.
   ========================================================================== */

const PILL_BASE =
  // whitespace-nowrap keeps a label on one line: a wrapping label inside a
  // fully rounded button collapses it into a circle.
  "group inline-flex h-[2.875rem] shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color] duration-300 md:text-[0.875rem]";

const PILL_VARIANT = {
  solid: "bg-ink text-paper hover:bg-ink-soft",
  outline: "border border-rule text-ink hover:border-ink",
  ghost: "text-ink hover:bg-ink/5",
} as const;

const ARROW_MOTION = {
  down: "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0.5",
  default:
    "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
};

type PillProps = {
  children: ReactNode;
  variant?: keyof typeof PILL_VARIANT;
  direction?: "up-right" | "down" | "right" | "left";
  className?: string;
  cursor?: string;
  /** Omit the arrow entirely for labels that don't imply travel. */
  arrow?: boolean;
} & (
  | { href: string; external?: boolean; onClick?: never; type?: never }
  | { href?: never; external?: never; onClick: () => void; type?: "button" }
);

/** Primary and secondary actions. Renders a link or a button as required. */
export function PillLink({
  children,
  variant = "solid",
  direction = "up-right",
  className = "",
  cursor,
  arrow = true,
  ...rest
}: PillProps) {
  const cls = `${PILL_BASE} ${PILL_VARIANT[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <Arrow
          direction={direction}
          className={direction === "down" ? ARROW_MOTION.down : ARROW_MOTION.default}
        />
      ) : null}
    </>
  );

  if ("onClick" in rest && rest.onClick) {
    return (
      <button type="button" onClick={rest.onClick} data-cursor={cursor} className={cls}>
        {inner}
      </button>
    );
  }

  const href = (rest as { href: string }).href;
  const external = (rest as { external?: boolean }).external;

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        data-cursor={cursor}
        className={cls}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} data-cursor={cursor} className={cls}>
      {inner}
    </Link>
  );
}

/** Tertiary rank: editorial text with an underline that draws in. */
export function TextLink({
  href,
  children,
  external = false,
  dark = false,
  direction = "up-right",
  arrow = true,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  external?: boolean;
  dark?: boolean;
  direction?: "up-right" | "down" | "right" | "left";
  arrow?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `group inline-flex items-center gap-1.5 text-[0.875rem] tracking-[-0.01em] ${
    dark ? "text-paper/70 hover:text-paper" : "text-gray hover:text-ink"
  } transition-colors duration-300 ${className}`;

  const inner = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100 ${
            dark ? "bg-paper" : "bg-ink"
          }`}
        />
      </span>
      {arrow ? (
        <Arrow
          direction={direction}
          className={`opacity-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 ${
            direction === "left"
              ? "group-hover:-translate-x-1"
              : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          }`}
        />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} data-cursor="cta" className={cls}>
        {inner}
      </button>
    );
  }
  if (!href) return null;

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="link" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} data-cursor="link" className={cls}>
      {inner}
    </Link>
  );
}
