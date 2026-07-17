import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyKorpOsIntentionEvent,
  classifyKorpOsClickTarget,
  createKorpOsClickEvent,
} from '../osClickTracking.js'

const targetWith = (...matches) => ({
  closest(selector) {
    return matches.some((match) => selector.includes(match)) ? {} : null
  },
})

const targetWithProfile = (profile) => ({
  closest(selector) {
    if (selector === '[data-clickaudit-profile]') {
      return { dataset: { clickauditProfile: profile } }
    }

    return null
  },
})

test('K0rp_OS click classification ignores explicit non-audited elements only', () => {
  assert.equal(classifyKorpOsClickTarget(targetWith('[data-clickaudit-ignore]')), null)
})

test('K0rp_OS click classification assigns the expected semantic profiles', () => {
  assert.equal(classifyKorpOsClickTarget(targetWithProfile('window-drag-handle')).profile, 'window-drag-handle')
  assert.equal(classifyKorpOsClickTarget(targetWithProfile('completed-audit-body')).profile, 'completed-audit-body')
  assert.equal(classifyKorpOsClickTarget(targetWithProfile('active-audit-field')).profile, 'active-audit-field')
  assert.equal(classifyKorpOsClickTarget(targetWithProfile('clickaudit-module')).profile, 'clickaudit-module')
  assert.equal(classifyKorpOsClickTarget(targetWithProfile('fidget-module')).profile, 'fidget-module')
  assert.equal(classifyKorpOsClickTarget(targetWith('[data-window-control]')).profile, 'window-control')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-taskbar')).profile, 'taskbar')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-folder-entry')).profile, 'folder-entry')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-desktop-icon')).profile, 'desktop-icon')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-shell')).profile, 'generic-os')
})

test('a Fidget pointer intention stays one centralized ClickAudit event', () => {
  const target = targetWithProfile('fidget-module')
  const classification = classifyKorpOsIntentionEvent('pointerdown', target)
  const events = [createKorpOsClickEvent({
    timestamp: 1200,
    sequence: 8,
    profile: classification.profile,
  })]

  assert.equal(events.length, 1)
  assert.equal(events[0].value, 1)
  assert.equal(events[0].meta.profile, 'fidget-module')
  assert.equal(classifyKorpOsIntentionEvent('pointermove', target), null)
  assert.equal(classifyKorpOsIntentionEvent('wheel', target), null)
})

test('K0rp_OS telemetry creates one tagged ClickAudit event without private context', () => {
  const event = createKorpOsClickEvent({
    timestamp: 1000,
    sequence: 7,
    profile: 'folder-entry',
    tags: ['forms-folder'],
  })

  assert.equal(event.type, 'clickaudit.click')
  assert.equal(event.sourceModule, 'click-audit')
  assert.equal(event.meta.profile, 'folder-entry')
  assert.deepEqual(event.tags, ['k0rp-os', 'clickaudit-telemetry', 'folder-entry', 'forms-folder'])
  assert.equal('coordinates' in event.meta, false)
  assert.equal('activeWindow' in event.meta, false)
})
