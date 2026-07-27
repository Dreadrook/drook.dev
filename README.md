# drook.dev

Personal site for Sam Flynn. Next.js 16 (App Router) + Chakra UI v3, exported as
a static site and deployed to Azure Static Web Apps by GitHub Actions on every
push to `main`.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                     | What it does                                        |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Dev server, including the admin panel at `/admin`    |
| `npm run build`            | Static export into `out/` (what Azure serves)        |
| `npm run typecheck`        | `tsc --noEmit`                                       |
| `npm run lint`             | ESLint                                               |
| `npm run admin:password`   | Set the local admin password (see below)             |

## Where the content lives

Every editable string — bio, contact details, resume link, and the project list —
is in **`src/content/site.json`**. Pages import it at build time through
`src/lib/content.ts`, which also declares the types, so a malformed edit fails
`npm run typecheck` instead of shipping.

Adding a project means adding an entry to `projects[]`:

- `published: false` hides it everywhere.
- `featured: true` puts it in the home page carousel.
- `externalUrl` set → the project links straight out to that URL in a new tab.
- `externalUrl` empty → the project gets its own generated page at
  `/projects/<slug>/`, built from `summary`, `body[]` (one entry per paragraph),
  `tags[]` and `links[]`.

## Admin panel (local only)

`/admin` is a small editor for everything in `site.json`: bio and contact fields,
the resume PDF, and adding / removing / reordering / drafting projects.

It runs **only on the dev server**. The page and its API live in files named
`*.dev.tsx` / `*.dev.ts`, and `pageExtensions` in `next.config.ts` only registers
those extensions when `NODE_ENV !== "production"`. `npm run build` therefore
emits no `/admin` route and no write endpoints at all — there is nothing to
attack on the deployed site.

First-time setup:

```bash
npm run admin:password       # prompts, writes .env.local (git-ignored)
npm run dev                  # restart so the new values load
# open http://localhost:3000/admin
```

Useful flags: `-- --username sam`, `-- --rotate-secret`, `-- --print`.

How the login is protected:

- Password stored only as an scrypt hash (N=2^15) in `.env.local`, verified with
  a constant-time compare. Minimum 12 characters.
- Session is an HMAC-SHA256-signed, HttpOnly, `SameSite=Strict` cookie that
  expires after 8 hours.
- Five failed attempts locks that client out for 15 minutes.
- Mutating requests are rejected unless the `Origin` header matches the host.
- Uploads are checked by magic bytes as well as MIME type (SVG is refused), size
  capped, and always renamed server-side.

### Publishing your edits

Saving writes to your working tree. To put changes live:

```bash
git add -A && git commit -m "Update content" && git push
```

Uploads land in `public/uploads/` (images) and `public/Resume.pdf` (resume) — both
need committing too. A replaced resume is recoverable from git history until you
commit.

### Optional: the deployed `/admin` path

`public/staticwebapp.config.json` also gates `/admin*` behind Azure Static Web Apps
authentication with an `admin` role. Nothing is served there today, so this is
belt-and-braces: if an admin build were ever deployed, Azure would demand a login
first. To make that role usable, invite yourself in the Azure portal
(*Static Web App → Role management*) and assign the `admin` role.

## Deployment notes

- `output: "export"` in production, so there is no server: no API routes, no
  middleware, no server-side rendering at request time.
- `trailingSlash: true`, so sub-routes export as `projects/<slug>/index.html`.
  Azure serves those directly; without it, exported pages 404 in production.
- Internal links should therefore keep their trailing slash (`/projects/`).
- `images.unoptimized` is on because the Next image optimizer needs a server.
- The GitHub Actions workflow installs, typechecks, lints and builds, then
  uploads `out/` with `skip_app_build: true`. A type or lint error fails the
  deploy instead of shipping a broken site.
- `staticwebapp.config.json` lives in `public/` so the export copies it to the
  root of `out/`, where Azure reads it. At the repo root it would not be part of
  the uploaded artifact.
- It has no `navigationFallback`: every route is prerendered, and a fallback
  rewrite answers unknown paths with HTTP 200, which hides broken links.
  `responseOverrides` serves `404.html` with a real 404 instead.
