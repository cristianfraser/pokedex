import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../../data')
const dbPath = path.join(dataDir, 'pokedex.db')

// Ensure data directory exists
try {
  mkdirSync(dataDir, { recursive: true })
} catch (error) {
  // Directory might already exist, ignore error
}

export function createDatabase(): Database.Database {
  const db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  return db
}

export function initializeSchema(db: Database.Database) {
  // Types table
  db.exec(`
    CREATE TABLE IF NOT EXISTS types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Pokemon table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      pokedex_number INTEGER,
      height INTEGER,
      weight INTEGER,
      base_experience INTEGER,
      sprite_front_default TEXT,
      sprite_front_shiny TEXT,
      sprite_official_artwork TEXT,
      is_legendary INTEGER DEFAULT 0,
      is_mythical INTEGER DEFAULT 0,
      color TEXT,
      habitat TEXT,
      flavor_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Pokemon types junction table (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokemon_types (
      pokemon_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      slot INTEGER NOT NULL,
      PRIMARY KEY (pokemon_id, type_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    )
  `)

  // Pokemon stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokemon_stats (
      pokemon_id INTEGER NOT NULL,
      stat_name TEXT NOT NULL,
      base_stat INTEGER NOT NULL,
      effort INTEGER NOT NULL,
      PRIMARY KEY (pokemon_id, stat_name),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
    )
  `)

  // Moves table
  db.exec(`
    CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      accuracy INTEGER,
      effect_chance INTEGER,
      pp INTEGER,
      priority INTEGER NOT NULL DEFAULT 0,
      power INTEGER,
      damage_class TEXT,
      effect_text TEXT,
      short_effect_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Move types junction table (many-to-one, but using junction for consistency)
  db.exec(`
    CREATE TABLE IF NOT EXISTS move_types (
      move_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      PRIMARY KEY (move_id, type_id),
      FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    )
  `)

  // Pokemon moves junction table (which Pokemon can learn which moves)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokemon_moves (
      pokemon_id INTEGER NOT NULL,
      move_id INTEGER NOT NULL,
      PRIMARY KEY (pokemon_id, move_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
      FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
    CREATE INDEX IF NOT EXISTS idx_pokemon_pokedex_number ON pokemon(pokedex_number);
    CREATE INDEX IF NOT EXISTS idx_pokemon_types_pokemon_id ON pokemon_types(pokemon_id);
    CREATE INDEX IF NOT EXISTS idx_pokemon_types_type_id ON pokemon_types(type_id);
    CREATE INDEX IF NOT EXISTS idx_move_types_move_id ON move_types(move_id);
    CREATE INDEX IF NOT EXISTS idx_move_types_type_id ON move_types(type_id);
    CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);
  `)
}

