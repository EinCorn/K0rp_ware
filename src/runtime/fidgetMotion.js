export const FIDGET_MOTION = Object.freeze({
  friction: 0.992,
  maxVelocity: 42,
  idleNudge: 0.0008,
  tapMoveThreshold: 6,
  rainbowStartSpeed: 0.34,
  confettiStartSpeed: 0.6,
})

export const FIDGET_MODES = Object.freeze({
  manual: 'manual',
  click: 'click',
})

export function getNextFidgetMode(mode) {
  return mode === FIDGET_MODES.click ? FIDGET_MODES.manual : FIDGET_MODES.click
}

export function clampFidgetValue(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function normalizeFidgetDegreeDelta(degrees) {
  let delta = Number.isFinite(degrees) ? degrees : 0

  while (delta > 180) delta -= 360
  while (delta < -180) delta += 360

  return delta
}

export function clampFidgetVelocity(velocity) {
  const safeVelocity = Number.isFinite(velocity) ? velocity : 0
  return clampFidgetValue(safeVelocity, -FIDGET_MOTION.maxVelocity, FIDGET_MOTION.maxVelocity)
}

export function calculateFidgetDragVelocity({
  deltaDegrees,
  elapsedMs,
  previousVelocity = 0,
}) {
  const safeElapsedMs = Math.max(Number.isFinite(elapsedMs) ? elapsedMs : 0, 8)
  const sampledVelocity = (normalizeFidgetDegreeDelta(deltaDegrees) / safeElapsedMs) * 16.6667

  return clampFidgetVelocity(previousVelocity * 0.25 + sampledVelocity * 0.95)
}

export function calculateFidgetReleaseVelocity(velocity) {
  return clampFidgetVelocity(velocity * 1.22)
}

export function classifyFidgetGesture(moveX, moveY) {
  const safeMoveX = Number.isFinite(moveX) ? moveX : 0
  const safeMoveY = Number.isFinite(moveY) ? moveY : 0

  return Math.hypot(safeMoveX, safeMoveY) > FIDGET_MOTION.tapMoveThreshold
    ? 'drag'
    : 'tap'
}

export function getNormalizedFidgetSpeed(velocity) {
  return clampFidgetValue(
    Math.abs(Number.isFinite(velocity) ? velocity : 0) / FIDGET_MOTION.maxVelocity,
    0,
    1,
  )
}

export function getFidgetRainbowSpeed(velocity) {
  const normalizedSpeed = getNormalizedFidgetSpeed(velocity)

  return clampFidgetValue(
    (normalizedSpeed - FIDGET_MOTION.rainbowStartSpeed)
      / (1 - FIDGET_MOTION.rainbowStartSpeed),
    0,
    1,
  )
}

export function getFidgetClickDirection(pointerX, boundsLeft, boundsWidth) {
  const safeLeft = Number.isFinite(boundsLeft) ? boundsLeft : 0
  const safeWidth = Number.isFinite(boundsWidth) && boundsWidth > 0 ? boundsWidth : 0
  const safePointerX = Number.isFinite(pointerX) ? pointerX : safeLeft

  return safePointerX >= safeLeft + safeWidth / 2 ? 1 : -1
}

export function getFidgetPointerAngle(pointer, bounds) {
  const centerX = bounds.left + bounds.width / 2
  const centerY = bounds.top + bounds.height / 2

  return Math.atan2(pointer.y - centerY, pointer.x - centerX) * (180 / Math.PI)
}
