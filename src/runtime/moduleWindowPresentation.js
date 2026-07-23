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
const header = Object.freeze({
  height: 27,
  assetTop: 1,
  bodyHeight: 24,
  ruleHeight: 3,
  capInsets: Object.freeze({ left: 8, right: 8 }),
  opticalClipInsets: Object.freeze({ left: 4, right: 4 }),
  states: Object.freeze({
    active: Object.freeze({
      bodyAssetId: 'window.header.module.active',
      ruleAssetId: 'window.header.module.active',
    }),
    inactive: Object.freeze({
      bodyAssetId: 'window.header.module.inactive',
      ruleAssetId: 'window.header.module.inactive',
    }),
  }),
})
const frame = Object.freeze({
  capInsets: Object.freeze({ top: 30, right: 8, bottom: 8, left: 8 }),
  topRailHeight: 6,
  headerSeamTop: 28,
})
const controls = Object.freeze({
  count: 3,
  width: 18,
  height: 16,
  top: 6,
  right: 8,
  gap: 2,
})
const controlsWidth = (controls.count * controls.width)
  + ((controls.count - 1) * controls.gap)
const footerHeight = contentInsets.bottom - frame.capInsets.bottom
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
  frame.capInsets.bottom,
)
const controlsRect = freezeRect(
  outer.width - controls.right - controlsWidth,
  controls.top,
  controlsWidth,
  controls.height,
)
const titleLeft = contentInsets.left + 9
const titleControlsGap = 4
const outerRect = freezeRect(0, 0, outer.width, outer.height)
const headerRect = freezeRect(0, 0, outer.width, contentRect.y)
const headerAssetRect = freezeRect(
  0,
  header.assetTop,
  outer.width,
  header.height,
)
const headerViewportRect = freezeRect(
  header.opticalClipInsets.left,
  headerAssetRect.y,
  outer.width - header.opticalClipInsets.left - header.opticalClipInsets.right,
  headerAssetRect.height,
)
const headerBodyRect = freezeRect(
  headerViewportRect.x,
  headerAssetRect.y,
  headerViewportRect.width,
  header.bodyHeight,
)
const headerRuleRect = freezeRect(
  headerViewportRect.x,
  headerBodyRect.y + headerBodyRect.height,
  headerViewportRect.width,
  header.ruleHeight,
)
const headerChromeRect = freezeRect(
  headerRect.x,
  headerRect.y,
  headerRect.width,
  headerRect.height,
)
const frameChromeRects = Object.freeze({
  topRailRect: freezeRect(0, 0, outer.width, frame.topRailHeight),
  leftRailRect: freezeRect(0, 0, frame.capInsets.left, outer.height),
  rightRailRect: freezeRect(
    outer.width - frame.capInsets.right,
    0,
    frame.capInsets.right,
    outer.height,
  ),
  headerSeamRect: freezeRect(
    0,
    frame.headerSeamTop,
    outer.width,
    contentRect.y - frame.headerSeamTop,
  ),
  bottomRailRect: bottomFrameRect,
})
const layers = Object.freeze({
  opaqueBacking: 0,
  shellBackgrounds: 1,
  liveContent: 2,
  frameChrome: 3,
  stateRule: 4,
  interactiveChrome: 5,
})

export const KORP_MODULE_WINDOW_METRICS = Object.freeze({
  contentInsets,
  content,
  outer,
  header,
  frame,
  controls,
  layers,
  outerRect,
  headerRect,
  headerAssetRect,
  headerViewportRect,
  headerBodyRect,
  headerRuleRect,
  headerChromeRect,
  frameChromeRects,
  contentRect,
  footerRect,
  bottomFrameRect,
  controlsRect,
  titleRect: freezeRect(
    titleLeft,
    controls.top,
    controlsRect.x - titleControlsGap - titleLeft,
    controls.height,
  ),
  interiorRect: freezeRect(
    contentRect.x,
    contentRect.y,
    contentRect.width,
    contentRect.height + footerRect.height,
  ),
  surface: Object.freeze({
    hasOpaqueBacking: true,
    backingColor: '#1c1c19',
    footerBackingColor: '#2a2823',
    outlineColor: '#0b0c0b',
    railColor: '#36332d',
    metalColor: '#4e473c',
    tile: Object.freeze({ width: 32, height: 32, repeat: true }),
    textureRegions: Object.freeze({
      content: 'dark-panel',
      footer: null,
    }),
  }),
})

export const KORP_MODULE_WINDOW_SIZE = KORP_MODULE_WINDOW_METRICS.outer

export function getModuleWindowHeaderState(isActive) {
  return isActive ? 'active' : 'inactive'
}

export function getIntegerModuleWindowPreviewPosition(viewportSize) {
  return {
    left: Math.round((viewportSize.width - KORP_MODULE_WINDOW_SIZE.width) / 2),
    top: Math.round((viewportSize.height - KORP_MODULE_WINDOW_SIZE.height) / 2),
  }
}
