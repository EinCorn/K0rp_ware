import { useState } from 'react'
import { applyKorpEvent, createInitialState } from '../../packages/korp-core/src/index'
import { listModules } from '../../packages/korp-modules/src/index'
import './KorpOsShell.css'

const modules = listModules()
const pendingModules = modules.filter((module) => module.status !== 'current')

const resourceDefinitions = [
  { key: 'notionalWorkUnits', label: 'NOTIONAL WORK UNITS', unit: 'NWU', precision: 1 },
  { key: 'auditPressure', label: 'AUDIT PRESSURE', unit: 'AP', precision: 0 },
  { key: 'perceivedProductivity', label: 'PERCEIVED PRODUCTIVITY', unit: 'PP', precision: 1 },
  { key: 'complianceIntegrity', label: 'COMPLIANCE INTEGRITY', unit: 'CI', precision: 0 },
  { key: 'stabilization', label: 'STABILIZATION', unit: 'STB', precision: 1 },
  { key: 'entropy', label: 'ENTROPY', unit: 'ENT', precision: 1 },
]

const auditMessages = [
  'Auditní stopa byla rozšířena. Účel zůstává předpokládaný.',
  'Přítomnost byla potvrzena bez nutnosti přítomnosti.',
  'Kontrolní úkon přijat. Nevyžadoval kontrolovaný objekt.',
  'Produktivita byla zaznamenána ve vhodně neurčité podobě.',
]

const initialActivity = [
  'Provozní plocha otevřena. Pracovní den nebyl ověřen.',
  'Fidget zařazen do stabilizační pohotovosti.',
  'Bloom čeká na drobné myšlenky ke zpracování.',
]

