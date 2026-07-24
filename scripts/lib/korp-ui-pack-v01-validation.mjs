import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import path from 'node:path'
import {
  KORP_UI_V01_ALLOWLIST_PATH,
  KORP_UI_V01_ASSET_ROOT,
  KORP_UI_V01_CATALOG_PATH,
  KORP_UI_V01_REQUIRED_SOURCE_FILES,
  KORP_UI_V01_RUNTIME_ROOT,
  KORP_UI_V01_RUNTIME_SCAN_ROOTS,
  KORP_UI_V01_SOURCE_ROOT,
  KORP_UI_V01_TEXTURE_MODES,
  KORP_UI_V01_WINDOW_CONTRACT_PATH,
  KORP_UI_V01_WINDOW_FAMILIES,
} from '../korp-ui-pack-v01-contract.mjs'
import {
  KorpUiAssetValidationError,
  listKorpUiFiles,
  readKorpUiPngDimensions,
  resolveKorpUiPathInside,
  serializeKorpUiJson,
} from './korp-ui-asset-validation.mjs'

const ASSET_ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const GROUP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'])
const CONTROL_STATES = Object.freeze(['normal', 'hover', 'pressed', 'disabled'])
const PILOT_CONTROL_IDS = Object.freeze(['pin', 'unpin', 'minimize', 'close'])
const WINDOW_FAMILY_SURFACES = Object.freeze({
  module: 'dark-panel',
  audit: 'paper-light-ruled',
  folder: 'manila-folder',
})
const EXPECTED_PILOT_IDS = Object.freeze([
  'window.module.compact.active',
  'window.module.compact.inactive',
  'dark-panel',
  ...PILOT_CONTROL_IDS.flatMap((control) => (
    CONTROL_STATES.map((state) => `control.${control}.${state}`)
  )),
])
const RUNTIME_METADATA_FILES = new Set([
  'README.md',
  path.posix.basename(KORP_UI_V01_CATALOG_PATH),
  path.posix.basename(KORP_UI_V01_WINDOW_CONTRACT_PATH),
  path.posix.basename(KORP_UI_V01_ALLOWLIST_PATH),
])
const compareText = (left, right) => (left === right ? 0 : left < right ? -1 : 1)
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0
const hashBuffer = (value) => createHash('sha256').update(value).digest('hex')

function stableUnique(values) {
  return [...new Set(values)].sort(compareText)
}

function throwIfErrors(errors) {
  if (errors.length > 0) throw new KorpUiAssetValidationError(stableUnique(errors))
}

function collectError(error, errors) {
  if (Array.isArray(error?.errors)) errors.push(...error.errors)
  else errors.push(error instanceof Error ? error.message : String(error))
}

function normalizeEmpty(value) {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function parseKorpUiV01Insets(value, label = 'nine_slice') {
  if (typeof value !== 'string') {
    throw new KorpUiAssetValidationError([`${label} must be a comma-delimited inset string`])
  }
  const parts = value.split(',').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => !isNonNegativeInteger(part))) {
    throw new KorpUiAssetValidationError([`${label} must contain four non-negative integers`])
  }
  return { left: parts[0], top: parts[1], right: parts[2], bottom: parts[3] }
}

function validateInsets(insets, label, errors, dimensions = null) {
  if (!insets || typeof insets !== 'object' || Array.isArray(insets)) {
    errors.push(`${label} must be an inset object`)
    return
  }
  const expectedKeys = ['bottom', 'left', 'right', 'top']
  if (
    JSON.stringify(Object.keys(insets).sort()) !== JSON.stringify(expectedKeys)
    || expectedKeys.some((key) => !isNonNegativeInteger(insets[key]))
  ) {
    errors.push(`${label} must contain only non-negative integer left/top/right/bottom values`)
    return
  }
  if (
    dimensions
    && (
      insets.left + insets.right >= dimensions.width
      || insets.top + insets.bottom >= dimensions.height
    )
  ) {
    errors.push(`${label} leaves no positive center inside ${dimensions.width}x${dimensions.height}`)
  }
}

export function parseKorpUiV01Csv(source, label = 'manifest.csv') {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (quoted) throw new KorpUiAssetValidationError([`${label} has an unterminated quoted field`])
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ''))
    rows.push(row)
  }
  if (rows.length < 2) throw new KorpUiAssetValidationError([`${label} must contain a header and assets`])
  const header = [...rows[0]]
  header[0] = header[0].replace(/^\uFEFF/, '')
  if (new Set(header).size !== header.length) {
    throw new KorpUiAssetValidationError([`${label} contains duplicate column names`])
  }
  return rows.slice(1).filter((values) => values.some(Boolean)).map((values, index) => {
    if (values.length !== header.length) {
      throw new KorpUiAssetValidationError([
        `${label} row ${index + 2} has ${values.length} fields; expected ${header.length}`,
      ])
    }
    return Object.fromEntries(header.map((key, column) => [key, values[column]]))
  })
}

function findSymlinks(root) {
  const found = []
  if (!existsSync(root)) return found
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name)
      const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/')
      if (entry.isSymbolicLink() || lstatSync(absolutePath).isSymbolicLink()) found.push(relativePath)
      else if (entry.isDirectory()) visit(absolutePath)
    }
  }
  visit(root)
  return found.sort(compareText)
}

function validateRequiredSourceFiles(rawRoot, errors) {
  for (const relativePath of KORP_UI_V01_REQUIRED_SOURCE_FILES) {
    try {
      const absolutePath = resolveKorpUiPathInside(rawRoot, relativePath, `required source file ${relativePath}`)
      if (!existsSync(absolutePath)) errors.push(`required source file is missing: ${relativePath}`)
    } catch (error) {
      collectError(error, errors)
    }
  }
  for (const relativePath of findSymlinks(rawRoot)) errors.push(`raw source contains a symlink: ${relativePath}`)
}

