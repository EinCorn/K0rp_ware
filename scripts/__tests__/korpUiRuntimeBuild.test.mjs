import assert from 'node:assert/strict'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  buildKorpUiRuntime,
  checkKorpUiRuntimeOutput,
  createKorpUiRuntimeCatalogSource,
  createKorpUiRuntimePlan,
  KORP_UI_REQUIRED_RUNTIME_GROUPS,
  KORP_UI_RUNTIME_CATALOG_PATH,
  KorpUiRuntimeBuildError,
  writeKorpUiRuntimeOutput,
} from '../lib/korp-ui-runtime-build.mjs'
import { KORP_UI_RUNTIME_ASSET_ROOT } from '../korp-ui-assets-contract.mjs'
import {
  KORP_UI_ASSET_CATALOG,
  KORP_UI_RUNTIME_ASSET_IDS,
  resolveKorpUiAsset,
  resolveKorpUiWindowFamily,
} from '../../src/ui/korpUiAssetCatalog.js'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(testDirectory, '../..')
const inventory = readJson('design/ui-runtime/k0rp-v3/inventory.json')
const allowlist = readJson('design/ui-runtime/k0rp-v3/runtime-allowlist.json')
const plan = createKorpUiRuntimePlan({ inventory, allowlist })

test('the runtime plan resolves exactly the six pilot groups and 45 safe @2x assets', () => {
  assert.deepEqual(
    plan.groups.map(({ id }) => id),
    [...KORP_UI_REQUIRED_RUNTIME_GROUPS].sort(),
  )
  assert.equal(plan.entries.length, 45)
  assert.deepEqual(
    plan.entries.map(({ id }) => id),
    allowlist.groups.flatMap(({ assetIds }) => assetIds).sort(),
  )
  for (const entry of plan.entries) {
    assert.match(entry.id, /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/)
    assert.equal(entry.targetName, `${entry.id}.png`)
    assert.match(entry.sourceRelativePath, /^assets\/2x\/.+@2x\.png$/)
    assert.equal(entry.intrinsicWidth, entry.nativeWidth * 2)
    assert.equal(entry.intrinsicHeight, entry.nativeHeight * 2)
  }
})

test('catalog generation is stable across inventory and allowlist ordering', () => {
  const reorderedInventory = clone(inventory)
  reorderedInventory.assets.reverse()
  reorderedInventory.windowFamilies.reverse()
  const reorderedAllowlist = clone(allowlist)
  reorderedAllowlist.groups.reverse()
  for (const group of reorderedAllowlist.groups) group.assetIds.reverse()

  assert.equal(
    createKorpUiRuntimeCatalogSource(createKorpUiRuntimePlan({
      inventory: reorderedInventory,
      allowlist: reorderedAllowlist,
    })),
    createKorpUiRuntimeCatalogSource(plan),
  )
})

test('unsafe, unknown, reference-only and composite IDs fail closed', () => {
  const unsafeAllowlist = clone(allowlist)
  unsafeAllowlist.groups[0].assetIds[0] = '../unsafe.asset'
  assert.throws(
    () => createKorpUiRuntimePlan({ inventory, allowlist: unsafeAllowlist }),
    /unsafe runtime semantic ID/,
  )

  const unknownAllowlist = clone(allowlist)
  unknownAllowlist.groups[0].assetIds[0] = 'missing.asset'
  assert.throws(
    () => createKorpUiRuntimePlan({ inventory, allowlist: unknownAllowlist }),
    /references unknown inventory asset: missing\.asset/,
  )

  const referenceAllowlist = clone(allowlist)
  referenceAllowlist.groups[0].assetIds[0] = 'button.audit.reference'
  assert.throws(
    () => createKorpUiRuntimePlan({ inventory, allowlist: referenceAllowlist }),
    (error) => error instanceof KorpUiRuntimeBuildError
      && error.message.includes('button.audit.reference is not production')
      && error.message.includes('/reference'),
  )

  const templateAllowlist = clone(allowlist)
  templateAllowlist.groups[0].assetIds[0] = 'document.audit_00a.template'
  assert.throws(
    () => createKorpUiRuntimePlan({ inventory, allowlist: templateAllowlist }),
    (error) => error instanceof KorpUiRuntimeBuildError
      && error.message.includes('document.audit_00a.template contains baked text')
      && error.message.includes('document-template'),
  )

  const compositeAllowlist = clone(allowlist)
  compositeAllowlist.groups[0].assetIds[0] = 'window.audit.composite_blank'
  assert.throws(
    () => createKorpUiRuntimePlan({ inventory, allowlist: compositeAllowlist }),
    /window-composite/,
  )
})

