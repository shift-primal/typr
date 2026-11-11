# typr

A multiplayer typing race, built to learn real-time web apps: WebSockets, server-owned state and keeping clients in sync.

**Status:** work in progress. The solo typing test and multiplayer rooms work; the race itself is next. The roadmap is in [docs/phase_1.md](docs/phase_1.md).

## What works

- **Solo mode:** type a random word list with a live caret, per-character highlighting, a timer, WPM and accuracy.
- **Rooms:** create a room, share the code, and see players join and leave in real time.
- **Protocol:** every WebSocket message is a Zod-validated type in `src/shared/protocol.ts`, shared by client and server. The server owns room state and drops connections that miss heartbeats.

## Stack

TanStack Start, Nitro WebSockets (crossws), Drizzle on Postgres, TanStack Store, Tailwind and shadcn. Better Auth is set up for later.

## Run

```sh
pnpm install
pnpm db:up     # Postgres in Docker on localhost:5433
pnpm db:push   # sync src/db/schema.ts to the database
pnpm dev       # http://localhost:3000, websocket at ws://localhost:3000/api/ws
```

- Config lives in `src/env.ts` with local defaults; override any of it in a `.env` file.
- `pnpm db:down` stops Postgres (data is kept in the `typr-db` volume).

## Layout

- `src/features/typing/model/`: typing session, stats and word lists as pure functions (with tests), so the server can reuse them for races
- `src/features/typing/ui/`: typing surface, caret, timer and stats bar
- `src/features/room/`: room screens and client-side room store
- `src/server/realtime/`: WebSocket handler, peers and rooms
- `src/shared/protocol.ts`: message types
