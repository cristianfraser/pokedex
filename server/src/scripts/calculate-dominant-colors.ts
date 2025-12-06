import sharp from 'sharp'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { createDatabase } from '../db/schema.js'
import { Pool } from 'pg'

async function getDominantColorAdvanced(imagePath: string): Promise<string> {
  try {
    // Resize to small size for performance (e.g., 100x100 to get better color sampling)
    const { data, info } = await sharp(imagePath)
      .resize(100, 100, { fit: 'cover' })
      .ensureAlpha() // Ensure alpha channel exists
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Count color frequencies (quantized to reduce variations)
    const colorCounts: Record<string, number> = {}
    const hasAlpha = info.channels === 4
    const width = info.width
    const height = info.height

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * info.channels
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const alpha = hasAlpha ? data[idx + 3] : 255

        // Skip transparent or very transparent pixels
        if (alpha < 128) {
          continue
        }

        // Skip very dark colors (likely outlines/shadows) - below 30
        if (r < 30 && g < 30 && b < 30) {
          continue
        }

        // Skip very light/white colors (likely backgrounds) - above 240
        if (r > 240 && g > 240 && b > 240) {
          continue
        }

        // Quantize colors less aggressively (divide by 16 instead of 32 for more color variation)
        const qr = Math.floor(r / 16) * 16
        const qg = Math.floor(g / 16) * 16
        const qb = Math.floor(b / 16) * 16

        // Give more weight to center pixels (Pokemon is usually centered)
        const centerX = width / 2
        const centerY = height / 2
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )
        const maxDistance = Math.sqrt(
          Math.pow(width / 2, 2) + Math.pow(height / 2, 2)
        )
        // Weight: 2x for center, 1x for edges
        const weight = 2 - distanceFromCenter / maxDistance

        const key = `${qr},${qg},${qb}`
        colorCounts[key] = (colorCounts[key] || 0) + weight
      }
    }

    // Find most common color
    let maxCount = 0
    let dominantColor = '128,128,128' // Default to gray if no colors found

    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantColor = color
      }
    }

    const [r, g, b] = dominantColor.split(',').map(Number)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, (error as Error).message)
    return '#cccccc'
  }
}

export async function calculateDominantColors(pool: Pool) {
  // Path to the pokemon images directory
  const imageDir = join(process.cwd(), '..', 'frontend', 'public', 'pokemon')

  if (!existsSync(imageDir)) {
    throw new Error(`Image directory not found: ${imageDir}`)
  }

  console.log(`Reading images from: ${imageDir}`)

  // Get all front-default images
  const files = readdirSync(imageDir).filter(
    file => /-front-default\.(jpg|jpeg|png|webp)$/i.test(file)
  )

  console.log(`Found ${files.length} front-default images`)

  const client = await pool.connect()

  try {
    let processed = 0
    let updated = 0
    let skipped = 0

    for (const file of files) {
      const imagePath = join(imageDir, file)

      // Extract pokemon ID from filename (format: {id}-{name}-front-default.png)
      const match = file.match(/^(\d+)-/)
      if (!match) {
        console.warn(`Could not extract ID from filename: ${file}`)
        skipped++
        continue
      }

      const pokemonId = parseInt(match[1], 10)

      // Check if pokemon exists in database
      const pokemonCheck = await client.query(
        'SELECT id FROM pokemon WHERE id = $1',
        [pokemonId]
      )

      if (pokemonCheck.rows.length === 0) {
        console.warn(`Pokemon with ID ${pokemonId} not found in database, skipping ${file}`)
        skipped++
        continue
      }

      console.log(`Processing ${file} (Pokemon ID: ${pokemonId})...`)
      const color = await getDominantColorAdvanced(imagePath)

      // Update database
      await client.query(
        'UPDATE pokemon SET dominant_color = $1 WHERE id = $2',
        [color, pokemonId]
      )

      processed++
      updated++

      if (processed % 50 === 0) {
        console.log(`Processed ${processed}/${files.length} images...`)
      }
    }

    console.log(`\nDone!`)
    console.log(`- Processed: ${processed}`)
    console.log(`- Updated: ${updated}`)
    console.log(`- Skipped: ${skipped}`)
  } catch (error) {
    console.error('Error calculating dominant colors:', error)
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  const pool = createDatabase()

  try {
    console.log('Starting dominant color calculation...')
    await calculateDominantColors(pool)
    console.log('Dominant color calculation completed successfully!')
  } catch (error) {
    console.error('Error calculating dominant colors:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

