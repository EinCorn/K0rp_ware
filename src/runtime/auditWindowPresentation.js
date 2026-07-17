import {
  ensureFormWindowState,
  getFormWindowId,
  openWindowState,
} from './windowManager.js'

const bootstrapPacketQuantity = 1

export function reconcileAuditInstanceWindows({
  windows,
  auditInstances,
  packetById,
  knownInstanceIds,
  windowSize,
  workspaceSize,
  formBasePosition,
  entryDocumentId = 'audit-00-a',
  preservedDocumentIds = [],
}) {
  const currentInstanceIds = new Set(auditInstances.map(({ id }) => id))
  const preservedDocumentIdSet = new Set(preservedDocumentIds)
  const newlyCreatedInstanceIds = new Set(
    auditInstances
      .filter(({ id }) => !knownInstanceIds.has(id))
      .map(({ id }) => id),
  )
  const autoOpenedWindowIds = []
  let nextWindows = windows

  for (const [id, windowState] of Object.entries(windows)) {
    if (
      windowState.kind !== 'form'
      || windowState.documentId === entryDocumentId
      || preservedDocumentIdSet.has(windowState.documentId)
      || currentInstanceIds.has(windowState.documentId)
    ) continue

    if (nextWindows === windows) nextWindows = { ...windows }
    delete nextWindows[id]
  }

  for (const auditInstance of auditInstances) {
    const windowId = getFormWindowId(auditInstance.id)
    nextWindows = ensureFormWindowState(
      nextWindows,
      auditInstance.id,
      windowSize,
    )

    const packet = packetById.get(auditInstance.packetId)
    const shouldAutoOpen = newlyCreatedInstanceIds.has(auditInstance.id)
      && packet?.quantity === bootstrapPacketQuantity

    if (!shouldAutoOpen) continue

    nextWindows = openWindowState(nextWindows, windowId, {
      workspaceSize,
      formBasePosition,
    })
    autoOpenedWindowIds.push(windowId)
  }

  return {
    windows: nextWindows,
    currentInstanceIds,
    autoOpenedWindowIds,
  }
}
