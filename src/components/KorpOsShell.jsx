import { useState } from 'react'
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

function WindowHeader({ children, variant = 'document' }) {
  return (
    <div className={'os-window-header os-window-header-' + variant}>
      <span className="os-window-title">{children}</span>
      <span className="os-window-controls" aria-hidden="true"><i /><i /><i /></span>
    </div>
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

  const auditClicks = korpState.stats.eventsByType['clickaudit.click'] ?? 0
  const auditTraceAvailable = auditClicks >= auditTraceApprovalThreshold
  const notionalWorkPerAudit = auditTraceApproved ? 0.2 : 0.1
  const formVisible = auditTraceAvailable || auditTraceApproved

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

        <div className="os-desktop-space">
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

          <section className="os-static-windows" aria-label="Otevřená okna">
            <article className="os-window os-audit-window" aria-labelledby="audit-title">
              <WindowHeader variant="audit">AUDIT 00-A / CLICK AUDIT</WindowHeader>
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

            {formVisible && (
              <article className="os-window os-form-window" aria-labelledby="approval-title">
                <WindowHeader>FORMULÁŘE / ŽÁDOST 10-A</WindowHeader>
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

            <article className="os-window os-log-window" aria-labelledby="activity-title">
              <WindowHeader>DENNÍ VÝPIS / MÍSTNÍ MEMO</WindowHeader>
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
          </section>

          <p className="os-wallpaper-mark" aria-hidden="true">KØRP<br />INTERNAL<br />OPERATIONS</p>
        </div>

        <footer className="os-taskbar">
          <span className="os-taskbar-start">KØRP // START</span>
          <span className="os-taskbar-app">AUDIT 00-A</span>
          <span>NWU {korpState.resources.notionalWorkUnits.toFixed(1)}</span>
          <span>AP {korpState.resources.auditPressure.toFixed(0)}</span>
          <span>CI {korpState.resources.complianceIntegrity.toFixed(0)}</span>
          <span className="os-taskbar-privacy">PRIVACY: LOCAL ONLY</span>
          <span>10:00 / RELACE 01</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
