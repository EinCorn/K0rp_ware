import assert from 'node:assert/strict'
import test from 'node:test'
import { createClickAuditInteractionEvents } from '../clickAuditEvents.js'

test('one ClickAudit intention produces exactly one audited click', () => {
  const events = createClickAuditInteractionEvents({
    timestamp: 1000,
    sequence: 7,
    profile: 'window-drag-handle',
    tags: ['audit-entry'],
  })

  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'clickaudit.click')
  assert.equal(events[0].sourceModule, 'click-audit')
  assert.equal(events[0].meta.profile, 'window-drag-handle')
  assert.deepEqual(events[0].tags, [
    'k0rp-os',
    'clickaudit-telemetry',
    'window-drag-handle',
    'audit-entry',
  ])
})

test('the approved trace upgrade adds only its canonical NWU pulse', () => {
  const events = createClickAuditInteractionEvents({
    timestamp: 1000,
    sequence: 8,
    bonusUnlocked: true,
  })

  assert.deepEqual(events.map((event) => event.type), [
    'clickaudit.click',
    'system.externalWorkPulse',
  ])
  assert.equal(events[1].value, 0.1)
  assert.equal(events.filter((event) => event.type === 'clickaudit.click').length, 1)
})

test('generated event ids remain sequence specific', () => {
  const first = createClickAuditInteractionEvents({ timestamp: 1000, sequence: 1 })
  const second = createClickAuditInteractionEvents({ timestamp: 1000, sequence: 2 })

  assert.notEqual(first[0].id, second[0].id)
})
