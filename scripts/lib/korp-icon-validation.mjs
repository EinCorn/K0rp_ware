import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const ICON_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ICON_GROUPS = new Set(['modules', 'system'])

export class KorpIconValidationError extends Error {
  constructor(errors) {
    super(`K0rp icon validation failed:\n- ${errors.join('\n- ')}`)
    this.name = 'KorpIconValidationError'
    this.errors = errors
  }
}

export function parseKorpIconManifest(source) {
  let manifest

  try {
    manifest = JSON.parse(source)
  } catch (error) {
    throw new KorpIconValidationError([`manifest.json is malformed: ${error.message}`])
  }

  return manifest
}

export function resolvePathInside(root, relativePath, label = 'path') {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    throw new KorpIconValidationError([`${label} must be a non-empty relative path`])
  }

  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(resolvedRoot, relativePath)
  const relativeToRoot = path.relative(resolvedRoot, resolvedPath)

  if (
    relativeToRoot === '..'
    || relativeToRoot.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeToRoot)
  ) {
    throw new KorpIconValidationError([`${label} escapes its allowed root: ${relativePath}`])
  }

  return resolvedPath
}

export function getKorpIconRawPaths(icon) {
  return {
    png64: `png/64/${icon.group}/${icon.id}.png`,
    png256: `png/256/${icon.group}/${icon.id}.png`,
    ico: `ico/${icon.group}/${icon.id}.ico`,
  }
}

export function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath)

  if (
    buffer.length < 24
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    || buffer.toString('ascii', 12, 16) !== 'IHDR'
  ) {
    throw new KorpIconValidationError([`invalid PNG header: ${filePath}`])
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer.readUInt8(24),
    colorType: buffer.readUInt8(25),
  }
}

export function readIcoDimensions(filePath) {
  const buffer = readFileSync(filePath)

  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    throw new KorpIconValidationError([`invalid ICO header: ${filePath}`])
  }

  const count = buffer.readUInt16LE(4)
  if (count < 1 || buffer.length < 6 + count * 16) {
    throw new KorpIconValidationError([`invalid ICO directory: ${filePath}`])
  }

  const dimensions = []
  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16
    dimensions.push({
      width: buffer.readUInt8(offset) || 256,
      height: buffer.readUInt8(offset + 1) || 256,
      bitsPerPixel: buffer.readUInt16LE(offset + 6),
    })

    const byteLength = buffer.readUInt32LE(offset + 8)
    const imageOffset = buffer.readUInt32LE(offset + 12)
    if (byteLength < 1 || imageOffset + byteLength > buffer.length) {
      throw new KorpIconValidationError([`ICO image entry escapes file bounds: ${filePath}`])
    }
  }

  return dimensions
}

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0

export function validateKorpIconManifest(manifest, {
  runtimeSelections = [],
  requiredCurrentIds = [],
} = {}) {
  const errors = []

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new KorpIconValidationError(['manifest root must be an object'])
  }

  if (!isPositiveInteger(manifest.sourceSize)) {
    errors.push('manifest sourceSize must be a positive integer')
  }

  if (!Array.isArray(manifest.icons)) {
    throw new KorpIconValidationError([...errors, 'manifest icons must be an array'])
  }

  const ids = new Set()
  for (const [index, icon] of manifest.icons.entries()) {
    const prefix = `icons[${index}]`

    if (!icon || typeof icon !== 'object' || Array.isArray(icon)) {
      errors.push(`${prefix} must be an object`)
      continue
    }

    if (typeof icon.id !== 'string' || !ICON_ID_PATTERN.test(icon.id)) {
      errors.push(`${prefix}.id is unsafe or invalid: ${String(icon.id)}`)
    } else if (ids.has(icon.id)) {
      errors.push(`duplicate semantic icon id: ${icon.id}`)
    } else {
      ids.add(icon.id)
    }

    if (!ICON_GROUPS.has(icon.group)) errors.push(`${prefix}.group is unsupported: ${String(icon.group)}`)
    if (typeof icon.title !== 'string' || icon.title.length === 0) errors.push(`${prefix}.title is required`)
    if (typeof icon.category !== 'string' || icon.category.length === 0) errors.push(`${prefix}.category is required`)

    if (icon.dimensions !== undefined) {
      if (
        !icon.dimensions
        || !isPositiveInteger(icon.dimensions.width)
        || !isPositiveInteger(icon.dimensions.height)
      ) {
        errors.push(`${prefix}.dimensions must contain positive integer width/height`)
      }
    }

    if (icon.variants !== undefined) {
      if (!icon.variants || typeof icon.variants !== 'object' || Array.isArray(icon.variants)) {
        errors.push(`${prefix}.variants must be an object`)
      } else {
        for (const [state, variantPath] of Object.entries(icon.variants)) {
          if (!ICON_ID_PATTERN.test(state)) {
            errors.push(`${prefix}.variants state is unsafe or invalid: ${state}`)
          }
          try {
            resolvePathInside('.', variantPath, `${prefix}.variants.${state}`)
          } catch (error) {
            errors.push(...error.errors)
          }
          if (typeof variantPath === 'string' && path.extname(variantPath).toLowerCase() !== '.png') {
            errors.push(`${prefix}.variants.${state} must reference a PNG asset`)
          }
        }
      }
    }
  }

  const selectionIds = new Set()
  for (const [index, selection] of runtimeSelections.entries()) {
    const prefix = `runtimeSelections[${index}]`
    if (!selection || typeof selection !== 'object') {
      errors.push(`${prefix} must be an object`)
      continue
    }
    if (!ids.has(selection.id)) errors.push(`${prefix} references missing manifest id: ${String(selection.id)}`)
    if (selectionIds.has(selection.id)) errors.push(`duplicate runtime semantic icon id: ${selection.id}`)
    selectionIds.add(selection.id)
    if (!Array.isArray(selection.slots) || selection.slots.length === 0) errors.push(`${prefix}.slots must be non-empty`)
    if (!isPositiveInteger(selection.intendedSize)) errors.push(`${prefix}.intendedSize must be a positive integer`)
  }

  for (const id of requiredCurrentIds) {
    if (!selectionIds.has(id)) errors.push(`missing required current-surface icon mapping: ${id}`)
  }

  if (errors.length > 0) throw new KorpIconValidationError(errors)
  return manifest
}

