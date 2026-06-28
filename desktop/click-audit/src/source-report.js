import { invoke } from '@tauri-apps/api/core'

let pending = false

function reportClickAuditClick() {
  if (pending) return

  pending = true
  window.queueMicrotask(() => {
    invoke('report_app_click', { source: 'click-audit' })
      .catch(() => {})
      .finally(() => {
        pending = false
      })
  })
}

document.addEventListener('pointerdown', reportClickAuditClick, { capture: true })
