import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  KORP_UI_V01_ALLOWLIST_PATH,
  KORP_UI_V01_CATALOG_PATH,
  KORP_UI_V01_RUNTIME_ROOT,
  KORP_UI_V01_SOURCE_ROOT,
  KORP_UI_V01_WINDOW_CONTRACT_PATH,
} from '../korp-ui-pack-v01-contract.mjs'
import {
  EXPECTED_PILOT_IDS,
  KorpUiAssetValidationError,
  classifyKorpUiV01Asset,
  createKorpUiV01Catalog,
  createKorpUiV01RuntimeCatalog,
  flattenKorpUiV01Allowlist,
  scanKorpUiV01RawImports,
  validateKorpUiV01Allowlist,
  validateKorpUiV01Catalog,
  validateKorpUiV01GeneratedRuntime,
  validateKorpUiV01RawPack,
  validateKorpUiV01WindowContract,
} from '../lib/korp-ui-pack-v01-validation.mjs'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(testDirectory, '../..')
const rawRoot = resolve(repoRoot, ...KORP_UI_V01_SOURCE_ROOT.split('/'))
const runtimeRoot = resolve(repoRoot, ...KORP_UI_V01_RUNTIME_ROOT.split('/'))

const manifest = readJson(join(rawRoot, 'manifest.json'))
const csvSource = readFileSync(join(rawRoot, 'manifest.csv'), 'utf8')
const nineSliceTokens = readJson(join(rawRoot, 'tokens/nine-slice.json'))
const catalog = readJson(resolve(repoRoot, ...KORP_UI_V01_CATALOG_PATH.split('/')))
const contract = readJson(resolve(repoRoot, ...KORP_UI_V01_WINDOW_CONTRACT_PATH.split('/')))
const allowlist = readJson(resolve(repoRoot, ...KORP_UI_V01_ALLOWLIST_PATH.split('/')))

test('the complete v0.1 source pack, catalog, contract and generated pilot subset pass', () => {
  const rawValidation = validateKorpUiV01RawPack({
    rawRoot,
    manifest,
    csvSource,
    nineSliceTokens,
  })
  assert.equal(rawValidation.assets.length, 293)
  assert.equal(rawValidation.assetById.size, 293)

  const expectedCatalog = createKorpUiV01Catalog({ manifest, rawRoot })
  assert.deepEqual(validateKorpUiV01Catalog({ catalog, manifest, rawRoot }), expectedCatalog)
  assert.deepEqual(expectedCatalog.counts, {
    tile: 7,
    'nine-slice': 10,
    'three-slice': 16,
    fixed: 150,
    'reference-only': 110,
  })

  assert.equal(validateKorpUiV01WindowContract({ contract, catalog }), contract)
  const selectedIds = validateKorpUiV01Allowlist({ allowlist, catalog })
  assert.equal(selectedIds.length, 23)
  assert.deepEqual(selectedIds, [...EXPECTED_PILOT_IDS].sort())

  const runtimeCatalog = createKorpUiV01RuntimeCatalog({ catalog, selectedIds })
  assert.equal(runtimeCatalog.assets.length, 23)
  assert.equal(runtimeCatalog.assets.every((asset) => asset.runtimePath.startsWith(`${KORP_UI_V01_RUNTIME_ROOT}/assets/`)), true)
  assert.equal(
    validateKorpUiV01GeneratedRuntime({ repoRoot, rawRoot, catalog, selectedIds }).length,
    23,
  )
})

