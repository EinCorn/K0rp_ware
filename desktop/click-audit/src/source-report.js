import { invoke } from '@tauri-apps/api/core'
import './fill.css'

function reportClickAuditClick() {
  invoke('report_app_click', { source: 'click-audit' })
    .then((snapshot) => {
      window.dispatchEvent(new CustomEvent('k0rp-click-audit:snapshot', { detail: snapshot }))
    })
    .catch(() => {})
}

document.addEventListener('pointerdown', reportClickAuditClick, { capture: true })
