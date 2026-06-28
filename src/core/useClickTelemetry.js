import { useEffect } from 'react'
import { recordClick } from './clickStore'

function getTargetLabel(target) {
  if (!target || !(target instanceof Element)) {
    return 'document'
  }

  const tag = target.tagName.toLowerCase()
  const label = target.getAttribute('aria-label') || target.textContent?.trim() || target.className || target.id

  if (!label) {
    return tag
  }

  return `${tag}:${String(label).slice(0, 32)}`
}

export function useClickTelemetry(source) {
  useEffect(() => {
    function handleClick(event) {
      recordClick({
        source,
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        target: getTargetLabel(event.target),
      })
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [source])
}
