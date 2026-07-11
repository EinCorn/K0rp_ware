import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
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
  const skipNextPersistenceRef = useRef(false)

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

  const value = useMemo(() => ({
    korpState: runtime.korpState,
    stats: runtime.korpState.stats,
    lifetimeStats: runtime.lifetimeStats,
    submittedFormIds: runtime.submittedFormIds,
    ownedUpgradeIds: runtime.ownedUpgradeIds,
    unlockedMemoIds: runtime.unlockedMemoIds,
    auditForms,
    dispatchKorpEvent,
    submitAuditForm,
    isFormAvailable,
    isFormSubmitted,
    isUpgradeUnlocked,
    isMemoUnlocked,
    resetRuntime,
  }), [
    dispatchKorpEvent,
    isFormAvailable,
    isFormSubmitted,
    isMemoUnlocked,
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
