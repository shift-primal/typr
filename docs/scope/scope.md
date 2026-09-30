# Scope: Typr

A typing race website in the spirit of Monkeytype: 15, 30 and 60 second rounds, solo game modes, and a live Tug of war mode against a friend. A solo portfolio and learning project, played by you and your friends, in English and Norwegian.

**Build approach:** Tracer Bullet (each feature built end to end through every layer and working before the next one starts; later slices thicken a thread that already runs).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Data model | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | UI translations (English + Norwegian) | Foundation | planned |
| 6 | Typing test core | Slice 1 | planned |
| 7 | Accounts & sign in | Slice 1 | planned |
| 8 | Saved results & personal history | Slice 1 | planned |
| 9 | Norwegian word list | Slice 2 | planned |
| 10 | Run recording & server validation | Slice 2 | planned |
| 11 | Hardcore mode | Slice 2 | planned |
| 12 | Blind mode | Slice 2 | planned |
| 13 | Coder mode | Slice 2 | planned |
| 14 | Ghost racing | Slice 2 | planned |
| 15 | Error monitoring | Slice 3 | planned |
| 16 | Private rooms | Slice 3 | planned |
| 17 | Tug of war match | Slice 3 | planned |
| 18 | Latency compensation | Slice 3 | planned |
| 19 | Public leaderboards | Slice 4 | planned |
| 20 | Share cards & page metadata | Slice 4 | planned |

## Foundations

### 1. Stack & architecture · in-progress
The project is already scaffolded and runs. What is missing is a recorded stack decision, plus the parts the scaffold does not cover yet: the realtime transport for live matches, and hosting that supports it.
**Done when:** a spec records the existing stack and the realtime and hosting choices, and the empty app deploys to a public URL.
- [x] Scaffold the project (already in the repo)
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Build it: `/develop stack & architecture`
  - [x] Align the scaffold with the spec (Node 24, pinned versions, postgres.js driver, dev only devtools)
  - [x] Env and secrets through varlock and Bitwarden (`.env.schema`, wrapped scripts)
  - [x] Health routes and websocket echo spike, local (spike checks a, b, d)
  - [x] Container and CI (Dockerfile, GitHub Actions build, migrate, deploy, smoke check)
  - [x] Deployed to `https://typr.haugestol.com` (Neon, Bitwarden, Hetzner, Coolify, DNS); merging to `main` deploys automatically
  - [x] Manual checks in [verify.md](../specs/0001-stack-architecture/verify.md): `wss://` echo through Traefik (spike check c, transport half), Coolify single instance, local dev against Bitwarden
spec [0001](../specs/0001-stack-architecture/index.md) · code in `./`

### 2. Coding standards & tooling
Capture the conventions and tooling from the real scaffold, then make sure lint, format and pre commit checks run for every change.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format and pre commit checks run clean.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. Data model · needs a decision
The core entities every slice builds on: players, test results, recorded runs (keystroke timelines), word lists and code snippets, rooms and matches, leaderboard entries. It replaces the example table from the scaffold.
**Done when:** the schema supports saved results, replays, matches and leaderboards without a breaking migration later, and the example table is gone.
- [ ] Design it (spec): `/architect data model`

### 4. Design system & UI foundation · needs a decision
A calm, keyboard first visual language: the typing area, caret, word states (correct, wrong, upcoming), results, themes, and base components.
**Done when:** `design.md` covers type, color, spacing and components; base components meet WCAG AA basics (contrast, visible focus, screen reader labels) and respect reduced motion.
- [ ] Design it (spec): `/architect design system & UI foundation`

### 5. UI translations (English + Norwegian) · needs a decision
Every interface string can be translated, and players switch between English and Norwegian. It comes before the screens, so each new screen ships in both languages.
**Done when:** a player can switch the UI language, the choice sticks across visits, and no screen has hard coded strings.
- [ ] Design it (spec): `/architect ui translations`

## Slice 1: Solo test + accounts

### 6. Typing test core · needs a decision
The thinnest real thread and the core of the product: pick 15, 30 or 60 seconds, type English words with a live caret, and see WPM and accuracy at the end. Guests can play without an account.
**Done when:** a guest can finish a round of each length and see WPM, raw WPM and accuracy; typos, backspace and word skipping behave predictably; restart is one key away.
- [ ] Design it (spec): `/architect typing test core`

### 7. Accounts & sign in · needs a decision
Sign up and sign in so results can be saved and multiplayer can know who is playing. Solo play stays open to guests.
**Done when:** a player can sign up, sign in and sign out; a signed in player has a display name; guests can still play solo.
- [ ] Design it (spec): `/architect accounts & sign in`

