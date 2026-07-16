import { createKorpOsClickEvent } from './osClickTracking.js'

export function createClickAuditInteractionEvents({
  timestamp,
  sequence,
  profile = 'clickaudit-module',
  tags = [],
}) {
  const safeSequence = Number.isInteger(sequence) && sequence > 0 ? sequence : 1

  return [createKorpOsClickEvent({
    timestamp,
    sequence: safeSequence,
    profile,
    tags,
  })]
}
