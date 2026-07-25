import { createDatabase } from '../db/schema.js'
import type { Database as SqliteDatabase } from 'better-sqlite3'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join, extname } from 'path'
import { fileURLToPath } from 'url'

/**
 * Get the path to the frontend/public/pokemon directory
 */
function getPokemonImagesDir(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  // Go up from server/src/scripts to project root, then to frontend/public/pokemon
  return join(__dirname, '../../../frontend/public/pokemon')
}

/**
 * Download an image from a URL and save it to the pokemon images directory
 * Returns the local path (from index.html perspective) if successful, null otherwise
 */
async function downloadImage(
  url: string | null,
  filename: string,
  retries = 3
): Promise<string | null> {
  if (!url) {
    return null
  }

  // Skip if already a local path
  if (url.startsWith('/pokemon/')) {
    return url
  }

  try {
    const imagesDir = getPokemonImagesDir()
    
    // Ensure directory exists
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    // Fetch the image with retry logic
    let response: Response | null = null
    for (let i = 0; i < retries; i++) {
      try {
        response = await fetch(url)
        if (response.ok) break
        if (response.status === 429) {
          // Rate limited - wait longer before retry
          const waitTime = Math.pow(2, i) * 2000 // Exponential backoff: 2s, 4s, 8s
          console.log(`Rate limited (429), waiting ${waitTime}ms before retry ${i + 1}/${retries}...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        if (response.status === 404) {
          throw new Error(`Not found: ${url}`)
        }
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }
        throw new Error(`Failed to fetch: ${url} (${response.status})`)
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to fetch image: ${url}`)
    }

    // Get the image buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get file extension from URL or default to .png
    const ext = extname(new URL(url).pathname) || '.png'
    const filePath = join(imagesDir, `${filename}${ext}`)

    // Write the file
    await writeFile(filePath, buffer)

    // Return the local path from index.html perspective
    return `/pokemon/${filename}${ext}`
  } catch (error) {
    console.error(`Error downloading image ${url} to ${filename}:`, error)
    // Return null on error - will keep original URL
    return null
  }
}

interface PokemonRow {
  id: number
  name: string
  sprite_front_default: string | null
  sprite_front_shiny: string | null
  sprite_official_artwork: string | null
}

async function seedMissingImages(db: SqliteDatabase) {
  console.log('Finding Pokemon with missing images...')

  // Find Pokemon that still have external URLs (not starting with /pokemon/)
  const pokemonToUpdate = db.prepare(`
    SELECT id, name, sprite_front_default, sprite_front_shiny, sprite_official_artwork
    FROM pokemon
    WHERE (sprite_front_default IS NOT NULL 
           AND sprite_front_default NOT LIKE '/pokemon/%')
       OR (sprite_front_shiny IS NOT NULL 
           AND sprite_front_shiny NOT LIKE '/pokemon/%')
       OR (sprite_official_artwork IS NOT NULL 
           AND sprite_official_artwork NOT LIKE '/pokemon/%')
    ORDER BY id
  `).all() as PokemonRow[]

  console.log(`Found ${pokemonToUpdate.length} Pokemon with missing images`)

  if (pokemonToUpdate.length === 0) {
    console.log('All Pokemon images are already downloaded!')
    return
  }

  let processed = 0
  let updated = 0

  for (const pokemon of pokemonToUpdate) {
    try {
      const pokemonIdStr = pokemon.id.toString().padStart(4, '0')
      const pokemonName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '-')

      // Download images and get local paths
      const frontDefaultPath = await downloadImage(
        pokemon.sprite_front_default,
        `${pokemonIdStr}-${pokemonName}-front-default`
      ) || pokemon.sprite_front_default

      const frontShinyPath = await downloadImage(
        pokemon.sprite_front_shiny,
        `${pokemonIdStr}-${pokemonName}-front-shiny`
      ) || pokemon.sprite_front_shiny

      const officialArtworkPath = await downloadImage(
        pokemon.sprite_official_artwork,
        `${pokemonIdStr}-${pokemonName}-official-artwork`
      ) || pokemon.sprite_official_artwork

      // Update database with local paths
      db.prepare(
        `UPDATE pokemon 
           SET sprite_front_default = ?,
               sprite_front_shiny = ?,
               sprite_official_artwork = ?
           WHERE id = ?`
      ).run(frontDefaultPath, frontShinyPath, officialArtworkPath, pokemon.id)
      updated++

      processed++

      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${pokemonToUpdate.length} Pokemon... (${updated} updated)`)
      }

      // Rate limiting - be nice to the image server
      // Use longer delay to avoid 429 errors
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error processing Pokemon ${pokemon.name} (ID: ${pokemon.id}):`, error)
    }
  }

  console.log(`Completed! Processed ${processed} Pokemon, updated ${updated} with local image paths`)
}

async function main() {
  const db = createDatabase()

  try {
    console.log('Starting image seed...')
    await seedMissingImages(db)
    console.log('Image seed completed successfully!')
  } catch (error) {
    console.error('Error seeding images:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

main()