### 8. Saved results & personal history · needs a decision
Signed in players get every finished test saved and a profile page with their history and personal bests.
**Done when:** a signed in player's results are saved automatically, and their profile shows recent tests and a personal best per round length.
- [ ] Design it (spec): `/architect saved results & personal history`

## Slice 2: Solo modes

### 9. Norwegian word list · needs a decision
Choose English or Norwegian words per test, including æ, ø and å on any keyboard layout.
**Done when:** a player can pick the word list language, Norwegian words type correctly (including dead key and compose input), and results record which list was used.
- [ ] Design it (spec): `/architect norwegian word list`

### 10. Run recording & server validation · needs a decision · GA
Record every run as a keystroke timeline, and have the server replay it to compute the real WPM and reject impossible runs. This is the anti cheat backbone that Ghost racing, leaderboards and Tug of war all reuse.
**Done when:** saved results carry their recording; the server recomputes WPM from the recording and flags or rejects runs that are impossible or tampered with; a normal run is never falsely rejected.
- [ ] Design it (spec): `/architect run recording & server validation`

### 11. Hardcore mode · Alpha
One typo ends the run.
**Done when:** the first wrong character ends the test, the result shows how far you got, and hardcore results are kept apart from normal ones.
- [ ] Build it: `/develop hardcore mode`

### 12. Blind mode · needs a decision · Alpha
The text pops in and out while you type, so you have to keep it in memory.
**Done when:** words appear and disappear on a clear, fair rhythm; reduced motion players get a calm version; results are marked as blind.
- [ ] Design it (spec): `/architect blind mode`

### 13. Coder mode · needs a decision
Type real code: curated snippets in a few popular languages, with indentation, brackets and newlines.
**Done when:** a player can pick a language and type a snippet with correct handling of indentation, newlines and symbols; WPM is fair for code; snippets are curated and vary by length.
- [ ] Design it (spec): `/architect coder mode`

### 14. Ghost racing · needs a decision
Race against a replay of your own best run or another player's run, shown as a second caret moving through the text.
**Done when:** a player can pick a ghost (their own best or another player's saved run) and race it live on the same text, and the result shows who won.
- [ ] Design it (spec): `/architect ghost racing`

## Slice 3: Tug of war

### 15. Error monitoring · needs a decision · Alpha
Catch crashes and realtime disconnects in production before the multiplayer work starts, so websocket bugs are visible.
**Done when:** client and server errors from the deployed app show up in one place with enough context to debug them.
- [ ] Design it (spec): `/architect error monitoring`

### 16. Private rooms · needs a decision
Create a room, share a link or code, a friend joins, both ready up. The live connection that every match runs on.
**Done when:** a signed in player can create a room and share it, a friend joins through the link or code, both see each other's presence and ready state live, and disconnects are handled.
- [ ] Design it (spec): `/architect private rooms`

### 17. Tug of war match · needs a decision
Two players and a rope: every correct word pulls it your way, and a typo loses your grip. The server holds the real state of the match.
**Done when:** both players see the rope move live, the server decides every pull and the winner, typos cost grip as designed, and players can rematch from the room.
- [ ] Design it (spec): `/architect tug of war match`

### 18. Latency compensation · needs a decision
Keep matches fair and smooth when the two players have different ping.
**Done when:** a player with high latency is not disadvantaged in who wins, and the rope moves smoothly on both screens without jumps.
- [ ] Design it (spec): `/architect latency compensation`

## Slice 4: Leaderboards & sharing

### 19. Public leaderboards · needs a decision
One public board for everyone, per round length, mode and word list language. Only server validated runs count.
**Done when:** players can browse leaderboards by length, mode and language; only validated runs appear; each player shows once with their best.
- [ ] Design it (spec): `/architect public leaderboards`

### 20. Share cards & page metadata · needs a decision
Proper titles and descriptions on every public page, plus a preview card when you share a result or a room link.
**Done when:** every public page has a title and description; a shared result link shows a preview card with the WPM and mode; a shared room link shows an invite card.
- [ ] Design it (spec): `/architect share cards & page metadata`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Privacy page & account deletion**: GDPR basics before it goes public beyond friends · needs a decision
- **Public quick match**: a matchmaking queue for Tug of war with strangers · needs a decision
- **Player pasted code**: practice Coder mode on your own code, kept off leaderboards
- **More word list languages**: beyond English and Norwegian
- **Friend groups**: group leaderboards, only if the player base grows beyond your circle · needs a decision
- **Product analytics**: plays, sign ups, mode popularity · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Alpha`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
