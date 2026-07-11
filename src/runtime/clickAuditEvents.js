import { createKorpOsClickEvent } from './osClickTracking.js'

export function createClickAuditInteractionEvents({
  timestamp,
  sequence,
  bonusUnlocked = false,
  profile = 'clickaudit-module',
  tags = [],
}) {
  const safeSequence = Number.isInteger(sequence) && sequence > 0 ? sequence : 1
  const clickEvent = createKorpOsClickEvent({
    timestamp,
    sequence: safeSequence,
    profile,
    tags,
  })

  if (!bonusUnlocked) return [clickEvent]

  return [
    clickEvent,
    {
      id: `k0rp-os-audit-trace-extension-${clickEvent.timestamp}-${safeSequence}`,
      timestamp: clickEvent.timestamp,
      sourceModule: 'system',
      type: 'system.externalWorkPulse',
      value: 0.1,
      tags: ['k0rp-os', 'audit-trace-extension'],
    },
  ]
}
