import {
  CLICK_AUDIT_METRIC_TYPE,
  CLICK_AUDIT_TEMPLATE_ID,
  FIDGET_AUDIT_TEMPLATE_ID,
  FIDGET_METRIC_TYPE,
  FIDGET_SESSIONS_PER_PACKET,
} from './metricAuditFlow.js'

export const RUNTIME_SAVE_KEY = 'k0rp-os.runtime'
export const RUNTIME_SAVE_SCHEMA_VERSION = 5

const FIDGET_MODULE_ID = 'fidget'
const FIDGET_LEGACY_PERMIT_ID = 'fidget.access-permit'
const FIDGET_SOURCE_FORM_ID = 'audit-16-c'

const persistedRuntimeKeys = [
  'korpState',
  'lifetimeStats',
  'submittedFormIds',
  'ownedUpgradeIds',
  'unlockedMemoIds',
  'unlockedModuleIds',
  'metricPackets',
  'auditInstances',
  'moduleAuthorizations',
  'clickAuditBatchBaseline',
  'clickAuditBootstrapArmed',
  'clickAuditBootstrapCompleted',
  'fidgetSessionBatchBaseline',
]

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
)

const uniqueStringIds = (value) => {
  if (!Array.isArray(value)) return []

  return [...new Set(value.filter((id) => typeof id === 'string' && id.length > 0))]
}

const safeWholeCount = (value) => (
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
)

const isSafeWholeCount = (value) => (
  Number.isSafeInteger(value) && value >= 0
)

const isSafePositiveCount = (value) => (
  Number.isSafeInteger(value) && value > 0
)

const isSafeTimestamp = (value) => (
  Number.isSafeInteger(value) && value >= 0
)

const getRuntimeEventCount = (runtime, eventType) => safeWholeCount(
  runtime.korpState?.stats?.eventsByType?.[eventType],
)

const getRuntimeClickCount = (runtime) => (
  getRuntimeEventCount(runtime, 'clickaudit.click')
)

const getRuntimeFidgetSessionCount = (runtime) => (
  getRuntimeEventCount(runtime, FIDGET_METRIC_TYPE)
)

const hasClickAuditUnlocked = (runtime) => (
  Array.isArray(runtime.unlockedModuleIds)
  && runtime.unlockedModuleIds.includes('click-audit')
)

const withoutRepeatableAuditSubmission = (submittedFormIds) => (
  Array.isArray(submittedFormIds)
    ? submittedFormIds.filter((formId) => (
      formId !== CLICK_AUDIT_TEMPLATE_ID
      && formId !== FIDGET_AUDIT_TEMPLATE_ID
    ))
    : submittedFormIds
)

const withMetricBatchCount = (stats, nextBatchCount) => {
  if (!isPlainObject(stats)) return stats

  const eventsByType = isPlainObject(stats.eventsByType) ? { ...stats.eventsByType } : {}
  const eventsByModule = isPlainObject(stats.eventsByModule) ? { ...stats.eventsByModule } : {}
  const currentBatchCount = safeWholeCount(eventsByType['clickaudit.batchCompleted'])
  const retainedBatchCount = Math.min(safeWholeCount(nextBatchCount), currentBatchCount)
  const removedBatchCount = currentBatchCount - retainedBatchCount

  if (retainedBatchCount > 0) {
    eventsByType['clickaudit.batchCompleted'] = retainedBatchCount
  } else {
    delete eventsByType['clickaudit.batchCompleted']
  }

  const clickAuditModuleCount = Math.max(
    0,
    safeWholeCount(eventsByModule['click-audit']) - removedBatchCount,
  )
  if (clickAuditModuleCount > 0) {
    eventsByModule['click-audit'] = clickAuditModuleCount
  } else {
    delete eventsByModule['click-audit']
  }

  return {
    ...stats,
    totalEvents: Math.max(0, safeWholeCount(stats.totalEvents) - removedBatchCount),
    eventsByType,
    eventsByModule,
  }
}