function validateManifestShape(manifest, errors) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push('manifest root must be an object')
    return []
  }
  if (manifest.name !== 'K0rp_OS UI Asset Pack v0.1') {
    errors.push('manifest name must identify K0rp_OS UI Asset Pack v0.1')
  }
  if (!Array.isArray(manifest.assets)) {
    errors.push('manifest assets must be an array')
    return []
  }
  const ids = new Set()
  const paths = new Map()
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
    }
    if (typeof asset.path !== 'string') {
      errors.push(`${prefix}.path must be a string`)
    } else {
      try {
        resolveKorpUiPathInside('.', asset.path, `${prefix}.path`)
      } catch (error) {
        collectError(error, errors)
      }
      if (!asset.path.startsWith('assets/') || !asset.path.endsWith('.png')) {
        errors.push(`${prefix}.path must match assets/*.png`)
      }
      const collisionKey = asset.path.toLowerCase()
      if (paths.has(collisionKey)) {
        errors.push(`case-insensitive duplicate asset path: ${asset.path} conflicts with ${paths.get(collisionKey)}`)
      } else {
        paths.set(collisionKey, asset.path)
      }
    }
    if (typeof asset.category !== 'string' || asset.category.length === 0) {
      errors.push(`${prefix}.category is required`)
    }
    if (!isPositiveInteger(asset.width) || !isPositiveInteger(asset.height)) {
      errors.push(`${prefix} dimensions must be positive integers`)
    }
    if (typeof asset.states !== 'string') errors.push(`${prefix}.states must be a string`)
    if (typeof asset.nine_slice !== 'string') errors.push(`${prefix}.nine_slice must be a string`)
    if (asset.nine_slice) {
      try {
        const insets = parseKorpUiV01Insets(asset.nine_slice, `${prefix}.nine_slice`)
        validateInsets(insets, `${prefix}.nine_slice`, errors, asset)
      } catch (error) {
        collectError(error, errors)
      }
    }
  }
  return manifest.assets
}

function validateCsvParity(manifestAssets, csvSource, errors) {
  let rows
  try {
    rows = parseKorpUiV01Csv(csvSource)
  } catch (error) {
    collectError(error, errors)
    return
  }
  const manifestById = new Map(manifestAssets.map((asset) => [asset?.id, asset]))
  const csvIds = new Set()
  for (const [index, row] of rows.entries()) {
    if (csvIds.has(row.id)) errors.push(`manifest.csv duplicate semantic asset id: ${row.id}`)
    csvIds.add(row.id)
    const asset = manifestById.get(row.id)
    if (!asset) {
      errors.push(`manifest.csv references unknown asset id: ${row.id}`)
      continue
    }
    for (const field of ['path', 'category', 'states', 'nine_slice', 'accent', 'usage', 'source_docs']) {
      if (row[field] !== String(asset[field] ?? '')) {
        errors.push(`manifest.csv row ${index + 2} ${field} differs for ${row.id}`)
      }
    }
    if (Number(row.width) !== asset.width || Number(row.height) !== asset.height) {
      errors.push(`manifest.csv dimensions differ for ${row.id}`)
    }
  }
  for (const asset of manifestAssets) {
    if (asset?.id && !csvIds.has(asset.id)) errors.push(`manifest.csv is missing asset id: ${asset.id}`)
  }
}

function validateSourceAssetFiles(rawRoot, manifestAssets, errors) {
  const declaredPaths = new Set()
  for (const asset of manifestAssets) {
    if (!asset || typeof asset.path !== 'string') continue
    declaredPaths.add(asset.path)
    let absolutePath
    try {
      absolutePath = resolveKorpUiPathInside(rawRoot, asset.path, `asset ${String(asset.id)} path`)
    } catch (error) {
      collectError(error, errors)
      continue
    }
    if (!existsSync(absolutePath)) {
      errors.push(`manifest asset is missing: ${asset.path}`)
      continue
    }
    try {
      const dimensions = readKorpUiPngDimensions(absolutePath)
      if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
        errors.push(
          `${asset.id} is ${dimensions.width}x${dimensions.height}; `
            + `manifest declares ${asset.width}x${asset.height}`,
        )
      }
    } catch (error) {
      collectError(error, errors)
    }
  }
  const assetRoot = path.join(rawRoot, 'assets')
  const sourceFiles = listKorpUiFiles(assetRoot)
  const sourcePaths = new Set(sourceFiles.map((file) => `assets/${file.path}`))
  for (const file of sourceFiles) {
    const manifestPath = `assets/${file.path}`
    if (!declaredPaths.has(manifestPath)) {
      errors.push(`undeclared source asset file: ${manifestPath}`)
    }
  }
  for (const declaredPath of declaredPaths) {
    if (!sourcePaths.has(declaredPath)) {
      errors.push(`declared source asset file is absent: ${declaredPath}`)
    }
  }
}

function validateNineSliceTokens(manifestAssets, tokens, errors) {
  if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) {
    errors.push('tokens/nine-slice.json root must be an object')
    return
  }
  const sliceAssets = manifestAssets.filter((asset) => (
    asset?.category === 'window-nine-slice' || asset?.category === 'os-bar-nine-slice'
  ))
  const assetByPath = new Map(sliceAssets.map((asset) => [asset.path, asset]))
  const tokenPaths = new Set()
  for (const [tokenId, token] of Object.entries(tokens)) {
    if (!token || typeof token !== 'object' || Array.isArray(token)) {
      errors.push(`nine-slice token ${tokenId} must be an object`)
      continue
    }
    if (typeof token.path !== 'string') {
      errors.push(`nine-slice token ${tokenId}.path must be a string`)
      continue
    }
    if (tokenPaths.has(token.path)) errors.push(`duplicate nine-slice token path: ${token.path}`)
    tokenPaths.add(token.path)
    const asset = assetByPath.get(token.path)
    if (!asset) {
      errors.push(`nine-slice token ${tokenId} references unknown path: ${token.path}`)
      continue
    }
    validateInsets(token.margins, `nine-slice token ${tokenId}.margins`, errors, asset)
    try {
      const manifestInsets = parseKorpUiV01Insets(asset.nine_slice, `${asset.id}.nine_slice`)
      if (JSON.stringify(token.margins) !== JSON.stringify(manifestInsets)) {
        errors.push(`nine-slice token margins differ from manifest for ${asset.id}`)
      }
    } catch (error) {
      collectError(error, errors)
    }
  }
  for (const asset of sliceAssets) {
    if (!tokenPaths.has(asset.path)) errors.push(`nine-slice tokens are missing asset: ${asset.id}`)
  }
}

