const highestOpenZIndex = (windows) => Math.max(
  0,
  ...Object.values(windows)
    .filter((windowState) => windowState.isOpen)
    .map((windowState) => windowState.zIndex),
)

export function bringWindowStateToFront(windows, id) {
  const windowState = windows[id]
  if (!windowState || !windowState.isOpen) return windows

  return {
    ...windows,
    [id]: { ...windowState, zIndex: highestOpenZIndex(windows) + 1 },
  }
}

export function minimizeWindowState(windows, id) {
  const windowState = windows[id]
  if (!windowState || !windowState.isOpen || windowState.isMinimized) return windows

  return {
    ...windows,
    [id]: { ...windowState, isMinimized: true },
  }
}

export function restoreWindowState(windows, id) {
  const windowState = windows[id]
  if (!windowState) return windows

  return {
    ...windows,
    [id]: {
      ...windowState,
      isOpen: true,
      isMinimized: false,
      zIndex: highestOpenZIndex(windows) + 1,
    },
  }
}
