# Verify: Stack & architecture · spec 0001 · updated 2026-09-30
_Spec 0001 is a decision spec with no `AC-N` IDs, so each step points at the scope **Done when** (DONE) or a websocket spike check from the spec's Follow up (SPIKE-a to SPIKE-d), or at a key invariant (INV). `/check verify` runs these; `/test` locks the durable ones._

Steps marked ✅ passed on 2026-09-30 (during `/develop`, locally, or in production). Steps marked ⏳ are still open.

## Commands
- [ ] ✅ `pnpm exec tsc --noEmit`, `pnpm exec biome check`, `pnpm build` → all pass → DONE (CI parity)
- [ ] ✅ With the dev server running: `curl localhost:3000/api/health` → `{"ok":true,"version":"dev"}` → SPIKE-a
- [ ] ✅ Websocket to `ws://localhost:3000/api/ws` with `Origin: http://localhost:3000`, send `{"type":"echo","text":"hei"}` → receives the same message back → SPIKE-a
- [ ] ✅ Same socket with `Origin: https://evil.example` → upgrade rejected (403) → INV origin check
- [ ] ✅ Send `{"type":"nope"}` → socket closes `1008 invalid_message`; send an echo over 4 KB → closes `1009 message_too_big`; send 40 messages at once → 30 echoes, then closes `1008 rate_limited` → INV message limits
- [ ] ✅ `docker build --build-arg APP_VERSION=x -t typr:local .` then run it → `/api/health` reports `"version":"x"` and the echo works → SPIKE-b
- [ ] ✅ With a socket open, `docker stop -t 15 <container>` → client gets `{"type":"server_restarting"}` then close `1012`; container exits code 0 in about 1 s (`varlock run` is PID 1) → SPIKE-d, INV shutdown
- [ ] ✅ `docker run --network none -e BWS_ACCESS_TOKEN=<well formed dummy> typr:local` → varlock loads the vendored Bitwarden plugin with no npm access (fails only on unfilled secrets) → INV container
- [ ] ✅ With `.env.local` holding only `BWS_ACCESS_TOKEN` and `APP_ENV=development`: `pnpm exec varlock load` → valid; `pnpm dev` starts; `curl localhost:3000/api/health/db` → `{"ok":true}` → DONE
- [ ] ✅ Open a PR → the `check` job passes and no other job runs → DONE (CI) (PR #1, run 3)
- [ ] ✅ Merge to `main` → `image` pushes `ghcr.io/<owner>/typr:<sha>` and `:latest`; `deploy` migrates (or skips with no migrations), triggers Coolify, and the smoke step sees `/api/health` report the new SHA and `/api/health/db` answer → DONE (deploys to a public URL) (run 9)

## UI / manual
- [ ] ✅ Visit `https://typr.haugestol.com` → the app loads over valid TLS → DONE (`/api/health` and `/api/health/db` answered over HTTPS)
- [ ] ✅ From the browser console on `https://typr.haugestol.com`: `new WebSocket("wss://typr.haugestol.com/api/ws")`, send an echo → echoed back through Traefik → SPIKE-c (transport half). The same upgrade from a `http://localhost:3000` page is refused (403) → INV origin check in production
- [ ] ⏳ After feature 7 (Better Auth): the same upgrade without a session → 401; signed in → accepted with the user id bound → SPIKE-c (session half)
- [ ] ✅ In Coolify: rolling updates off (fixed container name), health check on port 3000 `/api/health` every 30 s, stop grace 15 s, HTTP Basic Auth off (it blocks the CI smoke check); deploy and confirm only one typr container ever runs (`coolify-helper` is Coolify's build container, not a second instance) → INV single instance

## Coverage
- DONE (spec records the stack) · already true (spec 0001)
- DONE (empty app deploys to a public URL) · the CI, deploy and site steps
- SPIKE-a · dev echo steps · SPIKE-b · container steps · SPIKE-c · wss steps (session half waits on feature 7) · SPIKE-d · docker stop step
