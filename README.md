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
- **Data pipeline** — a seed script pulls Pokémon and moves from PokéAPI (rate-limited);
  the app itself always reads from Postgres.

## Stack

- **Monorepo** — Yarn 4 workspaces (`frontend`, `server`), Node 24, TypeScript throughout.
- **Server** — Express + PostgreSQL (`pg`), image processing with sharp for color extraction.
- **Frontend** — React 18 + Vite, TanStack Query, React Router v6, Tailwind CSS, Radix UI,
  framer-motion.

## Running locally

Requires a PostgreSQL database; point `DATABASE_URL` at it.

```bash
yarn install

# from server/
yarn db:migrate     # create tables
yarn seed           # fetch Pokémon + moves from PokéAPI (30+ min, rate-limited)
yarn dev            # API on :3001

# from frontend/
yarn dev            # Vite dev server on :5173 (proxies /api to :3001)
```
