import {
  KORP_MODULE_WINDOW_METRICS,
  KORP_MODULE_WINDOW_SIZE,
} from './moduleWindowPresentation.js'

export const FIDGET_WINDOW_ID = 'fidget'
export const FIDGET_WINDOW_SIZE = KORP_MODULE_WINDOW_SIZE
const FIDGET_MODULE_FOOTER_CONTROL_SIZE = 16
export const FIDGET_MODULE_FOOTER_CONTROL_RECT = Object.freeze({
  x: 0,
  y: KORP_MODULE_WINDOW_METRICS.footerRect.height - FIDGET_MODULE_FOOTER_CONTROL_SIZE,
  width: FIDGET_MODULE_FOOTER_CONTROL_SIZE,
  height: FIDGET_MODULE_FOOTER_CONTROL_SIZE,
})

export const FIDGET_DEPLOYED_DESKTOP_ITEM = Object.freeze({
  id: 'authorized-module:fidget',
  kind: 'authorized-module',
  moduleId: 'fidget',
  windowId: FIDGET_WINDOW_ID,
  title: 'Fidget',
  status: 'AUTORIZOVÁNO / NASAZENO',
  iconId: 'fidget',
  isInteractive: true,
})

export function isFidgetSurfaceAvailable(moduleAuthorizations) {
  return Array.isArray(moduleAuthorizations)
    && moduleAuthorizations.some((authorization) => (
      authorization?.moduleId === FIDGET_DEPLOYED_DESKTOP_ITEM.moduleId
    ))
}

export function getFidgetDesktopItems(moduleAuthorizations) {
  return isFidgetSurfaceAvailable(moduleAuthorizations)
    ? [FIDGET_DEPLOYED_DESKTOP_ITEM]
    : []
}

export function reconcileFidgetWindow({
  windows,
  moduleAuthorizations,
  windowSize = FIDGET_WINDOW_SIZE,
}) {
  const isAuthorized = isFidgetSurfaceAvailable(moduleAuthorizations)
  const existingWindow = windows[FIDGET_WINDOW_ID]

  if (!isAuthorized) {
    if (!existingWindow) return windows

    const nextWindows = { ...windows }
    delete nextWindows[FIDGET_WINDOW_ID]
    return nextWindows
  }

  if (existingWindow) return windows

  return {
    ...windows,
    [FIDGET_WINDOW_ID]: {
      id: FIDGET_WINDOW_ID,
      kind: 'module',
      surface: 'fidget',
      title: 'Fidget / Místní modul',
      taskbarTitle: 'FIDGET',
      width: windowSize.width,
      height: windowSize.height,
      x: 0,
      y: 0,
      zIndex: 0,
      isPinned: false,
      isMinimized: false,
      isOpen: false,
      hasOpened: false,
    },
  }
}
