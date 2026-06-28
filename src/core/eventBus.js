const CHANNEL_NAME = 'k0rp-ware.events'

let channel

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') {
    return null
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }

  return channel
}

export function publishEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    source: 'k0rp-ware',
    createdAt: new Date().toISOString(),
  }

  getChannel()?.postMessage(event)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANNEL_NAME, { detail: event }))
  }
}

export function subscribeToEvents(handler) {
  const activeChannel = getChannel()

  function handleBroadcast(event) {
    handler(event.data)
  }

  function handleWindowEvent(event) {
    handler(event.detail)
  }

  activeChannel?.addEventListener('message', handleBroadcast)

  if (typeof window !== 'undefined') {
    window.addEventListener(CHANNEL_NAME, handleWindowEvent)
  }

  return () => {
    activeChannel?.removeEventListener('message', handleBroadcast)

    if (typeof window !== 'undefined') {
      window.removeEventListener(CHANNEL_NAME, handleWindowEvent)
    }
  }
}
