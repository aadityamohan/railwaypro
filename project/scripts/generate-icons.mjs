import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = join(__dirname, '../public/favicon.svg')
const svg = readFileSync(svgPath)

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
]

for (const { name, size } of sizes) {
  const outPath = join(__dirname, '../public', name)
  await sharp(svg).resize(size, size).png().toFile(outPath)
  console.log(`✅ Generated ${name} (${size}x${size})`)
}

console.log('\n🎉 All icons generated!')
