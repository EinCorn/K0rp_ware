import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createAuditFormValues } from '../auditFormDraft.js'
import { createInitialAuditProgressionState } from '../auditProgression.js'
import {
  applyModuleAuthorizationTransaction,
  canAllocateAuthorization,
  isModuleAuthorized,
  resolveModuleAuthorizationSubmission,
} from '../moduleAuthorization.js'

const auditForms = JSON.parse(await readFile(
  new URL('../../../packages/korp-progression/data/shards/audit-forms.json', import.meta.url),
  'utf8',
))
const audit16 = auditForms.find(({ id }) => id === 'audit-16-c')
const completedValues = Object.fromEntries(
  Object.keys(createAuditFormValues(audit16)).map((fieldId) => [fieldId, true]),
)

const withEvidence = (amount) => ({
  resources: { notionalWorkUnits: amount },
  stats: { totalEvents: 0, eventsByType: {}, eventsByModule: {} },
})

const applyAuthorizationEvents = (korpState, events) => events.reduce((state, event) => {
  const resources = event.type === 'authorization.evidenceAllocated'
    ? {
        ...state.resources,
        notionalWorkUnits: state.resources.notionalWorkUnits - event.value,
      }
    : state.resources

  return {
    ...state,
    resources,
    stats: {
      totalEvents: state.stats.totalEvents + 1,
      eventsByType: {
        ...state.stats.eventsByType,
        [event.type]: (state.stats.eventsByType[event.type] ?? 0) + 1,
      },
      eventsByModule: {
        ...state.stats.eventsByModule,
        [event.sourceModule]: (state.stats.eventsByModule[event.sourceModule] ?? 0) + 1,
      },
    },
  }
}, korpState)

const createRuntime = (evidence = 1) => {
  const korpState = withEvidence(evidence)

  return {
    ...createInitialAuditProgressionState(),
    korpState,
    lifetimeStats: korpState.stats,
    moduleAuthorizations: [],
  }
}

const resolve = ({
  evidence = 1,
  values = completedValues,
  progressionState = createInitialAuditProgressionState(),
  moduleAuthorizations = [],
  timestamp = 1_750_000_000_000,
} = {}) => resolveModuleAuthorizationSubmission({
  form: audit16,
  values,
  korpState: withEvidence(evidence),
  progressionState,
  moduleAuthorizations,
  timestamp,
})

test('Audit 16-C requires both acknowledgements before authorization', () => {
  for (const missingFieldId of ['requisition', 'acknowledgement']) {
    const result = resolve({
      values: { ...completedValues, [missingFieldId]: false },
    })

    assert.equal(result.didAuthorize, false)
    assert.deepEqual(result.events, [])
    assert.deepEqual(result.moduleAuthorizations, [])
  }
})

test('submitting at EV 0 fails without any partial progression or system events', () => {
  const progressionState = createInitialAuditProgressionState()
  const result = resolve({ evidence: 0, progressionState })

  assert.equal(result.didAuthorize, false)
  assert.equal(result.progressionState, progressionState)
  assert.deepEqual(result.moduleAuthorizations, [])
  assert.deepEqual(result.events, [])
})

test('valid submission grants one persisted Fidget authorization and declarative unlocks', () => {
  const result = resolve()

  assert.equal(result.didAuthorize, true)
  assert.deepEqual(result.progressionState.submittedFormIds, ['audit-16-c'])
  assert.deepEqual(result.progressionState.unlockedModuleIds, ['fidget'])
  assert.deepEqual(result.progressionState.unlockedMemoIds, ['memo.fidget-requisition'])
  assert.deepEqual(result.moduleAuthorizations, [{
    id: 'fidget',
    moduleId: 'fidget',
    sourceFormId: 'audit-16-c',
    evidenceCost: 1,
    grantedAt: 1_750_000_000_000,
  }])
  assert.deepEqual(result.events.map(({ type }) => type), [
    'audit.formSubmitted',
    'authorization.evidenceAllocated',
    'authorization.granted',
  ])
  assert.equal(result.events[1].value, 1)
  assert.equal(result.events[1].meta.resourceId, 'notionalWorkUnits')
  assert.deepEqual(result.allocation, { resourceId: 'notionalWorkUnits', cost: 1 })
  assert.equal(1 - result.allocation.cost, 0)
  assert.equal(isModuleAuthorized(result.moduleAuthorizations, 'fidget'), true)
})

