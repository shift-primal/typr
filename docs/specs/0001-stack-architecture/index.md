# 0001. Stack and architecture: one Node server on a Hetzner VPS with Neon Postgres

**Date**: 2026-09-30
**Status**: In Progress

## Summary

Typr runs as one TanStack Start app on one small always on server, and that same server also runs the live Tug of war matches over websockets (a connection that stays open so the server can push updates instantly). The server is a Hetzner VPS in Helsinki managed by Coolify (a self hosted deploy dashboard), the database is Neon Postgres in Frankfurt, and secrets come from Bitwarden through varlock. It keeps the scaffold you already have and adds only what live multiplayer and a public URL need, for about €5 a month. The one thing still unproven is that websockets work under TanStack Start's Nitro plugin, so a small echo test comes before anything else is built on it.

## Decision

**Chosen option**: Option 1: One Node server on a Hetzner VPS with Coolify, plus Neon Postgres (full comparison in [rationale.md](rationale.md)).

Typr is a single deployable monolith: the TanStack Start app, its server functions, Better Auth, and the websocket match server all run in one Node 24 process built by Nitro, packaged as a Docker image in GitHub Actions and run by Coolify on a Hetzner CX22 in Helsinki, talking to Neon Postgres in Frankfurt.

**Implementation skills**: `tanstack-start` (`tanstack-skills/tanstack-skills`, `.claude/skills/tanstack-start/`) · `tanstack-router` (`tanstack-skills/tanstack-skills`, `.claude/skills/tanstack-router/`) · `tanstack-query` (`tanstack-skills/tanstack-skills`, `.claude/skills/tanstack-query/`) · `tanstack-query-best-practices` (`deckardger/tanstack-agent-skills`, `.claude/skills/tanstack-query-best-practices/`) · `better-auth-best-practices` (`better-auth/skills`, `.claude/skills/better-auth-best-practices/`) · `drizzle` (`lobehub/lobehub`, `.claude/skills/drizzle/`) · `zod` (`pproenca/dot-skills`, `.claude/skills/zod/`) · `varlock` (`dmno-dev/varlock`, `.claude/skills/varlock/`) · `coolify` (`oakoss/agent-skills`, `.claude/skills/coolify/`) · `hetzner-cloud` (`laguagu/claude-code-nextjs-skills`, `.claude/skills/hetzner-cloud/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Proposed stack

**Already in the scaffold (recorded, not changed):**

| Layer | Choice | Reason |
|---|---|---|
| Framework | TanStack Start (React 19, file based routes, SSR) with the React Compiler | Already scaffolded and running; typed routes and server functions end to end (basis: `package.json`, `.cta.json`) |
| Server runtime | Nitro v3, `node-server` build, via the `nitro/vite` plugin | Already wired in `vite.config.ts`; it is also what gives us websockets (basis: Nitro websocket docs) |
| ORM and migrations | Drizzle ORM + drizzle-kit | Already scaffolded; SQL shaped, typed schema in `src/db/schema.ts` |
| Client server state | TanStack Query with the router SSR integration | Already scaffolded; caches server function results |
| Client shared state | TanStack Store | Already scaffolded; for client only state shared across components |
| Styling | Tailwind CSS v4 | Already scaffolded; the look itself is decided in the design system spec (feature 4) |
| Lint and format | Biome 2 | Already scaffolded; one fast tool for both |
| Package manager and build | pnpm, Vite 8, TypeScript 6 | Already scaffolded |

**Decided in this spec:**

| Layer | Choice | Reason |
|---|---|---|
| Architecture pattern | One deployable monolith, one process, one instance | Solo project at friends scale; nothing forces a split, and one process lets match state live in memory |
| Language runtime | Node 24 LTS; `package.json` `engines` is the single source (CI reads it with `node-version-file: package.json`, the Dockerfile base image matches it) | Active LTS, supported into 2028 |
| Server API | `createServerFn` for all app data; server routes only for things that need a URL: the Better Auth handler, the websocket endpoint, health checks, and later share card images | Typed end to end with no extra layer (basis: `tanstack-start` skill) |
| Validation | Zod 4 | One schema library for server function inputs, websocket messages, and forms; TanStack Start validators accept it directly |
| Realtime transport | Nitro websockets (crossws) in the same server, `features: { websocket: true }`, one endpoint at `/api/ws` | One deploy, and the socket shares the auth cookie; stable in Nitro v3 (basis: Nitro websocket docs) |
| Realtime message format | JSON text frames, every message a Zod discriminated union keyed by `type`, validated on both ends | Easy to debug in devtools; message volume at one message per word is far too small for binary to matter. Runner up: MessagePack |
| Live match state | Held in memory by the server process (the server is the only authority); the final result is written to Postgres when a match ends | Fastest and simplest; valid because there is exactly one instance |
| Primary database | Neon Postgres, free plan, region `aws-eu-central-1` (Frankfurt) | Free, managed backups and branching, Neon MCP already connected; Frankfurt is the closest Neon region to Helsinki (no Nordic region) (basis: Neon regions and plans docs) |
| Database branches | `main` = production, a long lived `dev` branch for local work, reset from `main` when you want fresh data | Nothing to install locally; dev can never touch production data |
| Postgres driver | `postgres` (postgres.js) through `drizzle-orm/postgres-js`, direct (unpooled) Neon connection string with `sslmode=require`, `max: 5`, `idle_timeout: 20` seconds, `connect_timeout: 10` seconds; one Neon role for both the app and migrations for now | Your pick; direct connections keep prepared statements working, and closing idle connections lets Neon scale to zero. Runner up: Neon's pooled string with `prepare: false` |
| Migrations | `drizzle-kit generate` writes SQL into `drizzle/`, committed and reviewed. `drizzle.config.ts` drops `dotenv` and reads `process.env`, filled by `varlock run -- drizzle-kit …`. The deploy job runs `varlock run -- drizzle-kit migrate` with the production token before calling the deploy webhook; if it fails, the job stops and the webhook is never called. `db:push` only against the `dev` branch | Reviewed history, no drizzle-kit in the runtime image, and a failed migration never ships code that expects it |
| Auth library | Better Auth, running inside the app, Drizzle adapter, cookie sessions, `tanstackStartCookies()` plugin | Users and sessions live in our own database, and the websocket reads the same cookie. Which sign in methods is decided in feature 7 (basis: `better-auth-best-practices` skill) |
| Websocket identity | The upgrade hook calls `auth.api.getSession({ headers })` with the upgrade request's headers. No session means the upgrade is rejected with 401 (live play needs an account; the private rooms spec may relax this). On success the user id is bound to the socket for its whole life; the session is not checked again until the next connect. Cookies keep Better Auth's defaults (`Secure` in production, `SameSite=Lax`), which the same origin upgrade carries | Same origin, so nothing extra to issue |
| Env and secrets | varlock with a committed `.env.schema` (types, `@required`, `@sensitive`), secrets resolved from Bitwarden Secrets Manager via the varlock Bitwarden plugin (pinned in the `@plugin(...)` line). All secrets live in one Bitwarden project, `typr`, and `.env.schema` references each by its secret UUID. The token lives in `.env.local` on your laptop and in Coolify and GitHub Actions. `APP_ENV` is set next to each token, and `BETTER_AUTH_URL` is derived from `APP_ENV` inside the schema | One validated schema everywhere and one place to rotate a secret. Changed on 2026-09-30 from the original two projects (`typr-dev`/`typr-prod`) to a single project for simplicity; a laptop can now read production secrets (see Negative) (basis: `varlock` skill, varlock Bitwarden plugin docs) |
| How env loads | `varlock run -- <command>` wraps the `dev`, `start`, and `db:*` scripts and the container command. `vite build` needs no secrets (they are only read at runtime), so PR checks and the image build run with no token at all | Works for every command without depending on a framework integration. Runner up (and the fallback if the spike shows `varlock run` does not forward `SIGTERM`): a `varlock/auto-load` import at the top of the server entry |
| Hosting | Hetzner Cloud CX22 (x86, 2 vCPU, 4 GB; or its current successor in the same class) in Helsinki (`hel1`), Ubuntu 24.04 LTS | Always on for about €4 to €5 a month, closest region to Norwegian players (your pick over Fly.io) |
| Deploy platform | Coolify v4 on the VPS, Traefik as the reverse proxy with automatic Let's Encrypt TLS. The app is a "Docker image" resource on `ghcr.io/<owner>/typr:latest`, port 3000, health check `/api/health` every 30 seconds (Coolify runs it with `curl` inside the container, so the runtime image installs `curl`), **rolling updates off** (stop the old container, then start the new one), stop grace period 15 seconds | Your pick; gives a dashboard, logs, and TLS on a box you own. Rolling updates would briefly run two containers, which breaks in memory match state (basis: `coolify` skill) |
| Domain | `typr.haugestol.com` (A and AAAA records to the VPS); Coolify dashboard on its own subdomain with TLS, recommended `coolify.haugestol.com` | Stable origin for auth cookies, OAuth callbacks, and share cards |
| Container | Multi stage Dockerfile on `node:24-bookworm-slim`, pnpm via corepack. The runtime stage holds `.output/`, `.env.schema`, and the pinned varlock standalone binary, runs as a non root user, and starts with an exec form command: `CMD ["varlock", "run", "--", "node", ".output/server/index.mjs"]`. Build arg `APP_VERSION` (the commit SHA) is baked in | Small image, reproducible build; exec form lets `SIGTERM` reach the process tree |
| Registry | GitHub Container Registry, `ghcr.io/<owner>/typr` (`<owner>` = your GitHub user), a **public** package tagged with the commit SHA and `latest`; pushed with the workflow's `GITHUB_TOKEN`. Coolify deploys `latest`; to roll back, point it at an older SHA tag | Free, and Coolify needs no registry credentials; safe because the image holds no secrets. If the repo stays private, make the package private too and give Coolify a `read:packages` token |
| CI/CD | GitHub Actions, Node from `package.json` `engines`. Every PR (no token): `biome check`, `tsc --noEmit`, `vite build`. Push to `main`: the same checks, build and push the image, then a deploy job holding the prod token runs `varlock run -- drizzle-kit migrate`, calls the Coolify deploy webhook (`POST /api/v1/deploy?uuid=…` with a bearer token; Coolify no longer accepts `GET` there), and finally a smoke step polls `/api/health` until it reports the new `APP_VERSION` and calls `/api/health/db` once; the workflow fails if either does not answer in time | Nothing reaches production without passing checks, the VPS never compiles, and a broken database config is caught right after deploy |
| Health checks | `GET /api/health` = liveness only (process up, no database call), returns `{ ok: true, version: APP_VERSION }`, used by Coolify's health check; `GET /api/health/db` does a `select 1`, called once per deploy by the CI smoke step and by hand | A health check polling the database every 30 seconds would keep Neon awake all month and burn the free compute hours |
| Observability | Structured JSON logs to stdout, read in Coolify's log view | Enough for now; error tracking is feature 15's decision |
| Background jobs, file storage, cache, search, email | None yet | No feature needs them yet. When one does: a Postgres backed queue first, object storage for files, Postgres full text search; email is decided by feature 7 if password reset needs it |

**Runtime shape** (one process, one instance):

```
Browser ──HTTPS──▶ Traefik (Coolify, TLS) ──▶ Node 24 container (Nitro)
   │                                            ├─ SSR pages + server functions ──▶ Neon Postgres (Frankfurt)
   └──WSS /api/ws─────────────────────────────▶ ├─ websocket match server (in memory rooms)
                                                ├─ Better Auth handler (/api/auth/*)
                                                └─ /api/health
Secrets: varlock ──▶ Bitwarden Secrets Manager (machine account token)
Deploys: GitHub Actions ──▶ GHCR image ──▶ migrate ──▶ Coolify webhook ──▶ stop old, start new ──▶ smoke check
```

**Key invariants** (rules the build must keep):
- Exactly one app instance runs at a time, and Coolify's rolling updates stay off. Anything that needs a second instance (horizontal scaling, zero downtime for live matches) goes back through `/architect`, because in memory match state stops being valid.
- The server is the only authority on match state; clients send inputs, never outcomes.
- The websocket upgrade is rejected unless its `Origin` header equals the app origin (`BETTER_AUTH_URL`). This stops cross site websocket hijacking, which matters because the socket trusts the cookie.
- Every inbound websocket message is parsed with its Zod schema before use; a message that fails to parse, is over 4 KB, or goes past 30 messages a second on one socket closes that socket.
- A heartbeat ping every 20 seconds keeps sockets alive through Traefik, and a socket that misses two pings is treated as disconnected.
- On `SIGTERM` (a deploy or restart), the server tells every open match socket `server_restarting`, marks live matches as aborted (they are never saved as results), closes the sockets, then exits. A deploy therefore cancels live matches, by design.
- No secret is ever committed or baked into the image. `.env.schema` is committed; `.env.local` holds only the Bitwarden token and is gitignored.
- Migrations run before the new version starts, so every migration must work with the version still running (add first, remove in a later deploy).

**Configuration required** (defined in `.env.schema`):
- `BWS_ACCESS_TOKEN`: Bitwarden Secrets Manager machine account token for the `typr` project, the only secret set by hand. It goes in `.env.local`, in Coolify's env, and in a GitHub Actions secret used only by the deploy job. `@sensitive`
- `APP_ENV`: `development` in `.env.local`, `production` in Coolify and the deploy job; derives `BETTER_AUTH_URL`
- `DATABASE_URL`: Neon direct connection string, from Bitwarden. With one Bitwarden project there is one value, so development and production use the same database. `@sensitive`
- `BETTER_AUTH_SECRET`: session signing secret, from Bitwarden. `@sensitive`
- `BETTER_AUTH_URL`: derived in `.env.schema` from `APP_ENV`: `http://localhost:3000` in development, `https://typr.haugestol.com` in production; also the allowed websocket `Origin`
- `COOLIFY_WEBHOOK_URL`, `COOLIFY_API_TOKEN`: used by CI only to trigger a deploy, from Bitwarden. `@sensitive`
- `PORT`: `3000` (the container listens here; Traefik routes to it)
- `APP_VERSION`: the commit SHA, baked into the image as a build arg (not secret); reported by `/api/health`

## Consequences

**Positive**:
- One codebase, one process, one deploy: a bug in a live match is debugged in the same logs and the same code as the rest of the app.
- About €5 a month in total: the VPS is the only bill, Neon is on its free plan, and the domain is a subdomain of `haugestol.com`, which you already own.
- Helsinki keeps websocket round trips short for Norwegian players, which the rope feels.
- The auth cookie covers pages, server functions, and the websocket with one mechanism.
- One Bitwarden project and one token; rotating a secret never means editing Coolify or GitHub.

**Negative / tradeoffs**:
- **Unproven path**: websocket upgrades under TanStack Start via the Nitro plugin are not confirmed for both dev and the production build (an open TanStack discussion shows the upgrade failing on Start's own server). Until the echo spike passes, everything realtime rests on an assumption. Fallback if it fails: a separate small websocket entry point in the same repo and container, on its own path through Traefik; nothing else in this spec changes.
- You operate the server: OS updates, SSH hardening, the firewall, and Coolify upgrades are yours. A managed platform would do this for you.
- Every database query crosses from Helsinki to Frankfurt (about 25 ms). Pages must avoid query chains (N+1 patterns); a match never touches the database until it ends.
- Neon's free plan scales to zero after about 5 minutes idle, so the first request after a quiet spell waits a few hundred milliseconds while the database wakes.
- Every deploy cancels any live match and takes the site down for a few seconds (stop then start), and longer if the new version fails its health check.
- Local development needs a network connection at start, because varlock fetches secrets from Bitwarden (Neon needs the network anyway).
- One Bitwarden project means a laptop can read production secrets, and `DATABASE_URL` is shared, so `pnpm dev`, `db:push` and `db:migrate` run against the production database. Acceptable while only you and friends play; split into separate dev and prod projects (and point dev at the Neon `dev` branch) before Typr opens wider.
- Nitro v3 is still a pinned beta; upgrades need care.
- Coolify itself uses roughly 1 GB of RAM on the box, leaving about 3 GB for the app.

**Neutral**:
- The scaffold's `pg` driver is replaced by `postgres` (postgres.js); `src/db/index.ts` changes to `drizzle-orm/postgres-js` and `@types/pg` goes.
- The scaffold's `todos` example table is removed by the data model spec (feature 3), not here.
- All `latest` TanStack dependencies and the Nitro beta get pinned to exact versions so every build is reproducible.
- `TanStackDevtools` in `src/routes/__root.tsx` must render in development only.
- New patterns to learn: varlock schema decorators, Coolify, Hetzner firewall rules, crossws hooks.

## Follow-up

- [ ] **Websocket echo spike first**, before feature 16 or 17 builds on it. It passes only when all four hold: (a) `/api/ws` upgrades and echoes under `pnpm dev`; (b) the same in the production container run locally; (c) the same over `wss://typr.haugestol.com` through Traefik, with the session read from the cookie; (d) `SIGTERM` sent to the container reaches the shutdown hook through `varlock run`. The handler must not be swallowed by the Start router. If (a) to (c) fail, switch to the fallback (a second entry point that Traefik routes `/api/ws` to); if only (d) fails, switch env loading to `varlock/auto-load`. Update this spec either way.
- [x] Create the Neon project in `aws-eu-central-1` with a `dev` branch, and in Bitwarden Secrets Manager the `typr` project, its secrets, and a machine account.
- [ ] Before Typr opens beyond friends: split Bitwarden into dev and prod projects so a laptop cannot read production secrets, and point development at the Neon `dev` branch.
- [ ] For feature 15 (error monitoring): `vite.config.ts` already marks `@sentry/*` as external to the Nitro bundle, so the runtime image would need those packages in `node_modules`; decide that when the error tracker is chosen.
- [ ] Harden the VPS when you provision it: SSH keys only, a Hetzner Cloud Firewall allowing only 22 (ideally your IP), 80, and 443, unattended security upgrades, Coolify dashboard behind its own TLS subdomain with its raw ports closed.
- [ ] Backups beyond Neon's built in restore window: add a scheduled `pg_dump` before Typr opens beyond friends.
- [ ] Set up automatic dependency update PRs (Renovate or Dependabot) once versions are pinned, so the Nitro beta and TanStack pins don't go stale.
- [ ] Test framework and preferences are chosen by `/test` on first run (Beta workflow).
- [ ] Root `AGENTS.md` does not exist yet. `/audit` (feature 2) should capture this stack and list the installed project wide skills (`tanstack-start`, `tanstack-router`, `tanstack-query`, `tanstack-query-best-practices`, `drizzle`, `zod`, `varlock`, `tailwind-4-docs`, `coolify`, `hetzner-cloud`) in root `## Agent skills`, and the auth skills (`better-auth-best-practices`, `email-and-password-best-practices`, `two-factor-authentication-best-practices`, `organization-best-practices`) in a nested `src/auth/AGENTS.md`. `tailwind-v4-shadcn` belongs with the design system decision (feature 4), and `bitwarden` with the ops notes.
- [ ] MCP servers you chose, to connect in your own MCP settings: GitHub (official `github/github-mcp-server`), Coolify's built in MCP (Coolify v4), Hetzner (community `dkruyt/mcp-hetzner`), Drizzle (community `defrex/drizzle-mcp`), Bitwarden (official `@bitwarden/mcp-server`; this one puts vault contents within the agent's reach, so scope its access token to the Typr project only). `/audit` records them on the `MCP servers:` line.
