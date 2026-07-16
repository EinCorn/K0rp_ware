const highestOpenZIndex = (windows) => Math.max(
  0,
  ...Object.values(windows)
    .filter((windowState) => windowState.isOpen)
    .map((windowState) => windowState.zIndex),
)

const isPositiveFiniteNumber = (value) => Number.isFinite(value) && value > 0

export function fitCanvasScale(viewportWidth, viewportHeight, canvasWidth, canvasHeight) {
  if (
    !isPositiveFiniteNumber(viewportWidth)
    || !isPositiveFiniteNumber(viewportHeight)
    || !isPositiveFiniteNumber(canvasWidth)
    || !isPositiveFiniteNumber(canvasHeight)
  ) return 1

  return Math.min(1, viewportWidth / canvasWidth, viewportHeight / canvasHeight)
}

export function getCenteredCanvasPlacement(
  viewportWidth,
  viewportHeight,
  canvasWidth,
  canvasHeight,
) {
  const scale = fitCanvasScale(viewportWidth, viewportHeight, canvasWidth, canvasHeight)

  return {
    scale,
    left: Math.round((viewportWidth - canvasWidth * scale) / 2),
    top: Math.round((viewportHeight - canvasHeight * scale) / 2),
  }
}

export function mapClientPointToCanvas(point, renderedBounds, layoutSize) {
  const scaleX = renderedBounds.width / layoutSize.width
  const scaleY = renderedBounds.height / layoutSize.height

  if (!isPositiveFiniteNumber(scaleX) || !isPositiveFiniteNumber(scaleY)) {
    return { x: 0, y: 0 }
  }

  return {
    x: (point.x - renderedBounds.left) / scaleX,
    y: (point.y - renderedBounds.top) / scaleY,
  }
}

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

export function snapWindowPosition(position, workspaceSize, windowSize) {
  const maximumX = Math.max(0, Math.floor(workspaceSize.width - windowSize.width))
  const maximumY = Math.max(0, Math.floor(workspaceSize.height - windowSize.height))

  return {
    x: clamp(Math.round(position.x), 0, maximumX),
    y: clamp(Math.round(position.y), 0, maximumY),
  }
}

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
