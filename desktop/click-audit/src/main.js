import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import './styles.css'

const app = document.querySelector('#app')

const state = {
  app: 'click-audit',
  running: false,
  globalClicks: 0,
  startedAtUnixMs: null,
  alwaysOnTop: false,
  privacyMode: 'aggregate-only',
}

app.innerHTML = `
  <section class="shell">
    <header class="window-header">
      <div class="window-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>K0rp_ware / ClickAudit</p>
    </header>

    <section class="body">
      <p class="system-label">Aggregate input telemetry</p>
      <h1 id="counter">0</h1>
      <p class="description">Global mouse clicks counted locally. No coordinates. No window names. No keyboard.</p>

      <div class="readout-grid">
        <div class="readout-card">
          <span>Status</span>
          <strong id="running">Paused</strong>
        </div>
        <div class="readout-card">
          <span>Always on top</span>
          <strong id="top">Off</strong>
        </div>
      </div>

      <div class="controls">
        <button id="start" type="button">Start</button>
        <button id="pause" type="button">Pause</button>
        <button id="reset" type="button">Reset</button>
        <button id="pin" type="button">Pin</button>
      </div>

      <p class="api-note">Local API: <code>127.0.0.1:47891/state</code></p>
    </section>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  running: document.querySelector('#running'),
  top: document.querySelector('#top'),
  start: document.querySelector('#start'),
  pause: document.querySelector('#pause'),
  reset: document.querySelector('#reset'),
  pin: document.querySelector('#pin'),
}

function render(nextState) {
  Object.assign(state, nextState)

  elements.counter.textContent = state.globalClicks.toLocaleString('en-US')
  elements.running.textContent = state.running ? 'Counting' : 'Paused'
  elements.top.textContent = state.alwaysOnTop ? 'On' : 'Off'
  elements.pin.textContent = state.alwaysOnTop ? 'Unpin' : 'Pin'
  document.body.dataset.running = state.running ? 'true' : 'false'
}

async function refresh() {
  render(await invoke('get_state'))
}

elements.start.addEventListener('click', async () => render(await invoke('start_counting')))
elements.pause.addEventListener('click', async () => render(await invoke('pause_counting')))
elements.reset.addEventListener('click', async () => render(await invoke('reset_counting')))
elements.pin.addEventListener('click', async () => {
  render(await invoke('set_always_on_top', { enabled: !state.alwaysOnTop }))
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
