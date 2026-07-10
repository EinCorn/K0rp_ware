import { useState } from 'react'
import { listModules } from '../../packages/korp-modules/src/index'
import './KorpOsShell.css'

const modules = listModules()
const currentModules = modules.filter((module) => module.status === 'current')
const pendingModules = modules.filter((module) => module.status !== 'current')

const statusLabels = {
  current: 'AKTIVNÍ',
  candidate: 'KANDIDÁT',
  future: 'PENDING',
}

const categoryLabels = {
  audit: 'audit / potvrzení',
  stabilization: 'stabilizace',
  care: 'péče',
  alignment: 'zarovnání',
  idle: 'čekání',
  attention: 'pozornost',
  system: 'systém',
}

const workstationTabs = [
  { id: 'modules', label: 'MODULY', detail: 'evidence nástrojů' },
  { id: 'status', label: 'STAV', detail: 'provozní výpis' },
  { id: 'unlocks', label: 'ODEMYKÁNÍ', detail: 'čekající oprávnění' },
  { id: 'archive', label: 'ARCHIV', detail: 'přijaté složky' },
]

function ModuleTile({ module, onOpen, compact = false }) {
  const isCurrent = module.status === 'current'

  return (
    <button
      type="button"
      className={`os-module-tile ${isCurrent ? 'is-current' : 'is-pending'} ${compact ? 'is-compact' : ''}`}
      onClick={() => onOpen(module)}
    >
      <span className="os-tile-status">{isCurrent ? 'PROVOZNĚ DOSTUPNÝ' : 'PENDING / NESPUSITELNÉ'}</span>
      <strong>{module.title}</strong>
      <span className="os-tile-copy">{module.shortDescription}</span>
      <span className="os-tile-footer">
        <span>{statusLabels[module.status]}</span>
        <span>{isCurrent ? 'OTEVŘÍT KARTU' : 'ČÍST SPECIFIKACI'}</span>
      </span>
    </button>
  )
}

function WorkspacePlaceholder({ activeView }) {
  const tab = workstationTabs.find((item) => item.id === activeView)

  return (
    <div className="os-placeholder-mode">
      <p className="os-kicker">{tab.detail.toUpperCase()} / PROTOKOL NENÍ ÚPLNÝ</p>
      <h2>{tab.label}</h2>
      <p>
        Tato pracovní složka byla otevřena pro vaši orientaci. Další údaje zatím zůstávají v přiměřeně
        administrativním stavu.
      </p>
      <div className="os-placeholder-stamp">ZÁZNAM PŘIJAT / ŽÁDNÁ DALŠÍ AKCE NEVYŽADOVÁNA</div>
    </div>
  )
}

function ModuleInspection({ selectedModule, onClose }) {
  if (!selectedModule) {
    return (
      <div className="os-inspection-empty">
        <p className="os-kicker">INSPEKČNÍ OKNO</p>
        <strong>ŽÁDNÁ KARTA NENÍ OTEVŘENA.</strong>
        <span>Vyberte modul z pracovní plochy nebo z evidence čekajících složek.</span>
        <div className="os-reading-slip">
          <span>AKTUÁLNÍ STAV</span>
          <strong>{currentModules.length} MODULY V PROVOZU</strong>
          <small>{pendingModules.length} SLOŽEK ČEKÁ NA VÝVOJ SITUACE</small>
        </div>
      </div>
    )
  }

  const isCurrent = selectedModule.status === 'current'

  return (
    <div className="os-inspection-body">
      <div className="os-window-title-row">
        <div>
          <p className="os-kicker">{statusLabels[selectedModule.status]} MODULE</p>
          <h2>{selectedModule.title}</h2>
        </div>
        <span className="os-window-stamp">KARTA: {selectedModule.id}</span>
      </div>
      <p className="os-window-description">{selectedModule.shortDescription}</p>
      <dl className="os-module-details">
        <div>
          <dt>KATEGORIE</dt>
          <dd>{categoryLabels[selectedModule.category]}</dd>
        </div>
        <div>
          <dt>STATUS</dt>
          <dd>{statusLabels[selectedModule.status]}</dd>
        </div>
        <div>
          <dt>PODPOROVANÉ POVRCHY</dt>
          <dd>{selectedModule.supportedSurfaces.join(' / ')}</dd>
        </div>
        <div>
          <dt>PRODUKOVANÉ RESOURCE KEYS</dt>
          <dd className="os-resource-list">
            {selectedModule.producedResourceKeys.map((resource) => <code key={resource}>{resource}</code>)}
          </dd>
        </div>
      </dl>
      {isCurrent ? (
        <div className="os-runtime-placeholder">
          <span>RUNTIME STANOVIŠTĚ</span>
          <strong>Runtime modulu není do K0rp_OS vložen.</strong>
          <small>Výkonná aplikace zůstává samostatná. Tato stanice pouze vede její kartu.</small>
        </div>
      ) : (
        <p className="os-window-note">Modul zůstává v evidenci. Spuštění nebylo systémem zatím projednáno.</p>
      )}
      <button type="button" className="os-inspection-close" onClick={onClose}>ZAVŘÍT KARTU</button>
    </div>
  )
}

