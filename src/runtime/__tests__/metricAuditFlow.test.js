import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLICK_AUDIT_PACKET_SIZE,
  FIDGET_AUDIT_TEMPLATE_ID,
  FIDGET_METRIC_TYPE,
  FIDGET_SESSIONS_PER_PACKET,
  appendClickAuditPackets,
  appendFidgetSessionPackets,
  armClickAuditBootstrap,
  captureClickAuditBootstrapAfterSubmission,
  createInitialMetricAuditState,
  describeMetricAuditPacket,
  getMetricAuditBacklog,
  getPendingAuditInstances,
  getPendingMetricPackets,
  resolveMetricAuditCertification,
  updateMetricAuditInstanceField,
} from '../metricAuditFlow.js'

const createRuntimeState = (clickCount = 0) => ({
  submittedFormIds: [],
  ...createInitialMetricAuditState(clickCount),
})

const createArmedState = (clickCount = 0) => (
  armClickAuditBootstrap(createRuntimeState(clickCount), clickCount)
)

test('pre-unlock clicks never create a metric packet', () => {
  const result = appendClickAuditPackets(createRuntimeState(), 100, 1000)

  assert.equal(result.createdPackets.length, 0)
  assert.equal(result.batchEvents.length, 0)
  assert.equal(result.runtimeState.clickAuditBatchBaseline, 0)
  assert.equal(result.runtimeState.clickAuditBootstrapArmed, false)
  assert.equal(result.runtimeState.clickAuditBootstrapCompleted, false)
})

test('submitting Audit 00-A captures the raw click baseline and arms bootstrap once', () => {
  const afterPreUnlockClicks = appendClickAuditPackets(createRuntimeState(), 7, 1000).runtimeState
  const submissionState = {
    ...afterPreUnlockClicks,
    korpState: {
      stats: { eventsByType: { 'clickaudit.click': 7 } },
    },
  }
  const armed = captureClickAuditBootstrapAfterSubmission(submissionState, 'audit-00-a')

  assert.equal(armed.clickAuditBatchBaseline, 7)
  assert.equal(armed.clickAuditBootstrapArmed, true)
  assert.equal(armed.clickAuditBootstrapCompleted, false)
  assert.equal(captureClickAuditBootstrapAfterSubmission(armed, 'audit-00-a'), armed)
  assert.equal(
    captureClickAuditBootstrapAfterSubmission(submissionState, 'audit-16-c'),
    submissionState,
  )
})

test('the first post-unlock click creates exactly one quantity-1 bootstrap packet', () => {
  const result = appendClickAuditPackets(createArmedState(7), 8, 1000)

  assert.equal(result.createdPackets.length, 1)
  assert.equal(result.batchEvents.length, 1)
  assert.equal(result.createdPackets[0].quantity, 1)
  assert.equal(result.createdPackets[0].rangeStart, 8)
  assert.equal(result.createdPackets[0].rangeEnd, 8)
  assert.equal(result.batchEvents[0].value, 1)
  assert.equal(result.runtimeState.clickAuditBatchBaseline, 8)
  assert.equal(result.runtimeState.clickAuditBootstrapArmed, false)
  assert.equal(result.runtimeState.clickAuditBootstrapCompleted, true)
  assert.equal(getPendingMetricPackets(result.runtimeState).length, 1)
  assert.equal(getPendingAuditInstances(result.runtimeState, 'audit-10-a').length, 1)
})

test('clicks 2 through 24 after bootstrap create no normal packet', () => {
  const bootstrap = appendClickAuditPackets(createArmedState(7), 8, 1000)
  const beforeThreshold = appendClickAuditPackets(bootstrap.runtimeState, 32, 2000)

  assert.equal(beforeThreshold.createdPackets.length, 0)
  assert.equal(beforeThreshold.batchEvents.length, 0)
  assert.equal(beforeThreshold.runtimeState.clickAuditBatchBaseline, 8)
  assert.equal(beforeThreshold.runtimeState.metricPackets.length, 1)
})

test('the 25th click after bootstrap creates one normal quantity-25 packet', () => {
  const bootstrap = appendClickAuditPackets(createArmedState(7), 8, 1000)
  const atThreshold = appendClickAuditPackets(bootstrap.runtimeState, 33, 2000)

  assert.equal(atThreshold.createdPackets.length, 1)
  assert.equal(atThreshold.batchEvents.length, 1)
  assert.equal(atThreshold.createdPackets[0].quantity, CLICK_AUDIT_PACKET_SIZE)
  assert.equal(atThreshold.createdPackets[0].rangeStart, 9)
  assert.equal(atThreshold.createdPackets[0].rangeEnd, 33)
  assert.equal(atThreshold.runtimeState.clickAuditBatchBaseline, 33)
  assert.deepEqual(
    atThreshold.runtimeState.metricPackets.map((packet) => [packet.rangeStart, packet.rangeEnd]),
    [[8, 8], [9, 33]],
  )
})

