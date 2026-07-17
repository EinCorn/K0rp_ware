import { useEffect, useRef, useState } from 'react'
import { listModules } from '../../packages/korp-modules/src/index'
import { createAuditFormValues, isAuditFormComplete } from '../runtime/auditFormDraft'
import { classifyKorpOsClickTarget } from '../runtime/osClickTracking'
import { useKorpRuntime } from '../runtime/useKorpRuntime'
import {
  bringWindowStateToFront,
  getCenteredCanvasPlacement,
  mapClientPointToCanvas,
  minimizeWindowState,
  restoreWindowState,
  snapWindowPosition,
} from '../runtime/windowManager'
import AuditFormDocument from './AuditFormDocument'
import ClickAuditRuntimeModule from './ClickAuditRuntimeModule'
import { ClickAuditEmbeddedWindow } from './ClickAuditWindow'
import './KorpOsShell.css'

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

const managedWindowIds = [
  'audit-entry',
  'click-audit',
  'audit-trace',
  'daily-report',
  'forms-folder',
  'inbox-folder',
]

const initialWindows = {
  'audit-entry': {
    id: 'audit-entry',
    title: null,
    taskbarTitle: null,
    x: 184,
    y: 58,
    zIndex: 3,
    isMinimized: false,
    isOpen: true,
  },
  'click-audit': {
    id: 'click-audit',
    title: 'CLICKAUDIT / MÍSTNÍ MODUL',
    taskbarTitle: 'CLICKAUDIT',
    x: 250,
    y: 250,
    zIndex: 2,
    isMinimized: false,
    isOpen: false,
  },
  'audit-trace': {
    id: 'audit-trace',
    title: null,
    taskbarTitle: null,
    x: 965,
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
      data-window-drag-region="true"
      data-clickaudit-profile="window-drag-handle"
    >
      <span className="os-window-title">{window.title}</span>
      <button
        type="button"
        className="os-window-minimize"
        aria-label={'Minimalizovat okno ' + window.taskbarTitle}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onMinimize(window.id)}
        data-window-control="true"
        data-clickaudit-profile="window-control"
      >
        —
      </button>
    </header>
  )
}

function DesktopIcon({ title, type, status, isLocked = false, onOpen }) {
  const canOpen = Boolean(onOpen) && !isLocked
  const className = 'os-desktop-icon' + (isLocked ? ' is-locked' : '') + (canOpen ? ' is-clickable' : '')
  const iconContent = (
    <>
      <span className={'os-icon-glyph os-icon-' + type} aria-hidden="true" />
      <span className="os-icon-label">{title}</span>
      {status && <small>{status}</small>}
    </>
  )

  if (canOpen) {
    return (
      <button
        type="button"
        className={className}
        onClick={onOpen}
        aria-label={'Otevřít ' + title}
        data-clickaudit-profile="desktop-icon"
      >
        {iconContent}
      </button>
    )
  }

  return <div className={className} data-clickaudit-profile="desktop-icon">{iconContent}</div>
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
        <button
          type="button"
          className={entryClassName}
          onClick={onOpen}
          data-clickaudit-profile="folder-entry"
        >
          {entryContent}
        </button>
      ) : (
        <div className={entryClassName} data-clickaudit-profile="folder-entry">{entryContent}</div>
      )}
    </li>
  )
}

