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

const progressionDataVersion = '0.2.0-draft'
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
  unlockedModuleIds: [],
  metricPackets: [],
  auditInstances: [],
  clickAuditBatchBaseline: 0,
})

const createProgressedRuntime = () => ({
  korpState: {
    version: coreStateVersion,
    stats: {
      totalEvents: 29,
      eventsByType: {
        'clickaudit.click': 25,
        'clickaudit.batchCompleted': 1,
        'audit.formSubmitted': 2,
        'audit.evidenceCertified': 1,
      },
      eventsByModule: { 'click-audit': 26, system: 3 },
    },
    resources: { notionalWorkUnits: 1 },
  },
  lifetimeStats: {
    totalEvents: 29,
    eventsByType: {
      'clickaudit.click': 25,
      'clickaudit.batchCompleted': 1,
      'audit.formSubmitted': 2,
      'audit.evidenceCertified': 1,
    },
    eventsByModule: { 'click-audit': 26, system: 3 },
  },
  submittedFormIds: ['audit-00-a', 'audit-10-a'],
  ownedUpgradeIds: [],
  unlockedMemoIds: ['memo.audit-00-a-complete'],
  unlockedModuleIds: ['click-audit'],
  metricPackets: [{
    id: 'clickaudit-clicks-1-25',
    metricType: 'clickaudit.click',
    source: 'manual',
    quantity: 25,
    status: 'certified',
    createdAt: 1000,
    certifiedAt: 2000,
    auditTemplateId: 'audit-10-a',
    rangeStart: 1,
    rangeEnd: 25,
  }],
  auditInstances: [{
    id: 'audit-10-a:clickaudit-clicks-1-25',
    templateId: 'audit-10-a',
    packetId: 'clickaudit-clicks-1-25',
    status: 'submitted',
    values: { evidenceSufficiency: 'Nelze potvrdit bez další evidence' },
    createdAt: 1000,
    submittedAt: 2000,
  }],
  clickAuditBatchBaseline: 25,
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

test('runtime save round-trips packets and audit instances through local storage', () => {
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
    'auditInstances',
    'clickAuditBatchBaseline',
    'korpState',
    'lifetimeStats',
    'metricPackets',
    'ownedUpgradeIds',
    'submittedFormIds',
    'unlockedMemoIds',
    'unlockedModuleIds',
  ])
  assert.equal('auditForms' in save.runtime, false)
  assert.equal('windows' in save.runtime, false)
})

test('legacy v1 saves establish a click baseline and discard invalid click-derived Evidence', () => {
  const legacyRuntime = createProgressedRuntime()
  legacyRuntime.korpState.stats.eventsByType['clickaudit.click'] = 947
  legacyRuntime.korpState.resources.notionalWorkUnits = 94.7
  delete legacyRuntime.metricPackets
  delete legacyRuntime.auditInstances
  delete legacyRuntime.clickAuditBatchBaseline

  const legacySave = {
    schemaVersion: 1,
    progressionDataVersion: '0.1.1-draft',
    savedAt: '2026-07-11T18:00:00.000Z',
    runtime: legacyRuntime,
  }
  const migrated = hydrateRuntimeSave(legacySave, loadOptions())

  assert.equal(migrated.korpState.resources.notionalWorkUnits, 0)
  assert.equal(migrated.clickAuditBatchBaseline, 947)
  assert.deepEqual(migrated.metricPackets, [])
  assert.deepEqual(migrated.auditInstances, [])
  assert.deepEqual(migrated.unlockedModuleIds, ['click-audit'])
})

test('corrupt JSON falls back to a fresh runtime', () => {
  const storage = createMemoryStorage()
  storage.setItem(RUNTIME_SAVE_KEY, '{not-json')

  assert.deepEqual(loadRuntimeFromStorage(storage, loadOptions()), createFreshRuntime())
})

test('future save schemas and mismatched current progression data fail safely', () => {
  const runtime = createProgressedRuntime()
  const futureSave = createRuntimeSave(runtime, progressionDataVersion)
  futureSave.schemaVersion = RUNTIME_SAVE_SCHEMA_VERSION + 1

  assert.deepEqual(hydrateRuntimeSave(futureSave, loadOptions()), createFreshRuntime())

  const staleProgressionSave = createRuntimeSave(runtime, '0.0.0-old')
  assert.deepEqual(hydrateRuntimeSave(staleProgressionSave, loadOptions()), createFreshRuntime())
})

test('loaded progression and packet ids are sanitized and kept unique', () => {
  const save = createRuntimeSave(createProgressedRuntime(), progressionDataVersion)
  save.runtime.submittedFormIds = ['audit-00-a', 'audit-00-a', null]
  save.runtime.ownedUpgradeIds = ['sys.audit-batch-standardization', 42]
  save.runtime.unlockedMemoIds = ['memo.audit-00-a-complete', 'memo.audit-00-a-complete']
  save.runtime.unlockedModuleIds = ['click-audit', 'click-audit', false]
  save.runtime.metricPackets = [
    ...save.runtime.metricPackets,
    save.runtime.metricPackets[0],
    { id: null },
  ]
  save.runtime.auditInstances = [
    ...save.runtime.auditInstances,
    save.runtime.auditInstances[0],
    { id: null },
  ]

  const runtime = hydrateRuntimeSave(save, loadOptions())

  assert.deepEqual(runtime.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(runtime.ownedUpgradeIds, ['sys.audit-batch-standardization'])
  assert.deepEqual(runtime.unlockedMemoIds, ['memo.audit-00-a-complete'])
  assert.deepEqual(runtime.unlockedModuleIds, ['click-audit'])
  assert.equal(runtime.metricPackets.length, 1)
  assert.equal(runtime.auditInstances.length, 1)
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
