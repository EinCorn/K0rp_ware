import { createHash } from 'node:crypto'
import {
  existsSync,
  realpathSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'
import path from 'node:path'
import {
  KORP_UI_FLAVOR_CATEGORY_PREFIXES,
  KORP_UI_RAW_ROOT,
  KORP_UI_REQUIRED_SOURCE_FILES,
  KORP_UI_RUNTIME_COPY_SCAN_ROOTS,
  KORP_UI_RUNTIME_SCAN_ROOTS,
} from '../korp-ui-assets-contract.mjs'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const ASSET_ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const GROUP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PRODUCTION_STATUSES = new Set(['production', 'reference'])
const NINE_SLICE_PIECES = Object.freeze(['b', 'bl', 'br', 'c', 'l', 'r', 't', 'tl', 'tr'])
const RUNTIME_TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.mjs',
  '.ts',
  '.tsx',
])
const RUNTIME_SCAN_IGNORED_PATHS = Object.freeze([
  /^desktop\/[^/]+\/node_modules(?:\/|$)/,
  /^desktop\/[^/]+\/src-tauri\/target(?:\/|$)/,
  /^packages\/[^/]+\/node_modules(?:\/|$)/,
  /^packages\/[^/]+\/target(?:\/|$)/,
])
const FORMAT_FIELDS = Object.freeze([
  {
    field: 'path_native',
    key: 'nativePng',
    prefix: 'assets/native/',
    suffix: '.png',
  },
  {
    field: 'path_2x',
    key: 'nearestNeighborPng2x',
    prefix: 'assets/2x/',
    suffix: '@2x.png',
  },
  {
    field: 'path_webp',
    key: 'losslessWebp',
    prefix: 'assets/webp/',
    suffix: '.webp',
  },
])
const compareText = (left, right) => (left === right ? 0 : left < right ? -1 : 1)

export class KorpUiAssetValidationError extends Error {
  constructor(errors) {
    const stableErrors = [...new Set(errors)].sort(compareText)
    super(`K0rp UI asset validation failed:\n- ${stableErrors.join('\n- ')}`)
    this.name = 'KorpUiAssetValidationError'
    this.errors = stableErrors
  }
}

export function parseKorpUiJson(source, label = 'JSON') {
  try {
    return JSON.parse(source)
  } catch (error) {
    throw new KorpUiAssetValidationError([`${label} is malformed: ${error.message}`])
  }
}

export function resolveKorpUiPathInside(root, relativePath, label = 'path') {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    throw new KorpUiAssetValidationError([`${label} must be a non-empty relative path`])
  }

  const forwardPath = relativePath.replaceAll('\\', '/')
  const pathParts = forwardPath.split('/')
  if (
    relativePath.includes('\0')
    || relativePath.includes('\\')
    || path.posix.isAbsolute(forwardPath)
    || path.win32.isAbsolute(relativePath)
    || /^[a-z]:/i.test(relativePath)
    || pathParts.some((part) => part === '' || part === '.' || part === '..')
    || path.posix.normalize(forwardPath) !== forwardPath
  ) {
    throw new KorpUiAssetValidationError([`${label} escapes or is not canonical: ${relativePath}`])
  }

  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(resolvedRoot, ...pathParts)
  const relativeToRoot = path.relative(resolvedRoot, resolvedPath)
  if (
    relativeToRoot === '..'
    || relativeToRoot.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeToRoot)
  ) {
    throw new KorpUiAssetValidationError([`${label} escapes its allowed root: ${relativePath}`])
  }

  if (existsSync(resolvedPath)) {
    const realRoot = realpathSync(resolvedRoot)
    const realPath = realpathSync(resolvedPath)
    const relativeRealPath = path.relative(realRoot, realPath)
    if (
      relativeRealPath === '..'
      || relativeRealPath.startsWith(`..${path.sep}`)
      || path.isAbsolute(relativeRealPath)
    ) {
      throw new KorpUiAssetValidationError([`${label} resolves through a symlink outside its allowed root`])
    }
  }

  return resolvedPath
}

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0

function validateRect(value, label, width, height, errors, { bounded = true } = {}) {
  if (value === null || value === undefined) return
  if (
    !Array.isArray(value)
    || value.length !== 4
    || !isNonNegativeInteger(value[0])
    || !isNonNegativeInteger(value[1])
    || !isPositiveInteger(value[2])
    || !isPositiveInteger(value[3])
  ) {
    errors.push(`${label} must be [x, y, positive width, positive height] integers`)
    return
  }

  if (bounded && (value[0] + value[2] > width || value[1] + value[3] > height)) {
    errors.push(`${label} exceeds declared ${width}x${height} bounds`)
  }
}

