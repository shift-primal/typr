# 0001. Stack and architecture: rationale

Decision record for [index.md](index.md). `/develop` builds from `index.md`; this file holds the why.

## Context

Typr is a typing race website in the spirit of Monkeytype: 15, 30 and 60 second solo rounds, several solo modes, ghost racing, public leaderboards, and a live 1v1 Tug of war mode where the server decides every pull. It is a solo portfolio and learning project for you and your friends, mostly in Norway, with an English and Norwegian interface. Expected load is tens of concurrent players, not thousands.

The project is already scaffolded and runs: TanStack Start on Nitro v3, Drizzle with Postgres, TanStack Query and Store, Tailwind v4, Biome, pnpm. What the scaffold does not settle is everything live multiplayer and a public deploy need: how browsers and server talk in real time, where the state of a running match lives, where the server runs, where Postgres runs, how secrets reach each machine, and how code gets from `main` to production. It also leaves the auth library open, and that library owns the user and session tables the data model spec (feature 3) must build on before accounts (feature 7) are designed.

The forces: a hosting budget of about $5 a month; a live mode where tens of milliseconds are visible in the rope's movement, so it needs a server that stays up with open connections (serverless functions cannot hold them); players concentrated in Norway; a single developer who wants to learn real operations but must still be able to run it on a quiet weekday; and a server framework whose websocket support is new (Nitro v3 is a pinned beta, and TanStack Start has no websocket feature of its own).

If this stays undecided, every slice after the foundation guesses: the data model can't place user tables, the Tug of war work can't pick a transport, and the "empty app deploys to a public URL" milestone has nowhere to deploy.

## Options considered

### Option 1: One Node server on a Hetzner VPS with Coolify, plus Neon Postgres

The whole app, including the websocket match server, runs as one Nitro `node-server` process in a Docker image. GitHub Actions builds it and Coolify runs it on a Hetzner CX22 in Helsinki. Neon hosts Postgres in Frankfurt. Match state lives in memory in the one process.

**Pros**:
- Cheapest always on option with real resources (2 vCPU, 4 GB for about €4 to €5).
- Helsinki is the nearest region to Norway of any option here.
- No cold starts for the app; websockets are just long lived TCP connections on a box you own.
- Teaches real operations (Linux, a reverse proxy, TLS, deploys), which serves the portfolio goal.

**Cons**:
- You run the OS, the firewall, Coolify upgrades, and security patches.
- Database queries cross from Helsinki to Frankfurt (about 25 ms each).
- One box and one instance: no failover, and a deploy cancels live matches.

### Option 2: A managed app platform (Fly.io or Railway) plus Neon

The same single Docker image and in memory match state, but run by Fly.io (Stockholm region, if still offered) or Railway (Amsterdam). Deploys through `flyctl` or Railway's GitHub integration.

**Pros**:
- No server to operate; the platform handles TLS, restarts, and host patching.
- Fly.io's Stockholm region would be about as close to Norway as Helsinki.
- Same app code and architecture as Option 1, so switching later is cheap.

