import { invoke } from '@tauri-apps/api/core'

function reportClickAuditClick() {
  invoke('report_app_click', { source: 'click-audit' }).catch(() => {})
}

document.addEventListener('pointerdown', reportClickAuditClick, { capture: true })
