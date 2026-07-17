import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FORM_WINDOW_CASCADE_OFFSET,
  bringWindowStateToFront,
  closeWindowState,
  ensureFormWindowState,
  fitCanvasScale,
  getCascadedWindowPosition,
  getCenteredCanvasPlacement,
  getCenteredWindowPosition,
  getFormWindowId,
  mapClientPointToCanvas,
  minimizeWindowState,
  openWindowState,
  restoreWindowState,
  snapWindowPosition,
} from '../windowManager.js'

const windows = {
  audit: { id: 'audit', x: 184, y: 58, isOpen: true, isMinimized: false, zIndex: 2 },
  clickaudit: { id: 'clickaudit', x: 250, y: 250, isOpen: true, isMinimized: true, zIndex: 1 },
}

const workspaceSize = { width: 1514, height: 776 }
const formWindowSize = { width: 470, height: 310 }
const formBasePosition = { x: 184, y: 58 }

test('minimize marks an open window without closing it', () => {
  const next = minimizeWindowState(windows, 'audit')
  assert.equal(next.audit.isOpen, true)
  assert.equal(next.audit.isMinimized, true)
})

test('close removes an open or minimized window from open state while preserving placement', () => {
  const minimized = minimizeWindowState(windows, 'audit')
  const closed = closeWindowState(minimized, 'audit')

  assert.equal(closed.audit.isOpen, false)
  assert.equal(closed.audit.isMinimized, false)
  assert.deepEqual(
    { x: closed.audit.x, y: closed.audit.y, zIndex: closed.audit.zIndex },
    { x: 184, y: 58, zIndex: 2 },
  )
  assert.deepEqual(
    Object.keys(closed).filter((id) => closed[id].isOpen),
    ['clickaudit'],
  )
  assert.equal(closeWindowState(closed, 'audit'), closed)
  assert.equal(closeWindowState(closed, 'missing'), closed)
})

test('reopening a closed descriptor preserves x/y and never duplicates the window', () => {
  const formWindowId = 'form:audit-instance-a'
  const opened = {
    folder: {
      id: 'folder', kind: 'folder', width: 360, height: 268,
      x: 600, y: 250, zIndex: 9, isOpen: true, isMinimized: false, hasOpened: true,
    },
    [formWindowId]: {
      id: formWindowId, documentId: 'audit-instance-a', kind: 'form',
      width: 470, height: 310, x: 412, y: 206, zIndex: 8,
      isOpen: true, isMinimized: false, hasOpened: true,
    },
  }
  const closed = closeWindowState(opened, formWindowId)
  const reopened = openWindowState(closed, formWindowId, {
    workspaceSize,
    formBasePosition,
  })

  assert.equal(reopened[formWindowId].isOpen, true)
  assert.equal(reopened[formWindowId].isMinimized, false)
  assert.equal(reopened[formWindowId].hasOpened, true)
  assert.deepEqual(
    { x: reopened[formWindowId].x, y: reopened[formWindowId].y },
    { x: 412, y: 206 },
  )
  assert.equal(reopened[formWindowId].zIndex, 10)
  assert.equal(Object.keys(reopened).filter((id) => id === formWindowId).length, 1)
})

test('closing pending or certified audit windows cannot mutate audit or Evidence data', () => {
  const pendingId = 'form:audit-pending'
  const certifiedId = 'form:audit-certified'
  const runtimeState = {
    auditInstances: [
      { id: 'audit-pending', packetId: 'packet-pending', status: 'available', values: {} },
      { id: 'audit-certified', packetId: 'packet-certified', status: 'submitted', values: { intentionality: 'Ano' } },
    ],
    metricPackets: [
      { id: 'packet-pending', status: 'pending' },
      { id: 'packet-certified', status: 'certified' },
    ],
    korpState: { resources: { notionalWorkUnits: 1 } },
  }
  const runtimeSnapshot = structuredClone(runtimeState)
  const auditWindows = {
    [pendingId]: {
      id: pendingId, documentId: 'audit-pending', kind: 'form', width: 470, height: 310,
      x: 300, y: 180, zIndex: 4, isOpen: true, isMinimized: false, hasOpened: true,
    },
    [certifiedId]: {
      id: certifiedId, documentId: 'audit-certified', kind: 'form', width: 470, height: 310,
      x: 318, y: 194, zIndex: 5, isOpen: true, isMinimized: false, hasOpened: true,
    },
  }

  const pendingClosed = closeWindowState(auditWindows, pendingId)
  const bothClosed = closeWindowState(pendingClosed, certifiedId)

  assert.equal(bothClosed[pendingId].isOpen, false)
  assert.equal(bothClosed[certifiedId].isOpen, false)
  assert.deepEqual(runtimeState, runtimeSnapshot)
  assert.equal(runtimeState.auditInstances[0].status, 'available')
  assert.equal(runtimeState.auditInstances[1].status, 'submitted')
  assert.equal(runtimeState.metricPackets[0].status, 'pending')
  assert.equal(runtimeState.metricPackets[1].status, 'certified')
  assert.equal(runtimeState.korpState.resources.notionalWorkUnits, 1)
})