**Cons**:
- A smaller machine for the money (Fly's small shared VMs have 256 to 512 MB); Railway's Hobby plan starts at $5 including usage and can go over.
- Less to learn about operations, and less control over the box.
- Fly.io has no free allowance for new accounts, and its regions could not be confirmed in the landscape check.

### Option 3: Cloudflare Workers with Durable Objects

The app deploys to Cloudflare Workers, and each Tug of war room is a Durable Object (a small stateful server instance per room that Cloudflare places near the players). Postgres is reached through Hyperdrive or Neon's serverless driver.

**Pros**:
- One Durable Object per room is a very natural model for authoritative match state, and it survives deploys better.
- Global edge, generous free usage, no server to run.

**Cons**:
- Two execution models to learn at once (Workers and Durable Objects), and websocket plus Durable Object support under TanStack Start and Nitro v3 could not be confirmed.
- The Postgres driver and Drizzle setup change (no plain TCP pool), and local development is more complex.
- More platform lock in than any other option.

### Option 4: Serverless app plus a separate hosted realtime service

The app runs on a serverless host (Vercel or Netlify), and live matches run on a separate service such as PartyServer or a hosted pub/sub (a publish and subscribe message service).

**Pros**:
- Each piece uses a platform built for it; the app side is fully managed.
- Plenty of free usage for the app.

**Cons**:
- Two deploys, two platforms, and an auth bridge between them (the realtime side can't read the app's cookie directly).
- Plain pub/sub services relay messages but can't run the server authoritative match logic, which pushes it into the realtime platform's own runtime anyway.
- Serverless functions add cold starts and need a connection pooler for Postgres.

## Rationale

Option 1 fits the forces best. The live mode needs a process that holds connections and match state, which rules out purely serverless designs (Option 4), and at tens of players a single process is enough: one process means match state can live in memory, which is the fastest and simplest authority possible. Once that is settled, Options 1 and 2 run the same architecture and differ only in who operates the machine. Option 3 is the most elegant model for rooms, but it asks a solo developer to learn a second execution model on top of an unconfirmed integration, for scale Typr does not have.

My recommendation during the interview was Fly.io (Option 2), because it removes the server operations work. You chose Hetzner with Coolify instead. That is a sound choice here, not a mistake: for the same budget it gives several times the memory (which Coolify's own services need), the nearest region to your players, and hands on operations experience that fits a learning and portfolio project. The tradeoff you are consciously accepting is that patching, the firewall, and backups of the box are yours, which is why the hardening steps are in the spec's Follow-up. Because the app ships as a plain Docker image with secrets resolved at runtime, moving to Fly.io or Railway later is a deploy change, not a rewrite. Within the self hosted route, plain Docker Compose with Caddy and an SSH deploy from Actions would be leaner still (no roughly 1 GB for Coolify's own services, no dashboard to secure); Coolify was your pick for its dashboard and logs, and the spec turns its rolling updates off so it behaves like that simpler setup where it matters.

Neon over the host's own Postgres keeps the database managed (backups, restore) even though the app server is not, and its branching gives a safe `dev` database with nothing to install. The cost is the Helsinki to Frankfurt hop, acceptable because matches never touch the database mid play and pages can batch their queries. Better Auth inside the app keeps users in the same database the data model spec designs, and lets the websocket authenticate with the same cookie as the rest of the app. varlock with Bitwarden Secrets Manager means each machine holds exactly one token; you first picked Bitwarden Password Manager, then switched to Secrets Manager once it was clear the server and CI would need your personal vault's master password to use it.

## References

**Project sources** (in this repo):
- `package.json`, `.cta.json`, `vite.config.ts`, `drizzle.config.ts`: the scaffolded stack recorded as existing
- `docs/scope/scope.md`, feature 1 (Stack & architecture) and the Tug of war, private rooms, and latency features that drive the realtime needs
- Installed skills: `tanstack-start`, `better-auth-best-practices`, `varlock`, `coolify`, `drizzle`, `zod`, `hetzner-cloud`

**Practices & standards**:
- Monolith first; boring technology; one instance until a measured need forces more
- Server authoritative game state (clients send inputs, never outcomes)
- Origin check on websocket upgrade to prevent cross site websocket hijacking
- Expand and contract migrations (backward compatible schema changes)
- Twelve factor style config: config from the environment, no secrets in the image

**Links** (confirmed during the landscape check, 2026-09-30):
- Nitro websockets: https://nitro.build/docs/websocket
- TanStack Start websocket discussion (the upgrade issue): https://github.com/TanStack/router/discussions/4576
- Neon regions: https://neon.com/docs/introduction/regions
- Neon plans (free plan limits): https://neon.com/docs/introduction/plans
- varlock: https://varlock.dev
- varlock Bitwarden plugin: https://varlock.dev/plugins/bitwarden/
- Fly.io pricing: https://fly.io/pricing
- Better Auth with TanStack Start, example starter: https://github.com/daveyplate/better-auth-tanstack-starter
- Not verified (cite by name only): Hetzner Cloud server types and prices, Railway pricing, Coolify system requirements, Better Auth's official TanStack Start guide

## Evidence: landscape check (2026-09-30)

Run once by a read only research helper before the stack questions.

- Nitro v3 websockets are stable: enabled with `features: { websocket: true }`, handlers via `defineWebSocketHandler` on crossws, with hooks for upgrade, open, message, close, and error, plus built in liveness and pub/sub.
- TanStack Start has no websocket feature of its own. On its own h3/srvx server the upgrade does not happen (open discussion). Typr runs Start through the Nitro plugin, which should take Nitro's path; not yet proven in both dev and the production build.
- Neon free plan: 0.5 GB storage per project, 100 compute hours a month, scale to zero. EU regions: Frankfurt and London; no Nordic region. The plain TCP drivers work from a long running server. Neon's managed auth is built on Better Auth.
- Better Auth: official TanStack Start integration and Drizzle adapter; Lucia is deprecated.
- varlock: `.env.schema` decorators (`@required`, `@sensitive`, typed values), generated TypeScript types, `varlock run` or `varlock/auto-load` at runtime, official Bitwarden plugin supporting Secrets Manager (machine account token) and Password Manager.
- Hosting: Fly.io has no free tier (per second billing); its Stockholm region and Railway and Render details could not be confirmed and are from prior knowledge.