function validateSemanticFamilies(manifestAssets, errors) {
  const byId = new Map(manifestAssets.map((asset) => [asset?.id, asset]))
  const allFamilies = manifestAssets
    .filter((asset) => /^window\.[a-z0-9-]+\.nine-slice$/.test(asset?.id ?? ''))
    .map((asset) => asset.id.split('.')[1])
  for (const family of stableUnique(allFamilies)) {
    for (const id of [
      `window.${family}.nine-slice`,
      `window.${family}.active`,
      `window.${family}.inactive`,
      `window.header.${family}.active`,
      `window.header.${family}.inactive`,
    ]) {
      if (!byId.has(id)) errors.push(`window family ${family} is missing semantic asset: ${id}`)
    }
    const frame = byId.get(`window.${family}.nine-slice`)
    if (frame && (frame.width !== 64 || frame.height !== 64 || frame.nine_slice !== '8,30,8,8')) {
      errors.push(`window family ${family} frame must be 64x64 with 8,30,8,8 cap insets`)
    }
    for (const state of ['active', 'inactive']) {
      const header = byId.get(`window.header.${family}.${state}`)
      if (header && (header.width !== 256 || header.height !== 27 || header.nine_slice !== '8,8,8,8')) {
        errors.push(`window family ${family} ${state} header must be 256x27 with horizontal 8px caps`)
      }
      const shell = byId.get(`window.${family}.${state}`)
      if (shell && (shell.width !== 320 || shell.height !== 220)) {
        errors.push(`window family ${family} reference shell must remain 320x220`)
      }
    }
  }
  for (const family of KORP_UI_V01_WINDOW_FAMILIES) {
    if (!allFamilies.includes(family)) errors.push(`required window family is missing: ${family}`)
    const surfaceId = WINDOW_FAMILY_SURFACES[family]
    const surface = byId.get(surfaceId)
    if (!surface || surface.category !== 'surface-tile' || surface.width !== 32 || surface.height !== 32) {
      errors.push(`window family ${family} requires 32x32 surface tile ${surfaceId}`)
    }
  }
  for (const state of ['active', 'inactive']) {
    const compactShellId = `window.module.compact.${state}`
    const compactShell = byId.get(compactShellId)
    if (
      !compactShell
      || compactShell.category !== 'window-shell-fixed'
      || compactShell.width !== 183
      || compactShell.height !== 223
      || compactShell.states !== state
      || compactShell.nine_slice !== ''
    ) {
      errors.push(
        `module pilot requires fixed 183x223 authored shell without slice metadata: ${compactShellId}`,
      )
    }
  }
  for (const control of PILOT_CONTROL_IDS) {
    for (const state of CONTROL_STATES) {
      const id = `control.${control}.${state}`
      const asset = byId.get(id)
      if (!asset || asset.category !== 'window-control' || asset.width !== 18 || asset.height !== 16) {
        errors.push(`module pilot requires 18x16 control asset: ${id}`)
      }
    }
  }
}

export function validateKorpUiV01RawPack({ rawRoot, manifest, csvSource, nineSliceTokens }) {
  const errors = []
  validateRequiredSourceFiles(rawRoot, errors)
  const assets = validateManifestShape(manifest, errors)
  validateCsvParity(assets, csvSource, errors)
  validateSourceAssetFiles(rawRoot, assets, errors)
  validateNineSliceTokens(assets, nineSliceTokens, errors)
  validateSemanticFamilies(assets, errors)
  throwIfErrors(errors)
  return { assets, assetById: new Map(assets.map((asset) => [asset.id, asset])) }
}

function getTextPolicy(asset) {
  if (asset.id.includes('.blank.')) return 'live-dom'
  if (
    asset.category === 'form-button'
    || asset.id.startsWith('form.input.')
    || asset.category === 'status-badge'
    || asset.category === 'taskbar-component'
  ) return 'baked-reference'
  return 'none'
}

export function classifyKorpUiV01Asset(asset) {
  const isSheet = asset.category.includes('sheet')
    || asset.category.includes('atlas')
    || asset.id.endsWith('.sheet')
  const textPolicy = getTextPolicy(asset)
  let textureMode = 'fixed'
  if (asset.category === 'surface-tile') textureMode = 'tile'
  else if (asset.category === 'window-nine-slice' || asset.category === 'os-bar-nine-slice') {
    textureMode = 'nine-slice'
  } else if (asset.category === 'window-header') textureMode = 'three-slice'
  else if (asset.category === 'window-shell-fixed') textureMode = 'fixed'
  else if (
    asset.category === 'window-shell'
    || asset.category === 'os-bar'
    || isSheet
    || textPolicy === 'baked-reference'
  ) textureMode = 'reference-only'

  const capInsets = asset.nine_slice ? parseKorpUiV01Insets(asset.nine_slice, `${asset.id}.nine_slice`) : null
  return {
    id: asset.id,
    sourcePath: asset.path,
    category: asset.category,
    dimensions: { width: asset.width, height: asset.height },
    states: asset.states ? asset.states.split('|') : [],
    accent: normalizeEmpty(asset.accent),
    usage: normalizeEmpty(asset.usage),
    sourceDocs: asset.source_docs ? asset.source_docs.split(';') : [],
    textureMode,
    capInsets,
    repeatable: textureMode === 'tile',
    repeat: textureMode === 'tile' ? 'both' : 'none',
    stretchable: false,
    textPolicy,
    runtimeEligible: textureMode !== 'reference-only' && textPolicy !== 'baked-reference',
  }
}

