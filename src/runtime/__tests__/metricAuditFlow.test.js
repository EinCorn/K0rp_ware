import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLICK_AUDIT_PACKET_SIZE,
  appendClickAuditPackets,
  certifyMetricAuditInstance,
  createInitialMetricAuditState,
  getPendingAuditInstances,
  getPendingMetricPackets,
  updateMetricAuditInstanceField,
} from '../metricAuditFlow.js'

const createRuntimeState = (clickCount = 0) => ({
  submittedFormIds: [],
  ...createInitialMetricAuditState(clickCount),
})

test('24 new clicks do not create a packet and the 25th creates exactly one', () => {
  const initial = createRuntimeState()
  const beforeThreshold = appendClickAuditPackets(initial, 24, 1000)

  assert.equal(beforeThreshold.createdPackets.length, 0)
  assert.equal(beforeThreshold.runtimeState.clickAuditBatchBaseline, 0)

  const atThreshold = appendClickAuditPackets(beforeThreshold.runtimeState, 25, 2000)

  assert.equal(atThreshold.createdPackets.length, 1)
  assert.equal(atThreshold.batchEvents.length, 1)
  assert.equal(atThreshold.createdPackets[0].quantity, CLICK_AUDIT_PACKET_SIZE)
  assert.equal(atThreshold.createdPackets[0].rangeStart, 1)
  assert.equal(atThreshold.createdPackets[0].rangeEnd, 25)
  assert.equal(atThreshold.runtimeState.clickAuditBatchBaseline, 25)
  assert.equal(getPendingMetricPackets(atThreshold.runtimeState).length, 1)
  assert.equal(getPendingAuditInstances(atThreshold.runtimeState, 'audit-10-a').length, 1)
})

test('50 new clicks create two distinct packets', () => {
  const result = appendClickAuditPackets(createRuntimeState(), 50, 1000)

  assert.equal(result.createdPackets.length, 2)
  assert.deepEqual(result.createdPackets.map((packet) => [packet.rangeStart, packet.rangeEnd]), [
    [1, 25],
    [26, 50],
  ])
  assert.equal(result.runtimeState.clickAuditBatchBaseline, 50)
  assert.equal(result.batchEvents.length, 2)
})

test('the same click total cannot recreate packets after refresh', () => {
  const first = appendClickAuditPackets(createRuntimeState(), 25, 1000)
  const refreshedState = structuredClone(first.runtimeState)
  const repeated = appendClickAuditPackets(refreshedState, 25, 2000)

  assert.equal(repeated.createdPackets.length, 0)
  assert.equal(repeated.runtimeState.metricPackets.length, 1)
  assert.equal(repeated.runtimeState.auditInstances.length, 1)
})

test('migration baseline ignores historical clicks and starts from the next 25', () => {
  const migrated = createRuntimeState(947)

  assert.equal(appendClickAuditPackets(migrated, 971, 1000).createdPackets.length, 0)

  const result = appendClickAuditPackets(migrated, 972, 1000)
  assert.equal(result.createdPackets.length, 1)
  assert.equal(result.createdPackets[0].rangeStart, 948)
  assert.equal(result.createdPackets[0].rangeEnd, 972)
})

test('an audit instance persists draft values and certifies one packet once', () => {
  const packetResult = appendClickAuditPackets(createRuntimeState(), 25, 1000)
  const instance = packetResult.createdAuditInstances[0]
  const drafted = updateMetricAuditInstanceField(
    packetResult.runtimeState,
    instance.id,
    'evidenceSufficiency',
    'Nelze potvrdit bez další evidence',
  )

  assert.equal(drafted.auditInstances[0].status, 'draft')
  assert.equal(
    drafted.auditInstances[0].values.evidenceSufficiency,
    'Nelze potvrdit bez další evidence',
  )

  const certified = certifyMetricAuditInstance(drafted, instance.id, 2000)

  assert.equal(certified.didCertify, true)
  assert.equal(certified.packet.status, 'certified')
  assert.equal(certified.auditInstance.status, 'submitted')
  assert.deepEqual(certified.runtimeState.submittedFormIds, ['audit-10-a'])
  assert.equal(getPendingMetricPackets(certified.runtimeState).length, 0)

  const repeated = certifyMetricAuditInstance(certified.runtimeState, instance.id, 3000)
  assert.equal(repeated.didCertify, false)
  assert.equal(repeated.runtimeState, certified.runtimeState)
})
