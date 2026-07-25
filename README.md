# pokedex

A Pokédex and team builder — browse and search every Pokémon, dig into stats, moves and
type matchups, then assemble a party and see its offensive coverage and defensive weaknesses
at a glance.

**Live demo:** https://poketeam.crfrsr.io

> Data is seeded from [PokéAPI](https://pokeapi.co/). The demo is for exploration only.

## What it does

- **Browse & search** — find any Pokémon by name or type, with artwork-driven theming
  (dominant colors extracted per sprite at seed time).
- **Detail view** — base stats, learnable moves, and per-type effectiveness for each Pokémon.
- **Team builder** (`/team`) — pick up to six, then see combined offensive coverage and
  defensive weaknesses, with hover-to-highlight matchups.
- **Type matchups** — an interactive effectiveness reference for planning around
  strengths and weaknesses.
- **Data pipeline** — a seed script pulls Pokémon and moves from PokéAPI (rate-limited)
  into a SQLite snapshot that ships with the app; the API itself only ever reads.

## Stack

- **Monorepo** — Yarn 4 workspaces (`frontend`, `server`), Node 24, TypeScript throughout.
- **Server** — Express + SQLite (`better-sqlite3`), image processing with sharp for color extraction.
- **Frontend** — React 18 + Vite, TanStack Query, React Router v6, Tailwind CSS, Radix UI,
  framer-motion.

## Running locally

No database server to install — the dataset ships with the repo as a single SQLite file
(`server/data/pokedex.db`, ~5 MB).

```bash
yarn install

# from server/
yarn dev            # API on :3001, reads the committed snapshot read-only

# from frontend/
yarn dev            # Vite dev server on :5173 (proxies /api to :3001)
```

### The data snapshot

The API never writes: every route is a `SELECT`, and all writes live in the seed scripts.
That makes the database a build artifact rather than live state — it is committed, opened
read-only at runtime, and needs no volume or backup in deployment.

```bash
# from server/
yarn verify-seed    # sanity-check the snapshot's contents
yarn seed           # rebuild from PokéAPI (30+ min, rate-limited) — writes server/data/pokedex.db
yarn calculate-colors  # recompute dominant sprite colors

POKEDEX_SEED_LIMIT=5 yarn seed   # smoke-test the pipeline without a full run
POKEDEX_DB=/tmp/scratch.db yarn seed   # target a different file
```

Regenerate the snapshot only when the upstream data actually changes — each rebuild adds a
new copy of the file to git history.
