import { mkdirSync, writeFileSync } from 'fs'
import { Jimp } from 'jimp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const iconPngPath = path.join(rootDir, 'dist_electron', 'icons', 'icon.png')
const iconIcoPath = path.join(rootDir, 'dist_electron', 'icons', 'icon.ico')

const image = await Jimp.read(iconPngPath)
image.resize({ w: 256, h: 256 })

const pngBuffer = await image.getBuffer('image/png')

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)

const directoryEntry = Buffer.alloc(16)
directoryEntry.writeUInt8(0, 0)
directoryEntry.writeUInt8(0, 1)
directoryEntry.writeUInt8(0, 2)
directoryEntry.writeUInt8(0, 3)
directoryEntry.writeUInt16LE(1, 4)
directoryEntry.writeUInt16LE(32, 6)
directoryEntry.writeUInt32LE(pngBuffer.length, 8)
directoryEntry.writeUInt32LE(header.length + directoryEntry.length, 12)

mkdirSync(path.dirname(iconIcoPath), { recursive: true })
writeFileSync(iconIcoPath, Buffer.concat([header, directoryEntry, pngBuffer]))

console.log(`Generated ${path.relative(rootDir, iconIcoPath)} from ${path.relative(rootDir, iconPngPath)} (256x256)`)
