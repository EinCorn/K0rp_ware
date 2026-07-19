export const CLICK_AUDIT_PACKET_SIZE = 25
export const CLICK_AUDIT_TEMPLATE_ID = 'audit-10-a'
export const CLICK_AUDIT_METRIC_TYPE = 'clickaudit.click'
export const FIDGET_SESSIONS_PER_PACKET = 3
export const FIDGET_AUDIT_TEMPLATE_ID = 'audit-18-s'
export const FIDGET_METRIC_TYPE = 'fidget.sessionSettled'

const safeWholeCount = (value) => (
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
)

const isPositivePacketSize = (value) => (
  Number.isSafeInteger(value) && value > 0
)

const appendUnique = (ids, id) => (
  ids.includes(id) ? ids : [...ids, id]
)

const clickAuditPacketIdForRange = (rangeStart, rangeEnd) => (
  `clickaudit-clicks-${rangeStart}-${rangeEnd}`
)

const fidgetPacketIdForRange = (rangeStart, rangeEnd) => (
  `fidget-sessions-${rangeStart}-${rangeEnd}`
)

const auditInstanceIdForPacket = (templateId, packetId) => (
  `${templateId}:${packetId}`
)

const createMetricPacket = ({
  id,
  metricType,
  quantity,
  timestamp,
  auditTemplateId,
  rangeStart,
  rangeEnd,
}) => ({
  id,
  metricType,
  source: 'manual',
  quantity,
  status: 'pending',
  createdAt: timestamp,
  auditTemplateId,
  rangeStart,
  rangeEnd,
})

const createMetricAuditInstance = (packet, timestamp) => ({
  id: auditInstanceIdForPacket(packet.auditTemplateId, packet.id),
  templateId: packet.auditTemplateId,
  packetId: packet.id,
  status: 'available',
  values: {},
  createdAt: timestamp,
})

export const isMetricAuditTemplateId = (templateId) => (
  templateId === CLICK_AUDIT_TEMPLATE_ID
  || templateId === FIDGET_AUDIT_TEMPLATE_ID
)

export const createInitialMetricAuditState = (clickCount = 0, fidgetSessionCount = 0) => ({
  metricPackets: [],
  auditInstances: [],
  clickAuditBatchBaseline: safeWholeCount(clickCount),
  clickAuditBootstrapArmed: false,
  clickAuditBootstrapCompleted: false,
  fidgetSessionBatchBaseline: safeWholeCount(fidgetSessionCount),
})

export function armClickAuditBootstrap(runtimeState, totalClickCount) {
  if (
    runtimeState.clickAuditBootstrapArmed === true
    || runtimeState.clickAuditBootstrapCompleted === true
  ) return runtimeState

  return {
    ...runtimeState,
    clickAuditBatchBaseline: safeWholeCount(totalClickCount),
    clickAuditBootstrapArmed: true,
    clickAuditBootstrapCompleted: false,
  }
}