test('unsafe metadata plus missing, dimension-drifted and orphan PNG files are rejected', () => {
  const fixtureParent = mkdtempSync(join(tmpdir(), 'korp-ui-v01-source-files-'))
  const fixtureRoot = join(fixtureParent, 'pack')
  const dimensionAsset = findManifestAsset('control.close.normal')
  const missingAsset = findManifestAsset('control.pin.normal')
  const invalidManifest = structuredClone(manifest)
  invalidManifest.assets[1].id = invalidManifest.assets[0].id
  invalidManifest.assets[2].id = '../unsafe-id'
  invalidManifest.assets[3].path = '../escape.png'
  invalidManifest.assets[4].path = `assets/${invalidManifest.assets[0].path.slice('assets/'.length).toUpperCase()}`
  try {
    cpSync(rawRoot, fixtureRoot, { recursive: true })
    writeFixtureFile(
      fixtureRoot,
      dimensionAsset.path,
      createPngHeader(dimensionAsset.width + 1, dimensionAsset.height),
    )
    unlinkSync(resolve(fixtureRoot, ...missingAsset.path.split('/')))
    writeFixtureFile(fixtureRoot, 'assets/orphan.png', createPngHeader(1, 1))

    assert.throws(
      () => validateKorpUiV01RawPack({
        rawRoot: fixtureRoot,
        manifest: invalidManifest,
        csvSource,
        nineSliceTokens,
      }),
      (error) => error instanceof KorpUiAssetValidationError
        && error.message.includes(`duplicate semantic asset id: ${invalidManifest.assets[0].id}`)
        && error.message.includes('assets[2].id is unsafe or invalid: ../unsafe-id')
        && error.message.includes('assets[3].path escapes or is not canonical: ../escape.png')
        && error.message.includes('case-insensitive duplicate asset path:')
        && error.message.includes(
          `${dimensionAsset.id} is ${dimensionAsset.width + 1}x${dimensionAsset.height}; manifest declares ${dimensionAsset.width}x${dimensionAsset.height}`,
        )
        && error.message.includes(`manifest asset is missing: ${missingAsset.path}`)
        && error.message.includes('undeclared source asset file: assets/orphan.png'),
    )
  } finally {
    rmSync(fixtureParent, { recursive: true, force: true })
  }
})

test('asset classification distinguishes tile, nine-slice, three-slice, fixed and reference-only', () => {
  const expectations = new Map([
    ['dark-panel', 'tile'],
    ['window.module.nine-slice', 'nine-slice'],
    ['window.header.module.active', 'three-slice'],
    ['control.close.normal', 'fixed'],
    ['window.module.compact.active', 'fixed'],
    ['window.module.compact.inactive', 'fixed'],
    ['window.module.active', 'reference-only'],
  ])

  for (const [id, textureMode] of expectations) {
    const classified = classifyKorpUiV01Asset(findManifestAsset(id))
    assert.equal(classified.textureMode, textureMode, id)
    assert.equal(classified.stretchable, false, id)
  }

  const tile = classifyKorpUiV01Asset(findManifestAsset('dark-panel'))
  assert.equal(tile.repeatable, true)
  assert.equal(tile.repeat, 'both')

  const reference = classifyKorpUiV01Asset(findManifestAsset('window.module.active'))
  assert.equal(reference.runtimeEligible, false)

  for (const state of ['active', 'inactive']) {
    const compact = classifyKorpUiV01Asset(findManifestAsset(`window.module.compact.${state}`))
    assert.deepEqual(compact.dimensions, { width: 183, height: 223 })
    assert.deepEqual(compact.states, [state])
    assert.equal(compact.capInsets, null)
    assert.equal(compact.runtimeEligible, true)
  }

  const bakedStatus = classifyKorpUiV01Asset(findManifestAsset('status.badge.pending'))
  assert.equal(bakedStatus.textPolicy, 'baked-reference')
  assert.equal(bakedStatus.textureMode, 'reference-only')
  assert.equal(bakedStatus.runtimeEligible, false)

  const blankBackground = catalog.assets.find((asset) => asset.id.includes('.blank.') && asset.runtimeEligible)
  assert.ok(blankBackground)
  assert.equal(blankBackground.textPolicy, 'live-dom')
})

