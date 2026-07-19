import { FIDGET_MODES, FIDGET_MOTION } from './fidgetMotion.js'

export const FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON = 0.05
export const FIDGET_SESSION_SETTLE_VELOCITY_EPSILON = 0.012
export const FIDGET_SESSION_SETTLE_DWELL_MS = 300
export const FIDGET_SESSION_FRAME_MS = 1000 / 60
export const FIDGET_SESSION_VISUAL_FRAME_MS = 16.6667
export const FIDGET_SESSION_MIN_DELTA_FRAMES = 0.25
export const FIDGET_SESSION_MAX_DELTA_FRAMES = 2.2

export const FIDGET_SESSION_INPUT_KINDS = Object.freeze({
  dragRelease: 'drag-release',
  wheel: 'wheel',
  click: 'click',
  keyboard: 'keyboard',
})

export const FIDGET_SESSION_POINTER_OUTCOMES = Object.freeze({
  tap: 'tap',
  dragRelease: FIDGET_SESSION_INPUT_KINDS.dragRelease,
  cancelled: 'cancelled',
})

const KNOWN_INPUT_KINDS = new Set(Object.values(FIDGET_SESSION_INPUT_KINDS))
const KNOWN_MODES = new Set(Object.values(FIDGET_MODES))

const finiteTimestamp = (value) => (
  Number.isFinite(value) && value >= 0 ? value : null
)

const idleTracker = (sequence = 0, lastTimestamp = null) => ({
  active: false,
  sequence,
  mode: null,
  logicalVelocity: 0,
  lastTimestamp,
  belowThresholdSince: null,
})

export function createFidgetSessionTracker(sequence = 0) {
  const safeSequence = Number.isInteger(sequence) && sequence >= 0 ? sequence : 0
  return idleTracker(safeSequence)
}

export function getFidgetSessionPointerOutcome({
  moved = false,
  cancelled = false,
} = {}) {
  if (cancelled) return FIDGET_SESSION_POINTER_OUTCOMES.cancelled
  return moved
    ? FIDGET_SESSION_POINTER_OUTCOMES.dragRelease
    : FIDGET_SESSION_POINTER_OUTCOMES.tap
}

export function getFidgetSessionClampedDeltaFrames(elapsedMs) {
  const safeElapsedMs = Number.isFinite(elapsedMs) ? elapsedMs : 0
  const elapsedFrames = safeElapsedMs / FIDGET_SESSION_VISUAL_FRAME_MS

  return Math.min(
    Math.max(elapsedFrames, FIDGET_SESSION_MIN_DELTA_FRAMES),
    FIDGET_SESSION_MAX_DELTA_FRAMES,
  )
}

const clampTimestampToTracker = (tracker, timestamp) => {
  const safeTimestamp = finiteTimestamp(timestamp)
  if (safeTimestamp === null) return null

  return tracker.lastTimestamp === null
    ? safeTimestamp
    : Math.max(tracker.lastTimestamp, safeTimestamp)
}

const decayLogicalVelocity = (velocity, elapsedMs) => {
  if (velocity <= 0 || elapsedMs <= 0) return velocity

  const elapsedFrames = elapsedMs / FIDGET_SESSION_FRAME_MS
  return velocity * Math.pow(FIDGET_MOTION.friction, elapsedFrames)
}

const thresholdCrossingTimestamp = ({
  previousVelocity,
  previousTimestamp,
  nextVelocity,
  nextTimestamp,
}) => {
  if (previousVelocity <= FIDGET_SESSION_SETTLE_VELOCITY_EPSILON) {
    return previousTimestamp
  }

  if (nextVelocity > FIDGET_SESSION_SETTLE_VELOCITY_EPSILON) return null

  const crossingFrames = Math.log(
    FIDGET_SESSION_SETTLE_VELOCITY_EPSILON / previousVelocity,
  ) / Math.log(FIDGET_MOTION.friction)
  const crossingTimestamp = previousTimestamp + crossingFrames * FIDGET_SESSION_FRAME_MS

  return Math.min(nextTimestamp, Math.max(previousTimestamp, crossingTimestamp))
}

export function registerFidgetSessionInput(tracker, {
  timestamp,
  mode,
  inputKind,
  velocity,
  isQualifiedInput = false,
} = {}) {
  if (!tracker || !KNOWN_INPUT_KINDS.has(inputKind)) return tracker

  const safeTimestamp = clampTimestampToTracker(tracker, timestamp)
  const logicalVelocity = Math.abs(Number.isFinite(velocity) ? velocity : 0)
  if (safeTimestamp === null) return tracker

  if (!tracker.active) {
    if (logicalVelocity <= FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON) return tracker

    return {
      active: true,
      sequence: tracker.sequence + 1,
      mode: KNOWN_MODES.has(mode) ? mode : FIDGET_MODES.manual,
      logicalVelocity,
      lastTimestamp: safeTimestamp,
      belowThresholdSince: null,
    }
  }

  if (
    isQualifiedInput !== true
    && logicalVelocity <= FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON
  ) return tracker

  return {
    ...tracker,
    logicalVelocity,
    lastTimestamp: safeTimestamp,
    belowThresholdSince: null,
  }
}

export function stopActiveFidgetSessionMotion(tracker, timestamp) {
  if (!tracker?.active) return tracker

  const safeTimestamp = clampTimestampToTracker(tracker, timestamp)
  if (safeTimestamp === null) return tracker

  return {
    ...tracker,
    logicalVelocity: 0,
    lastTimestamp: safeTimestamp,
    belowThresholdSince: safeTimestamp,
  }
}

export function advanceFidgetSessionTracker(tracker, {
  timestamp,
  isDragging = false,
} = {}) {
  if (!tracker?.active) return { tracker, settledSession: null }

  const safeTimestamp = clampTimestampToTracker(tracker, timestamp)
  if (safeTimestamp === null) return { tracker, settledSession: null }

  const previousTimestamp = tracker.lastTimestamp ?? safeTimestamp
  const logicalVelocity = decayLogicalVelocity(
    tracker.logicalVelocity,
    safeTimestamp - previousTimestamp,
  )

  if (isDragging) {
    return {
      tracker: {
        ...tracker,
        logicalVelocity,
        lastTimestamp: safeTimestamp,
        belowThresholdSince: null,
      },
      settledSession: null,
    }
  }

  const crossingTimestamp = thresholdCrossingTimestamp({
    previousVelocity: tracker.logicalVelocity,
    previousTimestamp,
    nextVelocity: logicalVelocity,
    nextTimestamp: safeTimestamp,
  })
  const belowThresholdSince = logicalVelocity <= FIDGET_SESSION_SETTLE_VELOCITY_EPSILON
    ? tracker.belowThresholdSince ?? crossingTimestamp ?? safeTimestamp
    : null
  const nextTracker = {
    ...tracker,
    logicalVelocity,
    lastTimestamp: safeTimestamp,
    belowThresholdSince,
  }

  if (
    belowThresholdSince === null
    || safeTimestamp - belowThresholdSince < FIDGET_SESSION_SETTLE_DWELL_MS
  ) {
    return { tracker: nextTracker, settledSession: null }
  }

  const settledSession = Object.freeze({
    sequence: tracker.sequence,
    mode: tracker.mode,
    source: 'manual',
  })

  return {
    tracker: idleTracker(tracker.sequence, safeTimestamp),
    settledSession,
  }
}

export function cancelFidgetSessionTracker(tracker) {
  return idleTracker(tracker?.sequence ?? 0, tracker?.lastTimestamp ?? null)
}
