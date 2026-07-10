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
      <span className="os-tile-status">{isCurrent ? 'DOSTUPNÝ MODUL' : 'PENDING / NESPUSITELNÉ'}</span>
      <strong>{module.title}</strong>
      <span className="os-tile-copy">{module.shortDescription}</span>
      <span className="os-tile-footer">
        <span>{statusLabels[module.status]}</span>
        <span>{isCurrent ? 'OTEVŘÍT NÁHLED' : 'ZOBRAZIT SPECIFIKACI'}</span>
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
            <small>K0rp_ware // preview shell</small>
          </div>
          <div className="os-system-status">
            <span className="os-status-lamp" aria-hidden="true" />
            <span>SYSTÉM ONLINE</span>
            <small>lokální režim / bez ukládání</small>
          </div>
        </header>

        <section className="os-workspace-intro">
          <p className="os-kicker">MODULE CONTROL DESK // SMĚNA AKTIVNÍ</p>
          <h1>Přítomnost byla přijata.</h1>
          <p>
            Vyberte schválený modul. Otevření specifikace neznamená, že byl modul skutečně spuštěn.
          </p>
        </section>

        <section className="os-module-section" aria-labelledby="current-modules-title">
          <div className="os-section-heading">
            <div>
              <p className="os-kicker">AKTIVNÍ PRACOVNÍ PLOCHA</p>
              <h2 id="current-modules-title">Dostupné moduly</h2>
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
              <p className="os-kicker">ROZŠÍŘENÍ V PŘEDBĚŽNÉM STAVU</p>
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
            <span className="os-window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>MODULE INSPECTION / READ-ONLY</span>
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
                <span className="os-window-stamp">{selectedModule.id}</span>
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
              <p className="os-window-note">Preview okno. Runtime modulu nebyl připojen.</p>
            </div>
          ) : (
            <div className="os-window-empty">
              <strong>ŽÁDNÝ MODUL NENÍ OTEVŘEN.</strong>
              <span>Vyberte dlaždici pro zobrazení schválené specifikace.</span>
            </div>
          )}
        </section>

        <footer className="os-taskbar">
          <span>KØRP // START</span>
          <span>EMPLOYEE: LOCAL-000</span>
          <span>MODULY: {currentModules.length} ONLINE / {pendingModules.length} PENDING</span>
          <span>PRIVACY: LOCAL ONLY</span>
        </footer>
      </section>
    </main>
  )
}

export default KorpOsShell