test('refresh cannot recreate either bootstrap or normal packets', () => {
  const bootstrap = appendClickAuditPackets(createArmedState(7), 8, 1000)
  const refreshedBootstrap = appendClickAuditPackets(
    structuredClone(bootstrap.runtimeState),
    8,
    2000,
  )

  assert.equal(refreshedBootstrap.createdPackets.length, 0)
  assert.equal(refreshedBootstrap.runtimeState.metricPackets.length, 1)

  const normal = appendClickAuditPackets(refreshedBootstrap.runtimeState, 33, 3000)
  const refreshedNormal = appendClickAuditPackets(
    structuredClone(normal.runtimeState),
    33,
    4000,
  )

  assert.equal(refreshedNormal.createdPackets.length, 0)
  assert.equal(refreshedNormal.runtimeState.metricPackets.length, 2)
  assert.equal(refreshedNormal.runtimeState.auditInstances.length, 2)
})

test('one audit answer persists and certification emits exactly one Evidence event', () => {
  const packetResult = appendClickAuditPackets(createArmedState(), 1, 1000)
  const instance = packetResult.createdAuditInstances[0]
  const drafted = updateMetricAuditInstanceField(
    packetResult.runtimeState,
    instance.id,
    'intentionality',
    'Nelze potvrdit',
  )

  assert.equal(drafted.auditInstances[0].status, 'draft')
  assert.equal(drafted.auditInstances[0].values.intentionality, 'Nelze potvrdit')

  const certified = resolveMetricAuditCertification(
    drafted,
    instance.id,
    'audit-10-a',
    2000,
  )

  assert.equal(certified.didCertify, true)
  assert.equal(certified.packet.status, 'certified')
  assert.equal(certified.auditInstance.status, 'submitted')
  assert.equal(certified.auditInstance.values.intentionality, 'Nelze potvrdit')
  assert.deepEqual(certified.runtimeState.submittedFormIds, ['audit-10-a'])
  assert.equal(getPendingMetricPackets(certified.runtimeState).length, 0)
  assert.deepEqual(certified.events.map((event) => event.type), [
    'audit.formSubmitted',
    'audit.evidenceCertified',
  ])
  assert.equal(certified.events[1].value, 1)
  assert.equal(certified.events[1].meta.evidenceAmount, 1)

  const repeated = resolveMetricAuditCertification(
    certified.runtimeState,
    instance.id,
    'audit-10-a',
    3000,
  )

  assert.equal(repeated.didCertify, false)
  assert.deepEqual(repeated.events, [])
  assert.equal(repeated.runtimeState, certified.runtimeState)
})

test('a certified repeatable audit remains while the next packet creates a distinct instance', () => {
  const bootstrap = appendClickAuditPackets(createArmedState(), 1, 1000)
  const firstInstance = bootstrap.createdAuditInstances[0]
  const drafted = updateMetricAuditInstanceField(
    bootstrap.runtimeState,
    firstInstance.id,
    'intentionality',
    'Ano',
  )
  const certified = resolveMetricAuditCertification(
    drafted,
    firstInstance.id,
    'audit-10-a',
    2000,
  )
  const nextPacket = appendClickAuditPackets(certified.runtimeState, 26, 3000)
  const secondInstance = nextPacket.createdAuditInstances[0]

  assert.notEqual(firstInstance.id, secondInstance.id)
  assert.equal(nextPacket.runtimeState.auditInstances.length, 2)
  assert.equal(nextPacket.runtimeState.auditInstances[0].id, firstInstance.id)
  assert.equal(nextPacket.runtimeState.auditInstances[0].packetId, nextPacket.runtimeState.metricPackets[0].id)
  assert.equal(nextPacket.runtimeState.auditInstances[0].status, 'submitted')
  assert.equal(nextPacket.runtimeState.auditInstances[0].values.intentionality, 'Ano')
  assert.equal(nextPacket.runtimeState.auditInstances[1].id, secondInstance.id)
  assert.equal(nextPacket.runtimeState.auditInstances[1].packetId, nextPacket.runtimeState.metricPackets[1].id)
  assert.equal(nextPacket.runtimeState.auditInstances[1].status, 'available')
  assert.equal(nextPacket.runtimeState.metricPackets[0].status, 'certified')
  assert.equal(nextPacket.runtimeState.metricPackets[1].status, 'pending')
  assert.equal(getPendingMetricPackets(nextPacket.runtimeState).length, 1)
  assert.equal(getPendingAuditInstances(nextPacket.runtimeState, 'audit-10-a').length, 1)
})

