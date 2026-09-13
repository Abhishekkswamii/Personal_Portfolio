# Abhishek Swami — Portfolio

Personal site for Abhishek Swami: software engineer working across AI workflows,
backend systems and the web.

**Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** · **Motion** ·
**Redis**. Self-contained by design — one web service, one database, no
Supabase, no MySQL, no S3/R2, no second CDN. Content lives in Redis, media on a
persistent disk, and both are hosted on Render.

```bash
npm install
npm run dev           # http://localhost:3000
npm run build
npm run start
npm run lint
npm run admin:create  # create or update the admin login
```

Redis is **optional**. With no `.env.local`, the site builds, runs and deploys
on the content bundled in `src/lib/content/seed.ts`. Add `REDIS_URL` and
`AUTH_SECRET` and the same site becomes editable at `/admin`.

---

## Local development with Redis

The site runs without a database. To work on the admin you need one locally —
any Redis 6.2+ will do. The quickest is a throwaway container:

```bash
docker run -d --name portfolio-redis -p 6390:6379 redis:7-alpine
```

Then `.env.local`:

```bash
REDIS_URL=redis://localhost:6390
AUTH_SECRET=$(openssl rand -base64 48)
MEDIA_ROOT=/absolute/path/to/a/writable/dir
```

```bash
npm run admin:create
npm run dev          # sign in at /admin/login
```

`docker stop portfolio-redis` when you're done; `docker start portfolio-redis`
to pick up where you left off.

---

# RENDER DEPLOYMENT

One Render **Web Service** runs the whole application — public site, admin
dashboard and every server action. There is no second frontend and no separate
API service.

### 1. Node.js version

**Node 20 or newer.** `package.json` declares `"engines": { "node": ">=20" }`,
and `render.yaml` pins `NODE_VERSION=20` explicitly.

### 2. Install & build commands

```
npm ci && npm run build
```

`render.yaml` sets this for you if you deploy as a Blueprint (Render Dashboard
→ New → Blueprint → point at this repo). Deploying as a plain Web Service
instead, paste the same command into **Settings → Build Command**.

### 3. Start command

```
npm run start
```

which runs `next start -H 0.0.0.0 -p ${PORT:-3000}`. This matters: Render
terminates TLS at its edge and proxies plain HTTP to whatever port it assigns
via `$PORT`, so the app must bind `0.0.0.0` and read that variable rather than
assume `localhost:3000`.

### 4. Environment variables

Render Dashboard → your service → **Environment**. See `.env.example` for the
full list with explanations. The three that matter most:

| Variable | Required | Notes |
|---|---|---|
| `REDIS_URL` | for the CMS | A Redis Cloud connection string, or any Redis 6.2+ |
| `AUTH_SECRET` | for the CMS | ≥32 chars. `openssl rand -base64 48`. Changing it signs everyone out |
| `MEDIA_ROOT` | **for production** | Must point at the mounted persistent disk — see §6 |

Never prefix `REDIS_URL` or `AUTH_SECRET` with `NEXT_PUBLIC_` — that would
inline them into the browser bundle. `render.yaml` marks both `sync: false`,
which tells Render to prompt for them once in the dashboard rather than
storing a value in the blueprint file itself.

> **A credential pasted into a chat, a screenshot, or committed to git is
> compromised the moment it's visible outside Render's own environment
> panel.** If a Redis password has ever been exposed that way, rotate it in
> Redis Cloud before using it anywhere, and only ever paste the new one into
> Render → Environment.

### 5. Redis Cloud setup

1. Create a free database at [Redis Cloud](https://redis.io/cloud/) (or point
   at any Redis 6.2+ instance you already run).
2. Copy its connection string — it looks like
   `rediss://default:PASSWORD@host.redns.redis-cloud.com:12345`.
3. Paste it into Render → Environment → `REDIS_URL`. Nothing else to
   configure: the app creates its own key structure on first write.
4. Create your admin login. Either run `npm run admin:create` from a machine
   with `REDIS_URL` set locally to the same database, or run it unattended
   from a Render shell:
   ```
   node scripts/create-admin.mjs --email you@example.com --password '...' --name 'You'
   ```
5. Sign in at `/admin/login`, then press **Copy content into the database** on
   the dashboard. It refuses to run once any project exists, so it can never
   overwrite your edits.

There is no schema to migrate — every document is plain JSON, written in
exactly the shape `src/lib/content/types.ts` describes.

### 6. Persistent disk (media) — read this one

Render's web services run on an **ephemeral filesystem** by default: anything
written into the app's own directory at runtime — `public/` included — is
gone the next time the service restarts or redeploys.

The fix is a Render **persistent disk**, attached to the service and mounted
at a path you choose. `render.yaml` requests one:

