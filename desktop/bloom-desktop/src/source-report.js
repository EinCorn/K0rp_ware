const REPORT_URL = 'http://127.0.0.1:47891/app-click?source=bloom'

function reportBloomClick() {
  fetch(REPORT_URL, { method: 'POST' }).catch(() => {})
}

document.addEventListener('pointerdown', reportBloomClick, { capture: true })
