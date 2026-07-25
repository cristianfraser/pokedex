import Database from 'better-sqlite3'
import type { Database as SqliteDatabase } from 'better-sqlite3'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

/**
 * The dataset is a read-only snapshot of PokéAPI: the API only ever runs SELECTs, and every
 * write lives in the seed scripts. That makes SQLite a better fit than Postgres here — the
 * database ships with the app as a single file, so there is no database server to run, no
 * connection string to configure, and no backup story for data that is regenerated upstream.
 *
 * `POKEDEX_DB` overrides the file (used by the import script and by ad-hoc checks); the
 * default is the committed snapshot at server/data/pokedex.db.
 */

const here = dirname(fileURLToPath(import.meta.url))

export function defaultDatabasePath(): string {
  return resolve(here, '../../data/pokedex.db')
}

export function databasePath(): string {
  return process.env.POKEDEX_DB?.trim() || defaultDatabasePath()
}

/**
 * Opens the database. The API passes `readonly` so an accidental write fails loudly instead
 * of mutating the shipped snapshot, and so the container can mount the file read-only.
 */
export function createDatabase(options: { readonly?: boolean } = {}): SqliteDatabase {
  const path = databasePath()
  const readonly = options.readonly ?? false
  if (!readonly) mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path, { readonly, fileMustExist: readonly })
  if (!readonly) db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

/**
 * Creates the schema when missing. Only the seed/import paths need this — the API opens an
 * already-populated snapshot — but it stays idempotent so a seed from nothing still works.
 */
export function initializeSchema(db: SqliteDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

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
      dominant_color TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pokemon_types (
      pokemon_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      slot INTEGER NOT NULL,
      PRIMARY KEY (pokemon_id, type_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pokemon_stats (
      pokemon_id INTEGER NOT NULL,
      stat_name TEXT NOT NULL,
      base_stat INTEGER NOT NULL,
      effort INTEGER NOT NULL,
      short_name TEXT,
      PRIMARY KEY (pokemon_id, stat_name),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
    );

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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS move_types (
      move_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      PRIMARY KEY (move_id, type_id),
      FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pokemon_moves (
      pokemon_id INTEGER NOT NULL,
      move_id INTEGER NOT NULL,
      PRIMARY KEY (pokemon_id, move_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
      FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
    CREATE INDEX IF NOT EXISTS idx_pokemon_pokedex_number ON pokemon(pokedex_number);
    CREATE INDEX IF NOT EXISTS idx_pokemon_types_pokemon_id ON pokemon_types(pokemon_id);
    CREATE INDEX IF NOT EXISTS idx_pokemon_types_type_id ON pokemon_types(type_id);
    CREATE INDEX IF NOT EXISTS idx_pokemon_stats_pokemon_id ON pokemon_stats(pokemon_id);
    CREATE INDEX IF NOT EXISTS idx_move_types_move_id ON move_types(move_id);
    CREATE INDEX IF NOT EXISTS idx_move_types_type_id ON move_types(type_id);
    CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);
    CREATE INDEX IF NOT EXISTS idx_pokemon_moves_pokemon_id ON pokemon_moves(pokemon_id);
    CREATE INDEX IF NOT EXISTS idx_pokemon_moves_move_id ON pokemon_moves(move_id);
  `)
}
