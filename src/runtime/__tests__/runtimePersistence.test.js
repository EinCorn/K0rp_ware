import assert from 'node:assert/strict'
import test from 'node:test'
import {
  appendClickAuditPackets,
  resolveMetricAuditCertification,
} from '../metricAuditFlow.js'
import {
  RUNTIME_SAVE_KEY,
  RUNTIME_SAVE_SCHEMA_VERSION,
  clearRuntimeStorage,
  createRuntimeSave,
  hydrateRuntimeSave,
  loadRuntimeFromStorage,
  saveRuntimeToStorage,
} from '../runtimePersistence.js'

const progressionDataVersion = '0.2.1-draft'
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
  moduleAuthorizations: [],
  clickAuditBatchBaseline: 0,
  clickAuditBootstrapArmed: false,
  clickAuditBootstrapCompleted: false,
})

const createPacket = ({
  rangeStart,
  rangeEnd,
  quantity,
  status = 'pending',
  createdAt = 1000,
  certifiedAt,
}) => ({
  id: `clickaudit-clicks-${rangeStart}-${rangeEnd}`,
  metricType: 'clickaudit.click',
  source: 'manual',
  quantity,
  status,
  createdAt,
  ...(certifiedAt === undefined ? {} : { certifiedAt }),
  auditTemplateId: 'audit-10-a',
  rangeStart,
  rangeEnd,
})

const createAuditInstance = (packet, {
  status = 'available',
  values = {},
  createdAt = packet.createdAt,
  submittedAt,
} = {}) => ({
  id: `audit-10-a:${packet.id}`,
  templateId: 'audit-10-a',
  packetId: packet.id,
  status,
  values,
  createdAt,
  ...(submittedAt === undefined ? {} : { submittedAt }),
})

const createProgressedRuntime = () => {
  const packet = createPacket({
    rangeStart: 8,
    rangeEnd: 8,
    quantity: 1,
    status: 'certified',
    certifiedAt: 2000,
  })

  return {
    korpState: {
      version: coreStateVersion,
      stats: {
        totalEvents: 12,
        eventsByType: {
          'clickaudit.click': 8,
          'clickaudit.batchCompleted': 1,
          'audit.formSubmitted': 2,
          'audit.evidenceCertified': 1,
        },
        eventsByModule: { 'click-audit': 9, system: 3 },
      },
      resources: { notionalWorkUnits: 1 },
    },
    lifetimeStats: {
      totalEvents: 12,
      eventsByType: {
        'clickaudit.click': 8,
        'clickaudit.batchCompleted': 1,
        'audit.formSubmitted': 2,
        'audit.evidenceCertified': 1,
      },
      eventsByModule: { 'click-audit': 9, system: 3 },
    },
    submittedFormIds: ['audit-00-a', 'audit-10-a'],
    ownedUpgradeIds: [],
    unlockedMemoIds: ['memo.audit-00-a-complete'],
    unlockedModuleIds: ['click-audit'],
    metricPackets: [packet],
    auditInstances: [createAuditInstance(packet, {
      status: 'submitted',
      values: { intentionality: 'Nelze potvrdit' },
      submittedAt: 2000,
    })],
    moduleAuthorizations: [],
    clickAuditBatchBaseline: 8,
    clickAuditBootstrapArmed: false,
    clickAuditBootstrapCompleted: true,
  }
}

const createDraftV2Save = (runtime) => ({
  schemaVersion: 2,
  progressionDataVersion: '0.2.0-draft',
  savedAt: '2026-07-11T18:00:00.000Z',
  runtime,
})

const createTask021ASave = (runtime) => ({
  schemaVersion: 3,
  progressionDataVersion: '0.2.1-draft',
  savedAt: '2026-07-11T18:00:00.000Z',
  runtime,
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

test('runtime save round-trips packets, audit answers and module authorization', () => {
  const storage = createMemoryStorage()
  const runtime = createProgressedRuntime()
  runtime.moduleAuthorizations = [{
    id: 'fidget',
    moduleId: 'fidget',
    sourceFormId: 'audit-16-c',
    evidenceCost: 1,
    grantedAt: 1783792700000,
  }]

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
    'clickAuditBootstrapArmed',
    'clickAuditBootstrapCompleted',
    'korpState',
    'lifetimeStats',
    'metricPackets',
    'moduleAuthorizations',
    'ownedUpgradeIds',
    'submittedFormIds',
    'unlockedMemoIds',
    'unlockedModuleIds',
  ])
  assert.equal('auditForms' in save.runtime, false)
  assert.equal('windows' in save.runtime, false)
})

