import {
  KORP_MODULE_WINDOW_METRICS,
  KORP_MODULE_WINDOW_SIZE,
} from './moduleWindowPresentation.js'

export const FIDGET_WINDOW_ID = 'fidget'
export const FIDGET_WINDOW_SIZE = KORP_MODULE_WINDOW_SIZE
export const FIDGET_ROTATION_CONTROL_INSETS = Object.freeze({
  left: 6,
  bottom: 5,
})
export const FIDGET_ROTATION_CONTROL_SIZE = Object.freeze({
  width: 14,
  height: 13,
})
export const FIDGET_MODULE_FOOTER_CONTROL_RECT = Object.freeze({
  x: FIDGET_ROTATION_CONTROL_INSETS.left,
  y: KORP_MODULE_WINDOW_SIZE.height
    - FIDGET_ROTATION_CONTROL_INSETS.bottom
    - FIDGET_ROTATION_CONTROL_SIZE.height,
  width: FIDGET_ROTATION_CONTROL_SIZE.width,
  height: FIDGET_ROTATION_CONTROL_SIZE.height,
})
export const FIDGET_MODULE_FOOTER_CONTROL_OFFSET = Object.freeze({
  x: FIDGET_MODULE_FOOTER_CONTROL_RECT.x
    - KORP_MODULE_WINDOW_METRICS.footerRect.x,
  y: FIDGET_MODULE_FOOTER_CONTROL_RECT.y
    - KORP_MODULE_WINDOW_METRICS.footerRect.y,
  width: FIDGET_MODULE_FOOTER_CONTROL_RECT.width,
  height: FIDGET_MODULE_FOOTER_CONTROL_RECT.height,
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
      title: 'Fidget',
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