const assertDimensions = (actual, expectedWidth, expectedHeight, label, errors) => {
  if (actual.width !== expectedWidth || actual.height !== expectedHeight) {
    errors.push(`${label} is ${actual.width}x${actual.height}; expected ${expectedWidth}x${expectedHeight}`)
  }
}

export function validateKorpIconPack({
  rawRoot,
  manifest,
  runtimeSelections = [],
  requiredCurrentIds = [],
}) {
  validateKorpIconManifest(manifest, { runtimeSelections, requiredCurrentIds })
  const errors = []

  for (const icon of manifest.icons) {
    const rawPaths = getKorpIconRawPaths(icon)

    for (const [format, relativePath] of Object.entries(rawPaths)) {
      let filePath
      try {
        filePath = resolvePathInside(rawRoot, relativePath, `${icon.id}.${format}`)
      } catch (error) {
        errors.push(...error.errors)
        continue
      }

      if (!existsSync(filePath)) {
        errors.push(`missing referenced asset for ${icon.id}: ${relativePath}`)
        continue
      }

      try {
        if (format === 'png64') {
          const metadata = readPngDimensions(filePath)
          assertDimensions(
            metadata,
            manifest.sourceSize,
            manifest.sourceSize,
            relativePath,
            errors,
          )
          if (metadata.bitDepth !== 8 || metadata.colorType !== 6) {
            errors.push(`${relativePath} must be RGBA8`)
          }
        } else if (format === 'png256') {
          const metadata = readPngDimensions(filePath)
          assertDimensions(metadata, 256, 256, relativePath, errors)
          if (metadata.bitDepth !== 8 || metadata.colorType !== 6) {
            errors.push(`${relativePath} must be RGBA8`)
          }
        } else {
          const dimensions = readIcoDimensions(filePath)
          const includesSource = dimensions.some(({ width, height }) => (
            width === manifest.sourceSize && height === manifest.sourceSize
          ))
          const includesLauncher = dimensions.some(({ width, height }) => width === 256 && height === 256)
          if (!includesSource || !includesLauncher) {
            errors.push(`${relativePath} must include ${manifest.sourceSize}x${manifest.sourceSize} and 256x256 entries`)
          }
          if (dimensions.some(({ bitsPerPixel }) => bitsPerPixel !== 32)) {
            errors.push(`${relativePath} must contain only 32bpp entries`)
          }
        }
      } catch (error) {
        errors.push(...(error.errors ?? [error.message]))
      }
    }

    for (const [state, variantPath] of Object.entries(icon.variants ?? {})) {
      try {
        const variantFile = resolvePathInside(rawRoot, variantPath, `${icon.id}.variants.${state}`)
        if (!existsSync(variantFile)) {
          errors.push(`missing state variant for ${icon.id}.${state}: ${variantPath}`)
          continue
        }
        if (!statSync(variantFile).isFile()) {
          errors.push(`state variant must be a regular file for ${icon.id}.${state}: ${variantPath}`)
          continue
        }

        const metadata = readPngDimensions(variantFile)
        assertDimensions(
          metadata,
          manifest.sourceSize,
          manifest.sourceSize,
          `${icon.id}.${state} state variant`,
          errors,
        )
        if (metadata.bitDepth !== 8 || metadata.colorType !== 6) {
          errors.push(`${icon.id}.${state} state variant must be RGBA8`)
        }
      } catch (error) {
        errors.push(...(error.errors ?? [error.message]))
      }
    }

    if (icon.dimensions) {
      const sourcePath = resolvePathInside(rawRoot, getKorpIconRawPaths(icon).png64)
      try {
        assertDimensions(
          readPngDimensions(sourcePath),
          icon.dimensions.width,
          icon.dimensions.height,
          `${icon.id} declared dimensions`,
          errors,
        )
      } catch (error) {
        errors.push(...(error.errors ?? [error.message]))
      }
    }
  }

  validateAtlas(rawRoot, manifest, errors)

  for (const requiredFile of ['README.md', 'manifest_cz_utf8.csv', 'atlases/atlas.json']) {
    if (!existsSync(resolvePathInside(rawRoot, requiredFile, requiredFile))) {
      errors.push(`missing source documentation/schema file: ${requiredFile}`)
    }
  }

  if (errors.length > 0) throw new KorpIconValidationError(errors)
  return manifest
}

