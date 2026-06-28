const REPORT_URL = 'http://127.0.0.1:47891/app-click?source=bloom'
let pending = false

function reportBloomClick() {
  if (pending) return

  pending = true
  window.queueMicrotask(() => {
    fetch(REPORT_URL, { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        pending = false
      })
  })
}

document.addEventListener('pointerdown', reportBloomClick, { capture: true })
