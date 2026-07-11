import { useEffect, useRef, useState } from 'react'
import { listModules } from '../../packages/korp-modules/src/index'
import { useKorpRuntime } from '../runtime/useKorpRuntime'
import './KorpOsShell.css'

const auditMessages = [
  'Auditní stopa byla rozšířena. Účel zůstává předpokládaný.',
  'Přítomnost byla potvrzena bez nutnosti přítomnosti.',
  'Kontrolní úkon přijat. Nevyžadoval kontrolovaný objekt.',
  'Produktivita byla zaznamenána ve vhodně neurčité podobě.',
]

const initialActivity = (auditEntryForm) => [
  'Provozní plocha otevřena. Pracovní den nebyl ověřen.',
  'Audit ' + (auditEntryForm?.code ?? '?') + ' byl připraven k místnímu zpracování.',
  'Síťové odesílání je pro tuto relaci vypnuto.',
]

const osCanvasWidth = 1520
const osCanvasHeight = 855
const lockedShortcuts = listModules()
  .filter((module) => module.status !== 'current')
  .slice(0, 2)

const managedWindowIds = ['audit-entry', 'audit-trace', 'daily-report', 'forms-folder', 'inbox-folder']

const initialWindows = {
  'audit-entry': {
    id: 'audit-entry',
    title: null,
    taskbarTitle: null,
    x: 160,
    y: 48,
    zIndex: 2,
    isMinimized: false,
    isOpen: true,
  },
  'audit-trace': {
    id: 'audit-trace',
    title: null,
    taskbarTitle: null,
    x: 1072,
    y: 96,
    zIndex: 3,
    isMinimized: false,
    isOpen: true,
  },
  'daily-report': {
    id: 'daily-report',
    title: 'DENNÍ VÝPIS / MÍSTNÍ MEMO',
    taskbarTitle: 'DENNÍ VÝPIS',
    x: 1082,
    y: 569,
    zIndex: 1,
    isMinimized: false,
    isOpen: true,
  },
  'forms-folder': {
    id: 'forms-folder',
    title: 'FORMULÁŘE / SLOŽKA',
    taskbarTitle: 'FORMULÁŘE',
    x: 1024,
    y: 118,
    zIndex: 0,
    isMinimized: false,
    isOpen: false,
  },
  'inbox-folder': {
    id: 'inbox-folder',
    title: 'DORUČENÉ / SLOŽKA',
    taskbarTitle: 'DORUČENÉ',
    x: 1102,
    y: 471,
    zIndex: 0,
    isMinimized: false,
    isOpen: false,
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

function DesktopIcon({ title, type, status, isLocked = false, onOpen }) {
  const className = 'os-desktop-icon' + (isLocked ? ' is-locked' : '') + (onOpen ? ' is-clickable' : '')
  const iconContent = (
    <>
      <span className={'os-icon-glyph os-icon-' + type} aria-hidden="true" />
      <span className="os-icon-label">{title}</span>
      {status && <small>{status}</small>}
    </>
  )

  if (onOpen) {
    return (
      <button type="button" className={className} onClick={onOpen} aria-label={'Otevřít složku ' + title}>
        {iconContent}
      </button>
    )
  }

  return (
    <div className={className}>
      {iconContent}
    </div>
  )
}

function FolderEntry({ title, detail, status, kind, isLocked = false, onOpen }) {
  const entryClassName = 'os-folder-entry' + (isLocked ? ' is-locked' : '')
  const entryContent = (
    <>
      <span className={'os-file-glyph os-file-' + kind} aria-hidden="true" />
      <span className="os-folder-entry-copy">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <span className="os-folder-entry-status">{status}</span>
    </>
  )

  return (
    <li>
      {onOpen && !isLocked ? (
        <button type="button" className={entryClassName} onClick={onOpen}>
          {entryContent}
        </button>
      ) : (
        <div className={entryClassName}>{entryContent}</div>
      )}
    </li>
  )
}

function KorpOsShell() {
  const {
    korpState,
    stats,
    auditForms,
    dispatchKorpEvent,
    submitAuditForm,
    isFormAvailable,
    isFormSubmitted,
    isUpgradeUnlocked,
  } = useKorpRuntime()
  const auditEntryForm = auditForms.find((form) => form.availableAtStart === true)
  const auditTraceForm = auditForms.find((form) => form.requirements?.kind === 'eventCountAtLeast')
  const auditTraceRequirement = auditTraceForm?.requirements
  const auditTraceUpgradeId = auditTraceForm?.completionEffects
    .find((effect) => effect.kind === 'unlockUpgrade')?.upgradeId
  const auditEntrySubmitted = auditEntryForm ? isFormSubmitted(auditEntryForm.id) : false
  const auditTraceAvailable = auditTraceForm ? isFormAvailable(auditTraceForm.id) : false
  const auditTraceSubmitted = auditTraceForm ? isFormSubmitted(auditTraceForm.id) : false
  const auditTraceUpgradeUnlocked = auditTraceUpgradeId
    ? isUpgradeUnlocked(auditTraceUpgradeId)
    : false
  const [activity, setActivity] = useState(() => initialActivity(auditEntryForm))
  const [feedbackTick, setFeedbackTick] = useState(0)
  const [windows, setWindows] = useState(initialWindows)
  const [canvasScale, setCanvasScale] = useState(1)
  const desktopSpaceRef = useRef(null)
  const dragStateRef = useRef(null)
  const auditTraceAvailabilityRef = useRef(auditTraceAvailable)

  const auditClicks = stats.eventsByType['clickaudit.click'] ?? 0
  const notionalWorkPerAudit = auditTraceUpgradeUnlocked ? 0.2 : 0.1
  const formVisible = auditTraceAvailable || auditTraceSubmitted
  const auditTraceFileStatus = auditTraceSubmitted
    ? 'SCHVÁLENO / AKTIVNÍ'
    : formVisible
      ? 'PŘIPRAVENO KE SCHVÁLENÍ'
      : 'ČEKÁ NA ' + (auditTraceRequirement?.count ?? '?') + ' KONTROL'
  const presentationWindows = {
    ...windows,
    'audit-entry': {
      ...windows['audit-entry'],
      title: 'AUDIT ' + (auditEntryForm?.code ?? '?') + ' / CLICK AUDIT',
      taskbarTitle: 'AUDIT ' + (auditEntryForm?.code ?? '?'),
    },
    'audit-trace': {
      ...windows['audit-trace'],
      title: 'FORMULÁŘE / ŽÁDOST ' + (auditTraceForm?.code ?? '?'),
      taskbarTitle: 'ŽÁDOST ' + (auditTraceForm?.code ?? '?'),
    },
  }
  const isWindowAvailable = (id) => id !== 'audit-trace' || formVisible
  const visibleWindowIds = managedWindowIds.filter((id) => (
    isWindowAvailable(id) && windows[id].isOpen && !windows[id].isMinimized
  ))
  const taskbarWindowIds = managedWindowIds.filter((id) => isWindowAvailable(id) && windows[id].isOpen)
  const activeWindowId = visibleWindowIds.reduce((frontmostId, id) => (
    !frontmostId || windows[id].zIndex > windows[frontmostId].zIndex ? id : frontmostId
  ), null)

  useEffect(() => {
    const updateCanvasScale = () => {
      setCanvasScale(Math.min(1, window.innerWidth / osCanvasWidth, window.innerHeight / osCanvasHeight))
    }

    updateCanvasScale()
    window.addEventListener('resize', updateCanvasScale)

    return () => window.removeEventListener('resize', updateCanvasScale)
  }, [])

  useEffect(() => {
    if (auditTraceAvailable && !auditTraceAvailabilityRef.current) {
      setActivity((currentActivity) => [
        'Formulář ' + auditTraceForm.code + ' byl doručen do složky Formuláře.',
        ...currentActivity,
      ].slice(0, 4))
    }

    auditTraceAvailabilityRef.current = auditTraceAvailable
  }, [auditTraceAvailable, auditTraceForm])

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

  const openWindow = (id) => {
    setWindows((currentWindows) => {
      const window = currentWindows[id]
      if (!window) return currentWindows

      const highestZIndex = Math.max(...Object.values(currentWindows)
        .filter((currentWindow) => currentWindow.isOpen)
        .map((currentWindow) => currentWindow.zIndex))

      return {
        ...currentWindows,
        [id]: { ...window, isOpen: true, isMinimized: false, zIndex: highestZIndex + 1 },
      }
    })
  }

  const startWindowDrag = (id, event) => {
    if (event.button !== 0) return

    const desktopSpace = desktopSpaceRef.current
    const window = windows[id]
    if (!desktopSpace || !window) return

    const desktopRect = desktopSpace.getBoundingClientRect()
    const scale = canvasScale || 1
    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: (event.clientX - desktopRect.left) / scale - window.x,
      offsetY: (event.clientY - desktopRect.top) / scale - window.y,
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
    const scale = canvasScale || 1
    const maximumX = Math.max(0, desktopRect.width / scale - windowRect.width / scale)
    const maximumY = Math.max(0, desktopRect.height / scale - windowRect.height / scale)
    const nextX = Math.min(maximumX, Math.max(0, (event.clientX - desktopRect.left) / scale - dragState.offsetX))
    const nextY = Math.min(maximumY, Math.max(0, (event.clientY - desktopRect.top) / scale - dragState.offsetY))

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

    dispatchKorpEvent({
      id: 'k0rp-os-clickaudit-' + timestamp + '-' + nextClick,
      timestamp,
      sourceModule: 'click-audit',
      type: 'clickaudit.click',
      value: 1,
      tags: ['k0rp-os', 'manual-audit']
    })

    if (!auditEntrySubmitted && auditEntryForm) {
      submitAuditForm(auditEntryForm.id)
    }

    if (auditTraceUpgradeUnlocked) {
      dispatchKorpEvent({
        id: 'k0rp-os-audit-trace-extension-' + timestamp + '-' + nextClick,
        timestamp,
        sourceModule: 'system',
        type: 'system.externalWorkPulse',
        value: 0.1,
        tags: ['k0rp-os', 'audit-trace-extension']
      })
    }

    setActivity((currentActivity) => {
      const nextEntries = [
        '#' + String(nextClick).padStart(3, '0') + ' ' + auditMessages[(nextClick - 1) % auditMessages.length],
      ]

      return [...nextEntries, ...currentActivity].slice(0, 4)
    })
    setFeedbackTick(nextClick)
  }

  const submitAuditTrace = () => {
    if (!auditTraceAvailable || auditTraceSubmitted || !auditTraceForm) return

    submitAuditForm(auditTraceForm.id)
    setActivity((currentActivity) => [
      'Rozšíření auditní stopy bylo schváleno. Výkaz získal další kolonku.',
      'Příští kontrola přítomnosti bude vykázána jako +0.2 NWU.',
      ...currentActivity,
    ].slice(0, 4))
  }

  return (
    <main className="os-shell" aria-label="K0rp_OS pracovní plocha" style={{ '--os-scale': canvasScale }}>
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
              title="Doručené"
              type="folder"
              status="1 MÍSTNÍ MEMO"
              onOpen={() => openWindow('inbox-folder')}
            />
            <DesktopIcon
              title="Formuláře"
              type="folder"
              status={formVisible ? '1 NOVÝ SOUBOR' : 'ČEKÁ NA AUDIT'}
              isLocked={!formVisible}
              onOpen={() => openWindow('forms-folder')}
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
            {visibleWindowIds.includes('audit-entry') && (
              <article
                className="os-window os-audit-window"
                style={windowStyle(windows['audit-entry'])}
                data-window-id="audit-entry"
                aria-labelledby="audit-title"
                onPointerDown={() => bringWindowToFront('audit-entry')}
              >
              <WindowHeader
                window={presentationWindows['audit-entry']}
                variant="audit"
                onMinimize={minimizeWindow}
                onPointerDown={(event) => startWindowDrag('audit-entry', event)}
              />
              <div className="os-audit-body">
                <div className="os-document-heading">
                  <p>STARTUP PROCEDURA / MÍSTNÍ KONTROLA</p>
                  <h1 id="audit-title">Potvrďte, že<br />něco probíhá.</h1>
                  <span>Jeden úkon vytvoří místní auditní záznam. Žádná data neopouštějí tuto pracovní stanici.</span>
                </div>

                <button type="button" className="os-audit-action" onClick={registerAuditAction}>
                  <span>CLICKAUDIT / MANUÁLNÍ POTVRZENÍ</span>
                  <strong>PROVÉST<br />KONTROLU</strong>
                  <small>NEVYŽADUJE PŘEDMĚT KONTROLY</small>
                </button>

                <div className="os-audit-readout" aria-live="polite">
                  <div><span>ÚKONY V RELACI</span><strong>{String(auditClicks).padStart(3, '0')}</strong></div>
                  <div><span>{auditTraceUpgradeUnlocked ? 'PŘÍRŮSTEK NA ÚKON' : 'POSLEDNÍ PŘÍRŮSTEK'}</span><strong key={feedbackTick} className="os-action-feedback">+{notionalWorkPerAudit.toFixed(1)} NWU</strong></div>
                  <div><span>STAV VÝKAZU</span><strong>{auditTraceUpgradeUnlocked ? 'ROZŠÍŘENÝ' : 'ŘÁDNĚ NEURČITÝ'}</strong></div>
                </div>
              </div>
              </article>
            )}

            {visibleWindowIds.includes('audit-trace') && (
              <article
                className="os-window os-form-window"
                style={windowStyle(windows['audit-trace'])}
                data-window-id="audit-trace"
                aria-labelledby="approval-title"
                onPointerDown={() => bringWindowToFront('audit-trace')}
              >
                <WindowHeader
                  window={presentationWindows['audit-trace']}
                  onMinimize={minimizeWindow}
                  onPointerDown={(event) => startWindowDrag('audit-trace', event)}
                />
                <div className={'os-form-body ' + (auditTraceSubmitted ? 'is-approved' : 'is-available')}>
                  <p className="os-document-code">POMOCNÝ VÝKAZ PŘÍTOMNOSTI</p>
                  <h2 id="approval-title">{auditTraceForm?.title}</h2>
                  <p>Přidá pomocný výkaz přítomnosti k budoucím kontrolám.</p>
                  {auditTraceSubmitted ? (
                    <span className="os-approval-state">SCHVÁLENO / AKTIVNÍ<br />+0.2 NWU NA KONTROLU</span>
                  ) : (
                    <button type="button" onClick={submitAuditTrace}>
                      {auditTraceForm?.fields.find((field) => field.type === 'buttonConfirm')?.label}
                    </button>
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

            {visibleWindowIds.includes('forms-folder') && (
              <article
                className="os-window os-folder-window os-forms-folder-window"
                style={windowStyle(windows['forms-folder'])}
                data-window-id="forms-folder"
                aria-labelledby="forms-folder-title"
                onPointerDown={() => bringWindowToFront('forms-folder')}
              >
                <WindowHeader
                  window={windows['forms-folder']}
                  onMinimize={minimizeWindow}
                  onPointerDown={(event) => startWindowDrag('forms-folder', event)}
                />
                <div className="os-folder-body">
                  <p className="os-folder-path">C:\K0RP\FORMULÁŘE\MÍSTNÍ RELACE</p>
                  <h2 id="forms-folder-title">Formuláře</h2>
                  <ul className="os-folder-list">
                    <FolderEntry
                      title={'Žádost ' + (auditTraceForm?.code ?? '?')}
                      detail={auditTraceForm?.title}
                      status={auditTraceFileStatus}
                      kind="form"
                      isLocked={!formVisible}
                      onOpen={() => openWindow('audit-trace')}
                    />
                    <FolderEntry
                      title={'Audit ' + (auditEntryForm?.code ?? '?')}
                      detail="Kontrola přítomnosti"
                      status="OTEVŘÍT DOKUMENT"
                      kind="document"
                      onOpen={() => openWindow('audit-entry')}
                    />
                    <FolderEntry
                      title={'Záznam ' + (auditTraceForm?.code ?? '?')}
                      detail="Archivace čeká na podpis"
                      status="ZAMČENO"
                      kind="archive"
                      isLocked
                    />
                  </ul>
                </div>
              </article>
            )}

            {visibleWindowIds.includes('inbox-folder') && (
              <article
                className="os-window os-folder-window os-inbox-folder-window"
                style={windowStyle(windows['inbox-folder'])}
                data-window-id="inbox-folder"
                aria-labelledby="inbox-folder-title"
                onPointerDown={() => bringWindowToFront('inbox-folder')}
              >
                <WindowHeader
                  window={windows['inbox-folder']}
                  onMinimize={minimizeWindow}
                  onPointerDown={(event) => startWindowDrag('inbox-folder', event)}
                />
                <div className="os-folder-body">
                  <p className="os-folder-path">C:\K0RP\DORUČENÉ\MÍSTNÍ RELACE</p>
                  <h2 id="inbox-folder-title">Doručené</h2>
                  <ul className="os-folder-list">
                    <FolderEntry
                      title="Denní výpis"
                      detail="Místní memo / provozní záznam"
                      status="OTEVŘÍT MEMO"
                      kind="memo"
                      onOpen={() => openWindow('daily-report')}
                    />
                    <FolderEntry
                      title="Startup audit"
                      detail="Automaticky založený záznam"
                      status="ČEKÁ NA ARCHIV"
                      kind="archive"
                      isLocked
                    />
                  </ul>
                </div>
              </article>
            )}
          </section>

          <p className="os-wallpaper-mark" aria-hidden="true">KØRP<br />INTERNAL<br />OPERATIONS</p>
        </div>

        <footer className="os-taskbar">
          <span className="os-taskbar-start">KØRP // START</span>
          {taskbarWindowIds.map((id) => {
            const window = presentationWindows[id]
            return (
              <button
                key={id}
                type="button"
                className={'os-taskbar-window' + (window.isMinimized ? ' is-minimized' : '') + (id === activeWindowId ? ' is-active' : '')}
                aria-pressed={id === activeWindowId}
                aria-label={(window.isMinimized ? 'Obnovit okno ' : 'Přenést dopředu okno ') + window.taskbarTitle}
                onClick={() => openWindow(id)}
              >
                {window.taskbarTitle}
              </button>
            )
          })}
          <span className="os-taskbar-resource os-taskbar-resource-nwu">NWU {korpState.resources.notionalWorkUnits.toFixed(1)}</span>
          <span className="os-taskbar-resource os-taskbar-resource-ap">AP {korpState.resources.auditPressure.toFixed(0)}</span>
          <span className="os-taskbar-resource os-taskbar-resource-ci">CI {korpState.resources.complianceIntegrity.toFixed(0)}</span>
          <span className="os-taskbar-privacy">PRIVACY: LOCAL ONLY</span>
          <span className="os-taskbar-clock">10:00 / RELACE 01</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
