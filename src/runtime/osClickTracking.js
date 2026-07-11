const KNOWN_PROFILES = new Set([
  'audit-form',
  'clickaudit-module',
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

  if (element.closest('[data-clickaudit-manual], [data-window-drag-region], [data-clickaudit-ignore]')) {
    return null
  }

  if (element.closest('[data-window-control]')) return { profile: 'window-control' }
  if (element.closest('.os-taskbar')) return { profile: 'taskbar' }
  if (element.closest('.os-folder-entry')) return { profile: 'folder-entry' }
  if (element.closest('.os-desktop-icon')) return { profile: 'desktop-icon' }
  if (element.closest('.os-shell')) return { profile: 'generic-os' }

  return null
}

export function createKorpOsClickEvent({
  timestamp = Date.now(),
  sequence = 1,
  profile = 'generic-os',
  tags = [],
} = {}) {
  const safeProfile = KNOWN_PROFILES.has(profile) ? profile : 'generic-os'
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
