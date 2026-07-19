import { FIDGET_MODES } from './fidgetMotion.js'

const KNOWN_MODES = new Set(Object.values(FIDGET_MODES))

export function createFidgetSessionSettledEvent(payload = {}, timestamp = Date.now()) {
  const sequence = Number.isInteger(payload.sequence) && payload.sequence > 0
    ? payload.sequence
    : 1
  const mode = KNOWN_MODES.has(payload.mode) ? payload.mode : FIDGET_MODES.manual
  const source = 'manual'
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now()

  return {
    id: `k0rp-os-fidget-session-settled-${safeTimestamp}-${sequence}`,
    timestamp: safeTimestamp,
    sourceModule: 'fidget',
    type: 'fidget.sessionSettled',
    value: 1,
    tags: ['k0rp-os', 'metric-closure', 'fidget', 'manual'],
    meta: { sequence, mode, source },
  }
}