function KorpOsShell() {
  const {
    korpState,
    stats,
    auditForms,
    metricPackets,
    auditInstances,
    pendingMetricPackets,
    pendingAuditCount,
    recordOsClick,
    submitAuditForm,
    updateAuditInstanceField,
    submitMetricAuditInstance,
    isFormSubmitted,
    isModuleUnlocked,
    lastClickAuditActivity,
  } = useKorpRuntime()

  const auditEntryForm = auditForms.find((form) => form.availableAtStart === true)
  const auditTraceForm = auditForms.find((form) => form.id === 'audit-10-a')
  const auditEntrySubmitted = auditEntryForm ? isFormSubmitted(auditEntryForm.id) : false
  const clickAuditUnlocked = isModuleUnlocked('click-audit')
  const pendingPacketIds = new Set(pendingMetricPackets.map((packet) => packet.id))
  const pendingAuditInstance = auditInstances.find((instance) => (
    instance.templateId === auditTraceForm?.id
    && pendingPacketIds.has(instance.packetId)
    && (instance.status === 'available' || instance.status === 'draft')
  ))
  const matchingAuditInstances = auditInstances.filter((instance) => instance.templateId === auditTraceForm?.id)
  const latestAuditInstance = matchingAuditInstances.length > 0
    ? matchingAuditInstances[matchingAuditInstances.length - 1]
    : null
  const auditTraceInstance = pendingAuditInstance ?? latestAuditInstance
  const auditTracePacket = metricPackets.find((packet) => packet.id === auditTraceInstance?.packetId)
  const auditTraceSubmitted = auditTraceInstance?.status === 'submitted' || auditTraceInstance?.status === 'closed'

  const [activity, setActivity] = useState(() => initialActivity(auditEntryForm))
  const [auditEntryValues, setAuditEntryValues] = useState(() => createAuditFormValues(auditEntryForm))
  const [windows, setWindows] = useState(initialWindows)
  const [canvasPlacement, setCanvasPlacement] = useState(() => getCenteredCanvasPlacement(
    window.innerWidth,
    window.innerHeight,
    osCanvasWidth,
    osCanvasHeight,
  ))
  const desktopSpaceRef = useRef(null)
  const dragStateRef = useRef(null)
  const pendingAuditCountRef = useRef(pendingAuditCount)
  const activityEventIdRef = useRef(null)
  const recordedPointerEventsRef = useRef(new WeakSet())

  const auditClicks = stats.eventsByType['clickaudit.click'] ?? 0
  const formVisible = Boolean(auditTraceInstance)
  const formsFolderAvailable = auditEntrySubmitted || matchingAuditInstances.length > 0
  const auditTraceFileStatus = pendingAuditInstance
    ? `${pendingAuditCount} ČEKÁ NA AUDIT`
    : auditTraceSubmitted
      ? 'CERTIFIKOVÁNO / EV +1'
      : 'ČEKÁ NA DÁVKU'
  const formsIconStatus = pendingAuditCount > 0
    ? `${pendingAuditCount} ČEKÁ NA AUDIT`
    : latestAuditInstance
      ? 'POSLEDNÍ DÁVKA UZAVŘENA'
      : auditEntrySubmitted
        ? '1 SPLNĚNÝ AUDIT'
        : 'ČEKÁ NA AUDIT'
  const presentationWindows = {
    ...windows,
    'audit-entry': {
      ...windows['audit-entry'],
      title: 'FORMULÁŘ ' + (auditEntryForm?.code ?? '?') + ' / VSTUPNÍ AUDIT',
      taskbarTitle: 'AUDIT ' + (auditEntryForm?.code ?? '?'),
    },
    'audit-trace': {
      ...windows['audit-trace'],
      title: 'AUDITNÍ DÁVKA / FORMULÁŘ ' + (auditTraceForm?.code ?? '?'),
      taskbarTitle: 'AUDIT ' + (auditTraceForm?.code ?? '?'),
    },
  }

  const isWindowAvailable = (id) => {
    if (id === 'click-audit') return clickAuditUnlocked
    if (id === 'audit-trace') return formVisible
    if (id === 'forms-folder') return formsFolderAvailable
    return true
  }

  const visibleWindowIds = managedWindowIds.filter((id) => (
    isWindowAvailable(id) && windows[id].isOpen && !windows[id].isMinimized
  ))
  const taskbarWindowIds = managedWindowIds.filter((id) => isWindowAvailable(id) && windows[id].isOpen)
  const activeWindowId = visibleWindowIds.reduce((frontmostId, id) => (
    !frontmostId || windows[id].zIndex > windows[frontmostId].zIndex ? id : frontmostId
  ), null)

  useEffect(() => {
    const updateCanvasPlacement = () => {
      setCanvasPlacement(getCenteredCanvasPlacement(
        window.innerWidth,
        window.innerHeight,
        osCanvasWidth,
        osCanvasHeight,
      ))
    }

    updateCanvasPlacement()
    window.addEventListener('resize', updateCanvasPlacement)
    return () => window.removeEventListener('resize', updateCanvasPlacement)
  }, [])

  useEffect(() => {
    if (pendingAuditCount > pendingAuditCountRef.current) {
      setActivity((currentActivity) => [
        'Nová dávka aktivity čeká na Audit ' + (auditTraceForm?.code ?? '?') + '.',
        'Kliky byly zaznamenány. Jejich význam zatím nebyl schválen.',
        ...currentActivity,
      ].slice(0, 4))
    }

    pendingAuditCountRef.current = pendingAuditCount
  }, [auditTraceForm, pendingAuditCount])

  useEffect(() => {
    if (!lastClickAuditActivity || activityEventIdRef.current === lastClickAuditActivity.id) return

    activityEventIdRef.current = lastClickAuditActivity.id
    setActivity((currentActivity) => [
      lastClickAuditActivity.entry,
      ...currentActivity,
    ].slice(0, 4))
  }, [lastClickAuditActivity])

  const bringWindowToFront = (id) => {
    setWindows((currentWindows) => bringWindowStateToFront(currentWindows, id))
  }

  const minimizeWindow = (id) => {
    setWindows((currentWindows) => minimizeWindowState(currentWindows, id))
  }

  const openWindow = (id) => {
    setWindows((currentWindows) => restoreWindowState(currentWindows, id))
  }

  const startWindowDrag = (id, event) => {
    if (event.button !== 0) return

    const desktopSpace = desktopSpaceRef.current
    const windowState = windows[id]
    if (!desktopSpace || !windowState) return

    const desktopRect = desktopSpace.getBoundingClientRect()
    const pointerPosition = mapClientPointToCanvas(
      { x: event.clientX, y: event.clientY },
      desktopRect,
      { width: desktopSpace.clientWidth, height: desktopSpace.clientHeight },
    )
    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: pointerPosition.x - windowState.x,
      offsetY: pointerPosition.y - windowState.y,
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
    const workspaceSize = { width: desktopSpace.clientWidth, height: desktopSpace.clientHeight }
    const pointerPosition = mapClientPointToCanvas(
      { x: event.clientX, y: event.clientY },
      desktopRect,
      workspaceSize,
    )
    const nextPosition = snapWindowPosition(
      {
        x: pointerPosition.x - dragState.offsetX,
        y: pointerPosition.y - dragState.offsetY,
      },
      workspaceSize,
      { width: windowElement.offsetWidth, height: windowElement.offsetHeight },
    )

    setWindows((currentWindows) => ({
      ...currentWindows,
      [dragState.id]: { ...currentWindows[dragState.id], ...nextPosition },
    }))
  }

  const endWindowDrag = (event) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return
    dragStateRef.current = null
  }

  const windowStyle = (windowState) => ({
    left: windowState.x,
    top: windowState.y,
    zIndex: windowState.zIndex,
  })

  const handleKorpOsPointerDownCapture = (event) => {
    const nativeEvent = event.nativeEvent
    if (nativeEvent && recordedPointerEventsRef.current.has(nativeEvent)) return
    if (nativeEvent) recordedPointerEventsRef.current.add(nativeEvent)

    const classification = classifyKorpOsClickTarget(event.target)
    if (!classification) return

    recordOsClick(classification)
  }

  const handleAuditEntryFieldChange = (field, value) => {
    if (!auditEntryForm || auditEntrySubmitted) return

    setAuditEntryValues((currentValues) => ({
      ...currentValues,
      [field.id]: value,
    }))
  }

  const handleAuditEntrySubmit = () => {
    if (
      !auditEntryForm
      || auditEntrySubmitted
      || !isAuditFormComplete(auditEntryForm, auditEntryValues)
    ) return

    submitAuditForm(auditEntryForm.id)
    setActivity((currentActivity) => [
      'Audit ' + auditEntryForm.code + ' byl splněn. Přítomnost byla přijata.',
      'Modul ClickAudit byl zpřístupněn jako samostatná aplikace.',
      ...currentActivity,
    ].slice(0, 4))
  }

  const handleAuditTraceFieldChange = (field, value) => {
    if (!pendingAuditInstance || auditTraceSubmitted) return
    updateAuditInstanceField(pendingAuditInstance.id, field.id, value)
  }

  const submitAuditTrace = () => {
    if (
      !pendingAuditInstance
      || !auditTraceForm
      || !isAuditFormComplete(auditTraceForm, pendingAuditInstance.values)
    ) return

    submitMetricAuditInstance(pendingAuditInstance.id)
    setActivity((currentActivity) => [
      'Dávka ' + (auditTracePacket?.id ?? '?') + ' byla certifikována.',
      'Evidence +1. Aktivita byla procesně uznána bez zjištění výsledku.',
      ...currentActivity,
    ].slice(0, 4))
  }

  return (
    <main
      className="os-shell"
      aria-label="K0rp_OS pracovní plocha"
      style={{
        '--os-scale': canvasPlacement.scale,
        '--os-canvas-left': canvasPlacement.left + 'px',
        '--os-canvas-top': canvasPlacement.top + 'px',
      }}
      onPointerDownCapture={handleKorpOsPointerDownCapture}
    >
      <div className="os-canvas-viewport">
        <section className="os-desktop">
          <header className="os-desktop-readout">
            <div className="os-brand" aria-label="K0rp_OS">
              <strong>KØrp_OS</strong>
              <span>BUILD 0.3 / PRACOVNÍ STANICE</span>
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
                status={formsIconStatus}
                isLocked={!formsFolderAvailable}
                onOpen={() => openWindow('forms-folder')}
              />
              {clickAuditUnlocked && (
                <DesktopIcon
                  title="ClickAudit"
                  type="app"
                  status={auditClicks + ' EVIDOVANÝCH KLIKŮ'}
                  onOpen={() => openWindow('click-audit')}
                />
              )}
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
                  className="os-window os-audit-document-window"
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
                  <AuditFormDocument
                    form={auditEntryForm}
                    values={auditEntryValues}
                    submitted={auditEntrySubmitted}
                    onFieldChange={handleAuditEntryFieldChange}
                    onSubmit={handleAuditEntrySubmit}
                  />
                </article>
              )}

              {visibleWindowIds.includes('click-audit') && (
                <article
                  className="os-clickaudit-asset-window"
                  style={windowStyle(windows['click-audit'])}
                  data-window-id="click-audit"
                  aria-label="ClickAudit"
                  onPointerDown={() => bringWindowToFront('click-audit')}
                >
                  <ClickAuditEmbeddedWindow
                    onDragStart={(event) => startWindowDrag('click-audit', event)}
                    onMinimize={() => minimizeWindow('click-audit')}
                  >
                    <ClickAuditRuntimeModule centralizedTracking />
                  </ClickAuditEmbeddedWindow>
                </article>
              )}

              {visibleWindowIds.includes('audit-trace') && (
                <article
                  className="os-window os-audit-document-window os-packet-audit-window"
                  style={windowStyle(windows['audit-trace'])}
                  data-window-id="audit-trace"
                  aria-labelledby="approval-title"
                  onPointerDown={() => bringWindowToFront('audit-trace')}
                >
                  <WindowHeader
                    window={presentationWindows['audit-trace']}
                    variant="audit"
                    onMinimize={minimizeWindow}
                    onPointerDown={(event) => startWindowDrag('audit-trace', event)}
                  />
                  <AuditFormDocument
                    form={auditTraceForm}
                    values={auditTraceInstance?.values ?? {}}
                    submitted={auditTraceSubmitted}
                    headingId="approval-title"
                    documentLabel={`AUDITOVATELNÁ DÁVKA / ${auditTracePacket?.id ?? 'NEURČENO'}`}
                    introText={`Zaznamenaných raw interakcí: ${auditTracePacket?.quantity ?? 0}. Samotný záznam není Evidence, dokud nebude certifikován.`}
                    pendingStatusText="ZVOLTE ODPOVĚĎ"
                    readyStatusText="ZÁZNAM PŘIPRAVEN K CERTIFIKACI"
                    completionHeadingLabel={`FORMULÁŘ ${auditTraceForm?.code ?? '?'} / CERTIFIKOVANÁ DÁVKA`}
                    completionTitle="EVIDENCE CERTIFIKOVÁNA"
                    completionDetail={`${auditTracePacket?.id ?? 'DÁVKA'} / EV +1`}
                    completionNote="Zaznamenaná aktivita byla uznána jako Evidence. Účinek aktivity zůstal mimo rozsah auditu."
                    onFieldChange={handleAuditTraceFieldChange}
                    onSubmit={submitAuditTrace}
                  />
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
                        title={'Audit ' + (auditTraceForm?.code ?? '?') + ' / dávka'}
                        detail={auditTracePacket
                          ? `${auditTracePacket.quantity} kliků / rozsah ${auditTracePacket.rangeStart}–${auditTracePacket.rangeEnd}`
                          : 'Čeká na uzavření další dávky raw aktivity'}
                        status={auditTraceFileStatus}
                        kind="form"
                        isLocked={!formVisible}
                        onOpen={() => openWindow('audit-trace')}
                      />
                      <FolderEntry
                        title={'Audit ' + (auditEntryForm?.code ?? '?')}
                        detail={auditEntryForm?.title ?? 'Kontrola přítomnosti'}
                        status={auditEntrySubmitted ? 'SPLNĚNO / OTEVŘÍT' : 'OTEVŘÍT DOKUMENT'}
                        kind="document"
                        onOpen={() => openWindow('audit-entry')}
                      />
                      <FolderEntry
                        title="Evidence packet archive"
                        detail="Certifikované dávky / lokální evidence"
                        status={metricPackets.some((packet) => packet.status === 'certified') ? 'MÍSTNĚ ULOŽENO' : 'ZAMČENO'}
                        kind="archive"
                        isLocked={!metricPackets.some((packet) => packet.status === 'certified')}
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
                        status={auditEntrySubmitted ? 'PŘIJAT / LOKÁLNĚ' : 'ČEKÁ NA SPLNĚNÍ'}
                        kind="archive"
                        isLocked={!auditEntrySubmitted}
                      />
                    </ul>
                  </div>
                </article>
              )}
            </section>

            <p className="os-wallpaper-mark" aria-hidden="true">KØRP<br />INTERNAL<br />OPERATIONS</p>
          </div>

          <footer className="os-taskbar" data-clickaudit-profile="taskbar">
            <span className="os-taskbar-start">KØRP // START</span>
            {taskbarWindowIds.map((id) => {
              const windowState = presentationWindows[id]
              return (
                <button
                  key={id}
                  type="button"
                  className={'os-taskbar-window' + (windowState.isMinimized ? ' is-minimized' : '') + (id === activeWindowId ? ' is-active' : '')}
                  aria-pressed={id === activeWindowId}
                  aria-label={(windowState.isMinimized ? 'Obnovit okno ' : 'Přenést dopředu okno ') + windowState.taskbarTitle}
                  onClick={() => openWindow(id)}
                >
                  {windowState.taskbarTitle}
                </button>
              )
            })}
            <span className="os-taskbar-resource os-taskbar-resource-nwu">EV {korpState.resources.notionalWorkUnits.toFixed(0)}</span>
            <span className="os-taskbar-resource os-taskbar-resource-ap">AUDITY {pendingAuditCount}</span>
            <span className="os-taskbar-privacy">PRIVACY: LOCAL ONLY</span>
            <span className="os-taskbar-clock">10:00 / RELACE 01</span>
          </footer>
        </section>
      </div>
    </main>
  )
}

export default KorpOsShell