test('compact module shells are fixed native-size runtime assets with reviewed bytes', () => {
  const expectations = new Map([
    ['window.module.compact.active', {
      path: 'assets/windows/shells/window.module.active.183x223.png',
      sha256: '099fc8f5299ac3ddec23260696060c9850f1e6cae6adf8139f4f1039f0fff3aa',
    }],
    ['window.module.compact.inactive', {
      path: 'assets/windows/shells/window.module.inactive.183x223.png',
      sha256: '6268bb831c27bdcef658f9a0c89cad7a7860d14d95209d2186d79bbd5d73e3a2',
    }],
  ])

  for (const [id, expected] of expectations) {
    const sourceAsset = findManifestAsset(id)
    const catalogAsset = catalog.assets.find((asset) => asset.id === id)
    const sourceBytes = readFileSync(resolve(rawRoot, ...expected.path.split('/')))
    const runtimeBytes = readFileSync(resolve(runtimeRoot, ...expected.path.split('/')))

    assert.deepEqual(
      { width: sourceAsset.width, height: sourceAsset.height },
      { width: 183, height: 223 },
    )
    assert.equal(sourceAsset.path, expected.path)
    assert.equal(catalogAsset.textureMode, 'fixed')
    assert.equal(catalogAsset.runtimeEligible, true)
    assert.equal(catalogAsset.sha256, expected.sha256)
    assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), expected.sha256)
    assert.equal(createHash('sha256').update(runtimeBytes).digest('hex'), expected.sha256)
  }
})

test('Fidget rotation control publishes four fixed runtime states and one reference sheet', () => {
  const selectedIds = validateKorpUiV01Allowlist({ allowlist, catalog })
  const reviewedHashes = new Map([
    ['normal', 'f60858350b9c3218cc9a2e2b0a2c21f2a3805d0e764546ef81b2210945a8d09d'],
    ['hover', 'f41e644213916f655ca57363f86907b11130746662e973352a0e61955c496610'],
    ['pressed', '3fb68b72048f9d1b4a34cc3bf9be5d1110c528814b7c5896ef0c0b60d376c42a'],
    ['disabled', '31bbfde64ff6269b5fddfee2a9c899b7bc3203b254133768fa655439a11117e4'],
  ])

  for (const [state, reviewedHash] of reviewedHashes) {
    const id = `control.rotation.${state}`
    const expectedPath = `assets/controls/individual/rotation.${state}.png`
    const sourceAsset = findManifestAsset(id)
    const catalogAsset = catalog.assets.find((asset) => asset.id === id)
    const sourceBytes = readFileSync(resolve(rawRoot, ...expectedPath.split('/')))
    const runtimeBytes = readFileSync(resolve(runtimeRoot, ...expectedPath.split('/')))

    assert.equal(sourceAsset.path, expectedPath)
    assert.equal(sourceAsset.category, 'window-control')
    assert.deepEqual(
      { width: sourceAsset.width, height: sourceAsset.height },
      { width: 14, height: 13 },
    )
    assert.equal(sourceAsset.states, state)
    assert.equal(catalogAsset.textureMode, 'fixed')
    assert.equal(catalogAsset.runtimeEligible, true)
    assert.equal(catalogAsset.sha256, reviewedHash)
    assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), reviewedHash)
    assert.equal(createHash('sha256').update(runtimeBytes).digest('hex'), reviewedHash)
    assert.equal(selectedIds.includes(id), true)
    assert.equal(runtimeBytes.equals(sourceBytes), true)
  }

  const sheet = findManifestAsset('control.rotation.sheet')
  const catalogSheet = catalog.assets.find((asset) => asset.id === sheet.id)
  const sheetBytes = readFileSync(resolve(rawRoot, ...sheet.path.split('/')))
  assert.equal(sheet.path, 'assets/controls/individual/rotation.sheet.png')
  assert.equal(sheet.category, 'window-control-sheet')
  assert.deepEqual({ width: sheet.width, height: sheet.height }, { width: 56, height: 13 })
  assert.equal(sheet.states, 'normal|hover|pressed|disabled')
  assert.equal(catalogSheet.textureMode, 'reference-only')
  assert.equal(catalogSheet.runtimeEligible, false)
  assert.equal(
    catalogSheet.sha256,
    '668f03991f1bb50c3ad4bc5a01fc2598d7ab6398d91ea7595aaa3ba3490e49b0',
  )
  assert.equal(createHash('sha256').update(sheetBytes).digest('hex'), catalogSheet.sha256)
  assert.equal(selectedIds.includes(sheet.id), false)
})