test('Task 021A save migrates without changing runtime progress or Evidence', () => {
  const runtime = createProgressedRuntime()
  runtime.korpState.resources.notionalWorkUnits = 3
  runtime.metricPackets.push(createPacket({
    rangeStart: 9,
    rangeEnd: 33,
    quantity: 25,
    createdAt: 3000,
  }))
  runtime.auditInstances.push(createAuditInstance(runtime.metricPackets[1]))
  delete runtime.moduleAuthorizations

  const expectedRuntime = structuredClone(runtime)
  const migrated = hydrateRuntimeSave(createTask021ASave(runtime), loadOptions())

  assert.deepEqual(migrated, {
    ...expectedRuntime,
    moduleAuthorizations: [],
  })
  assert.equal(migrated.korpState.resources.notionalWorkUnits, 3)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.click'], 8)
  assert.equal(migrated.metricPackets.length, 2)
  assert.equal(migrated.auditInstances.length, 2)
})

test('legacy Fidget unlock or permit migrates to at most one free authorization', () => {
  const legacyStates = [
    { hasUnlock: true, hasPermit: false },
    { hasUnlock: false, hasPermit: true },
    { hasUnlock: true, hasPermit: true },
  ]

  for (const { hasUnlock, hasPermit } of legacyStates) {
    const runtime = createProgressedRuntime()
    runtime.korpState.resources.notionalWorkUnits = 4
    if (hasUnlock) runtime.unlockedModuleIds.push('fidget')
    if (hasPermit) runtime.ownedUpgradeIds.push('fidget.access-permit')
    delete runtime.moduleAuthorizations

    const migrated = hydrateRuntimeSave(createTask021ASave(runtime), loadOptions())

    assert.equal(migrated.korpState.resources.notionalWorkUnits, 4)
    assert.deepEqual(migrated.moduleAuthorizations, [{
      id: 'fidget',
      moduleId: 'fidget',
      sourceFormId: 'audit-16-c',
      evidenceCost: 0,
      grantedAt: 1783792800000,
    }])
    assert.equal(migrated.unlockedModuleIds.includes('fidget'), hasUnlock)
    assert.equal(migrated.ownedUpgradeIds.includes('fidget.access-permit'), hasPermit)

    const reloaded = hydrateRuntimeSave(
      createRuntimeSave(migrated, progressionDataVersion),
      loadOptions(),
    )
    assert.equal(reloaded.moduleAuthorizations.length, 1)
    assert.equal(reloaded.korpState.resources.notionalWorkUnits, 4)
  }
})

test('legacy v1 saves avoid retroactive packets and arm one future bootstrap click', () => {
  const legacyRuntime = createProgressedRuntime()
  legacyRuntime.korpState.stats.eventsByType['clickaudit.click'] = 947
  legacyRuntime.korpState.stats.eventsByType['clickaudit.batchCompleted'] = 3
  legacyRuntime.korpState.stats.eventsByModule['click-audit'] = 950
  legacyRuntime.korpState.stats.totalEvents = 953
  legacyRuntime.korpState.resources.notionalWorkUnits = 94.7
  legacyRuntime.lifetimeStats = structuredClone(legacyRuntime.korpState.stats)
  delete legacyRuntime.metricPackets
  delete legacyRuntime.auditInstances
  delete legacyRuntime.clickAuditBatchBaseline
  delete legacyRuntime.clickAuditBootstrapArmed
  delete legacyRuntime.clickAuditBootstrapCompleted

  const legacySave = {
    schemaVersion: 1,
    progressionDataVersion: '0.1.1-draft',
    savedAt: '2026-07-11T18:00:00.000Z',
    runtime: legacyRuntime,
  }
  const migrated = hydrateRuntimeSave(legacySave, loadOptions())

  assert.equal(migrated.korpState.resources.notionalWorkUnits, 0)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.click'], 947)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.batchCompleted'] ?? 0, 0)
  assert.equal(migrated.clickAuditBatchBaseline, 947)
  assert.equal(migrated.clickAuditBootstrapArmed, true)
  assert.equal(migrated.clickAuditBootstrapCompleted, false)
  assert.deepEqual(migrated.metricPackets, [])
  assert.deepEqual(migrated.auditInstances, [])
  assert.deepEqual(migrated.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(migrated.unlockedModuleIds, ['click-audit'])

  assert.equal(appendClickAuditPackets(migrated, 947, 2000).createdPackets.length, 0)
  const firstFutureClick = appendClickAuditPackets(migrated, 948, 3000)
  assert.equal(firstFutureClick.createdPackets.length, 1)
  assert.equal(firstFutureClick.createdPackets[0].quantity, 1)
  assert.deepEqual(
    [firstFutureClick.createdPackets[0].rangeStart, firstFutureClick.createdPackets[0].rangeEnd],
    [948, 948],
  )
})

