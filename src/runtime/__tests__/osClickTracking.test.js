import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyKorpOsClickTarget,
  createKorpOsClickEvent,
} from '../osClickTracking.js'

const targetWith = (...matches) => ({
  closest(selector) {
    return matches.some((match) => selector.includes(match)) ? {} : null
  },
})

test('K0rp_OS click classification ignores manual and drag-only interactions', () => {
  assert.equal(classifyKorpOsClickTarget(targetWith('[data-clickaudit-manual]')), null)
  assert.equal(classifyKorpOsClickTarget(targetWith('[data-window-drag-region]')), null)
})

test('K0rp_OS click classification assigns the expected semantic profiles', () => {
  assert.equal(classifyKorpOsClickTarget(targetWith('[data-window-control]')).profile, 'window-control')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-taskbar')).profile, 'taskbar')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-folder-entry')).profile, 'folder-entry')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-desktop-icon')).profile, 'desktop-icon')
  assert.equal(classifyKorpOsClickTarget(targetWith('.os-shell')).profile, 'generic-os')
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
