import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  applyKorpEvent,
  createInitialState,
  KORP_CORE_STATE_VERSION,
} from '../../packages/korp-core/src/index'
import { KORP_PROGRESSION_DATABASE } from '../../packages/korp-progression/src/progression.database'
import {
  createInitialAuditProgressionState,
  getAuditForm,
  isAuditFormAvailable,
  submitAuditForm as resolveAuditFormSubmission,
} from './auditProgression'
import { isAuditFormComplete } from './auditFormDraft'
import {
  applyModuleAuthorizationTransaction,
  isModuleAuthorized as hasModuleAuthorization,
} from './moduleAuthorization'
import { KorpRuntimeContext } from './KorpRuntimeContext'
import {
  clearRuntimeStorage,
  loadRuntimeFromStorage,
  saveRuntimeToStorage,
} from './runtimePersistence'
import { createClickAuditInteractionEvents } from './clickAuditEvents'
import { formatClickAuditActivity } from './clickAuditActivity'
import {
  CLICK_AUDIT_TEMPLATE_ID,
  appendClickAuditPackets,
  captureClickAuditBootstrapAfterSubmission,
  createInitialMetricAuditState,
  getPendingAuditInstances,
  getPendingMetricPackets,
  resolveMetricAuditCertification,
  updateMetricAuditInstanceField,
} from './metricAuditFlow'

const auditForms = KORP_PROGRESSION_DATABASE.auditForms
const progressionDataVersion = KORP_PROGRESSION_DATABASE.meta.version

const getRuntimeStorage = () => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

const createFreshRuntimeState = () => {
  const korpState = createInitialState({ settings: { platform: 'web' } })
  const clickCount = korpState.stats.eventsByType['clickaudit.click'] ?? 0

  return {
    korpState,
    lifetimeStats: korpState.stats,
    ...createInitialAuditProgressionState(),
    ...createInitialMetricAuditState(clickCount),
    moduleAuthorizations: [],
  }
}

const createRuntimeState = () => loadRuntimeFromStorage(getRuntimeStorage(), {
  progressionDataVersion,
  coreStateVersion: KORP_CORE_STATE_VERSION,
  createFallback: createFreshRuntimeState,
})

const applyEvents = (korpState, events) => events.reduce(
  (currentState, event) => applyKorpEvent(currentState, event),
  korpState,
)