test('taskbar restore reopens a minimized window and brings it forward', () => {
  const next = restoreWindowState(windows, 'clickaudit')
  assert.equal(next.clickaudit.isOpen, true)
  assert.equal(next.clickaudit.isMinimized, false)
  assert.equal(next.clickaudit.zIndex, 3)
  assert.deepEqual(
    { x: next.clickaudit.x, y: next.clickaudit.y },
    { x: 250, y: 250 },
  )
})

test('bring to front preserves an already visible window', () => {
  const next = bringWindowStateToFront(windows, 'audit')
  assert.equal(next.audit.isMinimized, false)
  assert.equal(next.audit.zIndex, 3)
  assert.deepEqual({ x: next.audit.x, y: next.audit.y }, { x: 184, y: 58 })
})

test('first opening centers a non-form window while activation and restore preserve position', () => {
  const closedWindows = {
    clickaudit: {
      id: 'clickaudit',
      kind: 'module',
      width: 181,
      height: 181,
      x: 250,
      y: 250,
      zIndex: 0,
      isOpen: false,
      isMinimized: false,
      hasOpened: false,
    },
  }
  const firstOpen = openWindowState(closedWindows, 'clickaudit', { workspaceSize })

  assert.deepEqual(
    { x: firstOpen.clickaudit.x, y: firstOpen.clickaudit.y },
    { x: 667, y: 298 },
  )
  assert.equal(firstOpen.clickaudit.hasOpened, true)

  const moved = {
    ...firstOpen,
    clickaudit: { ...firstOpen.clickaudit, x: 720, y: 340 },
  }
  const activated = openWindowState(moved, 'clickaudit', { workspaceSize })
  assert.deepEqual(
    { x: activated.clickaudit.x, y: activated.clickaudit.y },
    { x: 720, y: 340 },
  )

  const minimized = minimizeWindowState(activated, 'clickaudit')
  const restored = openWindowState(minimized, 'clickaudit', { workspaceSize })
  assert.deepEqual(
    { x: restored.clickaudit.x, y: restored.clickaudit.y },
    { x: 720, y: 340 },
  )
  assert.equal(restored.clickaudit.isMinimized, false)

  assert.equal(openWindowState(closedWindows, 'clickaudit'), closedWindows)
})

test('form window ids are stable and unique per document instance', () => {
  assert.equal(getFormWindowId('audit-00-a'), 'form:audit-00-a')
  assert.equal(getFormWindowId('audit-10-a:clickaudit-clicks-8-8'), 'form:audit-10-a:clickaudit-clicks-8-8')
  assert.equal(getFormWindowId('form:audit-00-a'), 'form:audit-00-a')
  assert.notEqual(
    getFormWindowId('audit-10-a:clickaudit-clicks-8-8'),
    getFormWindowId('audit-10-a:clickaudit-clicks-9-33'),
  )
  assert.throws(() => getFormWindowId(''), /non-empty string/)
  assert.throws(() => getFormWindowId(null), /non-empty string/)

  const prefixed = ensureFormWindowState({}, 'form:audit-instance-a', formWindowSize)
  assert.equal(prefixed['form:audit-instance-a'].documentId, 'audit-instance-a')
})

