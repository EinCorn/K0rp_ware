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
  capInsets: Object.freeze({ left: 8, right: 8 }),
  opticalClipInsets: Object.freeze({ left: 4, right: 4 }),
})
const frame = Object.freeze({
  capInsets: Object.freeze({ top: 30, right: 8, bottom: 8, left: 8 }),
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

export const KORP_MODULE_WINDOW_METRICS = Object.freeze({
  contentInsets,
  content,
  outer,
  header,
  frame,
  controls,
  outerRect: freezeRect(0, 0, outer.width, outer.height),
  headerRect: freezeRect(0, 0, outer.width, contentRect.y),
  headerAssetRect: freezeRect(0, 0, outer.width, header.height),
  headerViewportRect: freezeRect(
    header.opticalClipInsets.left,
    0,
    outer.width - header.opticalClipInsets.left - header.opticalClipInsets.right,
    header.height,
  ),
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
