import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import {
  KORP_UI_INVENTORY_PATH,
  KORP_UI_RUNTIME_ALLOWLIST_PATH,
  KORP_UI_RUNTIME_ASSET_ROOT,
} from '../korp-ui-assets-contract.mjs'

export const KORP_UI_RUNTIME_CATALOG_PATH = 'src/ui/korpUiAssetCatalog.js'
export const KORP_UI_RUNTIME_FORMAT = 'nearestNeighborPng2x'
export const KORP_UI_RUNTIME_SCALE = 2

export const KORP_UI_REQUIRED_RUNTIME_GROUPS = Object.freeze([
  'audit-window-family',
  'forms-folder-window-family',
  'standard-titlebar-materials',
  'pilot-window-controls',
  'audit-basic-controls',
  'forms-folder-rows',
])

const FAMILY_BY_GROUP = Object.freeze({
  'audit-window-family': 'audit',
  'forms-folder-window-family': 'folder',
  'standard-titlebar-materials': 'standard-window',
  'pilot-window-controls': 'standard-window',
  'audit-basic-controls': 'audit',
  'forms-folder-rows': 'folder',
})
const REQUIRED_WINDOW_FAMILIES = Object.freeze(['audit', 'folder'])
const UNSAFE_RUNTIME_ROLES = new Set([
  'document-template',
  'file-icon',
  'folder-object',
  'system-icon',
  'window-composite',
  'window-reference',
])
const SAFE_ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const compareText = (left, right) => (left === right ? 0 : left < right ? -1 : 1)

export class KorpUiRuntimeBuildError extends Error {
  constructor(errors) {
    const stableErrors = [...new Set(errors)].sort(compareText)
    super(`K0rp UI runtime build failed:\n- ${stableErrors.join('\n- ')}`)
    this.name = 'KorpUiRuntimeBuildError'
    this.errors = stableErrors
  }
}