const migrateLegacyRuntime = (runtime) => {
  const clickCount = getRuntimeClickCount(runtime)
  const resources = isPlainObject(runtime.korpState.resources)
    ? runtime.korpState.resources
    : {}
  const bootstrapArmed = hasClickAuditUnlocked(runtime)

  return {
    ...runtime,
    korpState: {
      ...runtime.korpState,
      stats: withMetricBatchCount(runtime.korpState.stats, 0),
      resources: {
        ...resources,
        notionalWorkUnits: 0,
      },
    },
    lifetimeStats: withMetricBatchCount(runtime.lifetimeStats, 0),
    submittedFormIds: withoutRepeatableAuditSubmission(runtime.submittedFormIds),
    metricPackets: [],
    auditInstances: [],
    clickAuditBatchBaseline: clickCount,
    clickAuditBootstrapArmed: bootstrapArmed,
    clickAuditBootstrapCompleted: false,
  }
}

const migrateDraftV2Runtime = (runtime) => {
  const clickCount = getRuntimeClickCount(runtime)
  const certifiedEvidenceCount = getRuntimeEventCount(runtime, 'audit.evidenceCertified')
  const hasCertifiedEvidence = certifiedEvidenceCount > 0
  const certifiedPackets = hasCertifiedEvidence && Array.isArray(runtime.metricPackets)
    ? runtime.metricPackets
      .filter((packet) => isPlainObject(packet) && packet.status === 'certified')
      .slice(0, certifiedEvidenceCount)
    : []
  const certifiedPacketIds = new Set(certifiedPackets.map((packet) => packet.id))
  const submittedAuditInstances = Array.isArray(runtime.auditInstances)
    ? runtime.auditInstances.filter((instance) => (
      isPlainObject(instance)
      && certifiedPacketIds.has(instance.packetId)
      && (instance.status === 'submitted' || instance.status === 'closed')
    ))
    : []
  const retainedBatchCount = certifiedPackets.length

  return {
    ...runtime,
    korpState: {
      ...runtime.korpState,
      stats: withMetricBatchCount(runtime.korpState.stats, retainedBatchCount),
    },
    lifetimeStats: withMetricBatchCount(runtime.lifetimeStats, retainedBatchCount),
    submittedFormIds: hasCertifiedEvidence
      ? runtime.submittedFormIds
      : withoutRepeatableAuditSubmission(runtime.submittedFormIds),
    metricPackets: certifiedPackets,
    auditInstances: submittedAuditInstances,
    clickAuditBatchBaseline: clickCount,
    clickAuditBootstrapArmed: hasClickAuditUnlocked(runtime) && !hasCertifiedEvidence,
    clickAuditBootstrapCompleted: hasCertifiedEvidence,
  }
}

const migrateFidgetMetricState = (runtime) => ({
  ...runtime,
  fidgetSessionBatchBaseline: getRuntimeFidgetSessionCount(runtime),
})

const metricPacketContracts = {
  [CLICK_AUDIT_METRIC_TYPE]: {
    auditTemplateId: CLICK_AUDIT_TEMPLATE_ID,
    packetIdForRange: (rangeStart, rangeEnd) => (
      `clickaudit-clicks-${rangeStart}-${rangeEnd}`
    ),
  },
  [FIDGET_METRIC_TYPE]: {
    auditTemplateId: FIDGET_AUDIT_TEMPLATE_ID,
    packetIdForRange: (rangeStart, rangeEnd) => (
      `fidget-sessions-${rangeStart}-${rangeEnd}`
    ),
  },
}

const sanitizeMetricPacket = (packet) => {
  if (!isPlainObject(packet)) return null
  const contract = metricPacketContracts[packet.metricType]
  if (!contract) return null
  if (packet.source !== 'manual') return null
  if (!['pending', 'certified', 'rejected'].includes(packet.status)) return null
  if (!isSafePositiveCount(packet.quantity)) return null
  if (!isSafePositiveCount(packet.rangeStart)) return null
  if (!isSafePositiveCount(packet.rangeEnd)) return null
  if (packet.rangeStart > packet.rangeEnd) return null
  if (packet.quantity !== packet.rangeEnd - packet.rangeStart + 1) return null
  if (!isSafeTimestamp(packet.createdAt)) return null
  if (packet.auditTemplateId !== contract.auditTemplateId) return null
  if (packet.id !== contract.packetIdForRange(packet.rangeStart, packet.rangeEnd)) return null
  if (packet.certifiedAt !== undefined && !isSafeTimestamp(packet.certifiedAt)) return null

  return {
    id: packet.id,
    metricType: packet.metricType,
    source: packet.source,
    quantity: packet.quantity,
    status: packet.status,
    createdAt: packet.createdAt,
    ...(packet.certifiedAt === undefined ? {} : { certifiedAt: packet.certifiedAt }),
    auditTemplateId: packet.auditTemplateId,
    rangeStart: packet.rangeStart,
    rangeEnd: packet.rangeEnd,
  }
}

