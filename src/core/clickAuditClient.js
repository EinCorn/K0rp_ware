const CLICK_AUDIT_BASE_URL = 'http://127.0.0.1:47891'

export async function fetchClickAuditState({ signal } = {}) {
  const response = await fetch(`${CLICK_AUDIT_BASE_URL}/state`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  })

  if (!response.ok) {
    throw new Error(`ClickAudit state request failed: ${response.status}`)
  }

  return response.json()
}

export async function setClickAuditAlwaysOnTop(enabled) {
  const response = await fetch(`${CLICK_AUDIT_BASE_URL}/always-on-top?enabled=${enabled ? 'true' : 'false'}`, {
    method: 'POST',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('ClickAudit pin command failed')
  }

  return response.json()
}
