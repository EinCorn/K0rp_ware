import assert from 'node:assert/strict'
import test from 'node:test'
import { FIDGET_MODES, FIDGET_MOTION } from '../fidgetMotion.js'
import {
  FIDGET_SESSION_FRAME_MS,
  FIDGET_SESSION_INPUT_KINDS,
  FIDGET_SESSION_MAX_DELTA_FRAMES,
  FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON,
  FIDGET_SESSION_POINTER_OUTCOMES,
  FIDGET_SESSION_SETTLE_DWELL_MS,
  FIDGET_SESSION_SETTLE_VELOCITY_EPSILON,
  advanceFidgetSessionTracker,
  cancelFidgetSessionTracker,
  createFidgetSessionTracker,
  getFidgetSessionClampedDeltaFrames,
  getFidgetSessionPointerOutcome,
  registerFidgetSessionInput,
  stopActiveFidgetSessionMotion,
} from '../fidgetSession.js'

const crossingTime = (velocity) => (
  Math.log(FIDGET_SESSION_SETTLE_VELOCITY_EPSILON / velocity)
  / Math.log(FIDGET_MOTION.friction)
  * FIDGET_SESSION_FRAME_MS
)

const startSession = ({
  inputKind = FIDGET_SESSION_INPUT_KINDS.click,
  mode = FIDGET_MODES.click,
  timestamp = 0,
  velocity = 1,
} = {}) => registerFidgetSessionInput(createFidgetSessionTracker(), {
  inputKind,
  mode,
  timestamp,
  velocity,
})

test('session thresholds are explicit and separate from visual idle nudge', () => {
  assert.equal(FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON, 0.05)
  assert.equal(FIDGET_SESSION_SETTLE_VELOCITY_EPSILON, 0.012)
  assert.equal(FIDGET_SESSION_SETTLE_DWELL_MS, 300)
  assert.ok(FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON > FIDGET_SESSION_SETTLE_VELOCITY_EPSILON)
})

test('idle frames, taps, unknown inputs and sub-epsilon motion cannot start a session', () => {
  const idle = createFidgetSessionTracker()
  assert.deepEqual(
    advanceFidgetSessionTracker(idle, { timestamp: 10_000 }).settledSession,
    null,
  )
  assert.equal(stopActiveFidgetSessionMotion(idle, 10), idle)
  assert.equal(registerFidgetSessionInput(idle, {
    timestamp: 10,
    mode: FIDGET_MODES.manual,
    inputKind: 'tap',
    velocity: 20,
  }), idle)
  assert.equal(registerFidgetSessionInput(idle, {
    timestamp: 10,
    mode: FIDGET_MODES.manual,
    inputKind: FIDGET_SESSION_INPUT_KINDS.wheel,
    velocity: FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON,
  }), idle)
})

test('every approved intentional input kind can start exactly one session', () => {
  for (const inputKind of Object.values(FIDGET_SESSION_INPUT_KINDS)) {
    const tracker = startSession({ inputKind, mode: FIDGET_MODES.manual })
    assert.equal(tracker.active, true)
    assert.equal(tracker.sequence, 1)
    assert.equal(tracker.mode, FIDGET_MODES.manual)
  }
})

test('only a real pointer release qualifies a completed drag for session tracking', () => {
  assert.equal(getFidgetSessionPointerOutcome({ moved: false }), FIDGET_SESSION_POINTER_OUTCOMES.tap)
  assert.equal(
    getFidgetSessionPointerOutcome({ moved: true }),
    FIDGET_SESSION_POINTER_OUTCOMES.dragRelease,
  )
  assert.equal(
    getFidgetSessionPointerOutcome({ moved: true, cancelled: true }),
    FIDGET_SESSION_POINTER_OUTCOMES.cancelled,
  )
  assert.equal(
    getFidgetSessionPointerOutcome({ moved: false, cancelled: true }),
    FIDGET_SESSION_POINTER_OUTCOMES.cancelled,
  )
})

test('logical friction decay is deterministic across different frame sampling rates', () => {
  const initial = startSession({ velocity: 12 })
  const once = advanceFidgetSessionTracker(initial, { timestamp: 1_000 }).tracker
  let sampled = initial

  for (let timestamp = 100; timestamp <= 1_000; timestamp += 100) {
    sampled = advanceFidgetSessionTracker(sampled, { timestamp }).tracker
  }

  assert.ok(Math.abs(once.logicalVelocity - sampled.logicalVelocity) < 1e-12)
})

