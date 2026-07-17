import { resolveKorpRuntimeIcon } from '../ui/korpIconCatalog.js'

export const KORP_DESKTOP_ICON_IDS = Object.freeze({
  complianceBin: 'compliance-bin',
  inbox: 'inbox',
  forms: 'forms',
  clickAudit: 'click-audit',
  fidget: 'fidget',
})

export const KORP_FOLDER_ICON_IDS = Object.freeze({
  auditEntry: 'audit-generic',
  auditPacket: 'audit-packet',
  authorizationForm: 'audit-generic',
  evidenceArchive: 'evidence',
  memo: 'memo',
  startupDocument: 'document',
})

export const KORP_VISIBLE_LOCKED_MODULE_ICON_IDS = Object.freeze([
  'corner-watch',
  'bubble-wrap',
])

export function getKorpModuleIconId(moduleId) {
  const icon = resolveKorpRuntimeIcon(moduleId)
  return icon?.group === 'modules' ? icon.id : null
}

export function isKorpDesktopItemActionable({ isLocked = false, onOpen } = {}) {
  return !isLocked && typeof onOpen === 'function'
}
