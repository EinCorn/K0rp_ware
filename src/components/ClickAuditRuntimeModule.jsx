import { useEffect, useRef } from 'react'
import { createClickAuditInteractionEvents } from '../runtime/clickAuditEvents'
import { useKorpRuntime } from '../runtime/useKorpRuntime'
import ClickAuditModule from './ClickAuditModule'

const AUDIT_TRACE_UPGRADE_ID = 'sys.audit-batch-standardization'

export default function ClickAuditRuntimeModule({ onRecorded, interactive = true }) {
  const {
    stats,
    dispatchKorpEvent,
    isUpgradeUnlocked,
  } = useKorpRuntime()
  const clickCount = stats.eventsByType['clickaudit.click'] ?? 0
  const sequenceRef = useRef(clickCount)
  const bonusUnlocked = isUpgradeUnlocked(AUDIT_TRACE_UPGRADE_ID)

  useEffect(() => {
    sequenceRef.current = Math.max(sequenceRef.current, clickCount)
  }, [clickCount])

  const recordClick = () => {
    const timestamp = Date.now()
    const nextSequence = sequenceRef.current + 1
    sequenceRef.current = nextSequence

    createClickAuditInteractionEvents({
      timestamp,
      sequence: nextSequence,
      bonusUnlocked,
    }).forEach(dispatchKorpEvent)

    onRecorded?.({
      count: nextSequence,
      notionalWorkUnits: bonusUnlocked ? 0.2 : 0.1,
    })

    return nextSequence
  }

  return (
    <ClickAuditModule
      clickCount={clickCount}
      onRecord={recordClick}
      interactive={interactive}
    />
  )
}