test('ensuring the same form twice keeps one descriptor and does not reopen it', () => {
  const once = ensureFormWindowState({}, 'audit-instance-a', formWindowSize)
  const minimized = {
    ...once,
    'form:audit-instance-a': {
      ...once['form:audit-instance-a'],
      x: 400,
      y: 210,
      zIndex: 4,
      isOpen: true,
      isMinimized: true,
      hasOpened: true,
    },
  }
  const twice = ensureFormWindowState(minimized, 'audit-instance-a', formWindowSize)

  assert.equal(twice, minimized)
  assert.equal(Object.keys(twice).length, 1)
  assert.equal(twice['form:audit-instance-a'].isMinimized, true)
  assert.deepEqual(
    { x: twice['form:audit-instance-a'].x, y: twice['form:audit-instance-a'].y },
    { x: 400, y: 210 },
  )
})

test('new forms cascade from the current moved position of the most recently focused form', () => {
  const initial = {
    'form:audit-00-a': {
      id: 'form:audit-00-a',
      kind: 'form',
      width: 470,
      height: 310,
      x: 184,
      y: 58,
      zIndex: 3,
      isOpen: true,
      isMinimized: false,
      hasOpened: true,
    },
    folder: {
      id: 'folder',
      kind: 'folder',
      width: 360,
      height: 268,
      x: 600,
      y: 250,
      zIndex: 20,
      isOpen: true,
      isMinimized: false,
      hasOpened: true,
    },
  }
  const withFirstDescriptor = ensureFormWindowState(initial, 'audit-instance-a', formWindowSize)
  const withFirstOpen = openWindowState(withFirstDescriptor, 'form:audit-instance-a', {
    workspaceSize,
    formBasePosition,
  })

  assert.deepEqual(
    { x: withFirstOpen['form:audit-instance-a'].x, y: withFirstOpen['form:audit-instance-a'].y },
    { x: 202, y: 72 },
  )
  assert.equal(withFirstOpen['form:audit-instance-a'].isOpen, true)
  assert.equal(withFirstOpen['form:audit-instance-a'].hasOpened, true)
  assert.equal(withFirstOpen['form:audit-instance-a'].zIndex, 21)

  const withMovedAnchor = {
    ...withFirstOpen,
    'form:audit-instance-a': {
      ...withFirstOpen['form:audit-instance-a'],
      x: 700,
      y: 300,
      zIndex: 25,
    },
  }
  const withSecondDescriptor = ensureFormWindowState(withMovedAnchor, 'audit-instance-b', formWindowSize)
  const withSecondOpen = openWindowState(withSecondDescriptor, 'form:audit-instance-b', {
    workspaceSize,
    formBasePosition,
  })

  assert.deepEqual(
    { x: withSecondOpen['form:audit-instance-b'].x, y: withSecondOpen['form:audit-instance-b'].y },
    { x: 718, y: 314 },
  )
  assert.deepEqual(FORM_WINDOW_CASCADE_OFFSET, { x: 18, y: 14 })
  assert.equal(Number.isInteger(withSecondOpen['form:audit-instance-b'].x), true)
  assert.equal(Number.isInteger(withSecondOpen['form:audit-instance-b'].y), true)
})

test('minimized focused forms remain anchors while closed forms and non-forms are ignored', () => {
  const initial = {
    'form:visible': {
      id: 'form:visible', documentId: 'visible', kind: 'form', width: 470, height: 310,
      x: 200, y: 100, zIndex: 4, isOpen: true, isMinimized: false, hasOpened: true,
    },
    'form:minimized': {
      id: 'form:minimized', documentId: 'minimized', kind: 'form', width: 470, height: 310,
      x: 640, y: 280, zIndex: 8, isOpen: true, isMinimized: true, hasOpened: true,
    },
    'form:closed': {
      id: 'form:closed', documentId: 'closed', kind: 'form', width: 470, height: 310,
      x: 900, y: 400, zIndex: 20, isOpen: false, isMinimized: false, hasOpened: true,
    },
    folder: {
      id: 'folder', kind: 'folder', width: 360, height: 268,
      x: 500, y: 200, zIndex: 30, isOpen: true, isMinimized: false, hasOpened: true,
    },
  }
  const withDescriptor = ensureFormWindowState(initial, 'next', formWindowSize)
  const opened = openWindowState(withDescriptor, 'form:next', {
    workspaceSize,
    formBasePosition,
  })

  assert.deepEqual({ x: opened['form:next'].x, y: opened['form:next'].y }, { x: 658, y: 294 })
  assert.equal(opened['form:next'].zIndex, 31)
})