test('generated catalog exposes semantic URLs and canonical @2x family geometry', () => {
  assert.equal(KORP_UI_ASSET_CATALOG.length, 45)
  assert.deepEqual(KORP_UI_RUNTIME_ASSET_IDS, [...KORP_UI_RUNTIME_ASSET_IDS].sort())
  assert.equal(resolveKorpUiAsset('missing.asset'), null)
  assert.equal(resolveKorpUiAsset('../unsafe.asset'), null)

  const auditFrame = resolveKorpUiAsset('window.audit.frame')
  assert.equal(auditFrame.intrinsicWidth, 346)
  assert.equal(auditFrame.intrinsicHeight, 328)
  assert.equal(auditFrame.family, 'audit')
  assert.match(auditFrame.runtimeUrl, /window\.audit\.frame\.png$/)
  assert.deepEqual(resolveKorpUiWindowFamily('audit'), {
    id: 'audit',
    outerWidth: 346,
    outerHeight: 328,
    contentRect: { x: 16, y: 56, width: 314, height: 256 },
    frameId: 'window.audit.frame',
    contentId: 'window.audit.content',
  })
  assert.deepEqual(resolveKorpUiWindowFamily('folder'), {
    id: 'folder',
    outerWidth: 344,
    outerHeight: 310,
    contentRect: { x: 16, y: 56, width: 312, height: 238 },
    frameId: 'window.folder.frame',
    contentId: 'window.folder.content',
  })
})

test('catalog contains no absolute paths or raw source references', () => {
  const catalogSource = createKorpUiRuntimeCatalogSource(plan)
  assert.equal(/[a-z]:[\\/]/i.test(catalogSource), false)
  assert.equal(catalogSource.includes('design/ui-source'), false)
  assert.equal(catalogSource.includes('assets/native'), false)
  assert.equal(catalogSource.includes('assets/webp'), false)
})

test('runtime output check rejects extras, byte drift and catalog drift', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-build-fixture-'))
  try {
    const catalogSource = createKorpUiRuntimeCatalogSource(plan)
    const sourceCopies = createRuntimeFixture(fixtureRoot, catalogSource)
    checkKorpUiRuntimeOutput({ repoRoot: fixtureRoot, plan, sourceCopies, catalogSource })

    writeFileSync(join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT, 'extra.png'), 'extra')
    assert.throws(
      () => checkKorpUiRuntimeOutput({ repoRoot: fixtureRoot, plan, sourceCopies, catalogSource }),
      /exactly the generated @2x allowlist/,
    )
    rmSync(join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT, 'extra.png'))

    const firstCopy = sourceCopies[0]
    writeFileSync(join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT, firstCopy.entry.targetName), 'drift')
    assert.throws(
      () => checkKorpUiRuntimeOutput({ repoRoot: fixtureRoot, plan, sourceCopies, catalogSource }),
      (error) => error.message.includes('runtime asset differs from @2x source')
        && error.message.includes('invalid PNG header'),
    )
    copyFileSync(
      join(repoRoot, KORP_UI_RUNTIME_ASSET_ROOT, firstCopy.entry.targetName),
      join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT, firstCopy.entry.targetName),
    )

    writeFileSync(join(fixtureRoot, KORP_UI_RUNTIME_CATALOG_PATH), `${catalogSource}\n`)
    assert.throws(
      () => checkKorpUiRuntimeOutput({ repoRoot: fixtureRoot, plan, sourceCopies, catalogSource }),
      /runtime catalog has generated drift/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('runtime generation refuses an expected-name symlink without following it', (context) => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-symlink-fixture-'))
  try {
    const catalogSource = createKorpUiRuntimeCatalogSource(plan)
    const sourceCopies = createRuntimeFixture(fixtureRoot, catalogSource)
    const firstCopy = sourceCopies[0]
    const targetPath = join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT, firstCopy.entry.targetName)
    const outsidePath = join(fixtureRoot, 'outside.png')
    const outsideBytes = Buffer.from('must not be overwritten')
    writeFileSync(outsidePath, outsideBytes)
    rmSync(targetPath)
    try {
      symlinkSync(outsidePath, targetPath, 'file')
    } catch (error) {
      if (error.code === 'EPERM') {
        context.skip('file symlinks require Windows Developer Mode or elevated privileges')
        return
      }
      throw error
    }

    assert.throws(
      () => writeKorpUiRuntimeOutput({ repoRoot: fixtureRoot, plan, sourceCopies, catalogSource }),
      /runtime asset target must be a regular file before generation/,
    )
    assert.deepEqual(readFileSync(outsidePath), outsideBytes)
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('committed runtime subset is byte-identical, dimension-clean and has no extras', () => {
  const summary = buildKorpUiRuntime({ repoRoot, checkOnly: true })
  assert.deepEqual(summary, {
    assets: 45,
    bytes: 480366,
    groups: 6,
    windowFamilies: 2,
  })
})

function createRuntimeFixture(fixtureRoot, catalogSource) {
  const runtimeRoot = join(fixtureRoot, KORP_UI_RUNTIME_ASSET_ROOT)
  const catalogPath = join(fixtureRoot, KORP_UI_RUNTIME_CATALOG_PATH)
  mkdirSync(runtimeRoot, { recursive: true })
  mkdirSync(dirname(catalogPath), { recursive: true })
  const sourceCopies = plan.entries.map((entry) => {
    const sourcePath = join(repoRoot, KORP_UI_RUNTIME_ASSET_ROOT, entry.targetName)
    const bytes = readFileSync(sourcePath)
    copyFileSync(sourcePath, join(runtimeRoot, entry.targetName))
    return { entry, sourcePath, bytes }
  })
  writeFileSync(catalogPath, catalogSource)
  return sourceCopies
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), 'utf8'))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
