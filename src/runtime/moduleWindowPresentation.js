const freezeRect = (x, y, width, height) => Object.freeze({ x, y, width, height })
const expandRect = (rect, amount) => freezeRect(
  rect.x - amount,
  rect.y - amount,
  rect.width + (amount * 2),
  rect.height + (amount * 2),
)

const contentInsets = Object.freeze({
  top: 28,
  right: 5,
  bottom: 22,
  left: 5,
})
const content = Object.freeze({
  width: 173,
  height: 173,
})
const outer = Object.freeze({
  width: content.width + contentInsets.left + contentInsets.right,
  height: content.height + contentInsets.top + contentInsets.bottom,
})
const shell = Object.freeze({
  classification: 'fixed',
  nativeScale: 1,
  assetIds: Object.freeze({
    active: 'window.module.compact.active',
    inactive: 'window.module.compact.inactive',
  }),
})
const controls = Object.freeze({
  count: 3,
  width: 18,
  height: 16,
  top: 5,
  right: 5,
  gap: 2,
})
const controlsWidth = (controls.count * controls.width)
  + ((controls.count - 1) * controls.gap)
const outerRect = freezeRect(0, 0, outer.width, outer.height)
const shellRect = outerRect
const headerRect = freezeRect(0, 0, 183, 31)
const contentRect = freezeRect(
  contentInsets.left,
  contentInsets.top,
  content.width,
  content.height,
)
const apertureUnderlayExpansion = 1
const apertureUnderlayRect = expandRect(contentRect, apertureUnderlayExpansion)
const footerRect = freezeRect(8, 198, 167, 17)
const bottomFrameRect = freezeRect(0, 215, 183, 8)
const controlsRect = freezeRect(
  outer.width - controls.right - controlsWidth,
  controls.top,
  controlsWidth,
  controls.height,
)
const titleLeft = 17
const titleTop = 6
const titleControlsGap = 4
const footerSafeRect = freezeRect(
  footerRect.x,
  footerRect.y + 1,
  footerRect.width,
  footerRect.height - 1,
)
const footerControlSize = 16
const footerControlLeftInset = 4
const footerControlRect = freezeRect(
  footerSafeRect.x + footerControlLeftInset,
  footerSafeRect.y,
  footerControlSize,
  footerControlSize,
)
const layers = Object.freeze({
  opaqueBacking: 0,
  shellBackgrounds: 1,
  liveContent: 2,
  fixedShell: 3,
  interactiveChrome: 4,
})

export const KORP_MODULE_WINDOW_METRICS = Object.freeze({
  contentInsets,
  content,
  outer,
  shell: Object.freeze({
    ...shell,
    rect: shellRect,
    transparentApertureRect: contentRect,
  }),
  controls,
  layers,
  outerRect,
  shellRect,
  headerRect,
  apertureUnderlayExpansion,
  apertureUnderlayRect,
  contentRect,
  footerRect,
  footerSafeRect,
  footerControlRect,
  bottomFrameRect,
  controlsRect,
  titleRect: freezeRect(
    titleLeft,
    titleTop,
    controlsRect.x - titleControlsGap - titleLeft,
    controls.height,
  ),
  surface: Object.freeze({
    hasOpaqueBacking: true,
    interiorBackingColor: '#1c1c19',
    backingColor: '#1c1c19',
    tile: Object.freeze({
      width: 32,
      height: 32,
      repeat: true,
      originOffset: Object.freeze({
        x: contentRect.x - apertureUnderlayRect.x,
        y: contentRect.y - apertureUnderlayRect.y,
      }),
    }),
    textureRegions: Object.freeze({
      apertureUnderlay: 'dark-panel',
      footer: null,
    }),
  }),
})

export const KORP_MODULE_WINDOW_SIZE = KORP_MODULE_WINDOW_METRICS.outer

export function getModuleWindowShellState(isActive) {
  return isActive ? 'active' : 'inactive'
}

export function getIntegerModuleWindowPreviewPosition(viewportSize) {
  return {
    left: Math.round((viewportSize.width - KORP_MODULE_WINDOW_SIZE.width) / 2),
    top: Math.round((viewportSize.height - KORP_MODULE_WINDOW_SIZE.height) / 2),
  }
}
