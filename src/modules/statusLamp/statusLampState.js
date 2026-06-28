import { readStorage } from '../../core/storage'
import { STATUS_LAMP_STORAGE_KEY, statuses } from './statusLampData'

export function getInitialStatus() {
  const fallbackState = {
    statusId: 'buffering',
    startedAt: Date.now(),
  }

  const savedState = readStorage(STATUS_LAMP_STORAGE_KEY, fallbackState)
  const isKnownStatus = statuses.some((status) => status.id === savedState?.statusId)

  if (!isKnownStatus) {
    return fallbackState
  }

  return savedState
}
