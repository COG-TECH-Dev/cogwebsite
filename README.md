# City of God Christian Centre — Website & Admin Panel

A Next.js + Payload CMS site replacing the previous WordPress build. Payload runs
embedded inside the Next.js app (no separate backend), backed by Postgres, and
gives staff/volunteers a role-based admin panel at `/admin` for day-to-day
content changes — no code required.

See [`.claude/plans`](./) — or ask the team — for the full project plan: tech
stack rationale, data model, and build phases. This repo currently reflects
**Phase 5**: the full site, admin panel, motion/polish, spam-protected forms
with email notifications, and a production-ready deployment path with real
database migrations.

## Roles

Set per-user on the `role` field of the Users collection:

| Role | Can do |
|---|---|
| Super Admin | Everything, including managing other users' roles |
| Admin / Pastor | Full content control; can manage Content Editor/Ministry Leader/Volunteer accounts; only role (besides Super Admin) that can read prayer requests and contact/appointment/membership submissions |
| Content Editor | Full CRUD + publish on all public content (pages, ministries, events, sermons, media, resources) |
| Ministry Leader | Edit only their own ministry's content, and events/gallery items tied to it |
| Volunteer | Draft-only content on Events/Media Gallery, pending review by a Content Editor or above |

The admin panel only shows each user the collections and actions their role
allows — see [`src/access/`](src/access) for the shared permission logic
reused across every collection.

## Local development

1. `cp .env.example .env` and fill in `DATABASE_URI` (a local or Docker
   Postgres instance) and a fresh `PAYLOAD_SECRET`.
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000/admin` and follow the on-screen steps to
   create the first Super Admin account.

### With Docker

For **local development**, use `docker compose -f docker-compose.dev.yml up`
— this runs the app with `npm run dev` (hot reload, and Payload auto-creates
the database schema on first run) alongside a Postgres container. No local
Node.js or Postgres install needed.

Two things to know when developing this way:
- New npm packages need a container restart to be installed (`npm install`
  only runs once, at container start) — `docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up`.
- Brand-new route/page files sometimes need the same restart to be picked up
  by the dev server's route scan — edits to *existing* files hot-reload fine.

`docker compose up` (no `-f` flag) builds and runs the **production** image
instead — see [Deployment](#deployment) below.

## Database migrations

Local dev (`docker-compose.dev.yml`) auto-syncs the database schema to match
the code — convenient, but Payload deliberately disables that in production
since an auto-diff could drop a column and lose real data. Production instead
applies versioned migration files, automatically, on startup.

Whenever you change a collection or global's fields:

```bash
npm run migrate:create
```

This generates a new file under `src/migrations/` (diffed against your local
dev database) — commit it. The next production deploy applies it
automatically when the app boots (no manual step, see the `prodMigrations`
comment in `src/payload.config.ts`).

## Useful scripts

- `npm run dev` — local dev server
- `npm run build` / `npm start` — production build and serve
- `npm run generate:types` — regenerate `src/payload-types.ts` after changing
  any collection/global
- `npm run migrate:create` / `npm run migrate` — generate / apply database migrations
- `npm run lint` — ESLint
- `npm run test` — integration (Vitest) + e2e (Playwright) tests

## Deployment

Two supported paths — same codebase either way, only environment variables
and where media files live change.

### Option A: Vercel (managed, least ops)

1. Import this GitHub repo into Vercel.
2. In the Vercel dashboard, add a Postgres database to the project (Storage
   tab → Postgres, powered by Neon) — this sets a connection string
   automatically; copy its value into this project's `DATABASE_URI`
   environment variable (Vercel's own var name for it varies, so set
   `DATABASE_URI` explicitly to match, since that's the name our code reads).
3. Enable Vercel Blob storage for the project (Storage tab → Blob) — this
   automatically injects `BLOB_READ_WRITE_TOKEN`, which switches media
   uploads from local disk (which doesn't exist on Vercel) to Blob storage.
   Nothing else to configure.
4. Add a fresh `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL` (your Vercel
   domain) as environment variables. `SMTP_*`/`NOTIFY_EMAIL` are optional,
   same as below.
5. Deploy. Database migrations run automatically on first boot — no manual
   step (see `prodMigrations` in `src/payload.config.ts`).

The `Dockerfile`/`docker-compose.yml`/`Caddyfile`/`scripts/backup.sh` below
simply go unused on this path.

### Option B: Self-hosted via Docker

`docker compose up -d` builds the app image and starts it behind a Caddy
reverse proxy (automatic HTTPS) plus Postgres — see `Dockerfile`,
`docker-compose.yml`, and `Caddyfile`. Media uploads are stored on local disk
in this setup (a Docker volume), not Vercel Blob.

1. Point your domain's DNS at the server.
2. Set `SITE_DOMAIN` in `.env` to that domain — Caddy then requests and
   renews a Let's Encrypt certificate automatically.
3. Set `SMTP_*` in `.env` for real outgoing email (password resets, and
   notifications when a prayer request or enquiry is submitted), and
   `NOTIFY_EMAIL` for where those notifications go. Without these, the site
   still works — emails just get logged instead of sent.
4. `docker compose up -d --build`

**Backups**: `scripts/backup.sh` runs `pg_dump` against the running stack and
rotates old backups — schedule it with cron (see the comment at the top of
the script), and copy the output somewhere off this server, not just to local
disk. (Not needed on Vercel — your managed Postgres provider handles this.)

CI (`.github/workflows/ci.yml`) lints, typechecks, applies migrations to a
fresh database, and builds on every PR, regardless of which deployment
option you use.

### Give / donations

The `/give` page pulls from a `Pages` document (slug `give`) via the same
block-based layout builder used for About — add an Embed block with a link to
whichever giving platform the church chooses (e.g. Tithe.ly, which supports
UK Gift Aid; GoCardless; or Stripe Payment Links). This is a business
decision for the church to make, not something built into the code — the
site never handles card details or moves money itself.
