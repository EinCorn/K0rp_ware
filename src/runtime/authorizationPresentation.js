import {
  closeWindowState,
  ensureFormWindowState,
  getFormWindowId,
  openWindowState,
} from './windowManager.js'

export const AUTHORIZATION_FORM_DOCUMENT_ID = 'audit-16-c'
export const AUTHORIZATION_FORM_WINDOW_ID = getFormWindowId(
  AUTHORIZATION_FORM_DOCUMENT_ID,
)

export function reconcileAuthorizationFormWindow({
  windows,
  isAvailable,
  wasAvailable,
  windowSize,
  workspaceSize,
  formBasePosition,
  documentId = AUTHORIZATION_FORM_DOCUMENT_ID,
}) {
  const windowId = getFormWindowId(documentId)
  const existingWindow = windows[windowId]

  if (!isAvailable) {
    if (!existingWindow) {
      return { windows, windowId, didAutoOpen: false }
    }

    return {
      windows: closeWindowState(windows, windowId),
      windowId,
      didAutoOpen: false,
    }
  }

  let nextWindows = ensureFormWindowState(windows, documentId, windowSize)
  const shouldAutoOpen = wasAvailable === false
    && !existingWindow
    && !nextWindows[windowId].hasOpened

  if (!shouldAutoOpen) {
    return { windows: nextWindows, windowId, didAutoOpen: false }
  }

  nextWindows = openWindowState(nextWindows, windowId, {
    workspaceSize,
    formBasePosition,
  })

  return { windows: nextWindows, windowId, didAutoOpen: true }
}
