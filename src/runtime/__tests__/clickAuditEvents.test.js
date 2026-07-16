import assert from 'node:assert/strict'
import test from 'node:test'
import { createClickAuditInteractionEvents } from '../clickAuditEvents.js'

test('one ClickAudit intention produces exactly one audited raw click', () => {
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

test('raw ClickAudit intentions never emit a spendable reward event', () => {
  const events = createClickAuditInteractionEvents({
    timestamp: 1000,
    sequence: 8,
  })

  assert.deepEqual(events.map((event) => event.type), ['clickaudit.click'])
  assert.equal(events.some((event) => event.type === 'system.externalWorkPulse'), false)
})

test('generated event ids remain sequence specific', () => {
  const first = createClickAuditInteractionEvents({ timestamp: 1000, sequence: 1 })
  const second = createClickAuditInteractionEvents({ timestamp: 1000, sequence: 2 })

  assert.notEqual(first[0].id, second[0].id)
})
