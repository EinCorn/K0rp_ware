const freezeRect = (x, y, width, height) => Object.freeze({ x, y, width, height })

const contentInsets = Object.freeze({
  top: 31,
  right: 8,
  bottom: 25,
  left: 8,
})
const content = Object.freeze({
  width: 167,
  height: 167,
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
const bottomChromeHeight = 8
const footerHeight = contentInsets.bottom - bottomChromeHeight
const outerRect = freezeRect(0, 0, outer.width, outer.height)
const shellRect = outerRect
const headerRect = freezeRect(0, 0, outer.width, contentInsets.top)
const apertureBackingRect = freezeRect(5, 28, 173, 173)
const contentRect = freezeRect(
  contentInsets.left,
  contentInsets.top,
  content.width,
  content.height,
)
const footerRect = freezeRect(
  contentRect.x,
  contentRect.y + contentRect.height,
  contentRect.width,
  footerHeight,
)
const bottomFrameRect = freezeRect(
  0,
  footerRect.y + footerRect.height,
  outer.width,
  bottomChromeHeight,
)
const controlsRect = freezeRect(
  outer.width - controls.right - controlsWidth,
  controls.top,
  controlsWidth,
  controls.height,
)
const titleLeft = contentInsets.left + 9
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
    transparentApertureRect: apertureBackingRect,
  }),
  controls,
  layers,
  outerRect,
  shellRect,
  headerRect,
  apertureBackingRect,
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
    tile: Object.freeze({ width: 32, height: 32, repeat: true }),
    textureRegions: Object.freeze({
      content: 'dark-panel',
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