export function createKorpUiV01Catalog({ manifest, rawRoot }) {
  const assets = [...manifest.assets]
    .sort((left, right) => compareText(left.id, right.id))
    .map((asset) => {
      const normalized = classifyKorpUiV01Asset(asset)
      const absolutePath = resolveKorpUiPathInside(rawRoot, asset.path, `asset ${asset.id}`)
      const source = readFileSync(absolutePath)
      return { ...normalized, bytes: source.length, sha256: hashBuffer(source) }
    })
  const modeCounts = Object.fromEntries(KORP_UI_V01_TEXTURE_MODES.map((mode) => [
    mode,
    assets.filter((asset) => asset.textureMode === mode).length,
  ]))
  return {
    schemaVersion: 1,
    sourcePack: manifest.name,
    sourceRoot: KORP_UI_V01_SOURCE_ROOT,
    sourceAssetCount: assets.length,
    pixelPolicy: {
      sourceScale: '1x-logical-pixel',
      coordinates: 'integer-only',
      scaling: 'nearest-neighbor-integer-only',
      smoothing: 'forbidden',
    },
    textureModes: [...KORP_UI_V01_TEXTURE_MODES],
    counts: modeCounts,
    references: KORP_UI_V01_REQUIRED_SOURCE_FILES
      .filter((relativePath) => relativePath.startsWith('previews/'))
      .map((sourcePath) => ({ sourcePath, textureMode: 'reference-only', runtimeEligible: false })),
    assets,
  }
}

export function validateKorpUiV01Catalog({ catalog, manifest, rawRoot }) {
  const errors = []
  const expected = createKorpUiV01Catalog({ manifest, rawRoot })
  if (catalog?.schemaVersion !== 1) errors.push('catalog schemaVersion must be 1')
  if (catalog?.sourceRoot !== KORP_UI_V01_SOURCE_ROOT) {
    errors.push(`catalog sourceRoot must be ${KORP_UI_V01_SOURCE_ROOT}`)
  }
  const assets = Array.isArray(catalog?.assets) ? catalog.assets : []
  const ids = new Set()
  for (const [index, asset] of assets.entries()) {
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(`catalog assets[${index}] must be an object`)
      continue
    }
    if (ids.has(asset.id)) errors.push(`duplicate catalog semantic id: ${String(asset.id)}`)
    ids.add(asset.id)
    if (!KORP_UI_V01_TEXTURE_MODES.includes(asset.textureMode)) {
      errors.push(`catalog ${String(asset.id)} has unsupported textureMode: ${String(asset.textureMode)}`)
    }
    if (asset.textureMode === 'tile' && (!asset.repeatable || asset.repeat !== 'both' || asset.stretchable)) {
      errors.push(`tile asset ${asset.id} must repeat both axes and never stretch`)
    }
    if (asset.textureMode === 'reference-only' && asset.runtimeEligible) {
      errors.push(`reference-only asset ${asset.id} cannot be runtime eligible`)
    }
    if (asset.textPolicy === 'baked-reference' && asset.runtimeEligible) {
      errors.push(`text-baked reference ${asset.id} cannot be runtime eligible`)
    }
  }
  if (serializeKorpUiJson(catalog) !== serializeKorpUiJson(expected)) {
    errors.push('catalog has generated drift; run npm run build:korp-ui-pack-v01')
  }
  throwIfErrors(errors)
  return expected
}

function dimensionsEqual(actual, expected) {
  return actual?.width === expected.width && actual?.height === expected.height
}

function insetsEqual(actual, expected) {
  return actual?.left === expected.left
    && actual?.top === expected.top
    && actual?.right === expected.right
    && actual?.bottom === expected.bottom
}

function rectEqual(actual, expected) {
  return actual?.x === expected.x
    && actual?.y === expected.y
    && dimensionsEqual(actual, expected)
}

function expandRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + (amount * 2),
    height: rect.height + (amount * 2),
  }
}

function rectContains(outerRect, innerRect) {
  return innerRect.x >= outerRect.x
    && innerRect.y >= outerRect.y
    && innerRect.x + innerRect.width <= outerRect.x + outerRect.width
    && innerRect.y + innerRect.height <= outerRect.y + outerRect.height
}

function rectHasIntegerValues(rect) {
  return ['x', 'y', 'width', 'height'].every((field) => Number.isInteger(rect?.[field]))
}

