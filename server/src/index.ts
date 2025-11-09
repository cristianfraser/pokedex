import express from 'express'
import cors from 'cors'
import pokemonRoutes from './routes/pokemon.js'
import movesRoutes from './routes/moves.js'
import { initializeSchema, createDatabase } from './db/schema.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Allow your frontend domain
app.use(
  cors({
    origin: ['https://pokedex-6wpt.onrender.com', 'https://poketeam.crfrsr.io'],
  })
)
app.use(express.json())

// Initialize database if it doesn't exist
const pool = createDatabase()
initializeSchema(pool)
  .then(() => {
    console.log('Database initialized')
  })
  .catch(error => {
    console.error('Error initializing database:', error)
  })

// Routes
app.use('/api/pokemon', pokemonRoutes)
app.use('/api/moves', movesRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
