export const CLICK_AUDIT_PROFILES = new Set([
  'window-drag-handle',
  'completed-audit-body',
  'active-audit-field',
  'clickaudit-module',
  'fidget-module',
  'desktop-icon',
  'taskbar',
  'folder-entry',
  'window-control',
  'generic-os',
])

const asElement = (target) => (
  target && typeof target.closest === 'function' ? target : null
)

export function classifyKorpOsClickTarget(target) {
  const element = asElement(target)
  if (!element) return null

  if (element.closest('[data-clickaudit-ignore]')) return null

  const profileElement = element.closest('[data-clickaudit-profile]')
  const explicitProfile = profileElement?.dataset?.clickauditProfile
    ?? profileElement?.getAttribute?.('data-clickaudit-profile')

  if (CLICK_AUDIT_PROFILES.has(explicitProfile)) return { profile: explicitProfile }

  if (element.closest('[data-window-control]')) return { profile: 'window-control' }
  if (element.closest('.os-taskbar')) return { profile: 'taskbar' }
  if (element.closest('.os-folder-entry')) return { profile: 'folder-entry' }
  if (element.closest('.os-desktop-icon')) return { profile: 'desktop-icon' }
  if (element.closest('.os-shell')) return { profile: 'generic-os' }

  return null
}

export function classifyKorpOsIntentionEvent(eventType, target) {
  if (eventType !== 'pointerdown') return null
  return classifyKorpOsClickTarget(target)
}

export function createKorpOsClickEvent({
  timestamp = Date.now(),
  sequence = 1,
  profile = 'generic-os',
  tags = [],
} = {}) {
  const safeProfile = CLICK_AUDIT_PROFILES.has(profile) ? profile : 'generic-os'
  const safeSequence = Number.isInteger(sequence) && sequence > 0 ? sequence : 1
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now()
  const extraTags = Array.isArray(tags) ? tags.filter(Boolean) : []

  return {
    id: `k0rp-os-${safeProfile}-${safeTimestamp}-${safeSequence}`,
    timestamp: safeTimestamp,
    sourceModule: 'click-audit',
    type: 'clickaudit.click',
    value: 1,
    tags: ['k0rp-os', 'clickaudit-telemetry', safeProfile, ...extraTags],
    meta: { profile: safeProfile },
  }
}
