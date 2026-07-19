import assert from 'node:assert/strict'
import test from 'node:test'
import {
  appendClickAuditPackets,
  appendFidgetSessionPackets,
  resolveMetricAuditCertification,
  updateMetricAuditInstanceField,
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

const progressionDataVersion = '0.3.1-draft'
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
  fidgetSessionBatchBaseline: 0,
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

const createFidgetPacket = ({
  rangeStart,
  rangeEnd,
  status = 'pending',
  createdAt = 1000,
  certifiedAt,
}) => ({
  id: `fidget-sessions-${rangeStart}-${rangeEnd}`,
  metricType: 'fidget.sessionSettled',
  source: 'manual',
  quantity: rangeEnd - rangeStart + 1,
  status,
  createdAt,
  ...(certifiedAt === undefined ? {} : { certifiedAt }),
  auditTemplateId: 'audit-18-s',
  rangeStart,
  rangeEnd,
})

const createFidgetAuditInstance = (packet, {
  status = 'available',
  values = {},
  createdAt = packet.createdAt,
  submittedAt,
} = {}) => ({
  id: `audit-18-s:${packet.id}`,
  templateId: 'audit-18-s',
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
    fidgetSessionBatchBaseline: 0,
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

const createTask022A21Save = (runtime) => ({
  schemaVersion: 4,
  progressionDataVersion: '0.3.0-draft',
  savedAt: '2026-07-18T08:00:00.000Z',
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
  const certifiedFidgetPacket = createFidgetPacket({
    rangeStart: 1,
    rangeEnd: 3,
    status: 'certified',
    createdAt: 3000,
    certifiedAt: 4000,
  })
  const pendingFidgetPacket = createFidgetPacket({
    rangeStart: 4,
    rangeEnd: 6,
    createdAt: 5000,
  })

  runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 6
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.metricPackets.push(certifiedFidgetPacket, pendingFidgetPacket)
  runtime.auditInstances.push(
    createFidgetAuditInstance(certifiedFidgetPacket, {
      status: 'submitted',
      values: { naturalClosure: 'Nelze potvrdit' },
      submittedAt: 4000,
    }),
    createFidgetAuditInstance(pendingFidgetPacket, {
      status: 'draft',
      values: { naturalClosure: 'Ano' },
    }),
  )
  runtime.fidgetSessionBatchBaseline = 6
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
    'fidgetSessionBatchBaseline',
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

test('Task 022A(2.1) schema-4 save preserves progress and baselines historical Fidget sessions', () => {
  const runtime = createProgressedRuntime()
  delete runtime.fidgetSessionBatchBaseline
  runtime.korpState.resources.notionalWorkUnits = 4
  runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 5
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  const clickPacketsBefore = structuredClone(runtime.metricPackets)
  const clickAuditsBefore = structuredClone(runtime.auditInstances)

  const migrated = hydrateRuntimeSave(createTask022A21Save(runtime), loadOptions())

  assert.equal(migrated.korpState.resources.notionalWorkUnits, 4)
  assert.equal(migrated.korpState.stats.eventsByType['fidget.sessionSettled'], 5)
  assert.equal(migrated.lifetimeStats.eventsByType['fidget.sessionSettled'], 5)
  assert.equal(migrated.fidgetSessionBatchBaseline, 5)
  assert.deepEqual(migrated.metricPackets, clickPacketsBefore)
  assert.deepEqual(migrated.auditInstances, clickAuditsBefore)
  assert.equal(
    migrated.metricPackets.some((packet) => packet.metricType === 'fidget.sessionSettled'),
    false,
  )

  const six = appendFidgetSessionPackets(migrated, 6, 6000)
  const seven = appendFidgetSessionPackets(six.runtimeState, 7, 7000)
  const eight = appendFidgetSessionPackets(seven.runtimeState, 8, 8000)

  assert.equal(six.createdPackets.length, 0)
  assert.equal(seven.createdPackets.length, 0)
  assert.equal(eight.createdPackets.length, 1)
  assert.equal(eight.createdPackets[0].id, 'fidget-sessions-6-8')
  assert.equal(eight.createdAuditInstances[0].id, 'audit-18-s:fidget-sessions-6-8')
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

test('current saves fail closed when the Fidget cursor is missing or corrupt', () => {
  for (const invalidBaseline of [undefined, -1, 1.5, '0']) {
    const runtime = createProgressedRuntime()
    runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 5
    runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
    const save = createRuntimeSave(runtime, progressionDataVersion)

    if (invalidBaseline === undefined) {
      delete save.runtime.fidgetSessionBatchBaseline
    } else {
      save.runtime.fidgetSessionBatchBaseline = invalidBaseline
    }

    const hydrated = hydrateRuntimeSave(save, loadOptions())
    assert.equal(hydrated.fidgetSessionBatchBaseline, 5)
    assert.equal(appendFidgetSessionPackets(hydrated, 6, 6000).createdPackets.length, 0)
  }

  const runtimeWithRemainder = createProgressedRuntime()
  const firstFidgetPacket = createFidgetPacket({ rangeStart: 1, rangeEnd: 3 })
  runtimeWithRemainder.korpState.stats.eventsByType['fidget.sessionSettled'] = 5
  runtimeWithRemainder.lifetimeStats = structuredClone(runtimeWithRemainder.korpState.stats)
  runtimeWithRemainder.metricPackets.push(firstFidgetPacket)
  runtimeWithRemainder.auditInstances.push(createFidgetAuditInstance(firstFidgetPacket))
  runtimeWithRemainder.fidgetSessionBatchBaseline = 3

  const hydratedRemainder = hydrateRuntimeSave(
    createRuntimeSave(runtimeWithRemainder, progressionDataVersion),
    loadOptions(),
  )
  assert.equal(hydratedRemainder.fidgetSessionBatchBaseline, 3)
  assert.equal(
    appendFidgetSessionPackets(hydratedRemainder, 6, 6000).createdPackets[0].id,
    'fidget-sessions-4-6',
  )
})

test('packet hydration rejects malformed ranges, identifiers, duplicates and broken links', () => {
  const runtime = createProgressedRuntime()
  const fidgetPacket = createFidgetPacket({ rangeStart: 1, rangeEnd: 3 })
  const fidgetInstance = createFidgetAuditInstance(fidgetPacket, {
    status: 'draft',
    values: { naturalClosure: 'Ano' },
  })
  runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 3
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.metricPackets.push(fidgetPacket)
  runtime.auditInstances.push(fidgetInstance)
  runtime.fidgetSessionBatchBaseline = 3

  const save = createRuntimeSave(runtime, progressionDataVersion)
  save.runtime.metricPackets.push(
    fidgetPacket,
    { ...fidgetPacket, id: 'fidget-sessions-incorrect' },
    { ...fidgetPacket, id: 'fidget-sessions-4-6', rangeStart: 4, rangeEnd: 6, quantity: 2 },
    { ...fidgetPacket, id: 'clickaudit-clicks-4-6', rangeStart: 4, rangeEnd: 6 },
  )
  save.runtime.auditInstances.push(
    fidgetInstance,
    { ...fidgetInstance, id: 'audit-18-s:missing', packetId: 'missing' },
    { ...fidgetInstance, id: `audit-10-a:${fidgetPacket.id}`, templateId: 'audit-10-a' },
  )

  const hydrated = hydrateRuntimeSave(save, loadOptions())

  assert.deepEqual(
    hydrated.metricPackets.map((packet) => packet.id),
    ['clickaudit-clicks-8-8', 'fidget-sessions-1-3'],
  )
  assert.deepEqual(
    hydrated.auditInstances.map((instance) => instance.id),
    ['audit-10-a:clickaudit-clicks-8-8', 'audit-18-s:fidget-sessions-1-3'],
  )
  assert.deepEqual(hydrated.auditInstances[1].values, { naturalClosure: 'Ano' })
})

test('current schema-5 hydration repairs a valid pending Fidget packet with no audit instance', () => {
  const runtime = createProgressedRuntime()
  const fidgetPacket = createFidgetPacket({
    rangeStart: 1,
    rangeEnd: 3,
    createdAt: 5000,
  })
  runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 3
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.metricPackets.push(fidgetPacket)
  runtime.fidgetSessionBatchBaseline = 3

  const save = createRuntimeSave(runtime, progressionDataVersion)
  assert.equal(save.schemaVersion, RUNTIME_SAVE_SCHEMA_VERSION)

  const hydrated = hydrateRuntimeSave(save, loadOptions())
  const repairedInstance = createFidgetAuditInstance(fidgetPacket)

  assert.deepEqual(
    hydrated.auditInstances.find((instance) => instance.packetId === fidgetPacket.id),
    repairedInstance,
  )
  assert.equal(
    appendFidgetSessionPackets(hydrated, 3, 6000).createdAuditInstances.length,
    0,
  )

  const drafted = updateMetricAuditInstanceField(
    hydrated,
    repairedInstance.id,
    'naturalClosure',
    'Ano',
  )
  const certification = resolveMetricAuditCertification(
    drafted,
    repairedInstance.id,
    'audit-18-s',
    7000,
  )

  assert.equal(certification.didCertify, true)
  assert.equal(certification.packet.status, 'certified')
  assert.equal(certification.events[1].type, 'audit.evidenceCertified')
  assert.equal(certification.events[1].value, 1)
})

test('current schema-5 hydration rejects noncanonical or unearned Fidget packet ranges', () => {
  const runtime = createProgressedRuntime()
  const validPacket = createFidgetPacket({ rangeStart: 1, rangeEnd: 3, createdAt: 3000 })
  const undersizedPacket = createFidgetPacket({ rangeStart: 4, rangeEnd: 4, createdAt: 4000 })
  const overlappingPacket = createFidgetPacket({ rangeStart: 2, rangeEnd: 4, createdAt: 4500 })
  const nextValidPacket = createFidgetPacket({ rangeStart: 4, rangeEnd: 6, createdAt: 4750 })
  const futurePacket = createFidgetPacket({ rangeStart: 100, rangeEnd: 102, createdAt: 5000 })
  runtime.korpState.stats.eventsByType['fidget.sessionSettled'] = 6
  runtime.lifetimeStats = structuredClone(runtime.korpState.stats)
  runtime.metricPackets.push(
    validPacket,
    undersizedPacket,
    overlappingPacket,
    nextValidPacket,
    futurePacket,
  )
  runtime.auditInstances.push(
    createFidgetAuditInstance(validPacket),
    createFidgetAuditInstance(undersizedPacket),
    createFidgetAuditInstance(overlappingPacket),
    createFidgetAuditInstance(nextValidPacket),
    createFidgetAuditInstance(futurePacket),
  )
  runtime.fidgetSessionBatchBaseline = 102

  const hydrated = hydrateRuntimeSave(
    createRuntimeSave(runtime, progressionDataVersion),
    loadOptions(),
  )
  const hydratedFidgetPackets = hydrated.metricPackets.filter((packet) => (
    packet.metricType === 'fidget.sessionSettled'
  ))
  const hydratedFidgetInstances = hydrated.auditInstances.filter((instance) => (
    instance.templateId === 'audit-18-s'
  ))

  assert.deepEqual(hydratedFidgetPackets, [validPacket, nextValidPacket])
  assert.deepEqual(hydratedFidgetInstances, [
    createFidgetAuditInstance(validPacket),
    createFidgetAuditInstance(nextValidPacket),
  ])
  assert.equal(hydrated.fidgetSessionBatchBaseline, 6)
  assert.equal(resolveMetricAuditCertification(
    hydrated,
    createFidgetAuditInstance(undersizedPacket).id,
    'audit-18-s',
    6000,
  ).didCertify, false)
  assert.equal(resolveMetricAuditCertification(
    hydrated,
    createFidgetAuditInstance(overlappingPacket).id,
    'audit-18-s',
    6000,
  ).didCertify, false)
  assert.equal(resolveMetricAuditCertification(
    hydrated,
    createFidgetAuditInstance(futurePacket).id,
    'audit-18-s',
    6000,
  ).didCertify, false)
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