export function createKorpUiRuntimePlan({ inventory, allowlist }) {
  const errors = []
  if (!inventory || typeof inventory !== 'object' || !Array.isArray(inventory.assets)) {
    throw new KorpUiRuntimeBuildError(['normalized inventory must contain an assets array'])
  }
  if (!allowlist || typeof allowlist !== 'object' || !Array.isArray(allowlist.groups)) {
    throw new KorpUiRuntimeBuildError(['runtime allowlist must contain a groups array'])
  }
  if (allowlist.schemaVersion !== 1) errors.push('runtime allowlist schemaVersion must be 1')
  if (allowlist.targetTask !== '022A(2.2)') errors.push('runtime allowlist targetTask must be 022A(2.2)')
  if (allowlist.copyAssets !== true) errors.push('runtime allowlist copyAssets must be true')
  validateRelativePath(allowlist.sourceRoot, 'runtime allowlist sourceRoot', errors)

  const inventoryById = new Map()
  for (const asset of inventory.assets) {
    if (!asset || typeof asset !== 'object' || typeof asset.id !== 'string') continue
    if (inventoryById.has(asset.id)) errors.push(`duplicate normalized inventory asset id: ${asset.id}`)
    inventoryById.set(asset.id, asset)
  }

  const requiredGroups = new Set(KORP_UI_REQUIRED_RUNTIME_GROUPS)
  const seenGroupIds = new Set()
  const seenAssetIds = new Set()
  const entries = []
  const groups = []

  for (const [groupIndex, group] of allowlist.groups.entries()) {
    const label = `runtime allowlist groups[${groupIndex}]`
    if (!group || typeof group !== 'object') {
      errors.push(`${label} must be an object`)
      continue
    }
    if (typeof group.id !== 'string' || !SAFE_ID_PATTERN.test(group.id)) {
      errors.push(`${label}.id is unsafe or invalid: ${String(group.id)}`)
      continue
    }
    if (seenGroupIds.has(group.id)) errors.push(`duplicate runtime group id: ${group.id}`)
    seenGroupIds.add(group.id)
    if (!requiredGroups.has(group.id)) errors.push(`unexpected runtime group: ${group.id}`)
    if (typeof group.purpose !== 'string' || group.purpose.length === 0) {
      errors.push(`${label}.purpose is required`)
    }
    if (!Array.isArray(group.assetIds) || group.assetIds.length === 0) {
      errors.push(`${label}.assetIds must be a non-empty array`)
      continue
    }

    const groupAssetIds = []
    for (const id of group.assetIds) {
      if (typeof id !== 'string' || !SAFE_ID_PATTERN.test(id)) {
        errors.push(`unsafe runtime semantic ID: ${String(id)}`)
        continue
      }
      if (seenAssetIds.has(id)) errors.push(`duplicate runtime semantic ID: ${id}`)
      seenAssetIds.add(id)
      groupAssetIds.push(id)

      const asset = inventoryById.get(id)
      if (!asset) {
        errors.push(`runtime allowlist references unknown inventory asset: ${id}`)
        continue
      }
      validateRuntimeAsset(asset, errors)
      const selectedFormat = asset.formats?.[KORP_UI_RUNTIME_FORMAT]
      if (!selectedFormat || typeof selectedFormat !== 'object') continue

      entries.push({
        id,
        targetName: `${id}.png`,
        sourceRelativePath: selectedFormat.path,
        sourceBytes: selectedFormat.bytes,
        sourceSha256: selectedFormat.sha256,
        intrinsicWidth: selectedFormat.width,
        intrinsicHeight: selectedFormat.height,
        nativeWidth: asset.intrinsicDimensions?.[0],
        nativeHeight: asset.intrinsicDimensions?.[1],
        scale: KORP_UI_RUNTIME_SCALE,
        groupId: group.id,
        family: FAMILY_BY_GROUP[group.id] ?? null,
        role: asset.role,
        state: asset.state ?? null,
        semantic: asset.semantic ?? null,
        derivedFrom: asset.derivedFrom ?? null,
        nineSlice: scaleInsets(asset.nineSlice),
        contentRect: scaleRect(asset.contentRect),
      })
    }

    groups.push({
      id: group.id,
      purpose: group.purpose,
      family: FAMILY_BY_GROUP[group.id] ?? null,
      assetIds: groupAssetIds.sort(compareText),
    })
  }

  for (const groupId of KORP_UI_REQUIRED_RUNTIME_GROUPS) {
    if (!seenGroupIds.has(groupId)) errors.push(`missing required runtime group: ${groupId}`)
  }

  const windowFamilies = createWindowFamilyPlan(inventory, inventoryById, errors)
  if (errors.length > 0) throw new KorpUiRuntimeBuildError(errors)

  return Object.freeze({
    sourceRoot: allowlist.sourceRoot,
    entries: Object.freeze(entries.sort((left, right) => compareText(left.id, right.id))),
    groups: Object.freeze(groups.sort((left, right) => compareText(left.id, right.id))),
    windowFamilies: Object.freeze(windowFamilies),
  })
}

function validateRuntimeAsset(asset, errors) {
  const label = `runtime asset ${asset.id}`
  if (asset.productionStatus !== 'production') errors.push(`${label} is not production`)
  if (asset.textBaked === true) errors.push(`${label} contains baked text`)
  if (UNSAFE_RUNTIME_ROLES.has(asset.role) || String(asset.category).includes('/reference')) {
    errors.push(`${label} has unsafe runtime role/category: ${String(asset.role)} / ${String(asset.category)}`)
  }

  const nativeDimensions = asset.intrinsicDimensions
  if (!isDimensions(nativeDimensions)) errors.push(`${label} has invalid native dimensions`)
  const format = asset.formats?.[KORP_UI_RUNTIME_FORMAT]
  if (!format || typeof format !== 'object') {
    errors.push(`${label} is missing ${KORP_UI_RUNTIME_FORMAT}`)
    return
  }
  validateRelativePath(format.path, `${label} @2x path`, errors)
  if (typeof format.path === 'string' && (!format.path.startsWith('assets/2x/') || !format.path.endsWith('@2x.png'))) {
    errors.push(`${label} @2x path must be an assets/2x/*@2x.png file`)
  }
  if (!Number.isInteger(format.bytes) || format.bytes <= 0) errors.push(`${label} has invalid byte count`)
  if (typeof format.sha256 !== 'string' || !SHA256_PATTERN.test(format.sha256)) errors.push(`${label} has invalid SHA-256`)
  if (!Number.isInteger(format.width) || !Number.isInteger(format.height) || format.width <= 0 || format.height <= 0) {
    errors.push(`${label} has invalid @2x dimensions`)
  } else if (isDimensions(nativeDimensions) && (
    format.width !== nativeDimensions[0] * KORP_UI_RUNTIME_SCALE
    || format.height !== nativeDimensions[1] * KORP_UI_RUNTIME_SCALE
  )) {
    errors.push(`${label} @2x dimensions do not equal the declared native dimensions times two`)
  }
}