```yaml
disk:
  name: portfolio-media
  mountPath: /var/data
  sizeGB: 1
```

Set `MEDIA_ROOT=/var/data/uploads` to match. Uploaded files then live outside
the ephemeral part of the filesystem and are served back over HTTP by the
route handler at `/uploads/[...path]`. Redis stores only the resulting URL
plus width, height and alt text — never the image bytes.

Persistent disks are available on paid web service plans; `render.yaml` sets
`plan: starter` as the minimum that supports one. Deploying without a disk at
all still works — uploads just won't survive a restart, which the media
persistence test below exists to catch before you rely on it.

### 7. Domain

Render Dashboard → your service → **Settings → Custom Domains → Add** →
`abhishekswami.work.gd`. Render will display the exact DNS record to create
(a CNAME or an A record, depending on whether it's an apex domain) — add
**that value, as shown**, at your DNS provider (DNSExit). Do not guess or
reuse a value from anywhere else; Render's own panel is the only source of
truth for what to put there.

Once DNS resolves, Render provisions and renews TLS for the domain
automatically — nothing to configure on the app side. Until it's verified,
the app is fully reachable at its `*.onrender.com` URL, and `NEXT_PUBLIC_SITE_URL`
can point at either while you're getting the domain sorted.

### 8. Production verification

```bash
curl -I https://abhishekswami.work.gd/                    # 200
curl -I https://abhishekswami.work.gd/work/sehatconnect   # 200
curl -I https://abhishekswami.work.gd/admin                # 307 → /admin/login
curl -I https://abhishekswami.work.gd/zzz                  # 404
```

Then, signed in:

- Admin → Dashboard shows real row counts (not the "empty database" notice,
  and not the red "could not reach the database" one either).
- Upload an image to any project and confirm it appears on the public page.

---

## Media persistence test — do this before trusting uploads

1. Upload an image to a project from Admin.
2. **Restart** the Render service (Dashboard → Manual Deploy → Restart, or
   trigger any redeploy).
3. Reload the project's public page.

If the image is gone, `MEDIA_ROOT` is not pointing at the mounted disk — fix
the disk configuration before treating uploads as durable. Do not skip this;
it is the one failure mode that looks fine locally and silently loses content
in production.

---

## Backups

**Redis** — Redis Cloud includes automated backups on most plans; confirm
yours in its dashboard. For a copy you keep yourself:

```bash
redis-cli -u "$REDIS_URL" --rdb ./portfolio-backup-$(date +%F).rdb
```

Restore by pointing a fresh instance at that RDB file, or by writing a small
script that reads the dump and replays `SET`/`ZADD` calls — there is no
proprietary format here, just plain JSON strings and sorted sets.

**Media** — the `MEDIA_ROOT` tree on the persistent disk. Render doesn't
provide a one-click disk backup, so pull it down yourself periodically:

```bash
# from a Render shell session, or after mounting the disk elsewhere
tar czf uploads-$(date +%F).tar.gz -C /var/data uploads
```

A Redis dump without the matching media restores content with broken images —
back up both together.

**Code** — git. The seed content in `src/lib/content/seed.ts` means a fresh
clone renders a complete site even with an empty database.

---

## Architecture

```
src/
  app/
    layout.tsx              document shell only (fonts, metadata)
    not-found.tsx           global 404, brings its own chrome
    (site)/                 public site — nav, cursor, contact modal, footer
      page.tsx  template.tsx  not-found.tsx  work/[slug]/page.tsx
    admin/
      layout.tsx            metadata + noindex (no auth guard — see below)
      login/page.tsx
      (protected)/          everything here requires a session
      actions.ts            every admin write
    uploads/[...path]/      serves media from MEDIA_ROOT
  components/               public UI + components/admin/ for the CMS
  sections/                 Hero · SelectedWork · Services · Experience
                            About · Skills · Patent · Contact
  lib/
    content/                types.ts · seed.ts · repository.ts
    admin/                  schema.ts · data.ts
    redis/                  config.ts · client.ts
    auth/                   session.ts · password.ts · rate-limit.ts
    storage/                uploads.ts
  proxy.ts                  admin gate
scripts/create-admin.mjs    creates the admin login
render.yaml                 Render Blueprint (build, start, disk, env shape)
```

The auth guard sits in `admin/(protected)/layout.tsx`, not `admin/layout.tsx` —
a guard at the higher level would also wrap `/admin/login` and redirect it to
itself.

### The data model

Every collection (`projects`, `experiences`, `services`, `skillCategories`,
`education`, `patents`, `socialLinks`) is one Redis **sorted set** holding
ordered ids — `portfolio:projects` — plus one **JSON string** per document —
`portfolio:project:{id}`. The sorted set is purely an index: reordering a
collection means rewriting the set, never touching the documents, and listing
one means one `ZRANGE` plus one `MGET`. `profile` and `settings` are each a
single JSON string at a fixed key.

A document is stored in exactly the shape `content/types.ts` describes —
camelCase, matching the public site's types field-for-field — so there is no
translation layer between what the admin form writes and what the repository
reads. Adding a field to the schema (`lib/admin/schema.ts`) is the only change
needed to expose it in a form; the document just carries an extra key.

### Content flow

Components never contain copy. `lib/content/repository.ts` is the single read
path. Optional fields are genuinely optional — `hasText`, `hasItems` and
`hasImage` gate every conditional block, so an empty field hides its element
rather than rendering an empty heading or a broken image.

Public pages are statically prerendered with a 5-minute ISR window, and admin
saves call `revalidatePath` for instant updates — a project published from the
admin appears without a redeploy, verified against a production build.

### Resilience

Every Redis call is wrapped in a deadline (`REDIS_TIMEOUT_MS`, default 2s). If
Redis is slow, unreachable, or the connection attempt itself hangs — a network
partition looks different from a refused connection, and both are handled —
the public site serves the bundled seed instead of an error page.

A **circuit breaker** sits in front of the connection itself
(`lib/redis/client.ts`): once an attempt fails, further attempts are skipped
outright for a 5-second cooldown rather than each independently re-paying the
full timeout. Without it, a single page load that fans out into several Redis
reads — the root layout's metadata plus a page's own data — pays the timeout
once *per read*, and a 2-second bound quietly becomes a 10-second one. This
was caught by testing against a genuinely unreachable host (a black-holed IP,
not just a stopped local container, which fails fast and doesn't reproduce the
problem) rather than assumed to work from the code alone.

The admin tells outage apart from an empty database — `ping()` decides which
banner to show — because "0 rows" and "couldn't ask" call for different
actions from you, and conflating them once made an outage look like an
onboarding prompt.

### Security

- Sessions are signed JWTs in `httpOnly`, `SameSite=Strict`, `Secure` cookies.
- Passwords are scrypt hashes (Node's own crypto — no native addon to compile).
- Login is rate-limited per IP **and** per account, and runs a hash comparison
  even for unknown addresses so response time doesn't reveal which exist.
- Every mutation re-verifies the session server-side and checks the request
  Origin; the proxy is only an optimisation, never the sole gate.
- Collection names come from a fixed allowlist (`lib/admin/schema.ts`); a
  crafted request naming anything else is rejected before it touches Redis.
- Uploads are validated by **magic number**, not the declared MIME type, then
  re-encoded through sharp and written under a generated filename. The
  uploaded filename never touches the filesystem path.
- `/uploads/[...path]` resolves against `MEDIA_ROOT` and refuses anything that
  escapes it, and serves only known image extensions.
- `REDIS_URL` and `AUTH_SECRET` never reach a client bundle — verified by
  grepping the production `.next/static` output, not assumed from the code.

---

## Admin

`/admin/login` → `/admin`.

| Screen | What you can change |
|---|---|
| Dashboard | Row counts, draft warnings, first-run seeding, a clear outage banner |
| Profile | Name, title, hero statement, bio, availability, contact, portrait |
| Projects | Full case studies — create, edit, duplicate, delete, reorder, publish |
| Experience · Services · Skills · Education · Patents · Social links | Full CRUD, reorder, publish |
| Media | Upload, copy URL, delete; files nothing references are marked **Unused** |
| Site settings | SEO, contact form, headline, footer |

Every form is generated from one declarative schema in
`src/lib/admin/schema.ts` — adding a field is a one-line change there, not a new
component.

**Drafts**: new projects start unpublished. Only published rows are ever
selected for the public site.

### Adding project images

Admin → Projects → *project* → **Images**: thumbnail (homepage card), hero (top
of the case study), an optional architecture diagram, and a gallery. Files land
in `MEDIA_ROOT/projects/<slug>/`, are re-encoded to WebP, capped at 2400px on
the long edge, and stored with their dimensions so layout shift stays at zero.

Until you upload one, each project falls back to its drafted schematic, then to
a designed placeholder. Nothing renders a broken frame.

Replacing an image leaves the old file in the media library, flagged
**Unused** — delete it there to reclaim the space.

### The contact form

Open your Google Form → **Send** → `< >` → copy the `src`. Paste it into
**Admin → Site settings → Google Form URL**. `?embedded=true` is added
automatically. With no URL set, every "Let's talk" control opens an email
instead — the site never shows a broken iframe.

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