test('catalog drift is detected even when a catalog remains structurally valid', () => {
  const driftedCatalog = structuredClone(catalog)
  driftedCatalog.assets[0].usage = 'locally edited generated metadata'

  assert.throws(
    () => validateKorpUiV01Catalog({ catalog: driftedCatalog, manifest, rawRoot }),
    /catalog has generated drift; run npm run build:korp-ui-pack-v01/,
  )
})

test('window-shell geometry preserves module content and portrait two-control document families', () => {
  validateKorpUiV01WindowContract({ contract, catalog })

  assert.deepEqual(
    contract.families.module.defaultMetricsPx.contentInsets,
    { left: 5, top: 28, right: 5, bottom: 22 },
  )
  assert.deepEqual(contract.families.module.defaultMetricsPx.content, { width: 173, height: 173 })
  assert.deepEqual(contract.families.module.defaultMetricsPx.outer, { width: 183, height: 223 })
  assert.deepEqual(contract.compositionPolicy.modulePilotShell, {
    classification: 'fixed',
    sizePx: { width: 183, height: 223 },
    nativeScale: 1,
    runtimeImportAllowed: true,
    stateSelection: 'whole-shell-asset',
    assets: {
      active: 'window.module.compact.active',
      inactive: 'window.module.compact.inactive',
    },
    transparentAperturePx: { x: 5, y: 28, width: 173, height: 173 },
    contentRectPx: { x: 5, y: 28, width: 173, height: 173 },
    apertureUnderlayRectPx: { x: 4, y: 27, width: 175, height: 175 },
    apertureUnderlay: {
      derivedFrom: 'contentRectPx',
      expansionPx: 1,
      usage: ['opaque-backing', 'repeated-surface'],
      backgroundCoverageOnly: true,
      clipToOuterRect: true,
      liveViewportUsesUnderlayRect: false,
      shellMasksOverscan: true,
      textureOrigin: 'contentRectPx',
    },
    contentPlacement: {
      anchor: 'shell-top-left',
      positioning: 'absolute-integer-px',
      clipToContentRect: true,
      derivedOrPercentageLayoutAllowed: false,
      translateCenteringAllowed: false,
    },
    binaryAlphaOnly: true,
    stateAlphaMasksIdentical: true,
    resizable: false,
  })
  assert.equal(contract.families.module.pilotComposition.kind, 'fixed-authored-shell')
  assert.deepEqual(
    contract.families.module.pilotComposition.apertureUnderlayRectPx,
    { x: 4, y: 27, width: 175, height: 175 },
  )
  assert.equal(contract.families.module.pilotComposition.apertureUnderlayExpansionPx, 1)
  assert.equal(contract.families.module.resizing.supported, false)
  assert.equal(contract.families.module.resizing.composition, 'deferred-explicit-authored-export-contract')
  assert.deepEqual(contract.families.module.resizing.axes, [])
  assert.deepEqual(contract.families.module.preservedContentInstances, {
    clickAudit: { width: 173, height: 173 },
    fidget: { width: 173, height: 173 },
  })

  for (const familyId of ['audit', 'folder']) {
    const family = contract.families[familyId]
    assert.equal(family.orientation, 'portrait')
    assert.equal(family.controlCount, 2)
    assert.deepEqual(family.controlSlots.map((slot) => slot.id), ['minimize', 'close'])
    assert.ok(family.defaultMetricsPx.outer.height > family.defaultMetricsPx.outer.width)
    assert.notDeepEqual(family.defaultMetricsPx.outer, { width: 320, height: 220 })
  }

  const invalidContract = structuredClone(contract)
  invalidContract.families.module.defaultMetricsPx.content.width = 172
  invalidContract.geometryPolicy.contentPreservation.shrinkAllowed = true
  invalidContract.compositionPolicy.modulePilotShell.nativeScale = 2
  invalidContract.compositionPolicy.modulePilotShell.contentRectPx.width = 172
  invalidContract.families.module.resizing.supported = true
  invalidContract.families.audit.orientation = 'landscape'
  invalidContract.families.audit.controlCount = 3
  invalidContract.families.audit.assets.frame = 'window.module.nine-slice'
  invalidContract.families.folder.defaultMetricsPx.outer = { width: 320, height: 220 }

  assert.throws(
    () => validateKorpUiV01WindowContract({ contract: invalidContract, catalog }),
    (error) => error instanceof KorpUiAssetValidationError
      && error.message.includes('module default content size is incorrect')
      && error.message.includes('geometryPolicy must forbid shrinking, cropping and rescaling module content')
      && error.message.includes('compositionPolicy.modulePilotShell must use the measured 173x173 authored content rect plus its one-pixel aperture underlay')
      && error.message.includes('module resizing must remain deferred for the fixed authored pilot')
      && error.message.includes('audit orientation must be portrait')
      && error.message.includes('audit control slots must be minimize, close')
      && error.message.includes('audit must reference only its canonical pilot, future and reference assets')
      && error.message.includes('folder default outer size must be portrait'),
  )
})