export function validateKorpUiV01WindowContract({ contract, catalog }) {
  const errors = []
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    throw new KorpUiAssetValidationError(['window-shell contract root must be an object'])
  }
  if (contract.schemaVersion !== 1) errors.push('window-shell contract schemaVersion must be 1')
  if (contract.contractId !== 'k0rp.window-shell.v01') {
    errors.push('window-shell contractId must be k0rp.window-shell.v01')
  }
  if (contract.sourcePack?.root !== KORP_UI_V01_SOURCE_ROOT) {
    errors.push(`window-shell source root must be ${KORP_UI_V01_SOURCE_ROOT}`)
  }
  if (contract.runtimeRoot !== KORP_UI_V01_RUNTIME_ROOT) {
    errors.push(`window-shell runtime root must be ${KORP_UI_V01_RUNTIME_ROOT}`)
  }
  if (contract.units !== 'logical-px') errors.push('window-shell units must be logical-px')

  const rendering = contract.renderingPolicy ?? {}
  for (const field of [
    'integerCoordinatesOnly',
    'integerScaleOnly',
    'nearestNeighborWhenScaling',
  ]) {
    if (rendering[field] !== true) errors.push(`renderingPolicy.${field} must be true`)
  }
  for (const field of [
    'fractionalTransformScaleAllowed',
    'smoothingAllowed',
    'blurOrFilterAllowed',
  ]) {
    if (rendering[field] !== false) errors.push(`renderingPolicy.${field} must be false`)
  }
  if (rendering.runtimeText !== 'live-dom') errors.push('renderingPolicy.runtimeText must be live-dom')
  if (rendering.runtimeFont !== 'preserve-current') {
    errors.push('renderingPolicy.runtimeFont must preserve-current')
  }
  if (
    rendering.stateStyling?.backgroundAssetsIndependent !== true
    || rendering.stateStyling?.textColorsIndependent !== true
  ) errors.push('renderingPolicy must keep state backgrounds and text colors independently styleable')

  const composition = contract.compositionPolicy ?? {}
  if (
    JSON.stringify(composition.allowedClassifications) !== JSON.stringify(KORP_UI_V01_TEXTURE_MODES)
  ) errors.push('compositionPolicy.allowedClassifications must match the catalog texture modes')
  const modulePilotShell = composition.modulePilotShell
  const moduleContentRect = { x: 5, y: 28, width: 173, height: 173 }
  const moduleOuterRect = { x: 0, y: 0, width: 183, height: 223 }
  const moduleApertureUnderlayRect = expandRect(moduleContentRect, 1)
  if (
    modulePilotShell?.classification !== 'fixed'
    || !dimensionsEqual(modulePilotShell?.sizePx, { width: 183, height: 223 })
    || modulePilotShell?.nativeScale !== 1
    || modulePilotShell?.runtimeImportAllowed !== true
    || modulePilotShell?.stateSelection !== 'whole-shell-asset'
    || !rectEqual(modulePilotShell?.transparentAperturePx, moduleContentRect)
    || !rectEqual(modulePilotShell?.contentRectPx, moduleContentRect)
    || !rectEqual(modulePilotShell?.apertureUnderlayRectPx, moduleApertureUnderlayRect)
    || !rectHasIntegerValues(modulePilotShell?.apertureUnderlayRectPx)
    || !rectContains(moduleOuterRect, modulePilotShell?.apertureUnderlayRectPx ?? {})
    || !rectContains(
      modulePilotShell?.apertureUnderlayRectPx ?? {},
      modulePilotShell?.contentRectPx ?? {},
    )
    || JSON.stringify(modulePilotShell?.apertureUnderlay) !== JSON.stringify({
      derivedFrom: 'contentRectPx',
      expansionPx: 1,
      usage: ['opaque-backing', 'repeated-surface'],
      backgroundCoverageOnly: true,
      clipToOuterRect: true,
      liveViewportUsesUnderlayRect: false,
      shellMasksOverscan: true,
      textureOrigin: 'contentRectPx',
    })
    || modulePilotShell?.contentPlacement?.anchor !== 'shell-top-left'
    || modulePilotShell?.contentPlacement?.positioning !== 'absolute-integer-px'
    || modulePilotShell?.contentPlacement?.clipToContentRect !== true
    || modulePilotShell?.contentPlacement?.derivedOrPercentageLayoutAllowed !== false
    || modulePilotShell?.contentPlacement?.translateCenteringAllowed !== false
    || modulePilotShell?.binaryAlphaOnly !== true
    || modulePilotShell?.stateAlphaMasksIdentical !== true
    || modulePilotShell?.resizable !== false
    || JSON.stringify(modulePilotShell?.assets) !== JSON.stringify({
      active: 'window.module.compact.active',
      inactive: 'window.module.compact.inactive',
    })
  ) {
    errors.push('compositionPolicy.modulePilotShell must use the measured 173x173 authored content rect plus its one-pixel aperture underlay')
  }
  const futureResizablePieces = composition.futureResizablePieces
  const frameInsets = { left: 8, top: 30, right: 8, bottom: 8 }
  if (futureResizablePieces?.runtimeUsedByModulePilot !== false) {
    errors.push('compositionPolicy future resizable pieces must be excluded from the fixed module pilot')
  }
  if (futureResizablePieces?.frame?.classification !== 'nine-slice') {
    errors.push('compositionPolicy future frame must remain nine-slice')
  }
  if (!insetsEqual(futureResizablePieces?.frame?.capInsetsPx, frameInsets)) {
    errors.push('compositionPolicy future frame cap insets must be 8/30/8/8')
  }
  if (
    futureResizablePieces?.header?.classification !== 'three-slice'
    || futureResizablePieces?.header?.axis !== 'horizontal'
    || futureResizablePieces?.header?.heightPx !== 27
    || futureResizablePieces?.header?.capInsetsPx?.left !== 8
    || futureResizablePieces?.header?.capInsetsPx?.right !== 8
  ) errors.push('compositionPolicy future header must be a 27px horizontal three-slice with 8px caps')
  if (
    composition.surfaceTile?.classification !== 'tile'
    || composition.surfaceTile?.repeatable !== true
    || composition.surfaceTile?.stretchable !== false
  ) errors.push('compositionPolicy.surfaceTile must repeat and never stretch')
  if (
    composition.controls?.classification !== 'fixed'
    || !dimensionsEqual(composition.controls?.sizePx, { width: 18, height: 16 })
  ) errors.push('compositionPolicy controls must be fixed 18x16 assets')
  if (
    composition.controls?.layoutPx?.top !== 5
    || composition.controls?.layoutPx?.right !== 5
    || composition.controls?.layoutPx?.gap !== 2
    || JSON.stringify(composition.controls?.states) !== JSON.stringify(CONTROL_STATES)
  ) errors.push('compositionPolicy controls must use the authored integer layout and four states')
  if (
    composition.historicalCompleteShell?.classification !== 'reference-only'
    || composition.historicalCompleteShell?.runtimeImportAllowed !== false
  ) errors.push('compositionPolicy historical 320x220 shells must remain reference-only')
  if (
    contract.geometryPolicy?.outerSizeFormula?.width
      !== 'content.width + contentInsets.left + contentInsets.right'
    || contract.geometryPolicy?.outerSizeFormula?.height
      !== 'content.height + contentInsets.top + contentInsets.bottom'
  ) errors.push('geometryPolicy must derive outer size from content and explicit content insets')
  if (
    contract.geometryPolicy?.contentPreservation?.shrinkAllowed !== false
    || contract.geometryPolicy?.contentPreservation?.cropAllowed !== false
    || contract.geometryPolicy?.contentPreservation?.rescaleAllowed !== false
  ) errors.push('geometryPolicy must forbid shrinking, cropping and rescaling module content')

  const catalogById = new Map((catalog?.assets ?? []).map((asset) => [asset.id, asset]))
  const expectedFamilies = {
    module: {
      orientation: 'content-derived',
      controls: ['pin-toggle', 'minimize', 'close'],
      contentInsets: { left: 5, top: 28, right: 5, bottom: 22 },
      content: { width: 173, height: 173 },
      outer: { width: 183, height: 223 },
      surface: 'dark-panel',
      resizingComposition: 'deferred-explicit-authored-export-contract',
    },
    audit: {
      orientation: 'portrait',
      controls: ['minimize', 'close'],
      contentInsets: { left: 8, top: 31, right: 8, bottom: 8 },
      content: { width: 294, height: 431 },
      outer: { width: 310, height: 470 },
      surface: 'paper-light-ruled',
      resizingComposition: 'nine-slice-frame-plus-three-slice-header-plus-tiled-surface',
    },
    folder: {
      orientation: 'portrait',
      controls: ['minimize', 'close'],
      contentInsets: { left: 8, top: 31, right: 8, bottom: 8 },
      content: { width: 252, height: 321 },
      outer: { width: 268, height: 360 },
      surface: 'manila-folder',
      resizingComposition: 'nine-slice-frame-plus-three-slice-header-plus-tiled-surface',
    },
  }
  const families = contract.families ?? {}
  if (JSON.stringify(Object.keys(families).sort()) !== JSON.stringify(KORP_UI_V01_WINDOW_FAMILIES.toSorted())) {
    errors.push('window-shell contract must define only module, audit and folder families')
  }
  for (const [familyId, expected] of Object.entries(expectedFamilies)) {
    const family = families[familyId]
    if (!family || typeof family !== 'object' || Array.isArray(family)) {
      errors.push(`window-shell contract is missing family: ${familyId}`)
      continue
    }
    if (family.orientation !== expected.orientation) {
      errors.push(`${familyId} orientation must be ${expected.orientation}`)
    }
    const controlIds = (family.controlSlots ?? []).map((slot) => slot?.id)
    if (
      family.controlCount !== expected.controls.length
      || JSON.stringify(controlIds) !== JSON.stringify(expected.controls)
    ) errors.push(`${familyId} control slots must be ${expected.controls.join(', ')}`)
    if (!insetsEqual(family.defaultMetricsPx?.contentInsets, expected.contentInsets)) {
      errors.push(`${familyId} content insets do not match the authored transparent slot`)
    }
    if (!dimensionsEqual(family.defaultMetricsPx?.content, expected.content)) {
      errors.push(`${familyId} default content size is incorrect`)
    }
    if (!dimensionsEqual(family.defaultMetricsPx?.outer, expected.outer)) {
      errors.push(`${familyId} default outer size is incorrect`)
    }
    const metrics = family.defaultMetricsPx
    if (
      metrics?.content?.width + metrics?.contentInsets?.left + metrics?.contentInsets?.right
        !== metrics?.outer?.width
      || metrics?.content?.height + metrics?.contentInsets?.top + metrics?.contentInsets?.bottom
        !== metrics?.outer?.height
    ) errors.push(`${familyId} outer size must derive exactly from content size plus content insets`)
    if (familyId !== 'module' && !(metrics?.outer?.height > metrics?.outer?.width)) {
      errors.push(`${familyId} default outer size must be portrait`)
    }
    if (familyId !== 'module' && dimensionsEqual(metrics?.outer, { width: 320, height: 220 })) {
      errors.push(`${familyId} must not use the authored 320x220 reference dimensions`)
    }
    if (family.assets?.surface !== expected.surface) {
      errors.push(`${familyId} surface must be ${expected.surface}`)
    }
    const expectedFamilyAssets = familyId === 'module'
      ? {
          fixedShells: {
            active: 'window.module.compact.active',
            inactive: 'window.module.compact.inactive',
          },
          surface: expected.surface,
          futureResizablePieces: {
            frame: 'window.module.nine-slice',
            headers: {
              active: 'window.header.module.active',
              inactive: 'window.header.module.inactive',
            },
          },
          referenceOnlyShells: ['window.module.active', 'window.module.inactive'],
        }
      : {
          frame: `window.${familyId}.nine-slice`,
          headers: {
            active: `window.header.${familyId}.active`,
            inactive: `window.header.${familyId}.inactive`,
          },
          surface: expected.surface,
          referenceOnlyShells: [`window.${familyId}.active`, `window.${familyId}.inactive`],
        }
    if (JSON.stringify(family.assets) !== JSON.stringify(expectedFamilyAssets)) {
      errors.push(`${familyId} must reference only its canonical pilot, future and reference assets`)
    }
    if (familyId === 'module') {
      if (
        family.pilotComposition?.kind !== 'fixed-authored-shell'
        || !dimensionsEqual(family.pilotComposition?.nativeSizePx, { width: 183, height: 223 })
        || family.pilotComposition?.nativeScale !== 1
        || family.pilotComposition?.stateSelection !== 'whole-shell-asset'
        || family.pilotComposition?.shellOwnsPermanentChrome !== true
        || !rectEqual(family.pilotComposition?.contentRectPx, moduleContentRect)
        || !rectEqual(
          family.pilotComposition?.apertureUnderlayRectPx,
          moduleApertureUnderlayRect,
        )
        || family.pilotComposition?.apertureUnderlayExpansionPx !== 1
        || family.pilotComposition?.contentAnchor !== 'shell-top-left'
        || family.pilotComposition?.contentClip !== 'exact-authored-rect'
      ) errors.push('module pilot composition must use fixed authored whole-shell state assets at native size')
      if (
        family.resizing?.supported !== false
        || family.resizing?.composition !== expected.resizingComposition
        || JSON.stringify(family.resizing?.axes) !== JSON.stringify([])
        || family.resizing?.contentDrivesOuterSize !== false
      ) errors.push('module resizing must remain deferred for the fixed authored pilot')
    } else if (
      family.resizing?.composition !== expected.resizingComposition
      || JSON.stringify(family.resizing?.axes) !== JSON.stringify(['horizontal', 'vertical'])
      || family.resizing?.contentDrivesOuterSize !== true
      || family.resizing?.preferredGrowthAxis !== 'vertical'
    ) errors.push(`${familyId} resizing must use the declared slice composition on integer axes`)
    const assetExpectations = familyId === 'module'
      ? [
          [family.assets?.fixedShells?.active, 'fixed'],
          [family.assets?.fixedShells?.inactive, 'fixed'],
          [family.assets?.surface, 'tile'],
          [family.assets?.futureResizablePieces?.frame, 'nine-slice'],
          [family.assets?.futureResizablePieces?.headers?.active, 'three-slice'],
          [family.assets?.futureResizablePieces?.headers?.inactive, 'three-slice'],
          ...((family.assets?.referenceOnlyShells ?? []).map((id) => [id, 'reference-only'])),
        ]
      : [
          [family.assets?.frame, 'nine-slice'],
          [family.assets?.headers?.active, 'three-slice'],
          [family.assets?.headers?.inactive, 'three-slice'],
          [family.assets?.surface, 'tile'],
          ...((family.assets?.referenceOnlyShells ?? []).map((id) => [id, 'reference-only'])),
        ]
    for (const [assetId, textureMode] of assetExpectations) {
      const asset = catalogById.get(assetId)
      if (!asset) errors.push(`${familyId} references unknown catalog asset: ${String(assetId)}`)
      else if (asset.textureMode !== textureMode) {
        errors.push(`${familyId} asset ${assetId} must be ${textureMode}`)
      }
    }
  }
  const moduleFamily = families.module
  for (const instanceId of ['clickAudit', 'fidget']) {
    if (!dimensionsEqual(moduleFamily?.preservedContentInstances?.[instanceId], { width: 173, height: 173 })) {
      errors.push(`${instanceId} viewport constraint must remain exactly 173x173`)
    }
  }
  if (
    families.audit?.contentContract?.kind !== 'live-form'
    || families.audit?.contentContract?.verticalGrowth !== true
    || families.audit?.contentContract?.bakedTextAllowed !== false
  ) errors.push('audit content contract must remain a live vertically growing form')
  if (
    families.folder?.contentContract?.kind !== 'live-scroll-list'
    || families.folder?.contentContract?.scrollAxis !== 'vertical'
    || families.folder?.contentContract?.bakedRowsAllowed !== false
    || families.folder?.contentContract?.bakedScrollbarAllowed !== false
  ) errors.push('folder content contract must remain a live vertically scrolling list')
  if (
    families.module?.pilotEligible !== true
    || families.audit?.pilotEligible !== false
    || families.folder?.pilotEligible !== false
  ) errors.push('only the module family may be eligible for the first future pilot')
  throwIfErrors(errors)
  return contract
}