test('a background RAF gap advances logical motion by the same clamped frames as visuals', () => {
  const deltaFrames = getFidgetSessionClampedDeltaFrames(60_000)
  assert.equal(deltaFrames, FIDGET_SESSION_MAX_DELTA_FRAMES)

  const initial = startSession({ velocity: 20 })
  const resumed = advanceFidgetSessionTracker(initial, {
    timestamp: deltaFrames * FIDGET_SESSION_FRAME_MS,
  })

  assert.equal(resumed.settledSession, null)
  assert.ok(resumed.tracker.logicalVelocity > FIDGET_SESSION_SETTLE_VELOCITY_EPSILON)
  assert.ok(Math.abs(
    resumed.tracker.logicalVelocity - 20 * Math.pow(FIDGET_MOTION.friction, deltaFrames)
  ) < 1e-12)
})

test('invalid and non-monotonic timestamps cannot create negative decay time', () => {
  const initial = startSession({ timestamp: 100, velocity: 3 })
  assert.equal(registerFidgetSessionInput(initial, {
    timestamp: Number.NaN,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.click,
    velocity: 6,
  }), initial)

  const rewound = advanceFidgetSessionTracker(initial, { timestamp: 50 })
  assert.equal(rewound.settledSession, null)
  assert.equal(rewound.tracker.lastTimestamp, 100)
  assert.equal(rewound.tracker.logicalVelocity, 3)
})

test('settling requires the logical epsilon and the complete dwell window', () => {
  const tracker = startSession({ velocity: 1 })
  const thresholdAt = crossingTime(1)
  const early = advanceFidgetSessionTracker(tracker, {
    timestamp: thresholdAt + FIDGET_SESSION_SETTLE_DWELL_MS - 0.001,
  })
  assert.equal(early.settledSession, null)

  const settled = advanceFidgetSessionTracker(early.tracker, {
    timestamp: thresholdAt + FIDGET_SESSION_SETTLE_DWELL_MS,
  })
  assert.deepEqual(settled.settledSession, {
    sequence: 1,
    mode: FIDGET_MODES.click,
    source: 'manual',
  })
  assert.equal(settled.tracker.active, false)
})

test('a new intentional input during dwell resets closure without incrementing the session', () => {
  const first = startSession({ velocity: 1 })
  const firstThresholdAt = crossingTime(1)
  const inDwell = advanceFidgetSessionTracker(first, {
    timestamp: firstThresholdAt + 200,
  }).tracker
  const refreshedAt = firstThresholdAt + 250
  const refreshed = registerFidgetSessionInput(inDwell, {
    timestamp: refreshedAt,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.keyboard,
    velocity: 1,
  })

  assert.equal(refreshed.sequence, 1)
  assert.equal(advanceFidgetSessionTracker(refreshed, {
    timestamp: firstThresholdAt + 500,
  }).settledSession, null)

  const secondThresholdAt = refreshedAt + crossingTime(1)
  assert.deepEqual(advanceFidgetSessionTracker(refreshed, {
    timestamp: secondThresholdAt + FIDGET_SESSION_SETTLE_DWELL_MS,
  }).settledSession, {
    sequence: 1,
    mode: FIDGET_MODES.click,
    source: 'manual',
  })
})

test('sub-epsilon input cannot refresh or terminate an active session', () => {
  const active = startSession({ velocity: 1 })
  const unchanged = registerFidgetSessionInput(active, {
    timestamp: 100,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.wheel,
    velocity: FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON,
  })

  assert.equal(unchanged, active)
})