function runtimeReducer(runtime, action) {
  switch (action.type) {
    case 'dispatchKorpEvent': {
      const korpState = applyKorpEvent(runtime.korpState, action.event)

      return {
        ...runtime,
        korpState,
        lifetimeStats: korpState.stats,
      }
    }
    case 'dispatchKorpEvents': {
      const korpState = applyEvents(runtime.korpState, action.events)

      return {
        ...runtime,
        korpState,
        lifetimeStats: korpState.stats,
      }
    }
    case 'recordOsClick': {
      const clickKorpState = applyEvents(runtime.korpState, action.events)
      const totalClickCount = clickKorpState.stats.eventsByType['clickaudit.click'] ?? 0
      const packetResult = appendClickAuditPackets({
        ...runtime,
        korpState: clickKorpState,
        lifetimeStats: clickKorpState.stats,
      }, totalClickCount, action.timestamp)
      const korpState = applyEvents(clickKorpState, packetResult.batchEvents)

      return {
        ...packetResult.runtimeState,
        korpState,
        lifetimeStats: korpState.stats,
      }
    }
    case 'updateMetricAuditInstanceField':
      return updateMetricAuditInstanceField(
        runtime,
        action.instanceId,
        action.fieldId,
        action.value,
      )
    case 'submitMetricAuditInstance': {
      const currentAuditInstance = (runtime.auditInstances ?? [])
        .find((instance) => instance.id === action.instanceId)
      const form = getAuditForm(auditForms, currentAuditInstance?.templateId)

      if (
        !currentAuditInstance
        || !form
        || !isAuditFormComplete(form, currentAuditInstance.values)
      ) return runtime

      const certification = resolveMetricAuditCertification(
        runtime,
        action.instanceId,
        form.id,
        action.timestamp,
      )
      if (!certification.didCertify) return runtime

      const korpState = applyEvents(runtime.korpState, certification.events)

      return {
        ...certification.runtimeState,
        korpState,
        lifetimeStats: korpState.stats,
      }
    }
    case 'submitAuditForm': {
      if (action.formId === CLICK_AUDIT_TEMPLATE_ID) return runtime

      const form = getAuditForm(auditForms, action.formId)
      if (form?.authorization) return runtime
      const progression = resolveAuditFormSubmission({
        form,
        korpState: runtime.korpState,
        progressionState: runtime,
      })

      if (!progression.didSubmit) return runtime

      const korpState = applyKorpEvent(runtime.korpState, {
        id: 'k0rp-os-audit-form-submitted-' + form.id + '-' + action.timestamp,
        timestamp: action.timestamp,
        sourceModule: 'system',
        type: form.submitEvent,
        tags: ['k0rp-os', 'audit-form', form.id],
        meta: { formId: form.id },
      })

      const nextRuntime = {
        ...runtime,
        ...progression.progressionState,
        korpState,
        lifetimeStats: korpState.stats,
      }

      return captureClickAuditBootstrapAfterSubmission(nextRuntime, form.id)
    }
    case 'submitModuleAuthorization': {
      const form = getAuditForm(auditForms, action.formId)
      const transaction = applyModuleAuthorizationTransaction({
        runtime,
        form,
        values: action.values,
        timestamp: action.timestamp,
        applyEvents,
      })

      return transaction.runtimeState
    }
    case 'resetRuntime':
      return createFreshRuntimeState()
    default:
      return runtime
  }
}

