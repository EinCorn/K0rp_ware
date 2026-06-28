const REPORT_URL = 'http://127.0.0.1:47891/app-click?source=fidget'
let pending = false

function reportFidgetClick() {
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

document.addEventListener('pointerdown', reportFidgetClick, { capture: true })
