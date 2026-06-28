import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconDir = join(__dirname, '..', 'src-tauri', 'icons')
const pngPath = join(iconDir, 'icon.png')
const icoPath = join(iconDir, 'icon.ico')

if (existsSync(pngPath) && existsSync(icoPath)) {
  process.exit(0)
}

const width = 128
const height = 128
const rows = []

for (let y = 0; y < height; y += 1) {
  const row = [0]

  for (let x = 0; x < width; x += 1) {
    const dx = x - width / 2
    const dy = y - height / 2
    const distance = Math.sqrt(dx * dx + dy * dy)
    const ring = distance < 48
    const core = distance < 23
    const highlight = (x - 46) ** 2 + (y - 40) ** 2 < 180
    const alpha = ring ? 255 : 0
    const red = core ? 241 : highlight ? 128 : 53
    const green = core ? 233 : highlight ? 255 : 208
    const blue = core ? 216 : highlight ? 170 : 111

    row.push(red, green, blue, alpha)
  }

  rows.push(Buffer.from(row))
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', Buffer.from([
    0x00, 0x00, 0x00, width,
    0x00, 0x00, 0x00, height,
    0x08, 0x06, 0x00, 0x00, 0x00,
  ])),
  chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

mkdirSync(iconDir, { recursive: true })

if (!existsSync(pngPath)) {
  writeFileSync(pngPath, png)
  console.log(`Created ${pngPath}`)
}

if (!existsSync(icoPath)) {
  writeFileSync(icoPath, icoFromPng(png, width, height))
  console.log(`Created ${icoPath}`)
}

function icoFromPng(pngData, iconWidth, iconHeight) {
  const headerSize = 6
  const entrySize = 16
  const imageOffset = headerSize + entrySize
  const ico = Buffer.alloc(imageOffset + pngData.length)

  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(1, 4)
  ico.writeUInt8(iconWidth >= 256 ? 0 : iconWidth, 6)
  ico.writeUInt8(iconHeight >= 256 ? 0 : iconHeight, 7)
  ico.writeUInt8(0, 8)
  ico.writeUInt8(0, 9)
  ico.writeUInt16LE(1, 10)
  ico.writeUInt16LE(32, 12)
  ico.writeUInt32LE(pngData.length, 14)
  ico.writeUInt32LE(imageOffset, 18)
  pngData.copy(ico, imageOffset)

  return ico
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)

  return Buffer.concat([length, typeBuffer, data, crc])
}

function crc32(buffer) {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc ^= byte
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}
