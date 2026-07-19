import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FIDGET_DEPLOYED_DESKTOP_ITEM,
  FIDGET_WINDOW_ID,
  FIDGET_WINDOW_SIZE,
  getFidgetDesktopItems,
  isFidgetSurfaceAvailable,
  reconcileFidgetWindow,
} from '../fidgetPresentation.js'
import {
  minimizeWindowState,
  openWindowState,
} from '../windowManager.js'

const workspaceSize = { width: 1514, height: 776 }
const authorizations = [{ id: 'authorization:fidget', moduleId: 'fidget' }]

test('Fidget has no shortcut or window surface before authorization', () => {
  const windows = { memo: { id: 'memo' } }

  assert.equal(isFidgetSurfaceAvailable([]), false)
  assert.deepEqual(getFidgetDesktopItems([]), [])
  assert.equal(reconcileFidgetWindow({ windows, moduleAuthorizations: [] }), windows)
  assert.equal(FIDGET_WINDOW_ID in windows, false)
})

test('authorized presentation produces exactly one actionable deployed item', () => {
  const items = getFidgetDesktopItems([
    ...authorizations,
    { id: 'authorization:fidget:duplicate', moduleId: 'fidget' },
  ])

  assert.deepEqual(items, [FIDGET_DEPLOYED_DESKTOP_ITEM])
  assert.equal(items[0].windowId, FIDGET_WINDOW_ID)
  assert.equal(items[0].status, 'AUTORIZOVÁNO / NASAZENO')
  assert.equal(items[0].isInteractive, true)
})

test('authorized Fidget reconciles to one closed real module descriptor without auto-opening', () => {
  const once = reconcileFidgetWindow({ windows: {}, moduleAuthorizations: authorizations })
  const twice = reconcileFidgetWindow({ windows: once, moduleAuthorizations: authorizations })

  assert.equal(once, twice)
  assert.deepEqual(Object.keys(once), [FIDGET_WINDOW_ID])
  assert.equal(once[FIDGET_WINDOW_ID].surface, 'fidget')
  assert.equal(once[FIDGET_WINDOW_ID].kind, 'module')
  assert.equal(once[FIDGET_WINDOW_ID].title, 'Fidget / Místní modul')
  assert.equal(once[FIDGET_WINDOW_ID].isPinned, false)
  assert.equal(once[FIDGET_WINDOW_ID].isOpen, false)
  assert.equal(once[FIDGET_WINDOW_ID].hasOpened, false)
  assert.equal('placeholder' in once[FIDGET_WINDOW_ID], false)
})

test('first open centers Fidget while activation and minimized restore preserve position', () => {
  const reconciled = reconcileFidgetWindow({
    windows: {},
    moduleAuthorizations: authorizations,
  })
  const opened = openWindowState(reconciled, FIDGET_WINDOW_ID, { workspaceSize })

  assert.deepEqual(
    { x: opened[FIDGET_WINDOW_ID].x, y: opened[FIDGET_WINDOW_ID].y },
    { x: 666, y: 277 },
  )
  assert.deepEqual(
    { width: opened[FIDGET_WINDOW_ID].width, height: opened[FIDGET_WINDOW_ID].height },
    FIDGET_WINDOW_SIZE,
  )

  const moved = {
    ...opened,
    [FIDGET_WINDOW_ID]: { ...opened[FIDGET_WINDOW_ID], x: 412, y: 206 },
  }
  const activated = openWindowState(moved, FIDGET_WINDOW_ID, { workspaceSize })
  const restored = openWindowState(
    minimizeWindowState(activated, FIDGET_WINDOW_ID),
    FIDGET_WINDOW_ID,
    { workspaceSize },
  )

  assert.deepEqual(
    { x: activated[FIDGET_WINDOW_ID].x, y: activated[FIDGET_WINDOW_ID].y },
    { x: 412, y: 206 },
  )
  assert.deepEqual(
    { x: restored[FIDGET_WINDOW_ID].x, y: restored[FIDGET_WINDOW_ID].y },
    { x: 412, y: 206 },
  )
  assert.equal(restored[FIDGET_WINDOW_ID].isMinimized, false)
})
