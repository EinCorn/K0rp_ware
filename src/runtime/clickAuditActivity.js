const PROFILE_MESSAGES = {
  'window-drag-handle': 'Pracovní plocha byla přesunuta do vhodnějšího uspořádání.',
  'completed-audit-body': 'Uzavřený audit byl znovu procesně navštíven.',
  'active-audit-field': 'Auditní vstup byl zaznamenán pro místní zpracování.',
  'clickaudit-module': 'ClickAudit přijal další evidovaný úkon.',
  'fidget-module': 'Fidget přijal místní stabilizační interakci.',
  'desktop-icon': 'Zástupce na ploše byl lokálně potvrzen.',
  taskbar: 'Stav okna byl předán taskbaru.',
  'folder-entry': 'Položka složky byla zkontrolována.',
  'window-control': 'Ovládání okna bylo procedurálně potvrzeno.',
  'generic-os': 'Místní pracovní interakce byla zaevidována.',
}

export function formatClickAuditActivity(event, clickCount) {
  if (!event || event.type !== 'clickaudit.click') return null

  const profile = event.meta?.profile
  const message = PROFILE_MESSAGES[profile] ?? PROFILE_MESSAGES['generic-os']
  const safeCount = Number.isFinite(clickCount) && clickCount >= 0 ? Math.floor(clickCount) : 0

  return `#${String(safeCount).padStart(3, '0')} ${message}`
}
