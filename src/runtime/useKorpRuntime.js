import { useContext } from 'react'
import { KorpRuntimeContext } from './KorpRuntimeContext'

export function useKorpRuntime() {
  const runtime = useContext(KorpRuntimeContext)

  if (!runtime) {
    throw new Error('useKorpRuntime must be used within KorpRuntimeProvider')
  }

  return runtime
}
