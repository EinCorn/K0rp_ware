import {
  resolveKorpUiAsset,
  resolveKorpUiWindowFamily,
} from '../ui/korpUiAssetCatalog.js'

const createGeometry = (familyId) => {
  const family = resolveKorpUiWindowFamily(familyId)
  if (!family) throw new Error(`Missing K0rp V3 window family: ${familyId}`)

  const frame = resolveKorpUiAsset(family.frameId)
  if (!frame) throw new Error(`Missing K0rp V3 frame asset: ${family.frameId}`)

  // The runtime ships nearest-neighbour @2x files, but the source package's
  // window metrics are expressed at the native 1x CSS size. Rendering the
  // @2x pixels at their intrinsic bitmap size doubles the material grain and
  // makes the whole chassis look like an enlarged screenshot.
  const density = frame.scale || 1
  const toNative = (value) => value / density
  const width = toNative(family.outerWidth)
  const height = toNative(family.outerHeight)
  const left = toNative(family.contentRect.x)
  const top = toNative(family.contentRect.y)
  const contentWidth = toNative(family.contentRect.width)
  const contentHeight = toNative(family.contentRect.height)
  const right = width - left - contentWidth
  const bottom = height - top - contentHeight

  return Object.freeze({
    width,
    height,
    contentRect: Object.freeze({
      x: left,
      y: top,
      width: contentWidth,
      height: contentHeight,
    }),
    slices: Object.freeze({
      columns: Object.freeze([left, contentWidth, right]),
      rows: Object.freeze([top, contentHeight, bottom]),
    }),
  })
}

// Native source-package geometry; @2x runtime bitmaps are density assets only.
export const KORP_V3_WINDOW_GEOMETRY = Object.freeze({
  audit: createGeometry('audit'),
  folder: createGeometry('folder'),
})

export const KORP_V3_PILOT_WINDOW_IDS = Object.freeze({
  auditEntry: 'form:audit-00-a',
  formsFolder: 'forms-folder',
})

export const KORP_V3_FOLDER_ROW_MATERIAL_ID = 'document.list_row.blank'

const CONTROL_ACTIONS = Object.freeze({
  minimize: Object.freeze({
    semantic: 'minimize',
    keepsWindowOpen: true,
    assetPrefix: 'control.window.minimize',
  }),
  close: Object.freeze({
    semantic: 'close',
    keepsWindowOpen: false,
    assetPrefix: 'control.window.close',
  }),
})

const INTERACTION_STATES = new Set(['normal', 'hover', 'pressed', 'disabled'])

export function getKorpV3WindowGeometry(family) {
  return KORP_V3_WINDOW_GEOMETRY[family] ?? null
}

export function getKorpV3TitlebarAssetId(isActive) {
  return isActive ? 'titlebar.active.blank' : 'titlebar.inactive.blank'
}

export function getKorpV3WindowControlPresentation(action) {
  return CONTROL_ACTIONS[action] ?? null
}

export function getKorpV3WindowControlAssetId(action, state = 'normal') {
  const control = getKorpV3WindowControlPresentation(action)
  if (!control || !INTERACTION_STATES.has(state)) return null
  return `${control.assetPrefix}.${state}`
}

export function getKorpV3CheckboxAssetId({ checked = false, disabled = false } = {}) {
  if (disabled) return 'check.checkbox.disabled'
  return checked ? 'check.checkbox.on' : 'check.checkbox.off'
}

export function getKorpV3AuditButtonAssetId(state = 'normal') {
  return INTERACTION_STATES.has(state) ? `button.audit.${state}` : null
}

export function presentKorpV3FolderRow(entry) {
  if (!entry || typeof entry !== 'object') return null

  return Object.freeze({
    ...entry,
    materialId: KORP_V3_FOLDER_ROW_MATERIAL_ID,
  })
}