function createWindowFamilyPlan(inventory, inventoryById, errors) {
  if (!Array.isArray(inventory.windowFamilies)) {
    errors.push('normalized inventory must contain windowFamilies')
    return []
  }
  const inventoryFamilies = new Map(inventory.windowFamilies.map((family) => [family.id, family]))
  return REQUIRED_WINDOW_FAMILIES.map((id) => {
    const family = inventoryFamilies.get(id)
    if (!family) {
      errors.push(`normalized inventory is missing window family: ${id}`)
      return null
    }
    if (!isDimensions(family.outerSize) || !isRect(family.contentRect)) {
      errors.push(`window family ${id} has invalid geometry`)
    }
    const frame = inventoryById.get(family.frameId)
    const frameFormat = frame?.formats?.[KORP_UI_RUNTIME_FORMAT]
    const outerWidth = family.outerSize?.[0] * KORP_UI_RUNTIME_SCALE
    const outerHeight = family.outerSize?.[1] * KORP_UI_RUNTIME_SCALE
    if (frameFormat && (frameFormat.width !== outerWidth || frameFormat.height !== outerHeight)) {
      errors.push(`window family ${id} geometry disagrees with ${family.frameId}`)
    }
    return {
      id,
      outerWidth,
      outerHeight,
      contentRect: scaleRect(family.contentRect),
      frameId: family.frameId,
      contentId: family.contentId,
    }
  }).filter(Boolean).sort((left, right) => compareText(left.id, right.id))
}

export function createKorpUiRuntimeCatalogSource(plan) {
  const runtimeUrls = plan.entries.map((entry) => (
    `  ${JSON.stringify(entry.id)}: new URL(${JSON.stringify(`../assets/ui/korp-v3/${entry.targetName}`)}, import.meta.url).href,`
  )).join('\n')
  const entryLines = plan.entries.map((entry) => [
    '  Object.freeze({',
    `    id: ${JSON.stringify(entry.id)},`,
    `    runtimeUrl: runtimeUrls[${JSON.stringify(entry.id)}],`,
    `    intrinsicWidth: ${entry.intrinsicWidth},`,
    `    intrinsicHeight: ${entry.intrinsicHeight},`,
    `    nativeWidth: ${entry.nativeWidth},`,
    `    nativeHeight: ${entry.nativeHeight},`,
    `    scale: ${entry.scale},`,
    `    groupId: ${JSON.stringify(entry.groupId)},`,
    `    family: ${JSON.stringify(entry.family)},`,
    `    role: ${JSON.stringify(entry.role)},`,
    `    state: ${JSON.stringify(entry.state)},`,
    `    semantic: ${JSON.stringify(entry.semantic)},`,
    `    derivedFrom: ${JSON.stringify(entry.derivedFrom)},`,
    `    nineSlice: ${serializeFrozenObject(entry.nineSlice)},`,
    `    contentRect: ${serializeFrozenObject(entry.contentRect)},`,
    '  }),',
  ].join('\n')).join('\n')
  const groupLines = plan.groups.map((group) => [
    '  Object.freeze({',
    `    id: ${JSON.stringify(group.id)},`,
    `    purpose: ${JSON.stringify(group.purpose)},`,
    `    family: ${JSON.stringify(group.family)},`,
    `    assetIds: Object.freeze(${JSON.stringify(group.assetIds)}),`,
    '  }),',
  ].join('\n')).join('\n')
  const familyLines = plan.windowFamilies.map((family) => [
    `  ${JSON.stringify(family.id)}: Object.freeze({`,
    `    id: ${JSON.stringify(family.id)},`,
    `    outerWidth: ${family.outerWidth},`,
    `    outerHeight: ${family.outerHeight},`,
    `    contentRect: ${serializeFrozenObject(family.contentRect)},`,
    `    frameId: ${JSON.stringify(family.frameId)},`,
    `    contentId: ${JSON.stringify(family.contentId)},`,
    '  }),',
  ].join('\n')).join('\n')

  return `/* This file is generated by scripts/build-korp-ui-runtime.mjs. */
const runtimeUrls = Object.freeze({
${runtimeUrls}
})

export const KORP_UI_ASSET_CATALOG = Object.freeze([
${entryLines}
])

export const KORP_UI_RUNTIME_ASSET_IDS = Object.freeze(
  KORP_UI_ASSET_CATALOG.map(({ id }) => id),
)

export const KORP_UI_RUNTIME_GROUPS = Object.freeze([
${groupLines}
])

export const KORP_UI_WINDOW_FAMILIES = Object.freeze({
${familyLines}
})

const assetById = new Map(KORP_UI_ASSET_CATALOG.map((asset) => [asset.id, asset]))

export function resolveKorpUiAsset(id) {
  return typeof id === 'string' ? assetById.get(id) ?? null : null
}

export function resolveKorpUiWindowFamily(id) {
  return typeof id === 'string' ? KORP_UI_WINDOW_FAMILIES[id] ?? null : null
}
`
}

