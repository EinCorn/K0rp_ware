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
  states: Object.freeze({
    active: Object.freeze({
      mode: 'authored',
    }),
    inactive: Object.freeze({
      mode: 'replacement',
      fillColor: '#4e473c',
    }),
  }),
})
const frameOpticalCropInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
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
const stateStripRect = freezeRect(4, 25, 175, 3)
const headerSeamRect = freezeRect(
  contentRect.x,
  frame.capInsets.top,
  contentRect.width,
  contentRect.y - frame.capInsets.top,
)
const frameViewportRect = outerRect
const frameRailRects = Object.freeze({
  topRailRect: freezeRect(
    outerRect.x,
    outerRect.y,
    outerRect.width,
    frame.topRailHeight,
  ),
  leftRailRect: freezeRect(
    outerRect.x,
    outerRect.y,
    frame.capInsets.left,
    outerRect.height,
  ),
  rightRailRect: freezeRect(
    contentRect.x + contentRect.width,
    outerRect.y,
    frame.capInsets.right,
    outerRect.height,
  ),
  bottomRailRect: freezeRect(
    outerRect.x,
    bottomFrameRect.y,
    outerRect.width,
    frame.capInsets.bottom,
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
  frameChrome: 3,
  stateStrip: 4,
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
  stateStripRect,
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