function validateAtlas(rawRoot, manifest, errors) {
  const atlasPath = resolvePathInside(rawRoot, 'atlases/atlas.json', 'atlas manifest')
  if (!existsSync(atlasPath)) {
    errors.push('missing atlas manifest: atlases/atlas.json')
    return
  }

  let atlas
  try {
    atlas = parseKorpIconManifest(readFileSync(atlasPath, 'utf8'))
  } catch (error) {
    errors.push(...error.errors.map((message) => message.replace('manifest.json', 'atlases/atlas.json')))
    return
  }

  if (!atlas || typeof atlas !== 'object' || Array.isArray(atlas)) {
    errors.push('atlas manifest root must be an object')
    return
  }

  for (const group of ['modules', 'system', 'all']) {
    const sheet = atlas[group]
    if (!sheet || typeof sheet !== 'object') {
      errors.push(`atlas is missing ${group} sheet`)
      continue
    }

    const expectedIds = manifest.icons
      .filter((icon) => group === 'all' || icon.group === group)
      .map(({ id }) => id)
    const frameIds = Object.keys(sheet.frames ?? {})

    if (
      expectedIds.length !== frameIds.length
      || expectedIds.some((id) => !Object.hasOwn(sheet.frames ?? {}, id))
    ) {
      errors.push(`atlas ${group} frames do not match manifest semantic IDs`)
    }

    if (!isPositiveInteger(sheet.cellSize) || !isPositiveInteger(sheet.columns) || !isPositiveInteger(sheet.rows)) {
      errors.push(`atlas ${group} grid metadata is invalid`)
      continue
    }

    const imagePath = resolvePathInside(rawRoot, `atlases/${sheet.image}`, `atlas ${group} image`)
    if (!existsSync(imagePath)) {
      errors.push(`missing atlas image: atlases/${sheet.image}`)
    } else {
      try {
        assertDimensions(
          readPngDimensions(imagePath),
          sheet.columns * sheet.cellSize,
          sheet.rows * sheet.cellSize,
          `atlases/${sheet.image}`,
          errors,
        )
      } catch (error) {
        errors.push(...(error.errors ?? [error.message]))
      }
    }

    const occupiedCells = new Set()
    for (const id of frameIds) {
      const frame = sheet.frames[id]
      if (
        !frame
        || !Number.isInteger(frame.x)
        || !Number.isInteger(frame.y)
        || frame.w !== sheet.cellSize
        || frame.h !== sheet.cellSize
        || frame.x % sheet.cellSize !== 0
        || frame.y % sheet.cellSize !== 0
        || frame.x < 0
        || frame.y < 0
        || frame.x + frame.w > sheet.columns * sheet.cellSize
        || frame.y + frame.h > sheet.rows * sheet.cellSize
      ) {
        errors.push(`atlas ${group} frame is invalid: ${id}`)
        continue
      }


      const cellKey = `${frame.x}:${frame.y}`
      if (occupiedCells.has(cellKey)) errors.push(`atlas ${group} frame overlaps another icon: ${id}`)
      occupiedCells.add(cellKey)
    }
  }
}
