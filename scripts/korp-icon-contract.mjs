export const KORP_ICON_RAW_ROOT = 'design/icon-source/k0rp-icons-v2'
export const KORP_ICON_RUNTIME_ROOT = 'src/assets/icons/korp-v2'
export const KORP_ICON_CATALOG_PATH = 'src/ui/korpIconCatalog.js'

export const KORP_RUNTIME_ICON_SELECTIONS = Object.freeze([
  { id: 'compliance-bin', slots: ['desktop'], intendedSize: 40 },
  { id: 'inbox', slots: ['desktop'], intendedSize: 40 },
  { id: 'forms', slots: ['desktop'], intendedSize: 40 },
  { id: 'click-audit', slots: ['desktop'], intendedSize: 40 },
  { id: 'fidget', slots: ['desktop'], intendedSize: 40 },
  { id: 'corner-watch', slots: ['desktop'], intendedSize: 40 },
  { id: 'bubble-wrap', slots: ['desktop'], intendedSize: 40 },
  { id: 'audit-packet', slots: ['folder-entry'], intendedSize: 30 },
  { id: 'audit-generic', slots: ['folder-entry'], intendedSize: 30 },
  { id: 'evidence', slots: ['folder-entry'], intendedSize: 30 },
  { id: 'memo', slots: ['folder-entry'], intendedSize: 30 },
  { id: 'document', slots: ['folder-entry'], intendedSize: 30 },
])

// Keep this acceptance list independent from the runtime selections. If a
// selection is removed accidentally, validation must still fail closed.
export const KORP_REQUIRED_CURRENT_ICON_IDS = Object.freeze([
  'compliance-bin',
  'inbox',
  'forms',
  'click-audit',
  'fidget',
  'corner-watch',
  'bubble-wrap',
  'audit-packet',
  'audit-generic',
  'evidence',
  'memo',
  'document',
])
