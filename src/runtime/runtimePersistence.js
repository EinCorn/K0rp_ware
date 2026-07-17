export const RUNTIME_SAVE_KEY = 'k0rp-os.runtime'
export const RUNTIME_SAVE_SCHEMA_VERSION = 3

const CLICK_AUDIT_TEMPLATE_ID = 'audit-10-a'

const persistedRuntimeKeys = [
  'korpState',
  'lifetimeStats',
  'submittedFormIds',
  'ownedUpgradeIds',
  'unlockedMemoIds',
  'unlockedModuleIds',
  'metricPackets',
  'auditInstances',
  'clickAuditBatchBaseline',
  'clickAuditBootstrapArmed',
  'clickAuditBootstrapCompleted',
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

const getRuntimeEventCount = (runtime, eventType) => safeWholeCount(
  runtime.korpState?.stats?.eventsByType?.[eventType],
)

const getRuntimeClickCount = (runtime) => (
  getRuntimeEventCount(runtime, 'clickaudit.click')
)

const hasClickAuditUnlocked = (runtime) => (
  Array.isArray(runtime.unlockedModuleIds)
  && runtime.unlockedModuleIds.includes('click-audit')
)

const withoutRepeatableAuditSubmission = (submittedFormIds) => (
  Array.isArray(submittedFormIds)
    ? submittedFormIds.filter((formId) => formId !== CLICK_AUDIT_TEMPLATE_ID)
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

const sanitizeMetricPacket = (packet) => {
  if (!isPlainObject(packet)) return null
  if (typeof packet.id !== 'string' || packet.id.length === 0) return null
  if (typeof packet.metricType !== 'string' || packet.metricType.length === 0) return null
  if (!['manual', 'delegated', 'system-generated'].includes(packet.source)) return null
  if (!['pending', 'certified', 'rejected'].includes(packet.status)) return null
  if (!Number.isFinite(packet.quantity) || packet.quantity <= 0) return null
  if (!Number.isFinite(packet.createdAt)) return null
  if (typeof packet.auditTemplateId !== 'string' || packet.auditTemplateId.length === 0) return null

  return {
    ...packet,
    quantity: safeWholeCount(packet.quantity),
    rangeStart: safeWholeCount(packet.rangeStart),
    rangeEnd: safeWholeCount(packet.rangeEnd),
  }
}

const sanitizeAuditInstance = (instance) => {
  if (!isPlainObject(instance)) return null
  if (typeof instance.id !== 'string' || instance.id.length === 0) return null
  if (typeof instance.templateId !== 'string' || instance.templateId.length === 0) return null
  if (typeof instance.packetId !== 'string' || instance.packetId.length === 0) return null
  if (!['available', 'draft', 'submitted', 'closed'].includes(instance.status)) return null
  if (!Number.isFinite(instance.createdAt)) return null

  return {
    ...instance,
    values: isPlainObject(instance.values) ? instance.values : {},
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

const createRuntimeSnapshot = (runtime) => Object.fromEntries(
  persistedRuntimeKeys.map((key) => [key, runtime[key]]),
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
      runtime: migrateLegacyRuntime(candidate.runtime),
    }
  }

  if (candidate.schemaVersion === 2) {
    if (!isPlainObject(candidate.runtime) || !isPlainObject(candidate.runtime.korpState)) return null

    return {
      ...candidate,
      schemaVersion: RUNTIME_SAVE_SCHEMA_VERSION,
      progressionDataVersion,
      runtime: migrateDraftV2Runtime(candidate.runtime),
    }
  }

  return candidate
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
    clickAuditBatchBaseline,
    clickAuditBootstrapArmed,
    clickAuditBootstrapCompleted,
  } = migrated.runtime

  if (!isPlainObject(korpState) || korpState.version !== coreStateVersion) return fallback()
  if (!isPlainObject(korpState.stats) || !isPlainObject(korpState.resources) || !isPlainObject(lifetimeStats)) return fallback()

  const bootstrapCompleted = clickAuditBootstrapCompleted === true

  return {
    korpState,
    lifetimeStats,
    submittedFormIds: uniqueStringIds(submittedFormIds),
    ownedUpgradeIds: uniqueStringIds(ownedUpgradeIds),
    unlockedMemoIds: uniqueStringIds(unlockedMemoIds),
    unlockedModuleIds: uniqueStringIds(unlockedModuleIds),
    metricPackets: sanitizeUniqueObjects(metricPackets, sanitizeMetricPacket),
    auditInstances: sanitizeUniqueObjects(auditInstances, sanitizeAuditInstance),
    clickAuditBatchBaseline: safeWholeCount(clickAuditBatchBaseline),
    clickAuditBootstrapArmed: clickAuditBootstrapArmed === true && !bootstrapCompleted,
    clickAuditBootstrapCompleted: bootstrapCompleted,
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
