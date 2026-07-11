import { useEffect, useRef, useState } from 'react'
import { applyKorpEvent, createInitialState } from '../../packages/korp-core/src/index'
import { listModules } from '../../packages/korp-modules/src/index'
import './KorpOsShell.css'

const auditMessages = [
  'Auditní stopa byla rozšířena. Účel zůstává předpokládaný.',
  'Přítomnost byla potvrzena bez nutnosti přítomnosti.',
  'Kontrolní úkon přijat. Nevyžadoval kontrolovaný objekt.',
  'Produktivita byla zaznamenána ve vhodně neurčité podobě.',
]

const initialActivity = [
  'Provozní plocha otevřena. Pracovní den nebyl ověřen.',
  'Audit 00-A byl připraven k místnímu zpracování.',
  'Síťové odesílání je pro tuto relaci vypnuto.',
]

const auditTraceApprovalThreshold = 10
const lockedShortcuts = listModules()
  .filter((module) => module.status !== 'current')
  .slice(0, 2)

const managedWindowIds = ['audit-00-a', 'form-10-a', 'daily-report']

const initialWindows = {
  'audit-00-a': {
    id: 'audit-00-a',
    title: 'AUDIT 00-A / CLICK AUDIT',
    taskbarTitle: 'AUDIT 00-A',
    x: 160,
    y: 48,
    zIndex: 2,
    isMinimized: false,
    isOpen: true,
  },
  'form-10-a': {
    id: 'form-10-a',
    title: 'FORMULÁŘE / ŽÁDOST 10-A',
    taskbarTitle: 'ŽÁDOST 10-A',
    x: 760,
    y: 96,
    zIndex: 3,
    isMinimized: false,
    isOpen: true,
  },
  'daily-report': {
    id: 'daily-report',
    title: 'DENNÍ VÝPIS / MÍSTNÍ MEMO',
    taskbarTitle: 'DENNÍ VÝPIS',
    x: 760,
    y: 430,
    zIndex: 1,
    isMinimized: false,
    isOpen: true,
  },
}

function WindowHeader({ window, variant = 'document', onMinimize, onPointerDown }) {
  return (
    <header
      className={'os-window-header os-window-header-' + variant}
      onPointerDown={onPointerDown}
    >
      <span className="os-window-title">{window.title}</span>
      <button
        type="button"
        className="os-window-minimize"
        aria-label={'Minimalizovat okno ' + window.taskbarTitle}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onMinimize(window.id)}
      >
        —
      </button>
    </header>
  )
}

function DesktopIcon({ title, type, status, isLocked = false }) {
  return (
    <div className={'os-desktop-icon' + (isLocked ? ' is-locked' : '')}>
      <span className={'os-icon-glyph os-icon-' + type} aria-hidden="true" />
      <span className="os-icon-label">{title}</span>
      {status && <small>{status}</small>}
    </div>
  )
}