const sanitizeHydratableMetricPackets = (metricPackets, settledSessionCount) => {
  let nextFidgetRangeStart = null

  return metricPackets.filter((packet) => {
    if (packet.metricType !== FIDGET_METRIC_TYPE) return true
    if (
      packet.quantity !== FIDGET_SESSIONS_PER_PACKET
      || packet.rangeEnd - packet.rangeStart + 1 !== FIDGET_SESSIONS_PER_PACKET
      || packet.rangeEnd > settledSessionCount
    ) return false
    if (
      nextFidgetRangeStart !== null
      && packet.rangeStart !== nextFidgetRangeStart
    ) return false

    nextFidgetRangeStart = packet.rangeEnd + 1
    return true
  })
}

const sanitizeAuditInstance = (instance) => {
  if (!isPlainObject(instance)) return null
  if (typeof instance.id !== 'string' || instance.id.length === 0) return null
  if (typeof instance.templateId !== 'string' || instance.templateId.length === 0) return null
  if (typeof instance.packetId !== 'string' || instance.packetId.length === 0) return null
  if (!['available', 'draft', 'submitted', 'closed'].includes(instance.status)) return null
  if (!isSafeTimestamp(instance.createdAt)) return null
  if (instance.submittedAt !== undefined && !isSafeTimestamp(instance.submittedAt)) return null

  return {
    id: instance.id,
    templateId: instance.templateId,
    packetId: instance.packetId,
    status: instance.status,
    values: isPlainObject(instance.values) ? instance.values : {},
    createdAt: instance.createdAt,
    ...(instance.submittedAt === undefined ? {} : { submittedAt: instance.submittedAt }),
  }
}

const sanitizeModuleAuthorization = (authorization) => {
  if (!isPlainObject(authorization)) return null
  if (typeof authorization.id !== 'string' || authorization.id.length === 0) return null
  if (typeof authorization.moduleId !== 'string' || authorization.moduleId.length === 0) return null
  if (typeof authorization.sourceFormId !== 'string' || authorization.sourceFormId.length === 0) return null
  if (!Number.isSafeInteger(authorization.evidenceCost) || authorization.evidenceCost < 0) return null
  if (!Number.isFinite(authorization.grantedAt) || authorization.grantedAt < 0) return null

  return {
    id: authorization.id,
    moduleId: authorization.moduleId,
    sourceFormId: authorization.sourceFormId,
    evidenceCost: authorization.evidenceCost,
    grantedAt: authorization.grantedAt,
  }
}

const sanitizeUniqueObjects = (value, sanitizer) => {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  return value.reduce((items, candidate) => {
    const sanitized = sanitizer(candidate)
    if (!sanitized || seen.has(sanitized.id)) return items

    seen.add(sanitized.id)
    items.push(sanitized)
    return items
  }, [])
}

const sanitizeModuleAuthorizations = (value) => {
  if (!Array.isArray(value)) return []

  const seenIds = new Set()
  const seenModuleIds = new Set()

  return value.reduce((authorizations, candidate) => {
    const authorization = sanitizeModuleAuthorization(candidate)
    if (
      !authorization
      || seenIds.has(authorization.id)
      || seenModuleIds.has(authorization.moduleId)
    ) {
      return authorizations
    }

    seenIds.add(authorization.id)
    seenModuleIds.add(authorization.moduleId)
    authorizations.push(authorization)
    return authorizations
  }, [])
}

const hasLegacyFidgetAuthorization = (runtime) => (
  (
    Array.isArray(runtime.unlockedModuleIds)
    && runtime.unlockedModuleIds.includes(FIDGET_MODULE_ID)
  )
  || (
    Array.isArray(runtime.ownedUpgradeIds)
    && runtime.ownedUpgradeIds.includes(FIDGET_LEGACY_PERMIT_ID)
  )
)

const getLegacyAuthorizationTimestamp = (savedAt) => {
  const timestamp = Date.parse(savedAt)
  return Number.isFinite(timestamp) && timestamp >= 0 ? timestamp : 0
}

