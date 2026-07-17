export const FIDGET_WINDOW_ID = 'fidget'
export const FIDGET_WINDOW_SIZE = Object.freeze({ width: 181, height: 181 })

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
      title: 'FIDGET / STABILIZAČNÍ MODUL',
      taskbarTitle: 'FIDGET',
      width: windowSize.width,
      height: windowSize.height,
      x: 0,
      y: 0,
      zIndex: 0,
      isMinimized: false,
      isOpen: false,
      hasOpened: false,
    },
  }
}