function WindowHeader({ children }) {
  return (
    <div className="os-window-header">
      <span className="os-window-title">{children}</span>
      <span className="os-window-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  )
}

function ResourceCounter({ definition, value }) {
  return (
    <div className="os-resource-counter">
      <span>{definition.label}</span>
      <strong>{value.toFixed(definition.precision)}</strong>
      <small>{definition.unit}</small>
    </div>
  )
}

function KorpOsShell() {
  const [korpState, setKorpState] = useState(() => createInitialState({ settings: { platform: 'web' } }))
  const [activity, setActivity] = useState(initialActivity)
  const [feedbackTick, setFeedbackTick] = useState(0)

  const auditClicks = korpState.stats.eventsByType['clickaudit.click'] ?? 0

  const registerAuditAction = () => {
    const nextClick = auditClicks + 1
    const timestamp = Date.now()

    setKorpState((currentState) => applyKorpEvent(currentState, {
      id: `k0rp-os-clickaudit-${timestamp}-${nextClick}`,
      timestamp,
      sourceModule: 'click-audit',
      type: 'clickaudit.click',
      value: 1,
      tags: ['k0rp-os', 'manual-audit']
    }))
    setActivity((currentActivity) => [
      `#${String(nextClick).padStart(3, '0')} ${auditMessages[(nextClick - 1) % auditMessages.length]}`,
      ...currentActivity,
    ].slice(0, 4))
    setFeedbackTick(nextClick)
  }

  return (
    <main className="os-shell" aria-label="K0rp_OS pracovní stanice">
      <section className="os-desktop">
        <header className="os-topbar">
          <div className="os-brand" aria-label="K0rp_OS">
            <span>KØrp</span>
            <strong>_OS</strong>
            <small>K0rp_ware / provozní pracovní stanice</small>
          </div>
          <div className="os-machine-readout">
            <span className="os-status-lamp" aria-hidden="true" />
            <span>SYSTÉM ONLINE</span>
            <small>SMĚNA 01 / LOKÁLNÍ RELACE</small>
          </div>
        </header>

        <p className="os-announcement">INTERNÍ OZNÁMENÍ: PŘÍTOMNOST MŮŽE BÝT NAHRAZENA ŘÁDNĚ VEDENÝM ZÁZNAMEM.</p>

        <div className="os-game-workbench">
          <aside className="os-ledger" aria-label="Účet provozních zdrojů">
            <div className="os-ledger-heading">
              <span>KØRP / START</span>
              <strong>ÚČET VÝKONU</strong>
              <small>HODNOTY JSOU PROZATÍM LOKÁLNĚ PŘESVĚDČIVÉ.</small>
            </div>

            <section className="os-resource-grid" aria-label="Aktuální zdroje">
              {resourceDefinitions.map((definition) => (
                <ResourceCounter key={definition.key} definition={definition} value={korpState.resources[definition.key]} />
              ))}
            </section>

            <section className="os-approval-panel" aria-labelledby="approval-title">
              <div className="os-panel-heading">
                <p className="os-kicker">FORMULÁŘE A OPRÁVNĚNÍ</p>
                <h2 id="approval-title">Čekající schválení</h2>
              </div>
              <ul>
                <li><span>Fidget: stabilizační příděl</span><small>VYŽADUJE 12 NWU</small></li>
                <li><span>Bloom: drobné myšlenky</span><small>REVIZE NEURČENA</small></li>
                <li><span>Osobní důvod přítomnosti</span><small>NEVYŽADOVÁN</small></li>
              </ul>
            </section>

            <section className="os-pending-queue" aria-labelledby="pending-title">
              <div className="os-panel-heading">
                <p className="os-kicker">PŘEDBĚŽNÁ EVIDENCE</p>
                <h2 id="pending-title">Fronta modulů</h2>
              </div>
              <ul>
                {pendingModules.map((module) => (
                  <li key={module.id}>
                    <span>{module.title}</span>
                    <small>{module.status === 'candidate' ? 'ČEKÁ NA POSOUZENÍ' : 'NEPLÁNOVANĚ BUDOUCÍ'}</small>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="os-game-workspace" aria-label="Pracovní plocha produktivity">
            <header className="os-workspace-head">
              <div>
                <p className="os-kicker">CENTRUM PROVOZNÍ PŘÍTOMNOSTI / RELACE AKTIVNÍ</p>
                <h1>Vykázatelná činnost.</h1>
              </div>
              <div className="os-memo-slip">
                <span>INTERNÍ MEMO 47-B</span>
                <strong>Každý provedený úkon lze po provedení považovat za potřebný.</strong>
                <small>SPIS: DAILY PRESENCE / OTEVŘENO</small>
              </div>
            </header>

            <div className="os-game-grid">
              <section className="os-click-audit-panel" aria-labelledby="click-audit-title">
                <WindowHeader>CLICKAUDIT / KONTROLA PŘÍTOMNOSTI</WindowHeader>
                <div className="os-click-audit-body">
                  <div className="os-audit-instruction">
                    <p className="os-kicker">SCHVÁLENÝ MANUÁLNÍ ÚKON</p>
                    <h2 id="click-audit-title">Potvrďte, že něco probíhá.</h2>
                    <p>Jeden záznam stačí k rozšíření auditní stopy. Další záznamy zvyšují její důvěryhodně vypadající objem.</p>
                  </div>
                  <button type="button" className="os-audit-action" onClick={registerAuditAction}>
                    <span>CLICKAUDIT / MANUÁLNÍ POTVRZENÍ</span>
                    <strong>PROVÉST KONTROLU PŘÍTOMNOSTI</strong>
                    <small>NEVYŽADUJE PŘEDMĚT KONTROLY</small>
                  </button>
                  <div className="os-audit-readout" aria-live="polite">
                    <div><span>ÚKONY V RELACI</span><strong>{String(auditClicks).padStart(3, '0')}</strong></div>
                    <div><span>POSLEDNÍ PŘÍRŮSTEK</span><strong key={feedbackTick} className="os-action-feedback">+0.1 NWU</strong></div>
                    <div><span>STAV ZÁZNAMU</span><strong>ŘÁDNĚ NEURČITÝ</strong></div>
                  </div>
                </div>
              </section>

              <div className="os-production-row">
                <section className="os-production-widget os-fidget-widget" aria-labelledby="fidget-title">
                  <WindowHeader>FIDGET / STABILIZACE</WindowHeader>
                  <div className="os-widget-body">
                    <div className="os-fidget-dial" aria-hidden="true"><i /><i /><i /><i /></div>
                    <div>
                      <p className="os-kicker">PASIVNÍ PRODUKČNÍ MODUL</p>
                      <h2 id="fidget-title">Fidget v pohotovosti</h2>
                      <p>Stabilizace bude přidělena po připojení samostatného runtime.</p>
                    </div>
                  </div>
                </section>

                <section className="os-production-widget os-bloom-widget" aria-labelledby="bloom-title">
                  <WindowHeader>BLOOM / KONFORMITA</WindowHeader>
                  <div className="os-widget-body">
                    <div className="os-bloom-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
                    <div>
                      <p className="os-kicker">PASIVNÍ PRODUKČNÍ MODUL</p>
                      <h2 id="bloom-title">Bloom čeká na podnět</h2>
                      <p>Compliance Integrity zůstává v opatrně nevyužitém stavu.</p>
                    </div>
                  </div>
                </section>

                <section className="os-activity-log" aria-labelledby="activity-title">
                  <WindowHeader>PROVOZNÍ ZÁZNAM</WindowHeader>
                  <div className="os-log-body">
                    <div className="os-panel-heading">
                      <p className="os-kicker">POSLEDNÍ DOKLADY ČINNOSTI</p>
                      <h2 id="activity-title">Denní výpis</h2>
                    </div>
                    <ol>
                      {activity.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
                    </ol>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>

        <footer className="os-taskbar">
          <span className="os-taskbar-start">KØRP // START</span>
          <span>EMPLOYEE: LOCAL-000</span>
          <span>REŽIM: AUDITNÍ PŘÍTOMNOST</span>
          <span>ÚKONY: {auditClicks} / LOCAL ONLY</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
