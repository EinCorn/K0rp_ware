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
import { KorpRuntimeContext } from './KorpRuntimeContext'
import {
  clearRuntimeStorage,
  loadRuntimeFromStorage,
  saveRuntimeToStorage,
} from './runtimePersistence'
import { createClickAuditInteractionEvents } from './clickAuditEvents'
import { formatClickAuditActivity } from './clickAuditActivity'

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

  return {
    korpState,
    lifetimeStats: korpState.stats,
    ...createInitialAuditProgressionState(),
  }
}

const createRuntimeState = () => loadRuntimeFromStorage(getRuntimeStorage(), {
  progressionDataVersion,
  coreStateVersion: KORP_CORE_STATE_VERSION,
  createFallback: createFreshRuntimeState,
})

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
      const korpState = action.events.reduce(
        (currentState, event) => applyKorpEvent(currentState, event),
        runtime.korpState,
      )

      return {
        ...runtime,
        korpState,
        lifetimeStats: korpState.stats,
      }
    }
    case 'submitAuditForm': {
      const form = getAuditForm(auditForms, action.formId)
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

      return {
        ...runtime,
        ...progression.progressionState,
        korpState,
        lifetimeStats: korpState.stats,
      }
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
    includeAuditTraceBonus = false,
  } = {}) => {
    const knownClickCount = runtime.korpState.stats.eventsByType['clickaudit.click'] ?? 0
    const sequence = Math.max(osClickSequenceRef.current, knownClickCount) + 1
    osClickSequenceRef.current = sequence

    const events = createClickAuditInteractionEvents({
      timestamp: Date.now(),
      sequence,
      profile,
      tags,
      bonusUnlocked: includeAuditTraceBonus && runtime.ownedUpgradeIds.includes('sys.audit-batch-standardization'),
    })
    const clickEvent = events[0]
    const clickCount = knownClickCount + 1

    dispatch({
      type: 'dispatchKorpEvents',
      events,
    })
    setLastClickAuditActivity({
      id: clickEvent.id,
      event: clickEvent,
      entry: formatClickAuditActivity(clickEvent, clickCount),
    })

    return { count: clickCount, event: clickEvent }
  }, [runtime.korpState.stats.eventsByType, runtime.ownedUpgradeIds])

  const submitAuditForm = useCallback((formId) => {
    dispatch({ type: 'submitAuditForm', formId, timestamp: Date.now() })
  }, [])

  const resetRuntime = useCallback(() => {
    skipNextPersistenceRef.current = true
    clearRuntimeStorage(getRuntimeStorage())
    dispatch({ type: 'resetRuntime' })
  }, [])

  const isFormAvailable = useCallback((formId) => (
    isAuditFormAvailable(getAuditForm(auditForms, formId), runtime.korpState)
  ), [runtime.korpState])

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

  const value = useMemo(() => ({
    korpState: runtime.korpState,
    stats: runtime.korpState.stats,
    lifetimeStats: runtime.lifetimeStats,
    submittedFormIds: runtime.submittedFormIds,
    ownedUpgradeIds: runtime.ownedUpgradeIds,
    unlockedMemoIds: runtime.unlockedMemoIds,
    unlockedModuleIds: runtime.unlockedModuleIds,
    auditForms,
    dispatchKorpEvent,
    recordOsClick,
    lastClickAuditActivity,
    submitAuditForm,
    isFormAvailable,
    isFormSubmitted,
    isUpgradeUnlocked,
    isMemoUnlocked,
    isModuleUnlocked,
    resetRuntime,
  }), [
    dispatchKorpEvent,
    recordOsClick,
    isFormAvailable,
    isFormSubmitted,
    lastClickAuditActivity,
    isMemoUnlocked,
    isModuleUnlocked,
    isUpgradeUnlocked,
    resetRuntime,
    runtime,
    submitAuditForm,
  ])

  return (
    <KorpRuntimeContext.Provider value={value}>
      {children}
    </KorpRuntimeContext.Provider>
  )
}