test('a form without an open anchor uses the deterministic form base', () => {
  const withDescriptor = ensureFormWindowState({
    'form:closed': {
      id: 'form:closed', documentId: 'closed', kind: 'form', width: 470, height: 310,
      x: 900, y: 400, zIndex: 20, isOpen: false, isMinimized: false, hasOpened: true,
    },
  }, 'first-open-form', formWindowSize)
  const opened = openWindowState(withDescriptor, 'form:first-open-form', {
    workspaceSize,
    formBasePosition,
  })

  assert.deepEqual(
    { x: opened['form:first-open-form'].x, y: opened['form:first-open-form'].y },
    formBasePosition,
  )
})

test('cascade allows the exact edge and deterministically wraps away from occupied edge clamps', () => {
  assert.deepEqual(
    getCascadedWindowPosition(
      { x: 1026, y: 452 },
      formBasePosition,
      workspaceSize,
      formWindowSize,
    ),
    { x: 1044, y: 466 },
  )

  const wrapped = getCascadedWindowPosition(
    { x: 1044, y: 466 },
    formBasePosition,
    workspaceSize,
    formWindowSize,
    [formBasePosition, { x: 202, y: 72 }],
  )

  assert.deepEqual(wrapped, { x: 220, y: 86 })
  assert.deepEqual(
    getCascadedWindowPosition(
      { x: 1040, y: 100 },
      formBasePosition,
      workspaceSize,
      formWindowSize,
    ),
    formBasePosition,
  )
  assert.deepEqual(
    getCascadedWindowPosition(
      { x: 300, y: 460 },
      formBasePosition,
      workspaceSize,
      formWindowSize,
    ),
    formBasePosition,
  )
  assert.deepEqual(
    getCascadedWindowPosition(
      { x: 1044, y: 466 },
      formBasePosition,
      workspaceSize,
      formWindowSize,
      [formBasePosition, { x: 202, y: 72 }],
    ),
    wrapped,
  )
})

test('repeated form instances keep independent positions and taskbar restore state', () => {
  const forms = {
    'form:instance-a': {
      id: 'form:instance-a', kind: 'form', width: 470, height: 310,
      x: 300, y: 180, zIndex: 4, isOpen: true, isMinimized: false, hasOpened: true,
    },
    'form:instance-b': {
      id: 'form:instance-b', kind: 'form', width: 470, height: 310,
      x: 318, y: 194, zIndex: 5, isOpen: true, isMinimized: false, hasOpened: true,
    },
  }
  const minimizedFirst = minimizeWindowState(forms, 'form:instance-a')
  const restoredFirst = openWindowState(minimizedFirst, 'form:instance-a', { workspaceSize })

  assert.deepEqual(
    { x: restoredFirst['form:instance-a'].x, y: restoredFirst['form:instance-a'].y },
    { x: 300, y: 180 },
  )
  assert.equal(restoredFirst['form:instance-a'].isMinimized, false)
  assert.deepEqual(restoredFirst['form:instance-b'], forms['form:instance-b'])

  const minimizedSecond = minimizeWindowState(restoredFirst, 'form:instance-b')
  assert.equal(minimizedSecond['form:instance-a'].isMinimized, false)
  assert.equal(minimizedSecond['form:instance-b'].isMinimized, true)
  assert.deepEqual(
    { x: minimizedSecond['form:instance-b'].x, y: minimizedSecond['form:instance-b'].y },
    { x: 318, y: 194 },
  )
})

test('canvas scale preserves aspect ratio and never scales above one', () => {
  assert.equal(fitCanvasScale(1920, 1080, 1520, 855), 1)
  assert.equal(fitCanvasScale(1600, 900, 1520, 855), 1)
  assert.equal(fitCanvasScale(760, 855, 1520, 855), 0.5)
  assert.equal(fitCanvasScale(1366, 768, 1520, 855), 768 / 855)
})

