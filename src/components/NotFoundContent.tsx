import { PillLink, TextLink } from "@/components/ArrowLink";

/** One 404 body, rendered by both the route-level and global not-found pages. */
export function NotFoundContent() {
  return (
    <section className="shell flex min-h-[72svh] flex-col justify-center py-32">
      <p className="label text-gray-light">Error 404</p>
      <h1 className="display-tight mt-6 text-[clamp(3rem,11vw,9rem)]">
        Nothing here.
      </h1>
      <p className="body-copy mt-7 max-w-[38ch]">
        The link may be out of date, or the page may have moved.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <PillLink href="/" direction="left" cursor="link">
          Back home
        </PillLink>
        <PillLink href="/#work" variant="outline" direction="down" cursor="link">
          Selected work
        </PillLink>
      </div>
      <div className="mt-8">
        <TextLink href="/#contact">Or get in touch</TextLink>
      </div>
    </section>
  );
}