function KorpOsShell() {
  const [korpState, setKorpState] = useState(() => createInitialState({ settings: { platform: 'web' } }))
  const [activity, setActivity] = useState(initialActivity)
  const [feedbackTick, setFeedbackTick] = useState(0)
  const [auditTraceApproved, setAuditTraceApproved] = useState(false)
  const [windows, setWindows] = useState(initialWindows)
  const desktopSpaceRef = useRef(null)
  const dragStateRef = useRef(null)

  const auditClicks = korpState.stats.eventsByType['clickaudit.click'] ?? 0
  const auditTraceAvailable = auditClicks >= auditTraceApprovalThreshold
  const notionalWorkPerAudit = auditTraceApproved ? 0.2 : 0.1
  const formVisible = auditTraceAvailable || auditTraceApproved
  const isWindowAvailable = (id) => id !== 'form-10-a' || formVisible
  const visibleWindowIds = managedWindowIds.filter((id) => (
    isWindowAvailable(id) && windows[id].isOpen && !windows[id].isMinimized
  ))
  const taskbarWindowIds = managedWindowIds.filter((id) => isWindowAvailable(id) && windows[id].isOpen)
  const activeWindowId = visibleWindowIds.reduce((frontmostId, id) => (
    !frontmostId || windows[id].zIndex > windows[frontmostId].zIndex ? id : frontmostId
  ), null)

  useEffect(() => {
    const desktopSpace = desktopSpaceRef.current
    if (!desktopSpace) return

    const rect = desktopSpace.getBoundingClientRect()
    const isCompact = rect.width < 720
    const auditWidth = Math.min(630, rect.width * 0.51)
    const formWidth = Math.min(310, rect.width * 0.29)
    const memoWidth = Math.min(392, rect.width * 0.34)

    setWindows((currentWindows) => ({
      ...currentWindows,
      'audit-00-a': {
        ...currentWindows['audit-00-a'],
        x: isCompact ? 85 : Math.min(160, Math.max(118, rect.width - auditWidth - 20)),
        y: isCompact ? 14 : 48,
      },
      'form-10-a': {
        ...currentWindows['form-10-a'],
        x: isCompact ? 85 : Math.max(142, rect.width - formWidth - Math.min(130, rect.width * 0.1)),
        y: isCompact ? 271 : 96,
      },
      'daily-report': {
        ...currentWindows['daily-report'],
        x: isCompact ? 85 : Math.max(120, rect.width - memoWidth - 40),
        y: isCompact ? Math.max(448, rect.height - 131) : Math.max(300, rect.height - 207),
      },
    }))
  }, [])

  const bringWindowToFront = (id) => {
    setWindows((currentWindows) => {
      const window = currentWindows[id]
      if (!window || !window.isOpen) return currentWindows

      const highestZIndex = Math.max(...Object.values(currentWindows)
        .filter((currentWindow) => currentWindow.isOpen)
        .map((currentWindow) => currentWindow.zIndex))

      return {
        ...currentWindows,
        [id]: { ...window, zIndex: highestZIndex + 1 },
      }
    })
  }

  const minimizeWindow = (id) => {
    setWindows((currentWindows) => ({
      ...currentWindows,
      [id]: { ...currentWindows[id], isMinimized: true },
    }))
  }

  const restoreWindow = (id) => {
    setWindows((currentWindows) => {
      const window = currentWindows[id]
      if (!window || !window.isOpen) return currentWindows

      const highestZIndex = Math.max(...Object.values(currentWindows)
        .filter((currentWindow) => currentWindow.isOpen)
        .map((currentWindow) => currentWindow.zIndex))

      return {
        ...currentWindows,
        [id]: { ...window, isMinimized: false, zIndex: highestZIndex + 1 },
      }
    })
  }

  const startWindowDrag = (id, event) => {
    if (event.button !== 0) return

    const desktopSpace = desktopSpaceRef.current
    const window = windows[id]
    if (!desktopSpace || !window) return

    const desktopRect = desktopSpace.getBoundingClientRect()
    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: event.clientX - desktopRect.left - window.x,
      offsetY: event.clientY - desktopRect.top - window.y,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    event.stopPropagation()
    bringWindowToFront(id)
  }

  const moveWindow = (event) => {
    const dragState = dragStateRef.current
    const desktopSpace = desktopSpaceRef.current
    const windowElement = desktopSpace?.querySelector('[data-window-id="' + dragState?.id + '"]')
    if (!dragState || dragState.pointerId !== event.pointerId || !desktopSpace || !windowElement) return

    const desktopRect = desktopSpace.getBoundingClientRect()
    const windowRect = windowElement.getBoundingClientRect()
    const maximumX = Math.max(0, desktopRect.width - windowRect.width)
    const maximumY = Math.max(0, desktopRect.height - windowRect.height)
    const nextX = Math.min(maximumX, Math.max(0, event.clientX - desktopRect.left - dragState.offsetX))
    const nextY = Math.min(maximumY, Math.max(0, event.clientY - desktopRect.top - dragState.offsetY))

    setWindows((currentWindows) => ({
      ...currentWindows,
      [dragState.id]: { ...currentWindows[dragState.id], x: nextX, y: nextY },
    }))
  }

  const endWindowDrag = (event) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return

    dragStateRef.current = null
  }

  const windowStyle = (window) => ({
    left: window.x,
    top: window.y,
    zIndex: window.zIndex,
  })

  const registerAuditAction = () => {
    const nextClick = auditClicks + 1
    const timestamp = Date.now()

    setKorpState((currentState) => {
      const nextState = applyKorpEvent(currentState, {
        id: 'k0rp-os-clickaudit-' + timestamp + '-' + nextClick,
        timestamp,
        sourceModule: 'click-audit',
        type: 'clickaudit.click',
        value: 1,
        tags: ['k0rp-os', 'manual-audit']
      })

      if (!auditTraceApproved) return nextState

      return applyKorpEvent(nextState, {
        id: 'k0rp-os-audit-trace-extension-' + timestamp + '-' + nextClick,
        timestamp,
        sourceModule: 'system',
        type: 'system.externalWorkPulse',
        value: 0.1,
        tags: ['k0rp-os', 'audit-trace-extension']
      })
    })

    setActivity((currentActivity) => {
      const nextEntries = [
        '#' + String(nextClick).padStart(3, '0') + ' ' + auditMessages[(nextClick - 1) % auditMessages.length],
      ]

      if (nextClick === auditTraceApprovalThreshold) {
        nextEntries.unshift('Formulář 10-A byl doručen do složky Formuláře.')
      }

      return [...nextEntries, ...currentActivity].slice(0, 4)
    })
    setFeedbackTick(nextClick)
  }

  const approveAuditTrace = () => {
    if (!auditTraceAvailable || auditTraceApproved) return

    setAuditTraceApproved(true)
    setActivity((currentActivity) => [
      'Rozšíření auditní stopy bylo schváleno. Výkaz získal další kolonku.',
      'Příští kontrola přítomnosti bude vykázána jako +0.2 NWU.',
      ...currentActivity,
    ].slice(0, 4))
  }

  return (
    <main className="os-shell" aria-label="K0rp_OS pracovní plocha">
      <section className="os-desktop">
        <header className="os-desktop-readout">
          <div className="os-brand" aria-label="K0rp_OS">
            <strong>KØrp_OS</strong>
            <span>BUILD 0.2 / PRACOVNÍ STANICE</span>
          </div>
          <div className="os-session-readout">
            <span className="os-status-lamp" aria-hidden="true" />
            <span>RELACE 01</span>
            <span>EMPLOYEE LOCAL-000</span>
          </div>
        </header>

        <div ref={desktopSpaceRef} className="os-desktop-space">
          <aside className="os-desktop-icons" aria-label="Plocha zaměstnance">
            <DesktopIcon title="Compliance Bin" type="bin" status="SYSTÉMOVÉ" />
            <DesktopIcon
              title="Formuláře"
              type="folder"
              status={formVisible ? '1 NOVÝ SOUBOR' : 'ČEKÁ NA AUDIT'}
              isLocked={!formVisible}
            />
            {lockedShortcuts.map((module) => (
              <DesktopIcon key={module.id} title={module.title} type="app" status="NEINSTALOVÁNO" isLocked />
            ))}
          </aside>

          <section
            className="os-window-layer"
            aria-label="Otevřená okna"
            onPointerMove={moveWindow}
            onPointerUp={endWindowDrag}
            onPointerCancel={endWindowDrag}
          >
            {visibleWindowIds.includes('audit-00-a') && (
              <article
                className="os-window os-audit-window"
                style={windowStyle(windows['audit-00-a'])}
                data-window-id="audit-00-a"
                aria-labelledby="audit-title"
                onPointerDown={() => bringWindowToFront('audit-00-a')}
              >
              <WindowHeader
                window={windows['audit-00-a']}
                variant="audit"
                onMinimize={minimizeWindow}
                onPointerDown={(event) => startWindowDrag('audit-00-a', event)}
              />
              <div className="os-audit-body">
                <div className="os-document-heading">
                  <p>STARTUP PROCEDURA / MÍSTNÍ KONTROLA</p>
                  <h1 id="audit-title">Potvrďte, že něco probíhá.</h1>
                  <span>Jeden úkon vytvoří místní auditní záznam. Žádná data neopouštějí tuto pracovní stanici.</span>
                </div>

                <button type="button" className="os-audit-action" onClick={registerAuditAction}>
                  <span>CLICKAUDIT / MANUÁLNÍ POTVRZENÍ</span>
                  <strong>PROVÉST KONTROLU</strong>
                  <small>NEVYŽADUJE PŘEDMĚT KONTROLY</small>
                </button>

                <div className="os-audit-readout" aria-live="polite">
                  <div><span>ÚKONY V RELACI</span><strong>{String(auditClicks).padStart(3, '0')}</strong></div>
                  <div><span>{auditTraceApproved ? 'PŘÍRŮSTEK NA ÚKON' : 'POSLEDNÍ PŘÍRŮSTEK'}</span><strong key={feedbackTick} className="os-action-feedback">+{notionalWorkPerAudit.toFixed(1)} NWU</strong></div>
                  <div><span>STAV VÝKAZU</span><strong>{auditTraceApproved ? 'ROZŠÍŘENÝ' : 'ŘÁDNĚ NEURČITÝ'}</strong></div>
                </div>
              </div>
              </article>
            )}

            {visibleWindowIds.includes('form-10-a') && (
              <article
                className="os-window os-form-window"
                style={windowStyle(windows['form-10-a'])}
                data-window-id="form-10-a"
                aria-labelledby="approval-title"
                onPointerDown={() => bringWindowToFront('form-10-a')}
              >
                <WindowHeader
                  window={windows['form-10-a']}
                  onMinimize={minimizeWindow}
                  onPointerDown={(event) => startWindowDrag('form-10-a', event)}
                />
                <div className={'os-form-body ' + (auditTraceApproved ? 'is-approved' : 'is-available')}>
                  <p className="os-document-code">POMOCNÝ VÝKAZ PŘÍTOMNOSTI</p>
                  <h2 id="approval-title">Rozšíření auditní stopy</h2>
                  <p>Přidá pomocný výkaz přítomnosti k budoucím kontrolám.</p>
                  {auditTraceApproved ? (
                    <span className="os-approval-state">SCHVÁLENO / AKTIVNÍ<br />+0.2 NWU NA KONTROLU</span>
                  ) : (
                    <button type="button" onClick={approveAuditTrace}>SCHVÁLIT POMOCNÝ VÝKAZ</button>
                  )}
                </div>
              </article>
            )}

            {visibleWindowIds.includes('daily-report') && (
              <article
                className="os-window os-log-window"
                style={windowStyle(windows['daily-report'])}
                data-window-id="daily-report"
                aria-labelledby="activity-title"
                onPointerDown={() => bringWindowToFront('daily-report')}
              >
              <WindowHeader
                window={windows['daily-report']}
                onMinimize={minimizeWindow}
                onPointerDown={(event) => startWindowDrag('daily-report', event)}
              />
              <div className="os-log-body">
                <div>
                  <p className="os-document-code">POSLEDNÍ DOKLADY ČINNOSTI</p>
                  <h2 id="activity-title">Denní výpis</h2>
                </div>
                <ol>
                  {activity.slice(0, 3).map((entry, index) => <li key={entry + '-' + index}>{entry}</li>)}
                </ol>
              </div>
              </article>
            )}
          </section>

          <p className="os-wallpaper-mark" aria-hidden="true">KØRP<br />INTERNAL<br />OPERATIONS</p>
        </div>

        <footer className="os-taskbar">
          <span className="os-taskbar-start">KØRP // START</span>
          {taskbarWindowIds.map((id) => {
            const window = windows[id]
            return (
              <button
                key={id}
                type="button"
                className={'os-taskbar-window' + (window.isMinimized ? ' is-minimized' : '') + (id === activeWindowId ? ' is-active' : '')}
                aria-pressed={id === activeWindowId}
                aria-label={(window.isMinimized ? 'Obnovit okno ' : 'Přenést dopředu okno ') + window.taskbarTitle}
                onClick={() => restoreWindow(id)}
              >
                {window.taskbarTitle}
              </button>
            )
          })}
          <span className="os-taskbar-resource os-taskbar-resource-nwu">NWU {korpState.resources.notionalWorkUnits.toFixed(1)}</span>
          <span className="os-taskbar-resource os-taskbar-resource-ap">AP {korpState.resources.auditPressure.toFixed(0)}</span>
          <span className="os-taskbar-resource os-taskbar-resource-ci">CI {korpState.resources.complianceIntegrity.toFixed(0)}</span>
          <span className="os-taskbar-privacy">PRIVACY: LOCAL ONLY</span>
          <span>10:00 / RELACE 01</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