const migrateModuleAuthorizationState = (runtime, savedAt) => {
  const moduleAuthorizations = sanitizeModuleAuthorizations(runtime.moduleAuthorizations)

  if (
    hasLegacyFidgetAuthorization(runtime)
    && !moduleAuthorizations.some(({ moduleId }) => moduleId === FIDGET_MODULE_ID)
  ) {
    moduleAuthorizations.push({
      id: FIDGET_MODULE_ID,
      moduleId: FIDGET_MODULE_ID,
      sourceFormId: FIDGET_SOURCE_FORM_ID,
      evidenceCost: 0,
      grantedAt: getLegacyAuthorizationTimestamp(savedAt),
    })
  }

  return {
    ...runtime,
    moduleAuthorizations,
  }
}

const createRuntimeSnapshot = (runtime) => Object.fromEntries(
  persistedRuntimeKeys.map((key) => [
    key,
    key === 'moduleAuthorizations' && !Array.isArray(runtime[key]) ? [] : runtime[key],
  ]),
)

export function createRuntimeSave(runtime, progressionDataVersion, now = Date.now()) {
  return {
    schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
    progressionDataVersion,
    savedAt: new Date(now).toISOString(),
    runtime: createRuntimeSnapshot(runtime),
  }
}

export function migrateRuntimeSave(candidate, { progressionDataVersion } = {}) {
  if (!isPlainObject(candidate) || !Number.isInteger(candidate.schemaVersion)) return null
  if (candidate.schemaVersion > RUNTIME_SAVE_SCHEMA_VERSION) return null

  if (candidate.schemaVersion === 1) {
    if (!isPlainObject(candidate.runtime) || !isPlainObject(candidate.runtime.korpState)) return null

    return {
      ...candidate,
      schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
      progressionDataVersion,
      runtime: migrateFidgetMetricState(
        migrateModuleAuthorizationState(
          migrateLegacyRuntime(candidate.runtime),
          candidate.savedAt,
        ),
      ),
    }
  }

  if (candidate.schemaVersion === 2) {
    if (!isPlainObject(candidate.runtime) || !isPlainObject(candidate.runtime.korpState)) return null

    return {
      ...candidate,
      schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
      progressionDataVersion,
      runtime: migrateFidgetMetricState(
        migrateModuleAuthorizationState(
          migrateDraftV2Runtime(candidate.runtime),
          candidate.savedAt,
        ),
      ),
    }
  }

  if (candidate.schemaVersion === 3) {
    if (!isPlainObject(candidate.runtime) || !isPlainObject(candidate.runtime.korpState)) return null

    return {
      ...candidate,
      schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
      progressionDataVersion,
      runtime: migrateFidgetMetricState(
        migrateModuleAuthorizationState(candidate.runtime, candidate.savedAt),
      ),
    }
  }

  if (candidate.schemaVersion === 4) {
    if (!isPlainObject(candidate.runtime) || !isPlainObject(candidate.runtime.korpState)) return null

    return {
      ...candidate,
      schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
      progressionDataVersion,
      runtime: migrateFidgetMetricState(candidate.runtime),
    }
  }

  return candidate
}

const sanitizeLinkedAuditInstances = (auditInstances, metricPackets) => {
  const packetById = new Map(metricPackets.map((packet) => [packet.id, packet]))
  const linkedAuditInstances = sanitizeUniqueObjects(auditInstances, sanitizeAuditInstance)
    .filter((instance) => {
      const packet = packetById.get(instance.packetId)
      if (!packet || packet.auditTemplateId !== instance.templateId) return false
      if (instance.id !== `${instance.templateId}:${packet.id}`) return false

      if (packet.status === 'pending') {
        return instance.status === 'available' || instance.status === 'draft'
      }

      return instance.status === 'submitted' || instance.status === 'closed'
    })
  const linkedPacketIds = new Set(linkedAuditInstances.map((instance) => instance.packetId))

  for (const packet of metricPackets) {
    if (
      packet.metricType !== FIDGET_METRIC_TYPE
      || packet.status !== 'pending'
      || linkedPacketIds.has(packet.id)
    ) continue

    linkedAuditInstances.push({
      id: `${FIDGET_AUDIT_TEMPLATE_ID}:${packet.id}`,
      templateId: FIDGET_AUDIT_TEMPLATE_ID,
      packetId: packet.id,
      status: 'available',
      values: {},
      createdAt: packet.createdAt,
    })
    linkedPacketIds.add(packet.id)
  }

  return linkedAuditInstances
}

