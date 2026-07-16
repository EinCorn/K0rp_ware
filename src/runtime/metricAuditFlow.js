export const CLICK_AUDIT_PACKET_SIZE = 25
export const CLICK_AUDIT_TEMPLATE_ID = 'audit-10-a'

const safeWholeCount = (value) => (
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
)

const appendUnique = (ids, id) => (
  ids.includes(id) ? ids : [...ids, id]
)

const packetIdForRange = (rangeStart, rangeEnd) => (
  `clickaudit-clicks-${rangeStart}-${rangeEnd}`
)

const auditInstanceIdForPacket = (packetId) => (
  `${CLICK_AUDIT_TEMPLATE_ID}:${packetId}`
)

export const createInitialMetricAuditState = (clickCount = 0) => ({
  metricPackets: [],
  auditInstances: [],
  clickAuditBatchBaseline: safeWholeCount(clickCount),
})

export const getPendingMetricPackets = (runtimeState) => (
  (runtimeState.metricPackets ?? []).filter((packet) => packet.status === 'pending')
)

export const getPendingAuditInstances = (runtimeState, templateId = null) => {
  const pendingPacketIds = new Set(getPendingMetricPackets(runtimeState).map((packet) => packet.id))

  return (runtimeState.auditInstances ?? []).filter((instance) => (
    pendingPacketIds.has(instance.packetId)
    && (instance.status === 'available' || instance.status === 'draft')
    && (templateId === null || instance.templateId === templateId)
  ))
}

export const getLatestAuditInstance = (runtimeState, templateId) => {
  const instances = (runtimeState.auditInstances ?? [])
    .filter((instance) => instance.templateId === templateId)

  return instances.length > 0 ? instances[instances.length - 1] : null
}

export function appendClickAuditPackets(runtimeState, totalClickCount, timestamp = Date.now()) {
  const safeTotalClickCount = safeWholeCount(totalClickCount)
  const metricPackets = [...(runtimeState.metricPackets ?? [])]
  const auditInstances = [...(runtimeState.auditInstances ?? [])]
  const existingPacketIds = new Set(metricPackets.map((packet) => packet.id))
  let cursor = Math.min(
    safeWholeCount(runtimeState.clickAuditBatchBaseline),
    safeTotalClickCount,
  )
  const createdPackets = []
  const createdAuditInstances = []
  const batchEvents = []

  while (safeTotalClickCount - cursor >= CLICK_AUDIT_PACKET_SIZE) {
    const rangeStart = cursor + 1
    const rangeEnd = cursor + CLICK_AUDIT_PACKET_SIZE
    const packetId = packetIdForRange(rangeStart, rangeEnd)

    cursor = rangeEnd
    if (existingPacketIds.has(packetId)) continue

    const packet = {
      id: packetId,
      metricType: 'clickaudit.click',
      source: 'manual',
      quantity: CLICK_AUDIT_PACKET_SIZE,
      status: 'pending',
      createdAt: timestamp,
      auditTemplateId: CLICK_AUDIT_TEMPLATE_ID,
      rangeStart,
      rangeEnd,
    }
    const auditInstance = {
      id: auditInstanceIdForPacket(packetId),
      templateId: CLICK_AUDIT_TEMPLATE_ID,
      packetId,
      status: 'available',
      values: {},
      createdAt: timestamp,
    }

    existingPacketIds.add(packetId)
    metricPackets.push(packet)
    auditInstances.push(auditInstance)
    createdPackets.push(packet)
    createdAuditInstances.push(auditInstance)
    batchEvents.push({
      id: `k0rp-os-clickaudit-batch-${packetId}`,
      timestamp,
      sourceModule: 'click-audit',
      type: 'clickaudit.batchCompleted',
      value: CLICK_AUDIT_PACKET_SIZE,
      tags: ['k0rp-os', 'metric-packet', 'clickaudit'],
      meta: {
        packetId,
        metricType: packet.metricType,
        source: packet.source,
        quantity: packet.quantity,
        rangeStart,
        rangeEnd,
      },
    })
  }

  return {
    runtimeState: {
      ...runtimeState,
      metricPackets,
      auditInstances,
      clickAuditBatchBaseline: cursor,
    },
    createdPackets,
    createdAuditInstances,
    batchEvents,
  }
}

export function updateMetricAuditInstanceField(runtimeState, instanceId, fieldId, value) {
  if (typeof instanceId !== 'string' || typeof fieldId !== 'string') return runtimeState

  let didUpdate = false
  const auditInstances = (runtimeState.auditInstances ?? []).map((instance) => {
    if (
      instance.id !== instanceId
      || (instance.status !== 'available' && instance.status !== 'draft')
    ) return instance

    didUpdate = true
    return {
      ...instance,
      status: 'draft',
      values: {
        ...(instance.values ?? {}),
        [fieldId]: value,
      },
    }
  })

  return didUpdate ? { ...runtimeState, auditInstances } : runtimeState
}

export function certifyMetricAuditInstance(runtimeState, instanceId, timestamp = Date.now()) {
  const auditInstances = runtimeState.auditInstances ?? []
  const metricPackets = runtimeState.metricPackets ?? []
  const auditInstance = auditInstances.find((instance) => instance.id === instanceId)

  if (
    !auditInstance
    || (auditInstance.status !== 'available' && auditInstance.status !== 'draft')
  ) {
    return { didCertify: false, runtimeState }
  }

  const packet = metricPackets.find((candidate) => candidate.id === auditInstance.packetId)
  if (!packet || packet.status !== 'pending') {
    return { didCertify: false, runtimeState }
  }

  const certifiedPacket = {
    ...packet,
    status: 'certified',
    certifiedAt: timestamp,
  }
  const submittedAuditInstance = {
    ...auditInstance,
    status: 'submitted',
    submittedAt: timestamp,
  }

  return {
    didCertify: true,
    packet: certifiedPacket,
    auditInstance: submittedAuditInstance,
    runtimeState: {
      ...runtimeState,
      metricPackets: metricPackets.map((candidate) => (
        candidate.id === certifiedPacket.id ? certifiedPacket : candidate
      )),
      auditInstances: auditInstances.map((candidate) => (
        candidate.id === submittedAuditInstance.id ? submittedAuditInstance : candidate
      )),
      submittedFormIds: appendUnique(
        runtimeState.submittedFormIds ?? [],
        submittedAuditInstance.templateId,
      ),
    },
  }
}
