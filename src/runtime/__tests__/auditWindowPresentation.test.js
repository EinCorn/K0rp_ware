import assert from 'node:assert/strict'
import test from 'node:test'
import { reconcileAuditInstanceWindows } from '../auditWindowPresentation.js'
import {
  ensureFormWindowState,
  getFormWindowId,
  openWindowState,
} from '../windowManager.js'

const workspaceSize = { width: 1514, height: 776 }
const formWindowSize = { width: 470, height: 310 }
const formBasePosition = { x: 184, y: 58 }
const bootstrapInstance = {
  id: 'audit-10-a:clickaudit-clicks-8-8',
  packetId: 'clickaudit-clicks-8-8',
  status: 'available',
}
const normalInstance = {
  id: 'audit-10-a:clickaudit-clicks-9-33',
  packetId: 'clickaudit-clicks-9-33',
  status: 'available',
}
const packetById = new Map([
  [bootstrapInstance.packetId, {
    id: bootstrapInstance.packetId,
    quantity: 1,
    status: 'pending',
  }],
  [normalInstance.packetId, {
    id: normalInstance.packetId,
    quantity: 25,
    status: 'pending',
  }],
])

const createBaseWindows = () => ({
  'form:audit-00-a': {
    id: 'form:audit-00-a',
    documentId: 'audit-00-a',
    kind: 'form',
    width: formWindowSize.width,
    height: formWindowSize.height,
    ...formBasePosition,
    zIndex: 3,
    isOpen: true,
    isMinimized: false,
    hasOpened: true,
  },
  'daily-report': {
    id: 'daily-report',
    kind: 'memo',
    width: 392,
    height: 192,
    x: 500,
    y: 200,
    zIndex: 4,
    isOpen: true,
    isMinimized: false,
    hasOpened: true,
  },
})

const reconcile = (overrides = {}) => reconcileAuditInstanceWindows({
  windows: createBaseWindows(),
  auditInstances: [],
  packetById,
  knownInstanceIds: new Set(),
  windowSize: formWindowSize,
  workspaceSize,
  formBasePosition,
  ...overrides,
})

test('a newly created quantity-1 bootstrap audit auto-opens once', () => {
  const first = reconcile({ auditInstances: [bootstrapInstance] })
  const bootstrapWindowId = getFormWindowId(bootstrapInstance.id)

  assert.deepEqual(first.autoOpenedWindowIds, [bootstrapWindowId])
  assert.equal(first.windows[bootstrapWindowId].isOpen, true)
  assert.equal(first.windows[bootstrapWindowId].hasOpened, true)
  assert.deepEqual(
    { x: first.windows[bootstrapWindowId].x, y: first.windows[bootstrapWindowId].y },
    { x: 202, y: 72 },
  )
  assert.equal(first.windows[bootstrapWindowId].zIndex, 5)

  const replayedUpdater = reconcile({ auditInstances: [bootstrapInstance] })
  assert.deepEqual(replayedUpdater.autoOpenedWindowIds, [bootstrapWindowId])
  assert.deepEqual(replayedUpdater.windows, first.windows)

  const alreadyKnown = reconcile({
    windows: first.windows,
    auditInstances: [bootstrapInstance],
    knownInstanceIds: first.currentInstanceIds,
  })

  assert.deepEqual(alreadyKnown.autoOpenedWindowIds, [])
  assert.equal(alreadyKnown.windows, first.windows)
})

