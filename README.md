# City of God Christian Centre — Website & Admin Panel

A Next.js + Payload CMS site replacing the previous WordPress build. Payload runs
embedded inside the Next.js app (no separate backend), backed by Postgres, and
gives staff/volunteers a role-based admin panel at `/admin` for day-to-day
content changes — no code required.

See [`.claude/plans`](./) — or ask the team — for the full project plan: tech
stack rationale, data model, and build phases. This repo currently reflects
**Phase 1**: project scaffold, Postgres wiring, and the role-based access
control foundation.

## Roles

Set per-user on the `role` field of the Users collection:

| Role | Can do |
|---|---|
| Super Admin | Everything, including managing other users' roles |
| Admin / Pastor | Full content control; can manage Content Editor/Ministry Leader/Volunteer accounts; only role (besides Super Admin) that can read prayer requests and contact/appointment/membership submissions |
| Content Editor | Full CRUD + publish on all public content (pages, ministries, events, sermons, media, resources) |
| Ministry Leader | Edit only their own ministry's content (added in Phase 2) |
| Volunteer | Draft-only content, pending review by a Content Editor or above |

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

`docker compose up` (no `-f` flag) builds and runs the **production** image
instead — this is what self-hosted deployment uses, and expects the DB
schema to already exist via versioned migrations rather than auto-creating
it (see the comment in `src/payload.config.ts`). Not yet set up — coming in
a later phase, before go-live.

## Useful scripts

- `npm run dev` — local dev server
- `npm run build` / `npm start` — production build and serve
- `npm run generate:types` — regenerate `src/payload-types.ts` after changing
  any collection/global
- `npm run lint` — ESLint
- `npm run test` — integration (Vitest) + e2e (Playwright) tests

## Deployment

Self-hosted via Docker (see `Dockerfile` and `docker-compose.yml`). CI
(`.github/workflows/ci.yml`) lints, typechecks, and builds on every PR.