test('a qualified opposite input can stop and refresh an active session without starting from idle', () => {
  const idle = createFidgetSessionTracker()
  assert.equal(registerFidgetSessionInput(idle, {
    timestamp: 100,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.click,
    velocity: 0,
    isQualifiedInput: true,
  }), idle)

  const active = startSession({ velocity: 20 })
  const cancelledAt = 100
  const cancelled = registerFidgetSessionInput(active, {
    timestamp: cancelledAt,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.click,
    velocity: 0,
    isQualifiedInput: true,
  })

  assert.equal(cancelled.sequence, 1)
  assert.equal(cancelled.logicalVelocity, 0)
  assert.equal(cancelled.lastTimestamp, cancelledAt)
  assert.equal(cancelled.belowThresholdSince, null)
  assert.equal(advanceFidgetSessionTracker(cancelled, {
    timestamp: cancelledAt + FIDGET_SESSION_SETTLE_DWELL_MS - 1,
  }).settledSession, null)
  assert.deepEqual(advanceFidgetSessionTracker(cancelled, {
    timestamp: cancelledAt + FIDGET_SESSION_SETTLE_DWELL_MS,
  }).settledSession, {
    sequence: 1,
    mode: FIDGET_MODES.click,
    source: 'manual',
  })
})

test('dragging blocks dwell and a tap can stop but never start a session', () => {
  const active = startSession({ mode: FIDGET_MODES.manual, velocity: 1 })
  const thresholdAt = crossingTime(1)
  const held = advanceFidgetSessionTracker(active, {
    timestamp: thresholdAt + 2_000,
    isDragging: true,
  })
  assert.equal(held.settledSession, null)
  assert.equal(held.tracker.belowThresholdSince, null)

  const stoppedAt = thresholdAt + 2_100
  const stopped = stopActiveFidgetSessionMotion(held.tracker, stoppedAt)
  assert.equal(advanceFidgetSessionTracker(stopped, {
    timestamp: stoppedAt + FIDGET_SESSION_SETTLE_DWELL_MS - 1,
  }).settledSession, null)
  assert.ok(advanceFidgetSessionTracker(stopped, {
    timestamp: stoppedAt + FIDGET_SESSION_SETTLE_DWELL_MS,
  }).settledSession)

  const idle = createFidgetSessionTracker()
  assert.equal(stopActiveFidgetSessionMotion(idle, stoppedAt), idle)
})

test('one closure is emitted until a new intentional input starts the next sequence', () => {
  const first = startSession({ velocity: 1 })
  const firstSettled = advanceFidgetSessionTracker(first, {
    timestamp: crossingTime(1) + FIDGET_SESSION_SETTLE_DWELL_MS,
  })
  assert.equal(firstSettled.settledSession.sequence, 1)
  assert.equal(advanceFidgetSessionTracker(firstSettled.tracker, {
    timestamp: 1_000_000,
  }).settledSession, null)

  const second = registerFidgetSessionInput(firstSettled.tracker, {
    timestamp: 1_000_001,
    mode: FIDGET_MODES.manual,
    inputKind: FIDGET_SESSION_INPUT_KINDS.wheel,
    velocity: 2,
  })
  assert.equal(second.sequence, 2)
})

test('mode changes alone do nothing and mixed-mode input cannot duplicate an active session', () => {
  const manual = startSession({ mode: FIDGET_MODES.manual, velocity: 1 })
  const clickInput = registerFidgetSessionInput(manual, {
    timestamp: 10,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.click,
    velocity: 2,
  })
  assert.equal(clickInput.sequence, 1)
  assert.equal(clickInput.mode, FIDGET_MODES.manual)

  const settled = advanceFidgetSessionTracker(clickInput, {
    timestamp: 10 + crossingTime(2) + FIDGET_SESSION_SETTLE_DWELL_MS,
  })
  assert.deepEqual(settled.settledSession, {
    sequence: 1,
    mode: FIDGET_MODES.manual,
    source: 'manual',
  })
})

test('cleanup cancellation is silent and requires a new intentional input', () => {
  const active = startSession({ velocity: 4 })
  const cancelled = cancelFidgetSessionTracker(active)
  assert.equal(cancelled.active, false)
  assert.equal(cancelled.sequence, 1)
  assert.equal(advanceFidgetSessionTracker(cancelled, {
    timestamp: 1_000_000,
  }).settledSession, null)

  const restarted = registerFidgetSessionInput(cancelled, {
    timestamp: 1_000_001,
    mode: FIDGET_MODES.click,
    inputKind: FIDGET_SESSION_INPUT_KINDS.keyboard,
    velocity: 4,
  })
  assert.equal(restarted.sequence, 2)
})
