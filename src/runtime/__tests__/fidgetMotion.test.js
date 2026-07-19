import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FIDGET_MOTION,
  calculateFidgetDragVelocity,
  calculateFidgetReleaseVelocity,
  clampFidgetVelocity,
  classifyFidgetGesture,
  getFidgetClickDirection,
  getFidgetRainbowSpeed,
  getNextFidgetMode,
  getNormalizedFidgetSpeed,
  normalizeFidgetDegreeDelta,
} from '../fidgetMotion.js'

test('mode toggle remains a reversible two-state interaction', () => {
  assert.equal(getNextFidgetMode('manual'), 'click')
  assert.equal(getNextFidgetMode('click'), 'manual')
  assert.equal(getNextFidgetMode('unexpected'), 'click')
})

test('motion contract preserves the canonical standalone constants', () => {
  assert.deepEqual(FIDGET_MOTION, {
    friction: 0.992,
    maxVelocity: 42,
    idleNudge: 0.0008,
    tapMoveThreshold: 6,
    rainbowStartSpeed: 0.34,
    confettiStartSpeed: 0.6,
  })
})

test('degree deltas normalize safely across the plus/minus 180 degree boundary', () => {
  assert.equal(normalizeFidgetDegreeDelta(181), -179)
  assert.equal(normalizeFidgetDegreeDelta(-181), 179)
  assert.equal(normalizeFidgetDegreeDelta(540), 180)
  assert.equal(normalizeFidgetDegreeDelta(-540), -180)
})

test('velocity clamping and sampled release velocity remain bounded', () => {
  assert.equal(clampFidgetVelocity(100), FIDGET_MOTION.maxVelocity)
  assert.equal(clampFidgetVelocity(-100), -FIDGET_MOTION.maxVelocity)

  const sampled = calculateFidgetDragVelocity({
    deltaDegrees: 180,
    elapsedMs: 1,
    previousVelocity: FIDGET_MOTION.maxVelocity,
  })

  assert.equal(sampled, FIDGET_MOTION.maxVelocity)
  assert.equal(calculateFidgetReleaseVelocity(sampled), FIDGET_MOTION.maxVelocity)
  assert.equal(calculateFidgetReleaseVelocity(-sampled), -FIDGET_MOTION.maxVelocity)
})

test('tap versus drag classification preserves the canonical six pixel threshold', () => {
  assert.equal(classifyFidgetGesture(6, 0), 'tap')
  assert.equal(classifyFidgetGesture(3, 4), 'tap')
  assert.equal(classifyFidgetGesture(6.01, 0), 'drag')
})

test('normalized and rainbow speed calculations clamp to zero through one', () => {
  assert.equal(getNormalizedFidgetSpeed(0), 0)
  assert.equal(getNormalizedFidgetSpeed(FIDGET_MOTION.maxVelocity * 2), 1)
  assert.equal(getFidgetRainbowSpeed(0), 0)
  assert.equal(getFidgetRainbowSpeed(FIDGET_MOTION.maxVelocity), 1)
  assert.equal(getFidgetRainbowSpeed(FIDGET_MOTION.maxVelocity * 3), 1)
})

test('click mode direction follows the pointer side of the spinner', () => {
  assert.equal(getFidgetClickDirection(99, 50, 100), -1)
  assert.equal(getFidgetClickDirection(100, 50, 100), 1)
  assert.equal(getFidgetClickDirection(140, 50, 100), 1)
})