export function KorpRuntimeProvider({ children }) {
  const [runtime, dispatch] = useReducer(runtimeReducer, undefined, createRuntimeState)
  const [lastClickAuditActivity, setLastClickAuditActivity] = useState(null)
  const skipNextPersistenceRef = useRef(false)
  const osClickSequenceRef = useRef(0)

  useEffect(() => {
    if (skipNextPersistenceRef.current) {
      skipNextPersistenceRef.current = false
      return
    }

    saveRuntimeToStorage(getRuntimeStorage(), runtime, progressionDataVersion)
  }, [runtime])

  const dispatchKorpEvent = useCallback((event) => {
    dispatch({ type: 'dispatchKorpEvent', event })
  }, [])

  const recordOsClick = useCallback(({
    profile,
    tags = [],
  } = {}) => {
    const knownClickCount = runtime.korpState.stats.eventsByType['clickaudit.click'] ?? 0
    const sequence = Math.max(osClickSequenceRef.current, knownClickCount) + 1
    const timestamp = Date.now()
    osClickSequenceRef.current = sequence

    const events = createClickAuditInteractionEvents({
      timestamp,
      sequence,
      profile,
      tags,
    })
    const clickEvent = events[0]

    dispatch({
      type: 'recordOsClick',
      events,
      timestamp,
    })
    setLastClickAuditActivity({
      id: clickEvent.id,
      event: clickEvent,
      entry: formatClickAuditActivity(clickEvent, sequence),
    })

    return { count: sequence, event: clickEvent }
  }, [runtime.korpState.stats.eventsByType])

  const submitAuditForm = useCallback((formId) => {
    dispatch({ type: 'submitAuditForm', formId, timestamp: Date.now() })
  }, [])

  const submitModuleAuthorization = useCallback((formId, values) => {
    dispatch({
      type: 'submitModuleAuthorization',
      formId,
      values,
      timestamp: Date.now(),
    })
  }, [])

  const updateAuditInstanceField = useCallback((instanceId, fieldId, value) => {
    dispatch({
      type: 'updateMetricAuditInstanceField',
      instanceId,
      fieldId,
      value,
    })
  }, [])

  const submitMetricAuditInstance = useCallback((instanceId) => {
    dispatch({
      type: 'submitMetricAuditInstance',
      instanceId,
      timestamp: Date.now(),
    })
  }, [])

  const resetRuntime = useCallback(() => {
    skipNextPersistenceRef.current = true
    clearRuntimeStorage(getRuntimeStorage())
    dispatch({ type: 'resetRuntime' })
  }, [])

  const pendingMetricPackets = useMemo(
    () => getPendingMetricPackets(runtime),
    [runtime],
  )
  const pendingAuditInstances = useMemo(
    () => getPendingAuditInstances(runtime),
    [runtime],
  )

  const isFormAvailable = useCallback((formId) => {
    if (formId === CLICK_AUDIT_TEMPLATE_ID) {
      return pendingAuditInstances.some((instance) => instance.templateId === formId)
    }

    return isAuditFormAvailable(
      getAuditForm(auditForms, formId),
      runtime.korpState,
      runtime,
    ) || runtime.moduleAuthorizations.some((authorization) => (
      authorization.sourceFormId === formId
    ))
  }, [pendingAuditInstances, runtime])

  const isFormSubmitted = useCallback((formId) => (
    runtime.submittedFormIds.includes(formId)
  ), [runtime.submittedFormIds])

  const isUpgradeUnlocked = useCallback((upgradeId) => (
    runtime.ownedUpgradeIds.includes(upgradeId)
  ), [runtime.ownedUpgradeIds])

  const isMemoUnlocked = useCallback((memoId) => (
    runtime.unlockedMemoIds.includes(memoId)
  ), [runtime.unlockedMemoIds])

  const isModuleUnlocked = useCallback((moduleId) => (
    runtime.unlockedModuleIds.includes(moduleId)
  ), [runtime.unlockedModuleIds])

  const isModuleAuthorized = useCallback((moduleId) => (
    hasModuleAuthorization(runtime.moduleAuthorizations, moduleId)
  ), [runtime.moduleAuthorizations])

  const value = useMemo(() => ({
    korpState: runtime.korpState,
    stats: runtime.korpState.stats,
    lifetimeStats: runtime.lifetimeStats,
    submittedFormIds: runtime.submittedFormIds,
    ownedUpgradeIds: runtime.ownedUpgradeIds,
    unlockedMemoIds: runtime.unlockedMemoIds,
    unlockedModuleIds: runtime.unlockedModuleIds,
    moduleAuthorizations: runtime.moduleAuthorizations,
    metricPackets: runtime.metricPackets,
    auditInstances: runtime.auditInstances,
    pendingMetricPackets,
    pendingAuditInstances,
    pendingAuditCount: pendingMetricPackets.length,
    auditForms,
    dispatchKorpEvent,
    recordOsClick,
    lastClickAuditActivity,
    submitAuditForm,
    submitModuleAuthorization,
    updateAuditInstanceField,
    submitMetricAuditInstance,
    isFormAvailable,
    isFormSubmitted,
    isUpgradeUnlocked,
    isMemoUnlocked,
    isModuleUnlocked,
    isModuleAuthorized,
    resetRuntime,
  }), [
    dispatchKorpEvent,
    recordOsClick,
    isFormAvailable,
    isFormSubmitted,
    lastClickAuditActivity,
    isMemoUnlocked,
    isModuleAuthorized,
    isModuleUnlocked,
    isUpgradeUnlocked,
    pendingAuditInstances,
    pendingMetricPackets,
    resetRuntime,
    runtime,
    submitAuditForm,
    submitModuleAuthorization,
    submitMetricAuditInstance,
    updateAuditInstanceField,
  ])

  return (
    <KorpRuntimeContext.Provider value={value}>
      {children}
    </KorpRuntimeContext.Provider>
  )
}
