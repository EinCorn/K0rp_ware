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

function ModuleTile({ module, onOpen }) {
  const isCurrent = module.status === 'current'

  return (
    <button
      type="button"
      className={`os-module-tile ${isCurrent ? 'is-current' : 'is-pending'}`}
      onClick={() => onOpen(module)}
    >
      <span className="os-tile-status">{isCurrent ? 'PROVOZNĚ DOSTUPNÝ' : 'PENDING / NESPUSITELNÉ'}</span>
      <strong>{module.title}</strong>
      <span className="os-tile-copy">{module.shortDescription}</span>
      <span className="os-tile-footer">
        <span>{statusLabels[module.status]}</span>
        <span>{isCurrent ? 'ZOBRAZIT KARTU' : 'ČÍST SPECIFIKACI'}</span>
      </span>
    </button>
  )
}

function KorpOsShell() {
  const [selectedModule, setSelectedModule] = useState(null)

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
              <span className="is-active"><i aria-hidden="true" />MODULY V EVIDENCI</span>
              <span><i aria-hidden="true" />STAV ZAMĚSTNANCE</span>
              <span><i aria-hidden="true" />PŘIJATÁ OZNÁMENÍ</span>
              <span><i aria-hidden="true" />COMPLIANCE BIN</span>
            </nav>

            <div className="os-launcher-slip">
              <p>ODDĚLENÍ PROVOZNÍ DOSTUPNOSTI</p>
              <strong>Váš přístup zůstává přiměřeně nejasný.</strong>
              <span>STATUS: POUŽITELNÝ</span>
            </div>
          </aside>

          <div className="os-workspace">
            <section className="os-workspace-intro">
              <div>
                <p className="os-kicker">MODULE CONTROL DESK / PŘÍTOMNOST EVIDOVÁNA</p>
                <h1>Přítomnost byla zařazena.</h1>
                <p>Vyberte schválený modul. Zobrazení karty neznamená, že byl modul skutečně spuštěn.</p>
              </div>
              <aside className="os-memo-slip">
                <span>INTERNÍ MEMO 47-B</span>
                <strong>Všechny dostupné úkony byly přesunuty do přehledné složky.</strong>
                <small>SLOŽKA: MODULES / ČTENÍ POVOLENO</small>
              </aside>
            </section>

            <section className="os-module-section" aria-labelledby="current-modules-title">
              <div className="os-section-heading">
                <div>
                  <p className="os-kicker">SCHVÁLENÉ PRACOVNÍ POMŮCKY</p>
                  <h2 id="current-modules-title">Moduly v provozu</h2>
                </div>
                <span>{currentModules.length} SCHVÁLENO</span>
              </div>
              <div className="os-module-grid">
                {currentModules.map((module) => <ModuleTile key={module.id} module={module} onOpen={setSelectedModule} />)}
              </div>
            </section>

            <section className="os-module-section" aria-labelledby="pending-modules-title">
              <div className="os-section-heading">
                <div>
                  <p className="os-kicker">FORMULÁŘE V PŘEDBĚŽNÉM STAVU</p>
                  <h2 id="pending-modules-title">Připravované moduly</h2>
                </div>
                <span>{pendingModules.length} PENDING</span>
              </div>
              <div className="os-module-grid os-pending-grid">
                {pendingModules.map((module) => <ModuleTile key={module.id} module={module} onOpen={setSelectedModule} />)}
              </div>
            </section>

            <section className="os-placeholder-window" aria-live="polite">
              <div className="os-window-header">
                <span className="os-window-title">SPECIFIKACE MODULU / POUZE KE ČTENÍ</span>
                <span className="os-window-dots" aria-hidden="true"><i /><i /><i /></span>
                {selectedModule && (
                  <button type="button" onClick={() => setSelectedModule(null)} aria-label="Zavřít specifikaci modulu">×</button>
                )}
              </div>

              {selectedModule ? (
                <div className="os-window-body">
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
                  <p className="os-window-note">Runtime modulu nebyl připojen. Specifikace zůstává příjemně neúplná.</p>
                </div>
              ) : (
                <div className="os-window-empty">
                  <strong>ŽÁDNÁ KARTA NENÍ V EVIDENCI OTEVŘENA.</strong>
                  <span>Vyberte složku modulu pro zobrazení schválené specifikace.</span>
                </div>
              )}
            </section>
          </div>
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
