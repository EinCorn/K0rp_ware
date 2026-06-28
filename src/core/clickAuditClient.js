const CLICK_AUDIT_BASE_URL = 'http://127.0.0.1:47891'

export async function fetchClickAuditState({ signal } = {}) {
  const response = await fetch(`${CLICK_AUDIT_BASE_URL}/state`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error(`ClickAudit state request failed: ${response.status}`)
  }

  return response.json()
}

export async function sendClickAuditCommand(command, payload = {}) {
  const endpoint = getCommandEndpoint(command, payload)
  const response = await fetch(`${CLICK_AUDIT_BASE_URL}${endpoint}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`ClickAudit command failed: ${command}`)
  }

  return response.json()
}

function getCommandEndpoint(command, payload) {
  switch (command) {
    case 'start':
      return '/start'
    case 'pause':
      return '/pause'
    case 'reset':
      return '/reset'
    case 'always-on-top':
      return `/always-on-top?enabled=${payload.enabled ? 'true' : 'false'}`
    default:
      throw new Error(`Unknown ClickAudit command: ${command}`)
  }
}
