import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  createAuditFormValues,
  getAuditSubmitField,
  isAuditFormComplete,
  isAuditFieldComplete,
  updateMultiCheckValue,
} from '../auditFormDraft.js'

const auditForms = JSON.parse(await readFile(
  new URL('../../../packages/korp-progression/data/shards/audit-forms.json', import.meta.url),
  'utf8',
))

const audit00 = auditForms.find((form) => form.id === 'audit-00-a')

test('Audit 00-A starts with one unchecked presence field', () => {
  assert.deepEqual(createAuditFormValues(audit00), { presence: false })
  assert.equal(getAuditSubmitField(audit00)?.label, 'POTVRDIT PŘÍTOMNOST')
})

test('Audit 00-A becomes complete only after presence is confirmed', () => {
  assert.equal(isAuditFormComplete(audit00, { presence: false }), false)
  assert.equal(isAuditFormComplete(audit00, { presence: true }), true)
})

test('required field validation supports future audit field types', () => {
  assert.equal(isAuditFieldComplete({ type: 'radio', required: true }, null), false)
  assert.equal(isAuditFieldComplete({ type: 'radio', required: true }, 'Ano'), true)
  assert.equal(isAuditFieldComplete({ type: 'multiCheck', required: true, minimumSelections: 2 }, ['A']), false)
  assert.equal(isAuditFieldComplete({ type: 'multiCheck', required: true, minimumSelections: 2 }, ['A', 'B']), true)
  assert.equal(isAuditFieldComplete({ type: 'scale', required: true, minimum: 0, maximum: 4 }, 3), true)
  assert.equal(isAuditFieldComplete({ type: 'futureField', required: true }, 'value'), false)
})

test('multi-check updates remain unique and reversible', () => {
  const first = updateMultiCheckValue([], 'A', true)
  const duplicate = updateMultiCheckValue(first, 'A', true)
  const removed = updateMultiCheckValue(duplicate, 'A', false)

  assert.deepEqual(first, ['A'])
  assert.deepEqual(duplicate, ['A'])
  assert.deepEqual(removed, [])
})
