# Abhishek Swami — Portfolio

Personal site for Abhishek Swami: software engineer working across AI workflows,
backend systems and the web.

**Next.js 16** (App Router, static export) · **TypeScript** · **Tailwind CSS v4**
· **Motion**. Entirely static — no database, no server runtime, no admin. Every
page is prerendered at build time from `src/lib/content/seed.ts` and served as
plain files from **Firebase Hosting**'s CDN.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # writes the static site to out/
npm run lint
```

`npm run build` produces `out/` — a directory of plain HTML/CSS/JS/images with
no server behind it. `firebase deploy --only hosting` ships that directory
as-is; there is nothing else to configure per environment.

---

## Deployment — Firebase Hosting

Production is **GitHub → Firebase Hosting**, fully automatic: every push to
`main` runs `.github/workflows/firebase-hosting-merge.yml`, which builds and
deploys `out/`. Nothing to run by hand for a normal change.

```bash
git push origin main   # builds + deploys automatically
```

To deploy manually (first-time setup, or debugging the pipeline):

```bash
npm ci
npm run build
firebase deploy --only hosting --project abhishek-portfolio-2026
```

Firebase project: **abhishek-portfolio-2026**, on the `amswami9273@gmail.com`
account. `.firebaserc` pins the default project; `firebase.json` points
Hosting at `out/` and sets long-lived immutable cache headers on
`/_next/static/**` and images, while HTML is served `must-revalidate` so a new
deploy is visible immediately.

The production domain (`abhishekswami.work.gd`) still points at the prior
Render deployment until it's explicitly cut over — see the project's own
notes for that migration step.

---

## Architecture

```
src/
  app/
    layout.tsx              document shell only (fonts, metadata)
    not-found.tsx           global 404, brings its own chrome
    (site)/                 the entire public site
      page.tsx  template.tsx  not-found.tsx  work/[slug]/page.tsx
  components/               public UI (cursor, nav, contact modal, project media…)
  sections/                 Hero · SelectedWork · Services · Experience
                            About · Skills · Patent · Contact
  lib/
    content/                types.ts · seed.ts · repository.ts
.github/workflows/          GitHub Actions: build + deploy to Firebase Hosting
firebase.json  .firebaserc  Hosting config + default project
render.yaml                 prior Render Blueprint, kept only for rollback reference
```

### Content flow

Components never contain copy. `lib/content/repository.ts` is the single read
path, and it always resolves to the seed — there is nothing else to read from.
Optional fields are genuinely optional — `hasText`, `hasItems` and `hasImage`
gate every conditional block, so an empty field hides its element rather than
rendering an empty heading or a broken image.

`/` and `/work/[slug]` are fully static (`output: "export"` in
`next.config.ts`); `generateStaticParams` in `work/[slug]/page.tsx` enumerates
every project at build time. Changing content means editing `seed.ts` and
pushing — there is no live editing surface.

---

## Design system

Defined once in `src/app/globals.css` under `@theme`.

| | |
|---|---|
| **Ink** | `#FDFDFD` paper · `#0A0909` ink · `#707070` grey · `#9C6455` clay |
| **Type** | Geist (display/UI), Geist Mono (labels, numerals, figure captions) |
| **Rules** | one hairline weight — `--color-rule` and its inverted counterpart |
| **Rhythm** | two numbers: `--spacing-gutter`, `--spacing-section` |
| **Motion** | two curves, three durations — `src/lib/motion.ts` |
| **Buttons** | three ranks, one geometry — `ArrowLink.tsx` |

The clay accent appears in exactly two places: the availability dot and the
marker on the current role. Everything else is monochrome.

### The hero

Stacking order is declared once, back to front: **portrait → outlined first name
→ solid surname**. The type always wins, so the name stays readable through the
overlap. The portrait is clipped by its own frame and rises from fully below it
— `translateY(100% → 0)` with opacity, an 8px blur and `scale(0.97)` resolving
together over 1.25s, after the type has settled. Then it stops for good.
Hovering reveals technical marks and 3px of cursor parallax; the figure never
scales.

### Motion is CSS, on purpose

The hero entrance and every scroll reveal are CSS animations, not JavaScript.
A component that returns a different DOM tree depending on
`prefers-reduced-motion` renders one structure on the server and another in the
browser — React reports a hydration mismatch and throws the server HTML away.
Driving these from the stylesheet keeps the markup identical everywhere, and
the reduced-motion media query switches the motion off without touching a
single element. Motion (the library) is still used, but only for things that
happen after mount: the contact modal, the services accordion, the mobile
sheet.

`prefers-reduced-motion: reduce` is honoured throughout — everything starts in
its final state, the custom cursor never mounts, transitions collapse. The
result is a static site, not a broken one.

### Sizing the hero

The name is sized against viewport width *and* height
(`clamp(2.25rem, min(19.4vw, (100svh - 20.6rem) / 1.9), 17rem)`). Width leads on
tall viewports, where the poster should fill the page; height takes over on
short ones. The two subtracted constants are the hero's measured furniture and
the lockup's height as a multiple of the base — both taken from the rendered
page, because estimating them is what let the surname fall off a 700px-tall
laptop window. The figure is derived from the same scale, so the poster keeps
its proportions everywhere.

## Accessibility

Semantic landmarks, one `h1` per page, skip link, visible focus on every
interactive element. The contact modal traps focus, closes on Escape and
backdrop click, locks scroll without shifting the page, and restores focus to
the control that opened it.

> Once focus moves inside the embedded Google Form, Escape belongs to that
> document rather than this one. The close button and backdrop remain
> available, which is why both exist.
