import assert from 'node:assert/strict'
import test from 'node:test'
import {
  bringWindowStateToFront,
  fitCanvasScale,
  getCenteredCanvasPlacement,
  mapClientPointToCanvas,
  minimizeWindowState,
  restoreWindowState,
  snapWindowPosition,
} from '../windowManager.js'

const windows = {
  audit: { id: 'audit', isOpen: true, isMinimized: false, zIndex: 2 },
  clickaudit: { id: 'clickaudit', isOpen: true, isMinimized: true, zIndex: 1 },
}

test('minimize marks an open window without closing it', () => {
  const next = minimizeWindowState(windows, 'audit')
  assert.equal(next.audit.isOpen, true)
  assert.equal(next.audit.isMinimized, true)
})

test('taskbar restore reopens a minimized window and brings it forward', () => {
  const next = restoreWindowState(windows, 'clickaudit')
  assert.equal(next.clickaudit.isOpen, true)
  assert.equal(next.clickaudit.isMinimized, false)
  assert.equal(next.clickaudit.zIndex, 3)
})

test('bring to front preserves an already visible window', () => {
  const next = bringWindowStateToFront(windows, 'audit')
  assert.equal(next.audit.isMinimized, false)
  assert.equal(next.audit.zIndex, 3)
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
  const workspaceSize = { width: 1514, height: 776 }
  const windowSize = { width: 470, height: 310 }

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