test('draft v2 EV-0 migration removes invalid backlog without erasing raw clicks', () => {
  const firstPacket = createPacket({ rangeStart: 1, rangeEnd: 25, quantity: 25 })
  const secondPacket = createPacket({ rangeStart: 26, rangeEnd: 50, quantity: 25 })
  const runtime = createFreshRuntime()
  runtime.korpState.stats = {
    totalEvents: 53,
    eventsByType: {
      'clickaudit.click': 50,
      'clickaudit.batchCompleted': 2,
      'audit.formSubmitted': 1,
    },
    eventsByModule: { 'click-audit': 52, system: 1 },
  }
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.submittedFormIds = ['audit-00-a']
  runtime.unlockedMemoIds = ['memo.audit-00-a-complete']
  runtime.unlockedModuleIds = ['click-audit']
  runtime.metricPackets = [firstPacket, secondPacket]
  runtime.auditInstances = [createAuditInstance(firstPacket), createAuditInstance(secondPacket)]
  runtime.clickAuditBatchBaseline = 50
  delete runtime.clickAuditBootstrapArmed
  delete runtime.clickAuditBootstrapCompleted

  const migrated = hydrateRuntimeSave(createDraftV2Save(runtime), loadOptions())

  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.click'], 50)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.batchCompleted'] ?? 0, 0)
  assert.equal(migrated.korpState.stats.eventsByModule['click-audit'], 50)
  assert.equal(migrated.korpState.stats.totalEvents, 51)
  assert.equal(migrated.lifetimeStats.eventsByType['clickaudit.batchCompleted'] ?? 0, 0)
  assert.equal(migrated.lifetimeStats.eventsByModule['click-audit'], 50)
  assert.equal(migrated.lifetimeStats.totalEvents, 51)
  assert.deepEqual(migrated.metricPackets, [])
  assert.deepEqual(migrated.auditInstances, [])
  assert.equal(migrated.clickAuditBatchBaseline, 50)
  assert.equal(migrated.clickAuditBootstrapArmed, true)
  assert.equal(migrated.clickAuditBootstrapCompleted, false)
  assert.deepEqual(migrated.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(migrated.unlockedMemoIds, ['memo.audit-00-a-complete'])

  const bootstrap = appendClickAuditPackets(migrated, 51, 2000)
  assert.equal(bootstrap.createdPackets.length, 1)
  assert.equal(bootstrap.createdPackets[0].quantity, 1)
})

