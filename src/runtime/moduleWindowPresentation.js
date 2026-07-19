export const KORP_MODULE_WINDOW_METRICS = Object.freeze({
  contentInsets: Object.freeze({
    top: 31,
    right: 8,
    bottom: 25,
    left: 8,
  }),
  content: Object.freeze({
    width: 167,
    height: 167,
  }),
  outer: Object.freeze({
    width: 183,
    height: 223,
  }),
  header: Object.freeze({
    height: 27,
    capInsets: Object.freeze({ left: 8, right: 8 }),
  }),
  frame: Object.freeze({
    capInsets: Object.freeze({ top: 30, right: 8, bottom: 8, left: 8 }),
  }),
  controls: Object.freeze({
    width: 18,
    height: 16,
    top: 6,
    right: 8,
    gap: 2,
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