export function buildKorpUiRuntime({ repoRoot, checkOnly = false }) {
  const inventory = parseJsonFile(resolvePathInside(repoRoot, KORP_UI_INVENTORY_PATH, 'inventory'))
  const allowlist = parseJsonFile(resolvePathInside(repoRoot, KORP_UI_RUNTIME_ALLOWLIST_PATH, 'allowlist'))
  const plan = createKorpUiRuntimePlan({ inventory, allowlist })
  const sourceCopies = validateKorpUiRuntimeSources({ repoRoot, plan })
  const catalogSource = createKorpUiRuntimeCatalogSource(plan)

  if (checkOnly) {
    checkKorpUiRuntimeOutput({ repoRoot, plan, sourceCopies, catalogSource })
  } else {
    writeKorpUiRuntimeOutput({ repoRoot, plan, sourceCopies, catalogSource })
    checkKorpUiRuntimeOutput({ repoRoot, plan, sourceCopies, catalogSource })
  }

  return {
    assets: plan.entries.length,
    bytes: plan.entries.reduce((total, entry) => total + entry.sourceBytes, 0),
    groups: plan.groups.length,
    windowFamilies: plan.windowFamilies.length,
  }
}

export function validateKorpUiRuntimeSources({ repoRoot, plan }) {
  const errors = []
  const rawRoot = resolvePathInside(repoRoot, plan.sourceRoot, 'raw UI source root')
  const sourceCopies = []
  for (const entry of plan.entries) {
    const sourcePath = resolvePathInside(rawRoot, entry.sourceRelativePath, `${entry.id} @2x source`)
    if (!existsSync(sourcePath)) {
      errors.push(`missing @2x source for ${entry.id}: ${entry.sourceRelativePath}`)
      continue
    }
    const sourceStat = lstatSync(sourcePath)
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
      errors.push(`@2x source for ${entry.id} must be a regular file`)
      continue
    }
    const bytes = readFileSync(sourcePath)
    const dimensions = readPngDimensions(bytes, entry.sourceRelativePath, errors)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    if (bytes.length !== entry.sourceBytes) errors.push(`@2x source byte count drift for ${entry.id}`)
    if (sha256 !== entry.sourceSha256) errors.push(`@2x source SHA-256 drift for ${entry.id}`)
    if (dimensions && (
      dimensions.width !== entry.intrinsicWidth
      || dimensions.height !== entry.intrinsicHeight
    )) errors.push(`@2x source dimensions drift for ${entry.id}`)
    sourceCopies.push({ entry, sourcePath, bytes })
  }
  if (errors.length > 0) throw new KorpUiRuntimeBuildError(errors)
  return sourceCopies
}

