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
const audit10 = auditForms.find((form) => form.id === 'audit-10-a')

test('Audit 00-A starts with one unchecked presence field', () => {
  assert.deepEqual(createAuditFormValues(audit00), { presence: false })
  assert.equal(getAuditSubmitField(audit00)?.label, 'POTVRDIT PŘÍTOMNOST')
})

test('Audit 00-A becomes complete only after presence is confirmed', () => {
  assert.equal(isAuditFormComplete(audit00, { presence: false }), false)
  assert.equal(isAuditFormComplete(audit00, { presence: true }), true)
})

test('Audit 10-A has one required radio answer and one submit field', () => {
  const interactiveFields = audit10.fields.filter((field) => field.type !== 'buttonConfirm')
  const submitFields = audit10.fields.filter((field) => field.type === 'buttonConfirm')

  assert.equal(audit10.title, 'Ověření zaznamenané aktivity')
  assert.equal(interactiveFields.length, 1)
  assert.equal(interactiveFields[0].id, 'intentionality')
  assert.equal(interactiveFields[0].type, 'radio')
  assert.equal(interactiveFields[0].required, true)
  assert.equal(interactiveFields[0].label, 'Byla zaznamenaná aktivita provedena úmyslně?')
  assert.deepEqual(interactiveFields[0].options, ['Ano', 'Ne', 'Nelze potvrdit'])
  assert.equal(submitFields.length, 1)
  assert.equal(submitFields[0].required, true)
  assert.equal(submitFields[0].label, 'CERTIFIKOVAT ZÁZNAM')
  assert.equal(isAuditFormComplete(audit10, { intentionality: null }), false)
})

test('every Audit 10-A answer satisfies completion', () => {
  for (const answer of ['Ano', 'Ne', 'Nelze potvrdit']) {
    assert.equal(isAuditFormComplete(audit10, { intentionality: answer }), true)
  }
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
