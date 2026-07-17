import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  createInitialAuditProgressionState,
  getAuditAuthorization,
  getAuditForm,
  isAuditFormAvailable,
  submitAuditForm,
} from '../auditProgression.js'

const auditForms = JSON.parse(await readFile(
  new URL('../../../packages/korp-progression/data/shards/audit-forms.json', import.meta.url),
  'utf8',
))

const audit00 = getAuditForm(auditForms, 'audit-00-a')
const audit10 = getAuditForm(auditForms, 'audit-10-a')
const audit16 = getAuditForm(auditForms, 'audit-16-c')

const withClickAuditEvents = (count) => ({
  resources: {},
  stats: {
    eventsByType: { 'clickaudit.click': count },
  },
})

const withEvidence = (amount) => ({
  resources: { notionalWorkUnits: amount },
  stats: { eventsByType: {} },
})

test('Audit 00-A is available at start', () => {
  assert.equal(isAuditFormAvailable(audit00, withClickAuditEvents(0)), true)
})

test('submitting Audit 00-A records its canonical memo and ClickAudit unlock', () => {
  const submission = submitAuditForm({
    form: audit00,
    korpState: withClickAuditEvents(0),
    progressionState: createInitialAuditProgressionState(),
  })

  assert.equal(submission.didSubmit, true)
  assert.deepEqual(submission.progressionState.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(submission.progressionState.unlockedMemoIds, ['memo.audit-00-a-complete'])
  assert.deepEqual(submission.progressionState.unlockedModuleIds, ['click-audit'])
})

test('Audit 10-A delegates availability and rewards to repeatable packet instances', () => {
  assert.equal('requirements' in audit10, false)
  assert.deepEqual(audit10.completionEffects, [])
  assert.equal(isAuditFormAvailable(audit10, withEvidence(10)), false)
})

test('Audit 16-C is gated by one Evidence through a machine-readable authorization', () => {
  assert.equal(isAuditFormAvailable(audit16, withEvidence(0)), false)
  assert.equal(isAuditFormAvailable(audit16, withEvidence(1)), true)
  assert.equal(isAuditFormAvailable(audit16, withEvidence(3)), true)
  assert.deepEqual(getAuditAuthorization(audit16), {
    moduleId: 'fidget',
    resourceId: 'notionalWorkUnits',
    cost: 1,
  })
})

test('submitted Audit 16-C stays reopenable after its Evidence is allocated', () => {
  const submitted = {
    ...createInitialAuditProgressionState(),
    submittedFormIds: ['audit-16-c'],
  }

  assert.equal(isAuditFormAvailable(audit16, withEvidence(0)), false)
  assert.equal(isAuditFormAvailable(audit16, withEvidence(0), submitted), true)
})

test('Audit 16-C submission exposes its authorization and applies declarative unlocks once', () => {
  const initial = createInitialAuditProgressionState()
  const unavailable = submitAuditForm({
    form: audit16,
    korpState: withEvidence(0),
    progressionState: initial,
  })
  assert.equal(unavailable.didSubmit, false)
  assert.deepEqual(unavailable.progressionState, initial)

  const first = submitAuditForm({
    form: audit16,
    korpState: withEvidence(1),
    progressionState: initial,
  })

  assert.equal(first.didSubmit, true)
  assert.deepEqual(first.authorization, {
    moduleId: 'fidget',
    resourceId: 'notionalWorkUnits',
    cost: 1,
  })
  assert.deepEqual(first.progressionState.submittedFormIds, ['audit-16-c'])
  assert.deepEqual(first.progressionState.ownedUpgradeIds, [])
  assert.deepEqual(first.progressionState.unlockedModuleIds, ['fidget'])
  assert.deepEqual(first.progressionState.unlockedMemoIds, ['memo.fidget-requisition'])

  const repeated = submitAuditForm({
    form: audit16,
    korpState: withEvidence(1),
    progressionState: first.progressionState,
  })
  assert.equal(repeated.didSubmit, false)
  assert.deepEqual(repeated.progressionState, first.progressionState)
})

test('unsupported requirements and effects fail safely', () => {
  const unsupportedRequirement = submitAuditForm({
    form: {
      id: 'audit-unsupported',
      requirements: { kind: 'futureRequirement' },
      completionEffects: [{ kind: 'unlockEverything' }],
    },
    korpState: withClickAuditEvents(25),
    progressionState: createInitialAuditProgressionState(),
  })

  assert.equal(unsupportedRequirement.didSubmit, false)

  const unsupportedEffect = submitAuditForm({
    form: {
      id: 'audit-safe-effect',
      availableAtStart: true,
      completionEffects: [{ kind: 'unlockEverything' }],
    },
    korpState: withClickAuditEvents(0),
    progressionState: createInitialAuditProgressionState(),
  })

  assert.equal(unsupportedEffect.didSubmit, true)
  assert.deepEqual(unsupportedEffect.progressionState.ownedUpgradeIds, [])
  assert.deepEqual(unsupportedEffect.progressionState.unlockedMemoIds, [])
  assert.deepEqual(unsupportedEffect.progressionState.unlockedModuleIds, [])

  for (const requirements of [
    { kind: 'resourceAtLeast', resourceId: 'missing', amount: 1 },
    { kind: 'resourceAtLeast', resourceId: 'notionalWorkUnits', amount: -1 },
    { kind: 'all', requirements: [] },
    { kind: 'all', requirements: [{ kind: 'futureRequirement' }] },
  ]) {
    assert.equal(isAuditFormAvailable({ requirements }, withEvidence(10)), false)
  }

  assert.equal(getAuditAuthorization({ authorization: { moduleId: '', resourceId: 'notionalWorkUnits', cost: 1 } }), null)
  assert.equal(getAuditAuthorization({ authorization: { moduleId: 'fidget', resourceId: 'notionalWorkUnits', cost: 0 } }), null)
  assert.equal(getAuditAuthorization({ authorization: { moduleId: 'fidget', resourceId: 'notionalWorkUnits', cost: 0.5 } }), null)
  assert.equal(getAuditAuthorization({ authorization: { moduleId: 'fidget', resourceId: 'approvalUnits', cost: 1 } }), null)
})
