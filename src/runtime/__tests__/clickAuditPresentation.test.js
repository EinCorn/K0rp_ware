import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLICK_AUDIT_PROGRESS_TARGET,
  getClickAuditDeckSize,
  getClickAuditDigits,
  getClickAuditDigitSpritePosition,
  getClickAuditProgress,
  getClickAuditProgressColor,
  normalizeClickCount,
} from '../clickAuditPresentation.js'

test('ClickAudit count normalization remains safe and integer based', () => {
  assert.equal(normalizeClickCount(-1), 0)
  assert.equal(normalizeClickCount(Number.NaN), 0)
  assert.equal(normalizeClickCount(42.9), 42)
})

test('ClickAudit uses the canonical digit asset grid inputs', () => {
  assert.deepEqual(getClickAuditDigits(0), [0])
  assert.deepEqual(getClickAuditDigits(1205), [1, 2, 0, 5])
  assert.equal(getClickAuditDeckSize(3), 'standard')
  assert.equal(getClickAuditDeckSize(4), 'compact')
  assert.equal(getClickAuditDeckSize(7), 'dense')
  assert.equal(getClickAuditDeckSize(10), 'micro')
})

test('ClickAudit digit sprite mapping uses the canonical five by two sheet', () => {
  assert.deepEqual(getClickAuditDigitSpritePosition(0), {
    column: 0,
    row: 0,
    backgroundPosition: '0% 0%',
  })
  assert.deepEqual(getClickAuditDigitSpritePosition(4), {
    column: 4,
    row: 0,
    backgroundPosition: '100% 0%',
  })
  assert.deepEqual(getClickAuditDigitSpritePosition(5), {
    column: 0,
    row: 1,
    backgroundPosition: '0% 100%',
  })
  assert.deepEqual(getClickAuditDigitSpritePosition(9), {
    column: 4,
    row: 1,
    backgroundPosition: '100% 100%',
  })
})

test('ClickAudit liquid progress clamps to the standalone target', () => {
  assert.equal(getClickAuditProgress(0), 0)
  assert.equal(getClickAuditProgress(CLICK_AUDIT_PROGRESS_TARGET / 2), 0.5)
  assert.equal(getClickAuditProgress(CLICK_AUDIT_PROGRESS_TARGET * 2), 1)
  assert.equal(getClickAuditProgress(10, 0), 0)
})

test('ClickAudit progress color is deterministic', () => {
  assert.equal(getClickAuditProgressColor(0), 'hsl(0.00 0.00% 94.00%)')
  assert.equal(getClickAuditProgressColor(CLICK_AUDIT_PROGRESS_TARGET), 'hsl(280.00 100.00% 66.00%)')
})