test('draft v2 certified Evidence is preserved without another bootstrap reward', () => {
  const certifiedPacket = createPacket({
    rangeStart: 1,
    rangeEnd: 25,
    quantity: 25,
    status: 'certified',
    certifiedAt: 2000,
  })
  const pendingPacket = createPacket({ rangeStart: 26, rangeEnd: 50, quantity: 25 })
  const runtime = createFreshRuntime()
  runtime.korpState.stats = {
    totalEvents: 55,
    eventsByType: {
      'clickaudit.click': 50,
      'clickaudit.batchCompleted': 2,
      'audit.formSubmitted': 2,
      'audit.evidenceCertified': 1,
    },
    eventsByModule: { 'click-audit': 52, system: 3 },
  }
  runtime.korpState.resources.notionalWorkUnits = 1
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.submittedFormIds = ['audit-00-a', 'audit-10-a']
  runtime.unlockedMemoIds = ['memo.audit-00-a-complete']
  runtime.unlockedModuleIds = ['click-audit']
  runtime.metricPackets = [certifiedPacket, pendingPacket]
  runtime.auditInstances = [
    createAuditInstance(certifiedPacket, {
      status: 'submitted',
      values: {
        evidenceSufficiency: 'Dostatečný pro zjištění nedostatečnosti',
        newColumn: true,
        impact: 'Přesvědčivější záznam',
      },
      submittedAt: 2000,
    }),
    createAuditInstance(pendingPacket),
  ]
  runtime.clickAuditBatchBaseline = 50
  delete runtime.clickAuditBootstrapArmed
  delete runtime.clickAuditBootstrapCompleted

  const migrated = hydrateRuntimeSave(createDraftV2Save(runtime), loadOptions())

  assert.equal(migrated.korpState.resources.notionalWorkUnits, 1)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.click'], 50)
  assert.equal(migrated.korpState.stats.eventsByType['clickaudit.batchCompleted'], 1)
  assert.equal(migrated.lifetimeStats.eventsByType['clickaudit.batchCompleted'], 1)
  assert.equal(migrated.metricPackets.length, 1)
  assert.equal(migrated.metricPackets[0].status, 'certified')
  assert.equal(migrated.auditInstances.length, 1)
  assert.deepEqual(migrated.auditInstances[0].values, {
    evidenceSufficiency: 'Dostatečný pro zjištění nedostatečnosti',
    newColumn: true,
    impact: 'Přesvědčivější záznam',
  })
  assert.equal(migrated.clickAuditBatchBaseline, 50)
  assert.equal(migrated.clickAuditBootstrapArmed, false)
  assert.equal(migrated.clickAuditBootstrapCompleted, true)

  const repeatedCertification = resolveMetricAuditCertification(
    migrated,
    migrated.auditInstances[0].id,
    'audit-10-a',
    2500,
  )
  assert.equal(repeatedCertification.didCertify, false)
  assert.deepEqual(repeatedCertification.events, [])

  assert.equal(appendClickAuditPackets(migrated, 50, 3000).createdPackets.length, 0)
  assert.equal(appendClickAuditPackets(migrated, 74, 3000).createdPackets.length, 0)
  const nextNormalPacket = appendClickAuditPackets(migrated, 75, 3000)
  assert.equal(nextNormalPacket.createdPackets.length, 1)
  assert.equal(nextNormalPacket.createdPackets[0].quantity, 25)
  assert.deepEqual(
    [nextNormalPacket.createdPackets[0].rangeStart, nextNormalPacket.createdPackets[0].rangeEnd],
    [51, 75],
  )
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

test('loaded ids are unique and completed bootstrap overrides contradictory armed state', () => {
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
  save.runtime.moduleAuthorizations = [
    {
      id: 'fidget',
      moduleId: 'fidget',
      sourceFormId: 'audit-16-c',
      evidenceCost: 1,
      grantedAt: 2000,
    },
    {
      id: 'fidget-duplicate',
      moduleId: 'fidget',
      sourceFormId: 'audit-16-c',
      evidenceCost: 1,
      grantedAt: 3000,
    },
    {
      id: 'fidget',
      moduleId: 'bloom',
      sourceFormId: 'audit-23-b',
      evidenceCost: 1,
      grantedAt: 4000,
    },
    {
      id: 'invalid-negative-cost',
      moduleId: 'button-compliance',
      sourceFormId: 'audit-31-f',
      evidenceCost: -1,
      grantedAt: 5000,
    },
  ]
  save.runtime.clickAuditBootstrapArmed = true
  save.runtime.clickAuditBootstrapCompleted = true

  const runtime = hydrateRuntimeSave(save, loadOptions())

  assert.deepEqual(runtime.submittedFormIds, ['audit-00-a'])
  assert.deepEqual(runtime.ownedUpgradeIds, ['sys.audit-batch-standardization'])
  assert.deepEqual(runtime.unlockedMemoIds, ['memo.audit-00-a-complete'])
  assert.deepEqual(runtime.unlockedModuleIds, ['click-audit'])
  assert.equal(runtime.metricPackets.length, 1)
  assert.equal(runtime.auditInstances.length, 1)
  assert.deepEqual(runtime.moduleAuthorizations, [{
    id: 'fidget',
    moduleId: 'fidget',
    sourceFormId: 'audit-16-c',
    evidenceCost: 1,
    grantedAt: 2000,
  }])
  assert.equal(runtime.clickAuditBootstrapArmed, false)
  assert.equal(runtime.clickAuditBootstrapCompleted, true)
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