test('module aperture underlay contract rejects fractional, incomplete and escaped coverage', () => {
  const invalidUnderlays = [
    ['fractional coordinate', (candidate) => {
      candidate.compositionPolicy.modulePilotShell.apertureUnderlayRectPx.x = 4.5
    }],
    ['missing left cover', (candidate) => {
      candidate.compositionPolicy.modulePilotShell.apertureUnderlayRectPx.x = 5
      candidate.compositionPolicy.modulePilotShell.apertureUnderlayRectPx.width = 174
    }],
    ['outer escape', (candidate) => {
      candidate.compositionPolicy.modulePilotShell.apertureUnderlayRectPx.x = -1
    }],
    ['enlarged live viewport', (candidate) => {
      candidate.compositionPolicy.modulePilotShell.contentRectPx.width = 175
    }],
  ]

  for (const [name, mutate] of invalidUnderlays) {
    const invalidContract = structuredClone(contract)
    mutate(invalidContract)

    assert.throws(
      () => validateKorpUiV01WindowContract({ contract: invalidContract, catalog }),
      /one-pixel aperture underlay/,
      name,
    )
  }

  const mismatchedFamilyContract = structuredClone(contract)
  mismatchedFamilyContract.families.module.pilotComposition.apertureUnderlayRectPx.width = 174
  assert.throws(
    () => validateKorpUiV01WindowContract({
      contract: mismatchedFamilyContract,
      catalog,
    }),
    /module pilot composition must use fixed authored whole-shell state assets at native size/,
  )
})

