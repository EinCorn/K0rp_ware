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
  rule: Object.freeze({
    top: 25,
    height: 3,
    assetTop: 1,
    assetHeight: 27,
    capInsets: Object.freeze({ left: 8, right: 8 }),
    opticalInsets: Object.freeze({ left: 4, right: 4 }),
  }),
  states: Object.freeze({
    active: Object.freeze({
      ruleAssetId: 'window.header.module.active',
    }),
    inactive: Object.freeze({
      ruleAssetId: 'window.header.module.inactive',
    }),
  }),
})
const frameOpticalCropInsets = Object.freeze({
  top: 2,
  right: 3,
  bottom: 3,
  left: 3,
})
const frame = Object.freeze({
  assetId: 'window.module.nine-slice',
  capInsets: Object.freeze({ top: 30, right: 8, bottom: 8, left: 8 }),
  opticalCropInsets: frameOpticalCropInsets,
  topRailHeight: 6,
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
const headerRuleAssetRect = freezeRect(
  0,
  header.rule.assetTop,
  outer.width,
  header.rule.assetHeight,
)
const headerRuleRect = freezeRect(
  header.rule.opticalInsets.left,
  header.rule.top,
  outer.width - header.rule.opticalInsets.left - header.rule.opticalInsets.right,
  header.rule.height,
)
const headerSeamRect = freezeRect(
  contentRect.x,
  frame.capInsets.top,
  contentRect.width,
  contentRect.y - frame.capInsets.top,
)
const frameViewportRect = freezeRect(
  frame.opticalCropInsets.left,
  frame.opticalCropInsets.top,
  outer.width - frame.opticalCropInsets.left - frame.opticalCropInsets.right,
  outer.height - frame.opticalCropInsets.top - frame.opticalCropInsets.bottom,
)
const frameRailRects = Object.freeze({
  topRailRect: freezeRect(
    frameViewportRect.x,
    frameViewportRect.y,
    frameViewportRect.width,
    frame.topRailHeight - frameViewportRect.y,
  ),
  leftRailRect: freezeRect(
    frameViewportRect.x,
    frameViewportRect.y,
    contentRect.x - frameViewportRect.x,
    frameViewportRect.height,
  ),
  rightRailRect: freezeRect(
    contentRect.x + contentRect.width,
    frameViewportRect.y,
    frameViewportRect.x + frameViewportRect.width
      - contentRect.x - contentRect.width,
    frameViewportRect.height,
  ),
  bottomRailRect: freezeRect(
    frameViewportRect.x,
    bottomFrameRect.y,
    frameViewportRect.width,
    frameViewportRect.y + frameViewportRect.height - bottomFrameRect.y,
  ),
})
const interiorBackingRect = freezeRect(
  contentRect.x,
  frame.topRailHeight,
  contentRect.width,
  bottomFrameRect.y - frame.topRailHeight,
)
const footerSafeRect = freezeRect(
  footerRect.x,
  footerRect.y + 1,
  footerRect.width,
  footerRect.height - 1,
)
const footerControlSize = 16
const footerControlRect = freezeRect(
  footerSafeRect.x + Math.round((footerSafeRect.width - footerControlSize) / 2),
  footerSafeRect.y,
  footerControlSize,
  footerControlSize,
)
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
  headerRuleAssetRect,
  headerRuleRect,
  headerSeamRect,
  frameOpticalCropInsets,
  frameViewportRect,
  frameRailRects,
  interiorBackingRect,
  contentRect,
  footerRect,
  footerSafeRect,
  footerControlRect,
  bottomFrameRect,
  controlsRect,
  titleRect: freezeRect(
    titleLeft,
    controls.top,
    controlsRect.x - titleControlsGap - titleLeft,
    controls.height,
  ),
  surface: Object.freeze({
    hasOpaqueBacking: true,
    interiorBackingColor: '#1c1c19',
    backingColor: '#1c1c19',
    footerBackingColor: '#2a2823',
    shellOutlineColor: '#0b0c0b',
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