export function captureClickAuditBootstrapAfterSubmission(runtimeState, formId) {
  if (formId !== 'audit-00-a') return runtimeState

  return armClickAuditBootstrap(
    runtimeState,
    runtimeState.korpState?.stats?.eventsByType?.[CLICK_AUDIT_METRIC_TYPE] ?? 0,
  )
}

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
  let bootstrapCompleted = runtimeState.clickAuditBootstrapCompleted === true
  let bootstrapArmed = runtimeState.clickAuditBootstrapArmed === true && !bootstrapCompleted
  let cursor = Math.min(
    safeWholeCount(runtimeState.clickAuditBatchBaseline),
    safeTotalClickCount,
  )
  const createdPackets = []
  const createdAuditInstances = []
  const batchEvents = []

  const appendPacket = (rangeStart, rangeEnd, quantity) => {
    const packetId = clickAuditPacketIdForRange(rangeStart, rangeEnd)

    if (existingPacketIds.has(packetId)) return

    const packet = createMetricPacket({
      id: packetId,
      metricType: CLICK_AUDIT_METRIC_TYPE,
      quantity,
      timestamp,
      auditTemplateId: CLICK_AUDIT_TEMPLATE_ID,
      rangeStart,
      rangeEnd,
    })
    const auditInstance = createMetricAuditInstance(packet, timestamp)

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
      value: quantity,
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

  if (bootstrapArmed && safeTotalClickCount > cursor) {
    const bootstrapClick = cursor + 1

    appendPacket(bootstrapClick, bootstrapClick, 1)
    cursor = bootstrapClick
    bootstrapArmed = false
    bootstrapCompleted = true
  }

  if (bootstrapCompleted) {
    while (safeTotalClickCount - cursor >= CLICK_AUDIT_PACKET_SIZE) {
      const rangeStart = cursor + 1
      const rangeEnd = cursor + CLICK_AUDIT_PACKET_SIZE

      appendPacket(rangeStart, rangeEnd, CLICK_AUDIT_PACKET_SIZE)
      cursor = rangeEnd
    }
  }

  return {
    runtimeState: {
      ...runtimeState,
      metricPackets,
      auditInstances,
      clickAuditBatchBaseline: cursor,
      clickAuditBootstrapArmed: bootstrapArmed,
      clickAuditBootstrapCompleted: bootstrapCompleted,
    },
    createdPackets,
    createdAuditInstances,
    batchEvents,
  }
}

export function appendFidgetSessionPackets(
  runtimeState,
  totalSessionCount,
  timestamp = Date.now(),
  packetSize = FIDGET_SESSIONS_PER_PACKET,
) {
  if (!isPositivePacketSize(packetSize)) {
    return {
      runtimeState,
      createdPackets: [],
      createdAuditInstances: [],
    }
  }

  const safeTotalSessionCount = safeWholeCount(totalSessionCount)
  const metricPackets = [...(runtimeState.metricPackets ?? [])]
  const auditInstances = [...(runtimeState.auditInstances ?? [])]
  const existingPacketIds = new Set(metricPackets.map((packet) => packet.id))
  const existingAuditInstanceIds = new Set(auditInstances.map((instance) => instance.id))
  const createdPackets = []
  const createdAuditInstances = []
  let cursor = Math.min(
    safeWholeCount(runtimeState.fidgetSessionBatchBaseline),
    safeTotalSessionCount,
  )

  while (safeTotalSessionCount - cursor >= packetSize) {
    const rangeStart = cursor + 1
    const rangeEnd = cursor + packetSize
    const packetId = fidgetPacketIdForRange(rangeStart, rangeEnd)

    if (!existingPacketIds.has(packetId)) {
      const packet = createMetricPacket({
        id: packetId,
        metricType: FIDGET_METRIC_TYPE,
        quantity: packetSize,
        timestamp,
        auditTemplateId: FIDGET_AUDIT_TEMPLATE_ID,
        rangeStart,
        rangeEnd,
      })
      const auditInstance = createMetricAuditInstance(packet, timestamp)

      existingPacketIds.add(packetId)
      metricPackets.push(packet)
      createdPackets.push(packet)

      if (!existingAuditInstanceIds.has(auditInstance.id)) {
        existingAuditInstanceIds.add(auditInstance.id)
        auditInstances.push(auditInstance)
        createdAuditInstances.push(auditInstance)
      }
    }

    cursor = rangeEnd
  }

  return {
    runtimeState: {
      ...runtimeState,
      metricPackets,
      auditInstances,
      fidgetSessionBatchBaseline: cursor,
    },
    createdPackets,
    createdAuditInstances,
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
  if (
    !packet
    || packet.status !== 'pending'
    || packet.auditTemplateId !== auditInstance.templateId
    || auditInstance.id !== auditInstanceIdForPacket(auditInstance.templateId, packet.id)
  ) {
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
  const submittedFormIds = submittedAuditInstance.templateId === CLICK_AUDIT_TEMPLATE_ID
    ? appendUnique(runtimeState.submittedFormIds ?? [], submittedAuditInstance.templateId)
    : runtimeState.submittedFormIds ?? []

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
      submittedFormIds,
    },
  }
}