const sanitizeFidgetSessionBaseline = (value, settledSessionCount, metricPackets) => {
  if (!isSafeWholeCount(value)) return settledSessionCount

  const packetCursor = metricPackets.reduce((cursor, packet) => (
    packet.metricType === FIDGET_METRIC_TYPE
      ? Math.max(cursor, packet.rangeEnd)
      : cursor
  ), 0)
  const candidate = Math.min(
    settledSessionCount,
    Math.max(value, packetCursor),
  )

  return settledSessionCount - candidate >= FIDGET_SESSIONS_PER_PACKET
    ? settledSessionCount
    : candidate
}

export function hydrateRuntimeSave(candidate, {
  progressionDataVersion,
  coreStateVersion,
  createFallback,
}) {
  const fallback = () => createFallback()
  const migrated = migrateRuntimeSave(candidate, { progressionDataVersion })

  if (!migrated) return fallback()
  if (migrated.progressionDataVersion !== progressionDataVersion) return fallback()
  if (!isPlainObject(migrated.runtime)) return fallback()

  const {
    korpState,
    lifetimeStats,
    submittedFormIds,
    ownedUpgradeIds,
    unlockedMemoIds,
    unlockedModuleIds,
    metricPackets,
    auditInstances,
    moduleAuthorizations,
    clickAuditBatchBaseline,
    clickAuditBootstrapArmed,
    clickAuditBootstrapCompleted,
    fidgetSessionBatchBaseline,
  } = migrated.runtime

  if (!isPlainObject(korpState) || korpState.version !== coreStateVersion) return fallback()
  if (!isPlainObject(korpState.stats) || !isPlainObject(korpState.resources) || !isPlainObject(lifetimeStats)) return fallback()

  const bootstrapCompleted = clickAuditBootstrapCompleted === true
  const settledSessionCount = getRuntimeFidgetSessionCount(migrated.runtime)
  const sanitizedMetricPackets = sanitizeHydratableMetricPackets(
    sanitizeUniqueObjects(metricPackets, sanitizeMetricPacket),
    settledSessionCount,
  )
  const sanitizedAuditInstances = sanitizeLinkedAuditInstances(
    auditInstances,
    sanitizedMetricPackets,
  )

  return {
    korpState,
    lifetimeStats,
    submittedFormIds: uniqueStringIds(submittedFormIds)
      .filter((formId) => formId !== FIDGET_AUDIT_TEMPLATE_ID),
    ownedUpgradeIds: uniqueStringIds(ownedUpgradeIds),
    unlockedMemoIds: uniqueStringIds(unlockedMemoIds),
    unlockedModuleIds: uniqueStringIds(unlockedModuleIds),
    metricPackets: sanitizedMetricPackets,
    auditInstances: sanitizedAuditInstances,
    moduleAuthorizations: sanitizeModuleAuthorizations(moduleAuthorizations),
    clickAuditBatchBaseline: safeWholeCount(clickAuditBatchBaseline),
    clickAuditBootstrapArmed: clickAuditBootstrapArmed === true && !bootstrapCompleted,
    clickAuditBootstrapCompleted: bootstrapCompleted,
    fidgetSessionBatchBaseline: sanitizeFidgetSessionBaseline(
      fidgetSessionBatchBaseline,
      settledSessionCount,
      sanitizedMetricPackets,
    ),
  }
}

export function loadRuntimeFromStorage(storage, options) {
  if (!storage || typeof storage.getItem !== 'function') return options.createFallback()

  try {
    const serialized = storage.getItem(RUNTIME_SAVE_KEY)
    if (!serialized) return options.createFallback()
    return hydrateRuntimeSave(JSON.parse(serialized), options)
  } catch {
    return options.createFallback()
  }
}

export function saveRuntimeToStorage(storage, runtime, progressionDataVersion, now = Date.now()) {
  if (!storage || typeof storage.setItem !== 'function') return false

  try {
    storage.setItem(
      RUNTIME_SAVE_KEY,
      JSON.stringify(createRuntimeSave(runtime, progressionDataVersion, now)),
    )
    return true
  } catch {
    return false
  }
}

export function clearRuntimeStorage(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return false

  try {
    storage.removeItem(RUNTIME_SAVE_KEY)
    return true
  } catch {
    return false
  }
}
