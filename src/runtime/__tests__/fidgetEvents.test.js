import assert from 'node:assert/strict'
import test from 'node:test'
import { FIDGET_MODES } from '../fidgetMotion.js'
import { createFidgetSessionSettledEvent } from '../fidgetEvents.js'

test('one settled payload maps to one exact privacy-safe Fidget closure event', () => {
  assert.deepEqual(createFidgetSessionSettledEvent({
    sequence: 4,
    mode: FIDGET_MODES.click,
    source: 'manual',
    ignoredDuration: 99_999,
  }, 1_750_000_000_000), {
    id: 'k0rp-os-fidget-session-settled-1750000000000-4',
    timestamp: 1_750_000_000_000,
    sourceModule: 'fidget',
    type: 'fidget.sessionSettled',
    value: 1,
    tags: ['k0rp-os', 'metric-closure', 'fidget', 'manual'],
    meta: {
      sequence: 4,
      mode: FIDGET_MODES.click,
      source: 'manual',
    },
  })
})

test('event normalization cannot widen source or metadata', () => {
  const event = createFidgetSessionSettledEvent({
    sequence: -10,
    mode: 'unknown',
    source: 'delegated',
    userText: 'must not escape',
  }, 2_000)

  assert.deepEqual(event.meta, {
    sequence: 1,
    mode: FIDGET_MODES.manual,
    source: 'manual',
  })
  assert.deepEqual(event.tags, ['k0rp-os', 'metric-closure', 'fidget', 'manual'])
  assert.equal(Object.hasOwn(event.meta, 'userText'), false)
})
