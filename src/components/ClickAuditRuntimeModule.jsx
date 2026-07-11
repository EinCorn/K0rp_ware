import { useKorpRuntime } from '../runtime/useKorpRuntime'
import ClickAuditModule from './ClickAuditModule'

export default function ClickAuditRuntimeModule({ centralizedTracking = false, interactive = true }) {
  const {
    stats,
    recordOsClick,
  } = useKorpRuntime()
  const clickCount = stats.eventsByType['clickaudit.click'] ?? 0

  const recordClick = () => {
    if (centralizedTracking) return undefined

    return recordOsClick({
      profile: 'clickaudit-module',
      tags: ['manual-confirmation'],
      includeAuditTraceBonus: true,
    })
  }

  return (
    <ClickAuditModule
      clickCount={clickCount}
      onRecord={centralizedTracking ? undefined : recordClick}
      interactive={interactive}
    />
  )
}
