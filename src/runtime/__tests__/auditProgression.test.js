import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  createInitialAuditProgressionState,
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

const withClickAuditEvents = (count) => ({
  stats: {
    eventsByType: { 'clickaudit.click': count },
  },
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
})