test('the runtime allowlist is exactly the 23-asset fixed-shell module pilot and rejects scope creep', () => {
  const selectedIds = validateKorpUiV01Allowlist({ allowlist, catalog })
  assert.equal(allowlist.targetTask, 'Task 024B fixed authored module-shell pilot')
  assert.equal(allowlist.assetCount, 23)
  assert.equal(flattenKorpUiV01Allowlist(allowlist).length, 23)
  assert.deepEqual(selectedIds, [...EXPECTED_PILOT_IDS].sort())
  assert.equal(selectedIds.includes('window.module.compact.active'), true)
  assert.equal(selectedIds.includes('window.module.compact.inactive'), true)
  assert.equal(selectedIds.includes('window.module.nine-slice'), false)
  assert.equal(selectedIds.includes('window.header.module.active'), false)
  assert.equal(selectedIds.includes('window.header.module.inactive'), false)
  assert.deepEqual(
    selectedIds.filter((id) => id.startsWith('control.rotation.')),
    [
      'control.rotation.disabled',
      'control.rotation.hover',
      'control.rotation.normal',
      'control.rotation.pressed',
    ],
  )
  assert.equal(selectedIds.includes('control.rotation.sheet'), false)

  const extraAsset = structuredClone(allowlist)
  extraAsset.groups[0].assetIds.push('window.audit.nine-slice')
  extraAsset.assetCount += 1
  assert.throws(
    () => validateKorpUiV01Allowlist({ allowlist: extraAsset, catalog }),
    /module pilot allowlist is out of scope: window\.audit\.nine-slice/,
  )

  const referenceAsset = structuredClone(allowlist)
  const surfaceIds = referenceAsset.groups.find((group) => group.id === 'module-window-surface').assetIds
  surfaceIds.splice(0, 1, 'window.module.active')
  assert.throws(
    () => validateKorpUiV01Allowlist({ allowlist: referenceAsset, catalog }),
    (error) => error instanceof KorpUiAssetValidationError
      && error.message.includes('runtime allowlist references non-runtime asset: window.module.active')
      && error.message.includes('module pilot allowlist is missing: dark-panel')
      && error.message.includes('module pilot allowlist is out of scope: window.module.active'),
  )
})

test('runtime source cannot import the raw v0.1 source tree', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-v01-import-scan-'))
  try {
    assert.deepEqual(scanKorpUiV01RawImports({ repoRoot: fixtureRoot }), [])
    writeFixtureFile(
      fixtureRoot,
      'src/bad.js',
      Buffer.from("import frame from '../design/ui-source/k0rp-ui-asset-pack-v01/assets/window.png'\n"),
    )
    assert.throws(
      () => scanKorpUiV01RawImports({ repoRoot: fixtureRoot }),
      /runtime code imports raw v01 source paths: src\/bad\.js/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('generated runtime validation catches byte drift and extra assets', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-v01-runtime-drift-'))
  const fixtureRuntimeRoot = resolve(fixtureRoot, ...KORP_UI_V01_RUNTIME_ROOT.split('/'))
  const selectedIds = validateKorpUiV01Allowlist({ allowlist, catalog })
  const driftedAsset = catalog.assets.find((asset) => asset.id === 'control.close.normal')
  try {
    cpSync(runtimeRoot, fixtureRuntimeRoot, { recursive: true })
    writeFixtureFile(fixtureRuntimeRoot, driftedAsset.sourcePath, Buffer.from('drifted runtime bytes'))
    writeFixtureFile(fixtureRuntimeRoot, 'assets/extra.png', createPngHeader(1, 1))

    assert.throws(
      () => validateKorpUiV01GeneratedRuntime({
        repoRoot: fixtureRoot,
        rawRoot,
        catalog,
        selectedIds,
      }),
      (error) => error instanceof KorpUiAssetValidationError
        && error.message.includes(`generated runtime asset has byte drift: ${driftedAsset.sourcePath}`)
        && error.message.includes('extra generated runtime asset: assets/extra.png'),
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function findManifestAsset(id) {
  const asset = manifest.assets.find((candidate) => candidate.id === id)
  assert.ok(asset, `missing fixture asset ${id}`)
  return asset
}

function writeFixtureFile(root, relativePath, contents) {
  const filePath = resolve(root, ...relativePath.split('/'))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
}

function createPngHeader(width, height) {
  const buffer = Buffer.alloc(26)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0)
  buffer.writeUInt32BE(13, 8)
  buffer.write('IHDR', 12, 'ascii')
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  buffer.writeUInt8(8, 24)
  buffer.writeUInt8(6, 25)
  return buffer
}
