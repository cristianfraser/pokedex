import express from 'express'
import cors from 'cors'
import pokemonRoutes from './routes/pokemon.js'
import movesRoutes from './routes/moves.js'
import { databasePath } from './db/schema.js'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Allow your frontend domain
app.use(
  cors({
    origin: [
      'https://pokedex-6wpt.onrender.com',
      'https://poketeam.crfrsr.io',
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Common React dev port
      'http://localhost:5174', // Vite alternate port
    ],
  })
)
app.use(express.json())

// The database is a committed, read-only SQLite snapshot shipped with the app — there is
// nothing to create or migrate at boot. Routes open it themselves (read-only); fail fast
// here if the file is missing rather than serving empty results.
if (!existsSync(databasePath())) {
  console.error(
    `Database not found at ${databasePath()}. ` +
      `Run "yarn db:import-postgres" or "yarn seed" to build it.`
  )
  process.exit(1)
}

// Routes
app.use('/api/pokemon', pokemonRoutes)
app.use('/api/moves', movesRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (db: ${databasePath()})`)
})
