export const CLICK_AUDIT_PROGRESS_TARGET = 2_500

export function normalizeClickCount(value) {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.floor(value)
}

export function getClickAuditDigits(value) {
  return String(normalizeClickCount(value)).split('').map((digit) => Number.parseInt(digit, 10))
}

export function getClickAuditDeckSize(digitCount) {
  if (digitCount <= 3) return 'standard'
  if (digitCount <= 6) return 'compact'
  if (digitCount <= 9) return 'dense'
  return 'micro'
}

export function getClickAuditProgress(value, target = CLICK_AUDIT_PROGRESS_TARGET) {
  const clicks = normalizeClickCount(value)
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.min(clicks / target, 1)
}

export function getClickAuditProgressColor(value, target = CLICK_AUDIT_PROGRESS_TARGET) {
  const progress = getClickAuditProgress(value, target)
  const hue = progress * 280
  const saturation = Math.min(progress * 130, 100)
  const lightness = 94 - progress * 28

  return `hsl(${hue.toFixed(2)} ${saturation.toFixed(2)}% ${lightness.toFixed(2)}%)`
}
