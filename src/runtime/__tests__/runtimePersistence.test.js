import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RUNTIME_SAVE_KEY,
  RUNTIME_SAVE_SCHEMA_VERSION,
  clearRuntimeStorage,
  createRuntimeSave,
  hydrateRuntimeSave,
  loadRuntimeFromStorage,
  saveRuntimeToStorage,
} from '../runtimePersistence.js'

const progressionDataVersion = '0.1.0-draft'
const coreStateVersion = '0.1.0'

const createFreshRuntime = () => ({
  korpState: {
    version: coreStateVersion,
    stats: { totalEvents: 0, eventsByType: {}, eventsByModule: {} },
    resources: { notionalWorkUnits: 0 },
  },
  lifetimeStats: { totalEvents: 0, eventsByType: {}, eventsByModule: {} },
  submittedFormIds: [],
  ownedUpgradeIds: [],
  unlockedMemoIds: [],
})

const createProgressedRuntime = () => ({
  korpState: {
    version: coreStateVersion,
    stats: {
      totalEvents: 27,
      eventsByType: { 'clickaudit.click': 25, 'audit.formSubmitted': 2 },
      eventsByModule: { 'click-audit': 25, system: 2 },
    },
    resources: { notionalWorkUnits: 4.1 },
  },
  lifetimeStats: {
    totalEvents: 27,
    eventsByType: { 'clickaudit.click': 25, 'audit.formSubmitted': 2 },
    eventsByModule: { 'click-audit': 25, system: 2 },
  },
  submittedFormIds: ['audit-00-a', 'audit-10-a'],
  ownedUpgradeIds: ['sys.audit-batch-standardization'],
  unlockedMemoIds: ['memo.audit-00-a-complete', 'memo.audit-trace-available'],
})

function createMemoryStorage() {
  const values = new Map()

  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

const loadOptions = () => ({
  progressionDataVersion,
  coreStateVersion,
  createFallback: createFreshRuntime,
})

test('runtime save round-trips through local storage', () => {
  const storage = createMemoryStorage()
  const runtime = createProgressedRuntime()

  assert.equal(saveRuntimeToStorage(storage, runtime, progressionDataVersion, 1783792800000), true)
  assert.deepEqual(loadRuntimeFromStorage(storage, loadOptions()), runtime)
})

test('save envelope records schema and progression versions without definitions', () => {
  const save = createRuntimeSave(createProgressedRuntime(), progressionDataVersion, 1783792800000)

  assert.equal(save.schemaVersion, RUNTIME_SAVE_SCHEMA_VERSION)
  assert.equal(save.progressionDataVersion, progressionDataVersion)
  assert.equal(save.savedAt, '2026-07-11T18:00:00.000Z')
  assert.deepEqual(Object.keys(save.runtime).sort(), [
    'korpState',
    'lifetimeStats',
    'ownedUpgradeIds',
    'submittedFormIds',
    'unlockedMemoIds',
  ])
  assert.equal('auditForms' in save.runtime, false)
  assert.equal('windows' in save.runtime, false)
})

test('corrupt JSON falls back to a fresh runtime', () => {
  const storage = createMemoryStorage()
  storage.setItem(RUNTIME_SAVE_KEY, '{not-json')

  assert.deepEqual(loadRuntimeFromStorage(storage, loadOptions()), createFreshRuntime())
})

test('future save schemas and mismatched progression data fail safely', () => {
  const runtime = createProgressedRuntime()
  const futureSave = createRuntimeSave(runtime, progressionDataVersion)
  futureSave.schemaVersion = RUNTIME_SAVE_SCHEMA_VERSION + 1

  assert.deepEqual(hydrateRuntimeSave(futureSave, loadOptions()), createFreshRuntime())

  const staleProgressionSave = createRuntimeSave(runtime, '0.0.0-old')
  assert.deepEqual(hydrateRuntimeSave(staleProgressionSave, loadOptions()), createFreshRuntime())
})

test('loaded progression ids are sanitized and kept unique', () => {
  const save = createRuntimeSave(createProgressedRuntime(), progressionDataVersion)
  save.runtime.submittedFormIds = ['audit-00-a', 'audit-00-a', null]
  save.runtime.ownedUpgradeIds = ['sys.audit-batch-standardization', 42]
  save.runtime.unlockedMemoIds = ['memo.audit-trace-available', 'memo.audit-trace-available']

  const runtime = hydrateRuntimeSave(save, loadOptions())

  assert.deepEqual(runtime.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(runtime.ownedUpgradeIds, ['sys.audit-batch-standardization'])
  assert.deepEqual(runtime.unlockedMemoIds, ['memo.audit-trace-available'])
})

test('clear removes the persisted runtime save', () => {
  const storage = createMemoryStorage()
  saveRuntimeToStorage(storage, createProgressedRuntime(), progressionDataVersion)

  assert.notEqual(storage.getItem(RUNTIME_SAVE_KEY), null)
  assert.equal(clearRuntimeStorage(storage), true)
  assert.equal(storage.getItem(RUNTIME_SAVE_KEY), null)
})

test('storage failures never throw into the runtime', () => {
  const brokenStorage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
    removeItem: () => { throw new Error('blocked') },
  }

  assert.deepEqual(loadRuntimeFromStorage(brokenStorage, loadOptions()), createFreshRuntime())
  assert.equal(saveRuntimeToStorage(brokenStorage, createProgressedRuntime(), progressionDataVersion), false)
  assert.equal(clearRuntimeStorage(brokenStorage), false)
})