function validateNineSlice(value, label, width, height, errors) {
  if (value === null || value === undefined) return
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label} must be an object with left/top/right/bottom cap insets`)
    return
  }

  const keys = Object.keys(value).sort()
  const expectedKeys = ['bottom', 'left', 'right', 'top']
  if (
    JSON.stringify(keys) !== JSON.stringify(expectedKeys)
    || expectedKeys.some((key) => !isNonNegativeInteger(value[key]))
  ) {
    errors.push(`${label} must contain only non-negative integer left/top/right/bottom cap insets`)
    return
  }

  if (value.left + value.right >= width || value.top + value.bottom >= height) {
    errors.push(`${label} cap insets leave no positive center area inside ${width}x${height}`)
  }
}

function validateManifestPath(asset, index, format, pathIds, errors) {
  const relativePath = asset[format.field]
  const label = `assets[${index}].${format.field}`
  try {
    resolveKorpUiPathInside('.', relativePath, label)
  } catch (error) {
    errors.push(...error.errors)
    return
  }

  if (!relativePath.startsWith(format.prefix) || !relativePath.endsWith(format.suffix)) {
    errors.push(`${label} must match ${format.prefix}*${format.suffix}`)
  }
  const collisionKey = relativePath.toLowerCase()
  if (pathIds.has(collisionKey)) {
    errors.push(
      `case-insensitive duplicate manifest asset path: ${relativePath} `
        + `(conflicts with ${pathIds.get(collisionKey)})`,
    )
  } else {
    pathIds.set(collisionKey, relativePath)
  }
}

function validateNineSlicePieces(assets, assetById, errors) {
  const groups = new Map()
  for (const asset of assets) {
    if (asset?.role !== 'nine-slice-piece') continue
    const parentId = asset.derived_from
    if (typeof parentId !== 'string' || parentId.length === 0) {
      errors.push(`nine-slice piece ${String(asset.id)} must declare derived_from`)
      continue
    }

    const suffixMatch = new RegExp(`^${escapeRegex(parentId)}\\.slice\\.(${NINE_SLICE_PIECES.join('|')})$`).exec(asset.id)
    if (!suffixMatch) {
      errors.push(`nine-slice piece id does not match its parent: ${asset.id} -> ${parentId}`)
      continue
    }

    const group = groups.get(parentId) ?? new Map()
    if (group.has(suffixMatch[1])) {
      errors.push(`duplicate nine-slice piece ${parentId}.slice.${suffixMatch[1]}`)
    } else {
      group.set(suffixMatch[1], asset)
    }
    groups.set(parentId, group)
  }

  for (const [parentId, pieces] of [...groups].sort(([left], [right]) => compareText(left, right))) {
    const parent = assetById.get(parentId)
    if (!parent) {
      errors.push(`nine-slice family references unknown parent: ${parentId}`)
      continue
    }
    if (!parent.nine_slice) {
      errors.push(`nine-slice family parent lacks cap-inset metadata: ${parentId}`)
      continue
    }

    const missing = NINE_SLICE_PIECES.filter((piece) => !pieces.has(piece))
    if (missing.length > 0) {
      errors.push(`nine-slice family ${parentId} is missing pieces: ${missing.join(', ')}`)
      continue
    }

    const { left, top, right, bottom } = parent.nine_slice
    const centerWidth = parent.width - left - right
    const centerHeight = parent.height - top - bottom
    const expectedDimensions = {
      b: [centerWidth, bottom],
      bl: [left, bottom],
      br: [right, bottom],
      c: [centerWidth, centerHeight],
      l: [left, centerHeight],
      r: [right, centerHeight],
      t: [centerWidth, top],
      tl: [left, top],
      tr: [right, top],
    }

    for (const piece of NINE_SLICE_PIECES) {
      const asset = pieces.get(piece)
      const [expectedWidth, expectedHeight] = expectedDimensions[piece]
      if (asset.production_status !== parent.production_status) {
        errors.push(
          `${asset.id} production_status ${asset.production_status} `
            + `does not match nine-slice parent ${parentId} (${parent.production_status})`,
        )
      }
      if (asset.width !== expectedWidth || asset.height !== expectedHeight) {
        errors.push(
          `${asset.id} declares ${asset.width}x${asset.height}; `
            + `expected ${expectedWidth}x${expectedHeight} from ${parentId} cap insets`,
        )
      }
    }
  }
}

export function validateKorpUiManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new KorpUiAssetValidationError(['manifest root must be an object'])
  }

  const errors = []
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    errors.push('manifest version must be a non-empty string')
  }
  if (!isNonNegativeInteger(manifest.asset_count)) {
    errors.push('manifest asset_count must be a non-negative integer')
  }
  if (!Array.isArray(manifest.assets)) {
    throw new KorpUiAssetValidationError([...errors, 'manifest assets must be an array'])
  }
  if (manifest.asset_count !== manifest.assets.length) {
    errors.push(`manifest asset_count ${manifest.asset_count} does not match assets length ${manifest.assets.length}`)
  }

  const ids = new Set()
  const pathIds = new Map()
  const assetById = new Map()

  for (const [index, asset] of manifest.assets.entries()) {
    const prefix = `assets[${index}]`
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(`${prefix} must be an object`)
      continue
    }

    if (typeof asset.id !== 'string' || !ASSET_ID_PATTERN.test(asset.id)) {
      errors.push(`${prefix}.id is unsafe or invalid: ${String(asset.id)}`)
    } else if (ids.has(asset.id)) {
      errors.push(`duplicate semantic asset id: ${asset.id}`)
    } else {
      ids.add(asset.id)
      assetById.set(asset.id, asset)
    }

    if (typeof asset.name !== 'string' || asset.name.length === 0) errors.push(`${prefix}.name is required`)
    if (typeof asset.category !== 'string' || asset.category.length === 0) errors.push(`${prefix}.category is required`)
    if (typeof asset.role !== 'string' || asset.role.length === 0) errors.push(`${prefix}.role is required`)
    if (!PRODUCTION_STATUSES.has(asset.production_status)) {
      errors.push(`${prefix}.production_status is unsupported: ${String(asset.production_status)}`)
    }
    if (!isPositiveInteger(asset.width) || !isPositiveInteger(asset.height)) {
      errors.push(`${prefix} dimensions must be positive integers`)
    }
    if (typeof asset.text_baked !== 'boolean') errors.push(`${prefix}.text_baked must be boolean`)
    if (typeof asset.has_alpha !== 'boolean') errors.push(`${prefix}.has_alpha must be boolean`)

    for (const format of FORMAT_FIELDS) validateManifestPath(asset, index, format, pathIds, errors)

    if (typeof asset.name === 'string') {
      const nativeTail = typeof asset.path_native === 'string'
        ? asset.path_native.slice('assets/native/'.length)
        : ''
      const expectedNativeName = `${asset.name}.png`
      if (!nativeTail.endsWith(`/${expectedNativeName}`) && nativeTail !== expectedNativeName) {
        errors.push(`${prefix}.path_native basename does not match name ${asset.name}`)
      }
      const expected2x = `assets/2x/${nativeTail.replace(/\.png$/i, '@2x.png')}`
      const expectedWebp = `assets/webp/${nativeTail.replace(/\.png$/i, '.webp')}`
      if (asset.path_2x !== expected2x) errors.push(`${prefix}.path_2x does not mirror path_native`)
      if (asset.path_webp !== expectedWebp) errors.push(`${prefix}.path_webp does not mirror path_native`)
    }

    if (isPositiveInteger(asset.width) && isPositiveInteger(asset.height)) {
      validateRect(asset.alpha_bbox, `${prefix}.alpha_bbox`, asset.width, asset.height, errors)
      validateRect(asset.content_rect, `${prefix}.content_rect`, asset.width, asset.height, errors)
      validateRect(asset.source_rect, `${prefix}.source_rect`, asset.width, asset.height, errors, { bounded: false })
      validateNineSlice(asset.nine_slice, `${prefix}.nine_slice`, asset.width, asset.height, errors)
    }
  }

  for (const asset of manifest.assets) {
    if (!asset || typeof asset !== 'object' || asset.derived_from === null || asset.derived_from === undefined) continue
    if (typeof asset.derived_from !== 'string' || !assetById.has(asset.derived_from)) {
      errors.push(`${String(asset.id)} derived_from references unknown asset: ${String(asset.derived_from)}`)
    }
  }

  validateNineSlicePieces(manifest.assets, assetById, errors)
  if (errors.length > 0) throw new KorpUiAssetValidationError(errors)
  return manifest
}

export function flattenKorpUiAllowlist(allowlist) {
  return (allowlist?.groups ?? []).flatMap((group) => group.assetIds ?? [])
}

export function validateKorpUiAllowlist(allowlist, manifest, { expectedSourceRoot = KORP_UI_RAW_ROOT } = {}) {
  const errors = []
  if (!allowlist || typeof allowlist !== 'object' || Array.isArray(allowlist)) {
    throw new KorpUiAssetValidationError(['runtime allowlist root must be an object'])
  }
  if (allowlist.schemaVersion !== 1) errors.push('runtime allowlist schemaVersion must be 1')
  if (allowlist.targetTask !== '022A(2.2)') errors.push('runtime allowlist targetTask must be 022A(2.2)')
  if (allowlist.sourceRoot !== expectedSourceRoot) {
    errors.push(`runtime allowlist sourceRoot must be ${expectedSourceRoot}`)
  }
  if (allowlist.copyAssets !== false) errors.push('runtime allowlist copyAssets must remain false in Task 022A(2.1)')
  if (!Array.isArray(allowlist.groups) || allowlist.groups.length === 0) {
    throw new KorpUiAssetValidationError([...errors, 'runtime allowlist groups must be a non-empty array'])
  }

  const assetById = new Map(manifest.assets.map((asset) => [asset.id, asset]))
  const groupIds = new Set()
  const selectionIds = new Set()
  for (const [index, group] of allowlist.groups.entries()) {
    const prefix = `runtime allowlist groups[${index}]`
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      errors.push(`${prefix} must be an object`)
      continue
    }
    if (typeof group.id !== 'string' || !GROUP_ID_PATTERN.test(group.id)) {
      errors.push(`${prefix}.id is unsafe or invalid: ${String(group.id)}`)
    } else if (groupIds.has(group.id)) {
      errors.push(`duplicate runtime allowlist group id: ${group.id}`)
    } else {
      groupIds.add(group.id)
    }
    if (typeof group.purpose !== 'string' || group.purpose.length === 0) errors.push(`${prefix}.purpose is required`)
    if (!Array.isArray(group.assetIds) || group.assetIds.length === 0) {
      errors.push(`${prefix}.assetIds must be a non-empty array`)
      continue
    }

    for (const id of group.assetIds) {
      if (selectionIds.has(id)) errors.push(`duplicate runtime-selection id: ${String(id)}`)
      selectionIds.add(id)
      const asset = assetById.get(id)
      if (!asset) {
        errors.push(`runtime allowlist references unknown asset: ${String(id)}`)
      } else if (asset.production_status === 'reference') {
        errors.push(`runtime allowlist references reference-only asset: ${id}`)
      } else if (asset.text_baked || asset.role === 'document-template') {
        errors.push(`runtime allowlist references baked/template runtime copy: ${id}`)
      } else if (asset.role === 'system-icon' || asset.role === 'file-icon' || asset.role === 'folder-object') {
        errors.push(`runtime allowlist references icon-like asset governed by the canonical icon pack: ${id}`)
      }
    }
  }

  if (errors.length > 0) throw new KorpUiAssetValidationError(errors)
  return [...selectionIds]
}

export function readKorpUiPngDimensions(filePath) {
  const buffer = readFileSync(filePath)
  if (
    buffer.length < 26
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    || buffer.toString('ascii', 12, 16) !== 'IHDR'
  ) {
    throw new KorpUiAssetValidationError([`invalid PNG header: ${filePath}`])
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer.readUInt8(24),
    colorType: buffer.readUInt8(25),
  }
}

export function readKorpUiWebpDimensions(filePath) {
  const buffer = readFileSync(filePath)
  if (
    buffer.length < 20
    || buffer.toString('ascii', 0, 4) !== 'RIFF'
    || buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    throw new KorpUiAssetValidationError([`invalid WebP header: ${filePath}`])
  }

  let offset = 12
  let extendedDimensions = null
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    const dataOffset = offset + 8
    const dataEnd = dataOffset + chunkSize
    if (dataEnd > buffer.length) {
      throw new KorpUiAssetValidationError([`WebP chunk escapes file bounds: ${filePath}`])
    }

    if (chunkType === 'VP8X' && chunkSize >= 10) {
      extendedDimensions = {
        width: buffer.readUIntLE(dataOffset + 4, 3) + 1,
        height: buffer.readUIntLE(dataOffset + 7, 3) + 1,
      }
    } else if (chunkType === 'VP8L' && chunkSize >= 5 && buffer[dataOffset] === 0x2f) {
      const packed = buffer.readUInt32LE(dataOffset + 1)
      const payloadDimensions = {
        width: (packed & 0x3fff) + 1,
        height: (Math.floor(packed / 0x4000) & 0x3fff) + 1,
      }
      return {
        ...(extendedDimensions ?? payloadDimensions),
        encoding: 'lossless',
      }
    } else if (
      chunkType === 'VP8 '
      && chunkSize >= 10
      && buffer[dataOffset + 3] === 0x9d
      && buffer[dataOffset + 4] === 0x01
      && buffer[dataOffset + 5] === 0x2a
    ) {
      const payloadDimensions = {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      }
      return {
        ...(extendedDimensions ?? payloadDimensions),
        encoding: 'lossy',
      }
    }

    offset = dataEnd + (chunkSize % 2)
  }
  if (extendedDimensions) return { ...extendedDimensions, encoding: 'extended' }
  throw new KorpUiAssetValidationError([`WebP dimensions are unreadable: ${filePath}`])
}

function assertDimensions(actual, expectedWidth, expectedHeight, label, errors) {
  if (actual.width !== expectedWidth || actual.height !== expectedHeight) {
    errors.push(`${label} is ${actual.width}x${actual.height}; expected ${expectedWidth}x${expectedHeight}`)
  }
}

export function listKorpUiFiles(root) {
  const files = []
  if (!existsSync(root)) return files

  const visit = (directory) => {
    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareText(left.name, right.name))
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
      } else if (entry.isFile()) {
        files.push({
          path: path.relative(root, absolutePath).replaceAll('\\', '/'),
          absolutePath,
          bytes: statSync(absolutePath).size,
        })
      }
    }
  }

  visit(root)
  return files.sort((left, right) => compareText(left.path, right.path))
}

function pathIsInside(root, candidate) {
  const relativePath = path.relative(root, candidate)
  return relativePath !== '..'
    && !relativePath.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relativePath)
}

function resolveKorpUiRuntimeTarget(repoRoot, candidate) {
  const relativePath = path.relative(repoRoot, candidate).replaceAll('\\', '/')
  let realTarget
  try {
    realTarget = realpathSync(candidate)
  } catch {
    throw new KorpUiAssetValidationError([
      `runtime scan cannot resolve path: ${relativePath}`,
    ])
  }
  if (!pathIsInside(realpathSync(repoRoot), realTarget)) {
    throw new KorpUiAssetValidationError([
      `runtime scan symlink escapes repository: ${relativePath}`,
    ])
  }
  return realTarget
}

function listKorpUiRuntimeFiles(root, repoRoot) {
  const files = []
  const visitedDirectories = new Set()

  const visit = (directory) => {
    const realDirectory = resolveKorpUiRuntimeTarget(repoRoot, directory)
    if (visitedDirectories.has(realDirectory)) return
    visitedDirectories.add(realDirectory)

    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareText(left.name, right.name))
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        const relativePath = path.relative(repoRoot, absolutePath).replaceAll('\\', '/')
        if (RUNTIME_SCAN_IGNORED_PATHS.some((pattern) => pattern.test(relativePath))) continue
        visit(absolutePath)
      } else if (entry.isFile()) {
        files.push(absolutePath)
      } else if (entry.isSymbolicLink()) {
        let targetStats
        resolveKorpUiRuntimeTarget(repoRoot, absolutePath)
        try {
          targetStats = statSync(absolutePath)
        } catch {
          const relativePath = path.relative(repoRoot, absolutePath).replaceAll('\\', '/')
          throw new KorpUiAssetValidationError([
            `runtime scan cannot inspect symlink: ${relativePath}`,
          ])
        }
        if (targetStats.isDirectory()) visit(absolutePath)
        else if (targetStats.isFile()) files.push(absolutePath)
      }
    }
  }

  visit(root)
  return files
}

export function validateKorpUiAssetFiles({ rawRoot, manifest }) {
  validateKorpUiManifest(manifest)
  const errors = []
  const warnings = []
  const metadataById = new Map()
  const referencedPaths = new Set()

  for (const asset of manifest.assets) {
    const formatMetadata = {}
    for (const format of FORMAT_FIELDS) {
      const relativePath = asset[format.field]
      referencedPaths.add(relativePath)
      let filePath
      try {
        filePath = resolveKorpUiPathInside(rawRoot, relativePath, `${asset.id}.${format.field}`)
      } catch (error) {
        errors.push(...error.errors)
        continue
      }

      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        const message = `missing ${asset.production_status} asset for ${asset.id}: ${relativePath}`
        if (asset.production_status === 'production') errors.push(message)
        else warnings.push(createWarning('REFERENCE_ASSET_MISSING', message, [relativePath]))
        continue
      }

      try {
        const metadata = format.key === 'losslessWebp'
          ? readKorpUiWebpDimensions(filePath)
          : readKorpUiPngDimensions(filePath)
        const scale = format.key === 'nearestNeighborPng2x' ? 2 : 1
        assertDimensions(metadata, asset.width * scale, asset.height * scale, relativePath, errors)
        if (format.key === 'losslessWebp' && metadata.encoding !== 'lossless') {
          errors.push(`${relativePath} must be lossless WebP; found ${metadata.encoding}`)
        }
        formatMetadata[format.key] = {
          path: relativePath,
          bytes: statSync(filePath).size,
          sha256: createHash('sha256').update(readFileSync(filePath)).digest('hex'),
          width: metadata.width,
          height: metadata.height,
          ...(metadata.bitDepth ? { bitDepth: metadata.bitDepth } : {}),
          ...(metadata.colorType !== undefined ? { colorType: metadata.colorType } : {}),
          ...(metadata.encoding ? { encoding: metadata.encoding } : {}),
        }
      } catch (error) {
        errors.push(...(error.errors ?? [error.message]))
      }
    }
    metadataById.set(asset.id, formatMetadata)
  }

  const sourceFiles = listKorpUiFiles(rawRoot)
  const orphanAssetFiles = sourceFiles
    .map((file) => file.path)
    .filter((relativePath) => (
      (relativePath.startsWith('assets/native/')
        || relativePath.startsWith('assets/2x/')
        || relativePath.startsWith('assets/webp/'))
      && !referencedPaths.has(relativePath)
    ))
  for (const relativePath of orphanAssetFiles) {
    errors.push(`orphaned production-format file is absent from manifest: ${relativePath}`)
  }

  if (errors.length > 0) throw new KorpUiAssetValidationError(errors)
  return {
    metadataById,
    orphanAssetFiles,
    sourceFiles,
    warnings: sortWarnings(warnings),
  }
}

export function auditKorpUiChecksums({ rawRoot, source }) {
  const errors = []
  const entries = []
  const pathKeys = new Set()
  const lines = source.split(/\r?\n/).filter((line) => line.length > 0)

  for (const [index, line] of lines.entries()) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line)
    if (!match) {
      errors.push(`SHA256SUMS.txt line ${index + 1} is malformed`)
      continue
    }
    const relativePath = match[2]
    try {
      resolveKorpUiPathInside(rawRoot, relativePath, `SHA256SUMS.txt line ${index + 1}`)
    } catch (error) {
      errors.push(...error.errors)
      continue
    }
    const pathKey = relativePath.toLowerCase()
    if (pathKeys.has(pathKey)) errors.push(`duplicate checksum path (case-insensitive): ${relativePath}`)
    pathKeys.add(pathKey)
    entries.push({ hash: match[1], path: relativePath })
  }

  const missing = []
  let verified = 0
  for (const entry of entries) {
    const filePath = resolveKorpUiPathInside(rawRoot, entry.path, `checksum path ${entry.path}`)
    if (!existsSync(filePath)) {
      missing.push(entry.path)
      continue
    }
    if (!statSync(filePath).isFile()) {
      errors.push(`checksum path is not a regular file: ${entry.path}`)
      continue
    }
    const actualHash = createHash('sha256').update(readFileSync(filePath)).digest('hex')
    if (actualHash !== entry.hash) errors.push(`checksum mismatch: ${entry.path}`)
    else verified += 1
  }

  const actualFiles = listKorpUiFiles(rawRoot).map((file) => file.path)
  const unlisted = actualFiles.filter((relativePath) => (
    relativePath !== 'SHA256SUMS.txt' && !pathKeys.has(relativePath.toLowerCase())
  ))
  const warnings = []
  const missingIcons = missing.filter((relativePath) => relativePath.startsWith('icons/k0rp_icons_v2/'))
  const missingQaBoards = missing.filter((relativePath) => /^qa\/[^/]+\.png$/i.test(relativePath))
  const classified = new Set([...missingIcons, ...missingQaBoards])
  const otherMissing = missing.filter((relativePath) => !classified.has(relativePath))

  if (missingIcons.length > 0) {
    warnings.push(createWarning(
      'AUX_CANONICAL_ICON_SNAPSHOT_OMITTED',
      `${missingIcons.length} stale checksum paths point to an absent nested icon snapshot; `
        + 'design/icon-source/k0rp-icons-v2 remains authoritative',
      missingIcons,
    ))
  }
  if (missingQaBoards.length > 0) {
    warnings.push(createWarning(
      'AUX_QA_BOARD_SHEETS_OMITTED',
      `${missingQaBoards.length} optional QA board sheets remain in checksums but are absent from the snapshot`,
      missingQaBoards,
    ))
  }
  if (otherMissing.length > 0) {
    for (const relativePath of otherMissing) {
      errors.push(`checksum references missing non-auxiliary path: ${relativePath}`)
    }
  }
  if (unlisted.length > 0) {
    warnings.push(createWarning(
      'AUX_UNCHECKSUMMED_SOURCE_FILES',
      `${unlisted.length} source files are not listed in SHA256SUMS.txt`,
      unlisted,
    ))
  }

  if (errors.length > 0) throw new KorpUiAssetValidationError(errors)
  return {
    entries: entries.length,
    missingPaths: missing.sort(compareText),
    unlistedPaths: unlisted,
    verified,
    warnings: sortWarnings(warnings),
  }
}

function parseRequiredJson(rawRoot, relativePath, errors) {
  const filePath = path.join(rawRoot, ...relativePath.split('/'))
  if (!existsSync(filePath)) {
    errors.push(`missing required source metadata: ${relativePath}`)
    return null
  }
  try {
    return parseKorpUiJson(readFileSync(filePath, 'utf8'), relativePath)
  } catch (error) {
    errors.push(...error.errors)
    return null
  }
}

function validateWindowMetrics(metrics, assetById, errors) {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    errors.push('docs/window-metrics.json root must be an object')
    return []
  }

  const families = []
  for (const familyName of Object.keys(metrics).sort()) {
    const family = metrics[familyName]
    const label = `window metrics ${familyName}`
    if (!family || typeof family !== 'object' || Array.isArray(family)) {
      errors.push(`${label} must be an object`)
      continue
    }
    const outer = family.outer_size
    const contentRect = family.content_rect
    if (!Array.isArray(outer) || outer.length !== 2 || !outer.every(isPositiveInteger)) {
      errors.push(`${label}.outer_size must contain positive integer width/height`)
      continue
    }
    validateRect(contentRect, `${label}.content_rect`, outer[0], outer[1], errors)

    const frame = assetById.get(family.frame_id)
    const content = assetById.get(family.content_id)
    const composite = assetById.get(family.composite_id)
    for (const [kind, asset] of [['frame', frame], ['content', content], ['composite', composite]]) {
      if (!asset) errors.push(`${label} references missing ${kind} asset`)
      else if (asset.production_status !== 'production') errors.push(`${label} ${kind} asset must be production`)
    }
    for (const asset of [frame, composite]) {
      if (!asset) continue
      assertDimensions(asset, outer[0], outer[1], `${label} ${asset.id}`, errors)
      if (JSON.stringify(asset.content_rect) !== JSON.stringify(contentRect)) {
        errors.push(`${label} content_rect differs from ${asset.id}`)
      }
    }
    if (content && Array.isArray(contentRect)) {
      assertDimensions(content, contentRect[2], contentRect[3], `${label} ${content.id}`, errors)
    }

    families.push({
      id: familyName,
      outerSize: outer,
      contentRect,
      frameId: family.frame_id,
      contentId: family.content_id,
      compositeId: family.composite_id,
    })
  }
  return families
}

function validateAtlases(rawRoot, atlasManifest, assetById, errors) {
  if (!atlasManifest || typeof atlasManifest !== 'object' || Array.isArray(atlasManifest)) {
    errors.push('atlases/atlas.json root must be an object')
    return []
  }

  const atlases = []
  for (const atlasId of Object.keys(atlasManifest).sort()) {
    const atlas = atlasManifest[atlasId]
    const label = `atlas ${atlasId}`
    if (!atlas || typeof atlas !== 'object' || Array.isArray(atlas)) {
      errors.push(`${label} must be an object`)
      continue
    }
    if (!isPositiveInteger(atlas.cell) || !isPositiveInteger(atlas.columns) || !isPositiveInteger(atlas.rows)) {
      errors.push(`${label} cell/columns/rows must be positive integers`)
      continue
    }

    let imagePath
    try {
      imagePath = resolveKorpUiPathInside(rawRoot, atlas.image, `${label}.image`)
    } catch (error) {
      errors.push(...error.errors)
      continue
    }
    if (!existsSync(imagePath)) {
      errors.push(`${label} image is missing: ${atlas.image}`)
      continue
    }

    let imageDimensions
    try {
      imageDimensions = readKorpUiPngDimensions(imagePath)
      assertDimensions(
        imageDimensions,
        atlas.cell * atlas.columns,
        atlas.cell * atlas.rows,
        atlas.image,
        errors,
      )
    } catch (error) {
      errors.push(...(error.errors ?? [error.message]))
      continue
    }

    if (!atlas.frames || typeof atlas.frames !== 'object' || Array.isArray(atlas.frames)) {
      errors.push(`${label}.frames must be an object`)
      continue
    }
    for (const [assetId, frame] of Object.entries(atlas.frames)) {
      const asset = assetById.get(assetId)
      if (!asset) errors.push(`${label} frame references unknown asset: ${assetId}`)
      if (
        !frame
        || !isNonNegativeInteger(frame.x)
        || !isNonNegativeInteger(frame.y)
        || !isPositiveInteger(frame.w)
        || !isPositiveInteger(frame.h)
      ) {
        errors.push(`${label} frame ${assetId} is malformed`)
        continue
      }
      if (frame.x + frame.w > imageDimensions.width || frame.y + frame.h > imageDimensions.height) {
        errors.push(`${label} frame ${assetId} escapes atlas bounds`)
      }
      if (asset && (asset.width !== frame.w || asset.height !== frame.h)) {
        errors.push(`${label} frame ${assetId} dimensions disagree with manifest`)
      }
    }

    atlases.push({
      id: atlasId,
      image: atlas.image,
      dimensions: [imageDimensions.width, imageDimensions.height],
      cell: atlas.cell,
      columns: atlas.columns,
      rows: atlas.rows,
      frameCount: Object.keys(atlas.frames).length,
      frameIds: Object.keys(atlas.frames).sort(),
    })
  }
  return atlases
}

function validateQaReport(report, manifest, errors) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    errors.push('qa/report.json root must be an object')
    return null
  }
  if (report.asset_count !== manifest.assets.length) {
    errors.push('qa/report.json asset_count does not match manifest')
  }
  if (!isNonNegativeInteger(report.failure_count) || !Array.isArray(report.failures)) {
    errors.push('qa/report.json failure metadata is malformed')
  } else if (report.failure_count !== report.failures.length) {
    errors.push('qa/report.json failure_count does not match failures length')
  } else if (report.failure_count > 0) {
    errors.push(`qa/report.json contains ${report.failure_count} source QA failures`)
  }
  if (!Array.isArray(report.assets) || report.assets.length !== manifest.assets.length) {
    errors.push('qa/report.json asset results do not match manifest length')
  } else {
    const manifestIds = manifest.assets.map((asset) => asset.id)
    const reportIds = report.assets.map((asset) => asset?.id)
    if (JSON.stringify(reportIds) !== JSON.stringify(manifestIds)) {
      errors.push('qa/report.json asset IDs or ordering do not match manifest')
    }
    const assetById = new Map(manifest.assets.map((asset) => [asset.id, asset]))
    for (const result of report.assets) {
      const asset = assetById.get(result?.id)
      if (!asset) continue
      if (
        !Array.isArray(result.size)
        || result.size.length !== 2
        || result.size[0] !== asset.width
        || result.size[1] !== asset.height
      ) {
        errors.push(`qa/report.json dimensions disagree for ${asset.id}`)
      }
      if (result.status !== 'PASS') errors.push(`qa/report.json result is not PASS for ${asset.id}`)
    }
  }
  return {
    assetCount: report.asset_count,
    failureCount: report.failure_count,
  }
}

export function validateKorpUiSupplementalMetadata({ rawRoot, manifest }) {
  const errors = []
  for (const relativePath of KORP_UI_REQUIRED_SOURCE_FILES) {
    const filePath = path.join(rawRoot, ...relativePath.split('/'))
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      errors.push(`missing required source file: ${relativePath}`)
    }
  }

  const assetById = new Map(manifest.assets.map((asset) => [asset.id, asset]))
  const windowMetrics = parseRequiredJson(rawRoot, 'docs/window-metrics.json', errors)
  const atlasManifest = parseRequiredJson(rawRoot, 'atlases/atlas.json', errors)
  const qaReport = parseRequiredJson(rawRoot, 'qa/report.json', errors)
  parseRequiredJson(rawRoot, 'tokens.json', errors)
  parseRequiredJson(rawRoot, 'repo-mapping.json', errors)

  const windowFamilies = validateWindowMetrics(windowMetrics, assetById, errors)
  const atlases = validateAtlases(rawRoot, atlasManifest, assetById, errors)
  const qa = validateQaReport(qaReport, manifest, errors)
  if (errors.length > 0) throw new KorpUiAssetValidationError(errors)
  return { atlases, qa, windowFamilies }
}

export function scanKorpUiRuntimeImports({
  repoRoot,
  rawRootRelative = KORP_UI_RAW_ROOT,
  scanRoots = KORP_UI_RUNTIME_SCAN_ROOTS,
}) {
  const indicators = [rawRootRelative, 'ui-source/k0rp-os-ui-assets-v3']
  const matches = []
  let filesScanned = 0

  for (const scanRoot of scanRoots) {
    const absoluteRoot = path.resolve(repoRoot, scanRoot)
    if (!existsSync(absoluteRoot)) continue
    resolveKorpUiRuntimeTarget(repoRoot, absoluteRoot)
    const candidates = statSync(absoluteRoot).isDirectory()
      ? listKorpUiRuntimeFiles(absoluteRoot, repoRoot)
      : [absoluteRoot]
    for (const filePath of candidates) {
      if (!RUNTIME_TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) continue
      filesScanned += 1
      const source = readFileSync(filePath, 'utf8').replaceAll('\\', '/')
      if (!indicators.some((indicator) => source.includes(indicator))) continue
      const lines = source.split(/\r?\n/)
      for (const [index, line] of lines.entries()) {
        if (indicators.some((indicator) => line.includes(indicator))) {
          matches.push({
            path: path.relative(repoRoot, filePath).replaceAll('\\', '/'),
            line: index + 1,
          })
        }
      }
    }
  }

  matches.sort((left, right) => compareText(left.path, right.path) || left.line - right.line)
  if (matches.length > 0) {
    throw new KorpUiAssetValidationError(matches.map((match) => (
      `raw UI source is referenced by runtime source: ${match.path}:${match.line}`
    )))
  }
  return { filesScanned, matches }
}

export function scanKorpUiRuntimeCopies({
  repoRoot,
  rawRoot,
  scanRoots = KORP_UI_RUNTIME_COPY_SCAN_ROOTS,
}) {
  const rawPathsByHash = new Map()
  for (const file of listKorpUiFiles(rawRoot)) {
    const hash = createHash('sha256').update(readFileSync(file.absolutePath)).digest('hex')
    const paths = rawPathsByHash.get(hash) ?? []
    paths.push(file.path)
    rawPathsByHash.set(hash, paths)
  }

  const matches = []
  let filesScanned = 0
  for (const scanRoot of scanRoots) {
    const absoluteRoot = path.resolve(repoRoot, scanRoot)
    if (!existsSync(absoluteRoot)) continue
    resolveKorpUiRuntimeTarget(repoRoot, absoluteRoot)
    const candidates = statSync(absoluteRoot).isDirectory()
      ? listKorpUiRuntimeFiles(absoluteRoot, repoRoot)
      : [absoluteRoot]
    for (const filePath of candidates) {
      filesScanned += 1
      const hash = createHash('sha256').update(readFileSync(filePath)).digest('hex')
      const rawPaths = rawPathsByHash.get(hash)
      if (!rawPaths) continue
      matches.push({
        path: path.relative(repoRoot, filePath).replaceAll('\\', '/'),
        rawPaths: [...rawPaths].sort(compareText),
      })
    }
  }

  matches.sort((left, right) => compareText(left.path, right.path))
  if (matches.length > 0) {
    throw new KorpUiAssetValidationError(matches.map((match) => (
      `raw UI source file was copied into runtime source: ${match.path} `
        + `(matches ${match.rawPaths.join(', ')})`
    )))
  }
  return { filesScanned, matches }
}

function getReadiness(asset, pilotIds) {
  if (asset.production_status === 'reference') return 'reference-only'
  if (asset.role === 'nine-slice-piece') return 'derived-piece'
  if (pilotIds.has(asset.id)) return 'core-now'
  if (KORP_UI_FLAVOR_CATEGORY_PREFIXES.some((prefix) => asset.category.startsWith(prefix))) {
    return 'flavor-later'
  }
  return 'later-state'
}

function countValues(values) {
  const counts = new Map()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Object.fromEntries([...counts].sort(([left], [right]) => compareText(left, right)))
}

function createNineSliceInventory(assets) {
  const groups = new Map()
  for (const asset of assets.filter((item) => item.role === 'nine-slice-piece')) {
    const group = groups.get(asset.derived_from) ?? []
    group.push(asset.id)
    groups.set(asset.derived_from, group)
  }
  return [...groups]
    .sort(([left], [right]) => compareText(left, right))
    .map(([parentId, pieceIds]) => ({
      parentId,
      pieceCount: pieceIds.length,
      pieceIds: pieceIds.sort(),
    }))
}

function createAssetInventory(manifest, allowlist, metadataById) {
  const pilotIds = new Set(flattenKorpUiAllowlist(allowlist))
  return [...manifest.assets]
    .sort((left, right) => compareText(left.id, right.id))
    .map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      role: asset.role,
      productionStatus: asset.production_status,
      readiness: getReadiness(asset, pilotIds),
      pilotSelected: pilotIds.has(asset.id),
      intrinsicDimensions: [asset.width, asset.height],
      formats: metadataById.get(asset.id) ?? {},
      state: asset.state ?? null,
      semantic: asset.semantic ?? null,
      derivedFrom: asset.derived_from ?? null,
      sourceBoard: asset.source_board ?? null,
      sourceRect: asset.source_rect ?? null,
      contentRect: asset.content_rect ?? null,
      nineSlice: asset.nine_slice ?? null,
      textBaked: asset.text_baked,
      warnings: [],
    }))
}

export function createKorpUiInventory({
  manifest,
  allowlist,
  fileValidation,
  checksumAudit,
  supplemental,
  runtimeCopyScan,
  runtimeScan,
  warnings,
}) {
  const assets = createAssetInventory(manifest, allowlist, fileValidation.metadataById)
  const sourceFiles = fileValidation.sourceFiles
  const nineSliceFamilies = createNineSliceInventory(manifest.assets)
  const sourceBoardCounts = countValues(
    manifest.assets.filter((asset) => asset.source_board).map((asset) => asset.source_board),
  )
  const sourceBoardFiles = sourceFiles
    .map((file) => file.path)
    .filter((relativePath) => /^qa\/[^/]+\.(?:png|webp)$/i.test(relativePath))
  const nestedIconFiles = sourceFiles
    .map((file) => file.path)
    .filter((relativePath) => relativePath.startsWith('icons/'))
  const readinessCounts = countValues(assets.map((asset) => asset.readiness))

  return {
    schemaVersion: 1,
    generatedBy: 'scripts/validate-korp-ui-assets.mjs',
    source: {
      root: KORP_UI_RAW_ROOT,
      manifestVersion: manifest.version,
      snapshot: {
        totalFiles: sourceFiles.length,
        totalBytes: sourceFiles.reduce((sum, file) => sum + file.bytes, 0),
      },
    },
    counts: {
      semanticAssets: manifest.assets.length,
      productionAssets: manifest.assets.filter((asset) => asset.production_status === 'production').length,
      referenceOnlyAssets: manifest.assets.filter((asset) => asset.production_status === 'reference').length,
      nativePng: manifest.assets.length,
      nearestNeighborPng2x: manifest.assets.length,
      losslessWebp: manifest.assets.length,
      productionFormatFiles: manifest.assets.filter((asset) => asset.production_status === 'production').length * 3,
      referenceOnlyFormatFiles: manifest.assets.filter((asset) => asset.production_status === 'reference').length * 3,
      referenceAssetsWithBakedText: manifest.assets.filter((asset) => (
        asset.production_status === 'reference' && asset.text_baked
      )).length,
      categories: countValues(manifest.assets.map((asset) => asset.category)),
      roles: countValues(manifest.assets.map((asset) => asset.role)),
      readiness: readinessCounts,
    },
    metadata: {
      manifestFiles: ['manifest.csv', 'manifest.json'],
      schemaFiles: [],
      tokenFiles: ['tokens.json'],
      checksumFiles: ['SHA256SUMS.txt'],
      atlasMetadataFiles: ['atlases/atlas.json'],
      windowMetricFiles: ['docs/window-metrics.json'],
      qaReportFiles: ['qa/report.json'],
      localGalleryFiles: ['index.html'],
    },
    sourceBoards: {
      declaredBoards: sourceBoardCounts,
      includedBoardOrPreviewFiles: sourceBoardFiles,
    },
    nineSlice: {
      assetsWithCapInsets: manifest.assets.filter((asset) => asset.nine_slice).length,
      familyCount: nineSliceFamilies.length,
      pieceCount: manifest.assets.filter((asset) => asset.role === 'nine-slice-piece').length,
      families: nineSliceFamilies,
    },
    atlases: supplemental.atlases,
    windowFamilies: supplemental.windowFamilies,
    checksums: {
      entries: checksumAudit.entries,
      verifiedExistingFiles: checksumAudit.verified,
      stalePaths: checksumAudit.missingPaths,
      unlistedPaths: checksumAudit.unlistedPaths,
    },
    nestedIconOverlap: {
      includedFileCount: nestedIconFiles.length,
      includedFiles: nestedIconFiles,
      canonicalSource: 'design/icon-source/k0rp-icons-v2',
      policy: 'The separately integrated canonical icon source remains authoritative.',
    },
    runtimeBoundary: {
      allowlistPath: 'design/ui-runtime/k0rp-v3/runtime-allowlist.json',
      targetTask: allowlist.targetTask,
      selectedAssets: flattenKorpUiAllowlist(allowlist).length,
      rawAssetsCopied: runtimeCopyScan.matches.length,
      detectedRawImports: runtimeScan.matches.length,
    },
    blockingFindings: [],
    warnings: sortWarnings(warnings),
    assets,
  }
}

export function validateKorpUiPack({ rawRoot, repoRoot, manifest, allowlist }) {
  validateKorpUiManifest(manifest)
  const selectionIds = validateKorpUiAllowlist(allowlist, manifest)
  const fileValidation = validateKorpUiAssetFiles({ rawRoot, manifest })
  const checksumAudit = auditKorpUiChecksums({
    rawRoot,
    source: readFileSync(path.join(rawRoot, 'SHA256SUMS.txt'), 'utf8'),
  })
  const supplemental = validateKorpUiSupplementalMetadata({ rawRoot, manifest })
  const runtimeCopyScan = scanKorpUiRuntimeCopies({ repoRoot, rawRoot })
  const runtimeScan = scanKorpUiRuntimeImports({ repoRoot })

  const warnings = sortWarnings([
    ...fileValidation.warnings,
    ...checksumAudit.warnings,
    ...getSourceDocumentationWarnings(rawRoot),
  ])
  const inventory = createKorpUiInventory({
    manifest,
    allowlist,
    fileValidation,
    checksumAudit,
    supplemental,
    runtimeCopyScan,
    runtimeScan,
    warnings,
  })

  return {
    inventory,
    summary: {
      atlases: supplemental.atlases.length,
      atlasFrames: supplemental.atlases.reduce((sum, atlas) => sum + atlas.frameCount, 0),
      bytes: inventory.source.snapshot.totalBytes,
      files: inventory.source.snapshot.totalFiles,
      nineSliceFamilies: inventory.nineSlice.familyCount,
      nineSlicePieces: inventory.nineSlice.pieceCount,
      pilotAssets: selectionIds.length,
      productionAssets: inventory.counts.productionAssets,
      referenceAssets: inventory.counts.referenceOnlyAssets,
      semanticAssets: inventory.counts.semanticAssets,
      warnings: warnings.length,
      windowFamilies: supplemental.windowFamilies.length,
    },
    warnings,
  }
}

export function serializeKorpUiJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function createWarning(code, message, paths = []) {
  return {
    code,
    severity: 'warning',
    message,
    paths: [...paths].sort(compareText),
  }
}

function getSourceDocumentationWarnings(rawRoot) {
  const warnings = []
  const readmePath = path.join(rawRoot, 'README.md')
  const tokensPath = path.join(rawRoot, 'tokens.json')
  const readmeSource = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : ''
  const tokensSource = existsSync(tokensPath) ? readFileSync(tokensPath, 'utf8') : ''

  if (!existsSync(path.join(rawRoot, 'nine_slice')) && readmeSource.includes('nine_slice/')) {
    warnings.push(createWarning(
      'AUX_README_NINE_SLICE_LOCATION',
      'README.md names a top-level nine_slice directory; actual pieces are under assets/{native,2x,webp}/nine_slice',
      ['README.md'],
    ))
  }
  if (
    !existsSync(path.join(rawRoot, 'icons', 'k0rp_icons_v2'))
    && (readmeSource.includes('icons/k0rp_icons_v2') || tokensSource.includes('k0rp_icons_v2'))
  ) {
    warnings.push(createWarning(
      'AUX_SOURCE_DOC_NESTED_ICONS_ABSENT',
      'README.md and tokens.json state that icons/k0rp_icons_v2 is included; the canonical icon pack is maintained separately',
      ['README.md', 'tokens.json'],
    ))
  }
  return warnings
}

function sortWarnings(warnings) {
  const unique = new Map()
  for (const warning of warnings) {
    const key = `${warning.code}:${warning.message}:${warning.paths.join('|')}`
    unique.set(key, warning)
  }
  return [...unique.values()].sort((left, right) => (
    compareText(left.code, right.code) || compareText(left.message, right.message)
  ))
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
