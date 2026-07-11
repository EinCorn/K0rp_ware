export function createClickAuditInteractionEvents({
  timestamp,
  sequence,
  bonusUnlocked = false,
  profile = 'clickaudit-module',
}) {
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now()
  const safeSequence = Number.isInteger(sequence) && sequence > 0 ? sequence : 1
  const clickEvent = {
    id: `k0rp-os-clickaudit-${safeTimestamp}-${safeSequence}`,
    timestamp: safeTimestamp,
    sourceModule: 'click-audit',
    type: 'clickaudit.click',
    value: 1,
    tags: ['k0rp-os', 'clickaudit-module', 'manual-confirmation'],
    meta: { profile },
  }

  if (!bonusUnlocked) return [clickEvent]

  return [
    clickEvent,
    {
      id: `k0rp-os-audit-trace-extension-${safeTimestamp}-${safeSequence}`,
      timestamp: safeTimestamp,
      sourceModule: 'system',
      type: 'system.externalWorkPulse',
      value: 0.1,
      tags: ['k0rp-os', 'audit-trace-extension'],
    },
  ]
}
