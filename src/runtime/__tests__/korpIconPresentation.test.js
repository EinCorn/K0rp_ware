import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  KORP_ICON_CATALOG,
  KORP_RUNTIME_ICON_IDS,
  getKorpIcon,
  resolveKorpRuntimeIcon,
} from '../../ui/korpIconCatalog.js'
import {
  KORP_DESKTOP_ICON_IDS,
  KORP_FOLDER_ICON_IDS,
  KORP_VISIBLE_LOCKED_MODULE_ICON_IDS,
  getKorpModuleIconId,
  isKorpDesktopItemActionable,
} from '../korpIconPresentation.js'
import { getFidgetDesktopItems } from '../fidgetPresentation.js'

test('canonical catalog keeps all source IDs unique and deploys only current-surface PNGs', () => {
  assert.equal(KORP_ICON_CATALOG.length, 32)
  assert.equal(new Set(KORP_ICON_CATALOG.map(({ id }) => id)).size, 32)
  assert.equal(KORP_RUNTIME_ICON_IDS.length, 12)

  for (const id of [
    ...Object.values(KORP_DESKTOP_ICON_IDS),
    ...Object.values(KORP_FOLDER_ICON_IDS),
    ...KORP_VISIBLE_LOCKED_MODULE_ICON_IDS,
  ]) {
    const icon = resolveKorpRuntimeIcon(id)
    assert.equal(icon?.id, id)
    assert.equal(icon.intrinsicWidth, 64)
    assert.equal(icon.intrinsicHeight, 64)
  }

  for (const id of [
    ...Object.values(KORP_DESKTOP_ICON_IDS),
    ...KORP_VISIBLE_LOCKED_MODULE_ICON_IDS,
  ]) {
    assert.equal(resolveKorpRuntimeIcon(id)?.intendedSize, 32)
  }
  for (const id of Object.values(KORP_FOLDER_ICON_IDS)) {
    assert.equal(resolveKorpRuntimeIcon(id)?.intendedSize, 24)
  }

  assert.equal(getKorpIcon('bloom')?.runtimeUrl, null)
  assert.equal(resolveKorpRuntimeIcon('bloom'), null)
  assert.equal(getKorpIcon('unknown-icon'), null)
  assert.equal(resolveKorpRuntimeIcon('../escape'), null)
})

test('current desktop entities and folder rows keep one intended semantic icon each', () => {
  assert.deepEqual(KORP_DESKTOP_ICON_IDS, {
    complianceBin: 'compliance-bin',
    inbox: 'inbox',
    forms: 'forms',
    clickAudit: 'click-audit',
    fidget: 'fidget',
  })
  assert.deepEqual(KORP_FOLDER_ICON_IDS, {
    auditEntry: 'audit-generic',
    auditPacket: 'audit-packet',
    authorizationForm: 'audit-generic',
    evidenceArchive: 'evidence',
    memo: 'memo',
    startupDocument: 'document',
  })
  assert.equal(getKorpModuleIconId('corner-watch'), 'corner-watch')
  assert.equal(getKorpModuleIconId('bubble-wrap'), 'bubble-wrap')
  assert.equal(getKorpModuleIconId('button-compliance'), null)
})

test('authorized Fidget keeps one icon and locked items remain non-actionable', () => {
  const items = getFidgetDesktopItems([
    { id: 'fidget-1', moduleId: 'fidget' },
    { id: 'fidget-2', moduleId: 'fidget' },
  ])

  assert.equal(items.length, 1)
  assert.equal(items[0].iconId, KORP_DESKTOP_ICON_IDS.fidget)
  assert.equal(isKorpDesktopItemActionable({ isLocked: true, onOpen() {} }), false)
  assert.equal(isKorpDesktopItemActionable({ isLocked: false, onOpen() {} }), true)
  assert.equal(isKorpDesktopItemActionable({ isLocked: false }), false)
})

test('canonical current paths have no CSS fallback letters or document codes', () => {
  const css = readFileSync(new URL('../../components/KorpOsShell.css', import.meta.url), 'utf8')

  for (const obsoleteContent of ["content: 'K'", "content: 'TXT'", "content: '10-A'", "content: '00-A'", "content: 'MEM'"]) {
    assert.equal(css.includes(obsoleteContent), false, obsoleteContent)
  }
})