test('canvas placement keeps letterboxing centered on integer screen coordinates', () => {
  assert.deepEqual(
    getCenteredCanvasPlacement(1920, 1080, 1520, 855),
    { scale: 1, left: 200, top: 113 },
  )
  assert.deepEqual(
    getCenteredCanvasPlacement(1600, 900, 1520, 855),
    { scale: 1, left: 40, top: 23 },
  )
  assert.deepEqual(
    getCenteredCanvasPlacement(1600, 800, 1520, 855),
    { scale: 800 / 855, left: 89, top: 0 },
  )
  assert.deepEqual(
    getCenteredCanvasPlacement(800, 600, 1520, 855),
    { scale: 800 / 1520, left: 0, top: 75 },
  )

  const reduced = getCenteredCanvasPlacement(1366, 768, 1520, 855)
  assert.equal(reduced.scale, 768 / 855)
  assert.equal(reduced.left, 0)
  assert.equal(reduced.top, 0)
  assert.equal(Number.isInteger(reduced.left), true)
  assert.equal(Number.isInteger(reduced.top), true)
})

test('pointer coordinates map to the same canvas point at full and reduced scale', () => {
  const layoutSize = { width: 1514, height: 776 }
  const fullScalePoint = mapClientPointToCanvas(
    { x: 300, y: 150 },
    { left: 100, top: 50, width: 1514, height: 776 },
    layoutSize,
  )
  const reducedScalePoint = mapClientPointToCanvas(
    { x: 200, y: 100 },
    { left: 100, top: 50, width: 757, height: 388 },
    layoutSize,
  )

  assert.deepEqual(fullScalePoint, { x: 200, y: 100 })
  assert.deepEqual(reducedScalePoint, { x: 200, y: 100 })
})

test('a stationary drag keeps its integer position at full and reduced scale', () => {
  const currentPosition = { x: 184, y: 58 }
  const layoutSize = { width: 1514, height: 776 }

  for (const renderedBounds of [
    { left: 0, top: 0, width: 1514, height: 776 },
    { left: 10, top: 20, width: 757, height: 388 },
  ]) {
    const scale = renderedBounds.width / layoutSize.width
    const clientPoint = {
      x: renderedBounds.left + (currentPosition.x + 36) * scale,
      y: renderedBounds.top + (currentPosition.y + 12) * scale,
    }
    const canvasPoint = mapClientPointToCanvas(
      clientPoint,
      renderedBounds,
      layoutSize,
    )
    const nextPosition = snapWindowPosition(
      { x: canvasPoint.x - 36, y: canvasPoint.y - 12 },
      layoutSize,
      { width: 470, height: 310 },
    )

    assert.deepEqual(nextPosition, currentPosition)
  }
})

test('window positions are rounded to integers and clamped inside canvas bounds', () => {
  const windowSize = formWindowSize

  assert.deepEqual(
    snapWindowPosition({ x: 183.6, y: 58.5 }, workspaceSize, windowSize),
    { x: 184, y: 59 },
  )
  assert.deepEqual(
    snapWindowPosition({ x: -20.2, y: 900.8 }, workspaceSize, windowSize),
    { x: 0, y: 466 },
  )
  assert.deepEqual(
    snapWindowPosition({ x: 400, y: 300 }, workspaceSize, { width: 1600, height: 900 }),
    { x: 0, y: 0 },
  )

  const farEdge = snapWindowPosition({ x: 1044.8, y: 466.8 }, workspaceSize, windowSize)
  assert.deepEqual(farEdge, { x: 1044, y: 466 })
  assert.equal(Number.isInteger(farEdge.x), true)
  assert.equal(Number.isInteger(farEdge.y), true)
})

test('window centering uses usable workspace dimensions and remains in bounds', () => {
  assert.deepEqual(getCenteredWindowPosition(workspaceSize, formWindowSize), { x: 522, y: 233 })
  assert.deepEqual(
    getCenteredWindowPosition(workspaceSize, { width: 360, height: 268 }),
    { x: 577, y: 254 },
  )
  assert.deepEqual(
    getCenteredWindowPosition(workspaceSize, { width: 1600, height: 900 }),
    { x: 0, y: 0 },
  )
})
