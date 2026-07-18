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
const audit16 = auditForms.find((form) => form.id === 'audit-16-c')
const audit18 = auditForms.find((form) => form.id === 'audit-18-s')

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

test('Audit 16-C requires both compact requisition checkboxes', () => {
  const interactiveFields = audit16.fields.filter((field) => field.type !== 'buttonConfirm')

  assert.equal(audit16.title, 'Přidělení stabilizačního vybavení')
  assert.equal(interactiveFields.length, 2)
  assert.equal(interactiveFields.every((field) => field.type === 'checkbox'), true)
  assert.deepEqual(interactiveFields.map((field) => field.label), [
    'Žádám o přidělení rotačního stabilizátoru.',
    'Beru na vědomí, že stabilizace není řešení.',
  ])
  assert.deepEqual(createAuditFormValues(audit16), {
    requisition: false,
    acknowledgement: false,
  })
  assert.equal(getAuditSubmitField(audit16)?.label, 'ALOKOVAT 1 EVIDENCE')
  assert.equal(isAuditFormComplete(audit16, {
    requisition: false,
    acknowledgement: false,
  }), false)
  assert.equal(isAuditFormComplete(audit16, {
    requisition: true,
    acknowledgement: false,
  }), false)
  assert.equal(isAuditFormComplete(audit16, {
    requisition: false,
    acknowledgement: true,
  }), false)
  assert.equal(isAuditFormComplete(audit16, {
    requisition: true,
    acknowledgement: true,
  }), true)
})

test('Audit 18-S is the fixed repeatable stabilization certification form', () => {
  const interactiveFields = audit18.fields.filter((field) => field.type !== 'buttonConfirm')

  assert.equal(audit18.code, '18-S')
  assert.equal(audit18.title, 'Ověření stabilizační relace')
  assert.equal(audit18.repeatable, true)
  assert.deepEqual(audit18.completionEffects, [])
  assert.equal(interactiveFields.length, 1)
  assert.deepEqual(interactiveFields[0], {
    id: 'naturalClosure',
    type: 'radio',
    label: 'Byla zaznamenaná stabilizační relace ukončena přirozeně?',
    required: true,
    options: ['Ano', 'Ne', 'Nelze potvrdit'],
  })
  assert.equal(getAuditSubmitField(audit18)?.label, '[CERTIFIKOVAT STABILIZACI]')
  assert.equal(isAuditFormComplete(audit18, { naturalClosure: null }), false)
})

test('every Audit 18-S answer is administratively valid', () => {
  for (const answer of ['Ano', 'Ne', 'Nelze potvrdit']) {
    assert.equal(isAuditFormComplete(audit18, { naturalClosure: answer }), true)
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
