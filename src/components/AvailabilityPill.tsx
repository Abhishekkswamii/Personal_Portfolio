/**
 * Status pill. The only pulse on the entire site, and it is 6px across.
 * Goes quiet — grey, no animation — when availability is switched off.
 */
export function AvailabilityPill({
  label,
  open = true,
  dark = false,
}: {
  label: string;
  open?: boolean;
  dark?: boolean;
}) {
  if (!label) return null;

  return (
    <span
      className={`inline-flex h-9 items-center gap-2 rounded-full border pl-2.5 pr-3.5 ${
        dark ? "border-rule-invert text-paper/75" : "border-rule text-gray"
      }`}
    >
      <span className="relative flex size-1.5">
        {open ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-clay opacity-60 [animation-duration:2.6s]" />
        ) : null}
        <span
          className={`relative inline-flex size-1.5 rounded-full ${
            open ? "bg-clay" : "bg-gray-light"
          }`}
        />
      </span>
      <span className="label !tracking-[0.1em]">{label}</span>
    </span>
  );
}
