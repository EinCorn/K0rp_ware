import assert from 'node:assert/strict'
import test from 'node:test'
import {
  bringWindowStateToFront,
  minimizeWindowState,
  restoreWindowState,
} from '../windowManager.js'

const windows = {
  audit: { id: 'audit', isOpen: true, isMinimized: false, zIndex: 2 },
  clickaudit: { id: 'clickaudit', isOpen: true, isMinimized: true, zIndex: 1 },
}

test('minimize marks an open window without closing it', () => {
  const next = minimizeWindowState(windows, 'audit')
  assert.equal(next.audit.isOpen, true)
  assert.equal(next.audit.isMinimized, true)
})

test('taskbar restore reopens a minimized window and brings it forward', () => {
  const next = restoreWindowState(windows, 'clickaudit')
  assert.equal(next.clickaudit.isOpen, true)
  assert.equal(next.clickaudit.isMinimized, false)
  assert.equal(next.clickaudit.zIndex, 3)
})

test('bring to front preserves an already visible window', () => {
  const next = bringWindowStateToFront(windows, 'audit')
  assert.equal(next.audit.isMinimized, false)
  assert.equal(next.audit.zIndex, 3)
})
