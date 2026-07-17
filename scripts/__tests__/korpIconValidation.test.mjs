import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  KORP_REQUIRED_CURRENT_ICON_IDS,
  KORP_RUNTIME_ICON_SELECTIONS,
} from '../korp-icon-contract.mjs'
import {
  KorpIconValidationError,
  parseKorpIconManifest,
  resolvePathInside,
  validateKorpIconManifest,
  validateKorpIconPack,
} from '../lib/korp-icon-validation.mjs'

const baseIcon = {
  id: 'click-audit',
  title: 'ClickAudit',
  group: 'modules',
  category: 'AUDIT / CONFIRMATION',
}

const baseManifest = () => ({
  name: 'Fixture',
  sourceSize: 64,
  icons: [{ ...baseIcon }],
})

const selection = { id: 'click-audit', slots: ['desktop'], intendedSize: 40 }

test('the required current-surface contract stays independent from runtime selections', () => {
  assert.deepEqual(KORP_REQUIRED_CURRENT_ICON_IDS, [
    'compliance-bin',
    'inbox',
    'forms',
    'click-audit',
    'fidget',
    'corner-watch',
    'bubble-wrap',
    'audit-packet',
    'audit-generic',
    'evidence',
    'memo',
    'document',
  ])

  const manifest = {
    sourceSize: 64,
    icons: KORP_REQUIRED_CURRENT_ICON_IDS.map((id) => ({
      id,
      title: id,
      group: id === 'click-audit' || id === 'fidget' || id === 'corner-watch' || id === 'bubble-wrap'
        ? 'modules'
        : 'system',
      category: 'fixture',
    })),
  }

  assert.throws(
    () => validateKorpIconManifest(manifest, {
      runtimeSelections: KORP_RUNTIME_ICON_SELECTIONS.filter(({ id }) => id !== 'forms'),
      requiredCurrentIds: KORP_REQUIRED_CURRENT_ICON_IDS,
    }),
    /missing required current-surface icon mapping: forms/,
  )
})

test('malformed icon manifest fails with a deterministic diagnostic', () => {
  assert.throws(
    () => parseKorpIconManifest('{ broken'),
    (error) => error instanceof KorpIconValidationError
      && error.message.includes('manifest.json is malformed'),
  )
})

test('duplicate semantic IDs and missing current mappings fail validation', () => {
  const duplicateManifest = baseManifest()
  duplicateManifest.icons.push({ ...baseIcon })

  assert.throws(
    () => validateKorpIconManifest(duplicateManifest),
    /duplicate semantic icon id: click-audit/,
  )

  assert.throws(
    () => validateKorpIconManifest(baseManifest(), {
      runtimeSelections: [],
      requiredCurrentIds: ['click-audit'],
    }),
    /missing required current-surface icon mapping: click-audit/,
  )
})

test('unsafe paths and invalid declared dimensions fail safely', () => {
  assert.throws(
    () => resolvePathInside('icons', '../escape.png', 'fixture path'),
    /fixture path escapes its allowed root/,
  )

  const unsafeManifest = baseManifest()
  unsafeManifest.icons[0].variants = { locked: '../escape.png' }
  unsafeManifest.icons[0].dimensions = { width: 0, height: 64 }

  assert.throws(
    () => validateKorpIconManifest(unsafeManifest, {
      runtimeSelections: [selection],
      requiredCurrentIds: ['click-audit'],
    }),
    (error) => (
      error.message.includes('dimensions must contain positive integer width/height')
      && error.message.includes('variants.locked escapes its allowed root')
    ),
  )
})

test('state variants must be safe regular PNG references', () => {
  const invalidVariantManifest = baseManifest()
  invalidVariantManifest.icons[0].variants = { locked: '.' }

  assert.throws(
    () => validateKorpIconManifest(invalidVariantManifest, {
      runtimeSelections: [selection],
      requiredCurrentIds: ['click-audit'],
    }),
    /variants.locked must reference a PNG asset/,
  )
})

test('a PNG-named state variant directory is rejected as a non-file reference', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-icon-variant-fixture-'))

  try {
    mkdirSync(join(fixtureRoot, 'locked.png'))
    const directoryVariantManifest = baseManifest()
    directoryVariantManifest.icons[0].variants = { locked: 'locked.png' }

    assert.throws(
      () => validateKorpIconPack({
        rawRoot: fixtureRoot,
        manifest: directoryVariantManifest,
        runtimeSelections: [selection],
        requiredCurrentIds: ['click-audit'],
      }),
      /state variant must be a regular file for click-audit.locked/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('missing convention-backed source assets fail pack validation', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-icon-fixture-'))

  try {
    assert.throws(
      () => validateKorpIconPack({
        rawRoot: fixtureRoot,
        manifest: baseManifest(),
        runtimeSelections: [selection],
        requiredCurrentIds: ['click-audit'],
      }),
      /missing referenced asset for click-audit/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})