export function checkKorpUiRuntimeOutput({ repoRoot, plan, sourceCopies, catalogSource }) {
  const errors = []
  const runtimeRoot = resolvePathInside(repoRoot, KORP_UI_RUNTIME_ASSET_ROOT, 'runtime asset root')
  const catalogPath = resolvePathInside(repoRoot, KORP_UI_RUNTIME_CATALOG_PATH, 'runtime catalog')
  const expectedNames = plan.entries.map(({ targetName }) => targetName).sort(compareText)

  if (!existsSync(runtimeRoot)) {
    errors.push(`runtime asset root is missing: ${KORP_UI_RUNTIME_ASSET_ROOT}`)
  } else {
    const rootStat = lstatSync(runtimeRoot)
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
      errors.push(`runtime asset root must be a regular directory: ${KORP_UI_RUNTIME_ASSET_ROOT}`)
    } else {
      const runtimeEntries = readdirSync(runtimeRoot, { withFileTypes: true })
      const actualNames = runtimeEntries.map(({ name }) => name).sort(compareText)
      if (
        runtimeEntries.some((entry) => !entry.isFile() || entry.isSymbolicLink())
        || JSON.stringify(actualNames) !== JSON.stringify(expectedNames)
      ) errors.push('runtime asset root must contain exactly the generated @2x allowlist')

      const regularNames = new Set(runtimeEntries
        .filter((entry) => entry.isFile() && !entry.isSymbolicLink())
        .map(({ name }) => name))
      for (const copy of sourceCopies) {
        const targetPath = path.join(runtimeRoot, copy.entry.targetName)
        if (!regularNames.has(copy.entry.targetName)) continue
        const targetBytes = readFileSync(targetPath)
        if (!targetBytes.equals(copy.bytes)) errors.push(`runtime asset differs from @2x source: ${copy.entry.id}`)
        const dimensions = readPngDimensions(targetBytes, copy.entry.targetName, errors)
        if (dimensions && (
          dimensions.width !== copy.entry.intrinsicWidth
          || dimensions.height !== copy.entry.intrinsicHeight
        )) errors.push(`runtime asset dimensions drift for ${copy.entry.id}`)
      }
    }
  }

  if (!existsSync(catalogPath)) {
    errors.push(`runtime catalog is missing: ${KORP_UI_RUNTIME_CATALOG_PATH}`)
  } else {
    const catalogStat = lstatSync(catalogPath)
    if (!catalogStat.isFile() || catalogStat.isSymbolicLink()) {
      errors.push(`runtime catalog must be a regular file: ${KORP_UI_RUNTIME_CATALOG_PATH}`)
    } else if (readFileSync(catalogPath, 'utf8') !== catalogSource) {
      errors.push('runtime catalog has generated drift; run npm run build:korp-ui-runtime')
    }
  }
  if (errors.length > 0) throw new KorpUiRuntimeBuildError(errors)
}

