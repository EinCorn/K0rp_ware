import assert from 'node:assert/strict'
import test from 'node:test'
import { formatClickAuditActivity } from '../clickAuditActivity.js'

const clickEventFor = (profile) => ({
  type: 'clickaudit.click',
  meta: { profile },
})

test('activity mapping provides a neutral entry for every supported OS click profile', () => {
  const profiles = [
    'window-drag-handle',
    'completed-audit-body',
    'active-audit-field',
    'clickaudit-module',
    'desktop-icon',
    'taskbar',
    'folder-entry',
    'window-control',
  ]

  for (const profile of profiles) {
    const entry = formatClickAuditActivity(clickEventFor(profile), 12)
    assert.match(entry, /^#012 /)
    assert.notEqual(entry, '#012 Místní pracovní interakce byla zaevidována.')
  }

  assert.equal(
    formatClickAuditActivity(clickEventFor('generic-os'), 12),
    '#012 Místní pracovní interakce byla zaevidována.',
  )
})

test('activity mapping fails safely for unknown click profiles', () => {
  assert.equal(
    formatClickAuditActivity(clickEventFor('unknown-profile'), 3),
    '#003 Místní pracovní interakce byla zaevidována.',
  )
  assert.equal(formatClickAuditActivity({ type: 'other.event' }, 3), null)
})
