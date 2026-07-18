import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  KORP_V3_FOLDER_ROW_MATERIAL_ID,
  KORP_V3_PILOT_WINDOW_IDS,
  getKorpV3AuditButtonAssetId,
  getKorpV3CheckboxAssetId,
  getKorpV3TitlebarAssetId,
  getKorpV3WindowControlAssetId,
  getKorpV3WindowControlPresentation,
  getKorpV3WindowGeometry,
  presentKorpV3FolderRow,
} from '../korpV3WindowPresentation.js'
import {
  closeWindowState,
  getCenteredWindowPosition,
  minimizeWindowState,
  openWindowState,
  restoreWindowState,
  snapWindowPosition,
} from '../windowManager.js'

test('pilot families render density assets at documented native window geometry', () => {
  assert.deepEqual(KORP_V3_PILOT_WINDOW_IDS, {
    auditEntry: 'form:audit-00-a',
    formsFolder: 'forms-folder',
  })

  for (const [family, expected] of [
    ['audit', { width: 173, height: 164, contentWidth: 157, contentHeight: 128 }],
    ['folder', { width: 172, height: 155, contentWidth: 156, contentHeight: 119 }],
  ]) {
    const geometry = getKorpV3WindowGeometry(family)
    assert.equal(geometry.width, expected.width)
    assert.equal(geometry.height, expected.height)
    assert.equal(geometry.contentRect.width, expected.contentWidth)
    assert.equal(geometry.contentRect.height, expected.contentHeight)

    for (const value of [
      geometry.width,
      geometry.height,
      ...Object.values(geometry.contentRect),
      ...geometry.slices.columns,
      ...geometry.slices.rows,
    ]) {
      assert.equal(Number.isInteger(value), true)
      assert.equal(value >= 0, true)
    }

    assert.equal(geometry.slices.columns.reduce((sum, value) => sum + value, 0), geometry.width)
    assert.equal(geometry.slices.rows.reduce((sum, value) => sum + value, 0), geometry.height)
  }

  assert.equal(getKorpV3WindowGeometry('standard_module'), null)
})

test('titlebar and controls map focus and interaction states to semantic catalog ids', () => {
  assert.equal(getKorpV3TitlebarAssetId(true), 'titlebar.active.blank')
  assert.equal(getKorpV3TitlebarAssetId(false), 'titlebar.inactive.blank')

  for (const action of ['minimize', 'close']) {
    for (const state of ['normal', 'hover', 'pressed', 'disabled']) {
      assert.equal(
        getKorpV3WindowControlAssetId(action, state),
        `control.window.${action}.${state}`,
      )
    }
  }

  assert.equal(getKorpV3WindowControlPresentation('minimize').keepsWindowOpen, true)
  assert.equal(getKorpV3WindowControlPresentation('close').keepsWindowOpen, false)
  assert.equal(getKorpV3WindowControlAssetId('maximize'), null)
  assert.equal(getKorpV3WindowControlAssetId('close', 'unknown'), null)
})

test('Audit 00-A controls retain live semantics while selecting V3 presentation states', () => {
  assert.equal(getKorpV3CheckboxAssetId(), 'check.checkbox.off')
  assert.equal(getKorpV3CheckboxAssetId({ checked: true }), 'check.checkbox.on')
  assert.equal(
    getKorpV3CheckboxAssetId({ checked: true, disabled: true }),
    'check.checkbox.disabled',
  )

  for (const state of ['normal', 'hover', 'pressed', 'disabled']) {
    assert.equal(getKorpV3AuditButtonAssetId(state), `button.audit.${state}`)
  }
  assert.equal(getKorpV3AuditButtonAssetId('unknown'), null)
})

test('Formulare rows keep dynamic content and canonical icon ids over one blank material', () => {
  const onOpen = () => {}
  const row = presentKorpV3FolderRow({
    stableId: 'form:audit-instance-10-a-3',
    title: 'Audit 10-A / 41–60',
    detail: '20 kliků / rozsah 41–60',
    status: 'ČEKÁ NA AUDIT',
    iconId: 'audit-packet',
    isLocked: false,
    onOpen,
  })

  assert.equal(row.materialId, KORP_V3_FOLDER_ROW_MATERIAL_ID)
  assert.equal(row.stableId, 'form:audit-instance-10-a-3')
  assert.equal(row.title, 'Audit 10-A / 41–60')
  assert.equal(row.status, 'ČEKÁ NA AUDIT')
  assert.equal(row.iconId, 'audit-packet')
  assert.equal(row.onOpen, onOpen)
  assert.equal(presentKorpV3FolderRow(null), null)
})

