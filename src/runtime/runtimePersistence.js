export const RUNTIME_SAVE_KEY = 'k0rp-os.runtime'
export const RUNTIME_SAVE_SCHEMA_VERSION = 1

const persistedRuntimeKeys = [
  'korpState',
  'lifetimeStats',
  'submittedFormIds',
  'ownedUpgradeIds',
  'unlockedMemoIds',
  'unlockedModuleIds',
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

export function migrateRuntimeSave(candidate) {
  if (!isPlainObject(candidate) || !Number.isInteger(candidate.schemaVersion)) return null
  if (candidate.schemaVersion > RUNTIME_SAVE_SCHEMA_VERSION) return null

  let migrated = candidate

  while (migrated.schemaVersion < RUNTIME_SAVE_SCHEMA_VERSION) {
    // Future schema migrations are applied here one version at a time.
    // No pre-v1 production save exists, so older unknown versions fail safely.
    return null
  }

  return migrated
}

export function hydrateRuntimeSave(candidate, {
  progressionDataVersion,
  coreStateVersion,
  createFallback,
}) {
  const fallback = () => createFallback()
  const migrated = migrateRuntimeSave(candidate)

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
  } = migrated.runtime

  if (!isPlainObject(korpState) || korpState.version !== coreStateVersion) return fallback()
  if (!isPlainObject(korpState.stats) || !isPlainObject(lifetimeStats)) return fallback()

  return {
    korpState,
    lifetimeStats,
    submittedFormIds: uniqueStringIds(submittedFormIds),
    ownedUpgradeIds: uniqueStringIds(ownedUpgradeIds),
    unlockedMemoIds: uniqueStringIds(unlockedMemoIds),
    unlockedModuleIds: uniqueStringIds(unlockedModuleIds),
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