export function resolveMetricAuditCertification(
  runtimeState,
  instanceId,
  formId,
  timestamp = Date.now(),
) {
  const linkedInstance = (runtimeState.auditInstances ?? [])
    .find((instance) => instance.id === instanceId)

  if (!linkedInstance || linkedInstance.templateId !== formId) {
    return { didCertify: false, runtimeState, events: [] }
  }

  const certification = certifyMetricAuditInstance(runtimeState, instanceId, timestamp)

  if (!certification.didCertify) {
    return { ...certification, events: [] }
  }

  const eventMeta = {
    formId,
    auditInstanceId: certification.auditInstance.id,
    packetId: certification.packet.id,
    metricType: certification.packet.metricType,
  }

  return {
    ...certification,
    events: [
      {
        id: `k0rp-os-audit-form-submitted-${certification.auditInstance.id}-${timestamp}`,
        timestamp,
        sourceModule: 'system',
        type: 'audit.formSubmitted',
        tags: ['k0rp-os', 'audit-form', formId, 'metric-packet'],
        meta: eventMeta,
      },
      {
        id: `k0rp-os-evidence-certified-${certification.packet.id}-${timestamp}`,
        timestamp,
        sourceModule: 'system',
        type: 'audit.evidenceCertified',
        value: 1,
        tags: ['k0rp-os', 'evidence', 'metric-packet'],
        meta: {
          ...eventMeta,
          evidenceAmount: 1,
        },
      },
    ],
  }
}

export function getMetricAuditBacklog(runtimeState, {
  now = 0,
  discrepancyCount = 0,
} = {}) {
  const pendingPackets = getPendingMetricPackets(runtimeState)
  const safeNow = Number.isFinite(now) ? Math.max(0, now) : 0
  const safeDiscrepancyCount = safeWholeCount(discrepancyCount)
  const pendingByMetricType = pendingPackets.reduce((counts, packet) => ({
    ...counts,
    [packet.metricType]: (counts[packet.metricType] ?? 0) + 1,
  }), {})
  const oldestCreatedAt = pendingPackets.reduce((oldest, packet) => (
    Number.isFinite(packet.createdAt) && packet.createdAt >= 0
      ? Math.min(oldest, packet.createdAt)
      : oldest
  ), Number.POSITIVE_INFINITY)
  const oldestPendingAgeMs = Number.isFinite(oldestCreatedAt)
    ? Math.max(0, safeNow - oldestCreatedAt)
    : 0
  const oldestPendingAgeMinutes = oldestPendingAgeMs / 60_000
  const provisionalAuditPressure = Math.min(100, Math.max(0,
    pendingPackets.length * 10
    + Math.floor(oldestPendingAgeMinutes / 10)
    + safeDiscrepancyCount * 20,
  ))

  return {
    pendingCount: pendingPackets.length,
    oldestPendingAgeMs,
    pendingByMetricType,
    provisionalAuditPressure,
  }
}

export const getMetricPacketRangeLabel = (packet, sequence = 1) => {
  if (!packet) return `#${sequence}`
  if (packet.rangeStart === packet.rangeEnd) return String(packet.rangeStart)
  return `${packet.rangeStart}–${packet.rangeEnd}`
}

export function describeMetricAuditPacket(packet, form, sequence = 1) {
  const rangeLabel = getMetricPacketRangeLabel(packet, sequence)
  const code = form?.code ?? '?'

  if (packet?.metricType === FIDGET_METRIC_TYPE) {
    return {
      rangeLabel,
      title: `Audit ${code} / ${rangeLabel}`,
      detail: `${packet.quantity} relace / stabilizační rozsah ${rangeLabel}`,
    }
  }

  return {
    rangeLabel,
    title: `Audit ${code} / ${rangeLabel}`,
    detail: packet
      ? `${packet.quantity} kliků / rozsah ${rangeLabel}`
      : 'Dávka bez dostupného packetu',
  }
}
