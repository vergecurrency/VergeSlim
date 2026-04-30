import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const png2icons = require('png2icons')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const iconPngPath = path.join(rootDir, 'dist_electron', 'icons', 'icon.png')
const iconIcnsPath = path.join(rootDir, 'dist_electron', 'icons', 'Icon.icns')

const pngBuffer = readFileSync(iconPngPath)
const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BICUBIC, 0)

if (!icnsBuffer) {
  throw new Error(`Failed to generate ICNS from ${iconPngPath}`)
}

mkdirSync(path.dirname(iconIcnsPath), { recursive: true })
writeFileSync(iconIcnsPath, icnsBuffer)

console.log(`Generated ${path.relative(rootDir, iconIcnsPath)} from ${path.relative(rootDir, iconPngPath)}`)