export function writeKorpUiRuntimeOutput({ repoRoot, plan, sourceCopies, catalogSource }) {
  const runtimeRoot = resolvePathInside(repoRoot, KORP_UI_RUNTIME_ASSET_ROOT, 'runtime asset root')
  const catalogPath = resolvePathInside(repoRoot, KORP_UI_RUNTIME_CATALOG_PATH, 'runtime catalog')
  if (existsSync(runtimeRoot) && (!lstatSync(runtimeRoot).isDirectory() || lstatSync(runtimeRoot).isSymbolicLink())) {
    throw new KorpUiRuntimeBuildError([`runtime asset root must be a regular directory: ${KORP_UI_RUNTIME_ASSET_ROOT}`])
  }
  mkdirSync(runtimeRoot, { recursive: true })
  const expectedNames = new Set(plan.entries.map(({ targetName }) => targetName))
  for (const entry of readdirSync(runtimeRoot, { withFileTypes: true })) {
    const entryPath = path.join(runtimeRoot, entry.name)
    if (expectedNames.has(entry.name)) {
      if (!entry.isFile() || entry.isSymbolicLink()) {
        throw new KorpUiRuntimeBuildError([
          `runtime asset target must be a regular file before generation: ${entry.name}`,
        ])
      }
      // Unlink first so copyFileSync cannot overwrite through an existing hard link.
      rmSync(entryPath, { force: true })
    } else {
      rmSync(entryPath, { recursive: true, force: true })
    }
  }
  for (const copy of sourceCopies) {
    copyFileSync(copy.sourcePath, path.join(runtimeRoot, copy.entry.targetName))
  }
  mkdirSync(path.dirname(catalogPath), { recursive: true })
  if (existsSync(catalogPath)) {
    const catalogStat = lstatSync(catalogPath)
    if (!catalogStat.isFile() || catalogStat.isSymbolicLink()) {
      throw new KorpUiRuntimeBuildError([
        `runtime catalog target must be a regular file before generation: ${KORP_UI_RUNTIME_CATALOG_PATH}`,
      ])
    }
    rmSync(catalogPath, { force: true })
  }
  writeFileSync(catalogPath, catalogSource, 'utf8')
}

function parseJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new KorpUiRuntimeBuildError([`${path.basename(filePath)} is malformed or unreadable: ${error.message}`])
  }
}

function resolvePathInside(root, relativePath, label) {
  const errors = []
  validateRelativePath(relativePath, label, errors)
  if (errors.length > 0) throw new KorpUiRuntimeBuildError(errors)
  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(resolvedRoot, ...relativePath.split('/'))
  const relative = path.relative(resolvedRoot, resolvedPath)
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new KorpUiRuntimeBuildError([`${label} escapes its allowed root: ${relativePath}`])
  }
  if (existsSync(resolvedRoot) && existsSync(resolvedPath)) {
    const realRoot = realpathSync(resolvedRoot)
    const realPath = realpathSync(resolvedPath)
    const realRelative = path.relative(realRoot, realPath)
    if (realRelative === '..' || realRelative.startsWith(`..${path.sep}`) || path.isAbsolute(realRelative)) {
      throw new KorpUiRuntimeBuildError([`${label} resolves outside its allowed root`])
    }
  }
  return resolvedPath
}

function validateRelativePath(value, label, errors) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.includes('\0')
    || value.includes('\\')
    || path.posix.isAbsolute(value)
    || path.win32.isAbsolute(value)
    || value.split('/').some((part) => part === '' || part === '.' || part === '..')
    || path.posix.normalize(value) !== value
  ) errors.push(`${label} must be a canonical relative path: ${String(value)}`)
}

function readPngDimensions(buffer, label, errors) {
  if (
    buffer.length < 26
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    || buffer.toString('ascii', 12, 16) !== 'IHDR'
  ) {
    errors.push(`invalid PNG header: ${label}`)
    return null
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function isDimensions(value) {
  return Array.isArray(value)
    && value.length === 2
    && value.every((dimension) => Number.isInteger(dimension) && dimension > 0)
}

function isRect(value) {
  return Array.isArray(value)
    && value.length === 4
    && value.every((dimension) => Number.isInteger(dimension) && dimension >= 0)
    && value[2] > 0
    && value[3] > 0
}

function scaleRect(value) {
  if (!isRect(value)) return null
  return {
    x: value[0] * KORP_UI_RUNTIME_SCALE,
    y: value[1] * KORP_UI_RUNTIME_SCALE,
    width: value[2] * KORP_UI_RUNTIME_SCALE,
    height: value[3] * KORP_UI_RUNTIME_SCALE,
  }
}

function scaleInsets(value) {
  if (!value || typeof value !== 'object') return null
  return {
    left: value.left * KORP_UI_RUNTIME_SCALE,
    top: value.top * KORP_UI_RUNTIME_SCALE,
    right: value.right * KORP_UI_RUNTIME_SCALE,
    bottom: value.bottom * KORP_UI_RUNTIME_SCALE,
  }
}

function serializeFrozenObject(value) {
  return value === null ? 'null' : `Object.freeze(${JSON.stringify(value)})`
}
