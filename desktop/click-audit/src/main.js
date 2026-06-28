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
    <header class="window-header">
      <div class="window-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>K0rp_ware / ClickAudit</p>
    </header>

    <section class="body">
      <h1 id="counter">0</h1>
      <button id="pin" type="button">Pin</button>
    </section>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  pin: document.querySelector('#pin'),
}

function render(nextState) {
  Object.assign(state, nextState)

  elements.counter.textContent = state.globalClicks.toLocaleString('en-US')
  elements.pin.textContent = state.alwaysOnTop ? 'Unpin' : 'Pin'
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
}

async function refresh() {
  render(await invoke('get_state'))
}

elements.pin.addEventListener('click', async () => {
  render(await invoke('set_always_on_top', { enabled: !state.alwaysOnTop }))
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
