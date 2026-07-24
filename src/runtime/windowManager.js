const highestOpenZIndex = (windows) => Math.max(
  0,
  ...Object.values(windows)
    .filter((windowState) => windowState.isOpen)
    .map((windowState) => windowState.zIndex),
)

const isPinnedModule = (windowState) => (
  windowState?.kind === 'module' && windowState.isPinned === true
)

const safeWindowZIndex = (windowState) => (
  Number.isFinite(windowState?.zIndex) ? windowState.zIndex : 0
)

export const FORM_WINDOW_CASCADE_OFFSET = Object.freeze({ x: 18, y: 14 })

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

export function getCenteredWindowPosition(workspaceSize, windowSize) {
  return snapWindowPosition(
    {
      x: (workspaceSize.width - windowSize.width) / 2,
      y: (workspaceSize.height - windowSize.height) / 2,
    },
    workspaceSize,
    windowSize,
  )
}

const positionsMatch = (first, second) => first.x === second.x && first.y === second.y

const isPositionInsideWorkspace = (position, workspaceSize, windowSize) => (
  position.x >= 0
  && position.y >= 0
  && position.x <= Math.max(0, Math.floor(workspaceSize.width - windowSize.width))
  && position.y <= Math.max(0, Math.floor(workspaceSize.height - windowSize.height))
)

export function getCascadedWindowPosition(
  anchorPosition,
  basePosition,
  workspaceSize,
  windowSize,
  occupiedPositions = [],
) {
  const candidate = {
    x: Math.round(anchorPosition.x) + FORM_WINDOW_CASCADE_OFFSET.x,
    y: Math.round(anchorPosition.y) + FORM_WINDOW_CASCADE_OFFSET.y,
  }
  const normalizedOccupiedPositions = occupiedPositions.map((position) => (
    snapWindowPosition(position, workspaceSize, windowSize)
  ))
  const isOccupied = (position) => normalizedOccupiedPositions.some((occupiedPosition) => (
    positionsMatch(position, occupiedPosition)
  ))

  if (isPositionInsideWorkspace(candidate, workspaceSize, windowSize) && !isOccupied(candidate)) {
    return candidate
  }

  const wrappedBase = snapWindowPosition(basePosition, workspaceSize, windowSize)
  let wrappedCandidate = wrappedBase

  while (isPositionInsideWorkspace(wrappedCandidate, workspaceSize, windowSize)) {
    if (!isOccupied(wrappedCandidate)) return wrappedCandidate

    wrappedCandidate = {
      x: wrappedCandidate.x + FORM_WINDOW_CASCADE_OFFSET.x,
      y: wrappedCandidate.y + FORM_WINDOW_CASCADE_OFFSET.y,
    }
  }

  return wrappedBase
}

export function getFormWindowId(documentId) {
  if (typeof documentId !== 'string' || documentId.length === 0) {
    throw new TypeError('Form document id must be a non-empty string')
  }

  const normalizedId = documentId.startsWith('form:') ? documentId.slice(5) : documentId
  if (normalizedId.length === 0) throw new TypeError('Form document id must be a non-empty string')
  return `form:${normalizedId}`
}

export function ensureFormWindowState(windows, documentId, windowSize) {
  const id = getFormWindowId(documentId)
  if (windows[id]) return windows

  const normalizedDocumentId = id.slice(5)

  return {
    ...windows,
    [id]: {
      id,
      documentId: normalizedDocumentId,
      kind: 'form',
      width: windowSize.width,
      height: windowSize.height,
      x: 0,
      y: 0,
      zIndex: 0,
      isOpen: false,
      isMinimized: false,
      hasOpened: false,
    },
  }
}

export function openWindowState(
  windows,
  id,
  { workspaceSize, formBasePosition } = {},
) {
  const windowState = windows[id]
  if (!windowState) return windows

  if (windowState.isOpen && !windowState.isMinimized) {
    return bringWindowStateToFront(windows, id)
  }

  if (windowState.hasOpened) {
    return restoreWindowState(windows, id)
  }
  if (!workspaceSize) return windows

  const windowSize = { width: windowState.width, height: windowState.height }
  let position = getCenteredWindowPosition(workspaceSize, windowSize)

  if (windowState.kind === 'form') {
    const openFormWindows = Object.values(windows)
      .filter((candidate) => (
        candidate.id !== id
        && candidate.kind === 'form'
        && candidate.isOpen
        && candidate.hasOpened
      ))
      .sort((first, second) => (
        second.zIndex - first.zIndex || first.id.localeCompare(second.id)
      ))
    const anchorWindow = openFormWindows[0]
    const basePosition = formBasePosition ?? position

    position = anchorWindow
      ? getCascadedWindowPosition(
          anchorWindow,
          basePosition,
          workspaceSize,
          windowSize,
          openFormWindows.map(({ x, y }) => ({ x, y })),
        )
      : snapWindowPosition(basePosition, workspaceSize, windowSize)
  }

  return {
    ...windows,
    [id]: {
      ...windowState,
      ...position,
      isOpen: true,
      isMinimized: false,
      hasOpened: true,
      zIndex: highestOpenZIndex(windows) + 1,
    },
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

export function setWindowPinnedState(windows, id, isPinned) {
  const windowState = windows[id]
  const nextPinned = isPinned === true

  if (
    !windowState
    || windowState.kind !== 'module'
    || !windowState.isOpen
    || windowState.isMinimized
    || windowState.isPinned === nextPinned
  ) return windows

  return {
    ...windows,
    [id]: {
      ...windowState,
      isPinned: nextPinned,
      zIndex: highestOpenZIndex(windows) + 1,
    },
  }
}

export function toggleWindowPinnedState(windows, id) {
  const windowState = windows[id]
  if (!windowState) return windows
  return setWindowPinnedState(windows, id, !windowState.isPinned)
}

export function getWindowPresentationOrder(windows, ids = Object.keys(windows)) {
  return ids
    .filter((id) => windows[id]?.isOpen && !windows[id].isMinimized)
    .sort((firstId, secondId) => {
      const firstWindow = windows[firstId]
      const secondWindow = windows[secondId]
      const pinTierDifference = Number(isPinnedModule(firstWindow))
        - Number(isPinnedModule(secondWindow))

      if (pinTierDifference !== 0) return pinTierDifference

      return safeWindowZIndex(firstWindow) - safeWindowZIndex(secondWindow)
        || String(firstId).localeCompare(String(secondId))
    })
}

export function getWindowPresentationZIndexes(windows, ids = Object.keys(windows)) {
  return Object.fromEntries(
    getWindowPresentationOrder(windows, ids).map((id, index) => [id, index + 1]),
  )
}

export function minimizeWindowState(windows, id) {
  const windowState = windows[id]
  if (!windowState || !windowState.isOpen || windowState.isMinimized) return windows

  return {
    ...windows,
    [id]: { ...windowState, isMinimized: true },
  }
}

export function closeWindowState(windows, id) {
  const windowState = windows[id]
  if (!windowState || (!windowState.isOpen && !windowState.isMinimized)) return windows

  return {
    ...windows,
    [id]: {
      ...windowState,
      isOpen: false,
      isMinimized: false,
    },
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