function KorpOsShell() {
  const [activeView, setActiveView] = useState('modules')
  const [selectedModule, setSelectedModule] = useState(null)

  const openModule = (module) => {
    setActiveView('modules')
    setSelectedModule(module)
  }

  return (
    <main className="os-shell" aria-label="K0rp_OS preview shell">
      <section className="os-desktop">
        <header className="os-topbar">
          <div className="os-brand" aria-label="K0rp_OS">
            <span>KØrp</span>
            <strong>_OS</strong>
            <small>K0rp_ware / interní pracovní stanice</small>
          </div>
          <div className="os-machine-readout">
            <span className="os-status-lamp" aria-hidden="true" />
            <span>SYSTÉM ONLINE</span>
            <small>SMĚNA 01 / LOKÁLNÍ TERMINÁL</small>
          </div>
        </header>

        <p className="os-announcement">INTERNÍ OZNÁMENÍ: PLOCHA BYLA ÚSPĚŠNĚ ZPŘÍSTUPNĚNA. DŮVOD NEBYL VYŽADOVÁN.</p>

        <div className="os-workbench">
          <aside className="os-launcher" aria-label="Systémový launcher">
            <div className="os-start-plate">
              <span>KØRP</span>
              <strong>START</strong>
              <small>otevřeno z rozhodnutí systému</small>
            </div>

            <nav className="os-launcher-list" aria-label="Systémové položky">
              {workstationTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={activeView === tab.id ? 'is-active' : ''}
                  onClick={() => setActiveView(tab.id)}
                >
                  <i aria-hidden="true" />
                  <span>{tab.label}</span>
                  <small>{tab.detail}</small>
                </button>
              ))}
            </nav>

            <div className="os-launcher-slip">
              <p>ODDĚLENÍ PROVOZNÍ DOSTUPNOSTI</p>
              <strong>Váš přístup zůstává přiměřeně nejasný.</strong>
              <span>STATUS: POUŽITELNÝ</span>
            </div>
          </aside>

          <section className="os-workspace" aria-label="Pracovní plocha K0rp_OS">
            <header className="os-workspace-head">
              <div>
                <p className="os-kicker">MODULE CONTROL DESK / PŘÍTOMNOST EVIDOVÁNA</p>
                <h1>Přítomnost byla zařazena.</h1>
              </div>
              <div className="os-memo-slip">
                <span>INTERNÍ MEMO 47-B</span>
                <strong>Všechny dostupné úkony byly přesunuty do přehledné složky.</strong>
                <small>SLOŽKA: MODULES / ČTENÍ POVOLENO</small>
              </div>
            </header>

            <div className="os-station-grid">
              <section className="os-main-window" aria-label="Aktivní pracovní okno">
                <div className="os-window-header">
                  <span className="os-window-title">{activeView === 'modules' ? 'MODULY V EVIDENCI' : `${workstationTabs.find((tab) => tab.id === activeView).label} / SYSTÉMOVÁ SLOŽKA`}</span>
                  <span className="os-window-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>

                {activeView === 'modules' ? (
                  <div className="os-module-window-body">
                    <section className="os-current-area" aria-labelledby="current-modules-title">
                      <div className="os-section-heading">
                        <div>
                          <p className="os-kicker">SCHVÁLENÉ PRACOVNÍ POMŮCKY</p>
                          <h2 id="current-modules-title">Moduly v provozu</h2>
                        </div>
                        <span>{currentModules.length} SCHVÁLENO</span>
                      </div>
                      <div className="os-module-grid">
                        {currentModules.map((module) => <ModuleTile key={module.id} module={module} onOpen={openModule} />)}
                      </div>
                    </section>

                    <section className="os-pending-area" aria-labelledby="pending-modules-title">
                      <div className="os-section-heading">
                        <div>
                          <p className="os-kicker">FORMULÁŘE V PŘEDBĚŽNÉM STAVU</p>
                          <h2 id="pending-modules-title">Čekající složky</h2>
                        </div>
                        <span>{pendingModules.length} PENDING</span>
                      </div>
                      <div className="os-pending-grid">
                        {pendingModules.map((module) => <ModuleTile key={module.id} module={module} onOpen={openModule} compact />)}
                      </div>
                    </section>
                  </div>
                ) : <WorkspacePlaceholder activeView={activeView} />}
              </section>

              <aside className="os-inspection-window" aria-live="polite">
                <div className="os-window-header">
                  <span className="os-window-title">SPECIFIKACE MODULU / POUZE KE ČTENÍ</span>
                  <span className="os-window-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
                <ModuleInspection selectedModule={selectedModule} onClose={() => setSelectedModule(null)} />
              </aside>
            </div>
          </section>
        </div>

        <footer className="os-taskbar">
          <span className="os-taskbar-start">KØRP // START</span>
          <span>EMPLOYEE: LOCAL-000</span>
          <span>MODULY: {currentModules.length} ONLINE / {pendingModules.length} PENDING</span>
          <span>PRIVACY: LOCAL ONLY</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
