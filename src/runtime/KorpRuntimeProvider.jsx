import { useCallback, useMemo, useReducer } from 'react'
import { applyKorpEvent, createInitialState } from '../../packages/korp-core/src/index'
import { KorpRuntimeContext } from './KorpRuntimeContext'

const createRuntimeState = () => {
  const korpState = createInitialState({ settings: { platform: 'web' } })

  return {
    korpState,
    lifetimeStats: korpState.stats,
    auditTraceApproved: false,
  }
}

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
    case 'approveAuditTrace':
      return runtime.auditTraceApproved
        ? runtime
        : { ...runtime, auditTraceApproved: true }
    case 'resetRuntime':
      return createRuntimeState()
    default:
      return runtime
  }
}

export function KorpRuntimeProvider({ children }) {
  const [runtime, dispatch] = useReducer(runtimeReducer, undefined, createRuntimeState)

  const dispatchKorpEvent = useCallback((event) => {
    dispatch({ type: 'dispatchKorpEvent', event })
  }, [])

  const approveAuditTrace = useCallback(() => {
    dispatch({ type: 'approveAuditTrace' })
  }, [])

  const resetRuntime = useCallback(() => {
    dispatch({ type: 'resetRuntime' })
  }, [])

  const value = useMemo(() => ({
    korpState: runtime.korpState,
    stats: runtime.korpState.stats,
    lifetimeStats: runtime.lifetimeStats,
    auditTraceApproved: runtime.auditTraceApproved,
    dispatchKorpEvent,
    approveAuditTrace,
    resetRuntime,
  }), [approveAuditTrace, dispatchKorpEvent, resetRuntime, runtime])

  return (
    <KorpRuntimeContext.Provider value={value}>
      {children}
    </KorpRuntimeContext.Provider>
  )
}