test('Fidget uses the fixed provisional three-session packet boundary', () => {
  assert.equal(FIDGET_SESSIONS_PER_PACKET, 3)

  const one = appendFidgetSessionPackets(createRuntimeState(), 1, 1000)
  const two = appendFidgetSessionPackets(one.runtimeState, 2, 1100)
  const three = appendFidgetSessionPackets(two.runtimeState, 3, 1200)
  const five = appendFidgetSessionPackets(three.runtimeState, 5, 1300)
  const six = appendFidgetSessionPackets(five.runtimeState, 6, 1400)

  assert.equal(one.createdPackets.length, 0)
  assert.equal(two.createdPackets.length, 0)
  assert.equal(three.createdPackets.length, 1)
  assert.deepEqual(three.createdPackets[0], {
    id: 'fidget-sessions-1-3',
    metricType: FIDGET_METRIC_TYPE,
    source: 'manual',
    quantity: 3,
    status: 'pending',
    createdAt: 1200,
    auditTemplateId: FIDGET_AUDIT_TEMPLATE_ID,
    rangeStart: 1,
    rangeEnd: 3,
  })
  assert.deepEqual(three.createdAuditInstances[0], {
    id: 'audit-18-s:fidget-sessions-1-3',
    templateId: FIDGET_AUDIT_TEMPLATE_ID,
    packetId: 'fidget-sessions-1-3',
    status: 'available',
    values: {},
    createdAt: 1200,
  })
  assert.equal(five.createdPackets.length, 0)
  assert.equal(five.runtimeState.fidgetSessionBatchBaseline, 3)
  assert.equal(six.createdPackets.length, 1)
  assert.equal(six.createdPackets[0].id, 'fidget-sessions-4-6')
  assert.equal(six.runtimeState.metricPackets.length, 2)
  assert.equal(six.runtimeState.auditInstances.length, 2)
  assert.equal(six.runtimeState.fidgetSessionBatchBaseline, 6)
})

test('Fidget packet refresh is idempotent and packet size is injectable for pure tests', () => {
  const fixed = appendFidgetSessionPackets(createRuntimeState(), 3, 1000)
  const refreshed = appendFidgetSessionPackets(structuredClone(fixed.runtimeState), 3, 2000)

  assert.equal(refreshed.createdPackets.length, 0)
  assert.equal(refreshed.createdAuditInstances.length, 0)
  assert.equal(refreshed.runtimeState.metricPackets.length, 1)
  assert.equal(refreshed.runtimeState.auditInstances.length, 1)

  const injected = appendFidgetSessionPackets(createRuntimeState(), 4, 3000, 2)
  assert.deepEqual(
    injected.createdPackets.map((packet) => [packet.id, packet.quantity]),
    [
      ['fidget-sessions-1-2', 2],
      ['fidget-sessions-3-4', 2],
    ],
  )

  const invalid = appendFidgetSessionPackets(createRuntimeState(), 4, 4000, 0)
  assert.equal(invalid.runtimeState.metricPackets.length, 0)
  assert.equal(invalid.runtimeState.fidgetSessionBatchBaseline, 0)
})

test('Audit 18-S certifies only its linked packet once and never becomes a one-time form id', () => {
  const packetResult = appendFidgetSessionPackets(createRuntimeState(), 3, 1000)
  const instance = packetResult.createdAuditInstances[0]
  const drafted = updateMetricAuditInstanceField(
    packetResult.runtimeState,
    instance.id,
    'naturalClosure',
    'Ne',
  )
  const wrongTemplate = resolveMetricAuditCertification(
    drafted,
    instance.id,
    'audit-10-a',
    1500,
  )

  assert.equal(wrongTemplate.didCertify, false)
  assert.deepEqual(wrongTemplate.events, [])
  assert.equal(wrongTemplate.runtimeState, drafted)

  const certified = resolveMetricAuditCertification(
    drafted,
    instance.id,
    FIDGET_AUDIT_TEMPLATE_ID,
    2000,
  )

  assert.equal(certified.didCertify, true)
  assert.equal(certified.packet.status, 'certified')
  assert.equal(certified.auditInstance.status, 'submitted')
  assert.equal(certified.auditInstance.values.naturalClosure, 'Ne')
  assert.deepEqual(certified.runtimeState.submittedFormIds, [])
  assert.deepEqual(certified.events.map((event) => event.type), [
    'audit.formSubmitted',
    'audit.evidenceCertified',
  ])
  assert.equal(certified.events[0].meta.metricType, FIDGET_METRIC_TYPE)
  assert.equal(certified.events[1].meta.metricType, FIDGET_METRIC_TYPE)
  assert.equal(certified.events[1].value, 1)
  assert.equal(getPendingMetricPackets(certified.runtimeState).length, 0)

  const repeated = resolveMetricAuditCertification(
    certified.runtimeState,
    instance.id,
    FIDGET_AUDIT_TEMPLATE_ID,
    3000,
  )
  assert.equal(repeated.didCertify, false)
  assert.deepEqual(repeated.events, [])
})