test('a new quantity-25 audit is registered closed without changing focus', () => {
  const bootstrap = reconcile({ auditInstances: [bootstrapInstance] })
  const bootstrapWindowId = getFormWindowId(bootstrapInstance.id)
  const normalWindowId = getFormWindowId(normalInstance.id)
  const focusedBefore = bootstrap.windows[bootstrapWindowId]
  const withNormalPacket = reconcile({
    windows: bootstrap.windows,
    auditInstances: [bootstrapInstance, normalInstance],
    knownInstanceIds: bootstrap.currentInstanceIds,
  })

  assert.deepEqual(withNormalPacket.autoOpenedWindowIds, [])
  assert.equal(Object.keys(withNormalPacket.windows).filter((id) => id === normalWindowId).length, 1)
  assert.equal(withNormalPacket.windows[normalWindowId].isOpen, false)
  assert.equal(withNormalPacket.windows[normalWindowId].isMinimized, false)
  assert.equal(withNormalPacket.windows[normalWindowId].hasOpened, false)
  assert.equal(withNormalPacket.windows[normalWindowId].zIndex, 0)
  assert.equal(withNormalPacket.windows[bootstrapWindowId], focusedBefore)
  assert.equal(withNormalPacket.windows[bootstrapWindowId].zIndex, 5)
  assert.equal(normalInstance.status, 'available')
  assert.equal(packetById.get(normalInstance.packetId).status, 'pending')
})

test('manually opening a queued audit uses the form cascade and stable descriptor', () => {
  const bootstrap = reconcile({ auditInstances: [bootstrapInstance] })
  const bootstrapWindowId = getFormWindowId(bootstrapInstance.id)
  const normalWindowId = getFormWindowId(normalInstance.id)
  const movedBootstrapWindows = {
    ...bootstrap.windows,
    [bootstrapWindowId]: {
      ...bootstrap.windows[bootstrapWindowId],
      x: 700,
      y: 300,
      zIndex: 8,
    },
  }
  const queued = reconcile({
    windows: movedBootstrapWindows,
    auditInstances: [bootstrapInstance, normalInstance],
    knownInstanceIds: bootstrap.currentInstanceIds,
  })
  const manuallyOpened = openWindowState(queued.windows, normalWindowId, {
    workspaceSize,
    formBasePosition,
  })

  assert.equal(manuallyOpened[normalWindowId].isOpen, true)
  assert.deepEqual(
    { x: manuallyOpened[normalWindowId].x, y: manuallyOpened[normalWindowId].y },
    { x: 718, y: 314 },
  )
  assert.equal(Object.keys(manuallyOpened).filter((id) => id === normalWindowId).length, 1)
})

test('refresh registers historical pending and certified audits without auto-opening either', () => {
  const historicalBootstrap = { ...bootstrapInstance, status: 'submitted' }
  const historicalNormal = { ...normalInstance, status: 'available' }
  let loadedWindows = createBaseWindows()
  loadedWindows = ensureFormWindowState(
    loadedWindows,
    historicalBootstrap.id,
    formWindowSize,
  )
  loadedWindows = ensureFormWindowState(
    loadedWindows,
    historicalNormal.id,
    formWindowSize,
  )
  const loadedInstanceIds = new Set([
    historicalBootstrap.id,
    historicalNormal.id,
  ])
  const refreshed = reconcile({
    windows: loadedWindows,
    auditInstances: [historicalBootstrap, historicalNormal],
    knownInstanceIds: loadedInstanceIds,
  })

  assert.deepEqual(refreshed.autoOpenedWindowIds, [])
  assert.equal(refreshed.windows[getFormWindowId(historicalBootstrap.id)].isOpen, false)
  assert.equal(refreshed.windows[getFormWindowId(historicalNormal.id)].isOpen, false)
})

test('an instance without packet metadata is registered closed and never auto-opened', () => {
  const orphanedInstance = {
    id: 'audit-10-a:missing-packet',
    packetId: 'missing-packet',
    status: 'available',
  }
  const result = reconcile({ auditInstances: [orphanedInstance] })
  const windowId = getFormWindowId(orphanedInstance.id)

  assert.deepEqual(result.autoOpenedWindowIds, [])
  assert.equal(result.windows[windowId].isOpen, false)
  assert.equal(result.windows[windowId].hasOpened, false)
})

test('reconciliation preserves explicitly managed one-time form windows', () => {
  const authorizationWindowId = getFormWindowId('audit-16-c')
  const windows = ensureFormWindowState(
    createBaseWindows(),
    'audit-16-c',
    formWindowSize,
  )
  const result = reconcile({
    windows,
    preservedDocumentIds: ['audit-16-c'],
  })

  assert.equal(result.windows[authorizationWindowId], windows[authorizationWindowId])
})
