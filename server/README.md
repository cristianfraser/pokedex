# Pokedex Backend Server

Node.js backend server for the Pokedex application.

## Setup

1. Install dependencies:
```bash
corepack yarn install
```

2. Initialize the database:
```bash
yarn db:migrate
```

3. Seed the database with data from PokeAPI:
```bash
yarn seed
```

Note: The seed script will fetch all Pokemon and moves from PokeAPI. This may take a while (30+ minutes) depending on your connection speed. The script includes rate limiting to be respectful to PokeAPI.

## Development

Run the development server:
```bash
yarn dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Pokemon
- `GET /api/pokemon/list` - Get all Pokemon list
- `GET /api/pokemon/:id` - Get Pokemon by ID

### Moves
- `GET /api/moves?page=0&limit=100` - Get moves list with pagination
- `GET /api/moves/:id` - Get move by ID

## Database

The database is stored in `data/pokedex.db` (SQLite).

### Tables
- `types` - Pokemon types
- `pokemon` - Pokemon data
- `pokemon_types` - Junction table for Pokemon and types
- `pokemon_stats` - Pokemon stats
- `moves` - Move data
- `move_types` - Junction table for moves and types
- `pokemon_moves` - Junction table for Pokemon and moves they can learn

