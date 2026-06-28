import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import './styles.css'

const app = document.querySelector('#app')

const state = {
  app: 'click-audit',
  running: true,
  globalClicks: 0,
  startedAtUnixMs: null,
  alwaysOnTop: false,
  privacyMode: 'aggregate-only',
}

app.innerHTML = `
  <section class="shell">
    <button id="pin" class="pin-button" type="button" aria-label="Pin window" title="Pin window">⌖</button>
    <h1 id="counter">0</h1>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  pin: document.querySelector('#pin'),
}

function render(nextState) {
  Object.assign(state, nextState)

  elements.counter.textContent = state.globalClicks.toLocaleString('en-US')
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
  elements.pin.setAttribute('title', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
}

async function refresh() {
  render(await invoke('get_state'))
}

elements.pin.addEventListener('click', async () => {
  render(await invoke('set_always_on_top', { enabled: !state.alwaysOnTop }))
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