test('repeated submission cannot allocate Evidence or grant authorization again', () => {
  const first = resolve({ evidence: 3 })
  const repeated = resolve({
    evidence: 2,
    progressionState: first.progressionState,
    moduleAuthorizations: first.moduleAuthorizations,
  })

  assert.equal(repeated.didAuthorize, false)
  assert.equal(repeated.progressionState, first.progressionState)
  assert.equal(repeated.moduleAuthorizations, first.moduleAuthorizations)
  assert.deepEqual(repeated.events, [])
})

test('a balance above EV 1 allocates exactly one and retains the remainder', () => {
  const result = resolve({ evidence: 3 })

  assert.equal(result.didAuthorize, true)
  assert.equal(result.allocation.cost, 1)
  assert.equal(3 - result.allocation.cost, 2)
})

test('authorization allocation guard preserves a non-negative balance', () => {
  const declaration = audit16.authorization

  assert.equal(canAllocateAuthorization(withEvidence(3), declaration), true)
  assert.equal(canAllocateAuthorization(withEvidence(1), declaration), true)
  assert.equal(canAllocateAuthorization(withEvidence(0), declaration), false)
  assert.equal(canAllocateAuthorization(withEvidence(-1), declaration), false)
  assert.equal(canAllocateAuthorization(withEvidence(Number.NaN), declaration), false)
  assert.equal(canAllocateAuthorization(withEvidence(5), { ...declaration, cost: 0 }), false)
  assert.equal(canAllocateAuthorization({
    resources: { approvalUnits: 5 },
  }, {
    ...declaration,
    resourceId: 'approvalUnits',
  }), false)
})

test('runtime transaction commits EV, progression and authorization as one state change', () => {
  const runtime = createRuntime(1)
  const transaction = applyModuleAuthorizationTransaction({
    runtime,
    form: audit16,
    values: completedValues,
    timestamp: 1_750_000_000_000,
    applyEvents: applyAuthorizationEvents,
  })

  assert.equal(transaction.didAuthorize, true)
  assert.equal(transaction.runtimeState.korpState.resources.notionalWorkUnits, 0)
  assert.deepEqual(transaction.runtimeState.submittedFormIds, ['audit-16-c'])
  assert.deepEqual(transaction.runtimeState.moduleAuthorizations.map(({ moduleId }) => moduleId), ['fidget'])
  assert.deepEqual(transaction.runtimeState.unlockedModuleIds, ['fidget'])
  assert.deepEqual(transaction.runtimeState.unlockedMemoIds, ['memo.fidget-requisition'])
  assert.equal(
    transaction.runtimeState.korpState.stats.eventsByType['authorization.evidenceAllocated'],
    1,
  )
  assert.equal(transaction.runtimeState.korpState.stats.eventsByType['authorization.granted'], 1)

  const repeated = applyModuleAuthorizationTransaction({
    runtime: transaction.runtimeState,
    form: audit16,
    values: completedValues,
    timestamp: 1_750_000_000_001,
    applyEvents: applyAuthorizationEvents,
  })

  assert.equal(repeated.didAuthorize, false)
  assert.equal(repeated.runtimeState, transaction.runtimeState)
})

test('runtime transaction rejects a partial core application without exposing unlocks', () => {
  const runtime = createRuntime(1)
  const transaction = applyModuleAuthorizationTransaction({
    runtime,
    form: audit16,
    values: completedValues,
    timestamp: 1_750_000_000_000,
    applyEvents: (korpState) => korpState,
  })

  assert.equal(transaction.didAuthorize, false)
  assert.equal(transaction.runtimeState, runtime)
  assert.deepEqual(runtime.submittedFormIds, [])
  assert.deepEqual(runtime.moduleAuthorizations, [])
  assert.equal(runtime.korpState.resources.notionalWorkUnits, 1)
})
