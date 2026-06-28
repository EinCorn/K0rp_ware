import { publishEvent } from './eventBus'
import { readStorage, writeStorage } from './storage'

export const CLICK_STORE_KEY = 'k0rp-ware.click-audit.state'

const RECENT_LIMIT = 80

export function createClickState() {
  const now = new Date().toISOString()

  return {
    total: 0,
    bySource: {},
    recentClicks: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function getClickState() {
  const savedState = readStorage(CLICK_STORE_KEY, createClickState())

  return {
    ...createClickState(),
    ...savedState,
    bySource: savedState?.bySource ?? {},
    recentClicks: savedState?.recentClicks ?? [],
  }
}

export function recordClick({ source = 'unknown', x = 0, y = 0, target = 'document' } = {}) {
  const state = getClickState()
  const createdAt = new Date().toISOString()
  const click = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    source,
    x,
    y,
    target,
    createdAt,
  }

  const nextState = {
    ...state,
    total: state.total + 1,
    bySource: {
      ...state.bySource,
      [source]: (state.bySource[source] ?? 0) + 1,
    },
    recentClicks: [click, ...state.recentClicks].slice(0, RECENT_LIMIT),
    updatedAt: createdAt,
  }

  writeStorage(CLICK_STORE_KEY, nextState)
  publishEvent('input:click-recorded', { click, state: nextState })

  return nextState
}

export function resetClickState() {
  const nextState = createClickState()
  writeStorage(CLICK_STORE_KEY, nextState)
  publishEvent('input:click-reset', { state: nextState })
  return nextState
}