test('existing center and clamp helpers keep both pilot families inside the fixed workspace', () => {
  const workspace = { width: 1514, height: 776 }

  for (const family of ['audit', 'folder']) {
    const geometry = getKorpV3WindowGeometry(family)
    const centered = getCenteredWindowPosition(workspace, geometry)
    assert.deepEqual(snapWindowPosition(centered, workspace, geometry), centered)
    assert.equal(centered.x >= 0, true)
    assert.equal(centered.y >= 0, true)
    assert.equal(centered.x + geometry.width <= workspace.width, true)
    assert.equal(centered.y + geometry.height <= workspace.height, true)
  }
})

test('pilot descriptors retain distinct close, minimize, restore, and reopen semantics', () => {
  const geometry = getKorpV3WindowGeometry('audit')
  const initialPosition = { x: 184, y: 58 }
  const windows = {
    [KORP_V3_PILOT_WINDOW_IDS.auditEntry]: {
      id: KORP_V3_PILOT_WINDOW_IDS.auditEntry,
      kind: 'form',
      documentId: 'audit-00-a',
      ...geometry,
      ...initialPosition,
      zIndex: 3,
      isOpen: true,
      isMinimized: false,
      hasOpened: true,
    },
  }

  const minimized = minimizeWindowState(windows, KORP_V3_PILOT_WINDOW_IDS.auditEntry)
  assert.equal(minimized[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isOpen, true)
  assert.equal(minimized[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isMinimized, true)
  assert.deepEqual(
    { x: minimized[KORP_V3_PILOT_WINDOW_IDS.auditEntry].x, y: minimized[KORP_V3_PILOT_WINDOW_IDS.auditEntry].y },
    initialPosition,
  )

  const restored = restoreWindowState(minimized, KORP_V3_PILOT_WINDOW_IDS.auditEntry)
  assert.equal(restored[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isOpen, true)
  assert.equal(restored[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isMinimized, false)

  const closed = closeWindowState(restored, KORP_V3_PILOT_WINDOW_IDS.auditEntry)
  assert.equal(closed[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isOpen, false)
  assert.equal(closed[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isMinimized, false)

  const reopened = openWindowState(closed, KORP_V3_PILOT_WINDOW_IDS.auditEntry, {
    workspaceSize: { width: 1514, height: 776 },
    formBasePosition: { x: 184, y: 58 },
  })
  assert.equal(reopened[KORP_V3_PILOT_WINDOW_IDS.auditEntry].isOpen, true)
  assert.deepEqual(
    { x: reopened[KORP_V3_PILOT_WINDOW_IDS.auditEntry].x, y: reopened[KORP_V3_PILOT_WINDOW_IDS.auditEntry].y },
    initialPosition,
  )
})

test('source boundary applies the V3 skin only to Audit 00-A and Formulare', () => {
  const shell = readFileSync(new URL('../../components/KorpOsShell.jsx', import.meta.url), 'utf8')
  const auditDocument = readFileSync(
    new URL('../../components/AuditFormDocument.jsx', import.meta.url),
    'utf8',
  )
  const shellCss = readFileSync(new URL('../../components/KorpOsShell.css', import.meta.url), 'utf8')

  assert.equal(shell.match(/visualVariant="v3-audit"/g)?.length, 1)
  assert.equal(shell.match(/family="audit"/g)?.length, 1)
  assert.equal(shell.match(/family="folder"/g)?.length, 1)
  assert.match(shell, /os-authorization-audit-window/)
  assert.match(shell, /os-packet-audit-window/)
  assert.match(shell, /os-inbox-folder-window/)
  assert.match(auditDocument, /visualVariant = 'legacy'/)
  assert.match(shellCss, /\.os-forms-folder-window \.os-folder-body \{[\s\S]*?overflow-y: auto;/)
  assert.match(
    shellCss,
    /\.korp-v3-window-folder \.os-folder-entry\.is-v3-folder-row \.os-file-glyph \{[\s\S]*?background: #111515;/,
  )
})