export function flattenKorpUiV01Allowlist(allowlist) {
  return (allowlist?.groups ?? []).flatMap((group) => group?.assetIds ?? [])
}

export function validateKorpUiV01Allowlist({ allowlist, catalog }) {
  const errors = []
  if (!allowlist || typeof allowlist !== 'object' || Array.isArray(allowlist)) {
    throw new KorpUiAssetValidationError(['runtime allowlist root must be an object'])
  }
  if (allowlist.schemaVersion !== 1) errors.push('runtime allowlist schemaVersion must be 1')
  if (allowlist.targetTask !== 'Task 024B fixed authored module-shell pilot') {
    errors.push('runtime allowlist targetTask must identify the Task 024B fixed authored module-shell pilot')
  }
  if (allowlist.sourceRoot !== KORP_UI_V01_SOURCE_ROOT) {
    errors.push(`runtime allowlist sourceRoot must be ${KORP_UI_V01_SOURCE_ROOT}`)
  }
  if (allowlist.runtimeRoot !== KORP_UI_V01_RUNTIME_ROOT) {
    errors.push(`runtime allowlist runtimeRoot must be ${KORP_UI_V01_RUNTIME_ROOT}`)
  }
  if (allowlist.copyAssets !== true) errors.push('runtime allowlist copyAssets must be true')
  if (allowlist.assetCount !== EXPECTED_PILOT_IDS.length) {
    errors.push(`runtime allowlist assetCount must be ${EXPECTED_PILOT_IDS.length}`)
  }
  if (JSON.stringify(allowlist.allowedWindowFamilies) !== JSON.stringify(['module'])) {
    errors.push('runtime allowlist may target only the module window family')
  }
  if (!Array.isArray(allowlist.groups) || allowlist.groups.length === 0) {
    errors.push('runtime allowlist groups must be a non-empty array')
  }
  const catalogById = new Map((catalog?.assets ?? []).map((asset) => [asset.id, asset]))
  const ids = flattenKorpUiV01Allowlist(allowlist)
  const uniqueIds = new Set()
  const groupIds = new Set()
  for (const [index, group] of (allowlist.groups ?? []).entries()) {
    const prefix = `runtime allowlist groups[${index}]`
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      errors.push(`${prefix} must be an object`)
      continue
    }
    if (typeof group.id !== 'string' || !GROUP_ID_PATTERN.test(group.id)) {
      errors.push(`${prefix}.id is unsafe or invalid: ${String(group.id)}`)
    } else if (groupIds.has(group.id)) {
      errors.push(`duplicate runtime allowlist group id: ${group.id}`)
    } else groupIds.add(group.id)
    if (!Array.isArray(group.assetIds) || group.assetIds.length === 0) {
      errors.push(`${prefix}.assetIds must be a non-empty array`)
    }
  }
  for (const id of ids) {
    if (uniqueIds.has(id)) errors.push(`duplicate runtime allowlist asset id: ${String(id)}`)
    uniqueIds.add(id)
    const asset = catalogById.get(id)
    if (!asset) errors.push(`runtime allowlist references unknown asset id: ${String(id)}`)
    else if (!asset.runtimeEligible || asset.textureMode === 'reference-only') {
      errors.push(`runtime allowlist references non-runtime asset: ${id}`)
    }
  }
  const actualIds = [...uniqueIds].sort(compareText)
  const expectedIds = [...EXPECTED_PILOT_IDS].sort(compareText)
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    const missing = expectedIds.filter((id) => !uniqueIds.has(id))
    const extra = actualIds.filter((id) => !EXPECTED_PILOT_IDS.includes(id))
    if (missing.length > 0) errors.push(`module pilot allowlist is missing: ${missing.join(', ')}`)
    if (extra.length > 0) errors.push(`module pilot allowlist is out of scope: ${extra.join(', ')}`)
  }
  throwIfErrors(errors)
  return expectedIds
}