test('metric certification rejects a malformed instance-to-packet identity link', () => {
  const packetResult = appendFidgetSessionPackets(createRuntimeState(), 3, 1000)
  const malformed = {
    ...packetResult.runtimeState,
    auditInstances: packetResult.runtimeState.auditInstances.map((instance) => ({
      ...instance,
      id: 'audit-18-s:wrong-packet-id',
    })),
  }
  const result = resolveMetricAuditCertification(
    malformed,
    'audit-18-s:wrong-packet-id',
    FIDGET_AUDIT_TEMPLATE_ID,
    2000,
  )

  assert.equal(result.didCertify, false)
  assert.deepEqual(result.events, [])
  assert.equal(result.runtimeState, malformed)
})

test('ClickAudit and Fidget queues coexist and certify independently', () => {
  const click = appendClickAuditPackets(createArmedState(), 1, 1000)
  const mixed = appendFidgetSessionPackets(click.runtimeState, 3, 1100)
  const fidgetInstance = mixed.createdAuditInstances[0]
  const drafted = updateMetricAuditInstanceField(
    mixed.runtimeState,
    fidgetInstance.id,
    'naturalClosure',
    'Nelze potvrdit',
  )
  const certified = resolveMetricAuditCertification(
    drafted,
    fidgetInstance.id,
    FIDGET_AUDIT_TEMPLATE_ID,
    2000,
  )

  assert.equal(getPendingMetricPackets(mixed.runtimeState).length, 2)
  assert.deepEqual(
    getPendingMetricPackets(certified.runtimeState).map((packet) => packet.metricType),
    ['clickaudit.click'],
  )
  assert.equal(certified.runtimeState.metricPackets[0].status, 'pending')
  assert.equal(certified.runtimeState.metricPackets[1].status, 'certified')
})

test('backlog selector groups metric sources and derives provisional pressure without state writes', () => {
  const click = appendClickAuditPackets(createArmedState(), 1, 1000)
  const mixed = appendFidgetSessionPackets(click.runtimeState, 3, 2000)
  const runtimeSnapshot = structuredClone(mixed.runtimeState)
  const backlog = getMetricAuditBacklog(mixed.runtimeState, {
    now: 1_201_000,
    discrepancyCount: 1,
  })

  assert.deepEqual(backlog, {
    pendingCount: 2,
    oldestPendingAgeMs: 1_200_000,
    pendingByMetricType: {
      'clickaudit.click': 1,
      'fidget.sessionSettled': 1,
    },
    provisionalAuditPressure: 42,
  })
  assert.deepEqual(mixed.runtimeState, runtimeSnapshot)
  assert.equal('auditPressure' in mixed.runtimeState, false)
  assert.equal(getMetricAuditBacklog(mixed.runtimeState, {
    now: 99_999_999,
    discrepancyCount: 10,
  }).provisionalAuditPressure, 100)

  const nonPending = {
    ...mixed.runtimeState,
    metricPackets: mixed.runtimeState.metricPackets.map((packet, index) => ({
      ...packet,
      status: index === 0 ? 'certified' : 'rejected',
    })),
  }
  assert.equal(getMetricAuditBacklog(nonPending, { now: 1_201_000 }).pendingCount, 0)
})

test('mixed queue descriptors keep source-specific title and detail language', () => {
  const clickPacket = appendClickAuditPackets(createArmedState(), 1, 1000).createdPackets[0]
  const fidgetPacket = appendFidgetSessionPackets(createRuntimeState(), 3, 1000).createdPackets[0]

  assert.deepEqual(describeMetricAuditPacket(clickPacket, { code: '10-A' }), {
    rangeLabel: '1',
    title: 'Audit 10-A / 1',
    detail: '1 kliků / rozsah 1',
  })
  assert.deepEqual(describeMetricAuditPacket(fidgetPacket, { code: '18-S' }), {
    rangeLabel: '1–3',
    title: 'Audit 18-S / 1–3',
    detail: '3 relace / stabilizační rozsah 1–3',
  })
})
