import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLICK_AUDIT_PACKET_SIZE,
  appendClickAuditPackets,
  armClickAuditBootstrap,
  captureClickAuditBootstrapAfterSubmission,
  createInitialMetricAuditState,
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