export function createKorpUiV01RuntimeCatalog({ catalog, selectedIds }) {
  const selected = new Set(selectedIds)
  return {
    schemaVersion: 1,
    sourceRoot: KORP_UI_V01_SOURCE_ROOT,
    runtimeRoot: KORP_UI_V01_RUNTIME_ROOT,
    pilot: 'clickaudit-fidget-module-windows',
    assets: catalog.assets
      .filter((asset) => selected.has(asset.id))
      .map((asset) => ({
        id: asset.id,
        runtimePath: `${KORP_UI_V01_RUNTIME_ROOT}/${asset.sourcePath}`,
        sourcePath: asset.sourcePath,
        dimensions: asset.dimensions,
        textureMode: asset.textureMode,
        sha256: asset.sha256,
      })),
  }
}

export function validateKorpUiV01GeneratedRuntime({ repoRoot, rawRoot, catalog, selectedIds }) {
  const errors = []
  const selected = new Set(selectedIds)
  const expectedAssets = catalog.assets.filter((asset) => selected.has(asset.id))
  const expectedPaths = new Set(expectedAssets.map((asset) => asset.sourcePath))
  const runtimeRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_RUNTIME_ROOT, 'v01 runtime root')
  const runtimeAssetRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_ASSET_ROOT, 'v01 runtime asset root')
  for (const relativePath of findSymlinks(runtimeRoot)) errors.push(`runtime root contains a symlink: ${relativePath}`)
  for (const asset of expectedAssets) {
    const runtimePath = resolveKorpUiPathInside(runtimeRoot, asset.sourcePath, `runtime asset ${asset.id}`)
    const sourcePath = resolveKorpUiPathInside(rawRoot, asset.sourcePath, `source asset ${asset.id}`)
    if (!existsSync(runtimePath)) {
      errors.push(`generated runtime asset is missing: ${asset.sourcePath}`)
      continue
    }
    const runtimeSource = readFileSync(runtimePath)
    const source = readFileSync(sourcePath)
    if (!runtimeSource.equals(source)) errors.push(`generated runtime asset has byte drift: ${asset.sourcePath}`)
    if (hashBuffer(runtimeSource) !== asset.sha256) errors.push(`generated runtime asset hash drift: ${asset.id}`)
  }
  for (const file of listKorpUiFiles(runtimeAssetRoot)) {
    const relativePath = `assets/${file.path}`
    if (!expectedPaths.has(relativePath)) errors.push(`extra generated runtime asset: ${relativePath}`)
  }
  for (const file of listKorpUiFiles(runtimeRoot)) {
    if (file.path.startsWith('assets/')) continue
    if (!file.path.includes('/') && RUNTIME_METADATA_FILES.has(file.path)) continue
    errors.push(`extra runtime file: ${file.path}`)
  }
  throwIfErrors(errors)
  return expectedAssets
}

