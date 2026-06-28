import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconPath = join(__dirname, '..', 'src-tauri', 'icons', 'icon.png')

if (existsSync(iconPath)) {
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
    const inside = distance < 50
    const inner = distance < 28
    const highlight = (x - 45) ** 2 + (y - 39) ** 2 < 150
    const alpha = inside ? 255 : 0
    const red = inner ? 241 : highlight ? 255 : 184
    const green = inner ? 233 : highlight ? 230 : 151
    const blue = inner ? 216 : highlight ? 160 : 91

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

mkdirSync(dirname(iconPath), { recursive: true })
writeFileSync(iconPath, png)
console.log(`Created ${iconPath}`)

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