export function scanKorpUiV01RawImports({ repoRoot }) {
  const violations = []
  const indicator = 'ui-source/k0rp-ui-asset-pack-v01'
  for (const scanRoot of KORP_UI_V01_RUNTIME_SCAN_ROOTS) {
    const absoluteRoot = path.resolve(repoRoot, scanRoot)
    if (!existsSync(absoluteRoot)) continue
    const files = lstatSync(absoluteRoot).isDirectory()
      ? listKorpUiFiles(absoluteRoot).map((file) => file.absolutePath)
      : [absoluteRoot]
    for (const filePath of files) {
      const relativePath = path.relative(repoRoot, filePath).replaceAll('\\', '/')
      if (
        relativePath.includes('/node_modules/')
        || relativePath.includes('/target/')
        || !TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
      ) continue
      const normalizedSource = readFileSync(filePath, 'utf8').replaceAll('\\', '/')
      if (normalizedSource.includes(indicator)) violations.push(relativePath)
    }
  }
  if (violations.length > 0) {
    throw new KorpUiAssetValidationError([
      `runtime code imports raw v01 source paths: ${stableUnique(violations).join(', ')}`,
    ])
  }
  return []
}

export function serializeKorpUiV01Json(value) {
  return serializeKorpUiJson(value)
}

export { EXPECTED_PILOT_IDS, KorpUiAssetValidationError }
